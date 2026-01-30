---
title: "Module 2: Human-in-the-Loop System Design"
description: "Design collaboration, not replacement — map decision authority and escalation paths"
module: "2"
order: 2
problem: "AI systems replace human judgment instead of augmenting it"
capability: "Human-AI Collaboration Design"
inspiration: "Control room design and human factors engineering"
---

# Module 2: Human-in-the-Loop System Design

**Problem:** AI systems replace human judgment instead of augmenting it  
**Capability:** Human-AI Collaboration Design  
**Inspiration:** Control room design and human factors engineering

---

## Mindset Shift

> "Design for partnership, not automation."

---

## Learning Objectives

### Decision Authority Boundaries

- When AI should recommend vs. when AI should decide
- Mapping decision ownership to risk and impact
- The difference between advisory and autonomous systems
- How to set clear boundaries that operators trust
- Escalation triggers and handoff points

### Human-as-Check vs Human-as-Partner

- **Human-as-check:** AI decides, human approves
  - When this works: low-risk, high-volume decisions
  - When this fails: operators become rubber stamps
  - Trust implications: operators feel bypassed

- **Human-as-partner:** AI and human collaborate
  - When this works: complex, context-dependent decisions
  - Design patterns: shared information, joint reasoning
  - Trust implications: operators feel empowered

- Choosing the right pattern for each decision type
- The cost of getting the pattern wrong

### Escalation Paths

- When to escalate from AI to human
- How to design smooth handoffs
- What information humans need at escalation points
- Avoiding escalation fatigue
- Making escalation feel like support, not failure

### When Automation Destroys Trust

- Over-automation: removing human judgment from critical decisions
- Under-automation: asking humans to do what AI should handle
- The trust cost of wrong automation boundaries
- How to test automation boundaries safely
- Recovering from automation mistakes

---

## Design Lab

### Map Decision Ownership for a Live System

**Objective:** Design human-AI collaboration for a real operational system

**Scenario Selection:**
- Choose a real AI system (or design one)
- Identify all decision points in the workflow
- Map current (or proposed) automation level

**Decision Mapping Framework:**

1. **Decision Inventory**
   - List every decision the system makes or influences
   - Document current decision owner (AI, human, or both)
   - Note decision frequency and impact

2. **Risk and Impact Analysis**
   - For each decision: cost of being wrong
   - For each decision: reversibility
   - For each decision: context dependency
   - For each decision: operator expertise level

3. **Authority Boundary Design**
   - **AI decides:** Low risk, high volume, clear rules
   - **AI recommends, human approves:** Medium risk, moderate volume
   - **Human decides, AI informs:** High risk, low volume, high context
   - **Collaborative:** Complex, ambiguous, requires judgment

4. **Escalation Design**
   - When does AI escalate to human?
   - What triggers escalation? (confidence, risk, anomaly)
   - What information does human need?
   - How is context preserved in handoff?

5. **Trust Check**
   - Do operators feel in control?
   - Are boundaries clear and respected?
   - Can operators override when needed?
   - Does escalation feel supportive?

**Deliverables:**
- Decision ownership matrix
- Escalation trigger design
- Handoff information requirements
- Trust validation checklist
- Redesign recommendations

---

## Behaviour Installed

### Success Indicators

- **Boundary clarity**
  - Operators know when AI decides vs. when they decide
  - Escalation paths are clear and trusted

- **Partnership mindset**
  - Design for collaboration, not replacement
  - Operators feel augmented, not bypassed

- **Trust through control**
  - Operators have override capability
  - Automation respects human judgment

---

## Key Concepts

### Decision Authority Framework

- **Autonomous:** AI decides, no human check
- **Approval:** AI decides, human approves
- **Advisory:** AI recommends, human decides
- **Collaborative:** AI and human reason together
- **Informational:** AI provides context, human decides

### Escalation Design Principles

- Escalate on uncertainty, not just errors
- Preserve context in handoffs
- Make escalation feel like support
- Avoid escalation fatigue
- Learn from escalation patterns

### Trust Through Boundaries

- Clear boundaries build trust
- Respecting boundaries maintains trust
- Wrong boundaries destroy trust
- Boundaries should match risk and expertise

---

## Tools and Techniques

- Decision authority mapping frameworks
- Escalation trigger design patterns
- Human-AI collaboration patterns
- Trust boundary testing methods
- Handoff information design

---

**End of Module 2**
