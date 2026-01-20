---
title: "Pricing, Demand, and Behavioral Economics"
module: "Module 4"
week: 4
order: 4
description: "How customers respond to price and value"
---

# Module 4: Pricing, Demand, and Behavioral Economics

## Introduction

Pricing directly impacts SaaS revenue and growth. This module applies elasticity, willingness-to-pay distributions, and behavioral economics to optimize pricing strategies.

## Learning Objectives

- Calculate price elasticity
- Model willingness-to-pay distributions
- Apply price discrimination
- Distinguish elastic vs inelastic demand
- Design tiered and usage-based pricing
- Identify behavioral pricing thresholds
- Quantify pricing sensitivity

## Elasticity

### Price Elasticity of Demand

**Definition:**
```
E = (ΔQ/Q) / (ΔP/P) = (dQ/dP) × (P/Q)
```

**Interpretation:**
- |E| > 1: Elastic (price-sensitive)
- |E| < 1: Inelastic (price-insensitive)
- |E| = 1: Unit elastic

**Revenue impact:**
```
dRevenue/dP = Q × (1 + E)
```

**Optimal pricing:**
```
If E < -1: Lower price increases revenue
If E > -1: Raise price increases revenue
```

### SaaS Elasticity

**Factors affecting elasticity:**
- Switching costs
- Product differentiation
- Market competition
- Customer segment

**Typical:**
```
SaaS demand often inelastic
High switching costs
Low price sensitivity
```

## Willingness-to-Pay Distributions

### Distribution Models

**Normal:**
```
WTP ~ N(μ, σ²)
```

**Log-normal:**
```
log(WTP) ~ N(μ, σ²)
```

**Uniform:**
```
WTP ~ Uniform(a, b)
```

**Empirical:**
```
WTP ~ Empirical_distribution(data)
```

### Optimal Pricing

**Monopoly:**
```
Maximize: P × Q(P) - Cost
Q(P) = P(WTP ≥ P) × Market_size
```

**Solution:**
```
P* = argmax[P × (1 - F(P)) × Market_size]
where F = WTP CDF
```

### Price Discrimination

**First-degree (perfect):**
```
Charge each customer their WTP
```

**Second-degree (tiered):**
```
Offer multiple tiers
Customers self-select
```

**Third-degree (segmented):**
```
Different prices for different segments
```

## Elastic vs Inelastic Demand

### Elastic Demand

**Characteristics:**
- Many substitutes
- Low switching costs
- Price-sensitive customers

**Strategy:**
```
Lower prices to increase volume
Focus on cost efficiency
```

**Mathematical:**
```
|E| > 1
dRevenue/dP < 0
```

### Inelastic Demand

**Characteristics:**
- Few substitutes
- High switching costs
- Price-insensitive customers

**Strategy:**
```
Raise prices to increase revenue
Focus on value delivery
```

**Mathematical:**
```
|E| < 1
dRevenue/dP > 0
```

## Tiered and Usage-Based Pricing Models

### Tiered Pricing

**Structure:**
```
Tier_1: Price_1, Features_1
Tier_2: Price_2, Features_2
Tier_3: Price_3, Features_3
```

**Self-selection:**
```
Customer chooses tier maximizing utility
```

**Optimization:**
```
Maximize: Σ(Price_i × Customers_i)
Subject to: Self-selection_constraints
```

### Usage-Based Pricing

**Model:**
```
Revenue = Base_price + Usage × Price_per_unit
```

**Two-part tariff:**
```
Revenue = Fixed_fee + Variable_fee × Usage
```

**Optimization:**
```
Maximize: Expected_revenue
Expected_revenue = Fixed_fee + E[Usage] × Variable_fee
```

### Hybrid Models

**Tiered + Usage:**
```
Revenue = Tier_price + (Usage - Tier_included) × Overage_price
```

**Freemium:**
```
Free_tier: Limited features
Paid_tier: Full features
```

## Behavioral Pricing Thresholds

### Price Anchoring

**Effect:**
```
First_price_seen anchors perception
Subsequent_prices evaluated relative to anchor
```

**Application:**
```
Show high price first
Then show actual price (seems lower)
```

### Price Sensitivity Points

**Psychological thresholds:**
```
$9.99 vs $10.00
$99 vs $100
$999 vs $1,000
```

**Mathematical:**
```
Demand_jump at threshold prices
```

### Loss Aversion

**Prospect theory:**
```
V(x) = x^α if x ≥ 0 (gains)
V(x) = -λ×(-x)^β if x < 0 (losses)
where λ > 1 (loss aversion)
```

**Pricing implication:**
```
Customers more sensitive to price increases
Than to equivalent price decreases
```

## Quantifying Pricing Sensitivity

### Conjoint Analysis

**Method:**
```
Present customers with choice sets
Vary price and features
Estimate utility functions
```

**Utility model:**
```
U = β₀ + β₁×Price + β₂×Feature_1 + ...
```

**Price sensitivity:**
```
Price_elasticity = β₁ × Price / U
```

### Van Westendorp Price Sensitivity

**Four questions:**
1. Too expensive
2. Expensive but acceptable
3. Good value
4. Too cheap

**Price range:**
```
Optimal_price = Intersection of curves
```

### A/B Testing

**Method:**
```
Test different prices
Measure conversion
Estimate elasticity
```

**Analysis:**
```
Elasticity = (ΔConversion/Conversion) / (ΔPrice/Price)
```

## Exercises

1. **Elasticity:** Calculate price elasticity from data
2. **WTP:** Model willingness-to-pay distribution
3. **Pricing:** Optimize tiered pricing structure
4. **Sensitivity:** Quantify pricing sensitivity

## Case Studies

- SaaS pricing optimization
- Tiered pricing design
- Usage-based pricing models
- Behavioral pricing strategies
- Price elasticity estimation
