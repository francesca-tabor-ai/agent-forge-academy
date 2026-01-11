---
title: "Module 3: Tool Contracts, Capability Drift, and Defensive Execution"
description: "Surviving tool and integration changes"
module: "3"
order: 3
email_takeaway: "Tools are unstable dependencies. Use schemas, invariants, and execution budgets to survive tool changes without crashing or retry storms."
email_action: "List one tool your agent uses—what would break if its API changed tomorrow? How would you detect it?"
---

# Module 3: Tool Contracts, Capability Drift, and Defensive Execution

**Duration:** Week 3  
**Learning Objectives:**
- Understand tools as unstable dependencies
- Design tool contracts with schemas and invariants
- Implement capability probing vs optimistic calls
- Build graceful degradation strategies
- Recover from tool failures without crashing or retry storms

---

## 3.1 Tools as Unstable Dependencies

### The Tool Dependency Problem

**Traditional Dependencies:**
```
Library v1.0 → Stable API → Predictable behavior
```

**Tool Dependencies:**
```
API v1.0 → Changes without notice → Unpredictable behavior
```

### Why Tools Are Unstable

**Reason 1: External Services**
- APIs change without notice
- Rate limits change
- Pricing changes
- Service deprecations

**Reason 2: Version Drift**
```
Your code expects: API v1.0
Service provides: API v1.2 (breaking changes)
Result: Silent failures or errors
```

**Reason 3: Capability Changes**
```
Tool used to: Return structured data
Tool now: Returns different format
Result: Parsing failures
```

**Reason 4: Availability Issues**
```
Tool used to: 99.9% uptime
Tool now: 95% uptime (downgrade)
Result: Frequent failures
```

### The Cost of Tool Instability

**Direct Costs:**
- Retry storms (10x cost)
- Failed requests (wasted tokens)
- Human intervention

**Indirect Costs:**
- User trust degradation
- System reliability issues
- Development time fixing issues

---

## 3.2 Tool Contracts: Schemas, Invariants, and Execution Budgets

### What Is a Tool Contract?

**Definition:** An explicit agreement between agent and tool about:
- Input format
- Output format
- Behavior guarantees
- Failure modes
- Performance characteristics

### Schema Contracts

**Example: Search Tool Contract**
```python
class SearchToolContract:
    input_schema = {
        "query": str,
        "max_results": int (1-10),
        "filters": dict (optional)
    }
    
    output_schema = {
        "results": list[{
            "title": str,
            "url": str,
            "snippet": str
        }],
        "total": int,
        "query_time": float
    }
    
    invariants = [
        "len(results) <= max_results",
        "total >= len(results)",
        "query_time < 5.0"
    ]
```

### Invariant Contracts

**Definition:** Properties that must always be true

**Example Invariants:**
```python
invariants = [
    "Response time < 5 seconds",
    "Results are non-empty or error returned",
    "URLs are valid",
    "No duplicate results"
]
```

### Execution Budget Contracts

**Definition:** Limits on tool execution

**Example Budget:**
```python
class ExecutionBudget:
    max_time = 5.0  # seconds
    max_cost = 0.10  # dollars
    max_retries = 3
    max_concurrent = 5
```

### Contract Validation

**Input Validation:**
```python
def validate_input(input, contract):
    schema.validate(input, contract.input_schema)
    assert all(invariant.check(input) for invariant in contract.invariants)
```

**Output Validation:**
```python
def validate_output(output, contract):
    schema.validate(output, contract.output_schema)
    assert all(invariant.check(output) for invariant in contract.invariants)
    assert output.within_budget(contract.budget)
```

---

## 3.3 Capability Probing vs Optimistic Calls

### Optimistic Calls (Default Approach)

**Pattern:**
```python
def call_tool(tool, input):
    try:
        result = tool.execute(input)
        return result
    except Exception as e:
        # Handle failure
        return None
```

**Problems:**
- Assumes tool works
- Discovers failures at runtime
- No early warning
- Wastes resources on failed calls

### Capability Probing

**Pattern:**
```python
def call_tool_with_probe(tool, input):
    # Probe tool capability first
    if not tool.probe_capability(input):
        return graceful_degradation(input)
    
    # Tool can handle this, proceed
    try:
        result = tool.execute(input)
        return result
    except Exception as e:
        return graceful_degradation(input)
```

**Benefits:**
- Early failure detection
- Avoids wasted calls
- Enables graceful degradation
- Better user experience

### Probe Strategies

**Strategy 1: Health Check**
```python
def probe_health(tool):
    return tool.health_check() == "healthy"
```

**Strategy 2: Capability Check**
```python
def probe_capability(tool, input):
    return tool.supports(input.type)
```

**Strategy 3: Schema Check**
```python
def probe_schema(tool, input):
    return tool.input_schema.matches(input)
```

**Strategy 4: Budget Check**
```python
def probe_budget(tool, input):
    estimated_cost = tool.estimate_cost(input)
    return estimated_cost < remaining_budget
```

### When to Probe vs Optimize

**Use Probing When:**
- Tool is unreliable
- Cost of failure is high
- Tool has known limitations
- Budget is tight

**Use Optimistic Calls When:**
- Tool is highly reliable
- Cost of probing > cost of failure
- Tool has no known limitations
- Budget is not a concern

---

## 3.4 Graceful Degradation Strategies

### Strategy 1: Fallback Tools

**Pattern:**
```python
def call_tool_with_fallback(primary_tool, fallback_tool, input):
    try:
        return primary_tool.execute(input)
    except PrimaryToolFailure:
        return fallback_tool.execute(input)
```

**Example:**
```python
# Try Google Search, fallback to Bing
try:
    results = google_search(query)
except GoogleSearchFailure:
    results = bing_search(query)
```

### Strategy 2: Reduced Functionality

**Pattern:**
```python
def call_tool_gracefully(tool, input):
    try:
        return tool.execute_full(input)
    except ToolFailure:
        return tool.execute_basic(input)  # Reduced functionality
```

**Example:**
```python
# Try full analysis, fallback to simple summary
try:
    result = tool.full_analysis(data)
except AnalysisFailure:
    result = tool.simple_summary(data)
```

### Strategy 3: Cached Results

**Pattern:**
```python
def call_tool_with_cache(tool, input):
    # Check cache first
    cached = cache.get(input)
    if cached:
        return cached
    
    try:
        result = tool.execute(input)
        cache.set(input, result)
        return result
    except ToolFailure:
        # Return stale cache if available
        return cache.get_stale(input)
```

### Strategy 4: Human Escalation

**Pattern:**
```python
def call_tool_with_escalation(tool, input):
    try:
        return tool.execute(input)
    except ToolFailure:
        if is_critical(input):
            return escalate_to_human(input)
        else:
            return graceful_degradation(input)
```

### Strategy 5: Partial Results

**Pattern:**
```python
def call_tool_partially(tool, input):
    try:
        return tool.execute(input)
    except PartialFailure as e:
        # Return partial results
        return e.partial_results
```

---

## 3.5 Recovering from Tool Failures

### Failure Detection

**Type 1: Immediate Failure**
```python
try:
    result = tool.execute(input)
except ToolException as e:
    # Immediate failure detected
    handle_failure(e)
```

**Type 2: Silent Failure**
```python
result = tool.execute(input)
if not validate_result(result):
    # Silent failure detected
    handle_failure(SilentFailure(result))
```

**Type 3: Degraded Performance**
```python
start_time = time.time()
result = tool.execute(input)
duration = time.time() - start_time

if duration > threshold:
    # Performance degradation detected
    handle_degradation(duration)
```

### Recovery Mechanisms

**Mechanism 1: Automatic Retry (with limits)**
```python
def execute_with_retry(tool, input, max_retries=3):
    for attempt in range(max_retries):
        try:
            return tool.execute(input)
        except RetryableError:
            if attempt < max_retries - 1:
                wait_exponential_backoff(attempt)
                continue
            else:
                raise MaxRetriesExceeded()
```

**Mechanism 2: Circuit Breaker**
```python
class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60):
        self.failures = 0
        self.threshold = failure_threshold
        self.timeout = timeout
        self.opened_at = None
    
    def call(self, tool, input):
        if self.is_open():
            if time.time() - self.opened_at > self.timeout:
                self.reset()
            else:
                raise CircuitBreakerOpen()
        
        try:
            result = tool.execute(input)
            self.on_success()
            return result
        except Exception as e:
            self.on_failure()
            raise
```

**Mechanism 3: Graceful Degradation**
```python
def execute_with_degradation(tool, input):
    strategies = [
        lambda: tool.execute_full(input),
        lambda: tool.execute_basic(input),
        lambda: tool.execute_minimal(input),
        lambda: escalate_to_human(input)
    ]
    
    for strategy in strategies:
        try:
            return strategy()
        except Exception:
            continue
    
    raise AllStrategiesFailed()
```

---

## 3.6 Key Takeaways

**Tools Are Unstable:**
- External services change
- APIs evolve
- Capabilities drift
- Availability fluctuates

**Tool Contracts:**
- Define schemas for inputs/outputs
- Specify invariants
- Set execution budgets
- Validate contracts

**Capability Probing:**
- Check tool capability before calling
- Avoid wasted calls
- Enable early failure detection
- Use when cost of failure is high

**Graceful Degradation:**
- Fallback tools
- Reduced functionality
- Cached results
- Human escalation
- Partial results

**Recovery Mechanisms:**
- Automatic retry (with limits)
- Circuit breakers
- Graceful degradation chains
- Never retry indefinitely

---

## Practical Work: Breaking a Tool Interface Mid-Execution

**Objective:** Force the agent to recover without crashing, retry storms, or hallucinated success

**Requirements:**
1. Set up an agent that uses a tool
2. Break the tool interface mid-execution (change API, add breaking change)
3. Implement tool contracts
4. Add capability probing
5. Implement graceful degradation
6. Test recovery without retry storms

**Deliverables:**
- Tool contract definition
- Capability probing implementation
- Graceful degradation strategy
- Recovery mechanism
- Test results showing recovery

**Evaluation Criteria:**
- Quality of tool contracts (25%)
- Capability probing implementation (25%)
- Graceful degradation (25%)
- Recovery without retry storms (25%)

**Time Estimate:** 4-5 hours

---

## Additional Resources

**Readings:**
- "Designing Resilient API Integrations"
- "Circuit Breaker Pattern"
- "Graceful Degradation Strategies"

**Tools to Explore:**
- API contract testing tools
- Circuit breaker libraries
- Retry mechanism frameworks

**Next Module Preview:**
Module 4 will teach you how to make stochastic systems debuggable through determinism, replay, and rerunnable evals.

---

**Module 3 Complete**   
**Next:** Module 4 - Determinism, Replay, and Rerunnable Agent Evals
