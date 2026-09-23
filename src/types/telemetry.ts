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

export interface TelemetryState {
  // Connection State
  isConnected: boolean;
  wsStatus: "connecting" | "connected" | "disconnected";

  // Live Sensors (real hardware, null or number)
  temperature: number | null; // e.g. 31.4 °C
  temperatureRate: number | null; // e.g. +0.4 °C/min
  voltage: number | null; // e.g. 11.92 V
  current: number | null; // e.g. 1.84 A (INA219)
  power: number | null; // e.g. 21.95 W (INA219)
  motorCurrent: number | null; // same as INA219 current or dedicated
  vibration: number | null; // e.g. 0.08 g (MPU6050)
  
  // Historical buffers for real waveform graphs (latest 60-120 samples)
  tempHistory: number[];
  voltageHistory: number[];
  currentHistory: number[];
  powerHistory: number[];
  motorCurrentHistory: number[];
  vibrationHistory: number[];
  
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
  
  // Communication Link (ESP-NOW)
  communicationType: string; // "ESP-NOW"
  esp1Online: boolean;
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

  // LEDs (calculated dynamically per hardware rule)
  // LED RED: temp >= 29
  // LED GREEN: temp < 29
  // LED YELLOW: motorOn && vibration >= 3
  // LED BLUE: motorOn && vibration < 3
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
