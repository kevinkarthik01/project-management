import React from 'react';

export default function PlaceholderPage({ title, description }) {
  return (
    <div style={{ padding: '32px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h1 className="dashboard-title">{title}</h1>
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #ECEEF3',
        borderRadius: '18px',
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>
          {title} Module
        </h3>
        <p style={{ color: '#64748B', maxWidth: '440px', fontSize: '14px', lineHeight: '1.6' }}>
          {description || 'This section is ready to be expanded in upcoming modules. Return to Dashboard to view your active projects and task overview.'}
        </p>
      </div>
    </div>
  );
}
