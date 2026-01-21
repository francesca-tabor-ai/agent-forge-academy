---
title: "Color Science and Shade Matching"
module: "Module 8"
week: 8
order: 8
description: "RGB, CMYK, LAB color spaces, undertone detection and shade expansion"
---

# Module 8: Color Science and Shade Matching

## Introduction

Accurate color representation and matching is fundamental to cosmetic product development. This module explores color spaces, conversion mathematics, and algorithms for precise shade matching and expansion.

## Learning Objectives

- Understand RGB, CMYK, and LAB color spaces
- Perform color space conversions
- Detect skin undertones mathematically
- Design shade matching algorithms
- Create shade expansion strategies

## Color Spaces

### RGB (Red, Green, Blue)

**Additive color model:**
```
Color = R×Red + G×Green + B×Blue
where R, G, B ∈ [0, 255]
```

**Normalized:**
```
r = R/255, g = G/255, b = B/255
```

### CMYK (Cyan, Magenta, Yellow, Key/Black)

**Subtractive color model:**
```
C = 1 - r
M = 1 - g
Y = 1 - b
K = min(C, M, Y)
```

### LAB Color Space

**Perceptually uniform color space:**
- **L***: Lightness (0-100)
- **a***: Green-red axis (-128 to 127)
- **b***: Blue-yellow axis (-128 to 127)

**Advantages:**
- Perceptually uniform (equal distances = equal perceived differences)
- Device-independent
- Better for color matching

## Tools

### Color Conversion Matrices

**RGB to LAB (via XYZ):**

**Step 1: RGB to XYZ**
```
[X]   [0.4124  0.3576  0.1805] [R]
[Y] = [0.2126  0.7152  0.0722] [G]
[Z]   [0.0193  0.1192  0.9505] [B]
```

**Step 2: XYZ to LAB**
```
L* = 116 × f(Y/Y_n) - 16
a* = 500 × [f(X/X_n) - f(Y/Y_n)]
b* = 200 × [f(Y/Y_n) - f(Z/Z_n)]

where f(t) = t^(1/3) if t > 0.008856
      f(t) = 7.787×t + 16/116 otherwise
```

### Distance Metrics in LAB Space

**Euclidean distance (ΔE):**
```
ΔE = √[(ΔL*)² + (Δa*)² + (Δb*)²]
```

**Perceptual thresholds:**
- ΔE < 1: Imperceptible difference
- ΔE < 3: Slight difference
- ΔE < 6: Noticeable difference
- ΔE > 6: Significant difference

**CIE94 (improved):**
```
ΔE_94 = √[(ΔL*/S_L)² + (ΔC*/S_C)² + (ΔH*/S_H)²]
```

## Undertone Detection and Shade Expansion

### Undertone Detection

**Mathematical approach:**
1. Extract skin color in LAB space
2. Analyze a* and b* values
3. Classify undertone:
   - **Cool**: Higher a* (more red)
   - **Warm**: Higher b* (more yellow)
   - **Neutral**: Balanced a* and b*

**Algorithm:**
```
if a* > threshold_warm:
    undertone = "warm"
elif b* > threshold_cool:
    undertone = "cool"
else:
    undertone = "neutral"
```

### Shade Expansion

**Strategy:**
1. Identify gaps in current shade range
2. Calculate target LAB values
3. Formulate to match target
4. Validate perceptual match

**Mathematical model:**
```
Target_shade = Base_shade + ΔLAB
where ΔLAB fills perceptual gap
```

**Optimization:**
```
Minimize: ΔE(target, actual)
Subject to:
  - Formulation constraints
  - Cost limits
  - Manufacturing feasibility
```

## Exercises

1. **Color Conversion**: Convert RGB to LAB color space
2. **Shade Matching**: Calculate ΔE between shades
3. **Undertone Analysis**: Classify skin undertones from images

## Applications

- Foundation shade matching
- Lipstick color development
- Virtual try-on accuracy
- Shade range optimization
- Color consistency in production
