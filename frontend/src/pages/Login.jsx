import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Wifi,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  GitBranch,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Login() {
  const [roleTab, setRoleTab] = useState('student'); // 'student' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Quick Demo Autofill
  const handleQuickFill = (role) => {
    if (role === 'admin') {
      setRoleTab('admin');
      setEmail('admin@college.edu');
      setPassword('Admin@123');
      setErrors({});
    } else {
      setRoleTab('student');
      setEmail('arun.kumar@college.edu');
      setPassword('Student@123');
      setErrors({});
    }
  };

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const loggedUser = await login(email.trim(), password);
      success(`Welcome back, ${loggedUser.name}! Login successful.`);

      if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      error(msg, 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#070d18'
      }}
    >
      {/* Left Column: Visual Showcase & Automata Concept */}
      <div
        style={{
          flex: 1.1,
          backgroundColor: '#0b1528',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '3.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="login-showcase-panel"
      >
        {/* Subtle Background Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        <div>
          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)'
              }}
            >
              <Wifi size={24} strokeWidth={2.5} />
            </div>
            <div>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>NetCare</span>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Automata-Driven Network Complaint Resolution System
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.25, color: '#f8fafc', marginBottom: '1rem' }}>
            Campus Wi-Fi & LAN Complaints, <br />
            <span style={{ color: '#22d3ee' }}>Governed by Formal DFA Theory.</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '480px', marginBottom: '2.5rem' }}>
            A rigorous, transparent support platform for students, faculty, and network engineers. Every complaint transition follows strict mathematical automata transitions: M = (Q, &Sigma;, &delta;, q0, F).
          </p>

          {/* Feature Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '460px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '10px'
              }}
            >
              <GitBranch size={20} color="#06b6d4" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc' }}>
                  Deterministic State Transitions
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Prevents arbitrary status tampering. State changes require verified input symbols.
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '10px'
              }}
            >
              <CheckCircle2 size={20} color="#10b981" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc' }}>
                  Accepting State (S5) & Reopen Loops
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Verified resolutions close into S5, with student privilege to reopen back to S2 if unsatisfied.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Quick Fill Footer */}
        <div
          style={{
            backgroundColor: 'rgba(6, 182, 212, 0.06)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginTop: '2rem'
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#22d3ee', marginBottom: '0.5rem' }}>
            TESTING & DEMO SHORTCUTS:
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('student')}
              style={{
                backgroundColor: '#112240',
                color: '#38bdf8',
                border: '1px solid #1e3a68',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <GraduationCap size={14} /> Quick Student Login
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              style={{
                backgroundColor: '#112240',
                color: '#f59e0b',
                border: '1px solid #1e3a68',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <ShieldCheck size={14} /> Quick Admin Login
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Login Form */}
      <div
        style={{
          flex: 0.9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 2rem'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '2.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
          }}
        >
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
              Sign In to NetCare
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Select your college role and enter your portal credentials.
            </p>
          </div>

          {/* Role Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              padding: '4px',
              borderRadius: '10px',
              marginBottom: '1.75rem'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setRoleTab('student');
                setErrors({});
              }}
              style={{
                flex: 1,
                padding: '0.6rem 0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                backgroundColor: roleTab === 'student' ? '#ffffff' : 'transparent',
                color: roleTab === 'student' ? '#0f172a' : '#64748b',
                boxShadow: roleTab === 'student' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <GraduationCap size={16} /> Student
            </button>

            <button
              type="button"
              onClick={() => {
                setRoleTab('admin');
                setErrors({});
              }}
              style={{
                flex: 1,
                padding: '0.6rem 0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                backgroundColor: roleTab === 'admin' ? '#ffffff' : 'transparent',
                color: roleTab === 'admin' ? '#0f172a' : '#64748b',
                boxShadow: roleTab === 'admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <ShieldCheck size={16} /> Administrator
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">
                <Mail size={15} color="#64748b" /> College Email Address
              </label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder={roleTab === 'admin' ? 'admin@college.edu' : 'student@college.edu'}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
              />
              {errors.email && (
                <div className="invalid-feedback">
                  <AlertCircle size={13} /> {errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">
                  <Lock size={15} color="#64748b" /> Password
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  }}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <div className="invalid-feedback">
                  <AlertCircle size={13} /> {errors.password}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
            >
              {loading ? (
                'Signing In...'
              ) : (
                <>
                  <span>Sign In as {roleTab === 'admin' ? 'Administrator' : 'Student'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          {roleTab === 'student' && (
            <div
              style={{
                marginTop: '1.75rem',
                textAlign: 'center',
                fontSize: '0.875rem',
                color: '#64748b'
              }}
            >
              First time filing a complaint?{' '}
              <Link to="/register" style={{ color: '#0891b2', fontWeight: 600 }}>
                Register student account
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .login-showcase-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
