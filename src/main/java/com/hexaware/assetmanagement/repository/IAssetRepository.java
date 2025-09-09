package com.hexaware.assetmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hexaware.assetmanagement.entity.Asset;
import com.hexaware.assetmanagement.entity.Asset.Status;
import com.hexaware.assetmanagement.entity.AssetCategory;
@Repository
public interface IAssetRepository extends JpaRepository<Asset, Integer> {
	List<Asset> findAssetByCategory(AssetCategory categoryName);
	List<Asset> findByStatus(Status status);
	
	// Count assets by category ID
	long countByCategory_CategoryId(Integer categoryId);
}
