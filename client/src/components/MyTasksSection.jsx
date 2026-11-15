import React, { useState } from 'react';
import { Calendar, MoreVertical, Check } from 'lucide-react';

export default function MyTasksSection({ tasks, onToggleTask, onViewAll }) {
  const [filterTab, setFilterTab] = useState('Today');

  const filteredTasks = tasks.filter((task) => {
    if (filterTab === 'Today') return task.dueWhen === 'today';
    if (filterTab === 'Tomorrow') return task.dueWhen === 'tomorrow';
    if (filterTab === 'Upcoming') return task.dueWhen === 'upcoming';
    return true;
  });

  return (
    <div className="tasks-container-card">
      {/* Header */}
      <div className="tasks-top-header">
        <h2 className="section-heading-title">My Tasks</h2>
        <button
          className="btn-view-all-tasks"
          onClick={onViewAll}
          title="View all project tasks"
        >
          View All Tasks
        </button>
      </div>

      {/* Tabs Switcher: Today | Tomorrow | Upcoming */}
      <div className="task-filter-tabs">
        {['Today', 'Tomorrow', 'Upcoming'].map((tab) => (
          <button
            key={tab}
            className={`task-tab-btn ${filterTab === tab ? 'active' : ''}`}
            onClick={() => setFilterTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="task-items-list">
        {filteredTasks.map((task) => (
          <div key={task.id} className="task-item-row">
            <div className="task-item-left">
              <button
                className={`custom-checkbox ${task.completed ? 'checked' : ''}`}
                onClick={() => onToggleTask(task.id)}
                aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
              >
                {task.completed && <Check size={12} strokeWidth={3} />}
              </button>

              <div className="task-title-group">
                <span className={`task-title ${task.completed ? 'completed' : ''}`}>
                  {task.title}
                </span>

                <div className="task-deadline-badge">
                  <Calendar size={13} color="#94A3B8" />
                  <span>Deadline: {task.deadline}</span>
                </div>
              </div>
            </div>

            <div className="task-item-right">
              <span className={task.completed ? 'badge-status-green' : 'badge-status-amber'}>
                {task.completed ? 'Completed' : task.status}
              </span>

              <div className="avatar-stack-group">
                {task.assignees.map((member, i) => (
                  <img
                    key={i}
                    src={member.avatar}
                    alt={member.name}
                    className="stacked-avatar"
                    title={member.name}
                  />
                ))}
              </div>

              <button className="btn-more-options" aria-label="Task options">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
            No tasks scheduled for {filterTab.toLowerCase()}.
          </div>
        )}
      </div>
    </div>
  );
}
