import insightService from '../services/insight.service.js';
import asyncHandler from '../utils/asyncHandler.js';

class InsightController {
    getProjectInsights = asyncHandler(async (req, res) => {
        const result = await insightService.getProjectInsights(
            req.params.projectId,
            req.query,
            req.user
        );
        res.status(200).json({
            success: true,
            data: result
        });
    });

    createInsight = asyncHandler(async (req, res) => {
        const insight = await insightService.createInsight(
            req.params.projectId,
            req.body,
            req.user
        );
        res.status(201).json({
            success: true,
            message: 'Insight post created successfully.',
            data: insight
        });
    });

    updateInsight = asyncHandler(async (req, res) => {
        const insight = await insightService.updateInsight(
            req.params.projectId,
            req.params.insightId,
            req.body,
            req.user
        );
        res.status(200).json({
            success: true,
            message: 'Insight post updated successfully.',
            data: insight
        });
    });

    togglePinInsight = asyncHandler(async (req, res) => {
        const insight = await insightService.togglePinInsight(
            req.params.projectId,
            req.params.insightId,
            req.user
        );
        res.status(200).json({
            success: true,
            message: insight.isPinned ? 'Insight pinned.' : 'Insight unpinned.',
            data: insight
        });
    });

    deleteInsight = asyncHandler(async (req, res) => {
        await insightService.deleteInsight(
            req.params.projectId,
            req.params.insightId,
            req.user
        );
        res.status(200).json({
            success: true,
            message: 'Insight post deleted successfully.'
        });
    });
}

export default new InsightController();

