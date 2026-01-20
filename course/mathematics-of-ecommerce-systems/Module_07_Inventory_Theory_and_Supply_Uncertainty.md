---
title: "Inventory Theory & Supply Uncertainty"
module: "Module 7"
week: 7
order: 7
description: "Manage stock mathematically under uncertain demand"
---

# Module 7: Inventory Theory & Supply Uncertainty

## Introduction

Inventory management balances stockout costs against overstock costs under demand uncertainty. This module applies the newsvendor model, safety stock calculations, and service level optimization.

## Learning Objectives

- Understand inventory trade-offs
- Model stockout vs overstock costs
- Calculate service levels
- Apply risk pooling
- Use newsvendor model
- Apply normal approximations
- Calculate quantiles and safety stock
- Plan seasonal inventory
- Optimize SKU-level replenishment
- Make warehouse capacity decisions

## Inventory Trade-offs

### Cost Components

**Holding cost:**
```
Cost_holding = Inventory × Holding_cost_rate × Time
```

**Stockout cost:**
```
Cost_stockout = Stockout_units × Stockout_cost_per_unit
```

**Ordering cost:**
```
Cost_ordering = Number_of_orders × Cost_per_order
```

**Total cost:**
```
Total_cost = Cost_holding + Cost_stockout + Cost_ordering
```

### Trade-off

**More inventory:**
```
Lower stockout risk
Higher holding cost
```

**Less inventory:**
```
Lower holding cost
Higher stockout risk
```

**Optimal:**
```
Balance costs
Minimize total cost
```

## Stockout vs Overstock Costs

### Stockout Cost

**Components:**
```
Lost_sales
Customer_dissatisfaction
Backorder_costs
```

**Mathematical:**
```
E[Stockout_cost] = P(Stockout) × Stockout_cost × E[Shortage]
```

**Service level:**
```
Service_level = 1 - P(Stockout)
```

### Overstock Cost

**Components:**
```
Holding_cost
Obsolescence
Markdown_costs
```

**Mathematical:**
```
E[Overstock_cost] = P(Overstock) × Overstock_cost × E[Excess]
```

### Cost Balance

**Optimal:**
```
E[Stockout_cost] = E[Overstock_cost]
At optimal inventory level
```

**Mathematical:**
```
P(Stockout) × C_s = P(Overstock) × C_o
```

## Service Levels

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
β ≥ α (fill rate ≥ cycle service level)
```

### Service Level Calculation

**Normal demand:**
```
Service_level = P(Demand ≤ Inventory)
Service_level = Φ((Inventory - μ) / σ)
```

**Inverse:**
```
Inventory = μ + z_α × σ
where z_α = quantile for service level α
```

## Risk Pooling

### Pooling Effect

**Multiple locations:**
```
Var(Total_demand) < Σ Var(Demand_i) if correlated
```

**Mathematical:**
```
Var(Σ X_i) = Σ Var(X_i) + 2×Σ Cov(X_i, X_j)
```

**If independent:**
```
Var(Σ X_i) = Σ Var(X_i)
```

**If perfectly correlated:**
```
Var(Σ X_i) = (Σ σ_i)²
```

### Pooling Benefits

**Safety stock reduction:**
```
Safety_stock_pooled < Σ Safety_stock_i
```

**Cost savings:**
```
Reduced_inventory = Benefit of pooling
```

## Core Mathematics

### Newsvendor Model

**Problem:**
```
Single period
Uncertain demand
Order quantity decision
```

**Costs:**
```
C_o = Overstock cost per unit
C_s = Stockout cost per unit
```

**Optimal order:**
```
Q* = F^(-1)(C_s / (C_o + C_s))
where F = demand CDF
```

**Critical ratio:**
```
Critical_ratio = C_s / (C_o + C_s)
```

### Normal Approximations

**Demand:**
```
Demand ~ N(μ, σ²)
```

**Inventory:**
```
Inventory = μ + z_α × σ
```

**Service level:**
```
Service_level = Φ((Inventory - μ) / σ)
```

**Approximation:**
```
Works well for large mean
Central limit theorem
```

### Quantiles & Safety Stock Formulas

**Safety stock:**
```
SS = z_α × σ_L
where:
  z_α = quantile for service level
  σ_L = lead time demand std dev
```

**Lead time demand:**
```
σ_L² = L × σ_D² + D² × σ_L²
where:
  L = lead time
  σ_D = demand std dev
  σ_L = lead time std dev
```

**Reorder point:**
```
ROP = D_L + SS
where D_L = average lead time demand
```

## Industry Applications

### Seasonal Inventory Planning

**Seasonal demand:**
```
Demand_season = Base × Seasonal_factor
```

**Planning:**
```
Inventory_season = Forecast_season × Safety_factor
```

**Optimization:**
```
Balance: Stockout_risk vs Overstock_cost
Account for seasonality
```

### SKU-Level Replenishment

**EOQ:**
```
Q* = √(2 × D × S / H)
where:
  D = demand rate
  S = ordering cost
  H = holding cost
```

**Replenishment:**
```
Order when: Inventory ≤ ROP
Order quantity: EOQ or (Target - Current)
```

**Multi-SKU:**
```
Optimize across SKUs
Subject to: Budget, Space_constraints
```

### Warehouse Capacity Decisions

**Capacity planning:**
```
Capacity_needed = Σ Inventory_i for all SKUs
```

**Optimization:**
```
Minimize: Total_cost
Subject to: Capacity ≤ Capacity_max
```

**Trade-off:**
```
More capacity → Lower stockout risk
Less capacity → Lower cost
```

## Exercises

1. **Newsvendor:** Solve newsvendor problem
2. **Safety Stock:** Calculate safety stock for service level
3. **Risk Pooling:** Analyze pooling benefits
4. **Replenishment:** Design SKU replenishment policy

## Case Studies

- Seasonal inventory optimization
- Multi-SKU inventory management
- Warehouse capacity planning
- Service level optimization
- Risk pooling strategies
