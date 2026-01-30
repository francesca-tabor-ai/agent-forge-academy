---
title: "Capstone: Production Scheduling System Design"
description: "Design a complete production scheduling system for a real plant scenario"
module: "Capstone"
order: 10
problem: "Designing scheduling systems without considering all real-world factors"
capability: "End-to-End Scheduling System Design"
inspiration: "Systems engineering, production management, and AI system design"
---

# Capstone: Production Scheduling System Design

**Problem:** Designing scheduling systems without considering all real-world factors  
**Capability:** End-to-End Scheduling System Design  
**Inspiration:** Systems engineering, production management, and AI system design

---

## Project Overview

Design a production scheduling system for a plant with:
- **Tight capacity:** Operating near maximum capacity
- **High changeover costs:** Sequence-dependent setups are expensive
- **Frequent disruptions:** Machine breakdowns, material delays, labor issues
- **Human operators:** Experienced operators with local knowledge and preferences

---

## Project Requirements

### 1. Constraint Logic

**Define the constraint model:**

- **Hard constraints:**
  - Machine capacity
  - Material availability
  - Labor availability
  - Sequence dependencies
  - Due dates (hard deadlines)

- **Soft constraints:**
  - Operator preferences
  - Preferred sequences
  - Maintenance windows
  - Quality considerations

- **Constraint prioritization:**
  - Which constraints are most important?
  - How to handle conflicting constraints?
  - When to relax soft constraints?

**Deliverables:**
- Constraint model documentation
- Constraint hierarchy
- Constraint violation cost model
- Examples of constraint interactions

### 2. Scheduling Approach

**Design the scheduling algorithm:**

- **Tool selection:**
  - Heuristics, optimization, ML, or hybrid?
  - Why this approach?
  - When would you use alternatives?

- **Algorithm design:**
  - How does it work?
  - What are the key decisions?
  - How does it handle constraints?
  - How does it optimize objectives?

- **Objectives:**
  - What are you optimizing for?
  - How do you balance multiple objectives?
  - What are the trade-offs?

**Deliverables:**
- Algorithm design document
- Tool selection rationale
- Objective function definition
- Performance characteristics

### 3. Human Override Strategy

**Design the override system:**

- **Override mechanisms:**
  - When can operators override?
  - How do they override?
  - What information do they need?
  - How are overrides tracked?

- **Learning from overrides:**
  - How do you capture override reasons?
  - How do you analyze override patterns?
  - How do you improve the system?
  - How do you build trust?

- **Balance:**
  - How to balance automation with control?
  - How to prevent gaming?
  - How to maintain system integrity?

**Deliverables:**
- Override system design
- Override tracking mechanism
- Learning and improvement process
- Trust-building strategy

### 4. Disruption Handling

**Design the disruption response:**

- **Disruption detection:**
  - How do you detect disruptions?
  - What are early warning signs?
  - How do you assess impact?

- **Response strategy:**
  - When to reschedule vs. wait?
  - How to prioritize during disruptions?
  - How to communicate changes?
  - How to minimize chaos?

- **Recovery:**
  - How to return to normal?
  - How to prevent cascading failures?
  - How to learn from disruptions?

**Deliverables:**
- Disruption detection system
- Response decision framework
- Communication protocol
- Recovery process

### 5. Evaluation Framework

**Define success metrics:**

- **System metrics:**
  - Throughput
  - Schedule adherence
  - WIP levels
  - Changeover costs
  - Lateness

- **Human metrics:**
  - Operator satisfaction
  - Override frequency
  - Trust levels
  - Stress indicators

- **System health:**
  - Firefighting frequency
  - Disruption recovery time
  - System stability
  - Long-term sustainability

**Deliverables:**
- Metrics definition
- Measurement plan
- Evaluation criteria
- Success thresholds

---

## Project Deliverables

### 1. System Design Document

**Comprehensive design covering:**
- Problem statement and context
- Constraint model
- Scheduling approach
- Override strategy
- Disruption handling
- Evaluation framework
- Implementation plan

### 2. Prototype or Simulation

**Working demonstration:**
- Implement core scheduling logic
- Show constraint handling
- Demonstrate override mechanism
- Simulate disruption responses
- Visualize schedules

### 3. Presentation

**Present to stakeholders:**
- Explain the design
- Justify decisions
- Show prototype
- Address concerns
- Gather feedback

### 4. Reflection

**Lessons learned:**
- What worked well?
- What was challenging?
- What would you do differently?
- How does this apply to real systems?

---

## Evaluation Criteria

### Feasibility (25%)

- Are the constraints realistic?
- Is the approach implementable?
- Are the assumptions reasonable?
- Can it work in practice?

### Robustness (25%)

- Does it handle disruptions?
- Is it resilient to uncertainty?
- Can it recover from failures?
- Does it degrade gracefully?

### Respect for Human Behavior (25%)

- Does it account for operator needs?
- Is the override system usable?
- Does it build trust?
- Will operators adopt it?

### Decision Impact (25%)

- Does it improve throughput?
- Does it reduce chaos?
- Does it gain operator trust?
- Does it avoid over-automation?

---

## Project Timeline

**Week 1-2: Design**
- Define constraints
- Select approach
- Design override strategy
- Plan disruption handling

**Week 3-4: Implementation**
- Build prototype
- Implement core logic
- Create visualizations
- Test scenarios

**Week 5: Evaluation**
- Measure performance
- Gather feedback
- Refine design
- Prepare presentation

**Week 6: Presentation**
- Present to stakeholders
- Gather feedback
- Reflect on learnings
- Document lessons

---

## Reality Check

**Remember the course philosophy:**

> "Most AI schedulers fail because they ignore how factories actually run — and how people actually work."

**Your system should:**
- Respect physical constraints
- Account for human behavior
- Handle real disruptions
- Build operator trust
- Measure what matters

**Avoid:**
- Over-optimization
- Ignoring human factors
- Assuming perfect execution
- Measuring the wrong things
- Over-automation

---

## Success Criteria

**Your capstone is successful if:**
- The system is feasible and implementable
- It handles disruptions gracefully
- Operators would trust and use it
- It improves throughput without increasing stress
- It respects reality, not just models

---

**End of Capstone**
