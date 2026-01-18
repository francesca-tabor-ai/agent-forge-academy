---
title: "Module 4: Determinism, Replay, and Rerunnable Agent Evals"
description: "Making stochastic systems debuggable"
module: "4"
order: 4
email_takeaway: "Reproducibility for agents means capturing full trajectories, not just outputs. Golden traces enable debugging without re-running live systems."
email_action: "Think of a recent agent failure—could you replay it exactly? What would you need to capture?"
---

# Module 4: Determinism, Replay, and Rerunnable Agent Evals

**Duration:** Week 4  
**Learning Objectives:**
- **Capture Full**: Capture full agent trajectories
- **Replay Decisions**: Replay decisions with partial determinism
- **golden traces vs golden answers Understanding**: Understand golden traces vs golden answers
- **what "reproducible" means for agents Understanding**: Learn what "reproducible" means for agents
- **replay harnesses for debugging Development**: Build replay harnesses for debugging

---

## 4.1 Capturing Full Agent Trajectories

### What Is an Agent Trajectory?

**Definition:** Complete record of agent execution including:
- All inputs received
- All decisions made
- All tool calls
- All model interactions
- All state changes
- All outputs produced

### Trajectory Components

**Component 1: Input Sequence**
```python
trajectory = {
    "inputs": [
        {"timestamp": "2025-01-01T10:00:00Z", "type": "user_query", "content": "..."},
        {"timestamp": "2025-01-01T10:00:01Z", "type": "tool_response", "content": "..."}
    ]
}
```

**Component 2: Decision Points**
```python
trajectory["decisions"] = [
    {
        "timestamp": "2025-01-01T10:00:02Z",
        "agent": "research_agent",
        "decision": "call_search_tool",
        "reasoning": "...",
        "confidence": 0.85
    }
]
```

**Component 3: Tool Calls**
```python
trajectory["tool_calls"] = [
    {
        "timestamp": "2025-01-01T10:00:03Z",
        "tool": "search_api",
        "input": {...},
        "output": {...},
        "duration": 1.2,
        "cost": 0.05
    }
]
```

**Component 4: Model Interactions**
```python
trajectory["model_calls"] = [
    {
        "timestamp": "2025-01-01T10:00:04Z",
        "model": "gpt-4",
        "prompt": "...",
        "response": "...",
        "tokens": 150,
        "cost": 0.03
    }
]
```

**Component 5: State Changes**
```python
trajectory["state_changes"] = [
    {
        "timestamp": "2025-01-01T10:00:05Z",
        "before": {...},
        "after": {...},
        "trigger": "tool_response"
    }
]
```

### Capturing Trajectories

**Approach 1: Instrumentation**
```python
class TrajectoryRecorder:
    def __init__(self):
        self.trajectory = Trajectory()
    
    def record_input(self, input):
        self.trajectory.add_input(input)
    
    def record_decision(self, agent, decision, reasoning):
        self.trajectory.add_decision(agent, decision, reasoning)
    
    def record_tool_call(self, tool, input, output):
        self.trajectory.add_tool_call(tool, input, output)
    
    def record_model_call(self, model, prompt, response):
        self.trajectory.add_model_call(model, prompt, response)
    
    def record_state_change(self, before, after):
        self.trajectory.add_state_change(before, after)
```

**Approach 2: Decorators**
```python
@record_trajectory
def agent_execute(input):
    # Agent logic
    pass
```

**Approach 3: Middleware**
```python
class TrajectoryMiddleware:
    def __call__(self, agent, input):
        trajectory = Trajectory()
        result = agent.execute(input, trajectory_recorder=trajectory)
        trajectory.save()
        return result
```

---

## 4.2 Replaying Decisions with Partial Determinism

### The Determinism Challenge

**Fully Deterministic:**
```
Same Input + Same State → Same Output (always)
```

**Partially Deterministic:**
```
Same Input + Same State + Same Random Seed → Same Output
```

**Non-Deterministic:**
```
Same Input + Same State → Different Output (unpredictable)
```

### Partial Determinism Strategies

**Strategy 1: Random Seed Control**
```python
def replay_with_seed(trajectory, seed):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    
    # Replay trajectory
    return replay(trajectory)
```

**Strategy 2: Model Temperature Control**
```python
def replay_with_temperature(trajectory, temperature=0):
    # Temperature 0 = deterministic
    model.set_temperature(temperature)
    
    # Replay trajectory
    return replay(trajectory)
```

**Strategy 3: Cached Model Responses**
```python
def replay_with_cache(trajectory, cache):
    # Use cached model responses instead of calling model
    for model_call in trajectory.model_calls:
        if model_call in cache:
            use_cached_response(cache[model_call])
        else:
            call_model_and_cache(model_call)
```

**Strategy 4: Deterministic Tool Responses**
```python
def replay_with_mocked_tools(trajectory):
    # Use recorded tool responses instead of calling tools
    for tool_call in trajectory.tool_calls:
        use_recorded_response(tool_call.output)
```

### Replay Implementation

**Basic Replay:**
```python
def replay_trajectory(trajectory):
    state = initial_state()
    
    for event in trajectory.events:
        if event.type == "input":
            state = process_input(state, event.content)
        elif event.type == "decision":
            state = apply_decision(state, event.decision)
        elif event.type == "tool_call":
            state = apply_tool_result(state, event.output)
        elif event.type == "model_call":
            state = apply_model_response(state, event.response)
    
    return state
```

**Deterministic Replay:**
```python
def replay_deterministically(trajectory, seed=None):
    if seed:
        set_all_seeds(seed)
    
    # Mock external dependencies
    mock_tools(trajectory.tool_calls)
    mock_models(trajectory.model_calls)
    
    # Replay with mocked dependencies
    return replay_trajectory(trajectory)
```

---

## 4.3 Golden Traces vs Golden Answers

### Golden Answers (Traditional Testing)

**Pattern:**
```python
def test_agent():
    input = "What is 2+2?"
    output = agent.execute(input)
    assert output == "4"  # Golden answer
```

**Problems:**
- Brittle (fails on harmless variation)
- Doesn't test reasoning
- Doesn't catch silent failures
- Hard to debug when it fails

### Golden Traces (Agent Testing)

**Pattern:**
```python
def test_agent_trajectory():
    input = "What is 2+2?"
    trajectory = agent.execute_with_trajectory(input)
    
    # Check reasoning, not just answer
    assert trajectory.has_decision("calculate")
    assert trajectory.tool_calls[0].tool == "calculator"
    assert trajectory.decisions[0].reasoning.contains("addition")
    assert trajectory.output == "4"
```

**Benefits:**
- Tests reasoning process
- Catches silent failures
- Easier to debug
- More robust to harmless variation

### What Makes a Golden Trace?

**Property 1: Complete**
- Captures all decisions
- Captures all tool calls
- Captures all state changes

**Property 2: Reproducible**
- Can be replayed exactly
- Deterministic replay possible
- Same inputs produce same trace

**Property 3: Validatable**
- Can check reasoning quality
- Can check decision correctness
- Can check tool usage

**Property 4: Comparable**
- Can compare traces
- Can detect drift
- Can measure changes

### Building Golden Traces

**Step 1: Capture Production Traces**
```python
# In production
trajectory = agent.execute_with_trajectory(input)
trajectory.save_as_golden("test_case_1")
```

**Step 2: Validate Traces**
```python
# Validate trace quality
assert trajectory.is_complete()
assert trajectory.is_reproducible()
assert trajectory.reasoning_quality > threshold
```

**Step 3: Use in Testing**
```python
# In tests
golden_trace = load_golden_trace("test_case_1")
current_trace = agent.execute_with_trajectory(golden_trace.input)

# Compare traces
differences = compare_traces(golden_trace, current_trace)
assert differences.reasoning_similarity > 0.9
assert differences.decision_consistency > 0.95
```

---

## 4.4 What "Reproducible" Means for Agents

### Traditional Reproducibility

**Definition:** Same code + same input → same output

**Requirements:**
- Deterministic algorithms
- Fixed random seeds
- No external dependencies
- No time-based behavior

### Agent Reproducibility

**Challenge:** Agents are non-deterministic by nature

**Solution:** Reproducibility means:
- Same trajectory (not necessarily same output)
- Same reasoning process
- Same decision sequence
- Same tool usage

### Levels of Reproducibility

**Level 1: Output Reproducibility**
```
Same Input → Same Output
```
- Hardest to achieve
- Often not necessary
- Brittle to harmless changes

**Level 2: Trajectory Reproducibility**
```
Same Input → Same Trajectory
```
- More achievable
- More useful for debugging
- Tests reasoning process

**Level 3: Decision Reproducibility**
```
Same Input → Same Decisions
```
- Most achievable
- Most useful for validation
- Focuses on correctness

### Reproducibility Strategies

**Strategy 1: Deterministic Replay**
```python
# Use seeds and mocks
replay_deterministically(trajectory, seed=42)
```

**Strategy 2: Trajectory Comparison**
```python
# Compare trajectories, not outputs
compare_trajectories(trace1, trace2)
```

**Strategy 3: Decision Validation**
```python
# Validate decisions, not outputs
validate_decisions(trajectory)
```

---

## 4.5 Building Replay Harnesses

### Replay Harness Components

**Component 1: Trajectory Storage**
```python
class TrajectoryStorage:
    def save(self, trajectory, name):
        # Save trajectory to storage
        pass
    
    def load(self, name):
        # Load trajectory from storage
        pass
    
    def list(self):
        # List all saved trajectories
        pass
```

**Component 2: Replay Engine**
```python
class ReplayEngine:
    def replay(self, trajectory, mode="deterministic"):
        # Replay trajectory
        pass
    
    def compare(self, trace1, trace2):
        # Compare two traces
        pass
    
    def validate(self, trajectory):
        # Validate trajectory
        pass
```

**Component 3: Debugging Tools**
```python
class DebuggingTools:
    def visualize_trajectory(self, trajectory):
        # Visualize trajectory
        pass
    
    def highlight_differences(self, trace1, trace2):
        # Highlight differences
        pass
    
    def trace_decision(self, trajectory, decision_id):
        # Trace specific decision
        pass
```

### Complete Replay Harness

```python
class AgentReplayHarness:
    def __init__(self):
        self.storage = TrajectoryStorage()
        self.engine = ReplayEngine()
        self.debugger = DebuggingTools()
    
    def capture(self, agent, input, name):
        trajectory = agent.execute_with_trajectory(input)
        self.storage.save(trajectory, name)
        return trajectory
    
    def replay(self, name, mode="deterministic"):
        trajectory = self.storage.load(name)
        return self.engine.replay(trajectory, mode)
    
    def debug(self, name):
        trajectory = self.storage.load(name)
        self.debugger.visualize_trajectory(trajectory)
    
    def compare(self, name1, name2):
        trace1 = self.storage.load(name1)
        trace2 = self.storage.load(name2)
        return self.engine.compare(trace1, trace2)
```

---

## 4.6 Key Takeaways

**Full Trajectory Capture:**
- Record all inputs, decisions, tool calls, model interactions, state changes
- Use instrumentation, decorators, or middleware
- Trajectories enable debugging and replay

**Partial Determinism:**
- Use random seeds, temperature control, cached responses
- Mock external dependencies for deterministic replay
- Focus on trajectory reproducibility, not output reproducibility

**Golden Traces:**
- Test reasoning process, not just outputs
- More robust than golden answers
- Enable better debugging and validation

**Reproducibility for Agents:**
- Means same trajectory, not same output
- Focus on decision reproducibility
- Use trajectory comparison for validation

**Replay Harnesses:**
- Store, replay, compare, and debug trajectories
- Essential for debugging production failures
- Enable testing without re-running live systems

---

## Practical Work: Building a Replay Harness That Reproduces a Real Production Failure

**Objective:** Build a replay system that can reproduce and debug production failures

**Requirements:**
1. Capture a production failure trajectory
2. Build trajectory storage
3. Implement replay engine
4. Add debugging tools
5. Reproduce the failure
6. Debug and fix the issue

**Deliverables:**
- Trajectory capture implementation
- Replay engine
- Debugging tools
- Reproduced failure analysis
- Fix implementation

**Evaluation Criteria:**
- Quality of trajectory capture (25%)
- Replay engine functionality (25%)
- Debugging tools (25%)
- Failure reproduction and fix (25%)

**Time Estimate:** 5-6 hours

---

## Additional Resources

**Readings:**
- "Reproducibility in Machine Learning"
- "Debugging Non-Deterministic Systems"
- "Trajectory-Based Testing"

**Tools to Explore:**
- Trajectory recording libraries
- Replay frameworks
- Debugging visualization tools

**Next Module Preview:**
Module 5 will teach you how to write evaluations that detect drift, not just accuracy.

---

**Module 4 Complete**   
**Next:** Module 5 - Evaluation That Detects Drift, Not Just Accuracy
