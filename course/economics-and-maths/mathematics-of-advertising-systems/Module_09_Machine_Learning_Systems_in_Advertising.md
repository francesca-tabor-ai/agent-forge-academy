---
title: "Machine Learning Systems in Advertising"
module: "Module 9"
week: 9
order: 9
description: "Use predictive models at scale"
---

# Module 9: Machine Learning Systems in Advertising

## Introduction

Machine learning powers modern advertising systems at scale. This module covers feature engineering, model calibration, ranking metrics, and evaluation beyond accuracy.

## Learning Objectives

- Engineer features for advertising
- Calibrate models for reliability
- Apply ranking and selection
- Build conversion prediction models
- Calculate Expected Calibration Error (ECE)
- Use NDCG and CTR@k
- Build models suitable for bidding and ranking
- Evaluate ML systems beyond accuracy

## Feature Engineering

### User Features

**Demographics:**
```
Age, Gender, Location, Income, ...
```

**Behavioral:**
```
Browsing_history, Purchase_history, Engagement, ...
```

**Contextual:**
```
Device, Browser, Time, Page_content, ...
```

### Ad Features

**Creative:**
```
Image_features, Text_features, Video_features, ...
```

**Campaign:**
```
Campaign_id, Ad_group, Targeting, ...
```

**Performance:**
```
Historical_CTR, Historical_CVR, ...
```

### Interaction Features

**User-Ad matching:**
```
User_interest × Ad_category
User_behavior × Ad_type
```

**Temporal:**
```
Time_since_last_ad
Frequency_in_period
```

## Calibration and Reliability

### Calibration

**Definition:**
```
Predicted_probability matches observed_frequency
P(Outcome | Predicted = p) = p
```

**Perfect calibration:**
```
For all p: P(Outcome | Predicted = p) = p
```

### Expected Calibration Error (ECE)

**Definition:**
```
ECE = Σ |Accuracy_bin_i - Confidence_bin_i| × |Bin_i| / N
```

**Binning:**
```
Divide predictions into bins
Calculate accuracy and confidence per bin
```

**Interpretation:**
- ECE = 0: Perfectly calibrated
- Lower ECE = Better calibration

### Calibration Methods

**Platt scaling:**
```
P_calibrated = 1 / (1 + exp(A × logit(P) + B))
Estimate A, B on validation set
```

**Isotonic regression:**
```
Non-parametric calibration
Monotonic transformation
```

## Ranking and Selection

### Ranking Problem

**Objective:**
```
Rank ads by predicted value
Show top k ads
```

**Value:**
```
Value = P(Click) × P(Conversion | Click) × Revenue
```

**Ranking:**
```
Sort by Value descending
Select top k
```

### Ranking Metrics

**NDCG (Normalized Discounted Cumulative Gain):**
```
DCG = Σ (Relevance_i / log₂(i+1))
NDCG = DCG / Ideal_DCG
```

**CTR@k:**
```
CTR@k = Clicks_in_top_k / Impressions_in_top_k
```

**Precision@k:**
```
Precision@k = Relevant_in_top_k / k
```

**Recall@k:**
```
Recall@k = Relevant_in_top_k / Total_relevant
```

## Key Models

### Conversion Prediction Models

**Logistic regression:**
```
P(Conversion) = 1 / (1 + exp(-(β₀ + β₁X₁ + ... + βₙXₙ)))
```

**Random forest:**
```
Ensemble of decision trees
Handles non-linearity
```

**Gradient boosting:**
```
Sequential tree building
High accuracy
```

**Neural networks:**
```
Deep learning
Complex patterns
```

### Expected Calibration Error (ECE)

**Calculation:**
```
1. Bin predictions [0, 0.1), [0.1, 0.2), ..., [0.9, 1.0]
2. Calculate accuracy per bin
3. Calculate average confidence per bin
4. ECE = Σ |Accuracy_i - Confidence_i| × |Bin_i| / N
```

**Improvement:**
```
Apply calibration method
Recalculate ECE
```

### NDCG, CTR@k

**NDCG:**
```
DCG = Σ (rel_i / log₂(rank_i + 1))
Ideal_DCG = DCG of perfect ranking
NDCG = DCG / Ideal_DCG
```

**CTR@k:**
```
CTR@k = (Clicks in positions 1 to k) / (Impressions in positions 1 to k)
```

**Optimization:**
```
Maximize: NDCG or CTR@k
Subject to: Model_constraints
```

## Building Models for Bidding and Ranking

### Bidding Models

**Requirements:**
- Fast inference (< 10ms)
- Calibrated probabilities
- Real-time features

**Model:**
```
P(Conversion) = f(User_features, Ad_features, Context)
Bid = P(Conversion) × Value × Target_ROAS
```

### Ranking Models

**Requirements:**
- Relevance prediction
- Diversity
- Business constraints

**Model:**
```
Score = f(User, Ad, Context)
Rank by Score
Apply diversity constraints
```

### Feature Engineering for Scale

**Real-time features:**
```
Must be computable in < 10ms
Pre-compute when possible
Cache frequently used
```

**Batch features:**
```
Historical averages
Aggregated statistics
Can be slower
```

## Evaluating ML Systems Beyond Accuracy

### Business Metrics

**Revenue:**
```
Total_revenue = Σ(Predicted_value × Actual_outcome)
```

**ROAS:**
```
ROAS = Revenue / Cost
```

**Profit:**
```
Profit = Revenue - Cost
```

### Fairness Metrics

**Demographic parity:**
```
P(Prediction | Group_A) = P(Prediction | Group_B)
```

**Equalized odds:**
```
P(Prediction | Outcome, Group_A) = P(Prediction | Outcome, Group_B)
```

### Robustness

**Adversarial robustness:**
```
Model stable to small input changes
```

**Distribution shift:**
```
Performance on new data
```

## Exercises

1. **Feature Engineering:** Engineer features for conversion prediction
2. **Calibration:** Calibrate model and calculate ECE
3. **Ranking:** Build ranking model and evaluate with NDCG
4. **Evaluation:** Evaluate model on business metrics

## Case Studies

- Conversion prediction at scale
- Model calibration in production
- Ranking system optimization
- ML system evaluation
- Feature engineering for advertising
