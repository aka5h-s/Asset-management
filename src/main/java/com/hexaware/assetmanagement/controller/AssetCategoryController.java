package com.hexaware.assetmanagement.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hexaware.assetmanagement.config.RoleConstants;
import com.hexaware.assetmanagement.entity.AssetCategory;
import com.hexaware.assetmanagement.service.IAssetCategoryService;

import jakarta.validation.Valid;

/** Handles asset category management endpoints */
@CrossOrigin("http://localhost:3000")
@RestController
@RequestMapping("/asset-categories")
public class AssetCategoryController {

    private static final Logger logger = LoggerFactory.getLogger(AssetCategoryController.class);

    @Autowired
    private IAssetCategoryService categoryService;

    // Create new asset category and return the saved entity
    @PostMapping("/add")
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')")
    public ResponseEntity<AssetCategory> addCategory(@Valid @RequestBody AssetCategory category) {
        logger.info("Received request to add new category: {}", category.getCategoryName());
        try {
            AssetCategory newCategory = categoryService.addCategory(category);
            logger.info("Category successfully added with ID: {}", newCategory.getCategoryId());
            return new ResponseEntity<>(newCategory, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Failed to add category: {}", e.getMessage(), e);
            throw e;
        }
    }

    // Modify existing category details and return the updated entity
    @PutMapping("/update/{categoryId}")
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')")
    public ResponseEntity<AssetCategory> updateCategory(@PathVariable int categoryId, @Valid @RequestBody AssetCategory category) {
        logger.info("Received request to update category with ID: {}", categoryId);
        try {
            category.setCategoryId(categoryId);
            AssetCategory updatedCategory = categoryService.updateCategory(category);
            logger.info("Category successfully updated with ID: {}", categoryId);
            return ResponseEntity.ok(updatedCategory);
        } catch (Exception e) {
            logger.error("Failed to update category with ID {}: {}", categoryId, e.getMessage(), e);
            throw e;
        }
    }

    // Fetch specific category by its unique identifier
    @GetMapping("/getbyid/{categoryId}")
    @PreAuthorize("hasAnyRole('" + RoleConstants.ADMIN + "', '" + RoleConstants.USER + "')")
    public ResponseEntity<AssetCategory> getCategoryById(@PathVariable int categoryId) {
        logger.info("Received request to get category by ID: {}", categoryId);
        try {
            AssetCategory category = categoryService.getCategoryById(categoryId);
            logger.info("Successfully retrieved category with ID: {}", categoryId);
            return ResponseEntity.ok(category);
        } catch (Exception e) {
            logger.error("Failed to get category with ID {}: {}", categoryId, e.getMessage(), e);
            throw e;
        }
    }

    // List all available asset categories
    @GetMapping("/getall")
    @PreAuthorize("hasAnyRole('" + RoleConstants.ADMIN + "', '" + RoleConstants.USER + "')")
    public ResponseEntity<List<AssetCategory>> getAllCategories() {
        logger.info("Received request to get all categories");
        try {
            List<AssetCategory> categories = categoryService.getAllCategories();
            logger.info("Successfully retrieved {} categories", categories.size());
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            logger.error("Failed to get all categories: {}", e.getMessage(), e);
            throw e;
        }
    }

    // Find category by its name (case-sensitive lookup)
    @GetMapping("/getbyname/{categoryName}")
    @PreAuthorize("hasAnyRole('" + RoleConstants.ADMIN + "', '" + RoleConstants.USER + "')")
    public ResponseEntity<AssetCategory> getCategoryByName(@PathVariable String categoryName) {
        logger.info("Received request to get category by name: {}", categoryName);
        try {
            AssetCategory category = categoryService.getCategoryByName(categoryName);
            logger.info("Successfully retrieved category: {}", categoryName);
            return ResponseEntity.ok(category);
        } catch (Exception e) {
            logger.error("Failed to get category by name {}: {}", categoryName, e.getMessage(), e);
            throw e;
        }
    }

    // Remove category from system (prevents deletion if assets exist)
    @DeleteMapping("/delete/{categoryId}")
    @PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')")
    public ResponseEntity<Void> deleteCategory(@PathVariable int categoryId) {
        logger.info("Received request to delete category with ID: {}", categoryId);
        try {
            categoryService.deleteCategory(categoryId);
            logger.info("Category successfully deleted with ID: {}", categoryId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Failed to delete category with ID {}: {}", categoryId, e.getMessage(), e);
            throw e;
        }
    }
}
