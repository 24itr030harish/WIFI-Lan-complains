import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  UserCheck,
  GitBranch,
  TableProperties,
  User,
  Shield,
  HelpCircle,
  Activity,
  Layers
} from 'lucide-react';

export const Sidebar = ({ isOpen, closeMobileSidebar }) => {
  const { user, isAdmin } = useAuth();

  const studentLinks = [
    { to: '/dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
    { to: '/submit-complaint', label: 'Submit Complaint', icon: PlusCircle },
    { to: '/my-complaints', label: 'My Complaints', icon: FileText },
    { to: '/profile', label: 'Student Profile', icon: User }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/complaints', label: 'All Complaints', icon: Layers }
  ];

  const automataLinks = [
    { to: '/dfa-diagram', label: 'DFA State Diagram', icon: GitBranch },
    { to: '/dfa-table', label: 'DFA Transition Table', icon: TableProperties }
  ];

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.65rem 0.875rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? '#ffffff' : '#94a3b8',
    backgroundColor: isActive ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
    borderLeft: isActive ? '3px solid #06b6d4' : '3px solid transparent',
    transition: 'all 0.15s ease',
    marginBottom: '0.25rem'
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={closeMobileSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(7, 13, 24, 0.6)',
            backdropFilter: 'blur(2px)',
            zIndex: 40
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: '#070d18',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          height: 'calc(100vh - 64px)',
          position: 'sticky',
          top: '64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.25rem 0.875rem',
          zIndex: 45,
          overflowY: 'auto'
        }}
        className={`netcare-sidebar ${isOpen ? 'open' : ''}`}
      >
        <div>
          {/* Section 1: Main Management Links */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#64748b',
                fontWeight: 700,
                padding: '0 0.75rem',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              {isAdmin ? <Shield size={12} color="#f59e0b" /> : <Activity size={12} color="#06b6d4" />}
              {isAdmin ? 'ADMINISTRATION' : 'STUDENT PORTAL'}
            </div>

            <nav>
              {isAdmin
                ? adminLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        style={linkStyle}
                        onClick={closeMobileSidebar}
                      >
                        <Icon size={18} />
                        {item.label}
                      </NavLink>
                    );
                  })
                : studentLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        style={linkStyle}
                        onClick={closeMobileSidebar}
                      >
                        <Icon size={18} />
                        {item.label}
                      </NavLink>
                    );
                  })}
            </nav>
          </div>

          {/* Section 2: Automata Theory & DFA */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#64748b',
                fontWeight: 700,
                padding: '0 0.75rem',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <GitBranch size={12} color="#8b5cf6" />
              AUTOMATA THEORY (DFA)
            </div>

            <nav>
              {automataLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    style={linkStyle}
                    onClick={closeMobileSidebar}
                  >
                    <Icon size={18} />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Info Box */}
        <div
          style={{
            backgroundColor: '#0b1528',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '0.875rem',
            color: '#94a3b8'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f8fafc', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.2rem' }}>
            <HelpCircle size={14} color="#06b6d4" /> Campus Network Cell
          </div>
          <div style={{ fontSize: '0.72rem', lineHeight: 1.4 }}>
            IT Helpdesk: Ext. 4040 / 4041<br />
            Email: <span style={{ color: '#38bdf8' }}>support@college.edu</span>
          </div>
        </div>
      </aside>
    </>
  );
};
