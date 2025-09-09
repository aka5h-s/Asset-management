package com.hexaware.assetmanagement.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hexaware.assetmanagement.dto.AssetDto;
import com.hexaware.assetmanagement.entity.Asset;
import com.hexaware.assetmanagement.entity.AssetCategory;
import com.hexaware.assetmanagement.exception.BadRequestException;
import com.hexaware.assetmanagement.exception.ResourceNotFoundException;
import com.hexaware.assetmanagement.repository.IAssetBorrowingRepository;
import com.hexaware.assetmanagement.repository.IAssetCategoryRepository;
import com.hexaware.assetmanagement.repository.IAssetRepository;

import jakarta.transaction.Transactional;

/** Business logic for asset management operations */
@Service
@Transactional
public class AssetServiceImp implements IAssetService {

    @Autowired
    private IAssetRepository assetRepository;
    
    @Autowired
    private IAssetCategoryRepository assetCategoryRepository;
    
    @Autowired
    private IAssetBorrowingRepository borrowingRepository;
    
    private static final Logger logger = LoggerFactory.getLogger(AssetServiceImp.class);
    // Map DTO to entity and persist; returns the saved asset
    @Override
    public Asset addAsset(AssetDto assetDto) {
        logger.info("Received request to add asset: {}", assetDto.getAssetName());
        try {
        	Asset asset = new Asset();
        	asset.setAssetName(assetDto.getAssetName());
            asset.setAssetModel(assetDto.getAssetModel());
            // Find or create category by name
            AssetCategory category = assetCategoryRepository.findByCategoryName(assetDto.getCategoryName())
                .orElse(new AssetCategory(assetDto.getCategoryName()));
            
            // Save the category if it's new
            if (category.getCategoryId() == 0) {
                category = assetCategoryRepository.save(category);
            }
            
            asset.setCategory(category);
            asset.setManufacturingDate(assetDto.getManufacturingDate());
            asset.setExpiryDate(assetDto.getExpiryDate());
            asset.setAssetValue(assetDto.getAssetValue());
            asset.setStatus(Asset.Status.Available);

            Asset savedAsset = assetRepository.save(asset);
            logger.info("Asset successfully added with ID: {}", savedAsset.getAssetId());
            return savedAsset;
        } catch(Exception e) {
            logger.error("Failed to add asset: {}", e.getMessage(), e);
            throw new BadRequestException("Failed to add asset: " + e.getMessage());
        }
    }

    // Update existing asset with new details from DTO
    @Override
    public Asset updateAsset(AssetDto assetDto) {
        logger.info("Received request to update asset with ID: {}", assetDto.getAssetId());
    	// checking if asset exists or not
    	Asset existingAsset = assetRepository.findById(assetDto.getAssetId())
    			.orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + assetDto.getAssetId()));
    	try {
    		existingAsset.setAssetName(assetDto.getAssetName());
            existingAsset.setAssetModel(assetDto.getAssetModel());
            // Find or create category by name
            AssetCategory category = assetCategoryRepository.findByCategoryName(assetDto.getCategoryName())
                .orElse(new AssetCategory(assetDto.getCategoryName()));
            existingAsset.setCategory(category);
            existingAsset.setManufacturingDate(assetDto.getManufacturingDate());
            existingAsset.setExpiryDate(assetDto.getExpiryDate());
            existingAsset.setAssetValue(assetDto.getAssetValue());
            existingAsset.setStatus(Asset.Status.valueOf(assetDto.getStatus().name()));
            existingAsset.setDescription(assetDto.getDescription());
            Asset updatedAsset = assetRepository.save(existingAsset);
            logger.info("Asset successfully updated with ID: {}", existingAsset.getAssetId());
            return updatedAsset;
    	} catch (Exception e) {
            logger.error("Failed to update asset with ID {}: {}", assetDto.getAssetId(), e.getMessage(), e);
    		throw new BadRequestException("Failed to update asset: " + e.getMessage());
    	}
    }

    // Persist asset entity to database
    @Override
    public Asset saveAsset(Asset asset) {
        logger.info("Received request to save asset with ID: {}", asset.getAssetId());
        try {
            Asset savedAsset = assetRepository.save(asset);
            logger.info("Asset successfully saved with ID: {}", savedAsset.getAssetId());
            return savedAsset;
        } catch (Exception e) {
            logger.error("Failed to save asset with ID {}: {}", asset.getAssetId(), e.getMessage(), e);
            throw new BadRequestException("Failed to save asset: " + e.getMessage());
        }
    }

    // Fetch asset by ID or throw not found exception
    @Override
    public Asset getAssetById(Integer assetId) {
        logger.info("Received request to get asset with ID: {}", assetId);
    	Asset asset = assetRepository.findById(assetId)
            .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + assetId));
        logger.info("Successfully retrieved asset with ID: {}", assetId);
        return asset;
    }

    // fkmRetrieve all assets from the database
    @Override
    public List<Asset> getAllAssets() {
        logger.info("Received request to get all assets");
        List<Asset> assets = assetRepository.findAll();
        logger.info("Successfully retrieved {} assets", assets.size());
        return assets;
    }

    // Filter assets by category and return matching results
    @Override
    public List<Asset> getAssetsByCategory(AssetCategory categoryName) {
        logger.info("Received request to get assets by category: {}", categoryName.getCategoryName());
        // getting assets with the given category
    	List<Asset> assets = assetRepository.findAssetByCategory(categoryName);
        if (assets.isEmpty()) {
            logger.warn("No assets found for category: {}", categoryName.getCategoryName());
            throw new ResourceNotFoundException("No assets found for category: " + categoryName.getCategoryName());
        }
        logger.info("Successfully retrieved {} assets for category: {}", assets.size(), categoryName.getCategoryName());
        return assets;
    }

    // Remove asset from system (prevents deletion if currently borrowed)
    @Override
    public void deleteAsset(Integer assetId) {
        logger.info("Received request to delete asset with ID: {}", assetId);
        // checking whether asset exists or not
    	Asset asset = assetRepository.findById(assetId)
            .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + assetId));
    	
    	// Check if asset is currently borrowed
        if (Asset.Status.Borrowed.equals(asset.getStatus())) {
            logger.warn("Cannot delete asset with ID {} as it is currently borrowed", assetId);
            throw new BadRequestException("Asset is borrowed — can't delete.");
        }
        
        // Database cascade will handle related records automatically
        assetRepository.deleteById(assetId);
        logger.info("Asset successfully deleted with ID: {}", assetId);
    }
    
}
