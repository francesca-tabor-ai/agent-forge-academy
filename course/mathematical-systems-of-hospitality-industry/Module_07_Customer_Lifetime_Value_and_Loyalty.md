---
title: "Customer Lifetime Value & Loyalty"
module: "Module 7"
week: 7
order: 7
description: "Long-term economics of guest relationships"
---

# Module 7: Customer Lifetime Value & Loyalty

## Introduction

Customer lifetime value (CLV) is essential for hospitality profitability. This module covers retention vs. acquisition economics, discounting, behavioral drivers, and personalization value.

## Learning Objectives

- Understand retention vs. acquisition economics
- Apply discounting and time value of money
- Model behavioral drivers of loyalty
- Quantify value of personalization
- Apply discounted cash flow
- Use survival probabilities
- Calculate expected value over time
- Design loyalty programs
- Make CRM investment decisions
- Design personalized offers and upgrades

## Retention vs. Acquisition Economics

### Acquisition Cost

**CAC (Customer Acquisition Cost):**
```
CAC = Total_acquisition_cost / New_customers
```

**Components:**
```
Marketing_cost
Sales_cost
Channel_commissions
```

**Comparison:**
```
CAC vs CLV
If CAC > CLV: Unprofitable
```

### Retention Cost

**Retention investment:**
```
Loyalty_program_cost
Personalization_cost
Service_improvement_cost
```

**Retention benefit:**
```
CLV_increase
Reduced_acquisition_need
```

**ROI:**
```
Retention_ROI = (CLV_increase - Retention_cost) / Retention_cost
```

## Discounting and Time Value of Money

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

### CLV with Discounting

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

## Behavioral Drivers of Loyalty

### Loyalty Factors

**Service quality:**
```
High_quality → Higher_retention
```

**Price:**
```
Competitive_price → Higher_retention
```

**Convenience:**
```
Easy_booking → Higher_retention
```

**Personalization:**
```
Personalized_experience → Higher_retention
```

### Retention Model

**Probability:**
```
P(Return) = f(Service_quality, Price, Convenience, Personalization, ...)
```

**Logistic regression:**
```
P(Return) = 1 / (1 + exp(-(β₀ + β₁×Features)))
```

**Survival:**
```
S(t) = P(Still_customer at time t)
```

## Value of Personalization

### Personalization Impact

**Retention:**
```
Personalization → Higher_retention
ΔRetention = f(Personalization_level)
```

**Spending:**
```
Personalization → Higher_spending
ΔARPU = f(Personalization_level)
```

**CLV:**
```
ΔCLV = f(ΔRetention, ΔARPU)
```

### Personalization ROI

**Cost:**
```
Personalization_cost = Technology + Data + Staff
```

**Benefit:**
```
CLV_increase × Customers
```

**ROI:**
```
ROI = (CLV_increase - Personalization_cost) / Personalization_cost
```

## Core Mathematics

### Discounted Cash Flow

**CLV calculation:**
```
CLV = Σ(Revenue_t - Cost_t) / (1 + r)^t
```

**Simplified:**
```
CLV = ARPU × Gross_margin / (Churn_rate + Discount_rate)
```

**With growth:**
```
CLV = ARPU × Gross_margin × (1 + Growth_rate) / (Churn_rate + Discount_rate - Growth_rate)
```

### Survival Probabilities

**Survival function:**
```
S(t) = P(Customer survives beyond t)
```

**Retention:**
```
Retention_t = S(t)
```

**Hazard:**
```
h(t) = -d(log S(t)) / dt
```

**Expected lifetime:**
```
E[T] = ∫ S(t)dt from 0 to ∞
```

### Expected Value Over Time

**Expected revenue:**
```
E[Revenue] = Σ P(Scenario_i) × Revenue(Scenario_i)
```

**Expected CLV:**
```
E[CLV] = Σ P(Return_t) × Revenue_t / (1 + r)^t
```

**With uncertainty:**
```
E[CLV] = ∫ CLV(Parameters) × P(Parameters)dParameters
```

## Industry Applications

### Loyalty Programs

**Program design:**
```
Points_per_stay
Redemption_value
Tier_benefits
```

**Cost:**
```
Program_cost = Points_cost + Benefits_cost + Administration
```

**Value:**
```
CLV_increase × Program_members
```

**Optimization:**
```
Maximize: CLV_increase - Program_cost
Subject to: Budget_constraints
```

### CRM Investment Decisions

**CRM cost:**
```
Technology_cost
Data_cost
Staff_cost
```

**CRM benefit:**
```
CLV_increase
Retention_improvement
Acquisition_efficiency
```

**Decision:**
```
Invest if: ROI > Threshold
ROI = (Benefits - Costs) / Costs
```

### Personalized Offers and Upgrades

**Targeting:**
```
High_CLV customers
High_retention_risk customers
```

**Offers:**
```
Personalized_pricing
Upgrades
Special_amenities
```

**Optimization:**
```
Maximize: CLV_increase
Subject to: Offer_cost_constraints
```

## Exercises

1. **CLV Calculation:** Calculate customer lifetime value
2. **Retention:** Model retention and survival
3. **Personalization:** Quantify personalization value
4. **Loyalty:** Design loyalty program

## Case Studies

- Loyalty program optimization
- CRM investment analysis
- Personalization ROI
- Customer segmentation by CLV
- Retention strategy development
