---
title: "Forecasting, Planning & Risk"
module: "Module 11"
week: 11
order: 11
description: "Seeing the future probabilistically"
---

# Module 11: Forecasting, Planning & Risk

## Introduction

SaaS planning requires probabilistic forecasting to account for uncertainty. This module covers time series models, scenario analysis, Monte Carlo simulation, and risk quantification.

## Learning Objectives

- Apply time series models to SaaS metrics
- Conduct scenario analysis
- Quantify uncertainty
- Forecast MRR/ARR
- Use Monte Carlo simulations
- Model downside risk
- Communicate uncertainty to stakeholders

## Time Series Models

### ARIMA Models

**ARIMA(p,d,q):**
```
(1-φ₁B-...-φₚBᵖ)(1-B)ᵈy_t = (1+θ₁B+...+θ_qB^q)ε_t
```

**SaaS application:**
```
MRR_t = f(MRR_{t-1}, MRR_{t-2}, ..., Errors)
```

### Exponential Smoothing

**Simple:**
```
S_t = α×y_t + (1-α)×S_{t-1}
Forecast = S_t
```

**Holt's (trend):**
```
Level: L_t = α×y_t + (1-α)×(L_{t-1} + T_{t-1})
Trend: T_t = β×(L_t - L_{t-1}) + (1-β)×T_{t-1}
Forecast = L_t + h×T_t
```

**Holt-Winters (seasonal):**
```
Adds seasonal component
```

## Scenario Analysis

### Scenario Definition

**Base case:**
```
Most likely outcome
```

**Optimistic:**
```
Favorable conditions
High growth
Low churn
```

**Pessimistic:**
```
Adverse conditions
Low growth
High churn
```

### Scenario Modeling

**Inputs:**
```
Growth_rate_scenario
Churn_rate_scenario
Expansion_rate_scenario
```

**Outputs:**
```
MRR_scenario(t)
ARR_scenario(t)
Customers_scenario(t)
```

### Probability Weighting

**Expected value:**
```
E[MRR] = P_base×MRR_base + P_optimistic×MRR_optimistic + P_pessimistic×MRR_pessimistic
```

**Variance:**
```
Var[MRR] = E[MRR²] - (E[MRR])²
```

## Uncertainty Quantification

### Forecast Intervals

**Prediction interval:**
```
P(MRR ∈ [L, U]) = 1 - α
```

**Normal assumption:**
```
L = Forecast - z_{α/2} × σ
U = Forecast + z_{α/2} × σ
```

### Confidence vs Prediction

**Confidence interval:**
```
Uncertainty about mean
```

**Prediction interval:**
```
Uncertainty about individual value
Wider than confidence interval
```

### Uncertainty Decomposition

**Sources:**
```
Total_uncertainty = Model_uncertainty + Parameter_uncertainty + Process_uncertainty
```

## MRR/ARR Forecasting

### MRR Forecast

**Components:**
```
MRR(t) = New_MRR(t) + Expansion_MRR(t) - Churned_MRR(t) - Contraction_MRR(t)
```

**Forecast:**
```
Forecast_MRR(t+h) = Forecast_New(t+h) + Forecast_Expansion(t+h) - Forecast_Churn(t+h) - Forecast_Contraction(t+h)
```

### ARR Forecast

**Annual:**
```
ARR(t) = MRR(t) × 12
```

**Forecast:**
```
Forecast_ARR(t+h) = Forecast_MRR(t+h) × 12
```

### Growth Forecast

**Growth rate:**
```
g(t) = (MRR(t) - MRR(t-1)) / MRR(t-1)
```

**Forecast:**
```
Forecast_g(t+h) = f(Historical_g, Trends, ...)
```

## Monte Carlo Simulations

### Simulation Process

**Steps:**
1. Define probability distributions for inputs
2. Sample random values
3. Calculate outputs
4. Repeat many times
5. Analyze distribution

### Input Distributions

**Growth rate:**
```
Growth ~ N(μ_growth, σ_growth²)
```

**Churn rate:**
```
Churn ~ Beta(α, β)
```

**Expansion:**
```
Expansion ~ Normal or Lognormal
```

### Output Analysis

**Statistics:**
```
E[MRR], Median[MRR], Percentiles
```

**Probability:**
```
P(MRR > Target)
P(MRR < Minimum)
```

**Risk metrics:**
```
VaR, CVaR, Downside_deviation
```

## Downside Risk Modeling

### Value at Risk (VaR)

**Definition:**
```
VaR_α = -Quantile_α(Returns)
P(Return ≤ -VaR_α) = α
```

**SaaS application:**
```
VaR_MRR = -Quantile_α(MRR_forecast - MRR_current)
```

### Conditional VaR (CVaR)

**Definition:**
```
CVaR = E[Loss | Loss ≥ VaR]
```

**Expected shortfall:**
```
Average of worst (1-α)% outcomes
```

### Downside Metrics

**Downside deviation:**
```
σ_downside = √[E[min(0, Return - Target)²]]
```

**Sortino ratio:**
```
Sortino = (Return - Target) / σ_downside
```

## Exercises

1. **Forecasting:** Build MRR/ARR forecast model
2. **Scenarios:** Conduct scenario analysis
3. **Monte Carlo:** Simulate SaaS metrics
4. **Risk:** Quantify downside risk

## Case Studies

- SaaS revenue forecasting
- Scenario planning
- Risk management
- Uncertainty communication
- Planning under uncertainty
