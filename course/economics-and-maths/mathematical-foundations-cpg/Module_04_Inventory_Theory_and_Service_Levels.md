---
title: "Inventory Theory & Service Levels"
module: "Module 4"
week: 4
order: 4
description: "Balance cost, service, and risk using inventory mathematics"
---

# Module 4: Inventory Theory & Service Levels

## Introduction

Inventory management balances competing objectives: minimizing costs while maintaining service levels. This module applies mathematical models to optimize inventory policies, calculate safety stock, and manage expiry and obsolescence risks.

## Learning Objectives

- Calculate Economic Order Quantity (EOQ)
- Determine safety stock under uncertainty
- Define and calculate service levels (α, β)
- Model expiry and obsolescence risk
- Apply Little's Law
- Design inventory policies aligned with business objectives

## Economic Order Quantity (EOQ)

### Basic EOQ Model

**Assumptions:**
- Constant demand rate
- Fixed ordering cost
- Fixed holding cost
- No stockouts allowed
- Instantaneous replenishment

**Total cost:**
```
TC = (D/Q) × S + (Q/2) × H
where:
  D = annual demand
  Q = order quantity
  S = ordering cost per order
  H = holding cost per unit per year
```

**Optimal order quantity:**
```
EOQ = √(2DS/H)
```

**Derivation:**
```
dTC/dQ = -DS/Q² + H/2 = 0
→ Q* = √(2DS/H)
```

**Properties:**
- Ordering cost = Holding cost at EOQ
- Total cost is relatively flat near EOQ
- Robust to parameter estimation errors

### EOQ with Quantity Discounts

**Price breaks:**
```
Price = P₁ if Q < Q₁
Price = P₂ if Q₁ ≤ Q < Q₂
Price = P₃ if Q ≥ Q₂
```

**Optimization:**
```
For each price break:
  Calculate EOQ at that price
  Check if EOQ is in valid range
  Calculate total cost including purchase cost
Select minimum total cost
```

## Safety Stock Under Uncertainty

### Service Level Definitions

**Type I (α) service level:**
```
α = P(Stockout in a cycle) = P(Demand > Reorder_point)
```

**Type II (β) service level (fill rate):**
```
β = 1 - (Expected_shortage / Expected_demand)
```

**Relationship:**
```
β ≥ α (fill rate ≥ cycle service level)
```

### Safety Stock Calculation

**Under normal demand:**
```
Safety_stock = z_α × σ_L
where:
  z_α = standard normal quantile for service level α
  σ_L = standard deviation of lead time demand
```

**Lead time demand variance:**
```
σ_L² = L × σ_D² + D² × σ_L²
where:
  L = average lead time
  σ_D = demand standard deviation
  σ_L = lead time standard deviation
```

**Reorder point:**
```
ROP = D_L + Safety_stock
where D_L = average lead time demand
```

### Service Level Optimization

**Cost of stockout:**
```
Expected_stockout_cost = P(Stockout) × Cost_per_stockout × Frequency
```

**Optimal service level:**
```
Optimal_α = 1 - (H / (C_s × D))
where:
  H = holding cost
  C_s = stockout cost per unit
  D = demand rate
```

## Expiry and Obsolescence Risk

### Expiry Risk Model

**First-In-First-Out (FIFO):**
```
Inventory_age = Current_time - Receipt_time
```

**Expiry probability:**
```
P(Expiry) = P(Age > Shelf_life)
```

**Expected waste:**
```
Expected_waste = Σ P(Expiry_i) × Quantity_i
```

### Obsolescence Risk

**Obsolescence rate:**
```
λ_obs = -d(Value)/dt / Value
```

**Expected obsolescence cost:**
```
E[Obsolescence_cost] = P(Obsolescence) × Inventory_value
```

**Markdown optimization:**
```
Optimal_markdown = argmax(Revenue - Cost)
where Revenue = f(Markdown, Remaining_life)
```

## Little's Law

### Basic Law

```
L = λ × W
where:
  L = average number in system
  λ = arrival rate
  W = average time in system
```

### CPG Applications

**Inventory turnover:**
```
Inventory = Demand_rate × Time_in_inventory
```

**Throughput time:**
```
Throughput_time = Inventory / Throughput_rate
```

**Work-in-process:**
```
WIP = Production_rate × Cycle_time
```

## Key Models

### Safety Stock Equations

**Normal demand, constant lead time:**
```
SS = z_α × σ_D × √L
```

**Variable lead time:**
```
SS = z_α × √(L×σ_D² + D²×σ_L²)
```

**Demand and lead time both variable:**
```
SS = z_α × √(L×σ_D² + D²×σ_L² + σ_D²×σ_L²)
```

### Service Level Calculations

**Cycle service level:**
```
α = 1 - P(Demand > ROP)
α = 1 - Φ((ROP - μ_L) / σ_L)
```

**Fill rate:**
```
β = 1 - E[Shortage] / E[Demand]
β = 1 - (σ_L × f(z_α)) / D
where f(z) = standard normal PDF
```

## Exercises

1. **EOQ Calculation:** Calculate optimal order quantity
2. **Safety Stock:** Determine safety stock for target service level
3. **Service Level:** Calculate fill rate from cycle service level
4. **Expiry Management:** Optimize inventory to minimize waste

## Case Studies

- Multi-echelon inventory optimization
- Perishable goods inventory management
- Seasonal demand safety stock
- Service level vs cost trade-offs
- Obsolescence risk mitigation
