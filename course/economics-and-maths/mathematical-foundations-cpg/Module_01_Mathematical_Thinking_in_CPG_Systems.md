---
title: "Mathematical Thinking in CPG Systems"
module: "Module 1"
week: 1
order: 1
description: "Build a systems-level mindset for understanding CPG as an interconnected, quantitative ecosystem"
---

# Module 1: Mathematical Thinking in CPG Systems

## Introduction

This foundational module establishes CPG as a mathematical system. We explore how to map complex business problems to quantitative frameworks, understanding stocks, flows, feedback loops, and the trade-offs inherent in CPG operations.

## Learning Objectives

- Understand CPG value chain as a mathematical system
- Model stocks, flows, and feedback loops
- Distinguish deterministic vs stochastic decision environments
- Build KPI hierarchies and understand trade-offs
- Apply systems modeling principles
- Use conservation laws for flow balance
- Analyze variance propagation

## CPG Value Chain as a Mathematical System

### System Components

**Inputs:**
- Raw materials
- Energy
- Labor
- Capital

**Processes:**
- Manufacturing
- Packaging
- Quality control
- Logistics

**Outputs:**
- Finished goods
- Waste
- Revenue
- Customer satisfaction

**Mathematical representation:**
```
System_State(t+1) = f(System_State(t), Inputs(t), Controls(t))
```

### Value Chain Mapping

**Stages:**
1. **Sourcing** → Raw material acquisition
2. **Manufacturing** → Production transformation
3. **Packaging** → Product preparation
4. **Distribution** → Logistics and warehousing
5. **Retail** → Point of sale
6. **Consumption** → End use

**Mathematical flow:**
```
Flow_i = Rate_i × Time
where Rate_i = throughput at stage i
```

## Stocks, Flows, and Feedback Loops

### Stocks (State Variables)

**Definition:** Accumulated quantities at a point in time

**Examples:**
- Inventory levels
- Cash position
- Customer base
- Brand equity

**Mathematical model:**
```
Stock(t) = Stock(t₀) + ∫[Flow_in(τ) - Flow_out(τ)]dτ
```

### Flows (Rate Variables)

**Definition:** Rates of change in stocks

**Types:**
- **Inflows:** Production, sales, returns
- **Outflows:** Consumption, waste, obsolescence

**Flow balance equation:**
```
dStock/dt = Flow_in - Flow_out
```

### Feedback Loops

**Positive feedback (reinforcing):**
```
Growth_rate = k × Current_size
→ Exponential growth
```

**Negative feedback (balancing):**
```
Adjustment = -k × (Current - Target)
→ Convergence to target
```

**CPG examples:**
- **Positive:** Word-of-mouth → Sales → Marketing budget → More word-of-mouth
- **Negative:** Inventory → Reorder → Inventory reduction → Reorder

## Deterministic vs Stochastic Decision Environments

### Deterministic Models

**Characteristics:**
- Known inputs
- Predictable outcomes
- No randomness

**Mathematical form:**
```
Output = f(Inputs)
```

**CPG applications:**
- Cost calculations
- Capacity planning (fixed demand)
- Break-even analysis

### Stochastic Models

**Characteristics:**
- Uncertain inputs
- Probabilistic outcomes
- Randomness included

**Mathematical form:**
```
Output = f(Inputs) + ε
where ε ~ Probability_Distribution
```

**CPG applications:**
- Demand forecasting
- Quality control
- Supply chain risk

**Decision framework:**
```
Expected_Value = Σ P(outcome_i) × Value(outcome_i)
```

## KPI Hierarchies and Trade-offs

### KPI Hierarchy

**Strategic KPIs:**
- Revenue growth
- Market share
- Profitability

**Operational KPIs:**
- Fill rate
- Inventory turnover
- OEE (Overall Equipment Effectiveness)

**Mathematical relationship:**
```
Strategic_KPI = f(Operational_KPI₁, Operational_KPI₂, ...)
```

### Trade-off Analysis

**Common trade-offs:**
1. **Cost vs Service:** Lower inventory → Higher stockouts
2. **Quality vs Speed:** Higher quality → Slower production
3. **Efficiency vs Flexibility:** Optimized lines → Less adaptability

**Mathematical representation:**
```
Objective = w₁×KPI₁ + w₂×KPI₂ + ... + wₙ×KPIₙ
Subject to: Constraints
```

**Pareto frontier:**
- Set of optimal trade-off points
- Cannot improve one KPI without worsening another

## Key Concepts

### Systems Modeling

**System dynamics approach:**
1. Identify stocks and flows
2. Map causal relationships
3. Quantify feedback loops
4. Simulate behavior over time

**Mathematical framework:**
```
dX/dt = f(X, U, t)
where:
  X = state vector
  U = control inputs
  t = time
```

### Conservation Laws (Flow Balance)

**Mass balance:**
```
Input = Output + Accumulation + Losses
```

**Energy balance:**
```
Energy_in = Energy_out + Energy_stored + Energy_lost
```

**Financial balance:**
```
Revenue = Cost + Profit
```

### Variance Propagation

**Variance addition:**
```
Var(X + Y) = Var(X) + Var(Y) + 2×Cov(X,Y)
```

**For independent variables:**
```
Var(ΣX_i) = ΣVar(X_i)
```

**CPG application:**
- Demand variance propagation through supply chain
- Quality variance accumulation
- Cost variance analysis

## Exercises

1. **System Mapping:** Map a CPG value chain with stocks and flows
2. **Feedback Analysis:** Identify feedback loops in a CPG scenario
3. **Trade-off Optimization:** Solve a multi-objective optimization problem

## Case Studies

- Inventory system dynamics
- Supply chain variance propagation
- KPI hierarchy design
- Trade-off analysis in product development
