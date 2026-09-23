/**
 * BLACKSUN Deterministic Simulation Engine
 * 
 * Provides smooth, realistic, continuous telemetry streams in DEMO MODE
 * when ESP32 #1 hardware is disconnected.
 * 
 * Strictly follows BLACKSUN hardware safety rules:
 * - temp < 29°C: Motor ON, Fan OFF, Green LED ON, Red LED OFF
 * - 29°C <= temp < 35°C: Motor OFF, Fan ON (PWM 180-220), Red LED ON, Green LED OFF
 * - temp >= 35°C: Motor OFF, Fan FULL (255), Heater OFF, Buzzer ON, Red LED ON
 * - vibration >= 3.0g && motorOn: Vibration ALERT, Yellow LED ON, Blue LED OFF, Buzzer ON
 * - motorOn && vibration < 3.0g: Blue LED ON, Yellow LED OFF
 * - RPM: strictly null / --
 * - Coherent power: powerW = voltage * currentA
 */

import { ESP32TelemetryRaw } from "../types/telemetry";

type SimulatorListener = (data: ESP32TelemetryRaw) => void;

class BlackSunSimulatorService {
  private timer: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;
  private listeners: Set<SimulatorListener> = new Set();

  private tickIndex = 0;
  private uptime = 1042;
  private manualOverrides: Partial<ESP32TelemetryRaw> = {};
  private manualOverrideTimeout: ReturnType<typeof setTimeout> | null = null;

  // 5 Scenarios, each lasting 16 ticks (16 * 500ms = 8.0 seconds)
  // Total cycle = 80 ticks = 40.0 seconds
  private ticksPerScenario = 16;
  private totalCycleTicks = 80;

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("[BLACKSUN] DEMO MODE: Simulation engine started (500ms tick)");

    // Emit initial sample immediately
    this.step();

    this.timer = setInterval(() => {
      this.step();
    }, 500);
  }

  public stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    console.log("[BLACKSUN] DEMO MODE: Simulation engine stopped");
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  public subscribe(listener: SimulatorListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public applyUserCommand(command: Partial<ESP32TelemetryRaw>): void {
    this.manualOverrides = { ...this.manualOverrides, ...command };
    if (this.manualOverrideTimeout) {
      clearTimeout(this.manualOverrideTimeout);
    }
    // Hold user override for 6 seconds, then smoothly resume state machine
    this.manualOverrideTimeout = setTimeout(() => {
      this.manualOverrides = {};
    }, 6000);
    this.step();
  }

  private step(): void {
    this.tickIndex = (this.tickIndex + 1) % this.totalCycleTicks;
    if (this.tickIndex % 2 === 0) {
      this.uptime += 1;
    }

    const currentScenarioIndex = Math.floor(this.tickIndex / this.ticksPerScenario);
    const progress = (this.tickIndex % this.ticksPerScenario) / (this.ticksPerScenario - 1); // 0.0 -> 1.0

    let temp = 25.5;
    let voltage = 12.0;
    let currentA = 1.4;
    let vibration = 0.12;
    let motorOn = true;
    let fanOn = false;
    let fanSpeed = 0;
    let motorSpeed = 180;
    let heaterOn = false;
    let buzzerOn = false;

    let crisisLevel = "NORMAL";
    let systemState = "NORMAL OPERATION";
    let decision = "RUN";
    let reason = "Temperature below 29C - motor running";

    // 0: SCENARIO A - NORMAL (24°C -> 27.5°C)
    if (currentScenarioIndex === 0) {
      temp = 24.4 + progress * 3.1 + Math.sin(this.tickIndex * 0.4) * 0.2;
      voltage = 11.92 + Math.sin(this.tickIndex * 0.3) * 0.15;
      currentA = 1.15 + progress * 0.55 + Math.cos(this.tickIndex * 0.5) * 0.08;
      vibration = 0.08 + progress * 0.14 + Math.sin(this.tickIndex * 0.7) * 0.04;
      motorOn = true;
      fanOn = false;
      fanSpeed = 0;
      motorSpeed = 180;
      heaterOn = false;
      buzzerOn = false;

      crisisLevel = "NORMAL";
      systemState = "NORMAL OPERATION";
      decision = "RUN";
      reason = "Temperature below 29C - motor running";
    }
    // 1: SCENARIO B - COOLING WARNING (28.5°C -> 32.5°C)
    else if (currentScenarioIndex === 1) {
      temp = 28.5 + progress * 3.8 + Math.sin(this.tickIndex * 0.3) * 0.2;
      voltage = 11.78 + Math.cos(this.tickIndex * 0.4) * 0.12;
      motorOn = false; // Stopped above 29°C
      fanOn = true;
      fanSpeed = Math.round(180 + progress * 40);
      motorSpeed = 0;
      heaterOn = false;
      buzzerOn = false;
      currentA = 0.48 + progress * 0.25; // Fan only current
      vibration = 0.06 + Math.sin(this.tickIndex * 0.6) * 0.05; // Low vibration because motor is off

      crisisLevel = "WARNING";
      systemState = "COOLING MODE";
      decision = "COOL";
      reason = "Temperature reached 29C - motor stopped and fan activated";
    }
    // 2: SCENARIO C - VIBRATION EVENT (26.5°C -> 28.2°C, Vib 0.5g -> 4.4g)
    else if (currentScenarioIndex === 2) {
      temp = 26.5 + Math.sin(this.tickIndex * 0.3) * 0.8;
      voltage = 11.82 + Math.sin(this.tickIndex * 0.5) * 0.18;
      motorOn = true;
      fanOn = false;
      fanSpeed = 0;
      motorSpeed = 195;
      heaterOn = false;

      // Vibration envelope peaks in the middle of scenario
      const vibPeak = Math.sin(progress * Math.PI);
      vibration = 0.6 + vibPeak * 3.7 + Math.sin(this.tickIndex * 0.9) * 0.3; // Peaks above 3.5g
      currentA = 1.45 + vibPeak * 0.65; // Current surges with mechanical friction

      if (vibration >= 3.0) {
        buzzerOn = true;
        crisisLevel = "WARNING";
        systemState = "VIBRATION ALERT";
        decision = "MONITOR VIBRATION";
        reason = "Motor vibration above configured limit (>= 3.0g)";
      } else {
        buzzerOn = false;
        crisisLevel = "NORMAL";
        systemState = "NORMAL OPERATION";
        decision = "RUN";
        reason = "Motor running normally";
      }
    }
    // 3: SCENARIO D - CRITICAL THERMAL EVENT (33.0°C -> 37.2°C)
    else if (currentScenarioIndex === 3) {
      temp = 33.2 + progress * 4.2;
      voltage = 11.68 + Math.cos(this.tickIndex * 0.4) * 0.12;

      if (temp >= 35.0) {
        // Critical hardware failsafe trigger
        motorOn = false;
        fanOn = true;
        fanSpeed = 255;
        motorSpeed = 0;
        heaterOn = false;
        buzzerOn = true;
        currentA = 0.95 + Math.sin(this.tickIndex * 0.5) * 0.1;
        vibration = 0.08 + Math.sin(this.tickIndex * 0.7) * 0.03;

        crisisLevel = "CRITICAL";
        systemState = "SURVIVAL MODE";
        decision = "SURVIVE";
        reason = "Critical temperature - motor stopped and fan at full speed";
      } else {
        motorOn = false;
        fanOn = true;
        fanSpeed = 220;
        motorSpeed = 0;
        heaterOn = false;
        buzzerOn = false;
        currentA = 0.72;
        vibration = 0.1;

        crisisLevel = "WARNING";
        systemState = "COOLING MODE";
        decision = "COOL";
        reason = "Temperature reached 29C - motor stopped and fan activated";
      }
    }
    // 4: SCENARIO E - RECOVERY (37.0°C -> 25.2°C)
    else {
      temp = 36.8 - progress * 11.6; // Cooldown slope
      voltage = 11.85 + progress * 0.15;

      if (temp >= 35.0) {
        motorOn = false;
        fanOn = true;
        fanSpeed = 255;
        buzzerOn = true;
        currentA = 0.92;
        crisisLevel = "CRITICAL";
        systemState = "SURVIVAL MODE";
        decision = "SURVIVE";
        reason = "Critical temperature - motor stopped and fan at full speed";
      } else if (temp >= 29.0) {
        motorOn = false;
        fanOn = true;
        fanSpeed = 200;
        buzzerOn = false;
        currentA = 0.65;
        crisisLevel = "WARNING";
        systemState = "COOLING MODE";
        decision = "COOL";
        reason = "Temperature reached 29C - cooling engaged";
      } else {
        // Returned to safe temperature
        motorOn = true;
        fanOn = false;
        fanSpeed = 0;
        motorSpeed = 180;
        buzzerOn = false;
        currentA = 1.35;
        crisisLevel = "NORMAL";
        systemState = "NORMAL OPERATION";
        decision = "RUN";
        reason = "Temperature below 29C - motor running";
      }
      vibration = motorOn ? 0.14 + Math.sin(this.tickIndex * 0.5) * 0.06 : 0.06;
    }

    // Apply any manual overrides if active
    if (this.manualOverrides.motorOn !== undefined) motorOn = Boolean(this.manualOverrides.motorOn);
    if (this.manualOverrides.fanOn !== undefined) fanOn = Boolean(this.manualOverrides.fanOn);
    if (this.manualOverrides.heaterOn !== undefined) heaterOn = Boolean(this.manualOverrides.heaterOn);
    if (this.manualOverrides.buzzerOn !== undefined) buzzerOn = Boolean(this.manualOverrides.buzzerOn);
    if (this.manualOverrides.motorSpeed !== undefined && this.manualOverrides.motorSpeed !== null) {
      motorSpeed = this.manualOverrides.motorSpeed;
    }

    // Re-verify hardware safety override rule on final output:
    // If temp >= 35, motor MUST be off, fan MUST be full, heater MUST be off, buzzer MUST be on
    if (temp >= 35.0) {
      motorOn = false;
      fanOn = true;
      fanSpeed = 255;
      heaterOn = false;
      buzzerOn = true;
      crisisLevel = "CRITICAL";
      systemState = "SURVIVAL MODE";
      decision = "SURVIVE";
    }

    // Calculate coherent power (P = V * I)
    const powerW = parseFloat((voltage * currentA).toFixed(2));
    const power_mW = parseFloat((powerW * 1000).toFixed(1));
    const current_mA = parseFloat((currentA * 1000).toFixed(1));

    // Dynamic LED rules
    const redLED = temp >= 29.0;
    const greenLED = temp < 29.0;
    const yellowLED = motorOn && vibration >= 3.0;
    const blueLED = motorOn && vibration < 3.0;

    // Simulated WiFi RSSI & Latency
    const wifiRSSI = -48 + Math.round(Math.sin(this.tickIndex * 0.3) * 4);
    const simulatedLatency = 32 + Math.round(Math.sin(this.tickIndex * 0.4) * 12);

    const payload: ESP32TelemetryRaw = {
      type: "telemetry",
      temperature: parseFloat(temp.toFixed(2)),
      voltage: parseFloat(voltage.toFixed(2)),
      current: currentA,
      currentA,
      current_mA,
      power: powerW,
      powerW,
      power_mW,
      vibration: parseFloat(vibration.toFixed(3)),

      motorSpeed: motorOn ? motorSpeed : 0,
      motorOn,
      fanSpeed: fanOn ? fanSpeed : 0,
      fanOn,
      heaterOn,
      buzzerOn,

      thermalSurvivalMode: temp >= 35.0,
      coolingMode: temp >= 29.0 && temp < 35.0,
      manualMode: false,

      ds18b20OK: true,
      ina219OK: true,
      mpu6050OK: true,

      redLED,
      greenLED,
      yellowLED,
      blueLED,

      crisisLevel,
      systemState,
      decision,
      reason,

      communication: "SIMULATION (DEMO)",
      espNowReady: false,
      webSocketConnected: false,
      webSocketClients: 0,
      wifiConnected: false,
      wifiRSSI,
      wifiChannel: 6,
      ip: "DEMO SIMULATOR",

      uptime: this.uptime,
      timestamp: Date.now(),
      controlLink: false,
    };

    this.notify(payload);
  }

  private notify(data: ESP32TelemetryRaw): void {
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch {
        // Safe dispatch
      }
    });
  }
}

export const blackSunSimulator = new BlackSunSimulatorService();
