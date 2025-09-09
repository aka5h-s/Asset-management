package com.hexaware.assetmanagement.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Transport shape for asset data in API requests and responses */
@NoArgsConstructor
@AllArgsConstructor
@Data
public class AssetDto {

    public enum Status {
        Available,
        Borrowed
    }

    @NotNull(message = "Asset ID is required")
    private Integer assetId;

    @NotBlank(message = "Asset name is required")
    @Size(max = 60, message = "Asset name must not exceed 60 characters")
    private String assetName;

    @NotBlank(message = "Category name is required")
    @Size(max = 50, message = "Category name must not exceed 50 characters")
    private String categoryName;

    @NotBlank(message = "Asset model is required")
    @Size(max = 50, message = "Asset model must not exceed 50 characters")
    private String assetModel;

    @NotNull(message = "Manufacturing date is required")
    @PastOrPresent(message = "Manufacturing date must be past or present")
    private LocalDate manufacturingDate;

    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;

    @NotNull(message = "Asset value is required")
    @Positive(message = "Asset value must be positive")
    private Double assetValue;

    @NotNull(message = "Status is required")
    private Status status = Status.Available;

    @Size(max = 2048, message = "Description must not exceed 2048 characters")
    private String description;

    private String imageUrl;
}
