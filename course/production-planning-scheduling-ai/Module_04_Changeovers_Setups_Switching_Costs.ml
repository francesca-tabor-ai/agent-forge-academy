---
title: "Module 4: Changeovers, Setups & Switching Costs"
description: "Account for the most ignored cost"
module: "4"
order: 4
problem: "Ignoring changeover costs in scheduling decisions"
capability: "Changeover-Aware Scheduling"
inspiration: "Setup time optimization, sequence-dependent scheduling, and batch optimization"
---

# Module 4: Changeovers, Setups & Switching Costs

**Problem:** Ignoring changeover costs in scheduling decisions  
**Capability:** Changeover-Aware Scheduling  
**Inspiration:** Setup time optimization, sequence-dependent scheduling, and batch optimization

---

## Mindset Shift

> "Changeover costs are often the largest hidden cost in production. Ignore them at your peril."

---

## Learning Objectives

### Sequence-Dependent Changeovers

- **Changeover time depends on sequence:**
  - Product A → Product B: 2 hours
  - Product B → Product C: 4 hours
  - Product C → Product A: 1 hour

- Why sequence matters
- How to model sequence-dependent changeovers
- The cost of ignoring sequence
- When sequence doesn't matter

### Cost vs Time Trade-offs

- **Changeover cost components:**
  - Time: machine downtime, labor
  - Materials: waste, cleaning supplies
  - Quality: startup defects, adjustment time
  - Opportunity: lost production time

- How to quantify changeover costs
- When time is the main cost
- When other costs dominate
- How to optimize total cost, not just time

### Setup Minimization vs Flexibility

- **Batching to minimize changeovers:**
  - Run all of Product A, then all of Product B
  - Reduces changeovers but increases inventory
  - Reduces flexibility and responsiveness

- **Flexibility for responsiveness:**
  - Frequent changeovers to respond to demand
  - Increases changeovers but reduces inventory
  - Increases flexibility but reduces efficiency

- The trade-off between efficiency and flexibility
- When to batch and when to be flexible
- How to find the right balance

### When Batching Helps — and Hurts

- **Batching helps when:**
  - Changeover costs are high
  - Demand is stable
  - Inventory costs are low
  - Quality improves with longer runs

- **Batching hurts when:**
  - Demand is variable
  - Inventory costs are high
  - Customer service matters
  - Quality degrades with longer runs

- How to decide when to batch
- The cost of wrong batching decisions
- How to optimize batch sizes

---

## Lab

### Build a Schedule That Minimizes Costly Changeovers

**Objective:** Create a schedule that accounts for sequence-dependent changeovers

**Steps:**

1. **Map Changeover Costs**
   - Identify all product types
   - Document changeover times between each pair
   - Quantify changeover costs (time, materials, quality, opportunity)
   - Build changeover cost matrix

2. **Analyze Demand Pattern**
   - What products need to be produced?
   - What are the quantities?
   - What are the due dates?
   - What is the demand variability?

3. **Design Scheduling Strategy**
   - When to batch vs. when to be flexible
   - How to sequence products to minimize changeovers
   - How to balance changeover costs with other objectives
   - How to handle urgent orders

4. **Build the Schedule**
   - Sequence products to minimize total changeover cost
   - Account for due dates and priorities
   - Balance changeover costs with inventory costs
   - Ensure feasibility (capacity, materials, labor)

5. **Evaluate the Schedule**
   - Total changeover cost
   - Total inventory cost
   - Customer service level
   - Operator feedback

**Deliverables:**
- Changeover cost matrix
- Demand analysis
- Scheduling strategy document
- Optimized schedule
- Cost-benefit analysis
- Recommendations for changeover reduction

---

## Behaviour Installed

### Success Indicators

- **Changeover awareness**
  - Questions about changeover costs come naturally
  - Recognition that sequence matters
  - Understanding of cost vs. time trade-offs

- **Balanced optimization**
  - Ability to balance changeover costs with other objectives
  - Recognition of when batching helps vs. hurts
  - Understanding of efficiency vs. flexibility trade-offs

- **Cost-conscious scheduling**
  - Preference for total cost optimization
  - Recognition of hidden changeover costs
  - Ability to quantify changeover impacts

---

## Key Concepts

### Sequence-Dependent Changeovers

- Changeover time depends on sequence
- Why sequence matters
- How to model sequence-dependent changeovers
- The cost of ignoring sequence

### Cost vs. Time Trade-offs

- Changeover cost components
- How to quantify changeover costs
- When time is the main cost
- How to optimize total cost

### Setup Minimization vs. Flexibility

- Batching to minimize changeovers
- Flexibility for responsiveness
- The trade-off between efficiency and flexibility
- How to find the right balance

### When Batching Helps — and Hurts

- When batching helps
- When batching hurts
- How to decide when to batch
- How to optimize batch sizes

---

## Tools and Techniques

- Changeover cost matrix construction
- Sequence-dependent scheduling algorithms
- Batch optimization methods
- Cost-benefit analysis
- Changeover time reduction techniques
- Flexibility vs. efficiency trade-off analysis

---

**End of Module 4**
