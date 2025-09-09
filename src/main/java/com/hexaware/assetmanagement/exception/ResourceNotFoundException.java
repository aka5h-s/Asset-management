package com.hexaware.assetmanagement.exception;

/** Exception thrown when a requested resource is not found */
public class ResourceNotFoundException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
