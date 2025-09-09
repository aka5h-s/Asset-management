import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AmsService from '../../Service/AmsService.js';

// Admin dashboard: shows system-wide stats for employees, assets, and requests
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalAssets: 0,
    totalCategories: 0,
    activeBorrowings: 0,
    pendingServiceRequests: 0,
    totalAudits: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Starting to fetch dashboard stats...');
        
        // Fetch all admin dashboard data in parallel with error handling
        const [
          employeesResponse,
          assetsResponse,
          categoriesResponse,
          borrowingsResponse,
          serviceRequestsResponse,
          auditsResponse
        ] = await Promise.all([
          AmsService.getAllEmployees().catch(err => {
            console.error('Error fetching employees:', err);
            return { data: [] };
          }),
          AmsService.getAllAssets().catch(err => {
            console.error('Error fetching assets:', err);
            return { data: [] };
          }),
          AmsService.getAllAssetCategories().catch(err => {
            console.error('Error fetching categories:', err);
            return { data: [] };
          }),
          AmsService.getActiveBorrowings().catch(err => {
            console.error('Error fetching active borrowings:', err);
            return { data: [] };
          }),
          AmsService.getServiceRequestsByStatus('PENDING').catch(err => {
            console.error('Error fetching pending service requests:', err);
            return { data: [] };
          }),
          AmsService.getAllAudits().catch(err => {
            console.error('Error fetching audits:', err);
            return { data: [] };
          })
        ]);

        console.log('API Responses:', {
          employees: employeesResponse?.data?.length || 0,
          assets: assetsResponse?.data?.length || 0,
          categories: categoriesResponse?.data?.length || 0,
          borrowings: borrowingsResponse?.data?.length || 0,
          serviceRequests: serviceRequestsResponse?.data?.length || 0,
          audits: auditsResponse?.data?.length || 0
        });

        setStats({
          totalEmployees: employeesResponse?.data?.length || 0,
          totalAssets: assetsResponse?.data?.length || 0,
          totalCategories: categoriesResponse?.data?.length || 0,
          activeBorrowings: borrowingsResponse?.data?.length || 0,
          pendingServiceRequests: serviceRequestsResponse?.data?.length || 0,
          totalAudits: auditsResponse?.data?.length || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set default values on error
        setStats({
          totalEmployees: 0,
          totalAssets: 0,
          totalCategories: 0,
          activeBorrowings: 0,
          pendingServiceRequests: 0,
          totalAudits: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      
      
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card text-center h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Employees</h5>
              <h2 className="text-primary">{stats.totalEmployees}</h2>
              <p className="card-text">Total employees registered</p>
              <Link to="/admin/employees" className="btn btn-outline-primary">
                Manage Employees
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-center h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Assets</h5>
              <h2 className="text-success">{stats.totalAssets}</h2>
              <p className="card-text">Total assets in system</p>
              <Link to="/admin/assets" className="btn btn-outline-success">
                Manage Assets
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-center h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Categories</h5>
              <h2 className="text-info">{stats.totalCategories}</h2>
              <p className="card-text">Asset categories</p>
              <Link to="/admin/categories" className="btn btn-outline-info">
                Manage Categories
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card text-center h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Active Borrowings</h5>
              <h2 className="text-warning">{stats.activeBorrowings}</h2>
              <p className="card-text">Currently borrowed assets</p>
              <Link to="/admin/borrowings" className="btn btn-outline-warning">
                View Borrowings
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-center h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Pending Requests</h5>
              <h2 className="text-danger">{stats.pendingServiceRequests}</h2>
              <p className="card-text">Service requests pending</p>
              <Link to="/admin/service-requests" className="btn btn-outline-danger">
                View Requests
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-center h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Audits</h5>
              <h2 className="text-secondary">{stats.totalAudits}</h2>
              <p className="card-text">Total audit records</p>
              <Link to="/admin/audits" className="btn btn-outline-secondary">
                View Audits
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
