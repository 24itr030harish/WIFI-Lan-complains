import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { complaintService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StateBadge, PriorityBadge, NetworkTypeBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  FileText,
  MapPin,
  Clock,
  User,
  Wrench,
  CheckCircle2,
  CheckCheck,
  RotateCcw,
  XCircle,
  GitBranch,
  ArrowLeft,
  MessageSquare,
  Shield,
  AlertTriangle,
  Play
} from 'lucide-react';

export default function ComplaintDetails() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getById(id);
      if (res.data && res.data.success) {
        setComplaint(res.data.complaint);
      }
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  const openTransitionModal = (symbol) => {
    setSelectedSymbol(symbol);
    setRemarks('');
    setShowActionModal(true);
  };

  const handleExecuteTransition = async (e) => {
    e.preventDefault();
    if (!selectedSymbol) return;

    setActionLoading(true);
    try {
      const res = await complaintService.executeTransition(complaint.complaintId, {
        inputSymbol: selectedSymbol,
        remarks: remarks.trim()
      });

      if (res.data && res.data.success) {
        success(res.data.message || `Successfully executed DFA transition via '${selectedSymbol}'.`);
        setShowActionModal(false);
        fetchComplaint();
      }
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Transition execution failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving complaint information..." />;
  }

  if (!complaint) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h2>Complaint Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          No complaint matching ID '{id}' was located.
        </p>
        <Link to="/my-complaints" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to My Complaints
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Navigation & Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem 0.6rem' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>
                {complaint.complaintId}
              </span>
              <StateBadge state={complaint.currentState} label={complaint.status} />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              Submitted on {new Date(complaint.createdAt).toLocaleString()} &bull; Last updated {new Date(complaint.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>

        <Link to={`/track/${complaint.complaintId}`} className="btn btn-cyan">
          <GitBranch size={16} /> Visual DFA Tracker
        </Link>
      </div>

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem', marginBottom: '1.5rem' }} className="details-grid">
        {/* Left Column: Complaint & Location Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Problem Card */}
          <div className="netcare-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="#0891b2" /> Issue Particulars
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Category
                </span>
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem', marginTop: '2px' }}>
                  {complaint.category}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Network Type & Priority
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '4px' }}>
                  <NetworkTypeBadge type={complaint.networkType} />
                  <PriorityBadge priority={complaint.priority} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                Campus Location
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a', fontWeight: 600, marginTop: '2px' }}>
                <MapPin size={16} color="#0891b2" />
                {complaint.location} {complaint.locationDetails && `— ${complaint.locationDetails}`}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                Problem Description
              </span>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontSize: '0.9rem',
                  color: '#1e293b',
                  lineHeight: 1.6,
                  marginTop: '0.4rem',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {complaint.description}
              </div>
            </div>
          </div>

          {/* Resolution Remarks Card (if present) */}
          {complaint.resolutionRemarks && (
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '12px',
                padding: '1.5rem',
                color: '#065f46'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={20} color="#059669" /> Technician Resolution Remarks
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: '#047857' }}>
                {complaint.resolutionRemarks}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Student, Technician & DFA Control */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Student Snapshot Card */}
          <div className="netcare-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={16} color="#0891b2" /> Student Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Name:</span>{' '}
                <strong style={{ color: '#0f172a' }}>{complaint.studentSnapshot?.name}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Register Number:</span>{' '}
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0284c7' }}>
                  {complaint.studentSnapshot?.registerNumber}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Department:</span>{' '}
                <span style={{ color: '#334155' }}>{complaint.studentSnapshot?.department}</span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Year:</span>{' '}
                <span style={{ color: '#334155' }}>{complaint.studentSnapshot?.year}</span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Email:</span>{' '}
                <span style={{ color: '#0891b2' }}>{complaint.studentSnapshot?.email}</span>
              </div>
            </div>
          </div>

          {/* Assigned Technician Card */}
          <div className="netcare-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Wrench size={16} color="#f59e0b" /> Assigned Technician
            </h3>
            {complaint.assignedTechnician?.name && complaint.assignedTechnician.name !== 'Unassigned' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                  {complaint.assignedTechnician.name}
                </div>
                {complaint.assignedTechnician.phone && (
                  <div style={{ color: '#64748b' }}>
                    Phone: <strong style={{ color: '#334155' }}>{complaint.assignedTechnician.phone}</strong>
                  </div>
                )}
                {complaint.assignedTechnician.email && (
                  <div style={{ color: '#64748b' }}>
                    Email: <span style={{ color: '#0891b2' }}>{complaint.assignedTechnician.email}</span>
                  </div>
                )}
                {complaint.assignedTechnician.assignedAt && (
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    Assigned on {new Date(complaint.assignedTechnician.assignedAt).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>
                No technician assigned yet. Awaiting administrator review.
              </div>
            )}
          </div>

          {/* DFA State Transition Action Panel */}
          <div
            style={{
              backgroundColor: '#0b1528',
              borderRadius: '14px',
              padding: '1.25rem',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(11, 21, 40, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#22d3ee', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <GitBranch size={16} /> DFA Transition Controls
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#94a3b8' }}>
                Current: {complaint.currentState}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.4 }}>
              Transitions are mathematically enforced by automaton transition function &delta;({complaint.currentState}, &sigma;).
            </p>

            {/* Student Actions for S4: Confirm & Close or Reopen */}
            {!isAdmin && complaint.currentState === 'S4' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => openTransitionModal('CLOSE')}
                  className="btn"
                  style={{ backgroundColor: '#059669', color: '#ffffff', width: '100%' }}
                >
                  <CheckCheck size={16} /> Confirm & Close Ticket (S4 &rarr; S5)
                </button>

                <button
                  type="button"
                  onClick={() => openTransitionModal('REOPEN')}
                  className="btn"
                  style={{ backgroundColor: '#d97706', color: '#ffffff', width: '100%' }}
                >
                  <RotateCcw size={16} /> Issue Persists: Reopen (S4 &rarr; S2)
                </button>
              </div>
            )}

            {/* Student Action for S0: Cancel */}
            {!isAdmin && complaint.currentState === 'S0' && (
              <button
                type="button"
                onClick={() => openTransitionModal('REJECT')}
                className="btn btn-danger"
                style={{ width: '100%' }}
              >
                <XCircle size={16} /> Cancel My Complaint (S0 &rarr; S6)
              </button>
            )}

            {/* Admin Actions: All valid transitions from current state */}
            {isAdmin && (
              <div>
                {complaint.allowedTransitions && complaint.allowedTransitions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {complaint.allowedTransitions.map((t) => (
                      <button
                        key={t.inputSymbol}
                        type="button"
                        onClick={() => openTransitionModal(t.inputSymbol)}
                        className="btn"
                        style={{
                          backgroundColor:
                            t.inputSymbol === 'REJECT'
                              ? '#ef4444'
                              : t.inputSymbol === 'CLOSE'
                              ? '#059669'
                              : '#0284c7',
                          color: '#ffffff',
                          width: '100%',
                          fontSize: '0.85rem'
                        }}
                      >
                        <Play size={14} />
                        Execute &delta;({complaint.currentState}, {t.inputSymbol}) &rarr; {t.nextState}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>
                    {complaint.currentState === 'S5'
                      ? '✓ Terminal Accepting State (S5 Closed). No further transitions permitted.'
                      : complaint.currentState === 'S6'
                      ? '✕ Terminal Sink State (S6 Rejected). Ticket is terminated.'
                      : 'No further transitions available.'}
                  </div>
                )}
              </div>
            )}

            {/* Student Terminal State Notice */}
            {!isAdmin && ['S1', 'S2', 'S3'].includes(complaint.currentState) && (
              <div style={{ fontSize: '0.8rem', color: '#38bdf8', backgroundColor: 'rgba(6, 182, 212, 0.1)', padding: '0.75rem', borderRadius: '8px', lineHeight: 1.4 }}>
                This ticket is currently undergoing active technician handling. You will be notified when it reaches <strong>S4 (Resolved)</strong> to verify and close.
              </div>
            )}

            {!isAdmin && ['S5', 'S6'].includes(complaint.currentState) && (
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                Ticket reached terminal state <strong>{complaint.currentState} ({complaint.status})</strong>.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transition Execution Modal */}
      {showActionModal && (
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Confirm DFA State Transition
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Transitioning complaint from <strong>{complaint.currentState}</strong> using input symbol{' '}
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                {selectedSymbol}
              </span>
              .
            </p>

            <form onSubmit={handleExecuteTransition}>
              <div className="form-group">
                <label className="form-label">
                  <MessageSquare size={14} color="#64748b" /> Transition Remarks / Notes
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder={
                    selectedSymbol === 'CLOSE'
                      ? 'e.g. Verified Wi-Fi connectivity in CS Lab 2. Speeds are back to normal.'
                      : selectedSymbol === 'REOPEN'
                      ? 'e.g. Issue persists when moving near the corridor.'
                      : 'Enter administrative remarks for this state change.'
                  }
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
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
        @media (max-width: 800px) {
          .details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
