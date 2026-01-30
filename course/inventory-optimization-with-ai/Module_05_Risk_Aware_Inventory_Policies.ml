---
title: "Module 5: Risk-Aware Inventory Policies"
description: "Move beyond point forecasts to interval-based and scenario-based policies"
module: "5"
order: 5
problem: "Point forecasts ignore uncertainty and tail risk"
capability: "Uncertainty-Aware Policy Design"
inspiration: "Risk management and probabilistic forecasting"
---

# Module 5: Risk-Aware Inventory Policies

**Problem:** Point forecasts ignore uncertainty and tail risk  
**Capability:** Uncertainty-Aware Policy Design  
**Inspiration:** Risk management and probabilistic forecasting

---

## Mindset Shift

> "Use forecast intervals, not point forecasts — and design policies that cap downside risk."

---

## Learning Objectives

### Inventory Policies Using Forecast Intervals

- Point forecasts vs. forecast intervals
- Why intervals matter: uncertainty quantification
- How to use intervals in inventory decisions
- Confidence levels: 80%, 90%, 95% intervals
- The relationship between interval width and safety stock

### Scenario-Based Replenishment

- What scenario planning is: multiple future states
- Base case, optimistic, pessimistic scenarios
- How to weight scenarios: probability vs. impact
- Scenario-based reorder points
- When scenarios help vs. when they don't

### Tail Risk Management

- What tail risk is: extreme outcomes (low probability, high impact)
- Why tail risk matters: stockouts during peak demand
- How to protect against tail risk: higher safety stock, buffer capacity
- The cost of tail risk protection
- When tail risk protection is worth it

### Stop-Loss and Throttle Mechanisms

- Stop-loss: maximum acceptable stockout risk
- Throttle: maximum acceptable inventory level
- How to implement: automatic adjustments when thresholds breached
- Override mechanisms: when to go beyond thresholds
- The balance between automation and human judgment

---

## Exercise

### Design an Inventory Policy That Caps Downside Risk

**Objective:** Build a risk-aware inventory policy with explicit risk limits

**Scenario:**

You manage inventory for a critical component:
- Average demand: 50 units/week
- Demand std dev: 15 units/week (high volatility)
- Lead time: 3 weeks
- Stockout cost: $10,000 per occurrence (production stops)
- Holding cost: $100 per unit per year
- Working capital limit: $50,000

**Requirements:**
- Maximum stockout probability: 2% (tail risk limit)
- Maximum inventory value: $50,000 (working capital limit)
- Must handle demand spikes up to 3x average (tail risk scenario)

**Exercise Steps:**

1. **Calculate Standard Safety Stock**
   - Use point forecast (average demand)
   - Calculate safety stock for 98% service level (2% stockout risk)
   - Check if within working capital limit

2. **Design Interval-Based Policy**
   - Use forecast intervals (80%, 90%, 95% intervals)
   - Calculate safety stock for each interval
   - Choose interval that meets risk limit
   - Validate against working capital limit

3. **Design Scenario-Based Policy**
   - Base case: average demand
   - Pessimistic: 2x average demand (high volatility)
   - Extreme: 3x average demand (tail risk)
   - Weight scenarios by probability
   - Calculate reorder point for each scenario
   - Choose policy that meets risk limit

4. **Add Stop-Loss Mechanism**
   - Define stop-loss: if stockout risk > 2%, increase safety stock
   - Define throttle: if inventory > $50,000, reduce safety stock
   - Design automatic adjustment logic
   - Test with simulated demand scenarios

5. **Validate Policy**
   - Simulate demand over 52 weeks
   - Track: stockout frequency, inventory levels, total cost
   - Verify: stockout risk < 2%, inventory < $50,000
   - Identify edge cases and exceptions

6. **Document Policy**
   - Reorder point calculation
   - Safety stock calculation
   - Risk thresholds and triggers
   - Override mechanisms
   - Exception handling

**Deliverables:**
- Risk-aware inventory policy document
- Policy logic (formulas and rules)
- Risk thresholds and triggers
- Validation results (simulation output)
- Exception handling procedures

**Tools:**
- Python for calculations and simulation
- Probabilistic forecasting methods
- Scenario planning frameworks

---

## Behaviour Installed

### Success Indicators

- **Uncertainty awareness**
  - Questions about forecast intervals come before point forecasts
  - Recognition that uncertainty matters more than accuracy

- **Risk-first thinking**
  - Understanding that policies must cap downside risk
  - Questions about tail risk and extreme scenarios

- **Threshold-based design**
  - Preference for explicit risk limits over implicit assumptions
  - Ability to design stop-loss and throttle mechanisms

---

## Key Concepts

### Forecast Intervals

- Point forecasts: single number (average)
- Forecast intervals: range with confidence level
- How to use intervals: safety stock based on upper bound
- Confidence levels: 80%, 90%, 95% and their meanings
- The relationship between interval width and uncertainty

### Scenario Planning

- Multiple future states: base, optimistic, pessimistic
- Probability weighting: how likely is each scenario?
- Impact weighting: how bad is each scenario?
- Scenario-based decisions: prepare for multiple futures
- When scenarios help: high uncertainty, tail risk

### Tail Risk Management

- Tail risk: extreme outcomes (low probability, high impact)
- Why it matters: stockouts during peak demand
- Protection strategies: higher safety stock, buffer capacity
- The cost of protection: higher inventory, lower turns
- When protection is worth it: high stockout cost

### Stop-Loss and Throttle

- Stop-loss: maximum acceptable risk (stockout probability)
- Throttle: maximum acceptable inventory (working capital)
- Automatic adjustments: when thresholds are breached
- Override mechanisms: when to go beyond thresholds
- The balance: automation vs. human judgment

---

## Tools and Techniques

- Probabilistic forecasting
- Forecast interval estimation
- Scenario planning frameworks
- Monte Carlo simulation
- Risk threshold design
- Python libraries: scipy for statistics, numpy for simulation

---

**End of Module 5**
