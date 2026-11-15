import React, { createContext, useContext, useState } from 'react';

const ProjectModalContext = createContext();

export function ProjectModalProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const openProjectModal = (project) => {
        setSelectedProject(project);
        setIsOpen(true)
    };

    const closeProjectModal = () => {
        setIsOpen(false);
        setSelectedProject(null);
    }

    return (
        <ProjectModalContext.Provider
            value={{
                isOpen,
                selectedProject,
                openProjectModal,
                closeProjectModal
            }}>
            {children}
        </ProjectModalContext.Provider>
    );
}

// Custom hook
export function useProjectModal() {
    const context = useContext(ProjectModalContext);
    if (!context) {
        throw new Error('useProjectModal must be used within a ProjectModalProvider')
    }
    return context;
}