import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminService, complaintService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { StateBadge, PriorityBadge, NetworkTypeBadge } from '../components/common/Badge';
import { LoadingSpinner, EmptyState } from '../components/common/LoadingSpinner';
import {
  Layers,
  Search,
  Filter,
  Eye,
  GitBranch,
  UserCheck,
  Wrench,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  CheckCheck,
  Clock,
  Building,
  User
} from 'lucide-react';

const DEPARTMENTS = [
  'ALL',
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & Data Science',
  'Cyber Security'
];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error } = useToast();

  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [networkFilter, setNetworkFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState('R. Rajesh');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [transitionModalOpen, setTransitionModalOpen] = useState(false);
  const [transitionSymbol, setTransitionSymbol] = useState(null);
  const [transitionRemarks, setTransitionRemarks] = useState('');

  const TECHNICIANS = [
    { name: 'R. Rajesh', phone: '+91 98401 23456', email: 'rajesh.net@college.edu', spec: 'Campus Wi-Fi & APs' },
    { name: 'M. Suresh', phone: '+91 98402 34567', email: 'suresh.lan@college.edu', spec: 'Structured Cabling & LAN' },
    { name: 'K. Anitha', phone: '+91 98403 45678', email: 'anitha.auth@college.edu', spec: 'RADIUS & Firewall Auth' },
    { name: 'V. Prakash', phone: '+91 98404 56789', email: 'prakash.infra@college.edu', spec: 'Core Switching & Routing' }
  ];

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, priorityFilter, departmentFilter, networkFilter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;
      if (departmentFilter !== 'ALL') params.department = departmentFilter;
      if (networkFilter !== 'ALL') params.networkType = networkFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await adminService.getComplaints(params);
      if (res.data && res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Failed to fetch complaints list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleOpenAssign = (c) => {
    setSelectedComplaint(c);
    setSelectedTech(TECHNICIANS[0].name);
    setAssignRemarks('');
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setActionLoading(true);
    try {
      const tech = TECHNICIANS.find((t) => t.name === selectedTech) || TECHNICIANS[0];
      const res = await adminService.assignTechnician(selectedComplaint.complaintId, {
        technicianName: tech.name,
        technicianPhone: tech.phone,
        technicianEmail: tech.email,
        remarks: assignRemarks || `Assigned to ${tech.name} (${tech.spec})`
      });

      if (res.data && res.data.success) {
        success(res.data.message || `Technician ${tech.name} assigned.`);
        setAssignModalOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Failed to assign technician.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenTransition = (c, symbol) => {
    setSelectedComplaint(c);
    setTransitionSymbol(symbol);
    setTransitionRemarks('');
    setTransitionModalOpen(true);
  };

  const handleTransitionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !transitionSymbol) return;

    setActionLoading(true);
    try {
      const res = await complaintService.executeTransition(selectedComplaint.complaintId, {
        inputSymbol: transitionSymbol,
        remarks: transitionRemarks
      });

      if (res.data && res.data.success) {
        success(res.data.message || `Transition '${transitionSymbol}' executed.`);
        setTransitionModalOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Transition execution failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
            All Network Complaints Management
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Total registered tickets: <strong style={{ color: '#0f172a' }}>{complaints.length}</strong> &bull; Governed strictly by Deterministic Finite Automaton rules.
          </p>
        </div>

        <Link to="/dfa-diagram" className="btn btn-secondary">
          <GitBranch size={16} /> DFA Transition Diagram
        </Link>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="netcare-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'center' }} className="filter-grid">
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color="#94a3b8"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search ID, Student Name, Reg No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>

          {/* State Filter */}
          <div>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setSearchParams(e.target.value !== 'ALL' ? { status: e.target.value } : {});
              }}
            >
              <option value="ALL">All States (S0 - S6)</option>
              <option value="S0">S0: Complaint Registered</option>
              <option value="S1">S1: Under Review</option>
              <option value="S2">S2: Assigned to Tech</option>
              <option value="S3">S3: Work In Progress</option>
              <option value="S4">S4: Resolved</option>
              <option value="S5">S5: Closed (Accepting)</option>
              <option value="S6">S6: Rejected (Sink)</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              className="form-control"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              className="form-control"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary btn-sm">
              <Search size={14} /> Search
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setDepartmentFilter('ALL');
                setNetworkFilter('ALL');
                setSearchTerm('');
                setSearchParams({});
              }}
              className="btn btn-secondary btn-sm"
              title="Reset Filters"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </form>
      </div>

      {/* Complaints Table Card */}
      <div className="netcare-card" style={{ padding: '1.25rem' }}>
        {loading ? (
          <LoadingSpinner text="Querying network database..." />
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No complaints match your query"
            message="Try widening your search terms or resetting filters to view all campus complaints."
            icon={Layers}
            action={
              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setPriorityFilter('ALL');
                  setDepartmentFilter('ALL');
                  setSearchTerm('');
                  setSearchParams({});
                }}
                className="btn btn-secondary btn-sm"
              >
                Reset All Filters
              </button>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="netcare-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Student Info</th>
                  <th>Category & Network</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Current DFA State</th>
                  <th>Assigned Tech</th>
                  <th style={{ textAlign: 'right' }}>DFA Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <Link
                        to={`/complaints/${c.complaintId}`}
                        style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}
                      >
                        {c.complaintId}
                      </Link>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        {c.studentSnapshot?.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {c.studentSnapshot?.registerNumber} &bull; {c.studentSnapshot?.department}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{c.category}</div>
                      <div style={{ marginTop: '3px', display: 'flex', gap: '0.35rem' }}>
                        <NetworkTypeBadge type={c.networkType} />
                      </div>
                    </td>

                    <td>
                      <div style={{ color: '#334155', fontWeight: 500 }}>{c.location}</div>
                      {c.locationDetails && (
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {c.locationDetails}
                        </div>
                      )}
                    </td>

                    <td>
                      <PriorityBadge priority={c.priority} />
                    </td>

                    <td>
                      <StateBadge state={c.currentState} label={c.status} />
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          color: c.assignedTechnician?.name !== 'Unassigned' ? '#0f172a' : '#94a3b8'
                        }}
                      >
                        {c.assignedTechnician?.name || 'Unassigned'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        {/* If in S0: REVIEW or REJECT */}
                        {c.currentState === 'S0' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenTransition(c, 'REVIEW')}
                              className="btn btn-primary btn-sm"
                              title="Review (S0 -> S1)"
                            >
                              <Play size={12} /> Review
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenTransition(c, 'REJECT')}
                              className="btn btn-danger btn-sm"
                              title="Reject (S0 -> S6)"
                            >
                              <XCircle size={12} />
                            </button>
                          </>
                        )}

                        {/* If in S1: ASSIGN or REJECT */}
                        {c.currentState === 'S1' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenAssign(c)}
                              className="btn btn-cyan btn-sm"
                              title="Assign Tech (S1 -> S2)"
                            >
                              <UserCheck size={12} /> Assign Tech
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenTransition(c, 'REJECT')}
                              className="btn btn-danger btn-sm"
                              title="Reject (S1 -> S6)"
                            >
                              <XCircle size={12} />
                            </button>
                          </>
                        )}

                        {/* If in S2: START_WORK */}
                        {c.currentState === 'S2' && (
                          <button
                            type="button"
                            onClick={() => handleOpenTransition(c, 'START_WORK')}
                            className="btn btn-sm"
                            style={{ backgroundColor: '#0891b2', color: '#ffffff' }}
                            title="Start Work (S2 -> S3)"
                          >
                            <Wrench size={12} /> Start Work
                          </button>
                        )}

                        {/* If in S3: RESOLVE */}
                        {c.currentState === 'S3' && (
                          <button
                            type="button"
                            onClick={() => handleOpenTransition(c, 'RESOLVE')}
                            className="btn btn-sm"
                            style={{ backgroundColor: '#059669', color: '#ffffff' }}
                            title="Resolve Issue (S3 -> S4)"
                          >
                            <CheckCircle2 size={12} /> Resolve
                          </button>
                        )}

                        {/* If in S4: CLOSE or REOPEN */}
                        {c.currentState === 'S4' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenTransition(c, 'CLOSE')}
                              className="btn btn-sm"
                              style={{ backgroundColor: '#059669', color: '#ffffff' }}
                              title="Close Ticket (S4 -> S5)"
                            >
                              <CheckCheck size={12} /> Close
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenTransition(c, 'REOPEN')}
                              className="btn btn-sm"
                              style={{ backgroundColor: '#d97706', color: '#ffffff' }}
                              title="Reopen (S4 -> S2)"
                            >
                              <RotateCcw size={12} />
                            </button>
                          </>
                        )}

                        <Link
                          to={`/track/${c.complaintId}`}
                          className="btn btn-secondary btn-sm"
                          title="Track Path"
                        >
                          <GitBranch size={12} />
                        </Link>

                        <Link
                          to={`/complaints/${c.complaintId}`}
                          className="btn btn-secondary btn-sm"
                          title="View Details"
                        >
                          <Eye size={12} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Technician Assignment Modal */}
      {assignModalOpen && selectedComplaint && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 13, 24, 0.7)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
              Assign Technician to Complaint
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Assigning a technician will execute DFA transition{' '}
              <strong style={{ color: '#0284c7' }}>&delta;(S1, ASSIGN) &rarr; S2</strong> for ticket{' '}
              <code style={{ fontWeight: 700 }}>{selectedComplaint.complaintId}</code>.
            </p>

            <form onSubmit={handleAssignSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <UserCheck size={14} color="#64748b" /> Select Campus Technician
                </label>
                <select
                  className="form-control"
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                >
                  {TECHNICIANS.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name} — {t.spec} ({t.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assignment Remarks</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g. Please inspect the AP controller logs for DHCP lease errors."
                  value={assignRemarks}
                  onChange={(e) => setAssignRemarks(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-cyan"
                >
                  {actionLoading ? 'Assigning...' : 'Assign & Transition to S2'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Transition Modal */}
      {transitionModalOpen && selectedComplaint && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 13, 24, 0.7)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
              Confirm Transition: {transitionSymbol}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Executing DFA state transition for ticket{' '}
              <code style={{ fontWeight: 700 }}>{selectedComplaint.complaintId}</code> via input symbol{' '}
              <strong style={{ color: '#0891b2' }}>{transitionSymbol}</strong>.
            </p>

            <form onSubmit={handleTransitionSubmit}>
              <div className="form-group">
                <label className="form-label">Administrative Remarks</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder={
                    transitionSymbol === 'RESOLVE'
                      ? 'Detailed notes on resolution (e.g. Firmware flashed, cable replaced, DHCP working).'
                      : transitionSymbol === 'REJECT'
                      ? 'Reason for rejection (e.g. Duplicate ticket or non-college device).'
                      : 'Enter administrative notes.'
                  }
                  value={transitionRemarks}
                  onChange={(e) => setTransitionRemarks(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setTransitionModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary"
                >
                  {actionLoading ? 'Executing...' : 'Confirm Transition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .filter-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .filter-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
