---
title: "Sustainability, Energy, and Climate Metrics"
module: "Module 15"
week: 15
order: 15
description: "Quantify housing's environmental impact"
---

# Module 15: Sustainability, Energy, and Climate Metrics

## Introduction

Housing has significant environmental impacts. This module quantifies energy use, carbon emissions, retrofit returns, and climate risk using optimization and lifecycle analysis.

## Learning Objectives

- Calculate energy use intensity
- Evaluate retrofit ROI
- Conduct embodied carbon accounting
- Price climate risk
- Apply optimization and lifecycle analysis

## Energy Use Intensity

### EUI Definition

**Energy Use Intensity:**
```
EUI = Annual_energy_use / Floor_area
Units: kBtu/sqft/year or kWh/sqft/year
```

**Typical values:**
- Residential: 30-80 kBtu/sqft/year
- Efficient: < 30 kBtu/sqft/year
- Inefficient: > 100 kBtu/sqft/year

### Energy Breakdown

**Components:**
```
Total_energy = Heating + Cooling + Hot_water + Lighting + Appliances
```

**Modeling:**
```
EUI = f(Climate, Building_envelope, HVAC, Occupancy, ...)
```

### Benchmarking

**Comparison:**
```
EUI_building / EUI_benchmark
```

**Percentile:**
```
Percentile = P(EUI ≤ EUI_building)
```

## Retrofit ROI

### Energy Savings

**Annual savings:**
```
Savings = (EUI_before - EUI_after) × Floor_area × Energy_price
```

**Simple payback:**
```
Payback = Retrofit_cost / Annual_savings
```

### Net Present Value

**NPV:**
```
NPV = -Retrofit_cost + Σ(Savings_t / (1+r)^t)
```

**Decision:**
```
NPV > 0: Proceed with retrofit
```

### Internal Rate of Return

**IRR:**
```
NPV(IRR) = 0
```

**Comparison:**
```
IRR > Hurdle_rate: Accept
```

## Embodied Carbon Accounting

### Lifecycle Assessment

**Stages:**
1. Material production
2. Transportation
3. Construction
4. Use (operational)
5. End-of-life

**Total:**
```
Carbon_total = Σ Carbon_stage_i
```

### Embodied Carbon

**Definition:**
```
Carbon_embodied = Carbon from stages 1-3 and 5
Excludes operational energy
```

**Calculation:**
```
Carbon_embodied = Σ(Material_i × Carbon_factor_i)
```

**Carbon factors:**
- Concrete: ~0.1-0.2 kg CO₂/kg
- Steel: ~1.5-2.0 kg CO₂/kg
- Wood: ~0.2-0.4 kg CO₂/kg (can be negative if sequestered)

### Operational vs Embodied

**Break-even:**
```
Carbon_embodied = Carbon_operational × Years
```

**Typical:**
```
Embodied: 10-20% of 50-year total
Operational: 80-90% of 50-year total
```

## Climate Risk Pricing

### Physical Risk

**Flood risk:**
```
Expected_loss = P(Flood) × Damage_cost
```

**Sea level rise:**
```
Risk_t = f(Current_risk, Sea_level_rise, Time)
```

**Heat risk:**
```
Cooling_demand = f(Temperature, Building_efficiency)
```

### Transition Risk

**Carbon pricing:**
```
Carbon_cost = Emissions × Carbon_price
```

**Regulatory risk:**
```
Compliance_cost = f(Regulations, Building_characteristics)
```

### Risk Premium

**Pricing:**
```
Risk_adjusted_value = Base_value - Expected_loss - Risk_premium
```

**Discount rate:**
```
r_adjusted = r_base + Risk_premium
```

## Key Math: Optimization and Lifecycle Analysis

### Optimization

**Energy efficiency:**
```
Minimize: Energy_cost + Retrofit_cost
Subject to: Performance_constraints
```

**Carbon minimization:**
```
Minimize: Carbon_total
Subject to: Cost_constraints
```

### Lifecycle Analysis

**Total impact:**
```
Impact_total = Σ Impact_stage_i
```

**Functional unit:**
```
Impact_per_unit = Impact_total / Functional_units
```

**Time value:**
```
Impact_present = Σ(Impact_t / (1+r)^t)
```

## Exercises

1. **EUI:** Calculate and benchmark energy use
2. **Retrofit:** Evaluate retrofit ROI
3. **Carbon:** Conduct embodied carbon analysis
4. **Climate Risk:** Price climate risk

## Case Studies

- Energy efficiency retrofits
- Carbon footprint reduction
- Climate risk assessment
- Green building certification
- Sustainability investment analysis
