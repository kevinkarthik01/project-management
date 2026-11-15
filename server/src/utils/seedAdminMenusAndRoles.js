import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Menu from '../models/menu.js';
import Role from '../models/role.js';

dotenv.config();

const DEFAULT_MENUS = [
    {
        menuId: 'home',
        displayName: 'Home',
        desc: 'Overview dashboard and key operational metrics',
        componentName: 'Dashboard',
        displayOrder: 1,
        path: '/',
        icon: 'Home',
        isActive: true
    },
    {
        menuId: 'tasks',
        displayName: 'My Tasks',
        desc: 'Personal task assignments, priorities, and workflow',
        componentName: 'MyTasks',
        displayOrder: 2,
        path: '/tasks',
        icon: 'CheckSquare',
        isActive: true
    },
    {
        menuId: 'projects',
        displayName: 'Projects',
        desc: 'Project directory, team roster, and progress monitoring',
        componentName: 'Projects',
        displayOrder: 3,
        path: '/projects',
        icon: 'FolderKanban',
        isActive: true
    },
    {
        menuId: 'kanban',
        displayName: 'Kanban Desk',
        desc: 'Visual drag-and-drop task boards across workflow stages',
        componentName: 'PlaceholderPage',
        displayOrder: 4,
        path: '/kanban',
        icon: 'Kanban',
        isActive: true
    },
    {
        menuId: 'messages',
        displayName: 'Message',
        desc: 'Team discussions, direct messaging, and announcements',
        componentName: 'PlaceholderPage',
        displayOrder: 5,
        path: '/messages',
        icon: 'MessageSquare',
        isActive: true
    },
    {
        menuId: 'calendar',
        displayName: 'Calendar',
        desc: 'Sprint schedules, project deadlines, and milestone reviews',
        componentName: 'PlaceholderPage',
        displayOrder: 6,
        path: '/calendar',
        icon: 'Calendar',
        isActive: true
    },
    {
        menuId: 'notifications',
        displayName: 'Notifications',
        desc: 'System activity alerts, task updates, and mentions',
        componentName: 'PlaceholderPage',
        displayOrder: 7,
        path: '/notifications',
        icon: 'Bell',
        isActive: true
    }
];

const DEFAULT_ROLES = [
    {
        role: 'admin',
        displayName: 'System Administrator',
        desc: 'Full administrative access across all workspace tools, menus, and roles.',
        allow_create: true,
        allow_modify: true,
        allow_delete: true,
        allowedMenus: ['home', 'tasks', 'projects', 'kanban', 'messages', 'calendar', 'notifications'],
        isSystem: true
    },
    {
        role: 'tech',
        displayName: 'Technical Contributor',
        desc: 'Default contributor role with authority to create projects and work on assigned tasks.',
        allow_create: true,
        allow_modify: true,
        allow_delete: true,
        allowedMenus: ['home', 'tasks', 'projects', 'kanban', 'messages', 'calendar', 'notifications'],
        isSystem: true
    },
    {
        role: 'sub_role_creator',
        displayName: 'Project Creator',
        desc: 'Project-scoped sub-role granting project management permissions to its owner.',
        allow_create: true,
        allow_modify: true,
        allow_delete: true,
        allowedMenus: ['home', 'tasks', 'projects', 'kanban', 'messages', 'calendar', 'notifications'],
        isSystem: false
    }
];

export async function seedAdminMenusAndRoles() {
    try {
        console.log('Seeding menus into "menu" cluster...');
        for (const menuData of DEFAULT_MENUS) {
            await Menu.findOneAndUpdate(
                { menuId: menuData.menuId },
                { $set: menuData },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        console.log('Seeding roles into "roles" cluster...');
        for (const roleData of DEFAULT_ROLES) {
            await Role.findOneAndUpdate(
                { role: roleData.role },
                { $set: roleData },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        console.log('Seeding of "menu" and "roles" completed successfully.');
    } catch (err) {
        console.error('Error seeding menus and roles:', err);
    }
}

// Run standalone if invoked directly
(async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');
        await seedAdminMenusAndRoles();
        await mongoose.disconnect();
        console.log('Finished seeding.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
