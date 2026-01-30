---
title: "Module 3: Days of Inventory (DOI) as a Control Variable"
description: "Use DOI correctly as a dynamic control, not a static target"
module: "3"
order: 3
problem: "Uniform DOI targets fail across SKUs and regions"
capability: "Adaptive DOI Management"
inspiration: "Working capital management and inventory turns"
---

# Module 3: Days of Inventory (DOI) as a Control Variable

**Problem:** Uniform DOI targets fail across SKUs and regions  
**Capability:** Adaptive DOI Management  
**Inspiration:** Working capital management and inventory turns

---

## Mindset Shift

> "DOI is a control variable, not a target — and it should vary by SKU, region, and conditions."

---

## Learning Objectives

### DOI vs Turns vs Coverage

- Days of Inventory (DOI): inventory ÷ average daily demand
- Inventory turns: 365 ÷ DOI (how many times inventory rotates per year)
- Coverage: how long current inventory lasts at current demand
- When to use which metric
- Why DOI is more intuitive for operations

### SKU-Specific DOI Targets

- Why uniform DOI targets fail
- Fast movers vs. slow movers: different DOI needs
- High-value vs. low-value: working capital constraints
- Perishable vs. stable: obsolescence risk
- Critical vs. non-critical: service level requirements
- How to set SKU-specific targets

### Inflation-Adjusted DOI

- Why nominal DOI is misleading during inflation
- Real vs. nominal inventory value
- The cost of holding inventory during inflation
- When to increase DOI (hedge against price increases)
- When to decrease DOI (reduce holding cost risk)
- Inflation-adjusted working capital calculations

### Why Uniform DOI Targets Fail

- Different demand patterns require different buffers
- Different lead times require different coverage
- Different criticality requires different service levels
- Different costs require different risk profiles
- Case studies: when uniform targets cause failures

---

## Lab

### Set Adaptive DOI Targets by SKU and Region

**Objective:** Design SKU and region-specific DOI targets

**Scenario:**

You manage inventory across:
- 3 product categories: Fast-moving (100 SKUs), Medium (50 SKUs), Slow (20 SKUs)
- 3 regions: North (high demand, short lead time), South (medium demand, medium lead time), East (low demand, long lead time)
- Working capital constraint: $2M total inventory budget
- Service level requirement: 95% fill rate

**Lab Steps:**

1. **Analyze Current State**
   - Current DOI by SKU and region
   - Current stockout rate by SKU and region
   - Current excess inventory by SKU and region
   - Working capital usage

2. **Classify SKUs**
   - Fast/medium/slow movers (demand velocity)
   - High/low value (unit cost)
   - Critical/non-critical (service level requirement)
   - Perishable/stable (obsolescence risk)

3. **Set SKU-Specific DOI Targets**
   - Fast movers: lower DOI (high turns, lower risk)
   - Slow movers: higher DOI (lower turns, higher risk)
   - High-value: lower DOI (working capital constraint)
   - Critical: higher DOI (service level requirement)
   - Document rationale for each target

4. **Adjust for Regional Differences**
   - North: lower DOI (short lead time, high demand)
   - South: medium DOI (medium lead time, medium demand)
   - East: higher DOI (long lead time, low demand)
   - Account for regional demand variance

5. **Apply Working Capital Constraint**
   - Calculate total inventory value for all targets
   - If over budget: prioritize by criticality and value
   - If under budget: increase DOI for high-risk SKUs
   - Document trade-offs made

6. **Validate Targets**
   - Simulate stockout rate with new targets
   - Check working capital usage
   - Identify any SKUs that need adjustment
   - Document exceptions and rationale

**Deliverables:**
- SKU classification matrix
- DOI targets by SKU and region
- Working capital allocation
- Validation results: expected stockout rate, excess inventory
- Exception handling: which SKUs deviate and why

**Tools:**
- Excel or Python for calculations
- Classification framework
- Simulation or historical analysis for validation

---

## Behaviour Installed

### Success Indicators

- **SKU-specific thinking**
  - Recognition that one size doesn't fit all
  - Questions about SKU characteristics come naturally

- **DOI as control variable**
  - Understanding that DOI should vary by conditions
  - Ability to adjust DOI based on changing circumstances

- **Working capital awareness**
  - Recognition that inventory is tied-up capital
  - Questions about trade-offs between service and capital

---

## Key Concepts

### DOI Fundamentals

- Definition: inventory ÷ average daily demand
- Relationship to turns: 365 ÷ DOI
- Relationship to coverage: how long inventory lasts
- When to use DOI vs. turns vs. coverage

### SKU Classification

- Demand velocity: fast/medium/slow movers
- Value: high/low unit cost
- Criticality: service level requirements
- Risk: obsolescence, demand volatility, supply risk
- How classification drives DOI targets

### Adaptive DOI Management

- When to increase DOI: higher uncertainty, longer lead times, critical items
- When to decrease DOI: lower uncertainty, shorter lead times, working capital constraints
- Triggers for adjustment: demand shifts, lead-time changes, supply disruptions
- The balance between stability and responsiveness

### Inflation and DOI

- Real vs. nominal inventory value
- The cost of holding inventory during inflation
- When to hedge (increase DOI) vs. when to reduce (decrease DOI)
- Inflation-adjusted working capital calculations

---

## Tools and Techniques

- DOI calculation methods
- SKU classification frameworks
- Working capital allocation models
- Inventory turns analysis
- Python libraries: pandas for data analysis

---

**End of Module 3**
