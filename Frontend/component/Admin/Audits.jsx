import { useState, useEffect } from 'react';
import AmsService from '../../Service/AmsService.js';
import { AUDIT_STATUS, STATUS_BADGE_CLASSES } from '../../Service/Constants.js';

const Audits = () => {
  const [audits, setAudits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRaiseForm, setShowRaiseForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [auditsResponse, employeesResponse, assetsResponse] = await Promise.all([
        AmsService.getAllAudits(),
        AmsService.getAllEmployees(),
        AmsService.getAllAssets()
      ]);
      
      setAudits(auditsResponse.data);
      setEmployees(employeesResponse.data);
      setAssets(assetsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMsg('Error: Error fetching data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseAudit = async (e) => {
    e.preventDefault();
    
    if (!selectedEmployee || !selectedAsset) {
      setMsg('Error: Please select both employee and asset');
      return;
    }

    try {
      setSubmitting(true);
      setMsg('');
      
      await AmsService.sendAudit(parseInt(selectedEmployee), parseInt(selectedAsset));
      setMsg('Success: Audit request sent successfully!');
      setSelectedEmployee('');
      setSelectedAsset('');
      setShowRaiseForm(false);
      fetchData();
    } catch (error) {
      console.error('Error raising audit:', error);
      setMsg('Error: Error raising audit: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    return STATUS_BADGE_CLASSES[status] || 'bg-secondary';
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
        <h2>Audit Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowRaiseForm(!showRaiseForm)}
        >
          {showRaiseForm ? 'Cancel' : 'Raise New Audit'}
        </button>
      </div>

      {msg && (
        <div className={`alert ${msg.includes('Success:') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
          {msg}
        </div>
      )}

      {showRaiseForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Raise New Audit</h5>
            <form onSubmit={handleRaiseAudit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="employee" className="form-label">Select Employee *</label>
                  <select
                    className="form-select"
                    id="employee"
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    required
                  >
                    <option value="">Choose an employee...</option>
                    {employees.map(employee => (
                      <option key={employee.employeeId} value={employee.employeeId}>
                        {employee.name} ({employee.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="asset" className="form-label">Select Asset *</label>
                  <select
                    className="form-select"
                    id="asset"
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                    required
                  >
                    <option value="">Choose an asset...</option>
                    {assets.map(asset => (
                      <option key={asset.assetId} value={asset.assetId}>
                        {asset.assetName} - {asset.category?.categoryName || 'Unknown Category'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send Audit Request'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowRaiseForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {audits.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <h5 className="text-muted">No audit records</h5>
            <p className="text-muted">There are no audit records in the system.</p>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Audit Records ({audits.length})</h5>
            <div className="table-responsive">
              <table className="table table-sm table-striped table-hover">
                <thead>
                  <tr>
                    <th>Audit ID</th>
                    <th>Employee</th>
                    <th>Asset</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Requested Date</th>
                    <th>Updated Date</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map(audit => (
                    <tr key={audit.auditId}>
                      <td>#{audit.auditId}</td>
                      <td>
                        <div>
                          <div className="fw-bold">{audit.employee?.name || 'Unknown'}</div>
                          <small className="text-muted">{audit.employee?.email || 'N/A'}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-bold">{audit.asset?.assetName || 'Unknown'}</div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {audit.asset?.category?.categoryName || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(audit.auditStatus)}`}>
                          {audit.auditStatus}
                        </span>
                      </td>
                      <td>
                        {audit.requestedAt ? new Date(audit.requestedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        {audit.updatedAt ? new Date(audit.updatedAt).toLocaleDateString() : 'N/A'}
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

export default Audits;
