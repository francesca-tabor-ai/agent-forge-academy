---
title: "Module 1: Why Production Scheduling Is Hard"
description: "Understand the system before solving it"
module: "1"
order: 1
problem: "Optimizing schedules without understanding the system"
capability: "Systems Understanding Before Optimization"
inspiration: "Operations research, systems thinking, and production management"
---

# Module 1: Why Production Scheduling Is Hard

**Problem:** Optimizing schedules without understanding the system  
**Capability:** Systems Understanding Before Optimization  
**Inspiration:** Operations research, systems thinking, and production management

---

## Mindset Shift

> "Understand the system before solving it. Perfect schedules fail in reality because reality is not deterministic."

---

## Learning Objectives

### Difference Between Planning and Scheduling

- **Planning:** Strategic decisions about what to produce, when, and in what quantities
- **Scheduling:** Tactical decisions about the exact sequence and timing of operations
- Why planning and scheduling are different problems
- How planning decisions constrain scheduling options
- The relationship between capacity planning and detailed scheduling
- When to replan vs. when to reschedule

### Deterministic vs Stochastic Systems

- **Deterministic models:** Assume perfect information and predictable behavior
- **Stochastic reality:** Uncertainty in processing times, machine availability, material delivery
- Why deterministic schedules fail in stochastic environments
- The gap between model assumptions and operational reality
- How uncertainty cascades through the system
- When to use deterministic vs. stochastic models

### Why Small Disruptions Cascade

- The butterfly effect in production systems
- How a 5-minute delay becomes a 2-hour problem
- Buffer depletion and constraint propagation
- Information delays amplify physical disruptions
- Why local fixes create global problems
- The difference between isolated and systemic disruptions

### Why "Optimal" Schedules Fail in Reality

- Optimal for the model, not for the system
- Overfitting to historical data
- Ignoring operator behavior and preferences
- Assuming perfect execution
- Missing hidden constraints
- The cost of optimality vs. the value of robustness

---

## Case Study

### Perfect Schedule Destroyed by One Late Delivery

**Scenario:** A production line has a perfectly optimized schedule for the week. Every machine is utilized, every changeover is minimized, every delivery is timed.

**The Disruption:** One critical raw material delivery arrives 4 hours late.

**What Happens:**
- The first operation waits for material
- Downstream operations are starved
- Operators start working on other jobs (local optimization)
- The schedule becomes irrelevant within 2 hours
- Rescheduling creates chaos as operators adapt
- The "optimal" schedule is now worse than a simple heuristic

**Key Lessons:**
- Schedules are fragile, not robust
- Local workarounds are rational responses
- Information about disruptions arrives late
- Rescheduling too frequently creates chaos
- Trust in the schedule erodes quickly

**Discussion Questions:**
- What made this schedule "optimal"?
- What assumptions did the scheduler make?
- How could the schedule have been more robust?
- When should the system have replanned vs. rescheduled?
- What would operators have done differently?

---

## Practical Exercise

### Map Your Production System's Reality

**Objective:** Build a systems understanding of a real production environment

**Steps:**

1. **Identify the System Boundaries**
   - What is included in "production"?
   - Where does planning end and scheduling begin?
   - What external factors affect scheduling?

2. **Document Sources of Uncertainty**
   - Machine breakdowns: frequency, duration, patterns
   - Material delivery: variability, lead times, quality issues
   - Labor availability: absenteeism, skill levels, preferences
   - Processing times: actual vs. planned, variability
   - Quality issues: rework, scrap, inspection delays

3. **Trace Disruption Cascades**
   - Pick a recent disruption
   - Map how it propagated through the system
   - Identify where buffers were depleted
   - Document how operators responded
   - Measure the time to recover

4. **Compare Model vs. Reality**
   - What does your scheduling model assume?
   - What constraints does it ignore?
   - What behaviors does it not account for?
   - Where is the gap between optimal and practical?

**Deliverables:**
- System map showing boundaries and external factors
- Uncertainty inventory with frequencies and impacts
- Disruption cascade analysis
- Gap analysis between model assumptions and reality
- List of "hidden" constraints that break optimal schedules

---

## Behaviour Installed

### Success Indicators

- **Systems thinking before optimization**
  - Questions about system boundaries and constraints come first
  - Recognition that optimal ≠ practical
  - Understanding of how disruptions propagate

- **Reality awareness**
  - Ability to identify sources of uncertainty
  - Recognition of the gap between models and reality
  - Questions about operator behavior and preferences

- **Robustness preference**
  - Preference for robust schedules over optimal ones
  - Understanding of when to replan vs. reschedule
  - Recognition that perfect schedules fail in reality

---

## Key Concepts

### Planning vs. Scheduling

- Planning: strategic, longer-term, aggregate decisions
- Scheduling: tactical, short-term, detailed sequencing
- The relationship between capacity planning and detailed scheduling
- When planning decisions constrain scheduling options

### Deterministic vs. Stochastic

- Deterministic models: perfect information, predictable behavior
- Stochastic reality: uncertainty, variability, disruptions
- Why deterministic schedules fail
- When to use each approach

### Disruption Cascades

- How small disruptions become large problems
- Buffer depletion and constraint propagation
- Information delays amplify physical disruptions
- The difference between isolated and systemic disruptions

### Optimal vs. Robust

- Optimal for the model vs. optimal for the system
- The cost of optimality vs. the value of robustness
- Why perfect schedules fail in reality
- When good enough beats optimal

---

## Tools and Techniques

- Systems mapping frameworks
- Uncertainty identification methods
- Disruption cascade analysis
- Gap analysis between models and reality
- Robustness evaluation techniques

---

**End of Module 1**
