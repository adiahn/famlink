import { create } from 'zustand';
import { familyApi, FamilyResponse, FamilyMember } from '../api/familyApi';

interface Family {
  id: string;
  name: string;
  creatorId: string;
  creatorJoinId: string;
  isMainFamily: boolean;
  members: FamilyMember[];
  linkedMembers: FamilyMember[];
  linkedFamilies: {
    id: string;
    linkedFamilyId: string;
    linkedFamilyName: string;
    linkedAt: string;
    linkedBy: string;
  }[];
  totalMembers: number;
}

interface FamilyState {
  family: Family | null;
  isLoading: boolean;
  error: string | null;
  selectedMember: string | null;
  expandedNodes: Set<string>;
}

interface FamilyActions {
  getMyFamily: (token: string) => Promise<{ success: boolean; message: string }>;
  createFamily: (data: { name: string; creatorJoinId: string }, token: string) => Promise<{ success: boolean; message: string }>;
  addMember: (familyId: string, data: {
    firstName: string;
    lastName: string;
    relationship: string;
    birthYear: string;
    isDeceased: boolean;
    deathYear?: string;
    avatar?: File;
  }, token: string) => Promise<{ success: boolean; message: string }>;
  updateMember: (familyId: string, memberId: string, data: {
    firstName: string;
    lastName: string;
    relationship: string;
    birthYear: string;
    isDeceased: boolean;
    deathYear?: string;
    avatar?: File;
  }, token: string) => Promise<{ success: boolean; message: string }>;
  deleteMember: (familyId: string, memberId: string, token: string) => Promise<{ success: boolean; message: string }>;
  generateJoinId: (familyId: string, memberId: string, token: string) => Promise<{ success: boolean; message: string; joinId?: string }>;
  linkFamily: (joinId: string, token: string) => Promise<{ success: boolean; message: string }>;
  validateJoinId: (joinId: string, token: string) => Promise<{ success: boolean; message: string; isValid?: boolean }>;
  setSelectedMember: (memberId: string | null) => void;
  toggleExpandedNode: (nodeId: string) => void;
  clearError: () => void;
  clearFamily: () => void;
}

export const useFamilyStore = create<FamilyState & FamilyActions>((set, get) => ({
  // State
  family: null,
  isLoading: false,
  error: null,
  selectedMember: null,
  expandedNodes: new Set(),

  // Actions
  getMyFamily: async (token) => {
    set({ isLoading: true, error: null });
    
    try {
      const response: FamilyResponse = await familyApi.getMyFamily(token);
      
      if (response.success && response.data?.family) {
        set({
          family: {
            ...response.data.family,
            members: response.data.members || [],
            linkedMembers: response.data.linkedMembers || [],
            linkedFamilies: response.data.linkedFamilies || [],
            totalMembers: response.data.totalMembers || 0
          },
          isLoading: false,
          error: null
        });
        return { success: true, message: response.message };
      } else {
        set({ 
          isLoading: false, 
          error: response.message || 'Failed to fetch family' 
        });
        return { success: false, message: response.message || 'Failed to fetch family' };
      }
    } catch (error) {
      console.error('Get my family error:', error);
      set({ 
        isLoading: false, 
        error: 'Network error. Please try again.' 
      });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  createFamily: async (data, token) => {
    set({ isLoading: true, error: null });
    
    try {
      const response: FamilyResponse = await familyApi.createFamily(data, token);
      
      if (response.success && response.data?.family) {
        set({
          family: {
            ...response.data.family,
            members: response.data.members || [],
            linkedMembers: response.data.linkedMembers || [],
            linkedFamilies: response.data.linkedFamilies || [],
            totalMembers: response.data.totalMembers || 0
          },
          isLoading: false,
          error: null
        });
        return { success: true, message: response.message };
      } else {
        set({ 
          isLoading: false, 
          error: response.message || 'Failed to create family' 
        });
        return { success: false, message: response.message || 'Failed to create family' };
      }
    } catch (error) {
      console.error('Create family error:', error);
      set({ 
        isLoading: false, 
        error: 'Network error. Please try again.' 
      });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  addMember: async (familyId, data, token) => {
    set({ isLoading: true, error: null });
    
    try {
      const response: FamilyResponse = await familyApi.addMember(familyId, data, token);
      
      if (response.success && response.data?.member) {
        // Update the family with the new member
        const { family } = get();
        if (family) {
          set({
            family: {
              ...family,
              members: [...family.members, response.data.member!]
            },
            isLoading: false,
            error: null
          });
        }
        return { success: true, message: response.message };
      } else {
        set({ 
          isLoading: false, 
          error: response.message || 'Failed to add member' 
        });
        return { success: false, message: response.message || 'Failed to add member' };
      }
    } catch (error) {
      console.error('Add member error:', error);
      set({ 
        isLoading: false, 
        error: 'Network error. Please try again.' 
      });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  updateMember: async (familyId, memberId, data, token) => {
    set({ isLoading: true, error: null });
    
    try {
      const response: FamilyResponse = await familyApi.updateMember(familyId, memberId, data, token);
      
      if (response.success && response.data?.member) {
        // Update the family member in the store
        const { family } = get();
        if (family) {
          set({
            family: {
              ...family,
              members: family.members.map(member => 
                member.id === memberId ? response.data!.member! : member
              )
            },
            isLoading: false,
            error: null
          });
        }
        return { success: true, message: response.message };
      } else {
        set({ 
          isLoading: false, 
          error: response.message || 'Failed to update member' 
        });
        return { success: false, message: response.message || 'Failed to update member' };
      }
    } catch (error) {
      console.error('Update member error:', error);
      set({ 
        isLoading: false, 
        error: 'Network error. Please try again.' 
      });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  deleteMember: async (familyId, memberId, token) => {
    set({ isLoading: true, error: null });
    
    try {
      const response: FamilyResponse = await familyApi.deleteMember(familyId, memberId, token);
      
      if (response.success) {
        // Remove the member from the store
        const { family } = get();
        if (family) {
          set({
            family: {
              ...family,
              members: family.members.filter(member => member.id !== memberId)
            },
            isLoading: false,
            error: null
          });
        }
        return { success: true, message: response.message };
      } else {
        set({ 
          isLoading: false, 
          error: response.message || 'Failed to delete member' 
        });
        return { success: false, message: response.message || 'Failed to delete member' };
      }
    } catch (error) {
      console.error('Delete member error:', error);
      set({ 
        isLoading: false, 
        error: 'Network error. Please try again.' 
      });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  generateJoinId: async (familyId, memberId, token) => {
    set({ isLoading: true, error: null });
    
    try {
      const response: FamilyResponse = await familyApi.generateJoinId(familyId, { memberId }, token);
      
      if (response.success && response.data?.joinId) {
        set({ isLoading: false, error: null });
        return { 
          success: true, 
          message: response.message, 
          joinId: response.data.joinId 
        };
      } else {
        set({ 
          isLoading: false, 
          error: response.message || 'Failed to generate Join ID' 
        });
        return { success: false, message: response.message || 'Failed to generate Join ID' };
      }
    } catch (error) {
      console.error('Generate Join ID error:', error);
      set({ 
        isLoading: false, 
        error: 'Network error. Please try again.' 
      });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  linkFamily: async (joinId, token) => {
    set({ isLoading: true, error: null });
    
    try {
      const response: FamilyResponse = await familyApi.linkFamily({ joinId }, token);
      
      if (response.success) {
        // Refresh the family data after linking
        await get().getMyFamily(token);
        set({ isLoading: false, error: null });
        return { success: true, message: response.message };
      } else {
        set({ 
          isLoading: false, 
          error: response.message || 'Failed to link family' 
        });
        return { success: false, message: response.message || 'Failed to link family' };
      }
    } catch (error) {
      console.error('Link family error:', error);
      set({ 
        isLoading: false, 
        error: 'Network error. Please try again.' 
      });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  validateJoinId: async (joinId, token) => {
    set({ isLoading: true, error: null });
    
    try {
      const response: FamilyResponse = await familyApi.validateJoinId(joinId, token);
      
      if (response.success && response.data?.isValid !== undefined) {
        set({ isLoading: false, error: null });
        return { 
          success: true, 
          message: response.message, 
          isValid: response.data.isValid 
        };
      } else {
        set({ 
          isLoading: false, 
          error: response.message || 'Failed to validate Join ID' 
        });
        return { success: false, message: response.message || 'Failed to validate Join ID' };
      }
    } catch (error) {
      console.error('Validate Join ID error:', error);
      set({ 
        isLoading: false, 
        error: 'Network error. Please try again.' 
      });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  setSelectedMember: (memberId) => {
    set({ selectedMember: memberId });
  },

  toggleExpandedNode: (nodeId) => {
    const { expandedNodes } = get();
    const newExpandedNodes = new Set(expandedNodes);
    
    if (newExpandedNodes.has(nodeId)) {
      newExpandedNodes.delete(nodeId);
    } else {
      newExpandedNodes.add(nodeId);
    }
    
    set({ expandedNodes: newExpandedNodes });
  },

  clearError: () => {
    set({ error: null });
  },

  clearFamily: () => {
    set({ 
      family: null, 
      selectedMember: null, 
      expandedNodes: new Set() 
    });
  },
})); 