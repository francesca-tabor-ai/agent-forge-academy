---
title: "Revenue Management & Optimization"
module: "Module 3"
week: 3
order: 3
description: "Maximizing revenue under uncertainty"
---

# Module 3: Revenue Management & Optimization

## Introduction

Revenue management balances capacity constraints, perishability, and demand uncertainty. This module covers overbooking, inventory control, and revenue vs. profit optimization.

## Learning Objectives

- Understand capacity constraints and perishability
- Model overbooking and no-show risk
- Evaluate sell-up vs. sell-out trade-offs
- Distinguish revenue vs. profit optimization
- Apply newsvendor models
- Use constrained optimization
- Calculate expected value under uncertainty
- Design overbooking policies
- Optimize inventory control across room types
- Optimize length-of-stay

## Capacity Constraints and Perishability

### Capacity Constraint

**Fixed capacity:**
```
Rooms, Seats, Service_slots
Cannot be stored
```

**Mathematical:**
```
Demand ≤ Capacity
```

**Perishability:**
```
Unused capacity lost forever
Cannot be sold later
```

**Revenue impact:**
```
Lost_revenue = Unused_capacity × Price
```

### Perishability Model

**Time window:**
```
Capacity available for limited time
Check-in_date, Meal_time, Service_slot
```

**Value:**
```
Value = f(Time_to_perish)
Decreases as time approaches
```

## Overbooking and No-Show Risk

### No-Show Model

**Probability:**
```
P(No_show) = No_show_rate
```

**Distribution:**
```
No_shows ~ Binomial(Bookings, No_show_rate)
```

**Expected:**
```
E[No_shows] = Bookings × No_show_rate
```

### Overbooking

**Problem:**
```
Balance: Overbooking_benefit vs Overbooking_cost
```

**Costs:**
```
C_o = Cost of overbooking (walk, compensation)
C_u = Cost of underbooking (empty room)
```

**Optimal:**
```
Overbook* = argmax E[Revenue] - E[Cost]
```

**Newsvendor:**
```
Overbook* = F^(-1)(C_u / (C_o + C_u))
where F = no-show CDF
```

## Sell-Up vs. Sell-Out Trade-offs

### Sell-Out Strategy

**Objective:**
```
Maximize occupancy
Fill all rooms
```

**Trade-off:**
```
Higher occupancy
Lower ADR
```

**Mathematical:**
```
RevPAR = Occupancy × ADR
If Occupancy ↑ and ADR ↓, RevPAR may ↓
```

### Sell-Up Strategy

**Objective:**
```
Maximize ADR
Higher prices
```

**Trade-off:**
```
Higher ADR
Lower occupancy
```

**Mathematical:**
```
If ADR ↑ and Occupancy ↓, RevPAR may ↑ or ↓
```

### Optimization

**Objective:**
```
Maximize: RevPAR = Occupancy × ADR
```

**Constraint:**
```
Demand = f(Price)
Occupancy = min(Demand, Capacity) / Capacity
```

**Optimal:**
```
Balance: Occupancy and ADR
Maximize: RevPAR
```

## Revenue vs. Profit Optimization

### Revenue Optimization

**Objective:**
```
Maximize: Revenue = Price × Quantity
```

**Optimal:**
```
Price* where E = -1
```

**Limitation:**
```
Ignores costs
May not maximize profit
```

### Profit Optimization

**Objective:**
```
Maximize: Profit = Revenue - Cost
```

**Mathematical:**
```
Profit = (Price - Cost) × Quantity
dProfit/dPrice = 0
```

**Optimal:**
```
Price* = Cost / (1 + 1/E)
```

**Comparison:**
```
Profit_optimal_price > Revenue_optimal_price (typically)
```

## Core Mathematics

### Newsvendor Models

**Problem:**
```
Single period
Uncertain demand
Order quantity decision
```

**Optimal:**
```
Q* = F^(-1)(C_u / (C_o + C_u))
```

**Overbooking:**
```
Overbook* = F^(-1)(C_u / (C_o + C_u))
where F = no-show CDF
```

### Constrained Optimization

**Problem:**
```
Maximize: Revenue
Subject to: Capacity_constraints
```

**Lagrangian:**
```
L = Revenue - λ × (Demand - Capacity)
```

**KKT conditions:**
```
dL/dPrice = 0
Demand ≤ Capacity
λ ≥ 0
λ × (Demand - Capacity) = 0
```

### Expected Value Under Uncertainty

**Expected revenue:**
```
E[Revenue] = Σ P(Scenario_i) × Revenue(Scenario_i)
```

**Uncertainty:**
```
Demand ~ Distribution
Price ~ Distribution
```

**Optimization:**
```
Maximize: E[Revenue]
Subject to: Constraints
```

## Industry Applications

### Overbooking Policies

**Calculation:**
```
Overbook* = F^(-1)(C_u / (C_o + C_u))
```

**Factors:**
```
No_show_rate
Walk_cost
Empty_room_cost
```

**Implementation:**
```
Set overbooking_level
Monitor performance
Adjust based on data
```

### Inventory Control Across Room Types

**Multiple room types:**
```
Standard, Deluxe, Suite
Different prices
Different demand
```

**Optimization:**
```
Maximize: Total_revenue
Subject to: Capacity_constraints
```

**Nested inventory:**
```
Protect inventory for high_value_segments
Release to lower_value_segments
```

### Length-of-Stay Optimization

**Problem:**
```
Accept short_stay or wait for long_stay?
```

**Trade-off:**
```
Short_stay: Immediate revenue
Long_stay: Higher total revenue, fewer transactions
```

**Optimization:**
```
Maximize: Total_revenue
Subject to: Length_of_stay_constraints
```

## Exercises

1. **Overbooking:** Calculate optimal overbooking level
2. **Revenue Optimization:** Optimize revenue under constraints
3. **Inventory Control:** Optimize inventory across room types
4. **Length-of-Stay:** Optimize length-of-stay decisions

## Case Studies

- Hotel overbooking optimization
- Multi-room type revenue management
- Length-of-stay optimization
- Revenue vs. profit optimization
- Inventory protection strategies
