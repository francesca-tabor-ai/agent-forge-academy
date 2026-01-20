---
title: "Psychology and Perceptual Mathematics"
module: "Module 9"
week: 9
order: 9
description: "Psychophysics and sensory thresholds, visual, tactile, and olfactory perception"
---

# Module 9: Psychology and Perceptual Mathematics

## Introduction

Human perception of beauty products follows mathematical laws. This module explores psychophysical relationships that quantify how we perceive visual, tactile, and olfactory stimuli, enabling data-driven product design.

## Learning Objectives

- Apply psychophysical laws to perception
- Calculate sensory thresholds
- Model visual perception mathematically
- Quantify tactile sensations
- Design fragrance intensity profiles

## Key Law: Weber-Fechner Law

**Perceived intensity:**
```
S = k × ln(I / I₀)
```

Where:
- **S** = perceived sensation
- **k** = constant
- **I** = stimulus intensity
- **I₀** = threshold intensity

**Alternative (Stevens' Power Law):**
```
S = k × I^n
where n depends on sensory modality
```

## Psychophysics and Sensory Thresholds

### Absolute Threshold

**Minimum detectable intensity:**
```
I_absolute = I₀
```

**Detection probability:**
```
P(detect) = 1 / (1 + e^(-(I - I₀)/σ))
```

### Difference Threshold (Just Noticeable Difference)

**Weber's law:**
```
ΔI / I = constant (Weber fraction)
```

**Typical values:**
- Brightness: ~8%
- Weight: ~2%
- Sound intensity: ~10%

## Applications

### Pigment Saturation

**Visual perception model:**
```
Perceived_saturation = f(chroma, lightness, hue)
```

**Mathematical relationship:**
```
Saturation = Chroma / Lightness
```

**Optimization:**
```
Maximize: Perceived_impact
Subject to: Saturation ≤ S_max (avoid garishness)
```

### Fragrance Intensity Design

**Olfactory perception:**
```
Perceived_intensity = k × C^α
where:
  C = concentration
  α ≈ 0.6 (Stevens' exponent for smell)
```

**Layering strategy:**
```
Total_intensity = Σ (k_i × C_i^α_i)
```

**Temporal profile:**
```
I(t) = I_top × e^(-k_top×t) + I_mid × e^(-k_mid×t) + I_base × e^(-k_base×t)
```

## Visual Perception

### Contrast Sensitivity

**Contrast threshold:**
```
C_threshold = ΔL / L_background
```

**Spatial frequency response:**
```
CSF(f) = A × f × e^(-f/f_peak)
where f = spatial frequency
```

### Color Perception

**Metamerism:**
- Different spectra perceived as same color
- Mathematical condition: Equal tristimulus values

**Color constancy:**
- Perceived color despite lighting changes
- Modeled using adaptation functions

## Tactile Perception

### Texture Perception

**Roughness model:**
```
Roughness = f(spatial_frequency, amplitude)
```

**Mathematical relationship:**
```
R ∝ A × f^β
where β ≈ 1.5
```

### Viscosity Perception

**Perceived thickness:**
```
Thickness = k × η^α
where:
  η = viscosity
  α ≈ 0.4
```

## Exercises

1. **Threshold Calculation**: Calculate JND for color differences
2. **Fragrance Modeling**: Design temporal intensity profile
3. **Perception Optimization**: Optimize product for maximum perceived impact

## Case Studies

- Lipstick color perception
- Fragrance development
- Texture optimization
- Product packaging design
- Sensory marketing
