---
title: "Customer Lifetime Value & Retention Models"
module: "Module 6"
week: 6
order: 6
description: "Quantify long-term customer value and churn risk"
---

# Module 6: Customer Lifetime Value & Retention Models

## Introduction

Customer lifetime value (CLV) is essential for e-commerce profitability. This module covers CLV calculation, discounted cash flows, churn modeling, and survival analysis.

## Learning Objectives

- Decompose lifetime value
- Apply discounted cash flows
- Model churn
- Apply survival analysis
- Calculate CLV
- Use geometric series
- Apply hazard functions
- Use survival distributions
- Allocate marketing budgets
- Prioritize retention
- Evaluate loyalty programs

## Lifetime Value Decomposition

### CLV Components

**Revenue:**
```
Revenue_t = ARPU_t × Retention_t
```

**Cost:**
```
Cost_t = Acquisition_cost + Service_cost_t
```

**Profit:**
```
Profit_t = Revenue_t - Cost_t
```

**CLV:**
```
CLV = Σ Profit_t / (1 + r)^t
```

### Simplified CLV

**Constant assumptions:**
```
ARPU constant
Churn_rate constant
Discount_rate constant
```

**Formula:**
```
CLV = ARPU × Gross_margin / (Churn_rate + Discount_rate)
```

**With growth:**
```
CLV = ARPU × Gross_margin × (1 + Growth_rate) / (Churn_rate + Discount_rate - Growth_rate)
```

## Discounted Cash Flows

### Present Value

**Single payment:**
```
PV = FV / (1 + r)^t
```

**Annuity:**
```
PV_annuity = PMT × [1 - (1+r)^(-n)] / r
```

**Perpetuity:**
```
PV_perpetuity = PMT / r
```

### CLV with DCF

**Discrete:**
```
CLV = Σ(Profit_t / (1 + r)^t) from t=0 to T
```

**Continuous:**
```
CLV = ∫(Profit(t) × exp(-r×t))dt from 0 to ∞
```

**With retention:**
```
CLV = Σ(ARPU × Gross_margin × Retention_t / (1 + r)^t)
```

## Churn Modeling

### Churn Rate

**Definition:**
```
Churn_rate = 1 - Retention_rate
```

**Monthly:**
```
Churn_monthly = 1 - Retention_monthly
```

**Annual:**
```
Churn_annual = 1 - Retention_annual
```

**Relationship:**
```
Retention_annual = (Retention_monthly)^12
```

### Churn Prediction

**Model:**
```
P(Churn) = f(Usage, Engagement, Support, Payment, ...)
```

**Logistic regression:**
```
P(Churn) = 1 / (1 + exp(-(β₀ + β₁×Features)))
```

**Survival analysis:**
```
S(t) = P(Survives beyond t)
h(t) = Hazard rate
```

## Survival Analysis

### Survival Function

**Definition:**
```
S(t) = P(Customer survives beyond t)
S(t) = P(T > t)
```

**Properties:**
```
S(0) = 1
S(∞) = 0
S(t) non-increasing
```

### Hazard Function

**Definition:**
```
h(t) = -d(log S(t)) / dt
```

**Interpretation:**
```
Instantaneous churn rate
Risk of churn at time t
```

**Relationship:**
```
S(t) = exp(-∫ h(s)ds from 0 to t)
```

### Survival Distributions

**Exponential:**
```
h(t) = λ (constant)
S(t) = exp(-λ×t)
E[T] = 1/λ
```

**Weibull:**
```
h(t) = (k/λ) × (t/λ)^(k-1)
S(t) = exp(-(t/λ)^k)
```

**Kaplan-Meier:**
```
Non-parametric estimator
Ŝ(t) = Π(1 - d_i/n_i) for events i ≤ t
```

## Core Mathematics

### Geometric Series

**Finite:**
```
S = a + ar + ar² + ... + ar^(n-1) = a × (1 - r^n) / (1 - r)
```

**Infinite:**
```
S = a / (1 - r) if |r| < 1
```

**CLV application:**
```
CLV = ARPU × Gross_margin × Σ(Retention^i / (1+r)^i)
= ARPU × Gross_margin / (1 + r - Retention)
```

### Hazard Functions

**Constant hazard:**
```
h(t) = λ
S(t) = exp(-λ×t)
```

**Time-varying:**
```
h(t) = f(t)
S(t) = exp(-∫ h(s)ds)
```

**Estimation:**
```
Estimate from data
Parametric or non-parametric
```

### Survival Distributions

**Exponential:**
```
Simple, one parameter
Constant hazard
```

**Weibull:**
```
Flexible, two parameters
Time-varying hazard
```

**Non-parametric:**
```
Kaplan-Meier
No distributional assumptions
```

## Industry Applications

### Marketing Budget Allocation

**CLV-based:**
```
Allocate based on CLV contribution
Not just immediate revenue
```

**Optimization:**
```
Maximize: Total_CLV
Subject to: Budget_constraints
```

**Allocation:**
```
Spend_i = f(CLV_i, Marginal_ROI_i)
```

### Retention Prioritization

**High CLV customers:**
```
Focus retention efforts
Higher investment justified
```

**Risk segmentation:**
```
High_risk: P(Churn) > Threshold
Target for retention
```

**ROI:**
```
Retention_ROI = (CLV_saved - Retention_cost) / Retention_cost
```

### Loyalty Program Evaluation

**Program cost:**
```
Cost = Benefits + Administration
```

**Program value:**
```
Value = CLV_increase × Customers
```

**ROI:**
```
ROI = (Value - Cost) / Cost
```

**Optimization:**
```
Design program to maximize ROI
```

## Exercises

1. **CLV Calculation:** Calculate customer lifetime value
2. **Survival Analysis:** Model customer retention
3. **Churn Prediction:** Build churn prediction model
4. **Allocation:** Allocate budget based on CLV

## Case Studies

- CLV-based marketing strategy
- Retention program optimization
- Loyalty program evaluation
- Customer segmentation by CLV
- Churn prevention strategies
