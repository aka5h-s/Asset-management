import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AmsService from '../../Service/AmsService.js';
import { getEmployeeIdFromToken } from '../../Service/AuthHelper.js';

const AssetDetails = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [msg, setMsg] = useState('');
  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
    try {
      const empId = getEmployeeIdFromToken();
      setEmployeeId(empId);
    } catch (error) {
      console.error('Error getting employee ID:', error);
      setMsg(error.message + '. Please login again.');
    }
  }, []);

  useEffect(() => {
    const fetchAssetDetails = async () => {
      if (!assetId) return;
      
      try {
        setLoading(true);
        const response = await AmsService.getAssetById(assetId);
        setAsset(response.data);
      } catch (error) {
        console.error('Error fetching asset details:', error);
        setMsg('Error loading asset details: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchAssetDetails();
  }, [assetId]);

  const handleRequestAsset = async () => {
    if (!employeeId) {
      setMsg('Unable to identify user. Please login again.');
      return;
    }

    if (!asset) {
      setMsg('Asset information not available.');
      return;
    }

    if (asset.status !== 'Available') {
      setMsg('This asset is not available for borrowing.');
      return;
    }

    try {
      setRequesting(true);
      setMsg('');
      
      const response = await AmsService.requestBorrowing({
        employeeId: employeeId,
        assetId: parseInt(assetId)
      });
      
      console.log('Borrowing request response:', response);
      setMsg('Asset request submitted successfully!');
      
      // Redirect back to request asset page after 2 seconds
      setTimeout(() => {
        navigate('/employee/request-asset');
      }, 2000);
      
    } catch (error) {
      console.error('Request error:', error);
      setMsg('Request failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setRequesting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/employee/request-asset');
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading asset details...</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          <h4>Asset Not Found</h4>
          <p>The requested asset could not be found.</p>
          <button className="btn btn-primary" onClick={handleGoBack}>
            Back to Assets
          </button>
        </div>
      </div>
    );
  }

  if (!employeeId) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          <h4>Authentication Required</h4>
          <p>Unable to identify user. Please login again to request assets.</p>
          <button className="btn btn-primary" onClick={handleGoBack}>
            Back to Assets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Asset Details</h2>
        <button className="btn btn-outline-secondary" onClick={handleGoBack}>
          Back to Assets
        </button>
      </div>

      {/* Message */}
      {msg && (
        <div className={`alert ${msg.includes('Asset request submitted successfully!') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show mb-4`}>
          {msg}
        </div>
      )}

      <div className="row">
        {/* Asset Image */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="ams-card-image" style={{ height: '400px' }}>
                <img 
                  src={asset.imageUrl ? `http://localhost:8092/api/v1${asset.imageUrl}` : '/placeholder.svg'} 
                  alt={asset.assetName} 
                  className="w-100 h-100"
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = '/placeholder.svg';
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Asset Information */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h3 className="card-title mb-3">{asset.assetName}</h3>
              
              {/* Status Badge */}
              <div className="mb-3">
                <span className={`badge ${asset.status === 'Available' ? 'bg-success' : 'bg-warning'} fs-6`}>
                  {asset.status}
                </span>
              </div>

              {/* Asset Details */}
              <div className="row mb-3">
                <div className="col-sm-4">
                  <strong>Model:</strong>
                </div>
                <div className="col-sm-8">
                  {asset.assetModel || 'N/A'}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-4">
                  <strong>Category:</strong>
                </div>
                <div className="col-sm-8">
                  {asset.category?.categoryName || asset.categoryName || 'N/A'}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-4">
                  <strong>Value:</strong>
                </div>
                <div className="col-sm-8">
                  ₹{asset.assetValue?.toLocaleString() || 'N/A'}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-4">
                  <strong>Manufacturing Date:</strong>
                </div>
                <div className="col-sm-8">
                  {asset.manufacturingDate ? new Date(asset.manufacturingDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-4">
                  <strong>Expiry Date:</strong>
                </div>
                <div className="col-sm-8">
                  {asset.expiryDate ? new Date(asset.expiryDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              {/* Description */}
              {asset.description && (
                <div className="mb-4">
                  <strong>Description:</strong>
                  <p className="mt-2 text-muted">{asset.description}</p>
                </div>
              )}

              {/* Request Button */}
              <div className="d-grid gap-2">
                {asset.status === 'Available' ? (
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={handleRequestAsset}
                    disabled={requesting}
                  >
                    {requesting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting Request...
                      </>
                    ) : (
                      'Request This Asset'
                    )}
                  </button>
                ) : (
                  <button className="btn btn-secondary btn-lg" disabled>
                    Asset Not Available
                  </button>
                )}
              </div>

              {/* Additional Info */}
              <div className="mt-4 p-3 bg-light rounded">
                <small className="text-muted">
                  <strong>Note:</strong> Once you submit a request, it will be reviewed by an administrator. 
                  You will be notified of the approval status.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetails;
