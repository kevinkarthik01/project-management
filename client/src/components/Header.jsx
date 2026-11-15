import React, { useState } from 'react';
import { Search, Bell, ChevronDown, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Header({ searchQuery, setSearchQuery, onOpenMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const userName = user?.name || 'Alex Johnson';
  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AJ';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="constant-header-wrapper">
      <div className="template2-topbar">
        {/* Left: Mobile Toggle + Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onOpenMobile && (
            <button
              className="mobile-header-menu-btn"
              onClick={onOpenMobile}
              aria-label="Open sidebar navigation"
            >
              <Menu size={20} color="#475569" />
            </button>
          )}

          <div className="topbar-search-box">
            <Search size={16} className="topbar-search-icon" />
            <input
              type="text"
              className="topbar-search-input"
              placeholder="Search projects, tasks..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Right Actions: Notifications & User Profile */}
        <div className="topbar-right-actions">
          <button className="btn-icon-circle" title="Notifications" aria-label="Notifications">
            <Bell size={17} />
            <span className="notification-dot"></span>
          </button>

          {/* User Profile & Dropdown */}
          <div style={{ position: 'relative' }}>
            <div
              className="header-user-profile"
              title={userName}
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ cursor: 'pointer' }}
            >
              <div className="header-avatar-circle">
                <span>{userInitials}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.2 }}>
                <span className="header-username">{userName}</span>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  {user?.designation || (user?.role === 'admin' ? 'Admin' : 'Tech')}
                </span>
              </div>
              <ChevronDown size={14} color="#64748B" />
            </div>

            {showDropdown && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '8px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  minWidth: '200px',
                  zIndex: 100,
                  padding: '6px'
                }}
              >
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #F1F5F9', fontSize: '12px' }}>
                  <div style={{ color: '#64748B' }}>Signed in as</div>
                  <strong style={{ color: '#0F172A', wordBreak: 'break-all' }}>
                    {user?.email || userName}
                  </strong>
                  <div style={{ marginTop: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: user?.role === 'admin' ? '#EDE9FE' : '#EFF6FF',
                        color: user?.role === 'admin' ? '#7C3AED' : '#2563EB'
                      }}
                    >
                      {user?.role || 'tech'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      {user?.designation || 'Tech Member'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    marginTop: '4px',
                    border: 'none',
                    background: 'transparent',
                    color: '#EF4444',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    borderRadius: '6px',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
