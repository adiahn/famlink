export interface FamilyMember {
  id: string;
  joinId: string;
  name: string;
  relationship: string;
  birthYear: string;
  deathYear?: string;
  isDeceased: boolean;
  isVerified: boolean;
  familyId: string;
  linkedFrom?: string; // Which family this member came from (if linked)
  isFamilyCreator: boolean; // Whether this person created the main family
  joinIdUsed: boolean; // Whether this Join ID has been used to link families
  position: { x: number; y: number };
  avatar?: string; // Optional avatar URL
}

export interface Family {
  id: string;
  name: string;
  creatorId: string; // The person who created this family
  creatorJoinId: string; // The Join ID of the creator
  members: FamilyMember[];
  linkedFamilies: string[]; // Array of family IDs that have linked to this one
  isMainFamily: boolean; // Whether this is the main family tree
}

export interface User {
  id: string;
  joinId: string;
  firstName: string;
  lastName: string;
  familyId: string;
  isFamilyCreator: boolean;
}

// Sample data representing the scenario you described
export const sampleFamilies: Family[] = [
  {
    id: 'family-1',
    name: 'The Johnson Family',
    creatorId: 'john-001',
    creatorJoinId: 'JOHN001',
    isMainFamily: true,
    members: [
      // John (Creator) - Son in Family A
      {
        id: 'john-001',
        joinId: 'JOHN001',
        name: 'John Johnson',
        relationship: 'Son',
        birthYear: '1985',
        isDeceased: false,
        isVerified: true,
        familyId: 'family-1',
        isFamilyCreator: true,
        joinIdUsed: false,
        position: { x: 200, y: 300 },
      },
      // John's Parents
      {
        id: 'robert-001',
        joinId: 'ROBE001',
        name: 'Robert Johnson',
        relationship: 'Father',
        birthYear: '1955',
        isDeceased: false,
        isVerified: true,
        familyId: 'family-1',
        isFamilyCreator: false,
        joinIdUsed: false,
        position: { x: 100, y: 200 },
      },
      {
        id: 'linda-001',
        joinId: 'LIND001',
        name: 'Linda Johnson',
        relationship: 'Mother',
        birthYear: '1958',
        isDeceased: false,
        isVerified: true,
        familyId: 'family-1',
        isFamilyCreator: false,
        position: { x: 300, y: 200 },
      },
      // John's Siblings
      {
        id: 'mike-001',
        joinId: 'MIKE001',
        name: 'Mike Johnson',
        relationship: 'Brother',
        birthYear: '1987',
        isDeceased: false,
        isVerified: true,
        familyId: 'family-1',
        isFamilyCreator: false,
        position: { x: 400, y: 300 },
      },
      {
        id: 'sarah-001',
        joinId: 'SARA001',
        name: 'Sarah Johnson',
        relationship: 'Sister',
        birthYear: '1990',
        isDeceased: false,
        isVerified: true,
        familyId: 'family-1',
        isFamilyCreator: false,
        position: { x: 500, y: 300 },
      },
      // John's Wife and Children
      {
        id: 'mary-001',
        joinId: 'MARY001',
        name: 'Mary Johnson',
        relationship: 'Wife',
        birthYear: '1986',
        isDeceased: false,
        isVerified: true,
        familyId: 'family-1',
        isFamilyCreator: false,
        position: { x: 200, y: 400 },
      },
      {
        id: 'emma-001',
        joinId: 'EMMA001',
        name: 'Emma Johnson',
        relationship: 'Daughter',
        birthYear: '2010',
        isDeceased: false,
        isVerified: true,
        familyId: 'family-1',
        isFamilyCreator: false,
        position: { x: 100, y: 500 },
      },
      {
        id: 'james-001',
        joinId: 'JAME001',
        name: 'James Johnson',
        relationship: 'Son',
        birthYear: '2012',
        isDeceased: false,
        isVerified: true,
        familyId: 'family-1',
        isFamilyCreator: false,
        position: { x: 300, y: 500 },
      },
    ],
    linkedFamilies: [], // Main family doesn't link to others
  },
  {
    id: 'family-2',
    name: 'Mike Johnson Family',
    creatorId: 'mike-002',
    creatorJoinId: 'MIKE002',
    isMainFamily: false, // This family links TO the main family
    members: [
      // Mike (Brother) - Has his own family
      {
        id: 'mike-002',
        joinId: 'MIKE002',
        name: 'Mike Johnson',
        relationship: 'Brother',
        birthYear: '1987',
        isDeceased: false,
        isVerified: true,
        familyId: 'family-2',
        isFamilyCreator: true,
        linkedFrom: 'family-1', // Linked from John's family
        position: { x: 200, y: 300 },
      },
      // Mike's Wife
      {
        id: 'anna-002',
        joinId: 'ANNA002',
        name: 'Anna Johnson',
        relationship: 'Wife',
        birthYear: '1989',
        isDeceased: false,
        isVerified: true,
        familyId: 'family-2',
        isFamilyCreator: false,
        position: { x: 400, y: 300 },
      },
      // Mike's Children
      {
        id: 'tom-002',
        joinId: 'TOM002',
        name: 'Tom Johnson',
        relationship: 'Son',
        birthYear: '2015',
        isDeceased: false,
        isVerified: true,
        familyId: 'family-2',
        isFamilyCreator: false,
        position: { x: 200, y: 400 },
      },
      {
        id: 'lisa-002',
        joinId: 'LISA002',
        name: 'Lisa Johnson',
        relationship: 'Daughter',
        birthYear: '2017',
        isDeceased: false,
        isVerified: true,
        familyId: 'family-2',
        isFamilyCreator: false,
        position: { x: 400, y: 400 },
      },
    ],
    linkedFamilies: ['family-1'], // This family links TO John's main family
  },
];

// Helper functions
export const generateJoinId = (firstName: string, lastName: string): string => {
  const prefix = firstName.substring(0, 3).toUpperCase();
  const suffix = lastName.substring(0, 3).toUpperCase();
  return `${prefix}${suffix}`;
};

export const getFamilyMemberByJoinId = (families: Family[], joinId: string): FamilyMember | null => {
  for (const family of families) {
    const member = family.members.find(m => m.joinId === joinId);
    if (member) return member;
  }
  return null;
};

export const getFamilyByMemberJoinId = (families: Family[], joinId: string): Family | null => {
  return families.find(family => 
    family.members.some(member => member.joinId === joinId)
  ) || null;
};

export const getMainFamily = (families: Family[]): Family | null => {
  return families.find(family => family.isMainFamily) || null;
};

export const getLinkedFamilies = (families: Family[], mainFamilyId: string): Family[] => {
  return families.filter(family => 
    family.id !== mainFamilyId && family.linkedFamilies.includes(mainFamilyId)
  );
};

export const getAllFamilyMembers = (families: Family[], mainFamilyId: string): FamilyMember[] => {
  const mainFamily = families.find(f => f.id === mainFamilyId);
  if (!mainFamily) return [];

  let allMembers = [...mainFamily.members];
  
  // Add members from families that have linked TO this main family
  families.forEach(family => {
    if (family.id !== mainFamilyId && family.linkedFamilies.includes(mainFamilyId)) {
      allMembers = [...allMembers, ...family.members];
    }
  });

  return allMembers;
};

// New helper functions for the linking system
export const isJoinIdUnique = (families: Family[], joinId: string): boolean => {
  return !getFamilyMemberByJoinId(families, joinId);
};

export const generateUniqueJoinId = (families: Family[], firstName: string, lastName: string): string => {
  let baseJoinId = generateJoinId(firstName, lastName);
  let uniqueJoinId = baseJoinId;
  let counter = 1;
  
  while (!isJoinIdUnique(families, uniqueJoinId)) {
    uniqueJoinId = `${baseJoinId}${counter.toString().padStart(2, '0')}`;
    counter++;
  }
  
  return uniqueJoinId;
};

export const linkFamilyToMainFamily = (
  families: Family[], 
  joiningMemberJoinId: string, 
  mainFamilyId: string
): { success: boolean; message: string; updatedFamilies?: Family[] } => {
  // Find the joining member and their family
  const joiningMember = getFamilyMemberByJoinId(families, joiningMemberJoinId);
  if (!joiningMember) {
    return { success: false, message: 'Invalid Join ID. Member not found.' };
  }

  const joiningFamily = families.find(f => f.id === joiningMember.familyId);
  if (!joiningFamily) {
    return { success: false, message: 'Family not found.' };
  }

  const mainFamily = families.find(f => f.id === mainFamilyId);
  if (!mainFamily) {
    return { success: false, message: 'Main family not found.' };
  }

  // Check if the joining member is the creator of their family
  if (!joiningMember.isFamilyCreator) {
    return { 
      success: false, 
      message: 'Only the family creator can link their family to another family tree.' 
    };
  }

  // Check if already linked
  if (joiningFamily.linkedFamilies.includes(mainFamilyId)) {
    return { success: false, message: 'Families are already linked.' };
  }

  // Create updated families array
  const updatedFamilies = families.map(family => {
    if (family.id === joiningFamily.id) {
      return {
        ...family,
        linkedFamilies: [...family.linkedFamilies, mainFamilyId]
      };
    }
    return family;
  });

  return {
    success: true,
    message: `Successfully linked ${joiningFamily.name} to ${mainFamily.name}. All family members can now see each other.`,
    updatedFamilies
  };
};

export const addFamilyMember = (
  families: Family[],
  familyId: string,
  memberData: {
    firstName: string;
    lastName: string;
    relationship: string;
    birthYear: string;
    isDeceased: boolean;
    deathYear?: string;
    avatar?: string;
  }
): { success: boolean; message: string; updatedFamilies?: Family[]; joinId?: string } => {
  const family = families.find(f => f.id === familyId);
  if (!family) {
    return { success: false, message: 'Family not found.' };
  }

  // Generate unique Join ID
  const joinId = generateUniqueJoinId(families, memberData.firstName, memberData.lastName);

  // Create new member
  const newMember: FamilyMember = {
    id: `${memberData.firstName.toLowerCase()}-${Date.now()}`,
    joinId,
    name: `${memberData.firstName} ${memberData.lastName}`,
    relationship: memberData.relationship,
    birthYear: memberData.birthYear,
    deathYear: memberData.deathYear,
    isDeceased: memberData.isDeceased,
    isVerified: false, // New members start as unverified
    familyId,
    isFamilyCreator: false,
    position: { x: 0, y: 0 }, // Will be calculated by UI
    avatar: memberData.avatar,
  };

  // Update families array
  const updatedFamilies = families.map(f => {
    if (f.id === familyId) {
      return {
        ...f,
        members: [...f.members, newMember]
      };
    }
    return f;
  });

  return {
    success: true,
    message: `Successfully added ${newMember.name} to the family tree.`,
    updatedFamilies,
    joinId
  };
}; 