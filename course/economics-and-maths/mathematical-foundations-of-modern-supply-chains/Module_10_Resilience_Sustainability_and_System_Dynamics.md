---
title: "Resilience, Sustainability & System Dynamics"
module: "Module 10"
week: 10
order: 10
description: "How do supply chains survive shocks and meet sustainability goals?"
---

# Module 10: Resilience, Sustainability & System Dynamics

## Introduction

Supply chains must be resilient to disruptions and sustainable. This module covers disruption modeling, carbon accounting, and long-run system behavior.

## Learning Objectives

- Model disruptions
- Apply carbon accounting
- Analyze long-run system behavior
- Use Markov chains
- Calculate carbon intensity equations
- Apply dynamic systems modeling
- Quantify resilience and disruption risk
- Optimize tradeoffs between cost, service, and emissions

## Disruption Modeling

### Disruption Types

**Supply disruptions:**
```
Supplier_failure
Production_stoppage
```

**Demand disruptions:**
```
Demand_surge
Demand_collapse
```

**Transportation disruptions:**
```
Route_closed
Capacity_reduced
```

**Natural disasters:**
```
Earthquake, Flood, Pandemic
```

### Disruption Impact

**Service level:**
```
Service_during_disruption < Service_normal
```

**Cost:**
```
Cost_during_disruption > Cost_normal
```

**Recovery:**
```
Time_to_recover
Cost_to_recover
```

### Resilience Metrics

**Time to recover:**
```
TTR = Time_to_return_to_normal
```

**Service during disruption:**
```
Service_level_during = f(Disruption_severity, Preparedness)
```

**Resilience index:**
```
Resilience = f(TTR, Service_level, Cost)
```

## Carbon Accounting

### Carbon Footprint

**Definition:**
```
Total_GHG_emissions from supply chain
```

**Components:**
```
Emissions = Production_emissions + Transportation_emissions + Storage_emissions
```

**Measurement:**
```
CO2_equivalent
Lifecycle assessment
```

### Carbon Intensity

**Definition:**
```
Emissions_per_unit_output
```

**Calculation:**
```
Carbon_intensity = Total_emissions / Total_output
```

**By activity:**
```
Intensity_production = Emissions_production / Units_produced
Intensity_transport = Emissions_transport / Ton_km
```

### Carbon Optimization

**Objective:**
```
Minimize: Total_emissions
Subject to: Cost, Service_constraints
```

**Trade-off:**
```
Lower_emissions → Higher_cost (often)
```

**Optimization:**
```
Minimize: Cost + λ × Emissions
where λ = carbon_price
```

## Long-Run System Behavior

### System Dynamics

**State variables:**
```
x(t) = [Inventory(t), Backlog(t), ...]
```

**Dynamics:**
```
dx/dt = f(x, u, d)
where:
  u = control decisions
  d = disturbances
```

**Equilibrium:**
```
dx/dt = 0
Steady_state
```

### Stability

**Stable:**
```
System returns to equilibrium after disturbance
```

**Unstable:**
```
System diverges from equilibrium
```

**Analysis:**
```
Eigenvalues of system matrix
Negative real parts → Stable
```

## Mathematical Tools

### Markov Chains

**States:**
```
S = {s₁, s₂, ..., s_n}
```

**Transition probabilities:**
```
P_ij = P(State_{t+1} = j | State_t = i)
```

**Transition matrix:**
```
P = [P_ij]
```

**Steady state:**
```
π = π × P
Solve for π
```

**Application:**
```
Model supply chain states
Disruption_recovery
System_transitions
```

### Carbon Intensity Equations

**Production:**
```
Emissions_production = Units × Intensity_production
```

**Transportation:**
```
Emissions_transport = Distance × Weight × Intensity_transport
```

**Total:**
```
Total_emissions = Σ Emissions_i for all activities
```

**Intensity:**
```
Intensity = Emissions / Output
```

### Dynamic Systems Modeling

**Linear:**
```
dx/dt = Ax + Bu
```

**Non-linear:**
```
dx/dt = f(x, u)
```

**Solution:**
```
Analytical (if linear)
Numerical (if non-linear)
Simulation
```

## Learning Outcomes

### Quantifying Resilience

**Resilience components:**
```
Absorptive_capacity
Adaptive_capacity
Recovery_capacity
```

**Metrics:**
```
TTR = Time_to_recover
Service_during = Service_level_during_disruption
Cost_of_disruption
```

**Resilience index:**
```
Resilience = f(Absorption, Adaptation, Recovery)
```

### Optimizing Tradeoffs

**Multi-objective:**
```
Minimize: Cost
Minimize: Emissions
Maximize: Service_level
Maximize: Resilience
```

**Pareto frontier:**
```
Set of non-dominated solutions
Trade-off curve
```

**Optimization:**
```
Minimize: w₁×Cost + w₂×Emissions - w₃×Service - w₄×Resilience
Subject to: Constraints
```

## Exercises

1. **Disruption:** Model disruptions and recovery
2. **Carbon:** Calculate carbon footprint and optimize
3. **System Dynamics:** Model long-run system behavior
4. **Tradeoffs:** Optimize cost, service, and emissions

## Case Studies

- Supply chain resilience improvement
- Carbon footprint reduction
- Sustainability optimization
- Disruption risk management
- Multi-objective optimization
