---
title: "Module 8: Shipping AI as a Product"
description: "Move from model to habit — design rollout and degradation that builds trust"
module: "8"
order: 8
problem: "AI systems are deployed but never become part of operator workflow"
capability: "AI Product Rollout Design"
inspiration: "Product launch and gradual rollout strategies"
---

# Module 8: Shipping AI as a Product

**Problem:** AI systems are deployed but never become part of operator workflow  
**Capability:** AI Product Rollout Design  
**Inspiration:** Product launch and gradual rollout strategies

---

## Mindset Shift

> "Deployment is the beginning, not the end."

---

## Learning Objectives

### Progressive Rollout

- **Start small:** Limited scope, low risk, high support
  - Benefits: Learn quickly, build trust, iterate safely
  - Pattern: Single team → multiple teams → organization-wide

- **Expand gradually:** Increase scope as trust builds
  - When to expand: Trust metrics positive, operators requesting
  - When to pause: Trust issues, adoption problems, errors

- **Rollback capability:** Ability to revert if problems arise
  - Design: Feature flags, gradual rollout controls
  - Trust: Operators know they can revert, builds confidence

- How to design progressive rollout
- When to accelerate vs. when to slow down
- How to communicate rollout progress

### Shadow Mode Testing

- **Shadow mode:** AI makes recommendations but operators don't see them
  - Purpose: Test model performance without operator impact
  - Benefit: Learn about model behavior in real conditions

- **Comparison mode:** AI recommendations shown alongside operator decisions
  - Purpose: Compare AI vs. operator decisions
  - Benefit: Build trust through comparison, identify gaps

- **Gradual exposure:** Start shadow, move to comparison, then to active
  - Pattern: Shadow → comparison → advisory → autonomous
  - Trust: Each stage builds trust before next stage

- How to design shadow mode testing
- What to learn from shadow mode
- When to move from shadow to active

### Kill Switches

- **Emergency kill switch:** Immediately disable AI system
  - When: Critical errors, safety issues, trust breakdown
  - Design: Easy to trigger, immediate effect, clear communication

- **Gradual degradation:** Reduce AI influence instead of full shutdown
  - When: Performance issues, trust concerns, but not critical
  - Design: Reduce confidence thresholds, limit scope, add human checks

- **Selective disable:** Disable specific features or recommendations
  - When: Some features work, others don't
  - Design: Granular control, operator choice

- How to design kill switches
- When to use each type
- How to communicate kill switch usage

### Designing for Graceful Degradation

- **What happens when model fails?**
  - System should degrade gracefully, not break completely
  - Operators should still be able to work
  - Fallback to human judgment or simpler rules

- **What happens when model performance degrades?**
  - System should detect degradation
  - System should reduce reliance on model
  - System should alert operators to reduced confidence

- **What happens when data is missing or corrupted?**
  - System should handle missing data gracefully
  - System should indicate data quality issues
  - System should fall back to available information

- How to design graceful degradation
- How to test degradation scenarios
- How to communicate degradation to operators

---

## Case

### AI System Scaled Responsibly Across Teams

**Case Study Framework:**

1. **The System**
   - What AI system was built
   - Initial scope and goals
   - Technical performance

2. **The Rollout Strategy**
   - How rollout was designed
   - Progressive expansion plan
   - Shadow mode and testing approach

3. **The Execution**
   - How rollout actually happened
   - Challenges encountered
   - How challenges were addressed

4. **The Results**
   - Adoption rates across teams
   - Trust metrics over time
   - Operator feedback and behavior

5. **The Lessons**
   - What worked well
   - What would be done differently
   - Key success factors

**Discussion Questions:**
- What made this rollout successful?
- How was trust built gradually?
- How were problems handled?
- What can be applied to other rollouts?

---

## Practical Exercise

### Design Rollout Plan for Your AI System

**Objective:** Create a rollout strategy that builds trust and adoption

**Steps:**

1. **Define Rollout Scope**
   - Initial scope: Which teams, which decisions, which risk level
   - Expansion plan: How to grow scope over time
   - Success criteria: What indicates readiness to expand

2. **Design Progressive Rollout**
   - Stage 1: Shadow mode (test without impact)
   - Stage 2: Comparison mode (show alongside operator decisions)
   - Stage 3: Advisory mode (recommendations, operator decides)
   - Stage 4: Autonomous mode (AI decides, operator approves)
   - Criteria for moving between stages

3. **Design Kill Switches**
   - Emergency kill switch: When and how to trigger
   - Gradual degradation: How to reduce AI influence
   - Selective disable: How to disable specific features
   - Communication: How to notify operators

4. **Design Graceful Degradation**
   - What happens when model fails?
   - What happens when performance degrades?
   - What happens when data is missing?
   - Fallback mechanisms and operator communication

5. **Design Trust Building**
   - How to build trust at each stage
   - How to measure trust during rollout
   - How to address trust issues
   - How to celebrate trust milestones

6. **Design Communication Plan**
   - How to communicate rollout to operators
   - How to set expectations
   - How to gather feedback
   - How to show progress and improvements

**Deliverables:**
- Rollout plan with stages and criteria
- Kill switch design
- Graceful degradation design
- Trust building strategy
- Communication plan
- Success metrics

---

## Behaviour Installed

### Success Indicators

- **Rollout builds trust**
  - Operators trust system more after rollout than before
  - Trust metrics improve over rollout stages

- **Gradual adoption**
  - Operators adopt system naturally, not forced
  - Adoption expands as trust builds

- **Resilient system**
  - System degrades gracefully when problems occur
  - Operators maintain trust through failures

---

## Key Concepts

### Progressive Rollout

- Start small, expand gradually
- Build trust at each stage
- Learn and iterate
- Rollback capability

### Shadow Mode Testing

- Test without operator impact
- Compare AI vs. operator decisions
- Learn about model behavior
- Build trust through comparison

### Kill Switches

- Emergency: Immediate disable
- Gradual: Reduce influence
- Selective: Disable features
- Always: Easy to trigger, clear communication

### Graceful Degradation

- System works even when model fails
- Fallback to human judgment
- Clear communication about degradation
- Maintain operator trust

---

## Tools and Techniques

- Progressive rollout frameworks
- Shadow mode testing methods
- Kill switch design patterns
- Graceful degradation strategies
- Trust building during rollout

---

**End of Module 8**
