package com.hexaware.assetmanagement.service;

import java.time.LocalDateTime;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hexaware.assetmanagement.dto.AssetAuditDto;
import com.hexaware.assetmanagement.entity.Asset;
import com.hexaware.assetmanagement.entity.AssetAudit;
import com.hexaware.assetmanagement.entity.Employee;
import com.hexaware.assetmanagement.exception.BadRequestException;
import com.hexaware.assetmanagement.exception.ResourceNotFoundException;
import com.hexaware.assetmanagement.exception.UnauthorizedException;
import com.hexaware.assetmanagement.repository.IAssetAuditRepository;
import com.hexaware.assetmanagement.repository.IAssetRepository;
import com.hexaware.assetmanagement.repository.IEmployeeRepository;

import jakarta.transaction.Transactional;

/** Business logic for asset audit workflow operations */
@Service
@Transactional
public class AssetAuditServiceImp implements IAssetAuditService {

    @Autowired
    private IAssetAuditRepository auditRepository;

    @Autowired
    private IEmployeeRepository employeeRepository;

    @Autowired
    private IAssetRepository assetRepository;
    private static final Logger logger = LoggerFactory.getLogger(AssetAuditServiceImp.class);
    // Create audit request for employee and asset
    @Override
    public AssetAudit sendAudit(int employeeId, int assetId) {
        logger.info("Received request to send audit for employee {} and asset {}", employeeId, assetId);
        // getting employee
    	Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        // getting asset
    	Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
    	// creating new audit record
        AssetAudit audit = new AssetAudit();
        audit.setEmployee(employee);
        audit.setAsset(asset);
        audit.setAuditStatus(AssetAudit.AuditStatus.PENDING);
        audit.setRequestedAt(LocalDateTime.now());
        AssetAudit savedAudit = auditRepository.save(audit);
        logger.info("Asset audit request successfully sent with ID: {} for employee {} and asset {}", 
            savedAudit.getAuditId(), employeeId, assetId);
        return savedAudit;
    }

    // Process audit decision (verify/reject) by asset owner
    @Override
    public AssetAuditDto decideAudit(int auditId, int employeeId, String action) {
        logger.info("Received audit decision request for audit ID: {} by employee {} with action: {}", auditId, employeeId, action);
        AssetAudit audit = auditRepository.findById(auditId)
                .orElseThrow(() -> new ResourceNotFoundException("Audit not found with id: " + auditId));
        
        // Check if the current user is the owner of the audit
        if (audit.getEmployee().getEmployeeId() != employeeId) {
            logger.warn("Employee {} attempted to make decision on audit {} owned by employee {}", 
                employeeId, auditId, audit.getEmployee().getEmployeeId());
            throw new UnauthorizedException("You can only make decisions on your own audits");
        }
        
        // Only allow action if current status is PENDING
        if (audit.getAuditStatus() != AssetAudit.AuditStatus.PENDING) {
            logger.warn("Cannot make decision on audit {} with status: {}", auditId, audit.getAuditStatus());
            throw new BadRequestException("Audit decision can only be made on PENDING audits");
        }
        
        // Process the action
        if ("VERIFY".equalsIgnoreCase(action)) {
            audit.setAuditStatus(AssetAudit.AuditStatus.VERIFIED);
            logger.info("Audit {} successfully verified by employee {}", auditId, employeeId);
        } else if ("REJECT".equalsIgnoreCase(action)) {
            audit.setAuditStatus(AssetAudit.AuditStatus.REJECTED);
            logger.info("Audit {} successfully rejected by employee {}", auditId, employeeId);
        } else {
            logger.error("Invalid audit action: {} for audit ID: {}", action, auditId);
            throw new BadRequestException("Invalid action. Only 'VERIFY' or 'REJECT' are allowed");
        }
        
        audit.setUpdatedAt(LocalDateTime.now());
        AssetAudit savedAudit = auditRepository.save(audit);
        
        logger.info("Audit decision successfully processed for audit ID: {}", auditId);
        return AssetAuditDto.fromEntity(savedAudit);
    }

    // List all audit records for a specific employee
    @Override
    public List<AssetAudit> getAuditsByEmployee(int employeeId) {
        logger.info("Received request to get audits for employee ID: {}", employeeId);
        // getting employee
    	Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        List<AssetAudit> audits = auditRepository.findByEmployee(employee);
        logger.info("Successfully retrieved {} audits for employee ID: {}", audits.size(), employeeId);
        return audits;
    }

    // Retrieve all audit records from the database
    @Override
    public List<AssetAudit> getAllAudits() {
        logger.info("Received request to get all audits");
        List<AssetAudit> audits = auditRepository.findAll();
        logger.info("Successfully retrieved {} audits", audits.size());
        return audits;
    }

    // Fetch audit record by ID or throw not found exception
    @Override
    public AssetAudit getAuditById(int auditId) {
        logger.info("Received request to get audit with ID: {}", auditId);
        AssetAudit audit = auditRepository.findById(auditId)
                .orElseThrow(() -> new ResourceNotFoundException("Audit not found with id: " + auditId));
        logger.info("Successfully retrieved audit with ID: {}", auditId);
        return audit;
    }
}
