---
title: "Module 5: Production Systems & Real-World Deployment"
description: "Deploy multi-agent systems to production. Manage costs, performance, and reliability. Harden systems and create executable documentation"
module: "5"
order: 5
---

# Module 5: Production Systems & Real-World Deployment

**Duration:** Week 5  
**Learning Objectives:**
- Understand cost, token, and performance optimization strategies
- Harden systems against cascading failures
- Design human override mechanisms
- Create documentation as executable infrastructure
- Build a complete production-ready multi-agent system

---

## 5.1 Cost, Tokens & Performance

### Why code blocks are cheaper than agent loops

**Cost Comparison:**

#### Agent Loop Cost
- Multiple LLM calls per task
- Each call processes full context
- Reasoning overhead for simple operations
- Token costs accumulate quickly

**Example:**
```
Task: Transform data format
Agent Loop:
  - Planning call: 1000 tokens
  - Execution reasoning: 500 tokens
  - Validation call: 800 tokens
  Total: 2300 tokens × $0.003/1K = $0.0069
```

#### Code Block Cost
- Single execution, no LLM calls
- Deterministic, no reasoning needed
- Only pay for compute time
- Minimal token usage

**Example:**
```
Task: Transform data format
Code Block:
  - Execution: 10ms CPU time
  - No tokens
  Total: ~$0.000001 (compute cost)
```

**Savings:** Code blocks are orders of magnitude cheaper for execution tasks

### Where Claude Code should think vs where execution should happen

**Decision Framework:**

#### Use Claude Code For:
- **Planning:** Breaking down complex problems
- **Decision-making:** Choosing between options
- **Reasoning:** Understanding context and requirements
- **Design:** Creating architectures and workflows
- **Evaluation:** Complex quality assessment
- **Exception handling:** Dealing with unexpected situations

**Characteristics:**
- Requires reasoning and judgment
- Benefits from LLM capabilities
- Worth the token cost
- Hard to do deterministically

#### Use Code Blocks For:
- **Execution:** Performing well-defined operations
- **Transformations:** Data format conversions
- **Calculations:** Mathematical operations
- **API calls:** External service interactions
- **File operations:** Reading, writing, processing files
- **Validation:** Schema and format checks

**Characteristics:**
- Deterministic and well-understood
- No reasoning required
- Fast and cheap
- Easy to test and debug

**Optimization Strategy:**
1. Use Claude Code to plan and decide
2. Use code blocks to execute
3. Minimize Claude Code in hot paths
4. Cache Claude Code outputs when possible
5. Batch operations to reduce calls

**Example:**
```python
# Good: Claude plans, code executes
def process_documents(documents):
    # Claude Code: Create processing plan
    plan = claude_code.plan_processing(documents)
    
    # Code blocks: Execute plan
    results = []
    for task in plan.tasks:
        result = execute_task(task)  # Code block
        results.append(result)
    
    return results

# Bad: Claude Code in execution loop
def process_documents(documents):
    results = []
    for doc in documents:
        # Expensive: Claude Code called for each document
        result = claude_code.process_document(doc)
        results.append(result)
    return results
```

### System Hardening

#### Preventing cascading failures

**Problem:** One failure causes multiple downstream failures

**Strategies:**

1. **Isolation:**
   - Isolate agent execution
   - Prevent failures from propagating
   - Use try-catch around each agent
   - Fail gracefully, don't crash

2. **Circuit Breakers:**
   - Detect repeated failures
   - Stop calling failing components
   - Allow recovery time
   - Automatic retry after cooldown

3. **Timeouts:**
   - Set maximum execution time
   - Kill hung processes
   - Prevent resource exhaustion
   - Fail fast, not slow

4. **Resource Limits:**
   - Limit memory usage
   - Limit API call rates
   - Limit concurrent executions
   - Prevent resource exhaustion

5. **Validation Gates:**
   - Validate inputs before processing
   - Reject invalid inputs early
   - Prevent bad data from propagating
   - Clear error messages

**Example:**
```python
class ResilientAgent:
    def __init__(self):
        self.circuit_breaker = CircuitBreaker(failure_threshold=5)
        self.timeout = 30  # seconds
    
    def execute(self, task):
        try:
            # Timeout protection
            with timeout(self.timeout):
                # Circuit breaker protection
                if self.circuit_breaker.is_open():
                    raise CircuitBreakerOpenError()
                
                result = self._execute_task(task)
                self.circuit_breaker.record_success()
                return result
        except TimeoutError:
            self.circuit_breaker.record_failure()
            return self._handle_timeout(task)
        except Exception as e:
            self.circuit_breaker.record_failure()
            return self._handle_error(task, e)
```

#### Fallback strategies

**Principle:** Always have a backup plan

**Types of Fallbacks:**

1. **Default Values:**
   - Use safe defaults when computation fails
   - Prefer "safe but limited" over "broken"
   - Document default behavior

2. **Simplified Processing:**
   - Fall back to simpler algorithm
   - Reduce quality for speed/reliability
   - Graceful degradation

3. **Cached Results:**
   - Use previous successful result
   - Stale data better than no data
   - Clear cache expiration

4. **Human Escalation:**
   - Route to human when automated fails
   - Provide context for human
   - Enable quick resolution

**Example:**
```python
def process_with_fallback(input_data):
    try:
        # Primary: Full processing
        return full_processing(input_data)
    except ProcessingError:
        try:
            # Fallback 1: Simplified processing
            return simplified_processing(input_data)
        except ProcessingError:
            # Fallback 2: Cached result
            cached = get_cached_result(input_data)
            if cached and not is_stale(cached):
                return cached
            # Fallback 3: Human escalation
            escalate_to_human(input_data)
            return get_default_result(input_data)
```

#### Human override design

**Principle:** Humans should be able to intervene when needed

**Design Considerations:**

1. **When to Allow Override:**
   - System is stuck or looping
   - Output is clearly wrong
   - Safety or compliance concerns
   - User explicitly requests

2. **Override Mechanisms:**
   - **Stop:** Halt execution immediately
   - **Skip:** Skip current step, continue
   - **Modify:** Change inputs or parameters
   - **Retry:** Restart with different approach
   - **Manual:** Human completes the task

3. **Override Interface:**
   - Clear, actionable options
   - Show current state
   - Explain what override will do
   - Confirm before executing

4. **Audit Trail:**
   - Log all overrides
   - Record who, when, why
   - Track override outcomes
   - Learn from overrides

**Example:**
```python
class HumanOverride:
    def __init__(self):
        self.override_queue = []
    
    def request_override(self, agent, reason, context):
        override_request = {
            "agent": agent,
            "reason": reason,
            "context": context,
            "timestamp": datetime.now(),
            "options": self._generate_options(agent, context)
        }
        self.override_queue.append(override_request)
        notify_human(override_request)
    
    def apply_override(self, request_id, action, params=None):
        request = self._get_request(request_id)
        log_override(request, action, params)
        
        if action == "stop":
            self._stop_agent(request["agent"])
        elif action == "skip":
            self._skip_step(request["agent"])
        elif action == "modify":
            self._modify_inputs(request["agent"], params)
        elif action == "retry":
            self._retry_with_params(request["agent"], params)
        elif action == "manual":
            self._handoff_to_human(request["agent"], request["context"])
```

---

## 5.2 Documentation as Infrastructure

### Specs as executable artifacts

**Principle:** Documentation should be executable, not just descriptive

**Benefits:**
- Specs can be validated automatically
- Tests can be generated from specs
- Agents can read and follow specs
- Specs stay in sync with implementation

**Types of Executable Specs:**

1. **Schema Definitions:**
   ```python
   # Executable schema
   content_schema = {
       "type": "object",
       "properties": {
           "title": {"type": "string", "minLength": 10},
           "body": {"type": "string", "minLength": 500},
           "tags": {"type": "array", "items": {"type": "string"}}
       },
       "required": ["title", "body"]
   }
   
   # Can be used for validation
   validate(content, content_schema)
   ```

2. **Workflow Definitions:**
   ```python
   # Executable workflow
   workflow = {
       "steps": [
           {"agent": "planner", "input": "requirements"},
           {"agent": "executor", "input": "plan", "depends_on": ["planner"]},
           {"agent": "validator", "input": "output", "depends_on": ["executor"]}
       ]
   }
   
   # Can be executed
   execute_workflow(workflow, inputs)
   ```

3. **Test Cases:**
   ```python
   # Executable test cases
   test_cases = [
       {
           "name": "simple_content",
           "input": {"topic": "AI"},
           "expected": {"length": (500, 2000), "quality": 0.7}
       }
   ]
   
   # Can be run
   for test in test_cases:
       result = run_test(test)
       assert evaluate(result, test["expected"])
   ```

### Teaching future agents how the system works

**Principle:** Design systems that can explain themselves to agents

**Components:**

1. **System Architecture Documentation:**
   - Agent roles and responsibilities
   - Data flow diagrams
   - Interface specifications
   - Decision points

2. **Operational Documentation:**
   - How to add new agents
   - How to modify workflows
   - How to debug issues
   - How to extend functionality

3. **Agent-Readable Format:**
   - Structured (JSON, YAML)
   - Clear and unambiguous
   - Version controlled
   - Accessible to agents

**Example:**
```python
# Agent-readable system spec
system_spec = {
    "version": "1.0",
    "agents": {
        "planner": {
            "role": "plan_workflows",
            "inputs": ["requirements"],
            "outputs": ["plan"],
            "tools": ["claude_code"],
            "constraints": ["max_planning_time: 60s"]
        },
        "executor": {
            "role": "execute_tasks",
            "inputs": ["plan"],
            "outputs": ["results"],
            "tools": ["code_blocks"],
            "constraints": ["max_execution_time: 300s"]
        }
    },
    "workflows": {
        "content_generation": {
            "steps": ["planner", "executor", "validator"],
            "error_handling": "retry_with_backoff"
        }
    }
}

# Agent can read and understand
def agent_understand_system(spec):
    prompt = f"""
    Understand this system specification:
    {spec}
    
    Explain:
    1. What agents exist and their roles
    2. How they coordinate
    3. What constraints exist
    """
    return claude_code.understand(prompt)
```

---

## 5.3 Final Build

### Claude Code plans the final system

**Exercise:** Design a complete production system

**Requirements:**
1. Multi-agent architecture
2. Evaluation and improvement loops
3. Error handling and fallbacks
4. Cost optimization
5. Production-ready reliability

**Planning Process:**

1. **Requirements Analysis:**
   - Define system goals
   - Identify constraints
   - Specify success criteria
   - Plan for scale

2. **Architecture Design:**
   - Agent types and roles
   - Orchestration patterns
   - Data flow
   - Error handling

3. **Implementation Plan:**
   - Claude Code prompts
   - Code block specifications
   - Interface definitions
   - Evaluation criteria

**Claude Code Output:**
- Complete system architecture
- Agent specifications
- Workflow definitions
- Evaluation framework
- Deployment plan

### Agents execute

**Implementation Steps:**

1. **Create Agent Prompts:**
   - Planner agent prompt
   - Executor agent prompts
   - Validator agent prompt
   - Any specialized agents

2. **Implement Code Blocks:**
   - Execution code blocks
   - Validation code blocks
   - Utility code blocks
   - Integration code blocks

3. **Wire Together:**
   - Implement orchestration
   - Set up handoffs
   - Configure error handling
   - Add logging

4. **Add Evaluation:**
   - Implement evaluation agents
   - Create test cases
   - Set up monitoring
   - Configure alerts

### You evaluate

**Evaluation Process:**

1. **Functional Testing:**
   - Test all workflows
   - Verify agent coordination
   - Check error handling
   - Validate outputs

2. **Performance Testing:**
   - Measure execution times
   - Check resource usage
   - Test under load
   - Identify bottlenecks

3. **Reliability Testing:**
   - Test failure scenarios
   - Verify fallbacks work
   - Check recovery mechanisms
   - Validate constraints

4. **Cost Analysis:**
   - Measure token usage
   - Calculate costs
   - Identify optimization opportunities
   - Compare to alternatives

---

## 5.4 Final Project

### A production-ready multi-agent system where:

#### Claude Code handles planning
- System architecture designed by Claude Code
- Workflows planned dynamically
- Decisions made with reasoning
- Adapts to changing requirements

#### Code blocks handle execution
- Fast, deterministic execution
- Low cost operations
- Reliable and testable
- Easy to optimize

#### Agents coordinate autonomously
- No human intervention needed
- Agents communicate via interfaces
- Handoffs work seamlessly
- System self-organizes

#### Evals prove it works
- Comprehensive evaluation framework
- Automated quality checks
- Performance monitoring
- Continuous improvement

**Project Requirements:**

1. **System Design:**
   - At least 3 different agent types
   - Clear orchestration pattern
   - Defined interfaces and contracts

2. **Implementation:**
   - Working multi-agent system
   - Claude Code for planning
   - Code blocks for execution
   - Evaluation framework

3. **Reliability:**
   - Error handling
   - Fallback strategies
   - Constraint enforcement
   - Human override capability

4. **Documentation:**
   - System architecture
   - Agent specifications
   - Evaluation criteria
   - Deployment guide

5. **Demonstration:**
   - End-to-end execution
   - Handles various inputs
   - Recovers from errors
   - Shows improvement over time

**Evaluation Criteria:**
- System completeness and functionality
- Agent coordination effectiveness
- Reliability and error handling
- Cost and performance optimization
- Documentation quality
- Evaluation framework effectiveness

---

## 5.5 What This Course Actually Teaches (The Real Promise)

### You will stop asking:

#### "How do I code this?"
**Old mindset:**
- Focus on implementation details
- Write code line by line
- Debug manually
- Optimize prematurely

**Problems:**
- Slow development
- Error-prone
- Hard to maintain
- Doesn't scale

### And start asking:

#### "How should this work be designed so agents can execute it?"
**New mindset:**
- Focus on work design
- Define what should happen
- Let agents handle how
- Design for execution

**Benefits:**
- Faster development
- More reliable
- Easier to maintain
- Scales with agents

**The Shift:**
- From **implementer** to **architect**
- From **coder** to **designer**
- From **debugger** to **evaluator**
- From **optimizer** to **orchestrator**

**Core Principles:**
1. **Design work, don't just code**
2. **Separate planning from execution**
3. **Use agents for what they're good at**
4. **Make systems that improve themselves**
5. **Build for reliability, not just functionality**

---

## Key Takeaways

1. **Code blocks are orders of magnitude cheaper than agent loops**
2. **Use Claude Code for thinking, code blocks for execution**
3. **Harden systems with isolation, circuit breakers, and fallbacks**
4. **Design human overrides for when things go wrong**
5. **Make documentation executable so agents can use it**
6. **The real skill is designing work for agents, not coding it yourself**

---

## Course Completion

Congratulations! You've learned how to:
- Design systems where Claude Code plans and code blocks execute
- Create multi-agent architectures with clear roles
- Build reliable systems with evaluation and improvement loops
- Deploy production-ready systems that work every time

**Next Steps:**
- Apply these principles to your own projects
- Experiment with different agent architectures
- Build evaluation frameworks for your systems
- Share your learnings with the community

**Remember:** The goal isn't to write code faster. It's to design work so code executes itself.
