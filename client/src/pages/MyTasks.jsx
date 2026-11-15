import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
    CheckSquare,
    Search,
    Check,
    Loader2,
    Plus,
    Filter,
    FolderKanban,
    Lock,
    Globe
} from 'lucide-react';
import taskApi from '../api/taskApi.js';
import projectApi from '../api/projectApi.js';
import NewTaskModal from '../components/NewTaskModal.jsx';

export default function MyTasks() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryProjectId = searchParams.get('projectId') || 'all';
    const queryStatus = searchParams.get('status') || 'all';

    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(queryProjectId);
    const [activeTab, setActiveTab] = useState(queryStatus);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Sync state when URL query params change
    useEffect(() => {
        setSelectedProjectId(searchParams.get('projectId') || 'all');
        setActiveTab(searchParams.get('status') || 'all');
    }, [searchParams]);

    // 1. Load project list for the dropdown filter
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await projectApi.getAll();
                setProjects(res || []);
            } catch (err) {
                console.error('Failed to load projects:', err.message);
            }
        };
        fetchProjects();
    }, []);

    // 2. Load tasks (priority sorted from backend)
    const loadTasks = async () => {
        try {
            setIsLoading(true);
            const params = {};
            if (selectedProjectId !== 'all') params.projectId = selectedProjectId;
            if (activeTab !== 'all') params.status = activeTab;

            const res = await taskApi.getAll(params);
            setTasks(res || []);
        } catch (err) {
            console.error('Failed to load tasks:', err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, [selectedProjectId, activeTab]);

    // Toggle task status
    /*const handleToggleTaskStatus = async (task) => {
        const newStatus = task.status === 'completed' ? 'todo' : 'completed';
        setTasks((prev) =>
            prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
        );
        try {
            await taskApi.update(task._id, { status: newStatus });
            loadTasks();
        } catch (err) {
            loadTasks();
        }
    };*/
    const handleToggleTaskStatus = async (task) => {
        try {
            const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
            await taskApi.update(task._id, { status: nextStatus });
            loadTasks();
        } catch (err) {
            alert(err.message || 'You can only modify tasks you created for yourself.');
        }
    };

    // Filter project dropdown handler
    const handleProjectChange = (e) => {
        const val = e.target.value;
        setSelectedProjectId(val);
        setSearchParams(val === 'all' ? {} : { projectId: val });
    };

    // Calculate metrics
    const counts = {
        total: tasks.length,
        todo: tasks.filter((t) => t.status === 'todo').length,
        in_progress: tasks.filter((t) => t.status === 'in_progress').length,
        completed: tasks.filter((t) => t.status === 'completed').length
    };

    // Search filter
    const filteredTasks = tasks.filter((task) =>
        task.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="tasks-page-container">
            {/* Page Header */}
            <div className="tasks-page-header">
                <div className="tasks-header-left">
                    <div className="tasks-header-icon-box">
                        <CheckSquare size={20} />
                    </div>
                    <div>
                        <h1 className="tasks-header-title">My Tasks</h1>
                        <p className="tasks-header-subtitle">
                            {selectedProjectId === 'all'
                                ? 'All tasks across projects ordered by priority (High → Low)'
                                : `Tasks for selected project`}
                        </p>
                    </div>
                </div>

                <button
                    className="btn-primary-pill"
                    onClick={() => setIsCreateModalOpen(true)}
                    style={{ backgroundColor: '#2563EB' }}
                >
                    <Plus size={16} />
                    <span>New Task</span>
                </button>
            </div>

            {/* Filter Controls Row */}
            <div className="tasks-controls-row" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Status Tabs */}
                <div className="tasks-status-tabs" style={{ margin: 0 }}>
                    {[
                        { id: 'all', label: `All (${counts.total})` },
                        { id: 'todo', label: `To Do (${counts.todo})` },
                        { id: 'in_progress', label: `In Progress (${counts.in_progress})` },
                        { id: 'completed', label: `Completed (${counts.completed})` }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            className={`tasks-status-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Project Filter Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                    <FolderKanban size={16} color="#64748B" />
                    <select
                        value={selectedProjectId}
                        onChange={handleProjectChange}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            fontSize: '13px',
                            background: '#FFFFFF',
                            color: '#0F172A',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">All Projects</option>
                        {projects.map((p) => (
                            <option key={p._id || p.id} value={p._id || p.id}>
                                {p.title}
                            </option>
                        ))}
                    </select>

                    {/* Search */}
                    <div className="tasks-search-box" style={{ width: '180px' }}>
                        <Search size={14} className="tasks-search-icon" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="tasks-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Tasks List */}
            {isLoading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
                    <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontSize: '13px' }}>Loading tasks...</p>
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="tasks-empty-state">
                    <p>No tasks found.</p>
                </div>
            ) : (
                <div className="tasks-list-card">
                    {filteredTasks.map((task) => {
                        const isDone = task.status === 'completed';
                        const projectTitle = task.projectId?.title || 'General';
                        const formattedDue = task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                            : 'No date';

                        return (
                            <div key={task._id} className="task-row-item">
                                <div className="task-row-left">
                                    <button
                                        className={`task-circle-checkbox ${isDone ? 'checked' : ''}`}
                                        onClick={() => handleToggleTaskStatus(task)}
                                    >
                                        {isDone && <Check size={12} strokeWidth={3} />}
                                    </button>

                                    <div className="task-content-group">
                                        <span className={`task-title-text ${isDone ? 'done' : ''}`}>
                                            {task.title}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: '11px',
                                                background: '#F1F5F9',
                                                color: '#475569',
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                fontWeight: 500
                                            }}
                                        >
                                            {projectTitle}
                                        </span>
                                    </div>
                                </div>

                                <div className="task-row-right">
                                    <span className="task-due-date">{formattedDue}</span>
                                    <div className="task-assignee-initials" title={`Assigned to ${task.assignee || 'SK'}`}>
                                        {task.assignee || 'SK'}
                                    </div>
                                    <span className={`priority-badge priority-${task.priority || 'medium'}`}>
                                        {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
                                    </span>

                                    {/* Visibility Badge */}
                                    {task.visibility === 'private' ? (
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '3px',
                                            fontSize: '11px',
                                            padding: '2px 7px',
                                            borderRadius: '6px',
                                            background: '#FEF3C7',
                                            color: '#92400E',
                                            fontWeight: 600
                                        }} title="Private task">
                                            <Lock size={11} /> Private
                                        </span>
                                    ) : (
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '3px',
                                            fontSize: '11px',
                                            padding: '2px 7px',
                                            borderRadius: '6px',
                                            background: '#ECFDF5',
                                            color: '#065F46',
                                            fontWeight: 600
                                        }} title="Public task">
                                            <Globe size={11} /> Public
                                        </span>
                                    )}

                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <NewTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onAddTask={async (data) => {
                    await taskApi.create(data);
                    loadTasks();
                }}
                projectId={selectedProjectId !== 'all' ? selectedProjectId : projects[0]?._id}
            />
        </div>
    );
}
