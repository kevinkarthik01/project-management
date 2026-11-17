import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
    LogIn,
    UserPlus,
    Lock,
    Mail,
    User,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Eye,
    EyeOff,
    KeyRound
} from 'lucide-react';
import '../styles/auth.css';

export default function Login() {
    // Mode can be 'login', 'register', or 'reset'
    const [authMode, setAuthMode] = useState('login');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const { login, register, resetPassword, loading } = useAuth();
    const navigate = useNavigate();

    // Check for remembered email on component mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('impactory_remember_email');
        if (savedEmail) {
            setFormData((prev) => ({ ...prev, email: savedEmail }));
            setRememberMe(true);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) setError('');
        if (successMsg) setSuccessMsg('');
    };

    const handleModeSwitch = (mode) => {
        setAuthMode(mode);
        setError('');
        setSuccessMsg('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        try {
            if (authMode === 'register') {
                if (!formData.name.trim()) throw new Error('Please enter your full name');
                if (!formData.email.trim()) throw new Error('Please enter your work email');
                if (formData.password.length < 6) throw new Error('Password must be at least 6 characters');

                await register(formData.name.trim(), formData.email.trim(), formData.password);
                navigate('/dashboard');
            } else if (authMode === 'login') {
                if (!formData.email.trim() || !formData.password) {
                    throw new Error('Please enter both email and password');
                }

                await login(formData.email.trim(), formData.password, rememberMe);
                navigate('/dashboard');
            } else if (authMode === 'reset') {
                if (!formData.email.trim()) throw new Error('Please enter your registered email address');
                if (!formData.newPassword) throw new Error('Please enter your new password');
                if (formData.newPassword.length < 6) throw new Error('New password must be at least 6 characters long');
                if (formData.newPassword !== formData.confirmPassword) {
                    throw new Error('New password and confirm password do not match');
                }

                const res = await resetPassword(
                    formData.email.trim(),
                    formData.newPassword,
                    formData.confirmPassword
                );

                setSuccessMsg(res?.message || 'Password reset successfully! You can now sign in.');
                // Clear password fields and switch back to login mode after brief delay
                setFormData((prev) => ({
                    ...prev,
                    password: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
                setTimeout(() => {
                    setAuthMode('login');
                }, 2000);
            }
        } catch (err) {
            setError(err.message || 'Authentication failed. Please check your credentials and try again.');
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
                        {authMode === 'register' && 'Create an Impactory account'}
                        {authMode === 'login' && 'Welcome back to Impactory'}
                        {authMode === 'reset' && 'Reset Your Password'}
                    </h1>
                    <p className="auth-subtitle">
                        {authMode === 'register' && 'Start managing projects and team tasks seamlessly'}
                        {authMode === 'login' && 'Enter your credentials to access your workspace'}
                        {authMode === 'reset' && 'Enter your registered email and choose a new password'}
                    </p>
                </div>

                {/* Mode Toggle Tabs (Shown only for Login and Register) */}
                {authMode !== 'reset' ? (
                    <div className="auth-tabs">
                        <button
                            type="button"
                            className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
                            onClick={() => handleModeSwitch('login')}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
                            onClick={() => handleModeSwitch('register')}
                        >
                            Create Account
                        </button>
                    </div>
                ) : (
                    <div style={{ marginBottom: '20px' }}>
                        <button
                            type="button"
                            onClick={() => handleModeSwitch('login')}
                            className="auth-back-btn"
                        >
                            <ArrowLeft size={16} />
                            <span>Back to Sign In</span>
                        </button>
                    </div>
                )}

                {/* Success Notification */}
                {successMsg && (
                    <div className="auth-success-alert">
                        <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* Error Notification */}
                {error && (
                    <div className="auth-error-alert">
                        <AlertCircle size={18} style={{ flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Main Auth Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Full Name (Registration only) */}
                    {authMode === 'register' && (
                        <div className="auth-field-group">
                            <label className="auth-label">Full Name</label>
                            <div className="auth-input-wrapper">
                                <User size={18} className="auth-input-icon" />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Alex Johnson"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required={authMode === 'register'}
                                    className="auth-input"
                                />
                            </div>
                        </div>
                    )}

                    {/* Email Field (All modes) */}
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

                    {/* Password Field (Login & Register modes) */}
                    {authMode !== 'reset' && (
                        <div className="auth-field-group">
                            <label className="auth-label">Password</label>
                            <div className="auth-input-wrapper">
                                <Lock size={18} className="auth-input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="auth-input"
                                />
                                <button
                                    type="button"
                                    className="auth-eye-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* New Password & Confirm Password (Reset mode only) */}
                    {authMode === 'reset' && (
                        <>
                            <div className="auth-field-group">
                                <label className="auth-label">New Password</label>
                                <div className="auth-input-wrapper">
                                    <KeyRound size={18} className="auth-input-icon" />
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        name="newPassword"
                                        placeholder="At least 6 characters"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        className="auth-input"
                                    />
                                    <button
                                        type="button"
                                        className="auth-eye-btn"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        title={showNewPassword ? 'Hide password' : 'Show password'}
                                        tabIndex={-1}
                                    >
                                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="auth-field-group">
                                <label className="auth-label">Confirm New Password</label>
                                <div className="auth-input-wrapper">
                                    <Lock size={18} className="auth-input-icon" />
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        placeholder="Re-enter your new password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        className="auth-input"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Remember Me & Forgot Password Row (Sign In mode only) */}
                    {authMode === 'login' && (
                        <div className="auth-remember-row">
                            <label className="auth-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="auth-checkbox"
                                />
                                <span>Remember me</span>
                            </label>

                            <button
                                type="button"
                                onClick={() => handleModeSwitch('reset')}
                                className="auth-forgot-link"
                            >
                                Forgot password?
                            </button>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-submit-btn"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <span>
                                    {authMode === 'register' && 'Create Account'}
                                    {authMode === 'login' && 'Sign In'}
                                    {authMode === 'reset' && 'Reset Password'}
                                </span>
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
