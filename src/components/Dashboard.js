import React, { useState, useEffect } from 'react';
import { getEmployees, getProjects, getAllocations } from '../api/api';
import Employees from './Employees';
import Projects from './Projects';
import SearchEmployee from './SearchEmployee';
import Allocations from './Allocations';

const Dashboard = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalEmployees: 0, availableEmployees: 0,
    totalProjects: 0, totalAllocations: 0
  });

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [empRes, projRes, allocRes] = await Promise.all([
        getEmployees(), getProjects(), getAllocations()
      ]);
      setStats({
        totalEmployees: empRes.data.length,
        availableEmployees: empRes.data.filter(e => e.status === 'Available').length,
        totalProjects: projRes.data.length,
        totalAllocations: allocRes.data.length
      });
    } catch {}
  };

  const navItems = [
    { key: 'dashboard', label: '🏠 Dashboard' },
    { key: 'employees', label: '👥 Employees' },
    { key: 'projects', label: '📁 Projects' },
    { key: 'search', label: '🔍 Search & Allocate' },
    { key: 'allocations', label: '📋 Allocations' },
  ];

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <div className="d-flex flex-column bg-primary text-white" style={{ width: '240px', minHeight: '100vh' }}>
        <div className="p-3 border-bottom border-light">
          <h5 className="fw-bold mb-0">🏢 EmpAllocation</h5>
          <small className="opacity-75">Manager Portal</small>
        </div>
        <nav className="flex-grow-1 p-2">
          {navItems.map(item => (
            <button key={item.key}
              className={`btn w-100 text-start mb-1 ${activeTab === item.key ? 'btn-light text-primary fw-bold' : 'btn-primary text-white'}`}
              onClick={() => { setActiveTab(item.key); if (item.key === 'dashboard') fetchStats(); }}>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-top border-light">
          <small className="d-block opacity-75 mb-2">👤 {admin.username}</small>
          <button className="btn btn-outline-light btn-sm w-100" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 bg-light overflow-auto">
        <div className="p-4">

          {activeTab === 'dashboard' && (
            <div>
              <h4 className="fw-bold text-primary mb-4">
                Welcome back, {admin.username}! 👋
              </h4>

              {/* Stats Cards */}
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body text-center">
                      <div className="display-6 fw-bold text-primary">{stats.totalEmployees}</div>
                      <div className="text-muted">Total Employees</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body text-center">
                      <div className="display-6 fw-bold text-success">{stats.availableEmployees}</div>
                      <div className="text-muted">Available</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body text-center">
                      <div className="display-6 fw-bold text-warning">{stats.totalProjects}</div>
                      <div className="text-muted">Total Projects</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body text-center">
                      <div className="display-6 fw-bold text-danger">{stats.totalAllocations}</div>
                      <div className="text-muted">Allocations</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <h5 className="fw-bold mb-3">Quick Actions</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="card shadow-sm border-0 h-100 cursor-pointer"
                    onClick={() => setActiveTab('employees')}
                    style={{ cursor: 'pointer' }}>
                    <div className="card-body text-center py-4">
                      <div className="fs-1">👥</div>
                      <h6 className="fw-bold mt-2">Manage Employees</h6>
                      <p className="text-muted small">Add, edit or remove employees</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card shadow-sm border-0 h-100"
                    onClick={() => setActiveTab('projects')}
                    style={{ cursor: 'pointer' }}>
                    <div className="card-body text-center py-4">
                      <div className="fs-1">📁</div>
                      <h6 className="fw-bold mt-2">Manage Projects</h6>
                      <p className="text-muted small">Create and manage projects</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card shadow-sm border-0 h-100"
                    onClick={() => setActiveTab('search')}
                    style={{ cursor: 'pointer' }}>
                    <div className="card-body text-center py-4">
                      <div className="fs-1">🔍</div>
                      <h6 className="fw-bold mt-2">Search & Allocate</h6>
                      <p className="text-muted small">Find and assign best employees</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'employees' && <Employees />}
          {activeTab === 'projects' && <Projects />}
          {activeTab === 'search' && <SearchEmployee />}
          {activeTab === 'allocations' && <Allocations />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;