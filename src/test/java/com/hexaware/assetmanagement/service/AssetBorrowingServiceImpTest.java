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
class AssetBorrowingServiceImpTest {

    private static final Logger log = LoggerFactory.getLogger(AssetBorrowingServiceImpTest.class);

    @Autowired
    private AssetBorrowingServiceImp service;

    @Test
    void contextLoads() {
        assertNotNull(service);
    }

    @Test
    void testGetAllActiveBorrowings() {
        try {
            List<?> borrowings = service.getAllActiveBorrowings();
            assertNotNull(borrowings);
            log.info("Retrieved {} active borrowings", borrowings.size());
        } catch (Exception e) {
            // Expected when no active borrowings exist in test database
            log.info("No active borrowings found (expected in test environment): {}", e.getMessage());
            assertTrue(e.getMessage().contains("No active borrowings found"));
        }
    }
}
