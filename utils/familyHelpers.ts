import { RelationType, User, Relationship } from '@/types/family';

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