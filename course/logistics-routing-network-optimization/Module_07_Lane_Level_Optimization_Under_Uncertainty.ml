---
title: "Module 7: Lane-Level Optimization Under Uncertainty"
description: "Make robust decisions under uncertainty"
module: "7"
order: 7
problem: "Deterministic optimization fails when transit times are uncertain"
capability: "Robust Optimization Under Uncertainty"
inspiration: "Stochastic optimization and robust decision-making"
---

# Module 7: Lane-Level Optimization Under Uncertainty

**Problem:** Deterministic optimization fails when transit times are uncertain  
**Capability:** Robust Optimization Under Uncertainty  
**Inspiration:** Stochastic optimization and robust decision-making

---

## Mindset Shift

> "Optimize for robustness, not optimality. Uncertainty is the real constraint."

---

## Learning Objectives

### Scenario-Based Routing

- Deterministic routing: single transit time assumption
- Scenario-based routing: multiple transit time scenarios
- Why scenarios matter more than point estimates
- How to generate realistic scenarios
- When to use optimistic vs. pessimistic scenarios

### Stochastic Travel Times

- Deterministic travel times: fixed transit time
- Stochastic travel times: probability distribution of transit times
- Why stochastic modeling is essential
- How to model travel time uncertainty
- The difference between expected and worst-case

### Tail-Risk Management

- Tail risk: probability of extreme delays
- Why tail risk matters more than average performance
- How to quantify and manage tail risk
- Stop-loss rules: when to avoid high-risk routes
- The cost of ignoring tail risk

### Stop-Loss Rules for Routing

- Stop-loss: maximum acceptable delay risk
- Risk thresholds: P95, P99 delay limits
- When to reject routes based on risk
- The trade-off between risk and cost
- How stop-loss rules prevent catastrophic failures

---

## Hands-On Exercise

### Optimize Lane Selection with Uncertain Transit Times

**Objective:** Build a robust optimization model that handles uncertainty

**Steps:**

1. **Define Lane Options**
   - Lane A: $1000, P50: 5 days, P95: 10 days
   - Lane B: $1200, P50: 6 days, P95: 8 days
   - Lane C: $1500, P50: 7 days, P95: 9 days

2. **Generate Scenarios**
   - Scenario 1: Optimistic (P25 transit times)
   - Scenario 2: Baseline (P50 transit times)
   - Scenario 3: Pessimistic (P75 transit times)
   - Scenario 4: Worst-case (P95 transit times)

3. **Build Stochastic Model**
   - Objective: Minimize expected total cost
   - Total cost = route cost + delay cost
   - Delay cost = probability × cost per day
   - Expected cost = sum(scenario probability × scenario cost)

4. **Build Robust Model**
   - Objective: Minimize worst-case cost
   - Worst-case: maximum cost across scenarios
   - Robust solution: performs well in all scenarios
   - Compare to expected value solution

5. **Apply Stop-Loss Rules**
   - Risk threshold: P95 delay < 12 days
   - Reject lanes that exceed threshold
   - Re-optimize with remaining lanes
   - Compare solutions with and without stop-loss

6. **Compare Optimization Approaches**
   - Deterministic: Use P50 transit times
   - Expected value: Minimize expected cost
   - Robust: Minimize worst-case cost
   - Stop-loss: Reject high-risk lanes
   - Document when each approach is best

**Deliverables:**
- Stochastic optimization model
- Scenario generation framework
- Robust optimization implementation
- Stop-loss rule analysis
- Comparison: deterministic vs. stochastic vs. robust

---

## Discussion

### When Deterministic Optimization Fails

**Scenario Analysis:**

1. **The P50 Assumption Failure**
   - Case: Optimize using P50 transit times
   - Reality: P95 delays are 3x P50 delays
   - Outcome: Frequent stockouts due to tail risk
   - Lesson: Average performance hides tail risk

2. **The Expected Value Trap**
   - Case: Optimize for expected cost
   - Reality: Worst-case cost is 10x expected cost
   - Outcome: Catastrophic failures despite good average
   - Lesson: Expected value ≠ robust solution

3. **The Risk Blindness**
   - Case: No stop-loss rules for high-risk routes
   - Reality: Some routes have extreme tail risk
   - Outcome: Occasional catastrophic delays
   - Lesson: Stop-loss rules prevent disasters

**Discussion Questions:**
- When have you seen deterministic optimization fail?
- What tail risks were ignored?
- What was the actual cost of the failure?
- How could robust optimization have helped?

---

## Behaviour Installed

### Success Indicators

- **Uncertainty-aware optimization**
  - Questions about transit time distributions come naturally
  - Recognition that deterministic models fail
  - Understanding of stochastic vs. robust optimization

- **Scenario thinking**
  - Ability to generate realistic scenarios
  - Questions about optimistic vs. pessimistic cases
  - Preference for robust solutions

- **Tail-risk awareness**
  - Understanding that tail risk matters
  - Questions about P95, P99 delays
  - Ability to apply stop-loss rules

---

## Key Concepts

### Scenario-Based Routing

- Deterministic routing: single transit time assumption
- Scenario-based routing: multiple transit time scenarios
- Scenario generation: optimistic, baseline, pessimistic, worst-case
- When scenarios matter: high uncertainty, high stakes
- Robust solutions: perform well across scenarios

### Stochastic Travel Times

- Deterministic travel times: fixed transit time
- Stochastic travel times: probability distribution
- Expected value: average cost across scenarios
- Worst-case: maximum cost across scenarios
- The difference between expected and robust

### Tail-Risk Management

- Tail risk: probability of extreme delays
- Why tail risk matters: catastrophic failures
- Quantifying tail risk: P95, P99 delays
- Stop-loss rules: maximum acceptable risk
- The cost of ignoring tail risk

---

## Tools and Techniques

- Stochastic optimization algorithms
- Scenario generation methods
- Robust optimization frameworks
- Tail-risk quantification
- Stop-loss rule design

---

**End of Module 7**
