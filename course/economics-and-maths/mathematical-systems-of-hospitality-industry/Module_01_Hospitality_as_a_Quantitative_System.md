---
title: "Hospitality as a Quantitative System"
module: "Module 1"
week: 1
order: 1
description: "Framing the industry mathematically"
---

# Module 1: Hospitality as a Quantitative System

## Introduction

Hospitality operations can be modeled as mathematical systems with capacity constraints, flows, and state variables. This module establishes the quantitative foundation for understanding hospitality operations.

## Learning Objectives

- Model hospitality as a capacity-constrained service system
- Distinguish stocks vs. flows
- Understand deterministic vs. stochastic demand
- Apply units, normalization, and per-available metrics
- Use ratios and normalization
- Apply dimensional analysis
- Define system boundaries
- Calculate occupancy, ADR, RevPAR
- Model seat-hours, room-nights, service capacity

## Hospitality as a Capacity-Constrained Service System

### Capacity Definition

**Fixed capacity:**
```
Rooms, Seats, Service_slots
Cannot be changed in short term
```

**Mathematical:**
```
Capacity = Fixed_quantity
```

**Utilization:**
```
Utilization = Demand / Capacity
```

**Constraint:**
```
Demand ≤ Capacity (cannot exceed)
```

### Service System

**Inputs:**
```
Guests, Bookings, Requests
```

**Process:**
```
Service_delivery
Capacity_utilization
```

**Outputs:**
```
Satisfied_guests, Revenue, Experience
```

## Stocks vs. Flows

### Stocks (State Variables)

**Definition:**
```
Accumulated quantities at a point in time
```

**Examples:**
- Number of occupied rooms
- Inventory of supplies
- Guest satisfaction score
- Brand equity

**Mathematical:**
```
Stock(t) = Stock(0) + ∫[Flow_in(τ) - Flow_out(τ)]dτ
```

### Flows (Rate Variables)

**Definition:**
```
Rates of change over time
```

**Inflows:**
```
Guest_arrivals
Bookings
Revenue
```

**Outflows:**
```
Guest_departures
Checkouts
Costs
```

**Flow balance:**
```
dStock/dt = Flow_in - Flow_out
```

## Deterministic vs. Stochastic Demand

### Deterministic Demand

**Definition:**
```
Known with certainty
No randomness
```

**Model:**
```
Demand(t) = f(t)
```

**Advantages:**
- Simple
- Exact planning
- Easy optimization

**Limitations:**
- Unrealistic
- Ignores uncertainty

### Stochastic Demand

**Definition:**
```
Uncertain, probabilistic
Random variation
```

**Model:**
```
Demand(t) ~ Distribution(Parameters)
```

**Advantages:**
- Realistic
- Accounts for uncertainty
- Risk-aware

**Challenges:**
- More complex
- Requires probability distributions

## Units, Normalization, and Per-Available Metrics

### Normalization

**Per-available metrics:**
```
RevPAR = Revenue / Available_rooms
ADR = Revenue / Occupied_rooms
Occupancy = Occupied_rooms / Available_rooms
```

**Purpose:**
```
Compare across properties
Normalize for size
```

### Dimensional Analysis

**Units:**
```
Revenue: $/time
Rooms: Count
Occupancy: Dimensionless (ratio)
```

**Consistency:**
```
All terms in equation must have same dimensions
```

## Core Mathematics

### Ratios and Normalization

**Occupancy:**
```
Occupancy = Occupied / Available
```

**ADR (Average Daily Rate):**
```
ADR = Revenue / Occupied_rooms
```

**RevPAR (Revenue per Available Room):**
```
RevPAR = Revenue / Available_rooms
RevPAR = Occupancy × ADR
```

**GOPPAR (Gross Operating Profit per Available Room):**
```
GOPPAR = Gross_Operating_Profit / Available_rooms
```

### Dimensional Analysis

**Check consistency:**
```
Left_side_dimensions = Right_side_dimensions
```

**Example:**
```
RevPAR = Occupancy × ADR
[$/room] = [dimensionless] × [$/room]
✓ Consistent
```

### System Boundaries

**Definition:**
```
What is included in the system
What is excluded
```

**Hotel system:**
```
Included: Rooms, Guests, Staff, Operations
Excluded: External_market, Competition
```

**Restaurant system:**
```
Included: Seats, Guests, Kitchen, Service
Excluded: Suppliers, Delivery
```

## Industry Applications

### Occupancy, ADR, RevPAR

**Occupancy:**
```
Occupancy = Occupied_rooms / Available_rooms
Target: 70-80% typical
```

**ADR:**
```
ADR = Total_revenue / Occupied_rooms
Measures price_realization
```

**RevPAR:**
```
RevPAR = Total_revenue / Available_rooms
RevPAR = Occupancy × ADR
Key_performance_metric
```

### Seat-Hours, Room-Nights, Service Capacity

**Seat-hours:**
```
Seat_hours = Seats × Hours_open
Total_capacity
```

**Room-nights:**
```
Room_nights = Rooms × Nights
Total_capacity
```

**Service capacity:**
```
Service_capacity = Staff × Service_rate × Time
Throughput_capacity
```

## Exercises

1. **System Modeling:** Model hospitality operation as system
2. **Metrics:** Calculate occupancy, ADR, RevPAR
3. **Flows:** Model guest flows through system
4. **Capacity:** Calculate and optimize capacity utilization

## Case Studies

- Hotel revenue system modeling
- Restaurant capacity planning
- Service system optimization
- Performance metric analysis
- Capacity utilization optimization
