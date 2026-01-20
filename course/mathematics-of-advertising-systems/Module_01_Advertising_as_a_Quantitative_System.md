---
title: "Advertising as a Quantitative System"
module: "Module 1"
week: 1
order: 1
description: "Establish advertising as a measurable, model-driven system"
---

# Module 1: Advertising as a Quantitative System

## Introduction

Advertising can be modeled as a quantitative system with measurable inputs, outputs, and probabilistic outcomes. This module establishes the mathematical foundation for understanding advertising as a measurable, model-driven system.

## Learning Objectives

- Model advertising funnels as mathematical objects
- Understand random variables in advertising
- Distinguish deterministic vs stochastic outcomes
- Calculate CTR and CVR
- Model reach vs frequency
- Calculate expected value per impression
- Translate campaign goals into measurable variables

## Advertising Funnels as Mathematical Objects

### Funnel Structure

**Typical funnel:**
```
Impressions → Clicks → Conversions → Revenue
```

**Mathematical representation:**
```
Impressions = I
Clicks = I × CTR
Conversions = Clicks × CVR = I × CTR × CVR
Revenue = Conversions × Value = I × CTR × CVR × Value
```

### Funnel as State System

**State variables:**
```
I(t) = Impressions at time t
C(t) = Clicks at time t
V(t) = Conversions at time t
R(t) = Revenue at time t
```

**Flow equations:**
```
dC/dt = I × CTR - Clicks_to_conversion
dV/dt = C × CVR - Conversions_to_revenue
dR/dt = V × Value_per_conversion
```

## Random Variables: Impressions, Clicks, Conversions

### Impressions

**Random variable:**
```
I ~ Distribution(Parameters)
```

**Poisson model:**
```
I ~ Poisson(λ)
P(I = k) = (λ^k × exp(-λ)) / k!
```

**Expected value:**
```
E[I] = λ
Var[I] = λ
```

### Clicks

**Conditional on impressions:**
```
C | I ~ Binomial(I, CTR)
```

**Expected clicks:**
```
E[C] = E[I] × CTR
```

**Variance:**
```
Var[C] = E[I] × CTR × (1 - CTR) + Var[I] × CTR²
```

### Conversions

**Conditional on clicks:**
```
V | C ~ Binomial(C, CVR)
```

**Expected conversions:**
```
E[V] = E[I] × CTR × CVR
```

**Variance:**
```
Var[V] = E[I] × CTR × CVR × (1 - CTR × CVR) + Higher_order_terms
```

## Deterministic vs Stochastic Outcomes

### Deterministic Models

**Fixed relationships:**
```
Clicks = Impressions × CTR
Conversions = Clicks × CVR
```

**No randomness:**
```
Given inputs → Predictable outputs
```

**Applications:**
- Planning
- Budgeting
- Long-term forecasting

### Stochastic Models

**Probabilistic:**
```
P(Click | Impression) = CTR
P(Conversion | Click) = CVR
```

**Randomness included:**
```
Outcomes vary due to:
- User behavior
- Context
- Competition
- Random factors
```

**Applications:**
- Performance prediction
- Risk assessment
- Confidence intervals

## Key Metrics & Models

### Click-Through Rate (CTR)

**Definition:**
```
CTR = Clicks / Impressions
```

**Expected value:**
```
E[CTR] = E[Clicks] / E[Impressions]
```

**Variance:**
```
Var[CTR] = CTR × (1 - CTR) / Impressions
```

**Confidence interval:**
```
CTR ± z_α/2 × √(CTR × (1 - CTR) / Impressions)
```

### Conversion Rate (CVR)

**Definition:**
```
CVR = Conversions / Clicks
```

**Expected value:**
```
E[CVR] = E[Conversions] / E[Clicks]
```

**Variance:**
```
Var[CVR] = CVR × (1 - CVR) / Clicks
```

### Expected Value per Impression

**Definition:**
```
E[Value_per_impression] = CTR × CVR × Value_per_conversion
```

**Mathematical:**
```
E[V] = E[I] × CTR × CVR × Value
E[V/I] = CTR × CVR × Value
```

**Optimization:**
```
Maximize: E[Value_per_impression]
Subject to: Budget_constraints
```

## Reach vs Frequency

### Reach

**Definition:**
```
Reach = Unique_users_exposed
```

**Mathematical:**
```
Reach = |{User_i : Impressions_i > 0}|
```

**Expected reach:**
```
E[Reach] = Users × (1 - (1 - P(Impression))^Impressions_per_user)
```

### Frequency

**Definition:**
```
Frequency = Average_impressions_per_reached_user
```

**Mathematical:**
```
Frequency = Total_impressions / Reach
```

**Distribution:**
```
Frequency_i = Impressions_i for user i
Frequency_distribution = f(Frequency_i)
```

### Reach-Frequency Trade-off

**Fixed impressions:**
```
Impressions = Reach × Frequency
```

**Trade-off:**
```
Higher_reach → Lower_frequency
Lower_reach → Higher_frequency
```

**Optimization:**
```
Maximize: Effectiveness(Reach, Frequency)
Subject to: Impressions = Constant
```

## Exercises

1. **Funnel Modeling:** Model advertising funnel mathematically
2. **Random Variables:** Calculate expected clicks and conversions
3. **CTR/CVR:** Estimate rates with confidence intervals
4. **Reach-Frequency:** Optimize reach-frequency trade-off

## Case Studies

- Campaign funnel analysis
- Performance prediction
- Reach-frequency optimization
- Expected value calculation
- Stochastic vs deterministic modeling
