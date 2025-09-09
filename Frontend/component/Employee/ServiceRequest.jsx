import { useState, useEffect } from 'react';
import AmsService from '../../Service/AmsService.js';
import { getEmployeeIdFromToken } from '../../Service/AuthHelper.js';
import { extractError } from '../../Service/ErrorHelper.js';

const ServiceRequest = () => {
  const [formData, setFormData] = useState({
    assetId: '',
    issueType: '',
    description: ''
  });
  const [assets, setAssets] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
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

  // Fetch user's currently borrowed assets
  useEffect(() => {
    if (!employeeId) return;

    const fetchAssets = async () => {
      try {
        setLoading(true);
        setMsg('');
        
        // Get user's active borrowings (currently borrowed assets)
        const response = await AmsService.getBorrowingsByEmployee(employeeId);
        const activeBorrowings = (response.data || []).filter(borrowing => 
          borrowing.status === 'ACTIVE' || borrowing.status === 'APPROVED'
        );
        
        // Extract assets from borrowings
        const userAssets = activeBorrowings.map(borrowing => ({
          assetId: borrowing.asset.assetId,
          assetName: borrowing.asset.assetName,
          categoryName: borrowing.asset.category?.categoryName || borrowing.asset.categoryName || 'Unknown',
          status: borrowing.asset.status,
          description: borrowing.asset.assetDescription || borrowing.asset.description || 'No description'
        }));
        
        setAssets(userAssets);
        console.log('Fetched user assets:', userAssets);
      } catch (error) {
        console.error('Error fetching assets:', error);
        setMsg('Error fetching your assets: ' + extractError(error, 'Failed to load your assets'));
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [employeeId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    if (!employeeId) {
      setMsg('Unable to identify user. Please login again.');
      return;
    }

    if (!formData.assetId || !formData.issueType || !formData.description.trim()) {
      setMsg('Please fill in all fields');
      return;
    }

    try {
      await AmsService.createServiceRequest({
        employeeId: employeeId,
        assetId: parseInt(formData.assetId),
        issueType: formData.issueType,
        description: formData.description
      });
      setMsg('Service request created successfully!');
      setFormData({
        assetId: '',
        issueType: '',
        description: ''
      });
    } catch (error) {
      setMsg('Request failed: ' + extractError(error, 'Failed to create service request'));
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

  if (!employeeId) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          <h4>Authentication Required</h4>
          <p>Unable to identify user. Please login again to create service requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">Create Service Request</h2>
      
      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Report Asset Issue</h5>
              
              {msg && (
                <div className={`alert ${msg.includes('Service request created successfully!') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                  {msg}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="assetId" className="form-label">Select Asset *</label>
                  <select
                    className="form-select"
                    id="assetId"
                    name="assetId"
                    value={formData.assetId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose an asset...</option>
                    {assets.map(asset => (
                      <option key={asset.assetId} value={asset.assetId}>
                        {asset.assetName} - {asset.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="issueType" className="form-label">Issue Type *</label>
                  <select
                    className="form-select"
                    id="issueType"
                    name="issueType"
                    value={formData.issueType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select issue type...</option>
                    <option value="HARDWARE">Hardware Issue</option>
                    <option value="SOFTWARE">Software Issue</option>
                    <option value="NETWORK">Network Issue</option>
                    <option value="PERFORMANCE">Performance Issue</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Please describe the issue in detail..."
                    required
                  ></textarea>
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Your Assets</h6>
              <p className="card-text small text-muted">
                Select an asset to report an issue
              </p>
              
              {assets.length === 0 ? (
                <div className="text-muted small">
                  No current assets assigned.
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {assets.map(asset => (
                    <div key={asset.assetId} className="list-group-item px-0 py-2 small">
                      <div className="fw-bold">{asset.assetName}</div>
                      <div className="text-muted">{asset.categoryName}</div>
                      <span className={`badge badge-sm ${
                        asset.status === 'Available' ? 'bg-success' : 
                        asset.status === 'Borrowed' ? 'bg-warning' : 'bg-secondary'
                      }`}>
                        {asset.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequest;
