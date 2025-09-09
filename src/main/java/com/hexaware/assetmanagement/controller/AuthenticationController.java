package com.hexaware.assetmanagement.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hexaware.assetmanagement.config.JwtService;
import com.hexaware.assetmanagement.dto.AuthenticationRequest;
import com.hexaware.assetmanagement.dto.AuthenticationResponse;
import com.hexaware.assetmanagement.dto.RegisterRequest;
import com.hexaware.assetmanagement.entity.Employee;
import com.hexaware.assetmanagement.exception.ResourceAlreadyExistsException;
import com.hexaware.assetmanagement.repository.IEmployeeRepository;
/** Handles user authentication and registration endpoints */
@CrossOrigin("http://localhost:3000")
@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationController.class);

    @Autowired
    private IEmployeeRepository employeeRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private AuthenticationManager authenticationManager;

    // Create new user account with email validation and password hashing
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        logger.info("Received registration request for email: {}", request.getEmail());
        try {
            // Check if email already exists
            if (employeeRepository.findByEmail(request.getEmail()).isPresent()) {
                logger.warn("Registration failed - email already exists: {}", request.getEmail());
                throw new ResourceAlreadyExistsException("Email already registered");
            }
            
            Employee employee = new Employee();
            // Set employee properties from request
            employee.setName(request.getName());
            employee.setGender(request.getGender());
            employee.setContactNumber(request.getContactNumber());
            employee.setAddress(request.getAddress());
            employee.setEmail(request.getEmail());
            employee.setPassword(passwordEncoder.encode(request.getPassword()));
            
            // Set role - default to USER if not provided or invalid
            String roleString = request.getRole();
            if (roleString == null || roleString.trim().isEmpty()) {
                employee.setRole(Employee.Role.USER);
            } else {
                try {
                    employee.setRole(Employee.Role.valueOf(roleString.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    employee.setRole(Employee.Role.USER); // Default to USER for invalid roles
                }
            }

            employeeRepository.save(employee);
            logger.info("User successfully registered with email: {}", request.getEmail());
            return ResponseEntity.ok("User registered successfully");
        } catch (Exception e) {
            logger.error("Failed to register user with email {}: {}", request.getEmail(), e.getMessage(), e);
            throw e;
        }
    }

    // Validate credentials and return JWT token for authenticated users
    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        logger.info("Received authentication request for email: {}", request.getEmail());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
            
            Employee employee = employeeRepository.findByEmail(request.getEmail())
                    .orElseThrow();
            String jwtToken = jwtService.generateToken(employee);
            logger.info("User successfully authenticated: {}", request.getEmail());
            return ResponseEntity.ok(new AuthenticationResponse(jwtToken));
        } catch (Exception e) {
            logger.error("Authentication failed for email {}: {}", request.getEmail(), e.getMessage(), e);
            throw e;
        }
    }
}
