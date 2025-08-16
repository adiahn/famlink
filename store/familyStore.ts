import { create } from 'zustand';
import { familyApi, FamilyResponse } from '../api/familyApi';
import { useAuthStore } from './authStore';
import { 
  Family, 
  FamilyMember, 
  FamilyBranch, 
  FamilyCreationFlow,
  CreationType,
  SetupStep,
  FatherData,
  MotherData,
  ChildData,
  TreeStructure,
  AvailableMother
} from '../types/family';

interface FamilyState {
  family: Family | null;
  isLoading: boolean;
  error: string | null;
  selectedMember: string | null;
  expandedNodes: Set<string>;
  // New state for creation flow
  creationFlow: FamilyCreationFlow | null;
  availableMothers: AvailableMother[];
  treeStructure: TreeStructure | null;
}

interface FamilyActions {
  // Existing actions (enhanced)
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
    motherId?: string; // New: optional mother ID for children
    parentType?: 'father' | 'mother' | 'child'; // New: parent type
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
  
  // New actions for enhanced family tree structure
  initializeFamilyCreation: (familyName: string, type: CreationType, token: string) => Promise<{ success: boolean; message: string; familyId?: string }>;
  setupParents: (familyId: string, fatherData: FatherData, mothersData: MotherData[], token: string) => Promise<{ success: boolean; message: string }>;
  addChildWithMother: (familyId: string, childData: ChildData, token: string) => Promise<{ success: boolean; message: string }>;
  getTreeStructure: (familyId: string, token: string) => Promise<{ success: boolean; message: string }>;
  getAvailableMothers: (familyId: string, token: string) => Promise<{ success: boolean; message: string }>;
  
  // Existing utility actions
  setSelectedMember: (memberId: string | null) => void;
  toggleExpandedNode: (nodeId: string) => void;
  clearError: () => void;
  clearFamily: () => void;
  
  // New utility actions
  setCreationFlow: (flow: FamilyCreationFlow | null) => void;
  setAvailableMothers: (mothers: AvailableMother[]) => void;
  setTreeStructure: (structure: TreeStructure | null) => void;
}

export const useFamilyStore = create<FamilyState & FamilyActions>((set, get) => ({
  // State
  family: null,
  isLoading: false,
  error: null,
  selectedMember: null,
  expandedNodes: new Set(),
  // New state
  creationFlow: null,
  availableMothers: [],
  treeStructure: null,

  // Actions
  getMyFamily: async (token) => {
    set({ isLoading: true, error: null });
    
    try {
      const response: FamilyResponse = await familyApi.getMyFamily(token);
      
      console.log('getMyFamily response:', response);
      console.log('response.data:', response.data);
      console.log('response.data.members:', response.data?.members);
      
      if (response.success && response.data?.family) {
        const familyData: Family = {
          ...response.data.family,
          // Map new backend fields
          creationType: response.data.family.creationType || 'own_family',
          setupCompleted: response.data.family.setupCompleted || false,
          currentStep: response.data.family.currentStep || 'completed',
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
            sourceFamily: member.sourceFamily,
            // Map new backend fields
            motherId: member.motherId,
            branchId: member.branchId,
            isRootMember: member.isRootMember || false,
            parentType: member.parentType || 'child',
            spouseOrder: member.spouseOrder,
            children: member.children || [],
            branch: member.branch
          })),
          branches: response.data.branches || [],
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
          await useAuthStore.getState().logout();
          return { success: false, message: 'Authentication failed. Please login again.' };
        }
        
        // Check if it's a NOT_FOUND error (no family exists yet) - this is normal for new users
        if ((response as any).error?.code === 'NOT_FOUND') {
          console.log('No family found - this is normal for new users');
          set({ 
            family: null,
            isLoading: false, 
            error: null 
          });
          return { success: true, message: 'No family found' };
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
        const familyData: Family = {
          ...response.data.family,
          creationType: response.data.family.creationType || 'own_family',
          setupCompleted: response.data.family.setupCompleted || false,
          currentStep: response.data.family.currentStep || 'completed',
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
            sourceFamily: member.sourceFamily,
            // Map new backend fields
            motherId: member.motherId,
            branchId: member.branchId,
            isRootMember: member.isRootMember || false,
            parentType: member.parentType || 'child',
            spouseOrder: member.spouseOrder,
            children: member.children || [],
            branch: member.branch
          })),
          branches: response.data.branches || [],
          linkedFamilies: response.data.linkedFamilies || [],
          statistics: response.data.statistics
        };
        
        set({
          family: familyData,
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
      // Enhanced member data with new fields
      const enhancedData = {
        ...data,
        motherId: data.motherId,
        parentType: data.parentType || 'child'
      };
      
      const response: FamilyResponse = await familyApi.addMember(familyId, enhancedData, token);
      
      if (response.success && response.data?.member) {
        // Update the family with the new member
        const { family } = get();
        if (family) {
          const newMember: FamilyMember = {
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
            sourceFamily: response.data.member.sourceFamily,
            // Map new backend fields
            motherId: response.data.member.motherId,
            branchId: response.data.member.branchId,
            isRootMember: response.data.member.isRootMember || false,
            parentType: response.data.member.parentType || 'child',
            spouseOrder: response.data.member.spouseOrder,
            children: response.data.member.children || [],
            branch: response.data.member.branch
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

  // New actions for enhanced family tree structure
  initializeFamilyCreation: async (familyName, type, token) => {
    set({ isLoading: true, error: null });
    try {
      const response: FamilyResponse = await familyApi.initializeFamilyCreation({ creationType: type, familyName }, token);
      if (response.success && response.data?.familyId) {
        set({ isLoading: false, error: null });
        return { success: true, message: response.message, familyId: response.data.familyId };
      } else {
        set({ isLoading: false, error: response.message || 'Failed to initialize family creation' });
        return { success: false, message: response.message || 'Failed to initialize family creation' };
      }
    } catch (error) {
      console.error('Initialize family creation error:', error);
      set({ isLoading: false, error: 'Network error. Please try again.' });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  setupParents: async (familyId, fatherData, mothersData, token) => {
    set({ isLoading: true, error: null });
    try {
      // Prepare the request data exactly as the API expects - omit empty deathYear fields
      const requestData = {
        father: {
          firstName: fatherData.firstName,
          lastName: fatherData.lastName,
          birthYear: fatherData.birthYear,
          isDeceased: fatherData.isDeceased,
          ...(fatherData.deathYear && fatherData.deathYear.trim() !== '' && { deathYear: fatherData.deathYear })
        },
        mothers: mothersData.map(mother => ({
          firstName: mother.firstName,
          lastName: mother.lastName,
          birthYear: mother.birthYear,
          isDeceased: mother.isDeceased,
          spouseOrder: mother.spouseOrder,
          ...(mother.deathYear && mother.deathYear.trim() !== '' && { deathYear: mother.deathYear })
        }))
      };
      
      console.log('Store setupParents request data:', requestData);
      
      const response: FamilyResponse = await familyApi.setupParents(familyId, requestData, token);
      if (response.success) {
        set({ isLoading: false, error: null });
        return { success: true, message: response.message };
      } else {
        set({ isLoading: false, error: response.message || 'Failed to setup parents' });
        return { success: false, message: response.message || 'Failed to setup parents' };
      }
    } catch (error) {
      console.error('Setup parents error:', error);
      set({ isLoading: false, error: 'Network error. Please try again.' });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  addChildWithMother: async (familyId, childData, token) => {
    set({ isLoading: true, error: null });
    try {
      // Use the unified addMember endpoint with motherId
      const memberData = {
        firstName: childData.firstName,
        lastName: childData.lastName,
        relationship: 'Child', // Default relationship for children
        birthYear: childData.birthYear,
        isDeceased: childData.isDeceased,
        deathYear: childData.deathYear,
        avatar: childData.avatar,
        motherId: childData.motherId,
        parentType: 'child' as const
      };
      
      const response: FamilyResponse = await familyApi.addMember(familyId, memberData, token);
      if (response.success) {
        set({ isLoading: false, error: null });
        return { success: true, message: response.message };
      } else {
        set({ isLoading: false, error: response.message || 'Failed to add child with mother' });
        return { success: false, message: response.message || 'Failed to add child with mother' };
      }
    } catch (error) {
      console.error('Add child with mother error:', error);
      set({ isLoading: false, error: 'Network error. Please try again.' });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  getTreeStructure: async (familyId, token) => {
    set({ isLoading: true, error: null });
    try {
      const response: FamilyResponse = await familyApi.getTreeStructure(familyId, token);
      if (response.success && response.data?.treeStructure) {
        set({ isLoading: false, error: null });
        set({ treeStructure: response.data.treeStructure });
        return { success: true, message: response.message };
      } else {
        set({ isLoading: false, error: response.message || 'Failed to get tree structure' });
        return { success: false, message: response.message || 'Failed to get tree structure' };
      }
    } catch (error) {
      console.error('Get tree structure error:', error);
      set({ isLoading: false, error: 'Network error. Please try again.' });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  getAvailableMothers: async (familyId, token) => {
    set({ isLoading: true, error: null });
    try {
      const response: FamilyResponse = await familyApi.getAvailableMothers(familyId, token);
      if (response.success && response.data?.mothers) {
        set({ isLoading: false, error: null });
        set({ availableMothers: response.data.mothers });
        return { success: true, message: response.message };
      } else {
        set({ isLoading: false, error: response.message || 'Failed to get available mothers' });
        return { success: false, message: response.message || 'Failed to get available mothers' };
      }
    } catch (error) {
      console.error('Get available mothers error:', error);
      set({ isLoading: false, error: 'Network error. Please try again.' });
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Existing utility actions
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
      expandedNodes: new Set(), 
      creationFlow: null,
      availableMothers: [],
      treeStructure: null
    });
  },

  // New utility actions
  setCreationFlow: (flow) => {
    set({ creationFlow: flow });
  },
  setAvailableMothers: (mothers) => {
    set({ availableMothers: mothers });
  },
  setTreeStructure: (structure) => {
    set({ treeStructure: structure });
  }
})); 