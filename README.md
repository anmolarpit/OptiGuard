# 🛡️ OptiGuard

### Zero-Trust Cyber-Physical Security & Behavioral Threat Detection Platform

> **Observe. Verify. Detect. Protect.**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ESP32](https://img.shields.io/badge/Hardware-ESP32-E7352C?logo=espressif&logoColor=white)](https://www.espressif.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**OptiGuard** is a next-generation **Zero-Trust security platform** designed to protect critical infrastructure and sensitive digital environments by combining **cyber-physical security, independent hardware verification, behavioral anomaly detection, machine learning, and real-time security monitoring**.

Instead of trusting software commands or user credentials alone, OptiGuard continuously evaluates both:
1. **The physical state of critical infrastructure** (Sensors, optical laser beams, circuit switching, and servo interlocks).
2. **The behavioral patterns of users interacting with sensitive digital resources** (Mouse movement vectors, dwell times, path directness, and access timing).

```text
┌─────────────────────────────────────────────────────────────────┐
│                           OPTIGUARD                             │
│          ZERO-TRUST CYBER-PHYSICAL SECURITY PLATFORM            │
├──────────────────────────────┬──────────────────────────────────┤
│                              │                                  │
│  PAGE 1                      │  PAGE 2                          │
│  PHYSICAL SECURITY           │  BEHAVIORAL SECURITY             │
│                              │                                  │
│  Zero-Trust Physical         │  Behavioral Anomaly              │
│  Override System             │  Detection                       │
│                              │                                  │
│  ESP32 + Sensors + Servo     │  ML + Navigation Analytics       │
│                              │                                  │
└──────────────────────────────┴──────────────────────────────────┘
```

---

## 📌 Table of Contents
- [🚨 Project Overview](#-project-overview)
- [⚠️ Problem Statement](#️-problem-statement)
- [💡 Our Solution](#-our-solution)
- [🏗️ System Architecture](#️-system-architecture)
- [🔐 Security Layers](#-security-layers)
  - [Layer 1 — Physical Security (Zero-Trust Override)](#layer-1--physical-security)
  - [Layer 2 — Behavioral Security (Anomaly Detection)](#layer-2--behavioral-security)
- [🧠 Behavioral Anomaly Detection](#-behavioral-anomaly-detection)
  - [Behavioral Feature Vector](#behavioral-feature-vector)
  - [Mouse Path Efficiency](#mouse-path-efficiency)
  - [Dwell-Time Analysis](#dwell-time-analysis)
  - [Isolation Forest Model](#behavioral-detection-model)
- [📊 Technology Stack](#-technology-stack)
- [📁 Folder Structure](#-folder-structure)
- [🖥️ Website Structure](#️-website-structure)
- [🛡️ Security Monitoring & Alert Management](#️-security-monitoring)
- [🔍 Session Replay & Privacy Principle](#-session-replay)
- [🔄 Unified Security Architecture](#-unified-security-architecture)
- [📈 Key Features](#-key-features)
- [🧪 Development Phases](#-development-phases)
- [🎯 Project Vision & Philosophy](#-project-vision)
- [👥 Team](#-team)
- [🚀 Getting Started](#-getting-started)
- [📄 License](#-license)

---

## 🚨 Project Overview

OptiGuard is designed around a simple security principle:

> **"Never trust software or user intent alone — independently verify behavior and physical reality."**

The platform combines two major security mechanisms:

* **Layer 1 — Zero-Trust Physical Override**: Protects smart-grid and industrial infrastructure by independently verifying the physical state of electrical equipment. If unauthorized software commands or cyber attacks are detected, OptiGuard activates an automated physical locking mechanism using an ESP32-controlled servo deadbolt.
* **Layer 2 — Behavioral Anomaly Detection**: Analyzes *how* users navigate sensitive digital resources, rather than relying only on *what* files they access. Identifies statistically unusual navigation behavior indicating insider threats, compromised accounts, or reconnaissance.

```text
       DIGITAL BEHAVIOR LEVEL  +  PHYSICAL CONTROL LEVEL
```

---

## ⚠️ Problem Statement

Modern critical infrastructure and enterprise systems increasingly depend on software-controlled environments. Smart grids, for example, rely heavily on SCADA systems to monitor and control substations and electrical switching equipment.

If an attacker compromises a SCADA system, they may be able to:
- Open or close circuit breakers remotely
- Cause repeated switching operations to destroy physical equipment
- Hide malicious activity from operators by falsifying software acknowledgments
- Trigger widespread blackout conditions

Traditional software-based security mechanisms become ineffective when the control software itself is compromised.

At the same time, organizations face **insider threats** where malicious actors use valid credentials to access sensitive records:
- **Traditional security asks:** *WHO is accessing the resource?* + *WHAT data is being accessed?*
- **OptiGuard introduces:** **HOW is the user behaving while navigating to the resource?**

---

## 💡 Our Solution

OptiGuard introduces an independent verification layer between **Digital Commands**, **User Behavior**, and **Physical Systems**:

```text
Software Command ──► Hardware State ──► Sensor Reading ──► Telemetry ──► Cryptographic Validation ──► Security Decision
```

1. **Zero-Trust Physical Override**: Continuous comparison between digital dispatch commands and physical sensors (Infrared, optical laser, relay feedback). Discrepancies immediately trigger a hardware-level lockdown.
2. **Behavioral Anomaly Detection**: Captures non-invasive mouse trajectory vectors, dwell time, and scroll-to-click ratios to detect reconnaissance before data exfiltration occurs.

---

## 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │      OPERATOR        │
                         │      DASHBOARD       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │  SPRING BOOT BACKEND │
                         │   REST + WebSocket   │
                         └──────────┬───────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
        ┌────────────────┐  ┌───────────────┐  ┌───────────────┐
        │   PostgreSQL   │  │ ESP32 Control │  │  Behavioral   │
        │    Database    │  │    System     │  │    Engine     │
        └────────────────┘  └───────┬───────┘  └───────┬───────┘
                                    │                  │
                           ┌────────┼────────┐         │
                           │        │        │         ▼
                           ▼        ▼        ▼   ┌──────────────┐
                         Sensor   Servo    Relay │  Isolation   │
                                                 │    Forest    │
                                                 └──────┬───────┘
                                                        │
                                                        ▼
                                                 Anomaly Score
                                                        │
                                                        ▼
                                                 Security Alert
```

---

## 🔐 Security Layers

### Layer 1 — Physical Security
#### Zero-Trust Physical Override System

* **Core Hardware Components**: ESP32 microcontroller, SG90 Servo Motor (Physical Lock), FC-51 Infrared / Optical Beam Sensors, Relay Modules, Status LEDs, Piezo Buzzer.
* **Operating Principle**:
```text
SCADA COMMAND ──► BACKEND VALIDATION ──► ESP32 CONTROLLER ──► SENSOR ──► PHYSICAL STATE ──► ZERO-TRUST VALIDATION
                                                                                                    │
                                                       ┌────────────────────┬───────────────────────┘
                                                       ▼                    ▼                       ▼
                                                     ALLOW                ALERT               PHYSICAL LOCK
```

### Layer 2 — Behavioral Security
#### Behavioral Anomaly Detection

Malicious insiders navigating toward target files exhibit distinct biometric indicators:
- Significantly more direct mouse paths (high path efficiency)
- Target hover hesitation and abnormal dwell times
- Low exploratory scrolling compared to baseline users
- Access outside normal working hours

```text
User Interaction ──► JS Event Stream ──► Feature Extraction ──► 10-D Vector ──► Isolation Forest ──► Anomaly Score ──► Alert
```

---

## 🧠 Behavioral Anomaly Detection

### Behavioral Feature Vector

| # | Feature Metric | Description |
| :-: | :--- | :--- |
| **1** | **Path Efficiency Ratio** | Ratio of Euclidean direct distance vs. actual mouse path length |
| **2** | **Dwell-Time Distribution** | Hover duration over target before click confirmation |
| **3** | **Scroll-Before-Click Count** | Amount of exploratory scroll events during navigation |
| **4** | **Time-of-Day Deviation** | Difference from standard operational business hours |
| **5** | **File Sensitivity Score** | Weight classification of accessed asset (Normal / Confidential / Critical) |
| **6** | **Session Duration vs Access** | Interaction time relative to number of items accessed |
| **7** | **Repeat Visit Pattern** | Frequency of access to specific high-value nodes |
| **8** | **Navigation Depth** | Directory tree level traversed |
| **9** | **Copy-Paste Ratio** | Clipboard interaction frequency |
| **10** | **Download vs View Ratio** | Direct retrieval vs in-browser preview |

### Mouse Path Efficiency Formula

$$\text{Path Efficiency} = \frac{\text{Direct Euclidean Distance } (d_{\text{straight}})}{\text{Actual Mouse Path Trajectory Length } (d_{\text{actual}})}$$

* Higher values ($> 0.85$) indicate robotic or premeditated direct targeting.
* Baseline human browsing exhibits natural curvature ($0.45 - 0.70$).

### Dwell-Time Reference Analysis

| User Behavior Profile | Typical Dwell Time | Path Characteristics |
| :--- | :---: | :--- |
| **Innocent / Baseline User** | `0.30s – 0.80s` | Wandering, curved exploration paths, natural scrolling |
| **Reconnaissance / Impostor** | `1.20s – 3.40s` | Direct targeting, long target pause, zero exploratory scroll |

### Behavioral Detection Model

```text
Normal Baseline Sessions ──► Isolation Forest Model ──► Unsupervised Clustering
                                                               │
Incoming User Session ──────► Feature Extraction ──────────────┴──► Anomaly Score (0.0 - 1.0)
                                                                           │
                                           ┌───────────────────────────────┴───────────────────────────────┐
                                           ▼                                                               ▼
                              Score < 0.65 : NORMAL                                          Score ≥ 0.65 : SUSPICIOUS (SOC Alert)
```

---

## 📊 Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend Core** | React 19, TypeScript 5.8, Vite 6 |
| **3D & Graphics** | Three.js (WebGL 3D Perimeter Twin), HTML5 Canvas 2D |
| **Styling & UI** | Tailwind CSS v4, Lucide React, Framer Motion |
| **Audio & Logic** | Web Audio API Synthesizer, Fitts's Law Biometric Algorithms |
| **AI Integration** | Google Gemini GenAI SDK |
| **Backend** | Java 21, Spring Boot (REST & WebSocket) |
| **Database** | PostgreSQL |
| **Embedded Hardware** | ESP32 (MicroPython / C++) |
| **Deployment** | Vercel (Frontend), Docker / Cloud |
| **Development Tools** | Node.js, Bun, Git, GitHub, Maven, Postman |

---

## 📁 Folder Structure

```text
Optiguard-2/
│
├── 📁 assets/                              # Static project media assets
│
├── 📁 src/                                 # Main Frontend Application Source Code
│   ├── 📄 main.tsx                         # React entry point
│   ├── 📄 App.tsx                          # Root dashboard controller & layout switcher
│   ├── 📄 index.css                        # Global styles, SCADA scanlines & theme tokens
│   ├── 📄 types.ts                         # System telemetry & sensor data schemas
│   │
│   ├── 📁 components/                      # UI Components Layer
│   │   ├── 📄 TopCommandBar.tsx            # Header command bar with simulators & status
│   │   │
│   │   ├── 📁 3d/                          # 3D Digital Twin Module
│   │   │   └── 📄 PerimeterTwinPanel.tsx   # Interactive 3D perimeter canvas with optical beams
│   │   │
│   │   ├── 📁 anomaly/                     # Behavioral Anomaly Detection Module
│   │   │   ├── 📄 AnomalyDetectionPanel.tsx # Dual file explorer UI & trajectory canvas
│   │   │   ├── 📄 choreographyEngine.ts    # Biometric scoring algorithms & Fitts's law
│   │   │   ├── 📄 anomalyDetection.css     # Clean white theme styling for anomaly dashboard
│   │   │   └── 📄 types.ts                 # Biometric vector coordinate schemas
│   │   │
│   │   ├── 📁 telemetry/                   # Real-Time Telemetry Module
│   │   │   └── 📄 TelemetryFeedPanel.tsx   # Optical sensor readings & power gauges
│   │   │
│   │   ├── 📁 controls/                    # SCADA Manual Override Module
│   │   │   └── 📄 ManualOverridePanel.tsx  # Physical lockdown & threshold controls
│   │   │
│   │   └── 📁 logs/                        # Threat Feed & Audit Logs Module
│   │       └── 📄 LogsThreatPanel.tsx      # Real-time breach events & incident logs
│   │
│   └── 📁 services/                        # Service & Engine Layer
│       └── 📄 telemetryEngine.ts           # Web Audio API synthesizer & telemetry streams
│
├── 📁 firmware/                            # ESP32 Microcontroller Firmware
│   ├── 📄 main.py                          # MicroPython sensor loop & Wi-Fi broadcast
│   ├── 📄 boot.py                          # Network initialization
│   └── 📄 config.py                        # Pin configurations & broker URLs
│
├── 📄 index.html                           # Root HTML document
├── 📄 package.json                         # Project dependencies & scripts
├── 📄 package-lock.json                    # Dependency lockfile
├── 📄 tsconfig.json                        # TypeScript configuration
├── 📄 vite.config.ts                       # Vite bundler configuration
├── 📄 vercel.json                          # Vercel deployment routing
├── 📄 .gitignore                           # Git ignore rules
└── 📄 .env.example                         # Environment variables template
```

---

## 🖥️ Website Structure

The OptiGuard dashboard provides two interconnected security views:

1. **Page 1 — Physical Security (SCADA Dashboard)**:
   - Real-time 3D Digital Twin perimeter visualization
   - Sensor telemetry gauges (voltage, optical power, laser alignment)
   - SCADA manual overrides and physical lockdown triggers
   - Live threat feed and immutable audit logs
2. **Page 2 — Behavioral Security (Anomaly Detection Dashboard)**:
   - Live interactive dual-session file explorer (Baseline vs. Impostor)
   - Real-time 2D mouse trajectory path recording
   - Fitts's Law directness analysis and dwell-time breakdown
   - 5-Dimensional biometric feature vector comparison chart
   - Instant SOC risk classification and escalation recommendations

---

## 🛡️ Security Monitoring & Alert Management

```text
┌─────────────────────────────────────────────────────────────┐
│                       SECURITY CENTER                       │
├──────────────────────────────┬──────────────────────────────┤
│ Physical Threats             │ Behavioral Threats           │
│ ───────────────────────────  │ ───────────────────────────  │
│ • SCADA Command Discrepancy  │ • High Path Directness       │
│ • Hardware-State Mismatch    │ • Target Recon Dwell Time    │
│ • Optical Laser Beam Break   │ • Off-Hours File Access      │
│ • Servo Deadbolt Activation  │ • Impersonator Score ≥ 65%   │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 🔍 Session Replay & Privacy Principle

When suspicious behavioral activity is detected, OptiGuard generates an incident replay showing mouse movement trajectories, click timestamps, and dwell periods.

> [!IMPORTANT]
> **Privacy-First Architecture**: OptiGuard never captures private document contents, keystrokes, or passwords. It exclusively analyzes non-invasive **navigation metadata** (coordinates, time deltas, and interaction vectors).

---

## 🔄 Unified Security Architecture

```text
                         ┌───────────────┐
                         │   OPTIGUARD   │
                         └───────┬───────┘
                                 │
              ┌──────────────────┴──────────────────┐
              │                                     │
              ▼                                     ▼
      ┌──────────────────┐                 ┌──────────────────┐
      │ PHYSICAL SECURITY│                 │ BEHAVIORAL       │
      │                  │                 │ SECURITY         │
      └────────┬─────────┘                 └────────┬─────────┘
               │                                    │
               ▼                                    ▼
        SCADA Commands                       User Navigation
               │                                    │
               ▼                                    ▼
        ESP32 Controller                     Event Collection
               │                                    │
       ┌───────┼────────┐                           ▼
       ▼       ▼        ▼                    Feature Extraction
      IR     Servo    Relay                         │
    Sensor    Lock    Control                       ▼
       │       │        │                    Isolation Forest
       └───────┼────────┘                           │
               │                                    ▼
               ▼                              Anomaly Score
        Physical State                              │
               │                                    ▼
               ▼                              Security Alert
       Zero-Trust Engine                            │
               │                                    │
               └────────────────┬───────────────────┘
                                ▼
                         ┌──────────────┐
                         │  OPTIGUARD   │
                         │SECURITY CORE │
                         └──────┬───────┘
                                │
                 ┌──────────────┼──────────────┐
                 ▼              ▼              ▼
             Dashboard       Alerts          SIEM
```

---

## 📈 Key Features

- ✅ **Zero-Trust Physical Verification**: Hardware sensors cross-check software states before execution.
- ✅ **Servo-Actuated Physical Lockout**: Hardware deadbolt trips independently during unauthorized intrusion.
- ✅ **Interactive 3D Digital Twin**: Three.js WebGL visualization of perimeter laser barriers.
- ✅ **Behavioral Navigation Analytics**: Real-time evaluation of cursor trajectories and target dwell times.
- ✅ **Real-Time Audio Synthesis**: Web Audio API generated industrial alarm feedback.
- ✅ **Seamless SOC Alerting**: Automated incident IDs, confidence scoring, and escalation triggers.
- ✅ **Zero Content Logging**: Fully compliant metadata-only tracking preserving user data privacy.

---

## 🧪 Development Phases

- **Phase 1 — Architecture & Setup**: Repository setup, frontend layout, ESP32 hardware blueprint, and data schemas.
- **Phase 2 — Sensor & Data Layer**: Database entity modeling, audit logging pipelines, and telemetry streaming.
- **Phase 3 — Real-Time Telemetry**: WebSocket pub/sub integration connecting physical sensors to live dashboard gauges.
- **Phase 4 — Zero-Trust Physical Engine**: Hardware discrepancy detection and servo lock automation.
- **Phase 5 — Behavioral Anomaly Detection**: Live canvas trajectory capture, Fitts's law modeling, and Isolation Forest scoring.
- **Phase 6 — Full Integration & Deployment**: End-to-end testing, Vercel cloud deployment, and final demonstration.

---

## 🎯 Project Vision

OptiGuard demonstrates how modern cyber-physical security must unify:
$$\text{Secure Software} + \text{Hardware Verification} + \text{Real-Time Telemetry} + \text{Behavioral ML}$$

```text
        OBSERVE ──► VERIFY ──► ANALYZE ──► DETECT ──► RESPOND ──► PROTECT
```

---

## 👥 Team

| Team Member | Core Responsibility |
| :--- | :--- |
| **Anmol Arpit** | Spring Boot, PostgreSQL, APIs & Backend Integration |
| **Preeti Mitra** | Dashboard UI & Frontend Architecture |
| **Anirban Biswas** | ESP32 Firmware & Hardware Communication |
| **Priyanka Dutta Banik** | Sensors, Relay & Servo Motor Integration |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+) or **Bun**
- **Git**
- *(Optional for Backend)*: Java 21 & Maven
- *(Optional for Hardware)*: Thonny IDE / ESP32 Microcontroller

### 1. Clone the Repository
```bash
git clone https://github.com/anirban8007/OPTIGUARD.git
cd OPTIGUARD
```

### 2. Install Dependencies & Run Frontend
```bash
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 📄 License

This project is licensed under the **MIT License** — see the LICENSE file for details.

---

<div align="center">
  <b>🛡️ OptiGuard — Observe. Verify. Detect. Protect.</b><br>
  <i>Zero-Trust Cyber-Physical Security + Behavioral Threat Detection</i>
</div>
