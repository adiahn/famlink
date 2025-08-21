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
  // New fields for enhanced family tree structure
  motherId?: string;
  parentType?: 'father' | 'mother' | 'child';
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

// New interfaces for enhanced family tree structure
export interface InitializeFamilyCreationRequest {
  creationType: 'own_family' | 'parents_family';
  familyName?: string;
}

export interface SetupParentsRequest {
  father: {
    firstName: string;
    lastName: string;
    birthYear: string;
    isDeceased: boolean;
    deathYear?: string;
  };
  mothers: Array<{
    firstName: string;
    lastName: string;
    birthYear: string;
    isDeceased: boolean;
    deathYear?: string;
    spouseOrder: number;
  }>;
}

export interface TreeStructureResponse {
  family: {
    id: string;
    name: string;
    creationType: string;
  };
  treeStructure: {
    father: {
      id: string;
      name: string;
      details: FamilyMember;
    };
    mothers: Array<{
      id: string;
      name: string;
      details: FamilyMember;
      branch: {
        id: string;
        name: string;
        order: number;
      };
      children: FamilyMember[];
    }>;
    branches: Array<{
      id: string;
      name: string;
      order: number;
    }>;
    statistics: {
      totalMembers: number;
      totalBranches: number;
      totalChildren: number;
    };
  };
}

export interface AvailableMothersResponse {
  mothers: Array<{
    id: string;
    name: string;
    spouseOrder: number;
    branchName: string;
    childrenCount: number;
  }>;
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
      // If there's an avatar, use FormData, otherwise use JSON
      if (data.avatar) {
        const formData = new FormData();
        formData.append('firstName', data.firstName);
        formData.append('lastName', data.lastName);
        formData.append('relationship', data.relationship);
        formData.append('birthYear', data.birthYear);
        formData.append('isDeceased', data.isDeceased ? 'true' : 'false');
        if (data.deathYear) {
          formData.append('deathYear', data.deathYear);
        }
        if (data.motherId) {
          formData.append('motherId', data.motherId);
        }
        if (data.parentType) {
          formData.append('parentType', data.parentType);
        }
        formData.append('avatar', data.avatar);

        console.log('Sending FormData for add member with avatar');
        console.log('FormData entries:');
        for (let [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`);
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
      } else {
        // Use JSON for requests without avatar
        const jsonData = {
          firstName: data.firstName,
          lastName: data.lastName,
          relationship: data.relationship,
          birthYear: data.birthYear,
          isDeceased: data.isDeceased,
          deathYear: data.deathYear,
          ...(data.motherId && { motherId: data.motherId }),
          ...(data.parentType && { parentType: data.parentType }),
        };

        console.log('Sending JSON data for add member:', jsonData);
        console.log('Mother ID being sent:', data.motherId);
        console.log('Parent Type being sent:', data.parentType);

        const response = await fetch(`${this.baseUrl}/${familyId}/members`, {
          method: 'POST',
          headers: this.getAuthHeaders(token),
          body: JSON.stringify(jsonData),
        });

        const result = await response.json();
        console.log('Add member response:', result);
        return result;
      }
    } catch (error) {
      console.error('Add member error:', error);
      throw error;
    }
  }

  async updateMember(familyId: string, memberId: string, data: UpdateMemberRequest, token: string): Promise<FamilyResponse<FamilyData>> {
    try {
      // If there's an avatar, use FormData, otherwise use JSON
      if (data.avatar) {
        const formData = new FormData();
        formData.append('firstName', data.firstName);
        formData.append('lastName', data.lastName);
        formData.append('relationship', data.relationship);
        formData.append('birthYear', data.birthYear);
        formData.append('isDeceased', data.isDeceased ? 'true' : 'false');
        if (data.deathYear) {
          formData.append('deathYear', data.deathYear);
        }
        formData.append('avatar', data.avatar);

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
      } else {
        // Use JSON for requests without avatar
        const jsonData = {
          firstName: data.firstName,
          lastName: data.lastName,
          relationship: data.relationship,
          birthYear: data.birthYear,
          isDeceased: data.isDeceased,
          deathYear: data.deathYear,
        };

        const response = await fetch(`${this.baseUrl}/${familyId}/members/${memberId}`, {
          method: 'PUT',
          headers: this.getAuthHeaders(token),
          body: JSON.stringify(jsonData),
        });

        const result = await response.json();
        console.log('Update member response:', result);
        return result;
      }
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

  // New methods for enhanced family tree structure
  async initializeFamilyCreation(data: InitializeFamilyCreationRequest, token: string): Promise<FamilyResponse<{ familyId: string; creationType: string; currentStep: string; nextStep: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/initialize-creation`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Initialize family creation response:', result);
      return result;
    } catch (error) {
      console.error('Initialize family creation error:', error);
      throw error;
    }
  }

  async setupParents(familyId: string, data: SetupParentsRequest, token: string): Promise<FamilyResponse<{
    family: {
      id: string;
      name: string;
      creationType: string;
      currentStep: string;
    };
    father: {
      id: string;
      firstName: string;
      lastName: string;
      birthYear: string;
      isDeceased: boolean;
    };
    mothers: Array<{
      id: string;
      firstName: string;
      lastName: string;
      birthYear: string;
      isDeceased: boolean;
      spouseOrder: number;
    }>;
    branches: Array<{
      id: string;
      name: string;
      order: number;
    }>;
  }>> {
    try {
      console.log('Setup parents request:', {
        url: `${this.baseUrl}/${familyId}/setup-parents`,
        data: data,
        token: token ? token.substring(0, 20) + '...' : 'null'
      });

      const response = await fetch(`${this.baseUrl}/${familyId}/setup-parents`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(data),
      });

      console.log('Setup parents response status:', response.status);
      console.log('Setup parents response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.error('Setup parents HTTP error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Setup parents error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Setup parents response:', result);
      return result;
    } catch (error) {
      console.error('Setup parents error:', error);
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      }
      throw error;
    }
  }

  async getTreeStructure(familyId: string, token: string): Promise<FamilyResponse<TreeStructureResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/${familyId}/tree-structure`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      const result = await response.json();
      console.log('Get tree structure response:', result);
      return result;
    } catch (error) {
      console.error('Get tree structure error:', error);
      throw error;
    }
  }

  async getAvailableMothers(familyId: string, token: string): Promise<FamilyResponse<AvailableMothersResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/${familyId}/available-mothers`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      const result = await response.json();
      console.log('Get available mothers response:', result);
      return result;
    } catch (error) {
      console.error('Get available mothers error:', error);
      throw error;
    }
  }
}

export const familyApi = new FamilyApi(); 