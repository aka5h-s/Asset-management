package com.hexaware.assetmanagement.service;


import java.util.List;

import com.hexaware.assetmanagement.dto.EmployeeDto;
import com.hexaware.assetmanagement.entity.Employee;

public interface IEmployeeService {
	
	Employee registerEmployee(EmployeeDto employeeDto);
	Employee getEmployeeById(int employeeId);
	Employee updateEmployee(int employeeId, EmployeeDto employeeDetails);
	void deleteEmployee(int employeeId);
	List<Employee> getAllEmployee();
	int findByEmailandPassword(String email, String password);
	boolean existsByEmail(String email);

}
