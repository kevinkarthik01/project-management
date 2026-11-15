import userRepository from '../repositories/user.repository.js';
import jwt from 'jsonwebtoken'
import AppError from '../utils/AppError.js'

class AuthService {

    generateToken(id) {
        return jwt.sign({ id },
            process.env.JWT_SECRET || 'default-secret-key',
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        )
    }

    async register(userData) {
        const { name, email, password, role } = userData;

        const existinguser = await userRepository.findByEmail(email);

        if (existinguser) {
            throw new AppError('Email is already registered.', 400)
        }

        const user = await userRepository.create({ name, email, password, role })

        //remove password from return object
        user.password = undefined;
        const token = this.generateToken(user._id)

        return { user, token }
    }

    async login(email, password) {
        if (!email || !password) {
            throw new AppError("Please provide both email and password", 400)
        }

        const user = await userRepository.findByEmail(email);
        if (!user || !(await user.comparePassword(password))) {
            throw new AppError("Invalid email or password", 401)
        }
        user.password = undefined;
        const token = this.generateToken(user._id)
        return { user, token }
    }

    async logout() {
        return { message: 'Logged out successfully' };
    }
}

export default new AuthService();