package com.hexaware.assetmanagement.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import com.hexaware.assetmanagement.config.RoleConstants;

/**
 * Utility class for security-related operations
 * Provides helper methods for checking user roles and permissions
 */
@Component
public class SecurityUtil {

    /**
     * Check if the current user has ADMIN role
     * @return true if user is admin, false otherwise
     */
    public static boolean isAdmin() {
        return hasRole(RoleConstants.ADMIN);
    }

    /**
     * Check if the current user has a specific role
     * @param role the role to check
     * @return true if user has the role, false otherwise
     */
    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> authority.equals("ROLE_" + role));
    }

    /**
     * Check if the current user has any of the specified roles
     * @param roles the roles to check
     * @return true if user has any of the roles, false otherwise
     */
    public static boolean hasAnyRole(String... roles) {
        for (String role : roles) {
            if (hasRole(role)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get the current authenticated user's email
     * @return the user's email or null if not authenticated
     */
    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return authentication.getName();
    }

    /**
     * Check if the current user is authenticated
     * @return true if user is authenticated, false otherwise
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }
}
