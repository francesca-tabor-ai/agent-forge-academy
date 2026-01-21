---
title: "Core Performance Metrics & Unit Economics"
module: "Module 2"
week: 2
order: 2
description: "Understand how value and cost are normalized and compared"
---

# Module 2: Core Performance Metrics & Unit Economics

## Introduction

Comparing advertising performance across different pricing models and campaigns requires normalization. This module covers eCPM, eCPC, CPA, ROAS, and marginal ROI to enable fair comparisons and identify profitable spend.

## Learning Objectives

- Normalize across pricing models
- Calculate unit economics of media buying
- Benchmark performance
- Calculate eCPM, eCPC, CPA
- Understand ROAS
- Calculate marginal ROI
- Compare heterogeneous campaigns
- Identify profitable vs unprofitable spend

## Normalization Across Pricing Models

### Pricing Models

**CPM (Cost Per Mille):**
```
CPM = (Cost / Impressions) × 1,000
Cost = CPM × Impressions / 1,000
```

**CPC (Cost Per Click):**
```
CPC = Cost / Clicks
Cost = CPC × Clicks
```

**CPA (Cost Per Acquisition):**
```
CPA = Cost / Conversions
Cost = CPA × Conversions
```

### Conversion Between Models

**CPM to CPC:**
```
CPC = CPM / (CTR × 1,000)
```

**CPC to CPA:**
```
CPA = CPC / CVR
```

**CPM to CPA:**
```
CPA = CPM / (CTR × CVR × 1,000)
```

## Unit Economics of Media Buying

### Effective Metrics

**eCPM (Effective CPM):**
```
eCPM = (Revenue / Impressions) × 1,000
eCPM = CTR × CVR × Value_per_conversion × 1,000
```

**eCPC (Effective CPC):**
```
eCPC = Revenue / Clicks
eCPC = CVR × Value_per_conversion
```

**Effective CPA:**
```
eCPA = Revenue / Conversions
eCPA = Value_per_conversion
```

### Profitability

**Profit per impression:**
```
Profit = eCPM - CPM
```

**Profit per click:**
```
Profit = eCPC - CPC
```

**Profit per acquisition:**
```
Profit = eCPA - CPA
```

**Decision rule:**
```
If Profit > 0: Profitable
If Profit ≤ 0: Unprofitable
```

## Performance Benchmarking

### Benchmark Metrics

**Industry benchmarks:**
```
CTR_benchmark = Industry_average
CVR_benchmark = Industry_average
CPA_benchmark = Industry_average
```

**Comparison:**
```
Performance_ratio = Actual / Benchmark
```

**Interpretation:**
- Ratio > 1: Above benchmark
- Ratio = 1: At benchmark
- Ratio < 1: Below benchmark

### Normalized Performance

**Performance index:**
```
Index = (CTR / CTR_benchmark) × (CVR / CVR_benchmark) × (Value / Value_benchmark)
```

**Composite score:**
```
Score = w₁×(CTR/CTR_b) + w₂×(CVR/CVR_b) + w₃×(Value/Value_b)
```

## Key Metrics

### eCPM (Effective Cost Per Mille)

**Definition:**
```
eCPM = (Revenue / Impressions) × 1,000
```

**Components:**
```
eCPM = CTR × CVR × Value_per_conversion × 1,000
```

**Optimization:**
```
Maximize: eCPM
Subject to: Budget_constraints
```

### eCPC (Effective Cost Per Click)

**Definition:**
```
eCPC = Revenue / Clicks
```

**Components:**
```
eCPC = CVR × Value_per_conversion
```

**Relationship:**
```
eCPC = eCPM / (CTR × 1,000)
```

### CPA (Cost Per Acquisition)

**Definition:**
```
CPA = Cost / Conversions
```

**Target CPA:**
```
Target_CPA = Value_per_conversion × Target_margin
```

**Optimization:**
```
Minimize: CPA
Subject to: Volume_constraints
```

### ROAS (Return on Ad Spend)

**Definition:**
```
ROAS = Revenue / Cost
```

**Interpretation:**
- ROAS > 1: Profitable
- ROAS = 1: Break-even
- ROAS < 1: Unprofitable

**Target ROAS:**
```
Target_ROAS = 1 / Target_margin
```

**Relationship:**
```
ROAS = Value_per_conversion / CPA
```

## Marginal ROI

### Definition

**Marginal ROI:**
```
Marginal_ROI = ΔRevenue / ΔCost
```

**Incremental:**
```
Marginal_ROI = (Revenue_new - Revenue_old) / (Cost_new - Cost_old)
```

**Interpretation:**
- Marginal ROI > 1: Incremental spend profitable
- Marginal ROI = 1: Break-even
- Marginal ROI < 1: Incremental spend unprofitable

### Optimization

**Optimal spend:**
```
Spend where: Marginal_ROI = 1
```

**Mathematical:**
```
dRevenue/dCost = 1
```

**Diminishing returns:**
```
Marginal_ROI decreases with spend
```

## Comparing Heterogeneous Campaigns

### Normalization

**Common denominator:**
```
Convert all to eCPM or eCPA
```

**Example:**
```
Campaign_A: CPM = $5, CTR = 2%, CVR = 5%
Campaign_B: CPC = $0.50, CTR = 1%, CVR = 10%

Normalize to eCPM:
Campaign_A: eCPM = 2% × 5% × $100 × 1000 = $100
Campaign_B: eCPM = 1% × 10% × $100 × 1000 = $100
```

### Efficiency Score

**Composite metric:**
```
Efficiency = (eCPM - CPM) / CPM
Efficiency = (ROAS - 1) / 1
```

**Ranking:**
```
Rank by Efficiency
Higher efficiency = Better performance
```

## Identifying Profitable Spend

### Profitability Threshold

**Break-even:**
```
eCPM = CPM
eCPC = CPC
eCPA = CPA
ROAS = 1
```

**Profitable:**
```
eCPM > CPM
eCPC > CPC
eCPA > CPA
ROAS > 1
```

### Marginal Analysis

**Incremental profit:**
```
ΔProfit = ΔRevenue - ΔCost
```

**Decision:**
```
If ΔProfit > 0: Increase spend
If ΔProfit < 0: Decrease spend
If ΔProfit = 0: Optimal
```

### Portfolio Optimization

**Multiple campaigns:**
```
Maximize: Total_profit = Σ(Profit_i)
Subject to: Total_cost ≤ Budget
```

**Allocation:**
```
Allocate to highest Marginal_ROI first
Until Marginal_ROI = 1
```

## Exercises

1. **Normalization:** Convert between pricing models
2. **Unit Economics:** Calculate eCPM, eCPC, CPA, ROAS
3. **Benchmarking:** Compare campaigns to benchmarks
4. **Profitability:** Identify profitable vs unprofitable spend

## Case Studies

- Cross-campaign comparison
- Unit economics analysis
- Performance benchmarking
- Profitability optimization
- Budget allocation across campaigns
