import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAboutSections, getTeamMembers, getUsers } from '../../services/apiService';
import { toast } from 'react-toastify';

/**
 * Admin home page
 * Displays summary information and quick links
 */
const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [aboutCount, setAboutCount] = useState<number>(0);
  const [teamCount, setTeamCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSetupRunning, setIsSetupRunning] = useState<boolean>(false);
  const [isStopping, setIsStopping] = useState<boolean>(false);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalOutput, setModalOutput] = useState<string>('');
  const [modalTitle, setModalTitle] = useState<string>('');
  const dataFetchedRef = useRef<boolean>(false);

  // Check setup service status
  const checkSetupStatus = async () => {
    try {
      const response = await fetch('/api/admin/setup/status', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setIsSetupRunning(data.isRunning);
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
    }
  };

  // Check setup status periodically
  useEffect(() => {
    if (!user?.isAdmin) return;

    checkSetupStatus();
    const interval = setInterval(checkSetupStatus, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [user]);

  // Fetch summary data
  useEffect(() => {
    // Skip if data has already been fetched or user is not available
    if (dataFetchedRef.current || !user) {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use Promise.all to fetch data in parallel
        const [aboutSections, teamMembers] = await Promise.all([
          getAboutSections(),
          getTeamMembers()
        ]);
        
        setAboutCount(aboutSections.length);
        setTeamCount(teamMembers.length);
        
        // Fetch users (if admin)
        if (user?.isAdmin) {
          const users = await getUsers();
          setUserCount(users.length);
        }
        
        // Mark data as fetched
        dataFetchedRef.current = true;
      } catch (error) {
        console.error('Error fetching summary data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Dashboard cards
  const cards = [
    {
      title: 'About Sections',
      count: aboutCount,
      description: 'Manage the content of the About page',
      link: '/admin/about',
      color: 'bg-blue-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
    {
      title: 'Team Members',
      count: teamCount,
      description: 'Manage team member profiles',
      link: '/admin/team',
      color: 'bg-green-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: 'Users',
      count: userCount,
      description: 'Manage user accounts and permissions',
      link: '/admin/users',
      color: 'bg-purple-600',
      adminOnly: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  const handleToggleSetup = async () => {
    setShowModal(true);
    setModalTitle(isSetupRunning ? 'Disable Setup Service' : 'Start Setup Service');
    setModalOutput('');

    if (isSetupRunning) {
      try {
        setIsStopping(true);
        const response = await fetch('/api/admin/setup/stop', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        
        if (data.success) {
          setIsSetupRunning(false);
          setModalOutput(`Success: ${data.message}\n\nOutput:\n${data.output}${data.stderr ? `\n\nErrors:\n${data.stderr}` : ''}`);
          toast.success('Setup service disabled successfully');
        } else {
          throw new Error(data.error || 'Failed to disable setup service');
        }
      } catch (error) {
        console.error('Error disabling setup service:', error);
        toast.error('Failed to disable setup service');
        setModalOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsStopping(false);
      }
    } else {
      try {
        setIsStarting(true);
        const response = await fetch('/api/admin/setup/start', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        
        if (data.success) {
          setIsSetupRunning(true);
          setModalOutput(`Success: ${data.message}\n\nOutput:\n${data.output}${data.stderr ? `\n\nErrors:\n${data.stderr}` : ''}`);
          toast.success('Setup service started successfully');
        } else {
          throw new Error(data.error || 'Failed to start setup service');
        }
      } catch (error) {
        console.error('Error starting setup service:', error);
        toast.error('Failed to start setup service');
        setModalOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsStarting(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          {user?.isAdmin && (
            <button
              onClick={handleToggleSetup}
              disabled={isStopping || isStarting}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isSetupRunning 
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                  : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              } disabled:opacity-50`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1-1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              {isStopping ? 'Disabling...' : isStarting ? 'Starting...' : isSetupRunning ? 'Disable Setup Service' : 'Start Setup Service'}
            </button>
          )}
        </div>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.firstName}! Here's an overview of your content.
        </p>
      </div>

      {isSetupRunning && user?.isAdmin && (
        <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Security Warning</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>The Setup Service is currently running and accessible. For security reasons, it's recommended to disable the service when not in use to prevent unauthorized access to the setup page.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards
            .filter((card) => !card.adminOnly || user?.isAdmin)
            .map((card) => (
              <Link
                key={card.title}
                to={card.link}
                className="block bg-white overflow-hidden rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md hover:border-indigo-300"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${card.color} text-white`}>
                      {card.icon}
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-lg font-medium text-gray-900 truncate">{card.title}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-3xl font-semibold text-indigo-600">{card.count}</div>
                      </dd>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                  <div className="text-sm">
                    <div className="font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
                      <span>{card.description}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="ml-1.5 h-4 w-4" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      )}

      <div className="mt-10 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Tips</h3>
          <p className="mt-1 text-sm text-gray-500">
            {user?.isAdmin ? 'How to manage your website content and users' : 'How to manage your website content'}
          </p>
        </div>
        <div>
          <dl>
            <div className="bg-gray-50 px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-900">About Sections</dt>
              <dd className="mt-1 text-sm text-gray-600 sm:mt-0 sm:col-span-2">
                Edit the content of your About page, including your story, mission, and values. You can add, edit, and reorder sections to create a compelling narrative about your organization.
              </dd>
            </div>
            {user?.isAdmin && (
              <div className="bg-white px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-900">Projects</dt>
                <dd className="mt-1 text-sm text-gray-600 sm:mt-0 sm:col-span-2">
                  Manage your portfolio projects, including titles, descriptions, and images. You can add new projects, edit existing ones, and reorder them to showcase your best work.
                </dd>
              </div>
            )}
            <div className={`${user?.isAdmin ? 'bg-gray-50' : 'bg-white'} px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4`}>
              <dt className="text-sm font-medium text-gray-900">Team Members</dt>
              <dd className="mt-1 text-sm text-gray-600 sm:mt-0 sm:col-span-2">
                Manage your team profiles, including names, titles, bios, and photos. Keep your team information up to date and showcase your organization's talent.
              </dd>
            </div>
            {user?.isAdmin && (
              <>
                <div className="bg-gray-50 px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-900">Users</dt>
                  <dd className="mt-1 text-sm text-gray-600 sm:mt-0 sm:col-span-2">
                    Manage user accounts and admin permissions. Create new users, modify existing ones, and control access levels to maintain security.
                  </dd>
                </div>
                <div className="bg-white px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-900">Settings</dt>
                  <dd className="mt-1 text-sm text-gray-600 sm:mt-0 sm:col-span-2">
                    Configure site-wide settings, including visual assets, general settings, and content translations. Customize your website's appearance and functionality.
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </div>

      {/* Output Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{modalTitle}</h3>
            </div>
            <div className="px-6 py-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{modalOutput}</pre>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage; 