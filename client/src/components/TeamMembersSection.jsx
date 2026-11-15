import React from 'react';
import { MoreVertical } from 'lucide-react';

export default function TeamMembersSection({ members }) {
  const defaultMembers = [
    {
      id: 1,
      name: 'Esther Howard',
      email: 'estherhroe@gmail.com',
      role: 'Data Analyst Lead',
      status: 'Online',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      name: 'Leslie Alexander',
      email: 'lesilinealex@gmail.com',
      role: 'Product Executive',
      status: 'Online',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      name: 'Kristin Watson',
      email: 'kristinwatson@gmail.com',
      role: 'Interaction Designer',
      status: 'Online',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 4,
      name: 'Jane Cooper',
      email: 'janecooper@gmail.com',
      role: 'Design Lead',
      status: 'Online',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    }
  ];

  const displayList = members || defaultMembers;

  return (
    <div className="team-container-card">
      <div className="section-top-header">
        <h2 className="section-heading-title">Team Members</h2>
        <button className="btn-more-options" aria-label="Team options">
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Table Header */}
      <div className="team-table-header">
        <span>Name</span>
        <span>Role</span>
        <span style={{ textAlign: 'right' }}>Status</span>
      </div>

      {/* Members List */}
      <div className="team-members-list">
        {displayList.map((member) => (
          <div key={member.id} className="team-member-row">
            <div className="member-profile-cell">
              <img
                src={member.avatar}
                alt={member.name}
                className="member-avatar"
              />
              <div className="member-meta">
                <span className="member-name">{member.name}</span>
                <span className="member-email">{member.email}</span>
              </div>
            </div>

            <div className="member-role">{member.role}</div>

            <div style={{ textAlign: 'right' }}>
              <span className="member-status-online">{member.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
