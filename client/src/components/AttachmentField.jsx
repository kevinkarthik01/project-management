import React, { useRef, useState } from 'react';
import {
    Paperclip,
    UploadCloud,
    FileText,
    Image as ImageIcon,
    X,
    ExternalLink,
    Download,
    Link as LinkIcon
} from 'lucide-react';

export function isImageAttachment(url = '', name = '', type = '') {
    if (!url) return false;
    if (type && type.startsWith('image/')) return true;
    if (url.startsWith('data:image/')) return true;
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(name || url);
}

export function AttachmentField({
    label = 'Attachment / Receipt (Optional)',
    attachmentUrl,
    attachmentName,
    onChange,
    maxSizeMB = 8
}) {
    const fileInputRef = useRef(null);
    const [mode, setMode] = useState('file'); // 'file' | 'link'
    const [isDragging, setIsDragging] = useState(false);

    const processFile = (file) => {
        if (!file) return;
        if (file.size > maxSizeMB * 1024 * 1024) {
            alert(`Attachment must be smaller than ${maxSizeMB} MB.`);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            onChange({
                url: String(reader.result),
                name: file.name,
                type: file.type || ''
            });
        };
        reader.readAsDataURL(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        processFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        processFile(file);
    };

    const handleClear = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onChange({ url: '', name: '', type: '' });
    };

    const isImg = isImageAttachment(attachmentUrl, attachmentName);

    return (
        <div className="form-group">
            <div className="attachment-label-row">
                <label className="form-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Paperclip size={13} color="#2563EB" />
                    <span>{label}</span>
                </label>

                <div className="attachment-mode-toggle">
                    <button
                        type="button"
                        className={`att-mode-btn ${mode === 'file' ? 'active' : ''}`}
                        onClick={() => setMode('file')}
                    >
                        <UploadCloud size={12} />
                        <span>Upload File</span>
                    </button>
                    <button
                        type="button"
                        className={`att-mode-btn ${mode === 'link' ? 'active' : ''}`}
                        onClick={() => setMode('link')}
                    >
                        <LinkIcon size={12} />
                        <span>Paste Link</span>
                    </button>
                </div>
            </div>

            {mode === 'file' ? (
                <div
                    className={`attachment-dropzone ${isDragging ? 'dragging' : ''} ${
                        attachmentUrl ? 'has-file' : ''
                    }`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => !attachmentUrl && fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />

                    {!attachmentUrl ? (
                        <div className="dropzone-empty-content">
                            <div className="dropzone-icon-circle">
                                <UploadCloud size={18} color="#2563EB" />
                            </div>
                            <div className="dropzone-text-col">
                                <span className="dropzone-primary-text">
                                    Tap to upload photo, receipt, or document
                                </span>
                                <span className="dropzone-sub-text">
                                    Supports JPG, PNG, PDF, DOC, XLS (Max {maxSizeMB}MB)
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="dropzone-preview-row" onClick={(e) => e.stopPropagation()}>
                            {isImg ? (
                                <img
                                    src={attachmentUrl}
                                    alt={attachmentName || 'Attachment'}
                                    className="dropzone-thumb-img"
                                />
                            ) : (
                                <div className="dropzone-file-badge">
                                    <FileText size={20} color="#2563EB" />
                                </div>
                            )}

                            <div className="dropzone-file-info">
                                <span className="dropzone-file-name">
                                    {attachmentName || 'Attached File'}
                                </span>
                                <span className="dropzone-file-status">Ready to save</span>
                            </div>

                            <div className="dropzone-file-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    style={{ padding: '5px 10px', fontSize: '11.5px' }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Change
                                </button>
                                <button
                                    type="button"
                                    className="insight-icon-btn delete"
                                    onClick={handleClear}
                                    title="Remove attachment"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="attachment-link-inputs">
                    <input
                        type="url"
                        className="form-input"
                        placeholder="https://drive.google.com/... or receipt URL"
                        value={attachmentUrl?.startsWith('data:') ? '' : attachmentUrl || ''}
                        onChange={(e) =>
                            onChange({
                                url: e.target.value,
                                name: attachmentName || 'External Attachment',
                                type: 'link'
                            })
                        }
                    />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Attachment label (e.g. Invoice #104, Site Photo)"
                        value={attachmentName || ''}
                        onChange={(e) =>
                            onChange({
                                url: attachmentUrl || '',
                                name: e.target.value,
                                type: 'link'
                            })
                        }
                    />
                </div>
            )}
        </div>
    );
}

export function AttachmentPreviewModal({ attachment, onClose }) {
    if (!attachment || !attachment.url) return null;

    const isImg = isImageAttachment(attachment.url, attachment.name, attachment.type);
    const isPdf =
        attachment.url.startsWith('data:application/pdf') ||
        /\.pdf(\?.*)?$/i.test(attachment.name || attachment.url);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content attachment-preview-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 className="modal-title" style={{ wordBreak: 'break-word' }}>
                            {attachment.title || attachment.name || 'Attachment Preview'}
                        </h3>
                        {attachment.name && attachment.title && (
                            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                                {attachment.name}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        className="btn-more-options"
                        onClick={onClose}
                        aria-label="Close preview"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="attachment-preview-body">
                    {isImg ? (
                        <img
                            src={attachment.url}
                            alt={attachment.name || 'Attachment'}
                            className="attachment-preview-full-img"
                        />
                    ) : isPdf ? (
                        <iframe
                            src={attachment.url}
                            title={attachment.name || 'PDF Preview'}
                            className="attachment-preview-pdf"
                        />
                    ) : (
                        <div className="attachment-generic-box">
                            <FileText size={40} color="#2563EB" />
                            <p style={{ fontWeight: 600, color: '#0F172A', marginTop: '8px' }}>
                                {attachment.name || 'Attached Document'}
                            </p>
                            <p style={{ fontSize: '12.5px', color: '#64748B' }}>
                                Click below to open or download this file on your device.
                            </p>
                        </div>
                    )}
                </div>

                <div className="modal-actions" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <button type="button" className="btn-secondary" onClick={onClose}>
                        Close
                    </button>
                    <a
                        href={attachment.url}
                        download={attachment.name || 'attachment'}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary-pill"
                        style={{ backgroundColor: '#2563EB', textDecoration: 'none' }}
                    >
                        {attachment.url.startsWith('data:') ? (
                            <>
                                <Download size={15} />
                                <span>Download File</span>
                            </>
                        ) : (
                            <>
                                <ExternalLink size={15} />
                                <span>Open Attachment</span>
                            </>
                        )}
                    </a>
                </div>
            </div>
        </div>
    );
}

