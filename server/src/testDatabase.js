
import 'dotenv/config';
import mongoose from 'mongoose';

import connectDB from './config/database.js';
import ConnectionTest from './models/ConnectionTest.js';

try {
    await connectDB();

    const savedDocument = await ConnectionTest.create({
        message: 'My first Atlas database record'
    });

    console.log('Saved document:', savedDocument);

    const documents = await ConnectionTest.find();

    console.log('Retrieved documents:', documents);
} catch (error) {
    console.error('Database test failed:', error.message);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}