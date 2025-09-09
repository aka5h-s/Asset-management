package com.hexaware.assetmanagement.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hexaware.assetmanagement.entity.AssetCategory;

@Repository
public interface IAssetCategoryRepository extends JpaRepository<AssetCategory, Integer> {
    Optional<AssetCategory> findByCategoryName(String categoryName);
}
