import { useState, useEffect, useCallback } from "react";
import {
  blackSunWS,
  ESP32TelemetryRaw,
  ESP32ControlMessage,
  WSConnectionStatus,
  BLACKSUN_WS_URL,
} from "../services/blackSunWebSocket";

export function useBlackSunWebSocket() {
  const [status, setStatus] = useState<WSConnectionStatus>(blackSunWS.getStatus());
  const [lastPayload, setLastPayload] = useState<ESP32TelemetryRaw | null>(null);

  useEffect(() => {
    const unsubStatus = blackSunWS.subscribeStatus((newStatus) => {
      setStatus(newStatus);
    });

    const unsubTelemetry = blackSunWS.subscribeTelemetry((data) => {
      setLastPayload(data);
    });

    return () => {
      unsubStatus();
      unsubTelemetry();
    };
  }, []);

  const sendControl = useCallback((control: ESP32ControlMessage) => {
    return blackSunWS.sendControl(control);
  }, []);

  const reconnect = useCallback(() => {
    blackSunWS.connect();
  }, []);

  return {
    status,
    isConnected: status === "connected",
    isConnecting: status === "connecting",
    lastPayload,
    sendControl,
    reconnect,
    url: BLACKSUN_WS_URL,
  };
}
