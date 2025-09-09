package com.hexaware.assetmanagement.dto;

import java.time.LocalDateTime;

import com.hexaware.assetmanagement.entity.AssetAudit;

/** Transport shape for asset audit data in API responses */
public class AssetAuditDto {
    
    public enum AuditStatusDto {
        PENDING,
        VERIFIED,
        REJECTED
    }
    
    private int auditId;
    private int employeeId;
    private String employeeName;
    private int assetId;
    private String assetName;
    private AuditStatusDto auditStatus;
    private LocalDateTime requestedAt;
    private LocalDateTime updatedAt;
    
    public AssetAuditDto() {
        super();
    }
    
    public AssetAuditDto(int auditId, int employeeId, String employeeName, int assetId, String assetName,
            AuditStatusDto auditStatus, LocalDateTime requestedAt, LocalDateTime updatedAt) {
        super();
        this.auditId = auditId;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.assetId = assetId;
        this.assetName = assetName;
        this.auditStatus = auditStatus;
        this.requestedAt = requestedAt;
        this.updatedAt = updatedAt;
    }
    
    public static AssetAuditDto fromEntity(AssetAudit audit) {
        AssetAuditDto dto = new AssetAuditDto();
        dto.setAuditId(audit.getAuditId());
        dto.setEmployeeId(audit.getEmployee().getEmployeeId());
        dto.setEmployeeName(audit.getEmployee().getName());
        dto.setAssetId(audit.getAsset().getAssetId());
        dto.setAssetName(audit.getAsset().getAssetName());
        dto.setAuditStatus(AuditStatusDto.valueOf(audit.getAuditStatus().name()));
        dto.setRequestedAt(audit.getRequestedAt());
        dto.setUpdatedAt(audit.getUpdatedAt());
        return dto;
    }
    
    public int getAuditId() {
        return auditId;
    }
    
    public void setAuditId(int auditId) {
        this.auditId = auditId;
    }
    
    public int getEmployeeId() {
        return employeeId;
    }
    
    public void setEmployeeId(int employeeId) {
        this.employeeId = employeeId;
    }
    
    public String getEmployeeName() {
        return employeeName;
    }
    
    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }
    
    public int getAssetId() {
        return assetId;
    }
    
    public void setAssetId(int assetId) {
        this.assetId = assetId;
    }
    
    public String getAssetName() {
        return assetName;
    }
    
    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }
    
    public AuditStatusDto getAuditStatus() {
        return auditStatus;
    }
    
    public void setAuditStatus(AuditStatusDto auditStatus) {
        this.auditStatus = auditStatus;
    }
    
    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }
    
    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @Override
    public String toString() {
        return "AssetAuditDto [auditId=" + auditId + ", employeeId=" + employeeId + ", employeeName=" + employeeName
                + ", assetId=" + assetId + ", assetName=" + assetName + ", auditStatus=" + auditStatus
                + ", requestedAt=" + requestedAt + ", updatedAt=" + updatedAt + "]";
    }
}
