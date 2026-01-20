---
title: "Investment and Asset–Liability Management"
module: "Module 11"
week: 11
order: 11
description: "Managing assets to support uncertain liabilities"
---

# Module 11: Investment and Asset–Liability Management

## Introduction

Asset-liability management aligns investments with insurance liabilities. This module covers time value of money, discounting, duration, convexity, and stochastic asset dynamics.

## Learning Objectives

- Apply time value of money
- Discount claims
- Calculate duration and convexity
- Model stochastic asset dynamics
- Apply present value calculations
- Use mean–variance optimization
- Model Brownian motion with drift
- Align investments with liabilities to control risk

## Time Value of Money

### Present Value

**Single payment:**
```
PV = FV / (1 + r)^t
```

**Annuity:**
```
PV_annuity = PMT × [1 - (1+r)^(-n)] / r
```

**Perpetuity:**
```
PV_perpetuity = PMT / r
```

### Discounting

**Future value:**
```
FV = PV × (1 + r)^t
```

**Discount factor:**
```
DF = 1 / (1 + r)^t
```

**Present value:**
```
PV = FV × DF
```

## Discounting of Claims

### Claim Discounting

**Future claim:**
```
PV(Claim) = Expected_claim / (1 + r)^t
```

**Claim stream:**
```
PV(Claims) = Σ E[Claim_t] / (1 + r)^t
```

**Reserve:**
```
Reserve = PV(Future_claims)
```

### Discount Rate

**Risk-free:**
```
Government_bonds
Low_risk
```

**Risk-adjusted:**
```
Risk-free + Risk_premium
Reflects uncertainty
```

**Regulatory:**
```
Prescribed rates
Regulatory_compliance
```

## Duration and Convexity

### Duration

**Definition:**
```
Duration = (1/PV) × Σ t × CF_t / (1 + r)^t
```

**Macaulay duration:**
```
D = Σ t × PV(CF_t) / PV
```

**Modified duration:**
```
D_mod = D / (1 + r)
```

**Interpretation:**
```
Sensitivity to interest_rate
Price_change ≈ -D_mod × Δr × Price
```

### Convexity

**Definition:**
```
C = (1/PV) × Σ t×(t+1) × CF_t / (1 + r)^(t+2)
```

**Price change:**
```
ΔPrice ≈ -D_mod × Δr × Price + (1/2) × C × (Δr)² × Price
```

**Refinement:**
```
More accurate than duration alone
Accounts for curvature
```

## Stochastic Asset Dynamics

### Asset Returns

**Model:**
```
dS/S = μ×dt + σ×dW
where:
  μ = drift (expected return)
  σ = volatility
  dW = Brownian motion
```

**Solution:**
```
S(t) = S(0) × exp((μ - σ²/2)×t + σ×W(t))
```

**Distribution:**
```
log(S(t)/S(0)) ~ N((μ - σ²/2)×t, σ²×t)
```

### Portfolio Dynamics

**Multiple assets:**
```
dS_i/S_i = μ_i×dt + σ_i×dW_i
```

**Correlation:**
```
Cov(dW_i, dW_j) = ρ_ij×dt
```

**Portfolio:**
```
dP/P = Σ w_i × dS_i/S_i
```

## Core Mathematics

### Present Value Calculations

**Single:**
```
PV = FV / (1 + r)^t
```

**Stream:**
```
PV = Σ CF_t / (1 + r)^t
```

**Continuous:**
```
PV = ∫ CF(t) × exp(-r×t) dt
```

### Mean–Variance Optimization

**Objective:**
```
Maximize: E[Return] - λ × Var[Return]
```

**Constraints:**
```
Σ w_i = 1
w_i ≥ 0 (long only)
```

**Solution:**
```
w* = argmax E[Return] - λ × Var[Return]
Subject to: Constraints
```

### Brownian Motion with Drift

**Definition:**
```
dX = μ×dt + σ×dW
```

**Properties:**
```
E[dX] = μ×dt
Var[dX] = σ²×dt
```

**Solution:**
```
X(t) = X(0) + μ×t + σ×W(t)
```

**Distribution:**
```
X(t) ~ N(X(0) + μ×t, σ²×t)
```

## Learning Outcomes

### Aligning Investments with Liabilities

**Matching:**
```
Asset_duration ≈ Liability_duration
Reduce interest_rate_risk
```

**Immunization:**
```
Duration_match
Convexity_match
Interest_rate_risk_neutral
```

**Optimization:**
```
Maximize: Return
Subject to: Duration_constraints, Risk_constraints
```

## Exercises

1. **Discounting:** Discount future claims
2. **Duration:** Calculate duration and convexity
3. **Asset Dynamics:** Model asset returns
4. **ALM:** Optimize asset-liability matching

## Case Studies

- Asset-liability matching
- Duration management
- Investment strategy
- Interest rate risk
- Portfolio optimization
