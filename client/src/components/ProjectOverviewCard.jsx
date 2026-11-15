import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Lightbulb, IndianRupee, ArrowRight, Info } from 'lucide-react';
import { useProjectModal } from '../context/ProjectModalContext.jsx';

export default function ProjectOverviewCard({ project }) {
  const navigate = useNavigate();
  const { openProjectModal } = useProjectModal();

  const {
    _id,
    id,
    title = 'Project Name',
    description = 'No description available',
    status = 'Active',
    subtasksCount = project.taskStats?.total || project.subtasksCount || 0,
    insightsCount = project.insightsCount || 0,
    createdAt,
    coverImage = project.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    members = project.members && project.members.length > 0
      ? project.members
      : [{ name: title, initials: title.substring(0, 2).toUpperCase(), bg: '#2563EB' }]
  } = project;

  const projectId = _id || id;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Recently';


  return (
    <div className="modern-project-card">
      {/* 1. Top Cover Banner */}
      <div className="project-banner-wrapper">
        <img src={coverImage} alt={title} className="project-cover-img" />
        <span className="floating-status-badge">
          {status}
        </span>
      </div>

      {/* 2. Content Info */}
      <div className="project-body-content">
        <h3
          className="project-title-heading"
          onClick={() => openProjectModal(project)}
          title="Click to view details"
        >
          {title}
        </h3>
        <p className="project-desc-paragraph">{description}</p>

        {/* 3. Two Action Tiles (Blue Tasks & Green Insights) */}
        <div className="project-action-tiles-grid">
          {/* Blue Tile: Tasks */}
          <div
            className="action-tile blue-tile"
            onClick={() => navigate(`/tasks?projectId=${projectId}`)}
            title="View Project Tasks in My Tasks"
            style={{ cursor: 'pointer' }}
          >
            <div className="tile-top-row">
              <div className="tile-icon-box blue-icon-box">
                <CheckSquare size={16} />
              </div>
              <div className="tile-title-group">
                <span className="tile-label">Tasks</span>
                <span className="tile-count">{subtasksCount}</span>
              </div>
              <ArrowRight size={15} className="tile-arrow" />
            </div>
            <span className="tile-subtitle">View and manage tasks</span>
          </div>

          {/* Green Tile: Insights */}
          <div
            className="action-tile green-tile"
            onClick={() => navigate(`/projects/${projectId}/insights`)}
            title="View Project Insights"
            style={{ cursor: 'pointer' }}
          >
            <div className="tile-top-row">
              <div className="tile-icon-box green-icon-box">
                <Lightbulb size={16} />
              </div>
              <div className="tile-title-group">
                <span className="tile-label">Insights</span>
                <span className="tile-count">{insightsCount}</span>
              </div>
              <ArrowRight size={15} className="tile-arrow" />
            </div>
            <span className="tile-subtitle">Ideas, research and discussions</span>
          </div>

          {/* Amber/Indigo Tile: Expense Tracker */}
          <div
            className="action-tile blue-tile"
            onClick={() => navigate(`/projects/${projectId}/expenses`)}
            title="View Project Expense Tracker"
            style={{ cursor: 'pointer', gridColumn: '1 / -1' }}
          >
            <div className="tile-top-row">
              <div className="tile-icon-box blue-icon-box">
                <IndianRupee size={16} />
              </div>
              <div className="tile-title-group">
                <span className="tile-label">Expense Tracker</span>
              </div>
              <ArrowRight size={15} className="tile-arrow" />
            </div>
            <span className="tile-subtitle">Track investments, expenses, sales & profit (₹)</span>
          </div>
        </div>

        {/* 4. Footer: Members, Date & Info */}
        <div className="project-card-bottom-footer">
          <div className="members-initials-stack">
            {members.slice(0, 2).map((m, idx) => (
              <div
                key={idx}
                className="initials-avatar"
                style={{ backgroundColor: m.bg || '#334155' }}
                title={m.name}
              >
                {m.initials || m.name?.substring(0, 2).toUpperCase()}
              </div>
            ))}
            <span className="extra-members-text">+2 members</span>
          </div>

          <div className="footer-meta-right">
            <span className="created-date-text">Created: {formattedDate}</span>
            <button
              className="btn-more-options"
              onClick={() => openProjectModal(project)}
              title="Project Info"
            >
              <Info size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}