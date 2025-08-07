import { API_BASE_URL } from '../config/api';

export interface CreateFamilyRequest {
  name: string;
  creatorJoinId: string;
}

export interface AddMemberRequest {
  firstName: string;
  lastName: string;
  relationship: string;
  birthYear: string;
  isDeceased: boolean;
  deathYear?: string;
  avatar?: File;
}

export interface UpdateMemberRequest {
  firstName: string;
  lastName: string;
  relationship: string;
  birthYear: string;
  isDeceased: boolean;
  deathYear?: string;
  avatar?: File;
}

export interface GetMemberJoinIdResponse {
  memberId: string;
  memberName: string;
  joinId: string;
  isFamilyCreator: boolean;
  canBeLinked: boolean;
}

export interface ValidateJoinIdResponse {
  isValid: boolean;
  memberName: string;
  familyName: string;
  isFamilyCreator: boolean;
}

export interface LinkFamilyResponse {
  linkedFamily: {
    id: string;
    name: string;
    creatorName: string;
  };
  linkedMembersCount: number;
  userLinkedMembersCount: number;
  totalLinkedMembers: number;
}

export interface LinkFamilyRequest {
  joinId: string;
}

export interface FamilyResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface FamilyData {
  family?: {
    id: string;
    name: string;
    creatorId: string;
    creatorJoinId: string;
    isMainFamily: boolean;
    createdAt: string;
  };
  members?: FamilyMember[];
  linkedFamilies?: {
    id: string;
    name: string;
    linkedAt: string;
    linkedBy: string;
  }[];
  statistics?: {
    totalMembers: number;
    originalMembers: number;
    linkedMembers: number;
    linkedFamilies: number;
  };
  member?: FamilyMember;
}

export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  name?: string;
  relationship: string;
  birthYear: string;
  isDeceased: boolean;
  deathYear?: string;
  isVerified: boolean;
  isFamilyCreator: boolean;
  joinId: string;
  joinIdUsed: boolean;
  avatarUrl?: string;
  isLinkedMember?: boolean;
  sourceFamily?: string;
  originalFamilyId?: string;
  linkedTo?: string;
  linkedFrom?: string;
}

class FamilyApi {
  private baseUrl = `${API_BASE_URL}/families`;

  private getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async createFamily(data: CreateFamilyRequest, token: string): Promise<FamilyResponse<FamilyData>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Create family response:', result);
      return result;
    } catch (error) {
      console.error('Create family error:', error);
      throw error;
    }
  }

  async getMyFamily(token: string): Promise<FamilyResponse<FamilyData>> {
    try {
      console.log('Sending token to getMyFamily:', token ? token.substring(0, 20) + '...' : 'null');
      console.log('Full token:', token);
      
      const response = await fetch(`${this.baseUrl}/my-family`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const result = await response.json();
      console.log('Get my family response:', result);
      return result;
    } catch (error) {
      console.error('Get my family error:', error);
      throw error;
    }
  }

  async addMember(familyId: string, data: AddMemberRequest, token: string): Promise<FamilyResponse<FamilyData>> {
    try {
      const formData = new FormData();
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('relationship', data.relationship);
      formData.append('birthYear', data.birthYear);
      formData.append('isDeceased', data.isDeceased.toString());
      if (data.deathYear) {
        formData.append('deathYear', data.deathYear);
      }
      if (data.avatar) {
        formData.append('avatar', data.avatar);
      }

      const response = await fetch(`${this.baseUrl}/${familyId}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      console.log('Add member response:', result);
      return result;
    } catch (error) {
      console.error('Add member error:', error);
      throw error;
    }
  }

  async updateMember(familyId: string, memberId: string, data: UpdateMemberRequest, token: string): Promise<FamilyResponse<FamilyData>> {
    try {
      const formData = new FormData();
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('relationship', data.relationship);
      formData.append('birthYear', data.birthYear);
      formData.append('isDeceased', data.isDeceased.toString());
      if (data.deathYear) {
        formData.append('deathYear', data.deathYear);
      }
      if (data.avatar) {
        formData.append('avatar', data.avatar);
      }

      const response = await fetch(`${this.baseUrl}/${familyId}/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      console.log('Update member response:', result);
      return result;
    } catch (error) {
      console.error('Update member error:', error);
      throw error;
    }
  }

  async deleteMember(familyId: string, memberId: string, token: string): Promise<FamilyResponse<FamilyData>> {
    try {
      const response = await fetch(`${this.baseUrl}/${familyId}/members/${memberId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(token),
      });

      const result = await response.json();
      console.log('Delete member response:', result);
      return result;
    } catch (error) {
      console.error('Delete member error:', error);
      throw error;
    }
  }

  async getMemberJoinId(memberId: string, token: string): Promise<FamilyResponse<GetMemberJoinIdResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/members/${memberId}/join-id`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      const result = await response.json();
      console.log('Get Member Join ID response:', result);
      return result;
    } catch (error) {
      console.error('Get Member Join ID error:', error);
      throw error;
    }
  }

  async linkFamily(data: LinkFamilyRequest, token: string): Promise<FamilyResponse<LinkFamilyResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/link`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Link family response:', result);
      return result;
    } catch (error) {
      console.error('Link family error:', error);
      throw error;
    }
  }

  async validateJoinId(joinId: string, token: string): Promise<FamilyResponse<ValidateJoinIdResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/validate-join-id/${joinId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      const result = await response.json();
      console.log('Validate Join ID response:', result);
      return result;
    } catch (error) {
      console.error('Validate Join ID error:', error);
      throw error;
    }
  }
}

export const familyApi = new FamilyApi(); 