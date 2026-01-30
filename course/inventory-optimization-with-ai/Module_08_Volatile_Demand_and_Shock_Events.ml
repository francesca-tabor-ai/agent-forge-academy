---
title: "Module 8: Volatile Demand & Shock Events"
description: "Prevent catastrophic errors during demand shocks and regime shifts"
module: "8"
order: 8
problem: "AI systems fail during demand shocks and regime shifts"
capability: "Shock-Resistant Inventory Systems"
inspiration: "Crisis management and adaptive systems"
---

# Module 8: Volatile Demand & Shock Events

**Problem:** AI systems fail during demand shocks and regime shifts  
**Capability:** Shock-Resistant Inventory Systems  
**Inspiration:** Crisis management and adaptive systems

---

## Mindset Shift

> "Demand shocks break AI systems — design for failure modes and human overrides."

---

## Learning Objectives

### Demand Shocks vs Regime Shifts

- Demand shock: temporary spike or drop (event-driven)
- Regime shift: permanent change in demand pattern (structural)
- Why AI systems fail: trained on historical data, can't handle new patterns
- How to detect: sudden changes, pattern breaks
- How to respond: different strategies for shocks vs. shifts

### Panic Buying and False Demand

- Panic buying: temporary demand spike (not real demand)
- False demand: orders that will be cancelled
- Why it's dangerous: build inventory for demand that disappears
- How to detect: order patterns, cancellation rates
- How to protect: order limits, cancellation tracking

### AI Failure Modes During Shocks

- Extrapolation errors: AI assumes trends continue
- Historical bias: AI trained on normal periods
- Feedback loops: AI reinforces wrong signals
- Overreaction: AI over-orders during spikes
- Underreaction: AI doesn't respond to real shifts
- How to prevent: anomaly detection, human oversight

### Human Overrides During Crises

- When to override: AI fails, crisis mode, uncertainty too high
- How to override: manual orders, policy changes, system shutdowns
- Who can override: roles, permissions, escalation
- Override design: easy to use, hard to abuse
- Learning from overrides: improve AI based on human decisions

---

## Post-mortem

### Inventory Collapse During Sudden Demand Spikes

**Scenario:**

A company experiences sudden demand spike:
- Normal demand: 1,000 units/week
- Spike demand: 5,000 units/week (5x increase)
- AI system: trained on historical data (normal periods)
- Inventory: 2,000 units (2 weeks normal coverage, 0.4 weeks spike coverage)

**What Happened:**

1. **Week 1: Spike Begins**
   - Demand jumps to 5,000 units
   - AI system: sees trend, forecasts 1,200 units (slight increase)
   - Result: Inventory depletes rapidly

2. **Week 2: Stockout**
   - Inventory: 0 units
   - Demand: 5,000 units
   - Stockout: 5,000 units (100% stockout rate)
   - Production stops, customers lost

3. **Week 3: Overreaction**
   - AI system: sees high demand, forecasts 6,000 units
   - Orders: 30,000 units (6 weeks coverage)
   - Result: Massive over-order

4. **Week 4: Demand Returns to Normal**
   - Demand: 1,000 units/week
   - Inventory: 25,000 units (25 weeks coverage)
   - Result: Massive overstock, working capital tied up

**Post-Mortem Analysis:**

1. **Why AI Failed**
   - Trained on normal periods, can't handle shocks
   - Extrapolation: assumes trends continue
   - No anomaly detection: didn't flag sudden change
   - No human override: system ran autonomously

2. **What Should Have Happened**
   - Anomaly detection: flag sudden demand change
   - Human review: escalate to planner
   - Manual override: increase orders immediately
   - Gradual adjustment: don't overreact

3. **How to Prevent**
   - Anomaly detection: flag unusual patterns
   - Human-in-the-loop: require approval for large changes
   - Override mechanisms: easy manual intervention
   - Shock protocols: predefined responses to crises

4. **Lessons Learned**
   - AI systems need human oversight during crises
   - Anomaly detection is critical
   - Override mechanisms must be easy to use
   - Gradual adjustment beats overreaction

**Deliverables:**
- Failure analysis: why AI failed
- Corrective actions: what should have happened
- Prevention measures: how to prevent next time
- Shock protocols: predefined crisis responses

---

## Behaviour Installed

### Success Indicators

- **Shock awareness**
  - Recognition that AI systems fail during shocks
  - Questions about anomaly detection and override mechanisms

- **Human-in-the-loop thinking**
  - Understanding that AI needs human oversight during crises
  - Questions about override design and permissions

- **Failure mode awareness**
  - Recognition of AI failure modes: extrapolation, bias, feedback loops
  - Ability to design systems that prevent failures

---

## Key Concepts

### Demand Shocks vs Regime Shifts

- Demand shock: temporary spike or drop
- Regime shift: permanent change in pattern
- Why AI fails: trained on historical data
- How to detect: sudden changes, pattern breaks
- How to respond: different strategies

### Panic Buying and False Demand

- Panic buying: temporary spike
- False demand: orders that cancel
- Why dangerous: build inventory for demand that disappears
- How to detect: order patterns, cancellation rates
- How to protect: order limits, tracking

### AI Failure Modes

- Extrapolation errors: assumes trends continue
- Historical bias: trained on normal periods
- Feedback loops: reinforces wrong signals
- Overreaction: over-orders during spikes
- Underreaction: doesn't respond to shifts
- Prevention: anomaly detection, human oversight

### Human Overrides

- When to override: AI fails, crisis mode, high uncertainty
- How to override: manual orders, policy changes
- Who can override: roles, permissions, escalation
- Override design: easy to use, hard to abuse
- Learning: improve AI from human decisions

---

## Tools and Techniques

- Anomaly detection algorithms
- Regime shift detection
- Human-in-the-loop system design
- Override mechanism design
- Crisis response protocols
- Python libraries: scikit-learn for anomaly detection

---

**End of Module 8**
