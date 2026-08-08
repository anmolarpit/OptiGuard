package com.optiguard.backend.service;

import com.optiguard.backend.entity.Alert;
import com.optiguard.backend.repository.AlertRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AlertService {

    private final AlertRepository alertRepository;

    public AlertService(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    public Alert createAlert(Alert alert) {
        return alertRepository.save(alert);
    }

    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    public Optional<Alert> getAlertById(Long id) {
        return alertRepository.findById(id);
    }

    public Alert updateAlert(Long id, Alert updatedAlert) {
        Alert existingAlert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        existingAlert.setAlertType(updatedAlert.getAlertType());
        existingAlert.setSeverity(updatedAlert.getSeverity());
        existingAlert.setMessage(updatedAlert.getMessage());
        existingAlert.setStatus(updatedAlert.getStatus());
        existingAlert.setCommand(updatedAlert.getCommand());

        return alertRepository.save(existingAlert);
    }

    public void deleteAlert(Long id) {
        alertRepository.deleteById(id);
    }
}