import React, { useState, useEffect } from 'react';
import { getProjects, addProject, updateProject, deleteProject } from '../api/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    projectId: 0, projectName: '', requiredTechnology: '',
    requiredExperience: '', minRating: '', startDate: '', status: 'Open'
  });

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch { setMessage('Failed to load projects.'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        requiredExperience: parseInt(form.requiredExperience),
        minRating: parseFloat(form.minRating)
      };
      if (editMode) {
        await updateProject(payload);
        setMessage('Project updated successfully!');
      } else {
        await addProject(payload);
        setMessage('Project added successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchProjects();
    } catch { setMessage('Operation failed.'); }
    finally { setLoading(false); }
  };

  const handleEdit = (proj) => {
    setForm({ ...proj, startDate: proj.startDate });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await deleteProject(id);
      setMessage('Project deleted.');
      fetchProjects();
    } catch { setMessage('Delete failed.'); }
  };

  const resetForm = () => {
    setForm({ projectId: 0, projectName: '', requiredTechnology: '', requiredExperience: '', minRating: '', startDate: '', status: 'Open' });
    setEditMode(false);
  };

  const getStatusBadge = (status) => {
    if (status === 'Open') return 'badge bg-success';
    if (status === 'InProgress') return 'badge bg-primary';
    if (status === 'Completed') return 'badge bg-secondary';
    return 'badge bg-danger';
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-primary">📁 Projects</h4>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Add Project
        </button>
      </div>

      {message && <div className="alert alert-info alert-dismissible">
        {message} <button className="btn-close" onClick={() => setMessage('')}></button>
      </div>}

      <div className="row">
        {projects.length === 0 ? (
          <div className="text-center text-muted py-4">No projects found.</div>
        ) : projects.map((proj) => (
          <div className="col-md-6 mb-3" key={proj.projectId}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <h5 className="card-title fw-bold">{proj.projectName}</h5>
                  <span className={getStatusBadge(proj.status)}>{proj.status}</span>
                </div>
                <p className="mb-1"><span className="badge bg-info text-dark me-1">{proj.requiredTechnology}</span></p>
                <p className="mb-1 text-muted small">
                  Min Experience: <strong>{proj.requiredExperience} yrs</strong> |
                  Min Rating: <strong>⭐ {proj.minRating}</strong>
                </p>
                <p className="mb-2 text-muted small">Start Date: <strong>{proj.startDate}</strong></p>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(proj)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(proj.projectId)}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">{editMode ? 'Edit Project' : 'Add Project'}</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Project Name</label>
                    <input className="form-control" value={form.projectName}
                      onChange={(e) => setForm({ ...form, projectName: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Required Technology</label>
                    <input className="form-control" value={form.requiredTechnology}
                      onChange={(e) => setForm({ ...form, requiredTechnology: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Required Experience (Years)</label>
                    <input type="number" className="form-control" value={form.requiredExperience}
                      onChange={(e) => setForm({ ...form, requiredExperience: e.target.value })} required min="0" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Minimum Rating</label>
                    <input type="number" className="form-control" value={form.minRating} step="0.1"
                      onChange={(e) => setForm({ ...form, minRating: e.target.value })} required min="1" max="5" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-control" value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                  </div>
                  {editMode && (
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option>Open</option>
                        <option>InProgress</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
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

export default Projects;