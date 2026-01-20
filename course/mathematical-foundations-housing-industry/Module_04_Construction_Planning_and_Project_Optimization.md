---
title: "Construction Planning and Project Optimization"
module: "Module 4"
week: 4
order: 4
description: "Model time, cost, and productivity in housing delivery"
---

# Module 4: Construction Planning and Project Optimization

## Introduction

Construction projects require careful planning to optimize time, cost, and quality. This module applies graph theory, optimization, and probability to model construction schedules, costs, and risks.

## Learning Objectives

- Apply Critical Path Method (CPM) to project scheduling
- Model learning curves in construction
- Analyze cost escalation and uncertainty
- Quantify schedule risk and delay propagation
- Use graph theory, power laws, and max-path optimization

## Critical Path Method (CPM)

### Network Representation

**Activities and dependencies:**
```
Activity → Predecessor activities
Duration → Time to complete
```

**Network graph:**
```
G = (V, E)
where:
  V = nodes (activities or events)
  E = edges (dependencies)
```

### Forward Pass

**Early start (ES):**
```
ES_i = max(ES_j + Duration_j) for all predecessors j
```

**Early finish (EF):**
```
EF_i = ES_i + Duration_i
```

**Project completion:**
```
Project_EF = max(EF_i) for all activities
```

### Backward Pass

**Late finish (LF):**
```
LF_i = min(LF_j - Duration_j) for all successors j
```

**Late start (LS):**
```
LS_i = LF_i - Duration_i
```

### Critical Path

**Total float:**
```
TF_i = LS_i - ES_i = LF_i - EF_i
```

**Critical activities:**
```
TF_i = 0 → Activity is on critical path
```

**Critical path:**
```
Longest path through network
Determines minimum project duration
```

### Mathematical Formulation

**Minimize project duration:**
```
Minimize: Project_completion_time
Subject to:
  ES_j ≥ EF_i  for all dependencies (i → j)
  ES_i ≥ 0  for all activities
```

## Learning Curves in Construction

### Learning Curve Model

**Power law:**
```
Time_n = Time_1 × n^b
where:
  n = unit number
  b = learning coefficient (typically -0.2 to -0.4)
```

**Learning rate:**
```
LR = 2^b
Typical: 80-90% (20-10% improvement per doubling)
```

**Cumulative time:**
```
Time_cumulative = Time_1 × Σ(n^b) from n=1 to N
```

### Productivity Improvement

**Productivity:**
```
P_n = P_1 × n^(-b)
```

**Cost reduction:**
```
Cost_n = Cost_1 × n^b
```

**Application:**
- Repetitive tasks
- Modular construction
- Prefabrication

## Cost Escalation and Uncertainty

### Cost Escalation

**Inflation:**
```
Cost(t) = Cost(t₀) × (1 + r)^(t - t₀)
where r = inflation rate
```

**Material cost escalation:**
```
Material_cost(t) = Base_cost × (1 + Material_inflation)^t
```

**Labor cost escalation:**
```
Labor_cost(t) = Base_rate × (1 + Labor_inflation)^t
```

### Cost Uncertainty

**Probabilistic cost:**
```
Cost ~ Probability_Distribution
```

**Normal distribution:**
```
Cost ~ N(μ, σ²)
P(Cost ≤ x) = Φ((x - μ) / σ)
```

**Three-point estimate:**
```
Expected = (Optimistic + 4×Most_likely + Pessimistic) / 6
Variance = ((Pessimistic - Optimistic) / 6)²
```

### Cost Contingency

**Contingency calculation:**
```
Contingency = z_α × σ_total
where z_α = confidence level quantile
```

**Total cost:**
```
Total_cost = Base_cost + Contingency
```

## Schedule Risk and Delay Propagation

### Delay Analysis

**Single delay:**
```
Project_delay = Delay_duration (if on critical path)
Project_delay = 0 (if not on critical path and float available)
```

**Multiple delays:**
```
Project_delay = max(Delay_i) if all on critical path
Project_delay = Σ(Delay_i) if sequential
```

### Delay Propagation

**Cascade effect:**
```
Delay_i → Affects successors → Project_delay
```

**Mathematical model:**
```
If Activity_i delayed by Δt:
  ES_j = max(ES_j, EF_i + Δt) for all successors j
  Project_delay = max(0, New_EF_final - Original_EF_final)
```

### Risk Quantification

**Delay probability:**
```
P(Delay) = f(Risk_factors)
```

**Expected delay:**
```
E[Delay] = Σ P(Delay_i) × Duration(Delay_i)
```

**Variance:**
```
Var(Delay) = E[Delay²] - (E[Delay])²
```

## Key Math: Graph Theory and Optimization

### Graph Theory

**Shortest path:**
```
Dijkstra's algorithm
Bellman-Ford algorithm
```

**Longest path (CPM):**
```
Modified shortest path algorithm
Multiply edge weights by -1
```

### Max-Path Optimization

**Critical path:**
```
Maximize: Path_length
Subject to: Precedence_constraints
```

**Dynamic programming:**
```
DP[i] = max(DP[j] + Duration_j) for all predecessors j
```

### Power Laws

**Learning curve:**
```
y = a × x^b
log(y) = log(a) + b × log(x)
```

**Estimation:**
```
Linear regression on log-log scale
```

## Exercises

1. **CPM Analysis:** Calculate critical path and project duration
2. **Learning Curve:** Model productivity improvement
3. **Cost Estimation:** Build probabilistic cost model
4. **Risk Analysis:** Quantify schedule risk and delays

## Case Studies

- Large-scale housing development scheduling
- Modular construction optimization
- Cost escalation management
- Delay claim analysis
- Project risk mitigation
