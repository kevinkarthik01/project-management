import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema(
    {
        menuId: {
            type: String,
            required: [true, 'Menu ID is required'],
            unique: true,
            trim: true,
            lowercase: true
        },
        displayName: {
            type: String,
            required: [true, 'Display name is required'],
            trim: true,
            maxlength: [100, 'Display name cannot exceed 100 characters']
        },
        desc: {
            type: String,
            trim: true,
            default: ''
        },
        componentName: {
            type: String,
            required: [true, 'Component name is required'],
            trim: true
        },
        createdDate: {
            type: Date,
            default: Date.now
        },
        displayOrder: {
            type: Number,
            required: [true, 'Display order is required'],
            unique: true
        },
        path: {
            type: String,
            trim: true,
            default: '/'
        },
        icon: {
            type: String,
            trim: true,
            default: 'FolderKanban'
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        collection: 'menu' // Explicit collection name requested: 'menu'
    }
);

const Menu = mongoose.models.Menu || mongoose.model('Menu', menuSchema, 'menu');

export default Menu;
