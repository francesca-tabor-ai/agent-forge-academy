---
title: "Module 6: Aggregation Hides Risk"
description: "Learn how aggregation creates false confidence"
module: "6"
order: 6
problem: "Assuming aggregated data accurately represents underlying reality"
capability: "Disaggregation Awareness"
inspiration: "Simpson's paradox, aggregation bias, and risk management"
---

# Module 6: Aggregation Hides Risk

**Problem:** Assuming aggregated data accurately represents underlying reality  
**Capability:** Disaggregation Awareness  
**Inspiration:** Simpson's paradox, aggregation bias, and risk management

---

## Mindset Shift

> "Aggregation smooths variability and hides risk — what looks stable at an aggregate level may be highly volatile at a disaggregated level."

---

## Learning Objectives

### SKU vs Category Views

- **SKU-level data**
  - Individual product/location combinations
  - High variability
  - Shows true operational complexity
  - Reveals individual product risks

- **Category-level aggregation**
  - Groups of SKUs
  - Smoother, more stable
  - Hides individual product issues
  - Creates false sense of stability

- **Why aggregation is dangerous**
  - Individual SKUs can be highly volatile
  - Problems in one SKU hidden by others
  - Aggregation assumes substitutability
  - Risk is concentrated, not distributed

- **When aggregation is appropriate**
  - Strategic planning
  - High-level reporting
  - When SKUs are truly substitutable
  - When detail doesn't matter

### Time Aggregation Distortions

- **Daily vs. weekly vs. monthly views**
  - Daily: shows true variability
  - Weekly: smooths daily fluctuations
  - Monthly: hides weekly patterns
  - Each level hides different information

- **How time aggregation distorts**
  - Hides seasonality within periods
  - Smooths demand spikes
  - Masks operational patterns
  - Creates false trends

- **Why it matters**
  - Operational decisions need daily/weekly data
  - Strategic decisions can use monthly data
  - Wrong aggregation level = wrong decisions
  - Models trained on wrong aggregation fail

### Averaging Hides Tail Risk

- **The averaging problem**
  - Average demand looks stable
  - But individual periods vary widely
  - Tail risk (outliers) is hidden
  - Average doesn't represent typical experience

- **Why tail risk matters**
  - Outliers drive inventory needs
  - Extreme events cause stockouts
  - Safety stock based on average is wrong
  - Models that ignore tail risk fail

- **How to account for tail risk**
  - Use percentiles, not just averages
  - Model full distribution
  - Account for variability
  - Design for extremes, not averages

### Simpson's Paradox in Operations

- **What Simpson's paradox is**
  - Aggregated data shows one trend
  - Disaggregated data shows opposite trend
  - Common in operational data
  - Results from confounding variables

- **Operational examples**
  - Overall inventory looks stable, but individual SKUs volatile
  - Category performance looks good, but individual products failing
  - Overall on-time delivery good, but specific routes failing
  - Average lead time stable, but individual suppliers vary widely

- **Why it happens**
  - Mix effects (changing composition)
  - Confounding variables
  - Aggregation across heterogeneous groups
  - Time-varying relationships

- **How to detect**
  - Always disaggregate
  - Look for patterns at multiple levels
  - Check for mix effects
  - Validate aggregate conclusions with disaggregate data

---

## Lab Exercise

### Find False Stability in Aggregated Inventory Data

**Objective:** Experience how aggregation hides risk and variability

**Dataset Provided:**
- Inventory data at multiple aggregation levels:
  - SKU-location-day level (disaggregated)
  - Category-week level (aggregated)
  - Total-month level (highly aggregated)
- Multiple products and locations
- Various volatility patterns

**Tasks:**

1. **Analyze at Different Aggregation Levels**
   - Calculate variability at:
     - SKU-location-day level
     - Category-week level
     - Total-month level
   - Compare coefficients of variation
   - Identify what's hidden at each level

2. **Identify Hidden Risks**
   - Which SKUs are highly volatile?
   - Which categories hide volatile SKUs?
   - What risks are invisible at aggregate level?
   - What would break if you only saw aggregates?

3. **Detect Simpson's Paradox**
   - Are there trends that reverse when disaggregated?
   - Do categories show different patterns than SKUs?
   - Are there mix effects?
   - What conclusions would be wrong at aggregate level?

4. **Assess Tail Risk**
   - Calculate percentiles at each level
   - Identify outliers at SKU level
   - See how outliers disappear at aggregate level
   - Assess impact on inventory planning

5. **Design Appropriate Aggregation**
   - What aggregation level for what decisions?
   - When is aggregation appropriate?
   - How to preserve risk information?
   - How to communicate aggregate vs. disaggregate views?

**Deliverables:**
- Variability analysis at multiple levels
- Hidden risk identification
- Simpson's paradox detection
- Tail risk assessment
- Aggregation strategy recommendations

---

## Practical Exercise

### Disaggregate an Aggregate Metric and Find Hidden Problems

**Objective:** Practice disaggregation to reveal hidden issues

**Steps:**

1. **Choose an Aggregate Metric**
   - Examples:
     - Total inventory value
     - Average lead time
     - Overall on-time delivery
     - Category sales growth

2. **Disaggregate by Multiple Dimensions**
   - By product/SKU
   - By location
   - By time period
   - By supplier/customer
   - By any relevant dimension

3. **Identify Hidden Variability**
   - Which disaggregations show high variability?
   - What patterns emerge?
   - What problems are hidden in aggregate?

4. **Detect Simpson's Paradox**
   - Do trends reverse when disaggregated?
   - Are there mix effects?
   - What conclusions would be wrong?

5. **Assess Tail Risk**
   - What outliers exist at disaggregate level?
   - How do they affect aggregate?
   - What risks are hidden?

6. **Design Appropriate Views**
   - What level for operational decisions?
   - What level for strategic decisions?
   - How to preserve risk information?
   - How to communicate findings?

**Deliverables:**
- Disaggregation analysis
- Hidden variability identification
- Simpson's paradox detection
- Tail risk assessment
- Appropriate aggregation strategy

---

## Behaviour Installed

### Success Indicators

- **Disaggregation instinct**
  - Always questioning aggregate views
  - Disaggregating to find hidden issues
  - Understanding what's lost in aggregation

- **Risk awareness**
  - Recognition that aggregation hides risk
  - Questions about tail risk
  - Understanding that average ≠ typical

- **Appropriate aggregation**
  - Knowing when aggregation is appropriate
  - Choosing right level for decisions
  - Preserving risk information

---

## Key Concepts

### Aggregation Levels

- SKU vs. category vs. total
- Daily vs. weekly vs. monthly
- Location vs. region vs. global
- Why each level hides different information

### Variability Hiding

- How aggregation smooths variability
- Why smooth looks stable but isn't
- What information is lost
- How to preserve variability information

### Tail Risk

- Average hides outliers
- Tail risk drives operational needs
- Percentiles vs. averages
- Designing for extremes

### Simpson's Paradox

- Aggregated vs. disaggregated trends
- Mix effects and confounding
- Common in operational data
- How to detect and avoid

---

## Tools and Techniques

- Disaggregation analysis
- Variability measurement (CV, percentiles)
- Simpson's paradox detection
- Multi-level analysis
- Appropriate aggregation selection
- Risk-preserving aggregation methods

---

**End of Module 6**
