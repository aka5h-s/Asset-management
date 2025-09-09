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
class ServiceRequestControllerTest {

    private static final Logger log = LoggerFactory.getLogger(ServiceRequestControllerTest.class);

    @Autowired
    private ServiceRequestController controller;

    @Test
    void contextLoads() {
        assertNotNull(controller);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllServiceRequests() {
        List<?> list = controller.getAllServiceRequests().getBody();
        assertNotNull(list);
        log.info("Retrieved {} service requests", list.size());
    }
}
