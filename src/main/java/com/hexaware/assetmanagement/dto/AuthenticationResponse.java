package com.hexaware.assetmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Transport shape for authentication response containing JWT token */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticationResponse {

    @NotBlank(message = "Token cannot be blank")
    private String token;
}
