---
title: "Privacy, Measurement Limits & Robustness"
module: "Module 13"
week: 13
order: 13
description: "Operate under regulatory and data constraints"
---

# Module 13: Privacy, Measurement Limits & Robustness

## Introduction

Privacy regulations and data limitations constrain advertising measurement. This module covers aggregation limits, privacy-preserving measurement, and operating under signal loss.

## Learning Objectives

- Understand aggregation limits
- Apply privacy-preserving measurement
- Model signal loss
- Use k-anonymity
- Apply differential privacy
- Design measurement systems under privacy constraints
- Understand trade-offs between accuracy and safety

## Aggregation Limits

### Minimum Aggregation

**k-anonymity:**
```
Each group has ≥ k individuals
Cannot identify individuals
```

**Mathematical:**
```
|Group_i| ≥ k for all groups i
```

**Trade-off:**
```
Higher k → More privacy, Less granularity
Lower k → Less privacy, More granularity
```

### Aggregation Impact

**Data loss:**
```
Aggregating loses individual-level detail
```

**Measurement impact:**
```
Less precise attribution
Less granular optimization
```

**Mitigation:**
```
Use aggregated models
Cohort-level analysis
```

## Privacy-Preserving Measurement

### Differential Privacy

**Definition:**
```
Adding/removing one individual changes output by ≤ exp(ε)
```

**Mathematical:**
```
P(Output | Database) ≤ exp(ε) × P(Output | Database')
where Database' differs by one record
```

**Privacy parameter:**
```
ε = privacy_budget
Lower ε = More privacy
Higher ε = Less privacy, More accuracy
```

### Laplace Mechanism

**Add noise:**
```
Noisy_output = True_output + Laplace(0, Δ/ε)
where Δ = sensitivity
```

**Sensitivity:**
```
Δ = max |f(D) - f(D')| over adjacent databases
```

**Privacy guarantee:**
```
ε-differential privacy
```

### Gaussian Mechanism

**Add noise:**
```
Noisy_output = True_output + N(0, σ²)
where σ = √(2×ln(1.25/δ)) × Δ / ε
```

**Privacy guarantee:**
```
(ε, δ)-differential privacy
```

## Signal Loss

### Measurement Degradation

**Signal loss:**
```
Measurement_quality = f(Privacy_level, Aggregation_level)
```

**Trade-off:**
```
More privacy → Less signal
Less privacy → More signal
```

**Mathematical:**
```
Signal_to_noise_ratio = Signal / (Noise + Privacy_noise)
```

### Attribution Loss

**Individual-level:**
```
Can attribute to individual
High precision
```

**Aggregated:**
```
Can only attribute to group
Lower precision
```

**Impact:**
```
Less accurate attribution
Less precise optimization
```

### Optimization Under Signal Loss

**Robust optimization:**
```
Maximize: E[Revenue] (accounting for uncertainty)
Subject to: Privacy_constraints
```

**Uncertainty:**
```
Higher uncertainty → More conservative
Lower uncertainty → More aggressive
```

## Key Models

### k-Anonymity

**Definition:**
```
Each equivalence class has ≥ k records
```

**Equivalence class:**
```
Records with same quasi-identifiers
```

**Quasi-identifiers:**
```
Attributes that could identify individuals
Age, Gender, Location, ...
```

**Generalization:**
```
Generalize attributes to achieve k-anonymity
Age: 25 → [20-30]
Location: City → State
```

### Differential Privacy

**Composition:**
```
Multiple queries: ε_total = Σ ε_i
```

**Post-processing:**
```
Differentially private output remains private
After any post-processing
```

**Group privacy:**
```
k individuals: ε_group = k × ε_individual
```

## Designing Measurement Systems Under Privacy Constraints

### Privacy Budget

**Allocation:**
```
Total_budget = ε_total
Allocate across queries
```

**Optimization:**
```
Maximize: Information_gain
Subject to: ε_total ≤ Budget
```

### Measurement Design

**Aggregation level:**
```
Choose aggregation to satisfy privacy
Minimize information loss
```

**Noise addition:**
```
Add minimum noise for privacy
Maximize accuracy
```

**Hybrid:**
```
Combine aggregated and noisy data
Balance privacy and accuracy
```

## Trade-offs Between Accuracy and Safety

### Privacy-Accuracy Trade-off

**More privacy:**
```
Higher aggregation
More noise
Lower accuracy
```

**More accuracy:**
```
Less aggregation
Less noise
Lower privacy
```

**Pareto frontier:**
```
Set of optimal trade-off points
```

### Risk Assessment

**Privacy risk:**
```
P(Re-identification)
P(Privacy_breach)
```

**Accuracy risk:**
```
Measurement_error
Optimization_error
```

**Balance:**
```
Minimize: Privacy_risk + Accuracy_risk
```

### Robustness

**Robust to:**
```
Privacy constraints
Data limitations
Measurement errors
```

**Design:**
```
Conservative estimates
Uncertainty quantification
Sensitivity analysis
```

## Exercises

1. **k-Anonymity:** Achieve k-anonymity through generalization
2. **Differential Privacy:** Apply differential privacy mechanism
3. **Signal Loss:** Quantify impact of privacy on measurement
4. **Trade-offs:** Optimize privacy-accuracy trade-off

## Case Studies

- Privacy-preserving attribution
- Measurement under GDPR
- Differential privacy implementation
- Aggregation strategies
- Privacy-accuracy optimization
