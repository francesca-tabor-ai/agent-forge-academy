---
title: "Network Topology & Graph Theory"
module: "Module 6"
week: 6
order: 6
description: "Model telecom networks as graphs"
---

# Module 6: Network Topology & Graph Theory

## Introduction

Telecom networks can be modeled as graphs. This module covers nodes, links, flows, routing, shortest paths, and network resilience.

## Learning Objectives

- Model nodes, links, and flows
- Understand routing and shortest paths
- Design resilience and redundancy
- Apply graph Laplacians
- Use eigenvalues
- Apply network flow constraints
- Analyze robustness of transport networks
- Design resilient topologies

## Nodes, Links, and Flows

### Graph Representation

**Graph:**
```
G = (V, E)
where:
  V = vertices (nodes)
  E = edges (links)
```

**Network:**
```
Nodes: Routers, Switches, Base_stations
Links: Fiber, Wireless, Copper
```

**Flow:**
```
f_ij = Flow from node i to node j
```

### Flow Constraints

**Capacity:**
```
0 ≤ f_ij ≤ Capacity_ij
```

**Flow balance:**
```
Σ f_ji - Σ f_ij = Supply_i - Demand_i
```

**Conservation:**
```
Flow_in = Flow_out (for transit nodes)
```

## Routing and Shortest Paths

### Shortest Path Problem

**Objective:**
```
Minimize: Σ d_ij × x_ij
where:
  d_ij = distance/cost on link (i,j)
  x_ij = 1 if link used, 0 otherwise
```

**Constraints:**
```
Flow_balance at each node
Path_connectivity
```

**Algorithms:**
- Dijkstra's algorithm
- Bellman-Ford algorithm
- Floyd-Warshall algorithm

### Routing Protocols

**Shortest path:**
```
Route along minimum_cost_path
```

**Load balancing:**
```
Distribute traffic across multiple_paths
```

**Adaptive:**
```
Update routes based on conditions
Link_failures, Congestion
```

## Resilience and Redundancy

### Network Resilience

**Definition:**
```
Ability to maintain connectivity
After node/link failures
```

**Metrics:**
```
Connectivity
Path_diversity
Failure_tolerance
```

### Redundancy

**Node redundancy:**
```
Multiple_paths between nodes
```

**Link redundancy:**
```
Multiple_links between nodes
```

**Design:**
```
k-connected: k disjoint paths
k-edge-connected: k edge-disjoint paths
```

## Core Mathematics

### Graph Laplacians

**Laplacian matrix:**
```
L = D - A
where:
  D = degree matrix
  A = adjacency matrix
```

**Properties:**
```
L is symmetric
L has non-negative eigenvalues
Smallest eigenvalue = 0
```

**Connectivity:**
```
Second_smallest_eigenvalue > 0 ↔ Graph_connected
```

### Eigenvalues

**Eigenvalue decomposition:**
```
L = U × Λ × Uᵀ
where:
  Λ = diagonal matrix of eigenvalues
  U = matrix of eigenvectors
```

**Spectral properties:**
```
λ₁ = 0 (always)
λ₂ > 0 ↔ Graph_connected
Larger_λ₂ → More_connected
```

**Application:**
```
Network_robustness
Community_detection
Graph_partitioning
```

### Network Flow Constraints

**Max-flow min-cut:**
```
Maximum_flow = Minimum_cut_capacity
```

**Formulation:**
```
Maximize: Flow from source to sink
Subject to:
  Capacity_constraints
  Flow_conservation
```

**Solution:**
```
Ford-Fulkerson algorithm
Edmonds-Karp algorithm
```

## Learning Outcomes

### Analyzing Robustness

**Connectivity:**
```
k-connected: Can lose k-1 nodes
k-edge-connected: Can lose k-1 links
```

**Failure analysis:**
```
Remove nodes/links
Check connectivity
Measure impact
```

**Robustness metrics:**
```
Node_connectivity
Edge_connectivity
Average_path_length
Clustering_coefficient
```

### Designing Resilient Topologies

**Mesh topology:**
```
High_redundancy
High_cost
```

**Ring topology:**
```
Moderate_redundancy
Moderate_cost
```

**Star topology:**
```
Low_redundancy
Low_cost
```

**Hybrid:**
```
Balance redundancy and cost
Optimize for resilience
```

## Exercises

1. **Graph Modeling:** Model network as graph
2. **Routing:** Find shortest paths
3. **Resilience:** Analyze network robustness
4. **Design:** Design resilient topology

## Case Studies

- Transport network design
- Network resilience analysis
- Routing optimization
- Failure recovery
- Topology optimization
