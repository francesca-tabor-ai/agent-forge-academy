---
title: "Packaging Geometry & Physical Constraints"
module: "Module 6"
week: 6
order: 6
description: "Understand how geometry and physics affect cost, quality, and sustainability"
---

# Module 6: Packaging Geometry & Physical Constraints

## Introduction

Packaging design involves complex trade-offs between cost, functionality, sustainability, and consumer appeal. This module applies geometric and physical principles to optimize packaging efficiency, shelf life, and environmental impact.

## Learning Objectives

- Calculate package volume vs product volume ratios
- Optimize palletization and cube efficiency
- Model heat and mass transfer in packaging
- Understand barrier properties and shelf life
- Design packaging with mathematically grounded efficiency

## Package Volume vs Product Volume

### Volume Efficiency

**Package efficiency:**
```
Efficiency = Product_volume / Package_volume
```

**Void space:**
```
Void_ratio = 1 - Efficiency
Void_volume = Package_volume - Product_volume
```

**Cost impact:**
```
Cost_per_unit_volume = Package_cost / Product_volume
```

### Geometric Optimization

**Rectangular package:**
```
Volume = Length × Width × Height
Surface_area = 2(LW + LH + WH)
```

**Optimal dimensions (minimum surface area for fixed volume):**
```
L = W = H = V^(1/3)  (cube)
```

**Cylindrical package:**
```
Volume = π × r² × h
Surface_area = 2πr² + 2πrh
```

**Optimal ratio:**
```
h/r = 2  (height = 2×radius)
```

## Palletization and Cube Efficiency

### Pallet Loading

**Pallet dimensions:**
```
Pallet_area = Length_pallet × Width_pallet
```

**Package arrangement:**
```
N_length = ⌊Length_pallet / Length_package⌋
N_width = ⌊Width_pallet / Width_package⌋
N_per_layer = N_length × N_width
```

**Stacking height:**
```
N_layers = ⌊Height_max / Height_package⌋
```

**Total packages per pallet:**
```
Total = N_per_layer × N_layers
```

### Cube Efficiency

**Cube utilization:**
```
Cube_efficiency = (Total_package_volume) / (Pallet_volume)
```

**Transportation cost:**
```
Cost_per_unit = Transportation_cost / (Cube_efficiency × Units_per_pallet)
```

**Optimization:**
```
Maximize: Cube_efficiency
Subject to: Package_constraints, Stacking_limits
```

## Heat and Mass Transfer in Packaging

### Heat Diffusion

**Fourier's law:**
```
q = -k × (dT/dx)
where:
  q = heat flux
  k = thermal conductivity
  dT/dx = temperature gradient
```

**Heat diffusion equation:**
```
∂T/∂t = α × ∇²T
where α = k/(ρ×c_p) = thermal diffusivity
```

**Time scale:**
```
t_diffusion ≈ L² / α
where L = characteristic length
```

**Application:**
- Temperature control during transport
- Shelf life under temperature variations
- Insulation requirements

### Mass Transfer

**Fick's law:**
```
J = -D × (dC/dx)
where:
  J = mass flux
  D = diffusion coefficient
  dC/dx = concentration gradient
```

**Moisture transmission:**
```
MVTR = (D × A × ΔP) / L
where:
  MVTR = Moisture Vapor Transmission Rate
  A = area
  ΔP = vapor pressure difference
  L = thickness
```

**Oxygen transmission:**
```
OTR = (D_oxygen × A × ΔP_oxygen) / L
```

## Barrier Properties and Shelf Life

### Barrier Effectiveness

**Transmission rate:**
```
TR = (D × S × A × ΔP) / L
where:
  D = diffusion coefficient
  S = solubility
  A = area
  ΔP = pressure difference
  L = thickness
```

**Barrier improvement:**
```
TR_new = TR_old × (L_old / L_new)
```

### Shelf Life Modeling

**Moisture gain:**
```
Moisture(t) = Moisture_0 + (MVTR × t × A) / (Product_mass)
```

**Oxygen exposure:**
```
Oxygen_ingress(t) = (OTR × t × A) / Volume
```

**Shelf life:**
```
t_shelf = (Moisture_max - Moisture_0) × Product_mass / (MVTR × A)
```

## Key Models

### Packing Density

**Sphere packing:**
- Simple cubic: 52.4%
- Body-centered cubic: 68.0%
- Face-centered cubic: 74.0%
- Hexagonal close-packed: 74.0%

**Rectangular packing:**
```
Density = Product_volume / Container_volume
```

### Heat Diffusion Time Scales

**Characteristic time:**
```
τ = L² / (4α)
```

**Temperature response:**
```
T(t) = T_ambient + (T_initial - T_ambient) × exp(-t/τ)
```

### Gas and Moisture Transmission

**Steady-state flux:**
```
J = (D × S × ΔP) / L
```

**Time to reach critical level:**
```
t_critical = (Critical_level × Volume) / (J × Area)
```

## Exercises

1. **Volume Optimization:** Design package with minimum material
2. **Palletization:** Optimize package dimensions for cube efficiency
3. **Barrier Calculation:** Calculate required barrier thickness for shelf life
4. **Heat Transfer:** Model temperature changes during transport

## Case Studies

- Packaging redesign for cost reduction
- Sustainable packaging optimization
- Shelf life extension through barrier design
- Palletization efficiency improvement
- Temperature-sensitive product packaging
