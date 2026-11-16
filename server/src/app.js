import express from 'express'
import cors from 'cors'

import connectDB from './config/database.js'
import errorHandler from './middleware/error.middleware.js'

//menu functionality
import projectRoutes from './routes/project.routes.js'
import taskRoutes from './routes/task.routes.js'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import rolePermissionRoutes from './routes/rolePermission.routes.js'

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('/{*path}', cors());

app.use(express.json({ limit: '25mb' }))

// Ensure MongoDB connection is ready on Vercel serverless cold starts
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        next(err);
    }
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