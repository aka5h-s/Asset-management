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
class AssetCategoryControllerTest {

    private static final Logger log = LoggerFactory.getLogger(AssetCategoryControllerTest.class);

    @Autowired
    private AssetCategoryController controller;

    @Test
    void contextLoads() {
        assertNotNull(controller);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllCategories() {
        List<?> list = controller.getAllCategories().getBody();
        assertNotNull(list);
        log.info("Retrieved {} categories", list.size());
    }
}
