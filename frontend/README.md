# Frontend

## Overview

The frontend provides the primary user interface for OptiGuard. It enables operators to monitor system health, view real-time telemetry, issue commands, receive alerts, and visualize the state of the physical hardware through an interactive dashboard.

## Responsibilities

* Dashboard development
* User authentication interface
* Real-time telemetry visualization
* Alert and notification display
* Command execution interface
* WebSocket integration
* REST API integration
* Responsive user interface

## Technology Stack

* React / Next.js
* TypeScript
* Tailwind CSS
* Axios
* WebSocket

## Project Structure

```text
frontend/
│
├── public/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── contexts/
│   ├── utils/
│   ├── styles/
│   └── assets/
│
├── package.json
└── README.md
```

## Planned Dashboard Features

* Secure Login Screen
* System Overview Dashboard
* Live Telemetry Panel
* Command Console
* Alert Center
* Audit Log Viewer
* System Status Monitor
* Device Connectivity Indicators

## Backend Integration

The frontend communicates exclusively with the Spring Boot backend.

* REST APIs for authentication and command execution
* WebSocket for real-time telemetry and alerts

The frontend does not communicate directly with the ESP32 or the database.


