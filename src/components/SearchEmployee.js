import React, { useState } from 'react';
import { searchEmployees, getProjects, allocateEmployee } from '../api/api';

const SearchEmployee = () => {
  const [filters, setFilters] = useState({ technology: '', minRating: 1.0, minExperience: 0 });
  const [results, setResults] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAllocModal, setShowAllocModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [notes, setNotes] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchEmployees({
        technology: filters.technology || null,
        minRating: parseFloat(filters.minRating),
        minExperience: parseInt(filters.minExperience)
      });
      setResults(res.data);
    } catch { setMessage('Search failed.'); }
    finally { setLoading(false); }
  };

  const openAllocModal = async (emp) => {
    setSelectedEmployee(emp);
    setSelectedProject('');
    setNotes('');
    try {
      const res = await getProjects();
      setProjects(res.data.filter(p => p.status === 'Open' || p.status === 'InProgress'));
    } catch { setMessage('Failed to load projects.'); }
    setShowAllocModal(true);
  };

  const handleAllocate = async () => {
    if (!selectedProject) { setMessage('Please select a project.'); return; }
    try {
      await allocateEmployee({
        projectId: parseInt(selectedProject),
        employeeId: selectedEmployee.employeeId,
        notes
      });
      setMessage(`✅ ${selectedEmployee.fullName} allocated successfully!`);
      setShowAllocModal(false);
      handleSearch({ preventDefault: () => {} });
    } catch (err) {
      setMessage('Allocation failed. Employee may already be allocated to this project.');
    }
  };

  const getRatingBadge = (rating) => {
    if (rating >= 4.5) return 'badge bg-success';
    if (rating >= 3.5) return 'badge bg-warning text-dark';
    return 'badge bg-danger';
  };

  return (
    <div>
      <h4 className="fw-bold text-primary mb-3">🔍 Search & Allocate Employees</h4>

      {message && <div className="alert alert-info alert-dismissible">
        {message} <button className="btn-close" onClick={() => setMessage('')}></button>
      </div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h6 className="fw-bold mb-3">Filter Employees</h6>
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Technology</label>
                <input className="form-control" placeholder="e.g. React, SQL Server"
                  value={filters.technology}
                  onChange={(e) => setFilters({ ...filters, technology: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Minimum Rating</label>
                <input type="number" className="form-control" step="0.1" min="1" max="5"
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Minimum Experience (Years)</label>
                <input type="number" className="form-control" min="0"
                  value={filters.minExperience}
                  onChange={(e) => setFilters({ ...filters, minExperience: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
              {loading ? 'Searching...' : '🔍 Search'}
            </button>
          </form>
        </div>
      </div>

      {searched && (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="px-3 pt-3 pb-2 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">
                {results.length > 0 ? `✅ ${results.length} Matching Employee(s) Found` : '❌ No matching employees found'}
              </h6>
            </div>
            {results.length > 0 && (
              <table className="table table-hover mb-0">
                <thead className="table-success">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Technology</th>
                    <th>Experience</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((emp, i) => (
                    <tr key={emp.employeeId}>
                      <td>{i + 1}</td>
                      <td className="fw-semibold">{emp.fullName}</td>
                      <td><span className="badge bg-info text-dark">{emp.technology}</span></td>
                      <td>{emp.experienceYears} yrs</td>
                      <td><span className={getRatingBadge(emp.rating)}>⭐ {emp.rating}</span></td>
                      <td><span className="badge bg-success">{emp.status}</span></td>
                      <td>
                        <button className="btn btn-sm btn-success"
                          onClick={() => openAllocModal(emp)}>
                          Allocate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {showAllocModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Allocate Employee</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowAllocModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Employee:</strong> {selectedEmployee?.fullName}</p>
                <p><strong>Technology:</strong> {selectedEmployee?.technology}</p>
                <div className="mb-3">
                  <label className="form-label">Select Project</label>
                  <select className="form-select" value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}>
                    <option value="">-- Select Project --</option>
                    {projects.map(p => (
                      <option key={p.projectId} value={p.projectId}>
                        {p.projectName} ({p.requiredTechnology})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea className="form-control" rows="2" value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any notes about this allocation..."></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAllocModal(false)}>Cancel</button>
                <button className="btn btn-success" onClick={handleAllocate}>✅ Confirm Allocation</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchEmployee;