---
title: "Module 4: Promotions, Price & Demand Distortion"
description: "Prevent AI from learning the wrong lesson - promo lift vs pull-forward"
module: "4"
order: 4
problem: "Models learn promotion patterns instead of true demand"
capability: "Promotion-Aware Forecasting"
inspiration: "Retail and CPG demand planning"
---

# Module 4: Promotions, Price & Demand Distortion

**Problem:** Models learn promotion patterns instead of true demand  
**Capability:** Promotion-Aware Forecasting  
**Inspiration:** Retail and CPG demand planning

---

## Mindset Shift

> "Promotions create demand — but they also destroy information about true demand."

---

## Learning Objectives

### Promo Lift vs Demand Pull-Forward

- Promo lift: genuine demand increase during promotion
- Pull-forward: demand shifted from future to present
- Why models confuse the two
- Measuring true lift vs. temporal shift
- The post-promotion dip problem

### Cannibalization Effects

- How promotions affect related products
- Category-level cannibalization
- Brand-level cannibalization
- Substitution effects
- Why ignoring cannibalization inflates forecasts

### Discount Depth vs Duration

- How discount percentage affects demand
- How promotion duration affects demand
- The interaction between depth and duration
- Diminishing returns on discount depth
- Optimal promotion design for forecasting

### When to Exclude Promo Periods Entirely

- When promotions destroy demand signal
- Identifying "unforecastable" promotion periods
- Using baseline models during promotions
- Separating promotion forecasting from base demand
- The cost of including vs. excluding promo data

---

## Case Study

### Forecast Inflation Caused by Promotions

**Scenario:** A CPG company's ML model learned that promotions always increased demand. The model recommended constant promotions, leading to:
- 30% increase in promotional spending
- 5% increase in total volume (mostly pull-forward)
- 15% decrease in profitability
- Erosion of brand value

**Analysis Points:**
- The model learned correlation, not causation
- Promo periods were over-weighted in training
- No separation between lift and pull-forward
- Cannibalization effects were ignored
- Post-promotion periods were treated as normal

**Key Questions:**
- How should promo periods be handled in training?
- What is the true incremental demand from promotions?
- How can pull-forward be measured and accounted for?
- When should promotions be excluded from base forecasts?

---

## Practical Exercise

### Build Promotion-Aware Forecast Model

**Objective:** Create forecasts that separate base demand from promotion effects

**Dataset:** Historical demand with promotion history

**Steps:**

1. **Analyze Promotion Impact**
   - Measure demand during promotions
   - Identify post-promotion dips
   - Calculate apparent lift vs. true lift
   - Document cannibalization effects

2. **Separate Base and Promo Demand**
   - Build baseline forecast (no promotions)
   - Model promotion lift separately
   - Account for pull-forward effects
   - Adjust for cannibalization

3. **Test Exclusion Strategies**
   - Forecast excluding all promo periods
   - Forecast with promo periods but separate model
   - Forecast with promo as feature
   - Compare accuracy of each approach

4. **Build Production Model**
   - Choose best approach for your use case
   - Implement promotion-aware forecasting
   - Create separate promo forecast if needed
   - Validate on out-of-sample data

**Deliverables:**
- Promotion impact analysis
- Base vs. promo demand separation
- Model comparison results
- Production-ready promotion-aware forecast
- Recommendations for promo period handling

---

## Behaviour Installed

### Success Indicators

- **Promotion skepticism**
  - Questions about true incremental demand
  - Recognition of pull-forward effects

- **Separation thinking**
  - Natural separation of base and promo demand
  - Understanding of promotion mechanics

- **Exclusion awareness**
  - Recognition of when to exclude data
  - Understanding of information destruction

---

## Key Concepts

### Promotion Effects

- Promo lift vs. pull-forward
- Measuring true incremental demand
- Post-promotion effects
- Long-term promotion impact

### Cannibalization

- Category-level effects
- Brand-level effects
- Substitution patterns
- Modeling cannibalization

### Promotion Design

- Discount depth effects
- Duration effects
- Interaction effects
- Optimal promotion structure

### Data Handling

- When to exclude promo periods
- Separating base and promo models
- Promotion as feature vs. separate model
- Information preservation strategies

---

## Tools and Techniques

- Promotion impact analysis
- Lift measurement methods
- Pull-forward detection
- Cannibalization modeling
- Baseline separation techniques

---

**End of Module 4**
