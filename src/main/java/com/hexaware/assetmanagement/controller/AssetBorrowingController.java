package com.hexaware.assetmanagement.controller;

import com.hexaware.assetmanagement.dto.BorrowRequestDto;
import com.hexaware.assetmanagement.dto.BorrowingActionDto;
import com.hexaware.assetmanagement.entity.AssetBorrowing;
import com.hexaware.assetmanagement.service.IAssetBorrowingService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.hexaware.assetmanagement.config.RoleConstants;

/** Handles asset borrowing workflow endpoints */
@CrossOrigin("http://localhost:3000")
@RestController
@RequestMapping("/borrowings")
public class AssetBorrowingController {

    private static final Logger logger = LoggerFactory.getLogger(AssetBorrowingController.class);

    @Autowired
    private IAssetBorrowingService assetBorrowingService;

    // Submit borrowing request for an available asset
    @PostMapping("/request")
    @PreAuthorize("hasRole('" + RoleConstants.USER + "')")
    public ResponseEntity<AssetBorrowing> requestBorrow(@Valid @RequestBody BorrowRequestDto dto) {
        logger.info("Received borrow request for employee ID: {} and asset ID: {}", dto.getEmployeeId(), dto.getAssetId());
        try {
            AssetBorrowing borrowing = assetBorrowingService.requestBorrow(dto.getEmployeeId(), dto.getAssetId());
            logger.info("Borrow request successfully created with ID: {}", borrowing.getBorrowingId());
            return ResponseEntity.ok(borrowing);
        } catch (Exception e) {
            logger.error("Failed to create borrow request for employee {} and asset {}: {}", dto.getEmployeeId(), dto.getAssetId(), e.getMessage(), e);
            throw e;
        }
    }

    // Process pending borrowing requests (approve or reject)
    @PutMapping("/{id}/action")
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')")
    public ResponseEntity<AssetBorrowing> processBorrowingAction(@PathVariable int id, @Valid @RequestBody BorrowingActionDto actionDto) {
        logger.info("Received borrowing action request for ID: {} with action: {}", id, actionDto.getAction());
        try {
            AssetBorrowing borrowing = assetBorrowingService.processBorrowingAction(id, actionDto);
            logger.info("Borrowing action successfully processed for ID: {}", id);
            return ResponseEntity.ok(borrowing);
        } catch (Exception e) {
            logger.error("Failed to process borrowing action for ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    // Return borrowed asset and mark as available
    @PutMapping("/{id}/return")
    @PreAuthorize("hasRole('" + RoleConstants.USER + "')")
    public ResponseEntity<AssetBorrowing> returnAsset(@PathVariable int id) {
        logger.info("Received asset return request for borrowing ID: {}", id);
        try {
            AssetBorrowing borrowing = assetBorrowingService.returnAsset(id);
            logger.info("Asset successfully returned for borrowing ID: {}", id);
            return ResponseEntity.ok(borrowing);
        } catch (Exception e) {
            logger.error("Failed to return asset for borrowing ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    // List all borrowing records for a specific employee
    @GetMapping("/getbyeid/{employeeId}")
    @PreAuthorize("hasAnyRole('" + RoleConstants.ADMIN + "','" + RoleConstants.USER + "')")
    public ResponseEntity<List<AssetBorrowing>> getBorrowingsByEmployee(@PathVariable int employeeId) {
        logger.info("Received request to get borrowings for employee ID: {}", employeeId);
        try {
            List<AssetBorrowing> borrowings = assetBorrowingService.getBorrowingsByEmployee(employeeId);
            logger.info("Successfully retrieved {} borrowings for employee ID: {}", borrowings.size(), employeeId);
            return ResponseEntity.ok(borrowings);
        } catch (Exception e) {
            logger.error("Failed to get borrowings for employee ID {}: {}", employeeId, e.getMessage(), e);
            throw e;
        }
    }

    // List all currently active borrowing records (admin-only)
    @GetMapping("/active")
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')") 
    public ResponseEntity<List<AssetBorrowing>> getAllActiveBorrowings() {
        logger.info("Received request to get all active borrowings");
        try {
            List<AssetBorrowing> activeBorrowings = assetBorrowingService.getAllActiveBorrowings();
            logger.info("Successfully retrieved {} active borrowings", activeBorrowings.size());
            return ResponseEntity.ok(activeBorrowings);
        } catch (Exception e) {
            logger.error("Failed to get active borrowings: {}", e.getMessage(), e);
            throw e;
        }
    }

    // List all pending borrowing requests awaiting approval
    @GetMapping("/pending")
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')") 
    public ResponseEntity<List<AssetBorrowing>> getAllPendingBorrowings() {
        logger.info("Received request to get all pending borrowings");
        try {
            List<AssetBorrowing> pendingBorrowings = assetBorrowingService.getAllPendingBorrowings();
            logger.info("Successfully retrieved {} pending borrowings", pendingBorrowings.size());
            return ResponseEntity.ok(pendingBorrowings);
        } catch (Exception e) {
            logger.error("Failed to get pending borrowings: {}", e.getMessage(), e);
            throw e;
        }
    }

    // List all rejected borrowing requests
    @GetMapping("/rejected")
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')") 
    public ResponseEntity<List<AssetBorrowing>> getAllRejectedBorrowings() {
        logger.info("Received request to get all rejected borrowings");
        try {
            List<AssetBorrowing> rejectedBorrowings = assetBorrowingService.getAllRejectedBorrowings();
            logger.info("Successfully retrieved {} rejected borrowings", rejectedBorrowings.size());
            return ResponseEntity.ok(rejectedBorrowings);
        } catch (Exception e) {
            logger.error("Failed to get rejected borrowings: {}", e.getMessage(), e);
            throw e;
        }
    }

    // List all completed borrowing records (returned assets)
    @GetMapping("/returned")
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')") 
    public ResponseEntity<List<AssetBorrowing>> getAllReturnedBorrowings() {
        logger.info("Received request to get all returned borrowings");
        try {
            List<AssetBorrowing> returnedBorrowings = assetBorrowingService.getAllReturnedBorrowings();
            logger.info("Successfully retrieved {} returned borrowings", returnedBorrowings.size());
            return ResponseEntity.ok(returnedBorrowings);
        } catch (Exception e) {
            logger.error("Failed to get returned borrowings: {}", e.getMessage(), e);
            throw e;
        }
    }
}
