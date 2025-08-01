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