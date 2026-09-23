import { TelemetryState, SystemSettings, LogEvent, ESP32TelemetryRaw } from "../types/telemetry";

export const DEFAULT_SETTINGS: SystemSettings = {
  tempWarningThreshold: 28.0,
  tempCriticalThreshold: 35.0,
  vibrationWarningThreshold: 3.0,
  vibrationCriticalThreshold: 5.0,
  currentWarningThreshold: 2.0,
  currentCriticalThreshold: 2.6,
  rfTimeoutMs: 200,
  telemetryRateMs: 500,
};

export const INITIAL_OFFLINE_TELEMETRY: TelemetryState = {
  isConnected: false,
  wsStatus: "disconnected",

  temperature: null,
  temperatureRate: null,
  voltage: null,
  current: null,
  power: null,
  motorCurrent: null,
  vibration: null,

  tempHistory: [],
  voltageHistory: [],
  currentHistory: [],
  powerHistory: [],
  motorCurrentHistory: [],
  vibrationHistory: [],

  rpm: null,
  motorSpeed: null,
  fanSpeed: null,
  motorHealthCurrent: null,
  vibrationAlert: "NORMAL",
  motorLoad: null,
  failureRisk: 0,
  motorState: "NORMAL",
  thermalStress: 0,
  mechanicalStress: 0,
  electricalStress: 0,

  communicationType: "ESP-NOW",
  esp1Online: false,
  rfStatus: "LOST",
  nodesOnline: "ESP-NOW / ESP32 CORE",
  latency: null,
  packetCount: null,
  lostPackets: null,
  rssi: null,
  ackRate: null,
  lastPacketTime: "--",
  lastAckTime: "--",
  uptimeSeconds: null,

  systemStatusText: "COMMUNICATION LOST",
  crisisLevel: "NORMAL",
  crisisDescriptions: ["Waiting for ESP32 #1 Core", "Connecting to ws://192.168.4.1:81"],
  survivalMode: "STANDBY",
  survivalModeSubtext: "WAITING FOR CORE",

  decision: "WAITING FOR CORE",
  confidence: 0,
  tempStatus: "NORMAL",
  powerCondition: "NORMAL",
  motorCurrentStatus: "NORMAL",
  vibrationStatus: "NORMAL",
  rfLinkStatus: "LOST",

  reasons: [
    "Searching for ESP32 #1 WebSocket server...",
    "Connect to WiFi: BLACKSUN_CORE (blacksun123)",
    "Target endpoint: ws://192.168.4.1:81",
  ],
  subNote: "System will immediately stream real hardware telemetry upon connection.",
  footerTag: "AUTONOMOUS | RESILIENT | CONTINUOUS",

  heater: false,
  fan: false,
  relay: false,
  motor: false,
  buzzer: false,
  motorOn: false,
  fanOn: false,
  heaterOn: false,
  buzzerOn: false,

  ledRed: false,
  ledGreen: false,
  ledYellow: false,
  ledBlue: false,

  ds18b20OK: true,
  ina219OK: true,
  mpu6050OK: true,
  manualMode: false,
  thermalSurvivalMode: false,

  lastUpdatedSec: 0,
};

export const INITIAL_EVENTS: LogEvent[] = [
  {
    id: "evt-01",
    timestamp: "INITIAL",
    category: "SYSTEM",
    severity: "INFO",
    title: "BLACKSUN CORE INITIALIZED",
    details: "Ready to connect to ESP32 #1 WebSocket at ws://192.168.4.1:81",
  },
];

/**
 * Maps raw JSON payload from ESP32 #1 to normalized TelemetryState.
 * Adheres strictly to BLACKSUN hardware rules and thresholds:
 * - temp < 28: NORMAL
 * - 28 <= temp <= 35: WARNING / COOLING
 * - temp > 35: CRITICAL / SURVIVAL
 * - vib < 3: NORMAL, vib >= 3: VIBRATION ALERT
 * - RPM: null / -- (no fabrication)
 * - Current / Power unit normalization
 */
export function mapESP32ToTelemetryState(
  raw: ESP32TelemetryRaw,
  prevState: TelemetryState
): TelemetryState {
  // Normalize Current (INA219): if > 50, it was sent in mA, convert to A
  let currentVal = raw.current !== undefined ? raw.current : prevState.current;
  if (currentVal !== null && currentVal > 50) {
    currentVal = parseFloat((currentVal / 1000).toFixed(3));
  }

  // Normalize Power (INA219): if > 100, sent in mW, convert to W
  let powerVal = raw.power !== undefined ? raw.power : prevState.power;
  if (powerVal !== null && powerVal > 100) {
    powerVal = parseFloat((powerVal / 1000).toFixed(2));
  }

  const tempVal = raw.temperature !== undefined ? raw.temperature : prevState.temperature;
  const voltVal = raw.voltage !== undefined ? raw.voltage : prevState.voltage;
  const vibVal = raw.vibration !== undefined ? raw.vibration : prevState.vibration;

  // Temperature gradient calculation (°C/min)
  let tempRate = prevState.temperatureRate;
  if (tempVal !== null && prevState.temperature !== null) {
    const diff = tempVal - prevState.temperature;
    tempRate = parseFloat((diff * 60).toFixed(1));
  }

  // Hardware Thresholds:
  // temp < 28: NORMAL
  // 28 <= temp <= 35: WARNING / COOLING
  // temp > 35: CRITICAL / SURVIVAL
  const tempStatus: "NORMAL" | "HIGH" | "CRITICAL" =
    tempVal === null
      ? "NORMAL"
      : tempVal > 35.0
      ? "CRITICAL"
      : tempVal >= 28.0
      ? "HIGH"
      : "NORMAL";

  // Vibration Threshold: < 3 NORMAL, >= 3 VIBRATION ALERT
  const vibStatus: "NORMAL" | "ALERT" | "CRITICAL" =
    vibVal === null ? "NORMAL" : vibVal >= 3.0 ? "CRITICAL" : "NORMAL";
  const vibrationAlert: "NORMAL" | "HIGH" | "CRITICAL" =
    vibVal === null ? "NORMAL" : vibVal >= 3.0 ? "HIGH" : "NORMAL";

  // Crisis level classification
  let crisisLevel: "NORMAL" | "WARNING" | "CRITICAL" = "NORMAL";
  if (raw.crisisLevel) {
    const cl = String(raw.crisisLevel).toUpperCase();
    if (cl === "CRITICAL" || cl === "SURVIVAL") crisisLevel = "CRITICAL";
    else if (cl === "WARNING" || cl === "ALERT") crisisLevel = "WARNING";
    else crisisLevel = "NORMAL";
  } else {
    if (tempStatus === "CRITICAL" || vibStatus === "CRITICAL") {
      crisisLevel = "CRITICAL";
    } else if (tempStatus === "HIGH") {
      crisisLevel = "WARNING";
    } else {
      crisisLevel = "NORMAL";
    }
  }

  // Actuator actual states from ESP32
  const motorOn = raw.motorOn !== undefined ? Boolean(raw.motorOn) : prevState.motorOn;
  const fanOn = raw.fanOn !== undefined ? Boolean(raw.fanOn) : prevState.fanOn;
  const heaterOn = raw.heaterOn !== undefined ? Boolean(raw.heaterOn) : prevState.heaterOn;
  const buzzerOn = raw.buzzerOn !== undefined ? Boolean(raw.buzzerOn) : prevState.buzzerOn;

  // LED states based on hardware rule:
  // LED RED: temperature >= 29
  // LED GREEN: temperature < 29
  // LED YELLOW: motorOn && vibration >= 3
  // LED BLUE: motorOn && vibration < 3
  const ledRed = tempVal !== null && tempVal >= 29.0;
  const ledGreen = tempVal !== null && tempVal < 29.0;
  const ledYellow = motorOn && (vibVal ?? 0) >= 3.0;
  const ledBlue = motorOn && (vibVal ?? 0) < 3.0;

  // Motor & Fan speeds (PWM 0-255)
  const motorSpeed = raw.motorSpeed !== undefined ? raw.motorSpeed : prevState.motorSpeed;
  const fanSpeed = raw.fanSpeed !== undefined ? raw.fanSpeed : prevState.fanSpeed;
  const motorLoad = motorSpeed !== null ? Math.round((motorSpeed / 255) * 100) : null;

  // Calculate failure risk score (0-100)
  let failureRisk = 12;
  if (tempVal !== null && tempVal > 35.0) {
    failureRisk = Math.min(100, Math.round(85 + (tempVal - 35.0) * 3));
  } else if (tempVal !== null && tempVal >= 28.0) {
    failureRisk = Math.round(40 + (tempVal - 28.0) * 6);
  } else if (vibVal !== null && vibVal >= 3.0) {
    failureRisk = Math.max(failureRisk, 82);
  }

  // Stresses
  const thermalStress = tempVal !== null ? Math.min(100, Math.round((tempVal / 45) * 100)) : 0;
  const mechanicalStress = vibVal !== null ? Math.min(100, Math.round((vibVal / 5) * 100)) : 0;
  const electricalStress = currentVal !== null ? Math.min(100, Math.round((currentVal / 3) * 100)) : 0;

  // Decision determination
  let decision = raw.decision || "";
  if (!decision) {
    if (tempStatus === "CRITICAL") decision = "SURVIVAL RESPONSE";
    else if (tempStatus === "HIGH") decision = "COOLING";
    else if (vibStatus === "CRITICAL") decision = "VIBRATION MITIGATION";
    else decision = "NORMAL OPERATION";
  }

  // Real Hardware Reasons List
  const reasons: string[] = [];
  if (raw.reason) {
    reasons.push(raw.reason);
  }
  if (tempVal !== null) {
    if (tempVal < 28.0) {
      reasons.push("Temperature below cooling threshold (28°C)");
    } else if (tempVal <= 35.0) {
      reasons.push("Temperature reached 28°C cooling boundary");
    } else {
      reasons.push("Temperature above critical 35°C threshold");
    }
  }
  if (motorOn) {
    reasons.push("Motor running normally");
  } else if (tempVal !== null && tempVal > 35.0) {
    reasons.push("Motor stopped for thermal protection");
  }
  if (fanOn) {
    reasons.push("Cooling fan activated");
  }
  if (vibVal !== null && vibVal >= 3.0) {
    reasons.push("Motor vibration alert detected (>= 3.0g)");
  }
  if (!heaterOn && tempVal !== null && tempVal >= 28.0) {
    reasons.push("Heater disabled for thermal protection");
  }
  if (raw.ds18b20OK === false) reasons.push("DS18B20 sensor alert");
  if (raw.ina219OK === false) reasons.push("INA219 sensor alert");
  if (raw.mpu6050OK === false) reasons.push("MPU6050 sensor alert");
  if (reasons.length === 0) {
    reasons.push("All monitored parameters within nominal limits");
  }

  // Rolling history buffer updater (retains latest 100 points)
  const appendHistory = (arr: number[], val: number | null, max = 100) => {
    if (val === null || isNaN(val)) return arr;
    const updated = [...arr, val];
    return updated.length > max ? updated.slice(updated.length - max) : updated;
  };

  return {
    ...prevState,
    isConnected: true,
    wsStatus: "connected",

    temperature: tempVal,
    temperatureRate: tempRate,
    voltage: voltVal,
    current: currentVal,
    power: powerVal,
    motorCurrent: currentVal, // INA219 current
    motorHealthCurrent: currentVal,
    vibration: vibVal,
    motorSpeed,
    fanSpeed,

    tempHistory: appendHistory(prevState.tempHistory, tempVal),
    voltageHistory: appendHistory(prevState.voltageHistory, voltVal),
    currentHistory: appendHistory(prevState.currentHistory, currentVal),
    powerHistory: appendHistory(prevState.powerHistory, powerVal),
    motorCurrentHistory: appendHistory(prevState.motorCurrentHistory, currentVal),
    vibrationHistory: appendHistory(prevState.vibrationHistory, vibVal),

    rpm: null, // Always null / N/A
    motorLoad,
    failureRisk,
    motorState: crisisLevel === "CRITICAL" ? "CRITICAL" : crisisLevel === "WARNING" ? "WARNING" : "NORMAL",
    thermalStress,
    mechanicalStress,
    electricalStress,

    motorOn,
    fanOn,
    heaterOn,
    buzzerOn,
    heater: heaterOn,
    fan: fanOn,
    motor: motorOn,
    buzzer: buzzerOn,
    relay: motorOn, // Disconnected during protective trip

    ledRed,
    ledGreen,
    ledYellow,
    ledBlue,

    ds18b20OK: raw.ds18b20OK ?? true,
    ina219OK: raw.ina219OK ?? true,
    mpu6050OK: raw.mpu6050OK ?? true,
    manualMode: raw.manualMode ?? false,
    thermalSurvivalMode: raw.thermalSurvivalMode ?? (tempStatus === "CRITICAL"),

    crisisLevel,
    decision,
    tempStatus,
    vibrationStatus: vibStatus,
    vibrationAlert,

    reasons,
    subNote: raw.systemState || (crisisLevel === "CRITICAL" ? "SURVIVAL RESPONSE ACTIVE" : "DETERMINISTIC SAFETY LOOP RUNNING"),
    footerTag: crisisLevel === "CRITICAL" ? "AUTONOMOUS SAFETY ACTION TAKEN" : "NO HUMAN INTERVENTION REQUIRED.",
    survivalMode: crisisLevel === "CRITICAL" ? "ACTIVE" : "STANDBY",
    survivalModeSubtext: crisisLevel === "CRITICAL" ? "SURVIVAL MITIGATION" : "READY TO ADAPT",

    communicationType: raw.communication || "ESP-NOW",
    esp1Online: raw.esp1Online ?? true,
    rfStatus: "CONNECTED",
    rfLinkStatus: "CONNECTED",
    nodesOnline: "ESP-NOW / ESP32 CORE",
    uptimeSeconds: raw.uptime ?? null,

    lastUpdatedSec: 0,
  };
}
