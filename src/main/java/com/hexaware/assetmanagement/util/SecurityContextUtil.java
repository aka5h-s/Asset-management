package com.hexaware.assetmanagement.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.hexaware.assetmanagement.entity.Employee;

/**
 * Utility class for extracting user information from Spring Security context
 */
@Component
public class SecurityContextUtil {

    /**
     * Get the current authenticated user's employee ID
     * @return Employee ID of the current user
     * @throws IllegalStateException if no user is authenticated
     */
    public static int getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }
        
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof Employee) {
            return ((Employee) principal).getEmployeeId();
        }
        
        throw new IllegalStateException("Unable to extract user ID from security context");
    }

    /**
     * Get the current authenticated user's email
     * @return Email of the current user
     * @throws IllegalStateException if no user is authenticated
     */
    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }
        
        return authentication.getName();
    }

    /**
     * Get the current authenticated user
     * @return Employee object of the current user
     * @throws IllegalStateException if no user is authenticated
     */
    public static Employee getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }
        
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof Employee) {
            return (Employee) principal;
        }
        
        throw new IllegalStateException("Unable to extract user from security context");
    }
}
