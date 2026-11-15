import RolePermission from '../models/rolePermission.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

class RolePermissionController {
    getAll = asyncHandler(async (req, res) => {
        const roles = await RolePermission.find().sort({ createdAt: 1 });
        res.status(200).json({
            success: true,
            count: roles.length,
            data: roles
        });
    });

    updateByRole = asyncHandler(async (req, res) => {
        const { role } = req.params;
        const { allow_create, allow_modify, allow_delete } = req.body;

        const updated = await RolePermission.findOneAndUpdate(
            { role },
            { allow_create, allow_modify, allow_delete },
            { new: true, runValidators: true }
        );

        if (!updated) {
            throw new AppError(`Role '${role}' not found.`, 404);
        }

        res.status(200).json({
            success: true,
            message: `Permissions updated for ${role}`,
            data: updated
        });
    });
}

export default new RolePermissionController();
