---
title: "Demand Modeling & Forecasting"
module: "Module 4"
week: 4
order: 4
description: "Predict future demand under uncertainty"
---

# Module 4: Demand Modeling & Forecasting

## Introduction

Accurate demand forecasting is critical for e-commerce operations. This module covers time series models, seasonality, trend analysis, and forecast error quantification.

## Learning Objectives

- Model time series behavior
- Analyze seasonality and trends
- Model demand distributions
- Quantify forecast error propagation
- Apply ARIMA-style models
- Calculate autocorrelation functions
- Use error metrics (MAPE, RMSE)
- Forecast sales
- Plan staffing and inventory
- Prepare for peak events

## Time Series Behavior

### Time Series Components

**Decomposition:**
```
Y(t) = Trend(t) + Seasonal(t) + Cyclical(t) + Irregular(t)
```

**Additive:**
```
Y(t) = T(t) + S(t) + C(t) + I(t)
```

**Multiplicative:**
```
Y(t) = T(t) × S(t) × C(t) × I(t)
```

**Log transformation:**
```
log(Y(t)) = log(T(t)) + log(S(t)) + log(C(t)) + log(I(t))
```

### Stationarity

**Definition:**
```
Mean constant over time
Variance constant over time
Covariance depends only on lag
```

**Test:**
```
Augmented Dickey-Fuller test
KPSS test
```

**Non-stationary:**
```
Trend
Seasonality
Unit roots
```

## Seasonality and Trends

### Trend Extraction

**Linear trend:**
```
Trend(t) = a + b×t
```

**Estimation:**
```
b = Σ(t - t̄)(Y - Ȳ) / Σ(t - t̄)²
a = Ȳ - b×t̄
```

**Exponential trend:**
```
Trend(t) = a × exp(b×t)
log(Trend(t)) = log(a) + b×t
```

### Seasonality

**Seasonal patterns:**
```
Daily: Day of week effects
Weekly: Week patterns
Monthly: Month effects
Yearly: Holiday seasons
```

**Seasonal index:**
```
SI_i = Average(Y_i) / Overall_average for season i
```

**Deseasonalization:**
```
Y_deseasonalized = Y / SI_season
```

### Trend + Seasonality

**Model:**
```
Y(t) = Trend(t) × Seasonal(t) + Error(t)
```

**Forecasting:**
```
Forecast(t) = Trend_forecast(t) × Seasonal(t)
```

## Demand Distributions

### Normal Distribution

**Model:**
```
Demand ~ N(μ, σ²)
```

**Properties:**
```
E[Demand] = μ
Var[Demand] = σ²
```

**Application:**
```
Central limit theorem
Large sample sizes
```

### Lognormal Distribution

**Model:**
```
log(Demand) ~ N(μ, σ²)
```

**Properties:**
```
E[Demand] = exp(μ + σ²/2)
Var[Demand] = exp(2μ + σ²) × (exp(σ²) - 1)
```

**Application:**
```
Positive demand
Right-skewed
```

### Poisson Distribution

**Model:**
```
Demand ~ Poisson(λ)
```

**Properties:**
```
E[Demand] = λ
Var[Demand] = λ
```

**Application:**
```
Count data
Low demand items
```

## Forecast Error Propagation

### Error Sources

**Model error:**
```
Error_model = True_value - Model_prediction
```

**Parameter error:**
```
Error_parameter = Model_prediction - Estimated_prediction
```

**Total error:**
```
Error_total = Error_model + Error_parameter
```

### Error Propagation

**Variance:**
```
Var[Forecast] = Var[Model] + Var[Parameter]
```

**Covariance:**
```
If errors correlated:
  Var[Forecast] = Var[Model] + Var[Parameter] + 2×Cov[Model, Parameter]
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

### Autocorrelation Functions

**Autocorrelation:**
```
ρ_k = Corr(y_t, y_{t-k})
```

**Sample ACF:**
```
r_k = Σ(y_t - ȳ)(y_{t-k} - ȳ) / Σ(y_t - ȳ)²
```

**PACF:**
```
Partial autocorrelation
Correlation controlling for intermediate lags
```

### Error Metrics

**MAPE (Mean Absolute Percentage Error):**
```
MAPE = (100/n) × Σ |(Actual - Forecast) / Actual|
```

**RMSE (Root Mean Squared Error):**
```
RMSE = √[(1/n) × Σ(Actual - Forecast)²]
```

**MAE (Mean Absolute Error):**
```
MAE = (1/n) × Σ |Actual - Forecast|
```

**Bias:**
```
Bias = (1/n) × Σ(Actual - Forecast)
```

## Industry Applications

### Sales Forecasting

**Model:**
```
Sales(t) = f(Trend, Seasonality, Promotions, ...)
```

**Forecast:**
```
Forecast_Sales(t+h) = Model(t+h)
```

**Uncertainty:**
```
Prediction_interval = Forecast ± z_α/2 × σ_forecast
```

### Staffing and Inventory Planning

**Demand forecast:**
```
Forecast_demand(t) = Expected_sales(t)
```

**Staffing:**
```
Staff_needed = Forecast_demand / Productivity_per_staff
```

**Inventory:**
```
Inventory_needed = Forecast_demand × Lead_time + Safety_stock
```

### Peak Event Preparation

**Event modeling:**
```
Demand_event = Base_demand × Event_multiplier
```

**Forecasting:**
```
Forecast_event = Forecast_base × Expected_multiplier
```

**Preparation:**
```
Inventory_event = Forecast_event × Safety_factor
Staff_event = Forecast_event / Productivity
```

## Exercises

1. **Time Series:** Decompose time series into components
2. **Forecasting:** Build ARIMA model and forecast
3. **Error Analysis:** Calculate and analyze forecast errors
4. **Planning:** Use forecasts for inventory and staffing

## Case Studies

- E-commerce sales forecasting
- Seasonal demand planning
- Peak event preparation
- Inventory optimization
- Staffing optimization
