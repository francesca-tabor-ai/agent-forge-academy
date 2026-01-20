---
title: "Behavioral Models of Housing Decisions"
module: "Module 13"
week: 13
order: 13
description: "Model human choice under constraints"
---

# Module 13: Behavioral Models of Housing Decisions

## Introduction

Housing decisions involve complex human behavior under constraints. This module applies discrete choice models, search theory, and expectation formation to model buy vs rent decisions and housing search behavior.

## Learning Objectives

- Model buy vs rent decisions
- Apply discrete choice (logit/probit) models
- Analyze search costs and time on market
- Model expectation formation
- Use probability theory and logistic functions

## Buy vs Rent Decisions

### Net Present Value Comparison

**Buy:**
```
NPV_buy = -Down_payment + Σ(Rent_saved_t - Costs_t) / (1+r)^t + Sale_proceeds / (1+r)^n
```

**Rent:**
```
NPV_rent = -Σ(Rent_t) / (1+r)^t
```

**Decision:**
```
If NPV_buy > NPV_rent: Buy
If NPV_buy < NPV_rent: Rent
```

### User Cost of Housing

**Annual cost:**
```
User_cost = r×P + δ×P + τ×P - g×P
where:
  r = interest rate
  δ = depreciation
  τ = property tax
  g = expected appreciation
  P = price
```

**Rent equivalent:**
```
Rent_equivalent = User_cost
```

**Buy if:**
```
Rent > User_cost
```

## Discrete Choice (Logit/Probit) Models

### Logit Model

**Choice probability:**
```
P(Buy) = exp(U_buy) / [exp(U_buy) + exp(U_rent)]
```

**Utility:**
```
U_buy = β₀ + β₁×Income + β₂×Price + β₃×Interest_rate + ...
U_rent = β₀' + β₁'×Income + β₂'×Rent + ...
```

**Odds ratio:**
```
Odds = P(Buy) / P(Rent) = exp(U_buy - U_rent)
```

### Probit Model

**Choice probability:**
```
P(Buy) = Φ(U_buy - U_rent)
where Φ = standard normal CDF
```

**Advantages:**
- Similar to logit
- Normal distribution assumption

### Multinomial Logit

**Multiple alternatives:**
```
P(Choose i) = exp(U_i) / Σ exp(U_j)
```

**Housing types:**
- Buy single-family
- Buy condo
- Rent apartment
- Rent house

## Search Costs and Time on Market

### Search Model

**Optimal stopping:**
```
Accept if: Value ≥ Reservation_value
Continue if: Value < Reservation_value
```

**Reservation value:**
```
V* = E[Max(V, V*)] - Search_cost
```

**Expected search time:**
```
E[Time] = 1 / P(Value ≥ V*)
```

### Time on Market

**Hazard model:**
```
h(t) = P(Sale at t | Not sold by t)
```

**Survival function:**
```
S(t) = P(Not sold by t) = exp(-∫ h(s)ds)
```

**Expected time:**
```
E[Time] = ∫ S(t)dt
```

### Price and Time Trade-off

**Higher price:**
- Longer time on market
- Lower probability of sale

**Optimization:**
```
Maximize: E[Price × P(Sale)] - Holding_cost × E[Time]
```

## Expectation Formation

### Adaptive Expectations

**Price expectation:**
```
E_t[P_{t+1}] = α×P_t + (1-α)×E_{t-1}[P_t]
```

**Gradual adjustment:**
```
Expectations adjust slowly to actual prices
```

### Rational Expectations

**Definition:**
```
E_t[P_{t+1}] = E[P_{t+1} | Information_t]
```

**Unbiased:**
```
E[Error] = 0
```

**Efficient:**
```
No systematic forecast errors
```

### Behavioral Biases

**Overconfidence:**
```
E[Price] > True_expected_price
```

**Anchoring:**
```
E[Price] = f(Recent_price, True_value)
Weight on recent price too high
```

**Extrapolation:**
```
E[Price_{t+1}] = P_t + (P_t - P_{t-1})
Assumes trend continues
```

## Key Math: Probability Theory

### Conditional Probability

**Bayes' rule:**
```
P(A|B) = P(B|A) × P(A) / P(B)
```

**Application:**
```
P(Buy | Characteristics) = f(Characteristics)
```

### Logistic Functions

**Sigmoid:**
```
σ(x) = 1 / (1 + exp(-x))
```

**Properties:**
- Bounded: [0, 1]
- S-shaped
- Symmetric

**Derivative:**
```
σ'(x) = σ(x) × (1 - σ(x))
```

## Exercises

1. **Buy vs Rent:** Model housing tenure choice
2. **Discrete Choice:** Estimate logit model
3. **Search Model:** Optimize search strategy
4. **Expectations:** Model price expectations

## Case Studies

- Tenure choice analysis
- Housing search optimization
- Time on market prediction
- Expectation formation in bubbles
- Behavioral biases in housing
