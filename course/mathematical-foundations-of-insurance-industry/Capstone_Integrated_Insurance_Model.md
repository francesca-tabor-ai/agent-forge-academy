---
title: "Capstone: Integrated Insurance Model"
module: "Capstone"
week: 13
order: 13
description: "Build a simplified insurer: pricing, reserving, capital, and profit"
---

# Capstone: Integrated Insurance Model

## Introduction

This capstone module integrates all course concepts to build a simplified insurer model. Students model pricing, reserving, capital, and profit, and stress test under catastrophe scenarios.

## Learning Objectives

- Synthesize mathematical concepts across all modules
- Build integrated insurance model
- Integrate pricing, reserving, capital, and profit
- Stress test under catastrophe scenarios
- Evaluate solvency and profitability
- Create complete insurance system model

## Capstone Project Framework

### Project Structure

**1. Insurer Design**
- Define insurance product
- Set parameters
- Define portfolio

**2. Component Development**
- Pricing model (Module 4)
- Claims model (Modules 2, 3)
- Reserving model (Module 6)
- Capital model (Module 7)
- Reinsurance model (Module 8)
- Investment model (Module 11)

**3. Integration**
- Connect components
- Calibrate models
- Validate assumptions

**4. Analysis**
- Base case
- Stress tests
- Catastrophe scenarios

**5. Evaluation**
- Solvency assessment
- Profitability analysis
- Recommendations

## Deliverables

### Integrated Model

**Components:**
- Pricing: Premium calculation
- Claims: Frequency and severity models
- Reserving: Loss development
- Capital: Risk measures
- Reinsurance: Risk transfer
- Investment: Asset returns
- Profit: Revenue - Expenses - Losses

**Documentation:**
- Model equations
- Assumptions
- Parameters
- Calibration

### Stress Testing

**Scenarios:**
```
Base_case: Normal_conditions
Catastrophe: Extreme_losses
Economic_downturn: Lower_returns
Combined: Multiple_shocks
```

**Analysis:**
```
Solvency_impact
Profitability_impact
Capital_adequacy
```

### Solvency and Profitability Evaluation

**Solvency:**
```
Solvency_ratio = Capital / Required_capital
P(Solvent) = P(Capital > Required)
```

**Profitability:**
```
Profit = Premium - Expenses - Losses + Investment_income
ROE = Profit / Equity
```

**Metrics:**
```
Combined_ratio
Loss_ratio
Expense_ratio
ROE
```

## Integration Requirements

### Pricing

**Premium:**
```
Premium = Pure_premium + Risk_load + Expense_load + Profit_load
Pure_premium = E[Frequency] × E[Severity]
```

**Integration:**
```
Premium → Revenue
Revenue → Profit
```

### Reserving

**Reserve:**
```
Reserve = Ultimate_losses - Paid_losses
Ultimate = Chain_Ladder or BF
```

**Integration:**
```
Reserve → Liability
Liability → Capital_need
```

### Capital

**Capital:**
```
Capital = VaR_99.5% - E[Loss]
Or: Capital = TVaR_99.5% - E[Loss]
```

**Integration:**
```
Capital → Solvency
Capital → Investment
```

### Profit

**Profit:**
```
Profit = Premium - Expenses - Losses - Reserve_increase + Investment_income
```

**Integration:**
```
All components contribute
Holistic_view
```

## Stress Testing

### Catastrophe Scenarios

**Scenario:**
```
Extreme_loss_event
High_frequency or High_severity
```

**Impact:**
```
Large_losses
Capital_depletion
Solvency_risk
```

**Analysis:**
```
Survive?
Recovery_time?
Capital_need?
```

### Economic Scenarios

**Scenario:**
```
Lower_investment_returns
Higher_inflation
Economic_recession
```

**Impact:**
```
Lower_investment_income
Higher_expenses
Lower_demand
```

## Evaluation Criteria

**Technical rigor (40%):**
- Model accuracy
- Integration quality
- Validation

**Economic analysis (30%):**
- Solvency assessment
- Profitability analysis
- Stress testing

**Completeness (20%):**
- All components included
- Proper integration
- Documentation

**Insights (10%):**
- Key findings
- Recommendations
- Business value

## Timeline

**Week 1-2:** Insurer design and parameters
**Week 3-5:** Component development
**Week 6-7:** Integration
**Week 8-9:** Stress testing and analysis
**Week 10:** Documentation and presentation

## Exercises

1. **Model Building:** Build integrated model
2. **Integration:** Integrate all components
3. **Stress Testing:** Conduct stress tests
4. **Evaluation:** Evaluate solvency and profitability

## Capstone Examples

- Property & casualty insurer
- Life insurer
- Health insurer
- Specialty lines
- Reinsurer
