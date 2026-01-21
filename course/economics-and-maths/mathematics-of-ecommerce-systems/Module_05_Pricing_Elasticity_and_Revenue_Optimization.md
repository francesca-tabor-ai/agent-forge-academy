---
title: "Pricing, Elasticity & Revenue Optimization"
module: "Module 5"
week: 5
order: 5
description: "Optimize prices using economic and mathematical principles"
---

# Module 5: Pricing, Elasticity & Revenue Optimization

## Introduction

Pricing optimization is fundamental to e-commerce profitability. This module applies economic principles, elasticity estimation, and constrained optimization to maximize revenue and profit.

## Learning Objectives

- Calculate price elasticity
- Distinguish revenue vs profit maximization
- Apply constraints and fairness
- Model dynamic pricing logic
- Use differential calculus
- Apply optimization under constraints
- Estimate elasticity
- Design discount strategies
- Set free-shipping thresholds
- Optimize competitive pricing

## Price Elasticity

### Definition

**Price elasticity of demand:**
```
E = (ΔQ/Q) / (ΔP/P) = (dQ/dP) × (P/Q)
```

**Interpretation:**
- |E| > 1: Elastic (price-sensitive)
- |E| < 1: Inelastic (price-insensitive)
- |E| = 1: Unit elastic

**Revenue impact:**
```
dRevenue/dP = Q × (1 + E)
```

**Optimal pricing:**
```
If E < -1: Lower price increases revenue
If E > -1: Raise price increases revenue
```

### Elasticity Estimation

**From data:**
```
E = (ΔQ/Q) / (ΔP/P)
```

**Regression:**
```
log(Q) = α + β×log(P) + ...
E = β
```

**A/B testing:**
```
E = (ΔQ/Q) / (ΔP/P) from test
```

## Revenue vs Profit Maximization

### Revenue Maximization

**Objective:**
```
Maximize: Revenue = P × Q(P)
```

**Condition:**
```
dRevenue/dP = 0
Q + P × (dQ/dP) = 0
1 + E = 0
E = -1
```

**Optimal price:**
```
P* where E = -1
```

### Profit Maximization

**Objective:**
```
Maximize: Profit = (P - Cost) × Q(P)
```

**Condition:**
```
dProfit/dP = 0
Q + (P - Cost) × (dQ/dP) = 0
```

**Optimal price:**
```
P* = Cost / (1 + 1/E)
```

**Markup:**
```
Markup = (P* - Cost) / Cost = -1/E
```

## Constraints and Fairness

### Price Constraints

**Minimum price:**
```
P ≥ P_min (cost floor)
```

**Maximum price:**
```
P ≤ P_max (competitive ceiling)
```

**Price ladder:**
```
P_tier_1 > P_tier_2 > P_tier_3
```

### Fairness Constraints

**Price discrimination:**
```
Different prices for different segments
Subject to fairness_constraints
```

**Mathematical:**
```
Maximize: Profit
Subject to:
  P_segment_i within acceptable_range
  Price_difference ≤ Max_difference
```

## Dynamic Pricing Logic

### Dynamic Pricing Model

**Base price:**
```
P_base = f(Cost, Competition, ...)
```

**Adjustment:**
```
P(t) = P_base × Adjustment_factor(t)
```

**Factors:**
```
Adjustment = f(Demand, Inventory, Competition, Time, ...)
```

### Real-Time Pricing

**Algorithm:**
```
P(t) = f(Demand_t, Inventory_t, Competition_t, ...)
```

**Optimization:**
```
Maximize: Revenue_t or Profit_t
Subject to: Constraints_t
```

**Learning:**
```
Update pricing based on outcomes
Adapt to market changes
```

## Core Mathematics

### Differential Calculus

**Derivatives:**
```
dRevenue/dP = d(P × Q)/dP = Q + P × (dQ/dP)
```

**Optimal conditions:**
```
dRevenue/dP = 0
dProfit/dP = 0
```

**Second derivative:**
```
d²Revenue/dP² < 0 (maximum)
d²Profit/dP² < 0 (maximum)
```

### Optimization Under Constraints

**Lagrangian:**
```
L = Objective - λ × Constraint
```

**KKT conditions:**
```
∇L = 0
Constraint ≤ 0
λ ≥ 0
λ × Constraint = 0
```

**Solution:**
```
Solve system of equations
Check boundary conditions
```

### Elasticity Estimation

**Linear demand:**
```
Q = a - b×P
E = -b×P / Q
```

**Log-linear:**
```
log(Q) = α + β×log(P)
E = β (constant)
```

**Estimation:**
```
Regression: log(Q) ~ log(P) + Controls
E = coefficient on log(P)
```

## Industry Applications

### Discount Strategy Design

**Discount optimization:**
```
Maximize: Profit = (P_discounted - Cost) × Q(P_discounted)
Subject to: P_discounted = P_regular × (1 - Discount)
```

**Optimal discount:**
```
Discount* = argmax Profit(Discount)
```

**Elasticity consideration:**
```
If elastic: Larger discount increases volume
If inelastic: Smaller discount sufficient
```

### Free-Shipping Thresholds

**Model:**
```
Revenue = P × Q(P) - Shipping_cost × Q(P) if P < Threshold
Revenue = P × Q(P) if P ≥ Threshold
```

**Optimization:**
```
Maximize: Revenue
Subject to: Threshold_constraint
```

**Optimal threshold:**
```
Threshold* = argmax Revenue(Threshold)
```

### Competitive Pricing

**Competitive model:**
```
Q = f(P_own, P_competitor, ...)
```

**Nash equilibrium:**
```
P_own* = argmax Profit(P_own, P_competitor*)
P_competitor* = argmax Profit(P_competitor, P_own*)
```

**Optimization:**
```
Solve simultaneous equations
Find equilibrium prices
```

## Exercises

1. **Elasticity:** Estimate price elasticity from data
2. **Optimization:** Optimize price for revenue/profit
3. **Constraints:** Optimize under price constraints
4. **Dynamic Pricing:** Design dynamic pricing algorithm

## Case Studies

- E-commerce pricing optimization
- Discount strategy design
- Free-shipping threshold optimization
- Competitive pricing analysis
- Dynamic pricing implementation
