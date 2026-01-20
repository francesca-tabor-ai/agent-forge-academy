---
title: "Time Dynamics & Long-Term Effects"
module: "Module 8"
week: 8
order: 8
description: "Model how advertising effects persist over time"
---

# Module 8: Time Dynamics & Long-Term Effects

## Introduction

Advertising effects persist and decay over time. This module covers adstock models, time-series regression, and Marketing Mix Models (MMM) to measure long-term brand and media effects.

## Learning Objectives

- Model memory and decay
- Analyze lagged responses
- Apply temporal aggregation
- Use adstock models
- Apply time-series regression
- Build Marketing Mix Models (MMM)
- Measure long-term brand and media effects
- Optimize spend over weeks and months

## Memory and Decay

### Adstock Model

**Definition:**
```
Adstock_t = Ad_exposure_t + λ × Adstock_{t-1}
where λ = retention_rate (0 < λ < 1)
```

**Recursive:**
```
Adstock_t = Σ(λ^i × Ad_exposure_{t-i}) for i=0 to ∞
```

**Decay:**
```
Effect decays exponentially
Half-life = -ln(2) / ln(λ)
```

### Decay Functions

**Exponential:**
```
Effect(t) = Effect_0 × exp(-λ × t)
```

**Power law:**
```
Effect(t) = Effect_0 × t^(-α)
```

**Logistic decay:**
```
Effect(t) = Effect_0 / (1 + exp(λ × (t - t_0)))
```

## Lagged Responses

### Response Lags

**Immediate:**
```
Response_t = f(Ad_t)
```

**Lagged:**
```
Response_t = f(Ad_t, Ad_{t-1}, Ad_{t-2}, ...)
```

**Distributed lag:**
```
Response_t = Σ(β_i × Ad_{t-i}) + ε_t
```

### Lag Structure

**Geometric:**
```
β_i = β × λ^i
Weights decrease geometrically
```

**Polynomial:**
```
β_i = f(i) where f is polynomial
```

**Unrestricted:**
```
Estimate β_i directly
No functional form
```

## Temporal Aggregation

### Aggregation Levels

**Daily:**
```
Response_day = f(Ad_day, Controls_day)
```

**Weekly:**
```
Response_week = Σ Response_day
Ad_week = Σ Ad_day
```

**Monthly:**
```
Response_month = Σ Response_week
Ad_month = Σ Ad_week
```

### Aggregation Bias

**Problem:**
```
Aggregating loses information
May bias estimates
```

**Solution:**
```
Use appropriate aggregation level
Match data frequency to effect duration
```

## Key Models

### Adstock

**Geometric adstock:**
```
Adstock_t = Ad_t + λ × Adstock_{t-1}
```

**Response:**
```
Response_t = α + β × Adstock_t + Controls_t + ε_t
```

**Parameters:**
```
λ = retention_rate (0 < λ < 1)
β = response_coefficient
```

**Estimation:**
```
Non-linear least squares
Grid search over λ
```

### Time-Series Regression

**ARIMA:**
```
(1-φ₁B-...-φₚBᵖ)(1-B)ᵈy_t = (1+θ₁B+...+θ_qB^q)ε_t + Ad_variables
```

**VAR (Vector Autoregression):**
```
Response_t = α + Σ(β_i × Response_{t-i}) + Σ(γ_i × Ad_{t-i}) + ε_t
```

**Cointegration:**
```
Long-run relationship between variables
```

### Marketing Mix Models (MMM)

**Basic MMM:**
```
Sales_t = Base + Σ(Media_effect_i × Media_i,t) + Controls_t + ε_t
```

**With adstock:**
```
Sales_t = Base + Σ(β_i × Adstock_i,t) + Controls_t + ε_t
```

**Non-linear:**
```
Sales_t = Base × Π(1 + Media_effect_i × Media_i,t^α_i) + Controls_t + ε_t
```

**Components:**
- Base sales
- Media effects
- Seasonality
- Promotions
- External factors

## Measuring Long-Term Effects

### Cumulative Effect

**Total effect:**
```
Total_effect = Σ Effect_t over all time
```

**With decay:**
```
Total_effect = Effect_0 / (1 - λ)
```

**Half-life:**
```
Time for effect to halve
t_half = -ln(2) / ln(λ)
```

### Brand Effects

**Brand awareness:**
```
Awareness_t = f(Ad_exposure_t, Ad_exposure_{t-1}, ...)
```

**Brand consideration:**
```
Consideration_t = f(Awareness_t, Ad_exposure_t, ...)
```

**Long-term:**
```
Brand_equity = Cumulative_ad_effect
```

### Media Effects

**Immediate:**
```
Direct_response = f(Ad_t)
```

**Carryover:**
```
Carryover = f(Ad_{t-1}, Ad_{t-2}, ...)
```

**Total:**
```
Total_effect = Immediate + Carryover
```

## Optimizing Spend Over Time

### Dynamic Optimization

**Objective:**
```
Maximize: Σ Revenue_t
Subject to: Σ Cost_t ≤ Budget
```

**With carryover:**
```
Revenue_t = f(Adstock_t, Controls_t)
Adstock_t = f(Ad_t, Adstock_{t-1})
```

**Optimization:**
```
Dynamic programming
Bellman equation
```

### Budget Pacing

**Weekly allocation:**
```
Budget_week = f(Seasonality, Competition, ...)
```

**Optimization:**
```
Maximize: Total_revenue
Subject to: Weekly_budget_constraints
```

### Frequency Optimization

**Optimal frequency:**
```
Balance: Reach vs Frequency
Maximize: Effectiveness(Reach, Frequency)
```

**With decay:**
```
Account for adstock
Optimize timing
```

## Exercises

1. **Adstock:** Estimate adstock parameters
2. **Time Series:** Build time-series regression model
3. **MMM:** Construct marketing mix model
4. **Optimization:** Optimize spend over time

## Case Studies

- Long-term ad effect measurement
- Marketing mix modeling
- Budget allocation over time
- Brand effect quantification
- Carryover effect analysis
