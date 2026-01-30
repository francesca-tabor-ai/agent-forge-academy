---
title: "Module 5: Heuristics vs ML vs Optimization"
description: "Choose the right tool"
module: "5"
order: 5
problem: "Using the wrong tool for scheduling problems"
capability: "Tool Selection for Scheduling"
inspiration: "Operations research, machine learning, and heuristic design"
---

# Module 5: Heuristics vs ML vs Optimization

**Problem:** Using the wrong tool for scheduling problems  
**Capability:** Tool Selection for Scheduling  
**Inspiration:** Operations research, machine learning, and heuristic design

---

## Mindset Shift

> "Choose the right tool for the problem. Simple heuristics often beat complex ML models in production scheduling."

---

## Learning Objectives

### Rule-Based Heuristics

- **Simple rules that work:**
  - First-come-first-served (FCFS)
  - Shortest processing time (SPT)
  - Earliest due date (EDD)
  - Critical ratio (CR)
  - Longest processing time (LPT)

- When heuristics work well
- How to design effective heuristics
- The advantages of heuristics (simple, fast, explainable)
- The limitations of heuristics (local optimization, no learning)

### Mathematical Optimization

- **Optimization approaches:**
  - Linear programming (LP)
  - Mixed-integer programming (MIP)
  - Constraint programming (CP)
  - Metaheuristics (genetic algorithms, simulated annealing)

- When optimization is worth it
- The advantages of optimization (optimal or near-optimal solutions)
- The limitations of optimization (computational cost, model complexity)
- When optimization is overkill

### Reinforcement Learning

- **RL for scheduling:**
  - Learning optimal policies from experience
  - Adapting to changing conditions
  - Handling complex state spaces

- When RL makes sense
- The advantages of RL (adaptation, learning)
- The limitations of RL (data requirements, training time, explainability)
- Why RL often overfits noise

### Why ML Often Overfits Noise

- **The problem:**
  - Production data is noisy
  - Historical patterns may not repeat
  - Overfitting to noise reduces generalization
  - Complex models find spurious patterns

- Why simple models often generalize better
- The bias-variance trade-off in scheduling
- When to use ML vs. when to avoid it
- How to validate ML models in production

---

## Exercise

### Beat an ML Scheduler with Simple Rules

**Objective:** Demonstrate that simple heuristics can outperform complex ML models

**Steps:**

1. **Define the Problem**
   - Choose a scheduling problem
   - Define success metrics (throughput, lateness, changeover cost)
   - Gather historical data

2. **Build an ML Model**
   - Train a scheduling model (RL, neural network, etc.)
   - Validate on historical data
   - Measure performance

3. **Design Simple Heuristics**
   - Identify key decision points
   - Design rule-based heuristics
   - Implement the heuristics

4. **Compare Performance**
   - Run both approaches on test data
   - Compare metrics (throughput, lateness, changeover cost)
   - Measure computational cost
   - Evaluate explainability

5. **Analyze Results**
   - Why did the heuristic win (or lose)?
   - What patterns did the ML model learn?
   - What noise did the ML model overfit?
   - When would ML be better?

**Deliverables:**
- Problem definition and metrics
- ML model and performance
- Heuristic design and implementation
- Performance comparison
- Analysis of why one approach won
- Recommendations for when to use each approach

---

## Behaviour Installed

### Success Indicators

- **Tool selection awareness**
  - Questions about problem characteristics come first
  - Recognition that simple often beats complex
  - Understanding of when to use each tool

- **Pragmatic approach**
  - Preference for simple, explainable solutions
  - Recognition of ML limitations
  - Understanding of the bias-variance trade-off

- **Performance focus**
  - Ability to evaluate tools objectively
  - Recognition that optimal ≠ best in practice
  - Understanding of computational vs. solution quality trade-offs

---

## Key Concepts

### Rule-Based Heuristics

- Simple rules that work
- When heuristics work well
- How to design effective heuristics
- Advantages and limitations

### Mathematical Optimization

- Optimization approaches
- When optimization is worth it
- Advantages and limitations
- When optimization is overkill

### Reinforcement Learning

- RL for scheduling
- When RL makes sense
- Advantages and limitations
- Why RL often overfits noise

### Why ML Overfits Noise

- Production data is noisy
- Historical patterns may not repeat
- Overfitting reduces generalization
- Simple models often generalize better

---

## Tools and Techniques

- Heuristic design methods
- Optimization algorithm selection
- ML model validation techniques
- Performance comparison frameworks
- Bias-variance trade-off analysis
- Explainability evaluation

---

**End of Module 5**
