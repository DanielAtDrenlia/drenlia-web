import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useFileUpload } from '../../hooks/useFileUpload';
import { getProjects, createProject, updateProject, deleteProject, updateProjectOrders, uploadProjectImage, Project } from '../../services/apiService';

interface UploadResponse {
  success: boolean;
  imagePath: string;
}

const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Project>({
    project_id: 0,
    title: '',
    fr_title: '',
    description: '',
    fr_description: '',
    image_url: '',
    display_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    type: '',
    type_fr: '',
    git_url: '',
    demo_url: ''
  });
  const { handleFileSelect: uploadFile } = useFileUpload<UploadResponse>((file: File) => {
    return uploadProjectImage(file);
  }, {
    maxSizeInMB: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    onUploadSuccess: (result) => {
      if (result.success && result.imagePath) {
        setFormData(prev => ({
          ...prev,
          image_url: result.imagePath
        }));
      }
    }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = projects.findIndex(p => p.project_id === active.id);
    const newIndex = projects.findIndex(p => p.project_id === over.id);
    
    // Create a new array with the items reordered
    const reorderedProjects = arrayMove(projects, oldIndex, newIndex);
    
    // Update the display_order values
    const updatedProjects = reorderedProjects.map((project: Project, index: number) => ({
      ...project,
      display_order: index + 1
    }));
    
    // Update UI immediately
    setProjects(updatedProjects);
    
    // Prepare data for batch update
    const projectOrders = updatedProjects.map((project: Project) => ({
      project_id: project.project_id,
      display_order: project.display_order
    }));
    
    try {
      const result = await updateProjectOrders(projectOrders);
      if (!result.success) {
        // Refresh the data to ensure we're in sync with the server
        const refreshedData = await getProjects();
        const sortedProjects = [...refreshedData].sort((a, b) => a.display_order - b.display_order);
        setProjects(sortedProjects);
      }
    } catch (error) {
      console.error('Error updating project orders:', error);
      // Refresh the data to ensure we're in sync with the server
      const refreshedData = await getProjects();
      const sortedProjects = [...refreshedData].sort((a, b) => a.display_order - b.display_order);
      setProjects(sortedProjects);
    }
  };

  const handleCreateProject = async () => {
    try {
      const result = await createProject(formData);
      if (!result.success) {
        throw new Error('Failed to create project');
      }
      
      // Update local state
      setProjects(prevProjects => [...prevProjects, { ...formData, project_id: result.id! }]);
      setEditingProjectId(null);
      setFormData({
        project_id: 0,
        title: '',
        fr_title: '',
        description: '',
        fr_description: '',
        type: '',
        type_fr: '',
        git_url: '',
        demo_url: '',
        image_url: '',
        display_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const result = await deleteProject(id);
      if (!result.success) {
        throw new Error('Failed to delete project');
      }
      
      // Update local state
      setProjects(prevProjects => prevProjects.filter(project => project.project_id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleEditSection = (project: Project) => {
    setFormData({
      ...project,
      fr_title: project.fr_title || '',
      fr_description: project.fr_description || '',
      type_fr: project.type_fr || '',
      git_url: project.git_url || '',
      demo_url: project.demo_url || ''
    });
    setEditingProjectId(project.project_id);
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setFormData({
      project_id: 0,
      title: '',
      fr_title: '',
      description: '',
      fr_description: '',
      image_url: '',
      display_order: 0,
      created_at: '',
      updated_at: '',
      type: '',
      type_fr: '',
      git_url: '',
      demo_url: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string | null } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProject = async (id: number) => {
    try {
      const result = await updateProject(id, formData);
      if (!result.success) {
        throw new Error('Failed to update project');
      }
      
      // Update local state
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.project_id === id ? { ...project, ...formData } : project
        )
      );
      
      setEditingProjectId(null);
      setFormData({
        project_id: 0,
        title: '',
        fr_title: '',
        description: '',
        fr_description: '',
        type: '',
        type_fr: '',
        git_url: '',
        demo_url: '',
        image_url: '',
        display_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleImageUpload = async (id: number, file: File) => {
    try {
      const result = await uploadProjectImage(file);
      if (result.success && result.imagePath) {
        setFormData(prev => ({
          ...prev,
          image_url: result.imagePath
        }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <div className="max-w-md mx-auto">
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <p>You do not have permission to access this page.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-gray-600">Manage the projects that appear on the portfolio</p>
        </div>
        <button
          onClick={handleCreateProject}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Project
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={projects.map(p => p.project_id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-6">
            {projects.map((project) => (
              <SortableProjectItem
                key={project.project_id}
                project={project}
                isEditing={editingProjectId === project.project_id}
                isAdmin={isAdmin}
                onEdit={() => handleEditSection(project)}
                onCancelEdit={handleCancelEdit}
                onUpdate={handleUpdateProject}
                onDelete={handleDeleteProject}
                onImageUpload={handleImageUpload}
                formData={formData}
                onInputChange={handleInputChange}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

interface SortableProjectItemProps {
  project: Project;
  isEditing: boolean;
  isAdmin: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onImageUpload: (id: number, file: File) => Promise<void>;
  formData: Project;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string | null } }) => void;
}

const SortableProjectItem: React.FC<SortableProjectItemProps> = ({
  project,
  isEditing,
  isAdmin,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onImageUpload,
  formData,
  onInputChange
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: project.project_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onImageUpload(project.project_id, file);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div {...attributes} {...listeners} className="cursor-move mr-2 text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </div>
          <span className="text-sm text-gray-500">Order: {project.display_order}</span>
        </div>
        {isAdmin && (
          <div className="flex space-x-2">
            <button
              onClick={() => isEditing ? onCancelEdit() : onEdit()}
              className="text-indigo-600 hover:text-indigo-900"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(project.project_id)}
              className="text-red-600 hover:text-red-900"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={`title-${project.project_id}`} className="block text-sm font-medium text-gray-700">Title (English)</label>
              <input
                type="text"
                id={`title-${project.project_id}`}
                name="title"
                value={formData.title}
                onChange={onInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor={`fr_title-${project.project_id}`} className="block text-sm font-medium text-gray-700">Title (French)</label>
                <button
                  type="button"
                  onClick={() => onInputChange({ target: { name: 'fr_title', value: 'Translating...' } })}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500"
                >
                  Translate
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389 21.034 21.034 0 01-.554-.6 19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                id={`fr_title-${project.project_id}`}
                name="fr_title"
                value={formData.fr_title || ''}
                onChange={onInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={`description-${project.project_id}`} className="block text-sm font-medium text-gray-700">Description (English)</label>
              <textarea
                id={`description-${project.project_id}`}
                name="description"
                value={formData.description}
                onChange={onInputChange}
                rows={6}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor={`fr_description-${project.project_id}`} className="block text-sm font-medium text-gray-700">Description (French)</label>
                <button
                  type="button"
                  onClick={() => onInputChange({ target: { name: 'fr_description', value: 'Translating...' } })}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500"
                >
                  Translate
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389 21.034 21.034 0 01-.554-.6 19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <textarea
                id={`fr_description-${project.project_id}`}
                name="fr_description"
                value={formData.fr_description || ''}
                onChange={onInputChange}
                rows={6}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={`type-${project.project_id}`} className="block text-sm font-medium text-gray-700">Project Type (English)</label>
              <input
                type="text"
                id={`type-${project.project_id}`}
                name="type"
                value={formData.type}
                onChange={onInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor={`type_fr-${project.project_id}`} className="block text-sm font-medium text-gray-700">Project Type (French)</label>
                <button
                  type="button"
                  onClick={() => onInputChange({ target: { name: 'type_fr', value: 'Translating...' } })}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500"
                >
                  Translate
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389 21.034 21.034 0 01-.554-.6 19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                id={`type_fr-${project.project_id}`}
                name="type_fr"
                value={formData.type_fr || ''}
                onChange={onInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={`git_url-${project.project_id}`} className="block text-sm font-medium text-gray-700">GitHub URL</label>
              <input
                type="url"
                id={`git_url-${project.project_id}`}
                name="git_url"
                value={formData.git_url || ''}
                onChange={onInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor={`demo_url-${project.project_id}`} className="block text-sm font-medium text-gray-700">Demo URL</label>
              <input
                type="url"
                id={`demo_url-${project.project_id}`}
                name="demo_url"
                value={formData.demo_url || ''}
                onChange={onInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Project Image</label>
            <div 
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  onImageUpload(project.project_id, file);
                }
              }}
            >
              <div className="space-y-1 text-center">
                {formData.image_url ? (
                  <div className="relative">
                    <img src={formData.image_url} alt={formData.title} className="mx-auto h-32 w-auto" />
                    <button
                      type="button"
                      onClick={() => onInputChange({ target: { name: 'image_url', value: null } })}
                      className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-100 rounded-full p-1"
                    >
                      <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileSelect}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onUpdate(project.project_id)}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
            <p className="mt-2 text-gray-600">{project.description}</p>
            <p className="mt-2 text-sm text-gray-500">Type: {project.type}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{project.fr_title || project.title}</h3>
            <p className="mt-2 text-gray-600">{project.fr_description || project.description}</p>
            <p className="mt-2 text-sm text-gray-500">Type: {project.type_fr || project.type}</p>
          </div>
          {project.image_url && (
            <div className="col-span-2 mt-4">
              <img src={project.image_url} alt={project.title} className="h-32 w-auto" />
            </div>
          )}
          <div className="col-span-2 mt-4 flex space-x-4">
            {project.git_url && (
              <a
                href={project.git_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHub
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
                Demo
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage; 