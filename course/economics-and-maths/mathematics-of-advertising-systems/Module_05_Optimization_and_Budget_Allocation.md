---
title: "Optimization & Budget Allocation"
module: "Module 5"
week: 5
order: 5
description: "Allocate spend efficiently under constraints"
---

# Module 5: Optimization & Budget Allocation

## Introduction

Efficient budget allocation requires optimizing spend across channels, campaigns, and audiences. This module applies constrained optimization, diminishing returns, and marginal ROI to allocate budgets optimally.

## Learning Objectives

- Apply constrained optimization
- Model diminishing returns
- Build spend-response curves
- Apply S-curves
- Calculate marginal ROI
- Use Lagrangian budget optimization
- Decide where to spend the next dollar
- Avoid saturation and wasted spend

## Constrained Optimization

### Basic Formulation

**Objective:**
```
Maximize: Revenue = Σ Revenue_i(Spend_i)
```

**Constraints:**
```
Σ Spend_i ≤ Budget_total
Spend_i ≥ 0 for all i
```

**Mathematical:**
```
Maximize: f(x)
Subject to: g(x) ≤ 0, h(x) = 0
```

### Lagrangian Method

**Lagrangian:**
```
L(x, λ) = f(x) - λ × g(x)
```

**KKT conditions:**
```
∇L = 0 (stationarity)
g(x) ≤ 0 (primal feasibility)
λ ≥ 0 (dual feasibility)
λ × g(x) = 0 (complementary slackness)
```

**Solution:**
```
At optimum: Marginal_ROI_i = λ for all i
```

## Diminishing Returns

### Response Curves

**Linear:**
```
Revenue = a × Spend
Constant returns
```

**Diminishing returns:**
```
Revenue = a × Spend^b where b < 1
```

**Saturation:**
```
Revenue = Max × (1 - exp(-k × Spend))
```

### S-Curves

**Logistic:**
```
Revenue = Max / (1 + exp(-k × (Spend - Midpoint)))
```

**Properties:**
- Slow initial growth
- Rapid growth phase
- Saturation phase

**Mathematical:**
```
dRevenue/dSpend = k × Revenue × (1 - Revenue/Max)
```

### Power Law

**Model:**
```
Revenue = a × Spend^b
where 0 < b < 1
```

**Elasticity:**
```
Elasticity = b (constant)
```

**Marginal revenue:**
```
dRevenue/dSpend = a × b × Spend^(b-1)
Decreases with spend
```

## Spend-Response Curves

### Curve Estimation

**Data:**
```
(Spend_i, Revenue_i) pairs
```

**Fitting:**
```
Estimate parameters: a, b, k, Max
Minimize: Σ(Revenue_i - Model(Spend_i))²
```

### Curve Types

**Linear:**
```
Revenue = a + b × Spend
```

**Exponential saturation:**
```
Revenue = Max × (1 - exp(-k × Spend))
```

**Power:**
```
Revenue = a × Spend^b
```

**Logistic:**
```
Revenue = Max / (1 + exp(-k × (Spend - Midpoint)))
```

## Key Models

### S-Curves

**Logistic function:**
```
f(x) = L / (1 + exp(-k × (x - x₀)))
where:
  L = maximum
  k = growth rate
  x₀ = midpoint
```

**Advertising application:**
```
Revenue(Spend) = Max_revenue / (1 + exp(-k × (Spend - Spend_50)))
```

**Properties:**
- S-shaped
- Symmetric around midpoint
- Bounded [0, Max]

### Marginal ROI

**Definition:**
```
Marginal_ROI = dRevenue/dSpend
```

**For S-curve:**
```
Marginal_ROI = k × Revenue × (1 - Revenue/Max) / Spend
```

**Optimal allocation:**
```
Marginal_ROI_i = Marginal_ROI_j for all i, j
```

### Lagrangian Budget Optimization

**Problem:**
```
Maximize: Σ Revenue_i(Spend_i)
Subject to: Σ Spend_i ≤ Budget
```

**Lagrangian:**
```
L = Σ Revenue_i(Spend_i) - λ × (Σ Spend_i - Budget)
```

**First-order conditions:**
```
dRevenue_i/dSpend_i = λ for all i
```

**Interpretation:**
```
At optimum: All marginal ROIs equal
λ = shadow price of budget
```

## Deciding Where to Spend Next Dollar

### Marginal Analysis

**Next dollar allocation:**
```
Allocate to channel with highest Marginal_ROI
```

**Mathematical:**
```
Channel* = argmax_i (dRevenue_i/dSpend_i)
```

**Update:**
```
Spend_i* = Spend_i* + 1
Recalculate Marginal_ROI_i*
```

### Optimal Allocation

**Equilibrium:**
```
Marginal_ROI_i = Marginal_ROI_j = λ for all i, j
```

**Algorithm:**
```
1. Calculate Marginal_ROI for all channels
2. Allocate to highest
3. Recalculate
4. Repeat until Marginal_ROI equalized
```

## Avoiding Saturation and Wasted Spend

### Saturation Detection

**Signs:**
```
Marginal_ROI < 1
Marginal_ROI decreasing rapidly
Response curve flattening
```

**Mathematical:**
```
d²Revenue/dSpend² < 0 (concave)
d²Revenue/dSpend² ≈ 0 (saturated)
```

### Optimal Spend Level

**Condition:**
```
Marginal_ROI = 1 (break-even)
```

**Beyond optimal:**
```
Marginal_ROI < 1
Incremental spend unprofitable
```

**Mathematical:**
```
Solve: dRevenue/dSpend = 1
```

### Budget Reallocation

**From saturated to unsaturated:**
```
If Marginal_ROI_i < Marginal_ROI_j:
  Reduce Spend_i
  Increase Spend_j
```

**Optimization:**
```
Continuously reallocate to equalize Marginal_ROI
```

## Exercises

1. **Optimization:** Solve budget allocation problem
2. **Response Curves:** Fit spend-response curves
3. **Marginal ROI:** Calculate and optimize marginal ROI
4. **Saturation:** Detect and avoid saturation

## Case Studies

- Multi-channel budget optimization
- Spend-response curve estimation
- Marginal ROI optimization
- Saturation management
- Budget reallocation strategies
