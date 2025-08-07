import { create } from 'zustand';
import { familyApi, FamilyResponse, FamilyMember } from '../api/familyApi';
import { useAuthStore } from './authStore';

interface Family {
  id: string;
  name: string;
  creatorId: string;
  creatorJoinId: string;
  isMainFamily: boolean;
  members: FamilyMember[];
  linkedFamilies: {
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
  validateJoinId: (joinId: string, token: string) => Promise<{ success: boolean; message: string; isValid?: boolean; memberName?: string; familyName?: string }>;
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
      
      console.log('getMyFamily response:', response);
      console.log('response.data:', response.data);
      console.log('response.data.members:', response.data?.members);
      
      if (response.success && response.data?.family) {
        const familyData = {
          ...response.data.family,
          members: (response.data.members || []).map((member: any) => ({
            ...member,
            name: member.fullName || `${member.firstName} ${member.lastName}`.trim(), // Map fullName to name
            firstName: member.firstName,
            lastName: member.lastName,
            relationship: member.relationship,
            birthYear: member.birthYear,
            isDeceased: member.isDeceased,
            isVerified: member.isVerified,
            isFamilyCreator: member.isFamilyCreator,
            joinId: member.joinId,
            avatarUrl: member.avatarUrl,
            isLinkedMember: member.isLinkedMember,
            sourceFamily: member.sourceFamily
          })),
          linkedFamilies: response.data.linkedFamilies || [],
          statistics: response.data.statistics
        };
        console.log('Setting family data:', familyData);
        set({
          family: familyData,
          isLoading: false,
          error: null
        });
        return { success: true, message: response.message };
      } else {
        // Check if it's a 401 error and force logout
        if ((response as any).error?.code === 'AUTHENTICATION_ERROR') {
          console.log('Authentication error, forcing logout');
          useAuthStore.getState().logout();
          return { success: false, message: 'Authentication failed. Please login again.' };
        }
        
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
            members: (response.data.members || []).map((member: any) => ({
              ...member,
              name: member.fullName || `${member.firstName} ${member.lastName}`.trim(),
              firstName: member.firstName,
              lastName: member.lastName,
              relationship: member.relationship,
              birthYear: member.birthYear,
              isDeceased: member.isDeceased,
              isVerified: member.isVerified,
              isFamilyCreator: member.isFamilyCreator,
              joinId: member.joinId,
              avatarUrl: member.avatarUrl,
              isLinkedMember: member.isLinkedMember,
              sourceFamily: member.sourceFamily
            })),
            linkedFamilies: response.data.linkedFamilies || [],
            statistics: response.data.statistics
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
          const newMember = {
            ...response.data.member,
            name: response.data.member.fullName || `${response.data.member.firstName} ${response.data.member.lastName}`.trim(),
            firstName: response.data.member.firstName,
            lastName: response.data.member.lastName,
            relationship: response.data.member.relationship,
            birthYear: response.data.member.birthYear,
            isDeceased: response.data.member.isDeceased,
            isVerified: response.data.member.isVerified,
            isFamilyCreator: response.data.member.isFamilyCreator,
            joinId: response.data.member.joinId,
            avatarUrl: response.data.member.avatarUrl,
            isLinkedMember: response.data.member.isLinkedMember,
            sourceFamily: response.data.member.sourceFamily
          };
          
          set({
            family: {
              ...family,
              members: [...family.members, newMember]
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
          const updatedMember = {
            ...response.data.member,
            name: response.data.member.fullName || `${response.data.member.firstName} ${response.data.member.lastName}`.trim(),
            firstName: response.data.member.firstName,
            lastName: response.data.member.lastName,
            relationship: response.data.member.relationship,
            birthYear: response.data.member.birthYear,
            isDeceased: response.data.member.isDeceased,
            isVerified: response.data.member.isVerified,
            isFamilyCreator: response.data.member.isFamilyCreator,
            joinId: response.data.member.joinId,
            avatarUrl: response.data.member.avatarUrl,
            isLinkedMember: response.data.member.isLinkedMember,
            sourceFamily: response.data.member.sourceFamily
          };
          
          set({
            family: {
              ...family,
              members: family.members.map(member => 
                member.id === memberId ? updatedMember : member
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
      const response: FamilyResponse = await familyApi.getMemberJoinId(memberId, token);
      
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
          error: response.message || 'Failed to get Join ID' 
        });
        return { success: false, message: response.message || 'Failed to get Join ID' };
      }
    } catch (error) {
      console.error('Get Join ID error:', error);
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
          isValid: response.data.isValid,
          memberName: response.data.memberName,
          familyName: response.data.familyName
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