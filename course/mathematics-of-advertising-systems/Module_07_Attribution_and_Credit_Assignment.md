---
title: "Attribution & Credit Assignment"
module: "Module 7"
week: 7
order: 7
description: "Allocate value fairly across channels and touchpoints"
---

# Module 7: Attribution & Credit Assignment

## Introduction

Attributing conversions to advertising touchpoints requires fair credit assignment. This module applies cooperative game theory, Shapley values, and path analysis to allocate conversion credit mathematically.

## Learning Objectives

- Understand path dependency
- Apply cooperative game theory
- Identify attribution bias
- Calculate Shapley value attribution
- Compare heuristic vs data-driven attribution
- Assign conversion credit mathematically
- Defend attribution decisions analytically

## Path Dependency

### Customer Journey

**Touchpoint sequence:**
```
Touchpoint_1 → Touchpoint_2 → ... → Touchpoint_n → Conversion
```

**Path:**
```
Path = (T₁, T₂, ..., Tₙ)
```

**Conversion:**
```
Conversion = 1 if path leads to conversion
Conversion = 0 otherwise
```

### Path Analysis

**All paths:**
```
Paths = {All possible touchpoint sequences}
```

**Conversion paths:**
```
Converting_paths = {Paths leading to conversion}
```

**Attribution:**
```
Credit_i = f(Path, Touchpoint_i)
```

## Cooperative Game Theory

### Game Definition

**Players:**
```
N = {Touchpoint_1, Touchpoint_2, ..., Touchpoint_n}
```

**Coalition:**
```
S ⊆ N (subset of touchpoints)
```

**Value function:**
```
v(S) = Value when only touchpoints in S present
```

**Conversion value:**
```
v(S) = P(Conversion | Touchpoints in S) × Conversion_value
```

### Characteristic Function

**Properties:**
```
v(∅) = 0 (no touchpoints, no value)
v(N) = Total_value (all touchpoints)
```

**Superadditivity:**
```
v(S ∪ T) ≥ v(S) + v(T) if S ∩ T = ∅
```

## Attribution Bias

### Last-Touch Bias

**Problem:**
```
Credit only to last touchpoint
Ignores earlier touchpoints
```

**Mathematical:**
```
Credit_i = Conversion_value if i = Last_touchpoint
Credit_i = 0 otherwise
```

**Bias:**
```
Overestimates last touchpoint
Underestimates earlier touchpoints
```

### First-Touch Bias

**Problem:**
```
Credit only to first touchpoint
Ignores later touchpoints
```

**Mathematical:**
```
Credit_i = Conversion_value if i = First_touchpoint
Credit_i = 0 otherwise
```

### Linear Attribution

**Equal credit:**
```
Credit_i = Conversion_value / Number_of_touchpoints
```

**Limitation:**
```
Assumes all touchpoints equal
May not reflect true contribution
```

## Key Models

### Shapley Value Attribution

**Definition:**
```
Shapley_i = Σ [v(S ∪ {i}) - v(S)] × |S|! × (n - |S| - 1)! / n!
Sum over all S ⊆ N \ {i}
```

**Interpretation:**
- Average marginal contribution
- Fair allocation
- Satisfies axioms

**Properties:**
- Efficiency: Σ Shapley_i = v(N)
- Symmetry: Equal players get equal credit
- Dummy: Non-contributors get zero
- Additivity: Linear in value function

### Heuristic Attribution

**Last-touch:**
```
Credit_i = Value if i = Last, else 0
```

**First-touch:**
```
Credit_i = Value if i = First, else 0
```

**Linear:**
```
Credit_i = Value / n
```

**Time-decay:**
```
Credit_i = Value × exp(-λ × (Time_last - Time_i)) / Normalization
```

**Position-based:**
```
Credit_first = 40% × Value
Credit_last = 40% × Value
Credit_middle = 20% × Value / (n - 2)
```

### Data-Driven Attribution

**Markov models:**
```
P(Conversion | Path) = f(Transition_probabilities)
```

**Credit:**
```
Credit_i = Removal_effect_i
Removal_effect = v(N) - v(N \ {i})
```

**Machine learning:**
```
Credit_i = f(Path_features, Touchpoint_features)
Train on conversion data
```

## Assigning Conversion Credit

### Shapley Value Calculation

**For each touchpoint:**
```
1. Consider all subsets S not containing i
2. Calculate marginal contribution: v(S ∪ {i}) - v(S)
3. Weight by probability of subset
4. Sum over all subsets
```

**Example (3 touchpoints):**
```
Shapley_1 = (1/3)×[v({1}) - v(∅)] + 
            (1/6)×[v({1,2}) - v({2})] + 
            (1/6)×[v({1,3}) - v({3})] + 
            (1/3)×[v({1,2,3}) - v({2,3})]
```

### Practical Implementation

**Monte Carlo:**
```
Sample random orderings
Calculate marginal contribution
Average over samples
```

**Approximation:**
```
Shapley_i ≈ Average_marginal_contribution
```

## Defending Attribution Decisions

### Axiomatic Justification

**Shapley value satisfies:**
- Efficiency
- Symmetry
- Dummy player
- Additivity

**Unique solution:**
```
Only attribution method satisfying all axioms
```

### Empirical Validation

**Holdout test:**
```
Remove touchpoint
Measure impact
Compare to attribution credit
```

**Correlation:**
```
Correlate attribution_credit with removal_impact
High correlation = Valid attribution
```

### Business Justification

**Fairness:**
```
Credit proportional to contribution
No arbitrary rules
```

**Incentive alignment:**
```
Channels rewarded for true contribution
Encourages cooperation
```

## Exercises

1. **Shapley Value:** Calculate Shapley value attribution
2. **Heuristic Comparison:** Compare heuristic methods
3. **Bias Analysis:** Identify and quantify attribution bias
4. **Validation:** Validate attribution method

## Case Studies

- Multi-touchpoint attribution
- Shapley value implementation
- Attribution bias correction
- Channel credit allocation
- Attribution validation
