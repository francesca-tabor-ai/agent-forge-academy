---
title: "Lead Time, Variability & Risk"
module: "Module 4"
week: 4
order: 4
description: "How does uncertainty amplify across the supply chain?"
---

# Module 4: Lead Time, Variability & Risk

## Introduction

Uncertainty in lead times and demand amplifies across supply chains, creating the bullwhip effect. This module covers lead time distributions, variance propagation, and risk-adjusted planning.

## Learning Objectives

- Model lead time distributions
- Understand variance amplification (bullwhip effect)
- Apply risk-adjusted planning
- Use variance propagation
- Calculate bullwhip effect ratios
- Apply Bayesian updating
- Quantify the cost of variability
- Adjust plans for lead-time and supply risk

## Lead Time Distributions

### Lead Time Modeling

**Constant:**
```
L = Constant
```

**Stochastic:**
```
L ~ Distribution(Parameters)
```

**Common distributions:**
- Normal: L ~ N(μ_L, σ_L²)
- Exponential: L ~ Exponential(λ)
- Lognormal: log(L) ~ N(μ, σ²)

### Lead Time Demand

**Expected:**
```
E[Demand_L] = E[L] × E[Demand]
```

**Variance:**
```
Var[Demand_L] = E[L] × Var[Demand] + Var[L] × E[Demand]²
```

**If independent:**
```
Var[Demand_L] = E[L] × Var[Demand] + Var[L] × E[Demand]²
```

## Variance Amplification (Bullwhip Effect)

### Bullwhip Effect

**Definition:**
```
Demand variance amplifies upstream
Higher variance at each tier
```

**Causes:**
- Order batching
- Price fluctuations
- Rationing
- Forecast errors

**Mathematical:**
```
Var[Orders_i] > Var[Orders_{i-1}]
```

### Bullwhip Ratio

**Definition:**
```
Bullwhip_ratio = Var[Orders] / Var[Demand]
```

**Interpretation:**
- Ratio = 1: No amplification
- Ratio > 1: Amplification
- Higher ratio = More amplification

**Measurement:**
```
Bullwhip_ratio = Var[Orders_upstream] / Var[Demand_downstream]
```

### Variance Propagation

**Upstream variance:**
```
Var[Orders_i] = f(Var[Orders_{i-1}], Lead_time, ...)
```

**Amplification:**
```
Var[Orders_i] = k × Var[Orders_{i-1}]
where k > 1
```

**Cumulative:**
```
Var[Orders_n] = k^n × Var[Demand]
```

## Risk-Adjusted Planning

### Risk Measures

**Variance:**
```
Var[Outcome] = E[(Outcome - E[Outcome])²]
```

**Standard deviation:**
```
σ = √Var[Outcome]
```

**Value at Risk (VaR):**
```
VaR_α = -Quantile_α(Outcome)
```

**Conditional VaR:**
```
CVaR = E[Loss | Loss ≥ VaR]
```

### Risk-Adjusted Inventory

**Safety stock:**
```
SS = z_α × σ_L
```

**With lead time uncertainty:**
```
σ_L² = E[L] × σ_D² + σ_L² × E[D]²
```

**Risk adjustment:**
```
SS_adjusted = SS_base × Risk_factor
```

## Mathematical Tools

### Variance Propagation

**Sum of random variables:**
```
Var(X + Y) = Var(X) + Var(Y) + 2×Cov(X, Y)
```

**Product:**
```
Var(X × Y) ≈ E[X]²×Var(Y) + E[Y]²×Var(X) + Var(X)×Var(Y)
```

**Chain:**
```
Var(f(X)) ≈ (f'(E[X]))² × Var(X)
```

### Bullwhip Effect Ratios

**Order-up-to policy:**
```
Bullwhip_ratio = 1 + 2×L + 2×L²
where L = lead time
```

**Moving average forecast:**
```
Bullwhip_ratio = 1 + 2×L + 2×L² / p
where p = forecast period
```

**Exponential smoothing:**
```
Bullwhip_ratio = 1 + 2×L + 2×L² × (α / (2 - α))
where α = smoothing parameter
```

### Bayesian Updating

**Prior:**
```
P(Parameter) = Prior
```

**Likelihood:**
```
P(Data | Parameter) = Likelihood
```

**Posterior:**
```
P(Parameter | Data) = P(Data | Parameter) × P(Parameter) / P(Data)
```

**Updating:**
```
Update beliefs with new data
Sequential learning
```

## Learning Outcomes

### Quantifying the Cost of Variability

**Variability cost:**
```
Cost = f(Variance, Risk_aversion)
```

**Components:**
- Safety stock cost
- Stockout cost
- Expediting cost

**Total:**
```
Total_cost = Base_cost + Variability_cost
```

### Adjusting Plans for Risk

**Lead time risk:**
```
Adjust safety stock for lead time uncertainty
SS = z_α × σ_L_adjusted
```

**Supply risk:**
```
Account for supply disruptions
Increase safety stock
Diversify suppliers
```

**Demand risk:**
```
Account for demand uncertainty
Increase safety stock
Improve forecasting
```

## Exercises

1. **Lead Time:** Model lead time distributions
2. **Bullwhip:** Calculate bullwhip effect ratios
3. **Variance:** Analyze variance propagation
4. **Risk:** Adjust plans for risk

## Case Studies

- Bullwhip effect reduction
- Lead time uncertainty management
- Risk-adjusted inventory
- Supply chain resilience
- Variance reduction strategies
