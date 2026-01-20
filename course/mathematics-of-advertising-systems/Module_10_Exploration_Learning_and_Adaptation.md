---
title: "Exploration, Learning & Adaptation"
module: "Module 10"
week: 10
order: 10
description: "Balance learning with performance"
---

# Module 10: Exploration, Learning & Adaptation

## Introduction

Advertising systems must balance exploring new options with exploiting known good options. This module covers multi-armed bandits, exploration-exploitation trade-offs, and regret minimization.

## Learning Objectives

- Balance exploration vs exploitation
- Apply online learning
- Minimize regret
- Model multi-armed bandits
- Analyze regret
- Learn optimal creatives and bids dynamically
- Quantify the cost of experimentation

## Exploration vs Exploitation

### Trade-off

**Exploitation:**
```
Use best known option
Maximize immediate reward
```

**Exploration:**
```
Try new options
Gather information
May reduce immediate reward
```

**Balance:**
```
Explore enough to learn
Exploit enough to perform
```

### Exploration Strategies

**ε-greedy:**
```
With probability ε: Explore (random)
With probability 1-ε: Exploit (best)
```

**Upper Confidence Bound (UCB):**
```
Choose arm with highest UCB
UCB = Mean + Confidence_interval
```

**Thompson Sampling:**
```
Sample from posterior
Choose arm with highest sample
```

## Online Learning

### Online vs Offline

**Offline:**
```
Learn on historical data
Deploy learned model
```

**Online:**
```
Learn from streaming data
Update model continuously
```

**Advertising:**
```
Real-time data
Continuous learning
Adapt to changes
```

### Online Algorithms

**Gradient descent:**
```
θ_{t+1} = θ_t - α × ∇Loss(θ_t, Data_t)
```

**Exponential weights:**
```
w_i(t+1) = w_i(t) × exp(-α × Loss_i(t))
Normalize: w_i = w_i / Σ w_j
```

**Follow the leader:**
```
Choose best option based on history so far
```

## Regret Minimization

### Regret Definition

**Regret:**
```
Regret = Best_possible_reward - Actual_reward
```

**Cumulative regret:**
```
R_T = Σ(Best_reward_t - Actual_reward_t)
```

**Minimization:**
```
Minimize: E[R_T]
```

### Regret Bounds

**ε-greedy:**
```
E[R_T] = O(T^(2/3))
```

**UCB:**
```
E[R_T] = O(√(T × log T))
```

**Thompson Sampling:**
```
E[R_T] = O(√(T × log T))
```

**Lower bound:**
```
E[R_T] = Ω(√T)
```

## Key Models

### Multi-Armed Bandits

**Setup:**
```
K arms (options)
Each arm has unknown reward distribution
Choose arm each round
Observe reward
```

**Objective:**
```
Maximize total reward
Or minimize regret
```

### ε-Greedy

**Algorithm:**
```
With probability ε: Choose random arm
With probability 1-ε: Choose best_arm
```

**Best arm:**
```
best_arm = argmax_i (Mean_reward_i)
```

**Tuning:**
```
ε decreases over time
ε_t = 1 / √t
```

### Upper Confidence Bound (UCB)

**UCB formula:**
```
UCB_i = μ_i + c × √(log(t) / n_i)
where:
  μ_i = mean reward of arm i
  n_i = number of pulls of arm i
  c = confidence parameter
```

**Algorithm:**
```
Choose arm with highest UCB
```

**Intuition:**
```
Balance mean (exploitation) and uncertainty (exploration)
```

### Thompson Sampling

**Bayesian approach:**
```
Maintain posterior over arm rewards
Sample from posterior
Choose arm with highest sample
```

**Algorithm:**
```
1. Sample θ_i ~ Posterior_i for each arm
2. Choose arm* = argmax_i θ_i
3. Observe reward
4. Update posterior
```

**Advantages:**
- Natural exploration
- Good performance
- Handles uncertainty

## Learning Optimal Creatives and Bids Dynamically

### Creative Testing

**Multi-armed bandit:**
```
Each creative = arm
Reward = CTR or CVR
```

**Strategy:**
```
Start: Equal allocation
Learn: Which creatives perform best
Adapt: Allocate more to winners
```

**Optimization:**
```
Maximize: Total_conversions
Subject to: Learning_constraints
```

### Bid Optimization

**Contextual bandits:**
```
Arms = Bid levels
Context = User, Ad, ...
Reward = Value - Cost
```

**Learning:**
```
Learn optimal bid for each context
Adapt to market changes
```

**Algorithm:**
```
For each context:
  Maintain bid distribution
  Sample bid
  Observe outcome
  Update distribution
```

## Quantifying the Cost of Experimentation

### Exploration Cost

**Definition:**
```
Cost = Regret from exploring
Cost = Best_reward - Exploration_reward
```

**Expected cost:**
```
E[Cost] = E[Regret]
```

**Minimization:**
```
Minimize exploration while learning
```

### Value of Information

**Information gain:**
```
IG = H(Before) - H(After)
```

**Cost-benefit:**
```
Explore if: Information_value > Exploration_cost
```

**Optimal exploration:**
```
Balance: Information_gain vs Immediate_reward_loss
```

### Experimentation Budget

**Allocation:**
```
Exploration_budget = Total_budget × Exploration_rate
```

**Optimization:**
```
Maximize: Long_term_reward
Subject to: Exploration_budget
```

## Exercises

1. **Bandits:** Implement multi-armed bandit algorithm
2. **Exploration:** Design exploration strategy
3. **Regret:** Calculate and minimize regret
4. **Adaptation:** Build adaptive bidding system

## Case Studies

- Creative testing with bandits
- Adaptive bidding systems
- Exploration-exploitation balance
- Regret minimization
- Online learning in advertising
