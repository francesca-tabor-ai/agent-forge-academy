---
title: "Module 2: From Ambiguity to Precision (Specify & Clarify)"
description: "Master the art of capturing requirements and using clarification loops to achieve precision"
module: "2"
order: 2
---

# Module 2: From Ambiguity to Precision (Specify & Clarify)

**Duration:** Week 2  
**Learning Objectives:**
- Learn to capture requirements in high-level specifications
- Master the clarification loop methodology
- Understand how to codify governing principles
- Practice writing clear, actionable specifications

---

## 2.1 Phase 1: Specify

### Introduction

The Specify phase is the foundation of SDDD. It's where we capture user stories, business requirements, and success criteria in high-level markdown files that serve as the single source of truth.

### What is a Specification?

**A specification is:**
- A structured document describing what to build
- Written in markdown for readability and version control
- Focused on intent and requirements, not implementation
- The authority that code must follow
- Living documentation that evolves with the project

**A specification is NOT:**
- A detailed implementation plan
- A code template
- A rigid contract that can't change
- Documentation written after coding

### Structure of a Specification

#### 1. Header and Metadata

```markdown
---
title: "Feature: User Authentication"
description: "Allow users to authenticate and access protected resources"
version: "1.0"
status: "draft"
author: "Team Name"
created: "2025-01-15"
---

# Feature: User Authentication
```

#### 2. Business Context

```markdown
## Business Context

### Problem
Users need a secure way to access their accounts and protected resources.
Current system lacks authentication, preventing personalized experiences.

### Value Proposition
- Secure user access
- Personalized experiences
- Data protection
- User trust
```

#### 3. User Stories

```markdown
## User Stories

### Story 1: User Login
**As a** registered user  
**I want to** log in with my email and password  
**So that** I can access my account and personalized content

### Story 2: Session Management
**As a** logged-in user  
**I want to** remain logged in across sessions  
**So that** I don't have to re-authenticate frequently

### Story 3: Secure Logout
**As a** logged-in user  
**I want to** log out securely  
**So that** my session is terminated and my account is protected
```

#### 4. Requirements

```markdown
## Requirements

### Functional Requirements

#### FR1: Email/Password Authentication
- Users must authenticate with valid email and password
- Invalid credentials must be rejected
- Failed login attempts must be logged
- Account lockout after 5 failed attempts

#### FR2: Session Management
- Sessions must persist for 24 hours
- Sessions must be invalidated on logout
- Sessions must expire after inactivity (30 minutes)
- Multiple sessions per user are allowed

#### FR3: Password Security
- Passwords must be at least 8 characters
- Passwords must contain uppercase, lowercase, number, and special character
- Passwords must be hashed using bcrypt (minimum 10 rounds)
- Passwords must never be stored in plain text

### Non-Functional Requirements

#### NFR1: Performance
- Login must complete in < 500ms (p95)
- Session validation must complete in < 100ms (p95)
- Support 1000+ concurrent authenticated users

#### NFR2: Security
- All authentication endpoints must use HTTPS
- Passwords must be hashed before storage
- Session tokens must be cryptographically secure
- CSRF protection must be implemented

#### NFR3: Reliability
- Authentication service must have 99.9% uptime
- Failed login attempts must not crash the system
- Session validation must handle database failures gracefully
```

#### 5. API Contracts

```markdown
## API Contracts

### POST /api/auth/login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (Success - 200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires": "2025-01-16T12:00:00Z",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Response (Error - 401):**
```json
{
  "error": "Invalid credentials",
  "code": "AUTH_INVALID"
}
```

### POST /api/auth/logout

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "message": "Logged out successfully"
}
```
```

#### 6. Data Models

```markdown
## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string; // bcrypt hash, never plain text
  name: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;
}
```

### Session
```typescript
interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  lastActivityAt: Date;
}
```
```

#### 7. Success Criteria

```markdown
## Success Criteria

### Acceptance Criteria
- [ ] Users can log in with valid credentials
- [ ] Users cannot log in with invalid credentials
- [ ] Sessions persist for 24 hours
- [ ] Sessions expire after 30 minutes of inactivity
- [ ] Users can log out successfully
- [ ] Account locks after 5 failed attempts
- [ ] All passwords are hashed before storage
- [ ] Login completes in < 500ms (p95)

### Test Scenarios
1. Valid login → Success with token
2. Invalid email → Error 401
3. Invalid password → Error 401
4. 5 failed attempts → Account locked
5. Session expiration → Requires re-login
6. Concurrent sessions → Allowed
7. Logout → Session invalidated
```

### Best Practices for Specifications

#### 1. Be Specific, Not Prescriptive

**Wrong:**
```markdown
Use Express.js with JWT tokens stored in cookies
```

**Right:**
```markdown
Authentication must use secure, stateless tokens.
Tokens must be transmitted securely.
Tokens must expire after 24 hours.
```

#### 2. Focus on What, Not How

**Wrong:**
```markdown
Create a MongoDB collection called 'users' with indexes on email
```

**Right:**
```markdown
User data must be stored persistently.
Email lookups must be fast (O(log n) or better).
Email must be unique across all users.
```

#### 3. Include Edge Cases

```markdown
## Edge Cases

### EC1: Concurrent Login Attempts
If a user attempts to log in from multiple devices simultaneously,
all valid attempts should succeed and create separate sessions.

### EC2: Expired Session During Request
If a session expires while a user is making a request,
the request should fail with 401 and the user should be
prompted to log in again.
```

#### 4. Define Error Handling

```markdown
## Error Handling

### Error Types
- **AUTH_INVALID**: Invalid email or password
- **AUTH_LOCKED**: Account locked due to failed attempts
- **AUTH_EXPIRED**: Session token expired
- **AUTH_MISSING**: No authentication token provided
- **AUTH_INVALID_TOKEN**: Invalid or malformed token

### Error Response Format
All errors must follow this format:
```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {} // Optional additional context
}
```
```

### Specification Templates

#### Template: Feature Specification

```markdown
---
title: "Feature: [Feature Name]"
description: "[Brief description]"
version: "1.0"
status: "draft"
---

# Feature: [Feature Name]

## Business Context
[Why this feature exists, what problem it solves]

## User Stories
[User stories in As a/I want/So that format]

## Requirements
### Functional Requirements
[Detailed functional requirements]

### Non-Functional Requirements
[Performance, security, reliability requirements]

## API Contracts
[API endpoints, request/response formats]

## Data Models
[Data structures and relationships]

## Success Criteria
[Acceptance criteria and test scenarios]

## Edge Cases
[Unusual scenarios to handle]

## Error Handling
[Error types and handling strategies]
```

### Version Control for Specifications

**Best Practices:**
- Store specs in Git
- Use meaningful commit messages
- Tag major versions
- Maintain changelog
- Review changes before merging

**Example Git Workflow:**
```bash
# Create specification
git add specs/feature-authentication.md
git commit -m "Add authentication feature specification"

# Update specification
git add specs/feature-authentication.md
git commit -m "Update: Add session expiration requirements"

# Tag version
git tag -a v1.0 -m "Authentication spec v1.0"
```

---

## 2.2 Phase 3: The Clarification Loop

### Introduction

The Clarification Loop is a critical SDDD phase where AI "formally quizzes" the developer to surface gaps in logic, resolve ambiguities, and align stakeholders before coding begins.

### What is the Clarification Loop?

**The Clarification Loop is:**
- An iterative process of questions and answers
- AI-driven gap analysis
- A way to surface missing requirements
- A method to resolve ambiguities
- A tool for stakeholder alignment

**The Clarification Loop is NOT:**
- A one-time Q&A session
- A way to avoid writing specifications
- A replacement for human judgment
- A tool for implementation details

### Why the Clarification Loop Matters

#### Problem: Hidden Assumptions

**Example:**
```markdown
## Requirement
Users can search for products
```

**Hidden Assumptions:**
- What can users search by? (name, category, description?)
- How many results should be shown?
- Should search support typos?
- What if no results are found?
- Should search be case-sensitive?

**Without Clarification:**
- AI makes assumptions
- Implementation may not match expectations
- Rework required
- Delays and frustration

**With Clarification:**
- All assumptions are explicit
- Requirements are complete
- Implementation matches expectations
- Faster delivery

### The Clarification Process

#### Step 1: Initial Specification

Write the initial specification with your best understanding:

```markdown
## Feature: Product Search

### Requirements
- Users can search for products
- Search returns relevant results
- Results are displayed in a list
```

#### Step 2: AI Clarification Questions

AI analyzes the specification and asks clarifying questions:

```
Clarification Questions:

1. What fields should be searchable?
   - Product name only?
   - Product description?
   - Category?
   - SKU?
   - All of the above?

2. How should search handle typos and variations?
   - Exact match only?
   - Fuzzy matching?
   - Autocomplete suggestions?

3. What is the maximum number of results?
   - 10?
   - 50?
   - 100?
   - Paginated?

4. How should results be sorted?
   - Relevance?
   - Price?
   - Popularity?
   - User preference?

5. What happens when no results are found?
   - Show "No results" message?
   - Suggest alternatives?
   - Show popular products?
```

#### Step 3: Developer Answers

Developer provides answers based on business requirements:

```
Answers:

1. Searchable fields: Product name, description, and category
2. Search should support fuzzy matching and handle typos
3. Maximum results: 50 per page, with pagination
4. Results sorted by: Relevance first, then popularity
5. No results: Show "No results found" with suggestions for similar searches
```

#### Step 4: Updated Specification

Specification is updated with clarifications:

```markdown
## Feature: Product Search

### Requirements

#### FR1: Search Functionality
- Users can search by product name, description, or category
- Search supports fuzzy matching and handles typos
- Search is case-insensitive
- Search returns up to 50 results per page
- Results are paginated (50 per page)

#### FR2: Result Display
- Results sorted by relevance (primary), then popularity (secondary)
- Each result shows: name, price, image, category
- Results are displayed in a responsive grid layout

#### FR3: No Results Handling
- When no results found, display "No results found" message
- Show suggestions for similar search terms
- Provide link to browse all products
```

#### Step 5: Iterative Refinement

Repeat steps 2-4 until all ambiguities are resolved:

```
Additional Clarification Questions:

1. What defines "relevance" in search results?
2. How should search handle special characters?
3. Should search support filters (price range, category)?
4. What is the performance requirement for search?
```

### Types of Clarification Questions

#### 1. Functional Gaps

**Questions about what the system should do:**
- "What happens when [edge case]?"
- "Should the system support [feature]?"
- "How should [scenario] be handled?"

**Example:**
```
Q: What happens when a user tries to purchase an out-of-stock item?
A: The system should show "Out of stock" and allow users to 
   sign up for restock notifications.
```

#### 2. Non-Functional Requirements

**Questions about performance, security, reliability:**
- "What is the performance requirement?"
- "What security measures are needed?"
- "What is the expected load?"

**Example:**
```
Q: What is the maximum response time for search?
A: Search results must be returned in < 200ms (p95).
```

#### 3. Business Rules

**Questions about business logic:**
- "What are the business rules for [scenario]?"
- "How should [business process] work?"
- "What are the constraints?"

**Example:**
```
Q: What is the minimum order value?
A: Minimum order value is $25. Orders below $25 should 
   show a message encouraging users to add more items.
```

#### 4. User Experience

**Questions about user interaction:**
- "How should users interact with [feature]?"
- "What feedback should users receive?"
- "What is the expected user flow?"

**Example:**
```
Q: How should users be notified of order confirmation?
A: Users should receive:
   1. On-screen confirmation message
   2. Email confirmation within 5 minutes
   3. SMS notification (if opted in)
```

#### 5. Integration Points

**Questions about external systems:**
- "How should the system integrate with [external system]?"
- "What data needs to be synced?"
- "What are the integration constraints?"

**Example:**
```
Q: How should payment processing integrate with the system?
A: The system should integrate with Stripe API. Payment 
   processing should be asynchronous. Failed payments should 
   be retried up to 3 times with exponential backoff.
```

### Best Practices for Clarification

#### 1. Be Thorough

Don't rush through clarifications. Take time to think through each question and provide complete answers.

#### 2. Consult Stakeholders

For business-critical questions, consult with product managers, designers, and other stakeholders.

#### 3. Document Decisions

Record all clarification answers in the specification so they become part of the permanent record.

#### 4. Iterate Until Clear

Continue the clarification loop until:
- All ambiguities are resolved
- All edge cases are covered
- All stakeholders are aligned
- The specification is complete

#### 5. Validate Assumptions

Use clarification to validate assumptions:
- "I assume [X]. Is this correct?"
- "Should the system handle [Y]?"
- "What is the expected behavior for [Z]?"

### Common Clarification Patterns

#### Pattern 1: Missing Edge Cases

**AI Question:**
"What happens when [unusual scenario]?"

**Developer Response:**
[Define the behavior, update specification]

#### Pattern 2: Ambiguous Requirements

**AI Question:**
"Requirement says [X]. Does this mean [Y] or [Z]?"

**Developer Response:**
[Clarify the intent, update specification]

#### Pattern 3: Conflicting Requirements

**AI Question:**
"Requirement A says [X] but Requirement B says [Y]. Which takes precedence?"

**Developer Response:**
[Resolve conflict, update specification]

#### Pattern 4: Performance Expectations

**AI Question:**
"What is the expected performance for [operation]?"

**Developer Response:**
[Define performance requirements, update specification]

### Tools for Clarification

#### 1. AI-Powered Clarification

Use AI tools (ChatGPT, Claude, etc.) to analyze specifications and generate clarification questions.

#### 2. Specification Review Tools

Tools that analyze specifications for:
- Missing requirements
- Ambiguous language
- Incomplete information
- Contradictions

#### 3. Stakeholder Collaboration

Use collaboration tools to:
- Share specifications
- Collect feedback
- Track clarifications
- Maintain alignment

---

## 2.3 Governing Principles (The Constitution)

### Introduction

Governing Principles, also known as "The Constitution," are non-negotiable standards that the AI must follow. They codify organizational standards, technical requirements, and quality criteria.

### What are Governing Principles?

**Governing Principles are:**
- Non-negotiable standards
- Organizational requirements
- Technical constraints
- Quality criteria
- Compliance requirements

**Governing Principles are NOT:**
- Implementation details
- Suggestions or guidelines
- Optional best practices
- Project-specific requirements

### Why Governing Principles Matter

#### Problem: Inconsistent Standards

**Without Governing Principles:**
- Different code styles in different files
- Inconsistent error handling
- Varying test coverage
- Mixed architectural patterns
- No quality standards

**With Governing Principles:**
- Consistent code style
- Standardized error handling
- Minimum test coverage enforced
- Unified architectural patterns
- Clear quality standards

### Structure of Governing Principles

#### 1. Code Quality Standards

```markdown
## Code Quality Standards

### Test Coverage
- Minimum 80% code coverage required
- All critical paths must have tests
- Integration tests required for APIs
- E2E tests required for user flows

### Code Style
- Follow ESLint configuration (Airbnb style guide)
- Maximum function length: 50 lines
- Maximum file length: 300 lines
- No console.log in production code
- All functions must have JSDoc comments

### Error Handling
- All errors must be caught and handled
- Error messages must be user-friendly
- Errors must be logged with context
- No silent failures allowed
```

#### 2. Technical Stack Requirements

```markdown
## Technical Stack Requirements

### Backend
- Runtime: Node.js 18+ (LTS)
- Framework: Express.js
- Database: PostgreSQL 14+
- ORM: Prisma
- Testing: Jest + Supertest

### Frontend
- Framework: React 18+
- Language: TypeScript 5+
- Styling: Tailwind CSS
- State Management: Zustand
- Testing: React Testing Library + Jest

### Infrastructure
- Cloud Provider: AWS
- Containerization: Docker
- CI/CD: GitHub Actions
- Monitoring: Datadog
- Logging: CloudWatch
```

#### 3. Security Standards

```markdown
## Security Standards

### Authentication
- All endpoints must authenticate users (except public APIs)
- JWT tokens must expire after 24 hours
- Refresh tokens must be rotated
- Password hashing: bcrypt (minimum 10 rounds)

### Data Protection
- All sensitive data must be encrypted at rest
- All data in transit must use HTTPS
- PII must be masked in logs
- GDPR compliance required for EU users

### API Security
- Rate limiting: 100 requests/minute per IP
- CORS must be configured properly
- Input validation required for all inputs
- SQL injection prevention (use parameterized queries)
```

#### 4. Performance Standards

```markdown
## Performance Standards

### API Response Times
- P50: < 100ms
- P95: < 500ms
- P99: < 1000ms

### Database Queries
- All queries must use indexes
- N+1 query problems must be avoided
- Query timeouts: 5 seconds
- Connection pooling required

### Frontend Performance
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse score: > 90
- Bundle size: < 500KB (gzipped)
```

#### 5. Documentation Requirements

```markdown
## Documentation Requirements

### Code Documentation
- All public functions must have JSDoc comments
- Complex algorithms must have inline comments
- README.md required for all modules
- Architecture decisions must be documented (ADRs)

### API Documentation
- OpenAPI/Swagger specification required
- All endpoints must be documented
- Request/response examples required
- Error responses must be documented

### User Documentation
- User guides for all features
- API documentation for external consumers
- Deployment guides
- Troubleshooting guides
```

### Creating Your Constitution

#### Step 1: Identify Standards

**Questions to Ask:**
- What code quality standards do we need?
- What technical stack are we using?
- What security requirements must we meet?
- What performance targets do we have?
- What documentation is required?

#### Step 2: Document Standards

Create a `GOVERNING_PRINCIPLES.md` file:

```markdown
# Governing Principles

## Version
1.0

## Last Updated
2025-01-15

## Code Quality Standards
[Your standards]

## Technical Stack Requirements
[Your requirements]

## Security Standards
[Your standards]

## Performance Standards
[Your standards]

## Documentation Requirements
[Your requirements]
```

#### Step 3: Enforce Standards

**Automated Enforcement:**
- Linters (ESLint, Prettier)
- Pre-commit hooks
- CI/CD checks
- Automated testing

**Manual Enforcement:**
- Code reviews
- Architecture reviews
- Quality gates

#### Step 4: Evolve Standards

**Regular Review:**
- Review standards quarterly
- Update based on learnings
- Remove outdated requirements
- Add new requirements as needed

### Example: Complete Constitution

```markdown
# Governing Principles (The Constitution)

## Version: 1.0
## Last Updated: 2025-01-15
## Applies To: All projects

## Code Quality Standards

### Test Coverage
- Minimum 80% code coverage
- All critical paths must have tests
- Integration tests for all APIs
- E2E tests for user flows

### Code Style
- ESLint (Airbnb configuration)
- Prettier for formatting
- Maximum function length: 50 lines
- Maximum file length: 300 lines
- No console.log in production

### Error Handling
- All errors must be caught
- User-friendly error messages
- Errors logged with context
- No silent failures

## Technical Stack

### Backend
- Node.js 18+ (LTS)
- Express.js
- PostgreSQL 14+
- Prisma ORM
- Jest + Supertest

### Frontend
- React 18+
- TypeScript 5+
- Tailwind CSS
- Zustand
- React Testing Library

## Security Standards

### Authentication
- JWT tokens (24h expiration)
- Refresh token rotation
- bcrypt (10+ rounds)

### Data Protection
- Encryption at rest
- HTTPS for all traffic
- PII masking in logs
- GDPR compliance

### API Security
- Rate limiting (100 req/min)
- CORS configuration
- Input validation
- Parameterized queries

## Performance Standards

### API Response Times
- P50: < 100ms
- P95: < 500ms
- P99: < 1000ms

### Database
- All queries indexed
- No N+1 queries
- 5s query timeout
- Connection pooling

### Frontend
- FCP: < 1.5s
- TTI: < 3.5s
- Lighthouse: > 90
- Bundle: < 500KB

## Documentation Requirements

### Code
- JSDoc for public functions
- Inline comments for complex logic
- README.md per module
- ADRs for architecture

### API
- OpenAPI specification
- All endpoints documented
- Request/response examples
- Error documentation

## Enforcement

### Automated
- ESLint + Prettier
- Pre-commit hooks
- CI/CD checks
- Coverage reports

### Manual
- Code reviews
- Architecture reviews
- Quality gates
```

### Integrating Principles into Specifications

#### Reference in Specifications

```markdown
## Governing Principles

This feature must comply with:
- [Governing Principles v1.0](../GOVERNING_PRINCIPLES.md)

### Specific Requirements
- Test coverage: Minimum 80%
- API response time: < 500ms (p95)
- Security: JWT authentication required
```

#### AI Enforcement

When AI generates code, it must:
1. Check governing principles
2. Apply standards automatically
3. Validate compliance
4. Report violations

**Example AI Prompt:**
```
Generate code for [feature] following these governing principles:
- Minimum 80% test coverage
- ESLint (Airbnb) style guide
- JWT authentication
- Response time < 500ms
```

---

## Lab 2: Create a Specification Document with Clarification Loop

### Objective

Create a complete specification document for a feature, then use the clarification loop to refine it and identify gaps.

### Tasks

1. **Feature Selection (30 min)**
   - Choose a feature to specify (e.g., user profile, product reviews, shopping cart)
   - Document why this feature is needed
   - Identify stakeholders

2. **Initial Specification (2 hours)**
   - Write complete specification using template
   - Include: business context, user stories, requirements, API contracts, data models
   - Document success criteria

3. **Clarification Loop (2 hours)**
   - Use AI to generate clarification questions
   - Answer all questions thoroughly
   - Update specification with clarifications
   - Iterate until all gaps are filled

4. **Governing Principles (1 hour)**
   - Create or reference governing principles
   - Ensure specification complies with principles
   - Document any exceptions

5. **Final Review (30 min)**
   - Review complete specification
   - Validate completeness
   - Check for ambiguities
   - Prepare presentation

### Deliverables

- Complete specification document (5-10 pages)
- Clarification questions and answers log
- Governing principles document
- Presentation (10 slides)

### Evaluation Criteria

- **Specification Quality (30%):** Completeness, clarity, structure
- **Clarification Process (30%):** Quality of questions, thoroughness of answers
- **Governing Principles (20%):** Appropriate standards, compliance
- **Presentation (20%):** Clarity, professionalism, completeness

---

## Key Takeaways

1. **Specify First:** Capture requirements in structured markdown specifications
2. **Clarification Loop:** Use AI to surface gaps and resolve ambiguities
3. **Governing Principles:** Codify non-negotiable standards
4. **Iterative Refinement:** Continue clarifying until specification is complete
5. **Documentation:** Specifications are living documents that evolve

---

## Additional Resources

### Reading
- "Writing Effective Specifications" (Guide)
- "The Clarification Loop Methodology" (Research Paper)
- "Governing Principles for Software Development" (Blog Post)

### Tools
- Specification templates
- AI clarification tools
- Specification review tools
- Markdown editors

### Next Steps
- Complete Lab 2
- Review Module 3: Engineering the Blueprint
- Practice writing specifications
- Start using clarification loops in your work

---

**Module 2 Complete. Ready for Module 3? →**
