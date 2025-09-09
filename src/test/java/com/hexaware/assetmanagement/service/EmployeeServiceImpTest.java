package com.hexaware.assetmanagement.service;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import jakarta.transaction.Transactional;

@SpringBootTest
@Transactional
class EmployeeServiceImpTest {

    private static final Logger log = LoggerFactory.getLogger(EmployeeServiceImpTest.class);

    @Autowired
    private EmployeeServiceImp service;

    @Test
    void contextLoads() {
        assertNotNull(service);
    }

    @Test
    void testGetAllEmployees() {
        try {
            List<?> list = service.getAllEmployee();
            assertNotNull(list);
            log.info("Retrieved {} employees", list.size());
        } catch (Exception e) {
            // Expected when no employees exist in test database
            log.info("No employees found (expected in test environment): {}", e.getMessage());
            assertTrue(e.getMessage().contains("No Employee List exists"));
        }
    }
}
