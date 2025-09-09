package com.hexaware.assetmanagement.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hexaware.assetmanagement.config.RoleConstants;
import com.hexaware.assetmanagement.dto.AssetAuditDto;
import com.hexaware.assetmanagement.entity.AssetAudit;
import com.hexaware.assetmanagement.service.IAssetAuditService;
import com.hexaware.assetmanagement.util.SecurityContextUtil;
/** Handles asset audit workflow endpoints */
@CrossOrigin("http://localhost:3000")
@RestController
@RequestMapping("/audits")
public class AssetAuditController {

    private static final Logger logger = LoggerFactory.getLogger(AssetAuditController.class);

    @Autowired
    private IAssetAuditService assetAuditService;

    // Initiate asset audit request for an employee
    @PostMapping("/send/{employeeId}/{assetId}")
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')")
    public ResponseEntity<AssetAudit> sendAudit(@PathVariable int employeeId, @PathVariable int assetId) {
        logger.info("Received request to send audit for employee ID: {} and asset ID: {}", employeeId, assetId);
        try {
            AssetAudit audit = assetAuditService.sendAudit(employeeId, assetId);
            logger.info("Audit successfully sent with ID: {}", audit.getAuditId());
            return new ResponseEntity<>(audit, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Failed to send audit for employee {} and asset {}: {}", employeeId, assetId, e.getMessage(), e);
            throw e;
        }
    }

    // Process audit decision (verify or reject) by asset owner
    @PutMapping("/{auditId}/decision")
    @PreAuthorize("hasRole('" + RoleConstants.USER + "')")
    public ResponseEntity<AssetAuditDto> decideAudit(
            @PathVariable int auditId,
            @RequestBody AuditDecisionRequest request,
            Authentication auth) {
        logger.info("Received audit decision request for audit ID: {} with action: {}", auditId, request.action());
        try {
            int currentUserId = SecurityContextUtil.getCurrentUserId();
            AssetAuditDto updatedAudit = assetAuditService.decideAudit(auditId, currentUserId, request.action());
            logger.info("Audit decision successfully processed for audit ID: {}", auditId);
            return ResponseEntity.ok(updatedAudit);
        } catch (Exception e) {
            logger.error("Failed to process audit decision for audit ID {}: {}", auditId, e.getMessage(), e);
            throw e;
        }
    }
    
    // Minimal inline record for audit decision request
    public record AuditDecisionRequest(String action) {}

    // List all audit records for a specific employee
    @GetMapping("/getbyeid/{employeeId}")
    @PreAuthorize("hasRole('" + RoleConstants.USER + "') or hasRole('" + RoleConstants.ADMIN + "')")
    public ResponseEntity<List<AssetAudit>> getAuditsByEmployee(@PathVariable int employeeId) {
        logger.info("Received request to get audits for employee ID: {}", employeeId);
        try {
            List<AssetAudit> audits = assetAuditService.getAuditsByEmployee(employeeId);
            logger.info("Successfully retrieved {} audits for employee ID: {}", audits.size(), employeeId);
            return ResponseEntity.ok(audits);
        } catch (Exception e) {
            logger.error("Failed to get audits for employee ID {}: {}", employeeId, e.getMessage(), e);
            throw e;
        }
    }

    // List all audit records in the system (admin-only view)
    @GetMapping("/getall")
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')")
    public ResponseEntity<List<AssetAudit>> getAllAudits() {
        logger.info("Received request to get all audits");
        try {
            List<AssetAudit> audits = assetAuditService.getAllAudits();
            logger.info("Successfully retrieved {} audits", audits.size());
            return ResponseEntity.ok(audits);
        } catch (Exception e) {
            logger.error("Failed to get all audits: {}", e.getMessage(), e);
            throw e;
        }
    }

    // Fetch specific audit record by its unique identifier
    @GetMapping("/getbyid/{auditId}")
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')")
    public ResponseEntity<AssetAudit> getAuditById(@PathVariable int auditId) {
        logger.info("Received request to get audit by ID: {}", auditId);
        try {
            AssetAudit audit = assetAuditService.getAuditById(auditId);
            logger.info("Successfully retrieved audit with ID: {}", auditId);
            return ResponseEntity.ok(audit);
        } catch (Exception e) {
            logger.error("Failed to get audit with ID {}: {}", auditId, e.getMessage(), e);
            throw e;
        }
    }
}
