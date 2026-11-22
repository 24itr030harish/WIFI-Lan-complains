import React from 'react';
import {
  Clock,
  Search,
  UserCheck,
  Wrench,
  CheckCircle,
  CheckCheck,
  XCircle,
  Wifi,
  Cable,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight
} from 'lucide-react';

export const StateBadge = ({ state, label, showCode = true }) => {
  // DFA State styling map
  const configs = {
    S0: {
      name: 'Complaint Registered',
      bg: '#eff6ff',
      text: '#1e40af',
      border: '#bfdbfe',
      icon: Clock
    },
    S1: {
      name: 'Under Review',
      bg: '#f5f3ff',
      text: '#6d28d9',
      border: '#ddd6fe',
      icon: Search
    },
    S2: {
      name: 'Assigned to Technician',
      bg: '#fffbeb',
      text: '#b45309',
      border: '#fde68a',
      icon: UserCheck
    },
    S3: {
      name: 'Work In Progress',
      bg: '#ecfeff',
      text: '#0e7490',
      border: '#a5f3fc',
      icon: Wrench
    },
    S4: {
      name: 'Resolved',
      bg: '#ecfdf5',
      text: '#047857',
      border: '#a7f3d0',
      icon: CheckCircle
    },
    S5: {
      name: 'Closed',
      bg: '#f0fdf4',
      text: '#15803d',
      border: '#86efac',
      icon: CheckCheck
    },
    S6: {
      name: 'Rejected',
      bg: '#fef2f2',
      text: '#b91c1c',
      border: '#fecaca',
      icon: XCircle
    }
  };

  const config = configs[state] || {
    name: label || state,
    bg: '#f1f5f9',
    text: '#475569',
    border: '#cbd5e1',
    icon: Clock
  };

  const IconComponent = config.icon;

  return (
    <span
      className="badge"
      style={{
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        fontSize: '0.75rem',
        fontWeight: 600,
        padding: '0.2rem 0.65rem'
      }}
    >
      <IconComponent size={13} style={{ flexShrink: 0 }} />
      {showCode && <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{state}:</span>}
      <span>{label || config.name}</span>
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  let bg = '#ecfdf5';
  let text = '#047857';
  let border = '#a7f3d0';
  let Icon = ArrowDownRight;

  if (priority === 'High') {
    bg = '#fef2f2';
    text = '#b91c1c';
    border = '#fecaca';
    Icon = ArrowUpRight;
  } else if (priority === 'Medium') {
    bg = '#fffbeb';
    text = '#b45309';
    border = '#fde68a';
    Icon = ArrowRight;
  }

  return (
    <span
      className="badge"
      style={{
        backgroundColor: bg,
        color: text,
        border: `1px solid ${border}`,
        fontSize: '0.72rem'
      }}
    >
      <Icon size={12} />
      {priority} Priority
    </span>
  );
};

export const NetworkTypeBadge = ({ type }) => {
  const isWifi = type === 'Wi-Fi';
  return (
    <span
      className="badge"
      style={{
        backgroundColor: isWifi ? '#f0fdfa' : '#f8fafc',
        color: isWifi ? '#0f766e' : '#334155',
        border: `1px solid ${isWifi ? '#99f6e4' : '#e2e8f0'}`,
        fontSize: '0.72rem'
      }}
    >
      {isWifi ? <Wifi size={12} /> : <Cable size={12} />}
      {type}
    </span>
  );
};
