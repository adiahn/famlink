import {
  getRelationshipDisplayName,
  getRelationshipCategory,
  validateIdNumber,
  maskIdNumber,
  formatIdNumber,
  getInitials,
  calculateAge,
  isValidRelationship,
  suggestRelationship,
} from '@/utils/familyHelpers';

describe('familyHelpers', () => {
  describe('getRelationshipDisplayName', () => {
    it('should return correct display names for all relationship types', () => {
      expect(getRelationshipDisplayName('father')).toBe('Father');
      expect(getRelationshipDisplayName('mother')).toBe('Mother');
      expect(getRelationshipDisplayName('husband')).toBe('Husband');
      expect(getRelationshipDisplayName('wife')).toBe('Wife');
      expect(getRelationshipDisplayName('son')).toBe('Son');
      expect(getRelationshipDisplayName('daughter')).toBe('Daughter');
      expect(getRelationshipDisplayName('brother')).toBe('Brother');
      expect(getRelationshipDisplayName('sister')).toBe('Sister');
      expect(getRelationshipDisplayName('grandfather')).toBe('Grandfather');
      expect(getRelationshipDisplayName('grandmother')).toBe('Grandmother');
      expect(getRelationshipDisplayName('uncle')).toBe('Uncle');
      expect(getRelationshipDisplayName('aunt')).toBe('Aunt');
      expect(getRelationshipDisplayName('cousin')).toBe('Cousin');
    });

    it('should return the input for unknown relationship types', () => {
      expect(getRelationshipDisplayName('unknown' as any)).toBe('unknown');
    });
  });

  describe('getRelationshipCategory', () => {
    it('should return correct categories for all relationship types', () => {
      expect(getRelationshipCategory('father')).toBe('parent');
      expect(getRelationshipCategory('mother')).toBe('parent');
      expect(getRelationshipCategory('husband')).toBe('spouse');
      expect(getRelationshipCategory('wife')).toBe('spouse');
      expect(getRelationshipCategory('son')).toBe('child');
      expect(getRelationshipCategory('daughter')).toBe('child');
      expect(getRelationshipCategory('brother')).toBe('sibling');
      expect(getRelationshipCategory('sister')).toBe('sibling');
      expect(getRelationshipCategory('grandfather')).toBe('grandparent');
      expect(getRelationshipCategory('grandmother')).toBe('grandparent');
      expect(getRelationshipCategory('uncle')).toBe('extended');
      expect(getRelationshipCategory('aunt')).toBe('extended');
      expect(getRelationshipCategory('cousin')).toBe('extended');
    });
  });

  describe('validateIdNumber', () => {
    it('should validate NIN correctly', () => {
      expect(validateIdNumber('12345678901', 'NIN')).toBe(true);
      expect(validateIdNumber('1234567890', 'NIN')).toBe(false);
      expect(validateIdNumber('123456789012', 'NIN')).toBe(false);
      expect(validateIdNumber('abc12345678', 'NIN')).toBe(false);
    });

    it('should validate BVN correctly', () => {
      expect(validateIdNumber('12345678901', 'BVN')).toBe(true);
      expect(validateIdNumber('1234567890', 'BVN')).toBe(false);
      expect(validateIdNumber('123456789012', 'BVN')).toBe(false);
      expect(validateIdNumber('abc12345678', 'BVN')).toBe(false);
    });
  });

  describe('maskIdNumber', () => {
    it('should mask ID numbers correctly', () => {
      expect(maskIdNumber('12345678901')).toBe('•••••••8901');
      expect(maskIdNumber('1234')).toBe('1234');
      expect(maskIdNumber('')).toBe('');
    });
  });

  describe('formatIdNumber', () => {
    it('should format ID numbers correctly', () => {
      expect(formatIdNumber('12345678901', 'NIN')).toBe('NIN: •••••••8901');
      expect(formatIdNumber('12345678901', 'BVN')).toBe('BVN: •••••••8901');
    });
  });

  describe('getInitials', () => {
    it('should return correct initials', () => {
      expect(getInitials('John', 'Doe')).toBe('JD');
      expect(getInitials('Mary', 'Jane')).toBe('MJ');
      expect(getInitials('A', 'B')).toBe('AB');
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const today = new Date();
      const birthDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
      expect(calculateAge(birthDate.toISOString().split('T')[0])).toBe(25);
    });
  });

  describe('isValidRelationship', () => {
    it('should validate parent relationships', () => {
      expect(isValidRelationship(25, 50, 'father')).toBe(true);
      expect(isValidRelationship(25, 30, 'father')).toBe(false);
    });

    it('should validate child relationships', () => {
      expect(isValidRelationship(50, 25, 'son')).toBe(true);
      expect(isValidRelationship(30, 25, 'son')).toBe(false);
    });

    it('should validate grandparent relationships', () => {
      expect(isValidRelationship(25, 70, 'grandfather')).toBe(true);
      expect(isValidRelationship(25, 50, 'grandfather')).toBe(false);
    });
  });

  describe('suggestRelationship', () => {
    it('should suggest appropriate relationships based on age difference', () => {
      const suggestions = suggestRelationship(25, 50);
      expect(suggestions).toContain('father');
      expect(suggestions).toContain('mother');
      expect(suggestions).toContain('uncle');
      expect(suggestions).toContain('aunt');
    });

    it('should suggest sibling relationships for similar ages', () => {
      const suggestions = suggestRelationship(25, 27);
      expect(suggestions).toContain('brother');
      expect(suggestions).toContain('sister');
      expect(suggestions).toContain('cousin');
    });
  });
}); 