---
title: "Data Science & AI in Hospitality"
module: "Module 9"
week: 9
order: 9
description: "Learning systems at scale"
---

# Module 9: Data Science & AI in Hospitality

## Introduction

Data science and AI enable personalized, efficient hospitality operations. This module covers recommendation systems, classification, prediction, experimentation, and algorithmic bias.

## Learning Objectives

- Build recommendation systems
- Apply classification and prediction
- Design experimentation and A/B testing
- Understand algorithmic bias and constraints
- Apply matrix factorization
- Use logistic regression
- Apply hypothesis testing
- Build personalized upselling
- Predict fraud and cancellations
- Optimize booking engines

## Recommendation Systems

### Collaborative Filtering

**User-based:**
```
Recommend items liked by similar users
```

**Item-based:**
```
Recommend items similar to liked items
```

**Similarity:**
```
Similarity = Cosine_similarity or Pearson_correlation
```

### Matrix Factorization

**Matrix:**
```
R = User × Item rating matrix
```

**Factorization:**
```
R ≈ U × Vᵀ
where:
  U = User factors
  V = Item factors
```

**Prediction:**
```
Rating_ij = U_i · V_j
```

**Optimization:**
```
Minimize: ||R - U×Vᵀ||² + λ(||U||² + ||V||²)
```

## Classification and Prediction

### Classification

**Problem:**
```
Predict category from features
```

**Examples:**
- Fraud detection
- Cancellation prediction
- Upsell opportunity

**Models:**
- Logistic regression
- Random Forest
- Neural networks

### Prediction

**Problem:**
```
Predict continuous value
```

**Examples:**
- Demand forecast
- Price prediction
- Revenue forecast

**Models:**
- Linear regression
- Gradient boosting
- Time series models

## Experimentation and A/B Testing

### A/B Testing

**Design:**
```
Randomly assign users to A or B
A = Control
B = Treatment
```

**Analysis:**
```
Compare metrics
Test significance
```

**Statistical test:**
```
H₀: No difference
H₁: Difference exists
t-test or z-test
```

### Hypothesis Testing

**Steps:**
1. Formulate hypothesis
2. Collect data
3. Calculate test statistic
4. Make decision

**P-value:**
```
P-value = P(Observed | H₀ true)
Reject H₀ if P-value < α
```

## Algorithmic Bias and Constraints

### Bias Types

**Selection bias:**
```
Training data not representative
```

**Measurement bias:**
```
Biased features
```

**Algorithmic bias:**
```
Algorithm favors certain groups
```

### Fairness

**Demographic parity:**
```
P(Prediction | Group_A) = P(Prediction | Group_B)
```

**Equalized odds:**
```
P(Prediction | Outcome, Group_A) = P(Prediction | Outcome, Group_B)
```

**Mitigation:**
```
Fair algorithms
Bias correction
Diverse training data
```

## Core Mathematics

### Matrix Factorization

**SVD:**
```
R = U × Σ × Vᵀ
```

**Low-rank:**
```
R ≈ U_k × Σ_k × V_kᵀ
where k = rank
```

**Optimization:**
```
Alternating least squares
Stochastic gradient descent
```

### Logistic Regression

**Model:**
```
P(y=1) = 1 / (1 + exp(-(β₀ + β₁×x₁ + ... + βₙ×xₙ)))
```

**Training:**
```
Maximize: Log-likelihood
Minimize: Cross-entropy loss
```

**Interpretation:**
```
Coefficients show feature importance
```

### Hypothesis Testing

**Test statistic:**
```
t = (X̄ - μ₀) / (s / √n)
```

**Distribution:**
```
t ~ t-distribution(df)
```

**Decision:**
```
Reject H₀ if |t| > t_α/2
```

## Industry Applications

### Personalized Upselling

**Problem:**
```
Recommend upsells to guests
```

**Features:**
```
Guest_history
Booking_details
Preferences
```

**Model:**
```
P(Upsell | Features) = f(Features)
```

**Application:**
```
Target high_probability guests
Personalize offers
```

### Fraud and Cancellation Prediction

**Fraud:**
```
P(Fraud | Transaction) = f(Features)
```

**Cancellation:**
```
P(Cancel | Booking) = f(Features)
```

**Application:**
```
Flag high_risk transactions
Take preventive_action
```

### Booking Engine Optimization

**Optimization:**
```
Maximize: Conversion_rate
Subject to: UX_constraints
```

**A/B testing:**
```
Test different designs
Measure conversion
Choose best
```

## Exercises

1. **Recommendation:** Build recommendation system
2. **Classification:** Build classification model
3. **A/B Testing:** Design and analyze A/B test
4. **Bias:** Identify and mitigate algorithmic bias

## Case Studies

- Personalized recommendation systems
- Fraud detection systems
- Booking engine optimization
- A/B testing in hospitality
- Bias mitigation strategies
