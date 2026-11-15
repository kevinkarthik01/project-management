import React, { useState } from 'react';
import { X, Globe, Lock } from 'lucide-react';

export default function NewTaskModal({ isOpen, onClose, onAddTask, projectId }) {
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState('medium');
    const [visibility, setVisibility] = useState('public'); // 👈 Default to Public
    const [tagsInput, setTagsInput] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [assignee, setAssignee] = useState('SK');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        const tags = tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);

        onAddTask({
            projectId,
            title,
            priority,
            visibility, // 👈 Included in payload
            tags,
            assignee: assignee.toUpperCase(),
            dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'todo'
        });

        setTitle('');
        setTagsInput('');
        setDueDate('');
        setVisibility('public');
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Create New Task</h3>
                    <button className="btn-more-options" onClick={onClose} aria-label="Close dialog">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className="form-group">
                        <label className="form-label">Task Title</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Design database schema"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select
                                className="form-select"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        {/* Visibility Selector */}
                        <div className="form-group">
                            <label className="form-label">Visibility</label>
                            <select
                                className="form-select"
                                value={visibility}
                                onChange={(e) => setVisibility(e.target.value)}
                            >
                                <option value="public">🌐 Public (All team members)</option>
                                <option value="private">🔒 Private (Only you & admins)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                            <label className="form-label">Assignee Initials</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. SK, JD"
                                maxLength={3}
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Due Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Category Tags (comma-separated)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Backend, Database"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary-pill">
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
