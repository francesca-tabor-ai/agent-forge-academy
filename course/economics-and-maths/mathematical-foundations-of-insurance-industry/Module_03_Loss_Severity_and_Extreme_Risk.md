---
title: "Loss Severity and Extreme Risk"
module: "Module 3"
week: 3
order: 3
description: "Modeling how big losses can get"
---

# Module 3: Loss Severity and Extreme Risk

## Introduction

Loss severity modeling is critical for insurance pricing and capital. This module covers continuous loss distributions, heavy tails, Extreme Value Theory, and catastrophic losses.

## Learning Objectives

- Model continuous loss distributions
- Understand heavy tails and large-loss behavior
- Apply Extreme Value Theory
- Distinguish catastrophic vs. attritional losses
- Use Pareto and Lognormal distributions
- Apply Generalized Extreme Value (GEV)
- Calculate Exceedance Probability curves
- Quantify tail risk and understand why extremes dominate

## Continuous Loss Distributions

### Common Distributions

**Exponential:**
```
f(x) = λ × exp(-λ×x)
E[X] = 1/λ
Var[X] = 1/λ²
```

**Gamma:**
```
f(x) = (β^α / Γ(α)) × x^(α-1) × exp(-β×x)
E[X] = α/β
Var[X] = α/β²
```

**Lognormal:**
```
log(X) ~ N(μ, σ²)
E[X] = exp(μ + σ²/2)
Var[X] = exp(2μ + σ²) × (exp(σ²) - 1)
```

**Pareto:**
```
f(x) = (α × θ^α) / x^(α+1) for x > θ
E[X] = α×θ/(α-1) if α > 1
Var[X] = α×θ²/((α-1)²×(α-2)) if α > 2
```

## Heavy Tails and Large-Loss Behavior

### Heavy-Tailed Distributions

**Definition:**
```
Tail decays slower than exponential
P(X > x) ~ x^(-α) for large x
```

**Properties:**
```
Infinite moments for small α
High probability of large losses
```

**Examples:**
- Pareto
- Log-Cauchy
- Weibull (shape < 1)

### Tail Behavior

**Light tail:**
```
Exponential decay
P(X > x) ~ exp(-λ×x)
```

**Heavy tail:**
```
Power law decay
P(X > x) ~ x^(-α)
```

**Impact:**
```
Heavy_tail → Higher_probability of extreme_losses
Dominates insurance economics
```

## Extreme Value Theory

### Generalized Extreme Value (GEV)

**Distribution:**
```
F(x) = exp(-(1 + ξ×(x-μ)/σ)^(-1/ξ))
where:
  μ = location
  σ = scale
  ξ = shape (tail index)
```

**Types:**
```
ξ > 0: Fréchet (heavy tail)
ξ = 0: Gumbel (exponential tail)
ξ < 0: Weibull (bounded)
```

**Block maxima:**
```
Maximum of n observations
Converges to GEV
```

### Exceedance Probability

**Definition:**
```
P(X > threshold)
```

**Exceedance Probability curve:**
```
P(X > x) vs x
```

**Return period:**
```
T = 1 / P(X > x)
Average time between exceedances
```

**Application:**
```
Quantify extreme risk
Set capital requirements
```

## Catastrophic vs. Attritional Losses

### Attritional Losses

**Definition:**
```
Frequent, small losses
Regular occurrence
```

**Modeling:**
```
Standard distributions
Lognormal, Gamma
```

**Characteristics:**
```
Predictable
Manageable
```

### Catastrophic Losses

**Definition:**
```
Rare, large losses
Extreme events
```

**Modeling:**
```
Extreme value distributions
Pareto, GEV
```

**Characteristics:**
```
Unpredictable
High impact
Dominates capital
```

## Core Mathematics

### Pareto Distribution

**PDF:**
```
f(x) = (α × θ^α) / x^(α+1) for x > θ
```

**CDF:**
```
F(x) = 1 - (θ/x)^α
```

**Tail:**
```
P(X > x) = (θ/x)^α
Power law decay
```

**Moments:**
```
E[X] = α×θ/(α-1) if α > 1
E[X^k] = α×θ^k/(α-k) if α > k
```

### Lognormal Distribution

**PDF:**
```
f(x) = (1/(x×σ√(2π))) × exp(-(log(x)-μ)²/(2σ²))
```

**Properties:**
```
log(X) ~ N(μ, σ²)
Right-skewed
Heavy tail for large σ
```

**Moments:**
```
E[X] = exp(μ + σ²/2)
Var[X] = exp(2μ + σ²) × (exp(σ²) - 1)
```

### Generalized Extreme Value (GEV)

**Distribution:**
```
F(x) = exp(-(1 + ξ×(x-μ)/σ)^(-1/ξ))
```

**Parameters:**
```
μ: Location
σ: Scale (> 0)
ξ: Shape (tail index)
```

**Tail behavior:**
```
ξ > 0: Heavy tail
ξ = 0: Exponential tail
ξ < 0: Bounded
```

### Exceedance Probability Curves

**Definition:**
```
P(X > x) = 1 - F(x)
```

**Plot:**
```
x vs P(X > x)
Log-log scale for power laws
```

**Interpretation:**
```
Probability of exceeding threshold
Risk quantification
```

## Learning Outcomes

### Quantifying Tail Risk

**Tail probability:**
```
P(X > threshold)
```

**Expected exceedance:**
```
E[X | X > threshold]
```

**Value at Risk:**
```
VaR_α = Quantile_α
P(X > VaR_α) = 1 - α
```

**Tail Value at Risk:**
```
TVaR_α = E[X | X > VaR_α]
```

### Understanding Why Extremes Dominate

**Capital:**
```
Capital needed for extremes
Extremes dominate capital requirements
```

**Pricing:**
```
Premium must cover extremes
Extreme losses drive pricing
```

**Economics:**
```
Small probability, large impact
Expected value dominated by tail
```

## Exercises

1. **Distributions:** Fit loss severity distributions
2. **Tail Analysis:** Analyze tail behavior
3. **EVT:** Apply Extreme Value Theory
4. **Risk:** Quantify tail risk

## Case Studies

- Catastrophic loss modeling
- Extreme value analysis
- Tail risk quantification
- Capital requirements
- Reinsurance needs
