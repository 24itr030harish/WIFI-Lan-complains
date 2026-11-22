import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { complaintService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { StateBadge, PriorityBadge, NetworkTypeBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  GitBranch,
  ArrowLeft,
  Clock,
  CheckCircle2,
  CheckCheck,
  XCircle,
  User,
  Shield,
  MessageSquare,
  ChevronRight,
  Sparkles,
  RotateCcw
} from 'lucide-react';

const STANDARD_STEPS = [
  { state: 'S0', name: 'Complaint Registered', icon: Clock },
  { state: 'S1', name: 'Under Review', icon: Clock },
  { state: 'S2', name: 'Assigned to Tech', icon: Clock },
  { state: 'S3', name: 'Work In Progress', icon: Clock },
  { state: 'S4', name: 'Resolved', icon: CheckCircle2 },
  { state: 'S5', name: 'Closed', icon: CheckCheck }
];

export default function ComplaintTracking() {
  const { id } = useParams();
  const { error } = useToast();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrackingData();
  }, [id]);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getById(id);
      if (res.data && res.data.success) {
        setComplaint(res.data.complaint);
        setHistory(res.data.complaint.transitionHistory || []);
      }
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Failed to load tracking data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Tracing complaint DFA path..." />;
  }

  if (!complaint) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h2>Complaint Not Found</h2>
        <Link to="/my-complaints" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Return to Complaints
        </Link>
      </div>
    );
  }

  // Determine which step index the complaint is on
  const currentState = complaint.currentState;
  const isRejected = currentState === 'S6';
  const isClosed = currentState === 'S5';

  const stateOrder = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5'];
  const currentStepIdx = stateOrder.indexOf(currentState);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.6rem' }}>
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
              {complaint.category} &bull; {complaint.location} &bull; Priority: {complaint.priority}
            </div>
          </div>
        </div>

        <Link to={`/complaints/${complaint.complaintId}`} className="btn btn-secondary">
          View Full Ticket
        </Link>
      </div>

      {/* Stepped DFA Progress Tracker Card */}
      <div className="netcare-card" style={{ padding: '2rem 1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              DFA Automata Progress Pathway
            </h2>
            <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Live formal state machine progression: q0 = S0 &rarr; ... &rarr; F = S5 (Closed)
            </p>
          </div>

          {isClosed && (
            <span
              style={{
                backgroundColor: '#ecfdf5',
                color: '#059669',
                border: '1px solid #a7f3d0',
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <CheckCheck size={14} /> Accepting State Reached (Final)
            </span>
          )}

          {isRejected && (
            <span
              style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <XCircle size={14} /> Terminated into Sink State (S6)
            </span>
          )}
        </div>

        {/* Normal Steps Linear Progression Bar */}
        {!isRejected ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflowX: 'auto',
              padding: '0.5rem 0'
            }}
          >
            {STANDARD_STEPS.map((step, idx) => {
              const isPassed = currentStepIdx > idx;
              const isCurrent = currentStepIdx === idx;
              const isAccepting = step.state === 'S5';

              let circleBg = '#f1f5f9';
              let circleColor = '#94a3b8';
              let circleBorder = '2px solid #cbd5e1';

              if (isPassed) {
                circleBg = '#0891b2';
                circleColor = '#ffffff';
                circleBorder = '2px solid #0891b2';
              } else if (isCurrent) {
                circleBg = isAccepting ? '#059669' : '#0284c7';
                circleColor = '#ffffff';
                circleBorder = isAccepting ? '4px double #10b981' : '3px solid #38bdf8';
              }

              return (
                <div
                  key={step.state}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '120px',
                    position: 'relative',
                    zIndex: 2,
                    textAlign: 'center'
                  }}
                >
                  <div
                    style={{
                      width: isAccepting ? '46px' : '40px',
                      height: isAccepting ? '46px' : '40px',
                      borderRadius: '50%',
                      backgroundColor: circleBg,
                      color: circleColor,
                      border: circleBorder,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      fontFamily: 'monospace',
                      boxShadow: isCurrent ? '0 0 0 4px rgba(6, 182, 212, 0.25)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                    title={isAccepting ? 'Accepting Final State F' : `State ${step.state}`}
                  >
                    {isPassed ? <CheckCircle2 size={18} /> : step.state}
                  </div>

                  <div style={{ marginTop: '0.6rem' }}>
                    <div style={{ fontWeight: isCurrent ? 700 : 600, fontSize: '0.8rem', color: isCurrent ? '#0f172a' : '#64748b' }}>
                      {step.name}
                    </div>
                    {isAccepting && (
                      <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                        (Accepting State F)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Rejected State Callout */
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: '#991b1b'
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <XCircle size={26} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                Complaint Rejected (State S6)
              </div>
              <div style={{ fontSize: '0.85rem', color: '#b91c1c', marginTop: '2px' }}>
                This complaint was transitioned to the terminal dead state (S6) and is no longer being processed.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chronological Transition History Audit Timeline */}
      <div className="netcare-card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} color="#0891b2" /> Chronological DFA Transition History ({history.length} records)
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.75rem' }}>
          Every state change is cryptographically authenticated and logged with actor identity and timestamps.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
          {history.map((record, index) => {
            const isReopen = record.inputSymbol === 'REOPEN';
            const isClose = record.inputSymbol === 'CLOSE';
            const isReject = record.inputSymbol === 'REJECT';

            let accentColor = '#0891b2';
            if (isClose) accentColor = '#059669';
            if (isReject) accentColor = '#ef4444';
            if (isReopen) accentColor = '#d97706';

            return (
              <div
                key={record._id || index}
                style={{
                  border: '1px solid #e2e8f0',
                  borderLeft: `4px solid ${accentColor}`,
                  borderRadius: '10px',
                  padding: '1.1rem 1.25rem',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                {/* Header: Step number, Transition formula, and Timestamp */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px'
                      }}
                    >
                      Step #{index + 1}
                    </span>

                    <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                      &delta;({record.fromState}, <span style={{ color: accentColor }}>{record.inputSymbol}</span>) &rarr; {record.toState}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(record.timestamp).toLocaleString()}
                  </span>
                </div>

                {/* Performed by & Remarks */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <User size={13} />
                    <span>
                      Performed by:{' '}
                      <strong style={{ color: '#0f172a' }}>{record.performedByName}</strong> (
                      <span style={{ textTransform: 'capitalize' }}>{record.performedByRole}</span>)
                    </span>
                  </div>
                </div>

                {record.remarks && (
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '6px',
                      padding: '0.6rem 0.85rem',
                      fontSize: '0.85rem',
                      color: '#334155',
                      lineHeight: 1.4,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.4rem'
                    }}
                  >
                    <MessageSquare size={14} color="#94a3b8" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{record.remarks}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
