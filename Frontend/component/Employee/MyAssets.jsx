import { useState, useEffect } from 'react';
import AmsService from '../../Service/AmsService.js';
import { getEmployeeIdFromToken } from '../../Service/AuthHelper.js';
import { extractError, isNotFoundError } from '../../Service/ErrorHelper.js';
import AssetCard from '../Shared/AssetCard.jsx';
import AutoSuggestInput from '../Shared/AutoSuggestInput.jsx';

// Employee's borrowed assets page with search, filter, and return functionality
const MyAssets = () => {
      const [borrowings, setBorrowings] = useState([]);
      const [categories, setCategories] = useState([]);
      const [selectedCategory, setSelectedCategory] = useState('');
      const [searchQuery, setSearchQuery] = useState('');
      const [loading, setLoading] = useState(true);
      const [msg, setMsg] = useState('');
      const [returningId, setReturningId] = useState(null);

  // Get employee ID from JWT token
  const getEmployeeId = () => {
    try {
      return getEmployeeIdFromToken();
    } catch (error) {
      console.error('Error getting employee ID:', error);
      setMsg('Error: Unable to get your employee information. Please log in again.');
      return null;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setMsg('');
      
      const employeeId = getEmployeeId();
      if (!employeeId) {
        setLoading(false);
        return;
      }

      console.log('Fetching borrowed assets for employee ID:', employeeId);
      
      const [borrowingsResponse, categoriesResponse] = await Promise.all([
        AmsService.getBorrowingsByEmployee(employeeId),
        AmsService.getAllAssetCategories()
      ]);

      console.log('Borrowings response:', borrowingsResponse.data);
      
      // Filter only ACTIVE borrowings (currently borrowed assets)
      const activeBorrowings = (borrowingsResponse.data || []).filter(borrowing => 
        borrowing.status === 'ACTIVE' || borrowing.status === 'APPROVED'
      );
      
      setBorrowings(activeBorrowings);
      setCategories(categoriesResponse.data || []);
      
      if (activeBorrowings.length > 0) {
        console.log(`✅ Successfully loaded ${activeBorrowings.length} borrowed assets`);
      } else {
        console.log('No borrowed assets found for this employee');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Handle 404 as empty state instead of error
      if (isNotFoundError(error)) {
        console.log('No current assets found - treating as empty state');
        setBorrowings([]);
        setMsg(''); // Clear any error message
      } else {
        setMsg('Error fetching your assets: ' + extractError(error, 'Failed to load your assets'));
        setBorrowings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredBorrowings = borrowings.filter(borrowing => {
    // Filter by category
    const categoryMatch = !selectedCategory || (() => {
      const categoryName = borrowing.asset?.category?.categoryName || borrowing.asset?.categoryName;
      return categoryName === selectedCategory;
    })();
    
    // Filter by search query
    const searchMatch = !searchQuery || (() => {
      const assetName = borrowing.asset?.assetName || borrowing.asset?.name || '';
      return assetName.toLowerCase().includes(searchQuery.toLowerCase());
    })();
    
    return categoryMatch && searchMatch;
  });

  const handleReturnAsset = async (borrowingId, assetName) => {
    if (!window.confirm(`Are you sure you want to return "${assetName}"?`)) {
      return;
    }

    try {
      setReturningId(borrowingId);
      setMsg('');

      console.log('Returning asset with borrowing ID:', borrowingId);
      const response = await AmsService.returnBorrowing(borrowingId);
      
      console.log('Return response:', response.data);
      setMsg('Asset returned successfully!');
      
      // Refresh the list
      await fetchData();
      
    } catch (error) {
      console.error('Error returning asset:', error);
      setMsg('Error returning asset: ' + extractError(error, 'Failed to return asset'));
    } finally {
      setReturningId(null);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Borrowed Assets</h2>
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={() => {
            const employeeId = getEmployeeId();
            if (employeeId) {
              fetchData();
            }
          }}
        >
          Refresh
        </button>
      </div>

      {msg && (
        <div className={`alert ${msg.includes('Asset returned successfully!') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show mb-4`}>
          {msg}
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="row mb-4">
        <div className="col-md-6">
          <label htmlFor="search" className="form-label">Search Assets</label>
          <AutoSuggestInput
            value={searchQuery}
            onChange={setSearchQuery}
            data={borrowings.map(b => b.asset).filter(Boolean)}
            getLabel={(asset) => asset.assetName || asset.name}
            placeholder="Type to search your assets..."
            className="form-control ams-input"
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="category" className="form-label">Filter by Category</label>
          <select
            className="form-select ams-input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.categoryId} value={category.categoryName}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredBorrowings.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <h5 className="text-muted">No current assets assigned.</h5>
            <p className="text-muted">
              You don't have any borrowed assets at the moment. 
              <br />
              <small>Request an asset from the "Request Asset" page to get started.</small>
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <h5>Your Borrowed Assets ({filteredBorrowings.length})</h5>
          <div className="ams-grid">
            {filteredBorrowings.map(borrowing => (
              <div key={borrowing.borrowingId} className="ams-card">
                <div className="ams-card-image">
                  <img 
                    src={borrowing.asset?.imageUrl ? `http://localhost:8092/api/v1${borrowing.asset.imageUrl}` : '/placeholder.svg'} 
                    alt={borrowing.asset?.assetName || 'Asset'} 
                    onError={(e) => {
                      e.target.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <div className="ams-card-body">
                  <div className="ams-card-title">{borrowing.asset?.assetName || 'Unknown Asset'}</div>
                  {borrowing.asset?.description && (
                    <div className="ams-card-desc">{borrowing.asset.description}</div>
                  )}
                  <div className="ams-card-details">
                    <small className="text-muted">
                      {borrowing.asset?.category?.categoryName || borrowing.asset?.categoryName || 'Unknown'} • 
                      ${borrowing.asset?.assetValue || borrowing.asset?.value}
                    </small>
                    <br />
                    <small className="text-muted">
                      Borrowed: {borrowing.borrowedDate ? new Date(borrowing.borrowedDate).toLocaleDateString() : 
                       borrowing.requestDate ? new Date(borrowing.requestDate).toLocaleDateString() : 'N/A'}
                    </small>
                    <br />
                    <span className={`badge ${
                      borrowing.status === 'ACTIVE' ? 'bg-warning' : 
                      borrowing.status === 'APPROVED' ? 'bg-success' : 'bg-secondary'
                    }`}>
                      {borrowing.status}
                    </span>
                  </div>
                  <button 
                    className="btn btn-outline-danger btn-sm mt-2"
                    onClick={() => handleReturnAsset(borrowing.borrowingId, borrowing.asset?.assetName)}
                    disabled={returningId === borrowing.borrowingId}
                  >
                    {returningId === borrowing.borrowingId ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        Returning...
                      </>
                    ) : (
                      'Return Asset'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAssets;
