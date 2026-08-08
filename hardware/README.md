# Hardware

## Overview

The hardware subsystem provides the physical security layer of OptiGuard. It is responsible for monitoring the state of the physical switch, executing mechanical lockout actions, and providing reliable sensor data to the firmware.

The hardware prototype demonstrates how an independent physical verification system can protect critical infrastructure even when the central control system is compromised.

## Responsibilities

* Assemble the hardware prototype
* Interface sensors with the microcontroller
* Control the mechanical locking mechanism
* Monitor the physical switch
* Provide accurate sensor feedback
* Support telemetry generation
* Validate hardware functionality during testing

## Hardware Components

* Microcontroller (Arduino/ESP32)
* Servo Motor
* Infrared Sensor
* Toggle Switch
* Breadboard
* Jumper Wires
* USB Power Supply

## Directory Structure

```text
hardware/
│
├── wiring-diagram.png
├── circuit-diagram.png
├── component-list.md
├── assembly-guide.md
├── hardware-testing.md
└── README.md
```

## Hardware Architecture

The hardware subsystem consists of four primary components:

* **Microcontroller** – Executes the firmware and interfaces with all connected devices.
* **Sensors** – Monitor the physical state of the switch and provide feedback.
* **Servo Motor** – Acts as the physical locking mechanism that prevents unauthorized switch operations.
* **Switch Assembly** – Represents the protected electrical breaker used during demonstrations.

## Integration

The hardware communicates with the firmware running on the microcontroller.

The firmware exchanges commands and telemetry with the Spring Boot backend.

The hardware does not communicate directly with the frontend or the PostgreSQL database.

## Testing

Hardware validation should verify:

* Sensor operation
* Servo movement
* Switch detection
* Communication with firmware
* Stable power delivery
* Mechanical reliability

## Safety Notes

* Verify all wiring before powering the circuit.
* Use appropriate voltage levels for all components.
* Disconnect power before modifying hardware connections.
* Ensure the servo mechanism moves freely without obstruction.

## Owner

Hardware Team

## License

This directory is part of the OptiGuard project and follows the repository's licensing terms.
