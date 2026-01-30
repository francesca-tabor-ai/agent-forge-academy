---
title: "Module 2: Hierarchical Forecasting in the Real World"
description: "Handle structure without breaking consistency - SKU to region hierarchies"
module: "2"
order: 2
problem: "Forecast inconsistency across hierarchy levels"
capability: "Hierarchical Reconciliation"
inspiration: "Multi-level demand planning systems"
---

# Module 2: Hierarchical Forecasting in the Real World

**Problem:** Forecast inconsistency across hierarchy levels  
**Capability:** Hierarchical Reconciliation  
**Inspiration:** Multi-level demand planning systems

---

## Mindset Shift

> "Forecasts must be consistent across all levels — but consistency doesn't mean identical methods."

---

## Learning Objectives

### SKU → Category → Plant → Region Hierarchies

- Understanding hierarchical demand structures
- Why different levels need different approaches
- The aggregation paradox: sum of parts ≠ whole
- Cross-level dependencies and constraints
- Real-world hierarchy examples and challenges

### Top-Down vs Bottom-Up Forecasting

- Top-down: forecast at aggregate, disaggregate to detail
- Bottom-up: forecast at detail, aggregate to totals
- When each approach works and fails
- The trade-offs between methods
- Hybrid approaches and when to use them

### Reconciliation Methods and Trade-offs

- Simple aggregation (no reconciliation)
- Top-down reconciliation
- Bottom-up reconciliation
- Middle-out approaches
- Optimal reconciliation (minimize total error)
- The cost of reconciliation vs. inconsistency

### Where Hierarchy Leaks Information

- How aggregate patterns inform detail forecasts
- Using category trends to improve SKU forecasts
- Regional patterns that inform plant-level planning
- Information flow up and down the hierarchy
- When hierarchy creates spurious correlations

---

## Hands-On

### Build and Reconcile Forecasts Across Multiple Levels

**Objective:** Create consistent forecasts across a 3-level hierarchy

**Dataset:** Multi-SKU demand data with category and region structure

**Steps:**

1. **Define the Hierarchy**
   - Identify SKU, category, and region levels
   - Map relationships between levels
   - Document data availability at each level

2. **Forecast at Each Level Independently**
   - Build SKU-level forecasts (bottom-up)
   - Build category-level forecasts (aggregate)
   - Build region-level forecasts (aggregate)
   - Note inconsistencies

3. **Implement Reconciliation Methods**
   - Simple aggregation (baseline)
   - Top-down reconciliation
   - Bottom-up reconciliation
   - Optimal reconciliation (if applicable)

4. **Evaluate Consistency and Accuracy**
   - Measure forecast consistency across levels
   - Compare accuracy before and after reconciliation
   - Identify where reconciliation helps/hurts
   - Document trade-offs

5. **Use Hierarchy Information**
   - Use category trends to improve SKU forecasts
   - Use regional patterns to inform plant forecasts
   - Measure improvement from information sharing

**Deliverables:**
- Forecasts at all hierarchy levels
- Reconciliation implementation
- Consistency and accuracy analysis
- Information sharing analysis
- Recommendations for production use

---

## Behaviour Installed

### Success Indicators

- **Hierarchical thinking**
  - Natural consideration of multiple forecast levels
  - Questions about consistency and reconciliation

- **Method selection**
  - Ability to choose appropriate reconciliation approach
  - Understanding of trade-offs between methods

- **Information leverage**
  - Recognition of where hierarchy provides signal
  - Ability to use aggregate patterns to improve detail

---

## Key Concepts

### Hierarchical Structures

- Multi-level demand organization
- Aggregation relationships
- Cross-level dependencies
- Real-world hierarchy examples

### Forecasting Approaches

- Top-down forecasting
- Bottom-up forecasting
- Middle-out approaches
- Hybrid methods

### Reconciliation

- Why reconciliation is necessary
- Reconciliation methods and algorithms
- Consistency vs. accuracy trade-offs
- Optimal reconciliation strategies

### Information Flow

- How hierarchy creates information
- Using aggregate patterns for detail
- Avoiding spurious correlations
- Information leakage and signal

---

## Tools and Techniques

- Hierarchical forecasting frameworks
- Reconciliation algorithms
- Consistency metrics
- Information sharing methods
- Multi-level evaluation approaches

---

**End of Module 2**
