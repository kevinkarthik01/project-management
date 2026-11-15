import React from 'react';

export default function StatCard({ title, value, delta, icon: Icon, colorTheme }) {
  const getIconClass = () => {
    switch (colorTheme) {
      case 'purple':
        return 'stat-icon-purple';
      case 'green':
        return 'stat-icon-green';
      case 'red':
        return 'stat-icon-red';
      case 'blue':
      default:
        return 'stat-icon-blue';
    }
  };

  return (
    <div className="stat-card">
      <div className={`stat-icon-wrapper ${getIconClass()}`}>
        <Icon size={18} strokeWidth={2.2} />
      </div>
      <div className="stat-info">
        <span className="stat-label">{title}</span>
        <span className="stat-value">{value}</span>
        <span className="stat-delta">{delta}</span>
      </div>
    </div>
  );
}
