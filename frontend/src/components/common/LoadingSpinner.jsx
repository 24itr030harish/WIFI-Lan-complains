import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading data...', size = 28 }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        color: '#64748b',
        gap: '0.75rem'
      }}
    >
      <Loader2
        size={size}
        style={{
          color: '#0891b2',
          animation: 'spin 1s linear infinite'
        }}
      />
      {text && <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{text}</span>}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export const EmptyState = ({ title = 'No records found', message, icon: Icon, action }) => {
  return (
    <div
      style={{
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b'
      }}
    >
      {Icon && (
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            color: '#0891b2'
          }}
        >
          <Icon size={26} />
        </div>
      )}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>
        {title}
      </h3>
      {message && (
        <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '380px', marginBottom: '1.25rem' }}>
          {message}
        </p>
      )}
      {action}
    </div>
  );
};
