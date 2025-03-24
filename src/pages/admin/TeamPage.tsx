import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember, TeamMember, translateText, uploadTeamImage } from '../../services/apiService';
import Modal from '../../components/Modal';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

// Form data interface for team member
interface TeamMemberForm {
  name: string;
  title: string;
  fr_title: string;
  bio: string;
  fr_bio: string;
  image_url?: string;
  email: string;
  display_order: number;
}

/**
 * Admin Team Members page
 * Allows management of team member profiles
 */
const TeamPage: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation('common');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'fr'>('en');
  const [formData, setFormData] = useState<TeamMemberForm>({
    name: '',
    title: '',
    fr_title: '',
    bio: '',
    fr_bio: '',
    image_url: '',
    email: '',
    display_order: 0
  });
  const [savingMember, setSavingMember] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user has edit permissions for a specific team member
  const hasEditPermission = (member: TeamMember | null): boolean => {
    if (!user) return false;
    if (user.isAdmin) return true; // Admins can edit all members
    if (!member) return false;
    return user.email === member.email; // Non-admins can only edit their own profile
  };

  // Check if user has general admin permissions
  const hasAdminPermission = (): boolean => {
    return user?.isAdmin || false;
  };

  // Check if user can edit specific fields
  const canEditField = (fieldName: string, member: TeamMember | null): boolean => {
    if (!user) return false;
    
    // Admins can edit all fields of all members
    if (user.isAdmin) {
      // Special handling for display_order - only admins can edit it
      if (fieldName === 'display_order') return true;
      // Admins can edit all other fields
      return true;
    }
    
    // Non-admins can only edit certain fields of their own profile
    if (!member) return false;
    if (user.email === member.email) {
      // List of fields that non-admin users can edit of their own profile
      const editableFields = ['name', 'title', 'fr_title', 'bio', 'fr_bio', 'image_url'];
      return editableFields.includes(fieldName);
    }
    
    return false;
  };

  // Fetch team members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const data = await getTeamMembers();
        // Sort members by display_order
        const sortedMembers = [...data].sort((a, b) => a.display_order - b.display_order);
        setMembers(sortedMembers);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError('Failed to load team members. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Handle add new member
  const handleAddMember = () => {
    if (!hasAdminPermission()) return;
    
    setSelectedMember(null);
    setFormData({
      name: '',
      title: '',
      fr_title: '',
      bio: '',
      fr_bio: '',
      image_url: '',
      email: '',
      display_order: members.length > 0 ? Math.max(...members.map(m => m.display_order)) + 1 : 1
    });
    setIsModalOpen(true);
    setUploadError(null);
  };

  // Handle edit member
  const handleEditMember = (member: TeamMember) => {
    if (!hasEditPermission(member)) return;
    
    setSelectedMember(member);
    setFormData({
      name: member.name,
      title: member.title,
      fr_title: member.fr_title || '',
      bio: member.bio || '',
      fr_bio: member.fr_bio || '',
      image_url: member.image_url || '',
      email: member.email || '',
      display_order: member.display_order
    });
    setIsModalOpen(true);
    setUploadError(null);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Check if user can edit this field
    if (!canEditField(name, selectedMember)) return;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'display_order' ? parseInt(value, 10) || 0 : value
    }));
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileUpload(file);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      setUploadError(null);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Only image files are allowed');
        setUploadingImage(false);
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        setUploadingImage(false);
        return;
      }
      
      const result = await uploadTeamImage(file);
      
      if (result.success && result.imagePath) {
        // Update form data with the new image path
        setFormData(prev => ({
          ...prev,
          image_url: result.imagePath
        }));
      } else {
        setUploadError('Failed to upload image. Please try again.');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Check if an image URL is an auto-generated avatar
  const isAutoGeneratedAvatar = (url: string): boolean => {
    return !!url && url.includes('/images/team/avatar-');
  };

  // Handle save member
  const handleSaveMember = async () => {
    try {
      setSavingMember(true);
      
      // Prepare data with proper null handling for French fields
      const memberData = {
        ...formData,
        fr_title: formData.fr_title.trim() || null,
        fr_bio: formData.fr_bio.trim() || null,
        // If image_url is empty string, send null to trigger avatar generation
        image_url: formData.image_url || null
      };
      
      // Debug: Log the data being sent
      console.log('Saving member data:', memberData);
      
      if (selectedMember) {
        // Update existing member
        const result = await updateTeamMember(selectedMember.team_id, memberData);
        console.log('Update result:', result);
        
        if (result.success) {
          // Refresh the members list
          const updatedMembers = await getTeamMembers();
          console.log('Updated members:', updatedMembers);
          // Sort members by display_order
          const sortedMembers = [...updatedMembers].sort((a, b) => a.display_order - b.display_order);
          setMembers(sortedMembers);
          setIsModalOpen(false);
        } else {
          setError('Failed to update team member. Please try again.');
        }
      } else {
        // Create new member
        const result = await createTeamMember(memberData);
        console.log('Create result:', result);
        
        if (result.success) {
          // Refresh the members list
          const updatedMembers = await getTeamMembers();
          console.log('Updated members:', updatedMembers);
          // Sort members by display_order
          const sortedMembers = [...updatedMembers].sort((a, b) => a.display_order - b.display_order);
          setMembers(sortedMembers);
          setIsModalOpen(false);
        } else {
          setError('Failed to create team member. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error saving team member:', err);
      setError('Failed to save team member. Please try again.');
    } finally {
      setSavingMember(false);
    }
  };

  // Handle delete member
  const handleDeleteMember = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this team member? This action cannot be undone.')) {
      try {
        setDeletingId(id);
        const result = await deleteTeamMember(id);
        
        if (result.success) {
          // Remove the deleted member from the members array
          setMembers(prev => prev.filter(member => member.team_id !== id));
        } else {
          setError('Failed to delete team member. Please try again.');
        }
      } catch (err) {
        console.error('Error deleting team member:', err);
        setError('Failed to delete team member. Please try again.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  };

  // Handle translation
  const handleTranslate = async (field: 'title' | 'bio') => {
    try {
      const textToTranslate = field === 'title' ? formData.title : formData.bio;
      if (!textToTranslate) return;

      setTranslationError(null); // Clear any previous translation error
      const translatedText = await translateText(textToTranslate);
      setFormData(prev => ({
        ...prev,
        [field === 'title' ? 'fr_title' : 'fr_bio']: translatedText,
      }));
    } catch (error) {
      console.error('Translation error:', error);
      setTranslationError('Translation failed: Communication with Google Cloud API failed. Please check your API key configuration.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="mt-1 text-gray-600">
            {hasAdminPermission() 
              ? "Manage all team member profiles"
              : "Manage team member profiles (You can only edit your own profile)"}
          </p>
        </div>
        {hasAdminPermission() && (
          <button
            onClick={handleAddMember}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Team Member
          </button>
        )}
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
      ) : members.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No team members</h3>
          <p className="mt-1 text-sm text-gray-500">
            {hasAdminPermission() 
              ? "Get started by creating a new team member profile."
              : "No team members have been added yet."}
          </p>
          {hasAdminPermission() && (
            <div className="mt-6">
              <button
                onClick={handleAddMember}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New Team Member
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <div key={member.team_id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                    {member.image_url ? (
                      <img 
                        src={member.image_url} 
                        alt={member.name} 
                        className="h-full w-full object-cover" 
                        title={isAutoGeneratedAvatar(member.image_url) ? "Auto-generated avatar" : "Profile picture"}
                      />
                    ) : (
                      <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedLanguage === 'en' ? member.title : member.fr_title || member.title}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {selectedLanguage === 'en' ? member.bio : member.fr_bio || member.bio}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Order: {member.display_order}</span>
                  <div className="flex space-x-2">
                    {hasEditPermission(member) && (
                      <>
                        <button
                          onClick={() => handleEditMember(member)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          Edit
                        </button>
                        {hasAdminPermission() && (
                          <button
                            onClick={() => handleDeleteMember(member.team_id)}
                            disabled={deletingId === member.team_id}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                            </svg>
                            {deletingId === member.team_id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team Member Modal */}
      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setError(null);
        setTranslationError(null); // Clear translation error when closing modal
      }}>
        <div className="bg-white p-8 rounded-lg max-w-7xl w-full mx-auto overflow-y-auto max-h-[95vh]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {selectedMember ? 'Edit Team Member' : 'Add New Team Member'}
            </h2>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setError(null);
                  setTranslationError(null); // Clear translation error when clicking cancel
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSaveMember}
                disabled={savingMember}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingMember ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save'}
              </button>
            </div>
          </div>
          
          {/* Error Display Section */}
          {(error || translationError) && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{translationError || error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={(e) => { e.preventDefault(); handleSaveMember(); }}>
            <div className="space-y-8">
              {/* Name and Display Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Full Name"
                    required
                    disabled={!canEditField('name', selectedMember)}
                  />
                </div>

                <div>
                  <label htmlFor="display_order" className="block text-sm font-medium text-gray-700">Display Order</label>
                  <input
                    type="number"
                    id="display_order"
                    name="display_order"
                    value={formData.display_order}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    min="1"
                    required
                    disabled={!hasAdminPermission()}
                  />
                  <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="team.member@example.com"
                  disabled={!canEditField('email', selectedMember)}
                />
                {!hasAdminPermission() && (
                  <p className="mt-1 text-xs text-gray-500">Only administrators can change email addresses</p>
                )}
              </div>

              {/* Job Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Job Title (English)</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="e.g. Software Engineer"
                    required
                    disabled={!canEditField('title', selectedMember)}
                  />
                </div>

                <div>
                  <label htmlFor="fr_title" className="block text-sm font-medium text-gray-700">Job Title (French)</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="fr_title"
                        name="fr_title"
                        value={formData.fr_title}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      <TranslateButton
                        type="button"
                        onClick={() => handleTranslate('title')}
                        className="mt-1"
                      >
                        Translate
                      </TranslateButton>
                    </div>
                    {translationError && (
                      <div className="text-sm text-red-600 mt-1">
                        {translationError}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio (English)</label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Brief professional biography"
                    disabled={!canEditField('bio', selectedMember)}
                  />
                </div>

                <div>
                  <label htmlFor="fr_bio" className="block text-sm font-medium text-gray-700">Bio (French)</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <textarea
                        id="fr_bio"
                        name="fr_bio"
                        rows={4}
                        value={formData.fr_bio}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      <TranslateButton
                        type="button"
                        onClick={() => handleTranslate('bio')}
                        className="mt-1"
                      >
                        Translate
                      </TranslateButton>
                    </div>
                    {translationError && (
                      <div className="text-sm text-red-600 mt-1">
                        {translationError}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                  {formData.image_url && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                      </svg>
                      Remove Image
                    </button>
                  )}
                </div>
                <div 
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center">
                    {formData.image_url ? (
                      <div className="mb-4">
                        <div className="mx-auto h-32 w-32 rounded-full overflow-hidden bg-gray-100">
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
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>{uploadingImage ? 'Uploading...' : 'Upload a file'}</span>
                        <input 
                          id="file-upload"
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
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

const TranslateButton = styled.button`
  background-color: #2196f3;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  height: fit-content;
  white-space: nowrap;
  
  &:hover {
    background-color: #0b7dda;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default TeamPage; 