---
title: "Module 1: Why Forecasts Fail in Production"
description: "Reset how success is defined - offline accuracy vs live performance"
module: "1"
order: 1
problem: "Forecasts optimized for accuracy metrics fail in production"
capability: "Production-First Forecasting"
inspiration: "Real-world demand planning failures"
---

# Module 1: Why Forecasts Fail in Production

**Problem:** Forecasts optimized for accuracy metrics fail in production  
**Capability:** Production-First Forecasting  
**Inspiration:** Real-world demand planning failures

---

## Mindset Shift

> "A forecast is only good if it leads to better decisions — not better accuracy scores."

---

## Learning Objectives

### Offline Accuracy vs Live Performance

- Why models that excel on test sets fail in production
- The gap between historical validation and real-world deployment
- How production data differs from training data
- The cost of overfitting to historical patterns
- Why accuracy metrics can mislead decision-makers

### Forecasts as Inputs to Decisions

- Forecasts don't exist in isolation — they drive actions
- How forecast errors compound through decision systems
- The difference between forecast accuracy and decision quality
- Why a "wrong" forecast can lead to the right decision
- Understanding downstream impact of forecast errors

### Feedback Loops Created by Forecasts

- How forecasts influence the demand they predict
- Self-fulfilling and self-defeating forecast cycles
- The bullwhip effect in forecast-driven systems
- When forecasts create the patterns they predict
- Breaking negative feedback loops

### Why "Best Model" ≠ Best Outcome

- Model selection criteria that ignore business impact
- The fallacy of optimizing for a single metric
- When simpler models outperform complex ones
- The cost of model complexity in production
- Balancing accuracy, interpretability, and actionability

---

## Discussion

### Case Review: Forecast That Increased Stockouts

**Scenario:** A retail company deployed a state-of-the-art ML forecasting model that achieved 15% better MAPE than their previous system. Within 3 months, stockouts increased by 40% and customer complaints doubled.

**Analysis Points:**
- The model optimized for overall accuracy but failed on high-value SKUs
- Forecast uncertainty was ignored, leading to overconfident inventory decisions
- The model learned from historical stockouts (which created demand spikes)
- Production latency meant forecasts were stale by deployment time
- No mechanism to detect when forecasts were degrading

**Key Questions:**
- What metrics should have been optimized instead of MAPE?
- How could forecast uncertainty have been incorporated?
- What feedback mechanisms were missing?
- Why did accuracy improve while business outcomes worsened?

---

## Practical Exercise

### Diagnose a Forecast Failure

**Objective:** Identify why a forecast system failed in production

**Steps:**

1. **Select a Forecast System**
   - Choose a real or simulated forecasting scenario
   - Identify the original success metrics
   - Document the production failure

2. **Map the Decision Chain**
   - How were forecasts used to make decisions?
   - What actions did forecasts trigger?
   - Where did errors compound?
   - What feedback loops existed?

3. **Identify the Mismatch**
   - What was optimized vs. what mattered?
   - Where did offline metrics mislead?
   - What production constraints were ignored?
   - How did feedback loops distort results?

4. **Redesign Success Criteria**
   - What metrics would have caught the failure?
   - How should forecasts be evaluated for decisions?
   - What monitoring was missing?
   - How should success be defined?

**Deliverables:**
- Failure diagnosis report
- Decision chain mapping
- Redesigned success criteria
- Monitoring recommendations

---

## Behaviour Installed

### Success Indicators

- **Decision-first thinking**
  - Questions about how forecasts will be used come before accuracy metrics
  - Understanding that forecast quality = decision quality

- **Production awareness**
  - Recognition that production differs from development
  - Questions about feedback loops and system effects

- **Metric skepticism**
  - Ability to identify when metrics mislead
  - Preference for business outcomes over model metrics

---

## Key Concepts

### Production vs. Development

- Offline validation vs. live performance
- Training data vs. production data distribution
- Model accuracy vs. system accuracy
- The deployment gap

### Decision Impact

- Forecasts as decision inputs
- Error propagation through systems
- Asymmetric costs of over/under-forecasting
- Actionability over accuracy

### Feedback Loops

- Self-fulfilling forecasts
- Self-defeating forecasts
- The bullwhip effect
- Breaking negative cycles

### Model Selection Fallacy

- Single-metric optimization
- Complexity vs. performance trade-offs
- Interpretability and trust
- Production maintainability

---

## Tools and Techniques

- Forecast failure post-mortems
- Decision chain mapping
- Feedback loop analysis
- Production monitoring frameworks
- Business impact metrics

---

**End of Module 1**
