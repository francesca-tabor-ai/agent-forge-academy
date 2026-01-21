---
title: "Integrated Housing System Model"
module: "Capstone"
week: 17
order: 17
description: "Synthesize the full course into one applied model"
---

# Capstone Module: Integrated Housing System Model

## Introduction

This capstone module integrates all course concepts into a unified mathematical framework for housing system analysis. Students build a comprehensive model explaining prices, supply, risk, and affordability for a chosen city.

## Learning Objectives

- Synthesize mathematical concepts across all modules
- Build integrated models for housing systems
- Simulate investor, household, and developer interactions
- Conduct scenario stress testing
- Evaluate policies using data-driven methods

## Capstone Project Framework

### Project Structure

**1. System Definition**
- Define geographic scope
- Identify key actors (households, investors, developers)
- Map data sources

**2. Model Development**
- Supply model (Modules 2, 4, 5)
- Demand model (Modules 5, 6, 13)
- Price formation (Modules 5, 10, 12)
- Finance model (Modules 7, 8, 9)
- Policy model (Module 16)

**3. Integration**
- Connect model components
- Calibrate to data
- Validate model

**4. Analysis**
- Base case simulation
- Scenario analysis
- Policy evaluation

**5. Presentation**
- Technical documentation
- Business presentation
- Policy recommendations

## End-to-End Housing Market Simulation

### System Components

**Supply side:**
```
New_construction = f(Price, Construction_cost, Zoning, Interest_rates)
Existing_supply = Stock - Demolitions - Conversions
Total_supply = Existing + New
```

**Demand side:**
```
Household_formation = f(Population, Income, Demographics)
Housing_demand = f(Price, Income, Interest_rates, Expectations)
```

**Price formation:**
```
Price = f(Supply, Demand, Location, Characteristics)
```

**Market clearing:**
```
Supply(Price) = Demand(Price)
```

### Dynamic Model

**Time evolution:**
```
Price_{t+1} = f(Price_t, Supply_t, Demand_t, Shocks_t)
Supply_{t+1} = Supply_t + New_construction_t - Demolitions_t
Demand_{t+1} = f(Price_{t+1}, Income_{t+1}, ...)
```

## Investor + Household + Developer Interaction

### Investor Behavior

**Investment decision:**
```
Invest if: NPV > 0 or IRR > Hurdle_rate
```

**Portfolio:**
```
Allocate across property types to optimize risk-return
```

**Pricing:**
```
Bid_price = NOI / Cap_rate
```

### Household Behavior

**Tenure choice:**
```
Buy if: NPV_buy > NPV_rent
```

**Location choice:**
```
Maximize: Utility(Location, Housing, Commute, ...)
```

**Price expectations:**
```
E[Price_{t+1}] = f(Price_t, Market_conditions, ...)
```

### Developer Behavior

**Development decision:**
```
Develop if: Sale_price > Construction_cost + Land_cost + Profit_margin
```

**Supply response:**
```
New_construction = f(Expected_profit, Zoning, Capacity)
```

### Market Equilibrium

**Simultaneous:**
```
Price*: Supply(Price*) = Demand(Price*)
Where Supply and Demand depend on all actors' decisions
```

## Scenario Stress Testing

### Interest Rate Scenarios

**Shock:**
```
Rate_up = Current + 200 bps
```

**Impacts:**
- Mortgage payments increase
- Affordability decreases
- Demand decreases
- Prices decline
- Defaults increase

### Economic Recession

**Shock:**
```
GDP_decline = -3%
Unemployment_increase = +5%
Income_decline = -10%
```

**Impacts:**
- Household formation decreases
- Demand decreases
- Prices decline
- Foreclosures increase

### Supply Shock

**Shock:**
```
Zoning_reform: FAR_max increases 50%
```

**Impacts:**
- Construction increases
- Supply increases
- Prices moderate
- Affordability improves

### Combined Scenarios

**Severe stress:**
```
Rate_up + Recession + Supply_constraint
```

**Analysis:**
- Price decline magnitude
- Default rates
- Market recovery time

## Data-Driven Policy Evaluation

### Policy Interventions

**Zoning reform:**
```
Simulate: Current vs Reformed
Compare: Prices, Supply, Affordability
```

**Subsidies:**
```
Simulate: With vs Without
Compare: Affordability, Market_distortion
```

**Rent control:**
```
Simulate: Controlled vs Free_market
Compare: Rents, Supply, Quality
```

### Evaluation Metrics

**Affordability:**
```
%_affordable = P(Price ≤ Affordable_price)
```

**Supply:**
```
Total_units, New_construction_rate
```

**Market efficiency:**
```
Price_volatility, Time_on_market
```

**Distribution:**
```
Gini_coefficient, Cost_burden_distribution
```

## Deliverable Requirements

### Technical Model

**Components:**
- Supply model
- Demand model
- Price model
- Finance model
- Policy model

**Documentation:**
- Model equations
- Data sources
- Calibration
- Validation

### Analysis Report

**Sections:**
1. Executive summary
2. Model description
3. Base case results
4. Scenario analysis
5. Policy evaluation
6. Recommendations

### Presentation

**Format:**
- Technical presentation (30 min)
- Business presentation (15 min)
- Q&A

**Audience:**
- Technical: Model details
- Business: Key findings, recommendations
- Policy: Intervention impacts

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
- Policy evaluation
- Insights

**Communication (10%):**
- Clarity
- Visualization
- Recommendations

## Resources

- Housing market data sources
- Policy databases
- Modeling software
- Academic literature
- Industry reports

## Timeline

**Week 1-2:** System definition and data collection
**Week 3-5:** Model development
**Week 6-7:** Integration and calibration
**Week 8-9:** Analysis and scenario testing
**Week 10:** Documentation and presentation

## Exercises

1. **System Mapping:** Map housing system with all actors
2. **Model Integration:** Connect supply, demand, price models
3. **Scenario Design:** Design stress test scenarios
4. **Policy Evaluation:** Evaluate specific policy intervention

## Capstone Examples

- San Francisco housing market model
- Affordable housing policy evaluation
- Climate risk and housing prices
- Zoning reform impact analysis
- Market cycle prediction and policy response
