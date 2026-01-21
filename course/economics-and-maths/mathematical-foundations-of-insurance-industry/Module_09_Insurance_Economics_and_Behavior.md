---
title: "Insurance Economics and Behavior"
module: "Module 9"
week: 9
order: 9
description: "Human behavior under risk and incentives"
---

# Module 9: Insurance Economics and Behavior

## Introduction

Human behavior shapes insurance outcomes. This module covers moral hazard, adverse selection, deductibles, contract design, demand elasticity, and competition.

## Learning Objectives

- Understand moral hazard and adverse selection
- Design deductibles and contracts
- Model demand elasticity
- Analyze market competition and pricing power
- Apply utility maximization
- Use game-theoretic incentives
- Calculate price elasticity formulas
- Explain how human behavior shapes insurance outcomes

## Moral Hazard and Adverse Selection

### Moral Hazard

**Definition:**
```
Behavior changes after insurance
Less care, more claims
```

**Model:**
```
Care_level = f(Insurance_coverage, Incentives)
Higher_coverage → Lower_care (potentially)
```

**Mitigation:**
```
Deductibles
Coinsurance
Experience_rating
```

### Adverse Selection

**Definition:**
```
High_risk individuals more likely to buy
Asymmetric information
```

**Model:**
```
P(Buy | High_risk) > P(Buy | Low_risk)
Pool becomes riskier
```

**Mitigation:**
```
Underwriting
Risk_segmentation
Mandatory_insurance
```

## Deductibles and Contract Design

### Deductible

**Definition:**
```
Amount policyholder pays first
Insurer pays remainder
```

**Mathematical:**
```
Insurer_pays = max(0, Loss - Deductible)
Policyholder_pays = min(Loss, Deductible)
```

**Impact:**
```
Reduces moral_hazard
Reduces premium
Shifts risk to policyholder
```

### Contract Design

**Components:**
```
Deductible
Coinsurance
Policy_limit
Coverage_type
```

**Optimization:**
```
Maximize: Utility
Subject to: Budget_constraint
```

**Trade-offs:**
```
Higher_deductible → Lower_premium, Higher_risk
Lower_deductible → Higher_premium, Lower_risk
```

## Demand Elasticity

### Price Elasticity

**Definition:**
```
E = (ΔQ/Q) / (ΔP/P)
```

**Insurance:**
```
Often inelastic
Essential_service
Mandatory in some cases
```

**Segments:**
```
Voluntary: More elastic
Mandatory: Less elastic
```

### Elasticity Estimation

**From data:**
```
E = (ΔQ/Q) / (ΔP/P)
```

**Regression:**
```
log(Q) = α + β×log(P) + ...
E = β
```

**A/B testing:**
```
Test different prices
Measure demand_response
```

## Market Competition and Pricing Power

### Competition

**Market structure:**
```
Monopoly: High_pricing_power
Oligopoly: Moderate_pricing_power
Perfect_competition: Low_pricing_power
```

**Pricing:**
```
Competitive: Price = Cost + Normal_profit
Monopoly: Price > Cost + Normal_profit
```

### Pricing Power

**Definition:**
```
Ability to set prices above cost
Market power
```

**Factors:**
```
Market_share
Product_differentiation
Switching_costs
Regulation
```

## Core Mathematics

### Utility Maximization

**Utility function:**
```
U(W) = Utility of wealth
```

**Expected utility:**
```
E[U] = P(Loss) × U(W - Premium - Loss) + P(No_loss) × U(W - Premium)
```

**Optimal:**
```
Maximize: E[U]
Subject to: Budget_constraint
```

**Insurance decision:**
```
Buy if: E[U_with_insurance] > E[U_without_insurance]
```

### Game-Theoretic Incentives

**Players:**
```
Insurer, Policyholder
```

**Strategies:**
```
Insurer: Premium, Coverage
Policyholder: Care_level, Claims
```

**Nash equilibrium:**
```
Each player best responds
No incentive to deviate
```

**Moral hazard:**
```
Policyholder chooses care_level
Insurer sets premium
Equilibrium: Lower_care, Higher_premium
```

### Price Elasticity Formulas

**Own-price:**
```
E = (dQ/dP) × (P/Q)
```

**Cross-price:**
```
E_ij = (dQ_i/dP_j) × (P_j/Q_i)
```

**Income:**
```
E_income = (dQ/dIncome) × (Income/Q)
```

**Revenue impact:**
```
dRevenue/dP = Q × (1 + E)
```

## Learning Outcomes

### Explaining Behavior-Shaped Outcomes

**Moral hazard:**
```
Insurance → Less_care → More_claims → Higher_premiums
```

**Adverse selection:**
```
High_risk buy → Pool_riskier → Higher_premiums → Low_risk exit
```

**Contract design:**
```
Deductibles reduce moral_hazard
Underwriting reduces adverse_selection
```

**Market:**
```
Competition → Lower_premiums
Regulation → Consumer_protection
```

## Exercises

1. **Moral Hazard:** Model moral hazard
2. **Adverse Selection:** Analyze adverse selection
3. **Contract Design:** Design optimal contract
4. **Elasticity:** Estimate demand elasticity

## Case Studies

- Moral hazard management
- Adverse selection mitigation
- Contract design optimization
- Market competition analysis
- Pricing strategy
