export type CrisisState = "NORMAL" | "WARNING" | "CRITICAL";

export type CrisisScenario = 
  | "NORMAL" 
  | "THERMAL_EVENT" 
  | "MOTOR_VIBRATION" 
  | "MOTOR_OVERLOAD" 
  | "RF_FAILURE" 
  | "FULL_CASCADE";

export type PageId = "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09";

export interface LogEvent {
  id: string;
  timestamp: string;
  category: "SYSTEM" | "COMMUNICATION" | "THERMAL" | "MOTOR" | "POWER";
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  details: string;
}

export interface SystemSettings {
  tempWarningThreshold: number;     // 28°C
  tempCriticalThreshold: number;    // 35°C
  vibrationWarningThreshold: number;// 3.0 g
  vibrationCriticalThreshold: number;// 5.0 g
  currentWarningThreshold: number;  // 2.0 A
  currentCriticalThreshold: number; // 2.6 A
  rfTimeoutMs: number;              // 200 ms
  telemetryRateMs: number;          // 500 ms
}

export type WSConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export interface BlackSunTelemetry {
  type: string;
  temperature: number;
  voltage: number;
  current: number;
  current_mA?: number;
  currentA?: number;
  power: number;
  power_mW?: number;
  powerW?: number;
  vibration: number;
  motorSpeed: number;
  motorOn: boolean;
  fanSpeed: number;
  fanOn: boolean;
  heaterOn: boolean;
  buzzerOn: boolean;
  thermalSurvivalMode: boolean;
  manualMode: boolean;
  ds18b20OK: boolean;
  ina219OK: boolean;
  mpu6050OK: boolean;
  redLED: boolean;
  greenLED: boolean;
  yellowLED: boolean;
  blueLED: boolean;
  crisisLevel: string;
  systemState: string;
  decision: string;
  reason: string;
  communication: string;
  espNowReady: boolean;
  webSocketConnected: boolean;
  webSocketClients: number;
  wifiConnected: boolean;
  wifiRSSI: number;
  wifiChannel: number;
  ip: string;
  uptime: number;
  timestamp: number;
  controlLink: boolean;
  [key: string]: unknown;
}

export type ESP32TelemetryRaw = Partial<BlackSunTelemetry>;

export interface TelemetryState {
  // Mode: Real hardware vs Demo simulation
  mode: "REAL" | "DEMO";

  // Connection State
  isConnected: boolean;
  wsStatus: WSConnectionStatus;
  wsLatency: number | null; // Browser-side WS RTT in ms
  ip: string | null;

  // Live Sensors (real hardware, null or number)
  temperature: number | null; // e.g. 31.4 °C
  temperatureRate: number | null; // e.g. +0.4 °C/min
  voltage: number | null; // e.g. 11.92 V
  current: number | null; // e.g. 1.84 A (INA219)
  currentA: number | null;
  current_mA: number | null;
  power: number | null; // e.g. 21.95 W (INA219)
  powerW: number | null;
  power_mW: number | null;
  motorCurrent: number | null; // same as INA219 current
  vibration: number | null; // e.g. 0.08 g (MPU6050)
  
  // Historical buffers for real waveform graphs (latest 60-120 samples)
  tempHistory: number[];
  temperatureHistory: number[];
  voltageHistory: number[];
  currentHistory: number[];
  powerHistory: number[];
  motorCurrentHistory: number[];
  vibrationHistory: number[];
  wifiRssiHistory: number[];
  wsLatencyHistory: number[];
  
  // Motor Health
  rpm: number | null; // Always null / N/A as per hardware spec
  motorSpeed: number | null; // PWM 0-255
  fanSpeed: number | null; // PWM 0-255
  motorHealthCurrent: number | null; // INA219 Current
  vibrationAlert: "NORMAL" | "HIGH" | "CRITICAL"; // Normal if < 3.0, ALERT if >= 3.0
  motorLoad: number | null; // Load indicator %
  failureRisk: number; // e.g. 84%
  motorState: "NORMAL" | "WARNING" | "DEGRADED" | "CRITICAL" | "PROTECTED";
  thermalStress: number; // 0-100
  mechanicalStress: number; // 0-100
  electricalStress: number; // 0-100
  
  // Communication Link (ESP-NOW + WebSocket)
  communicationType: string; // "ESP-NOW + WEBSOCKET"
  esp1Online: boolean;
  espNowReady: boolean;
  webSocketConnected: boolean;
  webSocketClients: number | null;
  wifiConnected: boolean;
  wifiRSSI: number | null;
  wifiChannel: number | null;
  controlLink: boolean;
  rfStatus: "CONNECTED" | "DEGRADED" | "LOST";
  nodesOnline: string; // "ESP-NOW / ESP32 CORE"
  latency: number | null; // null if not in telemetry
  packetCount: number | null; // null if not in telemetry
  lostPackets: number | null; // null if not in telemetry
  rssi: number | null; // null if not in telemetry
  ackRate: number | null;
  lastPacketTime: string;
  lastAckTime: string;
  uptimeSeconds: number | null;
  
  // Mission Control
  systemStatusText: string;
  crisisLevel: CrisisState;
  crisisDescriptions: string[];
  survivalMode: string;
  survivalModeSubtext: string;
  
  // Survival Decision Engine
  decision: string;
  confidence: number;
  tempStatus: "NORMAL" | "HIGH" | "CRITICAL";
  powerCondition: "NORMAL" | "DEGRADED" | "CRITICAL";
  motorCurrentStatus: "NORMAL" | "HIGH" | "CRITICAL";
  vibrationStatus: "NORMAL" | "ALERT" | "CRITICAL";
  rfLinkStatus: "CONNECTED" | "LOST";
  
  // Reasons Checklist
  reasons: string[];
  subNote: string;
  footerTag: string;
  
  // Actuators (Actual states reported by ESP32)
  heater: boolean;
  fan: boolean;
  relay: boolean;
  motor: boolean;
  buzzer: boolean;
  motorOn: boolean;
  fanOn: boolean;
  heaterOn: boolean;
  buzzerOn: boolean;

  // LEDs (calculated dynamically or direct telemetry)
  redLED: boolean;
  greenLED: boolean;
  yellowLED: boolean;
  blueLED: boolean;
  ledRed: boolean;
  ledGreen: boolean;
  ledYellow: boolean;
  ledBlue: boolean;

  // Diagnostics & Modes
  ds18b20OK: boolean;
  ina219OK: boolean;
  mpu6050OK: boolean;
  manualMode: boolean;
  thermalSurvivalMode: boolean;

  // Metadata
  lastUpdatedSec: number;
}
