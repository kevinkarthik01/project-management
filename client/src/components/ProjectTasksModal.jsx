import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Search, Check, Loader2, Plus } from 'lucide-react';
import taskApi from '../api/taskApi.js';
import NewTaskModal from './NewTaskModal.jsx';



export default function ProjectTasksModal({ isOpen, onClose, project, initialStatus = 'all' }) {
    if (!isOpen || !project) return null;

    const projectId = project._id || project.id;
    const [tasks, setTasks] = useState([]);
    const [counts, setCounts] = useState({ total: 0, todo: 0, in_progress: 0, completed: 0 });
    const [activeTab, setActiveTab] = useState(initialStatus);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        setActiveTab(initialStatus);
    }, [initialStatus]);

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const res = await taskApi.getByProject(projectId, activeTab);
            setTasks(res.data || []);
            setCounts(res.counts || { total: 0, todo: 0, in_progress: 0, completed: 0 });
        } catch (err) {
            console.error('Failed to load tasks:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && projectId) {
            fetchTasks();
        }
    }, [isOpen, projectId, activeTab]);

    const handleToggleTaskStatus = async (task) => {
        const newStatus = task.status === 'completed' ? 'todo' : 'completed';
        setTasks((prev) =>
            prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
        );
        try {
            await taskApi.update(task._id, { status: newStatus });
            const res = await taskApi.getByProject(projectId, activeTab);
            setCounts(res.counts);
        } catch (err) {
            fetchTasks();
        }
    };

    const handleCreateTask = async (taskData) => {
        try {
            await taskApi.create(taskData);
            fetchTasks();
        } catch (err) {
            alert(`Error creating task: ${err.message}`);
        }
    };

    const filteredTasks = tasks.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                style={{ maxWidth: '780px', width: '90%', maxHeight: '85vh', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="modal-top-header" style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                            <CheckSquare size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', margin: 0 }}>
                                {project.title} — Tasks
                            </h2>
                            <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0' }}>
                                Filter and manage tasks for this project
                            </p>
                        </div>
                    </div>
                    <button className="btn-more-options" onClick={onClose}><X size={18} /></button>
                </div>

                {/* Sub-header: Tabs + Search + New Task */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                    {/* Filter Tabs */}
                    <div className="tasks-status-tabs" style={{ margin: 0 }}>
                        {[
                            { id: 'all', label: `All (${counts.total})` },
                            { id: 'todo', label: `Created (${counts.todo})` },
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

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div className="tasks-search-box" style={{ width: '180px' }}>
                            <Search size={14} className="tasks-search-icon" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="tasks-search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            className="btn-primary-pill"
                            style={{ background: '#2563EB', padding: '6px 14px', fontSize: '12px' }}
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <Plus size={14} />
                            <span>New Task</span>
                        </button>
                    </div>
                </div>

                {/* Task List Body */}
                <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
                    {isLoading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                            <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
                            <p style={{ fontSize: '13px' }}>Loading tasks...</p>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="tasks-empty-state" style={{ padding: '40px 20px' }}>
                            <p>No tasks found in this view.</p>
                        </div>
                    ) : (
                        <div className="tasks-list-card" style={{ boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                            {filteredTasks.map((task) => {
                                const isDone = task.status === 'completed';
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
                                            </div>
                                        </div>
                                        <div className="task-row-right">
                                            <span className={`priority-badge priority-${task.priority || 'medium'}`}>
                                                {task.priority || 'medium'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <NewTaskModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onAddTask={handleCreateTask}
                    projectId={projectId}
                />
            </div>
        </div>
    );
}
