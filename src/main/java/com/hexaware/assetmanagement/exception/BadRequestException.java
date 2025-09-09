package com.hexaware.assetmanagement.exception;

/** Exception thrown for invalid request parameters or business logic violations */
public class BadRequestException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public BadRequestException(String message) {
        super(message);
    }
}
