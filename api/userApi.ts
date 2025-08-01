import { API_BASE_URL } from '../config/api';

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  profilePicture?: File;
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
  familyVisibility: boolean;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data?: {
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
      dateOfBirth: string;
      isVerified: boolean;
      profilePictureUrl?: string;
      createdAt: string;
    };
    statistics?: {
      familyMembers: number;
      linkedFamilies: number;
      verifiedMembers: number;
      totalConnections: number;
    };
    privacySettings?: PrivacySettings;
  };
}

class UserApi {
  private baseUrl = `${API_BASE_URL}/users`;

  private getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getProfile(token: string): Promise<UserResponse> {
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

  async updateProfile(data: UpdateProfileRequest, token: string): Promise<UserResponse> {
    try {
      const formData = new FormData();
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('phone', data.phone);
      formData.append('dateOfBirth', data.dateOfBirth);
      if (data.profilePicture) {
        formData.append('profilePicture', data.profilePicture);
      }

      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      console.log('Update profile response:', result);
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async changePassword(data: ChangePasswordRequest, token: string): Promise<UserResponse> {
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

  async getPrivacySettings(token: string): Promise<UserResponse> {
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

  async updatePrivacySettings(data: PrivacySettings, token: string): Promise<UserResponse> {
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

  async getStatistics(token: string): Promise<UserResponse> {
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