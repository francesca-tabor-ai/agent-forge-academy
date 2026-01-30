---
title: "Module 5: Explainability That Matters"
description: "Explain decisions, not models — design explanations that operators actually use"
module: "5"
order: 5
problem: "Model explanations don't help operators make decisions"
capability: "Operational Explainability Design"
inspiration: "Human factors and decision support systems"
---

# Module 5: Explainability That Matters

**Problem:** Model explanations don't help operators make decisions  
**Capability:** Operational Explainability Design  
**Inspiration:** Human factors and decision support systems

---

## Mindset Shift

> "Explain the decision, not the algorithm."

---

## Learning Objectives

### Feature Importance vs Operational Reasoning

- **Feature importance:** What the model used (technical)
  - "Model weighted price 0.3, inventory 0.5, seasonality 0.2"
  - Problem: Operators don't think in feature weights

- **Operational reasoning:** Why this decision makes sense (operational)
  - "Recommendation accounts for low inventory, upcoming promotion, and supplier delay"
  - Solution: Translate model reasoning to operational language

- How to bridge the gap between model internals and operator mental models
- When feature importance helps vs. when it confuses
- Designing explanations that match how operators think

### Counterfactual Explanations

- **What-if reasoning:** "If inventory were higher, recommendation would be X"
- **Why-not reasoning:** "Recommendation isn't Y because of Z"
- How counterfactuals help operators understand decisions
- When counterfactuals build trust vs. when they confuse
- Designing counterfactual explanations that are actionable

### Confidence Bands and Risk Framing

- **Confidence as uncertainty:** "Model is 80% confident" means what?
- **Risk framing:** How to present uncertainty in operational terms
- The difference between model confidence and operational risk
- When high confidence is misleading
- When low confidence is actually helpful (shows model knows it doesn't know)

### What Not to Explain

- When explanations reduce trust (over-explaining)
- When explanations confuse more than help
- When operators don't need explanations (high trust, low risk)
- The cost of explanation: cognitive load, decision delay
- How to make explanations optional and progressive

---

## Lab

### Rewrite a Model Explanation in Operator Language

**Objective:** Transform technical model explanations into operational reasoning

**Steps:**

1. **Start with Technical Explanation**
   - Take a real model explanation (or create one)
   - Document: feature importance, confidence scores, model internals
   - Note: what the model "thinks" vs. what it outputs

2. **Identify Operator Mental Model**
   - How do operators think about this decision?
   - What factors do operators consider?
   - What language do operators use?
   - What context do operators have that model doesn't?

3. **Translate to Operational Reasoning**
   - **Feature importance → Operational factors**
     - "Price weight 0.3" → "Price is a factor, but not the main driver"
   
   - **Model confidence → Operational risk**
     - "80% confidence" → "Model is fairly certain, but there's some uncertainty"
   
   - **Model logic → Operational logic**
     - "If-then rules" → "Given current conditions, this makes sense because..."

4. **Test Explanation Quality**
   - Does operator understand why?
   - Does explanation help operator decide?
   - Does explanation build trust?
   - Would operator act differently with this explanation?

5. **Design Explanation UI**
   - How to present: progressive disclosure, on-demand, always visible?
   - What format: text, visual, interactive?
   - When to show: always, on hover, on request?
   - How to make it actionable?

**Deliverables:**
- Before/after explanation comparison
- Operator language translation guide
- Explanation UI/UX design
- Explanation quality test results
- Guidelines for future explanations

---

## Behaviour Installed

### Success Indicators

- **Explanations are useful**
  - Operators actually read and use explanations
  - Explanations help operators make decisions

- **Operational language**
  - Explanations match how operators think
  - No translation needed between model and operator

- **Trust through clarity**
  - Explanations build trust, not confusion
  - Operators understand when to trust and when to override

---

## Key Concepts

### Explanation Types

- **Feature importance:** What model used (technical)
- **Operational reasoning:** Why decision makes sense (operational)
- **Counterfactual:** What would change the decision
- **Confidence/risk:** How certain is the model

### Explanation Design Principles

- Match operator mental models
- Use operational language, not technical language
- Explain decisions, not algorithms
- Make explanations actionable
- Progressive disclosure: show what's needed, when needed

### When Explanations Help vs. Hurt

- **Help:** Build trust, enable decisions, support overrides
- **Hurt:** Confuse, delay decisions, reduce trust, create cognitive load
- Know when to explain and when not to

---

## Tools and Techniques

- Explanation translation frameworks
- Counterfactual explanation design
- Risk framing methods
- Operator language mapping
- Explanation UI patterns

---

**End of Module 5**
