---
title: "Auctions & Market Design"
module: "Module 6"
week: 6
order: 6
description: "Understand how ads are priced and allocated in real time"
---

# Module 6: Auctions & Market Design

## Introduction

Programmatic advertising uses real-time auctions to price and allocate impressions. This module covers auction theory, bidding strategies, and market design principles.

## Learning Objectives

- Understand auction theory fundamentals
- Distinguish private vs social value
- Apply incentive compatibility
- Model second-price auctions
- Calculate expected value of a bid
- Value impressions
- Translate predicted value into bidding strategies
- Understand DSP and exchange dynamics

## Auction Theory Fundamentals

### Auction Types

**First-price:**
```
Winner pays their bid
```

**Second-price (Vickrey):**
```
Winner pays second-highest bid
```

**Generalized second-price (GSP):**
```
Position i pays bid of position i+1
```

### Auction Components

**Bidders:**
```
Advertisers competing for impression
```

**Bids:**
```
b_i = Bid from advertiser i
```

**Valuation:**
```
v_i = True value to advertiser i
```

**Allocation:**
```
Winner = argmax_i b_i
```

## Private vs Social Value

### Private Value

**Definition:**
```
Each bidder knows their own value
Values independent across bidders
```

**Model:**
```
v_i ~ Distribution_i
v_i independent
```

**Example:**
```
Advertiser knows conversion value
Doesn't know others' values
```

### Common Value

**Definition:**
```
True value same for all
Bidders have different estimates
```

**Model:**
```
True_value = V
Estimate_i = V + ε_i
```

**Example:**
```
Impression value depends on user
All advertisers estimate same value
Estimates differ
```

### Affiliated Values

**Definition:**
```
Values correlated
Learning others' bids provides information
```

**Model:**
```
Cov(v_i, v_j) > 0
```

## Incentive Compatibility

### Truthful Bidding

**Second-price auction:**
```
Dominant strategy: Bid true value
b_i = v_i
```

**Why:**
```
If b_i < v_i: May lose when should win
If b_i > v_i: May win but overpay
```

### Revenue Equivalence

**Theorem:**
```
Under certain conditions:
Expected revenue same across auction formats
```

**Conditions:**
- Private values
- Risk-neutral bidders
- Symmetric bidders

## Key Models

### Second-Price Auctions

**Mechanism:**
```
Winner = Highest bidder
Payment = Second-highest bid
```

**Optimal bid:**
```
b_i* = v_i (truthful)
```

**Expected payment:**
```
E[Payment] = E[Second_highest_bid | Win]
```

### Expected Value of a Bid

**Definition:**
```
E[Value] = P(Win) × (v_i - E[Payment | Win])
```

**For second-price:**
```
E[Value] = P(Win) × (v_i - E[Second_bid | Win])
```

**Optimization:**
```
Maximize: E[Value]
Subject to: Budget_constraints
```

### Impression Valuation

**Components:**
```
Value = P(Click) × P(Conversion | Click) × Value_per_conversion
Value = CTR × CVR × Value
```

**Expected value:**
```
E[Value] = E[CTR] × E[CVR] × Value
```

**Bid:**
```
Bid = E[Value] × Target_ROAS
```

## Bidding Strategies

### Value-Based Bidding

**Strategy:**
```
Bid = Expected_value × Target_ROAS
```

**Components:**
```
Bid = CTR × CVR × Value × Target_ROAS
```

**Optimization:**
```
Maximize: E[Value] - E[Cost]
Subject to: ROAS ≥ Target
```

### Bid Shading

**Problem:**
```
Second-price: Pay second bid
May overpay if gap large
```

**Solution:**
```
Bid_shaded = Bid × Shading_factor
Shading_factor < 1
```

**Optimization:**
```
Optimal_shading = f(Bid_distribution, Win_rate)
```

### Budget Pacing

**Constraint:**
```
Daily_budget: Σ Bids_today ≤ Budget
```

**Pacing:**
```
Bid_adjusted = Bid × Pacing_factor
Pacing_factor = Remaining_budget / Remaining_impressions / Expected_bid
```

## DSP and Exchange Dynamics

### Demand-Side Platform (DSP)

**Function:**
```
Receive bid requests
Calculate impression value
Submit bids
```

**Optimization:**
```
Maximize: Total_value
Subject to: Budget, ROAS_constraints
```

### Ad Exchange

**Function:**
```
Receive bids from multiple DSPs
Run auction
Allocate impression
```

**Revenue:**
```
Exchange_revenue = Winning_payment
```

### Real-Time Bidding (RTB)

**Process:**
```
1. User visits page
2. Exchange sends bid request
3. DSPs calculate bids (< 100ms)
4. Exchange runs auction
5. Winner serves ad
```

**Mathematical:**
```
Bid_time < 100ms
Bid = f(User_features, Context, Historical_data)
```

## Exercises

1. **Auction Analysis:** Analyze second-price auction
2. **Bidding Strategy:** Design optimal bidding strategy
3. **Valuation:** Calculate impression value
4. **Market Design:** Design auction mechanism

## Case Studies

- Programmatic auction optimization
- Bidding strategy development
- Impression valuation
- DSP optimization
- Exchange dynamics
