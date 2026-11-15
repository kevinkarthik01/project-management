import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
        console.log('MongoDB connected successfully');
        console.log(`Database: ${mongoose.connection.name}`);
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        throw error;
    }
};
/*
user = kevink_db_user
pass = YnJSZFAIeBciSUqu
compass = mongodb+srv://kevink_db_user:YnJSZFAIeBciSUqu@cluster0.9qr3yda.mongodb.net/
*/
export default connectDB;