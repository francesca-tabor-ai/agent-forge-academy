---
title: "Infrastructure, Reliability & Performance Modeling"
module: "Module 8"
week: 8
order: 8
description: "Mathematics beneath SaaS operations"
---

# Module 8: Infrastructure, Reliability & Performance Modeling

## Introduction

SaaS infrastructure must balance performance, reliability, and cost. This module applies queueing theory, Little's Law, and reliability metrics to model and optimize infrastructure.

## Learning Objectives

- Apply queueing theory to SaaS systems
- Use Little's Law for capacity planning
- Calculate reliability metrics
- Model latency distributions
- Plan capacity under load
- Design error budgets and SLOs
- Balance cost vs reliability mathematically

## Queueing Theory

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
ρ < 1 (arrival rate < service rate)
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

### SaaS Applications

**API requests:**
```
Requests arrive at rate λ
Server processes at rate μ
Queue forms if λ > μ
```

**Database queries:**
```
Query arrival rate
Query processing rate
Queue management
```

## Little's Law

### Basic Law

**Little's Law:**
```
L = λ × W
where:
  L = average number in system
  λ = arrival rate
  W = average time in system
```

**Applications:**
```
Work_in_process = Throughput × Cycle_time
Inventory = Demand_rate × Time_in_system
```

### SaaS Applications

**Request processing:**
```
Requests_in_system = Request_rate × Processing_time
```

**User sessions:**
```
Active_sessions = Session_arrival_rate × Session_duration
```

**Capacity planning:**
```
Required_capacity = Expected_load / Target_processing_time
```

## Reliability Metrics

### Availability

**Definition:**
```
Availability = Uptime / (Uptime + Downtime)
```

**Percentage:**
```
Availability = (1 - Downtime_fraction) × 100%
```

**Targets:**
```
99% = 3.65 days downtime/year
99.9% = 8.76 hours downtime/year
99.99% = 52.56 minutes downtime/year
```

### Mean Time Between Failures (MTBF)

**Definition:**
```
MTBF = Total_operating_time / Number_of_failures
```

**Failure rate:**
```
λ = 1 / MTBF
```

### Mean Time To Repair (MTTR)

**Definition:**
```
MTTR = Total_downtime / Number_of_failures
```

**Availability:**
```
Availability = MTBF / (MTBF + MTTR)
```

## Latency Distributions

### Latency Models

**Exponential:**
```
P(Latency > t) = exp(-μ×t)
Mean = 1/μ
```

**Normal:**
```
Latency ~ N(μ, σ²)
```

**Lognormal:**
```
log(Latency) ~ N(μ, σ²)
```

### Percentiles

**P50 (median):**
```
50% of requests complete in ≤ P50
```

**P95:**
```
95% of requests complete in ≤ P95
```

**P99:**
```
99% of requests complete in ≤ P99
```

**Tail latency:**
```
P99 - P50 = Tail_latency
```

## Capacity Planning

### Load Estimation

**Current load:**
```
Load = Request_rate × Average_processing_time
```

**Future load:**
```
Load_future = Load_current × (1 + Growth_rate)^t
```

### Capacity Requirements

**Required capacity:**
```
Capacity = Load / Target_utilization
```

**Safety margin:**
```
Capacity = Load × (1 + Safety_margin) / Target_utilization
```

### Scaling

**Horizontal:**
```
Servers_needed = Total_load / Load_per_server
```

**Vertical:**
```
Server_capacity = f(CPU, Memory, ...)
```

## Error Budgets and SLOs

### Service Level Objectives (SLOs)

**Definition:**
```
SLO = Target performance level
Example: 99.9% availability
```

**Service Level Indicators (SLIs):**
```
SLI = Measured performance
Example: Actual availability
```

**Error budget:**
```
Error_budget = 1 - SLO
Example: 0.1% downtime budget
```

### Error Budget Consumption

**Rate:**
```
Consumption_rate = (1 - SLI) / Time_period
```

**Remaining:**
```
Remaining = Error_budget - Consumed
```

**Decision:**
```
If Remaining < Threshold: Slow down changes
If Remaining > Threshold: Can deploy faster
```

### Mathematical Model

**Budget tracking:**
```
Budget(t) = Budget(0) - ∫(1 - SLI(τ))dτ
```

**Alerting:**
```
Alert if Budget(t) < Threshold
```

## Balancing Cost vs Reliability

### Cost Model

**Infrastructure cost:**
```
Cost = f(Redundancy, Capacity, Monitoring, ...)
```

**Reliability cost:**
```
Cost_reliability = Cost_redundancy + Cost_monitoring + Cost_engineering
```

### Reliability Model

**System reliability:**
```
R_system = f(Component_reliabilities, Architecture)
```

**Series:**
```
R_series = Π R_i
```

**Parallel:**
```
R_parallel = 1 - Π(1 - R_i)
```

### Optimization

**Objective:**
```
Minimize: Cost
Subject to: Reliability ≥ Target
```

**Or:**
```
Maximize: Reliability
Subject to: Cost ≤ Budget
```

## Exercises

1. **Queueing:** Model request queueing system
2. **Capacity:** Plan capacity using Little's Law
3. **Reliability:** Calculate availability and error budgets
4. **Optimization:** Balance cost and reliability

## Case Studies

- API performance optimization
- Database capacity planning
- High-availability architecture
- Error budget management
- Cost-reliability trade-offs
