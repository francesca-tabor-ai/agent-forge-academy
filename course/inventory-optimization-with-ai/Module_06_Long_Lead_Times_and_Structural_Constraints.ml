---
title: "Module 6: Long Lead Times & Structural Constraints"
description: "Manage what cannot be fixed — work with structural constraints"
module: "6"
order: 6
problem: "Long lead times and structural constraints break standard policies"
capability: "Constraint-Aware Inventory Management"
inspiration: "Operations management and supply chain resilience"
---

# Module 6: Long Lead Times & Structural Constraints

**Problem:** Long lead times and structural constraints break standard policies  
**Capability:** Constraint-Aware Inventory Management  
**Inspiration:** Operations management and supply chain resilience

---

## Mindset Shift

> "Some constraints can't be fixed — work with them, not against them."

---

## Learning Objectives

### Structural vs Controllable Lead Times

- Structural lead times: manufacturing time, shipping distance, customs
- Controllable lead times: supplier selection, transportation mode, ordering frequency
- Why structural lead times can't be optimized away
- How to work with structural constraints
- When to accept vs. when to change suppliers

### Supplier Reliability vs Average Lead Time

- Average lead time: what you plan for
- Lead-time variance: what breaks your plans
- Supplier reliability: on-time delivery percentage
- Why reliability matters more than average
- How to account for unreliable suppliers

### When to Overstock Intentionally

- Long lead times: need more inventory to cover uncertainty
- Unreliable suppliers: need buffer for late deliveries
- Critical items: can't afford stockout
- Seasonal demand: build inventory before peak
- The cost of intentional overstock vs. stockout risk

### Lead-Time Hedging Strategies

- Multiple suppliers: reduce single-point-of-failure risk
- Safety stock: buffer against lead-time variance
- Early ordering: order before you need it
- Consignment inventory: supplier holds inventory until needed
- The trade-offs: cost vs. risk reduction

---

## Case

### Overseas Sourcing with 90–120 Day Lead Times

**Scenario:**

You source a critical component from overseas:
- Supplier location: Asia (90–120 day lead time)
- Order quantity: 10,000 units per order
- Demand: 1,000 units/month (variable: 800–1,200)
- Supplier reliability: 70% on-time, 20% +10 days, 10% +30 days
- Stockout cost: $50,000 (production stops)
- Holding cost: $5 per unit per year
- Order cost: $10,000 per order

**Challenges:**
- Long lead time: must order 3–4 months in advance
- High uncertainty: demand variance + lead-time variance
- High stockout cost: production stops if out of stock
- Working capital: large order quantities tie up capital

**Case Analysis:**

1. **Calculate Standard Reorder Point**
   - Average demand during lead time: 3,000–4,000 units
   - Safety stock for demand variance
   - Safety stock for lead-time variance
   - Total reorder point
   - Check if feasible with order quantity

2. **Account for Supplier Reliability**
   - 70% on-time: use 90-day lead time
   - 20% +10 days: use 100-day lead time
   - 10% +30 days: use 120-day lead time
   - Weighted average lead time vs. worst-case
   - Which to use for safety stock?

3. **Design Hedging Strategy**
   - Option A: Higher safety stock (protect against worst case)
   - Option B: Multiple suppliers (reduce risk)
   - Option C: Early ordering (order before reorder point)
   - Option D: Consignment inventory (supplier holds stock)
   - Compare costs and risks

4. **Calculate Intentional Overstock**
   - How much extra inventory to carry?
   - Cost of overstock vs. stockout risk
   - When is overstock worth it?
   - Working capital impact

5. **Design Policy**
   - Reorder point calculation
   - Order quantity (may need to increase)
   - Safety stock for demand + lead-time variance
   - Hedging mechanisms
   - Override triggers

6. **Validate and Monitor**
   - Simulate 12 months of demand and lead times
   - Track: stockouts, excess inventory, total cost
   - Monitor supplier performance
   - Adjust policy based on actual performance

**Deliverables:**
- Lead-time analysis (structural vs. controllable)
- Supplier reliability assessment
- Hedging strategy recommendation
- Inventory policy with long lead times
- Monitoring and adjustment procedures

**Key Insights:**
- Long lead times require higher inventory
- Supplier reliability matters more than average lead time
- Intentional overstock can be rational
- Hedging strategies reduce risk but increase cost

---

## Behaviour Installed

### Success Indicators

- **Constraint acceptance**
  - Recognition that some constraints can't be fixed
  - Questions about working with constraints, not against them

- **Reliability awareness**
  - Understanding that supplier reliability matters more than average
  - Questions about lead-time variance, not just average

- **Strategic overstock**
  - Recognition that intentional overstock can be rational
  - Ability to calculate when overstock is worth it

---

## Key Concepts

### Lead-Time Types

- Structural: manufacturing time, shipping distance, customs
- Controllable: supplier selection, transportation, ordering
- Why structural can't be optimized away
- How to work with structural constraints

### Supplier Reliability

- Average lead time: what you plan for
- Lead-time variance: what breaks your plans
- On-time delivery percentage: supplier reliability metric
- Why reliability > average
- How to account for unreliable suppliers

### Intentional Overstock

- When it's rational: long lead times, unreliable suppliers, critical items
- Cost vs. benefit: overstock cost vs. stockout risk
- How to calculate: risk-adjusted safety stock
- Working capital trade-offs

### Hedging Strategies

- Multiple suppliers: reduce single-point-of-failure risk
- Safety stock: buffer against variance
- Early ordering: order before needed
- Consignment: supplier holds inventory
- Trade-offs: cost vs. risk reduction

---

## Tools and Techniques

- Lead-time analysis
- Supplier reliability metrics
- Risk-adjusted safety stock calculations
- Hedging strategy frameworks
- Working capital optimization

---

**End of Module 6**
