---
title: "Module 2: Decomposing Legal Work into Machine-Executable Tasks"
description: "Translating legal workflows into system components with proper boundaries and escalation points"
module: "2"
order: 2
---

# Module 2: Decomposing Legal Work into Machine-Executable Tasks

**Duration:** Week 2  
**Learning Objectives:**
- **Translate Legal**: Translate legal workflows into system components
- **between deterministic Analysis**: Distinguish between deterministic and probabilistic legal tasks
- **task boundaries, escalation points, and human review checkpoints Development**: Design task boundaries, escalation points, and human review checkpoints
- **systems for defensibility, not perfection Development**: Design systems for defensibility, not perfection
- **machine-executable task specifications Development**: Create machine-executable task specifications

---

## 2.1 Translating Legal Workflows into System Components

### The Decomposition Process

Legal work is complex and multi-faceted. To automate it effectively, we must break it down into discrete, machine-executable tasks.

**Step 1: Map the Current Workflow**
- Document each step in the current process
- Identify inputs and outputs
- Note decision points
- Identify dependencies

**Step 2: Identify Automation Opportunities**
- Find repetitive, rule-based tasks
- Identify information retrieval needs
- Spot pattern recognition opportunities
- Find drafting and templating needs

**Step 3: Design System Components**
- Create discrete services for each task
- Define interfaces between components
- Specify data flows
- Design error handling

### Example: Contract Review Workflow

**Current Manual Process:**
1. Receive contract
2. Read through contract
3. Identify key clauses
4. Check against standard terms
5. Flag problematic provisions
6. Research relevant law
7. Draft review memo
8. Present findings to client

**Decomposed System Components:**

**Component 1: Document Ingestion**
- Input: Contract file
- Process: Parse and extract text
- Output: Structured document data

**Component 2: Clause Identification**
- Input: Document text
- Process: Identify and classify clauses
- Output: List of clauses with types

**Component 3: Standard Terms Comparison**
- Input: Identified clauses, standard terms database
- Process: Compare against standards
- Output: Deviations and flags

**Component 4: Risk Assessment**
- Input: Flagged provisions, risk rules
- Process: Assess risk level
- Output: Risk scores and recommendations

**Component 5: Research Assistant**
- Input: Legal questions, jurisdiction
- Process: Retrieve relevant cases/statutes
- Output: Research results with citations

**Component 6: Memo Generation**
- Input: Review findings, research results
- Process: Generate structured memo
- Output: Draft review memo

**Component 7: Human Review**
- Input: Draft memo, contract
- Process: Lawyer reviews and edits
- Output: Final memo

---

## 2.2 Deterministic vs. Probabilistic Legal Tasks

### Understanding the Distinction

**Deterministic Tasks:**
- Have clear, rule-based logic
- Produce consistent outputs for same inputs
- Can be fully automated with high confidence
- Examples: Date calculations, formatting, data extraction

**Probabilistic Tasks:**
- Involve interpretation and judgment
- May produce different outputs for same inputs
- Require human oversight or confidence thresholds
- Examples: Risk assessment, clause interpretation, strategy recommendations

### Classifying Legal Tasks

**Deterministic Examples:**
- Extracting dates from documents
- Calculating deadlines based on rules
- Formatting documents according to templates
- Checking for required clauses (presence/absence)
- Validating citation formats
- Converting document formats

**Probabilistic Examples:**
- Interpreting ambiguous contract language
- Assessing risk of specific provisions
- Recommending negotiation strategies
- Determining relevance of cases
- Evaluating strength of legal arguments
- Predicting case outcomes

### Designing for Each Type

**Deterministic Task Design:**
- Use rule-based systems
- Implement clear logic
- Test with edge cases
- Ensure consistency
- Can be fully automated

**Probabilistic Task Design:**
- Use AI/LLM systems
- Include confidence scores
- Design human review checkpoints
- Provide explanations
- Allow for uncertainty

---

## 2.3 Task Boundaries, Escalation Points, and Human Review

### Defining Task Boundaries

Task boundaries define:
- **What** the task does
- **What** it doesn't do
- **When** it succeeds
- **When** it fails
- **What** it needs as input
- **What** it produces as output

### Example: Clause Classification Task

**Task Boundary Definition:**

**Scope:**
- Classifies contract clauses into predefined categories
- Works with standard contract types
- Handles common clause variations

**Limitations:**
- Does not interpret clause meaning
- Does not assess risk
- Does not handle novel clause structures
- Requires clear clause boundaries

**Input Requirements:**
- Well-formatted contract text
- Identified clause boundaries
- Supported contract type

**Output Guarantees:**
- Classification with confidence score
- "Unknown" classification for unrecognized clauses
- Error message if input invalid

### Designing Escalation Points

Escalation points are decision moments where:
- The system cannot proceed automatically
- Confidence is below threshold
- Edge case encountered
- Human judgment required

**Types of Escalation:**

**1. Low Confidence Escalation**
- System confidence below threshold (e.g., < 80%)
- Escalate to human for review
- Provide system's best guess with explanation

**2. Error Escalation**
- System encounters error it cannot handle
- Escalate with error details
- Provide context for human to resolve

**3. Edge Case Escalation**
- Input doesn't match expected patterns
- Escalate with details
- Allow human to handle or train system

**4. Risk-Based Escalation**
- High-risk decision detected
- Escalate regardless of confidence
- Require human approval

### Human Review Checkpoints

Design review checkpoints at:
- **High-stakes decisions:** Final approvals, client communications
- **Low-confidence outputs:** Uncertain classifications, ambiguous interpretations
- **Risk thresholds:** High-risk assessments, significant deviations
- **Quality gates:** Before final delivery, at key milestones

**Review Workflow Design:**

```
System Output → Confidence Check → Review Decision
                                    ↓
                        [High Confidence] → Auto-approve
                        [Low Confidence] → Human Review
                        [High Risk] → Mandatory Review
```

---

## 2.4 Designing for Defensibility, Not Perfection

### The Defensibility Principle

Legal AI systems don't need to be perfect—they need to be **defensible**. This means:
- Decisions can be explained
- Process is documented
- Human oversight is maintained
- Errors are caught and corrected
- Professional standards are upheld

### Defensibility vs. Perfection

**Perfection Focus:**
- 100% accuracy goal
- No errors allowed
- Fully automated
- No human review

**Defensibility Focus:**
- Transparent process
- Explainable decisions
- Human oversight where needed
- Error detection and correction
- Professional responsibility maintained

### Building Defensibility Into Systems

**1. Audit Trails**
- Log all decisions
- Record inputs and outputs
- Track human reviews
- Maintain version history

**2. Explainability**
- Provide reasoning for decisions
- Show confidence levels
- Explain uncertainty
- Document assumptions

**3. Human Oversight**
- Design review checkpoints
- Require approval for high-stakes decisions
- Allow human override
- Maintain professional control

**4. Error Handling**
- Detect errors early
- Escalate appropriately
- Provide recovery paths
- Learn from mistakes

**5. Documentation**
- Document system design
- Record decision criteria
- Maintain change logs
- Explain limitations

### Example: Defensible Contract Review System

**Design Principles:**
- System flags issues but doesn't make final decisions
- All flags include explanations and confidence scores
- High-risk flags require mandatory review
- Lawyer reviews all system outputs before delivery
- All reviews are logged and documented

**Defensibility Features:**
- Audit trail of all system actions
- Explanations for each flag
- Confidence scores for transparency
- Human review records
- Version control for system updates

---

## Lab 2: Decompose a Complex Legal Task into Machine-Executable Components

### Objective

Take a complex legal task and decompose it into machine-executable components with proper boundaries, escalation points, and review checkpoints.

### Instructions

1. **Select a Complex Legal Task**
   - Choose a task with multiple steps and decision points
   - Examples: M&A due diligence, litigation strategy, regulatory compliance review

2. **Map the Current Process**
   - Document each step in detail
   - Identify inputs, outputs, and dependencies
   - Note decision points and judgment calls

3. **Decompose into Components**
   - Break down into discrete, machine-executable tasks
   - Classify each as deterministic or probabilistic
   - Define clear boundaries for each component

4. **Design System Architecture**
   - Create component diagram
   - Define interfaces between components
   - Specify data flows
   - Design error handling

5. **Design Escalation and Review**
   - Identify escalation points
   - Design review checkpoints
   - Specify confidence thresholds
   - Create review workflows

6. **Design for Defensibility**
   - Plan audit trails
   - Design explainability features
   - Ensure human oversight
   - Document error handling

### Deliverables

- Process map of current workflow
- Component decomposition document
- System architecture diagram
- Escalation and review design
- Defensibility plan
- Design document (10-15 pages)

### Evaluation Criteria

- **Decomposition Quality (30%):** Appropriate breakdown into components
- **Boundary Definition (20%):** Clear task boundaries
- **Escalation Design (20%):** Well-designed escalation and review points
- **Defensibility (20%):** Comprehensive defensibility features
- **Architecture (10%):** Sound system architecture

---

## Key Takeaways

- **Legal workflows must be decomposed into discrete, machine-executable tasks**: With clear boundaries and interfaces

- **Distinguish between deterministic and probabilistic tasks**: Design each type appropriately

- **Design escalation points and human review checkpoints**: At appropriate moments in the workflow

- **Design for defensibility, not perfection**: Focus on transparency, explainability, and human oversight

- **Task decomposition is the foundation**: For building effective legal AI systems

---

## Additional Resources

### Reading
- "Workflow Management Systems" by Wil van der Aalst
- "Task Decomposition in AI Systems" research papers
- Legal process mapping guides

### Tools
- Process mapping tools (Lucidchart, Miro)
- System design tools
- Workflow automation platforms

---

## Next Steps

- **Complete Lab**: Apply complete lab 2 in relevant contexts
- **Review Module**: Review Module 3: How Large Language Models Actually Work (for Lawyers)
- **Join Course**: Join course discussion forum
- **Attend Office**: Attend office hours if you have questions

---

**Module 2 Complete. Ready for Module 3? → [Module 3: How LLMs Work](Module_03_How_Large_Language_Models_Actually_Work_for_Lawyers.md)**
