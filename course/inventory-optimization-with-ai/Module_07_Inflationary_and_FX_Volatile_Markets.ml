---
title: "Module 7: Inflationary & FX-Volatile Markets"
description: "Manage inventory under macro stress — inflation and FX volatility"
module: "7"
order: 7
problem: "Inflation and FX volatility break standard inventory policies"
capability: "Macro-Stress Inventory Management"
inspiration: "Financial risk management and commodity trading"
---

# Module 7: Inflationary & FX-Volatile Markets

**Problem:** Inflation and FX volatility break standard inventory policies  
**Capability:** Macro-Stress Inventory Management  
**Inspiration:** Financial risk management and commodity trading

---

## Mindset Shift

> "Inventory decisions during inflation and FX volatility are financial decisions, not just operational ones."

---

## Learning Objectives

### Inventory as an Inflation Hedge

- Why inventory can be an inflation hedge: buy now, use later at higher prices
- When it works: rising input costs, stable demand
- When it backfires: falling prices, obsolescence risk
- The cost of hedging: working capital, holding costs
- How to calculate: inflation-adjusted inventory value

### Cash Flow vs Holding Risk

- Cash flow risk: tying up capital in inventory
- Holding risk: inventory loses value (obsolescence, price drops)
- The trade-off: hedge against inflation vs. preserve cash flow
- Working capital constraints: can't always hedge
- When to hedge vs. when to preserve cash

### FX Timing and Reorder Decisions

- FX volatility: currency fluctuations affect cost
- When to order: before or after FX moves?
- FX hedging: forward contracts, options
- The relationship: FX timing vs. inventory timing
- How to incorporate FX risk into reorder decisions

### When Buying "Early" Backfires

- Early buying: order before needed to hedge inflation/FX
- When it works: prices rise, demand stable
- When it backfires: prices fall, demand drops, obsolescence
- Case studies: companies that over-hedged
- The balance: hedge enough, not too much

---

## Simulation

### Inventory Decisions Under Rising Input Costs

**Objective:** Build intuition for inventory decisions during inflation

**Scenario Setup:**

You manage inventory for a product with:
- Current cost: $100 per unit
- Monthly demand: 1,000 units (stable)
- Lead time: 1 month
- Current inventory: 1,500 units (1.5 months coverage)
- Working capital limit: $200,000

**Inflation Scenario:**
- Month 1-3: 2% monthly inflation (cost rises to $106)
- Month 4-6: 5% monthly inflation (cost rises to $135)
- Month 7-9: 3% monthly inflation (cost rises to $147)
- Month 10-12: 1% monthly inflation (cost stabilizes)

**Simulation Steps:**

1. **Baseline Policy (No Hedging)**
   - Reorder when inventory < 1,000 units (1 month coverage)
   - Order 1,000 units each time
   - Track: total cost, inventory value, cash flow

2. **Hedging Policy (Buy Early)**
   - Month 1: Order 3,000 units (3 months coverage) to hedge inflation
   - Then reorder normally
   - Track: total cost, inventory value, cash flow

3. **Adaptive Policy (Adjust Based on Inflation)**
   - Month 1-3: Normal reorder (low inflation)
   - Month 4-6: Increase order quantity (high inflation)
   - Month 7-9: Reduce order quantity (moderate inflation)
   - Month 10-12: Normal reorder (stable inflation)
   - Track: total cost, inventory value, cash flow

4. **Compare Results**
   - Total cost: which policy minimizes cost?
   - Cash flow: which policy uses more capital?
   - Risk: which policy is riskier?
   - Working capital: which stays within limit?

5. **Add FX Volatility**
   - Product cost in foreign currency
   - FX rate: starts at 1.0, fluctuates ±10%
   - When to order: before or after FX moves?
   - Compare: order timing strategies

6. **Analyze Trade-offs**
   - Cost savings from hedging
   - Working capital cost of hedging
   - Risk of over-hedging (prices fall, obsolescence)
   - When hedging is worth it

**Deliverables:**
- Simulation results: cost, cash flow, inventory value over time
- Policy comparison: baseline vs. hedging vs. adaptive
- FX timing analysis: when to order relative to FX moves
- Recommendations: when to hedge, how much to hedge
- Risk assessment: downside scenarios

**Tools:**
- Python for simulation
- Financial modeling for inflation and FX
- Monte Carlo for FX volatility

---

## Behaviour Installed

### Success Indicators

- **Financial awareness**
  - Recognition that inventory decisions are financial during inflation
  - Questions about inflation and FX impact on inventory

- **Hedging intuition**
  - Understanding when inventory can hedge inflation
  - Recognition that over-hedging can backfire

- **Cash flow balance**
  - Questions about working capital vs. hedging benefits
  - Ability to calculate trade-offs

---

## Key Concepts

### Inflation and Inventory

- Inventory as inflation hedge: buy now, use later
- When it works: rising costs, stable demand
- When it backfires: falling prices, demand drops
- Cost of hedging: working capital, holding costs
- How to calculate: inflation-adjusted value

### Cash Flow vs Holding Risk

- Cash flow risk: capital tied up in inventory
- Holding risk: inventory loses value
- Trade-off: hedge vs. preserve cash
- Working capital constraints
- When to hedge vs. when not to

### FX Timing

- FX volatility: currency fluctuations
- Order timing: before or after FX moves?
- FX hedging: forward contracts, options
- Relationship: FX timing vs. inventory timing
- How to incorporate FX risk

### When Early Buying Backfires

- Early buying: order before needed
- Success: prices rise, demand stable
- Failure: prices fall, demand drops, obsolescence
- Case studies: over-hedging disasters
- Balance: hedge enough, not too much

---

## Tools and Techniques

- Inflation-adjusted inventory valuation
- FX risk analysis
- Financial modeling for inventory decisions
- Hedging strategy frameworks
- Working capital optimization
- Python libraries: pandas for financial analysis

---

**End of Module 7**
