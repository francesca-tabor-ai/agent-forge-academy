---
title: "Inventory Theory & Control"
module: "Module 3"
week: 3
order: 3
description: "How does mathematics determine how much to stock and when?"
---

# Module 3: Inventory Theory & Control

## Introduction

Inventory management balances holding costs against stockout costs. This module covers EOQ, newsvendor model, and safety stock calculations.

## Learning Objectives

- Understand tradeoffs between holding, ordering, and stockout costs
- Distinguish single-period vs. multi-period inventory
- Apply service-level-based planning
- Use EOQ model
- Apply newsvendor model
- Calculate safety stock formulas (normal approximation)
- Compute optimal order quantities
- Design inventory policies under uncertainty

## Tradeoffs Between Costs

### Cost Components

**Holding cost:**
```
C_h = Holding_cost_rate × Average_inventory × Time
```

**Ordering cost:**
```
C_o = Ordering_cost × Number_of_orders
```

**Stockout cost:**
```
C_s = Stockout_cost_per_unit × Expected_shortage
```

**Total cost:**
```
TC = C_h + C_o + C_s
```

### Cost Trade-off

**More inventory:**
```
Higher holding cost
Lower stockout cost
```

**Less inventory:**
```
Lower holding cost
Higher stockout cost
```

**Optimal:**
```
Balance costs
Minimize total cost
```

## Single-Period vs. Multi-Period Inventory

### Single-Period (Newsvendor)

**Problem:**
```
Order once before demand
Uncertain demand
Leftover or shortage
```

**Costs:**
```
C_o = Overstock cost per unit
C_s = Stockout cost per unit
```

**Optimal:**
```
Q* = F^(-1)(C_s / (C_o + C_s))
where F = demand CDF
```

### Multi-Period

**Problem:**
```
Repeated ordering
Multiple periods
Carry inventory across periods
```

**Models:**
- EOQ (Economic Order Quantity)
- (s, S) policy
- (Q, R) policy
- Periodic review

## Service-Level-Based Planning

### Service Level Definitions

**Type I (α):**
```
α = P(Stockout in cycle)
```

**Type II (β - Fill rate):**
```
β = 1 - (Expected_shortage / Expected_demand)
```

**Relationship:**
```
β ≥ α
```

### Safety Stock

**Definition:**
```
SS = Extra inventory for uncertainty
```

**Calculation:**
```
SS = z_α × σ_L
where:
  z_α = quantile for service level α
  σ_L = lead time demand std dev
```

**Lead time demand:**
```
σ_L² = L × σ_D² + D² × σ_L²
```

## Mathematical Tools

### EOQ Model

**Assumptions:**
- Constant demand rate
- Known ordering cost
- Known holding cost
- No stockouts

**Optimal order quantity:**
```
Q* = √(2 × D × S / H)
where:
  D = demand rate
  S = ordering cost
  H = holding cost per unit per time
```

**Total cost:**
```
TC = (D/Q) × S + (Q/2) × H
```

**Cycle time:**
```
T = Q / D
```

### Newsvendor Model

**Problem:**
```
Single period
Uncertain demand D
Order quantity Q
```

**Expected cost:**
```
E[Cost] = C_o × E[max(0, Q - D)] + C_s × E[max(0, D - Q)]
```

**Optimal:**
```
Q* = F^(-1)(C_s / (C_o + C_s))
```

**Critical ratio:**
```
Critical_ratio = C_s / (C_o + C_s)
```

### Safety Stock Formulas

**Normal approximation:**
```
Demand ~ N(μ, σ²)
SS = z_α × σ_L
```

**Reorder point:**
```
ROP = μ_L + SS
where μ_L = average lead time demand
```

**Service level:**
```
Service_level = Φ((ROP - μ_L) / σ_L)
```

## Learning Outcomes

### Computing Optimal Order Quantities

**EOQ:**
```
Q* = √(2 × D × S / H)
```

**Newsvendor:**
```
Q* = F^(-1)(Critical_ratio)
```

**With service level:**
```
Q* = μ_L + z_α × σ_L
```

### Designing Inventory Policies

**Continuous review (Q, R):**
```
Order Q when inventory ≤ R
R = ROP
```

**Periodic review (s, S):**
```
Review every T periods
Order up to S if inventory ≤ s
```

**Optimization:**
```
Minimize: Total_cost
Subject to: Service_level_constraints
```

## Exercises

1. **EOQ:** Calculate optimal order quantity
2. **Newsvendor:** Solve newsvendor problem
3. **Safety Stock:** Calculate safety stock for service level
4. **Policy Design:** Design inventory policy

## Case Studies

- Inventory optimization
- Service level management
- Multi-item inventory
- Seasonal inventory
- Safety stock optimization
