---
title: "Noise, Errors & Reliability"
module: "Module 4"
week: 4
order: 4
description: "Quantify uncertainty and imperfections in communication"
---

# Module 4: Noise, Errors & Reliability

## Introduction

Communication systems are imperfect due to noise and errors. This module covers AWGN channels, bit/packet error rates, and outage probability.

## Learning Objectives

- Model AWGN channels
- Calculate bit/packet error rates
- Determine outage probability
- Apply Gaussian distributions
- Use Q-functions
- Calculate tail probabilities
- Relate SINR to user experience
- Understand why reliability requires margins

## AWGN Channels

### Additive White Gaussian Noise

**Model:**
```
y = x + n
where:
  x = transmitted signal
  n ~ N(0, σ²) = noise
  y = received signal
```

**SNR:**
```
SNR = E[x²] / σ² = P / N₀×B
```

**Capacity:**
```
C = B × log₂(1 + SNR)
```

### Error Probability

**Binary signaling:**
```
P(error) = Q(√(2×SNR))
```

**M-ary signaling:**
```
P(error) = f(M, SNR, Modulation)
```

**Q-function:**
```
Q(x) = (1/√(2π)) × ∫ exp(-t²/2)dt from x to ∞
```

## Bit/Packet Error Rates

### Bit Error Rate (BER)

**Definition:**
```
BER = Number_of_bit_errors / Total_bits
```

**For BPSK:**
```
BER = Q(√(2×E_b/N₀))
```

**For QPSK:**
```
BER ≈ 2×Q(√(2×E_b/N₀))
```

**For M-QAM:**
```
BER = f(M, E_b/N₀)
```

### Packet Error Rate (PER)

**Definition:**
```
PER = 1 - (1 - BER)^L
where L = packet_length in bits
```

**Approximation:**
```
PER ≈ L × BER (for small BER)
```

**Impact:**
```
Higher_BER → Higher_PER
Longer_packets → Higher_PER
```

## Outage Probability

### Definition

**Outage:**
```
SINR < SINR_threshold
Service_unavailable
```

**Outage probability:**
```
P_outage = P(SINR < SINR_threshold)
```

**Coverage probability:**
```
P_coverage = 1 - P_outage
```

### Calculation

**With shadowing:**
```
P_outage = P(SINR < γ) = P(P_r < P_min)
P_outage = Q((P_mean - P_min) / σ)
```

**With fading:**
```
P_outage = 1 - exp(-γ/SINR_mean) (Rayleigh)
```

**Combined:**
```
Account for both shadowing and fading
Monte_Carlo or analytical
```

## Core Mathematics

### Gaussian Distributions

**PDF:**
```
f(x) = (1/(σ√(2π))) × exp(-(x-μ)²/(2σ²))
```

**CDF:**
```
Φ(x) = (1/2) × [1 + erf((x-μ)/(σ√2))]
```

**Properties:**
```
E[X] = μ
Var[X] = σ²
```

### Q-Functions

**Definition:**
```
Q(x) = (1/√(2π)) × ∫ exp(-t²/2)dt from x to ∞
```

**Properties:**
```
Q(0) = 0.5
Q(-x) = 1 - Q(x)
Q(x) ≈ (1/x) × (1/√(2π)) × exp(-x²/2) for large x
```

**Error probability:**
```
P(error) = Q(√(2×SNR))
```

### Tail Probabilities

**Definition:**
```
P(X > threshold) = Tail_probability
```

**Gaussian:**
```
P(X > μ + k×σ) = Q(k)
```

**Application:**
```
Outage_probability
Reliability_margins
Safety_factors
```

## Learning Outcomes

### Relating SINR to User Experience

**SINR → Throughput:**
```
Throughput = B × log₂(1 + SINR)
```

**SINR → BER:**
```
BER = f(SINR, Modulation)
```

**BER → Quality:**
```
Higher_BER → Lower_quality
Video_freezing
Voice_breakup
```

**User experience:**
```
SINR → Throughput → Quality → Experience
```

### Understanding Reliability Margins

**Why margins needed:**
```
Uncertainty in propagation
Time_variation
Interference_variation
```

**Link budget:**
```
P_t + G_t + G_r - PL - Margin = P_r_min
```

**Margin calculation:**
```
Margin = z_α × σ
where z_α = reliability_factor
```

**Typical:**
```
10-20 dB margin
For 90-99% reliability
```

## Exercises

1. **Error Rates:** Calculate BER and PER
2. **Outage:** Calculate outage probability
3. **SINR:** Relate SINR to user experience
4. **Margins:** Calculate reliability margins

## Case Studies

- Link budget design
- Coverage reliability
- Error rate optimization
- Quality of service guarantees
- Network reliability planning
