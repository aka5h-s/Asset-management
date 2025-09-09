package com.hexaware.assetmanagement.controller;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class AuthenticationControllerTest {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationControllerTest.class);

    @Autowired
    private AuthenticationController controller;

    @Test
    void contextLoads() {
        assertNotNull(controller);
        log.info("Authentication controller loaded successfully");
    }
}
