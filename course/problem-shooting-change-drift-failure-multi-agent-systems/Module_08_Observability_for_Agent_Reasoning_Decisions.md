---
title: "Module 8: Observability for Agent Reasoning and Decisions"
description: "Seeing what the system thought, not just what it did"
module: "8"
order: 8
email_takeaway: "Decision traces reveal causal chains in failures. Build alerts on reasoning patterns, not just outputs, to detect behavioral drift early."
email_action: "What reasoning patterns would indicate your agent is degrading? How would you detect them?"
---

# Module 8: Observability for Agent Reasoning and Decisions

**Duration:** Week 8  
**Learning Objectives:**
- Understand decision traces vs logs
- Trace causal chains in multi-agent failures
- Attribute costs per decision
- Detect behavioral drift early
- Build alerts on reasoning patterns

---

## 8.1 Decision Traces vs Logs

### Traditional Logs

**What They Capture:**
- Timestamps
- Error messages
- Performance metrics
- System events

**Limitations:**
- Don't capture reasoning
- Don't show decision process
- Don't reveal causal chains
- Hard to debug agent failures

**Example:**
```
[2025-01-01 10:00:00] ERROR: Agent failed
[2025-01-01 10:00:01] INFO: Retrying...
[2025-01-01 10:00:02] ERROR: Agent failed again
```

### Decision Traces

**What They Capture:**
- All decisions made
- Reasoning behind decisions
- Alternatives considered
- Confidence levels
- Causal relationships

**Benefits:**
- Show reasoning process
- Reveal decision chains
- Enable causal analysis
- Better debugging

**Example:**
```python
{
    "timestamp": "2025-01-01T10:00:00Z",
    "agent": "research_agent",
    "decision": "call_search_tool",
    "reasoning": "Need to find information about X",
    "alternatives": ["ask_user", "use_cache"],
    "confidence": 0.85,
    "causes": ["user_query"],
    "effects": ["search_tool_called"]
}
```

### Trace Structure

**Component 1: Decision Point**
```python
class DecisionPoint:
    def __init__(self):
        self.timestamp = now()
        self.agent_id = None
        self.decision = None
        self.reasoning = None
        self.confidence = None
        self.alternatives = []
        self.context = {}
```

**Component 2: Causal Chain**
```python
class CausalChain:
    def __init__(self):
        self.events = []
        self.relationships = []
    
    def add_event(self, event, causes):
        self.events.append(event)
        for cause in causes:
            self.relationships.append((cause, event))
```

**Component 3: Trace Graph**
```python
class TraceGraph:
    def __init__(self):
        self.nodes = {}  # Decision points
        self.edges = []   # Causal relationships
    
    def add_decision(self, decision, causes):
        self.nodes[decision.id] = decision
        for cause in causes:
            self.edges.append((cause.id, decision.id))
```

---

## 8.2 Causal Chains in Multi-Agent Failures

### What Are Causal Chains?

**Definition:** Sequence of events where each event causes the next

**Example:**
```
Event 1: Tool A fails
  ↓
Event 2: Agent B retries
  ↓
Event 3: Rate limit hit
  ↓
Event 4: System overload
  ↓
Event 5: Complete failure
```

### Building Causal Chains

**Approach 1: Event Correlation**
```python
class CausalChainBuilder:
    def build_chain(self, events):
        chain = []
        current_event = self.find_root_cause(events)
        
        while current_event:
            chain.append(current_event)
            current_event = self.find_next_event(current_event, events)
        
        return chain
    
    def find_root_cause(self, events):
        # Find event with no causes
        for event in events:
            if not event.has_causes():
                return event
        return None
```

**Approach 2: Temporal Analysis**
```python
class TemporalCausalAnalysis:
    def build_chain(self, events):
        # Sort by timestamp
        sorted_events = sorted(events, key=lambda e: e.timestamp)
        
        chain = []
        for i, event in enumerate(sorted_events):
            # Find events that could have caused this
            causes = [e for e in sorted_events[:i] if self.could_cause(e, event)]
            event.causes = causes
            chain.append(event)
        
        return chain
```

**Approach 3: Dependency Analysis**
```python
class DependencyCausalAnalysis:
    def build_chain(self, events):
        # Build dependency graph
        graph = self.build_dependency_graph(events)
        
        # Find causal paths
        chains = []
        for event in events:
            path = self.find_path_to_root(graph, event)
            chains.append(path)
        
        return chains
```

### Visualizing Causal Chains

**Visualization:**
```python
class CausalChainVisualizer:
    def visualize(self, chain):
        # Create graph visualization
        graph = nx.DiGraph()
        
        for event in chain:
            graph.add_node(event.id, label=event.description)
            for cause in event.causes:
                graph.add_edge(cause.id, event.id)
        
        # Render graph
        nx.draw(graph, with_labels=True)
        plt.show()
```

---

## 8.3 Cost Attribution per Decision

### Why Cost Attribution Matters

**Benefits:**
- Understand cost drivers
- Optimize expensive decisions
- Budget allocation
- Cost debugging

### Cost Attribution Methods

**Method 1: Direct Attribution**
```python
class DirectCostAttribution:
    def attribute_cost(self, decision):
        # Direct costs from this decision
        costs = {
            "model_calls": sum(call.cost for call in decision.model_calls),
            "tool_calls": sum(call.cost for call in decision.tool_calls),
            "compute": decision.compute_cost,
            "storage": decision.storage_cost
        }
        return sum(costs.values())
```

**Method 2: Proportional Attribution**
```python
class ProportionalCostAttribution:
    def attribute_cost(self, decision, total_cost):
        # Attribute proportionally based on contribution
        decision_contribution = self.estimate_contribution(decision)
        total_contribution = sum(self.estimate_contribution(d) for d in all_decisions)
        
        attributed_cost = total_cost * (decision_contribution / total_contribution)
        return attributed_cost
```

**Method 3: Causal Attribution**
```python
class CausalCostAttribution:
    def attribute_cost(self, decision, causal_chain):
        # Attribute costs along causal chain
        total_cost = 0
        
        # Direct costs
        total_cost += decision.direct_cost
        
        # Costs from downstream effects
        for effect in decision.effects:
            effect_cost = self.attribute_cost(effect, causal_chain)
            total_cost += effect_cost
        
        return total_cost
```

### Cost Tracking

**Implementation:**
```python
class CostTracker:
    def __init__(self):
        self.costs = {}
    
    def track_decision_cost(self, decision_id, cost, breakdown):
        self.costs[decision_id] = {
            "total": cost,
            "breakdown": breakdown,
            "timestamp": now()
        }
    
    def get_cost_by_agent(self, agent_id):
        agent_costs = [c for d, c in self.costs.items() if d.agent_id == agent_id]
        return sum(c["total"] for c in agent_costs)
    
    def get_cost_by_decision_type(self, decision_type):
        type_costs = [c for d, c in self.costs.items() if d.type == decision_type]
        return sum(c["total"] for c in type_costs)
```

---

## 8.4 Detecting Behavioral Drift Early

### What Is Behavioral Drift?

**Definition:** Gradual change in agent behavior over time

**Types:**
- Reasoning quality degradation
- Decision pattern changes
- Tool usage shifts
- Confidence level changes

### Drift Detection Methods

**Method 1: Statistical Process Control**
```python
class StatisticalDriftDetection:
    def __init__(self):
        self.baseline = None
        self.control_limits = None
    
    def establish_baseline(self, historical_data):
        self.baseline = {
            "mean": np.mean(historical_data),
            "std": np.std(historical_data)
        }
        self.control_limits = {
            "upper": self.baseline["mean"] + 3 * self.baseline["std"],
            "lower": self.baseline["mean"] - 3 * self.baseline["std"]
        }
    
    def detect_drift(self, current_value):
        if current_value > self.control_limits["upper"]:
            return "drift_up"
        elif current_value < self.control_limits["lower"]:
            return "drift_down"
        return "normal"
```

**Method 2: Distribution Comparison**
```python
class DistributionDriftDetection:
    def detect_drift(self, baseline_dist, current_dist):
        # Compare distributions
        ks_statistic, p_value = ks_2samp(baseline_dist, current_dist)
        
        if p_value < 0.05:
            return "drift_detected"
        return "no_drift"
```

**Method 3: Trajectory Comparison**
```python
class TrajectoryDriftDetection:
    def detect_drift(self, baseline_trajectories, current_trajectories):
        # Compare trajectory patterns
        baseline_pattern = self.extract_pattern(baseline_trajectories)
        current_pattern = self.extract_pattern(current_trajectories)
        
        similarity = self.compare_patterns(baseline_pattern, current_pattern)
        
        if similarity < 0.9:
            return "drift_detected"
        return "no_drift"
```

### Early Warning Indicators

**Indicator 1: Reasoning Depth**
```python
def monitor_reasoning_depth(trajectories):
    depths = [t.reasoning_depth() for t in trajectories]
    baseline_depth = np.mean(historical_depths)
    
    if np.mean(depths) < baseline_depth * 0.9:
        return "drift_warning"
    return "normal"
```

**Indicator 2: Decision Confidence**
```python
def monitor_confidence(trajectories):
    confidences = [d.confidence for t in trajectories for d in t.decisions]
    baseline_confidence = np.mean(historical_confidences)
    
    if abs(np.mean(confidences) - baseline_confidence) > 0.1:
        return "drift_warning"
    return "normal"
```

**Indicator 3: Tool Usage Patterns**
```python
def monitor_tool_usage(trajectories):
    tool_usage = self.extract_tool_usage(trajectories)
    baseline_usage = self.get_baseline_tool_usage()
    
    if self.detect_usage_anomaly(tool_usage, baseline_usage):
        return "drift_warning"
    return "normal"
```

---

## 8.5 Building Alerts on Reasoning Patterns

### What Are Reasoning Patterns?

**Definition:** Recurring patterns in agent reasoning

**Examples:**
- Always uses same tool first
- Never considers alternative approaches
- Overconfident in decisions
- Underutilizes available tools

### Pattern-Based Alerts

**Alert 1: Reasoning Quality Degradation**
```python
class ReasoningQualityAlert:
    def check(self, trajectory):
        quality_score = self.assess_quality(trajectory)
        
        if quality_score < self.threshold:
            return Alert(
                type="reasoning_quality",
                severity="high",
                message=f"Reasoning quality dropped to {quality_score}",
                trajectory=trajectory
            )
        return None
```

**Alert 2: Decision Pattern Change**
```python
class DecisionPatternAlert:
    def check(self, trajectories):
        current_pattern = self.extract_pattern(trajectories)
        baseline_pattern = self.get_baseline_pattern()
        
        similarity = self.compare_patterns(current_pattern, baseline_pattern)
        
        if similarity < 0.85:
            return Alert(
                type="decision_pattern_change",
                severity="medium",
                message=f"Decision pattern changed (similarity: {similarity})",
                trajectories=trajectories
            )
        return None
```

**Alert 3: Tool Usage Anomaly**
```python
class ToolUsageAlert:
    def check(self, trajectories):
        tool_usage = self.extract_tool_usage(trajectories)
        baseline_usage = self.get_baseline_usage()
        
        anomalies = self.detect_anomalies(tool_usage, baseline_usage)
        
        if anomalies:
            return Alert(
                type="tool_usage_anomaly",
                severity="medium",
                message=f"Tool usage anomalies detected: {anomalies}",
                trajectories=trajectories
            )
        return None
```

**Alert 4: Confidence Drift**
```python
class ConfidenceDriftAlert:
    def check(self, trajectories):
        confidences = [d.confidence for t in trajectories for d in t.decisions]
        baseline_confidence = self.get_baseline_confidence()
        
        current_confidence = np.mean(confidences)
        drift = abs(current_confidence - baseline_confidence)
        
        if drift > 0.15:
            return Alert(
                type="confidence_drift",
                severity="high",
                message=f"Confidence drifted by {drift}",
                trajectories=trajectories
            )
        return None
```

### Alert Aggregation

**Aggregation Strategy:**
```python
class AlertAggregator:
    def aggregate(self, alerts):
        # Group by type
        grouped = {}
        for alert in alerts:
            if alert.type not in grouped:
                grouped[alert.type] = []
            grouped[alert.type].append(alert)
        
        # Aggregate similar alerts
        aggregated = []
        for alert_type, alert_list in grouped.items():
            if len(alert_list) > 1:
                aggregated.append(self.merge_alerts(alert_list))
            else:
                aggregated.append(alert_list[0])
        
        return aggregated
```

---

## 8.6 Key Takeaways

**Decision Traces:**
- Capture reasoning, not just events
- Show decision process and causal chains
- Enable better debugging

**Causal Chains:**
- Reveal root causes of failures
- Show event relationships
- Enable systematic debugging

**Cost Attribution:**
- Understand cost drivers
- Optimize expensive decisions
- Enable cost debugging

**Behavioral Drift Detection:**
- Use statistical methods
- Compare distributions and trajectories
- Monitor early warning indicators

**Reasoning Pattern Alerts:**
- Alert on patterns, not just outputs
- Detect quality degradation early
- Monitor decision patterns and tool usage

---

## Practical Work: Diagnosing a Failure Using Traces Only

**Objective:** Build observability system and use it to diagnose failures

**Requirements:**
1. Implement decision trace capture
2. Build causal chain analysis
3. Add cost attribution
4. Implement drift detection
5. Create pattern-based alerts
6. Diagnose a real failure using traces

**Deliverables:**
- Trace capture implementation
- Causal chain analysis
- Cost attribution system
- Drift detection
- Alert system
- Failure diagnosis report

**Evaluation Criteria:**
- Trace capture quality (20%)
- Causal chain analysis (20%)
- Cost attribution (20%)
- Drift detection (20%)
- Alert system (20%)

**Time Estimate:** 5-6 hours

---

## Additional Resources

**Readings:**
- "Observability for AI Systems"
- "Causal Analysis in Distributed Systems"
- "Pattern-Based Monitoring"

**Tools to Explore:**
- Tracing frameworks
- Observability platforms
- Alerting systems

**Next Module Preview:**
Module 9 will teach you how to integrate humans in the loop without destroying autonomy.

---

**Module 8 Complete**   
**Next:** Module 9 - Humans in the Loop Without Destroying Autonomy
