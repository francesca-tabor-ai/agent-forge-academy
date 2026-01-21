---
title: "Probability, Uncertainty & User Behavior"
module: "Module 3"
week: 3
order: 3
description: "Model user actions as probabilistic events"
---

# Module 3: Probability, Uncertainty & User Behavior

## Introduction

User actions in advertising are probabilistic events. This module applies Bernoulli processes, binomial models, logistic regression, and information theory to model and predict user behavior.

## Learning Objectives

- Model Bernoulli and binomial processes
- Estimate conversion probabilities
- Apply entropy and uncertainty measures
- Use logistic regression for prediction
- Calculate Shannon entropy
- Apply mutual information
- Predict likelihood of clicks or conversions
- Quantify information value of targeting signals

## Bernoulli and Binomial Processes

### Bernoulli Process

**Definition:**
```
Single trial with two outcomes
P(Success) = p
P(Failure) = 1 - p
```

**Click example:**
```
P(Click | Impression) = CTR
P(No_click | Impression) = 1 - CTR
```

**Expected value:**
```
E[Click] = CTR
Var[Click] = CTR × (1 - CTR)
```

### Binomial Process

**Definition:**
```
n independent Bernoulli trials
X ~ Binomial(n, p)
```

**Clicks from impressions:**
```
Clicks ~ Binomial(Impressions, CTR)
```

**Probability:**
```
P(Clicks = k) = C(n, k) × CTR^k × (1 - CTR)^(n-k)
```

**Expected value:**
```
E[Clicks] = Impressions × CTR
Var[Clicks] = Impressions × CTR × (1 - CTR)
```

### Conversion Process

**Conditional:**
```
Conversions | Clicks ~ Binomial(Clicks, CVR)
```

**Unconditional:**
```
Conversions | Impressions ~ Binomial(Impressions, CTR × CVR)
```

## Conversion Probability Estimation

### Maximum Likelihood Estimation

**Likelihood:**
```
L(CTR) = Π P(Click_i | CTR)
L(CTR) = CTR^Clicks × (1 - CTR)^(Impressions - Clicks)
```

**MLE:**
```
CTR_MLE = Clicks / Impressions
```

**Variance:**
```
Var(CTR_MLE) = CTR × (1 - CTR) / Impressions
```

### Bayesian Estimation

**Prior:**
```
CTR ~ Beta(α, β)
```

**Posterior:**
```
CTR | Data ~ Beta(α + Clicks, β + Impressions - Clicks)
```

**Posterior mean:**
```
E[CTR | Data] = (α + Clicks) / (α + β + Impressions)
```

**Advantages:**
- Incorporates prior knowledge
- Handles small samples
- Provides uncertainty quantification

## Entropy and Uncertainty

### Shannon Entropy

**Definition:**
```
H(X) = -Σ P(x_i) × log₂(P(x_i))
```

**Binary case:**
```
H(p) = -p×log₂(p) - (1-p)×log₂(1-p)
```

**Interpretation:**
- Maximum when p = 0.5 (maximum uncertainty)
- Minimum when p = 0 or 1 (no uncertainty)

**Units:** Bits

### Entropy in Advertising

**Click uncertainty:**
```
H(Click) = -CTR×log₂(CTR) - (1-CTR)×log₂(1-CTR)
```

**Conversion uncertainty:**
```
H(Conversion) = -CVR×log₂(CVR) - (1-CVR)×log₂(1-CVR)
```

**Total uncertainty:**
```
H(Click, Conversion) = H(Click) + H(Conversion | Click)
```

### Conditional Entropy

**Definition:**
```
H(Y|X) = -Σ P(x_i) × Σ P(y_j|x_i) × log₂(P(y_j|x_i))
```

**Click given features:**
```
H(Click | Features) = -Σ P(features) × H(Click | features)
```

**Information gain:**
```
IG = H(Click) - H(Click | Features)
```

## Key Models

### Logistic Regression

**Model:**
```
P(Click = 1 | X) = 1 / (1 + exp(-(β₀ + β₁X₁ + ... + βₙXₙ)))
```

**Log-odds:**
```
log(P/(1-P)) = β₀ + β₁X₁ + ... + βₙXₙ
```

**Interpretation:**
- β_i: Change in log-odds per unit X_i
- exp(β_i): Odds ratio

**Estimation:**
```
Maximize: Log-likelihood = Σ[y_i×log(p_i) + (1-y_i)×log(1-p_i)]
```

### Shannon Entropy

**Properties:**
```
H(X) ≥ 0
H(X) = 0 if P(X) deterministic
H(X) maximum when uniform
```

**Joint entropy:**
```
H(X, Y) = H(X) + H(Y|X)
```

**Chain rule:**
```
H(X₁, ..., Xₙ) = Σ H(X_i | X₁, ..., X_{i-1})
```

### Mutual Information

**Definition:**
```
I(X; Y) = H(X) - H(X|Y)
I(X; Y) = H(Y) - H(Y|X)
I(X; Y) = H(X) + H(Y) - H(X, Y)
```

**Interpretation:**
- Information shared between X and Y
- Reduction in uncertainty about Y given X

**Advertising application:**
```
I(Click; Features) = Information_features_provide_about_click
```

**Feature selection:**
```
Select features with high I(Click; Feature_i)
```

## Quantifying Information Value

### Information Gain

**Definition:**
```
IG = H(Click) - H(Click | Feature)
```

**Interpretation:**
- How much feature reduces click uncertainty
- Higher IG = More valuable feature

### Feature Ranking

**Rank by:**
```
IG(Feature_i) = I(Click; Feature_i)
```

**Selection:**
```
Select top k features by IG
```

### Targeting Value

**Before targeting:**
```
H(Click) = High uncertainty
```

**After targeting:**
```
H(Click | Targeting_features) = Lower uncertainty
```

**Value:**
```
Targeting_value = IG = H(Click) - H(Click | Targeting)
```

## Exercises

1. **Binomial Modeling:** Model clicks as binomial process
2. **Probability Estimation:** Estimate CTR and CVR
3. **Entropy:** Calculate uncertainty in advertising outcomes
4. **Information Gain:** Quantify targeting signal value

## Case Studies

- Click prediction models
- Conversion probability estimation
- Feature selection for targeting
- Information theory in advertising
- Uncertainty quantification
