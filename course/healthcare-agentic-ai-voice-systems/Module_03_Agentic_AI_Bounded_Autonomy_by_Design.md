---
title: "Module 3: Agentic AI — Bounded Autonomy by Design"
description: "Build agents that are useful precisely because they are constrained"
module: "3"
order: 3
email_takeaway: "Agents in healthcare must have bounded autonomy—clear task boundaries, permission checks, and explicit escalation paths."
email_action: "Design an agent with 3 clear task boundaries and 2 escalation points to humans."
---

# Module 3: Agentic AI — Bounded Autonomy by Design

**Duration:** Week 3-4  
**Learning Objectives:**
- Understand agent vs workflow vs orchestration
- Design task decomposition for agentic systems
- Implement permission models and role-based execution
- Design explicit escalation paths to humans
- Build systems that handle partial failure and recovery

---

## 3.1 Agent vs Workflow vs Orchestration

### Understanding the Spectrum

**Workflow:**
- Predefined sequence of steps
- Deterministic execution
- Fixed logic and branching
- Example: "If lab result > threshold, send alert"

**Orchestration:**
- Coordination of multiple services/components
- Centralized control flow
- Service composition
- Example: "Call lab service, then EHR service, then notification service"

**Agent:**
- Autonomous decision-making within bounds
- Dynamic task selection
- Reasoning and planning
- Example: "Analyze patient data, determine what information is needed, gather it, make recommendation"

### When to Use Each

**Use Workflows When:**
- Process is well-defined and stable
- Steps are sequential and predictable
- No reasoning or planning needed
- Simple conditional logic suffices

**Use Orchestration When:**
- Need to coordinate multiple services
- Services are independent
- Control flow is complex but deterministic
- Need centralized management

**Use Agents When:**
- Need autonomous decision-making
- Task requires reasoning and planning
- Dynamic adaptation needed
- Complex, context-dependent decisions

### Healthcare Example: Medication Management

**Workflow Approach:**
```
If medication due → Check allergies → Verify dose → Send reminder
```

**Orchestration Approach:**
```
Orchestrator → Allergy Service → Dose Calculator → Notification Service
```

**Agent Approach:**
```
Medication Agent:
  1. Assess patient context (current medications, conditions, lab results)
  2. Determine if medication is appropriate
  3. Calculate optimal dose considering all factors
  4. Check for interactions and contraindications
  5. Decide: proceed, modify, or escalate
  6. Execute or escalate based on decision
```

**Key Difference:** Agent makes decisions based on reasoning, not just rules.

---

## 3.2 Task Decomposition for Agentic Systems

### Breaking Down Complex Tasks

Agents need clear task boundaries to operate safely and effectively.

### Task Decomposition Principles

**1. Atomic Tasks**
- Each task should be independently executable
- Clear input and output
- Single responsibility
- Can be validated independently

**2. Hierarchical Decomposition**
- High-level goals broken into sub-tasks
- Sub-tasks broken into actions
- Clear parent-child relationships
- Enables partial completion

**3. Dependency Management**
- Identify task dependencies
- Order execution appropriately
- Handle parallel execution where safe
- Manage failure propagation

**4. Bounded Scope**
- Each task has clear boundaries
- Cannot exceed scope without permission
- Clear success/failure criteria
- Timeout and resource limits

### Example: Patient Triage Agent

**High-Level Goal:** Assess patient and determine care priority

**Task Decomposition:**

```
Level 1: Assess Patient
  ├─ Level 2: Gather Vital Signs
  │   ├─ Level 3: Get temperature
  │   ├─ Level 3: Get blood pressure
  │   ├─ Level 3: Get heart rate
  │   └─ Level 3: Get oxygen saturation
  │
  ├─ Level 2: Review History
  │   ├─ Level 3: Get chief complaint
  │   ├─ Level 3: Get medical history
  │   ├─ Level 3: Get current medications
  │   └─ Level 3: Get allergies
  │
  ├─ Level 2: Assess Severity
  │   ├─ Level 3: Evaluate vital signs against norms
  │   ├─ Level 3: Identify red flags
  │   ├─ Level 3: Calculate risk score
  │   └─ Level 3: Determine urgency
  │
  └─ Level 2: Make Recommendation
      ├─ Level 3: Select priority level
      ├─ Level 3: Recommend department
      └─ Level 3: Flag for human review (if high risk)
```

**Task Boundaries:**
- Each level 3 task is atomic
- Level 2 tasks can be executed in parallel (where safe)
- Level 1 task requires all level 2 tasks to complete
- Human review required for high-risk cases

---

## 3.3 Permission Models and Role-Based Execution

### The Permission Framework

Agents must have explicit permissions for what they can and cannot do.

### Permission Types

**1. Read Permissions**
- What data can the agent access?
- What systems can it query?
- What information is restricted?
- Example: Agent can read lab results but not psychiatric notes

**2. Write Permissions**
- What can the agent modify?
- What can it create?
- What can it delete?
- Example: Agent can create medication reminders but not orders

**3. Execute Permissions**
- What actions can the agent take?
- What services can it call?
- What workflows can it trigger?
- Example: Agent can trigger alerts but not procedures

**4. Override Permissions**
- Can the agent override safety checks?
- Can it bypass human approval?
- Under what conditions?
- Example: Agent cannot override hard stops

### Role-Based Access Control (RBAC)

**Roles in Healthcare AI:**

**1. Information Agent (Read-Only)**
- Can: Read patient data, lab results, medications
- Cannot: Modify anything, take actions
- Use case: Information retrieval, data aggregation

**2. Recommendation Agent (Read + Suggest)**
- Can: Read data, generate recommendations
- Cannot: Execute actions, modify records
- Use case: Clinical decision support

**3. Documentation Agent (Read + Write Documentation)**
- Can: Read data, create documentation
- Cannot: Create orders, modify clinical data
- Use case: Automated documentation

**4. Coordination Agent (Orchestration)**
- Can: Coordinate workflows, trigger services
- Cannot: Make clinical decisions, override approvals
- Use case: Workflow orchestration

**5. Administrative Agent (Limited Write)**
- Can: Schedule appointments, send reminders
- Cannot: Access clinical data, make clinical decisions
- Use case: Administrative tasks

### Permission Enforcement

**1. Explicit Permission Checks**
```python
class MedicationAgent:
    def create_order(self, medication, dose):
        # Check permission
        if not self.has_permission("create_medication_order"):
            raise PermissionDenied("Agent lacks permission to create orders")
        
        # Check role
        if self.role != "prescribing_agent":
            raise PermissionDenied("Only prescribing agents can create orders")
        
        # Proceed with order creation
        return self._create_order(medication, dose)
```

**2. Runtime Permission Validation**
- Check permissions before each action
- Log permission checks
- Fail safely if permission denied
- Escalate if permission needed

**3. Principle of Least Privilege**
- Agents get minimum permissions needed
- No "super user" agents
- Permissions reviewed regularly
- Audit permission usage

---

## 3.4 Explicit Escalation Paths to Humans

### When Agents Must Escalate

**1. Permission Boundaries**
- Agent lacks permission for action
- Action requires higher privilege
- Escalate to authorized human

**2. Confidence Thresholds**
- Agent confidence below threshold
- Uncertainty too high
- Escalate to human for decision

**3. Safety Boundaries**
- Action exceeds safety limits
- Risk too high for autonomous action
- Escalate to human for approval

**4. Exception Handling**
- Unexpected situation encountered
- No clear path forward
- Escalate to human for guidance

**5. Hard Stops**
- Clinical hard stop encountered
- Mandatory human review required
- Escalate and wait for approval

### Escalation Design Patterns

**1. Escalation Queue**
```
Agent encounters escalation point
  → Creates escalation ticket
  → Routes to appropriate human role
  → Notifies human (multiple channels)
  → Waits for response
  → Resumes or terminates based on response
```

**2. Escalation Levels**

**Level 1: Informational**
- Agent completes task
- Notifies human for awareness
- No action required from human
- Example: "Completed medication review, no issues found"

**Level 2: Review Required**
- Agent makes recommendation
- Human must review before action
- Action blocked until review
- Example: "Recommended dose change, please review"

**Level 3: Decision Required**
- Agent cannot proceed
- Human must make decision
- Agent waits for human input
- Example: "Unclear medication interaction, human decision needed"

**Level 4: Emergency Escalation**
- Critical situation detected
- Immediate human attention required
- Multiple notification channels
- Example: "Critical lab value detected, immediate review needed"

### Escalation Implementation

**Example: Medication Dosing Agent**

```python
class MedicationDosingAgent:
    def calculate_dose(self, patient, medication):
        # Calculate dose
        dose = self._calculate(patient, medication)
        confidence = self._get_confidence(dose)
        
        # Check escalation conditions
        if confidence < 0.7:
            return self._escalate(
                level="decision_required",
                reason="Low confidence in dose calculation",
                context={"patient": patient, "medication": medication, "dose": dose}
            )
        
        if dose > self.safety_limit:
            return self._escalate(
                level="review_required",
                reason="Dose exceeds safety limit",
                context={"dose": dose, "limit": self.safety_limit}
            )
        
        if self._has_contraindication(patient, medication):
            return self._escalate(
                level="decision_required",
                reason="Potential contraindication detected",
                context={"contraindication": self._get_contraindication()}
            )
        
        # Proceed with dose
        return self._proceed(dose)
    
    def _escalate(self, level, reason, context):
        # Create escalation ticket
        ticket = EscalationTicket(
            agent=self.agent_id,
            level=level,
            reason=reason,
            context=context,
            timestamp=datetime.now()
        )
        
        # Route to appropriate human
        human = self._route_to_human(level)
        
        # Notify human
        self._notify_human(human, ticket)
        
        # Wait for response
        response = self._wait_for_response(ticket, timeout=3600)  # 1 hour timeout
        
        if response.approved:
            return self._proceed_with_approval(response)
        else:
            return self._terminate_with_reason(response.reason)
```

---

## 3.5 Designing for Partial Failure and Recovery

### Failure Is Inevitable

Agents will fail. Design for graceful failure and recovery.

### Failure Modes

**1. Task Failure**
- Individual task fails
- Other tasks may still succeed
- Partial results available
- Recovery: Retry task or escalate

**2. Agent Failure**
- Entire agent fails
- All tasks in progress lost
- Recovery: Restart agent, resume from checkpoint

**3. System Failure**
- Infrastructure fails
- Services unavailable
- Recovery: Failover, degraded mode

**4. Data Failure**
- Missing data
- Corrupted data
- Stale data
- Recovery: Request data, use defaults, escalate

### Recovery Strategies

**1. Checkpointing**
- Save state at key points
- Enable resume from checkpoint
- Don't lose progress on failure
- Example: Save after each completed task

**2. Retry Logic**
- Automatic retry for transient failures
- Exponential backoff
- Maximum retry limits
- Example: Retry API call 3 times with backoff

**3. Partial Results**
- Return what was completed
- Indicate what failed
- Enable human to complete manually
- Example: "Gathered 3 of 4 lab results, 1 failed"

**4. Degraded Mode**
- Continue with reduced functionality
- Skip non-critical tasks
- Escalate critical failures
- Example: Continue with cached data if live data unavailable

**5. Escalation on Failure**
- Escalate if retry fails
- Escalate if critical task fails
- Provide context for human
- Example: "Failed to retrieve lab results after 3 retries, human intervention needed"

### Example: Patient Assessment Agent with Recovery

```python
class PatientAssessmentAgent:
    def assess_patient(self, patient_id):
        results = {}
        failures = []
        
        # Task 1: Get vital signs
        try:
            results['vitals'] = self._get_vitals(patient_id)
        except Exception as e:
            failures.append(("vitals", str(e)))
            # Try alternative source
            try:
                results['vitals'] = self._get_vitals_alternative(patient_id)
            except:
                # Escalate if critical
                if self._is_critical("vitals"):
                    self._escalate("vitals_unavailable", patient_id)
                    return None
        
        # Task 2: Get lab results
        try:
            results['labs'] = self._get_labs(patient_id)
        except Exception as e:
            failures.append(("labs", str(e)))
            # Continue without labs if not critical
            if not self._is_critical("labs"):
                results['labs'] = None
        
        # Task 3: Get history
        try:
            results['history'] = self._get_history(patient_id)
        except Exception as e:
            failures.append(("history", str(e)))
            # Use cached history if available
            results['history'] = self._get_cached_history(patient_id)
        
        # Assess with available data
        if len(failures) > 0:
            assessment = self._assess_partial(results, failures)
            # Flag incomplete assessment
            assessment['incomplete'] = True
            assessment['missing_data'] = [f[0] for f in failures]
        else:
            assessment = self._assess_complete(results)
        
        return assessment
```

---

## 3.6 Practical: Design an Agentic System

### Exercise: Agent System Design

**Objective:** Design an agentic system with clear task boundaries, permission checks, and escalation logic.

**Choose one use case:**

**Option A: Medication Management Agent**
- Manages medication schedules
- Checks for interactions
- Sends reminders
- Escalates issues

**Option B: Lab Results Review Agent**
- Monitors lab results
- Identifies critical values
- Recommends follow-up
- Escalates urgent findings

**Option C: Patient Triage Agent**
- Assesses patient urgency
- Routes to appropriate department
- Prioritizes care
- Escalates high-risk cases

**Design Requirements:**

1. **Task Decomposition**
   - Break down into atomic tasks
   - Define task dependencies
   - Identify parallel execution opportunities
   - Define task boundaries

2. **Permission Model**
   - Define agent role
   - Specify read permissions
   - Specify write permissions
   - Specify execute permissions
   - Define permission boundaries

3. **Escalation Logic**
   - Identify escalation points
   - Define escalation levels
   - Specify escalation triggers
   - Design escalation workflow

4. **Failure Handling**
   - Identify failure modes
   - Design recovery strategies
   - Plan for partial failure
   - Define escalation on failure

**Deliverable:** Agent system design spec including:
- System architecture diagram
- Task decomposition tree
- Permission model specification
- Escalation flow diagram
- Failure handling procedures

---

## 3.7 Artefact: Agent System Design Spec

### Template: Engineer-Facing Agent Design Specification

Create a comprehensive design specification for an agentic system.

**Structure:**

1. **System Overview**
   - Agent purpose and scope
   - Use cases and scenarios
   - Key stakeholders
   - Success criteria

2. **Task Decomposition**
   - High-level goals
   - Task hierarchy
   - Task dependencies
   - Execution flow

3. **Permission Model**
   - Agent role definition
   - Permission matrix
   - Permission enforcement
   - Audit requirements

4. **Escalation Design**
   - Escalation points
   - Escalation levels
   - Escalation triggers
   - Escalation workflow
   - Human notification

5. **Failure Handling**
   - Failure modes
   - Recovery strategies
   - Partial failure handling
   - Escalation on failure

6. **Safety Mechanisms**
   - Bounds and limits
   - Validation checks
   - Timeout handling
   - Kill switches

7. **Observability**
   - Logging requirements
   - Metrics to track
   - Alerting rules
   - Audit trail

**Example Sections:**

**Task Decomposition:**
```
Goal: Manage medication schedule for patient

Tasks:
  1. Retrieve current medications
  2. Check for interactions
  3. Verify schedule adherence
  4. Send reminders
  5. Escalate issues

Sub-tasks for "Check for interactions":
  1.1. Get patient medication list
  1.2. Query interaction database
  1.3. Evaluate interaction severity
  1.4. Flag critical interactions
```

**Permission Model:**
```
Role: Medication Management Agent

Permissions:
  - Read: Patient medications, schedules, allergies
  - Write: Medication reminders, adherence logs
  - Execute: Send notifications, create reminders
  - Cannot: Create orders, modify prescriptions, override safety checks
```

**Escalation Logic:**
```
Escalation Point 1: Critical drug interaction detected
  Level: Decision Required
  Route to: Pharmacist or prescribing physician
  Timeout: 1 hour
  Action if no response: Notify on-call physician

Escalation Point 2: Patient non-adherence pattern
  Level: Review Required
  Route to: Care coordinator
  Timeout: 24 hours
  Action if no response: Flag for next appointment
```

**Deliverable:** 8-10 page agent system design specification document.

---

## 3.8 Key Takeaways

**Agentic AI Fundamentals:**
- Agents provide autonomous decision-making within bounded scope
- Task decomposition creates clear boundaries and dependencies
- Permission models enforce safety and compliance
- Explicit escalation paths ensure human oversight
- Partial failure handling enables graceful degradation

**Design Principles:**
- Bounded autonomy: Agents are useful because they are constrained
- Clear task boundaries enable safety and debugging
- Permission checks happen at runtime, not just design time
- Escalation is a feature, not a failure
- Design for failure: assume things will go wrong

**Next Steps:**
- Apply task decomposition to your agent design
- Implement permission models and role-based access
- Design explicit escalation workflows
- Plan for partial failure and recovery

---

## Additional Resources

**Readings:**
- "Agent-Oriented Software Engineering" - Agent design patterns
- "Bounded Rationality in AI Systems" - Autonomy boundaries
- "Human-AI Collaboration" - Escalation design
- "Fault-Tolerant Distributed Systems" - Failure handling

**Videos:**
- "Designing Bounded Autonomy Agents" (30 min)
- "Escalation Patterns in AI Systems" (25 min)

**Tools to Explore:**
- Agent frameworks (LangGraph, AutoGen, CrewAI)
- Permission management systems
- Escalation workflow tools

**Next Module Preview:**
Module 4 will explore voice systems engineering in healthcare, including ASR, NLU, latency, reliability, and safety considerations.

---

**Module 3 Complete**  
**Next:** Module 4 - Voice Systems Engineering in Healthcare
