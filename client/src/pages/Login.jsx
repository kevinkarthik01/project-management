import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LogIn, UserPlus, Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';
import '../styles/auth.css';

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const { login, register, loading } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isRegister) {
                if (!formData.name.trim()) throw new Error('Please enter your name');
                if (!formData.email.trim()) throw new Error('Please enter your email');
                if (formData.password.length < 6) throw new Error('Password must be at least 6 characters');

                await register(formData.name, formData.email, formData.password);
            } else {
                if (!formData.email.trim() || !formData.password) {
                    throw new Error('Please enter both email and password');
                }
                await login(formData.email, formData.password);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Authentication failed. Please try again.');
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-card">
                {/* Brand Header */}
                <div className="auth-header">
                    <img
                        src="/logo.png"
                        alt="Impactory Logo"
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            objectFit: 'cover',
                            marginBottom: '16px',
                            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)'
                        }}
                    />
                    <h1 className="auth-title">
                        {isRegister ? 'Create an Impactory account' : 'Welcome back to Impactory'}
                    </h1>
                    <p className="auth-subtitle">
                        {isRegister ? 'Start managing projects and team tasks' : 'Enter your credentials to access your workspace'}
                    </p>
                </div>

                {/* Mode Toggle Tabs */}
                <div className="auth-tabs">
                    <button
                        type="button"
                        className={`auth-tab-btn ${!isRegister ? 'active' : ''}`}
                        onClick={() => { setIsRegister(false); setError(''); }}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        className={`auth-tab-btn ${isRegister ? 'active' : ''}`}
                        onClick={() => { setIsRegister(true); setError(''); }}
                    >
                        Create Account
                    </button>
                </div>

                {/* Error Notification */}
                {error && (
                    <div className="auth-error-alert">
                        <AlertCircle size={18} style={{ flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    {isRegister && (
                        <div className="auth-field-group">
                            <label className="auth-label">Full Name</label>
                            <div className="auth-input-wrapper">
                                <User size={18} className="auth-input-icon" />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Jane Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required={isRegister}
                                    className="auth-input"
                                />
                            </div>
                        </div>
                    )}

                    <div className="auth-field-group">
                        <label className="auth-label">Work Email</label>
                        <div className="auth-input-wrapper">
                            <Mail size={18} className="auth-input-icon" />
                            <input
                                type="email"
                                name="email"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="auth-input"
                            />
                        </div>
                    </div>

                    <div className="auth-field-group">
                        <label className="auth-label">Password</label>
                        <div className="auth-input-wrapper">
                            <Lock size={18} className="auth-input-icon" />
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="auth-input"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-submit-btn"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
