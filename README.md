
#  OptiGuard

**Zero-Trust Physical Override System for Smart Grids**

##  Overview

OptiGuard is a cyber-physical security system designed to protect smart power distribution infrastructure from malicious cyberattacks. Instead of trusting software alone, OptiGuard follows a **Zero-Trust Architecture** by independently verifying the physical state of electrical equipment before allowing critical operations.

Even if an attacker compromises the central SCADA system, OptiGuard's isolated hardware controller can detect suspicious behavior and physically prevent unauthorized switching operations.

---

##  Problem Statement

Modern smart grids rely heavily on SCADA systems to monitor and control substations remotely. If an attacker gains administrative access, they can issue malicious commands that:

* Open or close circuit breakers remotely
* Cause repeated switching operations
* Damage electrical equipment
* Trigger widespread power outages
* Hide malicious activity from operators

Traditional software firewalls become ineffective once the control system itself has been compromised.

---

##  Our Solution

OptiGuard introduces an independent hardware verification layer between the SCADA system and the physical switch.

Instead of trusting digital commands alone, the system continuously compares:

* Software Commands
* Physical Sensor Readings
* Hardware State
* Cryptographic Authentication

If the system detects suspicious or unauthorized activity, it immediately engages a physical locking mechanism using an ESP32-controlled servo motor, preventing unsafe operations.

---

##  Key Features

* Zero-Trust Security Architecture
* Independent Hardware Verification
* Physical Deadbolt Protection
* Real-Time Telemetry Monitoring
* Live Dashboard
* REST API Backend
* PostgreSQL Database
* Audit Logging
* Alert Management
* ESP32 Integration
* WebSocket-Based Live Updates

---

##  System Architecture

```text
                Operator Dashboard
                       │
                       ▼
               Spring Boot Backend
              REST API + WebSocket
              │                 │
              ▼                 ▼
        PostgreSQL Database   ESP32 Controller
                                  │
                                  ▼
                       Sensors + Servo Lock
                                  │
                                  ▼
                      Physical Grid Switch
```

---

##  Technology Stack

### Backend

* Java 21
* Spring Boot
* Spring Data JPA
* Spring Security
* WebSocket

### Database

* PostgreSQL

### Frontend

* React / Next.js

### Hardware

* ESP32
* Servo Motor
* Infrared Sensor
* Toggle Switch

### Tools

* Git
* GitHub
* Postman
* Maven

---

##  Repository Structure

```text
OptiGuard/
│
├── backend/
├── frontend/
├── firmware/
├── database/
├── docs/
├── hardware/
├── assets/
│
├── README.md
├── LICENSE
└── .gitignore
```

---

##  Documentation

Documentation is available inside the **docs/** directory.

* API Documentation
* Database Design
* Architecture
* Diagrams
* Presentation Material

---

##  Getting Started

Clone the repository:

```bash
git clone https://github.com/<your-username>/OptiGuard.git
```

Each module contains its own setup instructions.

* `backend/`
* `frontend/`
* `firmware/`

---

##  Team

| Role                  | Responsibility                             |
| ------------------    | ------------------------------------------ |
| Anmol Arpit           | Spring Boot, PostgreSQL, APIs, Integration |
| Preeti Moitra         | Dashboard UI                               |
| Anirban Biswas        | ESP32 Firmware                             |
| Priyanka Dutta Banik  | Sensors & Servo Integration                |

---

##  Development Phases

*  Phase 1 — Architecture & Project Setup
*  Phase 2 — PostgreSQL & Spring Data JPA
*  Phase 3 — REST APIs & Telemetry
*  Phase 4 — Zero-Trust Detection Engine
*  Phase 5 — Integration & Demo

---

##  License

This project is licensed under the MIT License.

---

##  Project Vision

OptiGuard demonstrates how cyber-physical systems can defend critical infrastructure by combining secure software, independent hardware verification, and real-time monitoring into a single Zero-Trust platform.
=======
# OptiGuard
>>>>>>> a076793c263d96d98fee6b9b6f84b83451687538
