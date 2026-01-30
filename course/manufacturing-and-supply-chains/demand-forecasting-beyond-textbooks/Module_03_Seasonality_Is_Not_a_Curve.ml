---
title: "Module 3: Seasonality Is Not a Curve"
description: "Model recurring patterns without overfitting - multiple seasonalities and calendar effects"
module: "3"
order: 3
problem: "Overfitting to false seasonality patterns"
capability: "Robust Seasonality Detection"
inspiration: "Real demand pattern analysis"
---

# Module 3: Seasonality Is Not a Curve

**Problem:** Overfitting to false seasonality patterns  
**Capability:** Robust Seasonality Detection  
**Inspiration:** Real demand pattern analysis

---

## Mindset Shift

> "Seasonality is a pattern, not a formula — and patterns change."

---

## Learning Objectives

### Multiple Seasonalities (Weekly, Monthly, Yearly)

- Why demand has multiple seasonal cycles
- Weekly patterns (day-of-week effects)
- Monthly patterns (calendar month, fiscal month)
- Yearly patterns (holidays, weather, events)
- Interactions between seasonal cycles
- When to model each seasonality

### Calendar Effects vs True Demand

- Calendar effects: holidays, weekends, month-end
- True demand seasonality: weather, events, behavior
- Distinguishing calendar artifacts from real patterns
- Why calendar effects can mislead
- Adjusting for calendar effects before modeling

### Region-Specific Seasonality

- Why seasonality varies by geography
- Climate-driven patterns
- Cultural and regional differences
- Local events and holidays
- When to share vs. separate seasonal patterns

### Seasonality Drift Over Time

- Why seasonal patterns change
- Gradual drift vs. sudden shifts
- Detecting when seasonality has changed
- Adapting to new seasonal patterns
- When to re-estimate seasonality

---

## Lab

### Detect False Seasonality in Historical Demand

**Objective:** Identify and separate true seasonality from artifacts

**Dataset:** Historical demand with multiple potential seasonal patterns

**Steps:**

1. **Visual Exploration**
   - Plot demand over time
   - Identify apparent seasonal patterns
   - Note calendar effects (holidays, weekends)
   - Document anomalies and outliers

2. **Test for Seasonality**
   - Statistical tests for seasonality (e.g., autocorrelation)
   - Decompose time series (trend, seasonal, residual)
   - Identify multiple seasonal cycles
   - Measure strength of each seasonal pattern

3. **Separate Calendar Effects**
   - Identify calendar-driven patterns
   - Adjust for holidays and weekends
   - Remove calendar artifacts
   - Compare adjusted vs. raw seasonality

4. **Test for Stability**
   - Measure seasonality over different time periods
   - Detect drift or changes in patterns
   - Identify when seasonality breaks down
   - Document stability of each seasonal component

5. **Build Robust Seasonal Model**
   - Model only stable seasonal patterns
   - Exclude calendar artifacts
   - Allow for gradual drift
   - Validate on out-of-sample data

**Deliverables:**
- Seasonality analysis report
- Calendar effect adjustments
- Stability analysis
- Robust seasonal model
- Validation results

---

## Behaviour Installed

### Success Indicators

- **Pattern skepticism**
  - Questions about whether seasonality is real
  - Recognition of calendar artifacts

- **Multi-seasonal thinking**
  - Natural consideration of multiple cycles
  - Understanding of seasonal interactions

- **Stability awareness**
  - Questions about pattern persistence
  - Recognition that seasonality can change

---

## Key Concepts

### Multiple Seasonalities

- Weekly, monthly, yearly cycles
- Seasonal interactions
- When to model each cycle
- Seasonal decomposition methods

### Calendar Effects

- Holiday effects
- Day-of-week patterns
- Month-end effects
- Calendar vs. true seasonality

### Regional Variation

- Geographic differences in seasonality
- Climate and cultural factors
- When to share patterns
- Regional model approaches

### Seasonality Drift

- Why patterns change
- Detecting drift
- Adapting to changes
- Re-estimation strategies

---

## Tools and Techniques

- Time series decomposition
- Seasonality detection tests
- Calendar adjustment methods
- Multi-seasonal modeling
- Drift detection algorithms

---

**End of Module 3**
