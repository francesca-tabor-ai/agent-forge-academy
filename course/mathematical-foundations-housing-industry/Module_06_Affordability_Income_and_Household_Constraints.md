---
title: "Affordability, Income, and Household Constraints"
module: "Module 6"
week: 6
order: 6
description: "Quantify household purchasing power and stress"
---

# Module 6: Affordability, Income, and Household Constraints

## Introduction

Housing affordability depends on the relationship between prices, incomes, and credit availability. This module quantifies affordability metrics, debt-service ratios, and the distributional impacts of housing costs.

## Learning Objectives

- Calculate price-to-income ratios
- Model debt-service and loan-to-value metrics
- Understand credit constraints and leverage
- Analyze distributional effects and inequality
- Apply ratios, inequality analysis, and basic statistics

## Price-to-Income Ratios

### Basic Ratio

**Definition:**
```
PIR = Median_home_price / Median_household_income
```

**Interpretation:**
- PIR < 3: Affordable
- PIR 3-5: Moderate
- PIR > 5: Unaffordable

**Historical benchmarks:**
- Long-term average: ~3-4
- Pre-crisis peak: 5-6
- Post-crisis: 3-4

### Affordability Threshold

**Maximum affordable price:**
```
P_affordable = Income × PIR_max
```

**Typical rule:**
```
P_affordable = Income × 3 (conservative)
P_affordable = Income × 5 (aggressive)
```

### Income Distribution

**Percentile analysis:**
```
PIR_p = Price / Income_p
where Income_p = income at percentile p
```

**Affordability by income:**
```
%_affordable = P(Income ≥ Price / PIR_threshold)
```

## Debt-Service and Loan-to-Value Metrics

### Debt-Service Ratio (DSR)

**Definition:**
```
DSR = Annual_debt_payment / Annual_income
```

**Monthly:**
```
DSR_monthly = Monthly_payment / Monthly_income
```

**Components:**
```
Monthly_payment = Principal + Interest + Taxes + Insurance (PITI)
```

**Typical limits:**
- Conservative: DSR ≤ 28%
- Moderate: DSR ≤ 36%
- Aggressive: DSR > 36%

### Loan-to-Value (LTV)

**Definition:**
```
LTV = Loan_amount / Property_value
```

**Down payment:**
```
Down_payment = Property_value × (1 - LTV)
```

**Typical LTV:**
- Conventional: 80% (20% down)
- FHA: 96.5% (3.5% down)
- VA: 100% (0% down)

### Combined Metrics

**Total debt ratio:**
```
Total_debt_ratio = (Housing_debt + Other_debt) / Income
```

**Qualification:**
```
Total_debt_ratio ≤ 43% (typical limit)
```

## Credit Constraints and Leverage

### Credit Constraints

**Borrowing limit:**
```
Max_loan = f(Income, Credit_score, LTV_max, DSR_max)
```

**Mathematical model:**
```
Max_loan = min(
  Income × DSR_max / (Interest_rate / 12),
  Property_value × LTV_max,
  Credit_score_limit
)
```

### Leverage

**Leverage ratio:**
```
Leverage = Total_assets / Equity
```

**For housing:**
```
Leverage = Property_value / Down_payment
Leverage = 1 / (1 - LTV)
```

**Example:**
```
LTV = 80% → Leverage = 5×
LTV = 90% → Leverage = 10×
```

### Risk and Leverage

**Return on equity:**
```
ROE = (Price_appreciation - Interest_cost) / Equity
```

**With leverage:**
```
ROE_leveraged = ROE_unleveraged × Leverage
```

**Risk amplification:**
```
Risk_leveraged = Risk_unleveraged × Leverage
```

## Distributional Effects and Inequality

### Income Distribution

**Gini coefficient:**
```
Gini = (2 / n² × μ) × Σ Σ |y_i - y_j|
where:
  n = number of households
  μ = mean income
  y_i = income of household i
```

**Interpretation:**
- Gini = 0: Perfect equality
- Gini = 1: Perfect inequality
- Typical: 0.3-0.5

### Housing Cost Burden

**Definition:**
```
Cost_burden = Housing_cost / Income
```

**Categories:**
- < 30%: Affordable
- 30-50%: Cost-burdened
- > 50%: Severely cost-burdened

**Distribution:**
```
%_burdened = P(Housing_cost / Income > Threshold)
```

### Inequality Metrics

**Percentile ratios:**
```
P90/P10 = Income_90th / Income_10th
P95/P5 = Income_95th / Income_5th
```

**Housing affordability gap:**
```
Gap = Price - Affordable_price(Income_median)
```

## Key Math: Ratios and Inequality Analysis

### Ratio Analysis

**Proportions:**
```
Ratio = A / B
Percentage = (A / B) × 100
```

**Compound ratios:**
```
DSR = (Payment / Income) = (Payment / Price) × (Price / Income)
```

### Inequality Analysis

**Lorenz curve:**
```
Cumulative_income_share = f(Cumulative_population_share)
```

**Gini calculation:**
```
Gini = 1 - 2 × ∫₀¹ L(p) dp
where L(p) = Lorenz curve
```

### Basic Statistics

**Mean:**
```
μ = (1/n) × Σ x_i
```

**Median:**
```
Median = x_{(n+1)/2} if n odd
Median = (x_{n/2} + x_{n/2+1}) / 2 if n even
```

**Percentiles:**
```
P_p = x such that P(X ≤ x) = p
```

## Exercises

1. **Affordability Calculation:** Calculate PIR and affordability
2. **Debt Analysis:** Model debt-service ratios
3. **Credit Constraints:** Calculate maximum borrowing capacity
4. **Inequality:** Analyze distributional impacts

## Case Studies

- Affordability crisis analysis
- Credit constraint impacts
- Leverage and risk
- Income inequality and housing
- Policy interventions for affordability
