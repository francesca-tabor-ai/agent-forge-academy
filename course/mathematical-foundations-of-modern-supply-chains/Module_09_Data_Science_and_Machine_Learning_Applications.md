---
title: "Data Science & Machine Learning Applications"
module: "Module 9"
week: 9
order: 9
description: "How do algorithms learn and adapt supply chain decisions?"
---

# Module 9: Data Science & Machine Learning Applications

## Introduction

Machine learning enables adaptive supply chain decisions. This module covers predictive analytics, risk classification, and policy learning using ML models.

## Learning Objectives

- Apply predictive analytics
- Classify risks and failures
- Learn policies
- Use regression and classification models
- Apply reinforcement learning (MDPs)
- Use loss functions and optimization
- Apply ML models to forecasting, risk, and replenishment
- Understand when ML outperforms classical models

## Predictive Analytics

### Forecasting

**Time series:**
```
Demand_t = f(Demand_{t-1}, ..., Demand_{t-p}, Features_t)
```

**ML models:**
- LSTM (Long Short-Term Memory)
- Random Forest
- Gradient Boosting
- Neural networks

**Advantages:**
- Captures complex patterns
- Handles non-linearity
- Automatic feature learning

### Demand Prediction

**Features:**
```
Historical_demand, Seasonality, Promotions, External_factors
```

**Model:**
```
Demand = f(Features)
```

**Training:**
```
Minimize: Loss(Demand, Prediction)
```

**Evaluation:**
```
MAE, RMSE, MAPE
```

## Classification of Risks and Failures

### Risk Classification

**Problem:**
```
Classify: High_risk, Medium_risk, Low_risk
```

**Features:**
```
Supplier_history, Lead_time, Demand_variability, ...
```

**Models:**
- Logistic regression
- Random Forest
- Neural networks

**Output:**
```
P(Risk_level | Features)
```

### Failure Prediction

**Problem:**
```
Predict: Failure = 1, No_failure = 0
```

**Features:**
```
Equipment_age, Maintenance_history, Usage, ...
```

**Model:**
```
P(Failure) = f(Features)
```

**Application:**
```
Predictive maintenance
Prevent failures
```

## Policy Learning

### Reinforcement Learning

**Markov Decision Process (MDP):**
```
States: S
Actions: A
Rewards: R
Transitions: P(s'|s,a)
```

**Policy:**
```
π(a|s) = Probability of action a in state s
```

**Value function:**
```
V^π(s) = E[Σ γ^t × R_t | s_0 = s, π]
```

**Optimal policy:**
```
π* = argmax_π V^π(s)
```

### Supply Chain Application

**States:**
```
Inventory_levels, Demand_forecast, Lead_times, ...
```

**Actions:**
```
Order_quantities, Routing_decisions, ...
```

**Rewards:**
```
Profit, Service_level, Cost, ...
```

**Learning:**
```
Learn optimal policy from data
Adapt to changes
```

## Mathematical Tools

### Regression and Classification Models

**Linear regression:**
```
y = β₀ + β₁×x₁ + ... + βₙ×xₙ + ε
```

**Logistic regression:**
```
P(y=1) = 1 / (1 + exp(-(β₀ + β₁×x₁ + ... + βₙ×xₙ)))
```

**Random Forest:**
```
Ensemble of decision trees
Handles non-linearity
```

**Neural networks:**
```
Deep learning
Complex patterns
```

### Reinforcement Learning (MDPs)

**Bellman equation:**
```
V^π(s) = Σ π(a|s) × Σ P(s'|s,a) × [R(s,a,s') + γ×V^π(s')]
```

**Optimal:**
```
V*(s) = max_a Σ P(s'|s,a) × [R(s,a,s') + γ×V*(s')]
```

**Q-learning:**
```
Q(s,a) = R(s,a) + γ × max_a' Q(s',a')
```

**Policy gradient:**
```
∇J(θ) = E[∇log π_θ(a|s) × Q^π(s,a)]
```

### Loss Functions and Optimization

**Regression:**
```
L = (1/n) × Σ(y_i - ŷ_i)²  (MSE)
L = (1/n) × Σ|y_i - ŷ_i|  (MAE)
```

**Classification:**
```
L = -(1/n) × Σ[y_i×log(ŷ_i) + (1-y_i)×log(1-ŷ_i)]  (Cross-entropy)
```

**Optimization:**
```
Gradient descent
Stochastic gradient descent
Adam, RMSprop
```

## Learning Outcomes

### Applying ML to Supply Chain

**Forecasting:**
```
Demand_forecast = ML_model(Features)
```

**Risk:**
```
Risk_score = ML_model(Features)
```

**Replenishment:**
```
Order_quantity = RL_policy(State)
```

**Routing:**
```
Route = ML_model(Orders, Locations, Constraints)
```

### When ML Outperforms Classical Models

**ML better when:**
- Complex non-linear patterns
- Large datasets
- Many features
- Real-time adaptation needed

**Classical better when:**
- Interpretability important
- Small datasets
- Simple patterns
- Theoretical understanding needed

**Hybrid:**
```
Combine ML and classical
Best of both worlds
```

## Exercises

1. **Forecasting:** Build ML demand forecast model
2. **Risk Classification:** Classify supply chain risks
3. **RL:** Implement reinforcement learning for inventory
4. **Comparison:** Compare ML vs classical models

## Case Studies

- ML demand forecasting
- Risk prediction systems
- Reinforcement learning in supply chains
- Predictive maintenance
- ML vs classical model comparison
