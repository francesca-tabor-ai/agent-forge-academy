---
title: "Capstone Project: Redesign an AI Feature That Suffers from Low Adoption"
description: "Apply all course concepts to redesign an AI system for operator trust and adoption"
module: "Capstone"
order: 9
problem: "AI systems with good accuracy fail to gain operator trust and adoption"
capability: "Trust-Centered AI Design"
inspiration: "Real-world AI adoption challenges in operations"
---

# Capstone Project: Redesign an AI Feature That Suffers from Low Adoption

**Problem:** AI systems with good accuracy fail to gain operator trust and adoption  
**Capability:** Trust-Centered AI Design  
**Inspiration:** Real-world AI adoption challenges in operations

---

## Project Overview

You will select an existing AI feature (or system) that suffers from low adoption despite good technical performance, and redesign it using all concepts from the course:

- Understanding adoption blockers (Module 1)
- Designing human-in-the-loop collaboration (Module 2)
- Capturing and learning from overrides (Module 3)
- Building effective feedback loops (Module 4)
- Creating operational explanations (Module 5)
- Preventing alert fatigue and trust decay (Module 6)
- Measuring trust and adoption (Module 7)
- Designing rollout and graceful degradation (Module 8)

**Your goal:** Design an AI system that operators actually use, trust, and improve over time.

---

## Project Selection

### Option 1: Your Own System
- Select an AI system you've built or worked on
- Document current adoption issues
- Redesign using course concepts

### Option 2: Case Study System
- Select a publicly documented AI system with adoption challenges
- Research adoption blockers
- Redesign based on available information

### Option 3: Hypothetical System
- Design a realistic operational AI system
- Simulate adoption challenges
- Redesign from scratch

**Requirements:**
- System must be operational (not just research)
- Must have clear adoption/trust issues
- Must be redesignable using course concepts
- Must have measurable outcomes

---

## Project Tasks

### Task 1: Adoption Blocker Analysis

**Objective:** Understand why the current system isn't adopted

**Deliverables:**

1. **Current State Assessment**
   - Technical performance: accuracy, latency, reliability
   - Adoption metrics: usage rate, override rate, follow-through
   - Operator feedback: interviews, surveys, complaints
   - Workarounds: how operators avoid using system

2. **Adoption Blocker Identification**
   - Demo success vs. production failure gaps
   - Mismatch between model outputs and operator decisions
   - Organizational incentive misalignment
   - Trust breakdown events
   - Workflow integration failures

3. **Root Cause Analysis**
   - Why each blocker exists
   - What signals were missed
   - What design decisions caused problems
   - What organizational factors contributed

4. **Trust Timeline**
   - When was trust built (if ever)?
   - When was trust lost?
   - What events caused trust breakdown?
   - How did operators respond?

**Output:** Comprehensive adoption blocker analysis with root causes

---

### Task 2: Human-in-the-Loop Architecture

**Objective:** Design human-AI collaboration that builds trust

**Deliverables:**

1. **Decision Authority Mapping**
   - Inventory all decision points
   - Map current decision ownership
   - Analyze risk and impact for each decision
   - Design appropriate authority boundaries

2. **Collaboration Pattern Design**
   - Choose human-as-check vs. human-as-partner for each decision
   - Design escalation paths
   - Define handoff information requirements
   - Test boundaries for trust

3. **Override Design**
   - When can operators override?
   - How is override captured?
   - What information is needed?
   - How does override feel to operators?

4. **Trust Boundary Validation**
   - Do operators feel in control?
   - Are boundaries clear?
   - Does escalation feel supportive?
   - Will operators trust this design?

**Output:** Human-in-the-loop architecture with decision authority map

---

### Task 3: Override & Feedback Design

**Objective:** Design systems that learn from operator behavior

**Deliverables:**

1. **Override Taxonomy**
   - Classify override types: error, context, risk, trust, etc.
   - Design override capture UI/UX
   - Map overrides to learning opportunities
   - Design low-friction capture

2. **Feedback Loop Design**
   - Explicit feedback: what to ask, when, how
   - Implicit feedback: what behavior signals to capture
   - Feedback latency: real-time, near-term, long-term
   - Loop closure: how feedback improves system

3. **Gaming Prevention**
   - How could operators game feedback?
   - How to detect gaming?
   - How to make gaming unprofitable?
   - How to validate feedback quality?

4. **Learning Mechanism**
   - How overrides improve model
   - How feedback drives updates
   - How to show operators their input matters
   - How to measure loop closure

**Output:** Override taxonomy and feedback loop design with learning mechanisms

---

### Task 4: Trust Metrics & Evaluation

**Objective:** Design metrics that measure trust and adoption

**Deliverables:**

1. **Trust Metrics Design**
   - Override rate and patterns
   - Recommendation follow-through
   - Time-to-decision
   - Operator engagement signals
   - Trust leading indicators

2. **Adoption Metrics Design**
   - Active usage: who, how often, which features
   - Retention: do operators keep using?
   - Expansion: do operators use more features?
   - Value realization: do operators achieve outcomes?

3. **Warning Signal Design**
   - What indicates trust erosion?
   - What indicates adoption risk?
   - Early warning indicators
   - Critical failure signals

4. **Dashboard Design**
   - What metrics to show
   - How to visualize trends
   - How to prioritize information
   - How to make actionable

5. **Success Criteria**
   - What indicates successful redesign?
   - How to measure improvement?
   - What are target metrics?
   - How to validate trust building?

**Output:** Trust and adoption metrics dashboard with success criteria

---

### Task 5: Redesign Documentation

**Objective:** Document complete redesign with rationale

**Deliverables:**

1. **Redesign Summary**
   - Key changes from current system
   - Rationale for each change
   - Expected impact on trust and adoption
   - Implementation priorities

2. **Architecture Documentation**
   - Human-in-the-loop design
   - Override and feedback systems
   - Trust metrics and monitoring
   - Rollout strategy

3. **UI/UX Design**
   - Key interface changes
   - Explanation design
   - Alert design
   - Override capture design
   - Feedback capture design

4. **Implementation Plan**
   - Progressive rollout strategy
   - Shadow mode testing plan
   - Kill switch design
   - Graceful degradation design
   - Trust building during rollout

5. **Evaluation Plan**
   - How to measure success
   - What metrics to track
   - How to validate trust building
   - When to expand vs. when to pause

**Output:** Complete redesign documentation with implementation and evaluation plans

---

## Evaluation Criteria

### Operator Empathy (30%)

- **Understanding:** Deep understanding of operator needs, constraints, and incentives
- **Trust Awareness:** Recognition of trust dynamics and how they affect adoption
- **Workflow Integration:** Understanding of how AI fits into operator workflows
- **Risk Perception:** Awareness of how operators perceive risk and uncertainty

**Key Questions:**
- Do you understand why operators don't trust the current system?
- Do you understand what operators need to trust AI?
- Have you designed for operator reality, not ideal conditions?

### Practical Design (30%)

- **Feasibility:** Design is implementable with real constraints
- **Completeness:** All aspects of trust and adoption addressed
- **Integration:** Design fits into existing workflows and systems
- **Actionability:** Clear implementation steps and priorities

**Key Questions:**
- Can this design actually be built?
- Does it address all adoption blockers?
- Will it work in real operational conditions?
- Are implementation steps clear?

### Risk Awareness (25%)

- **Failure Modes:** Recognition of how design could fail
- **Trust Risks:** Understanding of trust breakdown scenarios
- **Mitigation:** Design includes safeguards and recovery
- **Graceful Degradation:** System degrades gracefully when problems occur

**Key Questions:**
- What could go wrong with this design?
- How would you detect trust issues early?
- How would system recover from failures?
- What safeguards are in place?

### Clarity of Trade-offs (15%)

- **Trade-off Recognition:** Clear understanding of design trade-offs
- **Rationale:** Well-reasoned choices with clear justification
- **Communication:** Clear explanation of decisions and trade-offs
- **Documentation:** Complete and understandable documentation

**Key Questions:**
- Have you made clear trade-offs?
- Can you justify your design choices?
- Is your documentation clear and complete?

---

## Project Deliverables

### 1. Adoption Blocker Analysis Report
- Current state assessment
- Adoption blocker identification
- Root cause analysis
- Trust timeline

### 2. Human-in-the-Loop Architecture
- Decision authority mapping
- Collaboration pattern design
- Override design
- Trust boundary validation

### 3. Override & Feedback Design
- Override taxonomy
- Feedback loop design
- Gaming prevention
- Learning mechanisms

### 4. Trust Metrics & Evaluation Plan
- Trust metrics design
- Adoption metrics design
- Warning signal design
- Dashboard design
- Success criteria

### 5. Complete Redesign Documentation
- Redesign summary
- Architecture documentation
- UI/UX design
- Implementation plan
- Evaluation plan

### 6. Executive Summary
- Key findings from analysis
- Major redesign changes
- Expected impact
- Implementation priorities
- Success metrics

---

## Project Philosophy

> "If operators don't use it, it doesn't matter how accurate it is."

This project embodies the core philosophy of the course:
- Trust and adoption matter more than accuracy
- Operators are partners, not users
- Overrides are signals, not failures
- Feedback loops close the gap between model and reality
- Explainability serves operators, not data scientists
- Alert fatigue destroys trust
- Metrics must measure trust, not just usage
- Rollout must build trust gradually

---

## Success Indicators

Upon completion, you should be able to:

- **Diagnose adoption blockers**
  - Identify why AI systems aren't adopted
  - Understand trust dynamics
  - Recognize organizational barriers

- **Design human-AI collaboration**
  - Map decision authority appropriately
  - Design escalation paths
  - Create trust-building boundaries

- **Build learning systems**
  - Design override capture
  - Create feedback loops
  - Close the loop from usage to improvement

- **Measure trust and adoption**
  - Design trust metrics
  - Track adoption signals
  - Identify early warning indicators

- **Ship AI as a product**
  - Design progressive rollout
  - Plan graceful degradation
  - Build trust during deployment

---

## Tools and Techniques

You may use any tools and techniques from the course:
- Adoption blocker analysis frameworks
- Decision authority mapping
- Override taxonomy design
- Feedback loop design
- Explanation translation methods
- Alert threshold design
- Trust metric frameworks
- Progressive rollout strategies

---

## Timeline

**Recommended Schedule:**
- Week 1: Adoption blocker analysis
- Week 2: Human-in-the-loop architecture and override design
- Week 3: Feedback loops and trust metrics
- Week 4: Complete redesign documentation and evaluation

**Total Duration:** 4 weeks (aligns with course structure)

---

## Getting Started

1. **Review Course Materials**
   - Revisit all 8 modules
   - Understand key concepts
   - Review examples and case studies

2. **Select Your System**
   - Choose system with adoption challenges
   - Gather current state information
   - Document adoption blockers

3. **Plan Your Approach**
   - Break down into tasks
   - Identify tools and techniques
   - Create timeline

4. **Begin Analysis**
   - Start with adoption blocker analysis
   - Work through each task methodically
   - Document everything

---

**End of Capstone Project**
