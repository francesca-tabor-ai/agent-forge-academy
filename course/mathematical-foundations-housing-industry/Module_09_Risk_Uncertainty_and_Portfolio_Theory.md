---
title: "Risk, Uncertainty, and Portfolio Theory"
module: "Module 9"
week: 9
order: 9
description: "Manage housing risk at scale"
---

# Module 9: Risk, Uncertainty, and Portfolio Theory

## Introduction

Real estate portfolios require sophisticated risk management. This module applies portfolio theory, Value-at-Risk, and optimization to manage housing risk across property types and locations.

## Learning Objectives

- Calculate price volatility and covariance
- Apply Value-at-Risk (VaR) to housing
- Optimize portfolios across property types
- Conduct stress testing
- Use linear algebra, optimization, and probability

## Price Volatility and Covariance

### Volatility

**Definition:**
```
σ = √Var(Returns)
σ = √E[(R - μ)²]
```

**Annualized:**
```
σ_annual = σ_monthly × √12
σ_annual = σ_daily × √252
```

**Housing returns:**
```
R_t = (Price_t - Price_{t-1}) / Price_{t-1}
```

### Covariance

**Definition:**
```
Cov(R_i, R_j) = E[(R_i - μ_i)(R_j - μ_j)]
```

**Correlation:**
```
ρ_ij = Cov(R_i, R_j) / (σ_i × σ_j)
```

**Portfolio covariance matrix:**
```
Σ = [σ_ij] where σ_ij = Cov(R_i, R_j)
```

### Diversification

**Portfolio variance:**
```
σ_p² = Σ Σ w_i × w_j × σ_ij
```

**Two-asset:**
```
σ_p² = w₁²σ₁² + w₂²σ₂² + 2w₁w₂σ₁₂
```

**Diversification benefit:**
```
If ρ < 1: σ_p < w₁σ₁ + w₂σ₂
```

## Value-at-Risk (VaR)

### Definition

**VaR:**
```
VaR_α = -Quantile_α(Returns)
P(Return ≤ -VaR_α) = α
```

**Interpretation:**
- Maximum loss with probability α
- Example: VaR_0.05 = $100k means 5% chance of losing >$100k

### Calculation Methods

**Historical:**
```
VaR = -Percentile(Historical_returns, α)
```

**Parametric (normal):**
```
VaR = -μ - z_α × σ
where z_α = standard normal quantile
```

**Monte Carlo:**
```
Simulate returns → Calculate VaR from distribution
```

### Conditional VaR (CVaR)

**Definition:**
```
CVaR = E[Loss | Loss ≥ VaR]
```

**Expected shortfall:**
```
CVaR = Average of worst (1-α)% of outcomes
```

## Portfolio Optimization Across Property Types

### Mean-Variance Optimization

**Objective:**
```
Maximize: μ_p - λ × σ_p²
where:
  μ_p = expected portfolio return
  σ_p² = portfolio variance
  λ = risk aversion parameter
```

**Mathematical form:**
```
Maximize: wᵀμ - (λ/2) × wᵀΣw
Subject to: Σ w_i = 1, w_i ≥ 0
```

**Solution:**
```
w* = (1/λ) × Σ⁻¹μ
```

### Efficient Frontier

**Pareto optimal portfolios:**
```
Maximize return for given risk
Minimize risk for given return
```

**Mathematical:**
```
Maximize: wᵀμ
Subject to: wᵀΣw = σ_target², Σ w_i = 1
```

### Property Type Diversification

**Types:**
- Single-family
- Multi-family
- Commercial
- Mixed-use

**Optimization:**
```
Allocate across types to minimize risk
Subject to return constraints
```

## Stress Testing Housing Portfolios

### Stress Scenarios

**Interest rate shock:**
```
Rate_up = Current_rate + 200 bps
Impact: Price_decline, Default_increase
```

**Economic recession:**
```
GDP_decline = -3%
Impact: Unemployment, Income_loss, Defaults
```

**Market crash:**
```
Price_decline = -20%
Impact: Equity_loss, Foreclosure_risk
```

### Scenario Analysis

**Process:**
1. Define stress scenarios
2. Model impact on cash flows
3. Calculate portfolio metrics
4. Assess capital adequacy

**Metrics:**
```
NPV_stress, IRR_stress, VaR_stress
```

### Sensitivity Analysis

**Key risk factors:**
- Interest rates
- Occupancy
- Rent growth
- Cap rates
- Default rates

**Tornado analysis:**
```
Vary each factor ±X%
Measure portfolio impact
```

## Key Math: Linear Algebra and Optimization

### Matrix Operations

**Portfolio return:**
```
μ_p = wᵀμ
```

**Portfolio variance:**
```
σ_p² = wᵀΣw
```

**Gradient:**
```
∇(wᵀμ - (λ/2)wᵀΣw) = μ - λΣw
```

### Optimization

**Quadratic programming:**
```
Minimize: (1/2)wᵀΣw
Subject to: wᵀμ = μ_target, Σ w_i = 1
```

**KKT conditions:**
```
Σw - λ₁μ - λ₂1 = 0
wᵀμ = μ_target
Σ w_i = 1
```

### Probability

**Joint distribution:**
```
f(R₁, R₂, ..., Rₙ) = Multivariate_normal(μ, Σ)
```

**Marginal:**
```
f(R_i) = Normal(μ_i, σ_i²)
```

## Exercises

1. **Volatility:** Calculate returns and volatility
2. **VaR:** Compute Value-at-Risk
3. **Portfolio Optimization:** Optimize property allocation
4. **Stress Testing:** Analyze portfolio under stress

## Case Studies

- Multi-property portfolio optimization
- Risk management strategies
- Stress testing frameworks
- Diversification analysis
- VaR implementation
