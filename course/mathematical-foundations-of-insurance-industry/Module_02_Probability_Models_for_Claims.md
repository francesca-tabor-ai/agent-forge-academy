---
title: "Probability Models for Claims"
module: "Module 2"
week: 2
order: 2
description: "Modeling when losses happen"
---

# Module 2: Probability Models for Claims

## Introduction

Claim frequency modeling is fundamental to insurance. This module covers counting processes, Poisson and Negative Binomial models, exposure normalization, and heterogeneity.

## Learning Objectives

- Model claim frequency as a counting process
- Apply Poisson and Negative Binomial models
- Normalize by exposure and rates
- Understand overdispersion and heterogeneity
- Apply Poisson process
- Use compound distributions
- Model time-to-event
- Model claim occurrence realistically across portfolios

## Claim Frequency as a Counting Process

### Counting Process

**Definition:**
```
N(t) = Number of claims in time [0, t]
```

**Properties:**
```
N(0) = 0
N(t) is non-decreasing
N(t) takes integer values
```

**Increments:**
```
N(t) - N(s) = Claims in (s, t]
```

### Poisson Process

**Definition:**
```
N(t) ~ Poisson(λ×t)
P(N(t) = k) = (λ×t)^k × exp(-λ×t) / k!
```

**Properties:**
```
E[N(t)] = λ×t
Var[N(t)] = λ×t
```

**Rate:**
```
λ = Claims_per_unit_time
```

## Poisson and Negative Binomial Models

### Poisson Model

**Assumption:**
```
Constant rate
Independent increments
No memory
```

**Model:**
```
N ~ Poisson(λ)
E[N] = λ
Var[N] = λ
```

**Properties:**
```
Mean = Variance
Equidispersion
```

**Limitation:**
```
May not fit data
Variance often > Mean
```

### Negative Binomial Model

**Definition:**
```
N ~ Negative_Binomial(r, p)
P(N = k) = C(k+r-1, k) × p^r × (1-p)^k
```

**Properties:**
```
E[N] = r×(1-p)/p
Var[N] = r×(1-p)/p²
Var[N] > E[N]
```

**Overdispersion:**
```
Handles variance > mean
Accounts for heterogeneity
```

**Parameterization:**
```
E[N] = μ
Var[N] = μ + μ²/r
r controls overdispersion
```

## Exposure and Rate Normalization

### Exposure

**Definition:**
```
Exposure = Risk_units × Time
```

**Examples:**
- Policy-years
- Vehicle-years
- Employee-years

**Normalization:**
```
Rate = Claims / Exposure
```

### Rate Normalization

**Claim rate:**
```
λ = Claims / Exposure
```

**Expected claims:**
```
E[Claims] = λ × Exposure
```

**Comparison:**
```
Normalize by exposure
Compare across segments
```

## Overdispersion and Heterogeneity

### Overdispersion

**Definition:**
```
Var[N] > E[N]
More variation than Poisson
```

**Causes:**
```
Heterogeneity in risk
Dependence
Time_variation
```

**Models:**
```
Negative Binomial
Mixed Poisson
Generalized distributions
```

### Heterogeneity

**Definition:**
```
Different risks in portfolio
Different claim rates
```

**Model:**
```
λ_i ~ Distribution
N_i | λ_i ~ Poisson(λ_i)
```

**Marginal:**
```
N_i ~ Negative_Binomial (if λ_i ~ Gamma)
```

## Core Mathematics

### Poisson Process

**Definition:**
```
N(t) ~ Poisson(λ×t)
```

**Inter-arrival times:**
```
Time_between_claims ~ Exponential(λ)
E[Time] = 1/λ
```

**Properties:**
```
Memoryless
Independent increments
Stationary increments
```

### Compound Distributions

**Aggregate:**
```
S = Σ X_i for i=1 to N
where:
  N ~ Frequency_distribution
  X_i ~ Severity_distribution
```

**Expected:**
```
E[S] = E[N] × E[X]
```

**Variance:**
```
Var[S] = E[N]×Var[X] + Var[N]×(E[X])²
```

**Moment generating function:**
```
M_S(t) = M_N(log M_X(t))
```

### Time-to-Event Modeling

**Survival function:**
```
S(t) = P(Time_to_claim > t)
```

**Hazard function:**
```
h(t) = -d(log S(t)) / dt
```

**Exponential:**
```
S(t) = exp(-λ×t)
h(t) = λ (constant)
```

**Weibull:**
```
S(t) = exp(-(t/λ)^k)
h(t) = (k/λ) × (t/λ)^(k-1)
```

## Learning Outcomes

### Modeling Claim Occurrence

**Poisson:**
```
When: Constant_rate, Homogeneous
Model: N ~ Poisson(λ)
```

**Negative Binomial:**
```
When: Overdispersion, Heterogeneity
Model: N ~ Negative_Binomial(r, p)
```

**Segmentation:**
```
Different rates by segment
λ_segment = f(Segment_features)
```

**Realistic modeling:**
```
Account for heterogeneity
Use appropriate distribution
Validate model
```

## Exercises

1. **Poisson:** Model claims as Poisson process
2. **Negative Binomial:** Fit Negative Binomial model
3. **Exposure:** Normalize by exposure
4. **Heterogeneity:** Model heterogeneous portfolios

## Case Studies

- Claim frequency modeling
- Overdispersion analysis
- Exposure normalization
- Portfolio segmentation
- Time-to-claim analysis
