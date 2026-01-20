---
title: "Chemistry of Cosmetic Formulation"
module: "Module 4"
week: 4
order: 4
description: "Stoichiometry and concentration balancing, pH, viscosity, and stability optimization"
---

# Module 4: Chemistry of Cosmetic Formulation

## Introduction

Cosmetic formulation requires precise mathematical control of chemical reactions, concentrations, and physical properties. This module applies stoichiometry, equilibrium chemistry, and optimization theory to create effective and stable cosmetic products.

## Learning Objectives

- Apply stoichiometry to ingredient balancing
- Calculate optimal concentrations using mathematical models
- Optimize pH for product stability and efficacy
- Model viscosity and rheological properties
- Design stability-optimized formulations

## Key Models

### Ingredient Ratio Equations

**Stoichiometric balancing:**
```
For reaction: aA + bB → cC + dD
Mass balance: a·M_A + b·M_B = c·M_C + d·M_D
```

**Concentration calculations:**
```
C = n / V
where:
  C = concentration (mol/L)
  n = amount of substance (mol)
  V = volume (L)
```

**Percentage by weight:**
```
% w/w = (mass_component / mass_total) × 100
```

### Optimization Constraints

**Formulation optimization problem:**

**Objective:** Maximize efficacy while maintaining stability

**Variables:**
- x_i = concentration of ingredient i
- pH = product pH
- η = viscosity

**Constraints:**
```
Σ x_i = 1.0  (total concentration = 100%)
pH_min ≤ pH ≤ pH_max
η_min ≤ η ≤ η_max
x_i ≥ 0  (non-negative concentrations)
```

**Cost function:**
```
Minimize: Cost = Σ (c_i × x_i)
where c_i = cost per unit of ingredient i
```

## Application: Creams, Serums, and Foundations

### Cream Formulation

**Key parameters:**
- **Emulsifier ratio**: Oil phase / Water phase
- **pH range**: 5.5 - 6.5 (skin-friendly)
- **Viscosity**: 10,000 - 50,000 cP

**Mathematical model:**
```
Stability = f(pH, viscosity, emulsifier_ratio, temperature)
```

### Serum Formulation

**Active ingredient optimization:**
- Maximum effective concentration
- Penetration enhancer ratios
- pH for stability and absorption

**Concentration model:**
```
Efficacy = k × C^α / (C^α + EC50^α)
where:
  k = maximum efficacy
  C = concentration
  EC50 = half-maximal effective concentration
  α = Hill coefficient
```

### Foundation Formulation

**Color matching:**
- Pigment concentration ratios
- Opacity calculations
- Undertone balancing

**Mathematical approach:**
```
Color = Σ (C_i × P_i)
where:
  C_i = concentration of pigment i
  P_i = color contribution of pigment i
```

## Exercises

1. **Stoichiometry Problem**: Balance a cosmetic formulation
2. **pH Optimization**: Calculate optimal pH for stability
3. **Viscosity Modeling**: Design viscosity profile for application

## Resources

- Cosmetic chemistry textbooks
- Formulation databases
- Regulatory guidelines
- Industry case studies
