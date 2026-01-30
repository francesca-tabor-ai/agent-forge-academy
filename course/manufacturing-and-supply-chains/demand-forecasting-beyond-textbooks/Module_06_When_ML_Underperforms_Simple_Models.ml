---
title: "Module 6: When ML Underperforms Simple Models"
description: "Learn restraint - naive, moving average, exponential smoothing baselines"
module: "6"
order: 6
problem: "Complex models amplify noise in sparse data"
capability: "Model Restraint"
inspiration: "Occam's razor in forecasting"
---

# Module 6: When ML Underperforms Simple Models

**Problem:** Complex models amplify noise in sparse data  
**Capability:** Model Restraint  
**Inspiration:** Occam's razor in forecasting

---

## Mindset Shift

> "Complexity is not a virtue — it's a cost that must be justified by performance."

---

## Learning Objectives

### Naive, Moving Average, Exponential Smoothing Baselines

- Naive forecast: last value
- Moving average: simple average of recent values
- Exponential smoothing: weighted average with decay
- Why these methods work well
- When baselines are hard to beat
- The power of simplicity

### Bias-Variance Trade-offs in Demand Data

- Bias: systematic error from model assumptions
- Variance: sensitivity to training data
- Why demand data is high-variance
- How complex models increase variance
- When bias is preferable to variance

### Data Sparsity at SKU Level

- Why SKU-level data is often sparse
- The curse of dimensionality
- Overfitting to noise in sparse data
- When aggregation helps
- The SKU-level forecasting challenge

### Why Complex Models Amplify Noise

- How complexity captures noise as signal
- Overfitting in time series
- The danger of too many parameters
- Why regularization helps but isn't enough
- When to prefer simple models

---

## Exercise

### Beat an ML Model Using a Simple Heuristic

**Objective:** Demonstrate that simple methods can outperform complex ML

**Challenge:** Given a dataset where an ML model (e.g., XGBoost, LSTM) has been trained, build a simple model that beats it.

**Steps:**

1. **Understand the ML Model**
   - Review the ML model's approach
   - Identify its complexity
   - Understand what it's trying to learn
   - Note its performance metrics

2. **Build Simple Baselines**
   - Naive forecast
   - Moving average (various windows)
   - Exponential smoothing (various parameters)
   - Seasonal naive
   - Simple linear trend

3. **Identify Where ML Fails**
   - Where does ML overfit?
   - What patterns does it miss?
   - Where is data too sparse?
   - What assumptions does ML make that are wrong?

4. **Build Simple Heuristic**
   - Combine insights from baselines
   - Add domain knowledge
   - Create simple rules
   - Avoid overfitting
   - Keep it interpretable

5. **Compare Performance**
   - Test on same validation set
   - Compare accuracy metrics
   - Compare robustness
   - Compare interpretability
   - Document why simple wins

**Deliverables:**
- Simple heuristic model
- Performance comparison
- Analysis of why simple wins
- Recommendations for when to use simple vs. complex
- Reflection on model complexity

---

## Behaviour Installed

### Success Indicators

- **Baseline-first thinking**
  - Always start with simple methods
  - Questions about whether complexity is needed

- **Sparsity awareness**
  - Recognition of data limitations
  - Understanding of overfitting risks

- **Restraint**
  - Ability to choose simple over complex
  - Justification for complexity when needed

---

## Key Concepts

### Simple Forecasting Methods

- Naive forecasts
- Moving averages
- Exponential smoothing
- Seasonal naive
- Linear trends

### Bias-Variance Trade-off

- Bias in forecasting
- Variance in forecasting
- The trade-off in demand data
- When to prefer bias
- When to prefer variance

### Data Sparsity

- SKU-level challenges
- Curse of dimensionality
- Overfitting risks
- Aggregation strategies
- Sparse data methods

### Model Complexity

- When complexity helps
- When complexity hurts
- Overfitting mechanisms
- Regularization limits
- Simplicity as a feature

---

## Tools and Techniques

- Baseline forecasting methods
- Model comparison frameworks
- Overfitting detection
- Sparsity handling
- Complexity evaluation

---

**End of Module 6**
