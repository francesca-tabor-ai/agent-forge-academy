---
title: "Human Behavior & Quality of Experience"
module: "Module 11"
week: 11
order: 11
description: "Model user perception mathematically"
---

# Module 11: Human Behavior & Quality of Experience

## Introduction

User experience drives telecom business success. This module covers QoS vs. QoE, behavioral response to delay and loss, and churn dynamics.

## Learning Objectives

- Distinguish QoS vs. QoE
- Model behavioral response to delay and loss
- Understand churn dynamics
- Apply utility functions
- Use logistic regression
- Model multivariate trade-offs
- Translate technical metrics into customer impact
- Prioritize engineering decisions by perceived value

## QoS vs. QoE

### Quality of Service (QoS)

**Technical metrics:**
```
Throughput, Latency, Packet_loss, Jitter
```

**Objective:**
```
Measurable
Network_performance
```

**Mathematical:**
```
QoS = f(Network_parameters)
```

### Quality of Experience (QoE)

**User perception:**
```
Satisfaction, Perceived_quality, Experience
```

**Subjective:**
```
User-dependent
Context-dependent
```

**Mathematical:**
```
QoE = f(QoS, User_factors, Context)
```

### Relationship

**Mapping:**
```
QoS → QoE
Technical → Perceptual
```

**Model:**
```
QoE = f(QoS, User, Context)
```

**Non-linear:**
```
Diminishing_returns
Threshold_effects
```

## Behavioral Response to Delay and Loss

### Delay Impact

**Perception:**
```
Low_delay: Good_experience
High_delay: Poor_experience
```

**Thresholds:**
```
< 100ms: Imperceptible
100-300ms: Noticeable
> 300ms: Poor
```

**Model:**
```
Satisfaction = f(Delay)
Decreasing_function
```

### Loss Impact

**Perception:**
```
Low_loss: Good_experience
High_loss: Poor_experience
```

**Thresholds:**
```
< 0.1%: Good
0.1-1%: Acceptable
> 1%: Poor
```

**Model:**
```
Satisfaction = f(Loss_rate)
Decreasing_function
```

## Churn Dynamics

### Churn Model

**Probability:**
```
P(Churn) = f(QoE, Price, Competition, ...)
```

**Logistic regression:**
```
P(Churn) = 1 / (1 + exp(-(β₀ + β₁×QoE + β₂×Price + ...)))
```

**Factors:**
```
Service_quality
Price
Competition
Switching_costs
```

### Churn Impact

**Revenue loss:**
```
Lost_revenue = Churned_customers × ARPU
```

**CLV:**
```
CLV = ARPU × Gross_margin / Churn_rate
```

**Prevention:**
```
Improve QoE
Reduce price
Increase switching_costs
```

## Core Mathematics

### Utility Functions

**Definition:**
```
U(QoE, Price, ...) = User_utility
```

**Properties:**
```
Higher_QoE → Higher_utility
Lower_price → Higher_utility
```

**Trade-offs:**
```
U(QoE, Price) = w₁×QoE - w₂×Price
```

### Logistic Regression

**Model:**
```
P(Outcome) = 1 / (1 + exp(-(β₀ + β₁×X₁ + ... + βₙ×Xₙ)))
```

**Interpretation:**
```
β_i: Change in log-odds per unit X_i
exp(β_i): Odds ratio
```

**Estimation:**
```
Maximum likelihood
Minimize cross-entropy
```

### Multivariate Trade-offs

**Multiple factors:**
```
QoE = f(Throughput, Latency, Loss, ...)
```

**Optimization:**
```
Maximize: QoE
Subject to: Resource_constraints
```

**Pareto frontier:**
```
Trade-off curves
Optimal_combinations
```

## Learning Outcomes

### Translating Technical Metrics

**Technical → Perceptual:**
```
Throughput → Perceived_speed
Latency → Responsiveness
Loss → Quality
```

**Mapping:**
```
QoS → QoE
Objective → Subjective
```

**Model:**
```
QoE = f(QoS_metrics)
```

### Prioritizing Engineering Decisions

**Value-based:**
```
Prioritize by: Impact_on_QoE × Number_of_users
```

**ROI:**
```
ROI = (QoE_improvement × Users - Cost) / Cost
```

**Optimization:**
```
Maximize: Total_QoE
Subject to: Budget_constraints
```

## Exercises

1. **QoS-QoE:** Model QoS to QoE mapping
2. **Behavior:** Model behavioral response
3. **Churn:** Build churn prediction model
4. **Prioritization:** Prioritize engineering decisions

## Case Studies

- QoE optimization
- Churn reduction strategies
- Service quality improvement
- Customer experience management
- Engineering prioritization
