---
title: "Demand Modeling & Forecast Mathematics"
module: "Module 2"
week: 2
order: 2
description: "How is uncertain demand quantified and predicted?"
---

# Module 2: Demand Modeling & Forecast Mathematics

## Introduction

Demand forecasting is fundamental to supply chain planning. This module covers demand distributions, time series models, and forecast error quantification.

## Learning Objectives

- Model demand distributions and variability
- Analyze time series structure (trend, seasonality, noise)
- Quantify forecast error and uncertainty propagation
- Apply probability distributions
- Use ARIMA and state-space models
- Calculate error metrics (MAE, RMSE, MAPE)
- Model demand statistically
- Quantify forecast uncertainty and operational impact

## Demand Distributions and Variability

### Common Distributions

**Normal:**
```
Demand ~ N(μ, σ²)
E[Demand] = μ
Var[Demand] = σ²
```

**Lognormal:**
```
log(Demand) ~ N(μ, σ²)
E[Demand] = exp(μ + σ²/2)
```

**Poisson:**
```
Demand ~ Poisson(λ)
E[Demand] = λ
Var[Demand] = λ
```

**Gamma:**
```
Demand ~ Gamma(α, β)
E[Demand] = α×β
Var[Demand] = α×β²
```

### Variability Measures

**Coefficient of variation:**
```
CV = σ / μ
```

**Variance:**
```
Var[Demand] = E[(Demand - μ)²]
```

**Standard deviation:**
```
σ = √Var[Demand]
```

## Time Series Structure

### Components

**Decomposition:**
```
Demand(t) = Trend(t) + Seasonal(t) + Cyclical(t) + Irregular(t)
```

**Additive:**
```
Demand(t) = T(t) + S(t) + C(t) + I(t)
```

**Multiplicative:**
```
Demand(t) = T(t) × S(t) × C(t) × I(t)
```

### Trend

**Linear:**
```
Trend(t) = a + b×t
```

**Exponential:**
```
Trend(t) = a × exp(b×t)
log(Trend(t)) = log(a) + b×t
```

**Estimation:**
```
b = Σ(t - t̄)(D - D̄) / Σ(t - t̄)²
a = D̄ - b×t̄
```

### Seasonality

**Seasonal patterns:**
```
Daily, Weekly, Monthly, Yearly
```

**Seasonal index:**
```
SI_i = Average(D_i) / Overall_average for season i
```

**Deseasonalization:**
```
D_deseasonalized = D / SI_season
```

### Noise

**Random component:**
```
Irregular(t) = Demand(t) - Trend(t) - Seasonal(t)
```

**Properties:**
```
E[Irregular] = 0
Var[Irregular] = σ²
```

## Forecast Error and Uncertainty Propagation

### Forecast Error

**Definition:**
```
Error_t = Actual_t - Forecast_t
```

**Bias:**
```
Bias = E[Error] = (1/n) × Σ Error_t
```

**Variance:**
```
Var[Error] = E[(Error - Bias)²]
```

### Error Metrics

**MAE (Mean Absolute Error):**
```
MAE = (1/n) × Σ |Error_t|
```

**RMSE (Root Mean Squared Error):**
```
RMSE = √[(1/n) × Σ Error_t²]
```

**MAPE (Mean Absolute Percentage Error):**
```
MAPE = (100/n) × Σ |Error_t / Actual_t|
```

**MAD (Mean Absolute Deviation):**
```
MAD = MAE
```

### Uncertainty Propagation

**Forecast uncertainty:**
```
Var[Forecast] = Var[Model] + Var[Parameter] + Var[Process]
```

**Demand uncertainty:**
```
Var[Demand] = Var[Forecast] + Var[Error]
```

**Operational impact:**
```
Safety_stock = z_α × √Var[Demand]
```

## Mathematical Tools

### Probability Distributions

**Normal:**
```
f(x) = (1/σ√(2π)) × exp(-(x-μ)²/(2σ²))
```

**Lognormal:**
```
f(x) = (1/(xσ√(2π))) × exp(-(log(x)-μ)²/(2σ²))
```

**Poisson:**
```
P(k) = (λ^k × exp(-λ)) / k!
```

**Estimation:**
```
Maximum likelihood
Method of moments
```

### ARIMA and State-Space Models

**ARIMA(p,d,q):**
```
(1-φ₁B-...-φₚBᵖ)(1-B)ᵈy_t = (1+θ₁B+...+θ_qB^q)ε_t
```

**State-space:**
```
State: x_t = F×x_{t-1} + w_t
Observation: y_t = H×x_t + v_t
```

**Kalman filter:**
```
Update state estimates
Propagate uncertainty
```

### Error Metrics

**MAE:**
```
Robust to outliers
Easy to interpret
```

**RMSE:**
```
Penalizes large errors
Sensitive to outliers
```

**MAPE:**
```
Percentage error
Scale-independent
```

## Learning Outcomes

### Modeling Demand Statistically

**Steps:**
1. Collect historical data
2. Identify distribution
3. Estimate parameters
4. Validate model
5. Forecast

**Example:**
```
Data: Historical demand
Distribution: Normal(μ, σ²)
Estimation: μ = sample_mean, σ² = sample_variance
Forecast: E[Demand] = μ
Uncertainty: Var[Demand] = σ²
```

### Quantifying Forecast Uncertainty

**Uncertainty sources:**
- Model uncertainty
- Parameter uncertainty
- Process uncertainty

**Quantification:**
```
Prediction_interval = Forecast ± z_α/2 × σ_forecast
```

**Operational impact:**
```
Safety_stock = z_α × σ_lead_time_demand
where σ_lead_time_demand = √(L × σ²_demand)
```

## Exercises

1. **Distribution Fitting:** Fit demand distribution to data
2. **Time Series:** Decompose time series into components
3. **Forecasting:** Build ARIMA model and forecast
4. **Uncertainty:** Quantify forecast uncertainty and safety stock

## Case Studies

- Demand forecasting in retail
- Seasonal demand planning
- Forecast accuracy improvement
- Uncertainty quantification
- Safety stock optimization
