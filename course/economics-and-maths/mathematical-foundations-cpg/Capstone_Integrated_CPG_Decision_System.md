---
title: "Integrated CPG Decision System"
module: "Capstone"
week: 13
order: 13
description: "Synthesize all modules into a unified mathematical view"
---

# Capstone Module: Integrated CPG Decision System

## Introduction

This capstone module integrates all course concepts into a unified mathematical framework for CPG decision-making. Students apply quantitative methods to solve complex, real-world CPG problems that span multiple functional areas.

## Learning Objectives

- Synthesize mathematical concepts across all modules
- Build integrated models for CPG decisions
- Optimize across multiple objectives and constraints
- Make holistic, quantitative business decisions
- Present technical analysis to business stakeholders

## Capstone Project Framework

### Project Structure

**1. Problem Definition**
- Identify business problem
- Define objectives and constraints
- Scope the analysis

**2. Data Collection**
- Gather relevant data
- Validate data quality
- Handle missing data

**3. Model Development**
- Select appropriate mathematical models
- Integrate multiple model components
- Validate model assumptions

**4. Analysis & Optimization**
- Run optimization algorithms
- Perform sensitivity analysis
- Evaluate trade-offs

**5. Recommendations**
- Translate results to business actions
- Quantify expected impact
- Present findings

## Capstone Project Examples

### Example 1: End-to-End SKU Profitability Model

**Objective:**
Build a comprehensive model that quantifies profitability across the entire value chain for a specific SKU.

**Components:**
- **Demand modeling** (Module 2): Price elasticity, promotion response
- **Forecasting** (Module 3): Demand uncertainty
- **Inventory** (Module 4): Safety stock, service levels
- **Manufacturing** (Module 5): Production costs, OEE
- **Packaging** (Module 6): Material costs, efficiency
- **Quality** (Module 7): Defect costs, giveaways
- **Pricing** (Module 8): Optimal pricing strategy
- **Marketing** (Module 9): Promotion ROI
- **Supply chain** (Module 11): Logistics costs
- **Sustainability** (Module 12): Carbon footprint

**Mathematical model:**
```
Profit = Revenue - Total_Cost
Revenue = Price × Demand(Price, Promotions, ...)
Total_Cost = Manufacturing + Packaging + Inventory + Quality + Logistics + Sustainability
```

**Optimization:**
```
Maximize: Profit
Subject to:
  Service_level ≥ Target
  Carbon ≤ Target
  Capacity_constraints
  Quality_constraints
```

**Deliverables:**
- Integrated profitability model
- Optimal pricing and promotion strategy
- Sensitivity analysis
- Implementation roadmap

### Example 2: Packaging Redesign with Cost, Carbon, and Logistics Trade-offs

**Objective:**
Redesign packaging to optimize cost, environmental impact, and logistics efficiency simultaneously.

**Components:**
- **Packaging geometry** (Module 6): Volume efficiency, palletization
- **Sustainability** (Module 12): Carbon footprint, material circularity
- **Supply chain** (Module 11): Transportation costs, network optimization
- **Quality** (Module 7): Barrier properties, shelf life
- **Manufacturing** (Module 5): Production efficiency

**Mathematical model:**
```
Minimize: w₁×Cost + w₂×Carbon + w₃×Logistics_cost
Subject to:
  Performance ≥ Performance_min
  Shelf_life ≥ Target
  Palletization_efficiency ≥ Target
  Recyclability ≥ Target
```

**Trade-off analysis:**
- Cost vs Carbon
- Performance vs Sustainability
- Efficiency vs Flexibility

**Deliverables:**
- Optimal packaging design
- Trade-off analysis
- Implementation cost-benefit
- Sustainability impact assessment

### Example 3: Price + Promo + Inventory Integrated Optimization

**Objective:**
Simultaneously optimize pricing, promotion strategy, and inventory levels to maximize profit while maintaining service levels.

**Components:**
- **Demand modeling** (Module 2): Price and promotion elasticity
- **Forecasting** (Module 3): Demand uncertainty
- **Inventory** (Module 4): Safety stock, reorder points
- **Pricing** (Module 8): Optimal prices
- **Marketing** (Module 9): Promotion lift, ROI

**Mathematical model:**
```
Maximize: Profit = Σ[(Price_i - Cost_i) × Demand_i(Price_i, Promo_i)] - Inventory_cost - Promo_cost
Subject to:
  Service_level_i ≥ Target_i  for all products i
  Price_constraints
  Promo_budget ≤ Budget_max
  Inventory_capacity ≤ Capacity_max
```

**Decision variables:**
- Prices: P_i for all products
- Promotions: Promo_i, Discount_i, Duration_i
- Inventory: Safety_stock_i, Reorder_point_i

**Optimization approach:**
- Multi-objective optimization
- Stochastic programming (demand uncertainty)
- Constraint programming (business rules)

**Deliverables:**
- Integrated optimization model
- Optimal price and promotion calendar
- Inventory policy recommendations
- Expected profit and risk analysis

## Integration Techniques

### System Dynamics

**Stocks and flows:**
```
dInventory/dt = Production - Sales
dCash/dt = Revenue - Costs
```

**Feedback loops:**
- Price → Demand → Revenue → Marketing budget → Price
- Inventory → Service level → Sales → Inventory

### Multi-Objective Optimization

**Pareto frontier:**
```
Find all non-dominated solutions
Trade-off analysis
Decision maker selects preferred solution
```

**Weighted sum:**
```
Minimize: Σ w_i × Objective_i
```

**ε-constraint method:**
```
Minimize: Primary_objective
Subject to: Other_objectives ≤ ε_i
```

### Stochastic Programming

**Two-stage:**
```
Stage 1: Make decisions (prices, inventory)
Stage 2: Observe uncertainty (demand)
Stage 2: Optimize recourse (production, fulfillment)
```

**Expected value:**
```
Maximize: E[Profit(decisions, uncertainty)]
```

## Presentation and Communication

### Technical Presentation

**Structure:**
1. Executive summary
2. Problem statement
3. Methodology
4. Results
5. Recommendations
6. Implementation plan

### Business Communication

**Key elements:**
- Quantify business impact
- Use visualizations
- Explain trade-offs clearly
- Provide actionable recommendations

**Metrics:**
- Revenue impact
- Cost savings
- Risk reduction
- Sustainability improvement

## Evaluation Criteria

**Technical rigor (40%):**
- Model correctness
- Mathematical soundness
- Data quality
- Validation

**Integration (30%):**
- Synthesis of multiple concepts
- Holistic view
- Cross-functional integration

**Business value (20%):**
- Practical relevance
- Quantified impact
- Actionable recommendations

**Communication (10%):**
- Clarity of presentation
- Visualization quality
- Stakeholder communication

## Resources

- CPG case study databases
- Industry benchmarks
- Optimization software
- Data sources
- Academic literature

## Exercises

1. **System Integration:** Build integrated model combining 3+ modules
2. **Trade-off Analysis:** Analyze multi-objective optimization results
3. **Sensitivity Analysis:** Evaluate robustness of recommendations
4. **Stakeholder Presentation:** Present technical analysis to business audience

## Capstone Timeline

**Week 1-2:** Problem definition and data collection
**Week 3-4:** Model development
**Week 5-6:** Analysis and optimization
**Week 7-8:** Results synthesis and presentation preparation
**Week 9:** Final presentation and submission
