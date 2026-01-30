---
title: "Module 7: Why Naïve AI Models Fail in Operations"
description: "Connect system understanding to modeling mistakes"
module: "7"
order: 7
problem: "AI models that ignore physical, economic, and human constraints"
capability: "Operations-Aware AI Modeling"
inspiration: "Failed AI deployments and operations research"
---

# Module 7: Why Naïve AI Models Fail in Operations

**Problem:** AI models that ignore physical, economic, and human constraints  
**Capability:** Operations-Aware AI Modeling  
**Inspiration:** Failed AI deployments and operations research

---

## Mindset Shift

> "A model that doesn't respect the system will fail, no matter how sophisticated the algorithm."

---

## Learning Objectives

### Static Assumptions in Dynamic Systems

- Why models assume static conditions
- How operations are inherently dynamic
- The gap between model assumptions and reality
- When static models break
- How to build dynamic awareness

### Feedback Loops Ignored by ML

- How operations have feedback loops
- Why ML models often ignore feedback
- Positive vs. negative feedback
- How feedback creates unexpected behavior
- Modeling feedback in ML systems

### Optimizing Metrics That Don't Map to Decisions

- Common ML metrics (accuracy, RMSE, etc.)
- What operations actually care about
- What operations actually need
- The gap between model metrics and business outcomes
- How to align metrics with decisions

### When Simple Heuristics Beat Complex Models

- Why complex models fail in operations
- When simple rules work better
- The value of interpretability
- Human overrides and exceptions
- Combining heuristics with ML

---

## Discussion

### Post-Mortem of Failed AI Deployments in Operations

**Case Study 1: Demand Forecasting Model**

**What Happened:**
- ML model for demand forecasting
- High accuracy on historical data
- Failed in production

**Why It Failed:**
- Model optimized for RMSE, not business outcomes
- Ignored promotional calendar
- Didn't account for supply constraints
- Forecasts were too late for planning
- No human override mechanism

**Lessons:**
- Accuracy metrics don't equal business value
- Need to account for business context
- Timing matters more than precision
- Humans need to be able to override

**Case Study 2: Inventory Optimization Model**

**What Happened:**
- AI model to optimize inventory levels
- Reduced inventory by 30%
- Created stockouts and lost sales

**Why It Failed:**
- Model assumed perfect supplier reliability
- Ignored lead time variability
- Optimized for cost, not service level
- Didn't account for demand uncertainty
- No buffer for unexpected events

**Lessons:**
- Need to model uncertainty, not just averages
- Service level matters more than cost
- Supplier reliability is critical
- Need safety buffers

**Case Study 3: Production Scheduling Model**

**What Happened:**
- ML model for production scheduling
- Optimized for efficiency
- Created bottlenecks and delays

**Why It Failed:**
- Model optimized local efficiency, not system throughput
- Ignored capacity constraints
- Didn't account for setup times
- Assumed perfect information
- No flexibility for changes

**Lessons:**
- System thinking beats local optimization
- Constraints matter
- Need flexibility and adaptability
- Perfect information doesn't exist

**Common Patterns:**
1. Optimizing wrong metrics
2. Ignoring constraints
3. Assuming static conditions
4. No human override
5. Perfect information assumptions
6. Local vs. system optimization

---

## Practical Exercise

### Design an Operations-Aware Model

**Objective:** Apply systems understanding to model design

**Scenario:** Choose one:
- Demand forecasting
- Inventory optimization
- Production scheduling
- Supplier selection

**Design Requirements:**

1. **System Understanding**
   - Map the operational system
   - Identify constraints (physical, economic, human)
   - Document feedback loops
   - Understand decision context

2. **Model Design**
   - What will the model predict/optimize?
   - What constraints must it respect?
   - How will it handle uncertainty?
   - What feedback loops exist?

3. **Metrics Alignment**
   - What metrics matter for decisions?
   - How to measure business outcomes?
   - What's the cost of being wrong?
   - How to balance competing objectives?

4. **Human Integration**
   - Where do humans need to override?
   - How to make model interpretable?
   - What exceptions need handling?
   - How to build trust?

5. **Robustness**
   - How to handle data quality issues?
   - What happens when assumptions break?
   - How to monitor for problems?
   - When to fall back to heuristics?

**Deliverables:**
- System map
- Model design document
- Metrics definition
- Human integration plan
- Robustness strategy

---

## Behaviour Installed

### Success Indicators

- **Systems-aware modeling**
  - Questions about constraints and feedback
  - Recognition that metrics must align with decisions

- **Pragmatic approach**
  - Understanding when simple beats complex
  - Focus on business outcomes, not model metrics

- **Human-centered design**
  - Questions about human overrides and exceptions
  - Building interpretable, trustworthy models

---

## Key Concepts

### Static vs. Dynamic Systems

- Operations are dynamic
- Models often assume static conditions
- Need to model change and adaptation
- Time-dependent behavior
- Feedback and learning

### Feedback Loops

- Positive feedback (amplification)
- Negative feedback (stabilization)
- How feedback creates unexpected behavior
- Modeling feedback in ML
- Control theory principles

### Metrics Alignment

- ML metrics vs. business metrics
- What operations actually care about
- Cost of being wrong
- Balancing competing objectives
- Measuring business outcomes

### Heuristics vs. ML

- When simple rules work better
- The value of interpretability
- Human overrides and exceptions
- Combining approaches
- Knowing when to use what

### Model Robustness

- Handling data quality issues
- When assumptions break
- Monitoring and alerting
- Fallback strategies
- Graceful degradation

---

## Tools and Techniques

- Systems thinking for ML
- Constraint-based optimization
- Uncertainty quantification
- Interpretable ML
- Human-in-the-loop systems
- Model monitoring
- A/B testing for operations

---

**End of Module 7**
