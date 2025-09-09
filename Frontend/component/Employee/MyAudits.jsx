import { useState, useEffect } from 'react';
import AmsService from '../../Service/AmsService.js';
import { getEmployeeIdFromToken } from '../../Service/AuthHelper.js';
import { extractError } from '../../Service/ErrorHelper.js';
import { AUDIT_ACTIONS, AUDIT_STATUS, STATUS_BADGE_CLASSES } from '../../Service/Constants.js';

const MyAudits = () => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
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

    const fetchAudits = async () => {
      try {
        setLoading(true);
        setMsg('');
        const response = await AmsService.getAuditsByEmployee(employeeId);
        setAudits(response.data);
        console.log('Fetched audits for employee:', employeeId, response.data);
      } catch (error) {
        console.error('Error fetching audits:', error);
        setMsg('Error fetching audits: ' + extractError(error, 'Failed to load audits'));
      } finally {
        setLoading(false);
      }
    };

    fetchAudits();
  }, [employeeId]);

  const handleAuditDecision = async (auditId, action) => {
    try {
      console.log(`Making audit decision for audit ${auditId} with action: ${action}`);
      
      // Use the correct payload format with action field
      const decisionPayload = { action: action };
      await AmsService.updateAuditDecision(auditId, decisionPayload);
      
      setMsg(`Audit decision updated to ${action}!`);
      
      // Refresh the audits list
      const response = await AmsService.getAuditsByEmployee(employeeId);
      setAudits(response.data);
    } catch (error) {
      console.error('Error making audit decision:', error);
      setMsg('Error making audit decision: ' + extractError(error, 'Failed to update audit decision'));
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

  if (!employeeId) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          <h4>Authentication Required</h4>
          <p>Unable to identify user. Please login again to view your audits.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">My Audits</h2>

      {msg && (
        <div className={`alert ${msg.includes('Audit decision updated to') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
          {msg}
        </div>
      )}

      {audits.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <h5 className="text-muted">No audit records</h5>
            <p className="text-muted">You don't have any audit records yet.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Your Audit Requests ({audits.length})</h5>
            <div className="table-responsive">
              <table className="table table-sm table-striped table-hover">
                <thead>
                  <tr>
                    <th>Audit ID</th>
                    <th>Asset</th>
                    <th>Status</th>
                    <th>Requested Date</th>
                    <th>Updated Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map(audit => (
                    <tr key={audit.auditId}>
                      <td>#{audit.auditId}</td>
                      <td>
                        <div>
                          <div className="fw-bold">{audit.asset?.assetName || 'Unknown Asset'}</div>
                        </div>
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
                      <td>
                        {audit.auditStatus === AUDIT_STATUS.PENDING && (
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-success"
                              onClick={() => handleAuditDecision(audit.auditId, AUDIT_ACTIONS.VERIFY)}
                            >
                              Confirm
                            </button>
                            <button 
                              className="btn btn-outline-danger"
                              onClick={() => handleAuditDecision(audit.auditId, AUDIT_ACTIONS.REJECT)}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {audit.auditStatus !== AUDIT_STATUS.PENDING && (
                          <span className="text-muted small">No actions available</span>
                        )}
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

export default MyAudits;
