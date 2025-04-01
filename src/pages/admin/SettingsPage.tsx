import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useSettings } from '../../services/settingsService';
import TranslationsTab from '../../components/admin/TranslationsTab';
import LogoUpload from '../../components/admin/LogoUpload';
import VideoUpload from '../../components/admin/VideoUpload';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export interface Setting {
  key: string;
  value: string;
  updated_at: string;
}

interface Settings {
  logoPath: string | null;
  siteName: string;
  heroVideoPath: string | null;
  heroVideoVersion: string | null;
  [key: string]: any;
}

const Container = styled.div`
  space-y-6;
`;

const Title = styled.h1`
  text-2xl font-semibold text-gray-900;
`;

const SectionDescription = styled.p`
  color: #6B7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const Grid = styled.div`
  display: flex;
  justify-content: space-between;
  items-center;
`;

const Column = styled.div`
  flex: 1;
`;

const SettingsPage: React.FC = () => {
  const { settings, isLoading, error, updateSetting, uploadLogo } = useSettings();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newSetting, setNewSetting] = useState({ key: '', value: '' });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'general' | 'translations'>(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    return (tab === 'visual' || tab === 'general' || tab === 'translations') ? tab : 'visual';
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentVideoPath, setCurrentVideoPath] = useState<string | null>(null);
  const [videoVersion, setVideoVersion] = useState<string | null>(null);

  const isAdmin = user?.isAdmin || false;

  // Update URL when tab changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', activeTab);
    window.history.replaceState({}, '', url.toString());
  }, [activeTab]);

  // Check for existing video file on mount
  useEffect(() => {
    const checkExistingVideo = async () => {
      try {
        const videoPath = settings?.find(s => s.key === 'heroVideoPath')?.value;
        const version = settings?.find(s => s.key === 'heroVideoVersion')?.value;
        
        if (videoPath) {
          setCurrentVideoPath(videoPath);
          setVideoVersion(version || null);
        }
      } catch (error) {
        console.error('Error checking for existing video:', error);
      }
    };
    checkExistingVideo();
  }, [settings]);

  // Initialize editedSettings with current settings
  useEffect(() => {
    if (settings && Object.keys(editedSettings).length === 0) {
      const initialSettings: Record<string, string> = {};
      settings.forEach(setting => {
        initialSettings[setting.key] = setting.value;
      });
      setEditedSettings(initialSettings);
    }
  }, [settings]);

  // Redirect non-admin users
  if (!isAdmin) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="mt-4 text-lg font-medium text-gray-900">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-500">You do not have permission to access the settings page. Please contact an administrator for assistance.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-lg font-medium text-gray-900">Error Loading Settings</h2>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const handleSettingChange = (key: string, value: string) => {
    setEditedSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddNew = async () => {
    if (newSetting.key && newSetting.value) {
      try {
        await updateSetting(newSetting.key, newSetting.value);
        setEditedSettings(prev => ({
          ...prev,
          [newSetting.key]: newSetting.value
        }));
        setNewSetting({ key: '', value: '' });
        setIsAddingNew(false);
        setSuccessMessage('New setting added successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Error adding new setting:', err);
        setSuccessMessage('Error adding new setting');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };

  const handleDelete = async (key: string) => {
    try {
      await updateSetting(key, '');
      setEditedSettings(prev => {
        const newSettings = { ...prev };
        delete newSettings[key];
        return newSettings;
      });
      setSuccessMessage('Setting deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting setting:', err);
      setSuccessMessage('Error deleting setting');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleSaveAll = async () => {
    try {
      for (const [key, value] of Object.entries(editedSettings)) {
        await updateSetting(key, value);
      }
      setSuccessMessage('All changes saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setSuccessMessage('Error saving settings');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      await uploadLogo(file);
      setSuccessMessage('Logo uploaded successfully');
    } catch (err) {
      console.error('Error uploading logo:', err);
    }
  };

  const handleVideoUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch('/api/settings/upload-video', {
        method: 'POST',
        body: formData
      });

      // Handle 413 Payload Too Large error
      if (response.status === 413) {
        throw new Error('Video file is too large. Maximum size is 50MB. Please compress your video or choose a smaller file.');
      }

      // Try to parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (e) {
        // If response is not JSON, use status text
        throw new Error(response.statusText || 'Failed to upload video');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload video');
      }

      setCurrentVideoPath(data.videoPath);
      setVideoVersion(data.version);
      toast.success('Video uploaded successfully');
    } catch (error: unknown) {
      console.error('Error uploading video:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload video';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleVideoDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch('/api/settings/delete-video', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      setCurrentVideoPath(null);
      setVideoVersion(null);
      toast.success('Video deleted successfully');
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Container>
      <Title>Settings</Title>
      
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('visual')}
              className={`${
                activeTab === 'visual'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Visual Settings
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`${
                activeTab === 'general'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              General Settings
            </button>
            <button
              onClick={() => setActiveTab('translations')}
              className={`${
                activeTab === 'translations'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Site Content
            </button>
          </nav>
        </div>

        {activeTab === 'visual' ? (
          <div className="space-y-6">
            <SectionDescription>
              Manage your site's visual assets including the logo and hero video. The logo will be displayed in the header and favicon, while the hero video serves as the background for your homepage's hero section. Supported video formats include MP4, and the maximum file size is 50MB.
            </SectionDescription>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Visual Assets</h2>
              <Grid>
                <Column>
                  <LogoUpload
                    currentLogoPath={settings?.find(s => s.key === 'logo_path')?.value || ''}
                    siteName={settings?.find(s => s.key === 'siteName')?.value || ''}
                    onUpload={handleLogoUpload}
                  />
                </Column>
                
                <Column>
                  <VideoUpload
                    currentVideoPath={currentVideoPath ? `${currentVideoPath}?v=${videoVersion}` : null}
                    onUpload={handleVideoUpload}
                    onDelete={handleVideoDelete}
                    isLoading={isUploading}
                  />
                </Column>
              </Grid>
            </div>
          </div>
        ) : activeTab === 'general' ? (
          <>
            <SectionDescription>
              Configure general site settings that affect the overall functionality and appearance of your website. This includes site name, contact information, and other customizable options. Changes made here will be reflected across your entire site.
            </SectionDescription>
            <div className="flex justify-between items-center">
              <div>
                {successMessage && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <p className="text-green-600">{successMessage}</p>
                  </div>
                )}
              </div>
            </div>

            {/* New Setting Form - Only visible to admins */}
            {isAdmin && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Add New Setting</h2>
                  <button
                    onClick={() => setIsAddingNew(!isAddingNew)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isAddingNew ? 'Cancel' : 'Add New Setting'}
                  </button>
                </div>

                {isAddingNew && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="new-key" className="block text-sm font-medium text-gray-700">
                        Key
                      </label>
                      <input
                        type="text"
                        id="new-key"
                        value={newSetting.key}
                        onChange={(e) => setNewSetting(prev => ({ ...prev, key: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="new-value" className="block text-sm font-medium text-gray-700">
                        Value
                      </label>
                      <input
                        type="text"
                        id="new-value"
                        value={newSetting.value}
                        onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <button
                      onClick={handleAddNew}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add Setting
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Settings List */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Current Settings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Key
                      </th>
                      <th scope="col" className="w-3/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th scope="col" className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      {isAdmin && (
                        <th scope="col" className="w-1/6 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(editedSettings).map(([key, value]) => (
                      <tr key={key} className="hover:bg-gray-50">
                        <td className="w-1/6 px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{key}</div>
                        </td>
                        <td className="w-3/6 px-6 py-4">
                          {isAdmin ? (
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => handleSettingChange(key, e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          ) : (
                            <div className="text-sm text-gray-900">{value}</div>
                          )}
                        </td>
                        <td className="w-1/6 px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(settings?.find(s => s.key === key)?.updated_at || '').toLocaleString()}
                        </td>
                        {isAdmin && (
                          <td className="w-1/6 px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDelete(key)}
                              className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Save All Button - Only visible to admins */}
            {isAdmin && Object.keys(editedSettings).length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={handleSaveAll}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save All Changes
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <SectionDescription>
              Manage your site's content and translations. This section allows you to edit text content in both English and French, ensuring your website is accessible to a bilingual audience. Changes made here will be reflected immediately across your site.
            </SectionDescription>
            <TranslationsTab />
          </>
        )}
      </div>
    </Container>
  );
};

export default SettingsPage; 