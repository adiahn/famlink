import { API_BASE_URL } from '../config/api';

export interface SearchUsersRequest {
  q: string;
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  success: boolean;
  message: string;
  data?: {
    users?: Array<{
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
      isVerified: boolean;
    }>;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

class SearchApi {
  private baseUrl = `${API_BASE_URL}/search`;

  private getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async searchUsers(data: SearchUsersRequest, token: string): Promise<SearchResponse> {
    try {
      const params = new URLSearchParams({
        q: data.q,
        page: (data.page || 1).toString(),
        limit: (data.limit || 20).toString(),
      });

      const response = await fetch(`${this.baseUrl}/users?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      const result = await response.json();
      console.log('Search users response:', result);
      return result;
    } catch (error) {
      console.error('Search users error:', error);
      throw error;
    }
  }
}

export const searchApi = new SearchApi(); 