---
title: "Economics & Incentives in Supply Chains"
module: "Module 8"
week: 8
order: 8
description: "How do prices, contracts, and incentives shape behavior?"
---

# Module 8: Economics & Incentives in Supply Chains

## Introduction

Economic incentives drive supply chain behavior. This module covers cost-to-serve, price elasticity, and contract design using microeconomic models.

## Learning Objectives

- Calculate cost-to-serve
- Understand price elasticity
- Design contracts
- Apply microeconomic models
- Use elasticity equations
- Apply game-theoretic payoff structures
- Align economic incentives with operational goals
- Quantify profitability by customer, channel, or SKU

## Cost-to-Serve

### Definition

**Cost-to-serve:**
```
Total_cost to serve customer/channel/SKU
```

**Components:**
```
Cost_to_serve = Acquisition_cost + Fulfillment_cost + Transportation_cost + Service_cost
```

**Allocation:**
```
Allocate costs to customers/channels/SKUs
Activity-based costing
```

### Calculation

**Direct costs:**
```
Direct_cost = Directly_attributable_costs
```

**Indirect costs:**
```
Indirect_cost = Allocated_overhead
Allocation_basis = Activity_driver
```

**Total:**
```
Cost_to_serve = Direct_cost + Indirect_cost
```

### Profitability Analysis

**Revenue:**
```
Revenue = Price × Quantity
```

**Profit:**
```
Profit = Revenue - Cost_to_serve
```

**Profit margin:**
```
Margin = Profit / Revenue
```

## Price Elasticity

### Definition

**Price elasticity of demand:**
```
E = (ΔQ/Q) / (ΔP/P) = (dQ/dP) × (P/Q)
```

**Interpretation:**
- |E| > 1: Elastic (price-sensitive)
- |E| < 1: Inelastic (price-insensitive)
- |E| = 1: Unit elastic

### Revenue Impact

**Revenue:**
```
Revenue = P × Q
```

**Marginal revenue:**
```
dRevenue/dP = Q × (1 + E)
```

**Optimal pricing:**
```
If E < -1: Lower price increases revenue
If E > -1: Raise price increases revenue
```

### Elasticity Estimation

**From data:**
```
E = (ΔQ/Q) / (ΔP/P)
```

**Regression:**
```
log(Q) = α + β×log(P) + ...
E = β
```

## Contract Design

### Contract Types

**Fixed price:**
```
Price = Constant
```

**Cost-plus:**
```
Price = Cost × (1 + Markup)
```

**Revenue sharing:**
```
Supplier_revenue = α × Total_revenue
Retailer_revenue = (1 - α) × Total_revenue
```

**Quantity discounts:**
```
Price = f(Quantity)
Decreasing with quantity
```

### Incentive Alignment

**Objective:**
```
Align incentives
Maximize system profit
```

**Problem:**
```
Local optimization ≠ System optimization
Double marginalization
```

**Solution:**
```
Contracts that align incentives
Revenue sharing
Two-part tariffs
```

## Mathematical Tools

### Microeconomic Models

**Demand function:**
```
Q = f(P, Income, ...)
```

**Supply function:**
```
Q = g(P, Cost, ...)
```

**Equilibrium:**
```
Demand = Supply
Solve for P*, Q*
```

**Welfare:**
```
Consumer_surplus = ∫[Demand(P) - P*]dP
Producer_surplus = ∫[P* - Supply(P)]dP
Total_surplus = Consumer + Producer
```

### Elasticity Equations

**Own-price:**
```
E_own = (dQ/dP) × (P/Q)
```

**Cross-price:**
```
E_cross = (dQ_i/dP_j) × (P_j/Q_i)
```

**Income:**
```
E_income = (dQ/dIncome) × (Income/Q)
```

**Relationship:**
```
E_own + E_cross + E_income = 0 (for some models)
```

### Game-Theoretic Payoff Structures

**Players:**
```
Supplier, Retailer
```

**Strategies:**
```
Supplier: Price, Quantity
Retailer: Order_quantity, Price
```

**Payoffs:**
```
π_supplier = f(Price, Quantity, Cost)
π_retailer = g(Price, Quantity, Revenue)
```

**Nash equilibrium:**
```
Each player best responds to other
π_supplier(Strategy_s*, Strategy_r*) ≥ π_supplier(Strategy_s, Strategy_r*)
π_retailer(Strategy_s*, Strategy_r*) ≥ π_retailer(Strategy_s*, Strategy_r)
```

## Learning Outcomes

### Aligning Economic Incentives

**Problem:**
```
Local optimization
Double marginalization
Inefficient system
```

**Solution:**
```
Revenue sharing
Two-part tariffs
Buyback contracts
```

**Mathematical:**
```
Design contract parameters
Maximize system profit
Distribute surplus
```

### Quantifying Profitability

**By customer:**
```
Profit_customer = Revenue_customer - Cost_to_serve_customer
```

**By channel:**
```
Profit_channel = Revenue_channel - Cost_to_serve_channel
```

**By SKU:**
```
Profit_SKU = Revenue_SKU - Cost_to_serve_SKU
```

**Analysis:**
```
Rank by profitability
Focus on high-profit
Improve or eliminate low-profit
```

## Exercises

1. **Cost-to-Serve:** Calculate cost-to-serve and profitability
2. **Elasticity:** Estimate price elasticity
3. **Contract Design:** Design incentive-aligned contract
4. **Profitability:** Analyze profitability by segment

## Case Studies

- Cost-to-serve analysis
- Price optimization
- Contract design
- Profitability improvement
- Incentive alignment
