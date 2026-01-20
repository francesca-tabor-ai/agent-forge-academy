---
title: "Experimentation & Causal Inference"
module: "Module 4"
week: 4
order: 4
description: "Separate correlation from true advertising impact"
---

# Module 4: Experimentation & Causal Inference

## Introduction

Measuring true advertising impact requires separating correlation from causation. This module covers counterfactual reasoning, randomized experiments, bias correction, and causal inference methods.

## Learning Objectives

- Apply counterfactual reasoning
- Design randomized experiments
- Distinguish observational vs experimental data
- Identify bias and confounding
- Design A/B tests
- Apply difference-in-differences
- Calculate incremental lift
- Use propensity scores
- Design statistically valid experiments
- Measure true incremental impact

## Counterfactual Reasoning

### Potential Outcomes

**Definition:**
```
Y(1) = Outcome if treated (exposed to ad)
Y(0) = Outcome if control (not exposed)
```

**Observed:**
```
Y = T × Y(1) + (1 - T) × Y(0)
where T = treatment indicator
```

**Unobserved:**
```
Cannot observe both Y(1) and Y(0) for same unit
```

### Average Treatment Effect (ATE)

**Definition:**
```
ATE = E[Y(1) - Y(0)]
```

**Estimation:**
```
ATE_hat = E[Y | T=1] - E[Y | T=0]
```

**Requirement:**
```
Randomization or unconfoundedness
```

## Randomized Experiments vs Observational Data

### Randomized Experiments

**Design:**
```
Randomly assign units to treatment or control
T ~ Bernoulli(0.5)
```

**Advantages:**
- Eliminates confounding
- Unbiased ATE estimation
- Gold standard

**Challenges:**
- May not be feasible
- External validity
- Cost and time

### Observational Data

**Definition:**
```
No randomization
Treatment assignment depends on characteristics
```

**Problem:**
```
Confounding: T correlated with unobserved factors affecting Y
```

**Solution:**
- Control variables
- Instrumental variables
- Difference-in-differences
- Propensity scores

## Bias and Confounding

### Selection Bias

**Problem:**
```
E[Y(1) | T=1] ≠ E[Y(1) | T=0]
Treated and control groups differ
```

**Example:**
```
Ads shown to engaged users
Engaged users more likely to convert anyway
Overestimate ad effect
```

### Confounding

**Definition:**
```
Common cause of T and Y
Creates spurious correlation
```

**Mathematical:**
```
Y = f(T, Confounder)
T = g(Confounder)
Correlation(T, Y) ≠ Causal_effect
```

### Solutions

**Randomization:**
```
Breaks correlation between T and confounders
```

**Control:**
```
Include confounders in model
Y = f(T, Confounders)
```

## Key Models

### A/B Testing

**Design:**
```
Randomly split users
A = Control (no ad or old ad)
B = Treatment (new ad)
```

**Analysis:**
```
ATE = E[Y | B] - E[Y | A]
```

**Statistical test:**
```
H₀: ATE = 0
H₁: ATE ≠ 0
t = ATE / SE(ATE)
```

**Sample size:**
```
n = 2 × (z_α/2 + z_β)² × σ² / Effect_size²
```

### Difference-in-Differences

**Model:**
```
Y_it = α + β×Treatment_i + γ×Time_t + δ×(Treatment_i × Time_t) + ε_it
```

**Treatment effect:**
```
δ = (Y_treatment,after - Y_treatment,before) - (Y_control,after - Y_control,before)
```

**Assumption:**
```
Parallel trends: Control group represents counterfactual
```

### Incremental Lift

**Definition:**
```
Lift = (Outcome_treatment - Outcome_control) / Outcome_control
```

**Incremental:**
```
Incremental_lift = True_causal_effect
```

**Measurement:**
```
Requires control group
Cannot measure from treated group alone
```

### Propensity Scores

**Definition:**
```
e(X) = P(T=1 | X)
Probability of treatment given characteristics
```

**Propensity score matching:**
```
Match treated and control units with similar e(X)
```

**Weighting:**
```
Weight = T/e(X) + (1-T)/(1-e(X))
ATE = E[Y × Weight]
```

**Assumption:**
```
Unconfoundedness: Y(0), Y(1) ⟂ T | X
```

## Exercises

1. **A/B Test:** Design and analyze A/B test
2. **Difference-in-Differences:** Apply DiD to measure ad impact
3. **Propensity Scores:** Use propensity scores for causal inference
4. **Bias Correction:** Identify and correct for bias

## Case Studies

- A/B test design and analysis
- Incremental lift measurement
- Bias correction in observational studies
- Causal inference in advertising
- Experimentation best practices
