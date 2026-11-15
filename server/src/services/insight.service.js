import ProjectInsight, { DEFAULT_INSIGHT_CATEGORIES } from '../models/projectInsight.js';
import projectRepository from '../repositories/project.repository.js';
import AppError from '../utils/AppError.js';

class InsightService {
    async verifyProjectAccess(projectId, user) {
        const project = await projectRepository.findById(projectId);
        if (!project) {
            throw new AppError('Project not found', 404);
        }

        if (!user) {
            throw new AppError('Authentication required', 401);
        }

        if (user.role === 'admin') {
            return project;
        }

        const userIdStr = user._id.toString();
        const creatorIdStr = (project.createdBy?._id || project.createdBy)?.toString();
        const isCreator = creatorIdStr === userIdStr;
        const isMember = (project.members || []).some(
            (m) => (m?._id || m)?.toString() === userIdStr
        );

        if (!isCreator && !isMember) {
            throw new AppError('You do not have permission to access this project', 403);
        }

        return project;
    }

    canModifyEntry(entry, project, user) {
        if (!user) return false;
        if (user.role === 'admin') return true;
        const userIdStr = user._id.toString();
        const projectCreatorId = (project.createdBy?._id || project.createdBy)?.toString();
        if (projectCreatorId && projectCreatorId === userIdStr) return true;
        const entryCreatorId = (entry.createdBy?._id || entry.createdBy)?.toString();
        return entryCreatorId === userIdStr;
    }

    async getProjectInsights(projectId, query = {}, user) {
        const project = await this.verifyProjectAccess(projectId, user);

        const filter = { projectId };

        if (query.category && query.category !== 'all') {
            filter.category = query.category;
        }

        if (query.pinned === 'true') {
            filter.isPinned = true;
        }

        if (query.tag && query.tag.trim()) {
            filter.tags = query.tag.trim();
        }

        if (query.search && query.search.trim()) {
            const regex = new RegExp(query.search.trim(), 'i');
            filter.$or = [
                { title: regex },
                { description: regex },
                { category: regex },
                { tags: regex },
                { authorName: regex }
            ];
        }

        const insights = await ProjectInsight.find(filter)
            .populate('createdBy', 'name email designation role')
            .sort({ isPinned: -1, createdAt: -1 });

        const totalCount = await ProjectInsight.countDocuments({ projectId });
        const pinnedCount = await ProjectInsight.countDocuments({ projectId, isPinned: true });

        return {
            project: {
                _id: project._id,
                title: project.title,
                description: project.description,
                status: project.status,
                createdBy: project.createdBy,
                members: project.members
            },
            insights,
            stats: {
                total: totalCount,
                pinned: pinnedCount,
                filtered: insights.length
            },
            categories: DEFAULT_INSIGHT_CATEGORIES
        };
    }

    async createInsight(projectId, data, user) {
        await this.verifyProjectAccess(projectId, user);

        if (!data.title || !data.title.trim()) {
            throw new AppError('Insight title is required', 400);
        }
        if (!data.description || !data.description.trim()) {
            throw new AppError('Insight description is required', 400);
        }

        const tags = Array.isArray(data.tags)
            ? data.tags.map((t) => String(t).trim()).filter(Boolean)
            : typeof data.tags === 'string'
                ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
                : [];

        const insight = await ProjectInsight.create({
            projectId,
            title: data.title.trim(),
            description: data.description.trim(),
            category: data.category?.trim() || 'General Updates',
            tags,
            isPinned: Boolean(data.isPinned),
            attachmentUrl: data.attachmentUrl ? String(data.attachmentUrl).trim() : '',
            attachmentName: data.attachmentName ? String(data.attachmentName).trim() : '',
            attachmentType: data.attachmentType ? String(data.attachmentType).trim() : '',
            createdBy: user._id,
            authorName: user.name || 'Team Member'
        });

        await projectRepository.update(projectId, {
            $inc: { activitiesCount: 1 }
        });

        return await ProjectInsight.findById(insight._id).populate(
            'createdBy',
            'name email designation role'
        );
    }

    async updateInsight(projectId, insightId, data, user) {
        const project = await this.verifyProjectAccess(projectId, user);

        const existing = await ProjectInsight.findOne({ _id: insightId, projectId });
        if (!existing) {
            throw new AppError('Insight post not found in this project', 404);
        }

        if (!this.canModifyEntry(existing, project, user)) {
            throw new AppError('Permission denied: Only the author, project creator, or admin can edit this insight', 403);
        }

        const updatePayload = {};
        if (data.title !== undefined) {
            if (!String(data.title).trim()) {
                throw new AppError('Insight title cannot be empty', 400);
            }
            updatePayload.title = String(data.title).trim();
        }
        if (data.description !== undefined) {
            if (!String(data.description).trim()) {
                throw new AppError('Insight description cannot be empty', 400);
            }
            updatePayload.description = String(data.description).trim();
        }
        if (data.category !== undefined) {
            updatePayload.category = String(data.category).trim() || 'General Updates';
        }
        if (data.tags !== undefined) {
            updatePayload.tags = Array.isArray(data.tags)
                ? data.tags.map((t) => String(t).trim()).filter(Boolean)
                : typeof data.tags === 'string'
                    ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
                    : [];
        }
        if (data.isPinned !== undefined) {
            updatePayload.isPinned = Boolean(data.isPinned);
        }
        if (data.attachmentUrl !== undefined) {
            updatePayload.attachmentUrl = String(data.attachmentUrl).trim();
        }
        if (data.attachmentName !== undefined) {
            updatePayload.attachmentName = String(data.attachmentName).trim();
        }
        if (data.attachmentType !== undefined) {
            updatePayload.attachmentType = String(data.attachmentType).trim();
        }

        const updated = await ProjectInsight.findByIdAndUpdate(insightId, updatePayload, {
            new: true,
            runValidators: true
        }).populate('createdBy', 'name email designation role');

        return updated;
    }

    async togglePinInsight(projectId, insightId, user) {
        await this.verifyProjectAccess(projectId, user);

        const existing = await ProjectInsight.findOne({ _id: insightId, projectId });
        if (!existing) {
            throw new AppError('Insight post not found in this project', 404);
        }

        existing.isPinned = !existing.isPinned;
        await existing.save();

        return await ProjectInsight.findById(existing._id).populate(
            'createdBy',
            'name email designation role'
        );
    }

    async deleteInsight(projectId, insightId, user) {
        const project = await this.verifyProjectAccess(projectId, user);

        const existing = await ProjectInsight.findOne({ _id: insightId, projectId });
        if (!existing) {
            throw new AppError('Insight post not found in this project', 404);
        }

        if (!this.canModifyEntry(existing, project, user)) {
            throw new AppError('Permission denied: Only the author, project creator, or admin can delete this insight', 403);
        }

        await ProjectInsight.findByIdAndDelete(insightId);
        return existing;
    }
}

export default new InsightService();

