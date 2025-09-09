package com.hexaware.assetmanagement.exception;

/** Exception thrown when request validation fails */
public class MethodArgumentNotValidException extends RuntimeException {

	private static final long serialVersionUID = 1L;
	
	public MethodArgumentNotValidException (String message) {
		super(message);

	}
}
