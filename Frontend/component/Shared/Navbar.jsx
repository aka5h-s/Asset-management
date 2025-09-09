import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { clearAuth, getUserInfoFromToken } from '../../Service/AuthHelper.js';

const Navbar = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('employee');
  const [userName, setUserName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Try to decode JWT token to get user role and name
    const token = localStorage.getItem('ams_token');
    console.log('Navbar useEffect - token exists:', !!token);
    
    if (token) {
      try {
        const userInfo = getUserInfoFromToken();
        console.log('Navbar User Info:', userInfo);
        
        // Set user name
        setUserName(userInfo.name || 'User');
        
        // Check for different possible role field names
        const role = userInfo.role || 'employee';
        // Convert to lowercase for consistent comparison
        const normalizedRole = role.toLowerCase();
        console.log('Detected role in navbar:', role, '-> normalized to:', normalizedRole);
        console.log('Setting userRole to:', normalizedRole);
        setUserRole(normalizedRole);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error decoding token:', error);
        setUserRole('employee');
        setUserName('User');
        setIsAuthenticated(false);
      }
    } else {
      console.log('No token found, setting role to employee');
      setUserRole('employee');
      setUserName('User');
      setIsAuthenticated(false);
    }
  }, []);

  // Add listeners for storage changes and custom login events to update role and name when token changes
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('ams_token');
      if (token) {
        try {
          const userInfo = getUserInfoFromToken();
          setUserName(userInfo.name || 'User');
          const role = userInfo.role || 'employee';
          const normalizedRole = role.toLowerCase();
          console.log('Storage change detected - updating role to:', normalizedRole);
          setUserRole(normalizedRole);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error decoding token on storage change:', error);
          setUserRole('employee');
          setUserName('User');
          setIsAuthenticated(false);
        }
      } else {
        setUserRole('employee');
        setUserName('User');
        setIsAuthenticated(false);
      }
    };

    const handleUserLogin = (event) => {
      console.log('User login event detected - updating navbar');
      // Small delay to ensure token is properly set in localStorage
      setTimeout(() => {
        const token = event.detail?.token || localStorage.getItem('ams_token');
        if (token) {
          try {
            const userInfo = getUserInfoFromToken();
            setUserName(userInfo.name || 'User');
            const role = userInfo.role || 'employee';
            const normalizedRole = role.toLowerCase();
            console.log('Login event - updating role to:', normalizedRole);
            setUserRole(normalizedRole);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Error decoding token on login event:', error);
            setUserRole('employee');
            setUserName('User');
            setIsAuthenticated(false);
          }
        }
      }, 100);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleUserLogin);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserLogin);
    };
  }, []);

  const handleLogout = () => {
    clearAuth();
    setIsAuthenticated(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Don't render navbar if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link 
          className="navbar-brand fw-bold" 
          to={userRole === 'admin' ? '/admin' : '/employee'}
        >
          AMS
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-controls="navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto">
            {userRole === 'admin' ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/employees" onClick={() => setIsMenuOpen(false)}>Employees</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/categories" onClick={() => setIsMenuOpen(false)}>Categories</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/assets" onClick={() => setIsMenuOpen(false)}>Assets</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/borrowings" onClick={() => setIsMenuOpen(false)}>Borrowings</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/service-requests" onClick={() => setIsMenuOpen(false)}>Service Requests</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/audits" onClick={() => setIsMenuOpen(false)}>Audits</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/employee/assets" onClick={() => setIsMenuOpen(false)}>My Assets</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/employee/request-asset" onClick={() => setIsMenuOpen(false)}>Request Asset</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/employee/my-requests" onClick={() => setIsMenuOpen(false)}>My Requests</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/employee/my-service-requests" onClick={() => setIsMenuOpen(false)}>Service Requests</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/employee/audits" onClick={() => setIsMenuOpen(false)}>Audits</Link>
                </li>
              </>
            )}
          </ul>
          
          <ul className="navbar-nav">
            <li className="nav-item">
              <span className="navbar-text me-3">
                Hi, <strong>{userName || 'User'}</strong>
              </span>
            </li>
            <li className="nav-item">
              <button 
                className="btn btn-outline-light btn-sm" 
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
