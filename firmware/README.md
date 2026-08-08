# Firmware

## Overview

The firmware controls the ESP32 microcontroller, acting as the independent hardware controller for OptiGuard. It interfaces with sensors, actuators, and the Spring Boot backend to execute authorized commands while enforcing physical security.

## Responsibilities

* Read sensor data
* Control the servo motor
* Monitor the physical switch state
* Validate incoming commands
* Execute authorized actions
* Send telemetry to the backend
* Report hardware faults
* Support Zero-Trust hardware enforcement

## Hardware Components

* ESP32 Development Board
* Servo Motor
* Infrared Sensor
* Toggle Switch
* Status LEDs (optional)

## Firmware Structure

```text
firmware/
│
├── OptiGuard_Controller/
│   ├── OptiGuard_Controller.ino
│   ├── config.h
│   ├── sensors.h
│   ├── sensors.cpp
│   ├── communication.h
│   ├── communication.cpp
│   ├── servo_control.h
│   ├── servo_control.cpp
│   ├── security.h
│   ├── security.cpp
│   └── README.md
│
└── libraries/
```


## Responsibilities of the ESP32

* Read the physical switch state
* Read sensor values
* Control the locking servo
* Receive commands from the backend
* Verify command validity (where applicable)
* Send telemetry updates
* Report hardware status

## Communication

The ESP32 communicates only with the Spring Boot backend.

Supported communication methods:

* USB Serial
* Wi-Fi (HTTP/WebSocket) *(optional if time permits)*

The ESP32 should not communicate directly with the frontend or the database.

## Telemetry Data

The firmware should periodically transmit:

* Physical switch state
* Servo state
* Sensor status
* Voltage (if available)
* Current (if available)
* Device status
* Timestamp

## Planned Features

* Sensor monitoring
* Servo control
* Telemetry transmission
* Command execution
* Hardware fault reporting
* Physical lock engagement
* Heartbeat/status messages


