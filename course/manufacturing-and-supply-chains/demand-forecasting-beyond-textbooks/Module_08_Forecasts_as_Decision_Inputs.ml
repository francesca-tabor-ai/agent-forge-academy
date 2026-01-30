---
title: "Module 8: Forecasts as Decision Inputs"
description: "Tie forecasts directly to action - inventory, service levels, custom loss functions"
module: "8"
order: 8
problem: "Forecasts optimized for accuracy don't optimize decisions"
capability: "Decision-Optimal Forecasting"
inspiration: "Operations research and decision science"
---

# Module 8: Forecasts as Decision Inputs

**Problem:** Forecasts optimized for accuracy don't optimize decisions  
**Capability:** Decision-Optimal Forecasting  
**Inspiration:** Operations research and decision science

---

## Mindset Shift

> "Optimize for decisions, not accuracy — the best forecast is the one that leads to the best outcome."

---

## Learning Objectives

### Inventory and Service-Level Impacts

- How forecasts drive inventory decisions
- Service level targets and safety stock
- The relationship between forecast error and inventory
- Asymmetric costs of over/under-forecasting
- Why accuracy metrics miss the point

### Cost of Over-Forecasting vs Under-Forecasting

- Over-forecasting: excess inventory, obsolescence, carrying costs
- Under-forecasting: stockouts, lost sales, customer dissatisfaction
- Asymmetric cost structures
- Industry-specific cost profiles
- Why symmetric metrics fail

### Custom Loss Functions

- Why MSE/MAE don't match business costs
- Designing loss functions from business objectives
- Asymmetric loss functions
- Quantile loss for inventory decisions
- Multi-objective loss functions

### Threshold-Based Decision Rules

- How forecasts trigger actions
- Setting decision thresholds
- Using forecast uncertainty in thresholds
- Adaptive thresholds
- Multi-threshold systems

---

## Hands-On

### Optimize Inventory Decisions Using Forecast Ranges

**Objective:** Build a forecasting system optimized for inventory decisions

**Scenario:** Multi-SKU inventory management with service level targets

**Steps:**

1. **Define Decision Problem**
   - Inventory decision rules
   - Service level targets
   - Cost structure (over/under stock)
   - Lead times and constraints
   - Business objectives

2. **Map Forecasts to Decisions**
   - How forecasts inform order quantities
   - How uncertainty affects decisions
   - Threshold-based rules
   - Safety stock calculations
   - Reorder point logic

3. **Design Custom Loss Function**
   - Quantify cost of forecast errors
   - Asymmetric cost structure
   - Service level implications
   - Design loss function from costs
   - Test loss function properties

4. **Train Forecast Model with Custom Loss**
   - Optimize for decision loss, not accuracy
   - Compare with accuracy-optimized model
   - Measure decision performance
   - Test robustness
   - Validate on out-of-sample data

5. **Evaluate Decision Outcomes**
   - Simulate inventory decisions
   - Measure service levels achieved
   - Calculate total costs
   - Compare decision-optimized vs. accuracy-optimized
   - Document business impact

**Deliverables:**
- Decision problem definition
- Custom loss function
- Decision-optimized forecast model
- Decision outcome simulation
- Business impact analysis
- Recommendations for production

---

## Behaviour Installed

### Success Indicators

- **Decision-first optimization**
  - Questions about how forecasts will be used
  - Natural consideration of business costs

- **Loss function thinking**
  - Ability to design custom loss functions
  - Understanding of asymmetric costs

- **Outcome focus**
  - Measurement of decision outcomes
  - Preference for business metrics over accuracy

---

## Key Concepts

### Decision Mapping

- How forecasts drive actions
- Decision rules and thresholds
- Service level targets
- Inventory policies
- Multi-decision systems

### Cost Structures

- Over-forecasting costs
- Under-forecasting costs
- Asymmetric cost profiles
- Industry-specific costs
- Total cost of forecast errors

### Custom Loss Functions

- Why standard metrics fail
- Designing from business objectives
- Asymmetric loss functions
- Quantile loss
- Multi-objective optimization

### Decision Optimization

- Optimizing for decisions vs. accuracy
- Decision outcome simulation
- Service level achievement
- Cost minimization
- Business impact measurement

---

## Tools and Techniques

- Custom loss function design
- Decision simulation
- Inventory optimization
- Service level modeling
- Business impact analysis

---

**End of Module 8**
