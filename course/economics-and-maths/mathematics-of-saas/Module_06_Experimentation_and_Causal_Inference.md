---
title: "Experimentation & Causal Inference"
module: "Module 6"
week: 6
order: 6
description: "Knowing whether changes actually work"
---

# Module 6: Experimentation & Causal Inference

## Introduction

SaaS companies rely on experimentation to make data-driven decisions. This module covers hypothesis testing, statistical power, A/B testing frameworks, and avoiding common misinterpretations.

## Learning Objectives

- Apply hypothesis testing
- Calculate statistical power
- Distinguish Bayesian vs frequentist inference
- Design A/B testing frameworks
- Interpret confidence intervals vs posteriors
- Avoid false positives in experiments
- Design statistically valid experiments

## Hypothesis Testing

### Null and Alternative Hypotheses

**Null hypothesis (H₀):**
```
H₀: No difference between treatments
H₀: Treatment_effect = 0
```

**Alternative hypothesis (H₁):**
```
H₁: Difference exists
H₁: Treatment_effect ≠ 0
```

### Test Statistics

**Z-test:**
```
Z = (X̄_treatment - X̄_control) / SE
where SE = √(σ²/n_treatment + σ²/n_control)
```

**T-test:**
```
T = (X̄_treatment - X̄_control) / SE
Uses t-distribution
```

**P-value:**
```
P-value = P(|Test_statistic| ≥ |Observed| | H₀ true)
```

### Decision Rule

**Significance level (α):**
```
Reject H₀ if P-value < α
Typical: α = 0.05
```

**Type I error:**
```
P(Reject H₀ | H₀ true) = α
False positive rate
```

**Type II error:**
```
P(Fail to reject H₀ | H₁ true) = β
False negative rate
```

## Statistical Power

### Power Definition

**Statistical power:**
```
Power = 1 - β = P(Reject H₀ | H₁ true)
```

**Interpretation:**
- Probability of detecting effect if it exists
- Higher power = Better experiment

### Power Calculation

**For two-sample test:**
```
Power = 1 - Φ(z_α/2 - Effect_size / SE) + Φ(-z_α/2 - Effect_size / SE)
```

**Effect size:**
```
Effect_size = (μ_treatment - μ_control) / σ
```

**Sample size:**
```
n = 2 × (z_α/2 + z_β)² × σ² / Effect_size²
```

### Factors Affecting Power

**Increase power:**
- Larger effect size
- Larger sample size
- Lower variance
- Higher significance level

**Trade-off:**
```
Power vs Sample_size
Power vs Significance_level
```

## Bayesian vs Frequentist Inference

### Frequentist Approach

**Philosophy:**
```
Parameters are fixed
Data is random
```

**Inference:**
```
Confidence intervals
P-values
Hypothesis tests
```

**Interpretation:**
```
95% CI: 95% of intervals contain true parameter
```

### Bayesian Approach

**Philosophy:**
```
Parameters are random
Data is fixed
```

**Inference:**
```
Posterior distributions
Credible intervals
Bayes factors
```

**Bayes' theorem:**
```
P(θ|Data) = P(Data|θ) × P(θ) / P(Data)
Posterior = Likelihood × Prior / Evidence
```

**Interpretation:**
```
95% credible interval: 95% probability parameter in interval
```

### Comparison

**Frequentist:**
- Objective
- No prior needed
- Harder to interpret

**Bayesian:**
- Subjective (prior)
- Natural interpretation
- Incorporates prior knowledge

## A/B Testing Frameworks

### Experimental Design

**Randomization:**
```
Randomly assign users to A or B
```

**Control:**
```
A = Control (current)
B = Treatment (new)
```

**Sample size:**
```
Calculate based on:
- Effect size
- Power
- Significance level
```

### Analysis

**Conversion rate:**
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
Z = Δ / SE(Δ)
P-value = P(|Z| ≥ |z_observed|)
```

### Multiple Variants

**A/B/n test:**
```
Compare multiple variants
Adjust for multiple comparisons
Bonferroni correction: α_adjusted = α / n
```

## Confidence Intervals vs Posteriors

### Confidence Intervals

**Definition:**
```
CI = [Estimate - z_α/2 × SE, Estimate + z_α/2 × SE]
```

**Interpretation:**
```
95% of intervals contain true parameter
```

**Frequentist:**
```
Parameter is fixed
Interval is random
```

### Credible Intervals

**Definition:**
```
Posterior interval containing 95% probability
```

**Interpretation:**
```
95% probability parameter in interval
```

**Bayesian:**
```
Parameter is random
Interval is fixed (given data)
```

## False Positives in SaaS Experiments

### Multiple Testing Problem

**Problem:**
```
Test many hypotheses
Some will be significant by chance
```

**Example:**
```
Test 20 features
α = 0.05
Expected false positives = 20 × 0.05 = 1
```

### Solutions

**Bonferroni correction:**
```
α_adjusted = α / Number_of_tests
```

**False Discovery Rate (FDR):**
```
Control expected proportion of false discoveries
```

**Sequential testing:**
```
Stop early if significant
Adjust for early stopping
```

### Best Practices

**Pre-registration:**
```
Define hypotheses before data collection
```

**Replication:**
```
Replicate significant results
```

**Effect size:**
```
Focus on effect size, not just significance
```

## Exercises

1. **Hypothesis Testing:** Design and analyze A/B test
2. **Power Analysis:** Calculate required sample size
3. **Bayesian Analysis:** Apply Bayesian inference
4. **Multiple Testing:** Correct for multiple comparisons

## Case Studies

- A/B test design and analysis
- Statistical power optimization
- Bayesian experimentation
- False positive prevention
- Experimentation best practices
