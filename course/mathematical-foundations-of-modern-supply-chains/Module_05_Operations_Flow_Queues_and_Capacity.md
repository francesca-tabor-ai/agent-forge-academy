---
title: "Operations Flow, Queues & Capacity"
module: "Module 5"
week: 5
order: 5
description: "How do congestion and capacity constraints shape performance?"
---

# Module 5: Operations Flow, Queues & Capacity

## Introduction

Operations flow depends on capacity, utilization, and queuing. This module covers throughput, WIP, cycle time, bottlenecks, and queueing models.

## Learning Objectives

- Understand throughput, WIP, and cycle time
- Identify bottlenecks and utilization
- Model waiting time explosions
- Apply Little's Law
- Use queueing models (M/M/1, M/M/c)
- Calculate utilization metrics
- Predict lead times from capacity decisions
- Identify and mathematically diagnose bottlenecks

## Throughput, WIP, and Cycle Time

### Definitions

**Throughput:**
```
TH = Output_rate = Units_completed / Time
```

**WIP (Work in Process):**
```
WIP = Units_in_system
```

**Cycle time:**
```
CT = Time_in_system = Time_to_complete
```

### Relationships

**Little's Law:**
```
WIP = TH × CT
```

**Rearranged:**
```
CT = WIP / TH
TH = WIP / CT
```

**Application:**
```
Given any two, calculate the third
```

## Bottlenecks and Utilization

### Bottleneck Definition

**Bottleneck:**
```
Station with highest utilization
Limits system throughput
```

**Utilization:**
```
ρ = Arrival_rate / Service_rate = λ / μ
```

**Bottleneck:**
```
Bottleneck = argmax_i (ρ_i)
```

### Utilization Metrics

**Station utilization:**
```
ρ_i = λ_i / μ_i
```

**System utilization:**
```
ρ_system = max(ρ_i)
```

**Target:**
```
ρ_target = 70-80%
```

### Bottleneck Impact

**Throughput:**
```
TH_system = TH_bottleneck
```

**Cycle time:**
```
CT_system = CT_bottleneck + Queueing_delays
```

**Improvement:**
```
Improving non-bottleneck has zero impact
Improving bottleneck increases system throughput
```

## Waiting Time Explosions

### Queue Growth

**High utilization:**
```
As ρ → 1, Queue → ∞
```

**Mathematical:**
```
L = ρ / (1 - ρ)
As ρ → 1, L → ∞
```

**Waiting time:**
```
W = L / λ = ρ / (λ × (1 - ρ))
As ρ → 1, W → ∞
```

### Critical Utilization

**Definition:**
```
Utilization where queue grows rapidly
```

**Typical:**
```
ρ_critical ≈ 0.8-0.9
```

**Management:**
```
Keep utilization below critical
Maintain headroom
```

## Mathematical Tools

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
- WIP management

**Extensions:**
```
L_q = λ × W_q (queue only)
L_s = λ × W_s (service only)
```

### Queueing Models (M/M/1)

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
L = ρ / (1 - ρ)
W = 1 / (μ - λ)
L_q = ρ² / (1 - ρ)
W_q = ρ / (μ - λ)
```

**Stability:**
```
ρ < 1 required
```

### Queueing Models (M/M/c)

**Multiple servers:**
```
c servers
Each with service rate μ
```

**Utilization:**
```
ρ = λ / (c × μ)
```

**Metrics:**
```
More complex formulas
Use queueing tables or software
```

**Stability:**
```
ρ < 1 required
```

### Utilization Metrics

**Station:**
```
ρ = λ / μ
```

**System:**
```
ρ_system = max(ρ_i)
```

**Average:**
```
ρ_avg = (1/n) × Σ ρ_i
```

## Learning Outcomes

### Predicting Lead Times

**From capacity:**
```
CT = WIP / TH
TH = Capacity × Utilization
CT = WIP / (Capacity × Utilization)
```

**With queueing:**
```
CT = Service_time + Queue_time
CT = 1/μ + W_q
```

**Planning:**
```
Set capacity to achieve target CT
Capacity = WIP / (CT_target × Utilization)
```

### Diagnosing Bottlenecks

**Identification:**
```
Bottleneck = argmax_i (ρ_i)
```

**Diagnosis:**
```
High utilization
Long queues
Low throughput
```

**Mathematical:**
```
If ρ_i > ρ_critical: Bottleneck
If Queue_i > Threshold: Bottleneck
```

## Exercises

1. **Little's Law:** Apply Little's Law to calculate metrics
2. **Queueing:** Model queueing system
3. **Bottleneck:** Identify and analyze bottlenecks
4. **Capacity:** Plan capacity for target performance

## Case Studies

- Manufacturing flow optimization
- Warehouse operations
- Service system design
- Bottleneck elimination
- Capacity planning
