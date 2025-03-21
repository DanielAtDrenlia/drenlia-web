import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { API_URL } from './config';
import FrontendEnvSetup from './components/setup/FrontendEnvSetup';
import BackendEnvSetup from './components/setup/BackendEnvSetup';
import AdminUserSetup from './components/setup/AdminUserSetup';
import SiteSettingsSetup from './components/setup/SiteSettingsSetup';
import { toast, Toaster } from 'react-hot-toast';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TabsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid #ddd;
  padding-bottom: 1rem;
`;

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  color: ${props => props.$active ? 'var(--primary-color)' : '#666'};
  border-bottom: 2px solid ${props => props.$active ? 'var(--primary-color)' : 'transparent'};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: var(--primary-color);
  }

  ${props => props.$active && `
    color: #1a73e8;
    border-bottom-color: #1a73e8;
  `}
`;

const TabNumber = styled.span<{ $active: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  background: ${props => props.$active ? 'var(--primary-color)' : '#e5e7eb'};
  color: ${props => props.$active ? 'white' : '#666'};
  transition: all 0.2s ease;

  ${props => props.$active && `
    background-color: #1a73e8;
    color: white;
  `}
`;

const Content = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  margin-top: 6rem; /* Add space for the fixed header */
`;

const Button = styled.button`
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-left: 1rem;

  &:hover {
    background: var(--primary-color-dark);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const DescriptionHeader = styled.div<{ $showDescription?: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #fff;
  border-radius: ${props => props.$showDescription ? '8px 8px 0 0' : '8px'};
  cursor: pointer;
  margin-bottom: ${props => props.$showDescription ? '0' : '1rem'};
  border: 1px solid #e2e8f0;
`;

const HeaderText = styled.div`
  flex: 1;
`;

const HeaderTitle = styled.h2`
  font-size: 1.125rem;
  color: #1e293b;
  margin: 0;
  font-weight: 600;
`;

const TabDescription = styled.div<{ $isVisible: boolean }>`
  background-color: #f8fafc;
  padding: 1rem;
  margin-bottom: 1rem;
  display: ${props => props.$isVisible ? 'block' : 'none'};
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.5;
  border: 1px solid #e2e8f0;
  border-radius: 0 0 8px 8px;
  border-top: none;
`;

const TabTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ToggleButton = styled.button<{ $isVisible: boolean }>`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;

  &:hover {
    color: var(--primary-color);
  }

  svg {
    transform: ${props => props.$isVisible ? 'rotate(180deg)' : 'rotate(0)'};
    transition: transform 0.2s ease;
    width: 16px;
    height: 16px;
    min-width: 16px;
    min-height: 16px;
    flex: 0 0 16px;
  }
`;

const tabDescriptions = {
  frontend: 'Configure frontend environment variables that control the React application behavior, such as API URLs and feature flags.',
  backend: 'Set up backend environment variables for server configuration, including database connections, email settings, and API keys.',
  admin: 'Create or modify the main administrator account that will have full access to the application.',
  settings: 'Configure general site settings like site name, contact information, and other customizable options.'
};

type TabType = 'frontend' | 'backend' | 'admin' | 'settings';

interface AdminUser {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  _isDefault: boolean;
}

const SetupPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>(() => {
    const hash = window.location.hash.slice(1) as TabType;
    return ['frontend', 'backend', 'admin', 'settings'].includes(hash) ? hash : 'frontend';
  });
  const [showDescription, setShowDescription] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [frontendEnv, setFrontendEnv] = useState<Record<string, string>>({});
  const [backendEnv, setBackendEnv] = useState<Record<string, string>>({});
  const [adminUser, setAdminUser] = useState<AdminUser>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    _isDefault: true
  });
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Handle tab changes
  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    window.location.hash = tab;
  };

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as TabType;
      if (['frontend', 'backend', 'admin', 'settings'].includes(hash)) {
        setCurrentTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [adminRes, frontendRes, backendRes, settingsRes] = await Promise.all([
        fetch('/api/setup/admin'),
        fetch('/api/setup/env/.env'),
        fetch('/api/setup/env/setup.env'),
        fetch('/api/setup/settings')
      ]);

      const [adminData, frontendData, backendData, settingsData] = await Promise.all([
        adminRes.json(),
        frontendRes.json(),
        backendRes.json(),
        settingsRes.json()
      ]);

      setAdminUser(adminData);
      setFrontendEnv(frontendData);
      setBackendEnv(backendData);
      setSettings(settingsData);
      
      // Set hasUnsavedChanges to true if we have default values
      const hasDefaultValues = adminData._isDefault || Object.keys(settingsData).length === 0;
      setHasUnsavedChanges(hasDefaultValues);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load setup data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdate = useCallback((type: TabType, values: any) => {
    setHasUnsavedChanges(true);
    switch (type) {
      case 'frontend':
        setFrontendEnv(values);
        break;
      case 'backend':
        setBackendEnv(values);
        break;
      case 'admin':
        setAdminUser(values);
        break;
      case 'settings':
        setSettings(values);
        break;
    }
  }, []);

  const handleFrontendUpdate = useCallback((values: any) => {
    handleUpdate('frontend', values);
  }, [handleUpdate]);

  const handleBackendUpdate = useCallback((values: any) => {
    handleUpdate('backend', values);
  }, [handleUpdate]);

  const handleAdminUpdate = useCallback((values: any) => {
    handleUpdate('admin', values);
  }, [handleUpdate]);

  const handleSettingsUpdate = useCallback((values: any) => {
    handleUpdate('settings', values);
  }, [handleUpdate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        fetch('/api/setup/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adminUser)
        }),
        fetch('/api/setup/env/.env', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(frontendEnv)
        }),
        fetch('/api/setup/env/setup.env', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendEnv)
        }),
        fetch('/api/setup/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        })
      ]);

      setHasUnsavedChanges(false);
      toast.success('All settings saved successfully');
      // Reload data to ensure we have the latest from the database
      loadData();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const CurrentTabComponent = useCallback(() => {
    switch (currentTab) {
      case 'frontend':
        return <FrontendEnvSetup onUpdate={handleFrontendUpdate} initialValues={frontendEnv} />;
      case 'backend':
        return <BackendEnvSetup onUpdate={handleBackendUpdate} initialValues={backendEnv} />;
      case 'admin':
        return <AdminUserSetup 
          onUpdate={handleAdminUpdate} 
          initialValues={{
            first_name: adminUser.first_name,
            last_name: adminUser.last_name,
            email: adminUser.email,
            password: '',
            _isDefault: adminUser._isDefault
          }} 
        />;
      case 'settings':
        return <SiteSettingsSetup onUpdate={handleSettingsUpdate} initialValues={settings} />;
      default:
        return null;
    }
  }, [currentTab, handleFrontendUpdate, handleBackendUpdate, handleAdminUpdate, handleSettingsUpdate, frontendEnv, backendEnv, adminUser, settings]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <Container>Error: {error}</Container>;
  }

  return (
    <>
      <Header>
        <HeaderContent>
          <Tabs>
            <Tab 
              $active={currentTab === 'frontend'} 
              onClick={() => handleTabChange('frontend')}
            >
              <TabTitle>
                <TabNumber $active={currentTab === 'frontend'}>1</TabNumber>
                Frontend Environment
              </TabTitle>
            </Tab>
            <Tab 
              $active={currentTab === 'backend'} 
              onClick={() => handleTabChange('backend')}
            >
              <TabTitle>
                <TabNumber $active={currentTab === 'backend'}>2</TabNumber>
                Backend Environment
              </TabTitle>
            </Tab>
            <Tab 
              $active={currentTab === 'admin'} 
              onClick={() => handleTabChange('admin')}
            >
              <TabTitle>
                <TabNumber $active={currentTab === 'admin'}>3</TabNumber>
                Admin User
              </TabTitle>
            </Tab>
            <Tab 
              $active={currentTab === 'settings'} 
              onClick={() => handleTabChange('settings')}
            >
              <TabTitle>
                <TabNumber $active={currentTab === 'settings'}>4</TabNumber>
                Site Settings
              </TabTitle>
            </Tab>
          </Tabs>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save All Settings'}
            {hasUnsavedChanges && ' *'}
          </Button>
        </HeaderContent>
      </Header>

      <Container>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              maxWidth: '500px',
              fontSize: '14px'
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff'
              },
              style: {
                fontSize: '14px'
              }
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff'
              },
              style: {
                fontSize: '14px'
              }
            }
          }}
        />
        <Content>
          <DescriptionHeader 
            onClick={() => setShowDescription(!showDescription)}
            $showDescription={showDescription}
          >
            <HeaderText>
              <HeaderTitle>What is this section?</HeaderTitle>
            </HeaderText>
            <ToggleButton $isVisible={showDescription}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </ToggleButton>
          </DescriptionHeader>

          <TabDescription $isVisible={showDescription}>
            {tabDescriptions[currentTab]}
          </TabDescription>

          <CurrentTabComponent />
        </Content>
      </Container>
    </>
  );
};

export default SetupPage; 