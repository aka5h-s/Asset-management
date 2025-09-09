package com.hexaware.assetmanagement.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.hexaware.assetmanagement.config.RoleConstants;

import com.hexaware.assetmanagement.dto.AssetDto;
import com.hexaware.assetmanagement.entity.Asset;
import com.hexaware.assetmanagement.entity.AssetBorrowing;
import com.hexaware.assetmanagement.entity.AssetCategory;
import com.hexaware.assetmanagement.service.IAssetBorrowingService;
import com.hexaware.assetmanagement.service.IAssetService;

import jakarta.validation.Valid;
/** Handles asset CRUD endpoints */
@CrossOrigin("http://localhost:3000")
@RestController
@RequestMapping("/assets")
public class AssetController {

    private static final Logger logger = LoggerFactory.getLogger(AssetController.class);

    @Autowired
    private IAssetService assetService;
    @Autowired
    private IAssetBorrowingService assetBorrowingService;

    // Create a new asset and return the saved entity
    @PostMapping("/add")
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')")
    public ResponseEntity<Asset> addAsset(@Valid @RequestBody AssetDto assetDto) {
        logger.info("Received request to add new asset: {}", assetDto.getAssetName());
        try {
            Asset newAsset = assetService.addAsset(assetDto);
            logger.info("Asset successfully added with ID: {}", newAsset.getAssetId());
            return new ResponseEntity<>(newAsset, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Failed to add asset: {}", e.getMessage(), e);
            throw e;
        }
    }

    // Update existing asset details and return the updated entity
    @PutMapping("/update/{assetId}")
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')")
    public ResponseEntity<Asset> updateAsset(@PathVariable Integer assetId, @Valid @RequestBody AssetDto assetDto) {
        logger.info("Received request to update asset with ID: {}", assetId);
        try {
            assetDto.setAssetId(assetId);
            Asset updatedAsset = assetService.updateAsset(assetDto);
            logger.info("Asset successfully updated with ID: {}", assetId);
            return ResponseEntity.ok(updatedAsset);
        } catch (Exception e) {
            logger.error("Failed to update asset with ID {}: {}", assetId, e.getMessage(), e);
            throw e;
        }
    }

    // Fetch a specific asset by its unique identifier
    @GetMapping("/getbyid/{assetId}")
    @PreAuthorize("hasAnyRole('" + RoleConstants.ADMIN + "', '" + RoleConstants.USER + "')")
    public ResponseEntity<Asset> getAssetById(@PathVariable Integer assetId) {
        logger.info("Received request to get asset by ID: {}", assetId);
        try {
            Asset asset = assetService.getAssetById(assetId);
            logger.info("Successfully retrieved asset with ID: {}", assetId);
            return ResponseEntity.ok(asset);
        } catch (Exception e) {
            logger.error("Failed to get asset with ID {}: {}", assetId, e.getMessage(), e);
            throw e;
        }
    }

    // List all assets visible to the caller (admins see everything)
    @GetMapping("/getall")
    @PreAuthorize("hasAnyRole('" + RoleConstants.ADMIN + "', '" + RoleConstants.USER + "')")
    public ResponseEntity<List<Asset>> getAllAssets() {
        logger.info("Received request to get all assets");
        try {
            List<Asset> assets = assetService.getAllAssets();
            logger.info("Successfully retrieved {} assets", assets.size());
            return ResponseEntity.ok(assets);
        } catch (Exception e) {
            logger.error("Failed to get all assets: {}", e.getMessage(), e);
            throw e;
        }
    }

    // Filter assets by category name and return matching results
    @GetMapping("/category/{categoryName}")
    @PreAuthorize("hasAnyRole('" + RoleConstants.ADMIN + "', '" + RoleConstants.USER + "')")
    public ResponseEntity<List<Asset>> getAssetsByCategory(@PathVariable String categoryName) {
        logger.info("Received request to get assets by category: {}", categoryName);
        try {
            AssetCategory category = new AssetCategory(categoryName);
            List<Asset> assets = assetService.getAssetsByCategory(category);
            logger.info("Successfully retrieved {} assets for category: {}", assets.size(), categoryName);
            return ResponseEntity.ok(assets);
        } catch (Exception e) {
            logger.error("Failed to get assets by category {}: {}", categoryName, e.getMessage(), e);
            throw e;
        }
    }

    // Remove asset from system (prevents deletion if currently borrowed)
    @DeleteMapping("/delete/{assetId}")
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')")
    public ResponseEntity<Void> deleteAsset(@PathVariable Integer assetId) {
        logger.info("Received request to delete asset with ID: {}", assetId);
        try {
            assetService.deleteAsset(assetId);
            logger.info("Asset successfully deleted with ID: {}", assetId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Failed to delete asset with ID {}: {}", assetId, e.getMessage(), e);
            throw e;
        }
    }
    // List assets currently borrowed by a specific employee
    @GetMapping("/assigned/{employeeId}")
    @PreAuthorize("hasAnyRole('" + RoleConstants.ADMIN + "', '" + RoleConstants.USER + "')")
    public ResponseEntity<List<Asset>> getAssignedAssets(@PathVariable Integer employeeId) {
        logger.info("Received request to get assigned assets for employee ID: {}", employeeId);
        try {
            List<AssetBorrowing> assignedBorrowings = assetBorrowingService.getBorrowingsByEmployee(employeeId);
            
            List<Asset> borrowedAssets = assignedBorrowings.stream()
                    .map(AssetBorrowing::getAsset)
                    .filter(asset -> asset.getStatus() == Asset.Status.Borrowed)
                    .collect(Collectors.toList());

            logger.info("Successfully retrieved {} assigned assets for employee ID: {}", borrowedAssets.size(), employeeId);
            return ResponseEntity.ok(borrowedAssets);
        } catch (Exception e) {
            logger.error("Failed to get assigned assets for employee ID {}: {}", employeeId, e.getMessage(), e);
            throw e;
        }
    }

    // Upload and attach image file to an existing asset
    @PostMapping(value = "/{assetId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')")
    public ResponseEntity<Asset> uploadAssetImage(
            @PathVariable Integer assetId,
            @RequestPart("file") MultipartFile file) throws IOException {
        logger.info("Received request to upload image for asset ID: {}", assetId);
        try {
            // Create "uploads" dir if not exists
            Path uploadDir = Paths.get("Frontend/uploads");
            Files.createDirectories(uploadDir);
            
            // Sanitize filename, ensure uniqueness
            String original = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            String ext = original.contains(".") ? original.substring(original.lastIndexOf('.')) : "";
            String filename = "asset-" + assetId + "-" + UUID.randomUUID() + ext;
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            // Update asset with image URL
            Asset asset = assetService.getAssetById(assetId);
            asset.setImageUrl("/uploads/" + filename);
            Asset updatedAsset = assetService.saveAsset(asset);
            
            logger.info("Image successfully uploaded for asset ID: {}", assetId);
            return ResponseEntity.ok(updatedAsset);
        } catch (Exception e) {
            logger.error("Failed to upload image for asset ID {}: {}", assetId, e.getMessage(), e);
            throw e;
        }
    }
}
