import React from 'react';
import config from '../config/config.json';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Home,
  FolderKanban,
  CheckSquare,
  Kanban,
  MessageSquare,
  Calendar,
  Bell,
  Settings,
  X
} from 'lucide-react';

export default function Sidebar({ isMobileOpen, onCloseMobile }) {
  const companyName = config.COMPANY_NAME || 'Impactory';
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const userRole = user?.role || 'tech';

  // Role-based navigation structure: easily extensible for any future role mappings
  const navItems = [
    { name: 'Home', path: '/', icon: Home, roles: ['admin', 'tech'] },
    { name: 'My Tasks', path: '/tasks', icon: CheckSquare, roles: ['admin', 'tech'] },
    { name: 'Projects', path: '/projects', icon: FolderKanban, roles: ['admin', 'tech'] },
    { name: 'Kanban Desk', path: '/kanban', icon: Kanban, roles: ['admin', 'tech'] },
    { name: 'Message', path: '/messages', icon: MessageSquare, roles: ['admin', 'tech'] },
    { name: 'Calendar', path: '/calendar', icon: Calendar, roles: ['admin', 'tech'] },
    { name: 'Notifications', path: '/notifications', icon: Bell, roles: ['admin', 'tech'] },
  ];

  // Filter visible items based on current logged in user role
  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  return (
    <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header: Impactory Logo */}
      <div className="sidebar-brand-wrapper">
        <div className="sidebar-brand">
          <img
            src="/logo.png"
            alt="Impactory Logo"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              objectFit: 'cover',
              flexShrink: 0
            }}
          />
          <span className="brand-name-impactory">{companyName}</span>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            className="sidebar-mobile-close-btn"
            onClick={onCloseMobile}
            aria-label="Close Navigation"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav-group" style={{ flex: 1, marginTop: '12px' }}>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `nav-link-item ${isActive ? 'active' : ''}`
              }
              onClick={() => onCloseMobile && onCloseMobile()}
              end
            >
              <Icon className="nav-icon" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Settings Link (Admin Only) */}
      {isAdmin && (
        <div className="sidebar-bottom-section">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `nav-link-item ${isActive ? 'active' : ''}`
            }
            onClick={() => onCloseMobile && onCloseMobile()}
            end
          >
            <Settings className="nav-icon" />
            <span>Settings</span>
          </NavLink>
        </div>
      )}
    </aside>
  );
}

