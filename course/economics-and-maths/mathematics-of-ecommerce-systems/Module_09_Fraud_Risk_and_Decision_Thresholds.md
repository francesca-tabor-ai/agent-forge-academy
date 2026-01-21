---
title: "Fraud, Risk & Decision Thresholds"
module: "Module 9"
week: 9
order: 9
description: "Control risk using probabilistic inference"
---

# Module 9: Fraud, Risk & Decision Thresholds

## Introduction

Fraud detection in e-commerce requires probabilistic inference and decision theory. This module covers fraud classification, expected loss minimization, and optimal decision thresholds.

## Learning Objectives

- Model fraud as a classification problem
- Minimize expected loss
- Apply decision theory
- Use Bayesian inference
- Calculate expected value
- Apply cost-sensitive decision rules
- Score transactions
- Set approval/hold thresholds
- Minimize fraud loss

## Fraud as a Classification Problem

### Binary Classification

**Classes:**
```
Fraud = 1
Legitimate = 0
```

**Features:**
```
Transaction_amount
User_history
Device_info
Location
Time_patterns
```

**Model:**
```
P(Fraud | Features) = f(Features)
```

### Classification Models

**Logistic regression:**
```
P(Fraud) = 1 / (1 + exp(-(β₀ + β₁×Features)))
```

**Random forest:**
```
Ensemble of trees
Handles non-linearity
```

**Neural networks:**
```
Deep learning
Complex patterns
```

## Expected Loss Minimization

### Loss Components

**False positive (False alarm):**
```
Cost_FP = Cost of rejecting legitimate transaction
```

**False negative (Missed fraud):**
```
Cost_FN = Cost of accepting fraudulent transaction
```

**True positive:**
```
Cost_TP = Cost of correctly rejecting fraud
```

**True negative:**
```
Cost_TN = 0 (correct acceptance)
```

### Expected Loss

**Definition:**
```
E[Loss] = P(FP) × Cost_FP + P(FN) × Cost_FN
```

**With probabilities:**
```
E[Loss] = P(Legitimate) × P(Reject | Legitimate) × Cost_FP +
          P(Fraud) × P(Accept | Fraud) × Cost_FN
```

**Minimization:**
```
Minimize: E[Loss]
Subject to: Decision_constraints
```

## Decision Theory

### Decision Rule

**Threshold:**
```
If P(Fraud) > Threshold: Reject
If P(Fraud) ≤ Threshold: Accept
```

**Optimal threshold:**
```
Threshold* = Cost_FP / (Cost_FP + Cost_FN)
```

**Derivation:**
```
Minimize: E[Loss]
dE[Loss]/dThreshold = 0
```

### Cost-Sensitive Classification

**Cost matrix:**
```
                Predicted
              Legitimate  Fraud
Actual Legitimate    0    Cost_FP
       Fraud    Cost_FN      0
```

**Decision:**
```
Choose action minimizing expected cost
```

**Optimal:**
```
Reject if: P(Fraud) × Cost_FN > P(Legitimate) × Cost_FP
```

## Core Mathematics

### Bayesian Inference

**Prior:**
```
P(Fraud) = Prior_probability
```

**Likelihood:**
```
P(Features | Fraud) = Likelihood
```

**Posterior:**
```
P(Fraud | Features) = P(Features | Fraud) × P(Fraud) / P(Features)
```

**Updating:**
```
Posterior becomes prior for next transaction
Sequential learning
```

### Expected Value

**Definition:**
```
E[X] = Σ x_i × P(x_i)
```

**Decision:**
```
Choose action with highest expected value
Or lowest expected cost
```

**Fraud application:**
```
E[Cost | Accept] = P(Fraud) × Cost_FN
E[Cost | Reject] = P(Legitimate) × Cost_FP
```

### Cost-Sensitive Decision Rules

**Rule:**
```
Reject if: E[Cost | Accept] > E[Cost | Reject]
```

**Mathematical:**
```
Reject if: P(Fraud) × Cost_FN > P(Legitimate) × Cost_FP
Reject if: P(Fraud) > Cost_FP / (Cost_FP + Cost_FN)
```

**Threshold:**
```
Threshold = Cost_FP / (Cost_FP + Cost_FN)
```

## Industry Applications

### Transaction Scoring

**Score:**
```
Score = P(Fraud | Transaction_features)
```

**Features:**
```
Amount, User_history, Device, Location, Time, ...
```

**Model:**
```
Score = f(Features)
```

**Decision:**
```
If Score > Threshold: Reject
If Score ≤ Threshold: Accept
```

### Approval/Hold Thresholds

**Three-tier:**
```
Auto_approve: Score < Threshold_low
Manual_review: Threshold_low ≤ Score ≤ Threshold_high
Auto_reject: Score > Threshold_high
```

**Optimization:**
```
Minimize: Total_cost
Subject to: Review_capacity
```

**Thresholds:**
```
Threshold_low = f(Cost_FP, Cost_review)
Threshold_high = f(Cost_FN, Cost_review)
```

### Fraud Loss Minimization

**Objective:**
```
Minimize: Total_fraud_loss
```

**Components:**
```
Fraud_loss = Accepted_fraud × Fraud_amount
Review_cost = Manual_reviews × Review_cost
False_positive_cost = Rejected_legitimate × Opportunity_cost
```

**Optimization:**
```
Minimize: Fraud_loss + Review_cost + FP_cost
Subject to: Review_capacity
```

## Exercises

1. **Fraud Model:** Build fraud classification model
2. **Decision Threshold:** Calculate optimal threshold
3. **Expected Loss:** Minimize expected loss
4. **Scoring:** Design transaction scoring system

## Case Studies

- Fraud detection systems
- Transaction approval optimization
- Risk management strategies
- Cost-sensitive classification
- Fraud loss minimization
