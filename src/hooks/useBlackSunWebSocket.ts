import { useState, useEffect, useCallback } from "react";
import {
  blackSunWS,
  ESP32ControlMessage,
} from "../services/blackSunWebSocket";
import { ESP32TelemetryRaw, WSConnectionStatus } from "../types/telemetry";

export function useBlackSunWebSocket() {
  const [status, setStatus] = useState<WSConnectionStatus>(blackSunWS.getStatus());
  const [lastPayload, setLastPayload] = useState<ESP32TelemetryRaw | null>(null);
  const [latency, setLatency] = useState<number | null>(blackSunWS.getLatency());
  const [ip, setIpState] = useState<string>(blackSunWS.getIp());
  const [autoConnect, setAutoConnectState] = useState<boolean>(blackSunWS.isAutoConnect());

  useEffect(() => {
    const unsubStatus = blackSunWS.subscribeStatus((newStatus) => {
      setStatus(newStatus);
    });

    const unsubTelemetry = blackSunWS.subscribeTelemetry((data) => {
      setLastPayload(data);
      if (data.ip && data.ip !== ip) {
        setIpState(data.ip);
      }
    });

    const unsubLatency = blackSunWS.subscribeLatency((rtt) => {
      setLatency(rtt);
    });

    return () => {
      unsubStatus();
      unsubTelemetry();
      unsubLatency();
    };
  }, [ip]);

  const sendControl = useCallback((control: ESP32ControlMessage) => {
    return blackSunWS.sendControl(control);
  }, []);

  const reconnect = useCallback(() => {
    blackSunWS.connect();
  }, []);

  const connect = useCallback((targetIp?: string) => {
    blackSunWS.connect(targetIp);
    if (targetIp) {
      setIpState(targetIp);
    }
  }, []);

  const disconnect = useCallback(() => {
    blackSunWS.disconnect();
  }, []);

  const setIp = useCallback((newIp: string, reconnectImmediately = true) => {
    blackSunWS.setIp(newIp, reconnectImmediately);
    setIpState(newIp);
  }, []);

  const setAutoConnect = useCallback((enabled: boolean) => {
    blackSunWS.setAutoConnect(enabled);
    setAutoConnectState(enabled);
  }, []);

  return {
    status,
    isConnected: status === "connected",
    isConnecting: status === "connecting",
    isError: status === "error",
    latency,
    ip,
    url: blackSunWS.getUrl(),
    autoConnect,
    lastPayload,
    sendControl,
    reconnect,
    connect,
    disconnect,
    setIp,
    setAutoConnect,
  };
}
