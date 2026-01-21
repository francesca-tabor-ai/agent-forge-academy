---
title: "Real Estate Investment Analysis"
module: "Module 8"
week: 8
order: 8
description: "Evaluate housing as an income-producing asset"
---

# Module 8: Real Estate Investment Analysis

## Introduction

Real estate investment requires rigorous financial analysis. This module covers Net Present Value (NPV), Internal Rate of Return (IRR), capitalization rates, and cash flow modeling under uncertainty.

## Learning Objectives

- Calculate Net Present Value (NPV)
- Determine Internal Rate of Return (IRR)
- Apply capitalization rates
- Model cash flows under uncertainty
- Use discounted cash flow and root finding

## Net Present Value (NPV)

### Basic NPV

**Definition:**
```
NPV = -Initial_investment + Σ (CF_t / (1 + r)^t)
where:
  CF_t = cash flow at time t
  r = discount rate
```

**Decision rule:**
```
NPV > 0: Accept investment
NPV < 0: Reject investment
NPV = 0: Indifferent
```

### Cash Flow Components

**Operating cash flow:**
```
OCF = Revenue - Operating_expenses - Taxes
```

**Revenue:**
```
Revenue = Rent × Occupancy_rate × Units
```

**Operating expenses:**
```
OpEx = Maintenance + Management + Insurance + Property_tax + Utilities
```

**Net operating income (NOI):**
```
NOI = Revenue - Operating_expenses
```

### Terminal Value

**Sale proceeds:**
```
Sale_price = NOI_final / Cap_rate
Terminal_value = Sale_price - Transaction_costs
```

**NPV with terminal value:**
```
NPV = -Initial + Σ (OCF_t / (1+r)^t) + Terminal_value / (1+r)^n
```

## Internal Rate of Return (IRR)

### Definition

**IRR:**
```
NPV(IRR) = 0
-Initial + Σ (CF_t / (1 + IRR)^t) = 0
```

**Interpretation:**
- Annualized return on investment
- Hurdle rate comparison

**Decision rule:**
```
IRR > Required_return: Accept
IRR < Required_return: Reject
```

### Calculation Methods

**Trial and error:**
```
Guess r, calculate NPV
Adjust r until NPV ≈ 0
```

**Newton-Raphson:**
```
r_{n+1} = r_n - NPV(r_n) / NPV'(r_n)
```

**Excel/Software:**
```
IRR = IRR(cash_flows)
```

### Multiple IRRs

**Problem:**
```
Multiple sign changes → Multiple IRRs possible
```

**Solution:**
- Modified IRR (MIRR)
- NPV analysis
- Payback period

## Capitalization Rates

### Cap Rate Definition

**Cap rate:**
```
Cap_rate = NOI / Property_value
```

**Inverse:**
```
Property_value = NOI / Cap_rate
```

**Interpretation:**
- Return on purchase price (unleveraged)
- Market yield expectation

### Cap Rate Components

**Risk-free rate:**
```
r_f = Treasury_rate
```

**Risk premium:**
```
Risk_premium = f(Property_type, Location, Quality, ...)
```

**Cap rate:**
```
Cap_rate = r_f + Risk_premium - Growth_expectation
```

### Cap Rate Trends

**Market cap rates:**
```
Cap_rate_market = Average(NOI / Sale_price) for comparable sales
```

**Valuation:**
```
Value = NOI / Cap_rate_market
```

## Cash Flow Modeling Under Uncertainty

### Probabilistic Cash Flows

**Expected cash flow:**
```
E[CF_t] = Σ P(scenario_i) × CF_t(scenario_i)
```

**Variance:**
```
Var(CF_t) = E[CF_t²] - (E[CF_t])²
```

### Monte Carlo Simulation

**Process:**
1. Define probability distributions for inputs
2. Sample random values
3. Calculate cash flows
4. Calculate NPV/IRR
5. Repeat many times
6. Analyze distribution of outcomes

**Outputs:**
```
E[NPV], Var(NPV), P(NPV > 0), Percentiles
```

### Sensitivity Analysis

**Tornado diagram:**
```
Vary each input ±X%
Measure impact on NPV
Rank by sensitivity
```

**Key variables:**
- Rent growth
- Occupancy
- Cap rate
- Operating expenses

## Key Math: Discounted Cash Flow

### DCF Framework

**General form:**
```
Value = Σ (CF_t / (1 + r)^t)
```

**Growing perpetuity:**
```
Value = CF₁ / (r - g)
where g = growth rate
```

**Two-stage:**
```
Value = Σ (CF_t / (1+r)^t) + [CF_{n+1} / (r-g)] / (1+r)^n
```

### Root Finding

**IRR problem:**
```
f(r) = -Initial + Σ (CF_t / (1+r)^t) = 0
```

**Newton-Raphson:**
```
r_{n+1} = r_n - f(r_n) / f'(r_n)
```

**Convergence:**
```
|r_{n+1} - r_n| < Tolerance
```

## Exercises

1. **NPV Calculation:** Evaluate investment using NPV
2. **IRR Analysis:** Calculate and interpret IRR
3. **Cap Rate:** Value property using cap rates
4. **Uncertainty:** Model cash flows with Monte Carlo

## Case Studies

- Apartment building investment
- Single-family rental analysis
- Development project evaluation
- Value-add opportunity analysis
- Portfolio acquisition
