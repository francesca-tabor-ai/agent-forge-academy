---
title: "Attention, Creativity & Human Constraints"
module: "Module 12"
week: 12
order: 12
description: "Model attention as a scarce resource"
---

# Module 12: Attention, Creativity & Human Constraints

## Introduction

Human attention is a scarce resource with cognitive limits. This module models wear-in, wear-out, frequency fatigue, and viewability to optimize reach and prevent overexposure.

## Learning Objectives

- Model wear-in and wear-out
- Understand frequency fatigue
- Calculate viewability geometry
- Apply optimal frequency curves
- Model attention thresholds
- Calculate viewability metrics
- Prevent overexposure
- Design mathematically efficient reach strategies

## Wear-In and Wear-Out

### Wear-In

**Definition:**
```
Initial exposure increases effectiveness
Learning effect
```

**Model:**
```
Effectiveness(frequency) = Max_effectiveness × (1 - exp(-k × frequency))
```

**Saturation:**
```
Effectiveness approaches maximum
Diminishing returns
```

### Wear-Out

**Definition:**
```
Excessive exposure decreases effectiveness
Fatigue effect
```

**Model:**
```
Effectiveness(frequency) = Max_effectiveness × exp(-λ × (frequency - optimal)^2)
```

**Optimal frequency:**
```
Effectiveness peaks at optimal_frequency
Decreases beyond optimal
```

### Combined Model

**Wear-in and wear-out:**
```
Effectiveness(f) = Max × (1 - exp(-k₁×f)) × exp(-k₂×(f - f_opt)²) for f > f_opt
```

**Optimal:**
```
f* = argmax Effectiveness(f)
```

## Frequency Fatigue

### Fatigue Model

**Definition:**
```
Response decreases with excessive frequency
```

**Mathematical:**
```
Response(f) = Base_response × Fatigue_factor(f)
```

**Fatigue factor:**
```
Fatigue_factor(f) = 1 / (1 + (f / f_threshold)^α)
where f_threshold = fatigue threshold
```

### Frequency Response Curve

**Shape:**
```
Low frequency: Increasing response (wear-in)
Optimal frequency: Maximum response
High frequency: Decreasing response (wear-out)
```

**Mathematical:**
```
Response(f) = a × f^b × exp(-c×f)
where b > 0, c > 0
```

### Optimal Frequency

**Calculation:**
```
f* = argmax Response(f)
dResponse/df = 0
```

**For exponential model:**
```
f* = b / c
```

## Viewability Geometry

### Viewability Definition

**Viewable:**
```
Ad visible for ≥ 50% of pixels for ≥ 1 second
```

**Viewability rate:**
```
VTR = Viewable_impressions / Total_impressions
```

### Geometric Factors

**Position:**
```
Above_fold: Higher viewability
Below_fold: Lower viewability
```

**Size:**
```
Larger_ads: Higher viewability
Smaller_ads: Lower viewability
```

**Scroll depth:**
```
Viewability = f(Scroll_position, Ad_position)
```

### Viewability Model

**Probability:**
```
P(Viewable) = f(Position, Size, Scroll_behavior, ...)
```

**Logistic:**
```
P(Viewable) = 1 / (1 + exp(-(β₀ + β₁×Position + β₂×Size + ...)))
```

## Key Models

### Optimal Frequency Curves

**Response curve:**
```
Response(f) = f(Position, Size, Creative, Frequency)
```

**Optimal:**
```
f* = argmax Response(f)
```

**Typical:**
```
f* = 3-7 exposures
Varies by:
- Product category
- Creative quality
- Audience
```

### Attention Thresholds

**Minimum threshold:**
```
f_min = Minimum frequency for awareness
```

**Optimal threshold:**
```
f_opt = Optimal frequency for response
```

**Maximum threshold:**
```
f_max = Maximum before fatigue
```

**Frequency range:**
```
Effective: f_min ≤ f ≤ f_max
Optimal: f = f_opt
```

### Viewability Metrics

**Viewability rate:**
```
VTR = Viewable / Total
```

**Average viewability:**
```
Avg_VTR = Σ VTR_i / n
```

**Viewable reach:**
```
Viewable_reach = Reach × VTR
```

**Effective frequency:**
```
Effective_frequency = Frequency × VTR
```

## Preventing Overexposure

### Frequency Capping

**Definition:**
```
Limit impressions per user
Prevent overexposure
```

**Mathematical:**
```
If Frequency_user > Cap:
  Do not show ad
```

**Optimization:**
```
Cap = f_opt (optimal frequency)
```

### Reach-Frequency Optimization

**Fixed impressions:**
```
Impressions = Reach × Frequency
```

**Optimization:**
```
Maximize: Effectiveness(Reach, Frequency)
Subject to: Impressions = Constant
Frequency ≤ f_max
```

**Trade-off:**
```
Higher_reach → Lower_frequency
Lower_reach → Higher_frequency
```

## Designing Efficient Reach Strategies

### Reach Curve

**Shape:**
```
Reach increases with impressions
Diminishing returns
Saturation
```

**Model:**
```
Reach = Max_reach × (1 - exp(-k × Impressions))
```

**Incremental reach:**
```
ΔReach = Reach(Impressions + Δ) - Reach(Impressions)
```

### Frequency Distribution

**Distribution:**
```
f_i = Frequency for user i
Distribution = f(f_i)
```

**Optimization:**
```
Target: Most users at f_opt
Minimize: Users at f < f_min or f > f_max
```

### Reach Strategy

**Objective:**
```
Maximize: Effective_reach
Effective_reach = Users with f_min ≤ f ≤ f_max
```

**Constraints:**
```
Budget
Frequency_cap
Reach_target
```

## Exercises

1. **Frequency Response:** Model wear-in and wear-out
2. **Optimal Frequency:** Calculate optimal frequency
3. **Viewability:** Model and optimize viewability
4. **Reach Strategy:** Design efficient reach plan

## Case Studies

- Frequency optimization
- Viewability improvement
- Reach-frequency planning
- Overexposure prevention
- Attention-based optimization
