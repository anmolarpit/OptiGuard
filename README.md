# OptiGuard

## Zero-Trust Cyber-Physical Security & Behavioral Threat Detection Platform

OptiGuard is a next-generation security platform designed to protect critical infrastructure and sensitive digital environments through a combination of:

- Zero-Trust Physical Verification
- Cyber-Physical Security
- Independent Hardware Validation
- Behavioral Anomaly Detection
- Real-Time Telemetry Monitoring
- Machine Learning
- Security Event Monitoring
- Audit Logging
- Real-Time Alerting

Instead of trusting software commands or user credentials alone, OptiGuard continuously evaluates both the **physical state of critical infrastructure** and the **behavioral patterns of users interacting with sensitive digital resources**.

The platform therefore operates across two complementary security layers:

```text
┌─────────────────────────────────────────────────────────────┐
│                       OPTIGUARD                             │
│        ZERO-TRUST CYBER-PHYSICAL SECURITY PLATFORM          │
├─────────────────────────────┬───────────────────────────────┤
│                             │                               │
│   PAGE 1                    │   PAGE 2                      │
│   Physical Security         │   Behavioral Security         │
│                             │                               │
│   Zero-Trust Physical       │   Behavioral Anomaly          │
│   Override System           │   Detection                   │
│                             │                               │
│   ESP32 + Sensors + Servo   │   ML + Navigation Analytics   │
│                             │                               │
└─────────────────────────────┴───────────────────────────────┘
#Tech Stack
Optiguard-2/
│
├── 📁 assets/                              # Static project media assets
│
├── 📁 src/                                 # Main Frontend Application Source Code
│   ├── 📄 main.tsx                         # React application entry point (DOM mount)
│   ├── 📄 App.tsx                          # Root dashboard controller & layout switcher
│   ├── 📄 index.css                        # Global CSS, SCADA CRT scanlines & theme variables
│   ├── 📄 types.ts                         # System telemetry, state, & sensor data contracts
│   │
│   ├── 📁 components/                      # UI Components Layer
│   │   │
│   │   ├── 📄 TopCommandBar.tsx            # Header bar with system status, sound, simulators & view switcher
│   │   │
│   │   ├── 📁 3d/                          # 3D Digital Twin Module
│   │   │   └── 📄 PerimeterTwinPanel.tsx   # Interactive 3D perimeter canvas with optical laser beams
│   │   │
│   │   ├── 📁 anomaly/                     # Insider Threat & Biometrics Anomaly Detection Module
│   │   │   ├── 📄 AnomalyDetectionPanel.tsx # Live dual file explorer UI & trajectory canvas
│   │   │   ├── 📄 choreographyEngine.ts    # Biometric scoring algorithms & Fitts's law calculations
│   │   │   ├── 📄 anomalyDetection.css     # Clean white theme styling for anomaly dashboard
│   │   │   └── 📄 types.ts                 # Anomaly vector coordinates & session interfaces
│   │   │
│   │   ├── 📁 telemetry/                   # Real-time Telemetry Gauges Module
│   │   │   └── 📄 TelemetryFeedPanel.tsx   # Optical sensor readings, power metrics & health gauges
│   │   │
│   │   ├── 📁 controls/                    # SCADA Manual Override Module
│   │   │   └── 📄 ManualOverridePanel.tsx  # Physical lockdown, laser calibration, & threshold controls
│   │   │
│   │   └── 📁 logs/                        # Threat Intelligence & Audit Logs Module
│   │       └── 📄 LogsThreatPanel.tsx      # Real-time threat feed, breach events & incident logs
│   │
│   └── 📁 services/                        # Logic & Audio Synthesis Engine
│       └── 📄 telemetryEngine.ts           # Web Audio API sound synthesizer & telemetry generator
│
├── 📁 firmware/ (Optional)                 # Hardware / ESP32 MicroPython scripts (main.py, boot.py)
│
├── 📄 index.html                           # Root HTML document
├── 📄 package.json                         # Project dependencies, scripts & metadata
├── 📄 package-lock.json                    # Exact dependency lockfile
├── 📄 tsconfig.json                        # TypeScript compiler options
├── 📄 vite.config.ts                       # Vite bundler & dev server configuration
├── 📄 vercel.json                          # Vercel deployment routing configuration
├── 📄 .gitignore                           # Git ignore rules (ignores node_modules & dist)
└── 📄 .env.example                         # Environment variables template


1. Project Overview

OptiGuard is designed around the principle:

Never trust software or user intent alone — independently verify behavior and physical reality.

The platform combines two security mechanisms.

Layer 1 — Zero-Trust Physical Override

Protects smart-grid and industrial infrastructure by independently verifying the physical state of electrical equipment.

The system continuously compares:

Software Commands
Physical Sensor Readings
Hardware State
Cryptographic Authentication

If suspicious or unauthorized activity is detected, OptiGuard can activate a physical locking mechanism using an ESP32-controlled servo motor.

Layer 2 — Behavioral Anomaly Detection

Analyzes how users navigate sensitive digital resources, rather than relying only on what files they access.

The system identifies statistically unusual navigation behavior that may indicate reconnaissance or malicious insider activity.

These two layers allow OptiGuard to detect threats at both the:

DIGITAL BEHAVIOR LEVEL
        +
PHYSICAL CONTROL LEVEL
2. Problem Statement

Modern critical infrastructure and enterprise systems increasingly rely on software-controlled environments.

In smart grids, SCADA systems can remotely control substations and circuit breakers.

If an attacker compromises a SCADA system, they may:

Open or close circuit breakers remotely
Cause repeated switching operations
Damage electrical equipment
Trigger widespread power outages
Hide malicious activity from operators

Traditional software firewalls become ineffective once the control system itself has been compromised.

At the same time, organizations face insider threats where legitimate users may use valid credentials to access sensitive information.

Traditional security systems generally focus on:

WHO is accessing the resource?
WHAT data is being accessed?

OptiGuard adds another question:

HOW is the user behaving while accessing the resource?

This enables the system to detect behavioral patterns associated with reconnaissance before potential data exfiltration occurs.

3. Our Solution

OptiGuard introduces an independent security layer between digital commands, user behavior and physical systems.

The platform operates through two major modules.

Module 1 — Zero-Trust Physical Override System

Instead of trusting digital commands alone, OptiGuard continuously compares:
Software Command
       ↓
Hardware State
       ↓
Physical Sensor Reading
       ↓
Telemetry
       ↓
Cryptographic Validation
       ↓
Security Decision

35. Project Vision

OptiGuard demonstrates how modern cyber-physical security can combine:

SECURE SOFTWARE
        +
INDEPENDENT HARDWARE VERIFICATION
        +
REAL-TIME TELEMETRY
        +
BEHAVIORAL MACHINE LEARNING
        +
CONTINUOUS SECURITY MONITORING

into a unified Zero-Trust security platform.

The long-term vision is to create a security architecture capable of protecting both:

Critical Physical Infrastructure

and

Sensitive Digital Environments

by continuously validating not only:

What the system is commanded to do

but also:

What the physical system is actually doing

and:

How users are behaving while interacting with sensitive resources.

OptiGuard
Observe. Verify. Detect. Protect.

Zero-Trust Cyber-Physical Security + Behavioral Threat Detection


### Important integration change

I would recommend presenting the second page in the actual website as **“Behavioral Security”** or **“Behavioral Anomaly Detection”**, rather than calling it *NaviThreat*. The material you supplied uses “NaviThreat” inside the differentiation section, but the rest of your project is branded **OptiGuard**. Keeping NaviThreat would make it look like a separate product.

The resulting website concept becomes particularly strong:

**Page 1:** 🛡️ **Zero-Trust Physical Security** — ESP32 + sensor + servo + SCADA + physical override

**Page 2:** 🧠 **Behavioral Anomaly Detection** — mouse/navigation telemetry + Isolation Forest + anomaly score + session replay

This gives OptiGuard a much broader security story: **it protects both the physical infrastructure and the human/digital interaction layer.**

