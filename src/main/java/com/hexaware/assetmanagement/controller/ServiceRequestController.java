package com.hexaware.assetmanagement.controller;

import com.hexaware.assetmanagement.dto.ServiceRequestCreateDto;
import com.hexaware.assetmanagement.entity.ServiceRequest;
import com.hexaware.assetmanagement.service.IServiceRequestService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.hexaware.assetmanagement.config.RoleConstants;

import java.util.List;

/** Handles service request management endpoints */
@CrossOrigin("http://localhost:3000")
@RestController
@RequestMapping("/service-requests")
public class ServiceRequestController {

    private static final Logger logger = LoggerFactory.getLogger(ServiceRequestController.class);

    @Autowired
    private IServiceRequestService serviceRequestService;

    // Create service request for a borrowed asset (validates ownership)
    @PostMapping("/createServiceRequest")
    @PreAuthorize("hasAnyRole('" + RoleConstants.ADMIN + "', '" + RoleConstants.USER + "')")
    public ResponseEntity<ServiceRequest> createServiceRequest(
            @Valid @RequestBody ServiceRequestCreateDto dto) {
        logger.info("Received request to create service request for employee ID: {} and asset ID: {}", dto.getEmployeeId(), dto.getAssetId());
        try {
            ServiceRequest newServiceRequest = serviceRequestService.createServiceRequest(
                    dto.getEmployeeId(),
                    dto.getAssetId(),
                    dto.getIssueType(),
                    dto.getDescription()
            );
            logger.info("Service request successfully created with ID: {}", newServiceRequest.getServiceRequestId());
            return new ResponseEntity<>(newServiceRequest, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Failed to create service request: {}", e.getMessage(), e);
            throw e;
        }
    }

    // Fetch specific service request by its unique identifier
    @GetMapping("/getServiceRequestById/{serviceRequestId}")
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')")
    public ResponseEntity<ServiceRequest> getServiceRequestById(@PathVariable int serviceRequestId) {
        logger.info("Received request to get service request by ID: {}", serviceRequestId);
        try {
            ServiceRequest serviceRequest = serviceRequestService.getServiceRequestById(serviceRequestId);
            logger.info("Successfully retrieved service request with ID: {}", serviceRequestId);
            return ResponseEntity.ok(serviceRequest);
        } catch (Exception e) {
            logger.error("Failed to get service request with ID {}: {}", serviceRequestId, e.getMessage(), e);
            throw e;
        }
    }

    // Update service request status (Pending, Transit, Completed)
    @PutMapping("/updateServiceRequest/{serviceRequestId}/{status}")
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')")
    public ResponseEntity<ServiceRequest> updateServiceRequest(
            @PathVariable int serviceRequestId,
            @PathVariable ServiceRequest.Status status) {
        logger.info("Received request to update service request ID: {} with status: {}", serviceRequestId, status);
        try {
            ServiceRequest updatedServiceRequest = serviceRequestService.updateServiceRequestStatus(
                    serviceRequestId,
                    status
            );
            logger.info("Service request successfully updated with ID: {}", serviceRequestId);
            return ResponseEntity.ok(updatedServiceRequest);
        } catch (Exception e) {
            logger.error("Failed to update service request with ID {}: {}", serviceRequestId, e.getMessage(), e);
            throw e;
        }
    }

    // List all service requests for a specific employee
    @GetMapping("/serviceRequestByEmployee/{employeeId}")
    @PreAuthorize("hasAnyRole('" + RoleConstants.ADMIN + "', '" + RoleConstants.USER + "')")
    public ResponseEntity<List<ServiceRequest>> getServiceRequestsByEmployee(@PathVariable int employeeId) {
        logger.info("Received request to get service requests for employee ID: {}", employeeId);
        try {
            List<ServiceRequest> employeeServiceRequests = serviceRequestService.getServiceRequestsByEmployee(employeeId);
            logger.info("Successfully retrieved {} service requests for employee ID: {}", employeeServiceRequests.size(), employeeId);
            return ResponseEntity.ok(employeeServiceRequests);
        } catch (Exception e) {
            logger.error("Failed to get service requests for employee ID {}: {}", employeeId, e.getMessage(), e);
            throw e;
        }
    }

    // List all service requests in the system (admin-only view)
    @GetMapping("/allServiceRequests")
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')")
    public ResponseEntity<List<ServiceRequest>> getAllServiceRequests() {
        logger.info("Received request to get all service requests");
        try {
            List<ServiceRequest> serviceRequests = serviceRequestService.getAllServiceRequests();
            logger.info("Successfully retrieved {} service requests", serviceRequests.size());
            return ResponseEntity.ok(serviceRequests);
        } catch (Exception e) {
            logger.error("Failed to get all service requests: {}", e.getMessage(), e);
            throw e;
        }
    }

    // Filter service requests by their current status
    @GetMapping("/findByStatus/{status}")
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')")
    public ResponseEntity<List<ServiceRequest>> findByStatus(@PathVariable ServiceRequest.Status status) {
        logger.info("Received request to get service requests by status: {}", status);
        try {
            List<ServiceRequest> serviceRequestByStatus = serviceRequestService.findByStatus(status);
            logger.info("Successfully retrieved {} service requests with status: {}", serviceRequestByStatus.size(), status);
            return ResponseEntity.ok(serviceRequestByStatus);
        } catch (Exception e) {
            logger.error("Failed to get service requests by status {}: {}", status, e.getMessage(), e);
            throw e;
        }
    }
}
