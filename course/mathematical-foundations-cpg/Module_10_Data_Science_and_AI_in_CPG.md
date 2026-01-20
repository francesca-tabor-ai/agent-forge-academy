---
title: "Data Science & AI in CPG"
module: "Module 10"
week: 10
order: 10
description: "Apply modern analytics at scale"
---

# Module 10: Data Science & AI in CPG

## Introduction

Modern CPG operations generate vast amounts of data. This module applies machine learning, computer vision, and AI techniques to extract value from CPG data, enabling demand sensing, shelf analytics, and predictive modeling.

## Learning Objectives

- Apply classification and regression to CPG data
- Implement demand sensing systems
- Use computer vision for shelf analytics
- Evaluate models using appropriate metrics
- Understand where AI creates value in CPG

## Classification and Regression in CPG Data

### Logistic Regression

**Model:**
```
P(Y=1|X) = 1 / (1 + exp(-(β₀ + β₁X₁ + ... + βₙXₙ)))
```

**CPG applications:**
- Customer churn prediction
- Product success/failure
- Quality defect classification

**Estimation:**
```
Log-likelihood = Σ[y_i×log(p_i) + (1-y_i)×log(1-p_i)]
Maximize: Log-likelihood
```

### Tree-Based Models

**Decision trees:**
```
Split on feature that maximizes information gain
Information_gain = Entropy(parent) - Σ(w_i × Entropy(child_i))
```

**Random forest:**
```
Prediction = Average(prediction from multiple trees)
Each tree trained on bootstrap sample
```

**Gradient boosting:**
```
F_m(x) = F_{m-1}(x) + α_m × h_m(x)
where h_m = weak learner fitted to residuals
```

**CPG applications:**
- Demand forecasting
- Price optimization
- Customer segmentation

## Demand Sensing

### Real-Time Demand Signals

**Data sources:**
- Point-of-sale (POS) data
- E-commerce transactions
- Social media signals
- Weather data
- Economic indicators

**Demand model:**
```
Demand(t) = f(POS(t), Promotions(t), Weather(t), ...)
```

### Time Series ML

**LSTM (Long Short-Term Memory):**
```
h_t = LSTM(x_t, h_{t-1})
Forecast = f(h_T)
```

**Transformer models:**
```
Attention(Q, K, V) = softmax(QKᵀ/√d_k)V
```

**CPG benefits:**
- Captures long-term dependencies
- Handles multiple input signals
- Adapts to changing patterns

## Computer Vision for Shelves

### Shelf Detection

**Object detection:**
```
YOLO, R-CNN, SSD models
Detect: Products, Prices, Facings, Stock levels
```

**Shelf analytics:**
```
Share_of_shelf = (Brand_facings / Total_facings) × 100
Out_of_stock = Detect(empty_shelf_space)
Price_compliance = Compare(detected_price, expected_price)
```

### Image Classification

**Product recognition:**
```
P(Product_i|Image) = CNN(Image)
```

**Applications:**
- Competitive intelligence
- Planogram compliance
- Stock level monitoring

## Model Evaluation Metrics

### Classification Metrics

**Confusion matrix:**
```
                Predicted
              Positive  Negative
Actual Positive  TP      FN
       Negative  FP      TN
```

**Precision:**
```
Precision = TP / (TP + FP)
```

**Recall:**
```
Recall = TP / (TP + FN)
```

**F1 Score:**
```
F1 = 2 × (Precision × Recall) / (Precision + Recall)
```

**ROC-AUC:**
```
AUC = Area under ROC curve
ROC plots: True Positive Rate vs False Positive Rate
```

### Regression Metrics

**Mean Absolute Error (MAE):**
```
MAE = (1/n) × Σ |y_i - ŷ_i|
```

**Root Mean Squared Error (RMSE):**
```
RMSE = √[(1/n) × Σ(y_i - ŷ_i)²]
```

**R-squared:**
```
R² = 1 - (SS_res / SS_tot)
```

**Mean Absolute Percentage Error (MAPE):**
```
MAPE = (100/n) × Σ |(y_i - ŷ_i) / y_i|
```

## Key Models

### Logistic Regression

**Sigmoid function:**
```
σ(z) = 1 / (1 + exp(-z))
```

**Decision boundary:**
```
β₀ + β₁X₁ + ... + βₙXₙ = 0
```

### Tree-Based Models

**Information gain:**
```
IG = H(S) - Σ(|S_v|/|S|) × H(S_v)
where H = entropy
```

**Gini impurity:**
```
Gini = 1 - Σ p_i²
```

### Neural Networks

**Feedforward:**
```
a^(l) = σ(W^(l) × a^(l-1) + b^(l))
```

**Backpropagation:**
```
δ^(l) = (W^(l+1))ᵀ × δ^(l+1) ⊙ σ'(z^(l))
```

## Exercises

1. **Classification:** Build churn prediction model
2. **Regression:** Forecast demand using ML
3. **Computer Vision:** Detect products on shelf
4. **Model Evaluation:** Compare models using metrics

## Case Studies

- Demand sensing implementation
- Shelf analytics automation
- Predictive maintenance
- Customer lifetime value prediction
- Price elasticity using ML
