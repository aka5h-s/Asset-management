package com.hexaware.assetmanagement.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.hexaware.assetmanagement.entity.Employee;
import com.hexaware.assetmanagement.entity.ServiceRequest;
import com.hexaware.assetmanagement.entity.ServiceRequest.Status;

@Repository
public interface IServiceRequestRepository extends JpaRepository<ServiceRequest, Integer> {

	List<ServiceRequest> findByEmployeeEmployeeId(int employeeId);
	
	
	List<ServiceRequest> findByStatus(Status status);
	
	
	List<ServiceRequest> findByEmployeeAndStatus(Employee employee, Status status);
}
