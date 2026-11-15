import mongoose from 'mongoose';

const rolePermissionSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            required: [true, 'Role name is required'],
            unique: true,
            trim: true
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
        }
    },
    {
        timestamps: true,
        collection: 'roles_permissions' // explicit collection name in MongoDB
    }
);

const RolePermission = mongoose.models.RolePermission || mongoose.model('RolePermission', rolePermissionSchema, 'roles_permissions');

export default RolePermission;
