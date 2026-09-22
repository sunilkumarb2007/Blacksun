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
  tempWarningThreshold: number;     // e.g. 40°C
  tempCriticalThreshold: number;    // e.g. 50°C
  vibrationWarningThreshold: number;// e.g. 0.06 g
  vibrationCriticalThreshold: number;// e.g. 0.25 g
  currentWarningThreshold: number;  // e.g. 2.0 A
  currentCriticalThreshold: number;  // e.g. 2.6 A
  rfTimeoutMs: number;              // e.g. 200 ms
  telemetryRateMs: number;          // e.g. 1000 ms
}

export interface TelemetryState {
  // Live Sensors
  temperature: number; // e.g. 38.7
  temperatureRate: number; // e.g. +4.2
  voltage: number; // e.g. 11.8
  current: number; // e.g. 2.1
  power: number; // e.g. 24.8
  motorCurrent: number; // e.g. 0.86
  vibration: number; // e.g. 0.08
  
  // Historical buffers for sparklines & charts (array of recent values)
  tempHistory: number[];
  voltageHistory: number[];
  currentHistory: number[];
  powerHistory: number[];
  motorCurrentHistory: number[];
  vibrationHistory: number[];
  
  // Motor Health
  rpm: number; // e.g. 1480
  motorHealthCurrent: number; // e.g. 1.82
  vibrationAlert: "NORMAL" | "HIGH" | "CRITICAL"; // HIGH
  motorLoad: number; // e.g. 82%
  failureRisk: number; // e.g. 84%
  motorState: "NORMAL" | "WARNING" | "DEGRADED" | "CRITICAL" | "PROTECTED";
  thermalStress: number; // 0-100
  mechanicalStress: number; // 0-100
  electricalStress: number; // 0-100
  
  // Communication Link
  rfStatus: "CONNECTED" | "DEGRADED" | "LOST";
  nodesOnline: string; // "2 / 2 NODES ONLINE"
  latency: number; // e.g. 19
  packetCount: number; // e.g. 1040
  lostPackets: number; // e.g. 3
  rssi: number; // e.g. -67
  ackRate: number; // e.g. 99.7%
  lastPacketTime: string;
  lastAckTime: string;
  
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
  
  // Actuators
  heater: boolean;
  fan: boolean;
  relay: boolean;
  motor: boolean;
  buzzer: boolean;
  ledRed: boolean;

  // Metadata
  lastUpdatedSec: number;
}
