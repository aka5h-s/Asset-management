package com.hexaware.assetmanagement.service;

import java.util.List;

import com.hexaware.assetmanagement.dto.BorrowingActionDto;
import com.hexaware.assetmanagement.entity.AssetBorrowing;

public interface IAssetBorrowingService {
	public AssetBorrowing requestBorrow(int employeeId, int assetId);
	public AssetBorrowing processBorrowingAction(int borrowingId, BorrowingActionDto actionDto);
	public AssetBorrowing returnAsset(int borrowingId);
	public List<AssetBorrowing> getBorrowingsByEmployee(int employeeId);
	public List<AssetBorrowing> getAllActiveBorrowings();
	public List<AssetBorrowing> getAllPendingBorrowings();
	public List<AssetBorrowing> getAllRejectedBorrowings();
	public List<AssetBorrowing> getAllReturnedBorrowings();
}
