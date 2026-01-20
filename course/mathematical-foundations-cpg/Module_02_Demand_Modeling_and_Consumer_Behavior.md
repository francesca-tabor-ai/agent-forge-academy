---
title: "Demand Modeling & Consumer Behavior"
module: "Module 2"
week: 2
order: 2
description: "Quantify how consumers respond to price, promotions, and product attributes"
---

# Module 2: Demand Modeling & Consumer Behavior

## Introduction

Understanding consumer demand is fundamental to CPG success. This module applies economic and behavioral models to quantify how consumers respond to price changes, promotions, and product attributes, enabling data-driven pricing and portfolio decisions.

## Learning Objectives

- Model demand curves and calculate elasticity
- Understand cross-elasticity and cannibalization effects
- Apply choice modeling using utility theory
- Incorporate behavioral economics principles
- Predict demand response to pricing and promotions
- Optimize portfolio changes

## Demand Curves and Elasticity

### Demand Function

**Basic form:**
```
Q = f(P, Income, Prices_other, Promotions, ...)
```

**Linear demand:**
```
Q = a - b×P
where:
  a = intercept (maximum demand at P=0)
  b = slope (sensitivity to price)
```

**Constant elasticity demand:**
```
Q = A × P^(-ε)
where:
  A = constant
  ε = price elasticity (absolute value)
```

### Price Elasticity

**Definition:**
```
E_p = (ΔQ/Q) / (ΔP/P) = (dQ/dP) × (P/Q)
```

**Interpretation:**
- |E_p| > 1: Elastic (price-sensitive)
- |E_p| < 1: Inelastic (price-insensitive)
- |E_p| = 1: Unit elastic

**Revenue optimization:**
```
Revenue = P × Q(P)
dR/dP = Q + P × (dQ/dP) = Q × (1 + E_p)
```

**Optimal price (when E_p < -1):**
```
P* = MC / (1 + 1/E_p)
where MC = marginal cost
```

## Cross-Elasticity and Cannibalization

### Cross-Price Elasticity

**Definition:**
```
E_xy = (ΔQ_x/Q_x) / (ΔP_y/P_y)
```

**Interpretation:**
- E_xy > 0: Substitutes (price increase in Y increases demand for X)
- E_xy < 0: Complements (price increase in Y decreases demand for X)
- E_xy ≈ 0: Independent products

### Cannibalization

**Cannibalization rate:**
```
Cannibalization = ΔQ_old / ΔQ_new
where:
  ΔQ_old = lost sales of existing product
  ΔQ_new = sales of new product
```

**Net incremental demand:**
```
Net_demand = Q_new - Cannibalized_sales
```

**Mathematical model:**
```
Q_new = f(P_new, P_old, Attributes)
Q_old = g(P_new, P_old, Attributes)

Cannibalization = (Q_old_before - Q_old_after) / Q_new
```

## Choice Modeling (Utility Theory)

### Utility Function

**Consumer utility:**
```
U_i = V_i + ε_i
where:
  V_i = deterministic utility (observable)
  ε_i = random error (unobservable)
```

**Deterministic utility:**
```
V_i = β₀ + β₁×Price_i + β₂×Attribute_i + ...
```

### Multinomial Logit Model

**Choice probability:**
```
P(choose i) = exp(V_i) / Σ exp(V_j)
```

**Properties:**
- Probabilities sum to 1
- Independence of Irrelevant Alternatives (IIA)
- Closed-form solution

**Estimation:**
```
Log-likelihood = Σ log(P(choice_made))
Maximize: Log-likelihood
```

### Nested Logit

**For correlated alternatives:**
```
P(i|nest) = exp(V_i/λ_nest) / Σ exp(V_j/λ_nest)
P(nest) = exp(λ_nest × IV_nest) / Σ exp(λ_m × IV_m)
where IV_nest = log(Σ exp(V_j/λ_nest))
```

## Behavioral Economics in FMCG

### Reference Price Effects

**Consumer reference price:**
```
P_reference = α×P_previous + (1-α)×P_market
```

**Demand with reference price:**
```
Q = f(P - P_reference)
```

### Loss Aversion

**Value function (prospect theory):**
```
V(x) = x^α  if x ≥ 0 (gains)
V(x) = -λ×(-x)^β  if x < 0 (losses)
where λ > 1 (loss aversion coefficient)
```

### Anchoring and Adjustment

**Price perception:**
```
P_perceived = Anchor + Adjustment
where Adjustment < |Anchor - Actual|
```

## Saturating Response Curves

### Diminishing Returns

**S-shaped response:**
```
Response = Max_response / (1 + (EC50/Stimulus)^n)
where:
  EC50 = half-maximal effective stimulus
  n = Hill coefficient (steepness)
```

**Advertising response:**
```
Sales = Base + (Max_lift × Ad_spend^α) / (K + Ad_spend^α)
where α < 1 (diminishing returns)
```

### Promotion Response

**Promotion lift model:**
```
Lift = β₀ + β₁×Discount + β₂×Discount² + β₃×Duration
```

**Saturation effect:**
```
Lift = Max_lift × (1 - exp(-k×Discount))
```

## Exercises

1. **Elasticity Calculation:** Calculate price elasticity from sales data
2. **Cannibalization Analysis:** Model new product impact on existing portfolio
3. **Choice Model:** Estimate multinomial logit model parameters
4. **Promotion Optimization:** Design optimal promotion strategy

## Case Studies

- Price optimization in competitive markets
- New product launch cannibalization
- Promotion effectiveness measurement
- Portfolio optimization
- Behavioral pricing strategies
