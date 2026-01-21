---
title: "Operations, Queues, and Service Levels"
module: "Module 5"
week: 5
order: 5
description: "Managing time, waits, and staffing"
---

# Module 5: Operations, Queues, and Service Levels

## Introduction

Service operations require balancing waiting times against staffing costs. This module covers arrival processes, service rates, queueing theory, and service-level optimization.

## Learning Objectives

- Model arrival processes and service rates
- Understand waiting time vs. service cost trade-offs
- Staff for variability, not averages
- Set service-level guarantees
- Apply queueing theory (M/M/1, Erlang-C)
- Use Little's Law
- Calculate utilization ratios
- Optimize front desk and concierge staffing
- Manage call centers and reservations
- Optimize restaurant wait-time management

## Arrival Processes and Service Rates

### Arrival Process

**Poisson arrivals:**
```
Arrivals(t) ~ Poisson(λ×t)
P(Arrivals = k) = (λ×t)^k × exp(-λ×t) / k!
```

**Rate:**
```
λ = Arrivals_per_time
```

**Inter-arrival times:**
```
Time_between_arrivals ~ Exponential(λ)
E[Time] = 1/λ
```

### Service Process

**Service time:**
```
Service_time ~ Distribution
```

**Exponential:**
```
Service_time ~ Exponential(μ)
E[Service_time] = 1/μ
```

**Service rate:**
```
μ = Services_per_time
```

**Utilization:**
```
ρ = λ / μ
```

## Waiting Time vs. Service Cost Trade-offs

### Waiting Cost

**Customer waiting:**
```
Cost_waiting = Time_waiting × Value_of_time
```

**Business impact:**
```
Dissatisfaction
Lost_revenue
Reputation_damage
```

**Mathematical:**
```
E[Waiting_cost] = E[Wait_time] × Cost_per_time
```

### Service Cost

**Staffing cost:**
```
Cost_staffing = Number_of_staff × Cost_per_staff
```

**Total cost:**
```
Total_cost = Cost_staffing + E[Waiting_cost]
```

**Optimization:**
```
Minimize: Total_cost
Subject to: Service_level_constraints
```

## Staffing for Variability, Not Averages

### Variability Impact

**High variability:**
```
Longer queues
Higher waiting times
Need more staff
```

**Low variability:**
```
Shorter queues
Lower waiting times
Need less staff
```

**Mathematical:**
```
Queue_length = f(Utilization, Variability)
Higher_variability → Longer_queues
```

### Safety Staffing

**Average demand:**
```
Staff_avg = Demand_avg / Service_rate
```

**With variability:**
```
Staff_safety = Staff_avg + Safety_factor × σ_demand
```

**Safety factor:**
```
Safety_factor = z_α for service_level α
```

## Service-Level Guarantees

### Service Level Definitions

**Wait time:**
```
P(Wait_time ≤ Target) ≥ Service_level
```

**Queue length:**
```
P(Queue_length ≤ Target) ≥ Service_level
```

**Availability:**
```
P(Service_available) ≥ Service_level
```

### Service Level Calculation

**M/M/c queue:**
```
P(Wait > t) = f(Utilization, Servers, t)
```

**Erlang-C:**
```
P(Wait > 0) = Erlang_C(Utilization, Servers)
```

**Target:**
```
Set service_level
Calculate required_staff
```

## Core Mathematics

### Queueing Theory (M/M/1)

**Assumptions:**
- Poisson arrivals (M)
- Exponential service (M)
- Single server (1)

**Utilization:**
```
ρ = λ / μ
```

**Metrics:**
```
L = ρ / (1 - ρ)  (average in system)
W = 1 / (μ - λ)  (average time in system)
L_q = ρ² / (1 - ρ)  (average queue length)
W_q = ρ / (μ - λ)  (average waiting time)
```

**Stability:**
```
ρ < 1 required
```

### Erlang-C

**M/M/c queue:**
```
c servers
Each with service rate μ
```

**Probability of waiting:**
```
P(Wait > 0) = Erlang_C(ρ, c)
```

**Average waiting:**
```
E[Wait] = P(Wait > 0) / (c×μ - λ)
```

### Little's Law

**Formula:**
```
L = λ × W
where:
  L = average number in system
  λ = arrival rate
  W = average time in system
```

**Applications:**
- Capacity planning
- Lead time prediction
- Staffing decisions

**Extensions:**
```
L_q = λ × W_q
L_s = λ × W_s
```

### Utilization Ratios

**Station:**
```
ρ = λ / μ
```

**System:**
```
ρ_system = max(ρ_i)
```

**Target:**
```
ρ_target = 70-80%
```

## Industry Applications

### Front Desk and Concierge Staffing

**Arrival rate:**
```
λ = Guest_arrivals_per_hour
```

**Service rate:**
```
μ = Check_ins_per_hour_per_staff
```

**Staffing:**
```
Staff_needed = λ / (μ × Utilization_target)
```

**With service level:**
```
Staff_needed = f(λ, μ, Service_level)
```

### Call Centers and Reservations

**Call center:**
```
Arrivals: Phone_calls
Service: Call_handling
```

**Staffing:**
```
Staff = f(Call_arrival_rate, Handle_time, Service_level)
```

**Erlang-C:**
```
Use Erlang_C formula
Calculate required_agents
```

### Restaurant Wait-Time Management

**Arrival:**
```
Guest_arrivals
```

**Service:**
```
Table_turn_time
```

**Queue:**
```
Waiting_for_table
```

**Optimization:**
```
Minimize: Wait_time
Subject to: Staffing_cost_constraints
```

## Exercises

1. **Queueing:** Model queueing system and calculate metrics
2. **Staffing:** Calculate optimal staffing for service level
3. **Trade-offs:** Optimize waiting cost vs. staffing cost
4. **Service Level:** Design service-level guarantees

## Case Studies

- Hotel front desk optimization
- Call center staffing
- Restaurant wait-time management
- Service level optimization
- Queue management strategies
