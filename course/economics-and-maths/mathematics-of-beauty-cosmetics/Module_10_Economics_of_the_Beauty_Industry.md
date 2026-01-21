---
title: "Economics of the Beauty Industry"
module: "Module 10"
week: 10
order: 10
description: "Price elasticity, luxury vs. mass-market dynamics, revenue concentration"
---

# Module 10: Economics of the Beauty Industry

## Introduction

The beauty industry exhibits unique economic patterns driven by consumer psychology, brand positioning, and market structure. This module applies economic models to understand pricing, market segmentation, and revenue dynamics.

## Learning Objectives

- Calculate price elasticity of demand
- Model luxury vs. mass-market dynamics
- Analyze revenue concentration patterns
- Apply Pareto distribution to market analysis
- Design pricing strategies using economic models

## Models

### Pareto Distribution

**Probability density function:**
```
f(x) = (α × x_m^α) / x^(α+1)  for x ≥ x_m
```

Where:
- **α** = shape parameter (typically 1-2)
- **x_m** = scale parameter (minimum value)

**Cumulative distribution:**
```
P(X > x) = (x_m / x)^α
```

**Application to beauty industry:**
- Top 20% of products generate ~80% of revenue
- Power-law distribution of brand market share
- Long-tail product catalog

### Elasticity Equations

**Price elasticity of demand:**
```
E_p = (ΔQ/Q) / (ΔP/P) = (dQ/dP) × (P/Q)
```

**Interpretation:**
- |E_p| > 1: Elastic (price-sensitive)
- |E_p| < 1: Inelastic (price-insensitive)
- |E_p| = 1: Unit elastic

**Cross-price elasticity:**
```
E_xy = (ΔQ_x/Q_x) / (ΔP_y/P_y)
```

**Income elasticity:**
```
E_I = (ΔQ/Q) / (ΔI/I)
```

## Price Elasticity

### Luxury Products

**Characteristics:**
- Low price elasticity (|E_p| < 1)
- Veblen effect: Higher price increases demand
- Status signaling value

**Mathematical model:**
```
Q = f(P, Status_value, Quality)
where dQ/dP > 0 (Veblen goods)
```

### Mass-Market Products

**Characteristics:**
- Higher price elasticity (|E_p| > 1)
- Price competition
- Volume-driven revenue

**Model:**
```
Q = a - b×P
Revenue = P × Q = P × (a - b×P)
Optimal price: P* = a/(2b)
```

## Luxury vs. Mass-Market Dynamics

### Market Segmentation

**Two-tier model:**
```
Market = Luxury_segment + Mass_segment

Luxury: High price, low volume, high margin
Mass: Low price, high volume, low margin
```

**Revenue functions:**
```
R_luxury = P_luxury × Q_luxury(P_luxury)
R_mass = P_mass × Q_mass(P_mass)
```

### Brand Positioning

**Positioning matrix:**
- **X-axis**: Price (low to high)
- **Y-axis**: Quality/Perception (low to high)

**Optimal positioning:**
```
Maximize: Revenue = f(Price, Quality, Market_share)
Subject to: Brand_constraints
```

## Revenue Concentration

### Market Share Analysis

**Concentration ratio:**
```
CR_n = Σ (Market_share_i) for top n firms
```

**Herfindahl-Hirschman Index (HHI):**
```
HHI = Σ (Market_share_i)²
```

**Interpretation:**
- HHI < 1500: Competitive market
- HHI 1500-2500: Moderately concentrated
- HHI > 2500: Highly concentrated

### Revenue Distribution

**Pareto analysis:**
```
Top 20% products → 80% revenue (Pareto principle)
```

**Mathematical model:**
```
Revenue_rank = k × Rank^(-α)
where α ≈ 1.2 for beauty industry
```

## Exercises

1. **Elasticity Calculation**: Calculate price elasticity from sales data
2. **Pareto Analysis**: Analyze revenue concentration
3. **Pricing Strategy**: Design optimal pricing using economic models

## Case Studies

- Luxury brand pricing strategies
- Mass-market competition
- Market concentration analysis
- Price optimization models
- Revenue forecasting
