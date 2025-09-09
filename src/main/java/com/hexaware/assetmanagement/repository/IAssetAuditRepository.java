package com.hexaware.assetmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hexaware.assetmanagement.entity.AssetAudit;
import com.hexaware.assetmanagement.entity.AssetAudit.AuditStatus;
import com.hexaware.assetmanagement.entity.Employee;
@Repository
public interface IAssetAuditRepository extends JpaRepository<AssetAudit, Integer> {
	List<AssetAudit> findByEmployee(Employee employee);
	List<AssetAudit> findByAuditStatus(AuditStatus auditStatus);
}
