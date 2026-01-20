---
title: "Optimization in Radio and Core Networks"
module: "Module 7"
week: 7
order: 7
description: "Allocate scarce resources efficiently"
---

# Module 7: Optimization in Radio and Core Networks

## Introduction

Resource allocation in telecom networks requires optimization. This module covers power control, scheduling, interference management, and fairness.

## Learning Objectives

- Optimize power control
- Design scheduling algorithms
- Manage interference
- Apply convex optimization
- Use utility maximization
- Apply Lagrange multipliers
- Understand proportional fairness
- Balance throughput, fairness, and energy use

## Power Control

### Power Optimization

**Objective:**
```
Maximize: Total_throughput
Or: Minimize: Total_power
Subject to: SINR_constraints
```

**SINR constraint:**
```
SINR_i = P_i × G_ii / (Σ P_j × G_ij + N_i) ≥ γ_i
```

**Optimization:**
```
Minimize: Σ P_i
Subject to: SINR_i ≥ γ_i for all i
```

### Distributed Power Control

**Iterative:**
```
P_i(t+1) = (γ_i / SINR_i(t)) × P_i(t)
```

**Convergence:**
```
Converges if feasible
Feasibility: Σ γ_i / G_ii < 1 (simplified)
```

## Scheduling

### Scheduling Problem

**Objective:**
```
Maximize: Utility(Throughput)
Subject to: Resource_constraints
```

**Resources:**
```
Time_slots
Frequency_bands
Spatial_streams
```

**Users:**
```
Multiple_users
Different_channels
Different_demands
```

### Proportional Fairness

**Utility:**
```
U_i = log(Throughput_i)
```

**Objective:**
```
Maximize: Σ log(Throughput_i)
```

**Properties:**
```
Balance: Throughput and fairness
No_user_gets_zero
Proportional_allocation
```

**Scheduling:**
```
Schedule user with highest: (Rate_i / Average_rate_i)
```

## Interference Management

### Interference Coordination

**Problem:**
```
Interference limits performance
Need coordination
```

**Methods:**
- Power control
- Frequency reuse
- Beamforming
- Interference cancellation

**Optimization:**
```
Minimize: Total_interference
Subject to: Throughput_constraints
```

### Frequency Reuse

**Reuse factor:**
```
K = Reuse_factor
1/K of spectrum per cell
```

**Trade-off:**
```
Higher_K → Lower_interference → Lower_capacity_per_cell
Lower_K → Higher_interference → Higher_capacity_per_cell
```

**Optimization:**
```
Choose K to maximize: Total_capacity
```

## Core Mathematics

### Convex Optimization

**Convex function:**
```
f(λx + (1-λ)y) ≤ λf(x) + (1-λ)f(y)
```

**Convex set:**
```
λx + (1-λ)y ∈ Set for x, y ∈ Set
```

**Properties:**
```
Local_minimum = Global_minimum
Efficient_algorithms
```

### Utility Maximization

**Utility function:**
```
U(Throughput)
```

**Common utilities:**
```
U(x) = log(x): Proportional_fairness
U(x) = x: Maximum_throughput
U(x) = -1/x: Minimum_delay
```

**Optimization:**
```
Maximize: Σ U_i(Throughput_i)
Subject to: Resource_constraints
```

### Lagrange Multipliers

**Problem:**
```
Minimize: f(x)
Subject to: g(x) = 0
```

**Lagrangian:**
```
L(x, λ) = f(x) - λ × g(x)
```

**KKT conditions:**
```
∇L = 0
g(x) = 0
```

**Solution:**
```
Solve system of equations
```

## Learning Outcomes

### Understanding Proportional Fairness

**Definition:**
```
Maximize: Σ log(Throughput_i)
```

**Properties:**
```
Balance throughput and fairness
No starvation
Proportional allocation
```

**Scheduling:**
```
PF_scheduler: argmax_i (Rate_i / Average_rate_i)
```

### Balancing Trade-offs

**Throughput vs. Fairness:**
```
Higher_throughput → Lower_fairness (often)
Higher_fairness → Lower_throughput (often)
```

**Energy vs. Performance:**
```
Higher_power → Higher_throughput
Lower_power → Lower_throughput
```

**Optimization:**
```
Multi-objective: Maximize w₁×Throughput + w₂×Fairness - w₃×Energy
```

## Exercises

1. **Power Control:** Optimize power allocation
2. **Scheduling:** Design fair scheduler
3. **Interference:** Manage interference
4. **Trade-offs:** Balance multiple objectives

## Case Studies

- 5G resource allocation
- LTE scheduling
- Interference coordination
- Energy-efficient networks
- Fairness optimization
