import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, complaintService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { StateBadge, PriorityBadge, NetworkTypeBadge } from '../components/common/Badge';
import { LoadingSpinner, EmptyState } from '../components/common/LoadingSpinner';
import {
  ShieldCheck,
  FileText,
  Clock,
  UserCheck,
  Wrench,
  CheckCircle2,
  CheckCheck,
  XCircle,
  TrendingUp,
  BarChart3,
  Search,
  Filter,
  Eye,
  Play,
  RotateCcw,
  GitBranch,
  Building,
  User,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  // Assignment Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedTech, setSelectedTech] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Transition Modal
  const [transitionModalOpen, setTransitionModalOpen] = useState(false);
  const [transitionSymbol, setTransitionSymbol] = useState(null);
  const [transitionRemarks, setTransitionRemarks] = useState('');
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      if (res.data && res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Failed to fetch admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssign = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedTech(data?.technicians[0]?.name || 'R. Rajesh');
    setAssignRemarks('');
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !selectedTech) return;

    setAssigning(true);
    try {
      const techObj = data.technicians.find((t) => t.name === selectedTech) || {
        name: selectedTech,
        phone: '+91 98400 00000',
        email: 'tech@college.edu'
      };

      const res = await adminService.assignTechnician(selectedComplaint.complaintId, {
        technicianName: techObj.name,
        technicianPhone: techObj.phone,
        technicianEmail: techObj.email,
        remarks: assignRemarks || `Assigned to ${techObj.name} (${techObj.specialization || 'IT Support'})`
      });

      if (res.data && res.data.success) {
        success(res.data.message || `Technician ${techObj.name} assigned.`);
        setAssignModalOpen(false);
        fetchDashboardData();
      }
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Assignment failed.');
    } finally {
      setAssigning(false);
    }
  };

  const handleOpenTransition = (complaint, symbol) => {
    setSelectedComplaint(complaint);
    setTransitionSymbol(symbol);
    setTransitionRemarks('');
    setTransitionModalOpen(true);
  };

  const handleTransitionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !transitionSymbol) return;

    setTransitioning(true);
    try {
      const res = await complaintService.executeTransition(selectedComplaint.complaintId, {
        inputSymbol: transitionSymbol,
        remarks: transitionRemarks
      });

      if (res.data && res.data.success) {
        success(res.data.message || `DFA transition '${transitionSymbol}' executed.`);
        setTransitionModalOpen(false);
        fetchDashboardData();
      }
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Transition execution failed.');
    } finally {
      setTransitioning(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Compiling network administration analytics..." />;
  }

  const { stats, stateDistribution, priorityDistribution, departmentDistribution, recentComplaints, technicians } =
    data || {};

  return (
    <div>
      {/* Admin Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0b1528 0%, #1e3a68 100%)',
          borderRadius: '16px',
          padding: '2rem 2.25rem',
          color: '#ffffff',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(11, 21, 40, 0.25)'
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
              padding: '0.2rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: '0.75rem'
            }}
          >
            <ShieldCheck size={14} /> NETWORK OPERATIONS CENTER (NOC)
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
            Administrator Control Center
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '600px', lineHeight: 1.5 }}>
            Real-time monitoring of campus Wi-Fi, LAN, and authentication tickets governed by the complaint processing DFA.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/complaints" className="btn btn-cyan">
            <FileText size={16} /> Manage All Complaints ({stats?.total || 0})
          </Link>
          <Link
            to="/dfa-diagram"
            className="btn btn-secondary"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.15)' }}
          >
            <GitBranch size={16} /> DFA State Diagram
          </Link>
        </div>
      </div>

      {/* 8 Statistics Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        {/* Total */}
        <div className="netcare-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Total Tickets
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
            {stats?.total || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>All complaints filed</div>
        </div>

        {/* S0: New */}
        <div className="netcare-card" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
            S0: New / Registered
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1d4ed8', margin: '0.25rem 0' }}>
            {stats?.newComplaints || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Needs Admin Review</div>
        </div>

        {/* S1: Review */}
        <div className="netcare-card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase' }}>
            S1: Under Review
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed', margin: '0.25rem 0' }}>
            {stats?.underReview || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Awaiting Technician</div>
        </div>

        {/* S2: Assigned */}
        <div className="netcare-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
            S2: Assigned
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', margin: '0.25rem 0' }}>
            {stats?.assigned || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Technician Designated</div>
        </div>

        {/* S3: In Progress */}
        <div className="netcare-card" style={{ padding: '1.25rem', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0e7490', textTransform: 'uppercase' }}>
            S3: In Progress
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0891b2', margin: '0.25rem 0' }}>
            {stats?.inProgress || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Active Diagnostic Work</div>
        </div>

        {/* S4: Resolved */}
        <div className="netcare-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
            S4: Resolved
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', margin: '0.25rem 0' }}>
            {stats?.resolved || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Pending Close or Reopen</div>
        </div>

        {/* S5: Closed (Accepting) */}
        <div className="netcare-card" style={{ padding: '1.25rem', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
            S5: Closed (Accepting)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', margin: '0.25rem 0' }}>
            {stats?.closed || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Successfully Closed</div>
        </div>

        {/* S6: Rejected */}
        <div className="netcare-card" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>
            S6: Rejected (Sink)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626', margin: '0.25rem 0' }}>
            {stats?.rejected || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Terminated Dead State</div>
        </div>
      </div>

      {/* Visual Analytics Grid: Status Distribution & Priority Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem', marginBottom: '2rem' }} className="charts-grid">
        {/* DFA Status Distribution Chart */}
        <div className="netcare-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                DFA State Machine Distribution
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Volume breakdown across states $S_0$ through $S_6$
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#0891b2', fontWeight: 600 }}>
              <BarChart3 size={15} /> Live Automata Telemetry
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stateDistribution?.map((item) => {
              const totalVal = stats?.total || 1;
              const pct = Math.round((item.count / totalVal) * 100);

              return (
                <div key={item.state}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: item.color }}>
                        {item.state}
                      </span>
                      <span style={{ color: '#334155', fontWeight: 600 }}>{item.name}</span>
                    </div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {item.count}{' '}
                      <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.75rem' }}>
                        ({pct}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      height: '8px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: item.color,
                        borderRadius: '4px',
                        transition: 'width 0.4s ease-in-out'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority & Top Departments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Priority Distribution Card */}
          <div className="netcare-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
              Ticket Priority Breakdown
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Incidents classified by network severity
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {priorityDistribution?.map((p) => {
                const totalVal = stats?.total || 1;
                const pct = Math.round((p.count / totalVal) * 100);

                return (
                  <div key={p.priority}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{p.priority} Priority</span>
                      <span style={{ fontWeight: 700, color: p.color }}>
                        {p.count} tickets ({pct}%)
                      </span>
                    </div>
                    <div style={{ height: '7px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          backgroundColor: p.color,
                          borderRadius: '3px'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Breakdown Card */}
          <div className="netcare-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building size={16} color="#0891b2" /> Top Reporting Departments
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
              Academic sectors with highest complaint density
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {departmentDistribution?.slice(0, 4).map((d) => (
                <div
                  key={d.department}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0',
                    borderBottom: '1px solid #f8fafc',
                    fontSize: '0.825rem'
                  }}
                >
                  <span style={{ color: '#334155', fontWeight: 500 }}>{d.department}</span>
                  <span
                    style={{
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem'
                    }}
                  >
                    {d.count} tickets
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints Table with Direct Administrative Actions */}
      <div className="netcare-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Recent Network Complaints Requiring Action
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Review, assign technicians, or progress tickets through valid DFA transitions
            </p>
          </div>

          <Link to="/admin/complaints" className="btn btn-secondary btn-sm">
            View All ({stats?.total}) <ChevronRight size={14} />
          </Link>
        </div>

        {recentComplaints?.length === 0 ? (
          <EmptyState title="No complaints filed yet" message="Tickets will appear here as soon as students submit complaints." />
        ) : (
          <div className="table-responsive">
            <table className="netcare-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Student Info</th>
                  <th>Category & Network</th>
                  <th>Location</th>
                  <th>DFA State</th>
                  <th>Assigned Tech</th>
                  <th style={{ textAlign: 'right' }}>Administrative Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints?.map((c) => (
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
                      <div style={{ marginTop: '2px', display: 'flex', gap: '0.35rem' }}>
                        <NetworkTypeBadge type={c.networkType} />
                        <PriorityBadge priority={c.priority} />
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
                        {/* If in S0: Quick REVIEW button */}
                        {c.currentState === 'S0' && (
                          <button
                            type="button"
                            onClick={() => handleOpenTransition(c, 'REVIEW')}
                            className="btn btn-primary btn-sm"
                            title="Execute REVIEW transition (S0 -> S1)"
                          >
                            <Play size={12} /> Review
                          </button>
                        )}

                        {/* If in S1: Assign Technician button */}
                        {c.currentState === 'S1' && (
                          <button
                            type="button"
                            onClick={() => handleOpenAssign(c)}
                            className="btn btn-cyan btn-sm"
                            title="Assign technician (S1 -> S2)"
                          >
                            <UserCheck size={12} /> Assign Tech
                          </button>
                        )}

                        {/* If in S2: Start Work */}
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

                        {/* If in S3: Resolve */}
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

                        <Link
                          to={`/complaints/${c.complaintId}`}
                          className="btn btn-secondary btn-sm"
                          title="View Details"
                        >
                          <Eye size={12} /> View
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
              Designating a technician will execute DFA transition{' '}
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
                  {technicians?.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} — {t.specialization} ({t.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Assignment Instructions / Remarks
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g. Please inspect the access point on 2nd Floor reading hall. Verify RADIUS DHCP logs."
                  value={assignRemarks}
                  onChange={(e) => setAssignRemarks(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={assigning}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="btn btn-cyan"
                >
                  {assigning ? 'Assigning...' : 'Assign & Transition to S2'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generic Admin Transition Modal */}
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
              Execute DFA Transition: {transitionSymbol}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Transitioning complaint <strong>{selectedComplaint.complaintId}</strong> from state{' '}
              <strong>{selectedComplaint.currentState}</strong> via input symbol{' '}
              <strong style={{ color: '#0891b2' }}>{transitionSymbol}</strong>.
            </p>

            <form onSubmit={handleTransitionSubmit}>
              <div className="form-group">
                <label className="form-label">
                  Administrative Remarks
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder={
                    transitionSymbol === 'RESOLVE'
                      ? 'Detailed notes on resolution (e.g. Rebooted switch, replaced RJ45 connector, verified connectivity).'
                      : 'Enter administrative remarks for this state transition.'
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
                  disabled={transitioning}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transitioning}
                  className="btn btn-primary"
                >
                  {transitioning ? 'Executing...' : 'Confirm Transition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .charts-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
