package com.hexaware.assetmanagement.util;

import org.springframework.stereotype.Component;

/**
 * Example class showing how to use SecurityUtil in service classes
 * This demonstrates additional security checks that can be implemented
 * beyond the controller-level @PreAuthorize annotations
 */
@Component
public class SecurityExample {

    /**
     * Example: Check if current user can access specific employee data
     * Users can only access their own data, admins can access all
     */
    public boolean canAccessEmployeeData(int employeeId, String currentUserEmail) {
        // Admin can access all employee data
        if (SecurityUtil.isAdmin()) {
            return true;
        }
        
        // Regular users can only access their own data
        // This would require additional logic to map email to employee ID
        // For demonstration purposes only
        return false;
    }

    /**
     * Example: Check if current user can perform asset operations
     * Only admins can modify assets, users can only view
     */
    public boolean canModifyAsset() {
        return SecurityUtil.hasRole("ADMIN");
    }

    /**
     * Example: Check if current user can view audit information
     * Only admins can view audit data
     */
    public boolean canViewAuditData() {
        return SecurityUtil.isAdmin();
    }

    /**
     * Example: Check if current user can manage service requests
     * Users can create/view their own, admins can manage all
     */
    public boolean canManageAllServiceRequests() {
        return SecurityUtil.hasRole("ADMIN");
    }

    /**
     * Example: Check if current user has any of the specified roles
     * Useful for operations that require multiple role options
     */
    public boolean canPerformAdvancedOperations() {
        return SecurityUtil.hasAnyRole("ADMIN", "MANAGER");
    }

    /**
     * Example: Get current user information for logging/auditing
     */
    public String getCurrentUserForAudit() {
        String email = SecurityUtil.getCurrentUserEmail();
        if (email == null) {
            return "ANONYMOUS";
        }
        return email;
    }
}
