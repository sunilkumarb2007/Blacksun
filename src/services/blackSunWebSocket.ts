/**
 * BLACKSUN WebSocket Service
 * 
 * Reusable singleton WebSocket client connecting directly to ESP32 #1 Survival Core.
 * Supports configurable IP (phone hotspot DHCP assigned, e.g. 192.168.43.120:81)
 * Zero cloud dependencies, zero external libraries.
 */

import { ESP32TelemetryRaw, WSConnectionStatus } from "../types/telemetry";

export const DEFAULT_ESP32_IP = "192.168.43.120";
export const STORAGE_KEY_IP = "BLACKSUN_ESP32_IP";
export const STORAGE_KEY_AUTO_CONNECT = "BLACKSUN_AUTO_CONNECT";

export interface ESP32ControlMessage {
  type: "control" | "ping";
  motorSpeed?: number;
  fanSpeed?: number;
  heaterOn?: boolean;
  motorOn?: boolean;
  fanOn?: boolean;
  buzzerOn?: boolean;
  manualMode?: boolean;
  manualTemp?: number;
  manualVibration?: number;
  [key: string]: unknown;
}

type TelemetryListener = (data: ESP32TelemetryRaw) => void;
type StatusListener = (status: WSConnectionStatus) => void;
type LatencyListener = (latencyMs: number | null) => void;

class BlackSunWebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private staleCheckTimer: ReturnType<typeof setInterval> | null = null;

  private status: WSConnectionStatus = "disconnected";
  private currentIp: string;
  private autoConnect: boolean;
  private isExplicitlyClosed = false;

  private pingStartTime = 0;
  private lastLatency: number | null = null;
  private lastTelemetryTime = 0;

  private telemetryListeners: Set<TelemetryListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private latencyListeners: Set<LatencyListener> = new Set();

  private reconnectDelayMs = 3000;

  constructor() {
    // Read saved IP from localStorage or fallback
    let savedIp = DEFAULT_ESP32_IP;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_IP);
      if (stored && stored.trim()) {
        savedIp = stored.trim();
      }
    } catch {
      // ignore
    }
    this.currentIp = savedIp;

    // Read auto-connect preference
    let auto = true;
    try {
      const storedAuto = localStorage.getItem(STORAGE_KEY_AUTO_CONNECT);
      if (storedAuto !== null) {
        auto = storedAuto === "true";
      }
    } catch {
      // ignore
    }
    this.autoConnect = auto;

    // Start stale data watchdog
    this.startStaleWatchdog();

    // Auto connect on boot if enabled
    if (this.autoConnect) {
      this.connect();
    }
  }

  public getIp(): string {
    return this.currentIp;
  }

  public setIp(newIp: string, reconnectImmediately = true): void {
    const cleaned = newIp.trim().replace(/^ws:\/\//i, "").replace(/:81$/, "").replace(/\/$/, "");
    if (!cleaned) return;
    this.currentIp = cleaned;
    try {
      localStorage.setItem(STORAGE_KEY_IP, cleaned);
    } catch {
      // ignore
    }
    if (reconnectImmediately) {
      this.disconnect();
      this.connect();
    }
  }

  public isAutoConnect(): boolean {
    return this.autoConnect;
  }

  public setAutoConnect(enabled: boolean): void {
    this.autoConnect = enabled;
    try {
      localStorage.setItem(STORAGE_KEY_AUTO_CONNECT, String(enabled));
    } catch {
      // ignore
    }
    if (enabled && !this.isConnected()) {
      this.connect();
    }
  }

  public getUrl(): string {
    return `ws://${this.currentIp}:81`;
  }

  public getStatus(): WSConnectionStatus {
    return this.status;
  }

  public getState(): WSConnectionStatus {
    return this.status;
  }

  public isConnected(): boolean {
    return this.status === "connected";
  }

  public getLatency(): number | null {
    return this.lastLatency;
  }

  public connect(ip?: string): void {
    if (ip) {
      this.setIp(ip, false);
    }

    if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isExplicitlyClosed = false;
    this.updateStatus("connecting");

    const wsUrl = this.getUrl();
    console.log(`[BLACKSUN] Connecting to ${wsUrl}`);

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log(`[BLACKSUN] WebSocket connected to ${wsUrl}`);
        this.updateStatus("connected");
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        this.startPingHeartbeat();
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.lastTelemetryTime = Date.now();

          // Check if this is a pong response
          if (parsed && typeof parsed === "object") {
            if (parsed.type === "pong") {
              if (this.pingStartTime > 0) {
                const rtt = Math.round(performance.now() - this.pingStartTime);
                this.updateLatency(rtt);
                this.pingStartTime = 0;
              }
              return;
            }

            // If we sent a ping and received any valid frame from ESP32, compute RTT
            if (this.pingStartTime > 0) {
              const rtt = Math.round(performance.now() - this.pingStartTime);
              this.updateLatency(rtt);
              this.pingStartTime = 0;
            }

            // Normal telemetry payload
            this.notifyTelemetry(parsed as ESP32TelemetryRaw);
          }
        } catch {
          // Ignore non-JSON frames
        }
      };

      this.socket.onerror = () => {
        console.warn(`[BLACKSUN] WebSocket error on ${wsUrl}`);
        this.updateStatus("error");
      };

      this.socket.onclose = () => {
        console.log(`[BLACKSUN] WebSocket disconnected from ${wsUrl}`);
        this.updateStatus("disconnected");
        this.stopPingHeartbeat();
        this.socket = null;
        if (!this.isExplicitlyClosed && this.autoConnect) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      console.warn(`[BLACKSUN] Failed to initialize WebSocket:`, err);
      this.updateStatus("error");
      if (!this.isExplicitlyClosed && this.autoConnect) {
        this.scheduleReconnect();
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    console.log(`[BLACKSUN] Reconnecting in ${this.reconnectDelayMs}ms...`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectDelayMs);
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopPingHeartbeat();
    if (this.socket) {
      try {
        this.socket.close();
      } catch {
        // ignore
      }
      this.socket = null;
    }
    this.updateStatus("disconnected");
  }

  public send(command: ESP32ControlMessage): boolean {
    return this.sendControl(command);
  }

  public sendControl(command: ESP32ControlMessage): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }
    try {
      this.socket.send(JSON.stringify(command));
      console.log("[BLACKSUN] Command sent:", command);
      return true;
    } catch (err) {
      console.warn("[BLACKSUN] Failed to send control message:", err);
      return false;
    }
  }

  private startPingHeartbeat(): void {
    this.stopPingHeartbeat();
    // Heartbeat every 10 seconds (does not flood ESP32)
    this.pingTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.pingStartTime = performance.now();
        try {
          this.socket.send(JSON.stringify({ type: "ping" }));
        } catch {
          // ignore
        }
      }
    }, 10000);
  }

  private stopPingHeartbeat(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    this.pingStartTime = 0;
  }

  private startStaleWatchdog(): void {
    if (this.staleCheckTimer) return;
    this.staleCheckTimer = setInterval(() => {
      // If connected but no message received for 3000ms, mark stale or check
      if (this.status === "connected" && this.lastTelemetryTime > 0) {
        if (Date.now() - this.lastTelemetryTime > 3000) {
          // Data is stale
        }
      }
    }, 1000);
  }

  public subscribe(listener: TelemetryListener): () => void {
    return this.subscribeTelemetry(listener);
  }

  public unsubscribe(listener: TelemetryListener): void {
    this.telemetryListeners.delete(listener);
  }

  public subscribeTelemetry(listener: TelemetryListener): () => void {
    this.telemetryListeners.add(listener);
    return () => {
      this.telemetryListeners.delete(listener);
    };
  }

  public subscribeStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public subscribeLatency(listener: LatencyListener): () => void {
    this.latencyListeners.add(listener);
    listener(this.lastLatency);
    return () => {
      this.latencyListeners.delete(listener);
    };
  }

  private updateStatus(newStatus: WSConnectionStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusListeners.forEach((listener) => {
        try {
          listener(newStatus);
        } catch {
          // Keep subscribers safe
        }
      });
    }
  }

  private updateLatency(ms: number): void {
    this.lastLatency = ms;
    this.latencyListeners.forEach((listener) => {
      try {
        listener(ms);
      } catch {
        // Keep subscribers safe
      }
    });
  }

  private notifyTelemetry(data: ESP32TelemetryRaw): void {
    this.telemetryListeners.forEach((listener) => {
      try {
        listener(data);
      } catch {
        // Keep subscribers safe
      }
    });
  }
}

// Export singleton instance
export const blackSunWS = new BlackSunWebSocketService();
export const BLACKSUN_WS_URL = blackSunWS.getUrl();
