package com.hexaware.assetmanagement.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hexaware.assetmanagement.dto.BorrowingActionDto;
import com.hexaware.assetmanagement.entity.Asset;
import com.hexaware.assetmanagement.entity.AssetBorrowing;
import com.hexaware.assetmanagement.entity.Employee;
import com.hexaware.assetmanagement.exception.BadRequestException;
import com.hexaware.assetmanagement.exception.ResourceNotFoundException;
import com.hexaware.assetmanagement.repository.IAssetBorrowingRepository;
import com.hexaware.assetmanagement.repository.IAssetRepository;
import com.hexaware.assetmanagement.repository.IEmployeeRepository;

import jakarta.transaction.Transactional;

/** Business logic for asset borrowing workflow operations */
@Service
@Transactional 
public class AssetBorrowingServiceImp implements IAssetBorrowingService {

    @Autowired
    private IAssetBorrowingRepository borrowingRepository;

    @Autowired
    private IAssetRepository assetRepository;

    @Autowired
    private IEmployeeRepository employeeRepository;
    private static final Logger logger = LoggerFactory.getLogger(AssetBorrowingServiceImp.class);
    // Create borrowing request and validate asset availability
    @Override
    public AssetBorrowing requestBorrow(int employeeId, int assetId) {
        logger.info("Received request to borrow asset {} for employee {}", assetId, employeeId);
        // Getting employee
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));

        // Getting asset
        Asset asset = assetRepository.findById(assetId)
            .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + assetId));

        // Check if asset is available
        if (Asset.Status.Borrowed.equals(asset.getStatus())) {
            logger.warn("Cannot create borrow request. Asset {} is already borrowed", assetId);
            throw new BadRequestException("Asset '" + asset.getAssetName() + "' is already borrowed and not available for request.");
        }

        // Check if employee already has a pending request for this asset
        List<AssetBorrowing> existingRequests = borrowingRepository.findByEmployeeIdAndAssetIdAndStatus(employeeId, assetId, AssetBorrowing.Status.PENDING);
        if (!existingRequests.isEmpty()) {
            logger.warn("Employee {} already has a pending request for asset {}", employeeId, assetId);
            throw new BadRequestException("You already have a pending request for asset '" + asset.getAssetName() + "'. Please wait for approval.");
        }

        // Creating new borrowing request
        AssetBorrowing borrowing = new AssetBorrowing();
        borrowing.setEmployee(employee);
        borrowing.setAsset(asset);
        borrowing.setStatus(AssetBorrowing.Status.PENDING);
        borrowing.setBorrowedAt(LocalDateTime.now()); // Set borrowed_at when creating request

        AssetBorrowing savedBorrowing = borrowingRepository.save(borrowing);
        logger.info("Borrow request successfully created with ID: {} for employee {} and asset {}", 
            savedBorrowing.getBorrowingId(), employeeId, assetId);
        return savedBorrowing;
    }

    // Process admin action on pending borrowing request (approve/reject)
    @Override
    public AssetBorrowing processBorrowingAction(int borrowingId, BorrowingActionDto actionDto) {
        logger.info("Received request to process borrowing action {} for borrowing ID: {}", actionDto.getAction(), borrowingId);
        AssetBorrowing borrowing = borrowingRepository.findById(borrowingId)
            .orElseThrow(() -> new ResourceNotFoundException("Borrowing record not found with ID: " + borrowingId));

        if (!AssetBorrowing.Status.PENDING.equals(borrowing.getStatus())) {
            logger.warn("Cannot process borrowing action. Current status is not PENDING: {}", borrowing.getStatus());
            throw new BadRequestException("Only pending borrow requests can be processed");
        }

        switch (actionDto.getAction()) {
            case APPROVE:
                // Check if asset is still available
                Asset asset = borrowing.getAsset();
                if (Asset.Status.Borrowed.equals(asset.getStatus())) {
                    logger.warn("Cannot approve borrowing. Asset {} is already borrowed", asset.getAssetId());
                    throw new BadRequestException("Asset '" + asset.getAssetName() + "' is already borrowed by another user. Please reject this request.");
                }

                // Approve and activate
                borrowing.setStatus(AssetBorrowing.Status.ACTIVE);
                borrowing.setBorrowedAt(LocalDateTime.now());

                // Update asset status
                asset.setStatus(Asset.Status.Borrowed);
                assetRepository.save(asset);

                logger.info("Borrow request {} successfully approved and activated for asset {}", borrowingId, asset.getAssetId());
                break;

            case REJECT:
                borrowing.setStatus(AssetBorrowing.Status.REJECTED);
                logger.info("Borrow request {} successfully rejected", borrowingId);
                break;

            default:
                logger.error("Invalid borrowing action: {}", actionDto.getAction());
                throw new BadRequestException("Invalid action: " + actionDto.getAction());
        }

        AssetBorrowing savedBorrowing = borrowingRepository.save(borrowing);
        logger.info("Borrowing action successfully processed for ID: {}", borrowingId);
        return savedBorrowing;
    }

    // Mark asset as returned and update asset status to available
    @Override
    public AssetBorrowing returnAsset(int borrowingId) {
        logger.info("Attempting to return asset for borrowing ID: {}", borrowingId);
        
        // Getting borrowing record
        AssetBorrowing borrowing = borrowingRepository.findById(borrowingId)
            .orElseThrow(() -> {
                logger.error("Borrowing record not found with ID: {}", borrowingId);
                return new ResourceNotFoundException("Borrowing record not found with ID: " + borrowingId);
            });
            
        logger.info("Found borrowing record. Current status: {}", borrowing.getStatus());

        // Only allow return if status is ACTIVE
        if (!AssetBorrowing.Status.ACTIVE.equals(borrowing.getStatus())) {
            logger.warn("Asset cannot be returned. Current status: {}", borrowing.getStatus());
            throw new BadRequestException("Asset can only be returned when status is ACTIVE");
        }

        // Updating borrowing record
        borrowing.setReturnedAt(LocalDateTime.now());
        borrowing.setStatus(AssetBorrowing.Status.RETURNED);
        
        // Updating asset status
        Asset asset = borrowing.getAsset();
        logger.info("Updating asset status for asset ID: {}. Current status: {}", 
            asset.getAssetId(), asset.getStatus());
            
        asset.setStatus(Asset.Status.Available);
        assetRepository.save(asset);
        
        logger.info("Successfully updated asset status to Available");
        
        AssetBorrowing savedBorrowing = borrowingRepository.save(borrowing);
        logger.info("Successfully updated borrowing record to RETURNED");
        
        return savedBorrowing;
    }

    // Retrieve all borrowing records for a specific employee
    @Override
    public List<AssetBorrowing> getBorrowingsByEmployee(int employeeId) {
        logger.info("Received request to get borrowings for employee ID: {}", employeeId);
        // Checking if employee exists
        employeeRepository.findById(employeeId)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));

        // Getting borrowings for employee
        List<AssetBorrowing> borrowings = borrowingRepository.findByEmployeeId(employeeId);
        if (borrowings.isEmpty()) {
            logger.warn("No borrowings found for employee ID: {}", employeeId);
            return borrowings; // Return empty list instead of throwing exception
        }
        logger.info("Successfully retrieved {} borrowings for employee ID: {}", borrowings.size(), employeeId);
        return borrowings;
    }

    // List all currently active borrowing records
    @Override
    public List<AssetBorrowing> getAllActiveBorrowings() {
        logger.info("Received request to get all active borrowings");
        // Getting all active borrowings
        List<AssetBorrowing> activeBorrowings = borrowingRepository.findByStatus(AssetBorrowing.Status.ACTIVE);
        if (activeBorrowings.isEmpty()) {
            logger.info("No active borrowings found - returning empty list");
            return activeBorrowings; // Return empty list instead of throwing exception
        }
        logger.info("Successfully retrieved {} active borrowings", activeBorrowings.size());
        return activeBorrowings;
    }

    // List all pending borrowing requests awaiting approval
    @Override
    public List<AssetBorrowing> getAllPendingBorrowings() {
        logger.info("Received request to get all pending borrowings");
        // Getting all pending borrowings
        List<AssetBorrowing> pendingBorrowings = borrowingRepository.findByStatus(AssetBorrowing.Status.PENDING);
        if (pendingBorrowings.isEmpty()) {
            logger.info("No pending borrowings found - returning empty list");
            return pendingBorrowings; // Return empty list instead of throwing exception
        }
        logger.info("Successfully retrieved {} pending borrowings", pendingBorrowings.size());
        return pendingBorrowings;
    }

    // List all rejected borrowing requests
    @Override
    public List<AssetBorrowing> getAllRejectedBorrowings() {
        logger.info("Received request to get all rejected borrowings");
        // Getting all rejected borrowings
        List<AssetBorrowing> rejectedBorrowings = borrowingRepository.findByStatus(AssetBorrowing.Status.REJECTED);
        if (rejectedBorrowings.isEmpty()) {
            logger.info("No rejected borrowings found - returning empty list");
            return rejectedBorrowings; // Return empty list instead of throwing exception
        }
        logger.info("Successfully retrieved {} rejected borrowings", rejectedBorrowings.size());
        return rejectedBorrowings;
    }

    // List all completed borrowing records (returned assets)
    @Override
    public List<AssetBorrowing> getAllReturnedBorrowings() {
        logger.info("Received request to get all returned borrowings");
        // Getting all returned borrowings
        List<AssetBorrowing> returnedBorrowings = borrowingRepository.findByStatus(AssetBorrowing.Status.RETURNED);
        if (returnedBorrowings.isEmpty()) {
            logger.info("No returned borrowings found - returning empty list");
            return returnedBorrowings; // Return empty list instead of throwing exception
        }
        logger.info("Successfully retrieved {} returned borrowings", returnedBorrowings.size());
        return returnedBorrowings;
    }
}
