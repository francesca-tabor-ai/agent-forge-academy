---
title: "Module 6: From Prediction to Decision"
description: "Predictions don't create value — decisions do"
module: "6"
order: 6
---

# Module 6: From Prediction to Decision

**Duration:** Week 6  
**Theme:** *Predictions don't create value — decisions do*

**Learning Objectives:**
- **Score Thresholds**: Set score thresholds and decision policies
- **Apply Cost-Sensitive**: Apply apply cost-sensitive modeling in relevant contexts
- **ranking vs classification Understanding**: Understand ranking vs classification
- **uplift vs propensity modeling Understanding**: Learn uplift vs propensity modeling
- **human-in-the-loop decisioning Development**: Apply design human-in-the-loop decisioning in relevant contexts

---

## 6.1 Score Thresholds & Decision Policies

### The Threshold Problem

**Challenge:** Model outputs probabilities, but decisions are binary.

**Example: Churn Prediction**
```python
# Model output
churn_probability = model.predict_proba(customer)[1]  # 0.35

# Decision needed: Should we target this customer for retention?
# Need to convert probability to yes/no decision
```

### Setting Thresholds

#### Method 1: Business Rule-Based

**Approach:** Set threshold based on business constraints.

```python
def decide_retention_action(churn_probability, budget_constraint):
    # Budget constraint: Can only target 20% of customers
    # → Use top 20% by churn probability
    
    threshold = np.percentile(churn_probabilities, 80)  # Top 20%
    
    if churn_probability >= threshold:
        return 'target_for_retention'
    else:
        return 'no_action'
```

#### Method 2: Cost-Benefit Analysis

**Approach:** Optimize threshold based on costs and benefits.

```python
def optimize_threshold(y_true, y_pred_proba, costs):
    """
    costs = {
        'true_positive': -100,   # Benefit: Prevented churn
        'false_positive': -10,   # Cost: Unnecessary campaign
        'true_negative': 0,       # No action, no churn
        'false_negative': -500    # Cost: Lost customer
    }
    """
    thresholds = np.arange(0, 1, 0.01)
    best_threshold = 0
    best_value = -np.inf
    
    for threshold in thresholds:
        y_pred = (y_pred_proba >= threshold).astype(int)
        
        # Calculate value
        tp = ((y_true == 1) & (y_pred == 1)).sum()
        fp = ((y_true == 0) & (y_pred == 1)).sum()
        tn = ((y_true == 0) & (y_pred == 0)).sum()
        fn = ((y_true == 1) & (y_pred == 0)).sum()
        
        value = (tp * costs['true_positive'] + 
                 fp * costs['false_positive'] + 
                 tn * costs['true_negative'] + 
                 fn * costs['false_negative'])
        
        if value > best_value:
            best_value = value
            best_threshold = threshold
    
    return best_threshold
```

#### Method 3: Precision-Recall Trade-off

**Approach:** Choose threshold based on precision/recall requirements.

```python
from sklearn.metrics import precision_recall_curve

def find_threshold_for_precision(y_true, y_pred_proba, target_precision=0.8):
    precision, recall, thresholds = precision_recall_curve(y_true, y_pred_proba)
    
    # Find threshold that achieves target precision
    valid_indices = precision >= target_precision
    if valid_indices.any():
        # Choose threshold with highest recall among those meeting precision
        best_idx = np.where(valid_indices)[0][np.argmax(recall[valid_indices])]
        return thresholds[best_idx]
    else:
        return None  # Cannot achieve target precision
```

### Decision Policies

**Definition:** Rules that map predictions to actions.

#### Simple Policy: Single Threshold

```python
def simple_retention_policy(churn_probability, threshold=0.3):
    if churn_probability >= threshold:
        return {
            'action': 'target_for_retention',
            'campaign_type': 'standard',
            'priority': 'high'
        }
    else:
        return {
            'action': 'no_action',
            'priority': 'low'
        }
```

#### Tiered Policy: Multiple Thresholds

```python
def tiered_retention_policy(churn_probability):
    if churn_probability >= 0.7:
        return {
            'action': 'target_for_retention',
            'campaign_type': 'aggressive',
            'discount': 0.20,
            'priority': 'critical'
        }
    elif churn_probability >= 0.4:
        return {
            'action': 'target_for_retention',
            'campaign_type': 'standard',
            'discount': 0.10,
            'priority': 'high'
        }
    elif churn_probability >= 0.2:
        return {
            'action': 'target_for_retention',
            'campaign_type': 'light',
            'discount': 0.05,
            'priority': 'medium'
        }
    else:
        return {
            'action': 'no_action',
            'priority': 'low'
        }
```

#### Context-Aware Policy

```python
def context_aware_policy(churn_probability, customer_value, budget_remaining):
    # Adjust threshold based on customer value
    if customer_value > 10000:
        threshold = 0.2  # Lower threshold for high-value customers
    elif customer_value > 1000:
        threshold = 0.3
    else:
        threshold = 0.5  # Higher threshold for low-value customers
    
    # Adjust based on budget
    if budget_remaining < 0.1:  # Less than 10% budget left
        threshold += 0.1  # Be more selective
    
    if churn_probability >= threshold:
        return 'target_for_retention'
    else:
        return 'no_action'
```

---

## 6.2 Cost-Sensitive Modeling

### The Cost Matrix

**Definition:** Define costs/benefits for each prediction outcome.

```python
cost_matrix = {
    # Churn prediction example
    'true_positive': -100,   # Benefit: Prevented churn (saved $100)
    'false_positive': -10,   # Cost: Unnecessary campaign ($10)
    'true_negative': 0,       # No action, no churn (no cost/benefit)
    'false_negative': -500   # Cost: Lost customer ($500)
}
```

### Cost-Sensitive Learning

#### Method 1: Class Weights

```python
from sklearn.linear_model import LogisticRegression

# Weight classes by cost
class_weights = {
    0: 1.0,  # Negative class (no churn)
    1: 5.0   # Positive class (churn) - 5x more important
}

model = LogisticRegression(class_weight=class_weights)
model.fit(X_train, y_train)
```

#### Method 2: Sample Weights

```python
def calculate_sample_weights(y_true, cost_matrix):
    weights = np.ones(len(y_true))
    
    # Weight positive examples more (if false negative is costly)
    weights[y_true == 1] = abs(cost_matrix['false_negative']) / abs(cost_matrix['false_positive'])
    
    return weights

sample_weights = calculate_sample_weights(y_train, cost_matrix)
model.fit(X_train, y_train, sample_weight=sample_weights)
```

#### Method 3: Custom Loss Function

```python
import xgboost as xgb

def custom_cost_loss(y_true, y_pred):
    """
    Custom loss that incorporates cost matrix
    """
    # Convert predictions to binary
    y_pred_binary = (y_pred > 0.5).astype(int)
    
    # Calculate costs
    tp = ((y_true == 1) & (y_pred_binary == 1)).sum()
    fp = ((y_true == 0) & (y_pred_binary == 1)).sum()
    fn = ((y_true == 1) & (y_pred_binary == 0)).sum()
    
    total_cost = (tp * cost_matrix['true_positive'] + 
                  fp * cost_matrix['false_positive'] + 
                  fn * cost_matrix['false_negative'])
    
    # Return negative (since we want to minimize cost = maximize negative cost)
    return -total_cost

# Use with XGBoost (requires custom objective)
model = xgb.XGBClassifier(objective=custom_cost_loss)
```

### Expected Value Framework

**Concept:** Calculate expected value of each action.

```python
def expected_value_of_action(churn_probability, action_costs):
    """
    action_costs = {
        'campaign_cost': 10,
        'customer_value_if_retained': 500
    }
    """
    # Expected value of targeting
    # = (Probability of churn * Value if prevented) - Campaign cost
    expected_value = (churn_probability * action_costs['customer_value_if_retained'] - 
                      action_costs['campaign_cost'])
    
    # Expected value of not targeting
    # = 0 (no action, no cost, but lose customer if they churn)
    expected_value_no_action = 0
    
    return {
        'target': expected_value,
        'no_action': expected_value_no_action,
        'best_action': 'target' if expected_value > 0 else 'no_action'
    }
```

---

## 6.3 Ranking vs Classification

### Classification: Binary Decisions

**Use When:**
- Need yes/no decision
- Actions are discrete
- Threshold is clear

**Example:**
```python
# Classification: Should we target this customer?
if churn_probability >= 0.3:
    target_customer()
else:
    do_nothing()
```

### Ranking: Prioritization

**Use When:**
- Need to prioritize
- Limited resources (can't target everyone)
- Relative order matters more than absolute scores

**Example:**
```python
# Ranking: Which customers should we target first?
customer_scores = model.predict_proba(customers)[:, 1]
ranked_customers = np.argsort(customer_scores)[::-1]  # Highest first

# Target top 100
top_100 = ranked_customers[:100]
for customer_id in top_100:
    target_customer(customer_id)
```

### Learning to Rank

**Concept:** Optimize model for ranking quality, not classification accuracy.

#### Metrics for Ranking

**NDCG: Normalized Discounted Cumulative Gain**

```python
def ndcg_at_k(y_true_ranked, y_pred_scores, k=10):
    """
    y_true_ranked: True relevance scores (higher = more relevant)
    y_pred_scores: Predicted scores
    k: Top k items to evaluate
    """
    # Sort by predicted scores
    top_k_indices = np.argsort(y_pred_scores)[::-1][:k]
    
    # Calculate DCG
    dcg = 0
    for i, idx in enumerate(top_k_indices):
        relevance = y_true_ranked[idx]
        dcg += relevance / np.log2(i + 2)  # i+2 because log2(1) = 0
    
    # Calculate IDCG (ideal DCG)
    ideal_sorted = np.sort(y_true_ranked)[::-1][:k]
    idcg = sum(rel / np.log2(i + 2) for i, rel in enumerate(ideal_sorted))
    
    return dcg / idcg if idcg > 0 else 0
```

**MAP: Mean Average Precision**

```python
def average_precision_at_k(y_true, y_pred_scores, k=10):
    # Sort by predicted scores
    top_k_indices = np.argsort(y_pred_scores)[::-1][:k]
    
    # Calculate precision at each position
    precisions = []
    num_relevant = 0
    
    for i, idx in enumerate(top_k_indices):
        if y_true[idx] == 1:  # Relevant
            num_relevant += 1
            precision = num_relevant / (i + 1)
            precisions.append(precision)
    
    return np.mean(precisions) if precisions else 0
```

### When to Use Each

| Scenario | Approach | Why |
|----------|----------|-----|
| "Should we target this customer?" | **Classification** | Binary decision |
| "Which 100 customers to target?" | **Ranking** | Need to prioritize |
| "What discount to offer?" | **Regression** | Continuous value |
| "Which products to recommend?" | **Ranking** | Order matters |

---

## 6.4 Uplift vs Propensity Modeling

### Propensity Modeling: Will They Convert?

**Definition:** Predict probability of positive outcome (e.g., conversion, churn).

**Example:**
```python
# Propensity model: Will customer churn?
churn_probability = propensity_model.predict_proba(customer)[1]

# Decision: Target if probability > threshold
if churn_probability > 0.3:
    target_for_retention()
```

**Limitation:** Doesn't account for treatment effect.

### Uplift Modeling: Will Treatment Help?

**Definition:** Predict how much treatment will change outcome.

**Concept:** 
- **Control group:** No treatment
- **Treatment group:** Receive treatment
- **Uplift:** Difference in outcome between groups

```python
# Uplift model: How much will retention campaign help?
uplift = uplift_model.predict(customer)

# Uplift = P(churn | treatment) - P(churn | control)
# Negative uplift = treatment reduces churn (good!)
# Positive uplift = treatment increases churn (bad!)

if uplift < -0.1:  # Treatment reduces churn by 10%+
    target_for_retention()
elif uplift > 0.1:  # Treatment increases churn (backfire!)
    do_not_target()
else:
    no_action()  # Treatment has little effect
```

### Uplift Modeling Methods

#### Method 1: Two-Model Approach

```python
# Train two models
control_model = train_model(control_group_data)  # No treatment
treatment_model = train_model(treatment_group_data)  # With treatment

# Predict uplift
def predict_uplift(customer):
    prob_control = control_model.predict_proba(customer)[1]
    prob_treatment = treatment_model.predict_proba(customer)[1]
    uplift = prob_control - prob_treatment  # Negative = good (reduces churn)
    return uplift
```

#### Method 2: Treatment Interaction

```python
# Include treatment as a feature
features_with_treatment = np.column_stack([
    customer_features,
    np.ones(len(customer_features))  # Treatment = 1
])

features_without_treatment = np.column_stack([
    customer_features,
    np.zeros(len(customer_features))  # Treatment = 0
])

# Predict with and without treatment
prob_with = model.predict_proba(features_with_treatment)[:, 1]
prob_without = model.predict_proba(features_without_treatment)[:, 1]

uplift = prob_without - prob_with
```

### When to Use Each

**Propensity Modeling:**
- Simple binary decision
- Treatment effect is consistent
- Don't have treatment/control data

**Uplift Modeling:**
- Treatment effect varies by customer
- Want to avoid backfire (treatment makes things worse)
- Have treatment/control data
- Resources are limited (target only those who benefit)

---

## 6.5 Human-in-the-Loop Decisioning

### When Humans Should Be Involved

**High-Stakes Decisions:**
- Medical diagnosis
- Credit approval
- Hiring decisions
- Legal judgments

**Uncertain Predictions:**
- Low confidence scores
- Edge cases
- Novel situations

**Regulatory Requirements:**
- Explainability required
- Human oversight mandated
- Audit trails needed

### Decision Support Systems

**Concept:** Model provides recommendation, human makes final decision.

```python
def decision_support_system(customer, model, confidence_threshold=0.8):
    # Get prediction
    churn_probability = model.predict_proba(customer)[1]
    confidence = max(churn_probability, 1 - churn_probability)
    
    # Get explanation
    explanation = explain_prediction(model, customer)
    
    if confidence >= confidence_threshold:
        # High confidence: Automated decision
        if churn_probability >= 0.3:
            return {
                'decision': 'target_for_retention',
                'mode': 'automated',
                'confidence': confidence,
                'explanation': explanation
            }
        else:
            return {
                'decision': 'no_action',
                'mode': 'automated',
                'confidence': confidence
            }
    else:
        # Low confidence: Human review
        return {
            'decision': 'human_review_required',
            'mode': 'human_in_loop',
            'confidence': confidence,
            'recommendation': 'target' if churn_probability >= 0.3 else 'no_action',
            'explanation': explanation
        }
```

### Active Learning

**Concept:** Model identifies examples where human input would be most valuable.

```python
def identify_examples_for_labeling(model, unlabeled_data, n=100):
    # Get predictions and uncertainties
    predictions = model.predict_proba(unlabeled_data)
    uncertainties = np.max(predictions, axis=1)  # Lower = more uncertain
    
    # Select most uncertain examples
    uncertain_indices = np.argsort(uncertainties)[:n]
    
    return unlabeled_data.iloc[uncertain_indices]
```

### Feedback Loops

**Concept:** Use human decisions to improve model.

```python
def collect_human_feedback(prediction_id, human_decision, actual_outcome):
    feedback = {
        'prediction_id': prediction_id,
        'model_prediction': prediction,
        'human_decision': human_decision,
        'actual_outcome': actual_outcome,
        'human_was_correct': human_decision == actual_outcome,
        'model_was_correct': model_prediction == actual_outcome
    }
    
    # Store for model improvement
    store_feedback(feedback)
    
    # Retrain if enough feedback collected
    if len(get_all_feedback()) > 1000:
        retrain_model_with_feedback()
```

---

## Lab 6: Translate Churn Scores into Retention Actions

### Objective
Build a decision framework that translates model predictions into actionable retention strategies.

### Tasks

1. **Threshold Optimization**
   - Calculate cost matrix
   - Optimize threshold using cost-benefit analysis
   - Compare different threshold strategies

2. **Decision Policy Design**
   - Create tiered retention policy
   - Implement context-aware decisions
   - Design action mapping (score → action)

3. **Ranking System**
   - Implement customer ranking
   - Handle budget constraints
   - Optimize for business value

4. **Decision Framework**
   - Combine predictions with business rules
   - Implement human-in-the-loop for edge cases
   - Create monitoring for decision outcomes

### Deliverables

1. **Decision Framework Code** including:
   - Threshold optimization
   - Decision policies
   - Ranking system
   - Human-in-the-loop logic

2. **Decision Framework Documentation** including:
   - Policy definitions
   - Cost-benefit analysis
   - Action mappings
   - Monitoring plan

3. **Business Impact Analysis** including:
   - Expected ROI
   - Budget allocation
   - Expected outcomes
   - Risk assessment

### Evaluation Criteria

- Decision framework quality (35%)
- Cost-benefit analysis (25%)
- Business alignment (25%)
- Implementation completeness (15%)

---

## Summary

**Key Takeaways:**

- **Thresholds Matter:**: Choose based on business constraints and costs
- **Decision Policies:**: Map predictions to actions systematically
- **Cost-Sensitive:**: Incorporate costs into model training and decisions
- **Ranking vs Classification:**: Choose based on use case
- **Uplift Modeling:**: Account for treatment effects when possible
- **Human-in-the-Loop:**: Combine automation with human judgment

**Next Steps:**
- **Module 7:**: Module 7: Productionize models
- **monitoring and feedback loops Understanding**: Learn monitoring and feedback loops
- **Keep Models**: Keep models alive and performing

---

## Additional Resources

### Reading
- "Causal Inference: The Mixtape" by Scott Cunningham (Uplift modeling)
- "Designing Machine Learning Systems" by Chip Huyen (Chapter 6: Model Serving)
- "Applied Predictive Modeling" by Max Kuhn and Kjell Johnson (Cost-sensitive learning)

### Tools
- scikit-learn: Cost-sensitive learning
- CausalML: Uplift modeling
- SHAP: Model explanation for human-in-the-loop

---

**Ready for Module 7? [Continue →](Module_07_Productionization_and_Feedback_Loops.md)**
