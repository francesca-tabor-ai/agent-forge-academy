---
title: "Electromagnetics & Radio Propagation"
module: "Module 3"
week: 3
order: 3
description: "Model how signals move through physical space"
---

# Module 3: Electromagnetics & Radio Propagation

## Introduction

Radio propagation determines coverage and signal strength. This module covers free-space propagation, path loss, fading, and antenna geometry.

## Learning Objectives

- Model free-space propagation
- Calculate path loss and fading
- Understand antennas and geometry
- Apply inverse-square laws
- Use log-distance models
- Model random variables (shadowing, fading)
- Predict coverage and received power
- Understand why cells have irregular shapes

## Free-Space Propagation

### Free-Space Path Loss

**Formula:**
```
PL = (4πd/λ)²
```

**In dB:**
```
PL_dB = 20×log₁₀(4πd/λ)
PL_dB = 20×log₁₀(d) + 20×log₁₀(f) + 32.44
where:
  d = distance (km)
  f = frequency (MHz)
```

**Inverse-square law:**
```
Power ∝ 1/d²
```

**Received power:**
```
P_r = P_t × G_t × G_r × (λ/(4πd))²
```

## Path Loss and Fading

### Log-Distance Path Loss

**Model:**
```
PL(d) = PL(d₀) + 10×n×log₁₀(d/d₀) + X_σ
where:
  n = path_loss_exponent
  X_σ ~ N(0, σ²) = shadowing
```

**Path loss exponent:**
```
n = 2: Free_space
n = 2-4: Urban
n = 4-6: Dense_urban
```

### Shadowing

**Definition:**
```
Slow_fading
Large_scale_variation
```

**Model:**
```
X_σ ~ N(0, σ²)
σ = 6-12 dB typical
```

**Impact:**
```
Signal_variation around mean
Coverage_irregularity
```

### Multipath Fading

**Definition:**
```
Fast_fading
Small_scale_variation
```

**Rayleigh fading:**
```
|h| ~ Rayleigh(σ)
For NLOS
```

**Rician fading:**
```
|h| ~ Rician(K, σ)
For LOS + NLOS
```

## Antennas and Geometry

### Antenna Gain

**Definition:**
```
G = 4π × A_effective / λ²
```

**Directivity:**
```
D = Maximum_power_density / Average_power_density
```

**Efficiency:**
```
G = η × D
where η = efficiency
```

### Antenna Patterns

**Omnidirectional:**
```
G(θ) = Constant
```

**Directional:**
```
G(θ) = f(θ)
Higher_gain in main_lobe
```

**Beamwidth:**
```
Angular_width of main_lobe
Narrower_beamwidth → Higher_gain
```

## Core Mathematics

### Inverse-Square Laws

**Free space:**
```
Power ∝ 1/d²
```

**General:**
```
Power ∝ 1/d^n
where n = path_loss_exponent
```

**Mathematical:**
```
P_r = P_t × (d₀/d)^n
```

### Log-Distance Models

**Path loss:**
```
PL(dB) = PL₀ + 10×n×log₁₀(d/d₀) + X_σ
```

**Received power:**
```
P_r(dBm) = P_t(dBm) + G_t(dBi) + G_r(dBi) - PL(dB)
```

**Coverage:**
```
P_r ≥ P_min for coverage
```

### Random Variables

**Shadowing:**
```
X_σ ~ N(0, σ²)
```

**Fading:**
```
|h| ~ Rayleigh(σ) or Rician(K, σ)
```

**Combined:**
```
P_r = P_mean × |h|² × 10^(X_σ/10)
```

## Learning Outcomes

### Predicting Coverage and Received Power

**Received power:**
```
P_r = P_t + G_t + G_r - PL
```

**Coverage:**
```
P_r ≥ P_min
Solve for maximum_distance
```

**Cell shape:**
```
Irregular due to shadowing
Not perfect circles
```

### Understanding Irregular Cell Shapes

**Factors:**
```
Shadowing: Random_variation
Terrain: Hills, buildings
Antenna_pattern: Directional
```

**Modeling:**
```
Stochastic_coverage
Monte_Carlo_simulation
```

**Planning:**
```
Account for irregularity
Safety_margins
Multiple_sites
```

## Exercises

1. **Path Loss:** Calculate path loss for different scenarios
2. **Coverage:** Predict coverage area
3. **Fading:** Model fading and its impact
4. **Antennas:** Analyze antenna gain and patterns

## Case Studies

- 5G coverage planning
- Urban propagation modeling
- Indoor propagation
- Antenna deployment
- Cell site optimization
