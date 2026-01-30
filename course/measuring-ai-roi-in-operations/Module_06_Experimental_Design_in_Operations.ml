---
title: "Module 6: Experimental Design in Operations"
description: "Prove causality by designing experiments that work in operational environments"
module: "6"
order: 6
problem: "Correlation claims that don't prove AI caused the improvement"
capability: "Causal Attribution in Operations"
inspiration: "Randomized controlled trials and quasi-experimental design"
---

# Module 6: Experimental Design in Operations

**Problem:** Correlation claims that don't prove AI caused the improvement  
**Capability:** Causal Attribution in Operations  
**Inspiration:** Randomized controlled trials and quasi-experimental design

---

## Mindset Shift

**"Correlation is not causation — you need experiments to prove AI impact."**

---

## Learning Objectives

### A/B Testing Limitations

- When A/B testing works and when it doesn't
- Operational constraints that prevent true randomization
- Network effects that contaminate control groups
- Why A/B tests fail in supply chains
- The challenge of finding comparable groups
- When A/B testing is impossible or unethical

### Quasi-Experiments

- Difference-in-differences (DID) design
- Regression discontinuity design
- Instrumental variables
- When to use quasi-experiments vs A/B tests
- How to design quasi-experiments in operations
- Limitations and assumptions of quasi-experiments

### Before/After Traps

- Why simple before/after comparisons fail
- Confounding variables in time-series data
- Seasonality, trends, and external factors
- The regression to the mean problem
- Why "improvement after AI" doesn't prove causation
- How to avoid before/after traps

### Control Group Design in Supply Chains

- How to find valid control groups in operations
- Matching on observable characteristics
- Propensity score matching
- Synthetic control methods
- Why control groups are essential
- How to validate control group comparability

---

## Case Study

### Measuring AI Impact Without Stopping Operations

**Scenario:** A company deployed AI forecasting but couldn't stop operations to run a proper experiment.

**Analysis:**

1. **The Challenge**
   - AI deployed across all locations
   - No ability to create control group
   - Multiple simultaneous changes
   - External factors (market, seasonality)

2. **The Solution: Difference-in-Differences**
   - Identified similar locations that hadn't deployed AI yet
   - Compared changes in treated vs control locations
   - Controlled for time trends and external factors
   - Established causal attribution

3. **The Design**
   - Pre-period: Both groups similar
   - Post-period: Treated group improved, control didn't
   - Difference-in-differences: Isolated AI impact
   - Validated with multiple control groups

4. **The Result**
   - Proved AI caused 8% inventory reduction
   - Finance accepted the attribution
   - Confidence intervals established
   - Model used for future deployments

**Lessons:**
- Quasi-experiments work when A/B tests don't
- Control groups are essential, even if imperfect
- Multiple validation methods increase credibility
- Finance accepts causal proof, not correlation

---

## Practical Exercise

### Design an Experiment for Your AI System

**Objective:** Create an experimental design that proves AI causality.

**Steps:**

1. **Assess Experimental Feasibility**
   - Can you randomize? (A/B test possible?)
   - What are the operational constraints?
   - Are there network effects?
   - Is stopping operations possible?

2. **Choose Experimental Design**
   - A/B test if feasible
   - Quasi-experiment if not
   - Before/after only if no other option (with heavy caveats)

3. **Design Control Group**
   - Identify comparable units (locations, SKUs, time periods)
   - Match on observable characteristics
   - Validate comparability
   - Document selection criteria

4. **Define Treatment and Outcome**
   - Clear treatment definition (AI deployment)
   - Measurable outcome (inventory, service, cost)
   - Baseline period definition
   - Post-treatment period definition

5. **Plan Analysis**
   - Statistical test (t-test, regression, DID)
   - Confidence intervals
   - Sensitivity analysis
   - Alternative explanations to rule out

6. **Document Limitations**
   - What the experiment can and can't prove
   - Assumptions and their validity
   - External validity concerns
   - How to communicate limitations to finance

**Deliverables:**
- Experimental design document
- Control group selection criteria
- Analysis plan
- Limitations and assumptions
- Finance-ready attribution logic

### Example: Difference-in-Differences Design

**Setup:**
- Treated: 10 locations with AI forecasting
- Control: 10 similar locations without AI
- Pre-period: 6 months before AI deployment
- Post-period: 6 months after AI deployment

**Analysis:**
- Treated pre: 100 units inventory
- Treated post: 92 units inventory (8% reduction)
- Control pre: 98 units inventory
- Control post: 97 units inventory (1% reduction)
- Difference-in-differences: (92-100) - (97-98) = -8 - (-1) = -7 units
- AI impact: 7% inventory reduction (causal, not correlation)

---

## Behaviour Installed

### Success Indicators

- **Causal thinking**
  - Questions about causality come before correlation
  - Recognition that "improvement after AI" doesn't prove causation

- **Experimental design discipline**
  - Understanding when A/B tests work and when they don't
  - Ability to design quasi-experiments when needed

- **Control group awareness**
  - Recognition that control groups are essential
  - Questions about comparability and validity

- **Limitations honesty**
  - Understanding what experiments can and can't prove
  - Clear communication of assumptions and limitations

---

## Key Concepts

### A/B Testing Framework

- When A/B testing works (randomization possible)
- When A/B testing fails (operational constraints, network effects)
- How to design valid A/B tests in operations
- Limitations and assumptions

### Quasi-Experimental Designs

- Difference-in-differences (DID) design
- Regression discontinuity design
- Instrumental variables
- When to use each design
- How to implement in operations

### Before/After Analysis

- Why simple before/after comparisons fail
- Confounding variables in time-series data
- Seasonality, trends, and external factors
- When before/after is acceptable (with heavy caveats)
- How to strengthen before/after analysis

### Control Group Design

- How to find valid control groups
- Matching on observable characteristics
- Propensity score matching
- Synthetic control methods
- Validation of comparability

---

## Tools and Techniques

- Experimental design frameworks
- A/B testing methodologies
- Quasi-experimental design methods
- Statistical analysis tools
- Control group selection techniques

---

**End of Module 6**
