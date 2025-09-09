import { useState, useEffect } from 'react';
import AmsService from '../../Service/AmsService.js';
import { getEmployeeIdFromToken } from '../../Service/AuthHelper.js';
import AssetCard from '../Shared/AssetCard.jsx';
import AutoSuggestInput from '../Shared/AutoSuggestInput.jsx';

// Asset request page: browse available assets and submit borrowing requests
const RequestAsset = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
    try {
      const empId = getEmployeeIdFromToken();
      setEmployeeId(empId);
      console.log('Employee ID from token:', empId);
    } catch (error) {
      console.error('Error getting employee ID:', error);
      setMsg(error.message + '. Please login again.');
    }
  }, []);

  useEffect(() => {
    if (!employeeId) return;

    const fetchData = async () => {
      try {
        const [assetsResponse, categoriesResponse] = await Promise.all([
          AmsService.getAllAssets(),
          AmsService.getAllAssetCategories()
        ]);

        console.log('Assets data:', assetsResponse.data);
        console.log('Categories data:', categoriesResponse.data);
        setAssets(assetsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMsg('Error loading assets and categories');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId]);

  const filteredAssets = assets.filter(asset => {
    // Filter by category
    const categoryMatch = !selectedCategory || (() => {
      const categoryName = asset.categoryName || asset.category?.categoryName || asset.category?.name;
      return categoryName === selectedCategory;
    })();
    
    // Filter by search query
    const searchMatch = !searchQuery || (() => {
      const assetName = asset.assetName || asset.name || '';
      return assetName.toLowerCase().includes(searchQuery.toLowerCase());
    })();
    
    return categoryMatch && searchMatch;
  });

  // Filter out borrowed assets - only show available assets for requesting
  const availableAssets = filteredAssets.filter(asset => 
    asset.status === 'Available' || asset.status === 'available'
  );


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

  if (!employeeId) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          <h4>Authentication Required</h4>
          <p>Unable to identify user. Please login again to request assets.</p>
        </div>
      </div>
    );
  }

  const refreshData = async () => {
    if (!employeeId) return;
    
    try {
      setLoading(true);
      setMsg('');
      const [assetsResponse, categoriesResponse] = await Promise.all([
        AmsService.getAllAssets(),
        AmsService.getAllAssetCategories()
      ]);

      console.log('Refreshed assets data:', assetsResponse.data);
      console.log('Refreshed categories data:', categoriesResponse.data);
      setAssets(assetsResponse.data);
      setCategories(categoriesResponse.data);
      setMsg('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      setMsg('Error refreshing data');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Request Asset</h2>
        <button 
          className="btn btn-outline-primary btn-sm" 
          onClick={refreshData}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Refreshing...
            </>
          ) : (
            'Refresh Assets'
          )}
        </button>
      </div>
      
      {msg && (
        <div className={`alert ${msg.includes('Data refreshed successfully') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show mb-4`}>
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
            data={availableAssets}
            getLabel={(asset) => asset.assetName || asset.name}
            placeholder="Type to search assets..."
            className="form-control ams-input"
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="category" className="form-label">Filter by Category</label>
          <select
            className="form-select ams-input"
            id="category"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
            }}
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

      {/* Asset Grid */}
      <div className="mb-4">
        <h5>Available Assets ({availableAssets.length})</h5>
        {availableAssets.length > 0 ? (
          <div className="ams-grid">
            {availableAssets.map(asset => (
              <AssetCard
                key={asset.assetId}
                asset={asset}
                showSelectButton={false}
                clickable={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="text-muted">
              {assets.length === 0 ? 'No assets available' : 
               availableAssets.length === 0 ? 'No available assets match your filters' : 
               'No available assets'}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default RequestAsset;
