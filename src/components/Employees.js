import React, { useState, useEffect } from 'react';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '../api/api';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    employeeId: 0, fullName: '', technology: '', experienceYears: '', rating: '', status: 'Available'
  });

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } catch { setMessage('Failed to load employees.'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editMode) {
        await updateEmployee({ ...form, experienceYears: parseInt(form.experienceYears), rating: parseFloat(form.rating) });
        setMessage('Employee updated successfully!');
      } else {
        await addEmployee({ ...form, experienceYears: parseInt(form.experienceYears), rating: parseFloat(form.rating) });
        setMessage('Employee added successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchEmployees();
    } catch { setMessage('Operation failed.'); }
    finally { setLoading(false); }
  };

  const handleEdit = (emp) => {
    setForm(emp);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    try {
      await deleteEmployee(id);
      setMessage('Employee deleted.');
      fetchEmployees();
    } catch { setMessage('Delete failed.'); }
  };

  const resetForm = () => {
    setForm({ employeeId: 0, fullName: '', technology: '', experienceYears: '', rating: '', status: 'Available' });
    setEditMode(false);
  };

  const getRatingBadge = (rating) => {
    if (rating >= 4.5) return 'badge bg-success';
    if (rating >= 3.5) return 'badge bg-warning text-dark';
    return 'badge bg-danger';
  };

  const getStatusBadge = (status) => {
    if (status === 'Available') return 'badge bg-success';
    if (status === 'Allocated') return 'badge bg-primary';
    return 'badge bg-secondary';
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-primary">👥 Employees</h4>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Add Employee
        </button>
      </div>

      {message && <div className="alert alert-info alert-dismissible">
        {message} <button className="btn-close" onClick={() => setMessage('')}></button>
      </div>}

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-primary">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Technology</th>
                <th>Experience</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan="7" className="text-center text-muted py-3">No employees found.</td></tr>
              ) : employees.map((emp, i) => (
                <tr key={emp.employeeId}>
                  <td>{i + 1}</td>
                  <td className="fw-semibold">{emp.fullName}</td>
                  <td><span className="badge bg-info text-dark">{emp.technology}</span></td>
                  <td>{emp.experienceYears} yrs</td>
                  <td><span className={getRatingBadge(emp.rating)}>⭐ {emp.rating}</span></td>
                  <td><span className={getStatusBadge(emp.status)}>{emp.status}</span></td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEdit(emp)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(emp.employeeId)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">{editMode ? 'Edit Employee' : 'Add Employee'}</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input className="form-control" value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Technology</label>
                    <input className="form-control" value={form.technology}
                      onChange={(e) => setForm({ ...form, technology: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Experience (Years)</label>
                    <input type="number" className="form-control" value={form.experienceYears}
                      onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} required min="0" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Rating (1.0 - 5.0)</label>
                    <input type="number" className="form-control" value={form.rating} step="0.1"
                      onChange={(e) => setForm({ ...form, rating: e.target.value })} required min="1" max="5" />
                  </div>
                  {editMode && (
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option>Available</option>
                        <option>Allocated</option>
                        <option>OnLeave</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : editMode ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;