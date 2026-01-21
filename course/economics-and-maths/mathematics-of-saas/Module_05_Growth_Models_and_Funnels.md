---
title: "Growth Models & Funnels"
module: "Module 5"
week: 5
order: 5
description: "Turning acquisition into equations"
---

# Module 5: Growth Models & Funnels

## Introduction

SaaS growth depends on converting prospects through acquisition funnels. This module applies funnel mathematics, viral coefficients, and growth compounding to model and optimize acquisition.

## Learning Objectives

- Model funnel mathematics
- Calculate viral coefficients
- Understand growth compounding
- Analyze conversion probability chains
- Model K-factor dynamics
- Identify saturation and diminishing returns
- Forecast growth from funnel data

## Funnel Mathematics

### Funnel Stages

**Typical stages:**
```
Visitors → Leads → MQLs → SQLs → Trials → Customers
```

**Conversion rates:**
```
CR_i = Stage_{i+1} / Stage_i
```

**Overall conversion:**
```
CR_overall = Customers / Visitors = Π CR_i
```

### Funnel Model

**Mathematical:**
```
Customers = Visitors × CR_visitors_to_leads × CR_leads_to_MQLs × ... × CR_trials_to_customers
```

**Vector form:**
```
[Customers] = [Visitors] × [CR_matrix]
```

**Optimization:**
```
Maximize: Customers
Subject to: Budget_constraints
```

## Viral Coefficients

### K-Factor Definition

**K-factor:**
```
K = Customers × Invitations_per_customer × Conversion_rate
```

**Interpretation:**
- K > 1: Viral growth (exponential)
- K = 1: Linear growth
- K < 1: Sub-linear growth

**Growth:**
```
Customers(t+1) = Customers(t) × (1 + K)
```

### Viral Growth Model

**Exponential:**
```
Customers(t) = Customers(0) × (1 + K)^t
```

**With saturation:**
```
Customers(t) = Market_size / (1 + A×exp(-K×t))
where A = (Market_size - Customers(0)) / Customers(0)
```

### K-Factor Components

**Decomposition:**
```
K = Invitations × Conversion_rate
```

**Optimization:**
```
Increase invitations
Improve conversion rate
Or both
```

## Growth Compounding

### Compound Growth

**Monthly:**
```
MRR(t) = MRR(0) × (1 + g)^t
```

**Annual:**
```
ARR(t) = ARR(0) × (1 + g_annual)^t
```

**Relationship:**
```
(1 + g_annual) = (1 + g_monthly)^12
```

### Growth Rate Calculation

**From data:**
```
g = (MRR_{t+1} - MRR_t) / MRR_t
```

**Average:**
```
g_avg = (MRR_T / MRR_0)^(1/T) - 1
```

**CAGR:**
```
CAGR = (End_value / Start_value)^(1/Years) - 1
```

## Conversion Probability Chains

### Multi-Stage Conversion

**Probability chain:**
```
P(Customer) = P(Lead) × P(MQL|Lead) × P(SQL|MQL) × P(Trial|SQL) × P(Customer|Trial)
```

**Mathematical:**
```
P(Customer) = Π P(Stage_i+1 | Stage_i)
```

**Expected customers:**
```
E[Customers] = Visitors × P(Customer)
```

### Funnel Optimization

**Bottleneck identification:**
```
Bottleneck = min(CR_i) across all stages
```

**Impact:**
```
Improving bottleneck has largest impact
Improving non-bottleneck has zero impact
```

**Optimization:**
```
Maximize: Customers = Visitors × Π CR_i
Subject to: Budget_constraints
```

## K-Factor Dynamics

### Viral Coefficient Evolution

**Time-varying:**
```
K(t) = f(Product_features, Market_saturation, ...)
```

**Decay:**
```
K(t) = K(0) × exp(-decay_rate × t)
```

**Saturation:**
```
K(t) = K(0) / (1 + Saturation_factor × Customers(t))
```

### Network Effects

**Value increases with users:**
```
Value = f(Customers)
K increases with Customers
```

**Mathematical:**
```
K = K_base × (1 + Network_effect × Customers)
```

## Saturation and Diminishing Returns

### Market Saturation

**Saturation model:**
```
Growth_rate = g_max × (1 - Customers / Market_size)
```

**Logistic growth:**
```
Customers(t) = Market_size / (1 + A×exp(-r×t))
```

**S-curve:**
- Slow initial growth
- Rapid growth phase
- Saturation phase

### Diminishing Returns

**Marketing:**
```
New_customers = f(Marketing_spend)
d²New_customers/dSpend² < 0 (diminishing returns)
```

**Model:**
```
New_customers = a × Spend^b where b < 1
```

**Optimization:**
```
Optimal_spend where Marginal_cost = Marginal_revenue
```

## Forecasting Growth from Funnel Data

### Funnel-Based Forecast

**Model:**
```
Customers(t+h) = Visitors(t) × CR_overall × (1 + K)^h
```

**With conversion lags:**
```
Customers(t+h) = Σ(Visitors(t-i) × CR_i × Lag_distribution(i))
```

### Growth Decomposition

**Components:**
```
Growth = Organic + Paid + Viral + Referral
```

**Mathematical:**
```
dCustomers/dt = Organic_rate + Paid_rate + Viral_rate + Referral_rate
```

### Scenario Analysis

**Optimistic:**
```
High conversion rates
High K-factor
```

**Base case:**
```
Current conversion rates
Current K-factor
```

**Pessimistic:**
```
Low conversion rates
Low K-factor
```

## Exercises

1. **Funnel Analysis:** Model conversion funnel
2. **K-Factor:** Calculate and optimize viral coefficient
3. **Growth Forecast:** Forecast growth from funnel data
4. **Optimization:** Optimize funnel for maximum growth

## Case Studies

- SaaS growth funnel optimization
- Viral growth strategies
- Conversion rate improvement
- Growth forecasting
- Market saturation analysis
