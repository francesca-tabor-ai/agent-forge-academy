---
title: "Information Theory & Digital Communication"
module: "Module 2"
week: 2
order: 2
description: "Explain the fundamental limits of data transmission"
---

# Module 2: Information Theory & Digital Communication

## Introduction

Information theory provides fundamental limits on data transmission. This module covers entropy, channel capacity, noise, interference, and coding limits.

## Learning Objectives

- Understand entropy and information
- Calculate channel capacity
- Model noise, interference, and coding limits
- Apply logarithms and probability
- Use Shannon capacity
- Calculate mutual information
- Understand why bandwidth and SNR limit throughput
- Interpret spectral efficiency and modulation trade-offs

## Entropy and Information

### Entropy

**Definition:**
```
H(X) = -Σ P(x_i) × log₂(P(x_i))
```

**Interpretation:**
- Average information content
- Uncertainty measure
- Minimum bits to encode

**Properties:**
```
H(X) ≥ 0
H(X) = 0 if deterministic
H(X) maximum when uniform
```

### Information Content

**Self-information:**
```
I(x) = -log₂(P(x))
```

**Expected information:**
```
E[I(X)] = H(X)
```

**Units:** Bits

## Channel Capacity

### Shannon Capacity

**AWGN channel:**
```
C = B × log₂(1 + SNR)
where:
  B = bandwidth
  SNR = signal-to-noise ratio
```

**Interpretation:**
- Maximum error-free data rate
- Fundamental limit
- Cannot exceed capacity

### Capacity with Interference

**SINR:**
```
SINR = Signal / (Noise + Interference)
```

**Capacity:**
```
C = B × log₂(1 + SINR)
```

**Interference impact:**
```
Higher_interference → Lower_SINR → Lower_capacity
```

## Noise, Interference, and Coding Limits

### AWGN Channel

**Additive White Gaussian Noise:**
```
Received = Transmitted + Noise
Noise ~ N(0, σ²)
```

**SNR:**
```
SNR = Signal_power / Noise_power
SNR = P / (N₀ × B)
```

**Capacity:**
```
C = B × log₂(1 + P/(N₀×B))
```

### Coding Limits

**Channel coding theorem:**
```
If Rate < Capacity: Error-free transmission possible
If Rate > Capacity: Error-free transmission impossible
```

**Error correction:**
```
Coding_gain = f(Code_rate, Code_length)
```

**Trade-off:**
```
Lower_code_rate → Higher_reliability → Lower_throughput
```

## Core Mathematics

### Logarithms and Probability

**Logarithm properties:**
```
log(ab) = log(a) + log(b)
log(a/b) = log(a) - log(b)
log(a^b) = b×log(a)
```

**Probability:**
```
P(A ∩ B) = P(A) × P(B|A)
P(A ∪ B) = P(A) + P(B) - P(A ∩ B)
```

**Entropy:**
```
H(X) = -Σ P(x) × log(P(x))
```

### Shannon Capacity

**Formula:**
```
C = B × log₂(1 + SNR)
```

**Derivation:**
```
From information_theory
Optimal coding
Gaussian_input
```

**Limits:**
```
Cannot exceed capacity
Approach capacity with good codes
```

### Mutual Information

**Definition:**
```
I(X; Y) = H(X) - H(X|Y)
I(X; Y) = H(Y) - H(Y|X)
I(X; Y) = H(X) + H(Y) - H(X, Y)
```

**Interpretation:**
- Information shared between X and Y
- Reduction in uncertainty

**Channel:**
```
I(X; Y) = Channel_capacity (when maximized)
```

## Learning Outcomes

### Understanding Bandwidth and SNR Limits

**Bandwidth:**
```
Higher_bandwidth → Higher_capacity
Linear relationship
```

**SNR:**
```
Higher_SNR → Higher_capacity
Logarithmic relationship
```

**Trade-off:**
```
Bandwidth vs SNR
Power vs Bandwidth
```

### Interpreting Spectral Efficiency

**Spectral efficiency:**
```
η = C / B = log₂(1 + SNR)
```

**Units:** bits/s/Hz

**Modulation:**
```
Higher_modulation_order → Higher_spectral_efficiency
Requires higher_SNR
```

**Trade-off:**
```
Spectral_efficiency vs Reliability
Throughput vs Coverage
```

## Exercises

1. **Entropy:** Calculate entropy and information content
2. **Capacity:** Calculate channel capacity for different scenarios
3. **SNR:** Analyze SNR impact on capacity
4. **Spectral Efficiency:** Calculate and optimize spectral efficiency

## Case Studies

- 5G capacity analysis
- Modulation scheme selection
- Coding strategy optimization
- Bandwidth allocation
- Power and bandwidth trade-offs
