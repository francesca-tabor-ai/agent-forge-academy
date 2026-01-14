---
title: "Module 2: Clinical Workflows as System Constraints"
description: "Engineer systems that respect how hospitals actually operate"
module: "2"
order: 2
email_takeaway: "Clinical workflows have interruptions, handovers, and urgency that must be designed into AI systems, not worked around."
email_action: "Observe or map one clinical workflow (even from documentation) and identify 3 system constraints it imposes."
---

# Module 2: Clinical Workflows as System Constraints

**Duration:** Week 2-3  
**Learning Objectives:**
- Understand how clinical workflows actually operate in real hospital environments
- Identify time-critical vs deferrable tasks
- Design human-in-the-loop as an engineering primitive
- Recognize where automation is unsafe by design
- Translate clinical workflows into system constraints

---

## 2.1 How Clinical Workflows Really Work

### The Reality of Hospital Operations

Clinical workflows are not linear, predictable processes. They are:
- **Interruptible:** Urgent situations can interrupt any workflow
- **Collaborative:** Multiple people hand off tasks
- **Time-sensitive:** Some tasks are critical, others can wait
- **Context-dependent:** Same task, different urgency based on patient state
- **Error-prone:** High cognitive load leads to mistakes

### Common Clinical Workflow Patterns

**1. Medication Administration Workflow**

```
Order Received → Verification → Preparation → Administration → Documentation
     ↓              ↓              ↓              ↓                ↓
  [Urgent?]    [Allergies?]   [Dose OK?]   [Patient ID?]   [Chart Update]
     ↓              ↓              ↓              ↓                ↓
  [Priority]   [Override?]   [Double-check] [Confirm]      [Audit Trail]
```

**System Constraints:**
- Must support urgent interruptions (STAT orders)
- Must verify allergies before preparation
- Must confirm patient identity before administration
- Must document immediately after administration
- Must support override with documentation
- Must maintain complete audit trail

**2. Patient Handoff Workflow**

```
Shift Change → Information Transfer → Responsibility Transfer → Continuity Check
     ↓                  ↓                      ↓                      ↓
  [SBAR]          [Critical Info]         [Active Issues]      [Follow-ups]
     ↓                  ↓                      ↓                      ↓
  [Verification]   [Prioritization]       [Assignment]          [Documentation]
```

**System Constraints:**
- Must support structured handoff (SBAR format)
- Must highlight critical information
- Must track active issues across shifts
- Must enable follow-up assignment
- Must maintain continuity of care
- Must support asynchronous communication

**3. Diagnostic Workflow**

```
Order → Scheduling → Preparation → Procedure → Interpretation → Reporting → Action
  ↓         ↓            ↓            ↓             ↓              ↓          ↓
[Urgent] [Capacity]  [Prep Req]   [Protocol]   [AI Assist]    [Review]   [Treatment]
```

**System Constraints:**
- Must prioritize urgent cases
- Must respect scheduling constraints
- Must ensure proper preparation
- Must follow clinical protocols
- Must support AI-assisted interpretation with human review
- Must enable rapid reporting for urgent findings
- Must trigger appropriate follow-up actions

---

## 2.2 Interruptions, Handovers, and Urgency

### Interruptions Are Not Bugs, They're Features

**Clinical Reality:**
- A nurse administering medication may be interrupted by a code blue
- A doctor reviewing lab results may be called to an emergency
- A pharmacist verifying orders may need to handle a STAT medication request
- A radiologist reading images may be interrupted for an urgent consult

**System Design Implications:**

**1. State Preservation**
- Systems must save state when interrupted
- Users must be able to resume where they left off
- No data loss during interruptions
- Context must be preserved

**2. Priority Handling**
- Systems must support priority escalation
- Urgent tasks can interrupt routine tasks
- Clear priority indicators
- Automatic prioritization based on clinical rules

**3. Graceful Interruption**
- Systems must handle user abandonment gracefully
- Timeout handling for inactive sessions
- Automatic save and resume
- Notification when returning to interrupted task

**Example: Medication Ordering System**

**Without Interruption Handling:**
```
User starts order → Fills form → Gets interrupted → Returns later → Form is lost → Must restart
```

**With Interruption Handling:**
```
User starts order → Fills form → Gets interrupted → System auto-saves → Returns later → Resumes from saved state
```

**Additional Features:**
- Visual indicator of incomplete orders
- Time since last activity shown
- Option to discard or complete
- Audit trail of interruptions

### Handovers: Multiple People, One Patient

**Clinical Reality:**
- Care is provided by teams, not individuals
- Shifts change every 8-12 hours
- Specialists consult on cases
- Responsibilities transfer between roles

**System Design Implications:**

**1. Shared Context**
- All team members need access to relevant information
- Context must be preserved across handovers
- Clear ownership and responsibility tracking
- Communication channels between team members

**2. Handoff Documentation**
- Structured handoff formats (SBAR, I-PASS)
- Critical information highlighting
- Active issue tracking
- Follow-up assignment

**3. Asynchronous Collaboration**
- Systems must support asynchronous workflows
- Comments and annotations
- Task assignment and tracking
- Notification systems

**Example: Patient Care Coordination**

**Handoff Requirements:**
- **Situation:** Patient status and current condition
- **Background:** Relevant history and context
- **Assessment:** Current assessment and concerns
- **Recommendation:** Next steps and follow-ups

**System Support:**
- Structured handoff form
- Pre-populated with relevant data
- Highlighting of critical information
- Assignment of follow-up tasks
- Notification to receiving clinician

### Urgency: Time-Critical vs Deferrable

**Time-Critical Tasks:**
- Code blue response (immediate)
- STAT medication orders (within minutes)
- Critical lab results (within hours)
- Urgent imaging findings (within hours)
- Emergency procedures (immediate)

**Deferrable Tasks:**
- Routine medication administration (scheduled)
- Non-urgent lab reviews (within 24 hours)
- Routine documentation (end of shift)
- Preventive care reminders (days/weeks)
- Administrative tasks (flexible)

**System Design Implications:**

**1. Priority Classification**
- Automatic classification based on clinical rules
- Manual override capability
- Visual priority indicators
- Escalation for overdue critical tasks

**2. Time-Sensitive Routing**
- Critical tasks routed immediately
- Deferrable tasks queued appropriately
- Timeout handling for critical tasks
- Automatic escalation if not addressed

**3. Resource Allocation**
- Critical tasks get priority access to resources
- Queue management for deferrable tasks
- Capacity planning for time-critical operations
- Load balancing that respects priorities

**Example: Lab Results Processing**

**Time-Critical Results:**
- Critical values (immediate notification)
- STAT orders (within 1 hour)
- Urgent findings (within 4 hours)

**Deferrable Results:**
- Routine labs (within 24 hours)
- Screening tests (within days)
- Follow-up tests (scheduled)

**System Behavior:**
- Critical values: Immediate alert, multiple notification channels
- STAT orders: Prioritized processing, fast-track reporting
- Urgent findings: Highlighted in interface, notification sent
- Routine labs: Queued normally, available when reviewed

---

## 2.3 Human-in-the-Loop as an Engineering Primitive

### Human-in-the-Loop Is Not Optional

In healthcare AI systems, human oversight is not a nice-to-have—it's a fundamental requirement for safety and trust.

### Types of Human-in-the-Loop

**1. Human-in-the-Loop (Required Approval)**
- AI makes recommendation
- Human must approve before action
- Cannot proceed without human sign-off
- Use case: High-stakes decisions (medication dosing, critical diagnoses)

**2. Human-on-the-Loop (Monitoring)**
- AI makes decision autonomously
- Human monitors and can intervene
- Human can override if needed
- Use case: Routine tasks with oversight (medication reminders, documentation)

**3. Human-over-the-Loop (Escalation)**
- AI handles routine cases
- Escalates to human for exceptions
- Human handles complex cases
- Use case: Triage systems, routine screening

**4. Human-beside-the-Loop (Collaboration)**
- AI and human work together
- AI provides suggestions, human decides
- Collaborative decision-making
- Use case: Diagnostic assistance, treatment planning

### Engineering Human-in-the-Loop

**1. Clear Decision Points**
- Explicit approval steps
- Clear presentation of AI recommendation
- Confidence scores and reasoning
- Override capabilities

**2. Efficient Workflows**
- Minimize cognitive load
- Present relevant information
- Support quick decisions
- Reduce unnecessary approvals

**3. Audit and Learning**
- Log all human decisions
- Track override patterns
- Learn from human feedback
- Improve AI recommendations

**4. Safety Mechanisms**
- Timeout handling (what if human doesn't respond?)
- Escalation paths (what if human unavailable?)
- Fallback procedures (what if system fails?)
- Emergency overrides

**Example: Medication Dosing System**

**Workflow:**
```
AI calculates dose → Presents recommendation with:
  - Calculated dose
  - Confidence score (85%)
  - Reasoning (based on weight, age, renal function)
  - Alternative options
  - Warnings (drug interactions, allergies)
  
Clinician reviews → Can:
  - Approve as-is
  - Modify dose (with reason required)
  - Reject and recalculate
  - Request pharmacist review
  
Action taken → Logged with:
  - AI recommendation
  - Clinician decision
  - Any modifications
  - Timestamp
  - Rationale
```

**Safety Features:**
- Cannot proceed without clinician approval
- Modifications require documentation
- High-risk doses require additional approval
- System logs everything for audit

---

## 2.4 Where Automation Is Unsafe by Design

### The Automation Boundary

Not everything should be automated in healthcare. Some decisions require human judgment, empathy, and clinical expertise.

### Unsafe Automation Scenarios

**1. High-Stakes Decisions Without Human Review**
- **Unsafe:** Fully automated medication dosing for critical medications
- **Safe:** Automated calculation with mandatory human review
- **Reason:** Life-threatening consequences of errors

**2. Complex, Context-Dependent Decisions**
- **Unsafe:** Automated diagnosis without clinician review
- **Safe:** AI-assisted diagnosis with clinician interpretation
- **Reason:** Medical context is complex and nuanced

**3. Patient-Facing Decisions Requiring Empathy**
- **Unsafe:** Automated breaking of bad news
- **Safe:** AI provides information, human delivers with empathy
- **Reason:** Human connection is essential

**4. Decisions Requiring Legal/Ethical Judgment**
- **Unsafe:** Automated end-of-life decisions
- **Safe:** AI provides information, human makes ethical judgment
- **Reason:** Ethical and legal complexity

**5. Decisions in Unclear or Ambiguous Situations**
- **Unsafe:** Automated decisions when confidence is low
- **Safe:** Escalation to human when confidence < threshold
- **Reason:** Uncertainty requires human judgment

### Safe Automation Patterns

**1. Information Aggregation and Presentation**
- ✅ Safe: Automatically gather and present relevant information
- ✅ Safe: Highlight critical findings
- ✅ Safe: Suggest possible diagnoses or treatments
- ❌ Unsafe: Make final diagnosis or treatment decision

**2. Routine, Rule-Based Tasks**
- ✅ Safe: Automated medication reminders
- ✅ Safe: Automated appointment scheduling
- ✅ Safe: Automated documentation of routine data
- ❌ Unsafe: Automated interpretation of complex data

**3. Decision Support, Not Decision Making**
- ✅ Safe: Provide recommendations with confidence scores
- ✅ Safe: Flag potential issues for review
- ✅ Safe: Suggest alternatives
- ❌ Unsafe: Execute actions without approval

**4. Monitoring and Alerting**
- ✅ Safe: Monitor patient data and alert on anomalies
- ✅ Safe: Track medication adherence
- ✅ Safe: Monitor system health
- ❌ Unsafe: Take action based on alerts without human review

### The Hard Stop Principle

**Definition:** A "hard stop" is a point in a workflow where automation cannot proceed without explicit human intervention.

**Hard Stop Criteria:**
- Life-threatening consequences if wrong
- High legal/regulatory risk
- Requires clinical judgment
- Ethical implications
- Ambiguous or uncertain situation
- Patient safety at risk

**Example: Medication Administration**

**Automated Steps (Safe):**
- Check for drug-drug interactions
- Verify patient allergies
- Calculate dose based on weight/age
- Check against formulary
- Generate administration schedule

**Hard Stop (Required):**
- Final approval before administration
- Patient identification verification
- Administration documentation

**System Design:**
- Cannot bypass hard stop
- Clear indication of hard stop
- Audit trail of hard stop decisions
- Timeout handling (what if clinician unavailable?)

---

## 2.5 Practical: Translate Clinical Workflow to System Constraints

### Exercise: Workflow-to-Constraint Mapping

**Objective:** Translate a clinical workflow into system constraints that ensure safe integration.

**Choose one workflow:**

**Option A: Medication Administration**
- Map the complete workflow from order to administration
- Identify all system constraints
- Define hard stops
- Design human-in-the-loop points

**Option B: Patient Handoff**
- Map shift change workflow
- Identify information transfer requirements
- Define system support for handoff
- Design continuity mechanisms

**Option C: Diagnostic Workflow**
- Map from order to action
- Identify time-critical vs deferrable steps
- Define AI assistance points
- Design review and approval workflow

**Mapping Framework:**

1. **Workflow Steps**
   - List all steps in the workflow
   - Identify actors (who does what)
   - Identify handoffs
   - Identify decision points

2. **System Constraints**
   - What data is required?
   - What validations are needed?
   - What approvals are required?
   - What time constraints exist?
   - What safety checks are needed?

3. **Hard Stops**
   - Where must human intervention occur?
   - What cannot be automated?
   - What requires explicit approval?
   - What needs documentation?

4. **Interruption Handling**
   - Where can workflow be interrupted?
   - How is state preserved?
   - How is workflow resumed?
   - What happens to incomplete tasks?

5. **Priority and Urgency**
   - What steps are time-critical?
   - What steps can be deferred?
   - How are priorities determined?
   - How are urgent cases handled?

**Deliverable:** Workflow-to-system constraint map including:
- Workflow diagram
- System constraint specification
- Hard stop identification
- Human-in-the-loop design
- Interruption and priority handling

---

## 2.6 Artefact: Workflow-to-System Constraint Map

### Template: Workflow Constraint Specification

Create a comprehensive document mapping a clinical workflow to system constraints.

**Structure:**

1. **Workflow Overview**
   - Workflow name and purpose
   - Clinical context
   - Key stakeholders
   - High-level flow

2. **Detailed Workflow Steps**
   - Step-by-step breakdown
   - Actors and responsibilities
   - Handoff points
   - Decision points

3. **System Constraints**
   - Data requirements
   - Validation rules
   - Business logic
   - Integration points
   - Time constraints

4. **Hard Stops**
   - Identification of hard stops
   - Rationale for each hard stop
   - Required human actions
   - Documentation requirements

5. **Human-in-the-Loop Design**
   - Approval points
   - Review requirements
   - Override capabilities
   - Escalation paths

6. **Interruption and Priority Handling**
   - Interruption points
   - State preservation
   - Priority classification
   - Urgency handling

7. **Safety Mechanisms**
   - Validation checks
   - Error handling
   - Fallback procedures
   - Audit requirements

**Example: Medication Administration Workflow**

**Workflow Steps:**
1. Order received
2. Verification (allergies, interactions)
3. Preparation
4. Administration approval (HARD STOP)
5. Patient identification
6. Administration
7. Documentation

**System Constraints:**
- Must verify allergies before preparation
- Must check drug interactions
- Cannot proceed without clinician approval (hard stop)
- Must confirm patient ID before administration
- Must document immediately after administration

**Hard Stops:**
- Final approval before administration
- Patient identification verification

**Human-in-the-Loop:**
- Clinician must approve dose
- Nurse must verify patient ID
- Both actions logged and auditable

**Deliverable:** 5-7 page workflow-to-system constraint map document.

---

## 2.7 Key Takeaways

**Clinical Workflow Fundamentals:**
- Clinical workflows are interruptible, collaborative, and time-sensitive
- Systems must support interruptions, handovers, and urgency
- Human-in-the-loop is an engineering primitive, not optional
- Some automation is unsafe by design—know the boundaries
- Hard stops are required for safety-critical decisions

**Design Principles:**
- Preserve state during interruptions
- Support structured handoffs
- Classify tasks by urgency
- Design explicit human-in-the-loop points
- Identify and enforce hard stops

**Next Steps:**
- Apply workflow constraints to system design
- Design human-in-the-loop workflows
- Identify hard stops in your system
- Plan for interruptions and handovers

---

## Additional Resources

**Readings:**
- "Clinical Workflow Analysis" - Healthcare informatics
- "Human Factors in Healthcare" - Safety engineering
- "SBAR Communication" - Clinical handoff standards
- "Time-Critical Decision Making" - Emergency medicine

**Videos:**
- "Clinical Workflow Design for AI Systems" (30 min)
- "Human-in-the-Loop in Healthcare" (25 min)

**Tools to Explore:**
- Workflow mapping tools (Lucidchart, Miro)
- Clinical workflow analysis frameworks
- SBAR and handoff templates

**Next Module Preview:**
Module 3 will explore how to design agentic AI systems with bounded autonomy, explicit permissions, and escalation paths.

---

**Module 2 Complete**  
**Next:** Module 3 - Agentic AI — Bounded Autonomy by Design
