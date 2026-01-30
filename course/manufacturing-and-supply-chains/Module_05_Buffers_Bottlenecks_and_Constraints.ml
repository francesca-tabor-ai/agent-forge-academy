---
title: "Module 5: Buffers, Bottlenecks & Constraints"
description: "Model the system's real limits"
module: "5"
order: 5
problem: "Optimizing non-bottlenecks while ignoring real constraints"
capability: "Constraint-Based Systems Thinking"
inspiration: "Theory of Constraints (TOC) and lean manufacturing"
---

# Module 5: Buffers, Bottlenecks & Constraints

**Problem:** Optimizing non-bottlenecks while ignoring real constraints  
**Capability:** Constraint-Based Systems Thinking  
**Inspiration:** Theory of Constraints (TOC) and lean manufacturing

---

## Mindset Shift

> "A system is only as fast as its slowest part — and that's usually not what you're optimizing."

---

## Learning Objectives

### Inventory Buffers vs Capacity Buffers

- **Inventory buffers:** Stock to handle variability
- **Capacity buffers:** Extra capacity to handle peaks
- When to use each type
- The cost of buffers
- How buffers hide problems

### Bottleneck Identification

- What a bottleneck is
- How to find bottlenecks
- Why bottlenecks move
- Temporary vs. permanent bottlenecks
- The impact of bottlenecks on system throughput

### Throughput vs Utilization Trade-offs

- High utilization doesn't mean high throughput
- Why 100% utilization is bad
- The relationship between utilization and lead time
- Optimal utilization levels
- When to add capacity vs. manage demand

### Why Optimizing Locally Breaks Systems Globally

- Local optimization examples
- How local improvements create system problems
- The fallacy of optimizing non-bottlenecks
- System-wide thinking
- Sub-optimization vs. system optimization

---

## Case Study

### Production Line Constrained by a Single Packaging Machine

**Scenario:** A manufacturing line producing consumer goods

**System Components:**
- Raw material receiving
- Multiple production stages (mixing, forming, baking, etc.)
- Quality inspection
- **Packaging machine** (bottleneck)
- Warehouse storage
- Shipping

**Initial Situation:**
- Production stages running at 80-90% utilization
- Packaging machine running at 100% utilization
- Frequent overtime to meet demand
- High work-in-process (WIP) inventory before packaging
- Low inventory after packaging

**Common Mistakes:**
1. **Optimizing non-bottlenecks:** Improving production stages that aren't the constraint
2. **Reducing packaging machine downtime:** But not addressing root causes
3. **Adding inventory buffers:** Hiding the problem instead of fixing it
4. **Focusing on efficiency metrics:** Measuring utilization instead of throughput

**Correct Approach:**
1. **Identify the constraint:** Packaging machine is the bottleneck
2. **Exploit the constraint:** Maximize packaging machine output
   - Reduce setup times
   - Eliminate unnecessary downtime
   - Ensure it never runs out of material
3. **Subordinate everything else:** Production stages should match packaging rate
   - Don't overproduce (creates WIP inventory)
   - Don't underproduce (starves packaging)
4. **Elevate the constraint:** If needed, add capacity
   - Only after exploiting and subordinating
   - Consider: second machine, faster machine, outsourcing
5. **Repeat:** Find the next bottleneck

**Key Learnings:**
- The bottleneck determines system throughput
- Optimizing non-bottlenecks doesn't help
- High utilization at non-bottlenecks creates waste
- System thinking beats local optimization
- Constraints move — what's a bottleneck today may not be tomorrow

---

## Practical Exercise

### Identify Bottlenecks in a System

**Objective:** Practice finding and managing bottlenecks

**Activity:**

1. **Choose a System**
   - A process you're familiar with
   - Examples: order fulfillment, software development, customer service

2. **Map the Process**
   - Identify all stages
   - Document capacity at each stage
   - Measure utilization at each stage
   - Track throughput (output per unit time)

3. **Find the Bottleneck**
   - Which stage has highest utilization?
   - Where does work accumulate?
   - What stage determines system output?
   - Where would adding capacity have biggest impact?

4. **Analyze Buffer Strategy**
   - Where are inventory buffers?
   - Where are capacity buffers?
   - Are buffers hiding problems?
   - What would happen without buffers?

5. **Propose Improvements**
   - How to exploit the bottleneck
   - How to subordinate non-bottlenecks
   - Whether to elevate the constraint
   - Expected impact on throughput

**Deliverables:**
- Process map with capacities and utilizations
- Bottleneck identification and analysis
- Buffer strategy assessment
- Improvement recommendations
- Expected throughput impact

---

## Behaviour Installed

### Success Indicators

- **Bottleneck awareness**
  - Questions about where work accumulates
  - Recognition that not all stages are equal

- **System thinking**
  - Understanding that local optimization can hurt
  - Focus on system throughput, not local efficiency

- **Constraint management**
  - Ability to identify and manage constraints
  - Questions about buffer strategies

---

## Key Concepts

### Buffers

- **Inventory buffers:** Stock to handle variability
- **Capacity buffers:** Extra capacity for peaks
- When to use each
- The cost of buffers
- How buffers hide problems

### Bottlenecks

- Definition: stage that limits system throughput
- How to identify: high utilization, work accumulation
- Why bottlenecks move
- Temporary vs. permanent
- Impact on system performance

### Throughput vs Utilization

- Throughput: output per unit time (what matters)
- Utilization: % of capacity used (can be misleading)
- Why high utilization can be bad
- Optimal utilization levels
- Relationship to lead time

### Theory of Constraints (TOC)

- Five focusing steps:
  1. Identify the constraint
  2. Exploit the constraint
  3. Subordinate everything else
  4. Elevate the constraint
  5. Repeat (don't let inertia become the constraint)

---

## Tools and Techniques

- Process mapping
- Capacity analysis
- Utilization measurement
- Bottleneck identification
- Theory of Constraints (TOC)
- Throughput accounting
- Buffer management

---

**End of Module 5**
