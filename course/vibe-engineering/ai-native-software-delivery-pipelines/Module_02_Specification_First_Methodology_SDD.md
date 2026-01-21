---
title: "Module 2: Specification-First Methodology (SDD)"
description: "Move beyond vibe coding to executable blueprints for AI agents"
module: "2"
order: 2
---

# Module 2: Specification-First Methodology (SDD)

**Duration:** Week 2  
**Learning Objectives:**
- **the limitations of "vibe coding" Understanding**: Understand the limitations of "vibe coding"
- **to create machine-parsable Product Requirements Documents Understanding**: Learn to create machine-parsable Product Requirements Documents (PRDs)
- **algorithmic verification using given/when/then structures Understanding**: Master algorithmic verification using given/when/then structures
- **OpenSpec and Spec-Kit toolkits Implementation**: Implement OpenSpec and Spec-Kit toolkits
- **Align Humans**: Align humans and AI before implementation begins

---

## 2.1 Beyond Vibe Coding

### What is "Vibe Coding"?

"Vibe coding" refers to the practice of providing vague, ambiguous instructions to AI coding assistants and hoping they understand the intent. It relies on the AI's ability to infer meaning from incomplete or imprecise descriptions.

**Example of Vibe Coding:**
```
User: "Make a login page that looks good"
AI: [Generates code based on assumptions]
Result: [May or may not match expectations]
```

**Problems with Vibe Coding:**
- Ambiguity leads to incorrect implementations
- No way to verify correctness algorithmically
- Requires multiple iterations to get it right
- Difficult to maintain and extend
- No shared understanding between humans and AI

### The Specification-First Alternative

Specification-Driven Development (SDD) eliminates ambiguity by creating formal, machine-parsable specifications before any code is written.

**Example of Specification-First:**
```yaml
feature: user_authentication
requirements:
  - user_can_login_with_email_and_password
  - user_can_reset_password
  - failed_attempts_are_limited_to_5
  - session_expires_after_24_hours

specifications:
  login_form:
    fields:
      - email: { type: string, format: email, required: true }
      - password: { type: string, min_length: 8, required: true }
    validation:
      - email_must_be_valid_format
      - password_must_meet_complexity_requirements
    behavior:
      - on_success: redirect_to_dashboard
      - on_failure: show_error_message
      - after_5_failures: lock_account_for_30_minutes
```

**Benefits:**
- Clear, unambiguous requirements
- Machine-parsable format
- Algorithmic verification possible
- Shared understanding
- Single source of truth

---

## 2.2 Defining Intent: Machine-Parsable PRDs

### Traditional PRDs vs. Machine-Parsable PRDs

**Traditional PRD (Human-Readable Only):**
```
The login page should allow users to authenticate.
It should look modern and be user-friendly.
Error handling should be appropriate.
```

**Machine-Parsable PRD:**
```yaml
product_requirement: user_authentication
version: 1.0.0

intent:
  description: "Enable users to securely authenticate and access their accounts"
  business_value: "Required for user account management and personalization"

functional_requirements:
  - id: FR-001
    description: "User can authenticate with email and password"
    acceptance_criteria:
      - given: "user is on login page"
        when: "user enters valid email and password"
        then: "user is authenticated and redirected to dashboard"
      - given: "user is on login page"
        when: "user enters invalid credentials"
        then: "error message is displayed and user remains on login page"
  
  - id: FR-002
    description: "User can reset forgotten password"
    acceptance_criteria:
      - given: "user is on login page"
        when: "user clicks 'Forgot Password'"
        then: "password reset form is displayed"
      - given: "user is on password reset form"
        when: "user enters registered email"
        then: "reset link is sent to email"

non_functional_requirements:
  - id: NFR-001
    type: security
    description: "Passwords must be hashed using bcrypt"
    verification: "algorithmic_check: password_hash_algorithm == 'bcrypt'"
  
  - id: NFR-002
    type: performance
    description: "Login request must complete within 500ms"
    verification: "performance_test: login_response_time < 500ms"

constraints:
  - "Must comply with GDPR data protection requirements"
  - "Must support OAuth 2.0 for third-party authentication"
  - "Must be accessible (WCAG 2.1 AA compliant)"

dependencies:
  - user_database
  - email_service
  - session_management
```

### Structure of Machine-Parsable PRDs

**1. Intent Section**
- Clear description of what is being built
- Business value and rationale
- Success criteria

**2. Functional Requirements**
- Unique identifiers for each requirement
- Given/When/Then acceptance criteria
- Edge cases and error scenarios

**3. Non-Functional Requirements**
- Performance, security, scalability
- Algorithmic verification rules
- Measurable criteria

**4. Constraints**
- Technical limitations
- Compliance requirements
- Integration constraints

**5. Dependencies**
- External systems
- Required services
- Data sources

### Creating Effective Specifications

**Principles:**
1. **Unambiguous:** Every requirement has one clear interpretation
2. **Complete:** All scenarios are covered
3. **Testable:** Can be verified algorithmically
4. **Traceable:** Linked to business objectives
5. **Maintainable:** Easy to update and extend

**Best Practices:**
- Use formal structures (YAML, JSON, or structured markdown)
- Include examples and edge cases
- Define verification methods for each requirement
- Version control specifications
- Review specifications before implementation

---

## 2.3 Algorithmic Verification: Given/When/Then

### The Power of Algorithmic Verification

Algorithmic verification means tests can be generated automatically from specifications without AI "monkey" involvement, ensuring deterministic correctness.

**Traditional Testing:**
```
1. Human writes test
2. Human runs test
3. Human interprets results
4. AI may have written code, but tests are human-created
```

**Algorithmic Verification:**
```
1. Specification defines Given/When/Then
2. Test generator creates tests automatically
3. Tests run deterministically
4. Results are unambiguous
```

### Given/When/Then Structure

**Format:**
```
Given [initial context]
When [action is performed]
Then [expected outcome]
```

**Example:**
```yaml
scenario: successful_login
given:
  - user_exists: { email: "user@example.com", password: "SecurePass123!" }
  - user_is_on_login_page: true
when:
  action: submit_login_form
  inputs:
    email: "user@example.com"
    password: "SecurePass123!"
then:
  - user_is_authenticated: true
  - session_is_created: true
  - redirect_occurs: { target: "/dashboard" }
  - user_id_is_stored_in_session: true
```

### Generating Tests from Specifications

**Specification:**
```yaml
feature: user_authentication
scenarios:
  - id: SC-001
    name: successful_login
    given: [user_exists, user_is_on_login_page]
    when: submit_login_form(email, password)
    then: [user_is_authenticated, redirect_to_dashboard]
```

**Generated Test (Python):**
```python
def test_successful_login():
    # Given
    user = create_user(email="user@example.com", password="SecurePass123!")
    navigate_to_login_page()
    
    # When
    submit_login_form(email="user@example.com", password="SecurePass123!")
    
    # Then
    assert user_is_authenticated()
    assert current_url() == "/dashboard"
    assert session_contains_user_id(user.id)
```

**Generated Test (JavaScript):**
```javascript
describe('User Authentication', () => {
  it('should successfully login with valid credentials', () => {
    // Given
    const user = createUser({ email: 'user@example.com', password: 'SecurePass123!' });
    navigateToLoginPage();
    
    // When
    submitLoginForm({ email: 'user@example.com', password: 'SecurePass123!' });
    
    // Then
    expect(userIsAuthenticated()).toBe(true);
    expect(getCurrentUrl()).toBe('/dashboard');
    expect(sessionContainsUserId(user.id)).toBe(true);
  });
});
```

### Verification Without AI Involvement

**Key Principle:** Tests are generated deterministically from specifications, not by AI interpreting vague requirements.

**Process:**
1. Specification defines exact Given/When/Then
2. Test generator (deterministic tool) creates tests
3. Tests run against implementation
4. Results are binary: pass or fail

**Benefits:**
- No ambiguity in test interpretation
- Consistent test generation
- Reproducible results
- No "AI hallucinations" in test creation
- Deterministic correctness verification

### Property-Based Testing

For complex behaviors, define properties that must always be true:

```yaml
properties:
  - id: PROP-001
    name: password_hashing_invariance
    description: "Password hash is always different from plaintext"
    verification: |
      for all passwords p:
        hash(p) != p
        hash(p) is constant for same p
        hash(p1) != hash(p2) when p1 != p2
  
  - id: PROP-002
    name: session_security
    description: "Session tokens are cryptographically secure"
    verification: |
      for all sessions s:
        token(s) is unique
        token(s) cannot be predicted
        token(s) expires after 24 hours
```

---

## 2.4 OpenSpec and Spec-Kit

### What is OpenSpec?

OpenSpec is an open specification format for defining software requirements in a machine-parsable way. It provides a standard structure that both humans and AI can understand.

**OpenSpec Structure:**
```yaml
openspec_version: "1.0"
feature:
  id: "user-authentication"
  name: "User Authentication"
  description: "Allow users to authenticate and access their accounts"
  
  requirements:
    - id: "REQ-001"
      type: "functional"
      description: "User can login with email and password"
      priority: "high"
      
      scenarios:
        - id: "SC-001"
          name: "Successful login"
          given:
            - "User exists in system"
            - "User is on login page"
          when:
            action: "submit_login_form"
            parameters:
              email: "string"
              password: "string"
          then:
            - "User is authenticated"
            - "User is redirected to dashboard"
            - "Session is created"
        
        - id: "SC-002"
          name: "Failed login"
          given:
            - "User exists in system"
            - "User is on login page"
          when:
            action: "submit_login_form"
            parameters:
              email: "string"
              password: "string (incorrect)"
          then:
            - "Error message is displayed"
            - "User remains on login page"
            - "Session is not created"
  
  verification:
    - type: "unit_test"
      generator: "spec-kit"
      framework: "pytest"
    - type: "integration_test"
      generator: "spec-kit"
      framework: "pytest"
    - type: "e2e_test"
      generator: "spec-kit"
      framework: "playwright"
```

### What is Spec-Kit?

Spec-Kit is a toolkit that works with OpenSpec to:
- Generate tests from specifications
- Validate specification completeness
- Generate documentation
- Create implementation stubs
- Verify implementations against specifications

**Spec-Kit Workflow:**
```
OpenSpec File
    ↓
Spec-Kit Parser
    ↓

 Test Generator Doc Generator  Code Stubs   

    ↓               ↓               ↓
Tests          Documentation    Implementation
```

**Using Spec-Kit:**
```bash
# Install Spec-Kit
npm install -g spec-kit

# Generate tests from specification
spec-kit generate-tests user-authentication.openspec --framework pytest

# Validate specification
spec-kit validate user-authentication.openspec

# Generate documentation
spec-kit generate-docs user-authentication.openspec --format markdown

# Generate code stubs
spec-kit generate-stubs user-authentication.openspec --language python
```

### Aligning Humans and AI

**Before Implementation:**
1. **Human creates OpenSpec** - Defines requirements clearly
2. **Spec-Kit validates** - Ensures completeness
3. **Human reviews** - Confirms correctness
4. **AI reads OpenSpec** - Understands exact requirements
5. **AI implements** - Follows specification precisely
6. **Tests verify** - Algorithmic verification ensures correctness

**Benefits:**
- No ambiguity between human and AI
- Single source of truth
- Automated verification
- Faster iteration cycles
- Higher quality outcomes

---

## 2.5 Practical Implementation

### Creating Your First OpenSpec

**Step 1: Define the Feature**
```yaml
openspec_version: "1.0"
feature:
  id: "todo-list"
  name: "Todo List Management"
  description: "Users can create, read, update, and delete todo items"
```

**Step 2: Add Requirements**
```yaml
  requirements:
    - id: "REQ-001"
      type: "functional"
      description: "User can create a new todo item"
      scenarios:
        - id: "SC-001"
          name: "Create todo with title"
          given: ["User is authenticated", "User is on todo list page"]
          when:
            action: "create_todo"
            parameters:
              title: "string (required)"
              description: "string (optional)"
          then:
            - "Todo item is created"
            - "Todo appears in list"
            - "Todo has unique ID"
```

**Step 3: Add Verification**
```yaml
  verification:
    - type: "unit_test"
      generator: "spec-kit"
      framework: "pytest"
      coverage: "100%"
```

**Step 4: Generate Tests**
```bash
spec-kit generate-tests todo-list.openspec --framework pytest
```

**Step 5: Implement Feature**
- AI reads OpenSpec
- AI generates implementation
- Tests verify correctness

### Common Patterns

**CRUD Operations:**
```yaml
requirements:
  - id: "REQ-CREATE"
    scenarios:
      - given: [entity_does_not_exist]
        when: create_entity(data)
        then: [entity_exists, entity_has_correct_data]
  
  - id: "REQ-READ"
    scenarios:
      - given: [entity_exists]
        when: read_entity(id)
        then: [entity_data_is_returned]
  
  - id: "REQ-UPDATE"
    scenarios:
      - given: [entity_exists]
        when: update_entity(id, new_data)
        then: [entity_data_is_updated]
  
  - id: "REQ-DELETE"
    scenarios:
      - given: [entity_exists]
        when: delete_entity(id)
        then: [entity_does_not_exist]
```

**Error Handling:**
```yaml
scenarios:
  - id: "SC-ERROR-001"
    name: "Handle validation error"
    given: [user_is_on_form]
    when:
      action: "submit_form"
      parameters:
        field: "invalid_value"
    then:
      - "Validation error is displayed"
      - "Form is not submitted"
      - "User can correct and resubmit"
```

---

## 2.6 Key Takeaways

**Beyond Vibe Coding:**
- Vibe coding is ambiguous and unreliable
- Specification-first eliminates guesswork
- Machine-parsable formats enable automation

**Machine-Parsable PRDs:**
- Structured format (YAML/JSON)
- Given/When/Then acceptance criteria
- Algorithmic verification rules
- Single source of truth

**Algorithmic Verification:**
- Tests generated from specifications
- No AI involvement in test creation
- Deterministic correctness
- Property-based testing for complex behaviors

**OpenSpec and Spec-Kit:**
- Standard format for specifications
- Tooling for test generation
- Documentation generation
- Human-AI alignment before implementation

---

## Lab 2: Create Executable Specification with Verification

**Objective:** Create a complete OpenSpec specification and generate tests from it

**Requirements:**
1. Choose a feature (e.g., user registration, product search, order processing)
2. Create a complete OpenSpec file with:
   - Feature definition
   - At least 5 functional requirements
   - Given/When/Then scenarios for each requirement
   - Non-functional requirements with verification rules
   - Error handling scenarios
3. Use Spec-Kit (or similar tool) to generate tests
4. Implement the feature based on the specification
5. Run generated tests to verify implementation
6. Document any gaps between specification and implementation

**Deliverables:**
- OpenSpec file (complete specification)
- Generated test files
- Implementation code
- Test results
- Gap analysis document (300 words)

**Evaluation Criteria:**
- Specification completeness (30%)
- Correct Given/When/Then structure (25%)
- Successful test generation (20%)
- Implementation matches specification (15%)
- Quality of gap analysis (10%)

**Time Estimate:** 4-5 hours

---

## Additional Resources

**Readings:**
- "Specification-Driven Development" - Best practices guide
- "OpenSpec Documentation" - Official documentation
- "Algorithmic Verification Patterns" - Research paper

**Videos:**
- "From Vibe Coding to Specifications" (30 min)
- "OpenSpec and Spec-Kit Tutorial" (45 min)

**Tools:**
- [OpenSpec Documentation](https://openspec.dev/)
- Spec-Kit installation and usage
- Test generation frameworks

**Next Module Preview:**
Module 3 will teach you how to build knowledge fabrics and context engineering systems that prevent AI hallucinations and provide accurate, proprietary knowledge to agents.

---

**Module 2 Complete**   
**Next:** Module 3 - Context Engineering & The Knowledge Fabric
