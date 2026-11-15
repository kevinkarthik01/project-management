import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import projectApi from '../api/projectApi.js';
import taskApi from '../api/taskApi.js';
import {
  FolderKanban,
  Clock,
  CheckCircle2,
  Flag,
  Calendar,
  Plus,
  ArrowRight,
  Check,
  TrendingUp,
  Loader2
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamically calculate current sprint/week date range
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 10);

  const formatDateStr = (d) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedDateRange = `${formatDateStr(startOfWeek)} - ${formatDateStr(endOfWeek)}`;

  // Load live data from MongoDB Atlas
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [projectsRes, tasksRes] = await Promise.allSettled([
        projectApi.getAll(),
        taskApi.getAll()
      ]);

      if (projectsRes.status === 'fulfilled' && Array.isArray(projectsRes.value)) {
        setProjects(projectsRes.value);
      } else {
        setProjects([]);
      }

      if (tasksRes.status === 'fulfilled' && Array.isArray(tasksRes.value)) {
        setTasks(tasksRes.value);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setProjects([]);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleToggleTask = async (task) => {
    const newStatus = task.status === 'completed' ? 'in_progress' : 'completed';
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
    );
    try {
      if (taskApi.update && task._id) {
        await taskApi.update(task._id, { status: newStatus });
      }
    } catch (err) {
      console.warn('Could not sync task status to backend:', err.message);
      loadDashboardData();
    }
  };

  // 1. Live Trend & Status Calculations
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const projectsThisWeek = projects.filter((p) => p.createdAt && new Date(p.createdAt) >= sevenDaysAgo).length;
  const inProgressProjects = projects.filter((p) => p.status === 'In Progress' || p.status === 'in_progress');
  const inProgressThisWeek = inProgressProjects.filter((p) => p.updatedAt && new Date(p.updatedAt) >= sevenDaysAgo).length;
  const completedProjects = projects.filter((p) => p.status === 'Completed' || p.status === 'completed');
  const completedThisWeek = completedProjects.filter((p) => p.updatedAt && new Date(p.updatedAt) >= sevenDaysAgo).length;

  const overdueProjects = projects.filter(
    (p) => p.status === 'Overdue' || (p.deadline && new Date(p.deadline) < now && p.status !== 'Completed')
  );

  const totalProjectsCount = projects.length;
  const inProgressProjectsCount = inProgressProjects.length;
  const completedProjectsCount = completedProjects.length;
  const overdueProjectsCount = overdueProjects.length;

  // 2. Task Breakdown for Donut Chart
  const createdTasksCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressTasksCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const overdueTasksCount = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed'
  ).length;

  const totalTasksSum = tasks.length;

  const pctCreated = totalTasksSum > 0 ? Math.round((createdTasksCount / totalTasksSum) * 100) : 0;
  const pctInProgress = totalTasksSum > 0 ? Math.round((inProgressTasksCount / totalTasksSum) * 100) : 0;
  const pctCompleted = totalTasksSum > 0 ? Math.round((completedTasksCount / totalTasksSum) * 100) : 0;
  const pctOverdue = totalTasksSum > 0 ? Math.max(0, 100 - (pctCreated + pctInProgress + pctCompleted)) : 0;

  // Donut SVG circumference math (radius = 48)
  const radius = 48;
  const circumference = 2 * Math.PI * radius; // ~301.59
  const arcCreated = (pctCreated / 100) * circumference;
  const arcInProgress = (pctInProgress / 100) * circumference;
  const arcCompleted = (pctCompleted / 100) * circumference;
  const arcOverdue = (pctOverdue / 100) * circumference;

  const offsetCreated = 0;
  const offsetInProgress = -arcCreated;
  const offsetCompleted = -(arcCreated + arcInProgress);
  const offsetOverdue = -(arcCreated + arcInProgress + arcCompleted);

  // 3. Project Progress Colors
  const progressColors = ['#3B82F6', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B'];

  // 4. Search Filter for Recent Tasks
  const filteredTasks = tasks.filter((t) =>
    t.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Title & Subtitle + Date Badge */}
      <div className="dashboard-title-row">
        <div>
          <h1 className="dashboard-main-heading">Dashboard</h1>
          <p className="dashboard-sub-heading">Track your progress and stay on top of your work.</p>
        </div>
        <div className="dashboard-header-right-tools">
          <div className="dashboard-date-badge">
            <Calendar size={14} color="#64748B" />
            <span>{formattedDateRange}</span>
          </div>
        </div>
      </div>

      {/* Row 1: 4 Metric Cards */}
      <section className="template2-stats-grid" aria-label="Quick Stats">
        {/* Total Projects */}
        <div className="template2-stat-card">
          <div className="template2-stat-top">
            <div className="template2-stat-icon-box stat-icon-blue-bg">
              <FolderKanban size={18} />
            </div>
            <span className="template2-stat-label">Total Projects</span>
          </div>
          <span className="template2-stat-value">{totalProjectsCount}</span>
          <div className="template2-stat-trend trend-green">
            <TrendingUp size={13} />
            <span>+{projectsThisWeek} this week</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="template2-stat-card">
          <div className="template2-stat-top">
            <div className="template2-stat-icon-box stat-icon-orange-bg">
              <Clock size={18} />
            </div>
            <span className="template2-stat-label">In Progress</span>
          </div>
          <span className="template2-stat-value">{inProgressProjectsCount}</span>
          <div className="template2-stat-trend trend-green">
            <TrendingUp size={13} />
            <span>+{inProgressThisWeek} this week</span>
          </div>
        </div>

        {/* Completed */}
        <div className="template2-stat-card">
          <div className="template2-stat-top">
            <div className="template2-stat-icon-box stat-icon-green-bg">
              <CheckCircle2 size={18} />
            </div>
            <span className="template2-stat-label">Completed</span>
          </div>
          <span className="template2-stat-value">{completedProjectsCount}</span>
          <div className="template2-stat-trend trend-gray">
            <span>+{completedThisWeek} this week</span>
          </div>
        </div>

        {/* Overdue */}
        <div className="template2-stat-card">
          <div className="template2-stat-top">
            <div className="template2-stat-icon-box stat-icon-red-bg">
              <Flag size={18} />
            </div>
            <span className="template2-stat-label">Overdue</span>
          </div>
          <span className="template2-stat-value">{overdueProjectsCount}</span>
          <div className="template2-stat-trend trend-gray">
            <span>{overdueProjectsCount > 0 ? `-${overdueProjectsCount}` : '+0'} this week</span>
          </div>
        </div>
      </section>

      {/* Row 2: Two Column Grid (Task Status Overview + Project Progress) */}
      <section className="template2-middle-grid">
        {/* Card 1: Task Status Overview (Donut Chart) */}
        <div className="template2-panel-card">
          <h2 className="template2-panel-title">Task Status Overview</h2>
          <div className="donut-chart-row">
            {/* SVG Donut Chart */}
            <div className="donut-chart-wrapper">
              <svg width="140" height="140" viewBox="0 0 120 120">
                {/* Background Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="14"
                />
                {totalTasksSum > 0 && (
                  <>
                    {/* Overdue (Red) */}
                    {pctOverdue > 0 && (
                      <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="transparent"
                        stroke="#EF4444"
                        strokeWidth="14"
                        strokeDasharray={`${arcOverdue} ${circumference - arcOverdue}`}
                        strokeDashoffset={offsetOverdue}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                      />
                    )}
                    {/* Completed (Green) */}
                    {pctCompleted > 0 && (
                      <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="transparent"
                        stroke="#10B981"
                        strokeWidth="14"
                        strokeDasharray={`${arcCompleted} ${circumference - arcCompleted}`}
                        strokeDashoffset={offsetCompleted}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                      />
                    )}
                    {/* In Progress (Orange) */}
                    {pctInProgress > 0 && (
                      <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="transparent"
                        stroke="#F59E0B"
                        strokeWidth="14"
                        strokeDasharray={`${arcInProgress} ${circumference - arcInProgress}`}
                        strokeDashoffset={offsetInProgress}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                      />
                    )}
                    {/* Created (Blue) */}
                    {pctCreated > 0 && (
                      <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="transparent"
                        stroke="#3B82F6"
                        strokeWidth="14"
                        strokeDasharray={`${arcCreated} ${circumference - arcCreated}`}
                        strokeDashoffset={offsetCreated}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                      />
                    )}
                  </>
                )}
                {/* Donut Center Count */}
                <text
                  x="60"
                  y="55"
                  textAnchor="middle"
                  fontSize="22"
                  fontWeight="800"
                  fill="#0F172A"
                >
                  {totalTasksSum}
                </text>
                <text
                  x="60"
                  y="72"
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="600"
                  fill="#64748B"
                >
                  Total Tasks
                </text>
              </svg>
            </div>

            {/* Donut Legend */}
            <div className="donut-legend-col">
              {/* Created */}
              <div className="donut-legend-item">
                <div className="donut-legend-label-group">
                  <div className="donut-legend-dot" style={{ backgroundColor: '#3B82F6' }} />
                  <span>Created</span>
                </div>
                <span className="donut-legend-val">{createdTasksCount}</span>
                <span className="donut-legend-pct">{pctCreated}%</span>
              </div>

              {/* In Progress */}
              <div className="donut-legend-item">
                <div className="donut-legend-label-group">
                  <div className="donut-legend-dot" style={{ backgroundColor: '#F59E0B' }} />
                  <span>In Progress</span>
                </div>
                <span className="donut-legend-val">{inProgressTasksCount}</span>
                <span className="donut-legend-pct">{pctInProgress}%</span>
              </div>

              {/* Completed */}
              <div className="donut-legend-item">
                <div className="donut-legend-label-group">
                  <div className="donut-legend-dot" style={{ backgroundColor: '#10B981' }} />
                  <span>Completed</span>
                </div>
                <span className="donut-legend-val">{completedTasksCount}</span>
                <span className="donut-legend-pct">{pctCompleted}%</span>
              </div>

              {/* Overdue */}
              <div className="donut-legend-item">
                <div className="donut-legend-label-group">
                  <div className="donut-legend-dot" style={{ backgroundColor: '#EF4444' }} />
                  <span>Overdue</span>
                </div>
                <span className="donut-legend-val">{overdueTasksCount}</span>
                <span className="donut-legend-pct">{pctOverdue}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Project Progress */}
        <div className="template2-panel-card">
          <h2 className="template2-panel-title">Project Progress</h2>
          {isLoading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
              <Loader2 className="animate-spin" size={22} style={{ margin: '0 auto 6px' }} />
              <p style={{ fontSize: '13px' }}>Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="tasks-empty-state" style={{ padding: '30px 10px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#64748B' }}>No projects found. Create your first project above!</p>
            </div>
          ) : (
            <div className="project-progress-list">
              {projects.slice(0, 5).map((p, idx) => {
                const progressVal = p.progress !== undefined ? p.progress : (p.taskStats?.progressPercent || 0);
                const barColor = progressColors[idx % progressColors.length];

                return (
                  <div key={p._id || idx} className="project-progress-item">
                    <div className="project-progress-header">
                      <span className="project-progress-name">{p.title}</span>
                      <span className="project-progress-pct">{progressVal}%</span>
                    </div>
                    <div className="project-progress-bar-track">
                      <div
                        className="project-progress-bar-fill"
                        style={{
                          width: `${progressVal}%`,
                          backgroundColor: barColor
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Row 3: Recent Tasks Table */}
      <section className="recent-tasks-panel" aria-label="Recent Tasks">
        <div className="recent-tasks-top">
          <h2 className="template2-panel-title">Recent Tasks</h2>
          <span
            className="recent-tasks-link"
            onClick={() => navigate('/tasks')}
            title="Go to My Tasks"
          >
            <span>View All Tasks</span>
            <ArrowRight size={14} />
          </span>
        </div>

        {isLoading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
            <Loader2 className="animate-spin" size={22} style={{ margin: '0 auto 6px' }} />
            <p style={{ fontSize: '13px' }}>Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="tasks-empty-state" style={{ padding: '30px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#64748B' }}>
              {tasks.length === 0 ? 'No tasks created yet. Click "+ New Task" in My Tasks to add one.' : 'No tasks match your search.'}
            </p>
          </div>
        ) : (
          <table className="recent-tasks-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Task</th>
                <th style={{ width: '30%' }}>Project</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '15%' }}>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.slice(0, 5).map((t) => {
                const isDone = t.status === 'completed';
                const projTitle = t.projectId?.title || 'General';
                const formattedDate = t.dueDate
                  ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'No deadline';

                let pillClass = 'todo';
                let pillLabel = 'Created';
                if (t.status === 'in_progress') {
                  pillClass = 'in_progress';
                  pillLabel = 'In Progress';
                } else if (t.status === 'completed') {
                  pillClass = 'completed';
                  pillLabel = 'Completed';
                }

                return (
                  <tr key={t._id}>
                    <td>
                      <div className="recent-task-title-group">
                        <div
                          className={`recent-task-check-box ${isDone ? 'checked' : ''}`}
                          onClick={() => handleToggleTask(t)}
                          title="Toggle task completion"
                        >
                          {isDone && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span
                          style={{
                            fontWeight: 500,
                            color: isDone ? '#94A3B8' : '#1E293B',
                            textDecoration: isDone ? 'line-through' : 'none'
                          }}
                        >
                          {t.title}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: '#64748B' }}>{projTitle}</td>
                    <td>
                      <span className={`recent-task-pill ${pillClass}`}>
                        {pillLabel}
                      </span>
                    </td>
                    <td>
                      <span className="recent-task-date">{formattedDate}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
