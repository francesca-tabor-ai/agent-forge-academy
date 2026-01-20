---
title: "Mortgage Mathematics and Housing Finance"
module: "Module 7"
week: 7
order: 7
description: "Understand how capital flows into housing"
---

# Module 7: Mortgage Mathematics and Housing Finance

## Introduction

Mortgages are the primary mechanism for financing housing. This module covers mortgage amortization, interest rate sensitivity, prepayment risk, and securitization using time value of money and probability theory.

## Learning Objectives

- Calculate mortgage amortization schedules
- Model interest rate sensitivity
- Analyze prepayment and default risk
- Understand securitization fundamentals
- Apply time value of money, annuities, and probability

## Mortgage Amortization

### Basic Amortization

**Monthly payment:**
```
PMT = P × [r(1+r)^n] / [(1+r)^n - 1]
where:
  P = principal
  r = monthly interest rate = Annual_rate / 12
  n = number of payments
```

**Alternative formula:**
```
PMT = P × r / [1 - (1+r)^(-n)]
```

### Amortization Schedule

**Remaining balance:**
```
Balance_t = P × [(1+r)^n - (1+r)^t] / [(1+r)^n - 1]
```

**Principal payment:**
```
Principal_t = PMT × (1+r)^(t-n)
```

**Interest payment:**
```
Interest_t = PMT - Principal_t
```

**Verification:**
```
Principal_t + Interest_t = PMT
Σ Principal_t = P
```

### Total Interest

**Total interest paid:**
```
Total_interest = n × PMT - P
```

**Interest as percentage:**
```
Interest_% = (Total_interest / P) × 100
```

## Interest Rate Sensitivity

### Duration

**Macaulay duration:**
```
D = Σ (t × PV_t) / Σ PV_t
where PV_t = present value of payment at time t
```

**Modified duration:**
```
D_mod = D / (1 + r)
```

**Price sensitivity:**
```
ΔPrice / Price ≈ -D_mod × Δr
```

### Convexity

**Definition:**
```
C = (1/P) × d²P/dr²
```

**Price change:**
```
ΔPrice / Price ≈ -D_mod × Δr + (1/2) × C × (Δr)²
```

### Refinancing Decision

**Break-even analysis:**
```
Savings = (Old_rate - New_rate) × Balance
Cost = Refinancing_fees
Break_even = Cost / Monthly_savings
```

**NPV of refinancing:**
```
NPV = -Cost + Σ (Savings_t / (1+r)^t)
```

## Prepayment and Default Risk

### Prepayment Risk

**Prepayment rate:**
```
CPR = Annual_prepayment_rate
SMM = 1 - (1 - CPR)^(1/12)  (Single Monthly Mortality)
```

**Expected life:**
```
Expected_life = 1 / CPR
```

**Prepayment modeling:**
```
Prepayment = f(Interest_rate, Time_on_books, Seasoning, ...)
```

**PSA model:**
```
CPR = min(0.06 × Age/30, 0.06) × PSA_multiplier
```

### Default Risk

**Probability of default:**
```
PD = P(Default | Borrower_characteristics, Loan_characteristics)
```

**Loss given default:**
```
LGD = 1 - Recovery_rate
```

**Expected loss:**
```
EL = PD × LGD × Exposure
```

**Credit risk model:**
```
PD = f(Credit_score, LTV, DTI, ...)
```

### Option-Adjusted Spread

**OAS calculation:**
```
Price = Σ (CF_t / (1 + r_t + OAS)^t)
Solve for OAS
```

**Interpretation:**
- OAS > 0: Compensates for prepayment/default risk
- Higher OAS = Higher risk

## Securitization Fundamentals

### Mortgage-Backed Securities (MBS)

**Cash flow:**
```
MBS_cashflow = Principal + Interest - Servicing - Guarantee_fee
```

**Pass-through:**
```
Investor_receives = Pro_rata_share × Total_cashflow
```

### Tranches

**Seniority:**
```
Senior_tranche: First_loss protection
Mezzanine_tranche: Second_loss
Equity_tranche: First_loss absorption
```

**Waterfall:**
```
Cashflow → Senior → Mezzanine → Equity
```

### Pricing

**Weighted average coupon:**
```
WAC = Σ (Balance_i × Rate_i) / Σ Balance_i
```

**Weighted average maturity:**
```
WAM = Σ (Balance_i × Maturity_i) / Σ Balance_i
```

**Yield:**
```
Yield = f(WAC, WAM, Prepayment_assumptions, Credit_risk)
```

## Key Math: Time Value of Money

### Present Value

**Single payment:**
```
PV = FV / (1 + r)^n
```

**Annuity:**
```
PV_annuity = PMT × [1 - (1+r)^(-n)] / r
```

**Perpetuity:**
```
PV_perpetuity = PMT / r
```

### Future Value

**Single payment:**
```
FV = PV × (1 + r)^n
```

**Annuity:**
```
FV_annuity = PMT × [(1+r)^n - 1] / r
```

### Annuities

**Ordinary annuity:**
```
Payments at end of period
```

**Annuity due:**
```
Payments at beginning of period
PV_due = PV_ordinary × (1 + r)
```

## Exercises

1. **Amortization:** Calculate mortgage payment and schedule
2. **Interest Sensitivity:** Analyze rate impact on payments
3. **Prepayment:** Model prepayment risk
4. **Securitization:** Price MBS tranches

## Case Studies

- Mortgage product design
- Refinancing optimization
- Prepayment risk management
- MBS structuring
- Credit risk modeling
