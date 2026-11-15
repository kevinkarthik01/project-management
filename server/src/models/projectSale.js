import mongoose from 'mongoose';

const projectSaleSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, 'Sale must belong to a project'],
            index: true
        },
        productName: {
            type: String,
            required: [true, 'Product/item sold is required'],
            trim: true,
            maxlength: [200, 'Product name cannot exceed 200 characters']
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [0.01, 'Quantity must be greater than zero']
        },
        saleDate: {
            type: Date,
            required: [true, 'Sale date is required'],
            default: Date.now
        },
        unitPrice: {
            type: Number,
            required: [true, 'Sale price per unit is required'],
            min: [0, 'Sale price per unit cannot be negative']
        },
        totalAmount: {
            type: Number,
            required: true,
            min: [0, 'Total sale amount cannot be negative']
        },
        customerName: {
            type: String,
            trim: true,
            default: '',
            maxlength: [150, 'Customer name cannot exceed 150 characters']
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

// Automatically calculate totalAmount = quantity * unitPrice before validation
projectSaleSchema.pre('validate', function () {
    const qty = Number(this.quantity);
    const price = Number(this.unitPrice);
    if (!isNaN(qty) && !isNaN(price)) {
        this.totalAmount = Number((qty * price).toFixed(2));
    }
});

projectSaleSchema.index({ projectId: 1, saleDate: -1 });

const ProjectSale = mongoose.model('ProjectSale', projectSaleSchema);
export default ProjectSale;

