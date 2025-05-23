/**
 * API service
 * Handles API calls to the backend for content management
 */

// API base URL - use relative path for all environments
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// About section interface
export interface AboutSection {
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

// Team member interface
export interface TeamMember {
  team_id: number;
  name: string;
  title: string;
  fr_title: string | null;
  bio: string | null;
  fr_bio: string | null;
  image_url: string | null;
  email: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// User interface
export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  admin: boolean;
  google_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TranslationResponse {
  translation: string;
}

// Project interface
export interface Project {
  project_id: number;
  title: string;
  description: string;
  display_order: number;
  image_url: string | null;
  fr_title: string | null;
  fr_description: string | null;
  type_id: number;  // Required foreign key to project_types
  status: string;
  git_url: string | null;
  demo_url: string | null;
  created_at: string;
  updated_at: string;
}

// Project Type interface
export interface ProjectType {
  type_id: number;
  type: string;
  fr_type: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get all about sections
 * @returns Promise with about sections
 */
export const getAboutSections = async (): Promise<AboutSection[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/about`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get about sections');
    }

    const data = await response.json();
    return data.sections;
  } catch (error) {
    console.error('Error getting about sections:', error);
    return [];
  }
};

/**
 * Create a new about section
 * @param section The section data
 * @returns Promise with creation result
 */
export const createAboutSection = async (section: Omit<AboutSection, 'about_id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; id?: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/about`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(section),
    });

    if (!response.ok) {
      throw new Error('Failed to create about section');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating about section:', error);
    return { success: false };
  }
};

/**
 * Update an about section
 * @param id The section ID
 * @param section The section data
 * @returns Promise with update result
 */
export const updateAboutSection = async (id: number, section: Partial<AboutSection>): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/about/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(section),
    });

    if (!response.ok) {
      throw new Error('Failed to update about section');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating about section:', error);
    return { success: false };
  }
};

/**
 * Delete an about section
 * @param id The section ID
 * @returns Promise with deletion result
 */
export const deleteAboutSection = async (id: number): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/about/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete about section');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting about section:', error);
    return { success: false };
  }
};

/**
 * Get all team members
 * @returns Promise with team members
 */
export const getTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/team`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get team members');
    }

    const data = await response.json();
    return data.members;
  } catch (error) {
    console.error('Error getting team members:', error);
    return [];
  }
};

/**
 * Create a new team member
 * @param member The member data
 * @returns Promise with creation result
 */
export const createTeamMember = async (member: Omit<TeamMember, 'team_id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; id?: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/team`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(member),
    });

    if (!response.ok) {
      throw new Error('Failed to create team member');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating team member:', error);
    return { success: false };
  }
};

/**
 * Update a team member
 * @param id The member ID
 * @param member The member data
 * @returns Promise with update result
 */
export const updateTeamMember = async (id: number, member: Partial<TeamMember>): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/team/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(member),
    });

    if (!response.ok) {
      throw new Error('Failed to update team member');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating team member:', error);
    return { success: false };
  }
};

/**
 * Delete a team member
 * @param id The member ID
 * @returns Promise with deletion result
 */
export const deleteTeamMember = async (id: number): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/team/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete team member');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting team member:', error);
    return { success: false };
  }
};

/**
 * Get all users
 * @returns Promise with users
 */
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get users');
    }

    const data = await response.json();
    return data.users;
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

/**
 * Create a new user
 * @param user The user data
 * @returns Promise with creation result
 */
export const createUser = async (user: Omit<User, 'user_id' | 'created_at' | 'updated_at' | 'google_id'>): Promise<{ success: boolean; id?: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false };
  }
};

/**
 * Update a user
 * @param id The user ID
 * @param user The user data
 * @returns Promise with update result
 */
export const updateUser = async (id: number, user: Partial<User>): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false };
  }
};

/**
 * Delete a user
 * @param id The user ID
 * @returns Promise with deletion result
 */
export const deleteUser = async (id: number): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false };
  }
};

/**
 * Toggle admin status for a user
 * @param id The user ID
 * @param isAdmin The new admin status
 * @returns Promise with update result
 */
export const toggleUserAdminStatus = async (id: number, isAdmin: boolean): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}/admin`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ admin: isAdmin }),
    });

    if (!response.ok) {
      throw new Error('Failed to update user admin status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user admin status:', error);
    return { success: false };
  }
};

/**
 * Update multiple about section orders at once
 * @param sections Array of objects with about_id and display_order
 * @returns Promise with update result
 */
export const updateAboutSectionOrders = async (
  sections: Array<{ about_id: number; display_order: number }>
): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/about/reorder`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sections }),
    });

    if (!response.ok) {
      throw new Error('Failed to update about section orders');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating about section orders:', error);
    return { success: false };
  }
};

/**
 * Upload an image for an about section
 * @param file The image file to upload
 * @returns Promise with upload result
 */
export const uploadAboutImage = async (file: File): Promise<{ success: boolean; imagePath?: string }> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/admin/upload/about-image`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading about image:', error);
    return { success: false };
  }
};

/**
 * Upload an image for a team member
 * @param file The image file to upload
 * @returns Promise with upload result
 */
export const uploadTeamImage = async (file: File): Promise<{ success: boolean; imagePath?: string }> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/admin/upload/team-image`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading team image:', error);
    return { success: false };
  }
};

export const translateText = async (text: string): Promise<string> => {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    return data.translation;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate text');
  }
};

/**
 * Get all projects
 * @returns Promise with projects array
 */
export const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get projects');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting projects:', error);
    return [];
  }
};

/**
 * Create a new project
 * @param project The project data
 * @returns Promise with creation result
 */
export const createProject = async (project: Omit<Project, 'project_id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; id?: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/projects`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    });

    if (!response.ok) {
      throw new Error('Failed to create project');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating project:', error);
    return { success: false };
  }
};

/**
 * Update a project
 * @param id The project ID
 * @param project The project data
 * @returns Promise with update result
 */
export const updateProject = async (id: number, project: Partial<Project>): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/projects/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    });

    if (!response.ok) {
      throw new Error('Failed to update project');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating project:', error);
    return { success: false };
  }
};

/**
 * Delete a project
 * @param id The project ID
 * @returns Promise with deletion result
 */
export const deleteProject = async (id: number): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/projects/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete project');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting project:', error);
    return { success: false };
  }
};

/**
 * Update project display orders
 * @param projectOrders Array of project objects with new display orders
 * @returns Promise with update result
 */
export const updateProjectOrders = async (
  projects: Array<{ project_id: number; display_order: number }>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/projects/reorder`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projects }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Server error:', data);
      return { 
        success: false, 
        error: data.message || 'Failed to update project orders'
      };
    }

    return data;
  } catch (error) {
    console.error('Error updating project orders:', error);
    return { 
      success: false, 
      error: 'Failed to connect to server'
    };
  }
};

/**
 * Upload an image for a project
 * @param file The image file to upload
 * @returns Promise with upload result
 */
export const uploadProjectImage = async (file: File): Promise<{ success: boolean; imagePath?: string }> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/admin/upload/project-image`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading project image:', error);
    return { success: false };
  }
};

/**
 * Update team member display orders
 * @param members Array of member objects with new display orders
 * @returns Promise with update result
 */
export const updateTeamMemberOrders = async (members: { team_id: number; display_order: number }[]): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/team/reorder`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ members }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Server error:', errorData);
      throw new Error('Failed to update team member orders');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating team member orders:', error);
    return { success: false };
  }
};

/**
 * Get all project types
 * @returns Promise with project types array
 */
export const getProjectTypes = async (): Promise<ProjectType[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/project-types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get project types');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting project types:', error);
    return [];
  }
};

/**
 * Create a new project type
 * @param projectType The project type data
 * @returns Promise with creation result
 */
export const createProjectType = async (projectType: Omit<ProjectType, 'type_id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; id?: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/project-types`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectType),
    });

    if (!response.ok) {
      throw new Error('Failed to create project type');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating project type:', error);
    return { success: false };
  }
};

/**
 * Update a project type
 * @param id The project type ID
 * @param projectType The project type data
 * @returns Promise with update result
 */
export const updateProjectType = async (id: number, projectType: Partial<ProjectType>): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/project-types/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectType),
    });

    if (!response.ok) {
      throw new Error('Failed to update project type');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating project type:', error);
    return { success: false };
  }
};

/**
 * Delete a project type
 * @param id The project type ID
 * @returns Promise with deletion result
 */
export const deleteProjectType = async (id: number): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/project-types/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete project type');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting project type:', error);
    return { success: false };
  }
}; 