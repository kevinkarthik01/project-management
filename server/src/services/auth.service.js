import userRepository from '../repositories/user.repository.js';
import jwt from 'jsonwebtoken'
import AppError from '../utils/AppError.js'

class AuthService {

    generateToken(id, rememberMe = false) {
        const expiresIn = rememberMe ? '30d' : (process.env.JWT_EXPIRES_IN || '1d');
        return jwt.sign({ id },
            process.env.JWT_SECRET || 'impactory_default_jwt_secret_key_2026',
            { expiresIn }
        );
    }

    async register(userData) {
        const { name, email, password, role } = userData;

        const existinguser = await userRepository.findByEmail(email);

        if (existinguser) {
            throw new AppError('Email is already registered.', 400);
        }

        const user = await userRepository.create({ name, email, password, role });

        //remove password from return object
        user.password = undefined;
        const token = this.generateToken(user._id);

        return { user, token };
    }

    async login(email, password, rememberMe = false) {
        if (!email || !password) {
            throw new AppError("Please provide both email and password", 400);
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await userRepository.findByEmail(normalizedEmail);
        if (!user || !(await user.comparePassword(password))) {
            throw new AppError("Invalid email or password", 401);
        }
        user.password = undefined;
        const token = this.generateToken(user._id, rememberMe);
        return { user, token, rememberMe: Boolean(rememberMe) };
    }

    async resetPassword({ email, newPassword, confirmPassword }) {
        if (!email || !newPassword) {
            throw new AppError("Please provide both email and new password", 400);
        }

        if (confirmPassword && newPassword !== confirmPassword) {
            throw new AppError("New password and confirmation password do not match", 400);
        }

        if (newPassword.length < 6) {
            throw new AppError("New password must be at least 6 characters long", 400);
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await userRepository.findByEmail(normalizedEmail);
        if (!user) {
            throw new AppError("No account found with this email address", 404);
        }

        user.password = newPassword;
        await user.save();

        return {
            email: user.email,
            message: "Password has been reset successfully"
        };
    }

    async updatePassword(userId, currentPassword, newPassword, confirmPassword) {
        if (!currentPassword || !newPassword) {
            throw new AppError("Please provide both current and new passwords", 400);
        }

        if (confirmPassword && newPassword !== confirmPassword) {
            throw new AppError("New password and confirmation password do not match", 400);
        }

        if (newPassword.length < 6) {
            throw new AppError("New password must be at least 6 characters long", 400);
        }

        const user = await userRepository.findByIdWithPassword(userId);
        if (!user) {
            throw new AppError("User account not found", 404);
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            throw new AppError("Current password is incorrect", 400);
        }

        user.password = newPassword;
        await user.save();

        user.password = undefined;
        const token = this.generateToken(user._id);
        return { user, token };
    }

    async logout() {
        return { message: 'Logged out successfully' };
    }
}

export default new AuthService();