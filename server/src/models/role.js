import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            required: [true, 'Role identifier is required'],
            unique: true,
            trim: true,
            lowercase: true
        },
        displayName: {
            type: String,
            required: [true, 'Display name is required'],
            trim: true
        },
        desc: {
            type: String,
            trim: true,
            default: ''
        },
        allow_create: {
            type: Boolean,
            default: true
        },
        allow_modify: {
            type: Boolean,
            default: true
        },
        allow_delete: {
            type: Boolean,
            default: true
        },
        allowedMenus: {
            type: [String],
            default: []
        },
        isSystem: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        collection: 'roles' // Explicit collection name requested: 'roles'
    }
);

const Role = mongoose.models.Role || mongoose.model('Role', roleSchema, 'roles');

export default Role;
