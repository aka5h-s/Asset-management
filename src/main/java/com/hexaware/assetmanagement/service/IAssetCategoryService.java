package com.hexaware.assetmanagement.service;

import java.util.List;

import com.hexaware.assetmanagement.entity.AssetCategory;

public interface IAssetCategoryService {
    public AssetCategory addCategory(AssetCategory category);
    public AssetCategory updateCategory(AssetCategory category);
    public AssetCategory getCategoryById(int categoryId);
    public List<AssetCategory> getAllCategories();
    public AssetCategory getCategoryByName(String categoryName);
    public void deleteCategory(int categoryId);
}
