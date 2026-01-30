---
title: "Module 2: Route Optimization Beyond Shortest Path"
description: "Move past naive routing to multi-criteria optimization"
module: "2"
order: 2
problem: "Shortest path optimization ignores cost, time, and reliability trade-offs"
capability: "Multi-Criteria Route Optimization"
inspiration: "Operations research and multi-objective optimization"
---

# Module 2: Route Optimization Beyond Shortest Path

**Problem:** Shortest path optimization ignores cost, time, and reliability trade-offs  
**Capability:** Multi-Criteria Route Optimization  
**Inspiration:** Operations research and multi-objective optimization

---

## Mindset Shift

> "Shortest ≠ fastest ≠ cheapest. Route optimization requires explicit trade-offs."

---

## Learning Objectives

### Cost Functions (Fuel, Tolls, Labor, Handling)

- Fuel costs: distance, vehicle type, load weight
- Toll costs: route-specific fees and charges
- Labor costs: driver time, overtime, regulations
- Handling costs: loading, unloading, transshipment
- Why cost functions are multi-dimensional
- The difference between direct and indirect costs

### Time-Dependent Routing

- Time windows: delivery constraints and availability
- Time-varying costs: congestion, tolls, labor rates
- Time-dependent travel times: rush hour, night restrictions
- Why static routing fails in dynamic environments
- The importance of temporal awareness

### Multi-Objective Optimization

- Cost minimization vs. time minimization
- Reliability maximization vs. cost minimization
- Service level vs. operational efficiency
- Pareto optimality: the set of non-dominated solutions
- Why single-objective optimization is insufficient

### Why Shortest ≠ Fastest ≠ Cheapest

- Shortest path: minimum distance
- Fastest path: minimum time (may require longer distance)
- Cheapest path: minimum cost (may require longer time)
- The trade-offs between distance, time, and cost
- When each objective matters most

---

## Hands-On Exercise

### Build a Multi-Criteria Routing Model

**Objective:** Implement routing that balances cost, time, and reliability

**Steps:**

1. **Define Cost Function**
   - Fuel cost per mile by vehicle type
   - Toll costs by route segment
   - Labor costs per hour
   - Handling costs per stop
   - Total cost = fuel + tolls + labor + handling

2. **Define Time Function**
   - Base travel time by route segment
   - Time-dependent multipliers (rush hour, night)
   - Loading/unloading time per stop
   - Total time = travel + handling + waiting

3. **Define Reliability Function**
   - Historical on-time performance by route
   - Delay probability distributions
   - Reliability score = 1 - delay risk

4. **Build Multi-Objective Model**
   - Minimize cost (weight: w1)
   - Minimize time (weight: w2)
   - Maximize reliability (weight: w3)
   - Objective = w1*cost + w2*time - w3*reliability

5. **Generate Pareto Frontier**
   - Solve for different weight combinations
   - Identify non-dominated solutions
   - Visualize trade-offs between objectives

6. **Compare to Shortest Path**
   - Calculate shortest path route
   - Calculate cost, time, reliability for shortest path
   - Compare to Pareto-optimal solutions
   - Document when shortest path fails

**Deliverables:**
- Multi-criteria routing model implementation
- Cost, time, and reliability functions
- Pareto frontier visualization
- Comparison: shortest path vs. optimal solutions
- Decision framework for weight selection

---

## Discussion

### When Shortest Path Fails

**Scenario Analysis:**

1. **The Distance Trap**
   - Case: Route optimized for shortest distance
   - Reality: Shortest route has high tolls and congestion
   - Outcome: Higher cost and longer time than alternatives
   - Lesson: Distance is only one dimension

2. **The Time Blindness**
   - Case: Route optimized for minimum time
   - Reality: Fastest route has low reliability
   - Outcome: Frequent delays despite fast baseline
   - Lesson: Speed without reliability is unreliable

3. **The Cost Minimization Failure**
   - Case: Route optimized for minimum cost
   - Reality: Cheapest route has poor service levels
   - Outcome: Customer dissatisfaction despite low cost
   - Lesson: Cost optimization must consider service

**Discussion Questions:**
- When have you seen shortest path optimization fail?
- What trade-offs were ignored?
- What was the actual cost of the failure?
- How could multi-criteria optimization have helped?

---

## Behaviour Installed

### Success Indicators

- **Multi-criteria thinking**
  - Questions about cost, time, and reliability come naturally
  - Recognition that shortest path is rarely optimal
  - Understanding of trade-offs between objectives

- **Explicit trade-off awareness**
  - Ability to articulate what's being optimized
  - Questions about weight selection and priorities
  - Preference for Pareto-optimal solutions

- **Cost function sophistication**
  - Understanding that cost is multi-dimensional
  - Questions about indirect and hidden costs
  - Recognition that time-dependent costs matter

---

## Key Concepts

### Multi-Criteria Optimization

- Cost minimization: fuel, tolls, labor, handling
- Time minimization: travel time, handling time, waiting
- Reliability maximization: on-time performance, delay risk
- Pareto optimality: non-dominated solution set
- Weight selection: balancing competing objectives

### Cost Functions

- Direct costs: fuel, tolls, labor, handling
- Indirect costs: opportunity cost, customer impact
- Time-dependent costs: congestion, overtime, penalties
- Multi-dimensional cost structures

### Time-Dependent Routing

- Time windows: delivery constraints
- Time-varying costs: congestion, tolls, labor
- Time-dependent travel times: rush hour, restrictions
- Temporal awareness in routing

---

## Tools and Techniques

- Multi-objective optimization algorithms
- Pareto frontier generation
- Cost function modeling
- Time-dependent routing algorithms
- Trade-off analysis frameworks

---

**End of Module 2**
