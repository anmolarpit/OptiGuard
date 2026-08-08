# Backend

## Overview

The backend is the central intelligence layer of OptiGuard. It manages authentication, command processing, telemetry collection, event detection, alert management, audit logging, and communication between the frontend, database, and ESP32 controller.

## Responsibilities

* REST API development
* User authentication and authorization
* Command validation
* Telemetry processing
* Zero-Trust Detection Engine
* Alert generation
* Audit logging
* WebSocket communication
* Database interaction
* ESP32 integration

## Technology Stack

* Java 21
* Spring Boot
* Spring Data JPA
* Spring Security
* PostgreSQL
* WebSocket
* Maven

## Project Structure

```text
backend/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/optiguard/
│   │   │       ├── config/
│   │   │       ├── controller/
│   │   │       ├── dto/
│   │   │       ├── entity/
│   │   │       ├── repository/
│   │   │       ├── security/
│   │   │       ├── service/
│   │   │       ├── websocket/
│   │   │       └── OptiGuardApplication.java
│   │   │
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/
│   │
│   └── test/
│
├── pom.xml
└── README.md
```

## Planned Features

* JWT Authentication
* Role-Based Access Control
* REST APIs
* Live Telemetry Processing
* WebSocket Broadcasting
* Zero-Trust Detection Engine
* Alert Management
* Audit Logging
* ESP32 Communication

