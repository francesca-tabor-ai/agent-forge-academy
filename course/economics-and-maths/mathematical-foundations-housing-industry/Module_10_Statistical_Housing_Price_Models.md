---
title: "Statistical Housing Price Models"
module: "Module 10"
week: 10
order: 10
description: "Decompose and predict housing prices"
---

# Module 10: Statistical Housing Price Models

## Introduction

Housing prices depend on multiple factors. This module applies regression analysis to decompose prices into component values, build price indices, and address bias and identification issues.

## Learning Objectives

- Build hedonic regression models
- Construct repeat-sales indices
- Address bias, noise, and identification issues
- Interpret coefficients in practice
- Apply regression and logarithmic models

## Hedonic Regression Models

### Basic Hedonic Model

**Price function:**
```
Price = f(Characteristics)
```

**Linear form:**
```
Price = β₀ + β₁×Size + β₂×Bedrooms + β₃×Bathrooms + β₄×Age + ... + ε
```

**Log-linear (common):**
```
log(Price) = β₀ + β₁×log(Size) + β₂×Bedrooms + β₃×Bathrooms + ... + ε
```

### Characteristic Values

**Marginal value:**
```
∂Price/∂Characteristic_i = β_i
```

**Percentage impact:**
```
%ΔPrice = β_i × ΔCharacteristic_i (in log model)
```

**Example:**
```
log(Price) = 10 + 0.8×log(Size) + 0.1×Bedrooms
→ 10% size increase → 8% price increase
→ 1 bedroom increase → 10% price increase
```

### Estimation

**Ordinary Least Squares (OLS):**
```
Minimize: Σ(Price_i - ŷ_i)²
β = (XᵀX)⁻¹Xᵀy
```

**Assumptions:**
- Linearity
- Independence
- Homoscedasticity
- Normality

## Repeat-Sales Indices

### Methodology

**Price change:**
```
log(Price_t₂) - log(Price_t₁) = Index_t₂ - Index_t₁ + ε
```

**Regression:**
```
Δlog(Price) = Σ(β_t × D_t) + ε
where D_t = 1 if sale in period t, 0 otherwise
```

**Index:**
```
Index_t = exp(β_t)
```

### Advantages

**Controls for:**
- Unobserved characteristics
- Quality differences
- Location fixed effects

**Limitations:**
- Requires repeat sales
- Sample selection bias
- Infrequent sales

### Hybrid Models

**Combine hedonic and repeat-sales:**
```
Price = Hedonic_component + Repeat_sales_component
```

## Bias, Noise, and Identification Issues

### Omitted Variable Bias

**Problem:**
```
True: Price = β₀ + β₁×Size + β₂×Quality + ε
Estimated: Price = β₀ + β₁×Size + ε
```

**Bias:**
```
E[β̂₁] = β₁ + β₂ × Cov(Size, Quality) / Var(Size)
```

**Solution:**
- Include relevant variables
- Fixed effects
- Instrumental variables

### Measurement Error

**Problem:**
```
Observed: X* = X + u
True: Y = β₀ + β₁×X + ε
```

**Bias:**
```
E[β̂₁] = β₁ × Var(X) / (Var(X) + Var(u))
→ Attenuation bias
```

**Solution:**
- Instrumental variables
- Measurement error models

### Selection Bias

**Problem:**
```
Only observe prices for sold properties
Sold properties ≠ All properties
```

**Solution:**
- Heckman selection model
- Sample selection correction

### Identification

**Endogeneity:**
```
Price = f(Characteristics, Location)
Location = f(Price, Amenities)
```

**Solution:**
- Instrumental variables
- Natural experiments
- Fixed effects

## Interpreting Coefficients in Practice

### Log-Log Model

**Interpretation:**
```
log(Price) = β₀ + β₁×log(Size)
→ β₁ = elasticity
→ 1% size increase → β₁% price increase
```

### Semi-Log Model

**Interpretation:**
```
log(Price) = β₀ + β₁×Bedrooms
→ β₁ ≈ %ΔPrice per unit change
```

### Dummy Variables

**Interpretation:**
```
log(Price) = β₀ + β₁×Pool
→ Pool adds exp(β₁) - 1 × 100% to price
```

### Interaction Terms

**Interpretation:**
```
log(Price) = β₀ + β₁×Size + β₂×Location + β₃×Size×Location
→ Size effect varies by location
```

## Key Math: Regression and Logarithmic Models

### Regression

**OLS estimator:**
```
β̂ = (XᵀX)⁻¹Xᵀy
```

**Variance:**
```
Var(β̂) = σ²(XᵀX)⁻¹
```

**Standard errors:**
```
SE(β̂_i) = √Var(β̂_ii)
```

### Logarithmic Models

**Log transformation:**
```
If Y > 0: log(Y) = ln(Y)
```

**Properties:**
```
log(AB) = log(A) + log(B)
log(A/B) = log(A) - log(B)
log(A^b) = b × log(A)
```

**Elasticity:**
```
Elasticity = (dY/dX) × (X/Y) = dlog(Y)/dlog(X)
```

## Exercises

1. **Hedonic Model:** Estimate price model with characteristics
2. **Repeat Sales:** Build repeat-sales index
3. **Bias Correction:** Address omitted variable bias
4. **Interpretation:** Interpret regression coefficients

## Case Studies

- House price index construction
- Characteristic valuation
- Market segmentation analysis
- Price prediction models
- Bias correction in practice
