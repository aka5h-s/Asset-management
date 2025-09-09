package com.hexaware.assetmanagement.dto;

import com.hexaware.assetmanagement.entity.Employee.Gender;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Transport shape for user registration data */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 60, message = "Name must not exceed 60 characters")
    private String name;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotBlank(message = "Contact number is required")
    @Size(max = 15, message = "Contact number must not exceed 15 characters")
    private String contactNumber;

    @NotBlank(message = "Address is required")
    @Size(max = 200, message = "Address must not exceed 200 characters")
    private String address;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 50, message = "Password must be between 6 and 50 characters")
    private String password;

    private String role; // Defaults to USER when null
}
