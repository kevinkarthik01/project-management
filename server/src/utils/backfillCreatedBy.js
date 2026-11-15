import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../models/project.js';
import User from '../models/user.js';

dotenv.config();

async function backfill() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ email: 'admin@gmail.com' });
    if (!admin) {
      console.error('Admin user not found');
      process.exit(1);
    }

    const filter = {
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: null }
      ]
    };

    const result = await Project.updateMany(filter, {
      $set: { createdBy: admin._id }
    });

    console.log('Backfill result:', result);

    const projects = await Project.find({}).populate('createdBy', 'name email role').lean();
    projects.forEach(p => {
      console.log(`Project: "${p.title}" -> Created by: ${p.createdBy?.name} (${p.createdBy?.email})`);
    });

    await mongoose.disconnect();
    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error('Error during backfill:', err);
    process.exit(1);
  }
}

backfill();
