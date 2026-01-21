---
title: "Mathematical Foundations of Digital Commerce"
module: "Module 1"
week: 1
order: 1
description: "Establish the core quantitative language of e-commerce systems"
---

# Module 1: Mathematical Foundations of Digital Commerce

## Introduction

E-commerce systems operate on mathematical principles. This module establishes the quantitative foundations for modeling customer behavior, traffic patterns, and revenue scaling in digital commerce.

## Learning Objectives

- Distinguish discrete vs continuous modeling
- Model random variables in customer behavior
- Calculate expectations, variance, and distributions
- Understand scaling laws in digital platforms
- Model session arrivals
- Understand traffic volatility
- Model revenue scaling with user base

## Discrete vs Continuous Modeling

### Discrete Models

**Definition:**
```
Variables take discrete values
Countable outcomes
```

**Examples:**
- Number of visitors
- Number of orders
- Number of items in cart

**Mathematical:**
```
X ∈ {0, 1, 2, 3, ...}
```

### Continuous Models

**Definition:**
```
Variables take continuous values
Uncountable outcomes
```

**Examples:**
- Revenue amount
- Time between visits
- Cart value

**Mathematical:**
```
X ∈ ℝ (real numbers)
```

### Choosing Model Type

**Discrete when:**
- Counting events
- Small numbers
- Natural integer values

**Continuous when:**
- Measurements
- Large numbers (approximation)
- Smooth processes

## Random Variables in Customer Behavior

### Customer Arrivals

**Poisson process:**
```
N(t) ~ Poisson(λ×t)
P(N(t) = k) = (λ×t)^k × exp(-λ×t) / k!
```

**Properties:**
```
E[N(t)] = λ×t
Var[N(t)] = λ×t
```

**Inter-arrival times:**
```
Time between arrivals ~ Exponential(λ)
E[Time] = 1/λ
```

### Purchase Behavior

**Bernoulli:**
```
Purchase | Visit ~ Bernoulli(p)
P(Purchase) = p
P(No_purchase) = 1 - p
```

**Binomial:**
```
Purchases in n visits ~ Binomial(n, p)
E[Purchases] = n×p
Var[Purchases] = n×p×(1-p)
```

### Cart Value

**Distribution:**
```
Cart_value ~ Distribution(Parameters)
```

**Common models:**
- Normal: Cart_value ~ N(μ, σ²)
- Lognormal: log(Cart_value) ~ N(μ, σ²)
- Gamma: Cart_value ~ Gamma(α, β)

## Expectations, Variance, Distributions

### Expected Value

**Definition:**
```
E[X] = Σ x_i × P(x_i)  (discrete)
E[X] = ∫ x × f(x)dx  (continuous)
```

**Properties:**
```
E[a×X + b] = a×E[X] + b
E[X + Y] = E[X] + E[Y]
```

**E-commerce:**
```
E[Revenue] = E[Visitors] × E[Conversion_rate] × E[Cart_value]
```

### Variance

**Definition:**
```
Var[X] = E[(X - E[X])²]
Var[X] = E[X²] - (E[X])²
```

**Properties:**
```
Var[a×X + b] = a²×Var[X]
Var[X + Y] = Var[X] + Var[Y] + 2×Cov[X,Y]
```

**Coefficient of variation:**
```
CV = σ / μ
```

### Common Distributions

**Poisson:**
```
X ~ Poisson(λ)
E[X] = λ, Var[X] = λ
```

**Normal:**
```
X ~ N(μ, σ²)
E[X] = μ, Var[X] = σ²
```

**Exponential:**
```
X ~ Exponential(λ)
E[X] = 1/λ, Var[X] = 1/λ²
```

## Scaling Laws in Digital Platforms

### Linear Scaling

**Model:**
```
Revenue = a × Users
```

**Properties:**
```
Constant per-user revenue
Linear growth
```

### Logarithmic Growth

**Model:**
```
Revenue = a × log(Users)
```

**Properties:**
```
Diminishing returns
Slower growth with scale
```

### Power Law Scaling

**Model:**
```
Revenue = a × Users^α
```

**Properties:**
```
α > 1: Super-linear (network effects)
α = 1: Linear
α < 1: Sub-linear (saturation)
```

### Network Effects

**Metcalfe's Law:**
```
Value ∝ n²
where n = number of users
```

**Revenue:**
```
Revenue = a × Users²
```

## Core Mathematics

### Probability Theory

**Axioms:**
```
P(A) ≥ 0
P(Sample_space) = 1
P(A ∪ B) = P(A) + P(B) if A ∩ B = ∅
```

**Conditional probability:**
```
P(A|B) = P(A ∩ B) / P(B)
```

**Independence:**
```
P(A ∩ B) = P(A) × P(B)
```

### Linear & Nonlinear Functions

**Linear:**
```
f(x) = a×x + b
```

**Nonlinear:**
```
f(x) = a×x² + b×x + c  (quadratic)
f(x) = a×exp(b×x)  (exponential)
f(x) = a×log(x)  (logarithmic)
```

### Logarithmic Growth

**Model:**
```
y = a × log(x) + b
```

**Derivative:**
```
dy/dx = a / x
```

**Application:**
```
Diminishing returns
Saturation effects
```

## Industry Applications

### Modeling Session Arrivals

**Poisson arrivals:**
```
Sessions(t) ~ Poisson(λ×t)
```

**Rate estimation:**
```
λ = Sessions_observed / Time_period
```

**Forecasting:**
```
E[Sessions_tomorrow] = λ × 24_hours
```

### Understanding Traffic Volatility

**Variance:**
```
Var[Sessions] = λ (for Poisson)
```

**Coefficient of variation:**
```
CV = √λ / λ = 1/√λ
```

**Interpretation:**
- Higher λ → Lower relative volatility
- Lower λ → Higher relative volatility

### Revenue Scaling with User Base

**Model:**
```
Revenue = f(Users)
```

**Linear:**
```
Revenue = ARPU × Users
```

**Network effects:**
```
Revenue = a × Users^α where α > 1
```

**Saturation:**
```
Revenue = Max × (1 - exp(-k × Users))
```

## Exercises

1. **Random Variables:** Model customer arrivals as Poisson process
2. **Expectations:** Calculate expected revenue from traffic
3. **Scaling:** Analyze revenue scaling patterns
4. **Volatility:** Quantify traffic volatility

## Case Studies

- E-commerce traffic modeling
- Revenue scaling analysis
- Customer behavior distributions
- Platform growth modeling
- Volatility management
