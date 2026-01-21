---
title: "Geometry, Space, and Urban Form"
module: "Module 2"
week: 2
order: 2
description: "Quantify how space constraints shape housing outcomes"
---

# Module 2: Geometry, Space, and Urban Form

## Introduction

Spatial constraints fundamentally shape housing development. This module applies geometric and optimization principles to understand how zoning, density limits, and spatial efficiency affect housing supply and affordability.

## Learning Objectives

- Calculate Floor Area Ratio (FAR) and density limits
- Optimize site development under zoning constraints
- Distinguish net vs gross area efficiency
- Model spatial packing and land-use tradeoffs
- Apply geometry, ratios, and constrained optimization

## Floor Area Ratio (FAR) and Density Limits

### Floor Area Ratio (FAR)

**Definition:**
```
FAR = Total_building_floor_area / Lot_area
```

**Mathematical relationship:**
```
FAR = (Number_of_floors × Floor_area_per_story) / Lot_area
```

**Maximum building area:**
```
Max_building_area = FAR × Lot_area
```

**Height constraint:**
```
If FAR_max = 2.0 and Lot = 10,000 sq ft
Max_area = 20,000 sq ft
If Floor_area_per_story = 5,000 sq ft
Max_floors = 20,000 / 5,000 = 4 floors
```

### Density Calculations

**Units per acre:**
```
Density = Number_of_units / Lot_area_in_acres
```

**Relationship to FAR:**
```
Density = FAR × Lot_area / Average_unit_size
```

**Maximum density:**
```
Max_density = FAR_max × Lot_area / Min_unit_size
```

### Zoning Constraints

**Multiple constraints:**
```
FAR ≤ FAR_max
Height ≤ Height_max
Setback ≥ Setback_min
Lot_coverage ≤ Coverage_max
```

**Feasible region:**
```
Feasible = {Designs satisfying all constraints}
```

## Site Optimization Under Zoning Constraints

### Optimization Problem

**Objective:**
```
Maximize: Developable_area (or Profit)
```

**Decision variables:**
- Building height
- Number of units
- Unit sizes
- Layout configuration

**Constraints:**
```
FAR ≤ FAR_max
Height ≤ Height_max
Setback ≥ Setback_min
Lot_coverage ≤ Coverage_max
Parking ≥ Parking_required
```

### Mathematical Formulation

**Linear programming (if linear):**
```
Maximize: cᵀx
Subject to:
  Ax ≤ b  (constraints)
  x ≥ 0
```

**Nonlinear (typical case):**
```
Maximize: f(x)
Subject to:
  g_i(x) ≤ 0  for all constraints i
```

**Example:**
```
Maximize: Number_of_units × Unit_value - Construction_cost
Subject to:
  FAR ≤ 2.0
  Height ≤ 50 feet
  Setback ≥ 10 feet
  Parking ≥ 1.5 spaces per unit
```

### Constrained Optimization Methods

**Lagrangian:**
```
L = Objective - Σ(λ_i × Constraint_i)
```

**KKT conditions:**
```
∇L = 0  (stationarity)
Constraint_i ≤ 0  (primal feasibility)
λ_i ≥ 0  (dual feasibility)
λ_i × Constraint_i = 0  (complementary slackness)
```

## Net vs Gross Area Efficiency

### Area Definitions

**Gross area:**
```
Gross_area = Total_building_area (including walls, corridors, mechanical)
```

**Net area:**
```
Net_area = Usable_area (excluding common areas, walls)
```

**Efficiency ratio:**
```
Efficiency = Net_area / Gross_area
```

**Typical values:**
- Residential: 75-85%
- Office: 80-90%
- Retail: 90-95%

### Mathematical Relationships

**Net rentable area:**
```
NRA = Gross_area × Efficiency - Common_areas
```

**Revenue calculation:**
```
Revenue = NRA × Rent_per_sqft
```

**Cost per net area:**
```
Cost_per_NRA = Total_cost / NRA
```

### Optimization

**Maximize efficiency:**
```
Maximize: Efficiency = f(Layout, Unit_sizes, Common_areas)
Subject to: Functional_constraints
```

**Trade-off:**
- Higher efficiency → Lower common areas → Lower amenities
- Lower efficiency → More common areas → Higher amenities

## Spatial Packing and Land-Use Tradeoffs

### Packing Problems

**2D packing:**
```
Maximize: Units_fitted
Subject to: Spatial_constraints
```

**3D packing:**
```
Maximize: Volume_utilization
Subject to: Height_constraints
```

### Density Tradeoffs

**High density:**
- More units per acre
- Lower cost per unit
- Less open space
- More infrastructure demand

**Low density:**
- Fewer units per acre
- Higher cost per unit
- More open space
- Less infrastructure demand

### Mathematical Model

**Objective function:**
```
Maximize: w₁×Units + w₂×Open_space - w₃×Infrastructure_cost
```

**Constraints:**
```
Units ≤ Density_max × Lot_area
Open_space ≥ Open_space_min
Infrastructure_capacity ≥ Demand
```

**Pareto frontier:**
- Set of optimal trade-off points
- Cannot improve one objective without worsening another

## Key Math: Geometry and Ratios

### Geometric Calculations

**Rectangular lot:**
```
Area = Length × Width
Perimeter = 2 × (Length + Width)
```

**Irregular lot:**
```
Area = ∫∫ dA  (double integral)
```

**Building footprint:**
```
Footprint = Lot_area - Setback_area
Footprint = Length × Width - 2×Setback×(Length + Width) + 4×Setback²
```

### Ratio Analysis

**Coverage ratio:**
```
Coverage = Building_footprint / Lot_area
```

**Open space ratio:**
```
Open_space_ratio = Open_space / Lot_area
```

**Relationship:**
```
Coverage + Open_space_ratio + Setback_area_ratio = 1
```

### Constrained Optimization

**Gradient descent:**
```
x_{k+1} = x_k - α × ∇f(x_k)
```

**Projected gradient:**
```
x_{k+1} = Proj(x_k - α × ∇f(x_k))
where Proj projects onto feasible region
```

## Exercises

1. **FAR Calculation:** Calculate maximum developable area
2. **Site Optimization:** Optimize building design under constraints
3. **Efficiency Analysis:** Calculate and optimize efficiency ratios
4. **Packing Problem:** Maximize units in given space

## Case Studies

- High-density development optimization
- Zoning constraint impact analysis
- Efficiency improvement projects
- Land-use tradeoff analysis
- Urban infill development
