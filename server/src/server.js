import 'dotenv/config';
import app from './app.js'
import connectDB from './config/database.js'
import { seedRolesPermissions } from './utils/seedRolesPermissions.js';

const startServer = async () => {
    try {
        await connectDB(); // first establish connection with database
        await seedRolesPermissions(); // ensure roles_permissions collection is initialized

        if (!process.env.VERCEL) {
            const port = process.env.PORT || 5000;
            app.listen(port, () => {
                console.log(`Server is running on port ${port}`);
            });
        }

    } catch (error) {
        console.error('Server failed to start:', error.message);
        if (!process.env.VERCEL) {
            process.exit(1);
        }
    }
};

startServer();

export default app;