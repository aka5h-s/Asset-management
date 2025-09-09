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
class AssetBorrowingControllerTest {

    private static final Logger log = LoggerFactory.getLogger(AssetBorrowingControllerTest.class);

    @Autowired
    private AssetBorrowingController controller;

    @Test
    void contextLoads() {
        assertNotNull(controller);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllActiveBorrowings() {
        try {
            List<?> list = controller.getAllActiveBorrowings().getBody();
            assertNotNull(list);
            log.info("Retrieved {} active borrowings", list.size());
        } catch (Exception e) {
            // Expected when no active borrowings exist in test database
            log.info("No active borrowings found (expected in test environment): {}", e.getMessage());
            assertTrue(e.getMessage().contains("No active borrowings found"));
        }
    }
}
