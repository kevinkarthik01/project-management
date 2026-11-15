import mongoose from 'mongoose';

export const DEFAULT_INSIGHT_CATEGORIES = [
    'General Updates',
    'Observations',
    'Important Notes',
    'Learnings',
    'Issues & Challenges',
    'Ideas & Improvements'
];

const projectInsightSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, 'Insight must belong to a project'],
            index: true
        },
        title: {
            type: String,
            required: [true, 'Insight title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters']
        },
        description: {
            type: String,
            required: [true, 'Insight description is required'],
            trim: true
        },
        category: {
            type: String,
            trim: true,
            default: 'General Updates'
        },
        tags: {
            type: [String],
            default: []
        },
        isPinned: {
            type: Boolean,
            default: false,
            index: true
        },
        attachmentUrl: {
            type: String,
            trim: true,
            default: ''
        },
        attachmentName: {
            type: String,
            trim: true,
            default: ''
        },
        attachmentType: {
            type: String,
            trim: true,
            default: ''
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        authorName: {
            type: String,
            trim: true,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

projectInsightSchema.index({ projectId: 1, isPinned: -1, createdAt: -1 });

const ProjectInsight = mongoose.model('ProjectInsight', projectInsightSchema);
export default ProjectInsight;

