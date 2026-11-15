
import mongoose from 'mongoose';

const connectionTestSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ConnectionTest = mongoose.model(
    'ConnectionTest',
    connectionTestSchema
);

export default ConnectionTest;