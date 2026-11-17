import mongoose from 'mongoose';
import argon2 from 'argon2'

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxLength: [50, 'Name cannot exceed 50 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address'
            ]
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false // Exclude password from query results by default
        },
        role: {
            type: String,
            enum: ['admin', 'tech', 'user', 'member', 'manager', 'sub_role_creator'],
            default: 'tech',
            lowercase: true,
            trim: true
        },
        designation: {
            type: String,
            trim: true,
            default: "Team Member"
        }
    },
    {
        timestamps: true
    }
);
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await argon2.hash(this.password);
})
userSchema.methods.comparePassword = async function (candidatepassword) {
    return await argon2.verify(this.password, candidatepassword)
}

const User = mongoose.models.User || mongoose.models.user || mongoose.model('User', userSchema);
if (!mongoose.models.user) {
    try {
        mongoose.model('user', userSchema);
    } catch (e) {
        // already registered
    }
}
export default User;