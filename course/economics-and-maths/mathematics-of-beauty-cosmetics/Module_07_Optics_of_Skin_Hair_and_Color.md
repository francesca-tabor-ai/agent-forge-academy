---
title: "Optics of Skin, Hair, and Color"
module: "Module 7"
week: 7
order: 7
description: "Reflection, absorption, and scattering, skin reflectance and hair shine"
---

# Module 7: Optics of Skin, Hair, and Color

## Introduction

The visual appearance of skin and hair results from complex interactions between light and matter. This module applies optical physics to understand and predict these interactions, enabling better product design and virtual try-on technologies.

## Learning Objectives

- Model light interaction with skin and hair
- Calculate reflectance and absorption
- Apply BRDF (Bidirectional Reflectance Distribution Function) models
- Design virtual try-on systems
- Optimize shine and gloss measurements

## Models

### BRDF (Bidirectional Reflectance Distribution Function)

**Definition:**
```
BRDF(θ_i, φ_i, θ_r, φ_r) = dL_r / (L_i × cos(θ_i) × dω_i)
```

Where:
- **θ_i, φ_i** = incident light direction
- **θ_r, φ_r** = reflected light direction
- **L_i** = incident radiance
- **L_r** = reflected radiance
- **dω_i** = solid angle

**Physical interpretation:**
- Describes how light reflects from a surface
- Depends on viewing and lighting angles
- Captures both specular and diffuse reflection

### Refractive Index Models

**Snell's law:**
```
n₁ × sin(θ₁) = n₂ × sin(θ₂)
```

**Skin layers:**
- Stratum corneum: n ≈ 1.5
- Epidermis: n ≈ 1.4
- Dermis: n ≈ 1.4

**Hair:**
- Cuticle: n ≈ 1.55
- Cortex: n ≈ 1.55

## Applications

### Virtual Try-On Technologies

**Mathematical pipeline:**
1. **3D face model**: Geometry reconstruction
2. **Texture mapping**: Apply product properties
3. **Lighting simulation**: Calculate BRDF
4. **Rendering**: Generate realistic image

**Key equations:**
```
Final_color = Ambient + Diffuse + Specular

Ambient = k_a × I_a
Diffuse = k_d × I_d × max(0, N·L)
Specular = k_s × I_s × (R·V)^n
```

Where:
- **k_a, k_d, k_s** = material coefficients
- **I_a, I_d, I_s** = light intensities
- **N** = surface normal
- **L** = light direction
- **R** = reflection vector
- **V** = view direction
- **n** = shininess exponent

### Shine and Gloss Measurement

**Gloss measurement:**
```
Gloss = (Reflected_light / Incident_light) × 100
```

**Specular reflection:**
```
R_specular = [(n₂ - n₁) / (n₂ + n₁)]²
```

**Hair shine model:**
```
Shine = f(cuticle_condition, oil_content, light_angle)
```

## Skin Reflectance

### Melanin Absorption

**Absorption coefficient:**
```
μ_a(λ) = μ_a_melanin(λ) × C_melanin + μ_a_hemoglobin(λ) × C_hemoglobin
```

Where:
- **λ** = wavelength
- **C** = concentration

### Scattering in Skin

**Rayleigh scattering** (small particles):
```
σ_scatter ∝ 1 / λ⁴
```

**Mie scattering** (larger particles):
```
σ_scatter ∝ 1 / λ²
```

## Exercises

1. **BRDF Calculation**: Model skin reflectance using BRDF
2. **Virtual Try-On**: Design rendering pipeline
3. **Gloss Optimization**: Calculate optimal shine parameters

## Case Studies

- Augmented reality makeup apps
- Hair color simulation
- Skin analysis systems
- Product visualization tools
