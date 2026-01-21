---
title: "Experimentation, Causality & Inference"
module: "Module 3"
week: 3
order: 3
description: "Quantify what causes performance changes in e-commerce"
---

# Module 3: Experimentation, Causality & Inference

## Introduction

Determining causal effects in e-commerce requires rigorous experimentation. This module covers A/B testing, hypothesis testing, confidence intervals, and causal inference methods.

## Learning Objectives

- Design A/B tests
- Apply hypothesis testing
- Calculate confidence intervals
- Distinguish causal inference from correlation
- Use z-tests and t-tests
- Apply bootstrap methods
- Use Bayesian updating
- Apply potential outcomes framework
- Design and analyze experiments
- Compare Bayesian vs frequentist approaches

## A/B Testing

### Experimental Design

**Randomization:**
```
Randomly assign users to A or B
A = Control
B = Treatment
```

**Sample size:**
```
n = 2 × (z_α/2 + z_β)² × σ² / δ²
where:
  δ = minimum detectable effect
  α = significance level
  β = type II error rate
```

### Analysis

**Conversion rates:**
```
CR_A = Conversions_A / Visitors_A
CR_B = Conversions_B / Visitors_B
```

**Difference:**
```
Δ = CR_B - CR_A
```

**Statistical test:**
```
H₀: Δ = 0
H₁: Δ ≠ 0
```

## Hypothesis Testing

### z-Tests

**Test statistic:**
```
z = (CR_B - CR_A) / SE(Δ)
where SE(Δ) = √(CR_pooled × (1 - CR_pooled) × (1/n_A + 1/n_B))
```

**Decision:**
```
Reject H₀ if |z| > z_α/2
```

**P-value:**
```
P-value = P(|Z| ≥ |z_observed|)
```

### t-Tests

**When to use:**
```
Small sample sizes
Unknown variance
```

**Test statistic:**
```
t = (X̄_B - X̄_A) / SE(Δ)
```

**Distribution:**
```
t ~ t-distribution(df)
where df = n_A + n_B - 2
```

## Confidence Intervals

### Construction

**95% CI:**
```
CI = Estimate ± z_α/2 × SE
```

**For difference:**
```
CI = Δ ± z_α/2 × SE(Δ)
```

**Interpretation:**
```
95% of intervals contain true parameter
```

### Bootstrap Methods

**Bootstrap:**
```
1. Resample data with replacement
2. Calculate statistic
3. Repeat many times
4. Use distribution for CI
```

**Percentile method:**
```
CI = [Percentile_2.5, Percentile_97.5]
```

**Advantages:**
- No distributional assumptions
- Works for complex statistics

## Causal Inference vs Correlation

### Correlation

**Definition:**
```
Corr(X, Y) = Cov(X, Y) / (σ_X × σ_Y)
```

**Problem:**
```
Correlation ≠ Causation
```

**Confounding:**
```
Z causes both X and Y
Creates spurious correlation
```

### Causal Inference

**Potential outcomes:**
```
Y(1) = Outcome if treated
Y(0) = Outcome if control
```

**Average Treatment Effect:**
```
ATE = E[Y(1) - Y(0)]
```

**Estimation:**
```
ATE_hat = E[Y | T=1] - E[Y | T=0]
Requires randomization or unconfoundedness
```

## Core Mathematics

### z-Tests, t-Tests

**z-test:**
```
z = (X̄ - μ₀) / (σ / √n)
Assumes known σ
```

**t-test:**
```
t = (X̄ - μ₀) / (s / √n)
Estimates σ with s
```

**Power:**
```
Power = P(Reject H₀ | H₁ true)
```

### Bootstrap Methods

**Bootstrap sample:**
```
X* = Sample with replacement from X
```

**Bootstrap statistic:**
```
θ* = f(X*)
```

**Bootstrap distribution:**
```
Repeat many times
Use for inference
```

### Bayesian Updating

**Prior:**
```
P(θ) = Prior belief
```

**Likelihood:**
```
P(Data | θ) = Likelihood
```

**Posterior:**
```
P(θ | Data) = P(Data | θ) × P(θ) / P(Data)
```

**Updating:**
```
Posterior becomes prior for next update
Sequential learning
```

### Potential Outcomes Framework

**Observed:**
```
Y = T × Y(1) + (1 - T) × Y(0)
```

**Unobserved:**
```
Cannot observe both Y(1) and Y(0)
```

**Randomization:**
```
Makes Y(1) and Y(0) independent of T
Enables ATE estimation
```

## Industry Applications

### UX Experiments

**Example:**
```
Test new checkout design
A = Old design
B = New design
```

**Metrics:**
```
Conversion rate
Time to complete
Abandonment rate
```

**Analysis:**
```
Compare metrics
Test significance
Make decision
```

### Pricing Tests

**Example:**
```
Test price change
A = Current price
B = New price
```

**Metrics:**
```
Revenue
Units sold
Profit
```

**Analysis:**
```
Calculate impact
Account for volume changes
```

### Promotion Effectiveness

**Example:**
```
Test promotion
A = No promotion
B = With promotion
```

**Metrics:**
```
Incremental sales
Revenue lift
ROI
```

**Analysis:**
```
Measure incremental impact
Calculate ROI
```

## Exercises

1. **A/B Test:** Design and analyze A/B test
2. **Hypothesis Testing:** Test hypotheses using z/t-tests
3. **Bootstrap:** Apply bootstrap for confidence intervals
4. **Causal Inference:** Estimate causal effects

## Case Studies

- E-commerce A/B testing
- Pricing experiment analysis
- Promotion effectiveness
- UX optimization experiments
- Causal inference in practice
