---
title: "Module 3: Push vs Pull Systems"
description: "Understand why demand signals break"
module: "3"
order: 3
problem: "Forecast-driven systems that amplify demand variability"
capability: "Demand Signal Management"
inspiration: "Lean manufacturing and just-in-time systems"
---

# Module 3: Push vs Pull Systems

**Problem:** Forecast-driven systems that amplify demand variability  
**Capability:** Demand Signal Management  
**Inspiration:** Lean manufacturing and just-in-time systems

---

## Mindset Shift

> "Forecasts are always wrong — the question is whether your system can handle it."

---

## Learning Objectives

### Forecast-Driven (Push) Systems

- How push systems work
- Production based on forecasts, not actual demand
- Inventory buffers to handle uncertainty
- Why forecasts amplify variability
- When push systems make sense

### Demand-Driven (Pull) Systems

- How pull systems work
- Production triggered by actual demand
- Minimal inventory, maximum responsiveness
- Kanban and other pull mechanisms
- When pull systems make sense

### Hybrid Systems in Practice

- Most real systems are hybrid
- Push for long lead-time items
- Pull for short lead-time items
- Decoupling points between push and pull
- How to design hybrid systems

### The Bullwhip Effect (And Why AI Often Worsens It)

- What the bullwhip effect is
- Why small demand changes amplify upstream
- How information delays create amplification
- Why AI models can make it worse
- How to dampen the bullwhip effect

---

## Hands-On Exercise

### Simulate Demand Amplification with Delayed Signals

**Objective:** Experience how demand variability amplifies through the supply chain

**Setup:**
- Multi-stage supply chain simulation
- Each stage has:
  - Inventory buffer
  - Order processing delay
  - Forecast-based ordering
  - Lead time to receive orders

**Scenario:**
1. **Base Case:** Stable demand, perfect information
   - Observe system behavior
   - Measure inventory levels and order variability

2. **Demand Spike:** Small increase in end-customer demand
   - Track how the spike propagates upstream
   - Measure amplification at each stage
   - Observe inventory swings

3. **Information Delay:** Add delays to information flow
   - Compare with base case
   - Measure increased amplification
   - Observe how delays create over-reaction

4. **Forecast Error:** Introduce forecast inaccuracy
   - Compare with actual demand
   - Measure system response
   - Observe inventory buildup or stockouts

**Deliverables:**
- Graphs showing demand amplification at each stage
- Comparison of variability (coefficient of variation)
- Identification of which factors amplify most
- Recommendations for reducing amplification

**Tools:**
- Spreadsheet simulation or Python model
- Simple supply chain with 3-4 stages
- Track: demand, orders, inventory, forecasts

---

## Practical Exercise

### Analyze a Real System's Push/Pull Characteristics

**Objective:** Identify push and pull elements in a real supply chain

**Steps:**
1. Choose a product or service you're familiar with
2. Map the supply chain stages
3. For each stage, identify:
   - Is it push or pull?
   - What triggers production/ordering?
   - What information is used?
   - What inventory buffers exist?
4. Identify decoupling points
5. Document where the bullwhip effect might occur

**Deliverables:**
- Push/pull map of the supply chain
- Identification of decoupling points
- Analysis of where demand amplification occurs
- Recommendations for improving signal flow

---

## Behaviour Installed

### Success Indicators

- **Demand signal awareness**
  - Questions about how demand signals flow
  - Recognition of forecast limitations

- **Bullwhip recognition**
  - Ability to identify where amplification occurs
  - Understanding of why it happens

- **System design thinking**
  - Questions about push vs. pull at each stage
  - Understanding of hybrid approaches

---

## Key Concepts

### Push Systems

- Forecast-driven production
- Inventory buffers for uncertainty
- Batch production
- Economies of scale focus
- Risk: overproduction, obsolescence

### Pull Systems

- Demand-driven production
- Minimal inventory
- Just-in-time delivery
- Responsiveness focus
- Risk: stockouts, capacity constraints

### Hybrid Systems

- Push for long lead times
- Pull for short lead times
- Decoupling points
- Strategic inventory placement
- Balancing efficiency and responsiveness

### The Bullwhip Effect

- Demand variability amplification
- Causes: information delays, forecast errors, batch ordering
- Impact: excess inventory, stockouts, system instability
- Solutions: better information sharing, smaller batches, pull systems

---

## Tools and Techniques

- Supply chain simulation
- Bullwhip effect measurement (coefficient of variation)
- Push/pull system design
- Decoupling point identification
- Demand signal processing

---

**End of Module 3**
