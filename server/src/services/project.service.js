import projectRepository from "../repositories/project.repository.js";
import AppError from "../utils/AppError.js";

class ProjectService {
    async createProject(data, user) {
        if (data.progress === 100 && !data.status) {
            data.status = 'Completed'
        }
        if (user) {
            data.createdBy = user._id;
        }
        return await projectRepository.create(data);
    }

    async getAllProjects(user) {
        // If tech role, only return projects they are a member of or created
        if (user && user.role === 'tech') {
            return await projectRepository.findAll({
                $or: [{ members: user._id }, { createdBy: user._id }]
            });
        }
        return await projectRepository.findAll();
    }

    async getProjectById(id) {
        const project = await projectRepository.findById(id);
        if (!project) {
            /* const error = new Error('Project not found')
             error.statusCode = 404
             throw error;*/
            throw new AppError("Project not found", 404);
        }
        return project;
    }

    async updateProject(id, data, user) {
        const existingProject = await projectRepository.findById(id);
        if (!existingProject) {
            throw new AppError('Project not found', 404);
        }

        // Sub-Role Authorization: Only the Project Creator or an Admin can edit project details
        if (user) {
            const creatorId = existingProject.createdBy?._id?.toString() || existingProject.createdBy?.toString();
            const isCreator = creatorId && creatorId === user._id?.toString();
            const isAdmin = user.role === 'admin';

            if (!isCreator && !isAdmin) {
                throw new AppError('Permission denied: Only the project creator or an admin can modify this project.', 403);
            }
        }

        // Prevent modification of original project owner
        delete data.createdBy;

        if (data.progress === 100 && !data.status) {
            data.status = 'Completed';
        } else if (data.progress !== undefined && data.progress < 100 && !data.status) {
            data.status = 'In Progress';
        }

        const updateProject = await projectRepository.update(id, data);
        if (!updateProject) {
            throw new AppError('Project not found', 404);
        }
        return updateProject;
    }

    async deleteProject(id, user) {
        const existingProject = await projectRepository.findById(id);
        if (!existingProject) {
            throw new AppError('Project not found', 404);
        }

        // Sub-Role Authorization: Only the Project Creator or an Admin can delete a project
        if (user) {
            const creatorId = existingProject.createdBy?._id?.toString() || existingProject.createdBy?.toString();
            const isCreator = creatorId && creatorId === user._id?.toString();
            const isAdmin = user.role === 'admin';

            if (!isCreator && !isAdmin) {
                throw new AppError('Permission denied: Only the project creator or an admin can delete this project.', 403);
            }
        }

        const deleteProject = await projectRepository.delete(id);
        if (!deleteProject) {
            throw new AppError('Project not found', 404);
        }
        return deleteProject;
    }
}
export default new ProjectService();