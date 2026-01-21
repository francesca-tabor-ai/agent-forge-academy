---
title: "Multi-Echelon & Network Design"
module: "Module 7"
week: 7
order: 7
description: "How should inventory and capacity be positioned across tiers?"
---

# Module 7: Multi-Echelon & Network Design

## Introduction

Multi-echelon systems require optimal inventory and capacity allocation across tiers. This module covers echelon stock, centralization vs. decentralization, and network resilience.

## Learning Objectives

- Distinguish echelon stock vs. local stock
- Compare centralization vs. decentralization
- Design network resilience
- Apply multi-echelon inventory theory
- Use facility location models
- Apply scenario-based optimization
- Allocate inventory optimally across nodes
- Design robust, cost-efficient networks

## Echelon Stock vs. Local Stock

### Local Stock

**Definition:**
```
Inventory at specific location
Local_view
```

**Replenishment:**
```
Based on local_demand
Local_ROP
```

**Limitation:**
```
Ignores upstream inventory
Suboptimal
```

### Echelon Stock

**Definition:**
```
Inventory at location + downstream
System_view
```

**Calculation:**
```
Echelon_stock_i = Local_stock_i + Σ Echelon_stock_j for all j downstream
```

**Advantage:**
```
System-wide optimization
Better coordination
```

### Comparison

**Local:**
```
Simple
Decentralized
Suboptimal
```

**Echelon:**
```
Complex
Centralized
Optimal
```

## Centralization vs. Decentralization

### Centralization

**Structure:**
```
Single central warehouse
Serves all demand
```

**Advantages:**
- Risk pooling
- Lower total inventory
- Economies of scale

**Disadvantages:**
- Longer lead times
- Higher transportation cost
- Single point of failure

### Decentralization

**Structure:**
```
Multiple local warehouses
Each serves nearby demand
```

**Advantages:**
- Shorter lead times
- Lower transportation cost
- Resilience

**Disadvantages:**
- Higher total inventory
- Less risk pooling
- More facilities

### Hybrid

**Structure:**
```
Central + regional warehouses
Balance benefits
```

**Optimization:**
```
Minimize: Total_cost
Subject to: Service_level_constraints
```

## Network Resilience

### Resilience Definition

**Ability to:**
```
Absorb disruptions
Recover quickly
Maintain service
```

**Metrics:**
```
Time_to_recover
Service_level_during_disruption
Cost_of_disruption
```

### Resilience Design

**Redundancy:**
```
Multiple suppliers
Multiple facilities
Multiple routes
```

**Flexibility:**
```
Excess capacity
Alternative routes
Backup suppliers
```

**Visibility:**
```
Real-time monitoring
Early warning
Rapid response
```

## Mathematical Tools

### Multi-Echelon Inventory Theory

**Echelon stock:**
```
Echelon_stock_i = Local_i + Σ Echelon_j for j downstream
```

**Optimal policy:**
```
(s, S) policy at echelon level
s_i = Echelon_ROP
S_i = Echelon_order_up_to
```

**Optimization:**
```
Minimize: Total_cost
Subject to: Service_level_constraints
```

### Facility Location Models

**p-Median:**
```
Choose p facilities
Minimize: Total_distance
```

**p-Center:**
```
Choose p facilities
Minimize: Maximum_distance
```

**Capacitated:**
```
Facility_capacity_constraints
Demand_assignment
```

**Mathematical:**
```
Minimize: Σ f_i × y_i + Σ c_ij × x_ij
Subject to:
  Σ x_ij = 1 for all j
  Σ x_ij ≤ Capacity_i × y_i for all i
  y_i ∈ {0, 1}
```

### Scenario-Based Optimization

**Scenarios:**
```
S = {s₁, s₂, ..., s_n}
P(s_i) = Probability of scenario i
```

**Expected value:**
```
E[Cost] = Σ P(s_i) × Cost(s_i)
```

**Robust optimization:**
```
Minimize: Worst_case_cost
Or: Minimize: E[Cost] + λ × Risk
```

## Learning Outcomes

### Allocating Inventory Across Nodes

**Optimization:**
```
Minimize: Total_inventory_cost
Subject to: Service_level_constraints
```

**Echelon approach:**
```
Optimize echelon_stock
Allocate to locations
```

**Multi-item:**
```
Optimize across items
Subject to: Budget, Space_constraints
```

### Designing Robust Networks

**Objectives:**
```
Minimize: Cost
Maximize: Resilience
```

**Trade-off:**
```
More resilience → Higher cost
Less resilience → Lower cost
```

**Optimization:**
```
Minimize: Cost + λ × Risk
where λ = risk_aversion
```

## Exercises

1. **Echelon Stock:** Calculate echelon stock and optimize
2. **Facility Location:** Design facility network
3. **Resilience:** Analyze and improve network resilience
4. **Multi-Echelon:** Optimize multi-echelon system

## Case Studies

- Multi-echelon inventory optimization
- Distribution network design
- Centralization vs. decentralization
- Network resilience improvement
- Facility location optimization
