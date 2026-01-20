---
title: "Customer Funnels & Behavioral Probability"
module: "Module 2"
week: 2
order: 2
description: "Model how users move through digital funnels using probability and statistics"
---

# Module 2: Customer Funnels & Behavioral Probability

## Introduction

E-commerce funnels can be modeled probabilistically. This module applies probability theory, Markov chains, and behavioral models to understand and optimize customer journeys.

## Learning Objectives

- Decompose funnels mathematically
- Apply conditional probability
- Model customer journeys with Markov chains
- Understand behavioral noise and bias
- Model conversion rates
- Analyze drop-off patterns
- Optimize multi-step checkout

## Funnel Decomposition

### Funnel Structure

**Typical e-commerce funnel:**
```
Visitors → Product_views → Add_to_cart → Checkout → Purchase
```

**Mathematical:**
```
Visitors = V
Product_views = V × CR_visitor_to_view
Add_to_cart = Product_views × CR_view_to_cart
Checkout = Add_to_cart × CR_cart_to_checkout
Purchase = Checkout × CR_checkout_to_purchase
```

**Overall conversion:**
```
CR_overall = CR_1 × CR_2 × CR_3 × CR_4
```

### Conversion Rates

**Stage conversion:**
```
CR_i = Stage_{i+1} / Stage_i
```

**Cumulative conversion:**
```
CR_cumulative_i = Stage_i / Visitors
```

**Relationship:**
```
CR_cumulative_i = Π CR_j for j=1 to i-1
```

## Conditional Probability

### Basic Conditional Probability

**Definition:**
```
P(A|B) = P(A ∩ B) / P(B)
```

**Funnel application:**
```
P(Purchase | Checkout) = CVR
P(Checkout | Cart) = CR_checkout
```

### Chain Rule

**Multiple stages:**
```
P(Purchase) = P(Visit) × P(View|Visit) × P(Cart|View) × P(Checkout|Cart) × P(Purchase|Checkout)
```

**Mathematical:**
```
P(A₁ ∩ A₂ ∩ ... ∩ Aₙ) = P(A₁) × P(A₂|A₁) × ... × P(Aₙ|A₁∩...∩A_{n-1})
```

### Bayes' Theorem

**Formula:**
```
P(A|B) = P(B|A) × P(A) / P(B)
```

**Application:**
```
P(Fraud | Transaction) = P(Transaction | Fraud) × P(Fraud) / P(Transaction)
```

## Markov Chains for Customer Journeys

### Markov Chain Definition

**States:**
```
S = {Visit, View, Cart, Checkout, Purchase, Exit}
```

**Transition probabilities:**
```
P(State_{t+1} = j | State_t = i) = p_ij
```

**Transition matrix:**
```
P = [p_ij]
where Σ p_ij = 1 for all i
```

### Customer Journey Model

**States:**
- Visit
- Product view
- Add to cart
- Checkout start
- Purchase
- Exit

**Transitions:**
```
P(View | Visit) = p_visit_to_view
P(Cart | View) = p_view_to_cart
P(Checkout | Cart) = p_cart_to_checkout
P(Purchase | Checkout) = p_checkout_to_purchase
P(Exit | Any) = p_exit
```

### Absorption Probabilities

**Absorbing states:**
```
Purchase, Exit
```

**Probability of purchase:**
```
P(Purchase | Start) = Solve system of equations
```

**Matrix method:**
```
P_absorption = (I - Q)^(-1) × R
where Q = transient states
R = transitions to absorbing states
```

## Behavioral Noise and Bias

### Noise in Behavior

**Random variation:**
```
Observed ≠ Expected
Due to randomness
```

**Model:**
```
Observed = Expected + Noise
Noise ~ Distribution
```

**Variance:**
```
Var[Observed] = Var[Expected] + Var[Noise]
```

### Behavioral Bias

**Types:**
- Selection bias
- Measurement bias
- Response bias

**Impact:**
```
Biased estimates
Incorrect conclusions
```

**Correction:**
```
Control for bias
Use unbiased estimators
```

## Core Mathematics

### Bayes' Theorem

**Formula:**
```
P(A|B) = P(B|A) × P(A) / P(B)
```

**Posterior:**
```
P(Hypothesis | Data) = P(Data | Hypothesis) × P(Hypothesis) / P(Data)
```

**Application:**
```
Update beliefs with data
Sequential learning
```

### Bernoulli & Binomial Models

**Bernoulli:**
```
X ~ Bernoulli(p)
P(X=1) = p, P(X=0) = 1-p
E[X] = p, Var[X] = p×(1-p)
```

**Binomial:**
```
Y = Σ X_i where X_i ~ Bernoulli(p)
Y ~ Binomial(n, p)
E[Y] = n×p, Var[Y] = n×p×(1-p)
```

**Funnel application:**
```
Conversions ~ Binomial(Visitors, CR)
```

### Markov Transition Matrices

**Properties:**
```
P_ij ≥ 0 for all i, j
Σ P_ij = 1 for all i
```

**Stationary distribution:**
```
π = π × P
Solve for π
```

**Long-run probabilities:**
```
Limiting_distribution = π
```

## Industry Applications

### Conversion Rate Modeling

**Model:**
```
CR = f(User_features, Product_features, Context)
```

**Logistic regression:**
```
P(Convert) = 1 / (1 + exp(-(β₀ + β₁×Features)))
```

**Estimation:**
```
Maximize log-likelihood
Estimate parameters
```

### Drop-off Analysis

**Drop-off rate:**
```
Drop_off_i = 1 - CR_i
```

**Cumulative drop-off:**
```
Cumulative_drop_off = 1 - CR_cumulative
```

**Bottleneck identification:**
```
Bottleneck = max(Drop_off_i)
```

### Multi-Step Checkout Optimization

**Optimization:**
```
Maximize: CR_overall = Π CR_i
Subject to: UX_constraints
```

**Sensitivity:**
```
dCR_overall/dCR_i = CR_overall / CR_i
```

**Impact:**
```
Improving bottleneck has largest impact
```

## Exercises

1. **Funnel Modeling:** Model e-commerce funnel with probabilities
2. **Markov Chain:** Build Markov model of customer journey
3. **Conversion Analysis:** Analyze conversion rates and drop-offs
4. **Optimization:** Optimize multi-step checkout

## Case Studies

- E-commerce funnel optimization
- Customer journey modeling
- Conversion rate improvement
- Checkout optimization
- Behavioral pattern analysis
