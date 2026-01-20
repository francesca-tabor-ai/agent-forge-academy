---
title: "Manufacturing & Operations Efficiency"
module: "Module 5"
week: 5
order: 5
description: "Optimize production systems mathematically"
---

# Module 5: Manufacturing & Operations Efficiency

## Introduction

Manufacturing efficiency directly impacts CPG profitability. This module applies mathematical models to optimize capacity, throughput, line balancing, changeovers, and overall equipment effectiveness (OEE).

## Learning Objectives

- Calculate capacity, throughput, and identify bottlenecks
- Balance production lines mathematically
- Model changeovers and SKU complexity
- Decompose OEE and analyze yield losses
- Apply queueing theory to production systems
- Use constraint optimization for operations

## Capacity, Throughput, and Bottlenecks

### Capacity Calculation

**Theoretical capacity:**
```
Capacity_theoretical = (Available_time × Units_per_time) / Cycle_time
```

**Effective capacity:**
```
Capacity_effective = Capacity_theoretical × Efficiency
```

**Actual throughput:**
```
Throughput = Capacity_effective × Utilization
```

### Bottleneck Analysis

**Bottleneck identification:**
```
Bottleneck = min(Capacity_i) across all stages i
```

**System throughput:**
```
Throughput_system = Throughput_bottleneck
```

**Bottleneck utilization:**
```
Utilization_bottleneck = Demand / Capacity_bottleneck
```

**Improvement impact:**
```
ΔThroughput = ΔCapacity_bottleneck (if bottleneck is improved)
ΔThroughput = 0 (if non-bottleneck is improved)
```

## Line Balancing

### Balance Efficiency

**Line efficiency:**
```
Efficiency = Σ(Work_time_i) / (N_stations × Cycle_time)
```

**Balance delay:**
```
Balance_delay = 1 - Efficiency
```

**Optimal number of stations:**
```
N_min = ⌈Total_work_time / Cycle_time⌉
```

### Assembly Line Balancing Problem

**Objective:**
```
Minimize: N_stations
Subject to:
  Σ(Work_time_j) ≤ Cycle_time  for each station j
  Precedence constraints
```

**Mathematical formulation:**
```
Minimize: Σ x_j
Subject to:
  Σ(t_i × x_ij) ≤ CT × x_j  for all j
  Σ x_ij = 1  for all i (each task assigned once)
  Precedence: x_ij ≤ x_kj  if task i precedes task k
where:
  x_j = 1 if station j is used
  x_ij = 1 if task i assigned to station j
  t_i = time for task i
  CT = cycle time
```

## Changeovers and SKU Complexity

### Changeover Cost Model

**Changeover time:**
```
Changeover_time = Setup_time + Cleanup_time + Adjustment_time
```

**Changeover cost:**
```
Cost_changeover = (Changeover_time × Labor_rate) + (Material_waste × Cost_per_unit)
```

**Frequency:**
```
Changeovers_per_period = Production_runs_per_period
```

**Total changeover cost:**
```
Total_cost = Changeover_cost × Changeover_frequency
```

### SKU Complexity Impact

**Complexity index:**
```
Complexity = f(Number_SKUs, Changeover_frequency, Setup_time)
```

**Throughput impact:**
```
Throughput_effective = Throughput_theoretical × (1 - Changeover_loss)
where Changeover_loss = Total_changeover_time / Available_time
```

**Optimal SKU portfolio:**
```
Maximize: Profit = Σ(Revenue_i - Cost_i)
Subject to: Capacity_constraints
```

## OEE and Yield Losses

### OEE Decomposition

**Overall Equipment Effectiveness:**
```
OEE = Availability × Performance × Quality
```

**Availability:**
```
Availability = (Operating_time - Downtime) / Operating_time
Availability = Uptime / Planned_production_time
```

**Performance:**
```
Performance = (Actual_output / Ideal_output)
Performance = (Actual_output × Cycle_time) / Operating_time
```

**Quality:**
```
Quality = Good_units / Total_units
Quality = 1 - (Defect_rate)
```

**OEE calculation:**
```
OEE = Availability × Performance × Quality
OEE = (Good_units × Cycle_time) / Planned_production_time
```

### Yield Losses

**First-pass yield:**
```
FPY = Good_units_first_pass / Total_units_started
```

**Rolled throughput yield:**
```
RTY = Π(FPY_i) across all stages i
```

**Yield loss cost:**
```
Cost_yield_loss = (Units_lost × Cost_per_unit) + (Rework_cost)
```

## Queueing Theory

### Basic Queueing Models

**M/M/1 Queue:**
- Poisson arrivals
- Exponential service
- Single server

**Utilization:**
```
ρ = λ / μ
where:
  λ = arrival rate
  μ = service rate
```

**Stability condition:**
```
ρ < 1 (arrival rate < service rate)
```

**Average number in system:**
```
L = ρ / (1 - ρ)
```

**Average time in system:**
```
W = 1 / (μ - λ)
```

### Production Queueing

**Work-in-process:**
```
WIP = Throughput × Cycle_time
```

**Little's Law application:**
```
WIP = Arrival_rate × Flow_time
```

**Bottleneck queue:**
```
Queue_length = (Utilization / (1 - Utilization)) × (1 + CV²) / 2
where CV = coefficient of variation
```

## Constraint Optimization

### Linear Programming

**Standard form:**
```
Maximize: cᵀx
Subject to:
  Ax ≤ b
  x ≥ 0
```

**Production planning:**
```
Maximize: Σ(Profit_i × Quantity_i)
Subject to:
  Σ(Resource_j_i × Quantity_i) ≤ Capacity_j  for all resources j
  Quantity_i ≥ 0
```

### Theory of Constraints

**Five focusing steps:**
1. Identify constraint
2. Exploit constraint
3. Subordinate to constraint
4. Elevate constraint
5. Repeat if constraint moves

**Mathematical approach:**
```
Maximize: Throughput
Subject to: Constraint_capacity
Minimize: Inventory and Operating_expense
```

## Exercises

1. **Capacity Analysis:** Calculate system capacity and identify bottlenecks
2. **Line Balancing:** Balance assembly line for optimal efficiency
3. **OEE Calculation:** Decompose OEE and identify improvement opportunities
4. **Queueing Analysis:** Model production queue and optimize flow

## Case Studies

- Bottleneck elimination projects
- Line balancing optimization
- Changeover time reduction
- OEE improvement initiatives
- Production planning optimization
