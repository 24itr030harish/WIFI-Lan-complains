import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/api';
import { StateBadge, PriorityBadge, NetworkTypeBadge } from '../components/common/Badge';
import { LoadingSpinner, EmptyState } from '../components/common/LoadingSpinner';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  CheckCheck,
  AlertCircle,
  Wifi,
  ChevronRight,
  TrendingUp,
  GitBranch,
  ArrowRight
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getMyComplaints();
      if (res.data && res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  // Metrics
  const total = complaints.length;
  const active = complaints.filter((c) => ['S0', 'S1', 'S2', 'S3'].includes(c.currentState)).length;
  const resolved = complaints.filter((c) => c.currentState === 'S4').length;
  const closed = complaints.filter((c) => c.currentState === 'S5').length;
  const rejected = complaints.filter((c) => c.currentState === 'S6').length;

  const recentComplaints = complaints.slice(0, 5);

  return (
    <div>
      {/* Welcome Banner */}
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            <Wifi size={13} /> CAMPUS NETWORK SUPPORT PORTAL
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
            Welcome, {user?.name || 'Student'}!
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '580px', lineHeight: 1.5 }}>
            Register Number: <strong style={{ color: '#f8fafc' }}>{user?.registerNumber}</strong> &bull; Department: <strong style={{ color: '#f8fafc' }}>{user?.department}</strong> ({user?.year})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/submit-complaint" className="btn btn-cyan">
            <PlusCircle size={17} /> Register New Complaint
          </Link>
          <Link to="/dfa-diagram" className="btn btn-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.15)' }}>
            <GitBranch size={17} /> View DFA Flow
          </Link>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        {/* Total Card */}
        <div className="netcare-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Total Complaints
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>{total}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            All-time tickets filed
          </div>
        </div>

        {/* In Progress Card */}
        <div className="netcare-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              In Progress / Review
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#b45309' }}>{active}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            States S0, S1, S2, S3
          </div>
        </div>

        {/* Resolved Card */}
        <div className="netcare-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Resolved (Awaiting Close)
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#047857' }}>{resolved}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            State S4 (Action needed)
          </div>
        </div>

        {/* Closed Card (Accepting State S5) */}
        <div className="netcare-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Closed (Accepting State)
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#15803d' }}>{closed}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            State S5 (Terminal Accepted)
          </div>
        </div>
      </div>

      {/* Main Content: Recent Complaints & Advisory Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }} className="dashboard-grid">
        {/* Recent Complaints Table Card */}
        <div className="netcare-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                Recent Complaints
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Your latest submitted Wi-Fi and network requests
              </p>
            </div>
            <Link to="/my-complaints" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0891b2', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View All ({total}) <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Fetching your complaints..." />
          ) : recentComplaints.length === 0 ? (
            <EmptyState
              title="No complaints registered yet"
              message="If you are experiencing Wi-Fi, LAN, or authentication issues, submit a ticket to get support."
              icon={Wifi}
              action={
                <Link to="/submit-complaint" className="btn btn-cyan">
                  <PlusCircle size={16} /> Submit Your First Complaint
                </Link>
              }
            />
          ) : (
            <div className="table-responsive">
              <table className="netcare-table">
                <thead>
                  <tr>
                    <th>Complaint ID</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>DFA State</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentComplaints.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
                          {c.complaintId}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{c.category}</div>
                        <div style={{ marginTop: '2px' }}>
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
                        <StateBadge state={c.currentState} label={c.status} />
                      </td>
                      <td>
                        <Link
                          to={`/track/${c.complaintId}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.65rem' }}
                        >
                          Track <ChevronRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Sidebar Advisory Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Action Needed Callout if any resolved complaints */}
          {resolved > 0 && (
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '12px',
                padding: '1.25rem',
                color: '#065f46'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                <CheckCircle2 size={18} color="#059669" /> Action Required ({resolved})
              </div>
              <p style={{ fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '0.875rem' }}>
                You have {resolved} resolved complaint(s) waiting for your confirmation. Please verify network restoration and close the ticket into state S5, or reopen if needed.
              </p>
              <Link to="/my-complaints?status=S4" className="btn btn-sm" style={{ backgroundColor: '#059669', color: '#ffffff' }}>
                Review Resolved Tickets
              </Link>
            </div>
          )}

          {/* Network Advisory Card */}
          <div className="netcare-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.75rem' }}>
              <TrendingUp size={16} color="#0891b2" /> Campus Wi-Fi Status
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Academic Blocks SSID:</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>Active (Campus-WiFi)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Hostels SSID:</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>Active (Hostel-Secure)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Library APs:</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>Optimal (5GHz)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Authentication Server:</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>Operational</span>
              </div>
            </div>
          </div>

          {/* Automata Explanation Snippet */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem'
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <GitBranch size={15} color="#8b5cf6" /> DFA Workflow Guarantee
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
              Your complaint lifecycle is strictly validated by Deterministic Finite Automaton:
              <br />
              <code style={{ fontSize: '0.75rem', color: '#0f172a' }}>
                S0 &rarr; S1 &rarr; S2 &rarr; S3 &rarr; S4 &rarr; S5
              </code>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
