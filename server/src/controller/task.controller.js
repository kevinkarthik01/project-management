import taskService from '../services/task.service.js'
import asyncHandler from '../utils/asyncHandler.js'
class taskController {
    createTask = asyncHandler(async (req, res) => {
        const task = await taskService.createTask(req.body, req.user);
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task
        });
    });

    getTasksByProject = asyncHandler(async (req, res) => {
        const { projectId } = req.params;
        const { status } = req.query;

        const result = await taskService.getTasksByProject(projectId, status, req.user);
        res.status(200).json({
            success: true,
            data: result.tasks,
            counts: result.counts
        });
    });

    getTaskById = asyncHandler(async (req, res) => {
        const task = await taskService.getTaskById(req.params.id);
        res.status(200).json({
            success: true,
            data: task
        });
    });

    updateTask = asyncHandler(async (req, res) => {
        const task = await taskService.updateTask(req.params.id, req.body, req.user);

        res.status(200).json({
            success: true,
            message: "Task updated succesfully.",
            data: task
        });
    });

    deleteTask = asyncHandler(async (req, res) => {
        const task = await taskService.deleteTask(req.params.id, req.user);
        res.status(200).json({
            success: true,
            message: "Task deleted succesfully."
        });
    });

    getProjectsSummary = asyncHandler(async (req, res) => {
        const data = await taskService.getProjectsWithTaskSummary(req.user);
        res.status(200).json({
            success: true,
            data
        });
    });

    getAllTasks = asyncHandler(async (req, res) => {
        const tasks = await taskService.getAllTasks(req.query, req.user);
        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        })
    })
}

export default new taskController();