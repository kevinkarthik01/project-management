import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckSquare,
    Plus,
    Search,
    ChevronDown,
    Check,
    Loader2,
    ArrowLeft
} from 'lucide-react';
import projectApi from '../api/projectApi.js';
import taskApi from '../api/taskApi.js';
import NewTaskModal from '../components/NewTaskModal.jsx';
import ProjectModuleNav from '../components/ProjectModuleNav.jsx';

export default function ProjectTasks() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [counts, setCounts] = useState({ total: 0, todo: 0, in_progress: 0, completed: 0 });
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    // Fetch Project Info and Tasks
    const loadProjectAndTasks = async () => {
        try {
            setIsLoading(true);
            const [projData, taskRes] = await Promise.all([
                projectApi.getById(projectId),
                taskApi.getByProject(projectId, activeTab)
            ]);

            setProject(projData);
            setTasks(taskRes.data || []);
            setCounts(taskRes.counts || { total: 0, todo: 0, in_progress: 0, completed: 0 });
        } catch (err) {
            console.error('Failed to load tasks:', err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProjectAndTasks();
    }, [projectId, activeTab]);

    // Handle Checkbox Toggle
    const handleToggleTaskStatus = async (task) => {
        const newStatus = task.status === 'completed' ? 'todo' : 'completed';

        // Optimistic UI update
        setTasks((prev) =>
            prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
        );

        try {
            await taskApi.update(task._id, { status: newStatus });
            // Refresh counts
            const res = await taskApi.getByProject(projectId, activeTab);
            setCounts(res.counts);
        } catch (err) {
            console.error('Failed to update task:', err.message);
            loadProjectAndTasks(); // Revert on failure
        }
    };

    // Handle Create Task
    const handleCreateTask = async (taskData) => {
        try {
            const newTask = await taskApi.create(taskData);
            setTasks((prev) => [newTask, ...prev]);
            setCounts((prev) => ({
                ...prev,
                total: prev.total + 1,
                todo: prev.todo + 1
            }));
        } catch (err) {
            alert(`Could not create task: ${err.message}`);
        }
    };

    // Filter by search bar
    const filteredTasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="tasks-page-container">
            {/* 1. Project Module Switcher & Breadcrumbs */}
            <ProjectModuleNav
                project={project}
                projectId={projectId}
                activeModule="tasks"
            />

            {/* 2. Page Header */}
            <div className="tasks-page-header">
                <div className="tasks-header-left">
                    <div className="tasks-header-icon-box">
                        <CheckSquare size={20} />
                    </div>
                    <div>
                        <h1 className="tasks-header-title">Tasks</h1>
                        <p className="tasks-header-subtitle">Manage and track project tasks</p>
                    </div>
                </div>

                <button
                    className="btn-primary-pill"
                    onClick={() => setIsTaskModalOpen(true)}
                    style={{ backgroundColor: '#2563EB' }} // Blue button matching Screen 2
                >
                    <Plus size={16} />
                    <span>New Task</span>
                </button>
            </div>

            {/* 3. Filter Tabs */}
            <div className="tasks-status-tabs">
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

            {/* 4. Search & Sort Bar */}
            <div className="tasks-controls-row">
                <div className="tasks-search-box">
                    <Search size={15} className="tasks-search-icon" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="tasks-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="tasks-sort-dropdown">
                    <span>Newest first</span>
                    <ChevronDown size={14} />
                </div>
            </div>

            {/* 5. Task Items List */}
            {isLoading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
                    <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontSize: '13px' }}>Loading tasks...</p>
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="tasks-empty-state">
                    <p>No tasks found in this view.</p>
                    <button
                        className="btn-primary-pill"
                        onClick={() => setIsTaskModalOpen(true)}
                        style={{ marginTop: '12px', fontSize: '12px', background: '#2563EB' }}
                    >
                        + Create First Task
                    </button>
                </div>
            ) : (
                <div className="tasks-list-card">
                    {filteredTasks.map((task) => {
                        const isDone = task.status === 'completed';
                        const formattedDue = task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'No date';

                        return (
                            <div key={task._id} className="task-row-item">
                                {/* Left: Checkbox & Title & Tags */}
                                <div className="task-row-left">
                                    <button
                                        className={`task-circle-checkbox ${isDone ? 'checked' : ''}`}
                                        onClick={() => handleToggleTaskStatus(task)}
                                        aria-label="Toggle task completion"
                                    >
                                        {isDone && <Check size={12} strokeWidth={3} />}
                                    </button>

                                    <div className="task-content-group">
                                        <span className={`task-title-text ${isDone ? 'done' : ''}`}>
                                            {task.title}
                                        </span>

                                        {task.tags && task.tags.length > 0 && (
                                            <div className="task-tags-group">
                                                {task.tags.map((tag, idx) => (
                                                    <span key={idx} className="task-tag-pill">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Date, Assignee Avatar, Priority Badge */}
                                <div className="task-row-right">
                                    <span className="task-due-date">{formattedDue}</span>

                                    <div className="task-assignee-initials" title={`Assigned to ${task.assignee || 'SK'}`}>
                                        {task.assignee || 'SK'}
                                    </div>

                                    <span className={`priority-badge priority-${task.priority || 'medium'}`}>
                                        {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            <NewTaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onAddTask={handleCreateTask}
                projectId={projectId}
            />
        </div>
    );
}
