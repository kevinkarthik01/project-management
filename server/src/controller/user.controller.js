import userRepository from '../repositories/user.repository.js';
import asyncHandler from '../utils/asyncHandler.js';

class UserController {
    getAllUsers = asyncHandler(async (req, res) => {
        const users = await userRepository.findAll();
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    });
}

export default new UserController();
