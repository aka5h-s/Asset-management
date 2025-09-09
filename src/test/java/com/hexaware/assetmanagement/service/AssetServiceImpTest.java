package com.hexaware.assetmanagement.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hexaware.assetmanagement.entity.Asset;
import com.hexaware.assetmanagement.exception.BadRequestException;
import com.hexaware.assetmanagement.exception.ResourceNotFoundException;
import com.hexaware.assetmanagement.repository.IAssetBorrowingRepository;
import com.hexaware.assetmanagement.repository.IAssetCategoryRepository;
import com.hexaware.assetmanagement.repository.IAssetRepository;

@ExtendWith(MockitoExtension.class)
class AssetServiceImpTest {

    @Mock
    private IAssetRepository assetRepository;

    @Mock
    private IAssetCategoryRepository assetCategoryRepository;

    @Mock
    private IAssetBorrowingRepository borrowingRepository;

    @InjectMocks
    private AssetServiceImp assetService;

    private Asset testAsset;

    @BeforeEach
    void setUp() {
        testAsset = new Asset();
        testAsset.setAssetId(1);
        testAsset.setAssetName("Test Asset");
        testAsset.setStatus(Asset.Status.Available);
    }

    @Test
    void testDeleteAsset_WhenAssetNotFound_ShouldThrowResourceNotFoundException() {
        // Arrange
        when(assetRepository.findById(1)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            assetService.deleteAsset(1);
        });
    }

    @Test
    void testDeleteAsset_WhenAssetIsBorrowed_ShouldThrowBadRequestException() {
        // Arrange
        testAsset.setStatus(Asset.Status.Borrowed);
        when(assetRepository.findById(1)).thenReturn(Optional.of(testAsset));

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            assetService.deleteAsset(1);
        });
        
        assertEquals("Asset is borrowed — can't delete.", exception.getMessage());
    }

    @Test
    void testDeleteAsset_WhenAssetHasBorrowingHistory_ShouldThrowBadRequestException() {
        // Arrange
        when(assetRepository.findById(1)).thenReturn(Optional.of(testAsset));
        when(borrowingRepository.countByAsset_AssetId(1)).thenReturn(2L);

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            assetService.deleteAsset(1);
        });
        
        assertEquals("Asset has related borrowing records — can't delete.", exception.getMessage());
    }

    @Test
    void testDeleteAsset_WhenAssetCanBeDeleted_ShouldDeleteSuccessfully() {
        // Arrange
        when(assetRepository.findById(1)).thenReturn(Optional.of(testAsset));
        when(borrowingRepository.countByAsset_AssetId(1)).thenReturn(0L);

        // Act
        assertDoesNotThrow(() -> {
            assetService.deleteAsset(1);
        });

        // Assert
        verify(assetRepository).deleteById(1);
    }
}
