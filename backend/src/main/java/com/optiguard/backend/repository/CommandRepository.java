package com.optiguard.backend.repository;

import com.optiguard.backend.entity.Command;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommandRepository extends JpaRepository<Command, Long> {
}