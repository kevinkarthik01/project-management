import RolePermission from '../models/rolePermission.js';

export const seedRolesPermissions = async () => {
    try {
        const defaultRoles = [
            {
                role: 'admin',
                allow_create: true,
                allow_modify: true,
                allow_delete: true
            },
            {
                role: 'tech',
                allow_create: true,
                allow_modify: true,
                allow_delete: true
            },
            {
                role: 'sub_role_creator',
                allow_create: true,
                allow_modify: true,
                allow_delete: true
            }
        ];

        for (const item of defaultRoles) {
            await RolePermission.findOneAndUpdate(
                { role: item.role },
                {
                    $setOnInsert: {
                        allow_create: item.allow_create,
                        allow_modify: item.allow_modify,
                        allow_delete: item.allow_delete
                    }
                },
                { upsert: true, new: true }
            );
        }

        const count = await RolePermission.countDocuments();
        console.log(`[RBAC] 'roles_permissions' collection initialized with ${count} roles.`);
    } catch (err) {
        console.error('[RBAC] Error initializing roles_permissions collection:', err.message);
    }
};

export default seedRolesPermissions;
