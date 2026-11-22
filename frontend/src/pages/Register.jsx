import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Wifi,
  User,
  Hash,
  Building,
  Calendar,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & Data Science',
  'Cyber Security'
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    department: DEPARTMENTS[0],
    year: YEARS[0],
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required.';
    if (!formData.registerNumber.trim()) {
      errs.registerNumber = 'College register number is required.';
    } else if (formData.registerNumber.trim().length < 5) {
      errs.registerNumber = 'Register number must be at least 5 characters.';
    }

    if (!formData.email.trim()) {
      errs.email = 'College email is required.';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      errs.email = 'Please provide a valid college email format.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const newUser = await register({
        name: formData.name.trim(),
        registerNumber: formData.registerNumber.trim().toUpperCase(),
        department: formData.department,
        year: formData.year,
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      success(`Student account created successfully! Welcome, ${newUser.name}.`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      error(msg, 'Registration Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#070d18',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '0.75rem',
              boxShadow: '0 4px 12px rgba(6, 182, 212, 0.35)'
            }}
          >
            <Wifi size={24} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
            Student Account Registration
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Register your college credentials to track and file network complaints.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Row 1: Name and Register Number */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-responsive">
            <div className="form-group">
              <label className="form-label">
                <User size={14} color="#64748b" /> Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                placeholder="e.g. Arun Kumar"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <div className="invalid-feedback">
                  <AlertCircle size={12} /> {errors.name}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Hash size={14} color="#64748b" /> Register Number <span className="required">*</span>
              </label>
              <input
                type="text"
                name="registerNumber"
                className={`form-control ${errors.registerNumber ? 'is-invalid' : ''}`}
                placeholder="e.g. 710021104001"
                value={formData.registerNumber}
                onChange={handleChange}
              />
              {errors.registerNumber && (
                <div className="invalid-feedback">
                  <AlertCircle size={12} /> {errors.registerNumber}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Department and Year */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }} className="grid-responsive">
            <div className="form-group">
              <label className="form-label">
                <Building size={14} color="#64748b" /> Department <span className="required">*</span>
              </label>
              <select
                name="department"
                className="form-control"
                value={formData.department}
                onChange={handleChange}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={14} color="#64748b" /> Year of Study <span className="required">*</span>
              </label>
              <select
                name="year"
                className="form-control"
                value={formData.year}
                onChange={handleChange}
              >
                {YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">
              <Mail size={14} color="#64748b" /> College Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="student@college.edu"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <div className="invalid-feedback">
                <AlertCircle size={12} /> {errors.email}
              </div>
            )}
          </div>

          {/* Row 3: Password and Confirm Password */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-responsive">
            <div className="form-group">
              <label className="form-label">
                <Lock size={14} color="#64748b" /> Password <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Min. 6 chars"
                  value={formData.password}
                  onChange={handleChange}
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
                    color: '#94a3b8'
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <div className="invalid-feedback">
                  <AlertCircle size={12} /> {errors.password}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={14} color="#64748b" /> Confirm Password <span className="required">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <div className="invalid-feedback">
                  <AlertCircle size={12} /> {errors.confirmPassword}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
          >
            {loading ? (
              'Creating Student Account...'
            ) : (
              <>
                <span>Complete Student Registration</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#0891b2', fontWeight: 600 }}>
            Sign in here
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
