import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(false);

    const login = async (email, password, rememberMe = false) => {
        setLoading(true);
        try {
            const data = await authApi.login({ email, password, rememberMe });
            setUser(data.user);
            setToken(data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            if (rememberMe) {
                localStorage.setItem('impactory_remember_email', email.trim());
            } else {
                localStorage.removeItem('impactory_remember_email');
            }
            return data;
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        setLoading(true);
        try {
            const data = await authApi.register({ name, email, password });
            setUser(data.user);
            setToken(data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            return data;
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (email, newPassword, confirmPassword) => {
        setLoading(true);
        try {
            const data = await authApi.resetPassword({ email, newPassword, confirmPassword });
            return data;
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async (currentPassword, newPassword, confirmPassword) => {
        setLoading(true);
        try {
            const data = await authApi.updatePassword({ currentPassword, newPassword, confirmPassword });
            if (data?.data?.user) {
                setUser(data.data.user);
                localStorage.setItem('user', JSON.stringify(data.data.user));
            }
            if (data?.data?.token) {
                setToken(data.data.token);
                localStorage.setItem('token', data.data.token);
            }
            return data;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: Boolean(token && user),
                loading,
                login,
                register,
                resetPassword,
                updatePassword,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
