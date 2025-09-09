package com.hexaware.assetmanagement.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hexaware.assetmanagement.config.RoleConstants;

import com.hexaware.assetmanagement.dto.EmployeeDto;
import com.hexaware.assetmanagement.dto.EmployeeDto.GenderDTO;
import com.hexaware.assetmanagement.entity.Employee;
import com.hexaware.assetmanagement.entity.Employee.Gender;
import com.hexaware.assetmanagement.service.IEmployeeService;

import jakarta.validation.Valid;
/** Handles employee management endpoints */
@CrossOrigin("http://localhost:3000")
@RestController
@RequestMapping("/employees")
@Validated
public class EmployeeController {

	private static final Logger logger = LoggerFactory.getLogger(EmployeeController.class);

	@Autowired
	IEmployeeService employeeService;

	// Create a new employee account and return the registered entity
	@PostMapping("/register")
	public ResponseEntity<Employee> registerEmployee(@Valid @RequestBody EmployeeDto employeeDto) {
		logger.info("Received request to register employee: {}", employeeDto.getName());
		try {
			Employee registeredEmployee = employeeService.registerEmployee(employeeDto);
			logger.info("Employee successfully registered with ID: {}", registeredEmployee.getEmployeeId());
			return new ResponseEntity<>(registeredEmployee, HttpStatus.CREATED);
		} catch (Exception e) {
			logger.error("Failed to register employee: {}", e.getMessage(), e);
			throw e;
		}
	}

	// Fetch employee details by their unique identifier
	@GetMapping("/getEmployeeById/{employeeId}")
	@PreAuthorize("hasAnyRole('" + RoleConstants.ADMIN + "', '" + RoleConstants.USER + "')")
	public ResponseEntity<Employee> getEmployeeById(@PathVariable int employeeId) {
		logger.info("Received request to get employee by ID: {}", employeeId);
		try {
			Employee employee = employeeService.getEmployeeById(employeeId);
			logger.info("Successfully retrieved employee with ID: {}", employeeId);
			return ResponseEntity.ok(employee);
		} catch (Exception e) {
			logger.error("Failed to get employee with ID {}: {}", employeeId, e.getMessage(), e);
			throw e;
		}
	}

	// Modify employee information and return the updated entity
	@PutMapping("/updateEmployee/{employeeId}")
	@PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')")
	public ResponseEntity<Employee> updateEmployee(@Valid @PathVariable  int employeeId, @RequestBody EmployeeDto employeeDetails) {
		logger.info("Received request to update employee with ID: {}", employeeId);
		try {
			Employee updateEmployee = employeeService.updateEmployee(employeeId, employeeDetails);
			logger.info("Employee successfully updated with ID: {}", employeeId);
			return ResponseEntity.ok(updateEmployee);
		} catch (Exception e) {
			logger.error("Failed to update employee with ID {}: {}", employeeId, e.getMessage(), e);
			throw e;
		}
	}

	// Remove employee from the system permanently
	@DeleteMapping("/delete/{employeeId}")
	@PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')")
	public ResponseEntity<Void> deleteEmployee(@PathVariable int employeeId) {
		logger.info("Received request to delete employee with ID: {}", employeeId);
		try {
			employeeService.deleteEmployee(employeeId);
			logger.info("Employee successfully deleted with ID: {}", employeeId);
			return ResponseEntity.noContent().build();
		} catch (Exception e) {
			logger.error("Failed to delete employee with ID {}: {}", employeeId, e.getMessage(), e);
			throw e;
		}
	}

	// List all employees in the system (admin-only view)
	@GetMapping("/getAllEmployee")
	@PreAuthorize("hasRole('" + RoleConstants.ADMIN + "')")
	public ResponseEntity<List<Employee>> getAllEmployee() {
		logger.info("Received request to get all employees");
		try {
			List<Employee> employee = employeeService.getAllEmployee();
			logger.info("Successfully retrieved {} employees", employee.size());
			return ResponseEntity.ok(employee);
		} catch (Exception e) {
			logger.error("Failed to get all employees: {}", e.getMessage(), e);
			throw e;
		}
	}
	
}
