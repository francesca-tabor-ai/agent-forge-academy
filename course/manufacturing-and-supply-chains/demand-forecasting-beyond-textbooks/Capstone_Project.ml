---
title: "Capstone Project: Hierarchical Forecast for Multi-SKU Dataset"
description: "End-to-end forecasting system with baselines, ML, intervals, and decision evaluation"
module: "Capstone"
order: 10
problem: "Build production-ready forecasting system"
capability: "End-to-End Forecasting"
inspiration: "Real-world demand planning systems"
---

# Capstone Project: Build a Hierarchical Forecast for a Multi-SKU Dataset

**Problem:** Build production-ready forecasting system  
**Capability:** End-to-End Forecasting  
**Inspiration:** Real-world demand planning systems

---

## Project Overview

Build a complete hierarchical forecasting system for a multi-SKU dataset that demonstrates all course concepts: baseline models, optional ML, prediction intervals, and decision impact evaluation.

---

## Project Requirements

### Dataset

**Provided:** Multi-SKU demand dataset with:
- Multiple SKUs across categories
- Hierarchical structure (SKU → category → region)
- Historical demand data (minimum 2 years)
- Optional: promotion history, external signals

**Your Task:** Understand the data, identify patterns, and build appropriate forecasts.

### Deliverables

#### 1. Baseline Models

- Implement naive, moving average, and exponential smoothing
- Test multiple parameter configurations
- Document baseline performance
- Use baselines as comparison point for all other models

#### 2. ML Model (Optional)

- Build at least one ML-based forecast (e.g., XGBoost, LSTM, Prophet)
- Only if ML improves on baselines
- If ML doesn't help, document why and use simpler model
- Demonstrate model restraint

#### 3. Hierarchical Reconciliation

- Forecast at multiple hierarchy levels
- Implement reconciliation method
- Ensure consistency across levels
- Document reconciliation approach and trade-offs

#### 4. Prediction Intervals

- Build prediction intervals for all forecasts
- Account for uncertainty and tail risk
- Test interval coverage
- Generate scenarios (best/base/worst case)

#### 5. Decision Impact Evaluation

- Define inventory decision problem
- Simulate decisions using forecasts
- Measure service levels achieved
- Calculate total costs
- Compare decision outcomes across models

#### 6. Robustness Testing

- Test forecasts on historical shocks
- Measure performance during disruptions
- Identify where forecasts break
- Document robustness findings

---

## Evaluation Criteria

### Decision Relevance (30%)

- How well do forecasts support actual decisions?
- Are forecasts optimized for business outcomes?
- Is uncertainty properly incorporated into decisions?
- Do forecasts lead to better inventory/service level outcomes?

### Proper Use of Uncertainty (25%)

- Are prediction intervals well-calibrated?
- Is tail risk properly accounted for?
- Are scenarios realistic and useful?
- Is uncertainty communicated effectively?

### Model Restraint (20%)

- Are simple models used when appropriate?
- Is complexity justified by performance?
- Are baselines properly evaluated?
- Is there evidence of avoiding overfitting?

### Clarity of Reasoning (25%)

- Are modeling choices well-justified?
- Is the approach clearly explained?
- Are trade-offs documented?
- Can the system be understood and maintained?

---

## Project Structure

### Phase 1: Data Understanding and Baselines (Week 1-2)

1. **Data Exploration**
   - Understand data structure and quality
   - Identify patterns, seasonality, trends
   - Document data challenges
   - Create data quality report

2. **Baseline Models**
   - Implement naive, moving average, exponential smoothing
   - Test on all hierarchy levels
   - Document baseline performance
   - Establish comparison benchmarks

### Phase 2: Advanced Modeling (Week 2-3)

3. **Hierarchical Forecasting**
   - Build forecasts at multiple levels
   - Implement reconciliation
   - Test consistency
   - Document approach

4. **ML Model (If Justified)**
   - Build ML model only if it improves baselines
   - Test multiple ML approaches
   - Compare with baselines
   - Document why ML helps (or doesn't)

### Phase 3: Uncertainty and Decisions (Week 3-4)

5. **Prediction Intervals**
   - Build prediction intervals
   - Test coverage
   - Generate scenarios
   - Document uncertainty approach

6. **Decision Impact**
   - Define decision problem
   - Simulate decisions
   - Measure outcomes
   - Compare models on decision metrics

### Phase 4: Robustness and Documentation (Week 4-5)

7. **Robustness Testing**
   - Test on historical shocks
   - Measure degradation
   - Identify failure modes
   - Document robustness

8. **Final Documentation**
   - Complete project report
   - Document all choices and trade-offs
   - Provide recommendations
   - Create presentation

---

## Key Lesson (Explicitly Taught)

> **"A forecast is only good if it leads to better decisions — not better accuracy scores."**

Your project will be evaluated on:
- Whether forecasts improve business outcomes
- Whether uncertainty is properly used
- Whether model complexity is justified
- Whether the system can be understood and maintained

Accuracy metrics matter, but they are means to an end — better decisions.

---

## Deliverables Checklist

- [ ] Data exploration and quality report
- [ ] Baseline model implementations and results
- [ ] Hierarchical forecast with reconciliation
- [ ] ML model (if justified) or explanation of why not
- [ ] Prediction intervals with coverage analysis
- [ ] Scenario generation (best/base/worst)
- [ ] Decision impact simulation and analysis
- [ ] Robustness testing on historical shocks
- [ ] Complete project report
- [ ] Code repository with documentation
- [ ] Final presentation (if required)

---

## Success Criteria

**Passing:** All deliverables completed, forecasts improve decisions, uncertainty properly handled, reasoning is clear.

**Excellent:** Forecasts significantly improve business outcomes, sophisticated handling of uncertainty, exceptional clarity and restraint in modeling choices.

---

**End of Capstone Project**
