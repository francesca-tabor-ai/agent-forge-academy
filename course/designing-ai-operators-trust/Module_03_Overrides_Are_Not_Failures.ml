---
title: "Module 3: Overrides Are Not Failures"
description: "Reframe overrides as learning signals — capture intent and use overrides to improve models"
module: "3"
order: 3
problem: "Overrides are treated as failures instead of learning opportunities"
capability: "Override Signal Design"
inspiration: "Feedback loop design and continuous improvement"
---

# Module 3: Overrides Are Not Failures

**Problem:** Overrides are treated as failures instead of learning opportunities  
**Capability:** Override Signal Design  
**Inspiration:** Feedback loop design and continuous improvement

---

## Mindset Shift

> "Every override is a signal about what the model doesn't know."

---

## Learning Objectives

### Why Operators Override

- **Model is wrong:** The recommendation doesn't match reality
- **Model is incomplete:** Missing context that operator has
- **Model is untimely:** Recommendation is correct but too late
- **Model is risky:** Recommendation is correct but too risky for context
- **Operator knows better:** Domain expertise trumps model output
- **Organizational constraints:** Model doesn't account for real constraints

### Capturing Override Intent

- What information to capture when operator overrides
- The difference between "model is wrong" and "model is incomplete"
- How to make override capture low-friction
- Designing override UI that encourages explanation
- When to ask for explicit reason vs. infer from context

### Differentiating Disagreement from Distrust

- **Disagreement:** Operator has different information or priorities
  - Model might be correct, operator has additional context
  - Learning opportunity: what context is missing?

- **Distrust:** Operator doesn't believe the model
  - Model might be correct, but operator lacks confidence
  - Learning opportunity: how to build trust?

- **Error:** Model is actually wrong
  - Learning opportunity: what did model miss?

- How to classify overrides to learn the right lesson

### Using Overrides to Improve Models

- How override patterns reveal model gaps
- When to retrain vs. when to add features
- Using overrides to identify missing context
- Building override-driven feedback loops
- Measuring model improvement through override reduction

---

## Hands-on

### Design an Override Taxonomy

**Objective:** Create a classification system for overrides that enables learning

**Steps:**

1. **Collect Override Scenarios**
   - Review real override cases (or simulate)
   - Document what happened: model recommendation, operator action, outcome
   - Note any explanations operators provided

2. **Identify Override Patterns**
   - Group similar overrides
   - Look for common themes: missing context, timing issues, risk concerns
   - Identify patterns that suggest model gaps

3. **Design Override Categories**
   - **Model Error:** Model recommendation was incorrect
   - **Missing Context:** Model didn't have information operator had
   - **Timing Issue:** Recommendation correct but too early/late
   - **Risk Aversion:** Recommendation correct but too risky
   - **Priority Mismatch:** Model optimized for wrong objective
   - **Constraint Violation:** Model didn't account for real constraint
   - **Trust Issue:** Operator doesn't trust model (even if correct)

4. **Design Override Capture**
   - What information to collect automatically (context, timing, confidence)
   - What to ask operator explicitly (reason, alternative chosen)
   - How to make capture low-friction (dropdowns, quick buttons)
   - When to infer vs. when to ask

5. **Design Learning Loop**
   - How each override category maps to model improvement
   - When to retrain model
   - When to add features or context
   - When to adjust confidence thresholds
   - When to change recommendation logic

6. **Test the Taxonomy**
   - Apply to real override cases
   - Does it capture what you need to learn?
   - Can operators classify easily?
   - Does it lead to actionable improvements?

**Deliverables:**
- Override taxonomy with categories and definitions
- Override capture UI/UX design
- Learning loop mapping (override → improvement action)
- Example override classifications
- Improvement plan based on override patterns

---

## Behaviour Installed

### Success Indicators

- **Override as signal**
  - Overrides are captured and analyzed, not hidden
  - Override patterns drive model improvements

- **Learning mindset**
  - Every override is an opportunity to learn
  - Operators feel their overrides improve the system

- **Low-friction capture**
  - Operators provide override reasons without friction
  - Override data is rich enough to learn from

---

## Key Concepts

### Override Types

- **Corrective:** Operator fixes model error
- **Contextual:** Operator adds missing context
- **Risk-based:** Operator avoids model-recommended risk
- **Priority-based:** Operator optimizes for different objective
- **Trust-based:** Operator doesn't trust model output

### Override Capture Design

- Automatic: context, timing, confidence, model inputs
- Explicit: reason, alternative, expected outcome
- Low-friction: quick buttons, dropdowns, optional explanations
- High-value: capture enables learning

### Learning from Overrides

- Pattern analysis: what do overrides reveal?
- Model improvement: retrain, add features, adjust thresholds
- Trust building: address trust issues separately from accuracy
- Feedback loops: close the loop from override to improvement

---

## Tools and Techniques

- Override taxonomy design frameworks
- Override capture UI patterns
- Override pattern analysis methods
- Feedback loop design
- Model improvement prioritization

---

**End of Module 3**
