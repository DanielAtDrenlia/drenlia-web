/**
 * API service
 * Handles API calls to the backend for content management
 */

// API base URL - use relative path for all environments
const API_BASE_URL = '/api';

// About section interface
export interface AboutSection {
  about_id: number;
  title: string;
  description: string;
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
  bio: string | null;
  image_url: string | null;
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