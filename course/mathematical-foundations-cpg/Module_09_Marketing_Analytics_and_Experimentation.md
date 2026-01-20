---
title: "Marketing Analytics & Experimentation"
module: "Module 9"
week: 9
order: 9
description: "Measure and optimize marketing effectiveness"
---

# Module 9: Marketing Analytics & Experimentation

## Introduction

Marketing effectiveness in CPG requires rigorous measurement and experimentation. This module covers advertising response functions, promotion lift modeling, A/B testing, and causal inference to quantify marketing ROI.

## Learning Objectives

- Model advertising response functions
- Calculate promotion lift
- Design and analyze A/B tests
- Apply causal inference methods
- Quantify ROI of marketing actions
- Use diminishing returns curves
- Calculate lift and attribution metrics

## Advertising Response Functions

### Diminishing Returns

**Basic model:**
```
Response = Base + (Max_lift × Ad_spend^α) / (K + Ad_spend^α)
where α < 1 (diminishing returns)
```

**Linear model (limited range):**
```
Response = Base + β × Ad_spend
```

**Logarithmic model:**
```
Response = Base + β × log(Ad_spend + 1)
```

**S-shaped (saturation):**
```
Response = Base + Max_lift / (1 + exp(-k×(Ad_spend - Threshold)))
```

### Response Curve Parameters

**Maximum lift:**
```
Max_lift = Asymptotic_response - Base
```

**Half-maximal spend:**
```
EC50 = Spend at 50% of max lift
```

**Elasticity:**
```
Elasticity = (dResponse/dSpend) × (Spend/Response)
```

## Promo Lift Modeling

### Promotion Lift

**Definition:**
```
Lift = Sales_promoted - Sales_baseline
Lift% = (Sales_promoted - Sales_baseline) / Sales_baseline × 100
```

**Incremental revenue:**
```
Incremental_revenue = Lift × (Price - Variable_cost)
```

**ROI:**
```
ROI = (Incremental_revenue - Promotion_cost) / Promotion_cost
```

### Lift Decomposition

**Components:**
```
Total_lift = Baseline_lift + Incremental_lift
Incremental_lift = New_customers + Increased_purchase + Stockpiling
```

**Stockpiling effect:**
```
Stockpiling = Future_sales_reduction
Net_lift = Gross_lift - Stockpiling
```

### Promotion Response Model

**Linear:**
```
Lift = β₀ + β₁×Discount + β₂×Duration + β₃×Frequency
```

**Nonlinear:**
```
Lift = Max_lift × (1 - exp(-k×Discount))
```

**Interaction effects:**
```
Lift = β₀ + β₁×Discount + β₂×Duration + β₃×Discount×Duration
```

## A/B Testing Fundamentals

### Experimental Design

**Randomization:**
```
Treatment = Random_assignment
Control = Random_assignment
```

**Sample size:**
```
n = 2 × (z_α/2 + z_β)² × σ² / δ²
where:
  z_α/2 = critical value for significance
  z_β = critical value for power
  σ = standard deviation
  δ = minimum detectable effect
```

### Difference-in-Means Estimator

**Treatment effect:**
```
τ = Y_treatment - Y_control
```

**Variance:**
```
Var(τ) = Var(Y_treatment)/n_t + Var(Y_control)/n_c
```

**Standard error:**
```
SE(τ) = √[Var(τ)]
```

**Confidence interval:**
```
CI = τ ± z_α/2 × SE(τ)
```

**Hypothesis test:**
```
H₀: τ = 0
H₁: τ ≠ 0
t = τ / SE(τ)
Reject if |t| > t_critical
```

### Statistical Power

**Power calculation:**
```
Power = P(Reject H₀ | H₁ true)
Power = 1 - β
```

**Factors affecting power:**
- Effect size (larger → more power)
- Sample size (larger → more power)
- Variance (smaller → more power)
- Significance level (larger α → more power)

## Causal Inference Basics

### Potential Outcomes

**Definition:**
```
Y_i(1) = outcome if treated
Y_i(0) = outcome if control
```

**Average treatment effect:**
```
ATE = E[Y(1) - Y(0)]
```

**Estimation:**
```
ATE_hat = Y_treatment - Y_control
```

### Confounding

**Problem:**
```
Correlation ≠ Causation
```

**Solution:**
- Randomization
- Control variables
- Instrumental variables
- Difference-in-differences

### Difference-in-Differences

**Model:**
```
Y_it = α + β×Treatment_i + γ×Time_t + δ×(Treatment_i × Time_t) + ε_it
```

**Treatment effect:**
```
δ = (Y_treatment,after - Y_treatment,before) - (Y_control,after - Y_control,before)
```

## Lift and Attribution Metrics

### Incremental Lift

**Definition:**
```
Incremental_lift = Response_with_marketing - Response_without_marketing
```

**Attribution:**
```
Attribution_i = w_i × Total_lift
where Σ w_i = 1
```

### Attribution Models

**First-touch:**
```
w_first = 1, w_others = 0
```

**Last-touch:**
```
w_last = 1, w_others = 0
```

**Linear:**
```
w_i = 1/n  for all channels
```

**Time-decay:**
```
w_i = exp(-λ×t_i) / Σ exp(-λ×t_j)
```

**Shapley value:**
```
w_i = Average marginal contribution across all channel combinations
```

## Key Models

### Diminishing Returns Curves

**Power function:**
```
Response = a × Spend^b  where 0 < b < 1
```

**Exponential saturation:**
```
Response = Max × (1 - exp(-k×Spend))
```

**Logistic:**
```
Response = Max / (1 + exp(-k×(Spend - Threshold)))
```

### Difference-in-Means Estimators

**Simple:**
```
τ = Y_treatment - Y_control
```

**Adjusted (regression):**
```
Y = α + β×Treatment + γ×Covariates + ε
τ = β
```

## Exercises

1. **Response Modeling:** Fit advertising response function
2. **Lift Calculation:** Calculate promotion lift and ROI
3. **A/B Test Design:** Design experiment with required power
4. **Attribution:** Allocate credit across marketing channels

## Case Studies

- Advertising effectiveness measurement
- Promotion optimization
- Multi-channel attribution
- Causal impact of marketing campaigns
- ROI optimization across channels
