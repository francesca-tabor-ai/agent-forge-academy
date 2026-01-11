---
title: "Module 2: System Architecture for Failure-First Agents"
description: "Designing systems that expect to be wrong"
module: "2"
order: 2
email_takeaway: "Agents should be designed as control systems with explicit state management, not just LLM wrappers. Intelligence should live where it adds value, not everywhere."
email_action: "Identify one place in your agent system where intelligence shouldn't live—where would a simple rule work better?"
---

# Module 2: System Architecture for Failure-First Agents

**Duration:** Week 2  
**Learning Objectives:**
- Design systems that expect to be wrong
- Understand agents as control systems, not LLM wrappers
- Distinguish explicit state, implicit state, and where bugs hide
- Learn multi-agent topologies and their failure signatures
- Identify where intelligence should not live

---

## 2.1 Designing Systems That Expect to Be Wrong

### The Failure-First Mindset

**Traditional Design:**
```
Design for success → Handle failures as edge cases
```

**Failure-First Design:**
```
Design for failure → Success is a special case of graceful degradation
```

### Core Principles

**Principle 1: Assume Everything Will Fail**
- Tools will break
- Models will drift
- Networks will timeout
- State will corrupt

**Principle 2: Failures Should Be Observable**
- Every failure should be logged
- Every failure should be measurable
- Every failure should be recoverable

**Principle 3: Failures Should Be Isolated**
- One agent failure shouldn't cascade
- One tool failure shouldn't break the system
- One model issue shouldn't corrupt state

**Principle 4: Failures Should Be Recoverable**
- State should be checkpointed
- Work should be resumable
- Changes should be rollbackable

---

## 2.2 Agents as Control Systems, Not LLM Wrappers

### The LLM Wrapper Anti-Pattern

**Bad Design:**
```python
def agent_task(input):
    prompt = f"Process this: {input}"
    response = llm.complete(prompt)
    return response
```

**Problems:**
- No state management
- No error handling
- No observability
- No recovery mechanisms

### The Control System Pattern

**Good Design:**
```python
class AgentControlSystem:
    def __init__(self):
        self.state = AgentState()
        self.observability = ObservabilityLayer()
        self.recovery = RecoveryMechanism()
        self.budget = ExecutionBudget()
    
    def execute(self, input):
        try:
            # Checkpoint state
            checkpoint = self.state.checkpoint()
            
            # Execute with budget
            result = self._execute_with_budget(input)
            
            # Validate result
            if not self._validate(result):
                raise ValidationError()
            
            # Commit state
            self.state.commit()
            return result
            
        except Exception as e:
            # Rollback state
            self.state.rollback(checkpoint)
            
            # Log failure
            self.observability.log_failure(e)
            
            # Attempt recovery
            return self.recovery.recover(e)
```

### Control System Components

**1. State Management**
- Explicit state tracking
- Checkpointing
- Rollback capability

**2. Observability**
- Decision logging
- Performance metrics
- Failure tracking

**3. Recovery Mechanisms**
- Automatic retry (with limits)
- Graceful degradation
- Human escalation

**4. Execution Budgets**
- Time limits
- Cost limits
- Retry limits

---

## 2.3 Explicit State, Implicit State, and Where Bugs Hide

### Explicit State

**Definition:** State that is intentionally tracked and managed

**Examples:**
- Database records
- Configuration files
- Checkpoint files
- Log entries

**Characteristics:**
- Visible
- Queryable
- Versioned
- Recoverable

**Example:**
```python
class ExplicitState:
    def __init__(self):
        self.task_queue = []
        self.completed_tasks = []
        self.failed_tasks = []
        self.current_task = None
```

### Implicit State

**Definition:** State that exists but isn't explicitly tracked

**Examples:**
- Model internal state
- Context window contents
- Tool connection state
- Network connection state

**Characteristics:**
- Hidden
- Hard to query
- Not versioned
- Hard to recover

**Example:**
```python
# Implicit state - model "remembers" previous conversation
# but we don't explicitly track what it remembers
response = model.chat([
    {"role": "user", "content": "What is 2+2?"},
    {"role": "assistant", "content": "4"},
    {"role": "user", "content": "What about 3+3?"}  # Model "knows" context
])
```

### Where Bugs Hide

**Location 1: Implicit State Transitions**
```
Bug: Model context drifts over time
Symptom: Same input produces different outputs
Detection: Hard (requires comparison over time)
Fix: Make context explicit
```

**Location 2: State Synchronization**
```
Bug: Multiple agents have different views of state
Symptom: Agents make conflicting decisions
Detection: Requires state comparison
Fix: Single source of truth
```

**Location 3: State Corruption**
```
Bug: Partial state updates leave system inconsistent
Symptom: System behaves unpredictably
Detection: State validation required
Fix: Transactional updates
```

**Location 4: Hidden Dependencies**
```
Bug: Agent depends on tool state it doesn't know about
Symptom: Works sometimes, fails other times
Detection: Requires dependency analysis
Fix: Explicit dependency declaration
```

### Making Implicit State Explicit

**Strategy 1: Context Tracking**
```python
# Instead of implicit context
response = model.chat(messages)

# Track context explicitly
context = ContextManager()
context.add_message("user", "What is 2+2?")
response = model.chat(context.get_messages())
context.add_message("assistant", response)
```

**Strategy 2: State Snapshots**
```python
# Take snapshots of implicit state
snapshot = {
    "model_state": model.get_state(),
    "tool_connections": tools.get_connections(),
    "context_window": context.get_window()
}
```

**Strategy 3: State Validation**
```python
# Validate state consistency
def validate_state(state):
    assert state.is_consistent()
    assert state.dependencies_resolved()
    assert state.no_circular_dependencies()
```

---

## 2.4 Multi-Agent Topologies and Their Failure Signatures

### Topology 1: Linear Pipeline

**Structure:**
```
Agent A → Agent B → Agent C → Output
```

**Failure Signature:**
- Single point of failure at any agent
- Cascading failures downstream
- No parallelization
- Easy to debug (linear flow)

**Example:**
```
Document → Parser → Analyzer → Summarizer → Output
If Parser fails, entire pipeline fails
```

### Topology 2: Parallel Processing

**Structure:**
```
        → Agent B
Input → → Agent C → Aggregator → Output
        → Agent D
```

**Failure Signature:**
- Partial failures possible
- Aggregator must handle missing inputs
- Race conditions possible
- Harder to debug (parallel execution)

**Example:**
```
Query → [Search Agent, Analysis Agent, Validation Agent] → Aggregator
If one agent fails, others continue, aggregator must handle
```

### Topology 3: Hierarchical

**Structure:**
```
        Director Agent
            ↓
    ┌───────┴───────┐
Manager A      Manager B
    ↓               ↓
[Agents]        [Agents]
```

**Failure Signature:**
- Isolated failure domains
- Manager failures affect all subordinates
- Director failure affects entire system
- Complex debugging (multiple layers)

**Example:**
```
Director → [Finance Manager, Legal Manager, Operations Manager]
Each manager coordinates specialized agents
```

### Topology 4: Mesh Network

**Structure:**
```
Agent A ↔ Agent B
   ↕         ↕
Agent C ↔ Agent D
```

**Failure Signature:**
- Highly resilient (multiple paths)
- Complex failure modes
- Potential for deadlocks
- Very hard to debug (distributed state)

**Example:**
```
Research agents collaborate in mesh
Any agent can communicate with any other
```

### Failure Signature Patterns

**Pattern 1: Cascading Failures**
- **Topology:** Linear, Hierarchical
- **Symptom:** One failure causes many failures
- **Mitigation:** Circuit breakers, isolation

**Pattern 2: Partial Failures**
- **Topology:** Parallel, Mesh
- **Symptom:** Some agents work, others fail
- **Mitigation:** Graceful degradation, aggregation logic

**Pattern 3: Deadlocks**
- **Topology:** Mesh, Hierarchical
- **Symptom:** Agents waiting for each other
- **Mitigation:** Timeouts, dependency analysis

**Pattern 4: State Divergence**
- **Topology:** All (especially Mesh)
- **Symptom:** Agents have different views of state
- **Mitigation:** Single source of truth, consensus protocols

---

## 2.5 When Autonomy Should Be Constrained or Removed

### When to Remove Autonomy

**Scenario 1: High-Stakes Decisions**
```
Decision: Approve $1M transaction
Autonomy: ❌ Remove (require human approval)
Reason: Cost of error too high
```

**Scenario 2: Regulatory Requirements**
```
Decision: Medical diagnosis
Autonomy: ❌ Remove (require human review)
Reason: Legal/regulatory requirement
```

**Scenario 3: Unreliable Inputs**
```
Decision: Process corrupted data
Autonomy: ❌ Remove (require human validation)
Reason: Input quality too low
```

### When to Constrain Autonomy

**Scenario 1: Cost Limits**
```
Decision: Research task
Autonomy: ✅ Constrain (limit to $10, then escalate)
Reason: Prevent cost overruns
```

**Scenario 2: Time Limits**
```
Decision: Long-running analysis
Autonomy: ✅ Constrain (limit to 5 minutes, then timeout)
Reason: Prevent infinite loops
```

**Scenario 3: Quality Thresholds**
```
Decision: Generate content
Autonomy: ✅ Constrain (if confidence < 0.8, escalate)
Reason: Ensure quality
```

### Autonomy Decision Framework

**Question 1: What's the cost of error?**
- High cost → Remove autonomy
- Medium cost → Constrain autonomy
- Low cost → Full autonomy

**Question 2: How reliable is the input?**
- Unreliable → Remove autonomy
- Somewhat reliable → Constrain autonomy
- Highly reliable → Full autonomy

**Question 3: How well-defined is the task?**
- Ambiguous → Remove autonomy
- Somewhat defined → Constrain autonomy
- Well-defined → Full autonomy

**Question 4: What's the recovery cost?**
- High recovery cost → Remove autonomy
- Medium recovery cost → Constrain autonomy
- Low recovery cost → Full autonomy

### Where Intelligence Should Not Live

**Location 1: Simple Rules**
```
Bad: LLM decides if number > 10
Good: if number > 10: ...
Reason: LLM adds cost, latency, non-determinism
```

**Location 2: Data Validation**
```
Bad: LLM validates email format
Good: regex.validate(email)
Reason: Deterministic validation is better
```

**Location 3: Routing Logic**
```
Bad: LLM decides which agent to call
Good: Rule-based routing with LLM fallback
Reason: Routing should be fast and deterministic
```

**Location 4: Error Handling**
```
Bad: LLM decides how to handle errors
Good: Structured error handling with LLM for complex cases
Reason: Error handling must be reliable
```

---

## 2.6 Key Takeaways

**Failure-First Design:**
- Assume everything will fail
- Make failures observable
- Isolate failures
- Enable recovery

**Control System Pattern:**
- Agents are control systems, not LLM wrappers
- Include state management, observability, recovery, budgets
- Design for control, not just completion

**State Management:**
- Explicit state is visible and recoverable
- Implicit state hides bugs
- Make implicit state explicit
- Validate state consistency

**Topology Matters:**
- Different topologies have different failure signatures
- Choose topology based on failure tolerance needs
- Design for your topology's failure patterns

**Intelligence Placement:**
- Not everything needs LLM intelligence
- Use rules for simple decisions
- Use LLMs for complex reasoning
- Constrain or remove autonomy when appropriate

---

## Practical Work: Refactoring a Happy-Path Agent into a Failure-Tolerant System

**Objective:** Transform a working agent into a failure-tolerant system

**Requirements:**
1. Start with a simple "happy-path" agent
2. Add explicit state management
3. Implement observability
4. Add recovery mechanisms
5. Add execution budgets
6. Test failure scenarios

**Deliverables:**
- Refactored code with failure tolerance
- State management implementation
- Observability integration
- Recovery mechanism design
- Failure test results

**Evaluation Criteria:**
- Quality of state management (25%)
- Observability implementation (25%)
- Recovery mechanisms (25%)
- Failure test coverage (25%)

**Time Estimate:** 4-5 hours

---

## Additional Resources

**Readings:**
- "Control Systems for Autonomous Agents"
- "State Management in Distributed Systems"
- "Failure Patterns in Multi-Agent Systems"

**Tools to Explore:**
- State management frameworks
- Observability platforms
- Recovery mechanism libraries

**Next Module Preview:**
Module 3 will teach you how to handle tool failures and capability drift, building on the failure-tolerant architecture from this module.

---

**Module 2 Complete**   
**Next:** Module 3 - Tool Contracts, Capability Drift, and Defensive Execution
