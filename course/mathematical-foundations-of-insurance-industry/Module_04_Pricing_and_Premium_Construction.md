---
title: "Pricing and Premium Construction"
module: "Module 4"
week: 4
order: 4
description: "Turning risk into a price"
---

# Module 4: Pricing and Premium Construction

## Introduction

Premium pricing transforms risk into a price. This module covers pure premium, loaded premium, risk loading, credibility theory, and experience vs. exposure rating.

## Learning Objectives

- Calculate pure premium and loaded premium
- Apply risk loading principles
- Use credibility theory
- Distinguish experience vs. exposure rating
- Calculate expected loss + risk load
- Apply Bühlmann credibility
- Use Bayesian updating
- Construct fair and competitive premiums

## Pure Premium and Loaded Premium

### Pure Premium

**Definition:**
```
Pure_premium = Expected_loss
Pure_premium = E[Loss]
```

**Calculation:**
```
Pure_premium = E[Frequency] × E[Severity]
Pure_premium = λ × E[X]
```

**Interpretation:**
```
Average loss per exposure
No profit, no expenses
```

### Loaded Premium

**Definition:**
```
Loaded_premium = Pure_premium + Loading
```

**Loading components:**
```
Risk_load
Expense_load
Profit_load
```

**Total:**
```
Premium = Pure_premium + Risk_load + Expense_load + Profit_load
```

## Risk Loading Principles

### Risk Loading

**Purpose:**
```
Compensate for uncertainty
Provide safety margin
Ensure solvency
```

**Methods:**
```
Variance_loading: k × Var[Loss]
Standard_deviation_loading: k × σ[Loss]
Percentile_loading: Quantile_α - E[Loss]
```

**Typical:**
```
Risk_load = 10-30% of pure_premium
Varies by line and risk
```

### Utility-Based Loading

**Utility function:**
```
U(W) = Utility of wealth
```

**Premium:**
```
Premium such that: E[U(W - Premium)] = E[U(W - Loss)]
```

**Risk aversion:**
```
Higher_risk_aversion → Higher_premium
```

## Credibility Theory

### Credibility Concept

**Definition:**
```
Weight given to experience_data
vs prior/exposure_data
```

**Credibility:**
```
Z = Credibility_weight (0 ≤ Z ≤ 1)
```

**Premium:**
```
Premium = Z × Experience_rate + (1 - Z) × Prior_rate
```

### Bühlmann Credibility

**Formula:**
```
Z = n / (n + K)
where:
  n = exposure (number of observations)
  K = credibility_constant
```

**K calculation:**
```
K = Expected_process_variance / Variance_of_hypothetical_means
```

**Interpretation:**
```
Higher_exposure → Higher_credibility
Higher_variance → Lower_credibility
```

## Experience vs. Exposure Rating

### Experience Rating

**Method:**
```
Use historical_losses
Credibility_weighted
```

**Premium:**
```
Premium = Z × Experience_rate + (1 - Z) × Manual_rate
```

**Advantages:**
```
Reflects actual_experience
Customized
```

**Limitations:**
```
Requires sufficient_data
Credibility_issues
```

### Exposure Rating

**Method:**
```
Use exposure_data
Industry_rates
```

**Premium:**
```
Premium = Exposure × Manual_rate
```

**Advantages:**
```
No data_requirements
Stable
```

**Limitations:**
```
May not reflect risk
Generic
```

## Core Mathematics

### Expected Loss + Risk Load

**Pure premium:**
```
PP = E[Loss]
```

**Risk load:**
```
RL = k × σ[Loss]
or
RL = k × Var[Loss]
```

**Premium:**
```
Premium = PP + RL
Premium = E[Loss] + k × σ[Loss]
```

**Loading factor:**
```
Loading_factor = RL / PP
```

### Bühlmann Credibility

**Credibility:**
```
Z = n / (n + K)
```

**K:**
```
K = E[Var[Loss | Risk_class]] / Var[E[Loss | Risk_class]]
```

**Premium:**
```
Premium = Z × X̄ + (1 - Z) × μ
where:
  X̄ = sample_mean
  μ = prior_mean
```

### Bayesian Updating

**Prior:**
```
θ ~ Prior_distribution
```

**Likelihood:**
```
Data | θ ~ Likelihood
```

**Posterior:**
```
θ | Data ~ Posterior
P(θ | Data) = P(Data | θ) × P(θ) / P(Data)
```

**Premium:**
```
Premium = E[Loss | Data] = ∫ E[Loss | θ] × P(θ | Data) dθ
```

## Learning Outcomes

### Constructing Premiums

**Steps:**
1. Estimate pure premium
2. Add risk load
3. Add expense load
4. Add profit load

**Fair premium:**
```
Covers expected_loss
Compensates for risk
Covers expenses
Provides profit
```

**Competitive:**
```
Market_competitive
Attracts business
Maintains profitability
```

## Exercises

1. **Pure Premium:** Calculate pure premium
2. **Risk Load:** Calculate risk loading
3. **Credibility:** Apply credibility theory
4. **Premium:** Construct complete premium

## Case Studies

- Premium construction
- Credibility applications
- Experience rating
- Exposure rating
- Pricing optimization
