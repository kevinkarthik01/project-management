import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FolderKanban,
    Calendar,
    Flag,
    Plus,
    Pencil,
    Clock,
    Check,
    Loader2,
    Utensils,
    ShoppingCart,
    Smartphone,
    Megaphone,
    BarChart3,
    Package,
    Lightbulb,
    IndianRupee,
    ArrowRight
} from 'lucide-react';
import taskApi from '../api/taskApi.js';
import projectApi from '../api/projectApi.js';
import NewProjectModal from '../components/NewProjectModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getProjectSubRole, canEditProject } from '../utils/rbac.js';
import { formatCompactINR } from '../utils/currency.js';

const PROJECT_THEMES = [
    { icon: Utensils, bg: '#EDE9FE', color: '#7C3AED', barColor: '#10B981' },
    { icon: ShoppingCart, bg: '#DCFCE7', color: '#16A34A', barColor: '#10B981' },
    { icon: Smartphone, bg: '#F3E8FF', color: '#9333EA', barColor: '#8B5CF6' },
    { icon: Megaphone, bg: '#DBEAFE', color: '#2563EB', barColor: '#3B82F6' },
    { icon: BarChart3, bg: '#FEE2E2', color: '#DC2626', barColor: '#F43F5E' },
    { icon: Package, bg: '#CCFBF1', color: '#0D9488', barColor: '#14B8A6' }
];

export default function Projects() {
    const { user: currentUser } = useAuth();
    const [projectSummaries, setProjectSummaries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState(null);
    const navigate = useNavigate();

    const loadSummaries = async () => {
        try {
            setIsLoading(true);
            const data = await taskApi.getProjectsSummary();
            setProjectSummaries(data || []);
        } catch (err) {
            console.error('Failed to load project summaries:', err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSummaries();
    }, []);

    const handleOpenCreateModal = () => {
        setProjectToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (project) => {
        setProjectToEdit(project);
        setIsModalOpen(true);
    };

    const handleSaveProject = async (formData) => {
        try {
            if (projectToEdit) {
                await projectApi.update(projectToEdit._id, formData);
            } else {
                await projectApi.create(formData);
            }
            await loadSummaries();
        } catch (err) {
            alert(`Error saving project: ${err.message}`);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Not set';
        const d = new Date(date);
        if (isNaN(d)) return 'Not set';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getInitials = (name) => {
        if (!name) return 'TM';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div className="my-tasks-page">
            {/* Page Header with New Project Button */}
            <div className="my-tasks-header" style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="my-tasks-icon-box">
                        <FolderKanban size={22} color="#2563EB" />
                    </div>
                    <div>
                        <h1 className="my-tasks-title">Projects</h1>
                        <p className="my-tasks-subtitle">
                            View project progress, inspect tasks, and manage team members.
                        </p>
                    </div>
                </div>

                <button
                    className="btn-primary-pill"
                    onClick={handleOpenCreateModal}
                    style={{ backgroundColor: '#2563EB', padding: '9px 18px', fontSize: '13px' }}
                >
                    <Plus size={16} />
                    <span>New Project</span>
                </button>
            </div>

            {/* Responsive Projects Grid */}
            {isLoading ? (
                <div style={{ padding: '80px', textAlign: 'center', color: '#64748B' }}>
                    <Loader2 className="animate-spin" size={26} style={{ margin: '0 auto 10px' }} />
                    <p style={{ fontSize: '13.5px' }}>Loading projects...</p>
                </div>
            ) : projectSummaries.length === 0 ? (
                <div className="tasks-empty-state">
                    <p>No projects found. Click "New Project" to create your first project with assigned team members!</p>
                </div>
            ) : (
                <div className="my-tasks-grid">
                    {projectSummaries.map((project, idx) => {
                        const theme = PROJECT_THEMES[idx % PROJECT_THEMES.length];
                        const IconComponent = theme.icon;
                        const stats = project.taskStats || {
                            created: 0,
                            inProgress: 0,
                            completed: 0,
                            total: 0,
                            progressPercent: 0
                        };

                        // Creator Details
                        const creator = typeof project.createdBy === 'object' && project.createdBy ? project.createdBy : null;
                        let creatorName = creator?.name;
                        if (!creatorName) {
                            const currentUserId = (currentUser?._id || currentUser?.id)?.toString();
                            const creatorId = (project.createdBy?._id || project.createdBy)?.toString();
                            if (creatorId && creatorId === currentUserId) {
                                creatorName = currentUser?.name;
                            }
                        }
                        if (!creatorName) {
                            creatorName = 'Admin';
                        }
                        const creatorSubtitle = 'Created by';
                        const creatorInitials = getInitials(creatorName);

                        // Members Details
                        const members = Array.isArray(project.members) ? project.members : [];
                        const membersCount = members.length;

                        // Priority
                        const priorityVal = project.priority || 'Medium';
                        const priorityClass = `priority-${priorityVal.toLowerCase()}`;

                        // Status
                        const statusVal = project.status || 'Active';
                        const statusClass = statusVal.toLowerCase() === 'completed' 
                            ? 'status-completed' 
                            : statusVal.toLowerCase() === 'in progress' || statusVal.toLowerCase() === 'active' 
                            ? 'status-active' 
                            : 'status-on_hold';

                        // Dates
                        const startDateStr = formatDate(project.createdAt || Date.now());
                        const dueDateStr = project.deadline ? formatDate(project.deadline) : 'Dec 31, 2026';

                        // Sub-Role & Permissions
                        const subRole = getProjectSubRole(project, currentUser);
                        const canEdit = canEditProject(project, currentUser);

                        return (
                            <div key={project._id} className="my-task-card">
                                {/* ========================================
                                    CARD HEADER: Icon, Title, Subtitle, Status, Edit
                                   ======================================== */}
                                <div className="my-task-card-header">
                                    <div
                                        className="my-task-theme-icon"
                                        style={{ backgroundColor: theme.bg, color: theme.color }}
                                    >
                                        <IconComponent size={22} />
                                    </div>
                                    <div className="my-task-card-title-group">
                                        <h3 className="my-task-project-name" title={project.title}>
                                            {project.title}
                                        </h3>
                                        <p className="my-task-category" title={project.description}>
                                            {project.description || 'General Project • Management'}
                                        </p>
                                    </div>

                                    <div className="my-task-header-right">
                                        {subRole === 'creator' && (
                                            <span className="subrole-badge creator" title="You created this project">
                                                👑 Creator
                                            </span>
                                        )}
                                        {subRole === 'team-member' && (
                                            <span className="subrole-badge member" title="You are an assigned team member">
                                                👤 Team Member
                                            </span>
                                        )}
                                        {subRole === 'admin' && (
                                            <span className="subrole-badge admin" title="System Administrator">
                                                🛡️ Admin
                                            </span>
                                        )}

                                        <span className={`project-status-pill ${statusClass}`}>
                                            {statusVal}
                                        </span>

                                        {canEdit && (
                                            <button
                                                className="project-card-edit-btn"
                                                onClick={() => handleOpenEditModal(project)}
                                                title="Edit Project"
                                                aria-label="Edit Project"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* ========================================
                                    SECTION 1: PROJECT INFORMATION BOX
                                    Start Date | Due Date | Priority
                                   ======================================== */}
                                <div className="project-info-meta-card">
                                    {/* Start Date */}
                                    <div className="meta-col">
                                        <div className="meta-label-group">
                                            <Calendar size={13} color="#64748B" />
                                            <span>Start Date</span>
                                        </div>
                                        <span className="meta-value">{startDateStr}</span>
                                    </div>

                                    {/* Due Date */}
                                    <div className="meta-col">
                                        <div className="meta-label-group">
                                            <Calendar size={13} color="#64748B" />
                                            <span>Due Date</span>
                                        </div>
                                        <span className="meta-value">{dueDateStr}</span>
                                    </div>

                                    {/* Priority */}
                                    <div className="meta-col">
                                        <div className="meta-label-group">
                                            <Flag size={13} color={priorityVal.toLowerCase() === 'high' ? '#EF4444' : '#64748B'} />
                                            <span>Priority</span>
                                        </div>
                                        <span className={`priority-pill ${priorityClass}`}>
                                            {priorityVal}
                                        </span>
                                    </div>
                                </div>

                                {/* ========================================
                                    SECTION 2: CREATED BY AND TEAM MEMBERS
                                   ======================================== */}
                                <div className="project-people-section">
                                    {/* Left: Created By */}
                                    <div className="project-creator-col">
                                        <span className="people-section-label">Created By</span>
                                        <div className="creator-identity-row">
                                            <div className="creator-avatar-circle" title={creatorName}>
                                                {creatorInitials}
                                            </div>
                                            <div className="creator-meta-text">
                                                <span className="creator-name">{creatorName}</span>
                                                <span className="creator-role">{creatorSubtitle}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Team Members */}
                                    <div className="project-team-col">
                                        <span className="people-section-label">
                                            Team Members ({membersCount})
                                        </span>
                                        <div className="team-avatar-stack">
                                            {membersCount === 0 ? (
                                                <span style={{ fontSize: '11px', color: '#94A3B8' }}>None</span>
                                            ) : (
                                                <>
                                                    {members.slice(0, 2).map((m, mIdx) => {
                                                        const mName = typeof m === 'object' && m ? m.name : 'Member';
                                                        const mInitials = getInitials(mName);
                                                        return (
                                                            <div
                                                                key={mIdx}
                                                                className="team-stack-avatar"
                                                                title={`${mName} (${typeof m === 'object' ? (m.designation || m.role || '') : ''})`}
                                                            >
                                                                {mInitials}
                                                            </div>
                                                        );
                                                    })}
                                                    {membersCount > 2 && (
                                                        <span className="team-extra-pill">
                                                            +{membersCount - 2}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* ========================================
                                    SECTION 3: TASK AND PROGRESS INFORMATION
                                   ======================================== */}
                                <div className="project-progress-card-section">
                                    <div className="progress-header-row">
                                        <span className="progress-title-label">Progress</span>
                                        <span className="progress-percent-label">{stats.progressPercent}%</span>
                                    </div>

                                    <div
                                        className="progress-track-wrapper"
                                        onClick={() => navigate(`/tasks?projectId=${project._id}`)}
                                        title="Click to view all project tasks"
                                    >
                                        <div
                                            className="progress-fill-bar-colored"
                                            style={{
                                                width: `${stats.progressPercent}%`,
                                                backgroundColor: theme.barColor
                                            }}
                                        />
                                    </div>

                                    {/* 3 Clickable Stat Tiles */}
                                    <div className="template-task-tiles-grid">
                                        {/* Created Tile */}
                                        <div
                                            className="template-task-tile tile-blue-style"
                                            onClick={() => navigate(`/tasks?projectId=${project._id}&status=todo`)}
                                            title="Click to inspect Created tasks"
                                        >
                                            <div className="tile-number-row">
                                                <span>+</span>
                                                <span>{stats.created}</span>
                                            </div>
                                            <span className="tile-text-label">Created</span>
                                        </div>

                                        {/* In Progress Tile */}
                                        <div
                                            className="template-task-tile tile-amber-style"
                                            onClick={() => navigate(`/tasks?projectId=${project._id}&status=in_progress`)}
                                            title="Click to inspect In Progress tasks"
                                        >
                                            <div className="tile-number-row">
                                                <Clock size={13} strokeWidth={2.5} />
                                                <span>{stats.inProgress}</span>
                                            </div>
                                            <span className="tile-text-label">In Progress</span>
                                        </div>

                                        {/* Completed Tile */}
                                        <div
                                            className="template-task-tile tile-green-style"
                                            onClick={() => navigate(`/tasks?projectId=${project._id}&status=completed`)}
                                            title="Click to inspect Completed tasks"
                                        >
                                            <div className="tile-number-row">
                                                <Check size={13} strokeWidth={3} />
                                                <span>{stats.completed}</span>
                                            </div>
                                            <span className="tile-text-label">Completed</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ========================================
                                    SECTION 4: PROJECT MODULES (Insights & Expense Tracker)
                                   ======================================== */}
                                <div className="project-card-modules-row">
                                    <button
                                        type="button"
                                        className="project-module-action-btn insights-module-btn"
                                        onClick={() => navigate(`/projects/${project._id}/insights`)}
                                        title="Open Project Insights Feed & Notes"
                                    >
                                        <div className="module-btn-icon insights-icon">
                                            <Lightbulb size={15} />
                                        </div>
                                        <div className="module-btn-text">
                                            <span className="module-btn-title">Insights</span>
                                            <span className="module-btn-meta">
                                                {project.insightsCount || 0} post{project.insightsCount === 1 ? '' : 's'}
                                            </span>
                                        </div>
                                        <ArrowRight size={14} className="module-btn-arrow" />
                                    </button>

                                    <button
                                        type="button"
                                        className="project-module-action-btn expense-module-btn"
                                        onClick={() => navigate(`/projects/${project._id}/expenses`)}
                                        title="Open Project Expense Tracker & Financials"
                                    >
                                        <div className="module-btn-icon expense-icon">
                                            <IndianRupee size={15} />
                                        </div>
                                        <div className="module-btn-text">
                                            <span className="module-btn-title">Expense Tracker</span>
                                            <span className="module-btn-meta">
                                                {project.financeStats &&
                                                (project.financeStats.totalInvestment > 0 ||
                                                    project.financeStats.totalExpenses > 0 ||
                                                    project.financeStats.totalSales > 0)
                                                    ? `Spent: ${formatCompactINR(project.financeStats.totalExpenses)}`
                                                    : '₹ Track Finances'}
                                            </span>
                                        </div>
                                        <ArrowRight size={14} className="module-btn-arrow" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add / Edit Project Modal */}
            <NewProjectModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setProjectToEdit(null);
                }}
                onSaveProject={handleSaveProject}
                projectToEdit={projectToEdit}
            />
        </div>
    );
}
