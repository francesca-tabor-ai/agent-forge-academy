---
title: "Module 2: Safety Stock — What It Really Protects"
description: "Build safety stock that reflects reality, not assumptions"
module: "2"
order: 2
problem: "Fixed safety stock fails under changing uncertainty"
capability: "Dynamic Safety Stock Design"
inspiration: "Statistical process control and risk management"
---

# Module 2: Safety Stock — What It Really Protects

**Problem:** Fixed safety stock fails under changing uncertainty  
**Capability:** Dynamic Safety Stock Design  
**Inspiration:** Statistical process control and risk management

---

## Mindset Shift

> "Safety stock protects against uncertainty, not average demand."

---

## Learning Objectives

### Demand Variability vs Lead-Time Variability

- Demand variance: day-to-day, week-to-week, season-to-season
- Lead-time variance: supplier reliability, transportation delays, quality issues
- Which matters more? (It depends)
- Combined variance: demand × lead-time interaction
- Why you can't optimize them separately

### Service Level Targets (What They Actually Mean)

- Fill rate vs. stockout frequency vs. cycle service level
- What "95% service level" actually means in practice
- Customer-facing vs. internal service levels
- The difference between target and reality
- Why service level targets are often misunderstood

### Why Fixed Safety Stock Is Dangerous

- Static safety stock in dynamic environments
- What happens when demand variance increases
- What happens when lead-time variance increases
- The cost of being wrong: stockouts or excess
- When fixed becomes wrong: demand shifts, supplier changes, market volatility

### Dynamic Safety Stock Under Uncertainty

- Adaptive safety stock: recalculate based on recent variance
- Time-varying uncertainty: demand volatility changes over time
- Regime detection: when uncertainty shifts permanently
- Risk-adjusted safety stock: higher uncertainty = higher buffer
- The balance between stability and responsiveness

---

## Hands-on

### Simulate Safety Stock Under Shifting Demand Variance

**Objective:** Build intuition for how safety stock should adapt

**Scenario Setup:**

You manage inventory for a product with:
- Average demand: 100 units/week
- Initial demand std dev: 20 units/week
- Lead time: 2 weeks (fixed for now)
- Target service level: 95%

**Simulation Steps:**

1. **Calculate Initial Safety Stock**
   - Use standard formula: Z-score × √(lead time) × demand std dev
   - Document assumptions

2. **Simulate Demand Variance Increase**
   - Month 1-3: std dev = 20 units/week
   - Month 4-6: std dev = 40 units/week (demand becomes more volatile)
   - Month 7-9: std dev = 60 units/week (high volatility period)
   - Track stockouts and excess inventory

3. **Compare Fixed vs. Dynamic Safety Stock**
   - Fixed: Keep safety stock at initial level
   - Dynamic: Recalculate monthly based on recent variance
   - Measure: stockout frequency, excess inventory, total cost

4. **Add Lead-Time Variability**
   - Lead time: 2 weeks average, 0.5 week std dev
   - Recalculate safety stock with combined variance
   - Compare to demand-only calculation

5. **Analyze Results**
   - When does fixed safety stock fail?
   - How much does dynamic safety stock help?
   - What's the cost of being wrong?

**Deliverables:**
- Simulation code (Python recommended)
- Comparison: fixed vs. dynamic safety stock performance
- Analysis: when and why dynamic safety stock matters
- Recommendations: recalculation frequency and triggers

**Tools:**
- Python: numpy, pandas, matplotlib
- Simulation framework: Monte Carlo or time-series simulation
- Metrics: stockout rate, excess inventory, total cost

---

## Behaviour Installed

### Success Indicators

- **Variance awareness**
  - Questions about demand and lead-time variance come naturally
  - Recognition that safety stock must adapt to changing uncertainty

- **Service level clarity**
  - Understanding what service level targets actually mean
  - Ability to translate targets into safety stock requirements

- **Dynamic thinking**
  - Preference for adaptive policies over fixed rules
  - Recognition that "set it and forget it" fails in volatile environments

---

## Key Concepts

### Safety Stock Fundamentals

- Purpose: protect against uncertainty, not average demand
- Components: demand variance, lead-time variance, service level
- Formula: Z-score × √(lead time) × combined std dev
- When formulas work vs. when they break

### Variance Sources

- Demand variability: customer behavior, market shifts, promotions
- Lead-time variability: supplier reliability, transportation, customs
- Combined effect: variance multiplies, not adds
- Which matters more: depends on relative magnitudes

### Dynamic Safety Stock

- Recalculation triggers: time-based, variance-based, regime-based
- Stability vs. responsiveness: don't overreact to noise
- Adaptive algorithms: moving average, exponential smoothing, regime detection
- Implementation: when to update, how often, what data to use

---

## Tools and Techniques

- Safety stock formulas (standard and advanced)
- Variance estimation methods
- Service level calculations
- Monte Carlo simulation
- Time-series analysis for variance detection
- Python libraries: numpy, pandas, scipy

---

**End of Module 2**
