---
title: "Demand, Price, and Consumer Choice"
module: "Module 2"
week: 2
order: 2
description: "How guests respond to prices and offers"
---

# Module 2: Demand, Price, and Consumer Choice

## Introduction

Understanding how guests respond to prices is fundamental to hospitality revenue management. This module covers demand curves, price elasticity, discrete choice models, and rate fences.

## Learning Objectives

- Model demand curves in hospitality markets
- Calculate price elasticity and willingness to pay
- Understand discrete choice and substitution effects
- Design rate fences and product differentiation
- Apply elasticity equations
- Use logit choice models
- Apply utility functions
- Optimize dynamic room pricing
- Design menu pricing and bundling
- Set channel pricing (direct vs. OTA)

## Demand Curves in Hospitality Markets

### Demand Function

**Basic:**
```
Q = f(P, Income, Competitors, Seasonality, ...)
```

**Linear:**
```
Q = a - b×P
```

**Log-linear:**
```
log(Q) = α + β×log(P) + ...
```

**Elasticity:**
```
E = (dQ/dP) × (P/Q)
```

### Market Segments

**Business:**
```
Less price-sensitive
Time-constrained
```

**Leisure:**
```
More price-sensitive
Flexible timing
```

**Group:**
```
Volume discounts
Negotiated rates
```

## Price Elasticity and Willingness to Pay

### Price Elasticity

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

### Willingness to Pay

**Distribution:**
```
WTP ~ Distribution(Parameters)
```

**Optimal price:**
```
P* = argmax[P × (1 - F(P)) × Market_size]
where F = WTP CDF
```

## Discrete Choice and Substitution Effects

### Discrete Choice

**Problem:**
```
Guest chooses among alternatives
Hotel_A, Hotel_B, Hotel_C, No_purchase
```

**Logit model:**
```
P(Choose_i) = exp(U_i) / Σ exp(U_j)
where U_i = utility of alternative i
```

**Utility:**
```
U_i = β₀ + β₁×Price_i + β₂×Features_i + ...
```

### Substitution Effects

**Cross-elasticity:**
```
E_ij = (ΔQ_i/Q_i) / (ΔP_j/P_j)
```

**Substitutes:**
```
E_ij > 0
Price increase in j increases demand for i
```

**Complements:**
```
E_ij < 0
Price increase in j decreases demand for i
```

## Rate Fences and Product Differentiation

### Rate Fences

**Definition:**
```
Barriers that segment markets
Prevent arbitrage
```

**Types:**
- Time-based (advance booking, length of stay)
- Product-based (room type, amenities)
- Customer-based (corporate, loyalty status)
- Channel-based (direct, OTA)

**Mathematical:**
```
Price_segment_i = f(Segment_characteristics)
```

### Product Differentiation

**Vertical:**
```
Quality differences
Higher quality = Higher price
```

**Horizontal:**
```
Feature differences
Different preferences
```

**Mathematical:**
```
Utility = f(Price, Quality, Features, ...)
```

## Core Mathematics

### Elasticity

**Own-price:**
```
E = (dQ/dP) × (P/Q)
```

**Estimation:**
```
E = (ΔQ/Q) / (ΔP/P) from data
E = β from log(Q) = α + β×log(P) + ...
```

**Revenue optimization:**
```
Maximize: P × Q(P)
dRevenue/dP = Q × (1 + E) = 0
E = -1 at optimum
```

### Logit Choice Models

**Multinomial logit:**
```
P(Choose_i) = exp(U_i) / Σ exp(U_j)
```

**Properties:**
```
Σ P(Choose_i) = 1
0 ≤ P(Choose_i) ≤ 1
```

**Estimation:**
```
Maximum likelihood
Estimate utility parameters
```

### Utility Functions

**Linear:**
```
U = β₀ + β₁×Price + β₂×Features + ...
```

**Non-linear:**
```
U = f(Price, Features, ...)
```

**Interpretation:**
```
Higher utility = Higher choice probability
```

## Industry Applications

### Dynamic Room Pricing

**Model:**
```
Price(t) = f(Demand_forecast(t), Competitor_prices(t), Inventory(t), ...)
```

**Optimization:**
```
Maximize: Revenue = Σ Price_i × Demand_i
Subject to: Capacity_constraints
```

**Dynamic:**
```
Update prices based on:
- Remaining inventory
- Time_to_arrival
- Demand_forecast
```

### Menu Pricing and Bundling

**Menu engineering:**
```
Profitability = (Price - Cost) × Popularity
```

**Bundling:**
```
Bundle_price < Sum_of_individual_prices
Increase total_revenue
```

**Optimization:**
```
Maximize: Total_profit
Subject to: Price_constraints
```

### Channel Pricing (Direct vs. OTA)

**Direct:**
```
Lower_cost
Higher_margin
```

**OTA:**
```
Higher_reach
Commission_cost
```

**Optimization:**
```
Maximize: Total_profit
Balance: Direct_vs_OTA
```

## Exercises

1. **Elasticity:** Estimate price elasticity from data
2. **Choice Model:** Build logit choice model
3. **Pricing:** Optimize dynamic pricing
4. **Rate Fences:** Design rate fence strategy

## Case Studies

- Hotel dynamic pricing
- Restaurant menu optimization
- Channel pricing strategy
- Rate fence design
- Revenue optimization
