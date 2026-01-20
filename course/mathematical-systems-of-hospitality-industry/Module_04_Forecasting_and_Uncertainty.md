---
title: "Forecasting & Uncertainty"
module: "Module 4"
week: 4
order: 4
description: "Predicting demand and measuring error"
---

# Module 4: Forecasting & Uncertainty

## Introduction

Accurate demand forecasting is critical for hospitality revenue management. This module covers time-series patterns, forecast accuracy, demand distributions, and risk-aware planning.

## Learning Objectives

- Analyze time-series patterns (trend, seasonality, noise)
- Calculate forecast accuracy metrics
- Model demand distributions and quantiles
- Apply risk-aware planning
- Use ARIMA-style models
- Apply probability distributions
- Calculate error metrics (MAPE, RMSE)
- Forecast occupancy
- Plan for event-driven demand spikes
- Plan labor and purchasing

## Time-Series Patterns

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
```

**Estimation:**
```
b = Σ(t - t̄)(D - D̄) / Σ(t - t̄)²
a = D̄ - b×t̄
```

### Seasonality

**Patterns:**
```
Daily: Day_of_week effects
Weekly: Weekend vs. weekday
Monthly: Month effects
Yearly: Holiday seasons, events
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

## Forecast Accuracy Metrics

### Error Definition

**Forecast error:**
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

## Demand Distributions and Quantiles

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

### Quantiles

**Definition:**
```
Quantile_α = Value where P(Demand ≤ Quantile_α) = α
```

**Percentiles:**
```
P50 = Median
P95 = 95th percentile
P99 = 99th percentile
```

**Application:**
```
Safety_stock = P95 - Forecast
Protection_level = Quantile for service_level
```

## Risk-Aware Planning

### Uncertainty Quantification

**Forecast uncertainty:**
```
Var[Forecast] = Var[Model] + Var[Parameter] + Var[Process]
```

**Demand uncertainty:**
```
Var[Demand] = Var[Forecast] + Var[Error]
```

**Prediction interval:**
```
PI = Forecast ± z_α/2 × σ_forecast
```

### Risk-Adjusted Decisions

**Expected value:**
```
E[Revenue] = Σ P(Scenario_i) × Revenue(Scenario_i)
```

**Risk measures:**
```
VaR = Value_at_Risk
CVaR = Conditional_VaR
```

**Optimization:**
```
Maximize: E[Revenue] - λ × Risk
where λ = risk_aversion
```

## Core Mathematics

### ARIMA-Style Models

**ARIMA(p,d,q):**
```
(1-φ₁B-...-φₚBᵖ)(1-B)ᵈy_t = (1+θ₁B+...+θ_qB^q)ε_t
```

**AR(1):**
```
y_t = φ×y_{t-1} + ε_t
```

**MA(1):**
```
y_t = ε_t + θ×ε_{t-1}
```

**Estimation:**
```
Maximum likelihood
Least squares
```

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

## Industry Applications

### Occupancy Forecasts

**Model:**
```
Occupancy(t) = f(Trend, Seasonality, Events, ...)
```

**Forecast:**
```
Forecast_occupancy(t+h) = Model(t+h)
```

**Uncertainty:**
```
Prediction_interval = Forecast ± z_α/2 × σ
```

**Application:**
```
Pricing decisions
Capacity planning
Staffing
```

### Event-Driven Demand Spikes

**Event modeling:**
```
Demand_event = Base_demand × Event_multiplier
```

**Forecasting:**
```
Forecast_event = Forecast_base × Expected_multiplier
```

**Planning:**
```
Increase capacity
Adjust pricing
Prepare staffing
```

### Labor and Purchasing Planning

**Labor:**
```
Staff_needed = Forecast_demand / Productivity_per_staff
```

**Purchasing:**
```
Inventory_needed = Forecast_demand × Lead_time + Safety_stock
```

**Optimization:**
```
Minimize: Labor_cost + Inventory_cost
Subject to: Service_level_constraints
```

## Exercises

1. **Time Series:** Decompose time series and forecast
2. **Accuracy:** Calculate and analyze forecast errors
3. **Distributions:** Model demand distributions
4. **Risk:** Apply risk-aware planning

## Case Studies

- Hotel occupancy forecasting
- Event demand planning
- Labor optimization
- Purchasing planning
- Forecast accuracy improvement
