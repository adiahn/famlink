# Backend Changes Required for New Family Tree Structure

## Overview
This document outlines all the backend changes required to implement the new family tree structure where:
- Users can create family trees for their parents' family or their own family
- Father is positioned at the top with mothers below
- Children are explicitly grouped under their respective mothers
- Family linking creates complete tree integration

## Database Schema Changes

### 1. New Table: Family_Branches
```sql
CREATE TABLE family_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    mother_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    branch_name VARCHAR(255), -- e.g., "First Wife's Branch", "Second Wife's Branch"
    branch_order INTEGER NOT NULL, -- For ordering branches left to right
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(family_id, mother_id)
);
```

### 2. Modified Table: Family_Members
```sql
-- Add new columns to existing family_members table
ALTER TABLE family_members ADD COLUMN mother_id UUID REFERENCES family_members(id) ON DELETE SET NULL;
ALTER TABLE family_members ADD COLUMN branch_id UUID REFERENCES family_branches(id) ON DELETE SET NULL;
ALTER TABLE family_members ADD COLUMN is_root_member BOOLEAN DEFAULT FALSE; -- For father/mother at top level
ALTER TABLE family_members ADD COLUMN parent_type VARCHAR(20) CHECK (parent_type IN ('father', 'mother', 'child')); -- 'father', 'mother', 'child'
ALTER TABLE family_members ADD COLUMN spouse_order INTEGER; -- For multiple wives (1, 2, 3...)

-- Add indexes for performance
CREATE INDEX idx_family_members_mother_id ON family_members(mother_id);
CREATE INDEX idx_family_members_branch_id ON family_members(branch_id);
CREATE INDEX idx_family_members_parent_type ON family_members(parent_type);
CREATE INDEX idx_family_members_spouse_order ON family_members(spouse_order);
```

### 3. New Table: Family_Creation_Flow
```sql
CREATE TABLE family_creation_flow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    creation_type VARCHAR(20) NOT NULL CHECK (creation_type IN ('own_family', 'parents_family')),
    setup_completed BOOLEAN DEFAULT FALSE,
    current_step VARCHAR(50), -- 'parent_setup', 'children_setup', 'completed'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoint Changes

### 1. New Endpoint: Initialize Family Creation
```
POST /api/families/initialize-creation
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
    "creationType": "own_family" | "parents_family",
    "familyName": "string" // Optional, auto-generated if not provided
}

Response:
{
    "success": true,
    "message": "Family creation initialized",
    "data": {
        "familyId": "uuid",
        "creationType": "string",
        "currentStep": "string",
        "nextStep": "string"
    }
}
```

### 2. New Endpoint: Setup Parents (for parents_family creation)
```
POST /api/families/:familyId/setup-parents
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
    "father": {
        "firstName": "string",
        "lastName": "string",
        "birthYear": "string",
        "isDeceased": "boolean",
        "deathYear": "string",
        "avatar": "file" // multipart/form-data
    },
    "mothers": [
        {
            "firstName": "string",
            "lastName": "string",
            "birthYear": "string",
            "isDeceased": "boolean",
            "deathYear": "string",
            "avatar": "file",
            "spouseOrder": 1 // 1 for first wife, 2 for second, etc.
        }
    ]
}

Response:
{
    "success": true,
    "message": "Parents setup completed",
    "data": {
        "family": {
            "id": "uuid",
            "name": "string",
            "father": FamilyMember,
            "mothers": [FamilyMember],
            "branches": [FamilyBranch]
        }
    }
}
```

### 3. Modified Endpoint: Add Family Member
```
POST /api/families/:familyId/members
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
    "firstName": "string",
    "lastName": "string",
    "relationship": "string",
    "birthYear": "string",
    "isDeceased": "boolean",
    "deathYear": "string",
    "avatar": "file",
    "motherId": "uuid", // REQUIRED for children - specifies which mother this child belongs to
    "parentType": "child" // 'father', 'mother', or 'child'
}

Response:
{
    "success": true,
    "message": "Family member added successfully",
    "data": {
        "member": FamilyMember,
        "branch": FamilyBranch, // The branch this member belongs to
        "familyTree": UpdatedFamilyTree // Complete updated tree structure
    }
}
```

### 4. New Endpoint: Get Family Tree Structure
```
GET /api/families/:familyId/tree-structure
Authorization: Bearer <access_token>

Response:
{
    "success": true,
    "data": {
        "family": {
            "id": "uuid",
            "name": "string",
            "creationType": "string"
        },
        "treeStructure": {
            "father": {
                "id": "uuid",
                "name": "string",
                "details": FamilyMember
            },
            "mothers": [
                {
                    "id": "uuid",
                    "name": "string",
                    "details": FamilyMember,
                    "branch": FamilyBranch,
                    "children": [FamilyMember]
                }
            ],
            "branches": [FamilyBranch],
            "statistics": {
                "totalMembers": "number",
                "totalBranches": "number",
                "totalChildren": "number"
            }
        }
    }
}
```

### 5. New Endpoint: Get Available Mothers for Child
```
GET /api/families/:familyId/available-mothers
Authorization: Bearer <access_token>

Response:
{
    "success": true,
    "data": {
        "mothers": [
            {
                "id": "uuid",
                "name": "string",
                "spouseOrder": "number",
                "branchName": "string",
                "childrenCount": "number"
            }
        ]
    }
}
```

### 6. Modified Endpoint: Link Family
```
POST /api/families/link
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
    "joinId": "string",
    "linkType": "child_family" // New field to specify linking type
}

Response:
{
    "success": true,
    "message": "Family linked successfully",
    "data": {
        "linkedFamily": {
            "id": "uuid",
            "name": "string",
            "creatorName": "string",
            "linkedAs": "child_family" // Shows this is linked under a child
        },
        "mainFamily": {
            "id": "uuid",
            "name": "string"
        },
        "linkedMember": {
            "id": "uuid",
            "name": "string",
            "branch": "string"
        },
        "integrationDetails": {
            "totalLinkedMembers": "number",
            "branchStructure": "string"
        }
    }
}
```

## Business Logic Changes

### 1. Family Creation Flow Logic
```typescript
enum CreationType {
    OWN_FAMILY = 'own_family',
    PARENTS_FAMILY = 'parents_family'
}

enum SetupStep {
    INITIALIZED = 'initialized',
    PARENT_SETUP = 'parent_setup',
    CHILDREN_SETUP = 'children_setup',
    COMPLETED = 'completed'
}

interface FamilyCreationFlow {
    validateCreationType(type: CreationType): boolean;
    initializeFamilyCreation(userId: string, type: CreationType): Promise<Family>;
    setupParents(familyId: string, fatherData: FatherData, mothersData: MotherData[]): Promise<FamilyStructure>;
    addChildWithMother(familyId: string, childData: ChildData, motherId: string): Promise<FamilyMember>;
    completeFamilySetup(familyId: string): Promise<void>;
}
```

### 2. Parent Setup Logic
```typescript
interface ParentSetupLogic {
    validateFatherData(data: FatherData): ValidationResult;
    validateMotherData(data: MotherData): ValidationResult;
    createFather(familyId: string, data: FatherData): Promise<FamilyMember>;
    createMother(familyId: string, data: MotherData, spouseOrder: number): Promise<FamilyMember>;
    createFamilyBranch(familyId: string, motherId: string, branchName: string, order: number): Promise<FamilyBranch>;
    assignMotherToBranch(motherId: string, branchId: string): Promise<void>;
}
```

### 3. Child Addition Logic
```typescript
interface ChildAdditionLogic {
    validateChildData(data: ChildData, motherId: string): ValidationResult;
    assignChildToMother(childId: string, motherId: string): Promise<void>;
    assignChildToBranch(childId: string, branchId: string): Promise<void>;
    updateBranchStatistics(branchId: string): Promise<void>;
    validateMotherExists(motherId: string, familyId: string): Promise<boolean>;
}
```

### 4. Tree Structure Generation Logic
```typescript
interface TreeStructureLogic {
    generateTreeStructure(familyId: string): Promise<TreeStructure>;
    organizeMembersByBranches(members: FamilyMember[]): Promise<BranchOrganization>;
    calculateMemberPositions(treeStructure: TreeStructure): Promise<PositionedTree>;
    handleLinkedFamilies(familyId: string): Promise<LinkedFamilyData>;
    generateBranchNames(mothers: FamilyMember[]): Promise<string[]>;
}
```

## Data Validation Changes

### 1. New Validation Rules
```typescript
const familyCreationValidation = {
    creationType: z.enum(['own_family', 'parents_family']),
    familyName: z.string().min(1).max(255).optional(),
    
    // For parent setup
    father: z.object({
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
        birthYear: z.string().regex(/^\d{4}$/),
        isDeceased: z.boolean(),
        deathYear: z.string().regex(/^\d{4}$/).optional(),
        avatar: z.any().optional()
    }),
    
    mothers: z.array(z.object({
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
        birthYear: z.string().regex(/^\d{4}$/),
        isDeceased: z.boolean(),
        deathYear: z.string().regex(/^\d{4}$/).optional(),
        avatar: z.any().optional(),
        spouseOrder: z.number().min(1)
    })).min(1), // At least one mother required
    
    // For child addition
    child: z.object({
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
        birthYear: z.string().regex(/^\d{4}$/),
        isDeceased: z.boolean(),
        deathYear: z.string().regex(/^\d{4}$/).optional(),
        avatar: z.any().optional(),
        motherId: z.string().uuid(), // Required for children
        parentType: z.enum(['child'])
    })
};
```

### 2. Business Rule Validations
```typescript
const businessRuleValidations = {
    // Father must be older than mothers
    validateFatherAge: (fatherBirthYear: string, mothersBirthYears: string[]): boolean => {
        const fatherYear = parseInt(fatherBirthYear);
        return mothersBirthYears.every(year => parseInt(year) >= fatherYear);
    },
    
    // Mothers must be of reasonable age difference from father
    validateMotherAgeDifference: (fatherBirthYear: string, motherBirthYear: string): boolean => {
        const fatherYear = parseInt(fatherBirthYear);
        const motherYear = parseInt(motherBirthYear);
        const ageDiff = Math.abs(fatherYear - motherYear);
        return ageDiff >= 15 && ageDiff <= 50; // Reasonable age range
    },
    
    // Children must be younger than their mother
    validateChildAge: (motherBirthYear: string, childBirthYear: string): boolean => {
        const motherYear = parseInt(motherBirthYear);
        const childYear = parseInt(childBirthYear);
        return childYear > motherYear;
    },
    
    // Spouse order must be sequential
    validateSpouseOrder: (spouseOrders: number[]): boolean => {
        const sorted = [...spouseOrders].sort((a, b) => a - b);
        return sorted.every((order, index) => order === index + 1);
    }
};
```

## Database Migration Scripts

### 1. Migration 1: Add New Columns
```sql
-- Migration: Add new columns to family_members table
BEGIN;

-- Add new columns
ALTER TABLE family_members ADD COLUMN mother_id UUID;
ALTER TABLE family_members ADD COLUMN branch_id UUID;
ALTER TABLE family_members ADD COLUMN is_root_member BOOLEAN DEFAULT FALSE;
ALTER TABLE family_members ADD COLUMN parent_type VARCHAR(20);
ALTER TABLE family_members ADD COLUMN spouse_order INTEGER;

-- Add foreign key constraints
ALTER TABLE family_members ADD CONSTRAINT fk_family_members_mother_id 
    FOREIGN KEY (mother_id) REFERENCES family_members(id) ON DELETE SET NULL;
    
ALTER TABLE family_members ADD CONSTRAINT fk_family_members_branch_id 
    FOREIGN KEY (branch_id) REFERENCES family_branches(id) ON DELETE SET NULL;

-- Add check constraints
ALTER TABLE family_members ADD CONSTRAINT chk_parent_type 
    CHECK (parent_type IN ('father', 'mother', 'child'));

COMMIT;
```

### 2. Migration 2: Create New Tables
```sql
-- Migration: Create family_branches and family_creation_flow tables
BEGIN;

-- Create family_branches table
CREATE TABLE family_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    mother_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    branch_name VARCHAR(255),
    branch_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(family_id, mother_id)
);

-- Create family_creation_flow table
CREATE TABLE family_creation_flow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    creation_type VARCHAR(20) NOT NULL CHECK (creation_type IN ('own_family', 'parents_family')),
    setup_completed BOOLEAN DEFAULT FALSE,
    current_step VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_family_branches_family_id ON family_branches(family_id);
CREATE INDEX idx_family_branches_mother_id ON family_branches(mother_id);
CREATE INDEX idx_family_creation_flow_user_id ON family_creation_flow(user_id);

COMMIT;
```

### 3. Migration 3: Data Migration for Existing Families
```sql
-- Migration: Migrate existing family data to new structure
BEGIN;

-- Update existing family members to have parent_type
UPDATE family_members 
SET parent_type = CASE 
    WHEN relationship ILIKE '%father%' THEN 'father'
    WHEN relationship ILIKE '%mother%' OR relationship ILIKE '%wife%' THEN 'mother'
    ELSE 'child'
END;

-- Mark existing fathers and mothers as root members
UPDATE family_members 
SET is_root_member = TRUE 
WHERE parent_type IN ('father', 'mother');

-- Create branches for existing families with mothers
INSERT INTO family_branches (family_id, mother_id, branch_name, branch_order)
SELECT DISTINCT 
    fm.family_id,
    fm.id as mother_id,
    CASE 
        WHEN fm.relationship ILIKE '%wife%' THEN 
            'Wife ' || COALESCE(
                (SELECT COUNT(*) + 1 
                 FROM family_members fm2 
                 WHERE fm2.family_id = fm.family_id 
                 AND fm2.relationship ILIKE '%wife%' 
                 AND fm2.id < fm.id), 1
            ) || ' Branch'
        ELSE 'Mother Branch'
    END as branch_name,
    CASE 
        WHEN fm.relationship ILIKE '%wife%' THEN 
            COALESCE(
                (SELECT COUNT(*) + 1 
                 FROM family_members fm2 
                 WHERE fm2.family_id = fm.family_id 
                 AND fm2.relationship ILIKE '%wife%' 
                 AND fm2.id < fm.id), 1
            )
        ELSE 1
    END as branch_order
FROM family_members fm
WHERE fm.parent_type = 'mother';

-- Update existing children to be assigned to appropriate branches
UPDATE family_members 
SET branch_id = fb.id
FROM family_branches fb
WHERE family_members.family_id = fb.family_id
AND family_members.parent_type = 'child'
AND family_members.relationship NOT ILIKE '%father%'
AND family_members.relationship NOT ILIKE '%mother%'
AND family_members.relationship NOT ILIKE '%wife%';

COMMIT;
```

## API Response Structure Changes

### 1. Modified Family Response
```typescript
interface ModifiedFamilyResponse {
    success: boolean;
    message: string;
    data?: {
        family: {
            id: string;
            name: string;
            creatorId: string;
            creatorJoinId: string;
            isMainFamily: boolean;
            creationType: 'own_family' | 'parents_family';
            setupCompleted: boolean;
            currentStep: string;
            createdAt: string;
        };
        treeStructure: {
            father: FamilyMember | null;
            mothers: FamilyMember[];
            branches: FamilyBranch[];
            children: FamilyMember[];
            linkedFamilies: LinkedFamily[];
        };
        statistics: {
            totalMembers: number;
            totalBranches: number;
            totalChildren: number;
            originalMembers: number;
            linkedMembers: number;
        };
    };
}
```

### 2. New Tree Structure Response
```typescript
interface TreeStructureResponse {
    success: boolean;
    data: {
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
                    linkedFamily?: LinkedFamilyData;
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
    };
}
```

## Error Handling Changes

### 1. New Error Codes
```typescript
enum NewErrorCodes {
    // Family Creation Errors
    INVALID_CREATION_TYPE = 'INVALID_CREATION_TYPE',
    PARENT_SETUP_INCOMPLETE = 'PARENT_SETUP_INCOMPLETE',
    MOTHER_SELECTION_REQUIRED = 'MOTHER_SELECTION_REQUIRED',
    BRANCH_CREATION_FAILED = 'BRANCH_CREATION_FAILED',
    
    // Validation Errors
    INVALID_SPOUSE_ORDER = 'INVALID_SPOUSE_ORDER',
    AGE_VALIDATION_FAILED = 'AGE_VALIDATION_FAILED',
    MOTHER_NOT_FOUND = 'MOTHER_NOT_FOUND',
    BRANCH_NOT_FOUND = 'BRANCH_NOT_FOUND',
    
    // Tree Structure Errors
    TREE_GENERATION_FAILED = 'TREE_GENERATION_FAILED',
    INVALID_BRANCH_STRUCTURE = 'INVALID_BRANCH_STRUCTURE',
    POSITION_CALCULATION_FAILED = 'POSITION_CALCULATION_FAILED'
}
```

### 2. Enhanced Error Responses
```typescript
interface EnhancedErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details: {
            field?: string;
            value?: any;
            constraint?: string;
            suggestion?: string;
        }[];
        context?: {
            familyId?: string;
            memberId?: string;
            branchId?: string;
            step?: string;
        };
    };
}
```

## Performance Considerations

### 1. Database Indexing Strategy
```sql
-- Composite indexes for common queries
CREATE INDEX idx_family_members_family_branch ON family_members(family_id, branch_id);
CREATE INDEX idx_family_members_family_parent_type ON family_members(family_id, parent_type);
CREATE INDEX idx_family_members_mother_branch ON family_members(mother_id, branch_id);

-- Partial indexes for specific queries
CREATE INDEX idx_family_members_root_members ON family_members(family_id, is_root_member) 
WHERE is_root_member = TRUE;

CREATE INDEX idx_family_members_children ON family_members(family_id, parent_type) 
WHERE parent_type = 'child';
```

### 2. Caching Strategy
```typescript
interface CachingStrategy {
    // Cache family tree structures
    cacheFamilyTree: (familyId: string, treeData: TreeStructure): Promise<void>;
    getCachedFamilyTree: (familyId: string): Promise<TreeStructure | null>;
    invalidateFamilyTreeCache: (familyId: string): Promise<void>;
    
    // Cache branch information
    cacheBranchData: (branchId: string, branchData: FamilyBranch): Promise<void>;
    getCachedBranchData: (branchId: string): Promise<FamilyBranch | null>;
    
    // Cache creation flow state
    cacheCreationFlow: (userId: string, flowData: FamilyCreationFlow): Promise<void>;
    getCachedCreationFlow: (userId: string): Promise<FamilyCreationFlow | null>;
}
```

## Testing Requirements

### 1. Unit Tests
```typescript
describe('Family Creation Flow', () => {
    test('should initialize family creation for parents family');
    test('should setup father and mothers correctly');
    test('should create family branches for each mother');
    test('should add children to correct mothers');
    test('should validate age relationships');
    test('should handle multiple wives correctly');
});

describe('Tree Structure Generation', () => {
    test('should generate correct tree structure');
    test('should position members correctly');
    test('should handle linked families');
    test('should calculate branch positions');
});
```

### 2. Integration Tests
```typescript
describe('API Endpoints', () => {
    test('POST /api/families/initialize-creation');
    test('POST /api/families/:familyId/setup-parents');
    test('POST /api/families/:familyId/members (with motherId)');
    test('GET /api/families/:familyId/tree-structure');
    test('GET /api/families/:familyId/available-mothers');
});
```

## Deployment Checklist

### 1. Database Changes
- [ ] Run migration scripts in order
- [ ] Verify all new columns and tables are created
- [ ] Check foreign key constraints
- [ ] Validate data migration for existing families

### 2. API Changes
- [ ] Deploy new endpoints
- [ ] Update existing endpoints
- [ ] Test all API responses
- [ ] Verify error handling

### 3. Data Validation
- [ ] Test new validation rules
- [ ] Verify business logic
- [ ] Check age validation
- [ ] Test mother-child relationships

### 4. Performance Testing
- [ ] Test with large family trees
- [ ] Verify indexing performance
- [ ] Check caching effectiveness
- [ ] Monitor response times

## Summary of Major Changes

1. **Database Schema**: New tables for branches and creation flow, modified family_members table
2. **API Endpoints**: New endpoints for family initialization and parent setup
3. **Business Logic**: New creation flow, parent setup, and tree structure generation
4. **Data Validation**: Enhanced validation rules for new family structure
5. **Error Handling**: New error codes and enhanced error responses
6. **Performance**: New indexing strategy and caching approach
7. **Migration**: Comprehensive data migration for existing families

These changes will enable the new family tree structure while maintaining backward compatibility and ensuring data integrity.
