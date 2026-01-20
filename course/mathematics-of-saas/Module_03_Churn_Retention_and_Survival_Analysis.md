---
title: "Churn, Retention, and Survival Analysis"
module: "Module 3"
week: 3
order: 3
description: "Modeling customer lifetime probabilistically"
---

# Module 3: Churn, Retention, and Survival Analysis

## Introduction

Churn is a critical factor in SaaS profitability. This module applies survival analysis, hazard rates, and retention curves to model customer lifetime probabilistically.

## Learning Objectives

- Apply survival functions to customer lifetime
- Calculate hazard rates
- Model retention curves
- Distinguish exponential vs non-parametric churn
- Estimate cohort survival
- Identify early-life churn risk
- Forecast retention by cohort

## Survival Functions

### Survival Function Definition

**Definition:**
```
S(t) = P(Customer survives beyond time t)
S(t) = P(T > t)
where T = customer lifetime
```

**Properties:**
```
S(0) = 1
S(∞) = 0
S(t) is non-increasing
```

### Retention Rate

**Definition:**
```
Retention(t) = S(t) = P(Still_customer at time t)
```

**Monthly retention:**
```
Retention_monthly = Customers_month_t / Customers_month_0
```

**Annual retention:**
```
Retention_annual = Customers_year_1 / Customers_year_0
```

### Relationship to Churn

**Churn probability:**
```
P(Churn by t) = 1 - S(t)
```

**Churn rate:**
```
Churn_rate = 1 - Retention_rate
```

## Hazard Rates

### Hazard Function

**Definition:**
```
h(t) = lim(Δt→0) P(Churn in [t, t+Δt] | Survived to t) / Δt
```

**Interpretation:**
- Instantaneous churn rate
- Risk of churn at time t

**Relationship to survival:**
```
h(t) = -d(log S(t)) / dt
S(t) = exp(-∫ h(s)ds from 0 to t)
```

### Constant Hazard

**Exponential model:**
```
h(t) = λ (constant)
S(t) = exp(-λ×t)
```

**Mean lifetime:**
```
E[T] = 1/λ
```

### Time-Varying Hazard

**Weibull model:**
```
h(t) = (k/λ) × (t/λ)^(k-1)
S(t) = exp(-(t/λ)^k)
```

**Interpretation:**
- k < 1: Decreasing hazard (infant mortality)
- k = 1: Constant hazard (exponential)
- k > 1: Increasing hazard (aging)

## Retention Curves

### Retention Curve Shape

**Exponential (constant churn):**
```
Retention(t) = exp(-λ×t)
```

**Power law:**
```
Retention(t) = t^(-α)
```

**Logistic:**
```
Retention(t) = 1 / (1 + exp(α×t - β))
```

### Cohort Retention

**Cohort definition:**
```
Cohort_i = Customers acquired in period i
```

**Cohort retention:**
```
Retention_cohort_i(t) = Cohort_i(t) / Cohort_i(0)
```

**Aggregate retention:**
```
Retention_aggregate(t) = Σ(Cohort_i(t)) / Σ(Cohort_i(0))
```

## Exponential vs Non-Parametric Churn

### Exponential Model

**Assumption:**
```
Constant churn rate
h(t) = λ
```

**Survival:**
```
S(t) = exp(-λ×t)
```

**Estimation:**
```
λ = -ln(Retention_1) / 1
```

**Advantages:**
- Simple
- One parameter
- Analytical solutions

**Limitations:**
- Assumes constant churn
- May not fit data

### Non-Parametric Model

**Kaplan-Meier estimator:**
```
Ŝ(t) = Π(1 - d_i/n_i) for all events i ≤ t
where:
  d_i = churned at time i
  n_i = at risk at time i
```

**Advantages:**
- No distributional assumptions
- Fits data flexibly

**Limitations:**
- Requires more data
- Less smooth

## Cohort Survival Estimation

### Cohort Tracking

**Data structure:**
```
Cohort | Month_0 | Month_1 | Month_2 | ...
Cohort_1 | 100 | 90 | 85 | ...
Cohort_2 | 150 | 140 | 130 | ...
```

**Survival estimation:**
```
Ŝ_cohort_i(t) = Customers_cohort_i(t) / Customers_cohort_i(0)
```

### Aggregate Survival

**Weighted average:**
```
Ŝ_aggregate(t) = Σ(w_i × Ŝ_cohort_i(t))
where w_i = cohort size weight
```

**Pooled:**
```
Ŝ_pooled(t) = Total_customers(t) / Total_customers(0)
```

## Early-Life Churn Risk

### Infant Mortality

**High early churn:**
```
h(t) high for small t
Decreases over time
```

**Model:**
```
h(t) = α / (β + t)
S(t) = (β / (β + t))^α
```

**Interpretation:**
- Customers who survive early period more likely to stay
- Onboarding quality matters

### Churn Risk Factors

**Early churn predictors:**
- Low product usage
- No onboarding completion
- Support ticket volume
- Payment issues

**Mathematical model:**
```
P(Churn | Features) = f(Usage, Onboarding, Support, Payment)
```

### Retention Improvement

**Target:**
```
Reduce early churn
Improve S(t) for small t
```

**Impact:**
```
ΔLTV = ARPA × ΔLifetime
ΔLifetime = ∫ ΔS(t)dt
```

## Forecasting Retention by Cohort

### Retention Forecast

**Exponential model:**
```
Retention_forecast(t) = Retention_observed × exp(-λ×(t - t_observed))
```

**Non-parametric:**
```
Extrapolate Kaplan-Meier curve
```

**Cohort-specific:**
```
Retention_cohort_i(t) = f(Cohort_characteristics, Time)
```

### Lifetime Value Forecast

**Expected lifetime:**
```
E[T] = ∫ S(t)dt from 0 to ∞
```

**LTV:**
```
LTV = ARPA × Gross_margin × E[T]
```

**With forecast:**
```
LTV = ARPA × Gross_margin × ∫ S_forecast(t)dt
```

## Exercises

1. **Survival Analysis:** Estimate survival function from data
2. **Hazard Rates:** Calculate and interpret hazard functions
3. **Retention Curves:** Model retention by cohort
4. **Forecasting:** Forecast retention and LTV

## Case Studies

- Churn prediction and prevention
- Retention curve analysis
- Cohort survival modeling
- Early-life churn reduction
- Lifetime value optimization
