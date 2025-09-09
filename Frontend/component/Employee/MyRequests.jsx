import { useState, useEffect } from 'react';
import AmsService from '../../Service/AmsService.js';
import { getEmployeeIdFromToken } from '../../Service/AuthHelper.js';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [employeeId, setEmployeeId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    try {
      const empId = getEmployeeIdFromToken();
      setEmployeeId(empId);
    } catch (error) {
      console.error('Error getting employee ID:', error);
      setMsg('❌ ' + error.message + '. Please login again.');
    }
  }, []);

  useEffect(() => {
    if (employeeId) {
      fetchRequests();
    }
  }, [employeeId, selectedStatus]);

  const fetchRequests = async () => {
    if (!employeeId) return;
    
    try {
      setLoading(true);
      setMsg('');
      
      const response = await AmsService.getBorrowingsByEmployee(employeeId);
      console.log('Fetched requests:', response.data);
      
      let filteredRequests = response.data || [];
      
      // Filter by status if not ALL
      if (selectedStatus !== 'ALL') {
        filteredRequests = filteredRequests.filter(request => 
          request.status === selectedStatus
        );
      }
      
      setRequests(filteredRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setMsg('❌ Error loading requests: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'PENDING': 'bg-warning',
      'ACTIVE': 'bg-success',
      'REJECTED': 'bg-danger',
      'RETURNED': 'bg-info'
    };
    
    return (
      <span className={`badge ${statusClasses[status] || 'bg-secondary'}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusCounts = () => {
    const counts = {
      ALL: requests.length,
      PENDING: 0,
      ACTIVE: 0,
      REJECTED: 0,
      RETURNED: 0
    };
    
    requests.forEach(request => {
      if (counts.hasOwnProperty(request.status)) {
        counts[request.status]++;
      }
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your requests...</p>
        </div>
      </div>
    );
  }

  if (!employeeId) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          <h4>Authentication Required</h4>
          <p>Unable to identify user. Please login again to view your requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Asset Requests</h2>
        <button 
          className="btn btn-outline-primary btn-sm" 
          onClick={fetchRequests}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Refreshing...
            </>
          ) : (
            'Refresh'
          )}
        </button>
      </div>

      {msg && (
        <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show mb-4`}>
          {msg}
        </div>
      )}

      {/* Status Filter */}
      <div className="row mb-4">
        <div className="col-md-6">
          <label htmlFor="statusFilter" className="form-label">Filter by Status</label>
          <select
            className="form-select"
            id="statusFilter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Requests ({statusCounts.ALL})</option>
            <option value="PENDING">Pending ({statusCounts.PENDING})</option>
            <option value="ACTIVE">Active ({statusCounts.ACTIVE})</option>
            <option value="REJECTED">Rejected ({statusCounts.REJECTED})</option>
            <option value="RETURNED">Returned ({statusCounts.RETURNED})</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {requests.length > 0 ? (
        <div className="row">
          {requests.map((request) => (
            <div key={request.borrowingId} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title mb-0">
                      {request.asset?.assetName || 'Unknown Asset'}
                    </h5>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted">
                      <strong>Category:</strong> {request.asset?.category?.categoryName || request.asset?.categoryName || 'Unknown'}
                    </small>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted">
                      <strong>Value:</strong> ₹{request.asset?.assetValue?.toLocaleString() || 'N/A'}
                    </small>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted">
                      <strong>Requested:</strong> {formatDate(request.borrowedAt)}
                    </small>
                  </div>
                  
                  {request.returnedAt && (
                    <div className="mb-3">
                      <small className="text-muted">
                        <strong>Returned:</strong> {formatDate(request.returnedAt)}
                      </small>
                    </div>
                  )}
                  
                  {request.status === 'REJECTED' && (
                    <div className="alert alert-danger alert-sm mb-0">
                      <small>
                        <strong>Note:</strong> This request was rejected. You can request the asset again if it becomes available.
                      </small>
                    </div>
                  )}
                  
                  {request.status === 'ACTIVE' && (
                    <div className="alert alert-success alert-sm mb-0">
                      <small>
                        <strong>Note:</strong> You are currently borrowing this asset. Please return it when done.
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <div className="text-muted">
            {selectedStatus === 'ALL' ? 
              'You have no asset requests yet.' : 
              `No ${selectedStatus.toLowerCase()} requests found.`
            }
          </div>
          <div className="mt-3">
            <a href="/employee/request-asset" className="btn btn-primary">
              Request an Asset
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
