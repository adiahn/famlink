export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  idType: 'NIN' | 'BVN';
  idNumber: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  profilePhoto?: string;
  isVerified: boolean;
  joinedDate: string;
  lastActive: string;
}

// New: Family creation types
export type CreationType = 'own_family' | 'parents_family';
export type SetupStep = 'initialized' | 'parent_setup' | 'children_setup' | 'completed';

// New: Family branch structure
export interface FamilyBranch {
  id: string;
  familyId: string;
  motherId: string;
  branchName: string;
  branchOrder: number;
  createdAt: string;
  updatedAt: string;
  // Virtual fields from backend
  childrenCount?: number;
  members?: FamilyMember[];
}

// New: Family creation flow
export interface FamilyCreationFlow {
  id: string;
  userId: string;
  creationType: CreationType;
  setupCompleted: boolean;
  currentStep: SetupStep;
  createdAt: string;
  updatedAt: string;
}

// Enhanced: Family member with new backend fields
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
  
  // New fields from backend
  motherId?: string;
  branchId?: string;
  isRootMember: boolean;
  parentType: 'father' | 'mother' | 'child';
  spouseOrder?: number;
  
  // Virtual fields from backend
  children?: FamilyMember[];
  branch?: FamilyBranch;
}

// Enhanced: Family with new backend structure
export interface Family {
  id: string;
  name: string;
  creatorId: string;
  creatorJoinId: string;
  isMainFamily: boolean;
  createdAt: string;
  updatedAt: string;
  
  // New fields from backend
  creationType: CreationType;
  setupCompleted: boolean;
  currentStep: SetupStep;
  
  // Enhanced relationships
  members: FamilyMember[];
  branches: FamilyBranch[];
  linkedFamilies: LinkedFamily[];
  
  // Virtual fields from backend
  creationFlow?: FamilyCreationFlow;
  statistics?: FamilyStatistics;
}

// New: Linked family information
export interface LinkedFamily {
  id: string;
  name: string;
  linkedAt: string;
  linkedBy: string;
  linkedAs?: 'child_family' | 'parent_family';
  linkedMember?: {
    id: string;
    name: string;
    branch: string;
  };
  integrationDetails?: {
    totalLinkedMembers: number;
    branchStructure: string;
  };
}

// New: Family statistics
export interface FamilyStatistics {
  totalMembers: number;
  totalBranches: number;
  totalChildren: number;
  originalMembers: number;
  linkedMembers: number;
  linkedFamilies: number;
}

// New: Tree structure response
export interface TreeStructure {
  family: Family;
  treeStructure: {
    root: {
      type: 'father' | 'user';
      member: FamilyMember;
      position: { x: number; y: number };
    };
    branches: Array<{
      id: string;
      mother: FamilyMember;
      children: Array<{
        member: FamilyMember;
        position: { x: number; y: number };
        linkedFamily?: LinkedFamily;
      }>;
      position: { x: number; y: number };
      branchName: string;
    }>;
    connections: Array<{
      from: string;
      to: string;
      type: 'parent-child' | 'spouse' | 'family-link';
    }>;
  };
}

// New: Parent setup data
export interface FatherData {
  firstName: string;
  lastName: string;
  birthYear: string;
  isDeceased: boolean;
  deathYear?: string;
  avatar?: File;
}

export interface MotherData {
  firstName: string;
  lastName: string;
  birthYear: string;
  isDeceased: boolean;
  deathYear?: string;
  avatar?: File;
  spouseOrder: number;
}

export interface ChildData {
  firstName: string;
  lastName: string;
  birthYear: string;
  isDeceased: boolean;
  deathYear?: string;
  avatar?: File;
  motherId: string; // Required for children
  parentType: 'child';
}

// New: Available mother for child assignment
export interface AvailableMother {
  id: string;
  name: string;
  spouseOrder: number;
  branchName: string;
  childrenCount: number;
}

// Enhanced: Relationship types (keeping existing for backward compatibility)
export interface Relationship {
  id: string;
  userId: string;
  relativeId: string;
  relationType: RelationType;
  status: 'pending' | 'accepted' | 'rejected';
  initiatedBy: string;
  createdAt: string;
  acceptedAt?: string;
  notes?: string;
}

export type RelationType = 
  | 'father' | 'mother' 
  | 'husband' | 'wife' 
  | 'son' | 'daughter'
  | 'brother' | 'sister'
  | 'grandfather' | 'grandmother'
  | 'uncle' | 'aunt' | 'cousin';

export interface Notification {
  id: string;
  type: 'relationship_request' | 'relationship_accepted' | 'relationship_rejected' | 'verification_complete' | 'tree_update';
  senderId: string;
  receiverId: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

// Keeping existing interfaces for backward compatibility
export interface FamilyTree {
  userId: string;
  generations: {
    [key: string]: User[];
  };
  relationships: Relationship[];
  lastUpdated: string;
}

export interface SearchResult {
  user: User;
  mutualConnections: number;
  relationshipSuggestion?: RelationType;
  distance?: number; // degrees of separation
}