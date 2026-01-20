---
title: "Revenue Mechanics & Unit Economics"
module: "Module 2"
week: 2
order: 2
description: "The algebra of recurring revenue"
---

# Module 2: Revenue Mechanics & Unit Economics

## Introduction

Understanding SaaS unit economics is fundamental to sustainable growth. This module covers MRR, ARR, ARPA, cohort-based accounting, and the mathematics of profitability.

## Learning Objectives

- Calculate MRR, ARR, and ARPA
- Apply cohort-based accounting
- Model unit-level profitability
- Understand revenue aggregation models
- Analyze CAC–LTV inequality
- Calculate payback period
- Diagnose unsustainable growth mathematically

## MRR, ARR, ARPA

### Monthly Recurring Revenue (MRR)

**Definition:**
```
MRR = Σ(Monthly_price_i × Customers_i)
```

**Components:**
```
MRR = New_MRR + Expansion_MRR - Churned_MRR - Contraction_MRR
```

**Growth:**
```
MRR_growth = (MRR_{t+1} - MRR_t) / MRR_t
```

### Annual Recurring Revenue (ARR)

**Definition:**
```
ARR = MRR × 12
```

**Annual contracts:**
```
ARR = Σ(Annual_price_i × Customers_i)
```

**Conversion:**
```
MRR_to_ARR = Annual_price / Monthly_price = 12 (if same rate)
```

### Average Revenue Per Account (ARPA)

**Definition:**
```
ARPA = MRR / Customers
```

**Weighted average:**
```
ARPA = Σ(Price_i × Customers_i) / Σ Customers_i
```

**Growth:**
```
ARPA_growth = (ARPA_{t+1} - ARPA_t) / ARPA_t
```

## Cohort-Based Accounting

### Cohort Definition

**Cohort:**
```
Cohort_i = Customers acquired in period i
```

**Cohort MRR:**
```
MRR_cohort_i(t) = Cohort_i(t) × ARPA_cohort_i(t)
```

### Cohort Analysis

**Retention:**
```
Retention_cohort_i(t) = Cohort_i(t) / Cohort_i(0)
```

**Revenue retention:**
```
Revenue_retention_cohort_i(t) = MRR_cohort_i(t) / MRR_cohort_i(0)
```

**Net Revenue Retention (NRR):**
```
NRR = (Starting_MRR + Expansion - Churn) / Starting_MRR
```

### Cohort Aggregation

**Total MRR:**
```
MRR_total(t) = Σ MRR_cohort_i(t) for all cohorts
```

**Cohort contribution:**
```
Contribution_cohort_i = MRR_cohort_i / MRR_total
```

## Unit-Level Profitability

### Unit Economics

**Lifetime Value (LTV):**
```
LTV = ARPA × Gross_margin / Churn_rate
```

**Alternative:**
```
LTV = ARPA × Gross_margin × Lifetime
Lifetime = 1 / Churn_rate
```

**Customer Acquisition Cost (CAC):**
```
CAC = Total_acquisition_cost / New_customers
```

### LTV:CAC Ratio

**Definition:**
```
LTV_CAC_ratio = LTV / CAC
```

**Interpretation:**
- Ratio > 3: Healthy
- Ratio 1-3: Marginal
- Ratio < 1: Unsustainable

**Mathematical constraint:**
```
LTV > CAC (necessary for profitability)
```

### Payback Period

**Definition:**
```
Payback = CAC / (ARPA × Gross_margin)
```

**Months:**
```
Payback_months = CAC / (MRR × Gross_margin)
```

**Target:**
```
Payback < 12 months (typical)
```

## Revenue Aggregation Models

### MRR Components

**Decomposition:**
```
MRR = New_MRR + Expansion_MRR - Churned_MRR - Contraction_MRR
```

**Mathematical:**
```
MRR(t) = MRR(0) + ∫[New(τ) + Expansion(τ) - Churned(τ) - Contraction(τ)]dτ
```

### Growth Rate

**MRR growth:**
```
g_MRR = (New_MRR + Expansion_MRR - Churned_MRR - Contraction_MRR) / MRR
```

**Components:**
```
g_MRR = g_new + g_expansion - g_churn - g_contraction
```

### Revenue Mix

**By segment:**
```
MRR = Σ MRR_segment_i
```

**By product:**
```
MRR = Σ MRR_product_i
```

**By geography:**
```
MRR = Σ MRR_region_i
```

## CAC–LTV Inequality

### Sustainability Condition

**Mathematical:**
```
LTV > CAC
ARPA × Gross_margin / Churn_rate > CAC
```

**Rearranged:**
```
ARPA × Gross_margin > CAC × Churn_rate
```

**Interpretation:**
- Revenue per customer must exceed cost per customer
- Adjusted for churn and margin

### Growth Constraint

**With growth:**
```
LTV > CAC × (1 + Growth_rate)
```

**Higher growth requires:**
- Higher LTV
- Lower CAC
- Or both

### Unit Economics Funnel

**Stages:**
1. Lead → MQL (Marketing Qualified Lead)
2. MQL → SQL (Sales Qualified Lead)
3. SQL → Customer
4. Customer → LTV

**Mathematical:**
```
CAC = Cost_per_lead / (Conversion_MQL × Conversion_SQL × Conversion_customer)
```

## Payback Period Mathematics

### Basic Payback

**Definition:**
```
Payback = Time to recover CAC
```

**Calculation:**
```
Payback = CAC / (ARPA × Gross_margin)
```

**Monthly:**
```
Payback_months = CAC / (MRR × Gross_margin)
```

### Payback with Growth

**If ARPA grows:**
```
Payback = Solve: CAC = Σ(ARPA(t) × Gross_margin) from t=0 to Payback
```

**If churn occurs:**
```
Payback = Solve: CAC = Σ(ARPA(t) × Gross_margin × Retention(t)) from t=0 to Payback
```

### Payback Optimization

**Minimize payback:**
```
Minimize: CAC / (ARPA × Gross_margin)
```

**Strategies:**
- Reduce CAC
- Increase ARPA
- Improve gross margin

## Diagnosing Unsustainable Growth

### Warning Signs

**LTV:CAC < 1:**
```
Losing money per customer
```

**Payback > 24 months:**
```
Too long to recover investment
```

**Negative unit economics:**
```
CAC > LTV
```

### Mathematical Diagnosis

**Unit economics:**
```
If LTV < CAC: Unsustainable
```

**Growth efficiency:**
```
Magic_number = Net_new_MRR / Sales_marketing_spend
If < 0.75: Inefficient growth
```

**CAC payback:**
```
If Payback > 12 months: Risky
```

### Sustainability Metrics

**Rule of 40:**
```
Growth_rate + Profit_margin ≥ 40%
```

**CAC ratio:**
```
CAC_ratio = CAC / ARPA
If > 1: Unsustainable
```

## Exercises

1. **Revenue Calculation:** Calculate MRR, ARR, ARPA
2. **Cohort Analysis:** Analyze cohort retention and revenue
3. **Unit Economics:** Calculate LTV, CAC, and ratios
4. **Sustainability:** Diagnose growth sustainability

## Case Studies

- SaaS unit economics analysis
- Cohort-based revenue modeling
- Growth sustainability assessment
- Payback period optimization
- Unit economics improvement
