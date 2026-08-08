package com.optiguard.backend;

import com.optiguard.backend.entity.User;
import com.optiguard.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class CrudIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void userCrudTest() {

        // CREATE
        User user = new User(
                "testuser",
                "testuser@optiguard.com",
                "ADMIN"
        );

        User savedUser = userRepository.save(user);

        assertNotNull(savedUser.getId());

        // READ
        User foundUser = userRepository.findById(savedUser.getId())
                .orElseThrow();

        assertEquals("testuser", foundUser.getUsername());

        // UPDATE
        foundUser.setRole("USER");

        User updatedUser = userRepository.save(foundUser);

        assertEquals("USER", updatedUser.getRole());

        // DELETE
        userRepository.deleteById(updatedUser.getId());

        assertFalse(
                userRepository.existsById(updatedUser.getId())
        );
    }
}