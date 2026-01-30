---
title: "Module 5: Cost vs Reliability Trade-Offs"
description: "Make explicit trade-offs between cost and reliability"
module: "5"
order: 5
problem: "Implicit trade-offs between cost and reliability lead to poor decisions"
capability: "Explicit Trade-Off Analysis"
inspiration: "Decision analysis and multi-criteria optimization"
---

# Module 5: Cost vs Reliability Trade-Offs

**Problem:** Implicit trade-offs between cost and reliability lead to poor decisions  
**Capability:** Explicit Trade-Off Analysis  
**Inspiration:** Decision analysis and multi-criteria optimization

---

## Mindset Shift

> "Make trade-offs explicit. The cheapest lane is rarely the safest lane."

---

## Learning Objectives

### Cheapest Lane vs Safest Lane

- Cheapest lane: minimum cost route
- Safest lane: maximum reliability route
- Why they're rarely the same
- The cost of reliability: premium for safer routes
- When to choose cheapest vs. safest

### Buffering in Time vs Buffering in Inventory

- Time buffering: longer transit times with higher reliability
- Inventory buffering: safety stock to cover delays
- The trade-off between time and inventory
- When time buffering is cheaper than inventory
- When inventory buffering is cheaper than time

### SLA-Driven Routing

- Service level agreements: on-time delivery requirements
- SLA-driven routing: routes that meet SLA targets
- The cost of SLA compliance
- When SLA requirements drive routing decisions
- Balancing SLA compliance with cost

### When Paying More Saves Money

- Stockout costs: lost sales, customer trust, production stops
- Delay costs: penalties, expedited shipping, customer impact
- When premium routes reduce total cost
- The difference between route cost and total cost
- Hidden costs of unreliable routes

---

## Case Study

### Re-Routing During Congestion Spikes

**Scenario:** Port congestion causes delays on primary route

**Analysis:**

1. **Primary Route (Cheapest)**
   - Cost: $1000 per shipment
   - Reliability: 60% on-time (P50: 5 days, P95: 15 days)
   - Current status: Severe congestion, 20-day delays

2. **Alternative Route (Premium)**
   - Cost: $1500 per shipment (+50%)
   - Reliability: 90% on-time (P50: 6 days, P95: 8 days)
   - Current status: Normal operations

3. **Cost Analysis**
   - Primary route: $1000 + stockout cost (if delay causes stockout)
   - Alternative route: $1500 + minimal stockout risk
   - Stockout cost: $5000 per incident
   - Break-even: If stockout probability > 10%, alternative is cheaper

4. **Decision Framework**
   - Calculate total cost = route cost + delay cost + stockout cost
   - Compare total cost across routes
   - Choose route with minimum total cost
   - Document trade-off reasoning

**Lessons:**
- Route cost ≠ total cost
- Reliability has value
- Explicit trade-offs prevent hidden costs
- Context matters: congestion changes trade-offs

---

## Practical Exercise

### Build a Cost vs Reliability Trade-Off Model

**Objective:** Quantify the trade-off between cost and reliability

**Steps:**

1. **Define Route Options**
   - Route A: Cheapest ($1000, 60% on-time)
   - Route B: Balanced ($1200, 80% on-time)
   - Route C: Premium ($1500, 95% on-time)

2. **Calculate Delay Costs**
   - Stockout cost: $5000 per incident
   - Expedited shipping: $2000 per incident
   - Customer penalty: $1000 per late delivery
   - Total delay cost = probability × cost per incident

3. **Calculate Total Cost**
   - Total cost = route cost + expected delay cost
   - Route A: $1000 + (0.4 × $5000) = $3000
   - Route B: $1200 + (0.2 × $5000) = $2200
   - Route C: $1500 + (0.05 × $5000) = $1750

4. **Compare Buffering Strategies**
   - Time buffering: Use Route C (premium route)
   - Inventory buffering: Use Route A + safety stock
   - Safety stock cost: $500 per unit × stockout risk
   - Compare total cost of each strategy

5. **SLA-Driven Analysis**
   - SLA requirement: 95% on-time delivery
   - Which routes meet SLA?
   - Cost of SLA compliance
   - Trade-off: SLA compliance vs. cost

6. **Document Trade-Offs**
   - When cheapest route is best
   - When premium route is best
   - When buffering is better than routing
   - Decision framework for trade-off selection

**Deliverables:**
- Cost vs reliability trade-off model
- Total cost calculation framework
- Buffering strategy comparison
- SLA-driven routing analysis
- Decision framework for trade-off selection

---

## Discussion

### When Implicit Trade-Offs Fail

**Scenario Analysis:**

1. **The Cost Minimization Trap**
   - Case: Always choose cheapest route
   - Reality: Cheapest route has low reliability
   - Outcome: High delay costs exceed route savings
   - Lesson: Route cost ≠ total cost

2. **The Reliability Maximization Trap**
   - Case: Always choose most reliable route
   - Reality: Premium routes are expensive
   - Outcome: High route costs for marginal reliability gains
   - Lesson: Diminishing returns on reliability

3. **The Hidden Cost Blindness**
   - Case: Optimize route cost only
   - Reality: Delays cause stockouts and penalties
   - Outcome: Hidden costs exceed route savings
   - Lesson: Total cost analysis is essential

**Discussion Questions:**
- When have you seen implicit trade-offs fail?
- What hidden costs were ignored?
- What was the actual cost of the failure?
- How could explicit trade-off analysis have helped?

---

## Behaviour Installed

### Success Indicators

- **Explicit trade-off thinking**
  - Questions about cost vs reliability come naturally
  - Recognition that cheapest ≠ best
  - Understanding of total cost vs. route cost

- **Total cost awareness**
  - Ability to calculate total cost (route + delays + stockouts)
  - Questions about hidden costs
  - Preference for total cost minimization

- **Buffering strategy recognition**
  - Understanding of time vs. inventory buffering
  - Questions about when buffering is better than routing
  - Ability to compare buffering strategies

---

## Key Concepts

### Cost vs Reliability Trade-Offs

- Cheapest lane: minimum route cost
- Safest lane: maximum reliability
- Total cost: route cost + delay cost + stockout cost
- When cheapest ≠ best: hidden costs matter
- Explicit trade-offs: make decisions transparent

### Buffering Strategies

- Time buffering: longer transit times with higher reliability
- Inventory buffering: safety stock to cover delays
- Trade-off: time cost vs. inventory cost
- When time buffering is cheaper
- When inventory buffering is cheaper

### SLA-Driven Routing

- Service level agreements: on-time delivery requirements
- SLA-driven routing: routes that meet SLA targets
- Cost of SLA compliance
- When SLA requirements drive decisions
- Balancing SLA with cost

---

## Tools and Techniques

- Total cost calculation frameworks
- Trade-off analysis methods
- Buffering strategy comparison
- SLA compliance modeling
- Decision frameworks

---

**End of Module 5**
