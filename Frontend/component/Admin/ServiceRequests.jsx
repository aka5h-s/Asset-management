import { useState, useEffect } from 'react';
import AmsService from '../../Service/AmsService.js';
import { extractError } from '../../Service/ErrorHelper.js';

const ServiceRequests = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const fetchServiceRequests = async () => {
    try {
      const response = await AmsService.getAllServiceRequests();
      setServiceRequests(response.data);
    } catch (error) {
      console.error('Error fetching service requests:', error);
      setMsg('Error fetching service requests: ' + extractError(error, 'Failed to load service requests'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (serviceRequestId, newStatus) => {
    try {
      await AmsService.updateServiceRequest(serviceRequestId, newStatus);
      setMsg(`Service request status updated to ${newStatus}!`);
      fetchServiceRequests();
    } catch (error) {
      setMsg('Error: ' + extractError(error, 'Failed to update service request status'));
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Pending': 'bg-warning',
      'Transit': 'bg-info',
      'Completed': 'bg-success'
    };
    return statusClasses[status] || 'bg-secondary';
  };

  const getIssueTypeBadge = (issueType) => {
    const typeClasses = {
      'HARDWARE': 'bg-danger',
      'SOFTWARE': 'bg-primary',
      'NETWORK': 'bg-info',
      'PERFORMANCE': 'bg-warning',
      'OTHER': 'bg-secondary'
    };
    return typeClasses[issueType] || 'bg-secondary';
  };

  const filteredRequests = selectedStatus === 'ALL' 
    ? serviceRequests 
    : serviceRequests.filter(request => request.status === selectedStatus);

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
        <h2>Service Requests</h2>
        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Transit">In Transit</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {msg && (
        <div className={`alert ${msg.includes('Service request status updated to') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
          {msg}
        </div>
      )}

      {filteredRequests.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <h5 className="text-muted">No service requests found</h5>
            <p className="text-muted">
              {selectedStatus === 'ALL' 
                ? 'There are no service requests at the moment.'
                : `No service requests with status: ${selectedStatus}`
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">
              Service Requests ({filteredRequests.length})
            </h5>
            <div className="table-responsive">
              <table className="table table-sm table-striped table-hover">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Employee</th>
                    <th>Asset</th>
                    <th>Issue Type</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(request => (
                    <tr key={request.serviceRequestId}>
                      <td>#{request.serviceRequestId}</td>
                      <td>
                        <div>
                          <div className="fw-bold">{request.employee?.name || 'Unknown Employee'}</div>
                          <small className="text-muted">{request.employee?.email || 'N/A'}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-bold">{request.asset?.assetName || 'Unknown Asset'}</div>
                          <small className="text-muted">{request.asset?.category?.categoryName || 'Unknown Category'}</small>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getIssueTypeBadge(request.issueType)}`}>
                          {request.issueType}
                        </span>
                      </td>
                      <td>
                        <div className="text-truncate" style={{maxWidth: '200px'}} title={request.description}>
                          {request.description}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>
                        {request.requestedAt ? new Date(request.requestedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          {request.status === 'Pending' && (
                            <button 
                              className="btn btn-outline-info"
                              onClick={() => handleStatusUpdate(request.serviceRequestId, 'Transit')}
                            >
                              Start
                            </button>
                          )}
                          {request.status === 'Transit' && (
                            <button 
                              className="btn btn-outline-success"
                              onClick={() => handleStatusUpdate(request.serviceRequestId, 'Completed')}
                            >
                              Complete
                            </button>
                          )}
                          {request.status === 'Completed' && (
                            <span className="text-muted small">No actions available</span>
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
    </div>
  );
};

export default ServiceRequests;
