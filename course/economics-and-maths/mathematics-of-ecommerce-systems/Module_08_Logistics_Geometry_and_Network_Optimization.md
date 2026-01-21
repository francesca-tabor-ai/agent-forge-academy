---
title: "Logistics, Geometry & Network Optimization"
module: "Module 8"
week: 8
order: 8
description: "Minimize fulfillment and delivery costs using geometric and network models"
---

# Module 8: Logistics, Geometry & Network Optimization

## Introduction

E-commerce logistics requires optimization of warehouse operations, routing, and capacity. This module applies geometry, graph theory, and queueing models to minimize fulfillment and delivery costs.

## Learning Objectives

- Optimize warehouse geometry
- Solve routing problems
- Apply queuing theory
- Plan capacity
- Use graph theory
- Solve Traveling Salesperson Problem (TSP)
- Apply queueing models (M/M/1)
- Optimize picker paths
- Route last-mile delivery
- Reduce customer support wait times

## Warehouse Geometry

### Layout Optimization

**Objective:**
```
Minimize: Picking_time
Subject to: Space_constraints
```

**Factors:**
```
Distance between locations
Item frequency
Item relationships
```

**Mathematical:**
```
Total_distance = Σ Distance(location_i, location_j) × Frequency_ij
```

### Storage Optimization

**ABC analysis:**
```
A items: High frequency, close location
B items: Medium frequency, medium location
C items: Low frequency, far location
```

**Optimization:**
```
Minimize: Σ(Frequency_i × Distance_i)
Subject to: Capacity_constraints
```

### Picking Efficiency

**Path optimization:**
```
Minimize: Total_picking_distance
Subject to: All_items_picked
```

**TSP application:**
```
Find shortest path visiting all locations
Return to start
```

## Routing Problems

### Traveling Salesperson Problem (TSP)

**Definition:**
```
Visit all cities exactly once
Return to start
Minimize total distance
```

**Mathematical:**
```
Minimize: Σ d_ij × x_ij
Subject to:
  Σ x_ij = 1 for all i (depart each city once)
  Σ x_ij = 1 for all j (arrive each city once)
  No subtours
```

**Complexity:**
```
NP-hard
Heuristic solutions for large instances
```

### Vehicle Routing Problem (VRP)

**Extension of TSP:**
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

### Last-Mile Delivery

**Problem:**
```
Deliver packages to customers
Minimize distance/time
```

**Constraints:**
```
Vehicle capacity
Time windows
Driver hours
```

**Optimization:**
```
Route_optimization = VRP variant
Minimize: Delivery_cost
```

## Queuing Theory

### Basic Queue Model

**M/M/1 Queue:**
```
Poisson arrivals
Exponential service
Single server
```

**Utilization:**
```
ρ = λ / μ
where:
  λ = arrival rate
  μ = service rate
```

**Stability:**
```
ρ < 1
```

### Queue Metrics

**Average number in system:**
```
L = ρ / (1 - ρ)
```

**Average time in system:**
```
W = 1 / (μ - λ)
```

**Average queue length:**
```
L_q = ρ² / (1 - ρ)
```

**Average waiting time:**
```
W_q = ρ / (μ - λ)
```

## Capacity Planning

### Capacity Calculation

**Required capacity:**
```
Capacity = Arrival_rate / Service_rate
Capacity = λ / μ
```

**Target utilization:**
```
Utilization_target = 70-80%
Capacity = Arrival_rate / (Utilization_target × Service_rate)
```

### Capacity Optimization

**Cost model:**
```
Total_cost = Capacity_cost + Waiting_cost
```

**Optimization:**
```
Minimize: Total_cost
Subject to: Service_level_constraints
```

**Optimal:**
```
dTotal_cost/dCapacity = 0
```

## Core Mathematics

### Graph Theory

**Graph:**
```
G = (V, E)
where:
  V = vertices (locations)
  E = edges (connections)
```

**Shortest path:**
```
Dijkstra's algorithm
Bellman-Ford algorithm
```

**Minimum spanning tree:**
```
Kruskal's algorithm
Prim's algorithm
```

### Traveling Salesperson Problem (TSP)

**Formulation:**
```
Minimize: Σ d_ij × x_ij
Subject to:
  Σ x_ij = 1 for all i
  Σ x_ij = 1 for all j
  Subtour elimination constraints
```

**Heuristics:**
```
Nearest neighbor
2-opt
Genetic algorithms
```

### Queueing Models (M/M/1)

**Arrival process:**
```
Poisson: P(Arrivals = k in time t) = (λt)^k × exp(-λt) / k!
```

**Service process:**
```
Exponential: P(Service_time > t) = exp(-μt)
```

**Steady-state:**
```
P(n in system) = (1 - ρ) × ρ^n
```

## Industry Applications

### Picker Path Optimization

**Warehouse picking:**
```
Optimize path through warehouse
Minimize distance/time
```

**TSP application:**
```
Locations = Pick_locations
Distance = Travel_distance
Solve TSP
```

**Savings:**
```
Distance_reduction = 20-40% typical
```

### Last-Mile Delivery Routing

**Delivery optimization:**
```
Multiple stops
Minimize total distance
```

**VRP:**
```
Vehicle Routing Problem
Multiple vehicles
Capacity constraints
```

**Optimization:**
```
Route_optimization software
Real-time routing
```

### Customer Support Wait-Time Reduction

**Queue management:**
```
Reduce wait times
Improve service
```

**Capacity:**
```
Add agents if: Utilization > Target
Remove agents if: Utilization < Target
```

**Optimization:**
```
Minimize: Wait_time_cost + Agent_cost
```

## Exercises

1. **TSP:** Solve traveling salesperson problem
2. **Routing:** Optimize delivery routes
3. **Queueing:** Model and optimize queue system
4. **Capacity:** Plan capacity for service level

## Case Studies

- Warehouse picking optimization
- Last-mile delivery routing
- Customer support capacity planning
- Fulfillment center optimization
- Network design
