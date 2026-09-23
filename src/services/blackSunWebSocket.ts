/**
 * BLACKSUN WebSocket Service
 * 
 * Reusable singleton WebSocket client connecting directly to ESP32 #1 Survival Core.
 * Default endpoint: ws://192.168.4.1:81
 * Zero cloud dependencies, zero external libraries.
 */

export const BLACKSUN_WS_URL =
  import.meta.env.VITE_BLACKSUN_WS_URL || "ws://192.168.4.1:81";

export interface ESP32TelemetryRaw {
  type?: string; // "telemetry"
  temperature?: number;
  voltage?: number;
  current?: number;
  power?: number;
  vibration?: number;
  motorSpeed?: number;
  fanSpeed?: number;
  motorOn?: boolean;
  fanOn?: boolean;
  heaterOn?: boolean;
  buzzerOn?: boolean;
  thermalSurvivalMode?: boolean;
  ds18b20OK?: boolean;
  ina219OK?: boolean;
  mpu6050OK?: boolean;
  manualMode?: boolean;
  crisisLevel?: "NORMAL" | "WARNING" | "CRITICAL" | string;
  systemState?: string;
  decision?: string;
  reason?: string;
  communication?: string;
  esp1Online?: boolean;
  uptime?: number;
  // Optional network metrics if supported
  latency?: number;
  rssi?: number;
  packetCount?: number;
  lostPackets?: number;
}

export interface ESP32ControlMessage {
  type: "control";
  motorSpeed?: number;
  fanSpeed?: number;
  heaterOn?: boolean;
  manualMode?: boolean;
  manualTemp?: number;
  manualVibration?: number;
  [key: string]: unknown;
}

export type WSConnectionStatus = "connecting" | "connected" | "disconnected";

type TelemetryListener = (data: ESP32TelemetryRaw) => void;
type StatusListener = (status: WSConnectionStatus) => void;

class BlackSunWebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private status: WSConnectionStatus = "disconnected";
  private telemetryListeners: Set<TelemetryListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private reconnectIntervalMs = 2500;
  private isExplicitlyClosed = false;

  constructor() {
    this.connect();
  }

  public connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isExplicitlyClosed = false;
    this.updateStatus("connecting");

    try {
      this.socket = new WebSocket(BLACKSUN_WS_URL);

      this.socket.onopen = () => {
        this.updateStatus("connected");
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && typeof parsed === "object") {
            this.notifyTelemetry(parsed as ESP32TelemetryRaw);
          }
        } catch {
          // Ignore malformed frames silently
        }
      };

      this.socket.onerror = () => {
        // Handled in onclose
      };

      this.socket.onclose = () => {
        this.updateStatus("disconnected");
        this.socket = null;
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch {
      this.updateStatus("disconnected");
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectIntervalMs);
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.updateStatus("disconnected");
  }

  public sendControl(command: ESP32ControlMessage): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }
    try {
      this.socket.send(JSON.stringify(command));
      return true;
    } catch {
      return false;
    }
  }

  public getStatus(): WSConnectionStatus {
    return this.status;
  }

  public isConnected(): boolean {
    return this.status === "connected";
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
