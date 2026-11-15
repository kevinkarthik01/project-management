import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Project title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters']
        },
        description: {
            type: String,
            trim: true,
            default: ''
        },
        status: {
            type: String,
            enum: ['In Progress', 'Completed', 'On Hold', 'Overdue'],
            default: 'In Progress'
        },
        priority: {
            type: String,
            default: 'Medium'
        },
        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        deadline: {
            type: Date
        },
        subtasksCount: {
            type: Number,
            default: 0
        },
        activitiesCount: {
            type: Number,
            default: 0
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true // Automatically gives createdAt and updatedAt
    }
);

const Project = mongoose.model('Project', projectSchema);

export default Project;
