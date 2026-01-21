---
title: "Building Physics and Structural Mathematics"
module: "Module 3"
week: 3
order: 3
description: "Understand the physical laws governing housing performance and safety"
---

# Module 3: Building Physics and Structural Mathematics

## Introduction

Housing must satisfy physical laws for safety, comfort, and efficiency. This module applies physics-based equations to structural loads, heat transfer, HVAC systems, and thermal performance.

## Learning Objectives

- Calculate structural load combinations and safety factors
- Model heat transfer through building envelopes
- Analyze HVAC airflow and energy balance
- Optimize thermal efficiency and material performance
- Apply physics-based equations and inequality constraints

## Structural Load Combinations and Safety Factors

### Load Types

**Dead load:**
```
D = Weight of permanent structure
```

**Live load:**
```
L = Weight of occupants, furniture, movable items
```

**Environmental loads:**
```
W = Wind load
S = Snow load
E = Seismic load
```

### Load Combinations

**ASD (Allowable Stress Design):**
```
Combination_1: D + L
Combination_2: D + L + W
Combination_3: D + L + S
Combination_4: D + W
Combination_5: D + E
```

**LRFD (Load and Resistance Factor Design):**
```
1.4D
1.2D + 1.6L
1.2D + 1.6L + 0.5W
1.2D + 1.0W + 1.0L
0.9D + 1.0W
```

### Safety Factors

**Factor of safety:**
```
FS = Ultimate_strength / Allowable_strength
```

**Design strength:**
```
Design_strength = Ultimate_strength / FS
```

**Inequality constraint:**
```
Applied_load ≤ Design_strength
```

**Reliability:**
```
P(Failure) = P(Load > Strength) ≤ Target_probability
```

## Heat Transfer Through Envelopes

### Conduction

**Fourier's law:**
```
q = -k × A × (dT/dx)
where:
  q = heat flux
  k = thermal conductivity
  A = area
  dT/dx = temperature gradient
```

**Steady-state:**
```
q = (k × A × ΔT) / L
where L = thickness
```

**Thermal resistance:**
```
R = L / k
q = (ΔT) / R
```

**Multiple layers:**
```
R_total = R₁ + R₂ + ... + Rₙ
q = ΔT / R_total
```

### Convection

**Newton's law:**
```
q = h × A × (T_surface - T_fluid)
where h = convection coefficient
```

**Combined:**
```
q = (T_inside - T_outside) / (R_conduction + R_convection)
```

### Radiation

**Stefan-Boltzmann:**
```
q = ε × σ × A × (T₁⁴ - T₂⁴)
where:
  ε = emissivity
  σ = Stefan-Boltzmann constant
```

## HVAC Airflow and Energy Balance

### Energy Balance

**Conservation of energy:**
```
Energy_in = Energy_out + Energy_stored
```

**For building:**
```
Q_heating + Q_internal = Q_loss + Q_ventilation + Q_stored
```

**Heat loss:**
```
Q_loss = U × A × (T_inside - T_outside)
where U = overall heat transfer coefficient
```

**Ventilation:**
```
Q_vent = ρ × c_p × V × (T_inside - T_outside)
where:
  ρ = air density
  c_p = specific heat
  V = ventilation rate
```

### HVAC Sizing

**Cooling load:**
```
Q_cooling = Q_solar + Q_internal + Q_infiltration - Q_stored
```

**Heating load:**
```
Q_heating = Q_loss + Q_ventilation - Q_internal - Q_solar
```

**Equipment sizing:**
```
Capacity ≥ Peak_load × Safety_factor
```

## Thermal Efficiency and Material Performance

### U-Value (Overall Heat Transfer Coefficient)

**Definition:**
```
U = 1 / R_total
```

**Lower U = Better insulation**

**Calculation:**
```
U = 1 / (R_inside + R_wall + R_insulation + R_outside)
```

### R-Value (Thermal Resistance)

**Definition:**
```
R = L / k
```

**Higher R = Better insulation**

**Total R:**
```
R_total = Σ R_i across all layers
```

### Energy Performance

**Annual energy use:**
```
Energy = U × A × HDD × 24 / Efficiency
where:
  HDD = Heating Degree Days
  Efficiency = system efficiency
```

**Optimization:**
```
Minimize: Energy_cost + Insulation_cost
Subject to: U ≤ U_max (code requirement)
```

## Key Math: Physics-Based Equations

### Differential Equations

**Heat diffusion:**
```
∂T/∂t = α × ∇²T
where α = thermal diffusivity
```

**Steady-state solution:**
```
∇²T = 0  (Laplace equation)
```

### Inequality Constraints

**Structural:**
```
Applied_load ≤ Design_strength
```

**Thermal:**
```
U ≤ U_max
R ≥ R_min
```

**Optimization:**
```
Minimize: Cost
Subject to: Performance_constraints
```

## Exercises

1. **Load Calculation:** Calculate design loads for structure
2. **Heat Transfer:** Model heat loss through wall assembly
3. **HVAC Sizing:** Size heating and cooling systems
4. **Efficiency Optimization:** Optimize insulation for cost and performance

## Case Studies

- Structural design optimization
- Energy-efficient building design
- Retrofitting for thermal performance
- HVAC system optimization
- Building code compliance analysis
