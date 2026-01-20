---
title: "Spatial Mathematics and Location Value"
module: "Module 12"
week: 12
order: 12
description: "Quantify why location dominates housing value"
---

# Module 12: Spatial Mathematics and Location Value

## Introduction

Location is a primary determinant of housing value. This module applies spatial statistics, gravity models, and accessibility measures to quantify location value and neighborhood effects.

## Learning Objectives

- Calculate spatial autocorrelation (Moran's I)
- Apply gravity models of accessibility
- Model neighborhood spillovers
- Analyze transport and commute economics
- Use spatial statistics and exponential decay models

## Spatial Autocorrelation (Moran's I)

### Definition

**Moran's I:**
```
I = (n/W) × [Σ Σ w_ij(z_i - z̄)(z_j - z̄)] / [Σ(z_i - z̄)²]
where:
  n = number of observations
  W = Σ Σ w_ij (sum of weights)
  w_ij = spatial weight
  z_i = value at location i
  z̄ = mean value
```

**Interpretation:**
- I > 0: Positive spatial autocorrelation (clustering)
- I < 0: Negative spatial autocorrelation (dispersion)
- I ≈ 0: No spatial autocorrelation (random)

### Spatial Weights

**Distance-based:**
```
w_ij = 1 if d_ij ≤ threshold, 0 otherwise
```

**Inverse distance:**
```
w_ij = 1 / d_ij^α
```

**Contiguity:**
```
w_ij = 1 if adjacent, 0 otherwise
```

### Significance Testing

**Z-score:**
```
Z = (I - E[I]) / SE(I)
```

**Hypothesis:**
```
H₀: No spatial autocorrelation
H₁: Spatial autocorrelation exists
```

## Gravity Models of Accessibility

### Basic Gravity Model

**Interaction:**
```
I_ij = k × (M_i × M_j) / d_ij^β
where:
  M_i, M_j = masses (population, employment)
  d_ij = distance
  β = distance decay parameter
  k = constant
```

**Accessibility:**
```
A_i = Σ(M_j / d_ij^β) for all destinations j
```

### Housing Application

**Job accessibility:**
```
Accessibility = Σ(Jobs_j / Commute_time_ij^β)
```

**Amenity accessibility:**
```
Accessibility = Σ(Amenities_j / Distance_ij^β)
```

**Price impact:**
```
log(Price) = β₀ + β₁×Accessibility + Controls + ε
```

### Distance Decay

**Exponential:**
```
w(d) = exp(-β×d)
```

**Power:**
```
w(d) = d^(-β)
```

**Estimation:**
```
Estimate β from data
Higher β = Faster decay
```

## Neighborhood Spillovers

### Spillover Effects

**Definition:**
```
Value_i = f(Own_characteristics_i, Neighbors_characteristics_j)
```

**Mathematical model:**
```
log(Price_i) = β₀ + β₁×X_i + β₂×Σ(w_ij × X_j) + ε_i
where w_ij = spatial weights
```

### Spatial Lag Model

**SAR (Spatial Autoregressive):**
```
y = ρ×W×y + X×β + ε
where:
  W = spatial weights matrix
  ρ = spatial autocorrelation parameter
```

**Interpretation:**
- ρ > 0: Positive spillovers
- Neighbors' prices affect own price

### Spatial Error Model

**SEM:**
```
y = X×β + u
u = λ×W×u + ε
```

**Interpretation:**
- Spatial correlation in errors
- Unobserved factors correlated spatially

## Transport and Commute Economics

### Commute Cost

**Time cost:**
```
Time_cost = Commute_time × Value_of_time
```

**Distance cost:**
```
Distance_cost = Distance × Cost_per_mile
```

**Total:**
```
Commute_cost = Time_cost + Distance_cost
```

### Value of Time

**Estimation:**
```
VOT = Wage_rate × (1 - Tax_rate) × Time_factor
```

**Typical:**
```
VOT = 50-100% of wage rate
```

### Location Choice

**Utility:**
```
U = β₀ + β₁×Housing_quality - β₂×Commute_cost + ε
```

**Choice probability:**
```
P(Choose i) = exp(U_i) / Σ exp(U_j)
```

## Key Math: Spatial Statistics

### Spatial Regression

**Spatial Durbin Model:**
```
y = ρ×W×y + X×β + W×X×θ + ε
```

**Estimation:**
```
Maximum likelihood
Two-stage least squares
```

### Exponential Decay Models

**Distance decay:**
```
f(d) = A × exp(-β×d)
```

**Cumulative:**
```
F(d) = A × (1 - exp(-β×d)) / β
```

**Half-distance:**
```
d_0.5 = ln(2) / β
```

## Exercises

1. **Spatial Autocorrelation:** Calculate Moran's I
2. **Accessibility:** Build gravity model of accessibility
3. **Spillovers:** Estimate neighborhood spillover effects
4. **Commute:** Model commute cost and location choice

## Case Studies

- Location value quantification
- Accessibility impact on prices
- Neighborhood spillover analysis
- Transport infrastructure effects
- Spatial clustering analysis
