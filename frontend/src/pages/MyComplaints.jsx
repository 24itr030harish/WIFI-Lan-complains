import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { complaintService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { StateBadge, PriorityBadge, NetworkTypeBadge } from '../components/common/Badge';
import { LoadingSpinner, EmptyState } from '../components/common/LoadingSpinner';
import {
  FileText,
  Search,
  Filter,
  PlusCircle,
  Eye,
  GitBranch,
  XCircle,
  Clock,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error } = useToast();

  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [networkFilter, setNetworkFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, priorityFilter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;

      const res = await complaintService.getMyComplaints(params);
      if (res.data && res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  // Student cancel complaint (only valid when in S0)
  const handleCancelComplaint = async (complaintId) => {
    if (!window.confirm(`Are you sure you want to cancel complaint ${complaintId}? It will be transitioned to Rejected (S6).`)) {
      return;
    }

    setCancellingId(complaintId);
    try {
      const res = await complaintService.cancel(complaintId);
      if (res.data && res.data.success) {
        success(`Complaint ${complaintId} has been cancelled.`);
        fetchComplaints();
      }
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Failed to cancel complaint.');
    } finally {
      setCancellingId(null);
    }
  };

  // Filter complaints locally for search and network type
  const filteredComplaints = complaints.filter((c) => {
    if (networkFilter !== 'ALL' && c.networkType !== networkFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchId = c.complaintId.toLowerCase().includes(term);
      const matchCat = c.category.toLowerCase().includes(term);
      const matchDesc = c.description.toLowerCase().includes(term);
      const matchLoc = c.location.toLowerCase().includes(term);
      return matchId || matchCat || matchDesc || matchLoc;
    }
    return true;
  });

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
            My Complaints
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Track the status, DFA state transitions, and technician remarks for your tickets.
          </p>
        </div>

        <Link to="/submit-complaint" className="btn btn-cyan">
          <PlusCircle size={16} /> Submit New Complaint
        </Link>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="netcare-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'center' }} className="filter-grid">
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
              placeholder="Search by ID, category, keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>

          {/* Status / State Filter */}
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

          {/* Network Filter */}
          <div>
            <select
              className="form-control"
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
            >
              <option value="ALL">All Networks</option>
              <option value="Wi-Fi">Wi-Fi Only</option>
              <option value="LAN">Ethernet / LAN Only</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={() => {
              setStatusFilter('ALL');
              setPriorityFilter('ALL');
              setNetworkFilter('ALL');
              setSearchTerm('');
              setSearchParams({});
            }}
            className="btn btn-secondary"
            title="Reset Filters"
          >
            <RotateCcw size={15} /> Reset
          </button>
        </div>
      </div>

      {/* Complaints List Table Card */}
      <div className="netcare-card" style={{ padding: '1.25rem' }}>
        {loading ? (
          <LoadingSpinner text="Loading complaints..." />
        ) : filteredComplaints.length === 0 ? (
          <EmptyState
            title="No matching complaints found"
            message={
              complaints.length === 0
                ? "You haven't submitted any network connectivity complaints yet."
                : 'No complaints match the selected filter criteria. Try adjusting your filters.'
            }
            icon={FileText}
            action={
              complaints.length === 0 ? (
                <Link to="/submit-complaint" className="btn btn-cyan">
                  <PlusCircle size={16} /> File a Complaint Now
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setStatusFilter('ALL');
                    setPriorityFilter('ALL');
                    setNetworkFilter('ALL');
                    setSearchTerm('');
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Clear Filters
                </button>
              )
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="netcare-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Category & Network</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Current DFA State</th>
                  <th>Assigned Tech</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <Link
                        to={`/complaints/${c.complaintId}`}
                        style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}
                      >
                        {c.complaintId}
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.category}</div>
                      <div style={{ marginTop: '3px' }}>
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
                      <span style={{ fontSize: '0.8rem', color: c.assignedTechnician?.name !== 'Unassigned' ? '#0f172a' : '#94a3b8', fontWeight: 500 }}>
                        {c.assignedTechnician?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <Link
                          to={`/track/${c.complaintId}`}
                          className="btn btn-secondary btn-sm"
                          title="Visual DFA Tracking"
                        >
                          <GitBranch size={13} /> Track
                        </Link>

                        <Link
                          to={`/complaints/${c.complaintId}`}
                          className="btn btn-primary btn-sm"
                          title="View Details"
                        >
                          <Eye size={13} /> View
                        </Link>

                        {/* Student can cancel only if complaint is in S0 */}
                        {c.currentState === 'S0' && (
                          <button
                            type="button"
                            onClick={() => handleCancelComplaint(c.complaintId)}
                            disabled={cancellingId === c.complaintId}
                            className="btn btn-danger btn-sm"
                            title="Cancel Complaint (Move to Rejected S6)"
                          >
                            <XCircle size={13} /> Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
