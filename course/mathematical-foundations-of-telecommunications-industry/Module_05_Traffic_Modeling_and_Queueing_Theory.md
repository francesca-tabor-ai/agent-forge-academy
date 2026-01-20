---
title: "Traffic Modeling & Queueing Theory"
module: "Module 5"
week: 5
order: 5
description: "Explain congestion, latency, and blocking"
---

# Module 5: Traffic Modeling & Queueing Theory

## Introduction

Traffic modeling explains congestion, latency, and blocking in telecom networks. This module covers arrival processes, queues, buffers, and delay behavior.

## Learning Objectives

- Model call and packet arrival processes
- Understand queues and buffers
- Analyze delay and loss behavior
- Apply Poisson processes
- Use Erlang formulas
- Apply Little's Law
- Predict delay under load
- Dimension resources for QoS targets

## Call and Packet Arrival Processes

### Poisson Process

**Definition:**
```
Arrivals occur randomly
Rate = λ
Inter-arrival times ~ Exponential(λ)
```

**Properties:**
```
E[Arrivals_in_t] = λ×t
Var[Arrivals_in_t] = λ×t
```

**Memoryless:**
```
P(Next_arrival > t + s | No_arrival_by_t) = P(Next_arrival > s)
```

### Arrival Models

**Voice calls:**
```
Call_arrivals ~ Poisson(λ_call)
```

**Data packets:**
```
Packet_arrivals ~ Poisson(λ_packet)
```

**Aggregate:**
```
Total_arrivals = Sum of independent Poisson
Total_arrivals ~ Poisson(Σλ_i)
```

## Queues and Buffers

### Queue Model

**Components:**
```
Arrivals, Service, Queue, Buffer
```

**M/M/1:**
```
Poisson arrivals
Exponential service
Single server
```

**M/M/c:**
```
Poisson arrivals
Exponential service
c servers
```

**M/G/1:**
```
Poisson arrivals
General service
Single server
```

### Buffer Behavior

**Buffer size:**
```
B = Maximum_queue_length
```

**Buffer overflow:**
```
P(Overflow) = P(Queue_length > B)
```

**Packet loss:**
```
Loss_rate = P(Overflow)
```

## Delay and Loss Behavior

### Delay Components

**Queueing delay:**
```
W_q = Average_waiting_time
```

**Service delay:**
```
W_s = 1/μ = Average_service_time
```

**Total delay:**
```
W = W_q + W_s
```

### Delay Distribution

**M/M/1:**
```
P(W > t) = ρ × exp(-(μ - λ)×t)
where ρ = λ/μ
```

**Average delay:**
```
E[W] = 1/(μ - λ)
```

**Percentiles:**
```
P95_delay = -ln(0.05/(ρ)) / (μ - λ)
```

## Core Mathematics

### Poisson Processes

**Definition:**
```
N(t) ~ Poisson(λ×t)
P(N(t) = k) = (λ×t)^k × exp(-λ×t) / k!
```

**Properties:**
```
E[N(t)] = λ×t
Var[N(t)] = λ×t
```

**Inter-arrival:**
```
Time_between_arrivals ~ Exponential(λ)
E[Time] = 1/λ
```

### Erlang Formulas

**Erlang B (Blocking):**
```
B(c, A) = (A^c/c!) / Σ(A^i/i!) for i=0 to c
where:
  c = servers
  A = offered_load = λ/μ
```

**Erlang C (Waiting):**
```
C(c, A) = (A^c/c!) × (c/(c-A)) / [Σ(A^i/i!) + (A^c/c!) × (c/(c-A))]
```

**Blocking probability:**
```
P(Block) = B(c, A)
```

**Waiting probability:**
```
P(Wait > 0) = C(c, A)
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
```
L_q = λ × W_q (queue)
L_s = λ × W_s (service)
L = L_q + L_s
```

**Extensions:**
```
Throughput = WIP / Cycle_time
```

## Learning Outcomes

### Predicting Delay Under Load

**Utilization:**
```
ρ = λ / μ
```

**Delay:**
```
W = 1/(μ - λ) = 1/(μ×(1 - ρ))
```

**As load increases:**
```
ρ → 1: W → ∞
```

**High load:**
```
Small increase in load → Large increase in delay
```

### Dimensioning Resources for QoS

**QoS targets:**
```
Delay_target: W ≤ W_target
Loss_target: P(Loss) ≤ Loss_target
```

**Required capacity:**
```
μ_required = λ / (1 - W_target × λ)
```

**Blocking:**
```
Servers_required = f(Offered_load, Blocking_target)
Use Erlang_B
```

**Example:**
```
Target: P(Block) ≤ 1%
Offered_load = 10 Erlangs
Find: c such that B(c, 10) ≤ 0.01
```

## Exercises

1. **Arrivals:** Model arrival processes
2. **Queueing:** Analyze queueing systems
3. **Delay:** Calculate delays and percentiles
4. **Dimensioning:** Dimension resources for QoS

## Case Studies

- Network capacity planning
- Call center sizing
- Packet switch design
- QoS guarantee design
- Traffic engineering
