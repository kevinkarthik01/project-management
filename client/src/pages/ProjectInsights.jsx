import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Lightbulb,
    Plus,
    Search,
    Pin,
    Pencil,
    Trash2,
    Tag,
    Clock,
    Loader2,
    X,
    BookOpen,
    AlertTriangle,
    Sparkles,
    Eye,
    FileText,
    MessageSquarePlus,
    Filter,
    Paperclip,
    Image as ImageIcon,
    ExternalLink
} from 'lucide-react';
import insightApi from '../api/insightApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProjectModuleNav from '../components/ProjectModuleNav.jsx';
import {
    AttachmentField,
    AttachmentPreviewModal,
    isImageAttachment
} from '../components/AttachmentField.jsx';
import { formatDateTimeIN } from '../utils/currency.js';

const INSIGHT_CATEGORIES = [
    'General Updates',
    'Observations',
    'Important Notes',
    'Learnings',
    'Issues & Challenges',
    'Ideas & Improvements'
];

const CATEGORY_THEMES = {
    'General Updates': { bg: '#EFF6FF', color: '#2563EB', border: '#DBEAFE', icon: FileText },
    'Observations': { bg: '#F5F3FF', color: '#7C3AED', border: '#EDE9FE', icon: Eye },
    'Important Notes': { bg: '#FFF7ED', color: '#EA580C', border: '#FFEDD5', icon: Pin },
    'Learnings': { bg: '#ECFDF5', color: '#059669', border: '#D1FAE5', icon: BookOpen },
    'Issues & Challenges': { bg: '#FEF2F2', color: '#DC2626', border: '#FEE2E2', icon: AlertTriangle },
    'Ideas & Improvements': { bg: '#FEFCE8', color: '#CA8A04', border: '#FEF08A', icon: Sparkles }
};

export default function ProjectInsights() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [project, setProject] = useState(null);
    const [insights, setInsights] = useState([]);
    const [stats, setStats] = useState({ total: 0, pinned: 0, filtered: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // Filters
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showPinnedOnly, setShowPinnedOnly] = useState(false);
    const [selectedTag, setSelectedTag] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal / Form state for Create & Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInsight, setEditingInsight] = useState(null);
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formCategory, setFormCategory] = useState('General Updates');
    const [formTagsInput, setFormTagsInput] = useState('');
    const [formIsPinned, setFormIsPinned] = useState(false);
    const [formAttachmentUrl, setFormAttachmentUrl] = useState('');
    const [formAttachmentName, setFormAttachmentName] = useState('');
    const [formAttachmentType, setFormAttachmentType] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Attachment Lightbox / Preview Modal
    const [previewAttachment, setPreviewAttachment] = useState(null);

    const loadInsights = async () => {
        try {
            setIsLoading(true);
            setErrorMsg('');
            const params = {};
            if (selectedCategory !== 'all') params.category = selectedCategory;
            if (showPinnedOnly) params.pinned = 'true';
            if (selectedTag) params.tag = selectedTag;
            if (searchQuery.trim()) params.search = searchQuery.trim();

            const res = await insightApi.getByProject(projectId, params);
            setProject(res.project || null);
            setInsights(res.insights || []);
            setStats(res.stats || { total: 0, pinned: 0, filtered: 0 });
        } catch (err) {
            setErrorMsg(err.message || 'Failed to load project insights.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadInsights();
    }, [projectId, selectedCategory, showPinnedOnly, selectedTag]);

    const handleOpenCreate = (presetCategory = 'General Updates') => {
        setEditingInsight(null);
        setFormTitle('');
        setFormDescription('');
        setFormCategory(presetCategory);
        setFormTagsInput('');
        setFormIsPinned(false);
        setFormAttachmentUrl('');
        setFormAttachmentName('');
        setFormAttachmentType('');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (insight) => {
        setEditingInsight(insight);
        setFormTitle(insight.title || '');
        setFormDescription(insight.description || '');
        setFormCategory(insight.category || 'General Updates');
        setFormTagsInput(Array.isArray(insight.tags) ? insight.tags.join(', ') : '');
        setFormIsPinned(Boolean(insight.isPinned));
        setFormAttachmentUrl(insight.attachmentUrl || '');
        setFormAttachmentName(insight.attachmentName || '');
        setFormAttachmentType(insight.attachmentType || '');
        setIsModalOpen(true);
    };

    const handleSaveInsight = async (e) => {
        e.preventDefault();
        if (!formTitle.trim() || !formDescription.trim()) return;

        try {
            setIsSubmitting(true);
            const tags = formTagsInput
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);

            const payload = {
                title: formTitle.trim(),
                description: formDescription.trim(),
                category: formCategory,
                tags,
                isPinned: formIsPinned,
                attachmentUrl: formAttachmentUrl,
                attachmentName: formAttachmentName,
                attachmentType: formAttachmentType
            };

            if (editingInsight) {
                await insightApi.update(projectId, editingInsight._id, payload);
            } else {
                await insightApi.create(projectId, payload);
            }

            setIsModalOpen(false);
            setEditingInsight(null);
            await loadInsights();
        } catch (err) {
            alert(err.message || 'Failed to save insight');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTogglePin = async (insight) => {
        try {
            await insightApi.togglePin(projectId, insight._id);
            await loadInsights();
        } catch (err) {
            alert(err.message || 'Could not update pin status');
        }
    };

    const handleDeleteInsight = async (insight) => {
        if (!window.confirm(`Delete insight "${insight.title}"? This action cannot be undone.`)) {
            return;
        }
        try {
            await insightApi.delete(projectId, insight._id);
            await loadInsights();
        } catch (err) {
            alert(err.message || 'Failed to delete insight');
        }
    };

    const canModifyInsight = (insight) => {
        if (!currentUser) return false;
        if (currentUser.role === 'admin') return true;
        const currentUserId = (currentUser._id || currentUser.id)?.toString();
        const projectCreatorId = (project?.createdBy?._id || project?.createdBy)?.toString();
        if (projectCreatorId && projectCreatorId === currentUserId) return true;
        const authorId = (insight.createdBy?._id || insight.createdBy)?.toString();
        return authorId === currentUserId;
    };

    const getInitials = (name) => {
        if (!name) return 'TM';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Client-side instant search filter on top of loaded insights
    const visibleInsights = insights.filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            item.title?.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q) ||
            item.category?.toLowerCase().includes(q) ||
            item.authorName?.toLowerCase().includes(q) ||
            item.createdBy?.name?.toLowerCase().includes(q) ||
            item.attachmentName?.toLowerCase().includes(q) ||
            (item.tags || []).some((t) => t.toLowerCase().includes(q))
        );
    });

    // Collect all unique tags across insights for quick tag filter chips
    const allTags = Array.from(
        new Set(insights.flatMap((i) => (Array.isArray(i.tags) ? i.tags : [])))
    );

    const pinnedInsights = visibleInsights.filter((i) => i.isPinned);
    const regularInsights = visibleInsights.filter((i) => !i.isPinned);

    const renderInsightCard = (insight) => {
        const theme = CATEGORY_THEMES[insight.category] || {
            bg: '#F1F5F9',
            color: '#475569',
            border: '#E2E8F0',
            icon: FileText
        };
        const CategoryIcon = theme.icon;
        const authorName =
            insight.createdBy?.name || insight.authorName || 'Team Member';
        const authorDesignation =
            insight.createdBy?.designation ||
            (insight.createdBy?.role === 'admin' ? 'System Administrator' : 'Project Contributor');
        const canModify = canModifyInsight(insight);
        const wasEdited =
            insight.updatedAt &&
            insight.createdAt &&
            new Date(insight.updatedAt).getTime() - new Date(insight.createdAt).getTime() > 5000;

        const hasAttachment = Boolean(insight.attachmentUrl);
        const isImg = isImageAttachment(
            insight.attachmentUrl,
            insight.attachmentName,
            insight.attachmentType
        );

        return (
            <article
                key={insight._id}
                className={`insight-feed-card ${insight.isPinned ? 'pinned' : ''}`}
            >
                {/* Top Meta Row: Category Badge, Pin Status, Actions */}
                <div className="insight-card-top">
                    <div className="insight-badges-row">
                        <span
                            className="insight-category-pill"
                            style={{
                                backgroundColor: theme.bg,
                                color: theme.color,
                                borderColor: theme.border
                            }}
                        >
                            <CategoryIcon size={12} />
                            <span>{insight.category || 'General Updates'}</span>
                        </span>

                        {insight.isPinned && (
                            <span className="insight-pinned-badge">
                                <Pin size={11} style={{ transform: 'rotate(35deg)' }} />
                                <span>Pinned</span>
                            </span>
                        )}
                    </div>

                    <div className="insight-card-actions">
                        <button
                            type="button"
                            className={`insight-icon-btn ${insight.isPinned ? 'active-pin' : ''}`}
                            onClick={() => handleTogglePin(insight)}
                            title={insight.isPinned ? 'Unpin insight' : 'Pin insight to top'}
                        >
                            <Pin size={14} />
                        </button>

                        {canModify && (
                            <>
                                <button
                                    type="button"
                                    className="insight-icon-btn"
                                    onClick={() => handleOpenEdit(insight)}
                                    title="Edit insight"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    type="button"
                                    className="insight-icon-btn delete"
                                    onClick={() => handleDeleteInsight(insight)}
                                    title="Delete insight"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Title & Body */}
                <h3 className="insight-card-title">{insight.title}</h3>
                <div className="insight-card-body">{insight.description}</div>

                {/* Attachment Preview inside Insight Card */}
                {hasAttachment && (
                    <div className="insight-attachment-container">
                        {isImg ? (
                            <div
                                className="insight-image-attachment-box"
                                onClick={() =>
                                    setPreviewAttachment({
                                        title: insight.title,
                                        url: insight.attachmentUrl,
                                        name: insight.attachmentName || 'Insight Image',
                                        type: insight.attachmentType
                                    })
                                }
                                title="Click to view full image"
                            >
                                <img
                                    src={insight.attachmentUrl}
                                    alt={insight.attachmentName || insight.title}
                                    className="insight-attached-img"
                                />
                                <div className="insight-img-overlay-bar">
                                    <ImageIcon size={13} />
                                    <span>{insight.attachmentName || 'Attached Image'}</span>
                                    <ExternalLink size={12} style={{ marginLeft: 'auto' }} />
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="insight-file-attachment-card"
                                onClick={() =>
                                    setPreviewAttachment({
                                        title: insight.title,
                                        url: insight.attachmentUrl,
                                        name: insight.attachmentName || 'Attached Document',
                                        type: insight.attachmentType
                                    })
                                }
                            >
                                <div className="insight-file-icon-box">
                                    <Paperclip size={15} color="#2563EB" />
                                </div>
                                <div className="insight-file-meta">
                                    <span className="insight-file-name">
                                        {insight.attachmentName || 'View Attached Document'}
                                    </span>
                                    <span className="insight-file-sub">
                                        Tap to preview or download
                                    </span>
                                </div>
                                <ExternalLink size={14} color="#64748B" />
                            </button>
                        )}
                    </div>
                )}

                {/* Optional Tags */}
                {Array.isArray(insight.tags) && insight.tags.length > 0 && (
                    <div className="insight-tags-row">
                        {insight.tags.map((tag, idx) => (
                            <button
                                key={idx}
                                type="button"
                                className={`insight-tag-chip ${selectedTag === tag ? 'selected' : ''}`}
                                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                                title="Filter by this tag"
                            >
                                <Tag size={10} />
                                <span>{tag}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Footer: Author Info & Timestamp */}
                <div className="insight-card-footer">
                    <div className="insight-author-group">
                        <div className="insight-author-avatar">
                            {getInitials(authorName)}
                        </div>
                        <div className="insight-author-meta">
                            <span className="insight-author-name">{authorName}</span>
                            <span className="insight-author-role">{authorDesignation}</span>
                        </div>
                    </div>

                    <div className="insight-timestamp">
                        <Clock size={12} />
                        <span>{formatDateTimeIN(insight.createdAt)}</span>
                        {wasEdited && <span className="insight-edited-label">(Edited)</span>}
                    </div>
                </div>
            </article>
        );
    };

    return (
        <div className="project-module-page">
            {/* Project Module Switcher & Breadcrumbs */}
            <ProjectModuleNav
                project={project}
                projectId={projectId}
                activeModule="insights"
            />

            {/* Header Banner */}
            <div className="module-hero-header">
                <div className="module-hero-left">
                    <div className="module-hero-icon insights-icon-box">
                        <Lightbulb size={22} />
                    </div>
                    <div>
                        <div className="module-title-row">
                            <h1 className="module-main-title">Project Insights</h1>
                            {project?.title && (
                                <span className="module-project-badge">{project.title}</span>
                            )}
                        </div>
                        <p className="module-subtitle">
                            Document observations, share project updates, attach site photos or files, and pin critical notes.
                        </p>
                    </div>
                </div>

                <div className="module-hero-actions">
                    <div className="insight-mini-stats">
                        <div className="insight-mini-stat">
                            <span className="stat-num">{stats.total}</span>
                            <span className="stat-lbl">Total Posts</span>
                        </div>
                        <div className="insight-mini-stat">
                            <span className="stat-num">{stats.pinned}</span>
                            <span className="stat-lbl">Pinned</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="btn-primary-pill"
                        style={{ backgroundColor: '#2563EB' }}
                        onClick={() => handleOpenCreate('General Updates')}
                    >
                        <Plus size={16} />
                        <span>New Insight</span>
                    </button>
                </div>
            </div>

            {/* Quick Composer Prompt Bar (Social Feed / Digital Notebook Style) */}
            <div className="insight-quick-composer">
                <div className="composer-top-trigger" onClick={() => handleOpenCreate('General Updates')}>
                    <div className="insight-author-avatar">
                        {getInitials(currentUser?.name || 'User')}
                    </div>
                    <div className="composer-fake-input">
                        Share a project observation, update, learning, or attach a file for {project?.title || 'this project'}...
                    </div>
                    <button
                        type="button"
                        className="btn-primary-pill composer-post-btn"
                        style={{ backgroundColor: '#2563EB', padding: '7px 14px', fontSize: '12.5px' }}
                    >
                        <MessageSquarePlus size={15} />
                        <span>Post</span>
                    </button>
                </div>

                <div className="composer-category-shortcuts">
                    <span className="shortcuts-label">Quick Post:</span>
                    {INSIGHT_CATEGORIES.map((cat) => {
                        const theme = CATEGORY_THEMES[cat];
                        const Icon = theme.icon;
                        return (
                            <button
                                key={cat}
                                type="button"
                                className="composer-shortcut-pill"
                                onClick={() => handleOpenCreate(cat)}
                            >
                                <Icon size={12} color={theme.color} />
                                <span>{cat}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="insight-filters-toolbar">
                <div className="insight-category-tabs">
                    <button
                        type="button"
                        className={`insight-filter-tab ${selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('all')}
                    >
                        All Categories
                    </button>
                    {INSIGHT_CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            className={`insight-filter-tab ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="insight-search-controls">
                    <button
                        type="button"
                        className={`insight-pin-filter-btn ${showPinnedOnly ? 'active' : ''}`}
                        onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                        title="Show only pinned insights"
                    >
                        <Pin size={13} />
                        <span>Pinned Only</span>
                    </button>

                    <div className="tasks-search-box insight-search-wrapper">
                        <Search size={14} className="tasks-search-icon" />
                        <input
                            type="text"
                            placeholder="Search insights, tags, authors..."
                            className="tasks-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                style={{
                                    position: 'absolute',
                                    right: '8px',
                                    color: '#94A3B8',
                                    display: 'flex'
                                }}
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Active Tag Filter Banner */}
            {selectedTag && (
                <div className="active-filter-banner">
                    <Filter size={13} color="#2563EB" />
                    <span>Filtered by tag:</span>
                    <span className="insight-tag-chip selected">#{selectedTag}</span>
                    <button
                        type="button"
                        className="clear-filter-link"
                        onClick={() => setSelectedTag('')}
                    >
                        Clear tag filter
                    </button>
                </div>
            )}

            {/* Tag Cloud Filter Row (if tags exist) */}
            {allTags.length > 0 && !selectedTag && (
                <div className="insight-tags-filter-bar">
                    <span className="tags-bar-label">Popular Tags:</span>
                    {allTags.slice(0, 12).map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            className="insight-tag-chip"
                            onClick={() => setSelectedTag(tag)}
                        >
                            <Tag size={10} />
                            <span>{tag}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Main Insights Feed */}
            {isLoading ? (
                <div className="module-loading-state">
                    <Loader2 className="animate-spin" size={26} style={{ margin: '0 auto 10px' }} />
                    <p>Loading project insights...</p>
                </div>
            ) : errorMsg ? (
                <div className="tasks-empty-state" style={{ color: '#DC2626' }}>
                    <p>{errorMsg}</p>
                    <button
                        type="button"
                        className="btn-secondary"
                        style={{ marginTop: '12px' }}
                        onClick={() => navigate('/projects')}
                    >
                        Back to Projects
                    </button>
                </div>
            ) : visibleInsights.length === 0 ? (
                <div className="module-empty-state">
                    <div className="empty-state-icon-circle">
                        <Lightbulb size={26} color="#2563EB" />
                    </div>
                    <h3>
                        {stats.total === 0
                            ? 'No Insights Recorded Yet'
                            : 'No Insights Match Your Filters'}
                    </h3>
                    <p>
                        {stats.total === 0
                            ? 'Start documenting project observations, daily updates, key learnings, and important reminders with optional photo or document attachments.'
                            : 'Try clearing your search query or switching to "All Categories" to view all project posts.'}
                    </p>
                    {stats.total === 0 ? (
                        <button
                            type="button"
                            className="btn-primary-pill"
                            style={{ backgroundColor: '#2563EB', marginTop: '14px' }}
                            onClick={() => handleOpenCreate('General Updates')}
                        >
                            <Plus size={16} />
                            <span>Create First Insight Post</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn-secondary"
                            style={{ marginTop: '14px' }}
                            onClick={() => {
                                setSelectedCategory('all');
                                setShowPinnedOnly(false);
                                setSelectedTag('');
                                setSearchQuery('');
                            }}
                        >
                            Reset All Filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="insights-feed-container">
                    {pinnedInsights.length > 0 && (
                        <div className="insights-section-block">
                            <div className="insights-section-heading">
                                <Pin size={14} color="#EA580C" />
                                <span>Pinned Insights ({pinnedInsights.length})</span>
                            </div>
                            <div className="insights-cards-grid">
                                {pinnedInsights.map(renderInsightCard)}
                            </div>
                        </div>
                    )}

                    {regularInsights.length > 0 && (
                        <div className="insights-section-block">
                            {pinnedInsights.length > 0 && (
                                <div className="insights-section-heading">
                                    <Clock size={14} color="#64748B" />
                                    <span>Chronological Feed ({regularInsights.length})</span>
                                </div>
                            )}
                            <div className="insights-cards-grid">
                                {regularInsights.map(renderInsightCard)}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Create / Edit Insight Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div
                        className="modal-content"
                        style={{ maxWidth: '580px' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingInsight ? 'Edit Insight Post' : 'Create Project Insight'}
                            </h3>
                            <button
                                type="button"
                                className="btn-more-options"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSaveInsight}
                            style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
                        >
                            <div className="form-group">
                                <label className="form-label">Insight Title *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Week 3 Feed Efficiency Observation & Adjusting Ration"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="responsive-form-two-col">
                                <div className="form-group">
                                    <label className="form-label">Category *</label>
                                    <select
                                        className="form-select"
                                        value={formCategory}
                                        onChange={(e) => setFormCategory(e.target.value)}
                                    >
                                        {INSIGHT_CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Tags (comma-separated)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. milestone, nutrition, urgent"
                                        value={formTagsInput}
                                        onChange={(e) => setFormTagsInput(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Detailed Description / Notes *</label>
                                <textarea
                                    className="form-textarea"
                                    rows={5}
                                    placeholder="Document your observations, updates, learnings, or important reminders in detail..."
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Attachment Uploader for Insight (Photos, PDFs, Documents, or Link) */}
                            <AttachmentField
                                label="Insight Attachment (Photo, Document, PDF, or Link)"
                                attachmentUrl={formAttachmentUrl}
                                attachmentName={formAttachmentName}
                                onChange={({ url, name, type }) => {
                                    setFormAttachmentUrl(url);
                                    setFormAttachmentName(name);
                                    setFormAttachmentType(type || '');
                                }}
                            />

                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    color: '#334155',
                                    fontWeight: 500,
                                    userSelect: 'none'
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={formIsPinned}
                                    onChange={(e) => setFormIsPinned(e.target.checked)}
                                    style={{ width: '16px', height: '16px', accentColor: '#2563EB' }}
                                />
                                <span>Pin this insight to the top of the project feed</span>
                            </label>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary-pill"
                                    style={{ backgroundColor: '#2563EB' }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? 'Saving...'
                                        : editingInsight
                                        ? 'Update Insight'
                                        : 'Publish Insight'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Attachment Lightbox / Preview Modal */}
            <AttachmentPreviewModal
                attachment={previewAttachment}
                onClose={() => setPreviewAttachment(null)}
            />
        </div>
    );
}
