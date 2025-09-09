package com.hexaware.assetmanagement.service;


import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.hexaware.assetmanagement.dto.EmployeeDto;
import com.hexaware.assetmanagement.dto.EmployeeDto.GenderDTO;
import com.hexaware.assetmanagement.entity.Employee;
import com.hexaware.assetmanagement.entity.Employee.Gender;
import com.hexaware.assetmanagement.exception.BadRequestException;
import com.hexaware.assetmanagement.exception.ResourceAlreadyExistsException;
import com.hexaware.assetmanagement.exception.ResourceNotFoundException;
import com.hexaware.assetmanagement.repository.IEmployeeRepository;

import jakarta.transaction.Transactional;

/** Business logic for employee management operations */
@Service
public class EmployeeServiceImp implements IEmployeeService {

	@Autowired
	IEmployeeRepository employeeRepository;
	
	@Autowired
	private PasswordEncoder passwordEncoder;
	
	private static final Logger logger = LoggerFactory.getLogger(EmployeeServiceImp.class);

	
	// Map DTO to entity, hash password, and persist new employee
	@Override
	@Transactional
	public Employee registerEmployee(EmployeeDto employeeDto) {
		logger.info("Received request to register employee: {}", employeeDto.getName());

		if (employeeRepository.existsById(employeeDto.getEmployeeId())) {
			logger.warn("Employee with ID {} already exists", employeeDto.getEmployeeId());
			throw new ResourceAlreadyExistsException("Id" + employeeDto.getEmployeeId() + " already exists ");
		}

		try {
			Employee employee = mapToEntity(employeeDto);
			Employee savedEmployee = employeeRepository.save(employee);
			logger.info("Employee successfully registered with ID: {}", savedEmployee.getEmployeeId());
			return savedEmployee;
		} catch(Exception e) {
			logger.error("Failed to register employee: {}", e.getMessage(), e);
			throw new BadRequestException("Failed to add Employee:" + e.getMessage());
		}
	}

	
	// Fetch employee by ID or throw not found exception
	@Override
	public Employee getEmployeeById(int employeeId) {
		logger.info("Received request to get employee with ID: {}", employeeId);
		Employee employee = employeeRepository.findById(employeeId)
				.orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));
		logger.info("Successfully retrieved employee with ID: {}", employeeId);
		return employee;
	}

	// Update employee details and hash password if provided
	@Override
	@Transactional
	public Employee updateEmployee(int employeeId,EmployeeDto employeeDetails) {
		logger.info("Received request to update employee with ID: {}", employeeId);
		
		Employee existingEmployee = employeeRepository.findById(employeeId)
				.orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

		try {
			existingEmployee.setName(employeeDetails.getName());
			existingEmployee.setGender(Gender.valueOf(employeeDetails.getGender().name()));
			existingEmployee.setContactNumber(employeeDetails.getContactNumber());
			existingEmployee.setAddress(employeeDetails.getAddress());
			existingEmployee.setEmail(employeeDetails.getEmail());
			
			// Only update password if it's provided and not empty
			if (employeeDetails.getPassword() != null && !employeeDetails.getPassword().trim().isEmpty()) {
				existingEmployee.setPassword(passwordEncoder.encode(employeeDetails.getPassword()));
				logger.info("Password updated for employee with ID: {}", employeeId);
			} else {
				logger.info("Password not updated for employee with ID: {} (empty or null)", employeeId);
			}
			
			existingEmployee.setRole(Employee.Role.valueOf(employeeDetails.getRole()));

			Employee updatedEmployee = employeeRepository.save(existingEmployee);
			logger.info("Employee successfully updated with ID: {}", employeeId);
			return updatedEmployee;
		} catch (Exception e) {
			logger.error("Failed to update employee with ID {}: {}", employeeId, e.getMessage(), e);
			throw new BadRequestException("Failed to update Employee:" + e.getMessage());
		}
	}

	
	// Remove employee from the system permanently
	@Override
	@Transactional
	public void deleteEmployee(int employeeId) {
		logger.info("Received request to delete employee with ID: {}", employeeId);
		try {
			employeeRepository.deleteById(employeeId);
			logger.info("Employee successfully deleted with ID: {}", employeeId);
		} catch (Exception e) {
			logger.error("Failed to delete employee with ID {}: {}", employeeId, e.getMessage(), e);
			throw new BadRequestException("Failed to delete Employee: " + e.getMessage());
		}
	}

	// Retrieve all employees from the database
	@Override
	public List<Employee> getAllEmployee() {
		logger.info("Received request to get all employees");
		List<Employee> employee = employeeRepository.findAll();

		if (employee.isEmpty()) {
			logger.warn("No employees found in the system");
			throw new ResourceNotFoundException("No Employee List exists ");
		}

		logger.info("Successfully retrieved {} employees", employee.size());
		return employee;
	}

	// Validate employee credentials and return employee ID
	@Override
	public int findByEmailandPassword(String email, String password) {

		try {

			logger.info("Trying to find Employee Email and Password");
			return employeeRepository.findByEmailAndPassword(email, password);

		} catch (Exception e) {

			throw new ResourceNotFoundException("Entered email and password does not exist" + email + password);
		}

	}

	// Check if employee with given email already exists
	@Override
	public boolean existsByEmail(String email) {

		try {

			logger.info("Checking if Employee email exists");
			return employeeRepository.existsByEmail(email);

		} catch (Exception e) {

			throw new ResourceNotFoundException("Employee with email: " + email + "does not exist ");
		}

	}
	
	
		// Convert DTO to entity with password hashing
		public Employee mapToEntity(EmployeeDto employeeDto) {
			
			Employee employee = new Employee();
			if (employeeDto.getEmployeeId() != 0) {
		        employee.setEmployeeId(employeeDto.getEmployeeId());
		    }
			employee.setName(employeeDto.getName());
			employee.setGender(Gender.valueOf(employeeDto.getGender().name()));
			employee.setContactNumber(employeeDto.getContactNumber());
			employee.setAddress(employeeDto.getAddress());
			employee.setEmail(employeeDto.getEmail());
			// Hash the password before setting it (for registration, password should always be provided)
			employee.setPassword(passwordEncoder.encode(employeeDto.getPassword()));
			employee.setRole(Employee.Role.valueOf(employeeDto.getRole()));
			
			return employee;
		}
		

		// Convert entity to DTO for API responses
		public EmployeeDto mapToDTO(Employee employee) {
			
			return new EmployeeDto(
					employee.getEmployeeId(),
					employee.getName(),
					GenderDTO.valueOf(employee.getGender().name()),
					employee.getContactNumber(),
					employee.getAddress(),
					employee.getEmail(),
					employee.getPassword(),
					employee.getRole().name()
					);

		}
		
}
