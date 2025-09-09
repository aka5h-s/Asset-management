package com.hexaware.assetmanagement.controller;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;

@SpringBootTest
class EmployeeControllerTest {

    private static final Logger log = LoggerFactory.getLogger(EmployeeControllerTest.class);

    @Autowired
    private EmployeeController controller;

    @Test
    void contextLoads() {
        assertNotNull(controller);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllEmployees() {
        try {
            List<?> list = controller.getAllEmployee().getBody();
            assertNotNull(list);
            log.info("Retrieved {} employees", list.size());
        } catch (Exception e) {
            // Expected when no employees exist in test database
            log.info("No employees found (expected in test environment): {}", e.getMessage());
            assertTrue(e.getMessage().contains("No Employee List exists"));
        }
    }
}
