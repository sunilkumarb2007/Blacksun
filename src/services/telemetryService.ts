import { TelemetryState, SystemSettings, LogEvent, ESP32TelemetryRaw } from "../types/telemetry";

export const DEFAULT_SETTINGS: SystemSettings = {
  tempWarningThreshold: 29.0, // 29°C per BLACKSUN hardware logic
  tempCriticalThreshold: 35.0, // 35°C
  vibrationWarningThreshold: 3.0, // 3.0 g
  vibrationCriticalThreshold: 5.0, // 5.0 g
  currentWarningThreshold: 2.0, // 2.0 A
  currentCriticalThreshold: 2.6, // 2.6 A
  rfTimeoutMs: 200,
  telemetryRateMs: 500,
};

export const INITIAL_OFFLINE_TELEMETRY: TelemetryState = {
  mode: "DEMO",
  isConnected: false,
  wsStatus: "disconnected",
  wsLatency: null,
  ip: null,

  temperature: null,
  temperatureRate: null,
  voltage: null,
  current: null,
  currentA: null,
  current_mA: null,
  power: null,
  powerW: null,
  power_mW: null,
  motorCurrent: null,
  vibration: null,

  tempHistory: [],
  temperatureHistory: [],
  voltageHistory: [],
  currentHistory: [],
  powerHistory: [],
  motorCurrentHistory: [],
  vibrationHistory: [],
  wifiRssiHistory: [],
  wsLatencyHistory: [],

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

  communicationType: "ESP-NOW + WEBSOCKET",
  esp1Online: false,
  espNowReady: false,
  webSocketConnected: false,
  webSocketClients: null,
  wifiConnected: false,
  wifiRSSI: null,
  wifiChannel: null,
  controlLink: false,
  rfStatus: "LOST",
  nodesOnline: "ESP-NOW + WEBSOCKET / ESP32 CORE",
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
  crisisDescriptions: ["Waiting for ESP32 #1 Core", "Target endpoint: ws://<IP>:81"],
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
    "Waiting for ESP32 #1 WebSocket telemetry stream...",
    "Connect laptop to phone hotspot (BLACKSUN_HOTSPOT / blacksuns123)",
    "Enter assigned ESP32 IP in SETTINGS and click CONNECT",
  ],
  subNote: "Awaiting live telemetry packet from ESP32 Survival Core.",
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

  redLED: false,
  greenLED: false,
  yellowLED: false,
  blueLED: false,
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
    details: "Ready for ESP32 #1 WebSocket connection over local hotspot.",
  },
];

/**
 * Maps raw JSON payload from ESP32 #1 to normalized TelemetryState.
 * Strict adherence to hardware logic:
 * - temperature < 29°C: MOTOR ON, FAN OFF, NORMAL / GREEN
 * - temperature >= 29°C and < 35°C: MOTOR OFF, FAN ON, WARNING / RED
 * - temperature >= 35°C: MOTOR OFF, FAN FULL, HEATER OFF, CRITICAL / SURVIVAL
 * - vibration < 3.0: NORMAL
 * - vibration >= 3.0: ALERT
 * - motor indicator: motorOn && vibration < 3 -> BLUE; motorOn && vibration >= 3 -> YELLOW
 * - RPM: null / -- (never fabricate)
 * - ACS712: not fabricated, INA219 current used and labeled accurately
 */
export function mapESP32ToTelemetryState(
  raw: ESP32TelemetryRaw,
  prevState: TelemetryState,
  wsRttLatency?: number | null,
  isRealHardware = false
): TelemetryState {
  // Normalize Current (INA219)
  let currentA: number | null = null;
  if (raw.currentA !== undefined && raw.currentA !== null) {
    currentA = raw.currentA;
  } else if (raw.current_mA !== undefined && raw.current_mA !== null) {
    currentA = parseFloat((raw.current_mA / 1000).toFixed(3));
  } else if (raw.current !== undefined && raw.current !== null) {
    currentA = raw.current > 50 ? parseFloat((raw.current / 1000).toFixed(3)) : raw.current;
  } else {
    currentA = prevState.currentA ?? prevState.current;
  }

  // Normalize Power (INA219)
  let powerW: number | null = null;
  if (raw.powerW !== undefined && raw.powerW !== null) {
    powerW = raw.powerW;
  } else if (raw.power_mW !== undefined && raw.power_mW !== null) {
    powerW = parseFloat((raw.power_mW / 1000).toFixed(2));
  } else if (raw.power !== undefined && raw.power !== null) {
    powerW = raw.power > 100 ? parseFloat((raw.power / 1000).toFixed(2)) : raw.power;
  } else {
    powerW = prevState.powerW ?? prevState.power;
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
  // temp < 29°C: NORMAL
  // 29°C <= temp < 35°C: HIGH / WARNING
  // temp >= 35°C: CRITICAL / SURVIVAL
  const tempStatus: "NORMAL" | "HIGH" | "CRITICAL" =
    tempVal === null
      ? "NORMAL"
      : tempVal >= 35.0
      ? "CRITICAL"
      : tempVal >= 29.0
      ? "HIGH"
      : "NORMAL";

  // Vibration Threshold: < 3 NORMAL, >= 3 VIBRATION ALERT
  const vibStatus: "NORMAL" | "ALERT" | "CRITICAL" =
    vibVal === null ? "NORMAL" : vibVal >= 3.0 ? "CRITICAL" : "NORMAL";
  const vibrationAlert: "NORMAL" | "HIGH" | "CRITICAL" =
    vibVal === null ? "NORMAL" : vibVal >= 3.0 ? "HIGH" : "NORMAL";

  // Crisis level classification from telemetry or evaluated state
  let crisisLevel: "NORMAL" | "WARNING" | "CRITICAL" = "NORMAL";
  if (raw.crisisLevel) {
    const cl = String(raw.crisisLevel).toUpperCase();
    if (cl === "CRITICAL" || cl === "SURVIVAL") crisisLevel = "CRITICAL";
    else if (cl === "WARNING" || cl === "ALERT" || cl === "COOLING") crisisLevel = "WARNING";
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

  // Actuator actual states from ESP32 telemetry (authoritative)
  const motorOn = raw.motorOn !== undefined ? Boolean(raw.motorOn) : prevState.motorOn;
  const fanOn = raw.fanOn !== undefined ? Boolean(raw.fanOn) : prevState.fanOn;
  const heaterOn = raw.heaterOn !== undefined ? Boolean(raw.heaterOn) : prevState.heaterOn;
  const buzzerOn = raw.buzzerOn !== undefined ? Boolean(raw.buzzerOn) : prevState.buzzerOn;

  // LED states based on hardware rule and direct telemetry:
  // RED LED: temp >= 29°C
  // GREEN LED: temp < 29°C
  // YELLOW LED: motorOn && vibration >= 3.0
  // BLUE LED: motorOn && vibration < 3.0
  const redLED = raw.redLED !== undefined ? Boolean(raw.redLED) : (tempVal !== null && tempVal >= 29.0);
  const greenLED = raw.greenLED !== undefined ? Boolean(raw.greenLED) : (tempVal !== null && tempVal < 29.0);
  const yellowLED = raw.yellowLED !== undefined ? Boolean(raw.yellowLED) : (motorOn && (vibVal ?? 0) >= 3.0);
  const blueLED = raw.blueLED !== undefined ? Boolean(raw.blueLED) : (motorOn && (vibVal ?? 0) < 3.0);

  // Motor & Fan speeds (PWM 0-255)
  const motorSpeed = raw.motorSpeed !== undefined ? raw.motorSpeed : prevState.motorSpeed;
  const fanSpeed = raw.fanSpeed !== undefined ? raw.fanSpeed : prevState.fanSpeed;

  // Failure risk calculation (0-100)
  let failureRisk = 12;
  if (tempVal !== null && tempVal >= 35.0) {
    failureRisk = Math.min(100, Math.round(85 + (tempVal - 35.0) * 3));
  } else if (tempVal !== null && tempVal >= 29.0) {
    failureRisk = Math.round(40 + (tempVal - 29.0) * 6);
  } else if (vibVal !== null && vibVal >= 3.0) {
    failureRisk = Math.max(failureRisk, 82);
  }

  // Stress indices
  const thermalStress = tempVal !== null ? Math.min(100, Math.round((tempVal / 45) * 100)) : 0;
  const mechanicalStress = vibVal !== null ? Math.min(100, Math.round((vibVal / 5) * 100)) : 0;
  const electricalStress = currentA !== null ? Math.min(100, Math.round((currentA / 3) * 100)) : 0;

  // Decision determination (ESP32 authoritative string or hardware rule)
  let decision = raw.decision || "";
  if (!decision) {
    if (tempStatus === "CRITICAL") decision = "SURVIVE";
    else if (tempStatus === "HIGH") decision = "COOL";
    else if (vibStatus === "CRITICAL") decision = "MONITOR VIBRATION";
    else decision = "RUN";
  }

  // Actual Hardware Reason from ESP32
  const reasons: string[] = [];
  if (raw.reason) {
    reasons.push(raw.reason);
  } else {
    if (tempVal !== null) {
      if (tempVal < 29.0) {
        reasons.push("Temperature below 29C - motor running");
      } else if (tempVal < 35.0) {
        reasons.push("Temperature reached 29C - motor stopped and fan activated");
      } else {
        reasons.push("Critical temperature - motor stopped and fan at full speed");
      }
    }
    if (motorOn) {
      reasons.push("Motor running normally");
    }
    if (fanOn) {
      reasons.push("Cooling fan activated");
    }
    if (vibVal !== null && vibVal >= 3.0) {
      reasons.push("Motor vibration above configured limit (>= 3.0g)");
    }
    if (!heaterOn && tempVal !== null && tempVal >= 29.0) {
      reasons.push("Heater disabled for thermal protection");
    }
    if (raw.ds18b20OK === false) reasons.push("Temperature sensor unavailable (DS18B20 FAIL)");
    if (raw.ina219OK === false) reasons.push("Current/Voltage sensor unavailable (INA219 FAIL)");
    if (raw.mpu6050OK === false) reasons.push("Vibration sensor unavailable (MPU6050 FAIL)");
  }
  if (reasons.length === 0) {
    reasons.push("All monitored parameters within nominal limits");
  }

  // Rolling history buffer updater (retains latest 120 points)
  const appendHistory = (arr: number[], val: number | null, max = 120) => {
    if (val === null || isNaN(val)) return arr;
    const updated = [...arr, val];
    return updated.length > max ? updated.slice(updated.length - max) : updated;
  };

  const updatedTempHistory = appendHistory(prevState.tempHistory, tempVal);
  const updatedVoltHistory = appendHistory(prevState.voltageHistory, voltVal);
  const updatedCurrHistory = appendHistory(prevState.currentHistory, currentA);
  const updatedPowerHistory = appendHistory(prevState.powerHistory, powerW);
  const updatedVibHistory = appendHistory(prevState.vibrationHistory, vibVal);
  const updatedRssiHistory = appendHistory(prevState.wifiRssiHistory, raw.wifiRSSI ?? null);
  const updatedLatencyHistory = appendHistory(
    prevState.wsLatencyHistory,
    wsRttLatency !== undefined ? wsRttLatency : prevState.wsLatency
  );

  const ipAddress = raw.ip || prevState.ip;
  const latencyVal = wsRttLatency !== undefined ? wsRttLatency : prevState.wsLatency;

  return {
    ...prevState,
    mode: isRealHardware ? "REAL" : "DEMO",
    isConnected: isRealHardware,
    wsStatus: isRealHardware ? "connected" : prevState.wsStatus,
    wsLatency: latencyVal,
    ip: ipAddress,

    temperature: tempVal,
    temperatureRate: tempRate,
    voltage: voltVal,
    current: currentA,
    currentA,
    current_mA: raw.current_mA ?? (currentA !== null ? currentA * 1000 : null),
    power: powerW,
    powerW,
    power_mW: raw.power_mW ?? (powerW !== null ? powerW * 1000 : null),
    motorCurrent: currentA,
    motorHealthCurrent: currentA,
    vibration: vibVal,
    motorSpeed,
    fanSpeed,

    tempHistory: updatedTempHistory,
    temperatureHistory: updatedTempHistory,
    voltageHistory: updatedVoltHistory,
    currentHistory: updatedCurrHistory,
    powerHistory: updatedPowerHistory,
    motorCurrentHistory: updatedCurrHistory,
    vibrationHistory: updatedVibHistory,
    wifiRssiHistory: updatedRssiHistory,
    wsLatencyHistory: updatedLatencyHistory,

    rpm: null, // Strictly null / -- per hardware spec (no tachometer)
    motorLoad: null, // Not fabricated
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
    relay: motorOn,

    redLED,
    greenLED,
    yellowLED,
    blueLED,
    ledRed: redLED,
    ledGreen: greenLED,
    ledYellow: yellowLED,
    ledBlue: blueLED,

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
    subNote: raw.systemState || (crisisLevel === "CRITICAL" ? "SURVIVAL MODE ACTIVE" : "DETERMINISTIC SAFETY LOOP RUNNING"),
    footerTag: isRealHardware
      ? (crisisLevel === "CRITICAL" ? "AUTONOMOUS SAFETY ACTION TAKEN" : "NO HUMAN INTERVENTION REQUIRED.")
      : "DEMO SIMULATION ACTIVE • RECONNECTING WEBSOCKET...",
    survivalMode: crisisLevel === "CRITICAL" ? "SURVIVE" : "STANDBY",
    survivalModeSubtext: crisisLevel === "CRITICAL" ? "CRITICAL SURVIVAL ENGAGED" : "READY TO ADAPT",

    systemStatusText: isRealHardware ? "SYSTEM OPERATIONAL." : "DEMO MODE (SIMULATED)",
    communicationType: isRealHardware ? (raw.communication || "ESP-NOW + WEBSOCKET") : "SIMULATION (DEMO)",
    esp1Online: isRealHardware ? (raw.esp1Online ?? true) : false,
    espNowReady: isRealHardware ? (raw.espNowReady ?? true) : false,
    webSocketConnected: isRealHardware ? (raw.webSocketConnected ?? true) : false,
    webSocketClients: isRealHardware ? (raw.webSocketClients ?? 1) : 0,
    wifiConnected: isRealHardware ? (raw.wifiConnected ?? true) : false,
    wifiRSSI: raw.wifiRSSI !== undefined ? raw.wifiRSSI : prevState.wifiRSSI,
    wifiChannel: raw.wifiChannel !== undefined ? raw.wifiChannel : prevState.wifiChannel,
    controlLink: isRealHardware ? (raw.controlLink ?? true) : false,
    rfStatus: isRealHardware ? "CONNECTED" : "LOST",
    rfLinkStatus: isRealHardware ? "CONNECTED" : "LOST",
    nodesOnline: isRealHardware ? "ESP-NOW + WEBSOCKET / ESP32 CORE" : "DEMO SIMULATOR ACTIVE",
    uptimeSeconds: raw.uptime ?? raw.timestamp ?? prevState.uptimeSeconds,

    lastUpdatedSec: 0,
  };
}
