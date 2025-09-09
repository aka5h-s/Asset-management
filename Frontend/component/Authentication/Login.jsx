import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AmsService from '../../Service/AmsService.js';

// User login form with email/password authentication
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    try {
      const response = await AmsService.login(formData);
      localStorage.setItem('ams_token', response.data.token);
      
      // Dispatch custom event to notify navbar of login
      window.dispatchEvent(new CustomEvent('userLogin', { 
        detail: { token: response.data.token } 
      }));
      
      // Try to decode token to get role and redirect to appropriate dashboard
      try {
        const payload = JSON.parse(atob(response.data.token.split('.')[1]));
        if (payload.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/employee');
        }
      } catch (error) {
        // If can't decode, default to employee
        navigate('/employee');
      }
      
      setMsg('Login successful!');
    } catch (error) {
      setMsg('Login failed: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="auth-bg" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="card shadow-lg" style={{ 
        borderRadius: '15px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <div className="card-body p-4">
                  <h2 className="card-title text-center mb-4" style={{ fontSize: '1.8rem', fontWeight: '600' }}>Login to AMS</h2>
                  
                  {msg && (
                    <div className={`alert ${msg.includes('Login successful!') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                      {msg}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control ams-input"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-2">
                      <label htmlFor="password" className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control ams-input"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary">
                        Login
                      </button>
                    </div>
                  </form>

                  <div className="text-center mt-2">
                    <p className="mb-0">
                      Don't have an account? <Link to="/signup">Sign up here</Link>
                    </p>
                  </div>
                </div>
              </div>
    </div>
  );
};

export default Login;
