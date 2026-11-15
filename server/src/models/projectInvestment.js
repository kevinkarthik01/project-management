import mongoose from 'mongoose';

const projectInvestmentSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, 'Investment must belong to a project'],
            index: true
        },
        title: {
            type: String,
            required: [true, 'Investment title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters']
        },
        amount: {
            type: Number,
            required: [true, 'Investment amount is required'],
            min: [0.01, 'Investment amount must be greater than zero']
        },
        investmentDate: {
            type: Date,
            required: [true, 'Investment date is required'],
            default: Date.now
        },
        investedBy: {
            type: String,
            required: [true, 'Invested by field is required'],
            trim: true,
            maxlength: [100, 'Investor name cannot exceed 100 characters']
        },
        description: {
            type: String,
            trim: true,
            default: ''
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
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

projectInvestmentSchema.index({ projectId: 1, investmentDate: -1 });

const ProjectInvestment = mongoose.model('ProjectInvestment', projectInvestmentSchema);
export default ProjectInvestment;

