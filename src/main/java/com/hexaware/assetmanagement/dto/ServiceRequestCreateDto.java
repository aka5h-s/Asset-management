package com.hexaware.assetmanagement.dto;

import com.hexaware.assetmanagement.entity.ServiceRequest.IssueType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Transport shape for service request creation data */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceRequestCreateDto {
    @NotNull @Min(1)
    private Integer employeeId;

    @NotNull @Min(1)
    private Integer assetId;

    @NotNull
    private IssueType issueType;

    @NotBlank
    private String description;
}
