import projectService from "../services/project.service.js";
import asyncHandler from "../utils/asyncHandler.js";

class ProjectController {
    createProject = asyncHandler(async (req, res) => {
        const project = await projectService.createProject(req.body, req.user);
        res.status(201).json({
            success: true,
            message: 'Project created successfully.',
            data: project
        });
    });

    getAllProjects = asyncHandler(async (req, res) => {
        const projects = await projectService.getAllProjects(req.user);
        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    });

    getProjectById = asyncHandler(async (req, res) => {
        const project = await projectService.getProjectById(req.params.id);
        res.status(200).json({
            success: true,
            data: project
        });
    });

    updateProject = asyncHandler(async (req, res) => {
        const project = await projectService.updateProject(req.params.id, req.body, req.user);
        res.status(200).json({
            success: true,
            message: 'Project updated successfully.',
            data: project
        });
    });

    deleteProject = asyncHandler(async (req, res) => {
        await projectService.deleteProject(req.params.id, req.user);
        res.status(200).json({
            success: true,
            message: 'Project deleted successfully.'
        });
    });
}

export default new ProjectController();
