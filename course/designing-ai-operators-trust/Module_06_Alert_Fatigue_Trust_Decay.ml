---
title: "Module 6: Alert Fatigue & Trust Decay"
description: "Prevent system abandonment — design alerting that maintains trust"
module: "6"
order: 6
problem: "Alert fatigue causes operators to ignore or disable AI systems"
capability: "Trust-Preserving Alert Design"
inspiration: "Control room design and human factors"
---

# Module 6: Alert Fatigue & Trust Decay

**Problem:** Alert fatigue causes operators to ignore or disable AI systems  
**Capability:** Trust-Preserving Alert Design  
**Inspiration:** Control room design and human factors

---

## Mindset Shift

> "Every alert that's ignored is trust lost."

---

## Learning Objectives

### Alert Thresholds

- **Too sensitive:** Too many alerts, most are false positives
  - Result: Operators ignore alerts, miss real issues
  - Trust cost: Operators lose faith in system

- **Too insensitive:** Too few alerts, miss real issues
  - Result: Operators miss problems, system seems useless
  - Trust cost: Operators don't trust system to catch issues

- How to set thresholds that balance sensitivity and specificity
- The cost of false positives vs. false negatives
- Dynamic thresholds: adjusting based on context and operator feedback

### False Positives vs Missed Signals

- **False positives:** Alert fires but no action needed
  - Cost: Operator time, trust erosion, alert fatigue
  - Learning: Why did model think action was needed?

- **Missed signals:** Real issue but no alert
  - Cost: Problem escalates, operator discovers manually
  - Learning: Why did model miss this?

- The asymmetry: false positives erode trust faster than missed signals
- How to reduce both without trading one for the other
- Using operator feedback to tune thresholds

### Silent Failure Modes

- **System fails silently:** Model stops working but no one notices
  - Operators continue using system, making decisions on stale/broken outputs
  - Trust cost: Operators discover failure after making bad decisions

- **Model degrades silently:** Performance drops but no alert
  - Operators lose trust gradually, don't know why
  - Trust cost: Operators abandon system without understanding why

- How to detect and alert on silent failures
- Health checks and monitoring for AI systems
- Designing systems that fail loudly, not silently

### Trust Recovery After Errors

- **Error happens:** Model makes mistake, operator discovers it
- **Trust is damaged:** Operator loses confidence in system
- **Recovery process:** How to rebuild trust after error

- Acknowledging errors: don't hide mistakes
- Explaining errors: what went wrong, why, how it's fixed
- Showing improvement: demonstrate system learned from error
- Time to recovery: how long until trust is restored

---

## Simulation

### Tune Alerting Under Noisy Conditions

**Objective:** Design alert thresholds that maintain trust in noisy environments

**Scenario:**
- Simulate an operational environment with:
  - High noise: many false signals
  - Real issues: occasional real problems
  - Operator constraints: limited attention, competing priorities

**Steps:**

1. **Define Alert Scenarios**
   - Real issues that need alerts
   - Noise that shouldn't trigger alerts
   - Edge cases and ambiguous situations

2. **Design Initial Thresholds**
   - Set sensitivity/specificity targets
   - Define alert conditions
   - Design alert prioritization (critical, warning, info)

3. **Simulate Alert Behavior**
   - Run scenarios: real issues, false positives, noise
   - Measure: alert rate, false positive rate, missed signal rate
   - Calculate: operator attention cost, trust impact

4. **Tune Thresholds**
   - Adjust based on false positive feedback
   - Adjust based on missed signal discovery
   - Balance sensitivity vs. specificity
   - Consider operator capacity and attention

5. **Design Alert UI/UX**
   - How to present alerts: urgency, context, actionability
   - How to prioritize: critical vs. warning vs. info
   - How to reduce noise: grouping, filtering, smart defaults
   - How to enable operator control: snooze, dismiss, adjust thresholds

6. **Design Trust Recovery**
   - What happens when alert is wrong?
   - How to acknowledge and explain false positives?
   - How to show system learned from feedback?
   - How to rebuild trust after errors?

**Deliverables:**
- Alert threshold design
- Alert UI/UX mockup
- False positive reduction strategy
- Missed signal detection plan
- Trust recovery process
- Alert tuning guidelines

---

## Behaviour Installed

### Success Indicators

- **Alerts are trusted**
  - Operators act on alerts without hesitation
  - False positive rate is low enough to maintain trust

- **No alert fatigue**
  - Operators don't ignore or disable alerts
  - Alert volume matches operator capacity

- **Trust recovery**
  - System recovers from errors quickly
  - Operators maintain trust through failures

---

## Key Concepts

### Alert Design Principles

- **Right sensitivity:** Catch real issues without false positives
- **Right prioritization:** Critical alerts get attention
- **Right presentation:** Clear, actionable, contextual
- **Right control:** Operators can tune and manage alerts

### Trust Dynamics

- False positives erode trust faster than missed signals
- Silent failures destroy trust permanently
- Trust recovery requires acknowledgment, explanation, improvement
- Alert fatigue is a trust killer

### Threshold Tuning

- Start conservative, tune based on feedback
- Balance sensitivity vs. specificity
- Consider operator capacity and attention
- Use operator feedback to improve thresholds

---

## Tools and Techniques

- Alert threshold design frameworks
- False positive reduction methods
- Alert prioritization systems
- Trust recovery processes
- Alert UI/UX patterns

---

**End of Module 6**
