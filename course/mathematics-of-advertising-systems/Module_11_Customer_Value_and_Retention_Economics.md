---
title: "Customer Value & Retention Economics"
module: "Module 11"
week: 11
order: 11
description: "Link advertising to long-term business value"
---

# Module 11: Customer Value & Retention Economics

## Introduction

Advertising should be evaluated based on long-term customer value, not just immediate conversions. This module covers Customer Lifetime Value (CLV), survival analysis, and discounted cash flows.

## Learning Objectives

- Model customer lifetime value
- Apply churn and retention analysis
- Use discounted cash flows
- Calculate CLV
- Apply survival analysis
- Use hazard functions
- Set acquisition bids based on lifetime value
- Align marketing with finance

## Lifetime Value Modeling

### Customer Lifetime Value (CLV)

**Basic definition:**
```
CLV = Σ(Revenue_t - Cost_t) / (1 + r)^t
where r = discount rate
```

**Simplified (constant revenue, churn):**
```
CLV = ARPU × Gross_margin / (Churn_rate + Discount_rate)
```

**With growth:**
```
CLV = ARPU × Gross_margin × (1 + Growth_rate) / (Churn_rate + Discount_rate - Growth_rate)
```

### CLV Components

**Revenue:**
```
Revenue_t = ARPU_t × Retention_t
```

**Cost:**
```
Cost_t = Acquisition_cost + Service_cost_t
```

**Profit:**
```
Profit_t = Revenue_t - Cost_t
```

**CLV:**
```
CLV = Σ Profit_t / (1 + r)^t
```

## Churn and Retention

### Retention Rate

**Definition:**
```
Retention_t = Customers_t / Customers_0
```

**Cohort retention:**
```
Retention_cohort_i(t) = Cohort_i(t) / Cohort_i(0)
```

**Aggregate:**
```
Retention_aggregate(t) = Σ Cohort_i(t) / Σ Cohort_i(0)
```

### Churn Rate

**Definition:**
```
Churn_rate = 1 - Retention_rate
```

**Monthly churn:**
```
Churn_monthly = 1 - Retention_monthly
```

**Annual churn:**
```
Churn_annual = 1 - Retention_annual
```

**Relationship:**
```
Retention_annual = (Retention_monthly)^12
```

## Discounted Cash Flows

### Present Value

**Single payment:**
```
PV = FV / (1 + r)^t
```

**Annuity:**
```
PV_annuity = PMT × [1 - (1+r)^(-n)] / r
```

**Perpetuity:**
```
PV_perpetuity = PMT / r
```

### CLV with DCF

**Discrete:**
```
CLV = Σ(Profit_t / (1 + r)^t) from t=0 to T
```

**Continuous:**
```
CLV = ∫(Profit(t) × exp(-r×t))dt from 0 to ∞
```

**With retention:**
```
CLV = Σ(ARPU × Gross_margin × Retention_t / (1 + r)^t)
```

## Key Models

### CLV Calculation

**Simplified:**
```
CLV = ARPU × Gross_margin / (Churn_rate + Discount_rate)
```

**With variable revenue:**
```
CLV = Σ(ARPU_t × Gross_margin × Retention_t / (1 + r)^t)
```

**With expansion:**
```
CLV = Σ((ARPU_t + Expansion_t) × Gross_margin × Retention_t / (1 + r)^t)
```

### Survival Analysis

**Survival function:**
```
S(t) = P(Customer survives beyond t)
```

**Hazard function:**
```
h(t) = -d(log S(t)) / dt
```

**Relationship:**
```
S(t) = exp(-∫ h(s)ds from 0 to t)
```

**Expected lifetime:**
```
E[T] = ∫ S(t)dt from 0 to ∞
```

### Hazard Functions

**Constant hazard:**
```
h(t) = λ
S(t) = exp(-λ×t)
E[T] = 1/λ
```

**Time-varying:**
```
h(t) = f(t)
S(t) = exp(-∫ h(s)ds)
```

**Weibull:**
```
h(t) = (k/λ) × (t/λ)^(k-1)
S(t) = exp(-(t/λ)^k)
```

## Setting Acquisition Bids Based on Lifetime Value

### Optimal Bid

**Rule:**
```
Bid ≤ CLV × Target_margin
```

**Mathematical:**
```
Max_bid = CLV × (1 - Target_margin)
```

**With uncertainty:**
```
Bid = E[CLV] × (1 - Target_margin) - Risk_premium
```

### CLV-Based Bidding

**Value per impression:**
```
Value = P(Conversion) × CLV
```

**Bid:**
```
Bid = Value × Target_ROAS
Bid = P(Conversion) × CLV × Target_ROAS
```

**Optimization:**
```
Maximize: E[CLV] - E[Cost]
Subject to: ROAS ≥ Target
```

## Aligning Marketing with Finance

### Finance Metrics

**NPV:**
```
NPV = -Acquisition_cost + CLV
```

**IRR:**
```
Solve: 0 = -Acquisition_cost + Σ(Profit_t / (1 + IRR)^t)
```

**Payback period:**
```
Time to recover acquisition_cost
```

### Marketing-Finance Alignment

**Common language:**
```
Use CLV for marketing decisions
Report marketing impact in financial terms
```

**Budget allocation:**
```
Allocate based on CLV contribution
Not just immediate revenue
```

### Long-Term Value

**Short-term:**
```
Focus on immediate conversions
CPA optimization
```

**Long-term:**
```
Focus on CLV
Acquisition quality
Retention
```

**Balance:**
```
Optimize: Short_term_revenue + Long_term_CLV
```

## Exercises

1. **CLV Calculation:** Calculate customer lifetime value
2. **Survival Analysis:** Model customer retention
3. **Bidding:** Set bids based on CLV
4. **Alignment:** Align marketing metrics with finance

## Case Studies

- CLV-based acquisition strategy
- Retention impact on CLV
- Marketing-finance alignment
- Long-term value optimization
- Customer segmentation by CLV
