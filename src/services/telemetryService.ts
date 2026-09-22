import { TelemetryState, SystemSettings, LogEvent, CrisisScenario } from "../types/telemetry";

export const DEFAULT_SETTINGS: SystemSettings = {
  tempWarningThreshold: 40.0,
  tempCriticalThreshold: 50.0,
  vibrationWarningThreshold: 0.06,
  vibrationCriticalThreshold: 0.25,
  currentWarningThreshold: 2.0,
  currentCriticalThreshold: 2.6,
  rfTimeoutMs: 200,
  telemetryRateMs: 1000,
};

export const INITIAL_DARK_TELEMETRY: TelemetryState = {
  temperature: 38.7,
  temperatureRate: 4.2,
  voltage: 11.8,
  current: 2.1,
  power: 24.8,
  motorCurrent: 0.86,
  vibration: 0.08,
  
  tempHistory: [34.1, 34.8, 35.5, 36.2, 37.0, 37.8, 38.3, 38.7],
  voltageHistory: [11.9, 11.8, 11.8, 11.7, 11.8, 11.9, 11.8, 11.8],
  currentHistory: [1.9, 1.9, 2.0, 2.1, 2.0, 2.2, 2.1, 2.1],
  powerHistory: [22.6, 22.4, 23.6, 24.5, 23.6, 26.1, 24.8, 24.8],
  motorCurrentHistory: [0.81, 0.82, 0.83, 0.85, 0.85, 0.86, 0.86, 0.86],
  vibrationHistory: [0.03, 0.04, 0.05, 0.06, 0.07, 0.07, 0.08, 0.08],
  
  rpm: 1480,
  motorHealthCurrent: 1.82,
  vibrationAlert: "HIGH",
  motorLoad: 82,
  failureRisk: 84,
  motorState: "WARNING",
  thermalStress: 78,
  mechanicalStress: 84,
  electricalStress: 65,
  
  rfStatus: "CONNECTED",
  nodesOnline: "2 / 2 NODES ONLINE",
  latency: 19,
  packetCount: 1040,
  lostPackets: 3,
  rssi: -67,
  ackRate: 99.7,
  lastPacketTime: "10:35:28",
  lastAckTime: "10:35:28",
  
  systemStatusText: "SYSTEM OPERATIONAL.",
  crisisLevel: "WARNING",
  crisisDescriptions: ["Temperature Rising", "Vibration Abnormal..."],
  survivalMode: "STANDBY",
  survivalModeSubtext: "READY TO ADAPT",
  
  decision: "MONITOR & PREPARE",
  confidence: 72,
  tempStatus: "HIGH",
  powerCondition: "NORMAL",
  motorCurrentStatus: "NORMAL",
  vibrationStatus: "ALERT",
  rfLinkStatus: "CONNECTED",
  
  reasons: [
    "Temperature approaching threshold",
    "Trend shows continuous rise",
    "Vibration above normal limit",
    "All other parameters normal",
  ],
  subNote: "System preparing for possible critical event.",
  footerTag: "NO HUMAN INTERVENTION REQUIRED.",
  
  heater: false,
  fan: true,
  relay: false,
  motor: true,
  buzzer: true,
  ledRed: false,

  lastUpdatedSec: 3,
};

export const INITIAL_EVENTS: LogEvent[] = [
  {
    id: "evt-01",
    timestamp: "10:35:22",
    category: "SYSTEM",
    severity: "INFO",
    title: "SYSTEM START",
    details: "BLACKSUN Embedded OS Kernel v3.4 booted on ESP32 Dual Core.",
  },
  {
    id: "evt-02",
    timestamp: "10:35:27",
    category: "COMMUNICATION",
    severity: "INFO",
    title: "NRF LINK ESTABLISHED",
    details: "NRF24L01+ channel 76 link synced. 2/2 nodes active. RSSI: -67 dBm.",
  },
  {
    id: "evt-03",
    timestamp: "10:35:31",
    category: "THERMAL",
    severity: "INFO",
    title: "TEMPERATURE RISING",
    details: "DS18B20 gradient slope positive at +4.2 °C/min. Current: 38.7 °C.",
  },
  {
    id: "evt-04",
    timestamp: "10:35:36",
    category: "THERMAL",
    severity: "WARNING",
    title: "THERMAL WARNING",
    details: "Temperature crossed 38.5 °C baseline threshold. Autonomous cooling primed.",
  },
  {
    id: "evt-05",
    timestamp: "10:35:41",
    category: "MOTOR",
    severity: "WARNING",
    title: "VIBRATION ALERT",
    details: "MPU6050 RMS acceleration 0.08g exceeding 0.06g boundary.",
  },
];

export class TelemetryEngine {
  private mode: "SIMULATION" | "HARDWARE" = "SIMULATION";

  public getMode(): "SIMULATION" | "HARDWARE" {
    return this.mode;
  }

  public setMode(mode: "SIMULATION" | "HARDWARE") {
    this.mode = mode;
  }

  // Evaluate deterministic decision tree given sensor values and safety thresholds
  public evaluateSurvival(state: TelemetryState, settings: SystemSettings): {
    decision: string;
    confidence: number;
    crisisLevel: "NORMAL" | "WARNING" | "CRITICAL";
    reasons: string[];
    actuators: { heater: boolean; fan: boolean; relay: boolean; motor: boolean; buzzer: boolean; ledRed: boolean };
    riskIndex: number;
  } {
    const reasons: string[] = [];
    let risk = 10;

    const isTempCrit = state.temperature >= settings.tempCriticalThreshold;
    const isTempWarn = state.temperature >= settings.tempWarningThreshold || state.temperatureRate >= 3.5;
    const isVibCrit = state.vibration >= settings.vibrationCriticalThreshold;
    const isVibWarn = state.vibration >= settings.vibrationWarningThreshold;
    const isCurrCrit = state.motorHealthCurrent >= settings.currentCriticalThreshold;
    const isCurrWarn = state.motorHealthCurrent >= settings.currentWarningThreshold;
    const isRfLost = state.rfStatus === "LOST";

    if (isTempCrit) {
      risk += 40;
      reasons.push("Critical thermal limit exceeded (>50°C)");
    } else if (isTempWarn) {
      risk += 25;
      reasons.push("Temperature approaching warning threshold");
      reasons.push("Trend shows continuous rise");
    }

    if (isVibCrit) {
      risk += 35;
      reasons.push("Mechanical harmonic resonance critical (>0.25g)");
    } else if (isVibWarn) {
      risk += 25;
      reasons.push("Vibration above normal limit (>0.06g)");
    }

    if (isCurrCrit) {
      risk += 35;
      reasons.push("Motor current surge above safe ceiling");
    } else if (isCurrWarn) {
      risk += 20;
      reasons.push("Motor electrical load elevated");
    }

    if (isRfLost) {
      risk += 15;
      reasons.push("RF carrier lost — local edge autonomy active");
    }

    risk = Math.min(99, Math.max(8, risk));

    // Decision Logic
    if (isTempCrit || isVibCrit || isCurrCrit) {
      return {
        decision: "PROTECTIVE SHUTDOWN",
        confidence: 94,
        crisisLevel: "CRITICAL",
        reasons: reasons.length ? reasons : ["Critical threshold violation detected"],
        actuators: {
          heater: false,
          fan: true,
          relay: false,
          motor: false,
          buzzer: true,
          ledRed: true,
        },
        riskIndex: risk,
      };
    } else if (isTempWarn || isVibWarn || isCurrWarn || isRfLost) {
      return {
        decision: "MONITOR & PREPARE",
        confidence: 72,
        crisisLevel: "WARNING",
        reasons: reasons.length ? reasons : ["Sensors approaching warning limits"],
        actuators: {
          heater: false,
          fan: true,
          relay: false,
          motor: true,
          buzzer: isVibWarn || isCurrWarn,
          ledRed: false,
        },
        riskIndex: risk,
      };
    }

    return {
      decision: "NOMINAL SUPERVISION",
      confidence: 98,
      crisisLevel: "NORMAL",
      reasons: ["All parameters within baseline operating tolerance"],
      actuators: {
        heater: false,
        fan: false,
        relay: true,
        motor: true,
        buzzer: false,
        ledRed: false,
      },
      riskIndex: risk,
    };
  }
}

export const telemetryService = new TelemetryEngine();
