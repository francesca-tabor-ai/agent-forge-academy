---
title: "Capstone: Integrated Supply Chain Decision Lab"
module: "Capstone"
week: 11
order: 11
description: "Apply the full mathematical toolkit to a realistic, end-to-end supply chain case"
---

# Capstone: Integrated Supply Chain Decision Lab

## Introduction

This capstone module integrates all course concepts into a comprehensive supply chain decision system. Students build a complete model covering demand, inventory, network, and optimization.

## Learning Objectives

- Synthesize mathematical concepts across all modules
- Build integrated supply chain model
- Simulate uncertainty and disruptions
- Optimize cost, service, and risk simultaneously
- Create mathematically defensible supply chain strategy

## Capstone Project Framework

### Project Structure

**1. System Definition**
- Define supply chain network
- Identify key metrics
- Map data sources

**2. Component Development**
- Demand forecasting (Module 2)
- Inventory optimization (Module 3)
- Risk modeling (Module 4)
- Operations flow (Module 5)
- Transportation (Module 6)
- Network design (Module 7)
- Economics (Module 8)
- ML applications (Module 9)
- Resilience (Module 10)

**3. Integration**
- Connect components
- Calibrate models
- Validate assumptions

**4. Simulation**
- Base case
- Uncertainty scenarios
- Disruption scenarios

**5. Optimization**
- Cost optimization
- Service optimization
- Risk optimization
- Multi-objective optimization

**6. Recommendations**
- Strategic insights
- Implementation plan
- Risk mitigation

## Activities

### Build Demand + Inventory + Network Model

**Demand model:**
```
Demand(t) = f(Trend, Seasonality, Forecast_error)
```

**Inventory model:**
```
Inventory(t) = Inventory(t-1) + Orders(t-L) - Demand(t)
```

**Network model:**
```
Flow_balance: Σ Flow_in - Σ Flow_out = Supply - Demand
```

**Integration:**
```
Demand → Inventory → Network
Network → Transportation → Cost
```

### Simulate Uncertainty and Disruptions

**Uncertainty:**
```
Demand_uncertainty: Demand ~ Distribution
Lead_time_uncertainty: L ~ Distribution
Supply_uncertainty: Supply ~ Distribution
```

**Simulation:**
```
Monte_Carlo simulation
Sample from distributions
Run many scenarios
```

**Disruptions:**
```
Disruption_events: Random or scheduled
Impact: Reduced_capacity, Increased_lead_time, ...
Recovery: Time_to_recover, Cost_to_recover
```

### Optimize Cost, Service, and Risk Simultaneously

**Objectives:**
```
Minimize: Cost
Maximize: Service_level
Minimize: Risk
```

**Constraints:**
```
Capacity_constraints
Demand_satisfaction
Service_level_targets
```

**Multi-objective:**
```
Minimize: w₁×Cost - w₂×Service + w₃×Risk
Subject to: Constraints
```

**Pareto analysis:**
```
Generate Pareto_frontier
Analyze trade-offs
Choose solution
```

## Deliverables

### Mathematical Model

**Components:**
- Demand forecasting model
- Inventory optimization model
- Network flow model
- Transportation model
- Risk model
- Resilience model

**Documentation:**
- Model equations
- Assumptions
- Parameters
- Calibration

### Analysis Report

**Sections:**
1. Executive summary
2. System design
3. Model components
4. Simulation results
5. Optimization results
6. Strategic recommendations

### Presentation

**Format:**
- Technical presentation (30 min)
- Business presentation (15 min)
- Q&A

**Audience:**
- Technical: Model details
- Business: Insights, recommendations

## Evaluation Criteria

**Mathematical correctness (40%):**
- Model accuracy
- Integration quality
- Validation

**Industry realism (30%):**
- Realistic assumptions
- Practical applications
- Business relevance

**Clarity of assumptions (20%):**
- Assumptions documented
- Justified
- Tested

**Actionable insights (10%):**
- Strategic recommendations
- Implementation guidance
- Business value

## Outcome

A mathematically defensible supply chain strategy supported by data and models that:

- Optimizes cost, service, and risk
- Handles uncertainty and disruptions
- Provides actionable recommendations
- Can be implemented in practice

## Timeline

**Week 1-2:** System definition and data
**Week 3-5:** Component development
**Week 6-7:** Integration and calibration
**Week 8-9:** Simulation and optimization
**Week 10:** Analysis and recommendations
**Week 11:** Documentation and presentation

## Exercises

1. **System Design:** Design complete supply chain system
2. **Integration:** Integrate all components
3. **Simulation:** Simulate uncertainty and disruptions
4. **Optimization:** Optimize multi-objective problem

## Capstone Examples

- End-to-end supply chain optimization
- Multi-echelon network design
- Resilience and sustainability optimization
- Demand-inventory-network integration
- Risk-adjusted supply chain strategy
