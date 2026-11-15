import React, { useState, useEffect } from 'react';
import { X, Users, Check, Search, Loader2 } from 'lucide-react';
import userApi from '../api/userApi.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function NewProjectModal({
  isOpen,
  onClose,
  onSaveProject,
  onAddProject,
  projectToEdit = null
}) {
  const isEditMode = Boolean(projectToEdit);
  const saveHandler = onSaveProject || onAddProject;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('In Progress');
  const [priority, setPriority] = useState('Medium');
  const [progress, setProgress] = useState(0);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const { user: currentUser } = useAuth();
  const currentUserIdStr = (currentUser?._id || currentUser?.id)?.toString();
  const projectCreatorIdStr = (
    projectToEdit?.createdBy?._id ||
    projectToEdit?.createdBy ||
    currentUserIdStr
  )?.toString();

  // 1. Fetch available team members when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          setIsLoadingUsers(true);
          const users = await userApi.getAll();
          setAvailableUsers(users || []);
        } catch (err) {
          console.error('Failed to load team members:', err);
        } finally {
          setIsLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  // 2. Pre-fill state when editing or resetting for new project
  useEffect(() => {
    if (isOpen) {
      if (projectToEdit) {
        setTitle(projectToEdit.title || '');
        setDescription(projectToEdit.description || '');
        if (projectToEdit.deadline) {
          const d = new Date(projectToEdit.deadline);
          setDeadline(!isNaN(d) ? d.toISOString().split('T')[0] : '');
        } else {
          setDeadline('');
        }
        setStatus(projectToEdit.status || 'In Progress');
        setPriority(projectToEdit.priority || 'Medium');
        setProgress(projectToEdit.progress ?? 0);

        // Extract member IDs whether populated or raw IDs, strictly excluding creator & current user
        const existingMemberIds = (projectToEdit.members || [])
          .map((m) => ((typeof m === 'object' && m !== null ? m._id : m))?.toString())
          .filter((id) => id && id !== projectCreatorIdStr && id !== currentUserIdStr);
        setSelectedMemberIds(existingMemberIds);
      } else {
        // Reset for new project
        setTitle('');
        setDescription('');
        const defaultDue = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        setDeadline(defaultDue.toISOString().split('T')[0]);
        setStatus('In Progress');
        setPriority('Medium');
        setProgress(0);
        setSelectedMemberIds([]);
      }
      setUserSearchQuery('');
    }
  }, [isOpen, projectToEdit]);

  if (!isOpen) return null;

  const handleToggleMember = (userId) => {
    const uIdStr = userId?.toString();
    setSelectedMemberIds((prev) =>
      prev.includes(uIdStr) ? prev.filter((id) => id !== uIdStr) : [...prev, uIdStr]
    );
  };

  const handleRemoveMember = (e, userId) => {
    e.stopPropagation();
    const uIdStr = userId?.toString();
    setSelectedMemberIds((prev) => prev.filter((id) => id !== uIdStr));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !saveHandler) return;

    await saveHandler({
      title: title.trim(),
      description: description.trim(),
      deadline: deadline ? new Date(deadline) : undefined,
      status,
      priority,
      progress: Number(progress),
      members: selectedMemberIds
    });

    onClose();
  };

  // Filter team members based on search (strictly exclude creator and current user)
  const filteredUsers = availableUsers
    .filter((u) => {
      const uIdStr = (u._id || u.id)?.toString();
      return uIdStr && uIdStr !== currentUserIdStr && uIdStr !== projectCreatorIdStr;
    })
    .filter((u) => {
      const q = userSearchQuery.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.designation?.toLowerCase().includes(q)
      );
    });

  const getInitials = (name) => {
    if (!name) return 'TM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '560px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 className="modal-title">
              {isEditMode ? 'Edit Project' : 'Create New Project'}
            </h3>
          </div>
          <button className="btn-more-options" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Project Title */}
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Restaurant Management"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description / Categories</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Food & Beverages • POS • Inventory • Analytics"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Deadline, Status & Priority Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Progress Slider */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Progress</label>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB' }}>
                {progress}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              style={{ marginTop: '4px', accentColor: '#2563EB', cursor: 'pointer' }}
            />
          </div>

          {/* Team Members Assignment Section */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={15} color="#2563EB" />
                <span>Team Members</span>
              </label>
              <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                {selectedMemberIds.length} selected
              </span>
            </div>

            <div className="member-selection-box">
              {/* Selected Member Chips Preview */}
              {selectedMemberIds.length > 0 && (
                <div className="member-selected-chips">
                  {selectedMemberIds.map((id) => {
                    const u = availableUsers.find((user) => (user._id || user.id)?.toString() === id?.toString());
                    const name = u ? u.name : 'Member';
                    return (
                      <span key={id} className="member-chip">
                        <span>{name}</span>
                        <button
                          type="button"
                          className="member-remove-btn"
                          onClick={(e) => handleRemoveMember(e, id)}
                          title={`Remove ${name}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Quick Search for Large Teams */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', borderBottom: '1px solid #F1F5F9', gap: '8px' }}>
                <Search size={13} color="#94A3B8" />
                <input
                  type="text"
                  placeholder="Filter team members by name or role..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  style={{ border: 'none', outline: 'none', fontSize: '12px', width: '100%', background: 'transparent' }}
                />
              </div>

              {/* Scrollable Members List */}
              <div className="member-list-scroll">
                {isLoadingUsers ? (
                  <div style={{ padding: '18px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                    <Loader2 size={16} className="animate-spin" style={{ margin: '0 auto 4px' }} />
                    Loading team members...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div style={{ padding: '14px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                    No team members found.
                  </div>
                ) : (
                  filteredUsers.map((user) => {
                    const uId = (user._id || user.id)?.toString();
                    const isSelected = selectedMemberIds.includes(uId);
                    return (
                      <div
                        key={user._id}
                        className={`member-list-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleToggleMember(user._id)}
                      >
                        <div className="member-item-left">
                          <div className="member-avatar-circle">
                            {getInitials(user.name)}
                          </div>
                          <div className="member-info">
                            <span className="member-name">{user.name}</span>
                            <span className="member-designation">
                              {user.designation || user.role || 'Member'} • {user.email}
                            </span>
                          </div>
                        </div>

                        <div className={`member-checkbox ${isSelected ? 'checked' : ''}`}>
                          {isSelected && <Check size={11} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-actions" style={{ marginTop: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-pill"
              style={{ backgroundColor: '#2563EB' }}
            >
              {isEditMode ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
