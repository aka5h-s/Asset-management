import { useState, useEffect } from 'react';
import AmsService from '../../Service/AmsService.js';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    categoryName: ''
  });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await AmsService.getAllAssetCategories();
      // Sort categories by ID in ascending order
      const sortedCategories = response.data.sort((a, b) => 
        a.categoryId - b.categoryId
      );
      setCategories(sortedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMsg('Error: Error fetching categories');
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

    if (!formData.categoryName.trim()) {
      setMsg('Error: Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        await AmsService.updateAssetCategory(editingCategory.categoryId, formData);
        setMsg('Success: Category updated successfully!');
      } else {
        await AmsService.addAssetCategory(formData);
        setMsg('Success: Category created successfully!');
      }
      
      setShowForm(false);
      setEditingCategory(null);
      setFormData({
        categoryName: ''
      });
      fetchCategories();
    } catch (error) {
      setMsg('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      categoryName: category.categoryName
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await AmsService.deleteAssetCategory(categoryId);
        setMsg('Success: Category deleted successfully!');
        fetchCategories();
      } catch (error) {
        setMsg('Error: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      categoryName: ''
    });
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
        <h2>Manage Asset Categories</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Add Category
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
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h5>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="categoryName" className="form-label">Category Name *</label>
                <input
                  type="text"
                  className="form-control"
                  id="categoryName"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleChange}
                  required
                />
              </div>


              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? 'Update Category' : 'Create Category'}
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
          <h5 className="card-title">Categories List</h5>
          <div className="table-responsive">
            <table className="table table-sm table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.categoryId}>
                    <td>{category.categoryId}</td>
                    <td>
                      <span className="badge bg-primary">
                        {category.categoryName}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => handleEdit(category)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(category.categoryId)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;
