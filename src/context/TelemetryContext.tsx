import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  TelemetryState,
  SystemSettings,
  LogEvent,
  CrisisScenario,
  PageId,
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
  WSConnectionStatus,
} from "../services/blackSunWebSocket";

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

  const addLogEvent = useCallback((eventData: Omit<LogEvent, "id">) => {
    const newEvent: LogEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setEvents((prev) => [newEvent, ...prev.slice(0, 99)]);
  }, []);

  // Subscribe to central WebSocket service
  useEffect(() => {
    const unsubStatus = blackSunWS.subscribeStatus((status) => {
      setWsStatus(status);
      setTelemetry((prev) => {
        if (status === "connected") {
          return {
            ...prev,
            isConnected: true,
            wsStatus: "connected",
            rfStatus: "CONNECTED",
            rfLinkStatus: "CONNECTED",
            systemStatusText: "SYSTEM OPERATIONAL.",
          };
        } else {
          // When disconnected, mark status as lost but retain previous history buffers
          return {
            ...prev,
            isConnected: false,
            wsStatus: status,
            rfStatus: "LOST",
            rfLinkStatus: "LOST",
            systemStatusText: "COMMUNICATION LOST",
          };
        }
      });

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(
        2,
        "0"
      )}:${String(now.getSeconds()).padStart(2, "0")}`;

      if (status === "connected") {
        addLogEvent({
          timestamp: timeStr,
          category: "COMMUNICATION",
          severity: "INFO",
          title: "ESP32 WEBSOCKET CONNECTED",
          details: "Real hardware telemetry stream active from ws://192.168.4.1:81",
        });
      } else if (status === "disconnected") {
        addLogEvent({
          timestamp: timeStr,
          category: "COMMUNICATION",
          severity: "WARNING",
          title: "ESP32 WEBSOCKET DISCONNECTED",
          details: "Carrier dropped. Attempting automatic reconnection every 2.5s.",
        });
      }
    });

    const unsubTelemetry = blackSunWS.subscribeTelemetry((raw) => {
      setTelemetry((prev) => mapESP32ToTelemetryState(raw, prev));
    });

    return () => {
      unsubStatus();
      unsubTelemetry();
    };
  }, [addLogEvent]);

  // Track seconds elapsed since last received telemetry packet
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        lastUpdatedSec: prev.lastUpdatedSec + 1,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Send control command to ESP32 without assuming optimistic UI state
  const sendControl = useCallback((control: ESP32ControlMessage) => {
    return blackSunWS.sendControl(control);
  }, []);

  const reconnectWS = useCallback(() => {
    blackSunWS.connect();
  }, []);

  // Actuator Toggle handler: commands ESP32 and waits for real returned telemetry
  const toggleActuator = useCallback((actuatorKey: keyof TelemetryState) => {
    setTelemetry((prev) => {
      const isCurrentlyOn = Boolean(prev[actuatorKey]);
      const desiredState = !isCurrentlyOn;

      const controlMsg: ESP32ControlMessage = {
        type: "control",
        motorSpeed:
          actuatorKey === "motor" || actuatorKey === "motorOn"
            ? desiredState ? 180 : 0
            : prev.motorOn ? (prev.motorSpeed ?? 180) : 0,
        fanSpeed:
          actuatorKey === "fan" || actuatorKey === "fanOn"
            ? desiredState ? 180 : 0
            : prev.fanOn ? (prev.fanSpeed ?? 180) : 0,
        heaterOn:
          actuatorKey === "heater" || actuatorKey === "heaterOn"
            ? desiredState
            : prev.heaterOn,
        manualMode: prev.manualMode,
        manualTemp: prev.temperature ?? 25,
        manualVibration: prev.vibration ?? 0,
      };

      blackSunWS.sendControl(controlMsg);
      // Strict rule: NEVER optimistically change state; return prev!
      return prev;
    });
  }, []);

  // Crisis Scenarios Dispatcher
  const triggerScenario = useCallback((scenario: CrisisScenario) => {
    setActiveScenario(scenario);

    // If connected to ESP32, send manual control payload
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
      // If hardware is not connected yet, allow previewing the scenario state
      if (scenario === "NORMAL") {
        setTelemetry((prev) =>
          mapESP32ToTelemetryState(
            {
              type: "telemetry",
              temperature: 25.4,
              voltage: 11.9,
              current: 1.82,
              power: 21.6,
              vibration: 0.08,
              motorSpeed: 180,
              fanSpeed: 0,
              motorOn: true,
              fanOn: false,
              heaterOn: false,
              buzzerOn: false,
              thermalSurvivalMode: false,
              crisisLevel: "NORMAL",
              systemState: "SYSTEM NOMINAL",
              decision: "NORMAL OPERATION",
              reason: "Temperature below cooling threshold (28°C)",
              communication: "ESP-NOW",
              esp1Online: true,
              uptime: 1042,
            },
            prev
          )
        );
      } else if (scenario === "THERMAL_EVENT") {
        setTelemetry((prev) =>
          mapESP32ToTelemetryState(
            {
              type: "telemetry",
              temperature: 36.8,
              voltage: 11.7,
              current: 1.2,
              power: 14.0,
              vibration: 0.09,
              motorSpeed: 0,
              fanSpeed: 255,
              motorOn: false,
              fanOn: true,
              heaterOn: false,
              buzzerOn: true,
              thermalSurvivalMode: true,
              crisisLevel: "CRITICAL",
              systemState: "THERMAL SURVIVAL",
              decision: "SURVIVAL RESPONSE",
              reason: "Temperature above critical threshold (>35°C)",
              communication: "ESP-NOW",
              esp1Online: true,
              uptime: 1250,
            },
            prev
          )
        );
      } else if (scenario === "MOTOR_VIBRATION") {
        setTelemetry((prev) =>
          mapESP32ToTelemetryState(
            {
              type: "telemetry",
              temperature: 27.2,
              voltage: 11.8,
              current: 2.1,
              power: 24.7,
              vibration: 3.6,
              motorSpeed: 120,
              fanSpeed: 0,
              motorOn: true,
              fanOn: false,
              heaterOn: false,
              buzzerOn: true,
              thermalSurvivalMode: false,
              crisisLevel: "CRITICAL",
              systemState: "VIBRATION ALERT",
              decision: "VIBRATION MITIGATION",
              reason: "Motor vibration alert detected (>= 3.0g)",
              communication: "ESP-NOW",
              esp1Online: true,
              uptime: 1300,
            },
            prev
          )
        );
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
        isConnected: wsStatus === "connected",
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
