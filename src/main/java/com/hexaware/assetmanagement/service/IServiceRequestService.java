package com.hexaware.assetmanagement.service;

import java.util.List;

import com.hexaware.assetmanagement.entity.ServiceRequest;

public interface IServiceRequestService {

	ServiceRequest createServiceRequest(int employeeId, int assetId, ServiceRequest.IssueType issueType, String Description);
	ServiceRequest getServiceRequestById(int serviceRequestId);
	ServiceRequest updateServiceRequestStatus(int serviceRequestId, ServiceRequest.Status status);
	List<ServiceRequest> getServiceRequestsByEmployee(int employeeId);
	List<ServiceRequest> getAllServiceRequests();
	List<ServiceRequest> findByStatus(ServiceRequest.Status status);
}
