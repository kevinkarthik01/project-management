/**
 * RBAC Helper Utilities for Project-scoped sub-roles and permission checks.
 */

/**
 * Resolves the contextual sub-role of a user for a given project.
 * @param {Object} project - The project object
 * @param {Object} currentUser - The currently authenticated user from useAuth()
 * @returns {'admin' | 'creator' | 'team-member' | 'none'}
 */
export function getProjectSubRole(project, currentUser) {
  if (!project || !currentUser) return 'none';

  // 1. Global Admin: has full authority across everything
  if (currentUser.role === 'admin') {
    return 'admin';
  }

  const currentUserId = (currentUser._id || currentUser.id)?.toString();
  if (!currentUserId) return 'none';

  // 2. Project Creator / Owner
  const rawCreator = project.createdBy;
  const creatorId = (typeof rawCreator === 'object' && rawCreator !== null ? rawCreator._id : rawCreator)?.toString();

  if (creatorId && creatorId === currentUserId) {
    return 'creator';
  }

  // 3. Project Team Member
  const members = Array.isArray(project.members) ? project.members : [];
  const isMember = members.some((m) => {
    const memberId = (typeof m === 'object' && m !== null ? m._id : m)?.toString();
    return memberId === currentUserId;
  });

  if (isMember) {
    return 'team-member';
  }

  return 'none';
}

/**
 * Determines whether the current user is permitted to edit project details or roster.
 * @param {Object} project 
 * @param {Object} currentUser 
 * @returns {boolean}
 */
export function canEditProject(project, currentUser) {
  const role = getProjectSubRole(project, currentUser);
  return role === 'creator' || role === 'admin';
}

/**
 * Determines whether the current user is permitted to delete the project.
 * @param {Object} project 
 * @param {Object} currentUser 
 * @returns {boolean}
 */
export function canDeleteProject(project, currentUser) {
  const role = getProjectSubRole(project, currentUser);
  return role === 'creator' || role === 'admin';
}
