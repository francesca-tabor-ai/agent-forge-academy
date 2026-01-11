---
title: "Module 11: Cost Failures and Economic Drift"
description: "Preventing financial incidents"
module: "11"
order: 11
email_takeaway: "Track cost per decision, not per request. Use adaptive reasoning depth, speculative execution, and early stopping to prevent cost creep."
email_action: "What's your cost per decision? How would you detect if it increased 20% without noticing?"
---

# Module 11: Cost Failures and Economic Drift

**Duration:** Week 11  
**Learning Objectives:**
- Prevent financial incidents
- Track cost per decision, not per request
- Implement adaptive reasoning depth
- Use speculative execution and early stopping
- Detect slow cost creep before it becomes catastrophic

---

## 11.1 Preventing Financial Incidents

### Types of Cost Failures

**Type 1: Sudden Cost Spike**
```
Normal: $100/day
Spike: $1,000/day (10x increase)
Cause: Retry storm, infinite loop
```

**Type 2: Gradual Cost Creep**
```
Week 1: $100/day
Week 2: $110/day
Week 3: $125/day
Week 4: $150/day
Cause: Slow degradation, inefficient patterns
```

**Type 3: Hidden Costs**
```
Visible: $100/day (API costs)
Hidden: $200/day (compute, storage, human review)
Total: $300/day
```

### Cost Failure Prevention

**Strategy 1: Budget Limits**
```python
class BudgetLimiter:
    def __init__(self, daily_budget):
        self.daily_budget = daily_budget
        self.daily_spent = 0
    
    def can_spend(self, amount):
        return self.daily_spent + amount <= self.daily_budget
    
    def spend(self, amount):
        if not self.can_spend(amount):
            raise BudgetExceededException()
        self.daily_spent += amount
```

**Strategy 2: Cost Alerts**
```python
class CostAlerts:
    def __init__(self):
        self.thresholds = {
            "warning": 0.8,  # 80% of budget
            "critical": 0.95  # 95% of budget
        }
    
    def check_budget(self, spent, budget):
        ratio = spent / budget
        
        if ratio >= self.thresholds["critical"]:
            self.send_alert("critical", spent, budget)
        elif ratio >= self.thresholds["warning"]:
            self.send_alert("warning", spent, budget)
```

**Strategy 3: Automatic Throttling**
```python
class CostThrottler:
    def __init__(self, budget):
        self.budget = budget
        self.spent = 0
    
    def throttle_if_needed(self):
        if self.spent > self.budget * 0.9:
            # Reduce request rate
            self.reduce_rate(0.5)
        
        if self.spent > self.budget * 0.95:
            # Stop non-critical requests
            self.stop_non_critical()
        
        if self.spent >= self.budget:
            # Stop all requests
            self.stop_all()
```

---

## 11.2 Cost per Decision, Not per Request

### Why Cost per Decision Matters

**Problem with Cost per Request:**
```
Request 1: Simple query → $0.01
Request 2: Complex analysis → $1.00
Average: $0.50/request (misleading)
```

**Solution: Cost per Decision**
```
Decision 1: Simple → $0.01
Decision 2: Complex → $1.00
Average: $0.50/decision (accurate)
```

### Tracking Cost per Decision

**Implementation:**
```python
class DecisionCostTracker:
    def __init__(self):
        self.decisions = []
    
    def track_decision(self, decision, cost_breakdown):
        self.decisions.append({
            "decision_id": decision.id,
            "type": decision.type,
            "cost": cost_breakdown.total,
            "breakdown": cost_breakdown,
            "timestamp": now()
        })
    
    def get_cost_per_decision_type(self, decision_type):
        type_decisions = [d for d in self.decisions if d["type"] == decision_type]
        if not type_decisions:
            return 0
        return sum(d["cost"] for d in type_decisions) / len(type_decisions)
    
    def get_average_cost_per_decision(self):
        if not self.decisions:
            return 0
        return sum(d["cost"] for d in self.decisions) / len(self.decisions)
```

### Cost Attribution

**Attribution Methods:**
```python
class CostAttribution:
    def attribute_cost(self, decision):
        # Direct costs
        direct_costs = {
            "model_calls": sum(call.cost for call in decision.model_calls),
            "tool_calls": sum(call.cost for call in decision.tool_calls),
            "compute": decision.compute_cost
        }
        
        # Indirect costs (proportional)
        indirect_costs = {
            "infrastructure": self.attribute_infrastructure_cost(decision),
            "storage": self.attribute_storage_cost(decision),
            "monitoring": self.attribute_monitoring_cost(decision)
        }
        
        return {
            "direct": direct_costs,
            "indirect": indirect_costs,
            "total": sum(direct_costs.values()) + sum(indirect_costs.values())
        }
```

---

## 11.3 Adaptive Reasoning Depth

### What Is Adaptive Reasoning Depth?

**Definition:** Adjust reasoning complexity based on task complexity and cost constraints

**Benefits:**
- Reduce cost for simple tasks
- Maintain quality for complex tasks
- Optimize cost-quality trade-off

### Implementation

**Approach 1: Complexity-Based**
```python
class AdaptiveReasoningDepth:
    def __init__(self):
        self.depth_levels = {
            "shallow": 1,  # Single step
            "medium": 3,   # Few steps
            "deep": 5      # Many steps
        }
    
    def select_depth(self, task_complexity, cost_budget):
        if task_complexity < 0.3:
            return "shallow"
        elif task_complexity < 0.7:
            return "medium"
        else:
            # Check if budget allows deep reasoning
            if cost_budget > self.estimate_cost("deep"):
                return "deep"
            else:
                return "medium"
```

**Approach 2: Confidence-Based**
```python
class ConfidenceBasedDepth:
    def select_depth(self, initial_confidence, target_confidence):
        if initial_confidence >= target_confidence:
            return "shallow"  # Already confident
        elif initial_confidence >= target_confidence * 0.8:
            return "medium"  # Close to target
        else:
            return "deep"  # Need more reasoning
```

**Approach 3: Cost-Aware**
```python
class CostAwareDepth:
    def select_depth(self, task, remaining_budget):
        # Estimate costs for different depths
        costs = {
            "shallow": self.estimate_cost(task, "shallow"),
            "medium": self.estimate_cost(task, "medium"),
            "deep": self.estimate_cost(task, "deep")
        }
        
        # Select deepest depth that fits budget
        for depth in ["deep", "medium", "shallow"]:
            if costs[depth] <= remaining_budget:
                return depth
        
        # If none fit, use shallowest
        return "shallow"
```

---

## 11.4 Speculative Execution and Early Stopping

### Speculative Execution

**Definition:** Execute multiple approaches in parallel, use best result

**Benefits:**
- Faster results (parallel execution)
- Better quality (multiple attempts)
- Cost control (stop when good enough)

**Implementation:**
```python
class SpeculativeExecution:
    def execute_speculatively(self, task, strategies):
        # Execute all strategies in parallel
        results = []
        for strategy in strategies:
            result = strategy.execute_async(task)
            results.append(result)
        
        # Wait for first good result
        for result in results:
            if result.quality >= task.min_quality:
                # Cancel other strategies
                self.cancel_remaining(results, result)
                return result
        
        # If no good result, return best
        return max(results, key=lambda r: r.quality)
```

### Early Stopping

**Definition:** Stop execution when good enough result is found

**Benefits:**
- Reduce cost
- Reduce latency
- Maintain quality

**Implementation:**
```python
class EarlyStopping:
    def __init__(self, quality_threshold, cost_limit):
        self.quality_threshold = quality_threshold
        self.cost_limit = cost_limit
    
    def execute_with_early_stopping(self, task):
        total_cost = 0
        
        for step in task.steps:
            # Execute step
            result = step.execute()
            total_cost += step.cost
            
            # Check if good enough
            if result.quality >= self.quality_threshold:
                return result  # Early stop
            
            # Check cost limit
            if total_cost >= self.cost_limit:
                return result  # Stop due to cost
        
        return result  # Completed all steps
```

---

## 11.5 Detecting Slow Cost Creep

### Cost Creep Detection

**Method 1: Trend Analysis**
```python
class CostTrendAnalysis:
    def detect_creep(self, cost_history, window=7):
        # Calculate trend
        recent_avg = np.mean(cost_history[-window:])
        baseline_avg = np.mean(cost_history[:-window])
        
        # Check for significant increase
        increase = (recent_avg - baseline_avg) / baseline_avg
        
        if increase > 0.2:  # 20% increase
            return {
                "creep_detected": True,
                "increase_percent": increase * 100,
                "recent_avg": recent_avg,
                "baseline_avg": baseline_avg
            }
        
        return {"creep_detected": False}
```

**Method 2: Anomaly Detection**
```python
class CostAnomalyDetection:
    def detect_anomalies(self, cost_history):
        # Use statistical methods
        mean = np.mean(cost_history)
        std = np.std(cost_history)
        
        anomalies = []
        for i, cost in enumerate(cost_history):
            z_score = (cost - mean) / std
            if abs(z_score) > 2:  # 2 standard deviations
                anomalies.append({
                    "index": i,
                    "cost": cost,
                    "z_score": z_score
                })
        
        return anomalies
```

**Method 3: Component Analysis**
```python
class ComponentCostAnalysis:
    def detect_creep_by_component(self, cost_history):
        components = ["model_calls", "tool_calls", "compute", "storage"]
        
        creep_by_component = {}
        for component in components:
            component_costs = [c[component] for c in cost_history]
            
            recent_avg = np.mean(component_costs[-7:])
            baseline_avg = np.mean(component_costs[:-7])
            
            increase = (recent_avg - baseline_avg) / baseline_avg
            
            if increase > 0.15:  # 15% increase
                creep_by_component[component] = {
                    "increase_percent": increase * 100,
                    "recent_avg": recent_avg,
                    "baseline_avg": baseline_avg
                }
        
        return creep_by_component
```

---

## 11.6 Key Takeaways

**Cost Failure Prevention:**
- Budget limits
- Cost alerts
- Automatic throttling

**Cost per Decision:**
- Track cost per decision, not per request
- Attribute costs accurately
- Understand cost drivers

**Adaptive Reasoning:**
- Adjust depth based on complexity
- Use confidence-based selection
- Optimize cost-quality trade-off

**Speculative Execution:**
- Execute multiple strategies in parallel
- Use best result
- Cancel remaining when good enough

**Early Stopping:**
- Stop when quality threshold met
- Stop when cost limit reached
- Balance quality and cost

**Cost Creep Detection:**
- Trend analysis
- Anomaly detection
- Component analysis
- Early warning systems

---

## Practical Work: Reducing Cost Dramatically Without Harming Eval Performance

**Objective:** Optimize agent system costs while maintaining quality

**Requirements:**
1. Implement cost tracking per decision
2. Add adaptive reasoning depth
3. Implement speculative execution
4. Add early stopping
5. Build cost creep detection
6. Optimize and measure results

**Deliverables:**
- Cost tracking system
- Adaptive reasoning implementation
- Speculative execution
- Early stopping mechanism
- Cost creep detection
- Optimization results

**Evaluation Criteria:**
- Cost reduction (30%)
- Quality maintenance (30%)
- Cost tracking accuracy (20%)
- Optimization techniques (20%)

**Time Estimate:** 5-6 hours

---

## Additional Resources

**Readings:**
- "Cost Optimization for AI Systems"
- "Adaptive Reasoning Strategies"
- "Early Stopping Techniques"

**Tools to Explore:**
- Cost tracking platforms
- Optimization frameworks
- Monitoring tools

**Next Module Preview:**
Module 12 will teach you about long-running, stateful, and resumable agents.

---

**Module 11 Complete**   
**Next:** Module 12 - Long-Running, Stateful, and Resumable Agents
