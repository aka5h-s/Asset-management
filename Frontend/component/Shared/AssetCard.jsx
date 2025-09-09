import React from 'react';
import { useNavigate } from 'react-router-dom';

// Show an asset as a card with image, name, and optional actions
const AssetCard = ({ asset, onSelect, showSelectButton = true, clickable = false }) => {
  const navigate = useNavigate();

  const handleSelect = (e) => {
    e.stopPropagation(); // Prevent card click when button is clicked
    if (onSelect) {
      onSelect(asset);
    }
  };

  const handleCardClick = () => {
    if (clickable) {
      navigate(`/employee/asset-details/${asset.assetId}`);
    }
  };

  return (
    <div 
      className={`ams-card ${clickable ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      <div className="ams-card-image">
        <img 
          src={asset.imageUrl ? `http://localhost:8092/api/v1${asset.imageUrl}` : '/placeholder.svg'} 
          alt={asset.assetName || asset.name} 
          onError={(e) => {
            e.target.src = '/placeholder.svg'; // Fallback image keeps layout stable if no imageUrl is set
          }}
        />
      </div>
      <div className="ams-card-body">
        <div className="ams-card-title">{asset.assetName || asset.name}</div>
        {asset.description && (
          <div className="ams-card-desc">{asset.description}</div>
        )}
        <div className="ams-card-details">
          <small className="text-muted">
            {asset.category?.categoryName || asset.categoryName} • 
            ₹{asset.assetValue || asset.value}
          </small>
        </div>
        {showSelectButton && onSelect && (
          <button 
            className="btn btn-primary btn-sm mt-2" 
            onClick={handleSelect}
          >
            Select
          </button>
        )}
        {clickable && (
          <div className="mt-2">
            <small className="text-muted">Click to view details</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetCard;
