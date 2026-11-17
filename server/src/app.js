import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import connectDB from './config/database.js';
import errorHandler from './middleware/error.middleware.js';

//menu functionality
import projectRoutes from './routes/project.routes.js';
import taskRoutes from './routes/task.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import rolePermissionRoutes from './routes/rolePermission.routes.js';

const app = express();

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Robust preflight OPTIONS interceptor for all endpoints
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.use(express.json({ limit: '25mb' }));

// Ensure MongoDB connection is ready on Vercel serverless cold starts
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        next(err);
    }
});

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Project Management Backend API is running successfully on Vercel',
        healthCheck: '/api/v1/health'
    });
});

app.get('/api/v1/health', (req, res) => {
    res.json({
        success: true,
        message: 'Project Management is running'
    })
})

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/roles-permissions', rolePermissionRoutes);
app.use(errorHandler)
export default app;