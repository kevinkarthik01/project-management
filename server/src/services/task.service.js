import taskRepository from '../repositories/task.repository.js'
import projectRepository from '../repositories/project.repository.js'
import ProjectInsight from '../models/projectInsight.js'
import ProjectInvestment from '../models/projectInvestment.js'
import ProjectExpense from '../models/projectExpense.js'
import ProjectSale from '../models/projectSale.js'

import AppError from '../utils/AppError.js'
class taskService {
    async createTask(taskdata, user) {
        //i need to check if the project exsists or not 
        const project = await projectRepository.findById(taskdata.projectId);
        if (!project) {
            throw new AppError('Cannot create task: Project does not exsists.', 404)
        }

        //content filtering role based
        if (user) {
            taskdata.createdBy = user._id;
            taskdata.assignee = taskdata.assignee || user.name || 'SK';
        }
        taskdata.visibility = taskdata.visibility || 'public';

        //now create a task

        const task = await taskRepository.create(taskdata);

        //i have counter which i will later build to increment the task counter
        await projectRepository.update(taskdata.projectId, {
            $inc: { subtasksCount: 1 }
        })
        return task
    }

    async getTasksByProject(projectId, statusFilter, user) {
        const filter = {};
        if (statusFilter && statusFilter != 'all') {
            filter.status = statusFilter
        }

        // Tech role: can only view public tasks or tasks created/assigned to them
        if (user && user.role === 'tech') {
            filter.$or = [
                { visibility: 'public' },
                { createdBy: user._id },
                { assignedTo: user._id }
            ];
        }

        const tasks = await taskRepository.findByProjectId(projectId, filter);

        const counts = await taskRepository.countByStatus(projectId)
        return {
            tasks,
            counts
        };
    }

    async getTaskById(taskId) {
        const task = await taskRepository.findById(taskId)
        if (!task) {
            throw new AppError('Task not found', 404)
        }

        return task
    }

    async updateTask(taskid, updateData, user) {
        const existingTask = await taskRepository.findById(taskid);
        if (!existingTask) {
            throw new AppError('Task not found.', 404);
        }
        // Tech role can ONLY modify tasks they created for themselves
        if (user && user.role === 'tech') {
            const isCreator = existingTask.createdBy && existingTask.createdBy.toString() === user._id.toString();
            const isAssigned = existingTask.assignedTo && existingTask.assignedTo.toString() === user._id.toString();
            if (!isCreator && !isAssigned) {
                throw new AppError('You can only modify tasks you created for yourself.', 403);
            }
        }
        return await taskRepository.update(taskid, updateData);
    }

    async deleteTask(taskid, user) {
        const existingTask = await taskRepository.findById(taskid);
        if (!existingTask) {
            throw new AppError('Task not found', 404);
        }
        // Tech role can ONLY delete tasks they created
        if (user && user.role === 'tech') {
            const isCreator = existingTask.createdBy && existingTask.createdBy.toString() === user._id.toString();
            if (!isCreator) {
                throw new AppError('You can only delete tasks you created.', 403);
            }
        }
        const task = await taskRepository.delete(taskid);
        if (task.projectId) {
            await projectRepository.update(task.projectId, {
                $inc: { subtasksCount: -1 }
            });
        }
        return task;
    }

    async getProjectsWithTaskSummary(user) {
        // role filter
        const filter = (user && user.role === 'tech') ? ({ $or: [{ members: user._id }, { createdBy: user._id }] }) : ({})

        const projects = await projectRepository.findAll(filter);
        const taskSummary = await taskRepository.getTaskSummaryByProjects();

        const projectIds = projects.map((p) => p._id);
        const [insightCounts, investmentSums, expenseSums, saleSums] = await Promise.all([
            ProjectInsight.aggregate([
                { $match: { projectId: { $in: projectIds } } },
                { $group: { _id: '$projectId', count: { $sum: 1 } } }
            ]),
            ProjectInvestment.aggregate([
                { $match: { projectId: { $in: projectIds } } },
                { $group: { _id: '$projectId', total: { $sum: '$amount' } } }
            ]),
            ProjectExpense.aggregate([
                { $match: { projectId: { $in: projectIds } } },
                { $group: { _id: '$projectId', total: { $sum: '$amount' } } }
            ]),
            ProjectSale.aggregate([
                { $match: { projectId: { $in: projectIds } } },
                { $group: { _id: '$projectId', total: { $sum: '$totalAmount' } } }
            ])
        ]);

        return projects.map((project) => {
            let projectIdstr = project._id.toString();

            const todoCount = taskSummary.find(
                (s) => s._id.projectId?.toString() === projectIdstr && s._id.status === 'todo')?.count || 0;
            const inProgressCount = taskSummary.find(
                (s) => s._id.projectId?.toString() === projectIdstr && s._id.status === 'in_progress')?.count || 0;
            const completedCount = taskSummary.find(
                (s) => s._id.projectId?.toString() === projectIdstr && s._id.status === 'completed')?.count || 0;

            const total = todoCount + inProgressCount + completedCount;
            const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

            const insightsCount = insightCounts.find((i) => i._id?.toString() === projectIdstr)?.count || 0;
            const totalInvestment = investmentSums.find((i) => i._id?.toString() === projectIdstr)?.total || 0;
            const totalExpenses = expenseSums.find((e) => e._id?.toString() === projectIdstr)?.total || 0;
            const totalSales = saleSums.find((s) => s._id?.toString() === projectIdstr)?.total || 0;

            return {
                ...project.toObject(),
                insightsCount,
                financeStats: {
                    totalInvestment: Number(totalInvestment.toFixed(2)),
                    totalExpenses: Number(totalExpenses.toFixed(2)),
                    totalSales: Number(totalSales.toFixed(2)),
                    netProfit: Number((totalSales - totalExpenses).toFixed(2))
                },
                taskStats: {
                    created: todoCount,
                    inProgress: inProgressCount,
                    completed: completedCount,
                    total,
                    progressPercent
                }
            };
        });
    }
    async getAllTasks(query = {}, user) {
        const filter = {};
        if (query.projectId && query.projectId != 'all') {
            filter.projectId = query.projectId;
        }
        if (query.status && query.status !== 'all') {
            filter.status = query.status;
        }
        // Tech role: can only view public tasks or tasks created/assigned to them
        if (user && user.role === 'tech') {
            filter.$or = [
                { visibility: 'public' },
                { createdBy: user._id },
                { assignedTo: user._id }
            ];
        }
        const tasks = await taskRepository.findAll(filter);
        const priorityWeight = { high: 1, medium: 2, low: 3 };
        return tasks.sort((a, b) => {
            const weightA = priorityWeight[a.priority?.toLowerCase()] || 4
            const weightB = priorityWeight[b.priority?.toLowerCase()] || 4
            return weightA - weightB
        })
    }
}

export default new taskService();