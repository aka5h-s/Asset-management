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
class AssetAuditServiceImpTest {

    private static final Logger log = LoggerFactory.getLogger(AssetAuditServiceImpTest.class);

    @Autowired
    private AssetAuditServiceImp service;

    @Test
    void contextLoads() {
        assertNotNull(service);
    }

    @Test
    void testGetAllAudits() {
        List<?> audits = service.getAllAudits();
        assertNotNull(audits);
        log.info("Retrieved {} audits", audits.size());
    }
}
