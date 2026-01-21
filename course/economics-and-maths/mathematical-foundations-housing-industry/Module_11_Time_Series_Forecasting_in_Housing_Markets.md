---
title: "Time-Series Forecasting in Housing Markets"
module: "Module 11"
week: 11
order: 11
description: "Forecast rents, prices, and cycles"
---

# Module 11: Time-Series Forecasting in Housing Markets

## Introduction

Housing markets exhibit temporal patterns that can be forecasted. This module covers ARIMA models, trend decomposition, seasonality, and scenario analysis for housing price and rent forecasting.

## Learning Objectives

- Apply ARIMA models to housing data
- Decompose trends and cycles
- Model seasonality in housing
- Quantify forecast uncertainty
- Conduct scenario analysis
- Use stochastic processes and time-series analysis

## ARIMA and Trend Decomposition

### ARIMA Model

**ARIMA(p,d,q):**
```
(1-φ₁B-...-φₚBᵖ)(1-B)ᵈy_t = (1+θ₁B+...+θ_qB^q)ε_t
where:
  B = backshift operator
  d = differencing order
  p = AR order
  q = MA order
```

**AR(1) example:**
```
y_t = φ×y_{t-1} + ε_t
```

**MA(1) example:**
```
y_t = ε_t + θ×ε_{t-1}
```

### Trend Decomposition

**Additive:**
```
y_t = Trend_t + Seasonal_t + Cycle_t + Irregular_t
```

**Multiplicative:**
```
y_t = Trend_t × Seasonal_t × Cycle_t × Irregular_t
```

**Log transformation:**
```
log(y_t) = log(Trend) + log(Seasonal) + log(Cycle) + log(Irregular)
```

### Trend Extraction

**Moving average:**
```
Trend_t = (1/n) × Σ y_{t-i} for i=0 to n-1
```

**Exponential smoothing:**
```
Trend_t = α×y_t + (1-α)×Trend_{t-1}
```

**Hodrick-Prescott filter:**
```
Minimize: Σ(y_t - Trend_t)² + λ×Σ(Δ²Trend_t)²
```

## Seasonality in Housing Data

### Seasonal Patterns

**Monthly seasonality:**
```
Seasonal_t = f(Month_t)
```

**Quarterly:**
```
Seasonal_t = f(Quarter_t)
```

**Modeling:**
```
Seasonal_t = Σ(β_i × D_i) where D_i = seasonal dummy
```

### Seasonal Adjustment

**Seasonal index:**
```
SI_i = Average(y_i) / Overall_average for season i
```

**Deseasonalized:**
```
y_deseasonalized = y / SI_season
```

### Seasonal ARIMA (SARIMA)

**SARIMA(p,d,q)(P,D,Q)_s:**
```
Seasonal component with period s
```

**Example:**
```
SARIMA(1,1,1)(1,1,1)_12
→ Monthly data with yearly seasonality
```

## Forecast Uncertainty

### Prediction Intervals

**Point forecast:**
```
ŷ_{t+h} = E[y_{t+h} | Data]
```

**Prediction interval:**
```
P(y_{t+h} ∈ [L, U]) = 1 - α
```

**Normal assumption:**
```
L = ŷ_{t+h} - z_{α/2} × σ_h
U = ŷ_{t+h} + z_{α/2} × σ_h
```

### Forecast Variance

**AR(1):**
```
Var(ŷ_{t+h}) = σ² × (1 - φ²^h) / (1 - φ²)
```

**General ARIMA:**
```
Var(ŷ_{t+h}) = σ² × Σ(ψ_i²) where ψ_i = MA coefficients
```

### Forecast Evaluation

**Mean Absolute Error:**
```
MAE = (1/n) × Σ |y_t - ŷ_t|
```

**Root Mean Squared Error:**
```
RMSE = √[(1/n) × Σ(y_t - ŷ_t)²]
```

**Mean Absolute Percentage Error:**
```
MAPE = (100/n) × Σ |(y_t - ŷ_t) / y_t|
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
```

**Pessimistic:**
```
Adverse conditions
```

### Monte Carlo Simulation

**Process:**
1. Estimate model parameters
2. Sample from parameter distributions
3. Generate forecast paths
4. Analyze distribution of outcomes

**Outputs:**
```
E[Forecast], Percentiles, Probability_distribution
```

### Stress Testing

**Stress scenarios:**
- Interest rate shock
- Economic recession
- Supply shock
- Demand shock

**Impact:**
```
Forecast_stress = f(Base_forecast, Stress_factors)
```

## Key Math: Stochastic Processes

### Random Walk

**Definition:**
```
y_t = y_{t-1} + ε_t
```

**Properties:**
- Non-stationary
- Variance grows with time
- No mean reversion

### Mean Reversion

**AR(1) with mean:**
```
y_t = μ + φ×(y_{t-1} - μ) + ε_t
```

**If |φ| < 1:**
- Stationary
- Mean reverting
- Long-run mean = μ

### Unit Root

**Test:**
```
H₀: φ = 1 (unit root)
H₁: |φ| < 1 (stationary)
```

**Dickey-Fuller test:**
```
Δy_t = α + β×y_{t-1} + ε_t
Test: β = 0
```

## Exercises

1. **ARIMA:** Fit ARIMA model to housing prices
2. **Decomposition:** Decompose trend and seasonality
3. **Forecasting:** Generate forecasts with intervals
4. **Scenarios:** Conduct scenario analysis

## Case Studies

- Housing price forecasting
- Rent prediction models
- Market cycle analysis
- Forecast accuracy improvement
- Scenario planning
