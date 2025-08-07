import { API_BASE_URL } from '../config/api';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  isVerified: boolean;
  profilePictureUrl: string | null;
  createdAt: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PrivacySettings {
  showProfile: boolean;
  allowSearch: boolean;
  notifications: boolean;
  familyVisibility: 'public' | 'private';
}

export interface UpdatePrivacyRequest {
  showProfile: boolean;
  allowSearch: boolean;
  notifications: boolean;
  familyVisibility: 'public' | 'private';
}

export interface UserStatistics {
  familyMembers: number;
  linkedFamilies: number;
  verifiedMembers: number;
  totalConnections: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

class UserApi {
  private baseUrl = `${API_BASE_URL}/users`;

  private getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getProfile(token: string): Promise<ApiResponse<{ user: UserProfile }>> {
    try {
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      const result = await response.json();
      console.log('Get profile response:', result);
      return result;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  async updateProfile(token: string, data: UpdateProfileRequest): Promise<ApiResponse<{ user: UserProfile }>> {
    try {
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Update profile response:', result);
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async changePassword(token: string, data: ChangePasswordRequest): Promise<ApiResponse<{}>> {
    try {
      const response = await fetch(`${this.baseUrl}/change-password`, {
        method: 'PUT',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Change password response:', result);
      return result;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  async getPrivacySettings(token: string): Promise<ApiResponse<PrivacySettings>> {
    try {
      const response = await fetch(`${this.baseUrl}/privacy-settings`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      const result = await response.json();
      console.log('Get privacy settings response:', result);
      return result;
    } catch (error) {
      console.error('Get privacy settings error:', error);
      throw error;
    }
  }

  async updatePrivacySettings(token: string, data: UpdatePrivacyRequest): Promise<ApiResponse<{}>> {
    try {
      const response = await fetch(`${this.baseUrl}/privacy-settings`, {
        method: 'PUT',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Update privacy settings response:', result);
      return result;
    } catch (error) {
      console.error('Update privacy settings error:', error);
      throw error;
    }
  }

  async getStatistics(token: string): Promise<ApiResponse<UserStatistics>> {
    try {
      const response = await fetch(`${this.baseUrl}/statistics`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      const result = await response.json();
      console.log('Get statistics response:', result);
      return result;
    } catch (error) {
      console.error('Get statistics error:', error);
      throw error;
    }
  }
}

export const userApi = new UserApi();