// Adding drag and drop functionality
import React, { useEffect, useState, useRef, RefObject } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAboutSections, updateAboutSection, createAboutSection, deleteAboutSection, updateAboutSectionOrders, uploadAboutImage, translateText } from '../../services/apiService';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useFileUpload } from '../../hooks/useFileUpload';
import EditForm from './EditForm';

// Update the AboutSection interface to include French fields
interface AboutSection {
  about_id: number;
  title: string;
  fr_title: string | null;
  description: string;
  fr_description: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Local interface for form data
interface AboutSectionForm {
  title: string;
  fr_title: string;
  description: string;
  fr_description: string;
  display_order: number;
  image_url: string;
}

// Sortable item component props
interface SortableItemProps {
  id: number;
  section: AboutSection;
  editingSectionId: number | null;
  savingId: number | string | null;
  formData: AboutSectionForm;
  setFormData: React.Dispatch<React.SetStateAction<AboutSectionForm>>;
  handleEditSection: (section: AboutSection) => void;
  handleCancelEdit: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSaveSection: (id: number) => Promise<void>;
  handleDeleteSection: (id: number) => Promise<void>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  uploadingImage: boolean;
  uploadError: string | null;
  fileInputRef: RefObject<HTMLInputElement>;
  handleTranslate: (field: 'title' | 'description') => Promise<void>;
}

const SortableItem: React.FC<SortableItemProps> = ({ 
  id, 
  section, 
  editingSectionId, 
  savingId, 
  formData,
  setFormData,
  handleEditSection, 
  handleCancelEdit, 
  handleInputChange, 
  handleSaveSection, 
  handleDeleteSection,
  handleFileSelect,
  handleDragOver,
  handleDrop,
  uploadingImage,
  uploadError,
  fileInputRef,
  handleTranslate
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [activeTab, setActiveTab] = useState<'en' | 'fr'>('en');

  const handleRemoveImage = () => {
    setFormData(prevData => ({
      ...prevData,
      image_url: ''
    }));
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white overflow-hidden shadow sm:rounded-lg border border-gray-200">
      {editingSectionId === section.about_id ? (
        <div className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor={`title-${section.about_id}`} className="block text-sm font-medium text-gray-700">Title (English)</label>
                <input
                  type="text"
                  name="title"
                  id={`title-${section.about_id}`}
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor={`fr_title-${section.about_id}`} className="block text-sm font-medium text-gray-700">
                  Title (French)
                  <button
                    type="button"
                    onClick={() => handleTranslate('title')}
                    className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500"
                  >
                    Translate
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389 21.034 21.034 0 01-.554-.6 19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
                    </svg>
                  </button>
                </label>
                <input
                  type="text"
                  name="fr_title"
                  id={`fr_title-${section.about_id}`}
                  value={formData.fr_title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor={`content-${section.about_id}`} className="block text-sm font-medium text-gray-700">Content (English)</label>
                <textarea
                  name="description"
                  id={`content-${section.about_id}`}
                  rows={6}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor={`fr_content-${section.about_id}`} className="block text-sm font-medium text-gray-700">
                  Content (French)
                  <button
                    type="button"
                    onClick={() => handleTranslate('description')}
                    className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500"
                  >
                    Translate
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389 21.034 21.034 0 01-.554-.6 19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
                    </svg>
                  </button>
                </label>
                <textarea
                  name="fr_description"
                  id={`fr_content-${section.about_id}`}
                  rows={6}
                  value={formData.fr_description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor={`order-${section.about_id}`} className="block text-sm font-medium text-gray-700">Display Order</label>
              <input
                type="number"
                name="display_order"
                id={`order-${section.about_id}`}
                value={formData.display_order}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Section Image</label>
              <div 
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="space-y-1 text-center">
                  {formData.image_url ? (
                    <div className="mb-4">
                      <div className="mx-auto h-32 w-32 overflow-hidden bg-gray-100">
                        <img 
                          src={formData.image_url} 
                          alt="Preview" 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ccc%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M24%2020.993V24H0v-2.996A14.977%2014.977%200%200112.004%2015c4.904%200%209.26%202.354%2011.996%205.993zM16.002%208.999a4%204%200%2011-8%200%204%204%200%20018%200z%22%20%2F%3E%3C%2Fsvg%3E';
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{formData.image_url.split('/').pop()}</p>
                    </div>
                  ) : (
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor={`file-upload-${section.about_id}`} className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>{uploadingImage ? 'Uploading...' : 'Upload a file'}</span>
                      <input 
                        id={`file-upload-${section.about_id}`}
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileSelect}
                        ref={fileInputRef}
                        disabled={uploadingImage}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
              
              {uploadError && (
                <p className="mt-2 text-sm text-red-600">{uploadError}</p>
              )}
              
              {formData.image_url && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                    </svg>
                    Remove Image
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveSection(section.about_id)}
                disabled={savingId === section.about_id}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingId === section.about_id ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div {...attributes} {...listeners} className="cursor-move mr-2 text-gray-400 hover:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
                  {section.fr_title && (
                    <h4 className="text-sm font-medium text-gray-500 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-2">FR</span>
                      {section.fr_title}
                    </h4>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Order: {section.display_order}
                </span>
                <button
                  onClick={() => handleEditSection(section)}
                  className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteSection(section.about_id)}
                  disabled={savingId === section.about_id}
                  className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                    <path d="M10 11v6"></path>
                    <path d="M14 11v6"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-4">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('en')}
                    className={`${
                      activeTab === 'en'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setActiveTab('fr')}
                    className={`${
                      activeTab === 'fr'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                    disabled={!section.fr_description}
                  >
                    French
                  </button>
                </nav>
              </div>
              <div className="mt-4">
                {activeTab === 'en' ? (
                  <div className="text-sm text-gray-600 whitespace-pre-line">{section.description}</div>
                ) : (
                  <div className="text-sm text-gray-600 whitespace-pre-line">{section.fr_description}</div>
                )}
              </div>
            </div>
            {section.image_url && (
              <div className="mt-4">
                <img 
                  src={section.image_url || undefined}
                  alt={section.title}
                  className="max-h-32 object-cover rounded-md"
                />
              </div>
            )}
            <div className="mt-4 text-xs text-gray-500">
              Last updated: {new Date(section.updated_at).toLocaleDateString()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Admin About Sections page
 * Allows management of about page content sections with inline editing
 */
const AboutPage: React.FC = () => {
  const { user } = useAuth();
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [savingId, setSavingId] = useState<number | string | null>(null);
  const [formData, setFormData] = useState<AboutSectionForm>({
    title: '',
    fr_title: '',
    description: '',
    fr_description: '',
    display_order: 1,
    image_url: ''
  });

  // Define the expected response type from the upload function
  type UploadResponse = { success: boolean; imagePath: string };

  // Create a wrapper around uploadAboutImage that ensures the correct return type
  const uploadImage = async (file: File): Promise<UploadResponse> => {
    const result = await uploadAboutImage(file);
    if (result.success && result.imagePath) {
      return { success: true, imagePath: result.imagePath };
    }
    return { success: false, imagePath: '' };
  };

  const {
    uploading: uploadingImage,
    error: uploadError,
    fileInputRef,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    reset: resetFileUpload
  } = useFileUpload<UploadResponse>(uploadImage, {
    maxSizeInMB: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    onUploadSuccess: (result) => {
      if (result.success) {
        setFormData((prevData: AboutSectionForm) => ({
          ...prevData,
          image_url: result.imagePath
        }));
      }
    }
  });

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch about sections
  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const data = await getAboutSections();
        // Sort sections by display_order
        const sortedSections = [...data].sort((a, b) => a.display_order - b.display_order);
        setSections(sortedSections as AboutSection[]);
      } catch (err) {
        console.error('Error fetching about sections:', err);
        setError('Failed to load about sections. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  // Handle edit section
  const handleEditSection = (section: AboutSection) => {
    setFormData({
      title: section.title,
      fr_title: section.fr_title || '',  // Initialize as empty string if null
      description: section.description,
      fr_description: section.fr_description || '',  // Initialize as empty string if null
      display_order: section.display_order,
      image_url: section.image_url || ''
    });
    setEditingSectionId(section.about_id);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingSectionId(null);
    setIsCreatingNew(false);
    setFormData({
      title: '',
      fr_title: '',
      description: '',
      fr_description: '',
      display_order: 0,
      image_url: ''
    });
    resetFileUpload();
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'display_order' ? parseInt(value, 10) || 0 : value
    }));
  };

  // Handle save section
  const handleSaveSection = async (id: number) => {
    try {
      setSavingId(id);
      const sectionToUpdate = {
        title: formData.title.trim(),
        fr_title: formData.fr_title.trim() || null,  // Set to null if empty or whitespace
        description: formData.description.trim(),
        fr_description: formData.fr_description.trim() || null,  // Set to null if empty or whitespace
        image_url: formData.image_url || null,  // Set to null if empty
        display_order: formData.display_order
      };

      const success = await updateAboutSection(id, sectionToUpdate);
      if (success) {
        // Refresh the sections list
        const updatedSections = await getAboutSections();
        // Sort sections by display_order
        const sortedSections = [...updatedSections].sort((a, b) => a.display_order - b.display_order);
        setSections(sortedSections);
        
        setEditingSectionId(null);
        setFormData({
          title: '',
          fr_title: '',
          description: '',
          fr_description: '',
          display_order: 0,
          image_url: ''
        });
      }
    } catch (error) {
      console.error('Error saving section:', error);
      setError('Failed to save section. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  // Handle add new section
  const handleAddSection = () => {
    setIsCreatingNew(true);
    setFormData({
      title: '',
      fr_title: '',
      description: '',
      fr_description: '',
      display_order: sections.length > 0 ? Math.max(...sections.map(s => s.display_order)) + 1 : 1,
      image_url: ''
    });
  };

  // Handle create new section
  const handleCreateSection = async () => {
    try {
      setSavingId('new');
      const newSection = {
        title: formData.title.trim(),
        fr_title: formData.fr_title.trim() || null,  // Set to null if empty or whitespace
        description: formData.description.trim(),
        fr_description: formData.fr_description.trim() || null,  // Set to null if empty or whitespace
        image_url: formData.image_url || null,  // Set to null if empty
        display_order: formData.display_order
      };

      const result = await createAboutSection(newSection);
      
      if (result.success) {
        // Refresh the sections list
        const updatedSections = await getAboutSections();
        // Sort sections by display_order
        const sortedSections = [...updatedSections].sort((a, b) => a.display_order - b.display_order);
        setSections(sortedSections as AboutSection[]);
        
        // Reset creating state
        setIsCreatingNew(false);
        setFormData({
          title: '',
          fr_title: '',
          description: '',
          fr_description: '',
          display_order: 0,
          image_url: ''
        });
      } else {
        setError('Failed to create section. Please try again.');
      }
    } catch (err) {
      console.error('Error creating section:', err);
      setError('Failed to create section. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  // Handle delete section
  const handleDeleteSection = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this section? This action cannot be undone.')) {
      try {
        setSavingId(id);
        const result = await deleteAboutSection(id);
        
        if (result.success) {
          // Remove the deleted section from the sections array
          setSections(prev => prev.filter(section => section.about_id !== id));
        } else {
          setError('Failed to delete section. Please try again.');
        }
      } catch (err) {
        console.error('Error deleting section:', err);
        setError('Failed to delete section. Please try again.');
      } finally {
        setSavingId(null);
      }
    }
  };

  // Handle drag end for reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      try {
        // Find the indices of the dragged item and the drop target
        const oldIndex = sections.findIndex((section) => section.about_id === active.id);
        const newIndex = sections.findIndex((section) => section.about_id === over.id);
        
        // Create a new array with the items reordered
        const reorderedSections = arrayMove(sections, oldIndex, newIndex);
        
        // Update the display_order values
        const updatedSections = reorderedSections.map((section, index) => ({
          ...section,
          display_order: index + 1
        }));
        
        // Update UI immediately
        setSections(updatedSections as AboutSection[]);
        
        // Prepare data for batch update
        const sectionOrders = updatedSections.map(section => ({
          about_id: section.about_id,
          display_order: section.display_order
        }));
        
        // Update all section orders in a single API call
        const result = await updateAboutSectionOrders(sectionOrders);
        
        if (!result.success) {
          setError('Failed to save the new order. Please try again.');
          
          // Refresh the data to ensure we're in sync with the server
          const refreshedData = await getAboutSections();
          const sortedSections = [...refreshedData].sort((a, b) => a.display_order - b.display_order);
          setSections(sortedSections as AboutSection[]);
        } else {
          // Clear any previous errors if update succeeded
          setError(null);
        }
      } catch (err) {
        console.error('Error updating section order:', err);
        setError('Failed to save the new order. Please try again.');
        
        // Refresh the data to ensure we're in sync with the server
        try {
          const refreshedData = await getAboutSections();
          const sortedSections = [...refreshedData].sort((a, b) => a.display_order - b.display_order);
          setSections(sortedSections as AboutSection[]);
        } catch (refreshErr) {
          console.error('Error refreshing data:', refreshErr);
        }
      }
    }
  };

  // Handle translation
  const handleTranslate = async (field: 'title' | 'description') => {
    try {
      const textToTranslate = field === 'title' ? formData.title : formData.description;
      if (!textToTranslate) return;

      if (field === 'title') {
        // For titles, translate as a single piece
        const translatedText = await translateText(textToTranslate);
        if (translatedText) {
          setFormData(prev => ({
            ...prev,
            fr_title: translatedText
          }));
        }
      } else {
        // For descriptions, preserve paragraphs
        // Split text into paragraphs (handling both \n and \r\n)
        const paragraphs = textToTranslate.split(/\r?\n\r?\n/).filter(p => p.trim());
        
        // Translate each paragraph separately
        const translatedParagraphs = await Promise.all(
          paragraphs.map(async (paragraph) => {
            const translated = await translateText(paragraph);
            return translated || paragraph; // fallback to original if translation fails
          })
        );

        // Join paragraphs back together with double newlines
        const translatedText = translatedParagraphs.join('\n\n');
        
        if (translatedText) {
          setFormData(prev => ({
            ...prev,
            fr_description: translatedText
          }));
        }
      }
    } catch (err) {
      console.error('Error translating text:', err);
      setError('Failed to translate text. Please try again.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">About Sections</h1>
          <p className="mt-1 text-gray-600">
            Manage the content sections that appear on the About page
          </p>
        </div>
        <button
          onClick={handleAddSection}
          disabled={isCreatingNew}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Section
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : sections.length === 0 && !isCreatingNew ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No sections</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new section.</p>
          <div className="mt-6">
            <button
              onClick={handleAddSection}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Section
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* New Section Form */}
          {isCreatingNew && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Section</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="new-title" className="block text-sm font-medium text-gray-700">Title (English)</label>
                    <input
                      type="text"
                      name="title"
                      id="new-title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-fr-title" className="block text-sm font-medium text-gray-700">
                      Title (French)
                      <button
                        type="button"
                        onClick={() => handleTranslate('title')}
                        className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500"
                      >
                        Translate
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389 21.034 21.034 0 01-.554-.6 19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </label>
                    <input
                      type="text"
                      name="fr_title"
                      id="new-fr-title"
                      value={formData.fr_title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="new-content" className="block text-sm font-medium text-gray-700">Content (English)</label>
                    <textarea
                      name="description"
                      id="new-content"
                      rows={6}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-fr-content" className="block text-sm font-medium text-gray-700">
                      Content (French)
                      <button
                        type="button"
                        onClick={() => handleTranslate('description')}
                        className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500"
                      >
                        Translate
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389 21.034 21.034 0 01-.554-.6 19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </label>
                    <textarea
                      name="fr_description"
                      id="new-fr-content"
                      rows={6}
                      value={formData.fr_description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                {/* ... rest of the form fields ... */}
              </div>
            </div>
          )}

          {/* Existing Sections */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map(section => section.about_id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-6">
                {sections.map((section) => (
                  <SortableItem
                    key={section.about_id}
                    id={section.about_id}
                    section={section}
                    editingSectionId={editingSectionId}
                    savingId={savingId}
                    formData={formData}
                    setFormData={setFormData}
                    handleEditSection={handleEditSection}
                    handleCancelEdit={handleCancelEdit}
                    handleInputChange={handleInputChange}
                    handleSaveSection={handleSaveSection}
                    handleDeleteSection={handleDeleteSection}
                    handleFileSelect={handleFileSelect}
                    handleDragOver={handleDragOver}
                    handleDrop={handleDrop}
                    uploadingImage={uploadingImage}
                    uploadError={uploadError}
                    fileInputRef={fileInputRef}
                    handleTranslate={handleTranslate}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
};

export default AboutPage;