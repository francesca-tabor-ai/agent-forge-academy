---
title: "Transportation, Routing & Network Optimization"
module: "Module 6"
week: 6
order: 6
description: "How are logistics decisions optimized at scale?"
---

# Module 6: Transportation, Routing & Network Optimization

## Introduction

Transportation and routing optimization minimize logistics costs. This module covers transportation cost structures, routing problems, and network optimization.

## Learning Objectives

- Understand transportation cost structures
- Solve routing under constraints
- Optimize multi-node distribution networks
- Apply linear programming
- Solve Vehicle Routing Problem (VRP)
- Use min-cost flow models
- Formulate logistics problems as optimization models
- Interpret solver outputs for real-world decisions

## Transportation Cost Structures

### Cost Components

**Fixed cost:**
```
Cost_fixed = Cost_per_trip
```

**Variable cost:**
```
Cost_variable = Cost_per_distance × Distance
Cost_variable = Cost_per_weight × Weight
```

**Total:**
```
Cost_total = Cost_fixed + Cost_variable
```

### Cost Functions

**Linear:**
```
Cost = a + b × Distance
```

**Step function:**
```
Cost = a_i if Distance in range i
```

**Economies of scale:**
```
Cost = a × Distance^b where b < 1
```

## Routing Under Constraints

### Traveling Salesperson Problem (TSP)

**Problem:**
```
Visit all cities exactly once
Return to start
Minimize total distance
```

**Mathematical:**
```
Minimize: Σ d_ij × x_ij
Subject to:
  Σ x_ij = 1 for all i
  Σ x_ij = 1 for all j
  No subtours
```

**Complexity:**
```
NP-hard
Heuristic solutions for large instances
```

### Vehicle Routing Problem (VRP)

**Extension:**
```
Multiple vehicles
Capacity constraints
Time windows
```

**Mathematical:**
```
Minimize: Total_distance
Subject to:
  All customers served
  Vehicle_capacity_constraints
  Time_window_constraints
```

**Variants:**
- CVRP (Capacitated VRP)
- VRPTW (VRP with Time Windows)
- VRP with Pickup and Delivery

## Multi-Node Distribution Networks

### Network Flow

**Min-cost flow:**
```
Minimize: Σ c_ij × f_ij
Subject to:
  Flow_balance at each node
  Capacity_constraints
  Demand_satisfaction
```

**Formulation:**
```
Minimize: cᵀf
Subject to: Af = b, 0 ≤ f ≤ u
```

### Facility Location

**Problem:**
```
Choose facility locations
Minimize: Fixed_cost + Transportation_cost
```

**Mathematical:**
```
Minimize: Σ f_i × y_i + Σ c_ij × x_ij
Subject to:
  Demand_satisfaction
  Facility_capacity
  y_i ∈ {0, 1} (open/close)
```

## Mathematical Tools

### Linear Programming

**Standard form:**
```
Minimize: cᵀx
Subject to: Ax = b, x ≥ 0
```

**Dual:**
```
Maximize: bᵀy
Subject to: Aᵀy ≤ c
```

**Solution:**
```
Simplex method
Interior point methods
```

### Vehicle Routing Problem (VRP)

**Formulation:**
```
Minimize: Σ Σ d_ij × x_ijk
Subject to:
  Σ x_ijk = 1 for all customers j
  Σ x_ijk ≤ Capacity_k for all vehicles k
  Route_feasibility
```

**Heuristics:**
- Nearest neighbor
- Savings algorithm
- 2-opt, 3-opt
- Genetic algorithms

### Min-Cost Flow Models

**Problem:**
```
Send flow through network
Minimize total cost
```

**Formulation:**
```
Minimize: Σ c_ij × f_ij
Subject to:
  Σ f_ji - Σ f_ij = b_i for all nodes i
  0 ≤ f_ij ≤ u_ij for all arcs (i,j)
```

**Solution:**
```
Network simplex
Successive shortest path
```

## Learning Outcomes

### Formulating Logistics Problems

**Steps:**
1. Define decision variables
2. Formulate objective
3. Specify constraints
4. Solve optimization problem

**Example:**
```
Variables: x_ij = flow from i to j
Objective: Minimize total cost
Constraints: Flow balance, capacity, demand
```

### Interpreting Solver Outputs

**Solution:**
```
Optimal values of decision variables
Optimal objective value
```

**Sensitivity:**
```
Shadow prices
Reduced costs
Allowable ranges
```

**Implementation:**
```
Translate solution to actions
Validate feasibility
Monitor performance
```

## Exercises

1. **TSP:** Solve traveling salesperson problem
2. **VRP:** Formulate and solve VRP
3. **Network Flow:** Solve min-cost flow problem
4. **Facility Location:** Optimize facility locations

## Case Studies

- Delivery route optimization
- Distribution network design
- Transportation cost reduction
- Multi-echelon distribution
- Network optimization
