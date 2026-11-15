import jwt from 'jsonwebtoken';
import user from '../models/user.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Protect routes: verifies JWT and attaches current user to req.user
export const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new AppError('You are not logged in. Please log in to get access.', 401)
    }

    //verify token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'impactory_default_secret_key')
    } catch (err) {
        throw new AppError('Invalid or expired session. Please login in again.', 401)
    }

    //check if user still exsists
    const currentUser = await user.findById(decoded.id);
    if (!currentUser) {
        throw new AppError('The user belonging to this token no longer exists', 401)
    }

    //attach current user to req.user
    req.user = currentUser;
    next();
});

//Role restriction guard
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new AppError('You do not have permission to perform this action', 403);
        }
        next();
    };
};