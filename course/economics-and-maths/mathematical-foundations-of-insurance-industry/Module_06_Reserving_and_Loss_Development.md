---
title: "Reserving and Loss Development"
module: "Module 6"
week: 6
order: 6
description: "Estimating liabilities that haven't fully emerged"
---

# Module 6: Reserving and Loss Development

## Introduction

Loss reserving estimates future obligations from incomplete information. This module covers reported vs. ultimate losses, development triangles, IBNR, and reserve uncertainty.

## Learning Objectives

- Distinguish reported vs. ultimate losses
- Build development triangles
- Calculate Incurred But Not Reported (IBNR)
- Quantify uncertainty in reserves
- Apply Chain Ladder method
- Use Bornhuetter–Ferguson method
- Apply stochastic reserving
- Estimate future obligations from incomplete information

## Reported vs. Ultimate Losses

### Reported Losses

**Definition:**
```
Losses reported to date
Known claims
```

**Characteristics:**
```
Incomplete
Will develop
Increase over time
```

### Ultimate Losses

**Definition:**
```
Total losses when fully developed
Final claim amounts
```

**Estimation:**
```
Ultimate = Reported + IBNR + Development
```

**Uncertainty:**
```
Unknown until fully developed
Requires estimation
```

## Development Triangles

### Triangle Structure

**Accident year:**
```
Year loss occurred
```

**Development period:**
```
Time since accident
Months, quarters, years
```

**Triangle:**
```
Rows: Accident years
Columns: Development periods
Values: Cumulative losses
```

### Loss Development

**Pattern:**
```
Losses increase over time
Development_factors
Converge to ultimate
```

**Development factor:**
```
DF = Loss_at_period_t / Loss_at_period_{t-1}
```

**Ultimate:**
```
Ultimate = Latest_reported × Product(DF_future)
```

## Incurred But Not Reported (IBNR)

### IBNR Definition

**Definition:**
```
Losses that occurred but not yet reported
```

**Components:**
```
IBNR = Ultimate - Reported
```

**Estimation:**
```
IBNR = Ultimate_estimate - Reported_to_date
```

### IBNR Methods

**Chain Ladder:**
```
Project to ultimate
IBNR = Ultimate - Reported
```

**Bornhuetter–Ferguson:**
```
IBNR = Expected_ultimate × (1 - Reported_ratio)
```

**Stochastic:**
```
IBNR ~ Distribution
Estimate distribution
```

## Uncertainty in Reserves

### Reserve Uncertainty

**Sources:**
```
Process_variance: Random_variation
Parameter_uncertainty: Estimation_error
Model_uncertainty: Model_specification
```

**Quantification:**
```
Confidence_intervals
Prediction_intervals
VaR, TVaR
```

### Stochastic Reserving

**Distribution:**
```
Reserve ~ Distribution(Parameters)
```

**Estimation:**
```
Bootstrap
Monte_Carlo
Bayesian
```

**Output:**
```
Reserve_distribution
Percentiles
Confidence_intervals
```

## Core Mathematics

### Chain Ladder Method

**Development factors:**
```
DF_t = Average(Loss_{t} / Loss_{t-1}) across accident years
```

**Ultimate:**
```
Ultimate_i = Latest_i × Product(DF_future)
```

**IBNR:**
```
IBNR_i = Ultimate_i - Latest_i
Total_IBNR = Σ IBNR_i
```

**Limitations:**
```
Assumes stable_patterns
Sensitive to outliers
No external_information
```

### Bornhuetter–Ferguson Method

**Expected ultimate:**
```
E[Ultimate] = Exposure × Expected_rate
```

**Reported ratio:**
```
Reported_ratio = Reported / E[Ultimate]
```

**IBNR:**
```
IBNR = E[Ultimate] × (1 - Reported_ratio)
```

**Advantages:**
```
Uses external_information
More stable
Less sensitive to outliers
```

### Stochastic Reserving

**Model:**
```
Ultimate ~ Distribution
Reserve = Ultimate - Reported
```

**Bootstrap:**
```
Resample development_factors
Project to ultimate
Estimate distribution
```

**Bayesian:**
```
Prior on parameters
Update with data
Posterior distribution
```

## Learning Outcomes

### Estimating Future Obligations

**Methods:**
```
Chain Ladder: Projection_based
Bornhuetter–Ferguson: Expected_based
Stochastic: Distribution_based
```

**Uncertainty:**
```
Quantify uncertainty
Confidence_intervals
Risk_measures
```

**Application:**
```
Financial_reporting
Capital_planning
Regulatory_compliance
```

## Exercises

1. **Triangles:** Build and analyze development triangles
2. **Chain Ladder:** Apply Chain Ladder method
3. **BF:** Apply Bornhuetter–Ferguson method
4. **Stochastic:** Perform stochastic reserving

## Case Studies

- Loss reserving in practice
- IBNR estimation
- Reserve uncertainty
- Development pattern analysis
- Reserve validation
