---
title: "Housing Economics and Market Equilibrium"
module: "Module 5"
week: 5
order: 5
description: "Explain price formation and supply–demand dynamics"
---

# Module 5: Housing Economics and Market Equilibrium

## Introduction

Housing prices emerge from the interaction of supply and demand. This module applies economic models to understand price formation, elasticity, market clearing, and supply constraints in housing markets.

## Learning Objectives

- Model supply and demand curves for housing
- Calculate price elasticity of housing
- Analyze market clearing and disequilibrium
- Understand short-run vs long-run supply constraints
- Apply calculus and equilibrium models

## Supply and Demand Curves

### Demand Function

**Basic form:**
```
Q_d = f(P, Income, Population, Interest_rates, ...)
```

**Linear demand:**
```
Q_d = a - b×P
where:
  a = intercept (maximum demand at P=0)
  b = slope (sensitivity to price)
```

**Log-linear demand:**
```
log(Q_d) = α + β×log(P) + γ×log(Income) + ...
```

### Supply Function

**Basic form:**
```
Q_s = g(P, Construction_costs, Land_costs, Interest_rates, ...)
```

**Linear supply:**
```
Q_s = c + d×P
where:
  c = intercept (supply at P=0, typically negative)
  d = slope (sensitivity to price)
```

**Long-run supply:**
```
Q_s = f(P, Land_available, Zoning, Construction_capacity)
```

## Price Elasticity of Housing

### Price Elasticity of Demand

**Definition:**
```
E_d = (ΔQ_d/Q_d) / (ΔP/P) = (dQ_d/dP) × (P/Q_d)
```

**Interpretation:**
- |E_d| > 1: Elastic (price-sensitive)
- |E_d| < 1: Inelastic (price-insensitive)
- |E_d| = 1: Unit elastic

**Housing characteristics:**
- Short-run: Inelastic (search costs, moving costs)
- Long-run: More elastic (substitution, migration)

### Price Elasticity of Supply

**Definition:**
```
E_s = (ΔQ_s/Q_s) / (ΔP/P) = (dQ_s/dP) × (P/Q_s)
```

**Short-run:**
```
E_s ≈ 0 (fixed stock, limited new construction)
```

**Long-run:**
```
E_s > 0 (new construction responds to prices)
```

### Income Elasticity

**Definition:**
```
E_I = (ΔQ_d/Q_d) / (ΔI/I)
```

**Housing:**
```
E_I > 1: Luxury good
E_I = 1: Normal good
0 < E_I < 1: Necessity
```

## Market Clearing and Disequilibrium

### Market Equilibrium

**Equilibrium condition:**
```
Q_d(P*) = Q_s(P*)
```

**Equilibrium price:**
```
P* = (a - c) / (b + d)
```

**Equilibrium quantity:**
```
Q* = (a×d + b×c) / (b + d)
```

### Disequilibrium

**Excess demand:**
```
Q_d > Q_s → Price increases
```

**Excess supply:**
```
Q_s > Q_d → Price decreases
```

**Adjustment:**
```
dP/dt = k × (Q_d - Q_s)
where k > 0 (adjustment speed)
```

### Stability

**Stability condition:**
```
|dQ_s/dP| > |dQ_d/dP| at equilibrium
```

**If stable:**
- Small price deviation → Returns to equilibrium
- Market self-corrects

**If unstable:**
- Small price deviation → Diverges
- Market requires intervention

## Short-Run vs Long-Run Supply Constraints

### Short-Run Supply

**Fixed stock:**
```
Q_s = Q_existing (fixed)
E_s ≈ 0
```

**Price response:**
```
Price changes → Little supply response
Mostly demand adjustment
```

### Long-Run Supply

**New construction:**
```
Q_s = Q_existing + Q_new(P)
E_s > 0
```

**Supply function:**
```
Q_new = f(P, Construction_cost, Land_cost, Profit_margin)
```

**Elasticity:**
```
E_s_longrun = (dQ_new/dP) × (P/Q_total)
```

### Supply Constraints

**Land constraints:**
```
Q_max = Land_available × Density_max
```

**Zoning constraints:**
```
Q_max = f(FAR_max, Height_max, ...)
```

**Construction capacity:**
```
Q_max = Construction_capacity × Time
```

**Mathematical model:**
```
Q_s = min(Q_unconstrained(P), Q_max)
```

## Key Math: Calculus and Equilibrium Models

### Derivatives

**Marginal concepts:**
```
Marginal_benefit = dUtility/dHousing
Marginal_cost = dCost/dHousing
```

**Optimal consumption:**
```
dUtility/dHousing = Price
```

### Equilibrium Analysis

**Comparative statics:**
```
dP*/dIncome = ?
dP*/dConstruction_cost = ?
```

**Total derivative:**
```
dP* = (∂P*/∂Income)×dIncome + (∂P*/∂Cost)×dCost + ...
```

### Dynamic Models

**Price adjustment:**
```
P(t+1) = P(t) + α × (Q_d(P(t)) - Q_s(P(t)))
```

**Convergence:**
```
|α × (dQ_d/dP - dQ_s/dP)| < 1 → Stable
```

## Exercises

1. **Equilibrium Calculation:** Find market equilibrium price and quantity
2. **Elasticity Analysis:** Calculate price and income elasticities
3. **Disequilibrium:** Model price adjustment process
4. **Supply Constraints:** Analyze impact of constraints on market

## Case Studies

- Housing market equilibrium analysis
- Price elasticity estimation
- Supply constraint impacts
- Market disequilibrium and correction
- Long-run vs short-run dynamics
