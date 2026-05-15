import React, { useState, useEffect } from 'react';
import { getAllocations, removeAllocation } from '../api/api';

const Allocations = () => {
  const [allocations, setAllocations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { fetchAllocations(); }, []);

  const fetchAllocations = async () => {
    try {
      const res = await getAllocations();
      setAllocations(res.data);
      setFiltered(res.data);
    } catch { setMessage('Failed to load allocations.'); }
  };

  const handleSearch = (val) => {
    setSearch(val);
    const lower = val.toLowerCase();
    setFiltered(allocations.filter(a =>
      a.projectName.toLowerCase().includes(lower) ||
      a.fullName.toLowerCase().includes(lower) ||
      a.technology.toLowerCase().includes(lower)
    ));
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this allocation?')) return;
    try {
      await removeAllocation(id);
      setMessage('Allocation removed successfully.');
      fetchAllocations();
    } catch { setMessage('Remove failed.'); }
  };

  const groupByProject = () => {
    const groups = {};
    filtered.forEach(a => {
      if (!groups[a.projectName]) groups[a.projectName] = [];
      groups[a.projectName].push(a);
    });
    return groups;
  };

  const grouped = groupByProject();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-primary">📋 Project Allocations</h4>
        <span className="badge bg-primary fs-6">{allocations.length} Total</span>
      </div>

      {message && <div className="alert alert-info alert-dismissible">
        {message} <button className="btn-close" onClick={() => setMessage('')}></button>
      </div>}

      <div className="mb-3">
        <input className="form-control" placeholder="🔍 Search by project, employee or technology..."
          value={search} onChange={(e) => handleSearch(e.target.value)} />
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center text-muted py-4">
          <h5>No allocations found.</h5>
          <p>Use the Search & Allocate tab to assign employees to projects.</p>
        </div>
      ) : (
        Object.keys(grouped).map(projectName => (
          <div className="card shadow-sm mb-4" key={projectName}>
            <div className="card-header bg-primary text-white">
              <h6 className="mb-0 fw-bold">📁 {projectName}</h6>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Employee</th>
                    <th>Technology</th>
                    <th>Experience</th>
                    <th>Rating</th>
                    <th>Allocated On</th>
                    <th>Notes</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[projectName].map((a, i) => (
                    <tr key={a.allocationId}>
                      <td>{i + 1}</td>
                      <td className="fw-semibold">{a.fullName}</td>
                      <td><span className="badge bg-info text-dark">{a.technology}</span></td>
                      <td>{a.experienceYears} yrs</td>
                      <td><span className="badge bg-success">⭐ {a.rating}</span></td>
                      <td>{a.allocationDate}</td>
                      <td>{a.notes || '-'}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemove(a.allocationId)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Allocations;