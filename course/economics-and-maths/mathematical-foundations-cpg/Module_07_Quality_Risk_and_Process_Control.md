---
title: "Quality, Risk & Process Control"
module: "Module 7"
week: 7
order: 7
description: "Control variability and ensure compliance using statistical methods"
---

# Module 7: Quality, Risk & Process Control

## Introduction

Quality control in CPG requires statistical methods to manage variability, ensure compliance, and optimize processes. This module covers process capability, defect rates, Six Sigma metrics, and risk quantification.

## Learning Objectives

- Calculate process capability (Cp, Cpk)
- Quantify defect rates and DPMO
- Model underfill/overfill risk
- Optimize giveaway
- Apply normal distribution assumptions
- Calculate probability of spec violations

## Process Capability (Cp, Cpk)

### Process Capability Index (Cp)

**Definition:**
```
Cp = (USL - LSL) / (6σ)
where:
  USL = Upper Specification Limit
  LSL = Lower Specification Limit
  σ = process standard deviation
```

**Interpretation:**
- Cp < 1: Process not capable
- Cp = 1: Process barely capable (99.73% within spec)
- Cp > 1: Process capable
- Cp ≥ 1.33: Good capability
- Cp ≥ 1.67: Excellent capability

### Process Capability Index (Cpk)

**Accounts for process centering:**
```
Cpk = min[(USL - μ)/(3σ), (μ - LSL)/(3σ)]
where μ = process mean
```

**Relationship:**
```
Cpk ≤ Cp (always)
Cpk = Cp (when process is centered)
```

**Interpretation:**
- Cpk < 1: Process not capable
- Cpk ≥ 1.33: Capable process
- Cpk ≥ 2.0: Six Sigma level

### Capability Improvement

**Centering:**
```
Shift_mean_to = (USL + LSL) / 2
```

**Reducing variation:**
```
Required_σ = (USL - LSL) / (6 × Target_Cp)
```

## Defect Rates and Six Sigma Metrics

### Defect Rate Calculation

**Under normal distribution:**
```
P(Defect) = P(X < LSL) + P(X > USL)
P(Defect) = Φ((LSL - μ)/σ) + [1 - Φ((USL - μ)/σ)]
```

**Parts per million (PPM):**
```
PPM = P(Defect) × 1,000,000
```

### Defects Per Million Opportunities (DPMO)

**Definition:**
```
DPMO = (Number_of_defects / (Number_of_units × Opportunities_per_unit)) × 1,000,000
```

**Six Sigma target:**
```
DPMO_target = 3.4 (for Six Sigma)
```

**Sigma level:**
```
Sigma_level = f(DPMO)  (inverse lookup)
```

**Approximation:**
```
Sigma ≈ 0.8406 + √(29.37 - 2.221 × ln(DPMO))
```

### Yield Calculation

**First-pass yield:**
```
FPY = 1 - (DPMO / 1,000,000)
```

**Rolled throughput yield:**
```
RTY = Π(FPY_i) across all stages
```

## Underfill/Overfill Risk

### Fill Weight Distribution

**Normal distribution assumption:**
```
Fill_weight ~ N(μ, σ²)
```

**Underfill probability:**
```
P(Underfill) = P(Weight < Minimum_fill)
P(Underfill) = Φ((Minimum_fill - μ) / σ)
```

**Overfill probability:**
```
P(Overfill) = P(Weight > Maximum_fill)
P(Overfill) = 1 - Φ((Maximum_fill - μ) / σ)
```

### Regulatory Compliance

**FDA requirements (example):**
- Average fill ≥ Label claim
- Individual fills ≥ Minimum (typically 90% of label)

**Compliance probability:**
```
P(Compliant) = P(All_fills ≥ Minimum) × P(Average ≥ Label)
```

### Giveaway Optimization

**Expected giveaway:**
```
E[Giveaway] = E[Weight - Label] when Weight > Label
E[Giveaway] = ∫(w - Label) × f(w) dw  from Label to ∞
```

**Cost of giveaway:**
```
Cost = E[Giveaway] × Unit_cost × Production_volume
```

**Optimization:**
```
Minimize: Cost_underfill + Cost_giveaway
Subject to: Compliance_constraints
```

## Normal Distribution Assumptions

### Central Limit Theorem

**For sample means:**
```
X̄ ~ N(μ, σ²/n)
where n = sample size
```

**Application:**
- Process averages follow normal distribution
- Even if individual measurements don't

### Normality Testing

**Tests:**
- Shapiro-Wilk test
- Anderson-Darling test
- Kolmogorov-Smirnov test

**If non-normal:**
- Transform data (log, Box-Cox)
- Use non-parametric methods
- Use appropriate distribution

## Probability of Spec Violations

### Single Spec Limit

**Upper limit:**
```
P(Violation) = P(X > USL) = 1 - Φ((USL - μ)/σ)
```

**Lower limit:**
```
P(Violation) = P(X < LSL) = Φ((LSL - μ)/σ)
```

### Two-Sided Spec

**Total violation probability:**
```
P(Violation) = P(X < LSL) + P(X > USL)
```

**In-spec probability:**
```
P(In_spec) = Φ((USL - μ)/σ) - Φ((LSL - μ)/σ)
```

### Multiple Characteristics

**Joint probability:**
```
P(All_in_spec) = Π P(Characteristic_i in spec)
```

**If independent:**
```
P(All_in_spec) = P(X₁ in spec) × P(X₂ in spec) × ...
```

## Key Models

### DPMO Calculation

**From capability:**
```
DPMO = [1 - (Φ(3×Cpk) - Φ(-3×Cpk))] × 1,000,000
```

**From defect rate:**
```
DPMO = Defect_rate × 1,000,000
```

### Process Capability from DPMO

**Reverse calculation:**
```
Cpk = Φ⁻¹(1 - DPMO/2,000,000) / 3
```

### Optimal Target Setting

**Minimize total cost:**
```
Minimize: P(Underfill) × Cost_underfill + P(Overfill) × Cost_overfill
```

**Optimal mean:**
```
μ* = argmin[Cost_function(μ)]
```

## Exercises

1. **Capability Analysis:** Calculate Cp and Cpk from process data
2. **Defect Rate:** Calculate DPMO and sigma level
3. **Fill Optimization:** Optimize target fill to minimize total cost
4. **Risk Quantification:** Calculate probability of spec violations

## Case Studies

- Process capability improvement
- Six Sigma project implementation
- Fill weight optimization
- Quality risk assessment
- Compliance probability analysis
