import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dfaService } from '../services/api';
import { StateBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  TableProperties,
  GitBranch,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  Info
} from 'lucide-react';

const FORMAL_TRANSITIONS = [
  { currentState: 'S0', stateName: 'Complaint Registered', inputSymbol: 'REVIEW', nextState: 'S1', nextName: 'Under Review', allowedRoles: 'admin', description: 'Admin evaluates and acknowledges newly filed complaint' },
  { currentState: 'S0', stateName: 'Complaint Registered', inputSymbol: 'REJECT', nextState: 'S6', nextName: 'Rejected', allowedRoles: 'admin / student', description: 'Immediate cancellation or rejection of invalid initial complaint' },
  { currentState: 'S1', stateName: 'Under Review', inputSymbol: 'ASSIGN', nextState: 'S2', nextName: 'Assigned to Technician', allowedRoles: 'admin', description: 'Admin delegates ticket to designated network technician' },
  { currentState: 'S1', stateName: 'Under Review', inputSymbol: 'REJECT', nextState: 'S6', nextName: 'Rejected', allowedRoles: 'admin', description: 'Ticket determined to be non-issue or out-of-scope during review' },
  { currentState: 'S2', stateName: 'Assigned to Technician', inputSymbol: 'START_WORK', nextState: 'S3', nextName: 'Work In Progress', allowedRoles: 'admin / tech', description: 'Technician initiates physical or remote diagnostic repair' },
  { currentState: 'S3', stateName: 'Work In Progress', inputSymbol: 'RESOLVE', nextState: 'S4', nextName: 'Resolved', allowedRoles: 'admin / tech', description: 'Hardware fixed / AP restarted / connectivity verified' },
  { currentState: 'S4', stateName: 'Resolved', inputSymbol: 'CLOSE', nextState: 'S5', nextName: 'Closed', allowedRoles: 'student / admin', description: 'Student or Admin confirms resolution into accepting state' },
  { currentState: 'S4', stateName: 'Resolved', inputSymbol: 'REOPEN', nextState: 'S2', nextName: 'Assigned to Technician', allowedRoles: 'student / admin', description: 'Issue persists; ticket recycled back to technician handling' }
];

const STATES_INFO = [
  { id: 'S0', name: 'Complaint Registered', type: 'Initial State (q0)', color: '#3b82f6', desc: 'Starting point of automaton. Initial state entered immediately upon student ticket submission.' },
  { id: 'S1', name: 'Under Review', type: 'Intermediate State', color: '#8b5cf6', desc: 'Complaint is being triaged by the Network Administrator.' },
  { id: 'S2', name: 'Assigned to Technician', type: 'Intermediate State', color: '#f59e0b', desc: 'Campus IT technician designated with contact and responsibility.' },
  { id: 'S3', name: 'Work In Progress', type: 'Intermediate State', color: '#06b6d4', desc: 'Hardware, wiring, AP, or RADIUS configuration work in active progress.' },
  { id: 'S4', name: 'Resolved', type: 'Intermediate State', color: '#10b981', desc: 'Fix applied; awaiting student verification for closure or reopening.' },
  { id: 'S5', name: 'Closed', type: 'Final Accepting State (F)', color: '#059669', desc: 'Accepting final state. Double circle in diagrams. Ticket successfully completed.' },
  { id: 'S6', name: 'Rejected', type: 'Dead / Sink State', color: '#ef4444', desc: 'Terminal non-accepting sink state. No outbound transitions defined.' }
];

export default function DFATable() {
  const [filterState, setFilterState] = useState('ALL');

  const filteredRules = FORMAL_TRANSITIONS.filter((t) => {
    if (filterState !== 'ALL' && t.currentState !== filterState) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(8, 145, 178, 0.1)', color: '#0891b2', padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <TableProperties size={13} /> FORMAL AUTOMATA DEFINITIONS
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
            DFA State Transition Table (&delta;)
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Mathematical transition matrix governing the NetCare ticket resolution lifecycle.
          </p>
        </div>

        <Link to="/dfa-diagram" className="btn btn-cyan">
          <GitBranch size={16} /> View Visual State Diagram
        </Link>
      </div>

      {/* 5-Tuple Mathematical Formal Definition Banner */}
      <div
        className="netcare-card"
        style={{
          background: 'linear-gradient(135deg, #0b1528 0%, #1e3a68 100%)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: '#22d3ee', marginBottom: '0.5rem' }}>
          <BookOpen size={16} /> FORMAL 5-TUPLE NOTATION: M = (Q, &Sigma;, &delta;, q0, F)
        </div>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '850px' }}>
          The complaint management lifecycle is modeled as a <strong>Deterministic Finite Automaton (DFA)</strong>, ensuring that for any state $q \in Q$ and symbol $\sigma \in \Sigma$, there is at most one deterministically determined next state $\delta(q, \sigma)$. Undefined pairs are strictly rejected.
        </p>
      </div>

      {/* Transition Table Card */}
      <div className="netcare-card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              DFA Transition Table Matrix (&delta;)
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Exactly 8 valid transition rules defined over Q &times; &Sigma;
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Filter by State:</span>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '0.35rem 0.75rem' }}
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
            >
              <option value="ALL">All States (S0 - S4)</option>
              <option value="S0">S0 (Complaint Registered)</option>
              <option value="S1">S1 (Under Review)</option>
              <option value="S2">S2 (Assigned)</option>
              <option value="S3">S3 (Work In Progress)</option>
              <option value="S4">S4 (Resolved)</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="netcare-table">
            <thead>
              <tr>
                <th style={{ width: '180px' }}>Current State (q)</th>
                <th style={{ width: '160px' }}>Input Symbol (&sigma;)</th>
                <th style={{ width: '220px' }}>Next State &delta;(q, &sigma;)</th>
                <th style={{ width: '160px' }}>Authorized Role</th>
                <th>Transition Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((r, index) => (
                <tr key={`${r.currentState}-${r.inputSymbol}-${index}`}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0284c7', fontSize: '0.95rem' }}>
                        {r.currentState}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                        ({r.stateName})
                      </span>
                    </div>
                  </td>

                  <td>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.825rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        backgroundColor: r.inputSymbol === 'REJECT' ? '#fef2f2' : r.inputSymbol === 'CLOSE' ? '#ecfdf5' : '#eff6ff',
                        color: r.inputSymbol === 'REJECT' ? '#dc2626' : r.inputSymbol === 'CLOSE' ? '#059669' : '#0369a1',
                        border: '1px solid rgba(0,0,0,0.06)'
                      }}
                    >
                      {r.inputSymbol}
                    </span>
                  </td>

                  <td>
                    <StateBadge state={r.nextState} label={r.nextName} />
                  </td>

                  <td>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', textTransform: 'capitalize' }}>
                      {r.allowedRoles}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontSize: '0.825rem', color: '#64748b' }}>
                      {r.description}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Automata Theory Educational Component Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Set of States Q */}
        <div className="netcare-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: '#0891b2', fontWeight: 800 }}>Q</span>: Set of States (7 States)
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
            Q = &#123;S0, S1, S2, S3, S4, S5, S6&#125;
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
            {STATES_INFO.map((s) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: s.color, minWidth: '24px' }}>
                  {s.id}:
                </span>
                <div>
                  <strong style={{ color: '#1e293b' }}>{s.name}</strong> &mdash;{' '}
                  <span style={{ color: '#64748b' }}>{s.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Alphabet Sigma */}
        <div className="netcare-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: '#0891b2', fontWeight: 800 }}>&Sigma;</span>: Input Alphabet (8 Symbols)
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
            &Sigma; = &#123;SUBMIT, REVIEW, ASSIGN, START_WORK, RESOLVE, CLOSE, REJECT, REOPEN&#125;
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
            <div><strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>SUBMIT:</strong> Initial student action moving into S0.</div>
            <div><strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>REVIEW:</strong> Administrator verifies complaint veracity.</div>
            <div><strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>ASSIGN:</strong> Delegating a specialist technician.</div>
            <div><strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>START_WORK:</strong> Technician begins active physical/remote troubleshooting.</div>
            <div><strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>RESOLVE:</strong> Issue repaired, network restored, remarks logged.</div>
            <div><strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>CLOSE:</strong> Verification by user, moving into accepting state S5.</div>
            <div><strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>REJECT:</strong> Deemed invalid or out-of-scope; moves into S6.</div>
            <div><strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>REOPEN:</strong> Issue recurred; recycled from S4 back to S2.</div>
          </div>
        </div>

        {/* Initial, Accepting & Undefined Rules */}
        <div className="netcare-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={18} color="#059669" /> Initial, Accepting & Undefined Transitions
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
            Mathematical boundaries preventing tampering
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.8rem', lineHeight: 1.5 }}>
            <div style={{ backgroundColor: '#eff6ff', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #2563eb' }}>
              <strong style={{ color: '#1e40af' }}>Initial State (q0 = S0):</strong> Every newly registered complaint deterministically enters at state S0. No complaints can skip initial registration.
            </div>

            <div style={{ backgroundColor: '#ecfdf5', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #059669' }}>
              <strong style={{ color: '#047857' }}>Accepting State (F = &#123;S5&#125;):</strong> Represented as a double circle. Represents confirmed ticket resolution. A string of transitions is accepted if and only if it halts in S5.
            </div>

            <div style={{ backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
              <strong style={{ color: '#b91c1c' }}>Undefined Transitions:</strong> Any pair (q, &sigma;) not explicitly listed in the table is undefined. Attempting an undefined transition (e.g. &delta;(S0, CLOSE)) is strictly rejected by the backend with HTTP status 400 Bad Request.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
