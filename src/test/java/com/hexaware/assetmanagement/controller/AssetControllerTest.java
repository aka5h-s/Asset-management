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
class AssetControllerTest {

    private static final Logger log = LoggerFactory.getLogger(AssetControllerTest.class);

    @Autowired
    private AssetController controller;

    @Test
    void contextLoads() {
        assertNotNull(controller);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllAssets() {
        List<?> list = controller.getAllAssets().getBody();
        assertNotNull(list);
        log.info("Retrieved {} assets", list.size());
    }
}
