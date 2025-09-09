package com.hexaware.assetmanagement.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hexaware.assetmanagement.entity.AssetCategory;
import com.hexaware.assetmanagement.exception.BadRequestException;
import com.hexaware.assetmanagement.exception.ResourceNotFoundException;
import com.hexaware.assetmanagement.repository.IAssetCategoryRepository;
import com.hexaware.assetmanagement.repository.IAssetRepository;

import jakarta.transaction.Transactional;

/** Business logic for asset category management operations */
@Service
@Transactional
public class AssetCategoryServiceImp implements IAssetCategoryService {

    @Autowired
    private IAssetCategoryRepository categoryRepository;
    
    @Autowired
    private IAssetRepository assetRepository;
    
    private static final Logger logger = LoggerFactory.getLogger(AssetCategoryServiceImp.class);

    // Create new category and validate uniqueness
    @Override
    public AssetCategory addCategory(AssetCategory category) {
        logger.info("Received request to add category: {}", category.getCategoryName());
        try {
            // Check if category already exists
            if (categoryRepository.findByCategoryName(category.getCategoryName()).isPresent()) {
                logger.warn("Category with name '{}' already exists", category.getCategoryName());
                throw new RuntimeException("Category with name '" + category.getCategoryName() + "' already exists");
            }
            
            AssetCategory savedCategory = categoryRepository.save(category);
            logger.info("Category successfully added with ID: {} and name: {}", savedCategory.getCategoryId(), savedCategory.getCategoryName());
            return savedCategory;
        } catch (Exception e) {
            logger.error("Failed to add category: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to add category: " + e.getMessage());
        }
    }

    // Update existing category details
    @Override
    public AssetCategory updateCategory(AssetCategory category) {
        logger.info("Received request to update category with ID: {}", category.getCategoryId());
        try {
            // Check if category exists
            if (!categoryRepository.existsById(category.getCategoryId())) {
                logger.warn("Category not found with ID: {}", category.getCategoryId());
                throw new ResourceNotFoundException("Category not found with id: " + category.getCategoryId());
            }
            
            AssetCategory updatedCategory = categoryRepository.save(category);
            logger.info("Category successfully updated with ID: {} and name: {}", updatedCategory.getCategoryId(), updatedCategory.getCategoryName());
            return updatedCategory;
        } catch (Exception e) {
            logger.error("Failed to update category with ID {}: {}", category.getCategoryId(), e.getMessage(), e);
            throw new RuntimeException("Failed to update category: " + e.getMessage());
        }
    }

    // Fetch category by ID or throw not found exception
    @Override
    public AssetCategory getCategoryById(int categoryId) {
        logger.info("Received request to get category with ID: {}", categoryId);
        AssetCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        logger.info("Successfully retrieved category with ID: {}", categoryId);
        return category;
    }

    // Retrieve all categories from the database
    @Override
    public List<AssetCategory> getAllCategories() {
        logger.info("Received request to get all categories");
        List<AssetCategory> categories = categoryRepository.findAll();
        logger.info("Successfully retrieved {} categories", categories.size());
        return categories;
    }

    // Find category by name (case-sensitive lookup)
    @Override
    public AssetCategory getCategoryByName(String categoryName) {
        logger.info("Received request to get category by name: {}", categoryName);
        AssetCategory category = categoryRepository.findByCategoryName(categoryName)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with name: " + categoryName));
        logger.info("Successfully retrieved category: {}", categoryName);
        return category;
    }

    // Remove category from system (prevents deletion if assets exist)
    @Override
    public void deleteCategory(int categoryId) {
        logger.info("Received request to delete category with ID: {}", categoryId);
        try {
            // Check if category exists
            AssetCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
            
            // Check if category has any assets
            long assetCount = assetRepository.countByCategory_CategoryId(categoryId);
            if (assetCount > 0) {
                logger.warn("Cannot delete category '{}' with ID {} - {} assets are using this category", 
                    category.getCategoryName(), categoryId, assetCount);
                throw new BadRequestException(
                    String.format("Cannot delete category '%s' - %d assets are using this category. " +
                    "Please delete or reassign the assets first.", category.getCategoryName(), assetCount)
                );
            }
            
            categoryRepository.deleteById(categoryId);
            logger.info("Category successfully deleted with ID: {}", categoryId);
        } catch (BadRequestException | ResourceNotFoundException e) {
            // Re-throw these specific exceptions as-is
            throw e;
        } catch (Exception e) {
            logger.error("Failed to delete category with ID {}: {}", categoryId, e.getMessage(), e);
            throw new RuntimeException("Failed to delete category: " + e.getMessage());
        }
    }
}
