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
class AssetAuditControllerTest {

    private static final Logger log = LoggerFactory.getLogger(AssetAuditControllerTest.class);

    @Autowired
    private AssetAuditController controller;

    @Test
    void contextLoads() {
        assertNotNull(controller);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllAudits() {
        List<?> list = controller.getAllAudits().getBody();
        assertNotNull(list);
        log.info("Retrieved {} audits", list.size());
    }
}
