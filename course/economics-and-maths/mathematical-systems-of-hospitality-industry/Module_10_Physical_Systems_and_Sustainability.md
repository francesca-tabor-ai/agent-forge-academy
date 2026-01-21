---
title: "Physical Systems & Sustainability"
module: "Module 10"
week: 10
order: 10
description: "Energy, space, and environmental efficiency"
---

# Module 10: Physical Systems & Sustainability

## Introduction

Hospitality operations consume significant energy and resources. This module covers buildings as thermodynamic systems, energy intensity metrics, and sustainability optimization.

## Learning Objectives

- Model buildings as thermodynamic systems
- Calculate energy and water intensity metrics
- Evaluate operational sustainability trade-offs
- Optimize long-run costs
- Apply heat transfer equations
- Calculate normalized efficiency ratios
- Use optimization under constraints
- Design HVAC systems and retrofits
- Implement linen reuse programs
- Benchmark sustainability

## Buildings as Thermodynamic Systems

### Heat Transfer

**Conduction:**
```
Q = k × A × (T_hot - T_cold) / d
where:
  k = thermal conductivity
  A = area
  d = thickness
```

**Convection:**
```
Q = h × A × (T_surface - T_air)
where h = convection coefficient
```

**Radiation:**
```
Q = ε × σ × A × (T⁴_surface - T⁴_surroundings)
where:
  ε = emissivity
  σ = Stefan-Boltzmann constant
```

### Energy Balance

**Building:**
```
Energy_in = Energy_out + Energy_stored
```

**HVAC:**
```
Cooling_load = Heat_gain - Heat_loss
```

**Optimization:**
```
Minimize: Energy_consumption
Subject to: Comfort_constraints
```

## Energy and Water Intensity Metrics

### Energy Intensity

**Definition:**
```
Energy_per_unit_output
```

**Metrics:**
```
kWh_per_room_night
kWh_per_guest
kWh_per_square_foot
```

**Normalization:**
```
Intensity = Energy / Output
```

### Water Intensity

**Definition:**
```
Water_per_unit_output
```

**Metrics:**
```
Liters_per_room_night
Liters_per_guest
Liters_per_meal
```

**Normalization:**
```
Intensity = Water / Output
```

### Carbon Intensity

**Definition:**
```
CO2_equivalent_per_unit_output
```

**Calculation:**
```
Carbon_intensity = Energy_intensity × Carbon_factor
```

**Reduction:**
```
Lower_energy_intensity
Renewable_energy
Carbon_offset
```

## Operational Sustainability Trade-offs

### Cost vs. Sustainability

**More sustainable:**
```
Higher_upfront_cost
Lower_operating_cost
Lower_environmental_impact
```

**Less sustainable:**
```
Lower_upfront_cost
Higher_operating_cost
Higher_environmental_impact
```

**Optimization:**
```
Minimize: Total_cost + λ × Environmental_impact
where λ = environmental_weight
```

### Long-Run Optimization

**Lifecycle cost:**
```
LCC = Initial_cost + Σ Operating_cost_t / (1 + r)^t
```

**Sustainability:**
```
Environmental_impact_over_lifecycle
```

**Optimization:**
```
Minimize: LCC
Subject to: Sustainability_constraints
```

## Core Mathematics

### Heat Transfer Equations

**Steady-state:**
```
Q = U × A × ΔT
where U = overall heat transfer coefficient
```

**Transient:**
```
dT/dt = (Q_in - Q_out) / (m × c)
where:
  m = mass
  c = specific heat
```

**HVAC load:**
```
Cooling_load = Σ Heat_gains - Σ Heat_losses
```

### Normalized Efficiency Ratios

**Energy efficiency:**
```
EER = Cooling_capacity / Energy_input
```

**Coefficient of performance:**
```
COP = Heating_capacity / Energy_input
```

**Normalization:**
```
Efficiency = Output / Input
```

### Optimization Under Constraints

**Problem:**
```
Minimize: Energy_consumption
Subject to:
  Comfort_constraints
  Budget_constraints
  Sustainability_targets
```

**Lagrangian:**
```
L = Energy - λ₁×(Comfort - Target) - λ₂×(Cost - Budget)
```

**Solution:**
```
Solve KKT conditions
Find optimal settings
```

## Industry Applications

### HVAC Design and Retrofits

**Design:**
```
Size equipment
Optimize efficiency
Minimize cost
```

**Retrofit:**
```
Upgrade existing systems
Improve efficiency
Reduce energy
```

**ROI:**
```
ROI = (Energy_savings - Retrofit_cost) / Retrofit_cost
```

### Linen Reuse Programs

**Program:**
```
Offer guests option to reuse linens
Reduce laundry
Save water and energy
```

**Savings:**
```
Water_savings = Reuse_rate × Water_per_laundry
Energy_savings = Reuse_rate × Energy_per_laundry
```

**Implementation:**
```
Guest_education
Incentives
Measurement
```

### Sustainability Benchmarking

**Benchmarking:**
```
Compare to industry_averages
Compare to best_practices
Set targets
```

**Metrics:**
```
Energy_intensity
Water_intensity
Carbon_intensity
Waste_intensity
```

**Improvement:**
```
Track over time
Identify opportunities
Implement improvements
```

## Exercises

1. **Heat Transfer:** Model building heat transfer
2. **Intensity:** Calculate energy and water intensity
3. **Optimization:** Optimize for sustainability
4. **Benchmarking:** Benchmark sustainability metrics

## Case Studies

- HVAC optimization
- Energy efficiency improvements
- Water conservation programs
- Sustainability certification
- Green building design
