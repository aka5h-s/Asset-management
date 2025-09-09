package com.hexaware.assetmanagement.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hexaware.assetmanagement.entity.Asset;
import com.hexaware.assetmanagement.entity.AssetBorrowing;
import com.hexaware.assetmanagement.entity.Employee;
import com.hexaware.assetmanagement.entity.ServiceRequest;
import com.hexaware.assetmanagement.exception.BadRequestException;
import com.hexaware.assetmanagement.exception.ResourceNotFoundException;
import com.hexaware.assetmanagement.repository.IAssetBorrowingRepository;
import com.hexaware.assetmanagement.repository.IAssetRepository;
import com.hexaware.assetmanagement.repository.IEmployeeRepository;
import com.hexaware.assetmanagement.repository.IServiceRequestRepository;

@ExtendWith(MockitoExtension.class)
class ServiceRequestServiceImpTest {

    @Mock
    private IServiceRequestRepository serviceRequestRepository;

    @Mock
    private IEmployeeRepository employeeRepository;

    @Mock
    private IAssetRepository assetRepository;

    @Mock
    private IAssetBorrowingRepository borrowingRepository;

    @InjectMocks
    private ServiceRequestServiceImp serviceRequestService;

    private Employee testEmployee;
    private Asset testAsset;
    private AssetBorrowing testBorrowing;

    @BeforeEach
    void setUp() {
        testEmployee = new Employee();
        testEmployee.setEmployeeId(1);
        testEmployee.setName("Test Employee");

        testAsset = new Asset();
        testAsset.setAssetId(1);
        testAsset.setAssetName("Test Asset");

        testBorrowing = new AssetBorrowing();
        testBorrowing.setBorrowingId(1);
        testBorrowing.setEmployee(testEmployee);
        testBorrowing.setAsset(testAsset);
        testBorrowing.setStatus(AssetBorrowing.Status.ACTIVE);
    }

    @Test
    void testCreateServiceRequest_WhenEmployeeNotFound_ShouldThrowResourceNotFoundException() {
        // Arrange
        when(employeeRepository.findById(1)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            serviceRequestService.createServiceRequest(1, 1, ServiceRequest.IssueType.HARDWARE, "Test description");
        });
    }

    @Test
    void testCreateServiceRequest_WhenAssetNotFound_ShouldThrowResourceNotFoundException() {
        // Arrange
        when(employeeRepository.findById(1)).thenReturn(Optional.of(testEmployee));
        when(assetRepository.findById(1)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            serviceRequestService.createServiceRequest(1, 1, ServiceRequest.IssueType.HARDWARE, "Test description");
        });
    }

    @Test
    void testCreateServiceRequest_WhenEmployeeDoesNotOwnAsset_ShouldThrowBadRequestException() {
        // Arrange
        when(employeeRepository.findById(1)).thenReturn(Optional.of(testEmployee));
        when(assetRepository.findById(1)).thenReturn(Optional.of(testAsset));
        when(borrowingRepository.findByEmployeeIdAndAssetIdAndStatus(1, 1, AssetBorrowing.Status.ACTIVE))
            .thenReturn(Collections.emptyList());

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            serviceRequestService.createServiceRequest(1, 1, ServiceRequest.IssueType.HARDWARE, "Test description");
        });
        
        assertEquals("You can only create a service request for an asset you currently have.", exception.getMessage());
    }

    @Test
    void testCreateServiceRequest_WhenEmployeeOwnsAsset_ShouldCreateSuccessfully() {
        // Arrange
        when(employeeRepository.findById(1)).thenReturn(Optional.of(testEmployee));
        when(assetRepository.findById(1)).thenReturn(Optional.of(testAsset));
        when(borrowingRepository.findByEmployeeIdAndAssetIdAndStatus(1, 1, AssetBorrowing.Status.ACTIVE))
            .thenReturn(Arrays.asList(testBorrowing));
        
        ServiceRequest savedServiceRequest = new ServiceRequest();
        savedServiceRequest.setServiceRequestId(1);
        when(serviceRequestRepository.save(any(ServiceRequest.class))).thenReturn(savedServiceRequest);

        // Act
        ServiceRequest result = serviceRequestService.createServiceRequest(1, 1, ServiceRequest.IssueType.HARDWARE, "Test description");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getServiceRequestId());
        verify(serviceRequestRepository).save(any(ServiceRequest.class));
    }
}
