import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  TelemetryState,
  SystemSettings,
  LogEvent,
  CrisisScenario,
  PageId,
  WSConnectionStatus,
} from "../types/telemetry";
import {
  DEFAULT_SETTINGS,
  INITIAL_OFFLINE_TELEMETRY,
  INITIAL_EVENTS,
  mapESP32ToTelemetryState,
} from "../services/telemetryService";
import {
  blackSunWS,
  ESP32ControlMessage,
} from "../services/blackSunWebSocket";
import { blackSunSimulator } from "../services/blackSunSimulator";

interface TelemetryContextType {
  telemetry: TelemetryState;
  settings: SystemSettings;
  events: LogEvent[];
  activePage: PageId;
  activeScenario: CrisisScenario;
  systemMode: "SIMULATION" | "HARDWARE";
  showDataModal: boolean;
  showInfoModal: boolean;
  wsStatus: WSConnectionStatus;
  isConnected: boolean;
  isDemo: boolean;
  mode: "REAL" | "DEMO";
  wsIp: string;
  wsUrl: string;
  autoConnect: boolean;
  setWsIp: (ip: string, reconnectImmediately?: boolean) => void;
  setAutoConnect: (enabled: boolean) => void;
  connectWS: (ip?: string) => void;
  disconnectWS: () => void;
  setShowDataModal: (show: boolean) => void;
  setShowInfoModal: (show: boolean) => void;
  setSystemMode: (mode: "SIMULATION" | "HARDWARE") => void;
  navigatePage: (pageId: PageId) => void;
  toggleActuator: (name: keyof TelemetryState) => void;
  sendControl: (control: ESP32ControlMessage) => boolean;
  reconnectWS: () => void;
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

  const [telemetry, setTelemetry] = useState<TelemetryState>(INITIAL_OFFLINE_TELEMETRY);
  const [events, setEvents] = useState<LogEvent[]>(INITIAL_EVENTS);
  const [activePage, setActivePage] = useState<PageId>("01");
  const [activeScenario, setActiveScenario] = useState<CrisisScenario>("NORMAL");
  const [systemMode, setSystemModeState] = useState<"SIMULATION" | "HARDWARE">("HARDWARE");
  const [showDataModal, setShowDataModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [wsStatus, setWsStatus] = useState<WSConnectionStatus>(blackSunWS.getStatus());
  const [wsIp, setWsIpState] = useState<string>(blackSunWS.getIp());
  const [autoConnect, setAutoConnectState] = useState<boolean>(blackSunWS.isAutoConnect());

  const addLogEvent = useCallback((eventData: Omit<LogEvent, "id">) => {
    const newEvent: LogEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setEvents((prev) => [newEvent, ...prev.slice(0, 99)]);
  }, []);

  // Dual-mode telemetry subscription: REAL hardware vs DEMO simulator
  useEffect(() => {
    // If hardware is not connected, immediately start DEMO mode simulator
    if (!blackSunWS.isConnected()) {
      console.log("[BLACKSUN] DEMO MODE: Auto-starting simulation");
      blackSunSimulator.start();
    }

    const unsubStatus = blackSunWS.subscribeStatus((status) => {
      setWsStatus(status);

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(
        2,
        "0"
      )}:${String(now.getSeconds()).padStart(2, "0")}`;

      if (status === "connected") {
        console.log("[BLACKSUN] REAL MODE");
        blackSunSimulator.stop();
        addLogEvent({
          timestamp: timeStr,
          category: "COMMUNICATION",
          severity: "INFO",
          title: "ESP32 WEBSOCKET CONNECTED",
          details: `Hardware telemetry stream active from ${blackSunWS.getUrl()}`,
        });
      } else {
        console.log("[BLACKSUN] DEMO MODE: Switching to simulator");
        blackSunSimulator.start();
        if (status === "disconnected") {
          addLogEvent({
            timestamp: timeStr,
            category: "COMMUNICATION",
            severity: "WARNING",
            title: "ESP32 WEBSOCKET DISCONNECTED",
            details: "Carrier dropped. Switched to DEMO simulation mode. Reconnecting...",
          });
        }
      }
    });

    // Real telemetry listener (priority 1)
    const unsubRealTelemetry = blackSunWS.subscribeTelemetry((raw) => {
      blackSunSimulator.stop();
      setTelemetry((prev) => mapESP32ToTelemetryState(raw, prev, blackSunWS.getLatency(), true));
      if (raw.ip && raw.ip !== wsIp) {
        setWsIpState(raw.ip);
      }
    });

    // Simulated telemetry listener (runs only when hardware is not connected)
    const unsubSimTelemetry = blackSunSimulator.subscribe((simRaw) => {
      if (!blackSunWS.isConnected()) {
        setTelemetry((prev) => mapESP32ToTelemetryState(simRaw, prev, simRaw.latency ?? 35, false));
      }
    });

    // Latency listener
    const unsubLatency = blackSunWS.subscribeLatency((rtt) => {
      if (blackSunWS.isConnected()) {
        setTelemetry((prev) => ({
          ...prev,
          wsLatency: rtt,
        }));
      }
    });

    return () => {
      unsubStatus();
      unsubRealTelemetry();
      unsubSimTelemetry();
      unsubLatency();
      blackSunSimulator.stop();
    };
  }, [addLogEvent, wsIp]);

  // Track seconds elapsed
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        lastUpdatedSec: prev.lastUpdatedSec + 1,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const sendControl = useCallback((control: ESP32ControlMessage) => {
    return blackSunWS.sendControl(control);
  }, []);

  const reconnectWS = useCallback(() => {
    blackSunWS.connect();
  }, []);

  const connectWS = useCallback((ip?: string) => {
    blackSunWS.connect(ip);
    if (ip) {
      setWsIpState(ip);
    }
  }, []);

  const disconnectWS = useCallback(() => {
    blackSunWS.disconnect();
  }, []);

  const setWsIp = useCallback((newIp: string, reconnectImmediately = true) => {
    blackSunWS.setIp(newIp, reconnectImmediately);
    setWsIpState(newIp);
  }, []);

  const setAutoConnect = useCallback((enabled: boolean) => {
    blackSunWS.setAutoConnect(enabled);
    setAutoConnectState(enabled);
  }, []);

  // Actuator Toggle handler: handles both REAL hardware dispatch and DEMO override
  const toggleActuator = useCallback((actuatorKey: keyof TelemetryState) => {
    setTelemetry((prev) => {
      const isCurrentlyOn = Boolean(prev[actuatorKey]);
      const desiredState = !isCurrentlyOn;

      // DEMO mode: apply command to simulator
      if (prev.mode === "DEMO") {
        blackSunSimulator.applyUserCommand({
          [actuatorKey]: desiredState,
          ...(actuatorKey === "motor" || actuatorKey === "motorOn"
            ? { motorOn: desiredState, motorSpeed: desiredState ? 180 : 0 }
            : {}),
          ...(actuatorKey === "fan" || actuatorKey === "fanOn"
            ? { fanOn: desiredState, fanSpeed: desiredState ? 220 : 0 }
            : {}),
          ...(actuatorKey === "heater" || actuatorKey === "heaterOn"
            ? { heaterOn: desiredState }
            : {}),
        });
        return prev;
      }

      // REAL mode: command ESP32 without assuming optimistic state
      const controlMsg: ESP32ControlMessage = {
        type: "control",
        motorSpeed:
          actuatorKey === "motor" || actuatorKey === "motorOn"
            ? desiredState ? 180 : 0
            : prev.motorOn ? (prev.motorSpeed ?? 180) : 0,
        fanSpeed:
          actuatorKey === "fan" || actuatorKey === "fanOn"
            ? desiredState ? 220 : 0
            : prev.fanOn ? (prev.fanSpeed ?? 220) : 0,
        heaterOn:
          actuatorKey === "heater" || actuatorKey === "heaterOn"
            ? desiredState
            : prev.heaterOn,
        manualMode: prev.manualMode,
        manualTemp: prev.temperature ?? 25,
        manualVibration: prev.vibration ?? 0,
      };

      blackSunWS.sendControl(controlMsg);
      return prev;
    });
  }, []);

  // Crisis Scenarios Dispatcher
  const triggerScenario = useCallback((scenario: CrisisScenario) => {
    setActiveScenario(scenario);

    if (blackSunWS.isConnected()) {
      if (scenario === "NORMAL") {
        blackSunWS.sendControl({
          type: "control",
          manualMode: false,
          manualTemp: 25,
          manualVibration: 0,
          motorSpeed: 180,
          fanSpeed: 0,
          heaterOn: false,
        });
      } else if (scenario === "THERMAL_EVENT") {
        blackSunWS.sendControl({
          type: "control",
          manualMode: true,
          manualTemp: 38,
          manualVibration: 0.1,
        });
      } else if (scenario === "MOTOR_VIBRATION") {
        blackSunWS.sendControl({
          type: "control",
          manualMode: true,
          manualTemp: 26,
          manualVibration: 3.8,
        });
      } else if (scenario === "MOTOR_OVERLOAD") {
        blackSunWS.sendControl({
          type: "control",
          manualMode: true,
          manualTemp: 26,
          manualVibration: 0.2,
          motorSpeed: 255,
        });
      } else if (scenario === "RF_FAILURE") {
        blackSunWS.sendControl({
          type: "control",
          manualMode: true,
          manualTemp: 25,
          manualVibration: 0,
        });
      } else if (scenario === "FULL_CASCADE") {
        blackSunWS.sendControl({
          type: "control",
          manualMode: true,
          manualTemp: 42,
          manualVibration: 4.5,
          motorSpeed: 255,
          heaterOn: true,
        });
      }
    } else {
      // In DEMO mode, override simulator state directly
      if (scenario === "NORMAL") {
        blackSunSimulator.applyUserCommand({
          temperature: 25.4,
          voltage: 11.9,
          currentA: 1.45,
          vibration: 0.12,
          motorOn: true,
          fanOn: false,
          motorSpeed: 180,
          fanSpeed: 0,
          heaterOn: false,
          buzzerOn: false,
          crisisLevel: "NORMAL",
          systemState: "NORMAL OPERATION",
          decision: "RUN",
          reason: "Temperature below 29C - motor running",
        });
      } else if (scenario === "THERMAL_EVENT") {
        blackSunSimulator.applyUserCommand({
          temperature: 36.8,
          voltage: 11.7,
          currentA: 0.95,
          vibration: 0.09,
          motorOn: false,
          fanOn: true,
          motorSpeed: 0,
          fanSpeed: 255,
          heaterOn: false,
          buzzerOn: true,
          crisisLevel: "CRITICAL",
          systemState: "SURVIVAL MODE",
          decision: "SURVIVE",
          reason: "Critical temperature - motor stopped and fan at full speed",
        });
      } else if (scenario === "MOTOR_VIBRATION") {
        blackSunSimulator.applyUserCommand({
          temperature: 27.2,
          voltage: 11.8,
          currentA: 2.1,
          vibration: 3.8,
          motorOn: true,
          fanOn: false,
          motorSpeed: 180,
          fanSpeed: 0,
          heaterOn: false,
          buzzerOn: true,
          crisisLevel: "WARNING",
          systemState: "VIBRATION ALERT",
          decision: "MONITOR VIBRATION",
          reason: "Motor vibration above configured limit (>= 3.0g)",
        });
      }
    }
  }, []);

  const resetToImageDefault = useCallback(() => {
    triggerScenario("NORMAL");
  }, [triggerScenario]);

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

  const clearLogs = useCallback(() => {
    setEvents([]);
  }, []);

  const navigatePage = useCallback((pageId: PageId) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const setSystemMode = useCallback((mode: "SIMULATION" | "HARDWARE") => {
    setSystemModeState(mode);
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
        wsStatus,
        isConnected: telemetry.mode === "REAL",
        isDemo: telemetry.mode === "DEMO",
        mode: telemetry.mode,
        wsIp,
        wsUrl: `ws://${wsIp}:81`,
        autoConnect,
        setWsIp,
        setAutoConnect,
        connectWS,
        disconnectWS,
        setShowDataModal,
        setShowInfoModal,
        setSystemMode,
        navigatePage,
        toggleActuator,
        sendControl,
        reconnectWS,
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
