---
title: "Capstone: Build a Full SaaS Mathematical Model"
module: "Capstone"
week: 12
order: 12
description: "Integration and synthesis"
---

# Capstone: Build a Full SaaS Mathematical Model

## Introduction

This capstone module integrates all course concepts into a comprehensive mathematical model of a SaaS business. Students build a full-stack model covering growth, revenue, churn, infrastructure, and profitability.

## Learning Objectives

- Synthesize mathematical concepts across all modules
- Build integrated SaaS business model
- Connect growth, revenue, churn, and infrastructure
- Make strategic recommendations
- Reason about SaaS businesses at a systems level

## Capstone Project Framework

### Project Structure

**1. Business Definition**
- Select SaaS company (real or hypothetical)
- Define business model
- Identify key metrics

**2. Model Development**
- Growth model (Module 5)
- Revenue model (Module 2)
- Churn model (Module 3)
- Infrastructure model (Module 8)
- Profitability model (Module 2, 9)

**3. Integration**
- Connect model components
- Calibrate to data
- Validate assumptions

**4. Analysis**
- Base case simulation
- Scenario analysis
- Sensitivity analysis

**5. Recommendations**
- Strategic insights
- Optimization opportunities
- Risk mitigation

## Full-Stack SaaS Model Components

### Growth Component

**Acquisition:**
```
New_customers(t) = f(Marketing_spend(t), Conversion_funnel(t), Viral_coefficient(t))
```

**Funnel:**
```
Visitors → Leads → MQLs → SQLs → Trials → Customers
Each stage with conversion rate
```

**Viral:**
```
K_factor = Invitations × Conversion_rate
Viral_customers = Customers × K_factor
```

**Total growth:**
```
dCustomers/dt = Paid_acquisition + Organic + Viral
```

### Revenue Component

**MRR:**
```
MRR(t) = Customers(t) × ARPA(t)
```

**Components:**
```
MRR(t+1) = MRR(t) + New_MRR(t) + Expansion_MRR(t) - Churned_MRR(t) - Contraction_MRR(t)
```

**ARPA:**
```
ARPA(t) = f(Pricing_tier(t), Usage(t), Upsells(t))
```

**ARR:**
```
ARR(t) = MRR(t) × 12
```

### Churn Component

**Churn model:**
```
Churn_rate(t) = f(Cohort_age, Product_usage, Support_tickets, ...)
```

**Survival:**
```
S(t) = exp(-∫ churn_rate(s)ds)
```

**Churned revenue:**
```
Churned_MRR(t) = MRR(t) × Churn_rate(t)
```

### Infrastructure Component

**Capacity:**
```
Capacity_needed = f(Customers(t), Usage_per_customer, Peak_load_factor)
```

**Cost:**
```
Infrastructure_cost(t) = f(Capacity(t), Pricing_tier, Utilization)
```

**Reliability:**
```
Availability = f(Architecture, Redundancy, Monitoring)
```

### Profitability Component

**Revenue:**
```
Revenue(t) = MRR(t) × 12
```

**Costs:**
```
Costs(t) = CAC(t) × New_customers(t) + Infrastructure_cost(t) + Operating_costs(t)
```

**Profit:**
```
Profit(t) = Revenue(t) - Costs(t)
```

**Unit economics:**
```
LTV = ARPA × Gross_margin / Churn_rate
CAC = Total_acquisition_cost / New_customers
LTV_CAC_ratio = LTV / CAC
```

## Model Integration

### System Dynamics

**State variables:**
```
x = [Customers, MRR, Infrastructure_capacity, ...]
```

**Rate equations:**
```
dx/dt = f(x, Controls, External_factors)
```

**Feedback loops:**
```
More_customers → More_revenue → More_marketing → More_customers
High_churn → Lower_growth → More_retention_effort → Lower_churn
```

### Calibration

**Data requirements:**
- Historical customers
- Historical MRR
- Churn rates by cohort
- Acquisition costs
- Infrastructure costs

**Parameter estimation:**
```
Estimate model parameters from data
Validate against historical performance
```

### Validation

**Backtesting:**
```
Run model on historical data
Compare predictions to actuals
```

**Sensitivity:**
```
Vary inputs
Analyze output sensitivity
```

## Strategic Recommendations

### Growth Opportunities

**Funnel optimization:**
```
Identify bottlenecks
Calculate impact of improvements
```

**Viral growth:**
```
Increase K-factor
Improve product virality
```

**Pricing:**
```
Optimize pricing tiers
Increase ARPA
```

### Retention Improvements

**Churn reduction:**
```
Target high-risk customers
Improve onboarding
Enhance product value
```

**Expansion:**
```
Upsell opportunities
Cross-sell potential
```

### Efficiency Gains

**Unit economics:**
```
Improve LTV:CAC ratio
Reduce payback period
```

**Infrastructure:**
```
Optimize costs
Right-size capacity
```

## Deliverables

### Mathematical Model

**Components:**
- Growth model
- Revenue model
- Churn model
- Infrastructure model
- Profitability model

**Documentation:**
- Model equations
- Assumptions
- Parameters
- Calibration

### Analysis Report

**Sections:**
1. Executive summary
2. Model description
3. Base case results
4. Scenario analysis
5. Strategic recommendations

### Presentation

**Format:**
- Technical presentation (30 min)
- Business presentation (15 min)
- Q&A

**Audience:**
- Technical: Model details
- Business: Key insights, recommendations

## Evaluation Criteria

**Technical rigor (40%):**
- Model correctness
- Mathematical soundness
- Data quality
- Validation

**Integration (30%):**
- Synthesis of concepts
- Holistic view
- Cross-module integration

**Analysis (20%):**
- Scenario quality
- Strategic insights
- Recommendations

**Communication (10%):**
- Clarity
- Visualization
- Actionability

## Timeline

**Week 1-2:** Business definition and data collection
**Week 3-5:** Model development
**Week 6-7:** Integration and calibration
**Week 8-9:** Analysis and recommendations
**Week 10:** Documentation and presentation

## Exercises

1. **System Mapping:** Map SaaS business as mathematical system
2. **Model Integration:** Connect all model components
3. **Scenario Design:** Design stress test scenarios
4. **Recommendations:** Develop strategic recommendations

## Capstone Examples

- B2B SaaS growth model
- Freemium conversion optimization
- Enterprise SaaS unit economics
- Platform business model
- SaaS infrastructure optimization
