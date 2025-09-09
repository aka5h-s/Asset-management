package com.hexaware.assetmanagement.service;

import java.util.List;

import com.hexaware.assetmanagement.dto.AssetDto;
import com.hexaware.assetmanagement.entity.Asset;
import com.hexaware.assetmanagement.entity.AssetCategory;

public interface IAssetService {
	public Asset addAsset(AssetDto assetDto);
	public Asset updateAsset(AssetDto assetDto);
	public Asset saveAsset(Asset asset);
    public Asset getAssetById(Integer assetId);
    public List<Asset> getAllAssets();
    public List<Asset> getAssetsByCategory(AssetCategory categoryName);
    public void deleteAsset(Integer assetId);
}
