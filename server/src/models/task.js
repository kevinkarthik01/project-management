import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, 'Task must belong to a project'],
            index: true // Indexed for fast queries by projectId
        },
        title: {
            type: String,
            required: [true, 'Task title is required'],
            trim: true,
            maxlength: [150, 'Title cannot exceed 150 characters']
        },
        description: {
            type: String,
            trim: true,
            default: ''
        },
        status: {
            type: String,
            enum: ['todo', 'in_progress', 'completed'],
            default: 'todo'
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        },
        tags: {
            type: [String],
            default: []
        },
        assignee: {
            type: String,
            default: 'SK'
        },
        dueDate: {
            type: Date
        },
        visibility: {
            type: String,
            enum: ['public', 'private'],
            default: 'public'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

const Task = mongoose.model('Task', taskSchema);
export default Task;