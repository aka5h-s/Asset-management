import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AmsService from '../../Service/AmsService.js';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    contactNumber: '',
    address: '',
    email: '',
    password: '',
    role: 'employee'
  });
  const [msg, setMsg] = useState('');

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setMsg('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setMsg('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMsg('Please enter a valid email');
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      setMsg('Password must be at least 8 characters');
      return false;
    }
    if (passwordStrength < 3) {
      setMsg('Password is too weak. Use uppercase, lowercase, numbers, and symbols.');
      return false;
    }
    if (!formData.contactNumber.trim()) {
      setMsg('Contact number is required');
      return false;
    }
    if (!formData.address.trim()) {
      setMsg('Address is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    if (!validateForm()) {
      return;
    }

    try {
      await AmsService.register(formData);
      setMsg('Registration successful! Please login to continue.');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setMsg('Registration failed: ' + (error.response?.data?.message || error.message));
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
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div className="card-body p-4">
                  <h2 className="card-title text-center mb-4" style={{ fontSize: '1.8rem', fontWeight: '600' }}>Sign Up for AMS</h2>
                  
                  {msg && (
                    <div className={`alert ${msg.includes('Registration successful!') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                      {msg}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <label htmlFor="name" className="form-label">Full Name *</label>
                        <input
                          type="text"
                          className="form-control ams-input"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-2">
                        <label htmlFor="gender" className="form-label">Gender</label>
                        <select
                          className="form-select ams-input"
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <label htmlFor="email" className="form-label">Email *</label>
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

                      <div className="col-md-6 mb-2">
                        <label htmlFor="contactNumber" className="form-label">Contact Number *</label>
                        <input
                          type="tel"
                          className="form-control ams-input"
                          id="contactNumber"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-2">
                      <label htmlFor="address" className="form-label">Address *</label>
                      <textarea
                        className="form-control ams-input"
                        id="address"
                        name="address"
                        rows="2"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <label htmlFor="password" className="form-label">Password *</label>
                        <input
                          type="password"
                          className="form-control ams-input"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                        {formData.password && (
                          <>
                            <div className="ams-pw-meter">
                              <div className={`bar ${passwordStrength >= 1 ? 'on' : ''}`}></div>
                              <div className={`bar ${passwordStrength >= 2 ? 'on' : ''}`}></div>
                              <div className={`bar ${passwordStrength >= 3 ? 'on' : ''}`}></div>
                              <div className={`bar ${passwordStrength >= 4 ? 'on' : ''}`}></div>
                              <div className={`bar ${passwordStrength >= 5 ? 'on' : ''}`}></div>
                            </div>
                            <small className="text-muted">
                              Use at least 8 characters with uppercase, lowercase, number, and symbol.
                            </small>
                          </>
                        )}
                      </div>

                      <div className="col-md-6 mb-2">
                        <label htmlFor="role" className="form-label">Role</label>
                        <select
                          className="form-select ams-input"
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                        >
                          <option value="employee">Employee</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>

                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary">
                        Sign Up
                      </button>
                    </div>
                  </form>

                  <div className="text-center mt-2">
                    <p className="mb-0">
                      Already have an account? <Link to="/login">Login here</Link>
                    </p>
                  </div>
                </div>
              </div>
    </div>
  );
};

export default Signup;
