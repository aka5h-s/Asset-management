import { useState, useEffect } from 'react';
import AmsService from '../../Service/AmsService.js';
import { BORROWING_ACTIONS, STATUS_BADGE_CLASSES, BORROWING_STATUS } from '../../Service/Constants.js';
import { getUserRoleFromToken } from '../../Service/AuthHelper.js';

const BorrowingRequests = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('PENDING');
  const [categoryStats, setCategoryStats] = useState({});
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Check if user has admin role
    const userRole = getUserRoleFromToken();
    const token = localStorage.getItem('ams_token');
    console.log('User role from token:', userRole);
    console.log('Token exists:', !!token);
    console.log('Token value:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (userRole !== 'ADMIN') {
      setAuthError('Access denied. Admin role required to view borrowing requests.');
      setLoading(false);
      setBorrowings([]);
      setCategoryStats({
        PENDING: 0,
        ACTIVE: 0,
        REJECTED: 0,
        RETURNED: 0,
        ALL: 0
      });
      return;
    }
    
    // Clear any previous auth errors
    setAuthError('');
    fetchBorrowings();
    fetchCategoryStats();
  }, [selectedCategory]);

  const fetchCategoryStats = async () => {
    // Don't fetch stats if there's an auth error
    if (authError) {
      console.log('Skipping category stats fetch due to auth error');
      return;
    }

    try {
      console.log('Fetching category stats...');
      
      const [pendingResponse, activeResponse, rejectedResponse, returnedResponse] = await Promise.all([
        AmsService.getPendingBorrowings().catch((error) => {
          console.warn('Failed to fetch pending borrowings:', error.response?.status, error.message);
          return { data: [] };
        }),
        AmsService.getActiveBorrowings().catch((error) => {
          console.warn('Failed to fetch active borrowings:', error.response?.status, error.message);
          return { data: [] };
        }),
        AmsService.getRejectedBorrowings().catch((error) => {
          console.warn('Failed to fetch rejected borrowings:', error.response?.status, error.message);
          return { data: [] };
        }),
        AmsService.getReturnedBorrowings().catch((error) => {
          console.warn('Failed to fetch returned borrowings:', error.response?.status, error.message);
          return { data: [] };
        })
      ]);

      const stats = {
        PENDING: pendingResponse.data?.length || 0,
        ACTIVE: activeResponse.data?.length || 0,
        REJECTED: rejectedResponse.data?.length || 0,
        RETURNED: returnedResponse.data?.length || 0,
        ALL: (pendingResponse.data?.length || 0) + (activeResponse.data?.length || 0) + 
             (rejectedResponse.data?.length || 0) + (returnedResponse.data?.length || 0)
      };

      console.log('Category stats:', stats);
      setCategoryStats(stats);
    } catch (error) {
      console.error('Error fetching category stats:', error);
      // Set default stats if there's an error
      setCategoryStats({
        PENDING: 0,
        ACTIVE: 0,
        REJECTED: 0,
        RETURNED: 0,
        ALL: 0
      });
    }
  };

  const categoryOptions = [
    { value: 'ALL', label: 'All Borrowings', description: 'Show all borrowing requests' },
    { value: 'PENDING', label: 'Pending', description: 'Requests waiting for approval' },
    { value: 'ACTIVE', label: 'Active', description: 'Approved and currently borrowed' },
    { value: 'REJECTED', label: 'Rejected', description: 'Requests that were rejected' },
    { value: 'RETURNED', label: 'Returned', description: 'Assets that have been returned' }
  ];

  const fetchBorrowings = async () => {
    // Don't fetch borrowings if there's an auth error
    if (authError) {
      console.log('Skipping borrowings fetch due to auth error');
      return;
        }
        
        try {
      setLoading(true);
      setMsg('');
      
      console.log(`Fetching ${selectedCategory.toLowerCase()} borrowing requests...`);
      
      let response;
      if (selectedCategory === 'ALL') {
        // For all borrowings, fetch from all endpoints and combine
        try {
          const [pendingResponse, activeResponse, rejectedResponse, returnedResponse] = await Promise.all([
            AmsService.getPendingBorrowings().catch(() => ({ data: [] })),
            AmsService.getActiveBorrowings().catch(() => ({ data: [] })),
            AmsService.getRejectedBorrowings().catch(() => ({ data: [] })),
            AmsService.getReturnedBorrowings().catch(() => ({ data: [] }))
          ]);
          
          const allBorrowings = [
            ...(pendingResponse.data || []),
            ...(activeResponse.data || []),
            ...(rejectedResponse.data || []),
            ...(returnedResponse.data || [])
          ];
          response = { data: allBorrowings };
        } catch (error) {
          console.log('Error fetching all borrowings, trying individual endpoints...');
          response = { data: [] };
        }
      } else if (selectedCategory === 'PENDING') {
        response = await AmsService.getPendingBorrowings();
      } else if (selectedCategory === 'ACTIVE') {
        response = await AmsService.getActiveBorrowings();
      } else if (selectedCategory === 'REJECTED') {
        response = await AmsService.getRejectedBorrowings();
      } else if (selectedCategory === 'RETURNED') {
        response = await AmsService.getReturnedBorrowings();
          } else {
        // Fallback for unknown categories
            setBorrowings([]);
        setMsg(`${selectedCategory} borrowings endpoint not yet implemented`);
          return;
      }
      
      if (response.data && response.data.length > 0) {
        // Process each borrowing and add display info
        const processedBorrowings = response.data.map((borrowing) => {
          return {
            ...borrowing,
            // Use data from the borrowing object itself, with fallbacks
            employeeName: borrowing.employee?.name || 'Unknown Employee',
            employeeEmail: borrowing.employee?.email || 'unknown@example.com',
            assetName: borrowing.asset?.assetName || 'Unknown Asset',
            assetDescription: borrowing.asset?.assetDescription || 'No description available',
            categoryName: borrowing.asset?.category?.categoryName || borrowing.asset?.categoryName || 'Unknown Category'
          };
        });
        
        setBorrowings(processedBorrowings);
        console.log(`Successfully processed ${selectedCategory.toLowerCase()} borrowings:`, processedBorrowings);
      } else {
        setBorrowings([]);
        console.log(`No ${selectedCategory.toLowerCase()} borrowing requests found - showing empty state`);
        // Don't show error message for empty results, just show empty state
      }
    } catch (error) {
      console.error('Error fetching borrowings:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
      
      if (error.response?.status === 403) {
        setMsg('Access denied. You do not have permission to view borrowing requests. Please ensure you are logged in with an admin account.');
      } else if (error.response?.status === 401) {
        setMsg('Authentication failed. Please log in again.');
      } else if (error.response?.status === 404) {
        // This should not happen anymore with the backend fix, but keep as fallback
        setMsg('Endpoint not found. The server may need to be restarted to pick up new endpoints.');
      } else {
      setMsg('Error fetching borrowing requests: ' + (error.response?.data?.message || error.message));
      }
      
      setBorrowings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (borrowingId, action) => {
    try {
      console.log(`Attempting to ${action} borrowing request ${borrowingId}...`);
      
      // Use the correct payload format with BorrowingAction enum
      const actionPayload = { action: action };
      await AmsService.updateBorrowingAction(borrowingId, actionPayload);
      
        console.log(`Successfully ${action.toLowerCase()}ed borrowing request ${borrowingId}`);
        setMsg(`Request ${action.toLowerCase()}ed successfully!`);
        fetchBorrowings();
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing borrowing request:`, error);
      setMsg(`Error ${action.toLowerCase()}ing request: ` + (error.response?.data?.message || error.message));
    }
  };

  const handleReturn = async (borrowingId) => {
    try {
      console.log(`Attempting to return borrowing request ${borrowingId}...`);
      
        await AmsService.returnBorrowing(borrowingId);
        console.log(`Successfully returned borrowing request ${borrowingId}`);
        setMsg('Asset returned successfully!');
        fetchBorrowings();
    } catch (error) {
      console.error('Error returning borrowing request:', error);
      setMsg('Error returning asset: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusBadge = (status) => {
    return STATUS_BADGE_CLASSES[status] || 'bg-secondary';
  };

  if (authError) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Access Denied</h4>
          <p>{authError}</p>
          <hr />
          <p className="mb-0">Please log in with an admin account to access this page.</p>
        </div>
      </div>
    );
  }

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
        <h2>Borrowing Requests</h2>
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={fetchBorrowings}
        >
          Refresh
        </button>
      </div>

      {/* Category Filter - Only show if no auth error */}
      {!authError && (
        <div className="row mb-4">
          <div className="col-md-8">
            <label htmlFor="categoryFilter" className="form-label">Filter by Status</label>
            <select
              className="form-select"
              id="categoryFilter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description} ({categoryStats[option.value] || 0})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <div className="text-muted small">
              <span className={`badge ${STATUS_BADGE_CLASSES[selectedCategory] || 'bg-secondary'} me-2`}>
                {selectedCategory}
              </span>
              <strong>{borrowings.length}</strong> found
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats - Only show if no auth error */}
      {!authError && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body py-2">
                <div className="row text-center">
                  <div className="col">
                    <div className="d-flex align-items-center justify-content-center">
                      <span className={`badge ${STATUS_BADGE_CLASSES.PENDING} me-2`}>PENDING</span>
                      <strong>{categoryStats.PENDING || 0}</strong>
                    </div>
                  </div>
                  <div className="col">
                    <div className="d-flex align-items-center justify-content-center">
                      <span className={`badge ${STATUS_BADGE_CLASSES.ACTIVE} me-2`}>ACTIVE</span>
                      <strong>{categoryStats.ACTIVE || 0}</strong>
                    </div>
                  </div>
                  <div className="col">
                    <div className="d-flex align-items-center justify-content-center">
                      <span className={`badge ${STATUS_BADGE_CLASSES.REJECTED} me-2`}>REJECTED</span>
                      <strong>{categoryStats.REJECTED || 0}</strong>
                    </div>
                  </div>
                  <div className="col">
                    <div className="d-flex align-items-center justify-content-center">
                      <span className={`badge ${STATUS_BADGE_CLASSES.RETURNED} me-2`}>RETURNED</span>
                      <strong>{categoryStats.RETURNED || 0}</strong>
                    </div>
                  </div>
                  <div className="col">
                    <div className="d-flex align-items-center justify-content-center">
                      <span className="badge bg-dark me-2">TOTAL</span>
                      <strong>{categoryStats.ALL || 0}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {msg && (
        <div className={`alert ${msg.includes('successfully') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
          {msg}
        </div>
      )}

      {/* Main Content - Only show if no auth error */}
      {!authError && (
        <>
      {borrowings.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
                <h5 className="text-muted">No {selectedCategory.toLowerCase()} borrowing requests</h5>
                <p className="text-muted">
                  {selectedCategory === 'ALL' 
                    ? 'There are no borrowing requests at the moment.' 
                    : `There are no ${selectedCategory.toLowerCase()} borrowing requests at the moment.`
                  }
                </p>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
                <h5 className="card-title">
                  {categoryOptions.find(opt => opt.value === selectedCategory)?.label} Borrowing Requests ({borrowings.length})
                </h5>
            <div className="table-responsive">
              <table className="table table-sm table-striped table-hover">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Employee</th>
                    <th>Asset</th>
                    <th>Category</th>
                    <th>Request Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowings.map(borrowing => (
                    <tr key={borrowing.borrowingId}>
                      <td>#{borrowing.borrowingId}</td>
                      <td>
                        <div>
                          <div className="fw-bold">{borrowing.employeeName}</div>
                          <small className="text-muted">{borrowing.employeeEmail}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-bold">{borrowing.assetName}</div>
                          <small className="text-muted">{borrowing.assetDescription}</small>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {borrowing.categoryName}
                        </span>
                      </td>
                      <td>
                            {borrowing.borrowedAt ? new Date(borrowing.borrowedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(borrowing.status)}`}>
                          {borrowing.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          {borrowing.status === 'PENDING' && (
                            <>
                              <button 
                                className="btn btn-outline-success"
                                    onClick={() => handleAction(borrowing.borrowingId, BORROWING_ACTIONS.APPROVE)}
                              >
                                Approve
                              </button>
                              <button 
                                className="btn btn-outline-danger"
                                    onClick={() => handleAction(borrowing.borrowingId, BORROWING_ACTIONS.REJECT)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {borrowing.status === 'APPROVED' && (
                            <button 
                              className="btn btn-outline-info"
                              onClick={() => handleReturn(borrowing.borrowingId)}
                            >
                              Mark Returned
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
          )}
        </>
      )}
    </div>
  );
};

export default BorrowingRequests;
