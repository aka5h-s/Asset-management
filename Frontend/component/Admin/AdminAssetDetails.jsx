import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AmsService from '../../Service/AmsService.js';
import { extractError } from '../../Service/ErrorHelper.js';

export default function AdminAssetDetails() {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { data } = await AmsService.getAssetById(assetId);
        if (!ignore) setAsset(data);
      } catch (err) {
        if (!ignore) setMsg('Error: ' + extractError(err));
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => (ignore = true);
  }, [assetId]);

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (msg) return <div className="container mt-4 alert alert-danger">{msg}</div>;
  if (!asset) return <div className="container mt-4">Not found.</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center mb-3">
        <h3 className="me-auto mb-0">Asset #{asset.assetId} – {asset.assetName}</h3>
        <Link className="btn btn-outline-secondary btn-sm" to="/admin/assets">Back</Link>
      </div>

      <div className="card">
        <div className="card-body">
          <dl className="row">
            <dt className="col-sm-3">Model</dt><dd className="col-sm-9">{asset.assetModel || 'N/A'}</dd>
            <dt className="col-sm-3">Category</dt><dd className="col-sm-9">{asset.categoryName || 'N/A'}</dd>
            <dt className="col-sm-3">Value</dt><dd className="col-sm-9">{asset.assetValue ?? 'N/A'}</dd>
            <dt className="col-sm-3">Manufactured On</dt><dd className="col-sm-9">{asset.manufacturingDate || 'N/A'}</dd>
            <dt className="col-sm-3">Expiry Date</dt><dd className="col-sm-9">{asset.expiryDate || 'N/A'}</dd>
            <dt className="col-sm-3">Status</dt><dd className="col-sm-9">{asset.status || 'N/A'}</dd>
            <dt className="col-sm-3">Description</dt><dd className="col-sm-9">{asset.description || 'N/A'}</dd>
          </dl>
          {asset.imageUrl && (
            <div className="mt-3">
              <img 
                src={asset.imageUrl.startsWith('http') ? asset.imageUrl : `http://localhost:8092/api/v1${asset.imageUrl}`} 
                alt={asset.assetName} 
                className="img-fluid rounded"
                onError={(e) => {
                  e.target.src = '/placeholder.svg';
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
