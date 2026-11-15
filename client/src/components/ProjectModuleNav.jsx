import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Lightbulb, IndianRupee, ArrowLeft, FolderKanban } from 'lucide-react';

export default function ProjectModuleNav({ project, projectId, activeModule }) {
    const navigate = useNavigate();
    const resolvedId = projectId || project?._id || project?.id;

    const modules = [
        {
            id: 'tasks',
            label: 'Tasks',
            icon: CheckSquare,
            path: `/projects/${resolvedId}/tasks`
        },
        {
            id: 'insights',
            label: 'Insights',
            icon: Lightbulb,
            path: `/projects/${resolvedId}/insights`
        },
        {
            id: 'expenses',
            label: 'Expense Tracker',
            icon: IndianRupee,
            path: `/projects/${resolvedId}/expenses`
        }
    ];

    return (
        <div className="project-module-top-bar">
            <div className="breadcrumb-nav">
                <button
                    type="button"
                    className="project-back-pill"
                    onClick={() => navigate('/projects')}
                >
                    <ArrowLeft size={14} />
                    <span>All Projects</span>
                </button>
                <span className="breadcrumb-separator">/</span>
                <span
                    className="breadcrumb-link"
                    onClick={() => navigate('/projects')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                    <FolderKanban size={13} />
                    <span>{project?.title || 'Project Workspace'}</span>
                </span>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">
                    {activeModule === 'insights'
                        ? 'Insights'
                        : activeModule === 'expenses'
                        ? 'Expense Tracker'
                        : 'Tasks'}
                </span>
            </div>

            <div className="project-module-switcher" role="tablist" aria-label="Project Modules">
                {modules.map((mod) => {
                    const Icon = mod.icon;
                    const isActive = activeModule === mod.id;
                    return (
                        <button
                            key={mod.id}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            className={`project-module-tab-btn ${isActive ? 'active' : ''}`}
                            onClick={() => navigate(mod.path)}
                        >
                            <Icon size={15} />
                            <span>{mod.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

