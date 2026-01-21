---
title: "Statistical Learning for Underwriting"
module: "Module 5"
week: 5
order: 5
description: "Predicting risk at the individual level"
---

# Module 5: Statistical Learning for Underwriting

## Introduction

Modern underwriting uses statistical learning to predict risk. This module covers rating variables, GLMs, regularization, and model validation.

## Learning Objectives

- Identify rating variables and segmentation
- Apply Generalized Linear Models (GLMs)
- Use regularization and feature selection
- Validate and calibrate models
- Apply Poisson and Gamma GLMs
- Use Elastic Net regularization
- Calculate Brier score and lift
- Understand how underwriting decisions are mathematically driven

## Rating Variables and Segmentation

### Rating Variables

**Definition:**
```
Variables that predict risk
Used for pricing
```

**Types:**
- Continuous: Age, Value, Distance
- Categorical: Location, Type, Coverage
- Binary: Yes/No indicators

**Selection:**
```
Statistical_significance
Predictive_power
Business_relevance
```

### Segmentation

**Definition:**
```
Group similar risks
Different rates by segment
```

**Methods:**
- Manual: Business rules
- Statistical: Clustering, Decision trees
- Hybrid: Combination

**Application:**
```
Different_premiums by segment
Reflects risk_differences
```

## Generalized Linear Models (GLMs)

### GLM Framework

**Components:**
```
Random_component: Distribution
Systematic_component: Linear_predictor
Link_function: g(μ) = η
```

**Linear predictor:**
```
η = β₀ + β₁×x₁ + ... + βₙ×xₙ
```

**Link function:**
```
g(μ) = η
μ = g^(-1)(η)
```

### Poisson GLM

**For frequency:**
```
N ~ Poisson(λ)
log(λ) = β₀ + β₁×x₁ + ... + βₙ×xₙ
```

**Interpretation:**
```
exp(β_i) = Rate_ratio
Multiplicative effect
```

**Estimation:**
```
Maximum likelihood
Iteratively reweighted least squares
```

### Gamma GLM

**For severity:**
```
X ~ Gamma(α, β)
log(E[X]) = β₀ + β₁×x₁ + ... + βₙ×xₙ
```

**Interpretation:**
```
exp(β_i) = Severity_ratio
Multiplicative effect
```

**Estimation:**
```
Maximum likelihood
```

## Regularization and Feature Selection

### Regularization

**Purpose:**
```
Prevent overfitting
Improve generalization
Feature selection
```

**Lasso (L1):**
```
Penalty: λ × Σ |β_i|
Sparsity: Sets some β_i = 0
```

**Ridge (L2):**
```
Penalty: λ × Σ β_i²
Shrinkage: Shrinks coefficients
```

**Elastic Net:**
```
Penalty: λ × (α×Σ|β_i| + (1-α)×Σβ_i²)
Combines Lasso and Ridge
```

### Feature Selection

**Methods:**
- Forward selection
- Backward elimination
- Stepwise
- Regularization

**Criteria:**
```
AIC, BIC
Cross-validation
Predictive_performance
```

## Model Calibration and Validation

### Calibration

**Definition:**
```
Predicted_probability matches observed_frequency
```

**Calibration plot:**
```
Predicted vs Observed
Should be on diagonal
```

**Calibration metrics:**
```
Brier_score
Calibration_slope
```

### Validation

**Methods:**
- Holdout validation
- Cross-validation
- Bootstrap

**Metrics:**
```
Accuracy, Precision, Recall
AUC, Gini
Lift
```

## Core Mathematics

### Poisson and Gamma GLMs

**Poisson:**
```
N ~ Poisson(λ)
log(λ) = Xβ
E[N] = exp(Xβ)
```

**Gamma:**
```
X ~ Gamma(α, β)
log(E[X]) = Xβ
E[X] = exp(Xβ)
```

**Estimation:**
```
Maximize log-likelihood
Iterative algorithm
```

### Elastic Net Regularization

**Objective:**
```
Minimize: -Log_likelihood + λ × (α×Σ|β_i| + (1-α)×Σβ_i²)
```

**Parameters:**
```
λ: Regularization_strength
α: Lasso_vs_Ridge_balance
```

**Optimization:**
```
Coordinate descent
Cyclic coordinate descent
```

### Brier Score and Lift

**Brier score:**
```
BS = (1/n) × Σ(p_i - y_i)²
where:
  p_i = predicted probability
  y_i = actual outcome (0 or 1)
```

**Lower is better:**
```
BS = 0: Perfect
BS = 1: Worst
```

**Lift:**
```
Lift = Response_rate_in_segment / Overall_response_rate
```

**Interpretation:**
```
Lift > 1: Better than average
Lift < 1: Worse than average
```

## Learning Outcomes

### Understanding Mathematical Underwriting

**Traditional:**
```
Manual rules
Expert judgment
Limited data
```

**Modern:**
```
Statistical models
Data-driven
GLMs, ML
```

**Benefits:**
```
More accurate
Consistent
Scalable
```

**Challenges:**
```
Interpretability
Fairness
Regulation
```

## Exercises

1. **GLMs:** Build Poisson and Gamma GLMs
2. **Regularization:** Apply Elastic Net
3. **Validation:** Validate and calibrate models
4. **Underwriting:** Build underwriting model

## Case Studies

- GLM-based pricing
- Feature selection
- Model validation
- Underwriting automation
- Risk segmentation
