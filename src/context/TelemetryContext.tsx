import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  TelemetryState,
  SystemSettings,
  LogEvent,
  CrisisScenario,
  PageId,
} from "../types/telemetry";
import {
  INITIAL_DARK_TELEMETRY,
  DEFAULT_SETTINGS,
  INITIAL_EVENTS,
  telemetryService,
} from "../services/telemetryService";

interface TelemetryContextType {
  telemetry: TelemetryState;
  settings: SystemSettings;
  events: LogEvent[];
  activePage: PageId;
  activeScenario: CrisisScenario;
  systemMode: "SIMULATION" | "HARDWARE";
  showDataModal: boolean;
  showInfoModal: boolean;
  setShowDataModal: (show: boolean) => void;
  setShowInfoModal: (show: boolean) => void;
  setSystemMode: (mode: "SIMULATION" | "HARDWARE") => void;
  navigatePage: (pageId: PageId) => void;
  toggleActuator: (name: keyof TelemetryState) => void;
  triggerScenario: (scenario: CrisisScenario) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetSettingsToDefault: () => void;
  addLogEvent: (event: Omit<LogEvent, "id">) => void;
  clearLogs: () => void;
  resetToImageDefault: () => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = "blacksun_system_settings";

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load settings from localStorage or defaults
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [telemetry, setTelemetry] = useState<TelemetryState>(INITIAL_DARK_TELEMETRY);
  const [events, setEvents] = useState<LogEvent[]>(INITIAL_EVENTS);
  const [activePage, setActivePage] = useState<PageId>("01");
  const [activeScenario, setActiveScenario] = useState<CrisisScenario>("NORMAL");
  const [systemMode, setSystemModeState] = useState<"SIMULATION" | "HARDWARE">("SIMULATION");
  const [showDataModal, setShowDataModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // Save settings on changes
  const updateSettings = useCallback((newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const resetSettingsToDefault = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch {
      // ignore
    }
  }, []);

  const addLogEvent = useCallback((eventData: Omit<LogEvent, "id">) => {
    const newEvent: LogEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setEvents((prev) => [newEvent, ...prev.slice(0, 99)]);
  }, []);

  const clearLogs = useCallback(() => {
    setEvents([]);
  }, []);

  const navigatePage = useCallback((pageId: PageId) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const setSystemMode = useCallback((mode: "SIMULATION" | "HARDWARE") => {
    setSystemModeState(mode);
    telemetryService.setMode(mode);
  }, []);

  const toggleActuator = useCallback((actuatorKey: keyof TelemetryState) => {
    setTelemetry((prev) => {
      const nextVal = !prev[actuatorKey];
      return {
        ...prev,
        [actuatorKey]: nextVal,
      };
    });
  }, []);

  // Periodic Telemetry Simulation & Sparkline Updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        if (prev.rfStatus === "LOST") {
          return {
            ...prev,
            lastUpdatedSec: (prev.lastUpdatedSec + 1) % 60,
          };
        }

        // Small jitter around current values for realism
        const tempJitter = Math.sin(Date.now() / 3000) * 0.15;
        const newTemp = parseFloat((prev.temperature + tempJitter * 0.05).toFixed(1));
        const voltJitter = (Math.random() - 0.5) * 0.04;
        const newVolt = parseFloat((11.8 + voltJitter).toFixed(1));
        const currJitter = (Math.random() - 0.5) * 0.05;
        const newCurr = parseFloat((prev.current + currJitter * 0.02).toFixed(1));
        const newPower = parseFloat((newVolt * newCurr).toFixed(1));

        // Append to history buffer (keep last 12 points)
        const updateHistory = (arr: number[], val: number) => [...arr.slice(1), val];

        const nextState: TelemetryState = {
          ...prev,
          temperature: newTemp,
          voltage: newVolt,
          current: newCurr,
          power: newPower,
          tempHistory: updateHistory(prev.tempHistory, newTemp),
          voltageHistory: updateHistory(prev.voltageHistory, newVolt),
          currentHistory: updateHistory(prev.currentHistory, newCurr),
          powerHistory: updateHistory(prev.powerHistory, newPower),
          motorCurrentHistory: updateHistory(prev.motorCurrentHistory, prev.motorCurrent),
          vibrationHistory: updateHistory(prev.vibrationHistory, prev.vibration),
          packetCount: prev.packetCount + 1,
          latency: 18 + Math.floor(Math.random() * 3),
          rssi: -67 + (Math.random() > 0.6 ? 1 : 0),
          lastUpdatedSec: (prev.lastUpdatedSec % 4) + 1,
        };

        return nextState;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Crisis Scenarios Dispatcher
  const triggerScenario = useCallback(
    (scenario: CrisisScenario) => {
      setActiveScenario(scenario);
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(
        2,
        "0"
      )}:${String(now.getSeconds()).padStart(2, "0")}`;

      if (scenario === "NORMAL") {
        setTelemetry({
          ...INITIAL_DARK_TELEMETRY,
          crisisLevel: "NORMAL",
          crisisDescriptions: ["All Sensors Nominal", "Parameters Optimal"],
          survivalMode: "STANDBY",
          survivalModeSubtext: "READY TO ADAPT",
          failureRisk: 14,
          vibrationAlert: "NORMAL",
          vibration: 0.03,
          vibrationStatus: "NORMAL",
          tempStatus: "NORMAL",
          decision: "NOMINAL SUPERVISION",
          confidence: 98,
          reasons: [
            "Temperature within baseline bounds",
            "Vibration below warning threshold",
            "Motor electrical load normal",
            "RF communication link optimal",
          ],
          subNote: "Standard autonomous background loop active.",
          fan: false,
          heater: false,
          relay: true,
          motor: true,
          buzzer: false,
          ledRed: false,
        });
        addLogEvent({
          timestamp: timeStr,
          category: "SYSTEM",
          severity: "INFO",
          title: "SYSTEM RESET TO NOMINAL",
          details: "All emergency flags cleared. Normal supervision engaged.",
        });
      } else if (scenario === "THERMAL_EVENT") {
        setTelemetry((prev) => ({
          ...prev,
          temperature: 52.6,
          temperatureRate: 8.4,
          tempStatus: "CRITICAL",
          crisisLevel: "CRITICAL",
          crisisDescriptions: ["Thermal Runaway Detected", "Cooling Fan Overdrive"],
          survivalMode: "ACTIVE",
          survivalModeSubtext: "THERMAL MITIGATION",
          failureRisk: 92,
          thermalStress: 96,
          fan: true,
          heater: false,
          buzzer: true,
          ledRed: true,
          decision: "MAX FORCED COOLING",
          confidence: 91,
          reasons: [
            "Temperature exceeded 50°C critical threshold",
            "Rate of climb +8.4°C/min indicates thermal surge",
            "Cartridge heater cutoff verified",
            "Cooling fan commanded to 100% duty cycle",
          ],
          subNote: "Emergency thermal dissipation active. Monitor gradient.",
        }));
        addLogEvent({
          timestamp: timeStr,
          category: "THERMAL",
          severity: "CRITICAL",
          title: "THERMAL RUNAWAY CRITICAL",
          details: "Temp 52.6°C (+8.4°C/min). Fan engaged, heater shutdown.",
        });
      } else if (scenario === "MOTOR_VIBRATION") {
        setTelemetry((prev) => ({
          ...prev,
          vibration: 0.44,
          vibrationAlert: "CRITICAL",
          vibrationStatus: "CRITICAL",
          crisisLevel: "CRITICAL",
          crisisDescriptions: ["Harmonic Resonance Spike", "Bearing Stress Critical"],
          survivalMode: "ACTIVE",
          survivalModeSubtext: "VIBRATION DAMPING",
          failureRisk: 89,
          mechanicalStress: 95,
          rpm: 880,
          buzzer: true,
          ledRed: true,
          decision: "THROTTLE SPEED & DAMP",
          confidence: 88,
          reasons: [
            "Vibration amplitude 0.44g crossed critical 0.25g boundary",
            "Harmonic resonant frequency detected on shaft",
            "Motor speed throttled to 880 RPM to avert mechanical fracture",
          ],
          subNote: "Autonomous vibration damping engaged.",
        }));
        addLogEvent({
          timestamp: timeStr,
          category: "MOTOR",
          severity: "CRITICAL",
          title: "VIBRATION SPIKE CRITICAL",
          details: "Vibration 0.44g on MPU6050. Motor RPM throttled to 880.",
        });
      } else if (scenario === "MOTOR_OVERLOAD") {
        setTelemetry((prev) => ({
          ...prev,
          motorHealthCurrent: 3.24,
          motorCurrent: 2.75,
          current: 3.8,
          power: 44.8,
          motorLoad: 98,
          failureRisk: 96,
          electricalStress: 98,
          motorCurrentStatus: "CRITICAL",
          crisisLevel: "CRITICAL",
          crisisDescriptions: ["Motor Current Surge", "Relay Cutoff Triggered"],
          survivalMode: "ACTIVE",
          survivalModeSubtext: "OVERLOAD ISOLATION",
          relay: false,
          motor: false,
          buzzer: true,
          ledRed: true,
          decision: "PROTECTIVE SHUTDOWN",
          confidence: 96,
          reasons: [
            "Current 3.24A exceeded 2.6A critical threshold",
            "BTS7960 driver thermal junction safety triggered",
            "Relay disconnected to isolate motor winding",
            "Motor halted to prevent insulation burn",
          ],
          subNote: "Hardware electrical cutoff confirmed.",
        }));
        addLogEvent({
          timestamp: timeStr,
          category: "POWER",
          severity: "CRITICAL",
          title: "MOTOR CURRENT OVERLOAD",
          details: "Motor Current 3.24A. Relay opened, motor shutdown commanded.",
        });
      } else if (scenario === "RF_FAILURE") {
        setTelemetry((prev) => ({
          ...prev,
          rfStatus: "LOST",
          nodesOnline: "1 / 2 NODES ONLINE",
          latency: 0,
          lostPackets: prev.lostPackets + 18,
          rssi: -99,
          rfLinkStatus: "LOST",
          crisisLevel: "WARNING",
          crisisDescriptions: ["NRF24L01+ Link Lost", "Local Autonomy Engaged"],
          survivalMode: "ACTIVE",
          survivalModeSubtext: "LOCAL AUTONOMY",
          decision: "LOCAL FAILSAFE ACTIVE",
          confidence: 89,
          reasons: [
            "NRF24 packet acknowledgment timeout (>200ms)",
            "Carrier signal lost with peripheral node",
            "Switched to independent edge autonomy logic",
            "Telemetry buffered to local ESP32 flash",
          ],
          subNote: "Local control loop operates without communication dependency.",
        }));
        addLogEvent({
          timestamp: timeStr,
          category: "COMMUNICATION",
          severity: "WARNING",
          title: "RF LINK TIMEOUT",
          details: "Carrier lost. Peripheral node unreachable. Local Autonomy Active.",
        });
      } else if (scenario === "FULL_CASCADE") {
        setTelemetry((prev) => ({
          ...prev,
          temperature: 54.8,
          temperatureRate: 9.1,
          vibration: 0.48,
          motorHealthCurrent: 3.42,
          current: 4.1,
          power: 48.2,
          motorLoad: 100,
          failureRisk: 99,
          thermalStress: 99,
          mechanicalStress: 98,
          electricalStress: 99,
          rfStatus: "LOST",
          nodesOnline: "1 / 2 NODES ONLINE",
          latency: 0,
          rfLinkStatus: "LOST",
          tempStatus: "CRITICAL",
          vibrationStatus: "CRITICAL",
          motorCurrentStatus: "CRITICAL",
          crisisLevel: "CRITICAL",
          crisisDescriptions: ["Cascading Multi-System Failure", "Emergency Shutdown"],
          survivalMode: "ACTIVE",
          survivalModeSubtext: "FULL PROTECTIVE ISOLATION",
          heater: false,
          fan: true,
          relay: false,
          motor: false,
          buzzer: true,
          ledRed: true,
          decision: "FULL PROTECTIVE SHUTDOWN",
          confidence: 99,
          reasons: [
            "Concurrent thermal, vibration and current threshold violations",
            "RF telemetry link disrupted",
            "Total autonomous isolation routine executed",
            "Motor and power relay killed; fan operating at emergency ceiling",
          ],
          subNote: "Catastrophic event mitigated autonomously by BLACKSUN.",
        }));
        addLogEvent({
          timestamp: timeStr,
          category: "SYSTEM",
          severity: "CRITICAL",
          title: "FULL CASCADE EVENT",
          details: "Thermal, vibration, and electrical limits breached. Full isolation triggered.",
        });
      }
    },
    [addLogEvent]
  );

  const resetToImageDefault = useCallback(() => {
    setActiveScenario("NORMAL");
    setTelemetry(INITIAL_DARK_TELEMETRY);
  }, []);

  return (
    <TelemetryContext.Provider
      value={{
        telemetry,
        settings,
        events,
        activePage,
        activeScenario,
        systemMode,
        showDataModal,
        showInfoModal,
        setShowDataModal,
        setShowInfoModal,
        setSystemMode,
        navigatePage,
        toggleActuator,
        triggerScenario,
        updateSettings,
        resetSettingsToDefault,
        addLogEvent,
        clearLogs,
        resetToImageDefault,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }
  return context;
};
