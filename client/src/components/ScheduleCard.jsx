import React, { useState } from 'react';
import { MoreVertical, Video, Clock } from 'lucide-react';

export default function ScheduleCard() {
  const [activeTab, setActiveTab] = useState('Meetings');

  const meetingAttendees = [
    { name: 'Alex', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { name: 'Esther', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
    { name: 'Leslie', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="schedule-container-card">
      <div className="section-top-header">
        <h2 className="section-heading-title">Schedule</h2>
        <button className="btn-more-options" aria-label="Schedule options">
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Switcher: Meetings vs Task */}
      <div className="pill-tab-switcher">
        <button
          className={`pill-tab-btn ${activeTab === 'Meetings' ? 'active' : ''}`}
          onClick={() => setActiveTab('Meetings')}
        >
          Meetings
        </button>
        <button
          className={`pill-tab-btn ${activeTab === 'Task' ? 'active' : ''}`}
          onClick={() => setActiveTab('Task')}
        >
          Task
        </button>
      </div>

      {/* Event Details */}
      {activeTab === 'Meetings' ? (
        <div className="event-box-inner">
          <div className="event-header-row">
            <h4 className="event-title">Userflow planning</h4>
            <span className="badge-coming-soon">Coming Soon</span>
          </div>

          <div className="event-platform-row">
            {/* Google Meet icon/graphic */}
            <div className="platform-logo-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="4" fill="#00832d" fillOpacity="0.1" />
                <path d="M15 8l4.5-3.5v15L15 16V8z" fill="#00832d" />
                <rect x="3" y="6" width="12" height="12" rx="2" fill="#00ac47" />
              </svg>
            </div>
            <span>Google Meet</span>
          </div>

          <div className="event-time-row">
            <Clock size={13} color="#94A3B8" />
            <span>Start At: 11:00 AM- 01:00 PM</span>
          </div>

          <div className="event-footer-row">
            <div className="avatar-stack-group">
              {meetingAttendees.map((att, i) => (
                <img
                  key={i}
                  src={att.avatar}
                  alt={att.name}
                  className="stacked-avatar"
                  title={att.name}
                />
              ))}
            </div>

            <button
              className="link-view-details"
              onClick={() => alert('Event Details: Userflow planning session with design & engineering lead on Google Meet.')}
            >
              View Details
            </button>
          </div>
        </div>
      ) : (
        <div className="event-box-inner" style={{ padding: '24px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#64748B' }}>
            Next deadline: <strong>Mobile App Redesign Sprint 1</strong> due today at 5:00 PM.
          </p>
        </div>
      )}
    </div>
  );
}
