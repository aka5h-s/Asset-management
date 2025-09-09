import { useState, useEffect } from 'react';
import AmsService from '../../Service/AmsService.js';
import { getEmployeeIdFromToken } from '../../Service/AuthHelper.js';
import { extractError, isNotFoundError } from '../../Service/ErrorHelper.js';

const MyServiceRequests = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [employeeId, setEmployeeId] = useState(null);

  // Get employee ID from token
  useEffect(() => {
    try {
      const empId = getEmployeeIdFromToken();
      setEmployeeId(empId);
      console.log('Employee ID from token:', empId);
    } catch (error) {
      console.error('Error getting employee ID:', error);
      setMsg(error.message + '. Please login again.');
      setLoading(false);
    }
  }, []);

  // Fetch service requests
  useEffect(() => {
    if (!employeeId) return;

    const fetchServiceRequests = async () => {
      try {
        setLoading(true);
        setMsg('');
        const response = await AmsService.getServiceRequestsByEmployee(employeeId);
        setServiceRequests(response.data);
        console.log('Fetched service requests for employee:', employeeId, response.data);
      } catch (error) {
        console.error('Error fetching service requests:', error);
        
        // Handle 404 as empty state instead of error
        if (isNotFoundError(error)) {
          console.log('No service requests found - treating as empty state');
          setServiceRequests([]);
          setMsg(''); // Clear any error message
        } else {
          setMsg('Error fetching service requests: ' + extractError(error, 'Failed to load your service requests'));
          setServiceRequests([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchServiceRequests();
  }, [employeeId]);

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
          <p>Unable to identify user. Please login again to view your service requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Service Requests</h2>
        <a href="/employee/service-requests" className="btn btn-primary">
          Create New Request
        </a>
      </div>

      {msg && (
        <div className={`alert ${msg.includes('successfully') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
          {msg}
        </div>
      )}

      {serviceRequests.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <h5 className="text-muted">No service requests</h5>
            <p className="text-muted">You haven't created any service requests yet.</p>
            <a href="/employee/service-requests" className="btn btn-primary">
              Create Your First Request
            </a>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm table-striped table-hover">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Asset</th>
                    <th>Issue Type</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Requested Date</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceRequests.map(request => (
                    <tr key={request.serviceRequestId}>
                      <td>#{request.serviceRequestId}</td>
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
                        {request.requestedAt ? new Date(request.requestedAt).toLocaleDateString() : 'N/A'}
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

export default MyServiceRequests;
