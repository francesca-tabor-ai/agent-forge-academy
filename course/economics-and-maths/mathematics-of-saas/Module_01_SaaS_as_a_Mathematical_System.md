---
title: "SaaS as a Mathematical System"
module: "Module 1"
week: 1
order: 1
description: "Translating business intuition into formal models"
---

# Module 1: SaaS as a Mathematical System

## Introduction

SaaS businesses can be represented as mathematical systems with state variables, flows, and feedback loops. This module establishes the foundation for modeling SaaS businesses quantitatively.

## Learning Objectives

- Represent SaaS value chains as state systems
- Distinguish discrete vs continuous time models
- Model stocks, flows, and feedback loops
- Identify customers as state variables
- Model revenue as a function of time
- Understand growth vs decay dynamics
- Identify leading vs lagging indicators

## SaaS Value Chains as State Systems

### System Components

**State variables (stocks):**
```
Customers(t) = Number of customers at time t
MRR(t) = Monthly Recurring Revenue at time t
CAC(t) = Customer Acquisition Cost at time t
```

**Flow variables (rates):**
```
New_customers(t) = Acquisition rate
Churned_customers(t) = Churn rate
Revenue_growth(t) = Revenue change rate
```

**Mathematical representation:**
```
dCustomers/dt = New_customers - Churned_customers
dMRR/dt = New_MRR - Churned_MRR + Expansion_MRR
```

### Value Chain Mapping

**Stages:**
1. **Acquisition** → Marketing → Leads
2. **Conversion** → Sales → Customers
3. **Onboarding** → Product → Active users
4. **Retention** → Success → Renewals
5. **Expansion** → Upsell → Increased revenue

**Flow equations:**
```
dLeads/dt = Marketing_spend × Conversion_rate - Leads_converted
dCustomers/dt = Leads_converted × Sales_conversion - Churned
dRevenue/dt = New_customers × ARPA + Expansion - Churn_revenue
```

## Discrete vs Continuous Time Models

### Discrete Time

**Difference equations:**
```
Customers_{t+1} = Customers_t + New_t - Churned_t
```

**Monthly model:**
```
MRR_{t+1} = MRR_t + New_MRR_t - Churned_MRR_t + Expansion_t
```

**Advantages:**
- Matches business reporting cycles
- Easy to implement
- Intuitive

### Continuous Time

**Differential equations:**
```
dCustomers/dt = Acquisition_rate - Churn_rate
```

**Solution:**
```
Customers(t) = Customers(0) × exp((Acquisition_rate - Churn_rate) × t)
```

**Advantages:**
- Analytical solutions
- Smooth dynamics
- Theoretical insights

### Conversion

**Discrete → Continuous:**
```
Rate = Change_per_period / Period_length
```

**Continuous → Discrete:**
```
Change = Rate × Period_length
```

## Stocks, Flows, and Feedback Loops

### Stocks (State Variables)

**Definition:** Accumulated quantities

**Examples:**
- Customer base
- MRR
- Product usage
- Brand equity

**Mathematical:**
```
Stock(t) = Stock(0) + ∫[Flow_in(τ) - Flow_out(τ)]dτ
```

### Flows (Rate Variables)

**Definition:** Rates of change

**Inflows:**
- New customers
- Revenue expansion
- Product adoption

**Outflows:**
- Churned customers
- Revenue contraction
- Feature abandonment

**Flow balance:**
```
dStock/dt = Flow_in - Flow_out
```

### Feedback Loops

**Positive feedback (reinforcing):**
```
More_customers → More_revenue → More_marketing → More_customers
```

**Mathematical:**
```
dCustomers/dt = k × Customers × (1 - Customers/Capacity)
→ Logistic growth
```

**Negative feedback (balancing):**
```
High_churn → Lower_growth → More_retention_effort → Lower_churn
```

**Mathematical:**
```
dChurn/dt = -k × (Churn - Target_churn)
→ Convergence to target
```

## Customers as State Variables

### Customer Dynamics

**Basic model:**
```
Customers(t+1) = Customers(t) + New(t) - Churned(t)
```

**Continuous:**
```
dC/dt = A - λ×C
where:
  A = acquisition rate
  λ = churn rate
```

**Solution:**
```
C(t) = (A/λ) × (1 - exp(-λ×t)) + C(0)×exp(-λ×t)
```

**Steady state:**
```
C* = A/λ
```

### Customer Cohorts

**Cohort definition:**
```
Cohort_i = Customers acquired in period i
```

**Cohort survival:**
```
Cohort_i(t) = Cohort_i(0) × Retention_rate(t)
```

**Total customers:**
```
C(t) = Σ Cohort_i(t) for all cohorts i
```

## Revenue as a Function of Time

### MRR Model

**Basic:**
```
MRR(t) = Customers(t) × ARPA(t)
```

**With expansion:**
```
MRR(t+1) = MRR(t) + New_MRR(t) - Churned_MRR(t) + Expansion(t)
```

**Growth rate:**
```
g_MRR = (MRR_{t+1} - MRR_t) / MRR_t
```

### ARR Model

**Annual:**
```
ARR(t) = MRR(t) × 12
```

**Growth:**
```
ARR_growth = (ARR_{t+1} - ARR_t) / ARR_t
```

### Revenue Decomposition

**Components:**
```
MRR = New_MRR + Expansion_MRR - Churned_MRR - Contraction_MRR
```

**Mathematical:**
```
MRR(t) = ∫[New(τ) - Churned(τ) + Expansion(τ) - Contraction(τ)]dτ
```

## Growth vs Decay Dynamics

### Exponential Growth

**Model:**
```
dX/dt = r × X
X(t) = X(0) × exp(r×t)
```

**SaaS application:**
```
Customers(t) = Customers(0) × exp(growth_rate × t)
```

**Doubling time:**
```
T_double = ln(2) / growth_rate
```

### Exponential Decay

**Model:**
```
dX/dt = -λ × X
X(t) = X(0) × exp(-λ×t)
```

**SaaS application:**
```
Cohort(t) = Cohort(0) × exp(-churn_rate × t)
```

**Half-life:**
```
T_half = ln(2) / churn_rate
```

### Logistic Growth

**Model:**
```
dX/dt = r × X × (1 - X/K)
X(t) = K / (1 + A×exp(-r×t))
where A = (K - X(0)) / X(0)
```

**SaaS application:**
```
Market_saturation
Growth slows as market fills
```

## Leading vs Lagging Indicators

### Leading Indicators

**Definition:** Predict future outcomes

**Examples:**
- Pipeline value
- Trial signups
- Product usage
- NPS scores

**Mathematical:**
```
Leading_indicator(t) → Outcome(t+τ)
where τ = lead time
```

### Lagging Indicators

**Definition:** Reflect past performance

**Examples:**
- MRR
- Churn rate
- Customer count
- Revenue

**Mathematical:**
```
Lagging_indicator(t) = f(Past_events)
```

### Relationship

**Causal chain:**
```
Leading → Intermediate → Lagging
```

**Example:**
```
Trial_signups → Active_users → Paying_customers → MRR
```

## Exercises

1. **System Mapping:** Map SaaS business as state system
2. **Revenue Model:** Build MRR growth model
3. **Feedback Analysis:** Identify feedback loops
4. **Indicator Analysis:** Classify leading vs lagging indicators

## Case Studies

- SaaS growth modeling
- Customer acquisition dynamics
- Revenue forecasting
- System dynamics in SaaS
- Indicator dashboard design
