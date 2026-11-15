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
        const { email, password } = req.body;
        const result = await authService.login(email, password)
        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            data: result
        })
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