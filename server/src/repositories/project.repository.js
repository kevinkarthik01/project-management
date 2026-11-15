import Project from "../models/project.js";

class ProjectRepository {
    async create(projectData) {
        return await Project.create(projectData);
    }

    async findAll(filter = {}) {
        return await Project.find(filter)
            .populate('members', 'name email designation role')
            .populate('createdBy', 'name email designation role');
    }

    async findById(id) {
        return await Project.findById(id)
            .populate('members', 'name email designation role')
            .populate('createdBy', 'name email designation role');
    }

    async update(id, projectData) {
        return await Project.findByIdAndUpdate(id, projectData, { new: true })
            .populate('members', 'name email designation role')
            .populate('createdBy', 'name email designation role');
    }

    async delete(id) {
        return await Project.findByIdAndDelete(id);
    }

    async updateProgress(id, progress) {
        return await Project.findByIdAndUpdate(
            id,
            { progress },
            {
                new: true,
                runValidators: true // runs schema validations on update
            }
        );
    }

    async updateStatus(id, status) {
        return await Project.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
    }
}
export default new ProjectRepository();