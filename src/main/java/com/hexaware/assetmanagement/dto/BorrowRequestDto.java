package com.hexaware.assetmanagement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Transport shape for asset borrowing request data */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BorrowRequestDto {
    @NotNull @Min(1)
    private Integer employeeId;

    @NotNull @Min(1)
    private Integer assetId;
}
