import React, { useState } from 'react';
import { useSettings } from '../../services/settingsService';
import TranslationsTab from '../../components/admin/TranslationsTab';
import { useAuth } from '../../context/AuthContext';

export interface Setting {
  key: string;
  value: string;
  updated_at: string;
}

const SettingsPage: React.FC = () => {
  const { settings, isLoading, error, updateSetting } = useSettings();
  const { user } = useAuth();
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newSetting, setNewSetting] = useState({ key: '', value: '' });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'translations'>('general');

  const isAdmin = user?.isAdmin || false;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Initialize editedSettings with current settings
  if (settings && Object.keys(editedSettings).length === 0) {
    const initialSettings: Record<string, string> = {};
    settings.forEach(setting => {
      initialSettings[setting.key] = setting.value;
    });
    setEditedSettings(initialSettings);
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

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
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
            Translations
          </button>
        </nav>
      </div>

      {activeTab === 'general' ? (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
              {!isAdmin && (
                <p className="mt-1 text-sm text-gray-500">View-only mode. Contact an administrator to make changes.</p>
              )}
            </div>
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <p className="text-green-600">{successMessage}</p>
              </div>
            )}
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
        <TranslationsTab />
      )}
    </div>
  );
};

export default SettingsPage; 