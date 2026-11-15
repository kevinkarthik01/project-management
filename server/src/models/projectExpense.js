import mongoose from 'mongoose';

export const PREDEFINED_EXPENSE_CATEGORIES = [
    'Feeds',
    'Infrastructure',
    'Medical',
    'Labour / Manpower',
    'Transportation',
    'Maintenance',
    'Utilities',
    'Miscellaneous'
];

const projectExpenseSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, 'Expense must belong to a project'],
            index: true
        },
        title: {
            type: String,
            required: [true, 'Expense title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters']
        },
        amount: {
            type: Number,
            required: [true, 'Expense amount is required'],
            min: [0.01, 'Expense amount must be greater than zero']
        },
        category: {
            type: String,
            required: [true, 'Expense category is required'],
            trim: true,
            default: 'Miscellaneous'
        },
        expenseDate: {
            type: Date,
            required: [true, 'Expense date is required'],
            default: Date.now
        },
        description: {
            type: String,
            trim: true,
            default: ''
        },
        paidBy: {
            type: String,
            required: [true, 'Paid by field is required'],
            trim: true,
            maxlength: [100, 'Paid by cannot exceed 100 characters']
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

projectExpenseSchema.index({ projectId: 1, expenseDate: -1 });
projectExpenseSchema.index({ projectId: 1, category: 1 });

const ProjectExpense = mongoose.model('ProjectExpense', projectExpenseSchema);
export default ProjectExpense;

