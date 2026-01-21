---
title: "Diffusion, Penetration, and Skin Transport"
module: "Module 5"
week: 5
order: 5
description: "Skin as a layered diffusion medium, controlled delivery of actives"
---

# Module 5: Diffusion, Penetration, and Skin Transport

## Introduction

Understanding how active ingredients penetrate and diffuse through skin layers is crucial for effective cosmetic formulation. This module applies Fick's laws of diffusion to model skin transport and optimize ingredient delivery.

## Learning Objectives

- Model skin as a layered diffusion medium
- Apply Fick's laws to skin penetration
- Calculate diffusion coefficients
- Design controlled delivery systems
- Optimize active ingredient concentrations

## Key Equation: Fick's First Law

**Diffusion flux:**
```
J = -D × (dC/dx)
```

Where:
- **J** = diffusion flux (mol/m²·s)
- **D** = diffusion coefficient (m²/s)
- **dC/dx** = concentration gradient (mol/m⁴)

**Physical interpretation:**
- Flux is proportional to concentration gradient
- Negative sign indicates diffusion from high to low concentration
- Diffusion coefficient depends on molecule size, temperature, and medium

## Skin as a Layered Diffusion Medium

### Skin Structure

**Layers:**
1. **Stratum corneum** (outermost, barrier)
2. **Epidermis** (living cells)
3. **Dermis** (connective tissue)
4. **Subcutaneous** (fat layer)

### Mathematical Model

**Multi-layer diffusion:**
```
For each layer i:
  J_i = -D_i × (dC_i/dx)
  
Boundary conditions:
  C_0 = C_surface (applied concentration)
  C_n = C_target (target concentration in dermis)
```

**Effective diffusion coefficient:**
```
D_eff = 1 / Σ (L_i / D_i)
where L_i = thickness of layer i
```

## Application: Retinoids, Peptides, and Hydrators

### Retinoid Penetration

**Model parameters:**
- Molecular weight: ~300 Da
- Diffusion coefficient: ~10⁻¹² m²/s
- Target: Dermis (anti-aging)

**Optimization:**
```
Maximize: J_dermis
Subject to: C_surface ≤ C_max (irritation limit)
```

### Peptide Delivery

**Challenges:**
- Large molecular weight
- Low diffusion coefficient
- Rapid degradation

**Solution strategies:**
- Penetration enhancers
- Encapsulation
- Iontophoresis

**Mathematical model:**
```
J_peptide = D_peptide × (C_surface / L_effective)
where L_effective accounts for penetration enhancers
```

### Hydrator Penetration

**Small molecules (e.g., hyaluronic acid fragments):**
- High diffusion coefficient
- Rapid penetration
- Short residence time

**Optimization:**
```
Maximize: Residence_time × Concentration
Subject to: Penetration_rate ≥ R_min
```

## Controlled Delivery Systems

### Time-Release Formulation

**Mathematical model:**
```
C(t) = C_0 × (1 - e^(-k×t))
where:
  k = release rate constant
  t = time
```

**Optimization:**
- Sustained release: Lower k
- Rapid delivery: Higher k
- Balanced: Optimal k for target duration

## Exercises

1. **Diffusion Calculation**: Calculate flux through skin layers
2. **Penetration Optimization**: Design optimal delivery system
3. **Multi-Layer Model**: Model transport through all skin layers

## Case Studies

- Retinoid formulation optimization
- Peptide delivery systems
- Hydration product design
- Transdermal patch development
