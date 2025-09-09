package com.hexaware.assetmanagement.service;


import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hexaware.assetmanagement.entity.Asset;
import com.hexaware.assetmanagement.entity.AssetBorrowing;
import com.hexaware.assetmanagement.entity.Employee;
import com.hexaware.assetmanagement.entity.ServiceRequest;
import com.hexaware.assetmanagement.entity.ServiceRequest.Status;
import com.hexaware.assetmanagement.exception.BadRequestException;
import com.hexaware.assetmanagement.exception.ResourceNotFoundException;
import com.hexaware.assetmanagement.repository.IAssetBorrowingRepository;
import com.hexaware.assetmanagement.repository.IAssetRepository;
import com.hexaware.assetmanagement.repository.IEmployeeRepository;
import com.hexaware.assetmanagement.repository.IServiceRequestRepository;

import jakarta.transaction.Transactional;

/** Business logic for service request management operations */
@Service
public class ServiceRequestServiceImp implements IServiceRequestService {

	@Autowired
	private IServiceRequestRepository serviceRequestRepository;
	
	
	@Autowired
	private IEmployeeRepository employeeRepository;
	
	@Autowired
	private IAssetRepository assetRepository;
	
	@Autowired
	private IAssetBorrowingRepository borrowingRepository;
	
	private static final Logger logger = LoggerFactory.getLogger(ServiceRequestServiceImp.class);
	
	
	// Create service request for borrowed asset (validates ownership)
	@Override
	@Transactional
	public ServiceRequest createServiceRequest(int employeeId, int assetId, ServiceRequest.IssueType issueType, String Description) {
		logger.info("Received request to create service request for employee {} and asset {} with issue type: {}", 
			employeeId, assetId, issueType);
		
		try {
		Employee e1 = employeeRepository.findById(employeeId)
				.orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));
		
		Asset a1 = assetRepository.findById(assetId)
				.orElseThrow(() -> new ResourceNotFoundException("Asset Not Found with id " + assetId));
		
		// Validate ownership - check if employee currently has this asset borrowed
		List<AssetBorrowing> activeBorrowings = borrowingRepository.findByEmployeeIdAndAssetIdAndStatus(
			employeeId, assetId, AssetBorrowing.Status.ACTIVE);
		
		if (activeBorrowings.isEmpty()) {
			logger.warn("Employee {} attempted to create service request for asset {} they don't currently possess", 
				employeeId, assetId);
			throw new BadRequestException("You can only create a service request for an asset you currently have.");
		}
		
		ServiceRequest serviceRequest = new ServiceRequest();
		
		serviceRequest.setEmployee(e1);
		serviceRequest.setAsset(a1);
		serviceRequest.setDescription(Description);
		serviceRequest.setIssueType(issueType);
		serviceRequest.setStatus(Status.Pending);
		serviceRequest.setRequestedAt(LocalDateTime.now());
		
		ServiceRequest savedServiceRequest = serviceRequestRepository.save(serviceRequest);
		logger.info("Service request successfully created with ID: {} for employee {} and asset {}", 
			savedServiceRequest.getServiceRequestId(), employeeId, assetId);
		return savedServiceRequest;
		}
		catch(BadRequestException e) {
			// Re-throw BadRequestException as-is
			throw e;
		}
		catch(Exception e) {
			logger.error("Failed to create service request for employee {} and asset {}: {}", 
				employeeId, assetId, e.getMessage(), e);
			throw new BadRequestException("Failed to create a new Service Request");
		}
	}

	
	// Fetch service request by ID or throw not found exception
	@Override
	public ServiceRequest getServiceRequestById(int serviceRequestId) {
		logger.info("Received request to get service request with ID: {}", serviceRequestId);
		ServiceRequest serviceRequest = serviceRequestRepository.findById(serviceRequestId)
				.orElseThrow(() -> new ResourceNotFoundException("Service Request not found with id " + serviceRequestId) );
		logger.info("Successfully retrieved service request with ID: {}", serviceRequestId);
		return serviceRequest;
	}
	
	
	// Update service request status (Pending, Transit, Completed)
	@Override
	@Transactional
	public ServiceRequest updateServiceRequestStatus(int serviceRequestId, ServiceRequest.Status status) {
		logger.info("Received request to update service request status for ID: {} to status: {}", serviceRequestId, status);
		ServiceRequest serviceRequest = serviceRequestRepository.findById(serviceRequestId)
				.orElseThrow(() -> new ResourceNotFoundException("Service Request Not Found"));
		
		serviceRequest.setStatus(status);
		ServiceRequest updatedServiceRequest = serviceRequestRepository.save(serviceRequest);
		
		logger.info("Service request status successfully updated for ID: {} to status: {}", serviceRequestId, status);
		return updatedServiceRequest;
	}
	

	// List all service requests for a specific employee
	@Override
	public List<ServiceRequest> getServiceRequestsByEmployee(int employeeId) {
		logger.info("Received request to get service requests for employee ID: {}", employeeId);
		
		try {
			List<ServiceRequest> serviceRequests = serviceRequestRepository.findByEmployeeEmployeeId(employeeId);
			logger.info("Successfully retrieved {} service requests for employee ID: {}", serviceRequests.size(), employeeId);
			return serviceRequests;
		} catch(Exception e) {
			logger.error("Failed to get service requests for employee ID {}: {}", employeeId, e.getMessage(), e);
			throw new ResourceNotFoundException("Service Request for Employee does not exist" + employeeId);
		}
	}

	
	// Retrieve all service requests from the database
	@Override
	public List<ServiceRequest> getAllServiceRequests() {
		logger.info("Received request to get all service requests");
		List<ServiceRequest> serviceRequests = serviceRequestRepository.findAll();
		logger.info("Successfully retrieved {} service requests", serviceRequests.size());
		return serviceRequests;
	}

	
	// Filter service requests by their current status
	@Override
	public List<ServiceRequest> findByStatus(ServiceRequest.Status status) {
		logger.info("Received request to get service requests by status: {}", status);
		List<ServiceRequest> serviceRequests = serviceRequestRepository.findByStatus(status);
		logger.info("Successfully retrieved {} service requests with status: {}", serviceRequests.size(), status);
		return serviceRequests;
	}
	
}
