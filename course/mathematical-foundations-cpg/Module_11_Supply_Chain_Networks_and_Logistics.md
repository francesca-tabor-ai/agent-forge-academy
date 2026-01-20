---
title: "Supply Chain Networks & Logistics"
module: "Module 11"
week: 11
order: 11
description: "Optimize flows across complex networks"
---

# Module 11: Supply Chain Networks & Logistics

## Introduction

CPG supply chains are complex networks requiring optimization of flows, costs, and resilience. This module applies network optimization, transportation modeling, and variance analysis to design efficient supply chains.

## Learning Objectives

- Optimize network flows using linear programming
- Model transportation costs
- Design multi-echelon supply chains
- Quantify and mitigate bullwhip effect
- Calculate variance amplification metrics

## Network Flow Optimization

### Minimum Cost Flow

**Problem:**
```
Minimize: Σ(c_ij × x_ij)
Subject to:
  Flow_conservation: Σ x_ij - Σ x_ji = b_i
  Capacity: x_ij ≤ u_ij
  Non-negativity: x_ij ≥ 0
```

**Where:**
- c_ij = cost per unit flow on arc (i,j)
- x_ij = flow on arc (i,j)
- u_ij = capacity of arc (i,j)
- b_i = supply/demand at node i

### Transportation Problem

**Special case:**
```
Sources: Factories (supply)
Sinks: Warehouses (demand)
```

**Formulation:**
```
Minimize: Σ Σ(c_ij × x_ij)
Subject to:
  Σ x_ij = Supply_i  (from each source)
  Σ x_ij = Demand_j  (to each sink)
  x_ij ≥ 0
```

**Solution methods:**
- Simplex method
- Transportation algorithm
- Network simplex

## Transportation Cost Modeling

### Cost Components

**Fixed costs:**
```
Cost_fixed = Cost_per_shipment × Number_of_shipments
```

**Variable costs:**
```
Cost_variable = Cost_per_unit_distance × Distance × Quantity
```

**Total cost:**
```
Cost_total = Cost_fixed + Cost_variable
```

### Distance Metrics

**Euclidean:**
```
d = √[(x₂-x₁)² + (y₂-y₁)²]
```

**Manhattan:**
```
d = |x₂-x₁| + |y₂-y₁|
```

**Haversine (great circle):**
```
d = 2R × arcsin(√[sin²(Δφ/2) + cos(φ₁)cos(φ₂)sin²(Δλ/2)])
```

### Economies of Scale

**Cost per unit:**
```
Cost_per_unit = (Fixed_cost / Quantity) + Variable_cost
```

**Optimal shipment size:**
```
Q* = √(2 × Fixed_cost × Demand / Variable_cost_per_unit)
```

## Multi-Echelon Supply Chains

### Network Structure

**Echelons:**
1. Suppliers
2. Factories
3. Distribution centers
4. Retailers
5. Customers

### Multi-Echelon Inventory

**System-wide optimization:**
```
Minimize: Total_cost = Σ(Cost_i across all echelons)
Subject to: Service_level_constraints
```

**Installation stock policy:**
```
Reorder when inventory ≤ ROP
Order up to S
```

**Echelon stock policy:**
```
Consider inventory at current and downstream echelons
```

### Network Design

**Facility location:**
```
Minimize: Fixed_costs + Transportation_costs
Subject to:
  Demand_satisfaction
  Capacity_constraints
```

**Mixed integer programming:**
```
y_i = 1 if facility i is open
x_ij = flow from i to j
```

## Bullwhip Effect

### Variance Amplification

**Definition:**
```
Bullwhip = Var(Order) / Var(Demand)
```

**Amplification:**
```
Bullwhip > 1: Variance increases upstream
Bullwhip = 1: No amplification
Bullwhip < 1: Variance decreases (rare)
```

### Causes

**Forecasting:**
```
Order = Forecast + Safety_stock
Forecast_error amplifies upstream
```

**Lead time:**
```
Longer lead time → More safety stock → More variance
```

**Batching:**
```
Order batching increases variance
```

**Price variations:**
```
Forward buying creates demand spikes
```

### Mitigation

**Information sharing:**
```
Share POS data upstream
Reduce forecast error
```

**Vendor-managed inventory:**
```
Supplier manages inventory
Reduces order variance
```

**Collaborative planning:**
```
CPFR: Collaborative Planning, Forecasting, and Replenishment
```

## Variance Amplification Metrics

### Coefficient of Variation

**Definition:**
```
CV = σ / μ
```

**Amplification:**
```
CV_order / CV_demand = Bullwhip_measure
```

### Autocorrelation

**Demand autocorrelation:**
```
ρ_k = Corr(Demand_t, Demand_{t-k})
```

**Impact on bullwhip:**
```
Higher autocorrelation → Higher bullwhip
```

### Lead Time Impact

**Variance with lead time:**
```
Var(Lead_time_demand) = L × Var(Demand) + Demand² × Var(Lead_time)
```

**Bullwhip contribution:**
```
Bullwhip ∝ Lead_time
```

## Key Models

### Linear Programming

**Standard form:**
```
Minimize: cᵀx
Subject to:
  Ax = b
  x ≥ 0
```

**Network flow:**
```
A = node-arc incidence matrix
b = supply/demand vector
c = cost vector
```

### Variance Amplification Metrics

**Bullwhip ratio:**
```
BW = Var(Order) / Var(Demand)
```

**For AR(1) demand:**
```
BW = 1 + (2Lρ / (1-ρ)) + (2L²ρ² / (1-ρ)²)
where:
  L = lead time
  ρ = autocorrelation
```

## Exercises

1. **Network Optimization:** Solve minimum cost flow problem
2. **Transportation:** Optimize distribution network
3. **Bullwhip Analysis:** Calculate variance amplification
4. **Multi-Echelon:** Design optimal supply chain network

## Case Studies

- Distribution network optimization
- Bullwhip effect reduction
- Multi-echelon inventory optimization
- Transportation cost reduction
- Supply chain resilience design
