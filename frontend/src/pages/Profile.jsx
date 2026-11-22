import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/api';
import {
  User,
  Hash,
  Building,
  Calendar,
  Mail,
  ShieldCheck,
  Clock,
  FileText,
  CheckCircle2,
  Lock,
  GraduationCap
} from 'lucide-react';

export default function Profile() {
  const { user, isAdmin } = useAuth();
  const [complaintsCount, setComplaintsCount] = useState({ total: 0, active: 0, resolved: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await complaintService.getMyComplaints();
        if (res.data && res.data.success) {
          const list = res.data.complaints;
          setComplaintsCount({
            total: list.length,
            active: list.filter((c) => ['S0', 'S1', 'S2', 'S3'].includes(c.currentState)).length,
            resolved: list.filter((c) => ['S4', 'S5'].includes(c.currentState)).length
          });
        }
      } catch (err) {
        console.warn('Could not load profile stats');
      }
    };

    fetchCounts();
  }, []);

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
          User Profile
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Your verified campus credentials and complaint activity history.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem' }} className="profile-grid">
        {/* Left Column: Profile Card */}
        <div className="netcare-card" style={{ padding: '2rem' }}>
          {/* Identity Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0b1528 0%, #1e3a68 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                boxShadow: '0 4px 10px rgba(11, 21, 40, 0.2)'
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                {user?.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span
                  style={{
                    backgroundColor: isAdmin ? '#fef3c7' : '#e0f2fe',
                    color: isAdmin ? '#b45309' : '#0369a1',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '20px',
                    textTransform: 'uppercase'
                  }}
                >
                  {user?.role} Account
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* User Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0891b2' }}>
                <Hash size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  College Register Number
                </div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                  {user?.registerNumber || 'ADMINISTRATOR'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0891b2' }}>
                <Building size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Department
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>
                  {user?.department}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0891b2' }}>
                <Calendar size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Year of Study
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>
                  {user?.year}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0891b2' }}>
                <Mail size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Email Address
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Security Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Complaints Summary */}
          <div className="netcare-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} color="#0891b2" /> Ticket Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Submitted:</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                  {complaintsCount.total}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>In Progress (S0 - S3):</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#d97706' }}>
                  {complaintsCount.active}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Resolved / Closed (S4 - S5):</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#16a34a' }}>
                  {complaintsCount.resolved}
                </span>
              </div>
            </div>
          </div>

          {/* Security & Cryptography Card */}
          <div
            style={{
              backgroundColor: '#070d18',
              borderRadius: '12px',
              padding: '1.25rem',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem', color: '#22d3ee', marginBottom: '0.5rem' }}>
              <Lock size={15} /> Security & Integrity
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              Password hashed via bcrypt salt rounds. Sessions protected with cryptographically signed JSON Web Tokens (JWT).
            </p>
            <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={14} /> Session Active & Authenticated
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .profile-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
