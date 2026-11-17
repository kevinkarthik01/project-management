import User from '../models/user.js';


class UserRepository {
    async create(userData) {
        return await User.create(userData)
    }

    async findByEmail(email) {
        return await User.findOne({ email }).select('+password');
    }

    async findById(id) {
        return await User.findById(id);
    }

    async findByIdWithPassword(id) {
        return await User.findById(id).select('+password');
    }

    async findAll(filter = {}) {
        return await User.find(filter).select('-password');
    }
}

export default new UserRepository();