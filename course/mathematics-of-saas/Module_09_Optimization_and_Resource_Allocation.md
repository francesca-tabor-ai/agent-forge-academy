---
title: "Optimization & Resource Allocation"
module: "Module 9"
week: 9
order: 9
description: "Doing more with finite resources"
---

# Module 9: Optimization & Resource Allocation

## Introduction

SaaS companies face constant trade-offs with limited resources. This module applies constrained optimization, knapsack problems, and marginal ROI analysis to optimize resource allocation.

## Learning Objectives

- Apply constrained optimization
- Solve knapsack-style tradeoffs
- Calculate marginal ROI
- Optimize cloud costs
- Prioritize engineering work
- Allocate marketing budgets
- Formalize tradeoff decisions

## Constrained Optimization

### Basic Formulation

**Objective:**
```
Maximize: f(x)
Subject to: g_i(x) ≤ 0 for all i
```

**SaaS example:**
```
Maximize: Revenue
Subject to: Budget ≤ Budget_max
```

### Lagrangian Method

**Lagrangian:**
```
L(x, λ) = f(x) - Σ(λ_i × g_i(x))
```

**KKT conditions:**
```
∇L = 0 (stationarity)
g_i(x) ≤ 0 (primal feasibility)
λ_i ≥ 0 (dual feasibility)
λ_i × g_i(x) = 0 (complementary slackness)
```

### Linear Programming

**Standard form:**
```
Maximize: cᵀx
Subject to: Ax ≤ b, x ≥ 0
```

**SaaS application:**
```
Maximize: Revenue = Σ(Revenue_i × x_i)
Subject to: Σ(Cost_i × x_i) ≤ Budget
```

## Knapsack-Style Tradeoffs

### Knapsack Problem

**Classic:**
```
Maximize: Σ(Value_i × x_i)
Subject to: Σ(Weight_i × x_i) ≤ Capacity
x_i ∈ {0, 1}
```

**SaaS application:**
```
Maximize: ROI = Σ(ROI_i × Project_i)
Subject to: Σ(Cost_i × Project_i) ≤ Budget
```

### Fractional Knapsack

**Continuous:**
```
x_i ∈ [0, 1]
```

**Greedy solution:**
```
Sort by Value_i / Weight_i
Take items in order until capacity
```

### Multiple Constraints

**Multi-dimensional:**
```
Maximize: Σ(Value_i × x_i)
Subject to:
  Σ(Cost_i × x_i) ≤ Budget
  Σ(Time_i × x_i) ≤ Time_available
  Σ(Resources_i × x_i) ≤ Resources_available
```

## Marginal ROI

### ROI Definition

**Return on Investment:**
```
ROI = (Revenue - Cost) / Cost
ROI = (Gain - Investment) / Investment
```

**Incremental ROI:**
```
Marginal_ROI = ΔRevenue / ΔCost
```

### Optimization

**Optimal allocation:**
```
Allocate to highest Marginal_ROI first
Until Marginal_ROI = Marginal_cost
```

**Mathematical:**
```
Marginal_ROI_i = Marginal_ROI_j for all i, j
```

### Diminishing Returns

**Model:**
```
ROI(Cost) = Max_ROI / (1 + Cost / K)
```

**Optimal spend:**
```
dROI/dCost = 0
```

## Cloud Cost Optimization

### Cost Components

**Compute:**
```
Cost_compute = Instances × Price_per_instance × Hours
```

**Storage:**
```
Cost_storage = GB × Price_per_GB × Months
```

**Network:**
```
Cost_network = GB_transferred × Price_per_GB
```

**Total:**
```
Cost_total = Cost_compute + Cost_storage + Cost_network
```

### Optimization

**Right-sizing:**
```
Minimize: Cost
Subject to: Performance ≥ Target
```

**Reserved instances:**
```
Trade-off: Upfront_cost vs Discount
Optimize: Mix of reserved and on-demand
```

### Cost Modeling

**Usage-based:**
```
Cost = f(Usage, Pricing_tier)
```

**Optimization:**
```
Minimize: Cost
Subject to: Performance_constraints
```

## Engineering Prioritization

### Value Estimation

**Expected value:**
```
E[Value] = P(Success) × Value_if_success - Cost
```

**ROI:**
```
ROI = E[Value] / Cost
```

### Prioritization Framework

**Score:**
```
Score = w₁×Value + w₂×Urgency - w₃×Cost
```

**Optimization:**
```
Maximize: Σ(Score_i × Project_i)
Subject to: Resource_constraints
```

### Constraint Optimization

**Multiple constraints:**
```
Engineers, Time, Budget, Dependencies
```

**Mathematical:**
```
Maximize: Total_value
Subject to:
  Σ(Engineers_i × Project_i) ≤ Available_engineers
  Σ(Time_i × Project_i) ≤ Time_horizon
  Dependencies_satisfied
```

## Marketing Budget Allocation

### Channel Optimization

**Multiple channels:**
```
Maximize: Σ(Revenue_i)
Subject to: Σ(Cost_i) ≤ Budget
```

**Marginal ROI:**
```
Allocate to highest Marginal_ROI channels
```

### Attribution

**Multi-touch:**
```
Revenue_i = f(Touches_i)
```

**Optimization:**
```
Maximize: Total_revenue
Subject to: Budget_constraints
```

### Time Allocation

**Dynamic:**
```
Budget(t) = f(Performance(t-1), Seasonality, ...)
```

**Optimization:**
```
Maximize: Σ(Revenue_t)
Subject to: Σ(Budget_t) ≤ Total_budget
```

## Exercises

1. **Optimization:** Solve resource allocation problem
2. **ROI Analysis:** Calculate and optimize marginal ROI
3. **Cost Optimization:** Optimize cloud costs
4. **Prioritization:** Prioritize engineering projects

## Case Studies

- Marketing budget optimization
- Engineering resource allocation
- Cloud cost reduction
- Portfolio optimization
- Trade-off decision frameworks
