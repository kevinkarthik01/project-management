import Task from '../models/task.js';

class taskRepository {
    async create(taskdata) {
        return await Task.create(taskdata);
    }

    async findByProjectId(projectId, filter = {}) {
        const query = { projectId, ...filter };
        return await Task.find(query).sort({ createdAt: -1 });
    }

    async findById(taskid) {
        return await Task.findById(taskid);
    }

    async update(taskid, updateData) {
        return await Task.findByIdAndUpdate(taskid, updateData, {
            new: true,
            runValidators: true
        })
    }

    async delete(taskid) {
        return await Task.findByIdAndDelete(taskid);
    }

    //project status counter
    async countByStatus(projectId) {
        const [total, todo, in_progress, completed] = await Promise.all([
            Task.countDocuments({ projectId }),
            Task.countDocuments({ projectId, status: 'todo' }),
            Task.countDocuments({ projectId, status: 'in_progress' }),
            Task.countDocuments({ projectId, status: 'completed' })
        ])

        return {
            total,
            todo,
            in_progress,
            completed
        }
    }

    async getTaskSummaryByProjects() {
        return await Task.aggregate([
            {
                $group: {
                    _id: {
                        projectId: '$projectId', status: `$status`
                    },
                    count: { $sum: 1 }
                }
            }
        ]);
    }
    async findAll(filter = {}) {
        return await Task.find(filter).populate('projectId', 'title').sort({ createdAt: -1 })
    }
}

export default new taskRepository();