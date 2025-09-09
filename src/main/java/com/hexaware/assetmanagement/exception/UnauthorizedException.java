package com.hexaware.assetmanagement.exception;

/** Exception thrown when user lacks permission for the requested action */
public class UnauthorizedException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public UnauthorizedException(String message) {
		
		super(message);
	}
}
