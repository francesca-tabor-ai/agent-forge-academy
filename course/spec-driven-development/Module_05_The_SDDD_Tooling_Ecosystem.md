---
title: "Module 5: The SDDD Tooling Ecosystem"
description: "Explore AWS Kiro, GitHub Spec Kit, OpenSpec, and BMAD Method"
module: "5"
order: 5
---

# Module 5: The SDDD Tooling Ecosystem

**Duration:** Week 5  
**Learning Objectives:**
- Understand AWS Kiro and its three-phase workflow
- Learn GitHub Spec Kit for greenfield projects
- Master OpenSpec for brownfield maintenance
- Explore BMAD Method for enterprise orchestration

---

## 5.1 AWS Kiro: The IDE for Production Readiness

### Introduction

AWS Kiro is an IDE designed for "production readiness" using a three-phase workflow (Requirements, Design, Tasks). It provides a structured environment for SDDD, ensuring code meets production standards from the start.

### What is AWS Kiro?

**AWS Kiro is:**
- An integrated development environment
- Built for SDDD workflows
- Focused on production readiness
- Three-phase structured approach
- AI-powered development assistant

**AWS Kiro is NOT:**
- A general-purpose IDE
- A replacement for developers
- A code generator only
- A one-size-fits-all solution

### The Three-Phase Workflow

#### Phase 1: Requirements

**Purpose:** Capture and refine requirements

**Activities:**
- Write specifications
- Use clarification loops
- Define governing principles
- Establish success criteria

**Features:**
- Markdown specification editor
- AI-powered clarification questions
- Requirement validation
- Stakeholder collaboration

**Example Workflow:**
```
1. Create new project in Kiro
2. Write initial specification
3. Kiro AI analyzes and asks clarification questions
4. Answer questions, refine specification
5. Validate requirements completeness
6. Move to Design phase
```

#### Phase 2: Design

**Purpose:** Create technical architecture and plans

**Activities:**
- Design system architecture
- Define data models
- Create API contracts
- Plan integrations

**Features:**
- Architecture diagramming
- Data model designer
- API contract generator
- Integration planning tools

**Example Workflow:**
```
1. Review requirements from Phase 1
2. Design system architecture
3. Define data models
4. Create API contracts
5. Plan integrations
6. Document architecture decisions
7. Move to Tasks phase
```

#### Phase 3: Tasks

**Purpose:** Break down into actionable tasks

**Activities:**
- Decompose features into tasks
- Define acceptance criteria
- Set dependencies
- Assign priorities

**Features:**
- Task breakdown interface
- Dependency visualization
- Acceptance criteria templates
- Task tracking

**Example Workflow:**
```
1. Review design from Phase 2
2. Break down into tasks
3. Define acceptance criteria
4. Set dependencies
5. Order tasks
6. Generate implementation plan
```

### Key Features of AWS Kiro

#### 1. Specification Management

**Features:**
- Markdown editor with syntax highlighting
- Version control integration
- Specification templates
- Requirement validation
- Clarification loop automation

**Benefits:**
- Centralized specifications
- Version tracking
- Easy collaboration
- Automated validation

#### 2. AI-Powered Assistance

**Capabilities:**
- Clarification question generation
- Architecture suggestions
- Code generation
- Test generation
- Quality validation

**Benefits:**
- Faster development
- Better quality
- Consistency
- Reduced errors

#### 3. Production Readiness Checks

**Checks:**
- Specification compliance
- Code quality standards
- Test coverage requirements
- Performance benchmarks
- Security standards

**Benefits:**
- Early problem detection
- Consistent quality
- Production-ready code
- Reduced technical debt

#### 4. Integration with AWS Services

**Integrations:**
- AWS CodeCommit (version control)
- AWS CodeBuild (CI/CD)
- AWS CodeDeploy (deployment)
- AWS CloudWatch (monitoring)
- AWS Security Hub (security)

**Benefits:**
- Seamless AWS integration
- Automated deployments
- Monitoring and alerting
- Security compliance

### Getting Started with AWS Kiro

#### Setup

**Prerequisites:**
- AWS account
- IAM permissions
- Development environment

**Installation:**
```bash
# Install Kiro CLI
npm install -g @aws/kiro-cli

# Configure AWS credentials
kiro configure

# Initialize project
kiro init my-project
```

#### Creating a Project

**Steps:**
1. Create new project in Kiro
2. Select project template
3. Configure project settings
4. Start Requirements phase

**Example:**
```bash
# Create new project
kiro create project --name "user-authentication" --template "api-service"

# Navigate to project
cd user-authentication

# Start Requirements phase
kiro phase requirements
```

#### Working Through Phases

**Requirements Phase:**
```bash
# Create specification
kiro spec create --name "authentication"

# Get clarification questions
kiro clarify

# Validate requirements
kiro validate requirements
```

**Design Phase:**
```bash
# Start design phase
kiro phase design

# Create architecture
kiro architecture create

# Define data models
kiro models create

# Generate API contracts
kiro api generate
```

**Tasks Phase:**
```bash
# Start tasks phase
kiro phase tasks

# Break down into tasks
kiro tasks breakdown

# Review task list
kiro tasks list

# Generate implementation plan
kiro tasks plan
```

### Best Practices for AWS Kiro

#### 1. Complete Each Phase Thoroughly

**Don't rush:**
- Complete Requirements before Design
- Complete Design before Tasks
- Validate each phase
- Get stakeholder approval

#### 2. Use Clarification Loops

**Always:**
- Answer all clarification questions
- Update specifications
- Iterate until complete
- Document decisions

#### 3. Leverage AI Assistance

**Use AI for:**
- Clarification questions
- Architecture suggestions
- Code generation
- Quality validation

#### 4. Maintain Production Readiness

**Ensure:**
- All checks pass
- Quality standards met
- Tests comprehensive
- Documentation complete

---

## 5.2 GitHub Spec Kit: The Structured Architect

### Introduction

GitHub Spec Kit is the "structured architect" for new (greenfield) projects requiring strict enterprise governance. It provides templates, workflows, and tools for starting projects with SDDD from day one.

### What is GitHub Spec Kit?

**GitHub Spec Kit is:**
- A GitHub repository template
- Pre-configured SDDD workflows
- Enterprise governance tools
- Specification templates
- CI/CD pipelines

**GitHub Spec Kit is NOT:**
- A code generator
- A replacement for planning
- A one-time setup
- Only for small projects

### Key Features

#### 1. Repository Template

**Includes:**
- Directory structure
- Specification templates
- ADR templates
- Task breakdown templates
- Documentation structure

**Structure:**
```
project/
 specs/
    _TEMPLATE.md
    README.md
 architecture/
    ADR_TEMPLATE.md
    README.md
 tasks/
    TASK_TEMPLATE.md
    README.md
 docs/
    README.md
 .github/
    workflows/
       spec-validation.yml
       quality-checks.yml
    ISSUE_TEMPLATE/
        task.md
 README.md
```

#### 2. Specification Templates

**Templates for:**
- Feature specifications
- API specifications
- Data model specifications
- Integration specifications

**Example Template:**
```markdown
---
title: "Feature: [Feature Name]"
description: "[Brief description]"
version: "1.0"
status: "draft"
---

# Feature: [Feature Name]

## Business Context
[Why this feature exists]

## User Stories
[User stories]

## Requirements
### Functional Requirements
[Requirements]

### Non-Functional Requirements
[Requirements]

## API Contracts
[API contracts]

## Data Models
[Data models]

## Success Criteria
[Success criteria]
```

#### 3. GitHub Actions Workflows

**Workflows:**
- Specification validation
- Quality checks
- Test automation
- Deployment pipelines

**Example Workflow:**
```yaml
name: Specification Validation

on:
  pull_request:
    paths:
      - 'specs/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate Specifications
        run: |
          npm install -g spec-validator
          spec-validator validate specs/
```

#### 4. Issue Templates

**Templates for:**
- Feature requests
- Task creation
- Bug reports
- Architecture decisions

**Example Task Template:**
```markdown
## Task: [Task Name]

### Description
[Task description]

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

### Specification Reference
- [Spec file], Section [X.X]

### Dependencies
- [Task ID]

### Estimated Effort
[X] hours
```

### Getting Started with GitHub Spec Kit

#### Setup

**Steps:**
1. Use repository template
2. Clone repository
3. Configure project
4. Start specifications

**Example:**
```bash
# Use template to create repository
gh repo create my-project --template github/spec-kit

# Clone repository
git clone https://github.com/org/my-project.git
cd my-project

# Configure project
./scripts/setup.sh
```

#### Creating Specifications

**Process:**
1. Copy specification template
2. Fill in details
3. Use clarification loop
4. Validate specification
5. Commit to repository

**Example:**
```bash
# Create new specification
cp specs/_TEMPLATE.md specs/feature-authentication.md

# Edit specification
vim specs/feature-authentication.md

# Validate specification
npm run validate:specs

# Commit
git add specs/feature-authentication.md
git commit -m "Add authentication feature specification"
```

### Best Practices for GitHub Spec Kit

#### 1. Follow Template Structure

**Always:**
- Use provided templates
- Follow directory structure
- Maintain consistency
- Update templates as needed

#### 2. Leverage GitHub Features

**Use:**
- Issues for task tracking
- Pull requests for reviews
- Actions for automation
- Projects for planning

#### 3. Maintain Governance

**Ensure:**
- All specs are reviewed
- Quality standards met
- Compliance maintained
- Documentation updated

#### 4. Iterate and Improve

**Regularly:**
- Review templates
- Update workflows
- Improve processes
- Share learnings

---

## 5.3 OpenSpec: The Agile Renovator

### Introduction

OpenSpec is the "agile renovator" for maintaining and improving existing (brownfield) codebases with minimal overhead. It helps teams adopt SDDD incrementally without requiring a complete rewrite.

### What is OpenSpec?

**OpenSpec is:**
- A tool for brownfield projects
- Incremental SDDD adoption
- Specification retrofitting
- Legacy code documentation
- Refactoring guidance

**OpenSpec is NOT:**
- A code generator
- A replacement for refactoring
- A one-time migration
- Only for new code

### Key Features

#### 1. Code Analysis

**Capabilities:**
- Analyze existing codebase
- Extract business logic
- Identify patterns
- Document current state

**Example:**
```bash
# Analyze codebase
openspec analyze --path ./src

# Generate initial specifications
openspec generate-specs --output ./specs

# Document existing code
openspec document --path ./src
```

#### 2. Specification Retrofitting

**Process:**
1. Analyze existing code
2. Generate initial specifications
3. Refine specifications
4. Validate against code
5. Update as code changes

**Example:**
```bash
# Retrofit specifications for existing feature
openspec retrofit \
  --code-path ./src/features/auth \
  --spec-path ./specs/feature-authentication.md

# Validate retrofit
openspec validate --spec ./specs/feature-authentication.md
```

#### 3. Incremental Adoption

**Approach:**
- Start with new features
- Gradually retrofit existing
- Document as you go
- Improve incrementally

**Strategy:**
```
Phase 1: New features use SDDD
Phase 2: High-value features retrofitted
Phase 3: Critical paths retrofitted
Phase 4: Full codebase documented
```

#### 4. Refactoring Guidance

**Provides:**
- Refactoring suggestions
- Technical debt identification
- Improvement opportunities
- Migration paths

**Example:**
```bash
# Get refactoring suggestions
openspec refactor-suggestions \
  --code-path ./src/features/auth \
  --spec-path ./specs/feature-authentication.md

# Generate migration plan
openspec migration-plan \
  --from ./src/features/auth \
  --to ./specs/feature-authentication.md
```

### Getting Started with OpenSpec

#### Installation

```bash
# Install OpenSpec
npm install -g openspec

# Initialize in project
openspec init
```

#### Analyzing Existing Code

**Steps:**
1. Analyze codebase
2. Generate initial specs
3. Review and refine
4. Validate

**Example:**
```bash
# Analyze authentication feature
openspec analyze --path ./src/features/auth

# Generate specification
openspec generate-spec \
  --code-path ./src/features/auth \
  --output ./specs/feature-authentication.md

# Review generated spec
vim ./specs/feature-authentication.md

# Validate
openspec validate --spec ./specs/feature-authentication.md
```

### Best Practices for OpenSpec

#### 1. Start Incrementally

**Approach:**
- Begin with new features
- Retrofit high-value features
- Document critical paths
- Expand gradually

#### 2. Validate Continuously

**Ensure:**
- Specs match code
- Code matches specs
- Updates are synchronized
- Quality maintained

#### 3. Improve Over Time

**Strategy:**
- Document as you work
- Refactor incrementally
- Improve specifications
- Reduce technical debt

#### 4. Maintain Sync

**Keep:**
- Specs and code in sync
- Documentation updated
- Changes tracked
- History maintained

---

## 5.4 BMAD Method: Enterprise Orchestration

### Introduction

BMAD Method orchestrates a "Specialized AI Team" (Analyst, PM, Architect, Dev, QA) for massive enterprise-scale projects. It coordinates multiple AI agents working together to deliver complex systems.

### What is BMAD Method?

**BMAD Method is:**
- Enterprise orchestration framework
- Multi-agent coordination
- Role-based AI agents
- Large-scale project management
- Specialized team simulation

**BMAD Method is NOT:**
- A single tool
- For small projects
- A replacement for humans
- A one-size-fits-all solution

### The Specialized AI Team

#### Roles

**1. Business Analyst (BA)**
- Analyzes requirements
- Identifies stakeholders
- Documents business needs
- Validates requirements

**2. Product Manager (PM)**
- Prioritizes features
- Manages roadmap
- Coordinates stakeholders
- Makes product decisions

**3. Architect**
- Designs system architecture
- Makes technical decisions
- Plans integrations
- Ensures scalability

**4. Developer (Dev)**
- Implements features
- Writes code
- Follows specifications
- Ensures quality

**5. QA Engineer**
- Writes tests
- Validates quality
- Performs testing
- Ensures compliance

### BMAD Workflow

#### Phase 1: Analysis

**Business Analyst:**
- Analyzes requirements
- Identifies stakeholders
- Documents business needs
- Creates initial specifications

**Output:**
- Business requirements document
- Stakeholder analysis
- Initial specifications

#### Phase 2: Planning

**Product Manager:**
- Prioritizes features
- Creates roadmap
- Coordinates with stakeholders
- Makes product decisions

**Architect:**
- Designs architecture
- Makes technical decisions
- Plans integrations
- Creates technical plan

**Output:**
- Product roadmap
- Technical architecture
- Integration plan

#### Phase 3: Implementation

**Developer:**
- Implements features
- Writes code
- Follows specifications
- Ensures quality

**QA Engineer:**
- Writes tests
- Validates quality
- Performs testing
- Ensures compliance

**Output:**
- Implemented features
- Test suite
- Quality reports

#### Phase 4: Validation

**All Roles:**
- Review implementation
- Validate requirements
- Ensure quality
- Approve for deployment

**Output:**
- Validation reports
- Approval for deployment
- Documentation

### BMAD Orchestration

#### Coordination

**Tools:**
- Centralized task management
- Role-based assignments
- Communication protocols
- Progress tracking

**Example:**
```yaml
# BMAD Configuration
roles:
  analyst:
    agent: "claude-analyst"
    responsibilities:
      - Requirements analysis
      - Stakeholder identification
      - Specification creation
  
  pm:
    agent: "claude-pm"
    responsibilities:
      - Feature prioritization
      - Roadmap management
      - Stakeholder coordination
  
  architect:
    agent: "claude-architect"
    responsibilities:
      - Architecture design
      - Technical decisions
      - Integration planning
  
  developer:
    agent: "claude-developer"
    responsibilities:
      - Code implementation
      - Feature development
      - Quality assurance
  
  qa:
    agent: "claude-qa"
    responsibilities:
      - Test creation
      - Quality validation
      - Compliance checking
```

#### Communication

**Protocols:**
- Role-based communication
- Decision escalation
- Status updates
- Issue resolution

**Example:**
```
Analyst → PM: Requirements document ready for review
PM → Architect: Feature prioritized, needs architecture
Architect → Developer: Architecture approved, ready for implementation
Developer → QA: Feature implemented, ready for testing
QA → PM: Tests passing, ready for deployment
```

### Getting Started with BMAD

#### Setup

**Steps:**
1. Define project scope
2. Configure roles
3. Set up agents
4. Initialize workflow

**Example:**
```bash
# Initialize BMAD project
bmad init --project "enterprise-system"

# Configure roles
bmad configure roles

# Set up agents
bmad setup agents

# Start workflow
bmad start
```

### Best Practices for BMAD

#### 1. Define Clear Roles

**Ensure:**
- Roles are well-defined
- Responsibilities are clear
- Boundaries are established
- Communication is structured

#### 2. Coordinate Effectively

**Maintain:**
- Regular communication
- Status updates
- Decision tracking
- Progress visibility

#### 3. Validate Continuously

**Ensure:**
- Requirements are met
- Quality is maintained
- Standards are followed
- Compliance is ensured

#### 4. Scale Appropriately

**Consider:**
- Project size
- Team complexity
- Coordination overhead
- Tool capabilities

---

## Lab 5: Set Up and Use One SDDD Tool for a Project

### Objective

Set up and use one SDDD tool (AWS Kiro, GitHub Spec Kit, OpenSpec, or BMAD) for a project, demonstrating tool capabilities and SDDD workflow.

### Tasks

1. **Tool Selection (30 min)**
   - Choose a tool based on project needs
   - Review tool documentation
   - Understand tool capabilities
   - Plan implementation

2. **Tool Setup (1 hour)**
   - Install and configure tool
   - Set up project structure
   - Configure workflows
   - Test basic functionality

3. **Project Implementation (3 hours)**
   - Create specifications using tool
   - Use tool features (clarification, planning, etc.)
   - Implement feature with tool
   - Validate tool output

4. **Documentation (1 hour)**
   - Document tool usage
   - Record learnings
   - Create usage guide
   - Prepare presentation

5. **Review and Refine (30 min)**
   - Review tool effectiveness
   - Identify improvements
   - Document best practices
   - Prepare presentation

### Deliverables

- Tool setup and configuration
- Project implementation using tool
- Tool usage documentation
- Best practices guide
- Presentation (15 slides)

### Evaluation Criteria

- **Tool Setup (25%):** Correct installation and configuration
- **Tool Usage (30%):** Effective use of tool features
- **Project Implementation (25%):** Quality of implementation
- **Documentation (20%):** Completeness and clarity

---

## Key Takeaways

1. **AWS Kiro:** Three-phase workflow (Requirements, Design, Tasks) for production readiness
2. **GitHub Spec Kit:** Structured templates and workflows for greenfield projects
3. **OpenSpec:** Incremental SDDD adoption for brownfield codebases
4. **BMAD Method:** Enterprise orchestration with specialized AI team roles
5. **Tool Selection:** Choose tools based on project needs and context

---

## Additional Resources

### Reading
- "AWS Kiro Documentation" (Official Docs)
- "GitHub Spec Kit Guide" (GitHub)
- "OpenSpec User Manual" (Documentation)
- "BMAD Method Guide" (Documentation)

### Tools
- AWS Kiro (IDE)
- GitHub Spec Kit (Template)
- OpenSpec (CLI)
- BMAD Framework (Orchestration)

### Next Steps
- Complete Lab 5
- Review Module 6: Enterprise Economics & Strategy
- Explore additional SDDD tools
- Integrate tools into your workflow

---

**Module 5 Complete. Ready for Module 6? →**
