package com.hexaware.assetmanagement.service;

import java.util.List;

import com.hexaware.assetmanagement.dto.AssetAuditDto;
import com.hexaware.assetmanagement.entity.AssetAudit;

public interface IAssetAuditService {
	public AssetAudit sendAudit(int employeeId, int assetId);
	public AssetAuditDto decideAudit(int auditId, int employeeId, String action);
	public List<AssetAudit> getAuditsByEmployee(int employeeId);
	public List<AssetAudit> getAllAudits();
	public AssetAudit getAuditById(int auditId);
}
