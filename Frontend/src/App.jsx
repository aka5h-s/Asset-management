import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../component/Shared/Navbar.jsx';
import ProtectedRoute from '../component/Shared/ProtectedRoute.jsx';
import Homepage from '../component/Shared/Homepage.jsx';
import { getUserInfoFromToken } from '../Service/AuthHelper.js';

// App routes: protect employee/admin areas and redirect unauthenticated users

// Authentication components
import Login from '../component/Authentication/Login.jsx';
import Signup from '../component/Authentication/Signup.jsx';

// Employee components
import EmployeeDashboard from '../component/Employee/EmployeeDashboard.jsx';
import MyAssets from '../component/Employee/MyAssets.jsx';
import RequestAsset from '../component/Employee/RequestAsset.jsx';
import AssetDetails from '../component/Employee/AssetDetails.jsx';
import MyRequests from '../component/Employee/MyRequests.jsx';
import ServiceRequest from '../component/Employee/ServiceRequest.jsx';
import MyServiceRequests from '../component/Employee/MyServiceRequests.jsx';
import MyAudits from '../component/Employee/MyAudits.jsx';

// Admin components
import AdminDashboard from '../component/Admin/AdminDashboard.jsx';
import ManageEmployees from '../component/Admin/ManageEmployees.jsx';
import ManageCategories from '../component/Admin/ManageCategories.jsx';
import ManageAssets from '../component/Admin/ManageAssets.jsx';
import AdminAssetDetails from '../component/Admin/AdminAssetDetails.jsx';
import BorrowingRequests from '../component/Admin/BorrowingRequests.jsx';
import ServiceRequests from '../component/Admin/ServiceRequests.jsx';
import Audits from '../component/Admin/Audits.jsx';

// Route users to appropriate dashboard based on their role from JWT token
function RoleHome() {
  const token = localStorage.getItem('ams_token');
  
  if (!token) {
    return <Homepage />;
  }
  
  try {
    const info = getUserInfoFromToken();
    if (info?.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (info?.role) return <Navigate to="/employee" replace />;
  } catch (error) {
    console.error('Error decoding token:', error);
    localStorage.removeItem('ams_token');
  }
  
  return <Homepage />;
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<RoleHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Employee routes */}
          <Route path="/employee" element={
            <ProtectedRoute>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          <Route path="/employee/assets" element={
            <ProtectedRoute>
              <MyAssets />
            </ProtectedRoute>
          } />
          <Route path="/employee/request-asset" element={
            <ProtectedRoute>
              <RequestAsset />
            </ProtectedRoute>
          } />
          <Route path="/employee/asset-details/:assetId" element={
            <ProtectedRoute>
              <AssetDetails />
            </ProtectedRoute>
          } />
          <Route path="/employee/my-requests" element={
            <ProtectedRoute>
              <MyRequests />
            </ProtectedRoute>
          } />
          <Route path="/employee/service-requests" element={
            <ProtectedRoute>
              <ServiceRequest />
            </ProtectedRoute>
          } />
          <Route path="/employee/my-service-requests" element={
            <ProtectedRoute>
              <MyServiceRequests />
            </ProtectedRoute>
          } />
          <Route path="/employee/audits" element={
            <ProtectedRoute>
              <MyAudits />
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/employees" element={
            <ProtectedRoute>
              <ManageEmployees />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute>
              <ManageCategories />
            </ProtectedRoute>
          } />
          <Route path="/admin/assets" element={
            <ProtectedRoute>
              <ManageAssets />
            </ProtectedRoute>
          } />
          <Route path="/admin/assets/:assetId" element={
            <ProtectedRoute>
              <AdminAssetDetails />
            </ProtectedRoute>
          } />
          <Route path="/admin/borrowings" element={
            <ProtectedRoute>
              <BorrowingRequests />
            </ProtectedRoute>
          } />
          <Route path="/admin/service-requests" element={
            <ProtectedRoute>
              <ServiceRequests />
            </ProtectedRoute>
          } />
          <Route path="/admin/audits" element={
            <ProtectedRoute>
              <Audits />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
