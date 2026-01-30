---
title: "Module 8: Real-Time Re-Routing & Disruption Management"
description: "React without chaos"
module: "8"
order: 8
problem: "Static routing fails when disruptions occur"
capability: "Dynamic Re-Routing and Disruption Response"
inspiration: "Real-time decision systems and disruption management"
---

# Module 8: Real-Time Re-Routing & Disruption Management

**Problem:** Static routing fails when disruptions occur  
**Capability:** Dynamic Re-Routing and Disruption Response  
**Inspiration:** Real-time decision systems and disruption management

---

## Mindset Shift

> "React without chaos. Disruptions are inevitable; chaos is optional."

---

## Learning Objectives

### When to Reroute vs Wait

- Reroute triggers: when disruption severity exceeds threshold
- Wait triggers: when disruption is temporary
- The cost of rerouting: switching costs, coordination
- The cost of waiting: delay costs, stockout risk
- Decision framework: reroute vs. wait

### Alert Thresholds

- Early warning: signals that predict disruptions
- Alert thresholds: when to trigger rerouting
- Severity levels: minor, moderate, severe disruptions
- Response time: how quickly to react
- The value of early intervention

### Human Overrides

- Automated rerouting: system makes decisions
- Human overrides: when humans intervene
- Override triggers: high-stakes decisions, edge cases
- The balance between automation and human judgment
- When human judgment adds value

### Avoiding Route Thrashing

- Route thrashing: frequent route changes
- Why thrashing is costly: coordination, confusion
- Stability rules: minimum time between reroutes
- Hysteresis: different thresholds for reroute vs. revert
- How to prevent thrashing while staying responsive

---

## Simulation Exercise

### Respond to Live Port Disruption Events

**Objective:** Build a real-time rerouting system that handles disruptions

**Steps:**

1. **Define Disruption Scenarios**
   - Scenario 1: Minor delay (2-day delay, temporary)
   - Scenario 2: Moderate delay (5-day delay, ongoing)
   - Scenario 3: Severe delay (10-day delay, indefinite)
   - Scenario 4: Port closure (indefinite, no ETA)

2. **Set Alert Thresholds**
   - Early warning: 1-day delay predicted
   - Minor alert: 2-day delay confirmed
   - Moderate alert: 5-day delay confirmed
   - Severe alert: 10-day delay or port closure

3. **Build Reroute Decision Framework**
   - Calculate reroute cost: switching + premium route cost
   - Calculate wait cost: delay cost + stockout risk
   - Compare reroute vs. wait
   - Decision rule: reroute if reroute cost < wait cost

4. **Implement Stability Rules**
   - Minimum time between reroutes: 24 hours
   - Hysteresis: reroute threshold (5 days) vs. revert threshold (2 days)
   - Stability check: prevent thrashing
   - Revert logic: when to return to original route

5. **Define Human Override Rules**
   - High-stakes: customer-critical shipments
   - Edge cases: unusual disruption patterns
   - Override process: human approval required
   - Automated decisions: routine disruptions

6. **Simulate Disruption Response**
   - Run simulation with disruption events
   - Track rerouting decisions
   - Measure response time
   - Calculate total cost (route + delays + reroutes)
   - Compare to static routing baseline

**Deliverables:**
- Real-time rerouting decision framework
- Alert threshold configuration
- Reroute vs. wait decision logic
- Stability rules to prevent thrashing
- Human override process
- Simulation results and cost analysis

---

## Discussion

### When Static Routing Fails

**Scenario Analysis:**

1. **The Set-and-Forget Failure**
   - Case: Routes set at planning, never updated
   - Reality: Disruptions occur frequently
   - Outcome: Ships wait at congested ports for days
   - Lesson: Static routing fails in dynamic environments

2. **The Over-Reaction Problem**
   - Case: Reroute on every minor delay
   - Reality: Most delays are temporary
   - Outcome: Route thrashing, high switching costs
   - Lesson: Stability rules prevent chaos

3. **The Automation Blindness**
   - Case: Fully automated rerouting
   - Reality: Edge cases require human judgment
   - Outcome: Poor decisions in high-stakes situations
   - Lesson: Human overrides add value

**Discussion Questions:**
- When have you seen static routing fail?
- What disruptions were not handled?
- What was the actual cost of the failure?
- How could real-time rerouting have helped?

---

## Behaviour Installed

### Success Indicators

- **Dynamic routing awareness**
  - Questions about disruption handling come naturally
  - Recognition that static routing fails
  - Understanding of reroute vs. wait trade-offs

- **Alert threshold thinking**
  - Ability to set appropriate alert thresholds
  - Questions about early warning signals
  - Recognition that early intervention matters

- **Stability awareness**
  - Understanding that thrashing is costly
  - Questions about stability rules
  - Ability to balance responsiveness and stability

---

## Key Concepts

### Reroute vs Wait Decision

- Reroute triggers: when disruption severity exceeds threshold
- Wait triggers: when disruption is temporary
- Cost comparison: reroute cost vs. wait cost
- Decision framework: minimize total cost
- When rerouting saves money

### Alert Thresholds

- Early warning: signals that predict disruptions
- Alert thresholds: when to trigger rerouting
- Severity levels: minor, moderate, severe
- Response time: how quickly to react
- The value of early intervention

### Route Thrashing Prevention

- Route thrashing: frequent route changes
- Why thrashing is costly: coordination, confusion
- Stability rules: minimum time between reroutes
- Hysteresis: different thresholds for reroute vs. revert
- How to prevent thrashing

---

## Tools and Techniques

- Real-time decision systems
- Alert threshold configuration
- Reroute decision frameworks
- Stability rule design
- Human override processes

---

**End of Module 8**
