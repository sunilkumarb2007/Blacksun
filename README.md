# BLACKSUN: Autonomous Survival System
> **Stationary Critical Motor Protection & Hardware Health Console**  
> *Zero-Cloud Autonomous Edge Protection • Embedded Diagnostic HMI*

---

![BLACKSUN Mission Control](public/favicon.ico)

```
// HARDWARE STATUS: OPERATIONAL
// SYSTEM BUS: 12.2V | 1.82A | 22.2W
// SURVIVAL MODE: STANDBY [CONFIDENCE 72%]
// NOT EVERY CRISIS HAS A NAME. BUT WE ARE READY FOR IT.
```

---

## ⚡ Overview

**BLACKSUN** is a production-quality industrial control software interface and embedded emergency-protection system designed for mission-critical stationary electric motors (industrial blowers, slurry pumps, centrifugal turbines, exhaust stations).

Unlike conventional cloud-tethered IoT systems that introduce network latency, vulnerability, and telemetry blind spots during crises, BLACKSUN operates with **100% edge autonomy**. All sensor acquisition, mathematical gradient extraction, multi-sensor correlation, and actuator trip logic execute deterministically within sub-100ms hardware loops on dual-core microcontrollers.

---

## 🛠 Hardware Architecture & Sensory Pipeline

```
[ INPUT TIER: SENSORS ]
  ├── DS18B20 Digital Temp Probe   ── GPIO 4 (1-Wire Bus)      ── Stator thermal profile
  ├── MPU-6050 6-DOF IMU           ── I2C SDA/SCL (0x68)       ── Harmonic resonance & vibration
  ├── INA219 DC Power Monitor      ── I2C SDA/SCL (0x40)       ── Rail voltage & system wattage
  └── ACS712-20A Hall Current      ── ADC1_CH4 (GPIO 32)       ── Armature current & stall surge
               │
               ▼
[ PROCESSING TIER: EDGE ENGINE ]
  └── ESP32 Dual-Core Xtensa @ 240MHz
        ├── Core 0: DMA Buffers, Telemetry Serialization & NRF24 RF Stack
        └── Core 1: Deterministic 50ms Survival Decision Engine Loop
               │
               ▼
[ OUTPUT TIER: ACTUATION & ISOLATION ]
  ├── BTS7960 43A Motor Driver    ── PWM: GPIO 25, 26, EN: 27  ── Soft-start / speed throttling
  ├── Optocoupled Safety Relay    ── GPIO 14 (Active LOW)      ── Galvanic power disconnect
  ├── 5V Turbo Fan                ── GPIO 13 via MOSFET Driver ── Active convective cooling
  ├── Piezo Acoustic Buzzer       ── GPIO 12 (LEDC Frequency)  ── Audible critical siren
  └── Dual Status Indicators      ── GPIO 16 (Amber) / GPIO 17 ── Visual status beacons
```

---

## 🧠 The 5-Stage Autonomous Survival Pipeline

BLACKSUN executes the continuous real-time decision loop:

$$\text{DETECT} \longrightarrow \text{SENSE} \longrightarrow \text{THINK} \longrightarrow \text{ADAPT} \longrightarrow \text{SURVIVE}$$

1. **DETECT:** Hardware interrupts and DMA sample buffers collect physical signals with zero CPU blocking.
2. **SENSE:** Mathematical moving averages compute rate of change ($\Delta T / \Delta t$) and harmonic peak RMS acceleration.
3. **THINK:** Multi-sensor correlation engine classifies operational hazard states (Nominal, Thermal Warning, Mechanical Resonance, Armature Overload, Full Cascade).
4. **ADAPT:** Deterministic rule matrix actuates emergency cooling, speed throttling, or galvanic relay isolation.
5. **SURVIVE:** The motor maintains operational equilibrium or failsafe shutdown with zero cloud dependency.

---

## 🖥 Application Console Navigation (9 Interactive Pages)

The BLACKSUN HMI console features 9 specialized industrial views:

- **`01 COMMAND CENTER`**: Main mission control overview with live clock, dual-tower NRF24 communication link, 6 real-time sensor sparklines, isometric stationary motor cross-section, decision matrix, and actuator toggles.
- **`02 LIVE TELEMETRY`**: Multi-channel waveform instrumentation with selectable rolling windows (`1m`, `5m`, `15m`, `Live`), threshold boundaries, and min/max/average calculations.
- **`03 MOTOR HEALTH`**: In-depth mechanical diagnostics, stator & rotor isometric CAD cross-section with golden cooling ribs, and thermal/mechanical/electrical stress degradation indices.
- **`04 SURVIVAL ENGINE`**: 5-stage interactive pipeline visualizer and 3-tier live decision tree trace.
- **`05 COMMUNICATION`**: NRF24L01+ point-to-point packet telemetry console with 32-byte binary payload schema inspector and carrier-loss simulation.
- **`06 EVENT LOG`**: Chronological audit trail with high-resolution timestamps, severity categorization (`INFO`, `WARNING`, `CRITICAL`), real-time search, and CSV export.
- **`07 SYSTEM ARCHITECTURE`**: Interactive schematic block diagram with clickable component pinouts and live signal states.
- **`08 DATA & VALIDATION`**: Hardware latency benchmarks (Detection: 32ms, Decision: 12ms, Actuation: 18ms, Total: <80ms) and test certifications for ISO compliance.
- **`09 SETTINGS`**: Non-volatile threshold configuration (persisted in `localStorage`) with factory reset protection.

---

## 🚨 Interactive Crisis Demo Simulator

Test embedded protection behavior using the floating **CRISIS DEMO** bar:
- **`00 NORMAL`**: Restores all parameters to nominal safe baseline.
- **`01 THERMAL EVENT`**: Simulates stator thermal runaway; activates turbo cooling fan, cuts heater cartridge.
- **`02 MOTOR VIBRATION`**: Injects harmonic bearing resonance; initiates speed damping and audible warning.
- **`03 MOTOR OVERLOAD`**: Simulates 3.2A armature surge; triggers optocoupled relay isolation within 38ms.
- **`04 RF FAILURE`**: Suppresses RF carrier; seamlessly transitions to `LOCAL AUTONOMY ACTIVE`.
- **`05 FULL CASCADE`**: Simultaneous catastrophic multi-sensor emergency shutdown.
- **`RESET TO REFERENCE IMAGE`**: Reverts telemetry precisely to the initial hardware reference state.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm`

### Installation & Run

```bash
# Clone repository
git clone https://github.com/sunilkumarb2007/Blacksun.git
cd Blacksun

# Install dependencies
npm install

# Launch local development console
npm run dev

# Build for production
npm run build
```

The console runs locally at `http://localhost:8080/`.

---

## 📋 License

Designed and developed for high-reliability mission-critical stationary motor protection.  
`AUTONOMOUS | RESILIENT | CONTINUOUS`
