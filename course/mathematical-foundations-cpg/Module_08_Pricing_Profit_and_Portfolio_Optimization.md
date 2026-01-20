---
title: "Pricing, Profit & Portfolio Optimization"
module: "Module 8"
week: 8
order: 8
description: "Maximize profit under real-world constraints"
---

# Module 8: Pricing, Profit & Portfolio Optimization

## Introduction

Pricing decisions in CPG involve complex trade-offs between revenue, costs, competitive positioning, and portfolio effects. This module applies optimization theory to maximize profit while respecting business constraints.

## Learning Objectives

- Calculate contribution margin and break-even points
- Optimize pricing under constraints
- Design price ladders
- Optimize portfolio-level decisions
- Apply linear and nonlinear optimization
- Make defensible pricing and assortment decisions

## Contribution Margin Logic

### Contribution Margin

**Definition:**
```
CM = Price - Variable_cost
CM% = (Price - Variable_cost) / Price
```

**Profit calculation:**
```
Profit = (CM × Quantity) - Fixed_costs
```

**Break-even quantity:**
```
Q_BE = Fixed_costs / CM
```

**Break-even price:**
```
P_BE = Variable_cost + (Fixed_costs / Quantity)
```

### Margin Analysis

**Gross margin:**
```
Gross_margin = (Revenue - COGS) / Revenue
```

**Operating margin:**
```
Operating_margin = (Revenue - Total_costs) / Revenue
```

**Contribution to profit:**
```
Contribution = CM × Quantity
```

## Break-Even Analysis

### Single Product

**Break-even point:**
```
Revenue = Cost
P × Q = FC + VC × Q
Q_BE = FC / (P - VC)
```

**Break-even chart:**
- X-axis: Quantity
- Y-axis: Revenue/Cost
- Intersection: Break-even point

### Multi-Product

**Weighted average contribution:**
```
CM_avg = Σ(w_i × CM_i)
where w_i = sales mix proportion
```

**Break-even:**
```
Q_BE_total = Fixed_costs / CM_avg
Q_BE_i = Q_BE_total × w_i
```

## Price Ladders and Constraints

### Price Ladder

**Tier structure:**
```
Tier_1: Premium (P_high)
Tier_2: Standard (P_mid)
Tier_3: Value (P_low)
```

**Constraints:**
```
P_high > P_mid > P_low
P_high / P_low ≤ Max_ratio
```

**Mathematical formulation:**
```
P_high ≥ P_mid + Gap_min
P_mid ≥ P_low + Gap_min
P_high ≤ P_low × Ratio_max
```

### Competitive Constraints

**Price positioning:**
```
P_own ≥ P_competitor × (1 - Max_discount)
P_own ≤ P_competitor × (1 + Max_premium)
```

**Market share constraints:**
```
Market_share ≥ Target_share
```

## Portfolio-Level Optimization

### Multi-Product Profit

**Total profit:**
```
Profit = Σ[(P_i - VC_i) × Q_i(P_i, P_j, ...)] - FC
```

**Demand interdependence:**
```
Q_i = f(P_i, P_j, P_k, ...)  for all products j, k
```

### Constrained Optimization

**Objective:**
```
Maximize: Profit = Σ(CM_i × Q_i)
```

**Constraints:**
```
P_i ≥ VC_i  (non-negative margin)
P_i ≤ P_max_i  (price ceiling)
Q_i ≥ Q_min_i  (minimum volume)
Σ(Resource_i × Q_i) ≤ Capacity  (resource constraints)
```

### Linear Programming Formulation

**If demand is linear:**
```
Q_i = a_i - b_i×P_i + Σ(c_ij × P_j)
```

**Profit function:**
```
Profit = Σ[(P_i - VC_i) × (a_i - b_i×P_i + Σ(c_ij×P_j))]
```

**Quadratic programming:**
```
Maximize: Profit (quadratic in prices)
Subject to: Linear constraints
```

## Key Models

### Constrained Profit Maximization

**Lagrangian method:**
```
L = Profit - Σ(λ_i × Constraint_i)
```

**First-order conditions:**
```
∂L/∂P_i = 0  for all i
Constraint_i = 0  for all i
```

**Solution:**
- Solve system of equations
- Check boundary conditions
- Verify second-order conditions

### Linear Optimization

**Standard form:**
```
Maximize: cᵀx
Subject to:
  Ax ≤ b
  x ≥ 0
```

**Pricing application:**
```
x = [P_1, P_2, ..., P_n]
c = [∂Profit/∂P_1, ∂Profit/∂P_2, ...]
```

### Nonlinear Optimization

**General form:**
```
Maximize: f(x)
Subject to:
  g_i(x) ≤ 0
  h_j(x) = 0
```

**Methods:**
- Gradient descent
- Newton's method
- Interior point methods

## Exercises

1. **Break-Even Analysis:** Calculate break-even for multi-product portfolio
2. **Price Optimization:** Optimize prices under constraints
3. **Portfolio Analysis:** Maximize portfolio profit
4. **Constraint Analysis:** Analyze impact of constraints on optimal solution

## Case Studies

- Price optimization in competitive markets
- Portfolio pricing strategy
- Promotional pricing optimization
- Price ladder design
- Profit maximization under constraints
