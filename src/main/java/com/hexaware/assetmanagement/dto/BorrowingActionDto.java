package com.hexaware.assetmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Transport shape for borrowing action requests (approve/reject) */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BorrowingActionDto {
    
    @NotNull(message = "Action is required")
    @Schema(description = "Action to perform on the borrowing request", 
            example = "APPROVE", 
            allowableValues = {"APPROVE", "REJECT"})
    private BorrowingAction action;
    
    @Schema(description = "Available actions for borrowing requests")
    public enum BorrowingAction {
        @Schema(description = "Approve the borrowing request")
        APPROVE,
        @Schema(description = "Reject the borrowing request")
        REJECT
    }
}
