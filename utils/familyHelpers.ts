import { RelationType, User, Relationship, FamilyMember } from '@/types/family';

export const getRelationshipDisplayName = (relationType: RelationType): string => {
  const relationshipMap: Record<RelationType, string> = {
    father: 'Father',
    mother: 'Mother',
    husband: 'Husband', 
    wife: 'Wife', 
    son: 'Son',
    daughter: 'Daughter',
    brother: 'Brother',
    sister: 'Sister',
    grandfather: 'Grandfather',
    grandmother: 'Grandmother',
    uncle: 'Uncle',
    aunt: 'Aunt',
    cousin: 'Cousin',
  };
  
  return relationshipMap[relationType] || relationType;
};

export const getRelationshipCategory = (relationType: RelationType): string => {
  const categoryMap: Record<RelationType, string> = {
    father: 'parent',
    mother: 'parent',
    husband: 'spouse',
    wife: 'spouse',
    son: 'child',
    daughter: 'child',
    brother: 'sibling',
    sister: 'sibling',
    grandfather: 'grandparent',
    grandmother: 'grandparent',
    uncle: 'extended',
    aunt: 'extended',
    cousin: 'extended',
  };
  
  return categoryMap[relationType] || 'other';
};

// New helper functions for the enhanced family tree structure

/**
 * Get display name for a family member
 */
export const getMemberDisplayName = (member: FamilyMember): string => {
  if (member.fullName) return member.fullName;
  if (member.firstName || member.lastName) {
    return `${member.firstName || ''} ${member.lastName || ''}`.trim();
  }
  return member.relationship;
};

/**
 * Determine gender based on relationship and member data
 */
export const getMemberGender = (member: FamilyMember): 'male' | 'female' => {
  const relationship = member.relationship.toLowerCase();
  if (relationship.includes('father') || 
      relationship.includes('brother') || 
      relationship.includes('son') ||
      relationship.includes('husband')) {
    return 'male';
  }
  return 'female';
};

/**
 * Group children by their mother
 */
export const groupChildrenByMother = (members: FamilyMember[]): Map<string, FamilyMember[]> => {
  const childrenByMother = new Map<string, FamilyMember[]>();
  
  // Find all mothers
  const mothers = members.filter(member => 
    member.parentType === 'mother' || 
    member.relationship.toLowerCase().includes('mother') ||
    member.relationship.toLowerCase().includes('wife')
  );
  
  // Initialize mothers with empty children arrays
  mothers.forEach(mother => {
    childrenByMother.set(mother.id, []);
  });
  
  // Find all children
  const children = members.filter(member => 
    member.parentType === 'child' ||
    member.relationship.toLowerCase().includes('son') ||
    member.relationship.toLowerCase().includes('daughter') ||
    member.relationship.toLowerCase().includes('child') ||
    member.relationship.toLowerCase().includes('brother') ||
    member.relationship.toLowerCase().includes('sister')
  );
  
  // Assign children to their mothers
  children.forEach(child => {
    if (child.motherId && childrenByMother.has(child.motherId)) {
      childrenByMother.get(child.motherId)!.push(child);
    } else {
      // If child has no motherId or mother not found, assign to first mother
      if (mothers.length > 0) {
        const firstMotherId = mothers[0].id;
        if (!childrenByMother.has(firstMotherId)) {
          childrenByMother.set(firstMotherId, []);
        }
        childrenByMother.get(firstMotherId)!.push(child);
      }
    }
  });
  
  return childrenByMother;
};

/**
 * Validate mother-child relationships
 */
export const validateMotherChildRelationship = (
  mother: FamilyMember, 
  child: FamilyMember
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check if mother is actually a mother/wife
  const motherRelationship = mother.relationship.toLowerCase();
  if (!motherRelationship.includes('mother') && !motherRelationship.includes('wife')) {
    errors.push('Mother must have mother or wife relationship');
  }
  
  // Check if child is actually a child
  const childRelationship = child.relationship.toLowerCase();
  if (!childRelationship.includes('son') && 
      !childRelationship.includes('daughter') && 
      !childRelationship.includes('child') &&
      !childRelationship.includes('brother') &&
      !childRelationship.includes('sister')) {
    errors.push('Child must have child, son, daughter, brother, or sister relationship');
  }
  
  // Check age logic (mother should be older than child)
  const motherBirthYear = parseInt(mother.birthYear);
  const childBirthYear = parseInt(child.birthYear);
  if (!isNaN(motherBirthYear) && !isNaN(childBirthYear)) {
    if (motherBirthYear >= childBirthYear) {
      errors.push('Mother should be older than child');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculate optimal spacing for tree layout
 */
export const calculateTreeSpacing = (
  motherCount: number, 
  containerWidth: number,
  minSpacing: number = 800,  // Significantly increased from 400 to 800
  maxSpacing: number = 1500  // Significantly increased from 800 to 1500
): number => {
  // Ensure minimum spacing is much larger to prevent child overlap
  const baseSpacing = Math.max(minSpacing, 700);
  
  // Calculate spacing with much more generous allocation per mother
  const totalWidth = Math.max(containerWidth, motherCount * baseSpacing);
  const calculatedSpacing = totalWidth / (motherCount + 1);
  
  // Apply a much larger multiplier to prevent overlap
  const spacingMultiplier = 2.0; // Increase spacing by 100% (doubled)
  const adjustedSpacing = calculatedSpacing * spacingMultiplier;
  
  // Ensure spacing is generous enough to prevent child overlap
  return Math.max(baseSpacing, Math.min(maxSpacing, adjustedSpacing));
};

/**
 * Calculate child spacing under a mother
 */
export const calculateChildSpacing = (
  childCount: number,
  motherSpacing: number,
  maxChildSpacing: number = 400  // Significantly increased from 250 to 400
): number => {
  // Increase child spacing to prevent overlap between different mothers' children
  const childSpacingRatio = 0.3; // Reduced ratio but with much larger base spacing
  const calculatedSpacing = motherSpacing * childSpacingRatio;
  
  // Ensure minimum child spacing to prevent overlap
  const minChildSpacing = 200;
  return Math.max(minChildSpacing, Math.min(maxChildSpacing, calculatedSpacing));
};

/**
 * Get the father from family members
 */
export const getFather = (members: FamilyMember[]): FamilyMember | null => {
  return members.find(member => 
    member.parentType === 'father' || 
    member.relationship.toLowerCase().includes('father')
  ) || null;
};

/**
 * Get all mothers/wives from family members
 */
export const getMothers = (members: FamilyMember[]): FamilyMember[] => {
  return members.filter(member => 
    member.parentType === 'mother' || 
    member.relationship.toLowerCase().includes('mother') ||
    member.relationship.toLowerCase().includes('wife')
  );
};

/**
 * Get all children from family members
 */
export const getChildren = (members: FamilyMember[]): FamilyMember[] => {
  return members.filter(member => 
    member.parentType === 'child' ||
    member.relationship.toLowerCase().includes('son') ||
    member.relationship.toLowerCase().includes('daughter') ||
    member.relationship.toLowerCase().includes('child') ||
    member.relationship.toLowerCase().includes('brother') ||
    member.relationship.toLowerCase().includes('sister')
  );
};

export const validateIdNumber = (idNumber: string, idType: 'NIN' | 'BVN'): boolean => {
  if (idType === 'NIN') {
    // NIN is 11 digits
    return /^\d{11}$/.test(idNumber);
  } else if (idType === 'BVN') {
    // BVN is 11 digits
    return /^\d{11}$/.test(idNumber);
  }
  return false;
};

export const maskIdNumber = (idNumber: string): string => {
  if (idNumber.length <= 4) return idNumber;
  const lastFour = idNumber.slice(-4);
  const masked = '•'.repeat(idNumber.length - 4);
  return `${masked}${lastFour}`;
};

export const formatIdNumber = (idNumber: string, idType: 'NIN' | 'BVN'): string => {
  const masked = maskIdNumber(idNumber);
  return `${idType}: ${masked}`;
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
};

export const calculateAge = (dateOfBirth: string): number => {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const isValidRelationship = (
  userAge: number, 
  relativeAge: number, 
  relationType: RelationType
): boolean => {
  // Basic age validation rules
  switch (relationType) {
    case 'father':
    case 'mother':
      return relativeAge > userAge + 15; // Parent should be at least 15 years older
    case 'son':
    case 'daughter':
      return userAge > relativeAge + 15; // Child should be at least 15 years younger
    case 'grandfather':
    case 'grandmother':
      return relativeAge > userAge + 35; // Grandparent should be at least 35 years older
    default:
      return true; // No strict age validation for other relationships
  }
};

/**
 * Suggest relationship based on age difference
 */
export const suggestRelationship = (
  userAge: number, 
  relativeAge: number
): RelationType[] => {
  const ageDiff = Math.abs(userAge - relativeAge);
  const suggestions: RelationType[] = [];
  
  if (relativeAge > userAge + 15) {
    suggestions.push('father', 'mother', 'uncle', 'aunt');
  }
  
  if (userAge > relativeAge + 15) {
    suggestions.push('son', 'daughter');
  }
  
  if (ageDiff <= 10) {
    suggestions.push('brother', 'sister', 'cousin');
    if (userAge >= 18 && relativeAge >= 18) {
      suggestions.push('husband', 'wife');
    }
  }
  
  if (relativeAge > userAge + 35) {
    suggestions.push('grandfather', 'grandmother');
  }
  
  return suggestions;
};