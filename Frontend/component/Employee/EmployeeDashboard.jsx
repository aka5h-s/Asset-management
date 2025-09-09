import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AmsService from '../../Service/AmsService.js';
import { getEmployeeIdFromToken } from '../../Service/AuthHelper.js';

// Employee dashboard: shows assigned assets, service requests, and audit stats
const EmployeeDashboard = () => {
  const [stats, setStats] = useState({
    assignedAssets: 0,
    serviceRequests: 0,
    audits: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get employee ID from JWT token
  let employeeId;
  try {
    employeeId = getEmployeeIdFromToken();
  } catch (error) {
    console.error('Error getting employee ID from token:', error);
    navigate('/');
    return null;
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all dashboard data in parallel for better performance
        const [assetsResponse, serviceRequestsResponse, auditsResponse] = await Promise.all([
          AmsService.getAssetsByEmployee(employeeId),
          AmsService.getServiceRequestsByEmployee(employeeId),
          AmsService.getAuditsByEmployee(employeeId)
        ]);

        setStats({
          assignedAssets: assetsResponse.data.length,
          serviceRequests: serviceRequestsResponse.data.length,
          audits: auditsResponse.data.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [employeeId]);

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
      <h2 className="mb-4">Employee Dashboard</h2>
      
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card text-center h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Assigned Assets</h5>
              <h2 className="text-primary">{stats.assignedAssets}</h2>
              <p className="card-text">Assets currently assigned to you</p>
              <Link to="/employee/assets" className="btn btn-outline-primary">
                View Assets
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-center h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Service Requests</h5>
              <h2 className="text-warning">{stats.serviceRequests}</h2>
              <p className="card-text">Your service requests</p>
              <Link to="/employee/service-requests" className="btn btn-outline-warning">
                View Requests
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-center h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Audits</h5>
              <h2 className="text-info">{stats.audits}</h2>
              <p className="card-text">Audit records</p>
              <Link to="/employee/audits" className="btn btn-outline-info">
                View Audits
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Request New Asset</h5>
              <p className="card-text">Need a new asset? Submit a borrowing request.</p>
              <Link to="/employee/request-asset" className="btn btn-primary">
                Request Asset
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Create Service Request</h5>
              <p className="card-text">Report issues with your assigned assets.</p>
              <Link to="/employee/service-requests" className="btn btn-success">
                Create Request
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
