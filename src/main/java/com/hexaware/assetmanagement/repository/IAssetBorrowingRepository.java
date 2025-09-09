package com.hexaware.assetmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.hexaware.assetmanagement.entity.AssetBorrowing;
import com.hexaware.assetmanagement.entity.AssetBorrowing.Status;
import com.hexaware.assetmanagement.entity.Employee;

@Repository
public interface IAssetBorrowingRepository extends JpaRepository<AssetBorrowing, Integer>{
	List<AssetBorrowing> findByEmployee(Employee employee);
	List<AssetBorrowing> findByStatus(Status status);
	@Query("SELECT ab FROM AssetBorrowing ab WHERE ab.employee.employeeId = :employeeId")
    List<AssetBorrowing> findByEmployeeId(int employeeId);
    
    // Find existing pending requests for a specific employee and asset
    @Query("SELECT ab FROM AssetBorrowing ab WHERE ab.employee.employeeId = :employeeId AND ab.asset.assetId = :assetId AND ab.status = :status")
    List<AssetBorrowing> findByEmployeeIdAndAssetIdAndStatus(int employeeId, int assetId, Status status);
    
    // Count borrowing records for a specific asset
    long countByAsset_AssetId(Integer assetId);
}
