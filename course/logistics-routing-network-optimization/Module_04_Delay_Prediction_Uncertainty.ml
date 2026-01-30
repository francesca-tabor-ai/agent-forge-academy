---
title: "Module 4: Delay Prediction & Uncertainty"
description: "Forecast risk, not just time"
module: "4"
order: 4
problem: "Point estimates of transit time ignore uncertainty and tail risk"
capability: "Uncertainty-Aware Delay Forecasting"
inspiration: "Probabilistic forecasting and risk management"
---

# Module 4: Delay Prediction & Uncertainty

**Problem:** Point estimates of transit time ignore uncertainty and tail risk  
**Capability:** Uncertainty-Aware Delay Forecasting  
**Inspiration:** Probabilistic forecasting and risk management

---

## Mindset Shift

> "Forecast risk, not just time. Uncertainty is the real constraint."

---

## Learning Objectives

### Delay Distributions vs Point Estimates

- Point estimates: single transit time prediction
- Delay distributions: probability of different transit times
- Why distributions matter more than point estimates
- Percentiles: P50, P90, P95, P99 delay estimates
- The difference between expected and worst-case

### Correlated Delays

- Independent delays: delays that don't affect each other
- Correlated delays: delays that cascade or cluster
- Why correlation matters for network risk
- Examples: weather, port congestion, carrier issues
- The difference between individual and systemic risk

### Early-Warning Signals

- Leading indicators: signals that predict delays
- Examples: port congestion, weather forecasts, carrier performance
- How to identify early-warning signals
- Using signals to trigger proactive actions
- The value of early intervention

### When Prediction Accuracy Doesn't Matter

- High-stakes decisions: when tail risk dominates
- Low-stakes decisions: when average performance is sufficient
- The difference between accuracy and usefulness
- When to optimize for robustness vs. accuracy
- Why perfect predictions can still fail

---

## Exercise

### Predict Delay Risk Bands for Key Lanes

**Objective:** Build probabilistic delay forecasts that quantify risk

**Steps:**

1. **Collect Historical Delay Data**
   - Transit times for key lanes
   - Delay events and their causes
   - Weather, congestion, and disruption data
   - Carrier performance history

2. **Fit Delay Distributions**
   - Analyze distribution shapes (normal, log-normal, fat-tailed)
   - Calculate percentiles: P50, P75, P90, P95, P99
   - Identify distribution parameters
   - Document tail risk characteristics

3. **Model Correlated Delays**
   - Identify delay correlation patterns
   - Weather-related correlations across lanes
   - Port congestion correlations
   - Carrier performance correlations
   - Build correlation matrix

4. **Develop Early-Warning Signals**
   - Identify leading indicators for delays
   - Port congestion indices
   - Weather forecast severity
   - Carrier performance trends
   - Build signal-to-delay mapping

5. **Generate Risk Bands**
   - Baseline: P50 delay estimate
   - Optimistic: P25 delay estimate
   - Pessimistic: P75 delay estimate
   - Worst-case: P95 delay estimate
   - Document risk band scenarios

6. **Compare to Point Estimates**
   - Calculate mean delay (point estimate)
   - Compare to risk bands
   - Identify when point estimates are misleading
   - Document decision impact of uncertainty

**Deliverables:**
- Delay distribution analysis for key lanes
- Percentile-based risk bands (P50, P75, P90, P95)
- Correlation analysis of delay patterns
- Early-warning signal framework
- Comparison: point estimates vs. risk bands

---

## Discussion

### When Point Estimates Fail

**Scenario Analysis:**

1. **The Average Delay Trap**
   - Case: Route planning uses average transit time
   - Reality: Average is 5 days, but P95 is 15 days
   - Outcome: Frequent stockouts due to tail risk
   - Lesson: Average performance hides tail risk

2. **The Independent Delay Assumption**
   - Case: Model assumes delays are independent
   - Reality: Weather causes correlated delays across lanes
   - Outcome: Underestimates systemic risk
   - Lesson: Correlation amplifies network risk

3. **The Perfect Prediction Failure**
   - Case: Model predicts delays with high accuracy
   - Reality: Perfect predictions don't prevent delays
   - Outcome: Accurate forecasts but no action
   - Lesson: Prediction accuracy ≠ decision quality

**Discussion Questions:**
- When have you seen point estimates fail?
- What tail risks were ignored?
- What was the actual cost of the failure?
- How could probabilistic forecasting have helped?

---

## Behaviour Installed

### Success Indicators

- **Uncertainty awareness**
  - Questions about delay distributions come naturally
  - Recognition that point estimates hide risk
  - Understanding of percentiles and tail risk

- **Risk band thinking**
  - Ability to articulate delay risk scenarios
  - Questions about P90, P95, P99 estimates
  - Preference for risk bands over point estimates

- **Correlation recognition**
  - Understanding that delays can be correlated
  - Questions about systemic vs. individual risk
  - Ability to identify correlation patterns

---

## Key Concepts

### Delay Distributions

- Point estimates: single transit time prediction
- Delay distributions: probability of different transit times
- Percentiles: P50 (median), P90, P95, P99 delay estimates
- Tail risk: probability of extreme delays
- Distribution shapes: normal, log-normal, fat-tailed

### Correlated Delays

- Independent delays: delays that don't affect each other
- Correlated delays: delays that cascade or cluster
- Correlation drivers: weather, congestion, carrier issues
- Systemic risk: network-wide delay correlation
- Individual vs. systemic risk

### Early-Warning Signals

- Leading indicators: signals that predict delays
- Examples: port congestion, weather, carrier performance
- Signal-to-delay mapping: how signals predict delays
- Proactive action triggers: when to intervene
- The value of early intervention

---

## Tools and Techniques

- Probabilistic forecasting methods
- Distribution fitting techniques
- Correlation analysis
- Early-warning signal development
- Risk band generation

---

**End of Module 4**
