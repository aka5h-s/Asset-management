import { Link } from 'react-router-dom';

// Landing page with hero section, features, and call-to-action
const Homepage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Hero Section */}
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '2rem 0',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, color: 'white', zIndex: 2, minWidth: '300px' }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '700',
              marginBottom: '1rem',
              lineHeight: '1.2'
            }}>
              Welcome to <span style={{ color: '#0d6efd' }}>AMS</span>
            </h1>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '300',
              marginBottom: '1.5rem',
              opacity: 0.9
            }}>
              Asset Management System
            </h2>
            <p style={{
              fontSize: '1.1rem',
              marginBottom: '2.5rem',
              opacity: 0.8,
              lineHeight: '1.6'
            }}>
              Streamline your asset management with our comprehensive platform. 
              Track, request, and manage assets efficiently with ease.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <Link to="/login" className="btn btn-primary btn-lg">
                <i className="fas fa-sign-in-alt me-2"></i>
                Login
              </Link>
              <Link to="/signup" className="btn btn-outline-light btn-lg">
                <i className="fas fa-user-plus me-2"></i>
                Sign Up
              </Link>
            </div>
          </div>
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            minWidth: '300px'
          }}>
            <div style={{
              width: '200px',
              height: '200px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              animation: 'float 6s ease-in-out infinite'
            }}>
              <i className="fas fa-laptop-code" style={{ fontSize: '4rem', color: 'white' }}></i>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ background: 'white', padding: '5rem 0' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-6 mb-4">
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                borderRadius: '15px',
                background: 'white',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                height: '100%'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-10px)';
                e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <i className="fas fa-cubes" style={{ fontSize: '2rem', color: 'white' }}></i>
                </div>
                <h4 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: '#333'
                }}>Asset Tracking</h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Monitor and track all your assets in one centralized location with real-time updates.
                </p>
              </div>
            </div>
            <div className="col-lg-5 col-md-6 mb-4">
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                borderRadius: '15px',
                background: 'white',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                height: '100%'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-10px)';
                e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <i className="fas fa-hand-holding-heart" style={{ fontSize: '2rem', color: 'white' }}></i>
                </div>
                <h4 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: '#333'
                }}>Easy Requests</h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Request assets with just a few clicks through our intuitive interface.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '4rem 0',
        color: 'white'
      }}>
        <div className="container text-center">
          <h3 style={{
            fontSize: '2.5rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>Ready to Get Started?</h3>
          <p style={{
            fontSize: '1.2rem',
            marginBottom: '2rem',
            opacity: 0.9
          }}>
            Join thousands of users who trust AMS for their asset management needs.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get Started Now
            </Link>
            <Link to="/login" className="btn btn-outline-light btn-lg">
              Already have an account?
            </Link>
          </div>
        </div>
      </div>


      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @media (max-width: 768px) {
          .hero-content {
            flex-direction: column !important;
            text-align: center !important;
          }
          
          .hero-title {
            font-size: 2.5rem !important;
          }
          
          .hero-subtitle {
            font-size: 1.2rem !important;
          }
          
          .floating-card {
            width: 150px !important;
            height: 150px !important;
            margin-top: 2rem !important;
          }
          
          .floating-card i {
            font-size: 3rem !important;
          }
          
          .hero-buttons {
            justify-content: center !important;
          }
          
          .cta-buttons {
            flex-direction: column !important;
            align-items: center !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Homepage;
