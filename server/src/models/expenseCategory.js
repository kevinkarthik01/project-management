import mongoose from 'mongoose';

const expenseCategorySchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, 'Category must belong to a project'],
            index: true
        },
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            maxlength: [80, 'Category name cannot exceed 80 characters']
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

expenseCategorySchema.index({ projectId: 1, name: 1 }, { unique: true });

const ExpenseCategory = mongoose.model('ExpenseCategory', expenseCategorySchema);
export default ExpenseCategory;

