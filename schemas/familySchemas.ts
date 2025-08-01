import { z } from 'zod';
import { RelationType } from '@/types/family';

export const addRelativeSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  idType: z.enum(['NIN', 'BVN']).optional(),
  idNumber: z.string().optional(),
  relationship: z.enum([
    'father', 'mother', 'husband', 'wife', 'son', 'daughter',
    'brother', 'sister', 'grandfather', 'grandmother', 'uncle', 'aunt', 'cousin'
  ] as const),
  dateOfBirth: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  // If ID type is provided, ID number must also be provided
  if (data.idType && !data.idNumber) {
    return false;
  }
  // If ID number is provided, ID type must also be provided
  if (data.idNumber && !data.idType) {
    return false;
  }
  // If both are provided, ID number must be 11 digits
  if (data.idNumber && data.idType) {
    return /^\d{11}$/.test(data.idNumber);
  }
  return true;
}, {
  message: 'Please provide both ID type and a valid 11-digit ID number',
  path: ['idNumber'],
});

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  searchType: z.enum(['id', 'name']),
});

export const relationshipRequestSchema = z.object({
  relativeId: z.string().min(1, 'Relative ID is required'),
  relationType: z.enum([
    'father', 'mother', 'husband', 'wife', 'son', 'daughter',
    'brother', 'sister', 'grandfather', 'grandmother', 'uncle', 'aunt', 'cousin'
  ] as const),
  notes: z.string().optional(),
});

export type AddRelativeFormData = z.infer<typeof addRelativeSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type RelationshipRequestFormData = z.infer<typeof relationshipRequestSchema>; 