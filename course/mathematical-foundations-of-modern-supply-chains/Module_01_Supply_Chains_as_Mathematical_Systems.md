---
title: "Supply Chains as Mathematical Systems"
module: "Module 1"
week: 1
order: 1
description: "How can supply chains be represented, measured, and reasoned about mathematically?"
---

# Module 1: Supply Chains as Mathematical Systems

## Introduction

Supply chains can be represented as mathematical systems with nodes, flows, constraints, and objectives. This module establishes the foundation for modeling supply chains mathematically.

## Learning Objectives

- Represent supply chains as networks and flows
- Identify state variables, constraints, and objectives
- Distinguish deterministic vs. stochastic systems
- Apply graph theory
- Use systems of equations
- Apply conservation laws (flow balance)
- Translate real supply chains into mathematical systems
- Identify decision variables, constraints, and KPIs

## Supply Chains as Networks and Flows

### Network Representation

**Graph structure:**
```
G = (N, E)
where:
  N = Nodes (suppliers, factories, warehouses, customers)
  E = Edges (transportation links, flows)
```

**Node types:**
- Supply nodes (suppliers)
- Production nodes (factories)
- Storage nodes (warehouses)
- Demand nodes (customers)

**Edge properties:**
- Capacity
- Cost
- Lead time
- Flow rate

### Flow Variables

**Flow definition:**
```
f_ij = Flow from node i to node j
```

**Flow constraints:**
```
0 ≤ f_ij ≤ Capacity_ij
```

**Flow balance:**
```
Σ f_in - Σ f_out = Net_supply
```

## State Variables, Constraints, and Objectives

### State Variables

**Inventory:**
```
I_i(t) = Inventory at node i at time t
```

**Backlog:**
```
B_i(t) = Backlog at node i at time t
```

**State vector:**
```
x(t) = [I_1(t), I_2(t), ..., B_1(t), B_2(t), ...]
```

### Constraints

**Capacity:**
```
Production_i ≤ Capacity_i
Flow_ij ≤ Capacity_ij
Inventory_i ≤ Storage_capacity_i
```

**Demand:**
```
Must satisfy demand
Backlog ≤ Max_backlog
```

**Balance:**
```
Flow_in = Flow_out + Inventory_change
```

### Objectives

**Cost minimization:**
```
Minimize: Total_cost = Production_cost + Transportation_cost + Holding_cost + Stockout_cost
```

**Service maximization:**
```
Maximize: Service_level = 1 - Stockout_probability
```

**Multi-objective:**
```
Minimize: w₁×Cost + w₂×(1 - Service_level)
```

## Deterministic vs. Stochastic Systems

### Deterministic Systems

**Definition:**
```
All parameters known with certainty
No randomness
```

**Model:**
```
x(t+1) = f(x(t), u(t))
where u(t) = control decisions
```

**Advantages:**
- Simpler
- Exact solutions
- Easier to optimize

**Limitations:**
- Unrealistic
- Ignores uncertainty

### Stochastic Systems

**Definition:**
```
Parameters uncertain
Randomness in demand, supply, lead times
```

**Model:**
```
x(t+1) = f(x(t), u(t), ξ(t))
where ξ(t) = random variables
```

**Advantages:**
- Realistic
- Accounts for uncertainty
- Risk-aware

**Challenges:**
- More complex
- Approximate solutions
- Requires probability distributions

## Mathematical Tools

### Graph Theory

**Basic concepts:**
- Nodes (vertices)
- Edges (arcs)
- Paths
- Cycles
- Connectivity

**Network properties:**
- Shortest paths
- Minimum spanning trees
- Maximum flow
- Minimum cost flow

### Systems of Equations

**Flow balance:**
```
For each node i:
  Σ f_ji - Σ f_ij = Supply_i - Demand_i
```

**Matrix form:**
```
A × f = b
where:
  A = incidence matrix
  f = flow vector
  b = supply-demand vector
```

**Solution:**
```
f = A^(-1) × b (if square and invertible)
Or solve: min ||A×f - b||²
```

### Conservation Laws (Flow Balance)

**Conservation:**
```
Flow_in = Flow_out + Accumulation
```

**Steady state:**
```
Flow_in = Flow_out
No accumulation
```

**Dynamic:**
```
dI/dt = Flow_in - Flow_out
```

## Learning Outcomes

### Translating Supply Chains

**Steps:**
1. Identify nodes and edges
2. Define state variables
3. Specify constraints
4. Formulate objectives
5. Choose deterministic or stochastic

**Example:**
```
Supply chain: Supplier → Factory → Warehouse → Customer
Nodes: {Supplier, Factory, Warehouse, Customer}
Edges: {(Supplier, Factory), (Factory, Warehouse), (Warehouse, Customer)}
State: Inventory at each node
Constraints: Capacity, demand satisfaction
Objective: Minimize total cost
```

### Identifying Decision Variables

**Decision variables:**
- Production quantities
- Transportation flows
- Inventory levels
- Order quantities

**Constraints:**
- Capacity limits
- Demand requirements
- Balance equations
- Non-negativity

**KPIs:**
- Total cost
- Service level
- Inventory turnover
- Fill rate

## Exercises

1. **Network Modeling:** Represent supply chain as graph
2. **Flow Balance:** Set up flow balance equations
3. **State Variables:** Identify state variables and dynamics
4. **System Translation:** Translate real supply chain to mathematical system

## Case Studies

- Supply chain network design
- Flow optimization
- Multi-echelon systems
- Network resilience
- System dynamics
