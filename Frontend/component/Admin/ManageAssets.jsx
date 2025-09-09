import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AmsService from '../../Service/AmsService.js';
import { extractError } from '../../Service/ErrorHelper.js';
import AutoSuggestInput from '../Shared/AutoSuggestInput.jsx';

const ManageAssets = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assetQuery, setAssetQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [formData, setFormData] = useState({
    assetName: '',
    assetModel: '',
    assetValue: '',
    categoryId: '',
    categoryName: '',
    status: 'Available',
    manufacturingDate: '',
    expiryDate: '',
    description: '',
    imageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assetsResponse, categoriesResponse] = await Promise.all([
        AmsService.getAllAssets(),
        AmsService.getAllAssetCategories()
      ]);

      setAssets(assetsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMsg('Error: Error fetching data: ' + extractError(error, 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    if (!formData.assetName.trim() || !formData.categoryId) {
      setMsg('Error: Asset name and category are required');
      return;
    }

    // Validate manufacturing date is not in the future
    const today = new Date().toISOString().split('T')[0];
    if (formData.manufacturingDate > today) {
      setMsg('Error: Manufacturing date cannot be in the future');
      return;
    }

    // Validate expiry date is after manufacturing date
    if (formData.expiryDate && formData.manufacturingDate && formData.expiryDate <= formData.manufacturingDate) {
      setMsg('Error: Expiry date must be after manufacturing date');
      return;
    }

    try {
      const payload = {
        assetId: editingAsset ? editingAsset.assetId : Math.floor(Math.random() * 10000) + 1, // Generate random ID for new assets
        assetName: formData.assetName,
        assetModel: formData.assetModel,
        assetValue: parseFloat(formData.assetValue),
        categoryName: formData.categoryName,
        status: formData.status,
        manufacturingDate: formData.manufacturingDate,
        expiryDate: formData.expiryDate,
        description: formData.description,
        imageUrl: formData.imageUrl
      };

      let assetId;
      if (editingAsset) {
        await AmsService.updateAsset(editingAsset.assetId, payload);
        assetId = editingAsset.assetId;
        setMsg('Success: Asset updated successfully!');
      } else {
        const response = await AmsService.addAsset(payload);
        assetId = response.data.assetId;
        setMsg('Success: Asset created successfully!');
      }

      // Upload image if selected
      if (selectedFile && assetId) {
        setUploadingImage(true);
        try {
          const formData = new FormData();
          formData.append('file', selectedFile);
          
          const token = localStorage.getItem('ams_token');
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8092/api/v1'}/assets/${assetId}/image`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          
          if (response.ok) {
            setMsg(prev => prev + ' Image uploaded successfully!');
          } else {
            setMsg(prev => prev + ' Asset saved but image upload failed.');
          }
        } catch (error) {
          console.error('Image upload error:', error);
          setMsg(prev => prev + ' Asset saved but image upload failed.');
        } finally {
          setUploadingImage(false);
        }
      }
      
      setShowForm(false);
      setEditingAsset(null);
      setSelectedFile(null);
      setFormData({
        assetName: '',
        assetModel: '',
        assetValue: '',
        categoryId: '',
        categoryName: '',
        status: 'Available',
        manufacturingDate: '',
        expiryDate: '',
        description: '',
        imageUrl: ''
      });
      fetchData();
    } catch (error) {
      setMsg('Error: ' + extractError(error, 'Operation failed'));
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      assetName: asset.assetName,
      assetModel: asset.assetModel || '',
      assetValue: asset.assetValue ? asset.assetValue.toString() : '',
      categoryId: asset.category?.categoryId ? asset.category.categoryId.toString() : '',
      categoryName: asset.category?.categoryName || '',
      status: asset.status,
      manufacturingDate: asset.manufacturingDate || '',
      expiryDate: asset.expiryDate || '',
      description: asset.description || '',
      imageUrl: asset.imageUrl || ''
    });
    setSelectedFile(null);
    setShowForm(true);
  };

  const handleDelete = async (assetId) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await AmsService.deleteAsset(assetId);
        setMsg('Success: Asset deleted successfully!');
        fetchData();
      } catch (error) {
        setMsg('Error: ' + extractError(error, 'Failed to delete asset'));
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingAsset(null);
    setSelectedFile(null);
    setFormData({
      assetName: '',
      assetModel: '',
      assetValue: '',
      categoryId: '',
      categoryName: '',
      status: 'Available',
      manufacturingDate: '',
      expiryDate: '',
      description: '',
      imageUrl: ''
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Preview the image
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, imageUrl: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };


  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.categoryId === categoryId);
    return category ? category.categoryName : 'Unknown';
  };

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Assets</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Add Asset
        </button>
      </div>

      {msg && (
        <div className={`alert ${msg.includes('Success:') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
          {msg}
        </div>
      )}

      {showForm && (
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h5 className="card-title">
              {editingAsset ? 'Edit Asset' : 'Add New Asset'}
            </h5>
            
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="assetName" className="form-label">Asset Name *</label>
                  <input
                    type="text"
                    className="form-control ams-input"
                    id="assetName"
                    name="assetName"
                    value={formData.assetName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="assetModel" className="form-label">Asset Model *</label>
                  <input
                    type="text"
                    className="form-control ams-input"
                    id="assetModel"
                    name="assetModel"
                    value={formData.assetModel}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="categoryId" className="form-label">Category *</label>
                  <select
                    className="form-select ams-input"
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={(e) => {
                      const selectedCategory = categories.find(cat => cat.categoryId === parseInt(e.target.value));
                      setFormData({
                        ...formData,
                        categoryId: e.target.value,
                        categoryName: selectedCategory ? selectedCategory.categoryName : ''
                      });
                    }}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.categoryId} value={category.categoryId}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="assetValue" className="form-label">Asset Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control ams-input"
                    id="assetValue"
                    name="assetValue"
                    value={formData.assetValue}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>


              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="manufacturingDate" className="form-label">Manufacturing Date *</label>
                  <input
                    type="date"
                    className="form-control ams-input"
                    id="manufacturingDate"
                    name="manufacturingDate"
                    value={formData.manufacturingDate}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="expiryDate" className="form-label">Expiry Date *</label>
                  <input
                    type="date"
                    className="form-control ams-input"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    min={formData.manufacturingDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    className="form-select ams-input"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Borrowed">Borrowed</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  className="form-control ams-input"
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter asset description..."
                />
              </div>

              <div className="mb-3">
                <label htmlFor="image" className="form-label">Asset Image</label>
                <input
                  type="file"
                  className="form-control ams-input"
                  id="image"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={formData.imageUrl} 
                      alt="Asset preview" 
                      style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                      className="img-thumbnail"
                    />
                  </div>
                )}
              </div>

              <div className="d-flex gap-2">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Uploading...
                    </>
                  ) : (
                    editingAsset ? 'Update Asset' : 'Create Asset'
                  )}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Assets List</h5>
          <div className="mb-3">
            <AutoSuggestInput
              value={assetQuery}
              onChange={setAssetQuery}
              data={assets}
              getLabel={(asset) => `${asset.assetName} - ${asset.assetModel || 'N/A'} - ${asset.category?.categoryName || 'N/A'}`}
              placeholder="Search assets by name, model, category, status..."
              className="form-control"
            />
          </div>
          <div className="table-responsive">
            <table className="table table-sm table-striped table-hover">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>ID</th>
                    <th>Asset Name</th>
                    <th>Model</th>
                    <th>Category</th>
                    <th>Value</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
              <tbody>
                {(() => {
                  const q = assetQuery.trim().toLowerCase();
                  const filteredAssets = !q ? assets : assets.filter(a => {
                    const fields = [
                      a.assetName, a.assetModel, a.category?.categoryName || a.categoryName,
                      a.status, String(a.assetValue ?? '')
                    ].map(x => (x || '').toString().toLowerCase());
                    return fields.some(f => f.includes(q));
                  });
                  return filteredAssets.map(asset => (
                  <tr key={asset.assetId}>
                    <td>
                      <img 
                        src={asset.imageUrl ? `${import.meta.env.VITE_API_URL || 'http://localhost:8092/api/v1'}${asset.imageUrl}` : '/placeholder.svg'} 
                        alt={asset.assetName}
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        className="img-thumbnail"
                        onError={(e) => {
                          e.target.src = '/placeholder.svg';
                        }}
                      />
                    </td>
                    <td>{asset.assetId}</td>
                    <td className="fw-bold">
                      <Link to={`/admin/assets/${asset.assetId}`} className="text-decoration-none">
                        {asset.assetName}
                      </Link>
                    </td>
                    <td>{asset.assetModel || 'N/A'}</td>
                    <td>
                      <span className="badge bg-secondary">
                        {asset.category?.categoryName || 'Unknown'}
                      </span>
                    </td>
                    <td>${asset.assetValue || 'N/A'}</td>
                    <td>
                      <small className="text-muted">
                        {asset.description ? 
                          (asset.description.length > 50 ? 
                            asset.description.substring(0, 50) + '...' : 
                            asset.description) : 
                          'No description'
                        }
                      </small>
                    </td>
                    <td>
                      <span className={`badge ${
                        asset.status === 'Available' ? 'bg-success' : 
                        asset.status === 'Borrowed' ? 'bg-warning' : 'bg-secondary'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => handleEdit(asset)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(asset.assetId)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAssets;
