package com.hexaware.assetmanagement.exception;

/** Exception thrown when attempting to create a resource that already exists */
public class ResourceAlreadyExistsException extends RuntimeException  {

	
	private static final long serialVersionUID = 1L;
	
	public ResourceAlreadyExistsException (String message) {
		super(message);
	}

}
