---
title: "Forecasting & Uncertainty"
module: "Module 3"
week: 3
order: 3
description: "Model demand uncertainty and translate it into operational decisions"
---

# Module 3: Forecasting & Uncertainty

## Introduction

Accurate demand forecasting is critical for CPG operations. This module covers time series methods, handles promotion-induced volatility, evaluates forecast accuracy, and translates uncertainty into operational decisions.

## Learning Objectives

- Decompose time series into components
- Model promotion-induced volatility
- Calculate forecast accuracy metrics
- Understand bias vs variance trade-offs
- Build probability distributions of demand
- Translate forecasts into operational decisions

## Time Series Decomposition

### Components

**Additive model:**
```
Y(t) = Trend(t) + Seasonal(t) + Cyclical(t) + Irregular(t)
```

**Multiplicative model:**
```
Y(t) = Trend(t) × Seasonal(t) × Cyclical(t) × Irregular(t)
```

**Log transformation (multiplicative → additive):**
```
log(Y(t)) = log(Trend) + log(Seasonal) + log(Cyclical) + log(Irregular)
```

### Trend Extraction

**Moving average:**
```
MA(n) = (Y_t + Y_{t-1} + ... + Y_{t-n+1}) / n
```

**Exponential smoothing:**
```
S_t = α×Y_t + (1-α)×S_{t-1}
where α = smoothing parameter (0 < α < 1)
```

**Linear trend:**
```
Trend(t) = a + b×t
Estimate: b = Σ(t - t̄)(Y - Ȳ) / Σ(t - t̄)²
```

### Seasonal Adjustment

**Seasonal index:**
```
SI_i = Average(Y_i) / Overall_average
for each season i
```

**Deseasonalized series:**
```
Y_deseasonalized = Y / SI_season
```

## Promotion-Induced Volatility

### Baseline vs Promoted Demand

**Decomposition:**
```
Total_demand = Baseline + Promotion_lift
```

**Baseline estimation:**
```
Baseline = f(Trend, Seasonality, Calendar_effects)
```

**Promotion lift:**
```
Lift = Total_demand - Baseline
```

### Volatility Modeling

**Variance decomposition:**
```
Var(Total) = Var(Baseline) + Var(Promotion) + 2×Cov(Baseline, Promotion)
```

**Promotion volatility:**
```
σ_promotion = f(Discount_depth, Duration, Frequency)
```

**Stochastic model:**
```
Demand ~ Normal(μ, σ²)
where:
  μ = Forecast_mean
  σ² = Forecast_variance (includes promotion volatility)
```

## Forecast Accuracy Metrics

### Mean Absolute Error (MAE)

```
MAE = (1/n) × Σ |Actual_i - Forecast_i|
```

**Interpretation:**
- Average forecast error in units
- Less sensitive to outliers than RMSE

### Mean Absolute Percentage Error (MAPE)

```
MAPE = (100/n) × Σ |(Actual_i - Forecast_i) / Actual_i|
```

**Interpretation:**
- Percentage error
- Easy to communicate
- Problematic when Actual ≈ 0

### Root Mean Squared Error (RMSE)

```
RMSE = √[(1/n) × Σ(Actual_i - Forecast_i)²]
```

**Interpretation:**
- Penalizes large errors more than MAE
- Same units as forecast
- Standard deviation of errors

### Bias Metrics

**Mean Forecast Error (MFE):**
```
MFE = (1/n) × Σ(Actual_i - Forecast_i)
```

**Interpretation:**
- Positive: Under-forecasting
- Negative: Over-forecasting
- Zero: Unbiased

**Tracking Signal:**
```
TS = MFE / MAD
where MAD = Mean Absolute Deviation
```

**Interpretation:**
- |TS| > 4: Forecast bias detected

## Bias vs Variance Trade-offs

### Bias-Variance Decomposition

**Forecast error:**
```
E[(Y - Ŷ)²] = Bias² + Variance + Irreducible_error
```

**Bias:**
```
Bias = E[Ŷ] - E[Y]
```

**Variance:**
```
Variance = E[(Ŷ - E[Ŷ])²]
```

### Model Complexity Trade-off

**Simple models:**
- Low variance
- Higher bias
- Better generalization

**Complex models:**
- Low bias
- Higher variance
- Risk of overfitting

**Optimal complexity:**
```
Minimize: Bias² + Variance
```

## Probability Distributions of Demand

### Normal Distribution

**Assumption:**
```
Demand ~ N(μ, σ²)
```

**Probability calculations:**
```
P(Demand ≤ x) = Φ((x - μ) / σ)
where Φ = standard normal CDF
```

**Service level:**
```
Service_level = P(Demand ≤ Inventory)
```

### Lognormal Distribution

**For positive, skewed demand:**
```
log(Demand) ~ N(μ, σ²)
```

**Mean and variance:**
```
E[Demand] = exp(μ + σ²/2)
Var(Demand) = exp(2μ + σ²) × (exp(σ²) - 1)
```

### Negative Binomial

**For overdispersed count data:**
```
P(k) = C(k+r-1, k) × p^r × (1-p)^k
where:
  r = shape parameter
  p = success probability
```

## Key Models

### Moving Averages

**Simple moving average:**
```
SMA(n) = (1/n) × Σ Y_{t-i}  for i=0 to n-1
```

**Weighted moving average:**
```
WMA = Σ w_i × Y_{t-i}
where Σ w_i = 1
```

### Exponential Smoothing

**Simple exponential smoothing:**
```
S_t = α×Y_t + (1-α)×S_{t-1}
Forecast_{t+1} = S_t
```

**Holt's method (trend):**
```
Level: L_t = α×Y_t + (1-α)×(L_{t-1} + T_{t-1})
Trend: T_t = β×(L_t - L_{t-1}) + (1-β)×T_{t-1}
Forecast_{t+h} = L_t + h×T_t
```

**Holt-Winters (seasonal):**
```
Level: L_t = α×(Y_t/S_{t-s}) + (1-α)×(L_{t-1} + T_{t-1})
Trend: T_t = β×(L_t - L_{t-1}) + (1-β)×T_{t-1}
Seasonal: S_t = γ×(Y_t/L_t) + (1-γ)×S_{t-s}
Forecast_{t+h} = (L_t + h×T_t) × S_{t-s+h}
```

## Exercises

1. **Time Series Decomposition:** Decompose demand into components
2. **Forecast Evaluation:** Calculate MAPE, RMSE, and bias
3. **Uncertainty Quantification:** Build probability distribution of demand
4. **Promotion Modeling:** Separate baseline from promotion lift

## Case Studies

- Demand forecasting for seasonal products
- Promotion impact analysis
- Forecast accuracy improvement
- Safety stock calculation from forecasts
- Bias detection and correction
