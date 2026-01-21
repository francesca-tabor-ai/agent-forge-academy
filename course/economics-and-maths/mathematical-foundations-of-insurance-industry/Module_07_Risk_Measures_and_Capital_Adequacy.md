---
title: "Risk Measures and Capital Adequacy"
module: "Module 7"
week: 7
order: 7
description: "Ensuring the insurer survives bad years"
---

# Module 7: Risk Measures and Capital Adequacy

## Introduction

Capital adequacy ensures insurer solvency. This module covers surplus processes, ruin theory, VaR, TVaR, coherent risk measures, and regulatory capital.

## Learning Objectives

- Model surplus processes and ruin theory
- Calculate Value-at-Risk and Tail Value-at-Risk
- Understand coherent risk measures
- Apply regulatory capital concepts
- Use Cramér–Lundberg model
- Calculate VaR / TVaR
- Determine solvency probability
- Connect statistical risk to solvency and capital planning

## Surplus Processes and Ruin Theory

### Surplus Process

**Definition:**
```
U(t) = Initial_surplus + Premiums - Claims
```

**Mathematical:**
```
U(t) = u + c×t - S(t)
where:
  u = initial surplus
  c = premium rate
  S(t) = aggregate claims
```

**Ruin:**
```
Ruin if: U(t) < 0 for some t
```

### Ruin Probability

**Definition:**
```
ψ(u) = P(Ruin | Initial_surplus = u)
```

**Infinite time:**
```
ψ(u) = P(U(t) < 0 for some t > 0)
```

**Finite time:**
```
ψ(u, T) = P(U(t) < 0 for some t ≤ T)
```

## Value-at-Risk and Tail Value-at-Risk

### Value-at-Risk (VaR)

**Definition:**
```
VaR_α = -Quantile_α(Loss)
P(Loss > VaR_α) = 1 - α
```

**Interpretation:**
```
(1-α)% confidence: Loss ≤ VaR_α
α% probability: Loss > VaR_α
```

**Calculation:**
```
VaR_α = -F^(-1)(α)
where F = loss CDF
```

### Tail Value-at-Risk (TVaR)

**Definition:**
```
TVaR_α = E[Loss | Loss > VaR_α]
```

**Interpretation:**
```
Expected loss in worst (1-α)% cases
Average of tail
```

**Calculation:**
```
TVaR_α = (1/(1-α)) × ∫ VaR_β dβ from α to 1
```

**Properties:**
```
TVaR_α ≥ VaR_α
Coherent risk measure
```

## Coherent Risk Measures

### Coherence Axioms

**Monotonicity:**
```
If X ≤ Y, then ρ(X) ≥ ρ(Y)
```

**Translation invariance:**
```
ρ(X + c) = ρ(X) - c
```

**Positive homogeneity:**
```
ρ(λX) = λ×ρ(X) for λ ≥ 0
```

**Subadditivity:**
```
ρ(X + Y) ≤ ρ(X) + ρ(Y)
```

### Coherent Measures

**TVaR:**
```
Satisfies all axioms
Coherent
```

**VaR:**
```
Violates subadditivity
Not coherent (in general)
```

**Standard deviation:**
```
Not monotonic
Not coherent
```

## Regulatory Capital Concepts

### Solvency Capital

**Definition:**
```
Capital needed for solvency
Regulatory requirement
```

**Calculation:**
```
Capital = Risk_measure(Loss) - Expected_loss
Capital = VaR_99.5% - E[Loss]
```

**Target:**
```
Solvency_ratio = Capital / Required_capital ≥ 1
```

### Risk-Based Capital

**Components:**
```
Underwriting_risk
Credit_risk
Market_risk
Operational_risk
```

**Aggregation:**
```
Total_capital = f(Component_capitals)
Diversification_benefit
```

## Core Mathematics

### Cramér–Lundberg Model

**Surplus:**
```
U(t) = u + c×t - S(t)
where:
  S(t) = Σ X_i for i=1 to N(t)
  N(t) ~ Poisson(λ×t)
```

**Ruin probability:**
```
ψ(u) = (1 - ρ) × exp(-R×u)
where:
  ρ = λ×E[X]/c (safety loading)
  R = adjustment coefficient
```

**Adjustment coefficient:**
```
Solve: λ×M_X(R) - λ - c×R = 0
where M_X = moment generating function
```

### VaR / TVaR

**VaR:**
```
VaR_α = -F^(-1)(α)
```

**TVaR:**
```
TVaR_α = E[Loss | Loss > VaR_α]
TVaR_α = (1/(1-α)) × ∫_VaR_α^∞ x × f(x) dx
```

**For normal:**
```
VaR_α = μ + z_α × σ
TVaR_α = μ + σ × φ(z_α)/(1-α)
```

### Solvency Probability

**Definition:**
```
P(Solvent) = P(Capital > Required_capital)
```

**Calculation:**
```
P(Solvent) = P(Loss < Capital + Expected_loss)
P(Solvent) = F(Capital + E[Loss])
```

**Target:**
```
P(Solvent) ≥ Target (e.g., 99.5%)
```

## Learning Outcomes

### Connecting Risk to Solvency

**Risk measures:**
```
VaR, TVaR quantify risk
Higher_risk → More_capital_needed
```

**Solvency:**
```
Capital must exceed risk
Solvency_ratio ≥ 1
```

**Planning:**
```
Set capital targets
Monitor solvency
Adjust as needed
```

## Exercises

1. **Ruin Theory:** Calculate ruin probability
2. **VaR/TVaR:** Calculate risk measures
3. **Capital:** Determine capital requirements
4. **Solvency:** Assess solvency probability

## Case Studies

- Capital adequacy analysis
- Solvency planning
- Risk measure applications
- Regulatory compliance
- Stress testing
