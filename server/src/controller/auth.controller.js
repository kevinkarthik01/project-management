import authService from '../services/auth.service.js';
import asyncHandler from '../utils/asyncHandler.js';

class AuthController {

    register = asyncHandler(async (req, res) => {
        const result = await authService.register(req.body);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result
        });
    });

    login = asyncHandler(async (req, res) => {
        const { email, password, rememberMe } = req.body;
        const result = await authService.login(email, password, rememberMe);
        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            data: result
        });
    });

    resetPassword = asyncHandler(async (req, res) => {
        const { email, newPassword, confirmPassword } = req.body;
        const result = await authService.resetPassword({ email, newPassword, confirmPassword });
        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now log in with your new password.',
            data: result
        });
    });

    updatePassword = asyncHandler(async (req, res) => {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const result = await authService.updatePassword(req.user._id, currentPassword, newPassword, confirmPassword);
        res.status(200).json({
            success: true,
            message: 'Password updated successfully.',
            data: result
        });
    });

    logout = asyncHandler(async (req, res) => {
        const result = await authService.logout();
        res.status(200).json({
            success: true,
            message: 'User logged out successfully',
            data: result
        });
    });
}

export default new AuthController();