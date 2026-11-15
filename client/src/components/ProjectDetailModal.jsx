import React from 'react';
import { useProjectModal } from '../context/ProjectModalContext.jsx';

import { X, Calendar, CheckSquare, Activity, Clock, ShieldCheck } from 'lucide-react';

export default function ProjectDetailsModal() {
    const { isOpen, selectedProject, closeProjectModal } = useProjectModal();
    if (!isOpen || !selectedProject) return null;

    const {
        title,
        description,
        status = 'In-Progress',
        progress = 0,
        deadline,
        subtasksCount = 0,
        activitiesCount = 0,
        createdAt,
        members = []
    } = selectedProject

    const formattedDeadline = deadline ? new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline set';

    const formattedCreated = createdAt
        ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recently';

    return (<div className="modal-overlay" onClick={closeProjectModal}>
        <div
            className="modal-content"
            style={{ maxWidth: '580px' }}
            onClick={(e) => e.stopPropagation()} // Prevents backdrop click from closing
        >
            {/* Header */}
            <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={status === 'Completed' ? 'badge-status-green' : 'badge-status-amber'}>
                        {status}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>Created: {formattedCreated}</span>
                </div>
                <button className="btn-more-options" onClick={closeProjectModal} aria-label="Close modal">
                    <X size={18} />
                </button>
            </div>
            {/* Title & Description */}
            <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    {title}
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>
                    {description || 'No detailed description provided for this project.'}
                </p>
            </div>
            {/* Progress Section */}
            <div className="project-progress-container" style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px' }}>
                <div className="progress-labels-row">
                    <span className="progress-text-label" style={{ fontWeight: 600 }}>Project Completion</span>
                    <span className="progress-percentage-label">{progress}%</span>
                </div>
                <div className="progress-track-bar" style={{ height: '8px' }}>
                    <div className="progress-fill-bar" style={{ width: `${progress}%`, background: '#6C5DD3' }} />
                </div>
            </div>
            {/* Key Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FAFAFC', padding: '10px 14px', borderRadius: '10px', border: '1px solid #F1F3F7' }}>
                    <Calendar size={16} color="#6C5DD3" />
                    <div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>Deadline</div>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>{formattedDeadline}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FAFAFC', padding: '10px 14px', borderRadius: '10px', border: '1px solid #F1F3F7' }}>
                    <CheckSquare size={16} color="#10B981" />
                    <div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>Subtasks</div>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>{subtasksCount} tasks</div>
                    </div>
                </div>
            </div>
            {/* Team Assignees */}
            {members.length > 0 && (
                <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Assigned Team</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {members.map((m, idx) => {
                            const mName = typeof m === 'object' && m ? m.name : 'Team Member';
                            const mInitials = mName.slice(0, 2).toUpperCase();
                            const mRole = typeof m === 'object' ? (m.designation || m.role || '') : '';
                            return m.avatar ? (
                                <img
                                    key={idx}
                                    src={m.avatar}
                                    alt={mName}
                                    title={`${mName} (${mRole})`}
                                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div
                                    key={idx}
                                    className="member-avatar-circle"
                                    style={{ width: '32px', height: '32px', fontSize: '11px' }}
                                    title={`${mName} (${mRole})`}
                                >
                                    {mInitials}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {/* Footer Actions */}
            <div className="modal-actions" style={{ marginTop: '8px' }}>
                <button type="button" className="btn-secondary" onClick={closeProjectModal}>
                    Close
                </button>
            </div>
        </div>
    </div>);
}