---
title: "Policy, Regulation, and Scenario Modeling"
module: "Module 16"
week: 16
order: 16
description: "Evaluate policy interventions mathematically"
---

# Module 16: Policy, Regulation, and Scenario Modeling

## Introduction

Housing policy interventions have complex effects. This module applies mathematical models to evaluate zoning reforms, subsidies, rent controls, and other policy interventions using comparative statics and counterfactual analysis.

## Learning Objectives

- Model zoning reform simulations
- Analyze subsidy and tax effects
- Evaluate rent control models
- Conduct counterfactual analysis
- Apply comparative statics and policy modeling

## Zoning Reform Simulations

### Zoning Constraints

**Current:**
```
Supply = f(Price, Zoning_constraints)
```

**Reform:**
```
Supply_new = f(Price, Zoning_constraints_new)
```

**Impact:**
```
ΔSupply = Supply_new - Supply_current
```

### Market Equilibrium

**Before:**
```
Q_d(P*) = Q_s(P*, Zoning_old)
```

**After:**
```
Q_d(P*') = Q_s(P*', Zoning_new)
```

**Price impact:**
```
ΔPrice = P*' - P*
```

**Quantity impact:**
```
ΔQuantity = Q*' - Q*
```

### Simulation Model

**Supply response:**
```
Q_s = f(P, FAR_max, Height_max, Density_max, ...)
```

**Demand:**
```
Q_d = f(P, Income, Population, ...)
```

**Equilibrium:**
```
Solve: Q_d(P) = Q_s(P, Zoning)
```

## Subsidy and Tax Effects

### Demand Subsidies

**Housing voucher:**
```
Effective_price = Market_price - Voucher_amount
```

**Demand shift:**
```
Q_d_new = f(Effective_price) > Q_d_old
```

**Market impact:**
```
Price increases
Quantity increases
```

### Supply Subsidies

**Construction subsidy:**
```
Effective_cost = Construction_cost - Subsidy
```

**Supply shift:**
```
Q_s_new = f(P, Effective_cost) > Q_s_old
```

**Market impact:**
```
Price decreases
Quantity increases
```

### Tax Effects

**Property tax:**
```
User_cost = r×P + Tax×P + ...
```

**Impact:**
```
Higher tax → Higher user cost → Lower demand → Lower prices
```

**Transaction tax:**
```
Effective_price = Market_price × (1 + Tax_rate)
```

**Impact:**
```
Reduces transactions
May reduce prices
```

## Rent Control Models

### Basic Rent Control

**Price ceiling:**
```
Rent ≤ Rent_max
```

**Market impact:**
```
If Rent_max < Market_rent:
  Quantity_demanded > Quantity_supplied
  Shortage occurs
```

### Vacancy Control

**Rent increase limits:**
```
Rent_t ≤ Rent_{t-1} × (1 + Increase_limit)
```

**Dynamic:**
```
Rent_t = min(Market_rent_t, Rent_{t-1} × 1.02)
```

### Supply Response

**Long-run:**
```
Rent_control → Lower returns → Less investment → Less supply
```

**Model:**
```
Supply_t = f(Expected_returns_t, Rent_control)
Expected_returns = f(Rent_control, Market_conditions)
```

## Counterfactual Analysis

### Difference-in-Differences

**Model:**
```
Y_it = α + β×Treatment_i + γ×Time_t + δ×(Treatment_i × Time_t) + ε_it
```

**Treatment effect:**
```
δ = (Y_treatment,after - Y_treatment,before) - (Y_control,after - Y_control,before)
```

### Synthetic Control

**Method:**
```
Construct synthetic control from untreated units
Match pre-treatment characteristics
Compare post-treatment outcomes
```

**Mathematical:**
```
Synthetic = Σ(w_i × Control_i)
Minimize: ||Pre_treatment - Synthetic_pre||
```

### Regression Discontinuity

**Design:**
```
Treatment = 1 if X ≥ Threshold
Treatment = 0 if X < Threshold
```

**Effect:**
```
Effect = lim(X→Threshold+) E[Y|X] - lim(X→Threshold-) E[Y|X]
```

## Key Math: Comparative Statics

### Partial Derivatives

**Price response:**
```
∂Price/∂Policy = ?
```

**Supply response:**
```
∂Supply/∂Policy = ?
```

### Total Derivative

**Multi-factor:**
```
dPrice = (∂Price/∂Policy)×dPolicy + (∂Price/∂Income)×dIncome + ...
```

### Elasticity

**Policy elasticity:**
```
E_policy = (ΔPrice/Price) / (ΔPolicy/Policy)
```

## Exercises

1. **Zoning:** Simulate zoning reform impact
2. **Subsidies:** Model subsidy effects
3. **Rent Control:** Analyze rent control impacts
4. **Counterfactual:** Conduct policy evaluation

## Case Studies

- Zoning reform evaluation
- Affordable housing subsidies
- Rent control analysis
- Tax policy impacts
- Policy effectiveness measurement
