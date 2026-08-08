package com.optiguard.backend.service;

import com.optiguard.backend.entity.Telemetry;
import com.optiguard.backend.repository.TelemetryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TelemetryService {

    private final TelemetryRepository telemetryRepository;

    public TelemetryService(TelemetryRepository telemetryRepository) {
        this.telemetryRepository = telemetryRepository;
    }

    public Telemetry createTelemetry(Telemetry telemetry) {
        return telemetryRepository.save(telemetry);
    }

    public List<Telemetry> getAllTelemetry() {
        return telemetryRepository.findAll();
    }

    public Optional<Telemetry> getTelemetryById(Long id) {
        return telemetryRepository.findById(id);
    }

    public Telemetry updateTelemetry(Long id, Telemetry updatedTelemetry) {
        Telemetry existingTelemetry = telemetryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Telemetry not found"));

        existingTelemetry.setMetricType(updatedTelemetry.getMetricType());
        existingTelemetry.setValue(updatedTelemetry.getValue());
        existingTelemetry.setUnit(updatedTelemetry.getUnit());

        return telemetryRepository.save(existingTelemetry);
    }

    public void deleteTelemetry(Long id) {
        telemetryRepository.deleteById(id);
    }
}