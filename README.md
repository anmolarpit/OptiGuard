# 🛡️ OptiGuard

## Zero-Trust Cyber-Physical Security & Behavioral Threat Detection Platform

> **Observe. Verify. Detect. Protect.**

OptiGuard is a next-generation **Zero-Trust security platform** designed to protect critical infrastructure and sensitive digital environments by combining **cyber-physical security, independent hardware verification, behavioral anomaly detection, machine learning, and real-time security monitoring**.

Instead of trusting software commands or user credentials alone, OptiGuard continuously evaluates both:

- The **physical state of critical infrastructure**
- The **behavioral patterns of users interacting with sensitive digital resources**

This creates two complementary security layers:

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
📌 Table of Contents
Project Overview
Problem Statement
Our Solution
System Architecture
Security Layers
Physical Security
Behavioral Security
Technology Stack
Folder Structure
Key Features
Behavioral Detection
Hardware Architecture
Website Structure
Development Phases
Project Vision
Team
Getting Started
License

🚨 Project Overview

OptiGuard is designed around a simple security principle:

Never trust software or user intent alone — independently verify behavior and physical reality.

The platform combines two major security mechanisms.

Layer 1 — Zero-Trust Physical Override

Protects smart-grid and industrial infrastructure by independently verifying the physical state of electrical equipment.

The system continuously evaluates:

Software commands
Physical sensor readings
Hardware state
Cryptographic authentication
Real-time telemetry

If suspicious or unauthorized activity is detected, OptiGuard can activate a physical locking mechanism using an ESP32-controlled servo motor.

Layer 2 — Behavioral Anomaly Detection

Analyzes how users navigate sensitive digital resources, rather than relying only on what files they access.

The system identifies statistically unusual navigation behavior that may indicate:

Reconnaissance
Malicious insider activity
Suspicious resource access
Potential data-exfiltration preparation

Together, the two layers provide security at both:

DIGITAL BEHAVIOR LEVEL
          +
PHYSICAL CONTROL LEVEL
⚠️ Problem Statement

Modern critical infrastructure and enterprise systems increasingly depend on software-controlled environments.

Smart grids, for example, rely heavily on SCADA systems to monitor and control substations and electrical switching equipment.

If an attacker compromises a SCADA system, they may be able to:

Open or close circuit breakers remotely
Cause repeated switching operations
Damage electrical equipment
Trigger widespread power outages
Hide malicious activity from operators

Traditional software-based security mechanisms can become ineffective when the control system itself has been compromised.

At the same time, organizations face insider threats where legitimate users may use valid credentials to access sensitive information.

Traditional security systems generally focus on:

WHO is accessing the resource?
             +
WHAT data is being accessed?

OptiGuard introduces an additional security question:

HOW is the user behaving while accessing the resource?

This allows OptiGuard to identify behavioral patterns that may indicate reconnaissance or suspicious activity.

💡 Our Solution

OptiGuard introduces an independent security layer between:

DIGITAL COMMANDS
       +
USER BEHAVIOR
       +
PHYSICAL SYSTEMS

The platform operates through two major modules.

1. Zero-Trust Physical Override

Instead of trusting digital commands alone, OptiGuard continuously compares:

Software Command
       ↓
Hardware State
       ↓
Physical Sensor Reading
       ↓
Real-Time Telemetry
       ↓
Cryptographic Validation
       ↓
Security Decision

If the system detects suspicious or unauthorized activity, it can activate a physical locking mechanism through an ESP32-controlled servo.

2. Behavioral Anomaly Detection

OptiGuard analyzes how users interact with sensitive digital resources.

Instead of examining only what a user accesses, the system analyzes how the user navigates.

Behavioral signals can include:

Mouse movement
Mouse path efficiency
Dwell time
Scroll behavior
Click behavior
Navigation depth
Time-of-day deviation
Repeat visits
Copy-paste metadata
Download-versus-view behavior

These behavioral characteristics are processed by a machine-learning anomaly detection system.

🏗️ System Architecture
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
                         Sensor   Servo    Relay │ Isolation    │
                                                  │   Forest     │
                                                  └──────┬───────┘
                                                         │
                                                         ▼
                                                  Anomaly Score
                                                         │
                                                         ▼
                                                  Security Alert
🔐 Security Layers
Layer 1 — Physical Security
Zero-Trust Physical Override System

The physical security layer protects smart-grid and industrial infrastructure.

Core Components
ESP32
SG90 Servo Motor
FC-51 Infrared Sensor
Toggle / Physical Switch
Relay Module
Status LEDs
Buzzer
Operating Principle
SCADA COMMAND
      ↓
BACKEND VALIDATION
      ↓
ESP32 CONTROLLER
      ↓
PHYSICAL SENSOR
      ↓
PHYSICAL STATE
      ↓
ZERO-TRUST VALIDATION
      ↓
SECURITY DECISION
      ↓
┌───────────────┬────────────────┐
│               │                │
▼               ▼                ▼
ALLOW          ALERT          PHYSICAL LOCK
Layer 2 — Behavioral Security
Behavioral Anomaly Detection

The second security layer analyzes user navigation behavior.

Malicious insiders navigating toward sensitive files may exhibit different behavioral patterns from ordinary users.

Potential indicators include:

More direct mouse paths
Reduced hesitation
Unusual scroll-to-click ratios
Longer dwell on sensitive file names
Off-hours navigation
Unusual navigation depth
Repeated visits to sensitive resources

The behavioral pipeline is:

User Interaction
       ↓
JavaScript Event Collection
       ↓
Feature Extraction
       ↓
10-Dimensional Feature Vector
       ↓
Isolation Forest
       ↓
Anomaly Score
       ↓
Risk Classification
       ↓
Security Alert
       ↓
SIEM / Security Team
🧠 Behavioral Anomaly Detection
Core Concept

OptiGuard analyzes the behavioral choreography of navigation rather than relying only on file-access permissions.

The system learns normal navigation behavior and identifies sessions that significantly deviate from the learned baseline.

Behavioral Feature Vector

Each navigation session can generate a 10-dimensional feature vector:

#	Feature
1	Path efficiency ratio
2	Dwell-time distribution
3	Scroll-before-click count
4	Time-of-day deviation
5	File sensitivity score
6	Session duration vs. file access count
7	Repeat visit pattern
8	Navigation depth
9	Copy-paste ratio
10	Download vs. view ratio
Mouse Path Efficiency

Mouse path efficiency can be represented conceptually as:

Path Efficiency =
Direct Path Distance
────────────────────────
Actual Mouse Path Distance

A higher value indicates increasingly direct navigation toward the target.

Dwell-Time Analysis

Dwell time measures how long a user's pointer remains over a file or sensitive resource before interaction.

Reference ranges used in the project specification:

Behavior	Dwell Time
Innocent navigation	0.3–0.8 seconds
Reconnaissance reference range	1.2–3.4 seconds

These values should be treated as project reference targets and calibrated against actual collected data.

Behavioral Detection Model

OptiGuard uses an Isolation Forest approach for unsupervised anomaly detection.

Normal User Sessions
        ↓
Isolation Forest
        ↓
Learn Behavioral Baseline
        ↓
New User Session
        ↓
Feature Extraction
        ↓
Anomaly Score
        ↓
┌───────────────┬────────────────┐
│               │                │
▼               ▼                ▼
NORMAL        ELEVATED       SUSPICIOUS
                                  │
                                  ▼
                           Security Alert
📊 Technology Stack
Category	Technologies
Frontend Core	React 19, TypeScript 5.8, Vite 6
3D & Graphics	Three.js, WebGL, HTML5 Canvas 2D
Styling & UI	Tailwind CSS v4, Lucide React, Framer Motion
Audio & Logic	Web Audio API, Fitts's Law-based behavioral algorithms
AI Integration	Google Gemini GenAI SDK
Backend	Java 21, Spring Boot
Database	PostgreSQL
Real-Time Communication	WebSocket
Embedded Hardware	ESP32
Firmware	MicroPython / C++
Deployment	Vercel
Runtime / Tools	Node.js / Bun, Git, GitHub, Maven, Postman
📁 Folder Structure
Optiguard-2/
│
├── 📁 assets/
│
├── 📁 src/
│   ├── 📄 main.tsx
│   ├── 📄 App.tsx
│   ├── 📄 index.css
│   ├── 📄 types.ts
│   │
│   ├── 📁 components/
│   │   │
│   │   ├── 📄 TopCommandBar.tsx
│   │   │
│   │   ├── 📁 3d/
│   │   │   └── 📄 PerimeterTwinPanel.tsx
│   │   │
│   │   ├── 📁 anomaly/
│   │   │   ├── 📄 AnomalyDetectionPanel.tsx
│   │   │   ├── 📄 choreographyEngine.ts
│   │   │   ├── 📄 anomalyDetection.css
│   │   │   └── 📄 types.ts
│   │   │
│   │   ├── 📁 telemetry/
│   │   │   └── 📄 TelemetryFeedPanel.tsx
│   │   │
│   │   ├── 📁 controls/
│   │   │   └── 📄 ManualOverridePanel.tsx
│   │   │
│   │   └── 📁 logs/
│   │       └── 📄 LogsThreatPanel.tsx
│   │
│   └── 📁 services/
│       └── 📄 telemetryEngine.ts
│
├── 📁 firmware/
│   └── ESP32 firmware
│
├── 📄 index.html
├── 📄 package.json
├── 📄 package-lock.json
├── 📄 tsconfig.json
├── 📄 vite.config.ts
├── 📄 vercel.json
├── 📄 .gitignore
└── 📄 .env.example
🖥️ Website Structure

The OptiGuard website is divided into two primary security pages.

Page 1 — Physical Security
Zero-Trust Physical Security Dashboard

The dashboard provides:

SCADA monitoring
Hardware status
ESP32 status
Sensor telemetry
Servo-lock status
Physical override
Security events
Audit logs
Real-time alerts
3D physical-system visualization
Page 2 — Behavioral Security
Behavioral Anomaly Detection Dashboard

The dashboard provides:

Live behavioral monitoring
Navigation analytics
Anomaly score
Risk classification
Mouse-path visualization
Dwell-time analysis
Navigation timeline
Behavioral feature analysis
Session replay
Security alerts
ML model status
🖥️ Recommended Navigation
OPTIGUARD
│
├── Dashboard
│
├── Physical Security
│   ├── SCADA Monitoring
│   ├── Hardware Status
│   ├── Telemetry
│   └── Physical Override
│
├── Behavioral Security
│   ├── Behavioral Dashboard
│   ├── Live Session
│   ├── Anomaly Detection
│   ├── Session Replay
│   └── Behavioral Analytics
│
├── Security Center
│
├── Events & Alerts
│
├── Devices
│
└── System Configuration
📡 Real-Time Telemetry

OptiGuard supports real-time monitoring of physical security components.

Telemetry may include:

ESP32 status
Infrared sensor state
Servo position
Relay state
Physical switch state
Security status
Alert status
Timestamp
Device connectivity

WebSocket communication can be used to provide live updates to the dashboard.

🛡️ Security Monitoring

The Security Center should provide a unified view of:

┌──────────────────────────────────────────────┐
│              SECURITY CENTER                 │
├──────────────────────────────────────────────┤
│ Physical Threats       Behavioral Threats    │
│ ─────────────────      ──────────────────    │
│ SCADA Commands         Anomaly Score         │
│ Hardware State         Navigation Pattern   │
│ Sensor Status          Dwell Time            │
│ Servo Lock             Path Efficiency       │
│ Relay State            Session Behavior      │
└──────────────────────────────────────────────┘
🔔 Alert Management

OptiGuard should support real-time security alerts for:

Physical Security
Unauthorized command
Hardware-state mismatch
Unexpected sensor state
Unauthorized switching
Physical override activation
Device disconnection
Behavioral Security
Anomalous navigation
Sensitive-resource reconnaissance
Unusual access time
Abnormal navigation depth
Suspicious download behavior
High anomaly score
🔍 Session Replay

When suspicious behavioral activity is detected, OptiGuard should provide a session-replay interface.

The replay can visualize:

Mouse movement path
Click locations
Scroll events
Navigation sequence
Dwell periods
Access timestamps
Download/view events
Privacy Principle

The system should collect behavioral metadata without collecting:

❌ File Contents
❌ Passwords
❌ Raw Keystrokes
❌ Private Document Content

Instead, it should collect:

✓ Navigation Metadata
✓ Mouse Movement Metadata
✓ Scroll Metadata
✓ Timing Metadata
✓ Access Metadata
🔄 Unified Security Architecture

The complete OptiGuard platform combines both security layers:

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
📈 Key Features
Physical Security
Zero-Trust Security Architecture
Independent Hardware Verification
Physical Deadbolt Protection
Real-Time Telemetry
ESP32 Integration
Servo-Controlled Physical Lock
Infrared Sensor
Relay Control
Hardware-State Validation
SCADA Command Validation
Behavioral Security
Behavioral Anomaly Detection
Mouse Movement Analysis
Dwell-Time Analysis
Navigation Pattern Analysis
Scroll-to-Click Analysis
Navigation Depth Analysis
Time-of-Day Analysis
Repeat Visit Detection
Download/View Analysis
Copy-Paste Metadata Analysis
Session Replay
Isolation Forest
SIEM Alert Integration
Platform
Live Dashboard
REST API
WebSocket-Based Updates
PostgreSQL Database
Audit Logging
Alert Management
Security Event Management
Real-Time Monitoring
3D Visualization
🧪 Development Phases
Phase 1 — Architecture & Project Setup
Repository structure
Backend initialization
Frontend initialization
PostgreSQL configuration
ESP32 architecture
Behavioral analytics architecture
Phase 2 — Database & Data Layer
PostgreSQL schema
JPA entities
Repository layer
Audit logs
Security events
Phase 3 — APIs & Telemetry
REST APIs
WebSocket communication
ESP32 telemetry
Real-time dashboard
Phase 4 — Zero-Trust Detection Engine
Command validation
Physical-state verification
Hardware discrepancy detection
Servo locking
Security alerts
Phase 5 — Behavioral Anomaly Detection
Event collection
Feature extraction
Behavioral baseline
Isolation Forest
Anomaly scoring
Session replay
Behavioral alerts
Phase 6 — Integration & Demonstration
Frontend integration
Hardware integration
Behavioral-security integration
SIEM integration
End-to-end testing
Final demonstration
🎯 Project Vision

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

by continuously validating:

WHAT THE SYSTEM IS COMMANDED TO DO
                    +
WHAT THE PHYSICAL SYSTEM IS ACTUALLY DOING
                    +
HOW USERS ARE BEHAVING
🌐 OptiGuard Security Philosophy
        OBSERVE
           ↓
        VERIFY
           ↓
        ANALYZE
           ↓
        DETECT
           ↓
        RESPOND
           ↓
        PROTECT

Never Trust. Always Verify.

👥 Team
Team Member	Responsibility
Anmol Arpit	Spring Boot, PostgreSQL, APIs & Integration
Preeti Mitra	Dashboard UI
Anirban Biswas	ESP32 Firmware
Priyanka Dutta Banik	Sensors & Servo Integration
🚀 Getting Started
Clone the Repository
git clone https://github.com/<your-username>/OptiGuard.git
cd OptiGuard
Frontend
cd frontend
npm install
npm run dev
Backend
cd backend
mvn spring-boot:run
Firmware

ESP32 firmware is located in:

firmware/

Follow the hardware documentation for:

ESP32 configuration
Sensor wiring
Servo integration
Relay configuration
Physical-lock mechanism
📚 Documentation

Documentation is maintained inside the docs/ directory.

API Documentation
Database Design
System Architecture
Physical Security Architecture
Behavioral Anomaly Detection
ESP32 Hardware Integration
Circuit Diagrams
Breadboard Connections
ML Model Documentation
Security Architecture
Presentation Material
📄 License

This project is licensed under the MIT License.

🛡️ OptiGuard
Observe. Verify. Detect. Protect.

Zero-Trust Cyber-Physical Security + Behavioral Threat Detection


### Main structural corrections made

- Converted the title into a proper **H1** and all major sections into **H2**.
- Added a professional **Table of Contents**.
- Separated **Physical Security** and **Behavioral Security** into clearly defined layers.
- Converted the technology stack into a readable **Markdown table**.
- Converted the folder structure into a properly formatted code block.
- Removed the malformed `#Folder Structure` and integrated it correctly.
- Organized the README into **Overview → Problem → Solution → Architecture → Technology → Features → Development → Vision**.
- Added consistent section numbering through the hierarchy rather than mixing `1.`, `2.`, `35.` headings.
- Fixed the incomplete ASCII architecture diagram.
- Removed unnecessary repetition while retaining the technical substance.
- Clearly established **Behavioral Anomaly Detection as OptiGuard Page 2**, rather than presenting NaviThreat as a separate product.
- Added separate sections for **hardware, telemetry, alerts, session replay, privacy, ML, and website structure**.
- Kept the README visually compact enough for GitHub while making major sections easy to scan.

**For GitHub:** the actual rendered font size should be left to GitHub's Markdown renderer. Using `<font>` tags or ma
