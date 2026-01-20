---
title: "Reinsurance and Risk Transfer"
module: "Module 8"
week: 8
order: 8
description: "Sharing risk across institutions"
---

# Module 8: Reinsurance and Risk Transfer

## Introduction

Reinsurance enables insurers to transfer risk. This module covers proportional vs. non-proportional reinsurance, layers, attachments, limits, and pricing.

## Learning Objectives

- Distinguish proportional vs. non-proportional reinsurance
- Understand layers, attachments, and limits
- Model risk diversification
- Price reinsurance contracts
- Calculate excess-of-loss layer formulas
- Model ceded loss distributions
- Understand tail risk transfer
- Understand reinsurance as structural risk optimization

## Proportional vs. Non-Proportional Reinsurance

### Proportional Reinsurance

**Definition:**
```
Cede fixed percentage of all losses
```

**Types:**
- Quota share: Fixed percentage
- Surplus share: Variable percentage

**Mathematical:**
```
Ceded_loss = α × Total_loss
where α = cession percentage
```

**Retained:**
```
Retained_loss = (1 - α) × Total_loss
```

### Non-Proportional Reinsurance

**Definition:**
```
Cede losses above attachment
Below retention
```

**Types:**
- Excess of loss
- Stop loss
- Catastrophe

**Mathematical:**
```
Ceded_loss = max(0, Loss - Retention)
Subject to: Limit
```

## Layers, Attachments, and Limits

### Excess-of-Loss Layer

**Structure:**
```
Layer: (Attachment, Attachment + Limit)
```

**Ceded:**
```
Ceded = min(Limit, max(0, Loss - Attachment))
```

**Retained:**
```
Retained = Loss - Ceded
```

**Multiple layers:**
```
Layer_1: (0, A)
Layer_2: (A, A+L)
Layer_3: (A+L, ∞)
```

### Attachment and Limit

**Attachment:**
```
Point where reinsurance starts
Retention level
```

**Limit:**
```
Maximum ceded per loss
Layer capacity
```

**Premium:**
```
Premium = f(Attachment, Limit, Expected_loss)
```

## Risk Diversification

### Diversification Benefit

**Concept:**
```
Pooling risks reduces variance
Diversification benefit
```

**Mathematical:**
```
Var(Pool) < Σ Var(Individual) if correlated
```

**Reinsurance:**
```
Cede high_variance risks
Retain diversified_portfolio
```

### Tail Risk Transfer

**Purpose:**
```
Transfer extreme losses
Protect capital
```

**Mathematical:**
```
Cede: Loss > Attachment
Retain: Loss ≤ Attachment
```

**Impact:**
```
Reduces tail_risk
Reduces capital_need
```

## Pricing Reinsurance Contracts

### Pricing Methods

**Expected value:**
```
Premium = E[Ceded_loss] × (1 + Loading)
```

**Percentile:**
```
Premium = Quantile_α(Ceded_loss) × (1 + Loading)
```

**Risk-adjusted:**
```
Premium = E[Ceded_loss] + Risk_load
```

### Reinsurance Premium

**Components:**
```
Premium = Expected_ceded + Risk_load + Expenses + Profit
```

**Calculation:**
```
Premium = ∫ Ceded(x) × f(x) dx × (1 + Loading)
```

## Core Mathematics

### Excess-of-Loss Layer Formulas

**Ceded loss:**
```
Ceded = min(Limit, max(0, Loss - Attachment))
```

**Expected ceded:**
```
E[Ceded] = ∫_Attachment^(Attachment+Limit) (x - Attachment) × f(x) dx
         + Limit × P(Loss > Attachment + Limit)
```

**Variance:**
```
Var[Ceded] = E[Ceded²] - (E[Ceded])²
```

### Ceded Loss Distributions

**Ceded distribution:**
```
F_ceded(x) = P(Ceded ≤ x)
```

**For excess layer:**
```
F_ceded(0) = P(Loss ≤ Attachment)
F_ceded(x) = F_loss(Attachment + x) for 0 < x < Limit
F_ceded(Limit) = 1
```

**Moments:**
```
E[Ceded] = ∫ x × f_ceded(x) dx
Var[Ceded] = E[Ceded²] - (E[Ceded])²
```

### Tail Risk Transfer

**Tail probability:**
```
P(Ceded > 0) = P(Loss > Attachment)
```

**Expected tail:**
```
E[Ceded | Ceded > 0] = E[Loss - Attachment | Loss > Attachment]
```

**Capital reduction:**
```
ΔCapital = Capital_without_reinsurance - Capital_with_reinsurance
```

## Learning Outcomes

### Understanding Reinsurance as Optimization

**Objective:**
```
Minimize: Total_cost = Premium + Capital_cost
Subject to: Risk_constraints
```

**Trade-off:**
```
More_reinsurance → Higher_premium, Lower_capital
Less_reinsurance → Lower_premium, Higher_capital
```

**Optimization:**
```
Choose optimal_reinsurance_structure
Balance cost and risk
```

## Exercises

1. **Proportional:** Calculate proportional reinsurance
2. **Excess:** Calculate excess-of-loss layer
3. **Pricing:** Price reinsurance contract
4. **Optimization:** Optimize reinsurance structure

## Case Studies

- Reinsurance program design
- Excess layer analysis
- Reinsurance pricing
- Risk transfer optimization
- Capital efficiency
