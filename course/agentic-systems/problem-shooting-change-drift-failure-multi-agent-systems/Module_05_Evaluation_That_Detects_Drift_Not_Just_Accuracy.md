---
title: "Module 5: Evaluation That Detects Drift, Not Just Accuracy"
description: "Measuring what actually matters"
module: "5"
order: 5
email_takeaway: "Outcome evaluation misses drift. Process and trajectory evaluation catch subtle reasoning regressions before they become accuracy problems."
email_action: "Review your current evals—do they test reasoning quality or just final answers? What would catch a 5% reasoning degradation?"
---

# Module 5: Evaluation That Detects Drift, Not Just Accuracy

**Duration:** Week 5  
**Learning Objectives:**
- **outcome vs process vs trajectory evaluation Understanding**: Understand outcome vs process vs trajectory evaluation
- **partial credit and degradation curves Understanding**: Learn partial credit and degradation curves
- **regression testing for planning quality Implementation**: Implement regression testing for planning quality
- **eval sets that evolve with the Development**: Build eval sets that evolve with the system
- **Write Evals**: Write evals that catch subtle reasoning regressions

---

## 5.1 Outcome vs Process vs Trajectory Evaluation

### Outcome Evaluation (Traditional)

**Definition:** Evaluate based on final output only

**Example:**
```python
def evaluate_outcome(agent, input, expected_output):
    actual_output = agent.execute(input)
    return actual_output == expected_output
```

**Limitations:**
- Misses reasoning quality
- Doesn't catch silent failures
- Brittle to harmless variation
- Can't detect drift early

**When It Fails:**
```
Week 1: Output "4" (correct, good reasoning)
Week 2: Output "4" (correct, worse reasoning) ← Missed!
Week 3: Output "4" (correct, bad reasoning) ← Still missed!
Week 4: Output "5" (wrong, bad reasoning) ← Now caught, too late
```

### Process Evaluation

**Definition:** Evaluate based on reasoning process

**Example:**
```python
def evaluate_process(agent, input, expected_process):
    trajectory = agent.execute_with_trajectory(input)
    
    # Check reasoning steps
    assert trajectory.has_step("analyze")
    assert trajectory.has_step("calculate")
    assert trajectory.reasoning_quality > 0.8
    
    return trajectory.matches_process(expected_process)
```

**Benefits:**
- Catches reasoning quality issues
- Detects drift in process
- More robust to output variation
- Catches problems earlier

**What It Catches:**
```
Week 1: Good reasoning → Process score: 0.95
Week 2: Worse reasoning → Process score: 0.88 ← Caught!
Week 3: Bad reasoning → Process score: 0.75 ← Caught!
Week 4: Wrong output → Process score: 0.60 ← Caught!
```

### Trajectory Evaluation

**Definition:** Evaluate based on complete execution trajectory

**Example:**
```python
def evaluate_trajectory(agent, input, golden_trajectory):
    trajectory = agent.execute_with_trajectory(input)
    
    # Compare trajectories
    similarity = compare_trajectories(trajectory, golden_trajectory)
    
    # Check decision quality
    decision_quality = evaluate_decisions(trajectory)
    
    # Check tool usage
    tool_quality = evaluate_tool_usage(trajectory)
    
    return {
        "trajectory_similarity": similarity,
        "decision_quality": decision_quality,
        "tool_quality": tool_quality
    }
```

**Benefits:**
- Most comprehensive evaluation
- Catches all types of drift
- Enables detailed debugging
- Best for regression testing

---

## 5.2 Partial Credit and Degradation Curves

### The Binary Evaluation Problem

**Traditional Binary Evaluation:**
```python
def evaluate_binary(agent, input, expected):
    output = agent.execute(input)
    return 1.0 if output == expected else 0.0
```

**Problems:**
- No partial credit
- Can't measure degradation
- All failures treated equally
- No gradient information

### Partial Credit Evaluation

**Approach 1: Semantic Similarity**
```python
def evaluate_semantic(agent, input, expected):
    output = agent.execute(input)
    similarity = semantic_similarity(output, expected)
    return similarity  # 0.0 to 1.0
```

**Approach 2: Multi-Criteria Scoring**
```python
def evaluate_multi_criteria(agent, input, criteria):
    output = agent.execute(input)
    
    scores = {
        "correctness": check_correctness(output, criteria.expected),
        "completeness": check_completeness(output, criteria.required),
        "format": check_format(output, criteria.format),
        "reasoning": check_reasoning(output, criteria.reasoning)
    }
    
    return weighted_average(scores)
```

**Approach 3: Distance Metrics**
```python
def evaluate_distance(agent, input, expected):
    output = agent.execute(input)
    
    # Multiple distance metrics
    edit_distance = levenshtein_distance(output, expected)
    semantic_distance = embedding_distance(output, expected)
    structural_distance = parse_tree_distance(output, expected)
    
    # Combine into score
    return 1.0 / (1.0 + normalized_distance)
```

### Degradation Curves

**Definition:** Track evaluation scores over time

**Example:**
```python
class DegradationTracker:
    def __init__(self):
        self.scores = []
        self.timestamps = []
    
    def record_score(self, score, timestamp):
        self.scores.append(score)
        self.timestamps.append(timestamp)
    
    def detect_degradation(self, threshold=0.05):
        if len(self.scores) < 2:
            return False
        
        recent_avg = np.mean(self.scores[-7:])  # Last week
        baseline_avg = np.mean(self.scores[:-7])  # Previous period
        
        degradation = baseline_avg - recent_avg
        return degradation > threshold
    
    def plot_curve(self):
        plt.plot(self.timestamps, self.scores)
        plt.axhline(y=baseline, color='r', linestyle='--', label='Baseline')
        plt.show()
```

**Using Degradation Curves:**
```python
# Track scores over time
tracker = DegradationTracker()

for week in range(12):
    score = evaluate_agent(agent, test_set)
    tracker.record_score(score, week)
    
    if tracker.detect_degradation(threshold=0.05):
        alert("Agent degradation detected!")
```

---

## 5.3 Regression Testing for Planning Quality

### What Is Planning Quality?

**Definition:** Quality of agent's planning and decision-making process

**Components:**
- Goal identification
- Step sequencing
- Resource allocation
- Risk assessment
- Contingency planning

### Planning Quality Metrics

**Metric 1: Step Completeness**
```python
def evaluate_step_completeness(trajectory, required_steps):
    actual_steps = trajectory.get_steps()
    missing_steps = set(required_steps) - set(actual_steps)
    completeness = 1.0 - (len(missing_steps) / len(required_steps))
    return completeness
```

**Metric 2: Step Ordering**
```python
def evaluate_step_ordering(trajectory, expected_order):
    actual_order = trajectory.get_step_order()
    ordering_score = sequence_similarity(actual_order, expected_order)
    return ordering_score
```

**Metric 3: Resource Efficiency**
```python
def evaluate_resource_efficiency(trajectory):
    tool_calls = trajectory.get_tool_calls()
    cost = sum(call.cost for call in tool_calls)
    time = trajectory.total_duration
    
    # Compare to baseline
    efficiency = baseline_cost / cost
    return efficiency
```

**Metric 4: Risk Assessment**
```python
def evaluate_risk_assessment(trajectory):
    decisions = trajectory.get_decisions()
    risk_scores = [d.risk_score for d in decisions]
    
    # Check if high-risk decisions have proper safeguards
    high_risk_decisions = [d for d in decisions if d.risk_score > 0.7]
    safeguards = [d.has_safeguard() for d in high_risk_decisions]
    
    return sum(safeguards) / len(high_risk_decisions) if high_risk_decisions else 1.0
```

### Regression Testing

**Test Structure:**
```python
class PlanningQualityRegressionTest:
    def __init__(self):
        self.baseline_trajectories = {}
        self.current_trajectories = {}
    
    def establish_baseline(self, test_cases):
        for case in test_cases:
            trajectory = agent.execute_with_trajectory(case.input)
            self.baseline_trajectories[case.name] = trajectory
    
    def run_regression(self, test_cases):
        results = []
        for case in test_cases:
            trajectory = agent.execute_with_trajectory(case.input)
            baseline = self.baseline_trajectories[case.name]
            
            # Compare planning quality
            quality_score = compare_planning_quality(trajectory, baseline)
            results.append({
                "case": case.name,
                "quality_score": quality_score,
                "regression": quality_score < 0.95
            })
        
        return results
```

---

## 5.4 Eval Sets That Evolve with the System

### Static Eval Sets (Problem)

**Traditional Approach:**
```python
# Fixed eval set
EVAL_SET = [
    TestCase("What is 2+2?", "4"),
    TestCase("What is the capital of France?", "Paris"),
    # ... fixed set
]
```

**Problems:**
- Doesn't adapt to system changes
- Becomes outdated
- Misses new failure modes
- Doesn't reflect production distribution

### Dynamic Eval Sets

**Approach 1: Production Sampling**
```python
class ProductionSampledEvalSet:
    def __init__(self, production_logs):
        self.logs = production_logs
    
    def sample_eval_cases(self, n=100):
        # Sample from production
        cases = random.sample(self.logs, n)
        return [TestCase(log.input, log.expected_output) for log in cases]
    
    def update_weekly(self):
        # Refresh with recent production data
        recent_logs = self.get_recent_logs(days=7)
        self.logs.extend(recent_logs)
```

**Approach 2: Adversarial Generation**
```python
class AdversarialEvalSet:
    def generate_hard_cases(self, agent, base_cases):
        hard_cases = []
        for case in base_cases:
            # Generate variations that might break agent
            variations = self.generate_variations(case)
            for variation in variations:
                if agent.fails_on(variation):
                    hard_cases.append(variation)
        return hard_cases
```

**Approach 3: Failure-Mode Focused**
```python
class FailureModeEvalSet:
    def __init__(self):
        self.failure_modes = []
    
    def add_failure_mode(self, mode, test_cases):
        self.failure_modes.append({
            "mode": mode,
            "cases": test_cases
        })
    
    def get_eval_set(self):
        # Include cases for each known failure mode
        cases = []
        for mode in self.failure_modes:
            cases.extend(mode["cases"])
        return cases
```

**Approach 4: Adaptive Difficulty**
```python
class AdaptiveEvalSet:
    def __init__(self):
        self.easy_cases = []
        self.medium_cases = []
        self.hard_cases = []
    
    def adapt_difficulty(self, agent_performance):
        if agent_performance > 0.95:
            # Agent is doing well, add harder cases
            self.add_hard_cases()
        elif agent_performance < 0.80:
            # Agent struggling, focus on easier cases
            return self.easy_cases + self.medium_cases
        else:
            return self.get_balanced_set()
```

---

## 5.5 Writing Evals That Catch Subtle Reasoning Regressions

### What Are Subtle Reasoning Regressions?

**Definition:** Degradation in reasoning quality that doesn't immediately affect output correctness

**Example:**
```
Week 1: "To calculate 2+2, I'll add the numbers: 2 + 2 = 4"
Week 2: "2+2 is 4" (less reasoning, but still correct)
Week 3: "4" (no reasoning, but still correct)
Week 4: "5" (wrong, and no reasoning)
```

### Catching Subtle Regressions

**Technique 1: Reasoning Depth Analysis**
```python
def evaluate_reasoning_depth(trajectory):
    reasoning_steps = trajectory.get_reasoning_steps()
    depth = len(reasoning_steps)
    
    # Check reasoning quality
    quality_scores = [step.quality for step in reasoning_steps]
    avg_quality = np.mean(quality_scores)
    
    return {
        "depth": depth,
        "quality": avg_quality,
        "regression": depth < baseline_depth or avg_quality < baseline_quality
    }
```

**Technique 2: Decision Confidence Tracking**
```python
def evaluate_decision_confidence(trajectory):
    decisions = trajectory.get_decisions()
    confidences = [d.confidence for d in decisions]
    
    # Check for overconfidence or underconfidence
    avg_confidence = np.mean(confidences)
    confidence_variance = np.var(confidences)
    
    # Regression if confidence pattern changes
    regression = abs(avg_confidence - baseline_confidence) > 0.1
    return regression
```

**Technique 3: Tool Usage Patterns**
```python
def evaluate_tool_usage_patterns(trajectory):
    tool_calls = trajectory.get_tool_calls()
    tool_usage = {}
    
    for call in tool_calls:
        tool_usage[call.tool] = tool_usage.get(call.tool, 0) + 1
    
    # Check for unusual tool usage
    baseline_usage = get_baseline_tool_usage()
    regression = detect_usage_anomaly(tool_usage, baseline_usage)
    
    return regression
```

**Technique 4: Error Recovery Patterns**
```python
def evaluate_error_recovery(trajectory):
    errors = trajectory.get_errors()
    recoveries = trajectory.get_recoveries()
    
    # Check recovery quality
    recovery_quality = []
    for error, recovery in zip(errors, recoveries):
        quality = assess_recovery_quality(error, recovery)
        recovery_quality.append(quality)
    
    avg_recovery_quality = np.mean(recovery_quality)
    regression = avg_recovery_quality < baseline_recovery_quality
    
    return regression
```

### Comprehensive Regression Detection

```python
class SubtleRegressionDetector:
    def __init__(self):
        self.baselines = {}
    
    def establish_baseline(self, trajectories):
        self.baselines = {
            "reasoning_depth": np.mean([t.reasoning_depth() for t in trajectories]),
            "decision_confidence": np.mean([t.avg_confidence() for t in trajectories]),
            "tool_usage": self.compute_tool_usage_baseline(trajectories),
            "recovery_quality": np.mean([t.recovery_quality() for t in trajectories])
        }
    
    def detect_regression(self, trajectory):
        regressions = []
        
        # Check each metric
        if trajectory.reasoning_depth() < self.baselines["reasoning_depth"] * 0.9:
            regressions.append("reasoning_depth")
        
        if abs(trajectory.avg_confidence() - self.baselines["decision_confidence"]) > 0.1:
            regressions.append("decision_confidence")
        
        if self.detect_tool_usage_anomaly(trajectory):
            regressions.append("tool_usage")
        
        if trajectory.recovery_quality() < self.baselines["recovery_quality"] * 0.9:
            regressions.append("recovery_quality")
        
        return regressions
```

---

## 5.6 Key Takeaways

**Evaluation Types:**
- Outcome: Tests final output (limited)
- Process: Tests reasoning process (better)
- Trajectory: Tests complete execution (best)

**Partial Credit:**
- Use semantic similarity, multi-criteria, distance metrics
- Track degradation curves over time
- Detect drift before it becomes accuracy problems

**Planning Quality:**
- Test step completeness, ordering, resource efficiency
- Use regression testing to catch quality degradation
- Compare to baseline trajectories

**Evolving Eval Sets:**
- Sample from production
- Generate adversarial cases
- Focus on failure modes
- Adapt difficulty based on performance

**Subtle Regression Detection:**
- Analyze reasoning depth
- Track decision confidence
- Monitor tool usage patterns
- Evaluate error recovery
- Use comprehensive detectors

---

## Practical Work: Writing Evals That Catch Subtle Reasoning Regressions

**Objective:** Build evaluation system that detects reasoning quality degradation

**Requirements:**
1. Implement process and trajectory evaluation
2. Add partial credit scoring
3. Build degradation curve tracking
4. Create regression tests for planning quality
5. Write detectors for subtle reasoning regressions
6. Test on real agent system

**Deliverables:**
- Evaluation implementation
- Partial credit system
- Degradation tracking
- Regression test suite
- Subtle regression detector
- Test results

**Evaluation Criteria:**
- Quality of evaluation types (20%)
- Partial credit implementation (20%)
- Degradation tracking (20%)
- Regression tests (20%)
- Subtle regression detection (20%)

**Time Estimate:** 5-6 hours

---

## Additional Resources

**Readings:**
- "Beyond Accuracy: Evaluating Reasoning Quality"
- "Regression Testing for AI Systems"
- "Dynamic Evaluation Sets"

**Tools to Explore:**
- Evaluation frameworks
- Semantic similarity libraries
- Regression testing tools

**Next Module Preview:**
Module 6 will teach you how to handle multi-agent coordination under conflict and uncertainty.

---

**Module 5 Complete**   
**Next:** Module 6 - Multi-Agent Coordination Under Conflict and Uncertainty
