---
title: "Module 4: Feedback Loops That Actually Work"
description: "Turn usage into learning — design low-friction feedback that closes the loop"
module: "4"
order: 4
problem: "Feedback loops are designed but never close — usage doesn't become learning"
capability: "Feedback Loop Design"
inspiration: "Product feedback systems and continuous learning"
---

# Module 4: Feedback Loops That Actually Work

**Problem:** Feedback loops are designed but never close — usage doesn't become learning  
**Capability:** Feedback Loop Design  
**Inspiration:** Product feedback systems and continuous learning

---

## Mindset Shift

> "Feedback that isn't acted on is worse than no feedback."

---

## Learning Objectives

### Explicit vs Implicit Feedback

- **Explicit feedback:** Operators actively provide input
  - Pros: Clear signal, operator intent captured
  - Cons: Requires effort, may be biased, low response rates

- **Implicit feedback:** System infers from operator behavior
  - Pros: No operator effort, captures real behavior
  - Cons: Ambiguous signal, may misinterpret behavior

- When to use explicit vs. implicit
- How to combine both for richer signals
- Designing for both types simultaneously

### Feedback Latency

- **Real-time:** Feedback affects next recommendation immediately
- **Near-term:** Feedback affects recommendations within hours/days
- **Long-term:** Feedback affects model retraining over weeks/months

- The cost of latency: operators lose trust if feedback isn't reflected
- How to show operators their feedback matters (even before model updates)
- Designing feedback loops with appropriate latency for each use case

### Closing the Loop Without Annoying Users

- How to show operators their feedback was used
- When to notify vs. when to silently improve
- Avoiding feedback fatigue: don't ask for feedback too often
- Making feedback feel valuable, not burdensome
- Designing feedback requests that feel like partnership

### Avoiding Feedback Gaming

- When operators game feedback systems
- Why gaming happens: incentives, misunderstanding, frustration
- How to detect gaming: patterns, anomalies, validation
- Designing feedback systems that are hard to game
- When gaming reveals system problems (not operator problems)

---

## Exercise

### Design a Low-Friction Feedback Loop

**Objective:** Create a feedback system that operators actually use and that improves the model

**Scenario:**
- Choose a real AI system (or design one)
- Identify what you need to learn from operators
- Design feedback capture and loop closure

**Steps:**

1. **Identify Feedback Needs**
   - What do you need to learn?
   - What signals would improve the model?
   - What would operators naturally know?

2. **Design Feedback Capture**
   - **Explicit:** What to ask, when to ask, how to ask
     - UI/UX: buttons, sliders, text, ratings
     - Timing: immediate, delayed, periodic
     - Friction: minimize effort, maximize value
   
   - **Implicit:** What behavior signals to capture
     - Usage patterns: what operators do vs. what model recommends
     - Override patterns: when and why operators override
     - Time-to-action: how quickly operators act on recommendations

3. **Design Loop Closure**
   - How feedback affects recommendations
   - How to show operators their feedback matters
   - When to update model vs. when to adjust UI
   - How to measure if loop is actually closing

4. **Test for Gaming**
   - How could operators game this system?
   - What patterns would indicate gaming?
   - How to validate feedback quality?
   - How to make gaming unprofitable?

5. **Measure Feedback Loop Health**
   - Feedback rate: how often do operators provide feedback?
   - Feedback quality: is feedback useful for learning?
   - Loop closure: does feedback actually improve system?
   - Operator satisfaction: do operators feel heard?

**Deliverables:**
- Feedback capture design (explicit + implicit)
- Loop closure mechanism
- Gaming prevention strategy
- Feedback loop health metrics
- Implementation plan

---

## Behaviour Installed

### Success Indicators

- **Feedback is natural**
  - Operators provide feedback without thinking
  - Feedback capture feels like partnership, not burden

- **Loop actually closes**
  - Feedback leads to visible improvements
  - Operators see their input matters

- **Continuous learning**
  - System improves from usage
  - Feedback patterns drive model updates

---

## Key Concepts

### Feedback Types

- **Explicit:** Ratings, corrections, explanations, preferences
- **Implicit:** Usage patterns, override behavior, time-to-action, abandonment
- **Hybrid:** Combine explicit and implicit for richer signals

### Feedback Latency

- **Real-time:** Immediate effect on recommendations
- **Near-term:** Effect within hours/days (UI adjustments, feature flags)
- **Long-term:** Effect over weeks/months (model retraining)

### Loop Closure Design

- Show operators their feedback matters
- Make improvements visible
- Close the loop quickly enough to maintain trust
- Measure loop closure effectiveness

### Gaming Prevention

- Validate feedback quality
- Detect gaming patterns
- Make gaming unprofitable
- Address root causes (why operators game)

---

## Tools and Techniques

- Feedback capture UI patterns
- Implicit feedback signal extraction
- Loop closure mechanisms
- Gaming detection methods
- Feedback loop health metrics

---

**End of Module 4**
