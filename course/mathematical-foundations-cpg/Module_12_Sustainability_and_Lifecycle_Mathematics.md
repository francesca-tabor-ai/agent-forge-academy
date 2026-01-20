---
title: "Sustainability & Lifecycle Mathematics"
module: "Module 12"
week: 12
order: 12
description: "Quantify environmental trade-offs"
---

# Module 12: Sustainability & Lifecycle Mathematics

## Introduction

Sustainability in CPG requires quantifying environmental impacts and optimizing trade-offs between cost, performance, and environmental footprint. This module applies lifecycle assessment, carbon accounting, and optimization under sustainability constraints.

## Learning Objectives

- Conduct lifecycle assessment (LCA)
- Calculate carbon intensity metrics
- Model material substitution trade-offs
- Design waste and circularity models
- Optimize under sustainability constraints

## Lifecycle Assessment (LCA)

### LCA Framework

**Stages:**
1. **Raw materials** extraction
2. **Manufacturing** production
3. **Distribution** transportation
4. **Use** consumption
5. **End-of-life** disposal/recycling

**Total impact:**
```
Impact_total = Σ Impact_stage_i
```

### Impact Categories

**Carbon footprint:**
```
CO₂_equivalent = Σ(GWP_i × Quantity_i)
where GWP = Global Warming Potential
```

**Water footprint:**
```
Water_total = Water_direct + Water_indirect
```

**Energy:**
```
Energy_total = Σ(Energy_i across all stages)
```

### Functional Unit

**Definition:**
```
Functional_unit = Unit of product function
Example: 1 liter of beverage, 1 kg of product
```

**Impact per functional unit:**
```
Impact_per_FU = Impact_total / Functional_units
```

## Carbon Intensity Metrics

### Carbon Intensity

**Definition:**
```
Carbon_intensity = CO₂_emissions / Output_unit
```

**Examples:**
- kg CO₂ per kg product
- kg CO₂ per liter
- kg CO₂ per dollar revenue

### Scope Emissions

**Scope 1 (Direct):**
```
Emissions from owned/controlled sources
```

**Scope 2 (Indirect - Energy):**
```
Emissions from purchased energy
```

**Scope 3 (Indirect - Value Chain):**
```
Emissions from upstream and downstream activities
```

**Total:**
```
Total = Scope_1 + Scope_2 + Scope_3
```

### Carbon Accounting

**Activity-based:**
```
Emissions = Activity × Emission_factor
```

**Example:**
```
CO₂ = Distance × Fuel_consumption × Emission_factor_fuel
```

**Input-output:**
```
Emissions = Σ(Input_i × Emission_intensity_i)
```

## Material Substitution Trade-offs

### Trade-off Analysis

**Objective function:**
```
Minimize: Cost + w × Environmental_impact
where w = weight on sustainability
```

**Constraints:**
```
Performance ≥ Performance_min
Cost ≤ Cost_max
```

### Material Comparison

**Impact comparison:**
```
ΔImpact = Impact_material_A - Impact_material_B
ΔCost = Cost_material_A - Cost_material_B
```

**Trade-off ratio:**
```
Trade_off = ΔCost / ΔImpact
```

**Break-even:**
```
If Trade_off < Carbon_price: Choose material B
If Trade_off > Carbon_price: Choose material A
```

### Optimization Model

**Multi-objective:**
```
Minimize: [Cost, Carbon, Water, ...]
Subject to: Performance_constraints
```

**Weighted sum:**
```
Minimize: w₁×Cost + w₂×Carbon + w₃×Water
```

**Pareto frontier:**
```
Set of non-dominated solutions
Cannot improve one objective without worsening another
```

## Waste and Circularity Models

### Waste Generation

**Waste calculation:**
```
Waste = Input - Output - Recycled
```

**Waste rate:**
```
Waste_rate = Waste / Input
```

**Circularity index:**
```
Circularity = Recycled_content + Recyclability_rate
```

### Mass Balance

**Conservation:**
```
Input = Output + Accumulation + Waste
```

**Recycling:**
```
Input = Virgin_material + Recycled_material
Output = Product + Waste
Recycled_material = Recycling_rate × Waste
```

### Circular Economy Metrics

**Material circularity:**
```
MCI = (1 - Linear_flow_index) × (1 - Virgin_material_index)
```

**Linear flow index:**
```
LFI = Waste / (Input + Recycled)
```

**Virgin material index:**
```
VMI = Virgin_material / Total_material
```

## Optimization Under Sustainability Constraints

### Constrained Optimization

**Objective:**
```
Maximize: Profit
Subject to:
  Carbon ≤ Carbon_target
  Water ≤ Water_target
  Waste ≤ Waste_target
```

**Lagrangian:**
```
L = Profit - λ₁×(Carbon - Target) - λ₂×(Water - Target) - ...
```

**Shadow prices:**
```
λ_i = Marginal_value of constraint i
= Cost of relaxing constraint by one unit
```

### Carbon Pricing

**Internal carbon price:**
```
Adjusted_cost = Cost + Carbon_price × CO₂_emissions
```

**Optimization:**
```
Minimize: Adjusted_cost
```

**Impact:**
- Favors low-carbon alternatives
- Internalizes externalities
- Aligns with carbon targets

## Key Models

### Emissions Intensity Ratios

**Carbon intensity:**
```
CI = CO₂ / Output
```

**Improvement:**
```
CI_new = CI_old × (1 - Reduction_rate)
```

### Mass Balance

**Steady state:**
```
Input = Output
Virgin + Recycled = Product + Waste
```

**Recycling:**
```
Recycled = Recycling_rate × Waste
```

### Optimization Under Sustainability Constraints

**Multi-objective:**
```
Minimize: f(x) = [f₁(x), f₂(x), ..., fₖ(x)]
Subject to: g(x) ≤ 0
```

**Weighted:**
```
Minimize: Σ w_i × f_i(x)
```

**Constraint method:**
```
Minimize: f₁(x)
Subject to: f_i(x) ≤ ε_i for i = 2,...,k
```

## Exercises

1. **LCA Calculation:** Conduct lifecycle assessment
2. **Carbon Accounting:** Calculate carbon footprint
3. **Trade-off Analysis:** Compare material alternatives
4. **Circularity Design:** Optimize for circularity

## Case Studies

- Packaging material substitution
- Carbon footprint reduction
- Circular economy design
- Sustainable sourcing optimization
- Waste minimization projects
