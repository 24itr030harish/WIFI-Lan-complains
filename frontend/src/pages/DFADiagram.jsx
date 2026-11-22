import React, { useState, useEffect, useRef } from 'react';
import { dfaService, complaintService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { StateBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  GitBranch,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import mermaid from 'mermaid';

// Initialize Mermaid.js
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#0891b2',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#0e7490',
    lineColor: '#0284c7',
    secondaryColor: '#f1f5f9',
    tertiaryColor: '#ffffff'
  },
  securityLevel: 'loose'
});

// Formal DFA Definition Coordinates for Interactive SVG Graph
const NODE_COORDINATES = {
  S0: { x: 100, y: 150, label: 'S0: Registered', isInitial: true, color: '#3b82f6' },
  S1: { x: 280, y: 150, label: 'S1: Under Review', color: '#8b5cf6' },
  S2: { x: 460, y: 150, label: 'S2: Assigned', color: '#f59e0b' },
  S3: { x: 640, y: 150, label: 'S3: In Progress', color: '#06b6d4' },
  S4: { x: 820, y: 150, label: 'S4: Resolved', color: '#10b981' },
  S5: { x: 1000, y: 150, label: 'S5: Closed', isAccepting: true, color: '#059669' },
  S6: { x: 280, y: 320, label: 'S6: Rejected', isRejected: true, color: '#ef4444' }
};

// All 8 Valid Transitions in δ
const TRANSITIONS = [
  { from: 'S0', to: 'S1', symbol: 'REVIEW', path: 'M 140 150 L 240 150', textX: 190, textY: 135 },
  { from: 'S0', to: 'S6', symbol: 'REJECT', path: 'M 120 185 Q 160 300 240 320', textX: 165, textY: 265 },
  { from: 'S1', to: 'S2', symbol: 'ASSIGN', path: 'M 320 150 L 420 150', textX: 370, textY: 135 },
  { from: 'S1', to: 'S6', symbol: 'REJECT', path: 'M 280 190 L 280 280', textX: 295, textY: 240 },
  { from: 'S2', to: 'S3', symbol: 'START_WORK', path: 'M 500 150 L 600 150', textX: 550, textY: 135 },
  { from: 'S3', to: 'S4', symbol: 'RESOLVE', path: 'M 680 150 L 780 150', textX: 730, textY: 135 },
  { from: 'S4', to: 'S5', symbol: 'CLOSE', path: 'M 860 150 L 960 150', textX: 910, textY: 135 },
  { from: 'S4', to: 'S2', symbol: 'REOPEN', path: 'M 820 120 Q 640 40 460 120', textX: 640, textY: 65, isCurved: true }
];

export default function DFADiagram() {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const [activePath, setActivePath] = useState([]);
  const [highlightedState, setHighlightedState] = useState(null);
  const [diagramMode, setDiagramMode] = useState('svg'); // 'svg' | 'mermaid'
  const [loading, setLoading] = useState(true);

  // Step-by-step Interactive Simulator state
  const [simState, setSimState] = useState('S0');
  const [simHistory, setSimHistory] = useState(['S0']);
  const [simMessage, setSimMessage] = useState('Initial state S0 entered.');

  const mermaidRef = useRef(null);
  const { error } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getAllComplaints();
      if (res.data && res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.warn('Could not load complaint list for selector');
    } finally {
      setLoading(false);
    }
  };

  // Render Mermaid diagram when mode switches
  useEffect(() => {
    if (diagramMode === 'mermaid' && mermaidRef.current) {
      const mermaidDefinition = `
stateDiagram-v2
    direction LR
    [*] --> S0: SUBMIT
    
    S0 --> S1: REVIEW
    S0 --> S6: REJECT
    
    S1 --> S2: ASSIGN
    S1 --> S6: REJECT
    
    S2 --> S3: START_WORK
    S3 --> S4: RESOLVE
    
    S4 --> S5: CLOSE
    S4 --> S2: REOPEN
    
    S5 --> [*]: ACCEPTING_STATE
    
    note right of S0: Initial State (q0)
    note right of S5: Final State (F) Double Circle
    note right of S6: Dead / Sink State
      `;

      mermaid
        .render('mermaid-dfa-svg', mermaidDefinition)
        .then(({ svg }) => {
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
        })
        .catch((err) => console.error('Mermaid render error:', err));
    }
  }, [diagramMode]);

  // Handle complaint selection to trace its path
  const handleSelectComplaint = (e) => {
    const id = e.target.value;
    setSelectedComplaintId(id);

    if (!id) {
      handleResetView();
      return;
    }

    const found = complaints.find((c) => c.complaintId === id);
    if (found) {
      setHighlightedState(found.currentState);
      // Extract edges followed
      const pathEdges = [];
      const history = found.transitionHistory || [];
      for (const rec of history) {
        if (rec.fromState !== 'START') {
          pathEdges.push(`${rec.fromState}_${rec.inputSymbol}_${rec.toState}`);
        }
      }
      setActivePath(pathEdges);
    }
  };

  const handleResetView = () => {
    setSelectedComplaintId('');
    setActivePath([]);
    setHighlightedState(null);
    setSimState('S0');
    setSimHistory(['S0']);
    setSimMessage('Automaton reset to initial state S0.');
  };

  // Simulator step action
  const handleSimulateStep = (symbol) => {
    const deltaRules = {
      S0: { REVIEW: 'S1', REJECT: 'S6' },
      S1: { ASSIGN: 'S2', REJECT: 'S6' },
      S2: { START_WORK: 'S3' },
      S3: { RESOLVE: 'S4' },
      S4: { CLOSE: 'S5', REOPEN: 'S2' }
    };

    const next = deltaRules[simState]?.[symbol];

    if (!next) {
      setSimMessage(`❌ Invalid DFA Transition: δ(${simState}, ${symbol}) is undefined. Rejected by automaton!`);
      return;
    }

    setSimState(next);
    setSimHistory((prev) => [...prev, `${symbol} → ${next}`]);
    setHighlightedState(next);
    setActivePath((prev) => [...prev, `${simState}_${symbol}_${next}`]);

    if (next === 'S5') {
      setSimMessage(`🎉 Reached Final Accepting State S5 via ${symbol}! String Accepted by DFA.`);
    } else if (next === 'S6') {
      setSimMessage(`⚠️ Reached Terminal Rejected State S6 via ${symbol}. Complaint is dead.`);
    } else {
      setSimMessage(`✅ Executed δ(${simState}, ${symbol}) → ${next}.`);
    }
  };

  // Available simulator transitions from current simState
  const currentSimOptions = {
    S0: ['REVIEW', 'REJECT'],
    S1: ['ASSIGN', 'REJECT'],
    S2: ['START_WORK'],
    S3: ['RESOLVE'],
    S4: ['CLOSE', 'REOPEN'],
    S5: [],
    S6: []
  }[simState] || [];

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <GitBranch size={13} /> AUTOMATA THEORY & FORMAL LANGUAGES
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
            Deterministic Finite Automaton (DFA) State Diagram
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Formal Specification: <code style={{ color: '#0284c7', fontWeight: 700 }}>M = (Q, &Sigma;, &delta;, q0, F)</code> controlling all ticket lifecycles.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Diagram Renderer Toggle */}
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
            <button
              onClick={() => setDiagramMode('svg')}
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                backgroundColor: diagramMode === 'svg' ? '#ffffff' : 'transparent',
                color: diagramMode === 'svg' ? '#0f172a' : '#64748b',
                boxShadow: diagramMode === 'svg' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Interactive Graph
            </button>
            <button
              onClick={() => setDiagramMode('mermaid')}
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                backgroundColor: diagramMode === 'mermaid' ? '#ffffff' : 'transparent',
                color: diagramMode === 'mermaid' ? '#0f172a' : '#64748b',
                boxShadow: diagramMode === 'mermaid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Mermaid Diagram
            </button>
          </div>

          <button onClick={handleResetView} className="btn btn-secondary btn-sm">
            <RotateCcw size={14} /> Reset View
          </button>
        </div>
      </div>

      {/* Control Toolbar: Complaint Highlighter & Simulator */}
      <div className="netcare-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Complaint Selector for live path tracing */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>
              Trace Complaint Path:
            </span>
            <select
              className="form-control"
              value={selectedComplaintId}
              onChange={handleSelectComplaint}
              style={{ maxWidth: '380px' }}
            >
              <option value="">-- Choose a Complaint to Highlight Path --</option>
              {complaints.map((c) => (
                <option key={c.complaintId} value={c.complaintId}>
                  {c.complaintId} — [{c.currentState}] {c.category} ({c.studentSnapshot?.name})
                </option>
              ))}
            </select>
          </div>

          {/* Path active state indicator */}
          {highlightedState && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>Current Active Node:</span>
              <StateBadge state={highlightedState} />
            </div>
          )}
        </div>
      </div>

      {/* Main Diagram Canvas Card */}
      <div
        className="netcare-card"
        style={{
          padding: '2rem 1.5rem',
          marginBottom: '2rem',
          backgroundColor: '#ffffff',
          overflowX: 'auto',
          position: 'relative'
        }}
      >
        {/* Diagram Title & Legend */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
              <strong style={{ color: '#1e40af' }}>q0 = S0</strong>: Initial State
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '3px double #059669', backgroundColor: '#ecfdf5' }} />
              <strong style={{ color: '#047857' }}>F = &#123;S5&#125;</strong>: Accepting State (Double Circle)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <strong style={{ color: '#b91c1c' }}>S6</strong>: Terminal Sink / Rejected
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '20px', height: '3px', backgroundColor: '#06b6d4' }} />
              <span style={{ color: '#64748b' }}>Directed Transition &delta;</span>
            </div>
          </div>
        </div>

        {/* Mode 1: Interactive SVG Directed Graph */}
        {diagramMode === 'svg' && (
          <div style={{ minWidth: '1080px', padding: '1rem 0' }}>
            <svg viewBox="0 0 1100 420" style={{ width: '100%', height: '420px', display: 'block' }}>
              {/* Arrow Marker Definitions */}
              <defs>
                <marker
                  id="arrow-default"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748b" />
                </marker>
                <marker
                  id="arrow-highlighted"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#0891b2" />
                </marker>
                <marker
                  id="arrow-reject"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#ef4444" />
                </marker>
              </defs>

              {/* Initial State Entry Arrow (pointing into S0) */}
              <path d="M 30 150 L 60 150" stroke="#0284c7" strokeWidth="3" markerEnd="url(#arrow-default)" />
              <text x="35" y="140" fill="#0284c7" fontSize="12" fontWeight="700">
                START
              </text>

              {/* Directed Transition Edges */}
              {TRANSITIONS.map((t, idx) => {
                const isEdgeHighlighted = activePath.includes(`${t.from}_${t.symbol}_${t.to}`);
                const isRejectEdge = t.to === 'S6';

                let strokeColor = isEdgeHighlighted ? '#0891b2' : isRejectEdge ? '#f87171' : '#94a3b8';
                let strokeWidth = isEdgeHighlighted ? 4 : isRejectEdge ? 2 : 2.5;
                let markerId = isEdgeHighlighted
                  ? 'url(#arrow-highlighted)'
                  : isRejectEdge
                  ? 'url(#arrow-reject)'
                  : 'url(#arrow-default)';

                return (
                  <g key={`${t.from}-${t.to}-${idx}`}>
                    <path
                      d={t.path}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={t.symbol === 'REOPEN' ? '5,5' : 'none'}
                      markerEnd={markerId}
                      style={{
                        transition: 'all 0.3s ease',
                        filter: isEdgeHighlighted ? 'drop-shadow(0 0 4px rgba(8, 145, 178, 0.5))' : 'none'
                      }}
                    />
                    {/* Edge Label Pill */}
                    <rect
                      x={t.textX - 35}
                      y={t.textY - 12}
                      width={70}
                      height={20}
                      rx="4"
                      fill="#ffffff"
                      stroke={isEdgeHighlighted ? '#0891b2' : '#e2e8f0'}
                      strokeWidth="1"
                    />
                    <text
                      x={t.textX}
                      y={t.textY + 2}
                      textAnchor="middle"
                      fill={isEdgeHighlighted ? '#0e7490' : isRejectEdge ? '#dc2626' : '#334155'}
                      fontSize="10"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      {t.symbol}
                    </text>
                  </g>
                );
              })}

              {/* State Nodes */}
              {Object.entries(NODE_COORDINATES).map(([stateKey, node]) => {
                const isCurrent = highlightedState === stateKey || simState === stateKey;
                const isAccepting = node.isAccepting;
                const isRejected = node.isRejected;

                let fill = '#ffffff';
                let stroke = node.color;
                let textColor = '#0f172a';

                if (isCurrent) {
                  fill = isAccepting ? '#ecfdf5' : isRejected ? '#fef2f2' : '#eff6ff';
                }

                return (
                  <g key={stateKey} style={{ cursor: 'pointer' }} onClick={() => setHighlightedState(stateKey)}>
                    {/* Pulsing Halo for Current State */}
                    {isCurrent && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isAccepting ? 46 : 42}
                        fill="none"
                        stroke={node.color}
                        strokeWidth="3"
                        opacity="0.4"
                        style={{ animation: 'pulse 1.5s infinite' }}
                      />
                    )}

                    {/* Outer Circle (for accepting state double-circle) */}
                    {isAccepting && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="38"
                        fill="none"
                        stroke="#059669"
                        strokeWidth="3"
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isAccepting ? 32 : 36}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={isCurrent ? 4 : 3}
                      style={{ transition: 'all 0.2s ease' }}
                    />

                    {/* Node State Code */}
                    <text
                      x={node.x}
                      y={node.y - 2}
                      textAnchor="middle"
                      fill={node.color}
                      fontSize="14"
                      fontWeight="800"
                      fontFamily="monospace"
                    >
                      {stateKey}
                    </text>

                    {/* Node Status Subtitle */}
                    <text
                      x={node.x}
                      y={node.y + 16}
                      textAnchor="middle"
                      fill="#475569"
                      fontSize="9"
                      fontWeight="600"
                    >
                      {isAccepting ? 'Closed' : isRejected ? 'Rejected' : stateKey === 'S0' ? 'Registered' : stateKey === 'S1' ? 'Review' : stateKey === 'S2' ? 'Assigned' : stateKey === 'S3' ? 'Work' : 'Resolved'}
                    </text>

                    {/* Special Accepting / Initial Badge text */}
                    {node.isInitial && (
                      <text x={node.x} y={node.y - 44} textAnchor="middle" fill="#2563eb" fontSize="10" fontWeight="700">
                        (Initial q0)
                      </text>
                    )}
                    {isAccepting && (
                      <text x={node.x} y={node.y - 44} textAnchor="middle" fill="#059669" fontSize="10" fontWeight="700">
                        (Final F)
                      </text>
                    )}
                    {isRejected && (
                      <text x={node.x} y={node.y + 54} textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="700">
                        (Dead / Sink)
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Mode 2: Formal Mermaid.js Diagram */}
        {diagramMode === 'mermaid' && (
          <div
            ref={mermaidRef}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2rem 1rem',
              overflowX: 'auto'
            }}
          />
        )}
      </div>

      {/* Interactive DFA Stepper / Simulator Card */}
      <div
        className="netcare-card"
        style={{
          padding: '1.75rem',
          backgroundColor: '#070d18',
          color: '#ffffff',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#22d3ee', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={15} /> LIVE AUTOMATA SIMULATOR & VERIFIER
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
              Step-by-Step DFA State Machine Tester
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#112240', border: '1px solid #1e3a68', borderRadius: '8px', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
              Current State:{' '}
              <strong style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '1rem' }}>
                {simState}
              </strong>
            </div>

            <button
              onClick={() => {
                setSimState('S0');
                setSimHistory(['S0']);
                setSimMessage('Simulator reset to S0.');
                setHighlightedState('S0');
              }}
              className="btn btn-secondary btn-sm"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              <RotateCcw size={14} /> Reset Sim
            </button>
          </div>
        </div>

        {/* Simulator Feedback Banner */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            fontSize: '0.85rem',
            color: '#f8fafc',
            marginBottom: '1.25rem',
            fontFamily: 'monospace'
          }}
        >
          {simMessage}
        </div>

        {/* Transition Buttons */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.5rem' }}>
            Available Valid Transitions from State {simState}:
          </div>

          {currentSimOptions.length > 0 ? (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {currentSimOptions.map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => handleSimulateStep(sym)}
                  className="btn"
                  style={{
                    backgroundColor: sym === 'REJECT' ? '#dc2626' : sym === 'CLOSE' ? '#059669' : '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    padding: '0.5rem 1rem'
                  }}
                >
                  <Play size={13} />
                  Execute &delta;({simState}, {sym})
                </button>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
              {simState === 'S5' ? '🎉 Complaint successfully Closed in accepting state S5. End of input string.' : 'Complaint reached rejected sink state S6. No transitions possible.'}
            </div>
          )}
        </div>

        {/* Sim History Trail */}
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Simulation Execution Trace:{' '}
          <span style={{ color: '#22d3ee', fontFamily: 'monospace' }}>
            {simHistory.join(' &rarr; ')}
          </span>
        </div>
      </div>
    </div>
  );
}
