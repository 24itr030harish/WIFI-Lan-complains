import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { complaintService } from '../services/api';
import {
  PlusCircle,
  Wifi,
  Cable,
  MapPin,
  AlertCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  User,
  Hash,
  Building,
  Calendar,
  Mail,
  FileQuestion,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

const CATEGORIES = [
  'Wi-Fi Not Connecting',
  'Slow Internet',
  'No Internet Access',
  'Frequent Disconnection',
  'LAN Connectivity Issue',
  'Network Authentication Failure',
  'Other'
];

const LOCATIONS = [
  'Classroom',
  'Laboratory',
  'Library',
  'Hostel',
  'Seminar Hall',
  'Administrative Block',
  'Campus Grounds',
  'Other'
];

export default function SubmitComplaint() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: CATEGORIES[0],
    networkType: 'Wi-Fi',
    location: LOCATIONS[0],
    locationDetails: '',
    description: '',
    priority: 'Medium'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.category) errs.category = 'Please select a complaint category.';
    if (!formData.networkType) errs.networkType = 'Please select network type (Wi-Fi or LAN).';
    if (!formData.location) errs.location = 'Please select a location.';

    if (!formData.description.trim()) {
      errs.description = 'Please describe the connectivity issue.';
    } else if (formData.description.trim().length < 10) {
      errs.description = 'Problem description must be at least 10 characters long.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReset = () => {
    setFormData({
      category: CATEGORIES[0],
      networkType: 'Wi-Fi',
      location: LOCATIONS[0],
      locationDetails: '',
      description: '',
      priority: 'Medium'
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await complaintService.create(formData);
      if (res.data && res.data.success) {
        success(`Complaint ${res.data.complaint.complaintId} submitted successfully and initialized into DFA state S0!`);
        navigate(`/track/${res.data.complaint.complaintId}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit complaint. Please try again.';
      error(msg, 'Submission Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
          Register Network Complaint
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          File a Wi-Fi or LAN issue. Your ticket will enter the DFA at initial state{' '}
          <strong style={{ color: '#2563eb' }}>S0 (Complaint Registered)</strong>.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section 1: Auto-Filled Student Details */}
        <div className="netcare-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="#0891b2" /> 1. Student Identification (Auto-filled)
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
            These details are captured automatically from your authenticated session.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>
                <User size={13} color="#64748b" /> Student Name
              </label>
              <input
                type="text"
                className="form-control"
                value={user?.name || ''}
                disabled
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#334155' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>
                <Hash size={13} color="#64748b" /> Register Number
              </label>
              <input
                type="text"
                className="form-control"
                value={user?.registerNumber || ''}
                disabled
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#334155', fontFamily: 'monospace', fontWeight: 600 }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>
                <Building size={13} color="#64748b" /> Department
              </label>
              <input
                type="text"
                className="form-control"
                value={user?.department || ''}
                disabled
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#334155' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>
                <Calendar size={13} color="#64748b" /> Year of Study
              </label>
              <input
                type="text"
                className="form-control"
                value={user?.year || ''}
                disabled
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#334155' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>
                <Mail size={13} color="#64748b" /> Email Address
              </label>
              <input
                type="text"
                className="form-control"
                value={user?.email || ''}
                disabled
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#334155' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>
                <Clock size={13} color="#64748b" /> Timestamp
              </label>
              <input
                type="text"
                className="form-control"
                value={new Date().toLocaleString()}
                disabled
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b', fontSize: '0.85rem' }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Network Complaint Details */}
        <div className="netcare-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileQuestion size={18} color="#0891b2" /> 2. Connectivity Issue Particulars
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Accurate location and network category ensure quick technician dispatch.
          </p>

          {/* Row 1: Category & Network Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.25rem' }} className="grid-responsive">
            <div className="form-group">
              <label className="form-label">
                <Wifi size={14} color="#64748b" /> Complaint Category <span className="required">*</span>
              </label>
              <select
                name="category"
                className={`form-control ${errors.category ? 'is-invalid' : ''}`}
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <div className="invalid-feedback">
                  <AlertCircle size={12} /> {errors.category}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Cable size={14} color="#64748b" /> Network Type <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                <label
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.625rem',
                    borderRadius: '8px',
                    border: formData.networkType === 'Wi-Fi' ? '2px solid #0891b2' : '1px solid #cbd5e1',
                    backgroundColor: formData.networkType === 'Wi-Fi' ? '#ecfeff' : '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: formData.networkType === 'Wi-Fi' ? '#0e7490' : '#475569'
                  }}
                >
                  <input
                    type="radio"
                    name="networkType"
                    value="Wi-Fi"
                    checked={formData.networkType === 'Wi-Fi'}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  <Wifi size={16} /> Wi-Fi
                </label>

                <label
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.625rem',
                    borderRadius: '8px',
                    border: formData.networkType === 'LAN' ? '2px solid #0891b2' : '1px solid #cbd5e1',
                    backgroundColor: formData.networkType === 'LAN' ? '#ecfeff' : '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: formData.networkType === 'LAN' ? '#0e7490' : '#475569'
                  }}
                >
                  <input
                    type="radio"
                    name="networkType"
                    value="LAN"
                    checked={formData.networkType === 'LAN'}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  <Cable size={16} /> Ethernet / LAN
                </label>
              </div>
            </div>
          </div>

          {/* Row 2: Location and Detailed Specifics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.25rem' }} className="grid-responsive">
            <div className="form-group">
              <label className="form-label">
                <MapPin size={14} color="#64748b" /> Campus Location <span className="required">*</span>
              </label>
              <select
                name="location"
                className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                value={formData.location}
                onChange={handleChange}
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              {errors.location && (
                <div className="invalid-feedback">
                  <AlertCircle size={12} /> {errors.location}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Specific Room / Hall / Block Details
              </label>
              <input
                type="text"
                name="locationDetails"
                className="form-control"
                placeholder="e.g. CS Lab 2, 1st Floor, Admin Block Room 304, Kaveri Hostel Room 212"
                value={formData.locationDetails}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 3: Priority */}
          <div className="form-group">
            <label className="form-label">
              Priority Level
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {['Low', 'Medium', 'High'].map((p) => {
                const isSelected = formData.priority === p;
                let color = '#10b981';
                let bg = '#ecfdf5';
                if (p === 'Medium') {
                  color = '#d97706';
                  bg = '#fffbeb';
                } else if (p === 'High') {
                  color = '#dc2626';
                  bg = '#fef2f2';
                }

                return (
                  <label
                    key={p}
                    style={{
                      padding: '0.5rem 1.25rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: isSelected ? `2px solid ${color}` : '1px solid #cbd5e1',
                      backgroundColor: isSelected ? bg : '#ffffff',
                      color: isSelected ? color : '#64748b',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={p}
                      checked={isSelected}
                      onChange={handleChange}
                      style={{ display: 'none' }}
                    />
                    {p} Priority
                  </label>
                );
              })}
            </div>
          </div>

          {/* Problem Description */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Problem Description <span className="required">*</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400, marginLeft: 'auto' }}>
                (Minimum 10 characters)
              </span>
            </label>
            <textarea
              name="description"
              rows={4}
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              placeholder="Describe the issue clearly (e.g., Cannot connect to Campus-WiFi, authentication handshake times out, ping packet loss > 50%, specific website inaccessible, etc.)"
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && (
              <div className="invalid-feedback">
                <AlertCircle size={12} /> {errors.description}
              </div>
            )}
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem', textAlign: 'right' }}>
              {formData.description.length} characters entered
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary"
            disabled={loading}
          >
            <RotateCcw size={15} /> Reset Form
          </button>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-cyan"
            style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
          >
            {loading ? (
              'Submitting & Initializing DFA...'
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>Submit Complaint (Initial State S0)</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        @media (max-width: 700px) {
          .grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
