# FamLink Backend Requirements Document

## Project Overview
FamLink is a family tree management application that allows users to create, manage, and link family networks. The backend needs to support user authentication, family tree management, Join ID system, and real-time family linking capabilities.

## Technology Stack Recommendations
- **Framework**: Node.js with Express.js or NestJS
- **Database**: PostgreSQL (for relational family data) + Redis (for caching and sessions)
- **Authentication**: JWT tokens with refresh token rotation
- **File Storage**: AWS S3 or similar for profile pictures
- **Real-time**: Socket.io for live family updates
- **Email Service**: SendGrid or AWS SES for verification emails
- **SMS Service**: Twilio for phone verification
- **API Documentation**: Swagger/OpenAPI

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    date_of_birth DATE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(6),
    verification_expires_at TIMESTAMP,
    profile_picture_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
);
```

### Families Table
```sql
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    creator_join_id VARCHAR(20) UNIQUE NOT NULL,
    is_main_family BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Family Members Table
```sql
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    join_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    birth_year VARCHAR(4),
    death_year VARCHAR(4),
    is_deceased BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_family_creator BOOLEAN DEFAULT FALSE,
    join_id_used BOOLEAN DEFAULT FALSE,
    linked_from UUID REFERENCES family_members(id),
    avatar_url VARCHAR(500),
    position INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Linked Families Table
```sql
CREATE TABLE linked_families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    main_family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    linked_family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    linked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(main_family_id, linked_family_id)
);
```

### User Sessions Table
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Authentication APIs

#### 1. User Registration
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "firstName": "string",
  "lastName": "string", 
  "phone": "string",
    "dateOfBirth": "DD/MM/YYYY",
  "password": "string",
  "confirmPassword": "string"
}

Response:
{
  "success": true,
    "message": "Registration successful",
  "data": {
        "userId": "uuid",
        "verificationRequired": true
  }
}
```

#### 2. User Sign In
```
POST /api/auth/signin
Content-Type: application/json

Request Body:
{
  "phone": "string",
  "password": "string"
}

Response:
{
  "success": true,
    "message": "Sign in successful",
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "phone": "string",
            "isVerified": boolean
    },
        "accessToken": "string",
        "refreshToken": "string"
  }
}
```

#### 3. Phone Verification
```
POST /api/auth/verify-phone
Content-Type: application/json

Request Body:
{
    "phone": "string",
    "verificationCode": "string"
}

Response:
{
  "success": true,
    "message": "Phone verified successfully",
  "data": {
        "user": {
            "id": "uuid",
            "isVerified": true
        }
  }
}
```

#### 4. Resend Verification Code
```
POST /api/auth/resend-verification
Content-Type: application/json

Request Body:
{
    "phone": "string"
}

Response:
{
  "success": true,
    "message": "Verification code sent"
}
```

#### 5. Refresh Token
```
POST /api/auth/refresh
Content-Type: application/json

Request Body:
{
    "refreshToken": "string"
}

Response:
{
  "success": true,
  "data": {
        "accessToken": "string",
        "refreshToken": "string"
  }
}
```

#### 6. Logout
```
POST /api/auth/logout
Authorization: Bearer <access_token>

Response:
{
  "success": true,
    "message": "Logged out successfully"
}
```

### Family Management APIs

#### 7. Create Family
```
POST /api/families
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
    "name": "string",
    "creatorJoinId": "string"
}

Response:
{
  "success": true,
    "message": "Family created successfully",
  "data": {
        "family": {
            "id": "uuid",
            "name": "string",
            "creatorId": "uuid",
            "creatorJoinId": "string",
            "isMainFamily": true
        }
  }
}
```

#### 8. Get User's Family
```
GET /api/families/my-family
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "data": {
        "family": {
      "id": "uuid",
      "name": "string",
            "creatorId": "uuid",
            "creatorJoinId": "string",
            "isMainFamily": boolean,
            "members": [
                {
                    "id": "uuid",
                    "name": "string",
                    "relationship": "string",
      "birthYear": "string",
                    "isDeceased": boolean,
                    "isVerified": boolean,
                    "isFamilyCreator": boolean,
                    "joinId": "string",
                    "avatarUrl": "string"
                }
            ]
        }
  }
}
```

#### 9. Add Family Member
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
    "isDeceased": boolean,
  "deathYear": "string",
    "avatar": "file" // multipart/form-data
}

Response:
{
  "success": true,
    "message": "Family member added successfully",
  "data": {
    "member": {
      "id": "uuid",
      "name": "string",
            "relationship": "string",
            "birthYear": "string",
            "isDeceased": boolean,
            "isVerified": false,
            "isFamilyCreator": false,
            "joinId": "string",
            "avatarUrl": "string"
        }
  }
}
```

#### 10. Update Family Member
```
PUT /api/families/:familyId/members/:memberId
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
    "firstName": "string",
    "lastName": "string",
    "relationship": "string",
  "birthYear": "string",
    "isDeceased": boolean,
  "deathYear": "string",
    "avatar": "file" // multipart/form-data
}

Response:
{
  "success": true,
    "message": "Family member updated successfully",
  "data": {
        "member": {
            "id": "uuid",
            "name": "string",
            "relationship": "string",
            "birthYear": "string",
            "isDeceased": boolean,
            "isVerified": boolean,
            "isFamilyCreator": boolean,
            "joinId": "string",
            "avatarUrl": "string"
        }
  }
}
```

#### 11. Delete Family Member
```
DELETE /api/families/:familyId/members/:memberId
Authorization: Bearer <access_token>

Response:
{
  "success": true,
    "message": "Family member deleted successfully"
}
```

### Join ID System APIs

#### 12. Generate Join ID
```
POST /api/families/:familyId/join-ids
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
    "memberId": "uuid"
}

Response:
{
  "success": true,
  "data": {
        "joinId": "string",
        "memberName": "string"
  }
}
```

#### 13. Link Family Using Join ID
```
POST /api/families/link
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
    "joinId": "string"
}

Response:
{
  "success": true,
    "message": "Family linked successfully",
  "data": {
        "linkedFamily": {
        "id": "uuid",
            "name": "string",
            "creatorName": "string"
    }
  }
}
```

#### 14. Validate Join ID
```
GET /api/families/validate-join-id/:joinId
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "data": {
        "isValid": boolean,
        "memberName": "string",
        "familyName": "string",
        "isFamilyCreator": boolean
  }
}
```

### User Profile APIs

#### 15. Get User Profile
```
GET /api/users/profile
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "data": {
        "user": {
        "id": "uuid",
            "firstName": "string",
            "lastName": "string",
            "phone": "string",
            "dateOfBirth": "string",
            "isVerified": boolean,
            "profilePictureUrl": "string",
            "createdAt": "timestamp"
    }
  }
}
```

#### 16. Update User Profile
```
PUT /api/users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "dateOfBirth": "string",
    "profilePicture": "file" // multipart/form-data
}

Response:
{
  "success": true,
    "message": "Profile updated successfully",
  "data": {
        "user": {
        "id": "uuid",
            "firstName": "string",
            "lastName": "string",
            "phone": "string",
            "dateOfBirth": "string",
            "profilePictureUrl": "string"
    }
  }
}
```

#### 17. Change Password
```
PUT /api/users/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
    "currentPassword": "string",
    "newPassword": "string",
    "confirmPassword": "string"
}

Response:
{
  "success": true,
    "message": "Password changed successfully"
}
```

### Privacy Settings APIs

#### 18. Get Privacy Settings
```
GET /api/users/privacy-settings
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "data": {
        "showProfile": boolean,
        "allowSearch": boolean,
        "notifications": boolean,
        "familyVisibility": boolean
  }
}
```

#### 19. Update Privacy Settings
```
PUT /api/users/privacy-settings
Authorization: Bearer <access_token>
Content-Type: application/json

Request Body:
{
    "showProfile": boolean,
    "allowSearch": boolean,
    "notifications": boolean,
    "familyVisibility": boolean
}

Response:
{
  "success": true,
    "message": "Privacy settings updated successfully"
}
```

### Search APIs

#### 20. Search Users
```
GET /api/search/users?q=search_term&page=1&limit=20
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "data": {
        "users": [
            {
                "id": "uuid",
                "firstName": "string",
                "lastName": "string",
                "phone": "string",
                "isVerified": boolean
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 20,
            "total": 100,
            "totalPages": 5
        }
    }
}
```

### Statistics APIs

#### 21. Get User Statistics
```
GET /api/users/statistics
Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "data": {
        "familyMembers": 12,
        "linkedFamilies": 3,
        "verifiedMembers": 8,
        "totalConnections": 25
  }
}
```

## Business Logic Requirements

### Join ID System
1. **Generate Unique Join IDs**: Create unique 6-8 character alphanumeric codes
2. **One-time Use**: Join IDs become invalid after being used for linking
3. **Creator Only**: Only family creators can generate Join IDs
4. **Validation**: Check if Join ID exists and belongs to a family creator

### Family Linking Logic
1. **Bidirectional Visibility**: When families are linked, both can see each other's members
2. **Hierarchical Structure**: Maintain parent-child relationships across linked families
3. **Conflict Resolution**: Handle duplicate member names and relationships
4. **Access Control**: Ensure users can only see families they're linked to

### Data Validation
1. **Phone Number Format**: Validate international phone number formats
2. **Date Validation**: Ensure birth/death dates are logical
3. **Relationship Validation**: Validate family relationships (no circular references)
4. **File Upload**: Validate image files (size, format, dimensions)

### Security Requirements
1. **Password Hashing**: Use bcrypt with salt rounds
2. **JWT Security**: Implement token rotation and secure storage
3. **Rate Limiting**: Prevent brute force attacks on auth endpoints
4. **Input Sanitization**: Prevent SQL injection and XSS attacks
5. **File Upload Security**: Validate and sanitize uploaded files

## Real-time Features

### WebSocket Events
1. **Family Member Added**: Notify all family members when someone new is added
2. **Family Linked**: Notify members when families are linked
3. **Profile Updates**: Real-time profile picture and info updates
4. **Join ID Generated**: Notify when new Join IDs are created

### Notification System
1. **Email Notifications**: Welcome emails, verification codes, family updates
2. **SMS Notifications**: Phone verification codes
3. **Push Notifications**: Family member additions, linking requests
4. **In-app Notifications**: Real-time updates within the app

## Performance Requirements

### Caching Strategy
1. **Redis Caching**: Cache frequently accessed family data
2. **User Sessions**: Store active sessions in Redis
3. **API Response Caching**: Cache static data like family trees
4. **Database Query Optimization**: Use proper indexing for family queries

### Scalability
1. **Horizontal Scaling**: Support multiple server instances
2. **Database Sharding**: Plan for large family networks
3. **CDN Integration**: Serve static assets and images globally
4. **Load Balancing**: Distribute traffic across multiple servers

## Error Handling

### Standard Error Responses
```json
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid input data",
        "details": {
            "field": "phone",
            "message": "Phone number is required"
        }
    }
}
```

### Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Invalid credentials or token
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Testing Requirements

### Unit Tests
1. **Authentication Logic**: Test login, registration, token validation
2. **Family Management**: Test CRUD operations for families and members
3. **Join ID System**: Test generation, validation, and linking
4. **Data Validation**: Test input validation and sanitization

### Integration Tests
1. **API Endpoints**: Test all endpoints with various scenarios
2. **Database Operations**: Test complex family queries and relationships
3. **File Upload**: Test image upload and processing
4. **Real-time Features**: Test WebSocket connections and events

### Performance Tests
1. **Load Testing**: Test with multiple concurrent users
2. **Database Performance**: Test with large family networks
3. **File Upload Performance**: Test with various image sizes
4. **Memory Usage**: Monitor memory consumption under load

## Deployment Requirements

### Environment Configuration
1. **Environment Variables**: Secure configuration management
2. **Database Migrations**: Automated schema updates
3. **Health Checks**: Monitor application and database health
4. **Logging**: Comprehensive logging for debugging and monitoring

### Security Measures
1. **HTTPS**: Secure all API communications
2. **CORS Configuration**: Proper cross-origin resource sharing
3. **API Rate Limiting**: Prevent abuse and DDoS attacks
4. **Data Encryption**: Encrypt sensitive data at rest and in transit

## Monitoring and Analytics

### Metrics to Track
1. **User Engagement**: Daily/monthly active users
2. **Family Growth**: New families and members added
3. **Linking Activity**: Family linking success rates
4. **Performance Metrics**: Response times, error rates
5. **Storage Usage**: Database and file storage consumption

### Logging Requirements
1. **Access Logs**: Track all API requests and responses
2. **Error Logs**: Detailed error information for debugging
3. **Security Logs**: Track authentication and authorization events
4. **Business Logs**: Track important business events (family linking, etc.)

## Timeline and Milestones

### Phase 1 (Weeks 1-2): Foundation
- Set up project structure and database
- Implement user authentication system
- Create basic user profile management

### Phase 2 (Weeks 3-4): Family Management
- Implement family creation and management
- Add family member CRUD operations
- Implement basic Join ID system

### Phase 3 (Weeks 5-6): Advanced Features
- Complete Join ID linking system
- Implement privacy settings
- Add file upload functionality

### Phase 4 (Weeks 7-8): Real-time and Polish
- Implement WebSocket connections
- Add notification system
- Performance optimization and testing

### Phase 5 (Weeks 9-10): Deployment
- Security audit and penetration testing
- Production deployment
- Monitoring and analytics setup

## Success Criteria

1. **Performance**: API response times under 200ms for 95% of requests
2. **Reliability**: 99.9% uptime with proper error handling
3. **Security**: Pass security audit with no critical vulnerabilities
4. **Scalability**: Support 10,000+ concurrent users
5. **User Experience**: Smooth family linking and real-time updates

## Contact Information

For questions or clarifications about these requirements, please contact the frontend development team. We're available for regular sync meetings to ensure alignment between frontend and backend development.

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Prepared By**: Frontend Development Team  
**Approved By**: [Project Manager] 