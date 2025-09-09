import { useState, useEffect } from 'react';
import AmsService from '../../Service/AmsService.js';
import { extractError } from '../../Service/ErrorHelper.js';
import AutoSuggestInput from '../Shared/AutoSuggestInput.jsx';

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [employeeQuery, setEmployeeQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    contactNumber: '',
    address: '',
    email: '',
    password: '',
    role: 'USER'
  });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await AmsService.getAllEmployees();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setMsg('Error: Error fetching employees: ' + extractError(error, 'Failed to load employees'));
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

    try {
      const payload = {
        employeeId: editingEmployee ? editingEmployee.employeeId : Math.floor(Math.random() * 10000) + 1,
        name: formData.name,
        gender: formData.gender,
        contactNumber: formData.contactNumber,
        address: formData.address,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      if (editingEmployee) {
        await AmsService.updateEmployee(editingEmployee.employeeId, payload);
        setMsg('Success: Employee updated successfully!');
      } else {
        await AmsService.registerEmployee(payload);
        setMsg('Success: Employee created successfully!');
      }
      
      setShowForm(false);
      setEditingEmployee(null);
      setFormData({
        name: '',
        gender: '',
        contactNumber: '',
        address: '',
        email: '',
        password: '',
        role: 'USER'
      });
      fetchEmployees();
    } catch (error) {
      setMsg('Error: ' + extractError(error, 'Operation failed'));
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      gender: employee.gender,
      contactNumber: employee.contactNumber,
      address: employee.address,
      email: employee.email,
      password: '',
      role: employee.role
    });
    setShowForm(true);
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await AmsService.deleteEmployee(employeeId);
        setMsg('Success: Employee deleted successfully!');
        fetchEmployees();
      } catch (error) {
        setMsg('Error: ' + extractError(error, 'Failed to delete employee'));
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
    setFormData({
      name: '',
      gender: '',
      contactNumber: '',
      address: '',
      email: '',
      password: '',
      role: 'USER'
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
        <h2>Manage Employees</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Add Employee
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
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h5>
            
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="name" className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="gender" className="form-label">Gender</label>
                  <select
                    className="form-select"
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
                <div className="col-md-6 mb-3">
                  <label htmlFor="email" className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="contactNumber" className="form-label">Contact Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="address" className="form-label">Address *</label>
                <textarea
                  className="form-control"
                  id="address"
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="password" className="form-label">
                    Password {editingEmployee ? '(leave blank to keep current)' : '*'}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingEmployee}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="role" className="form-label">Role</label>
                  <select
                    className="form-select"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="USER">Employee</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {editingEmployee ? 'Update Employee' : 'Create Employee'}
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
          <h5 className="card-title">Employees List</h5>
          <div className="mb-3">
            <AutoSuggestInput
              value={employeeQuery}
              onChange={setEmployeeQuery}
              data={employees}
              getLabel={(employee) => `${employee.name} - ${employee.email} - ${employee.role}`}
              placeholder="Search employees by name, email, role, contact..."
              className="form-control"
            />
          </div>
          <div className="table-responsive">
            <table className="table table-sm table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const eq = employeeQuery.trim().toLowerCase();
                  const filteredEmployees = !eq ? employees : employees.filter(e => {
                    const fields = [
                      e.name, e.email, e.role, e.contactNumber, e.address
                    ].map(x => (x || '').toString().toLowerCase());
                    return fields.some(f => f.includes(eq));
                  });
                  return filteredEmployees.map(employee => (
                  <tr key={employee.employeeId}>
                    <td>{employee.employeeId}</td>
                    <td>
                      <div>
                        <div className="fw-bold">{employee.name}</div>
                        <small className="text-muted">{employee.gender}</small>
                      </div>
                    </td>
                    <td>{employee.email}</td>
                    <td>{employee.contactNumber}</td>
                    <td>
                      <span className={`badge ${
                        employee.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'
                      }`}>
                        {employee.role === 'ADMIN' ? 'Admin' : 'Employee'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => handleEdit(employee)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(employee.employeeId)}
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

export default ManageEmployees;
