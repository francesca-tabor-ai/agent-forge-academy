---
title: "Module 4: Predictive Modeling Patterns"
description: "Choosing the right model for the job"
module: "4"
order: 4
---

# Module 4: Predictive Modeling Patterns

**Duration:** Week 4  
**Theme:** *Choosing the right model for the job*

**Learning Objectives:**
- **Establish Baselines**: Establish baselines before complex models
- **tree-based models Understanding**: Understand tree-based models (GBMs, Random Forests)
- **Apply Linear**: Apply linear models with regularization
- **Use Time-Series**: Use time-series models (ARIMA, Prophet, ML-based)
- **Know When**: Know when (and when not) to use deep learning

---

## 4.1 Baselines First: Rules & Simple Models

### Why Start Simple?

**Principles:**
1. **Establish a benchmark:** Know what "good" looks like
2. **Validate the problem:** If simple models fail, complex ones might too
3. **Interpretability:** Understand what drives predictions
4. **Speed:** Simple models are fast to train and deploy

### Rule-Based Baselines

#### Business Rules

**Example: Churn Prediction**
```python
def rule_based_churn_prediction(customer):
    # Simple business rules
    if customer.days_since_last_purchase > 90:
        return 'high_risk'
    elif customer.support_tickets_last_month > 5:
        return 'high_risk'
    elif customer.purchases_last_30_days == 0:
        return 'medium_risk'
    else:
        return 'low_risk'
```

**When to Use:**
- Quick prototypes
- Interpretable decisions
- Regulatory requirements
- Baseline for comparison

#### Heuristic Baselines

**Example: Demand Forecasting**
```python
def naive_forecast(historical_sales):
    # Simple: Use last period's value
    return historical_sales[-1]

def seasonal_naive_forecast(historical_sales, season_length=7):
    # Use value from same period last season
    return historical_sales[-season_length]

def average_forecast(historical_sales, window=7):
    # Use average of last N periods
    return np.mean(historical_sales[-window:])
```

### Simple Statistical Models

#### Linear Regression (Baseline for Regression)

```python
from sklearn.linear_model import LinearRegression

# Simple linear model
model = LinearRegression()
model.fit(X_train, y_train)

# Baseline performance
baseline_score = model.score(X_test, y_test)
print(f"Baseline R²: {baseline_score:.3f}")
```

#### Logistic Regression (Baseline for Classification)

```python
from sklearn.linear_model import LogisticRegression

# Simple logistic model
model = LogisticRegression()
model.fit(X_train, y_train)

# Baseline performance
baseline_score = model.score(X_test, y_test)
print(f"Baseline Accuracy: {baseline_score:.3f}")
```

#### Naive Bayes (Fast Baseline)

```python
from sklearn.naive_bayes import GaussianNB

# Very fast, simple model
model = GaussianNB()
model.fit(X_train, y_train)

# Baseline performance
baseline_score = model.score(X_test, y_test)
```

### When to Move Beyond Baselines

**Move to Complex Models When:**
- Baseline performance is insufficient
- Problem complexity requires non-linear relationships
- You have sufficient data
- Performance gains justify complexity

**Stay with Simple Models When:**
- Baseline performance meets business needs
- Interpretability is critical
- Data is limited
- Speed is more important than accuracy

---

## 4.2 Tree-Based Models (GBMs, Random Forests)

### Decision Trees

**Concept:** Split data based on feature values to create regions.

**Advantages:**
- Interpretable
- Handles non-linear relationships
- No feature scaling needed
- Handles mixed data types

**Disadvantages:**
- Prone to overfitting
- Unstable (small data changes → different tree)
- Poor generalization

### Random Forests

**Concept:** Ensemble of many decision trees, each trained on random subset of data.

```python
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(
    n_estimators=100,  # Number of trees
    max_depth=10,      # Limit tree depth
    min_samples_split=20,  # Minimum samples to split
    random_state=42
)
model.fit(X_train, y_train)
```

**Advantages:**
- Reduces overfitting vs single tree
- Handles non-linear relationships
- Feature importance available
- Works well out-of-the-box

**Disadvantages:**
- Less interpretable than single tree
- Can be slow with many trees
- Memory intensive

**When to Use:**
- Good default choice
- Non-linear relationships expected
- Need feature importance
- Moderate dataset size

### Gradient Boosting Machines (GBMs)

**Concept:** Sequentially train trees, each correcting errors of previous trees.

#### XGBoost

```python
import xgboost as xgb

model = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    random_state=42
)
model.fit(X_train, y_train)
```

#### LightGBM

```python
import lightgbm as lgb

model = lgb.LGBMClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    random_state=42
)
model.fit(X_train, y_train)
```

#### CatBoost

```python
import catboost as cb

model = cb.CatBoostClassifier(
    iterations=100,
    depth=6,
    learning_rate=0.1,
    random_state=42,
    verbose=False
)
model.fit(X_train, y_train)
```

**Advantages:**
- Often best performance
- Handles categorical features well (especially CatBoost)
- Feature importance available
- Regularization built-in

**Disadvantages:**
- More hyperparameters to tune
- Can overfit if not careful
- Less interpretable
- Requires more tuning

**When to Use:**
- Need best possible performance
- Have time for hyperparameter tuning
- Large datasets
- Competitions or high-stakes predictions

### GBM Comparison

| Model | Speed | Performance | Categorical Handling | Use Case |
|-------|-------|-------------|---------------------|----------|
| **XGBoost** | Medium | Excellent | Manual encoding | General purpose |
| **LightGBM** | Fast | Excellent | Manual encoding | Large datasets |
| **CatBoost** | Medium | Excellent | Automatic | Categorical-heavy |

---

## 4.3 Linear Models & Regularization

### Linear Regression

**Concept:** Predict continuous value as linear combination of features.

```python
from sklearn.linear_model import LinearRegression

model = LinearRegression()
model.fit(X_train, y_train)

# Predictions
y_pred = model.predict(X_test)

# Coefficients (interpretable!)
print(model.coef_)  # Feature importance
print(model.intercept_)  # Baseline value
```

**Advantages:**
- Highly interpretable
- Fast training and prediction
- Works well with many features
- No hyperparameters

**Disadvantages:**
- Assumes linear relationships
- Sensitive to outliers
- Can't capture interactions without feature engineering

### Regularization: Preventing Overfitting

#### Ridge Regression (L2 Regularization)

**Concept:** Penalizes large coefficients.

```python
from sklearn.linear_model import Ridge

model = Ridge(alpha=1.0)  # alpha = regularization strength
model.fit(X_train, y_train)
```

**Effect:**
- Shrinks coefficients toward zero
- Prefers many small coefficients
- Good when many features are relevant

#### Lasso Regression (L1 Regularization)

**Concept:** Penalizes coefficients, can set them to zero.

```python
from sklearn.linear_model import Lasso

model = Lasso(alpha=1.0)
model.fit(X_train, y_train)

# Feature selection: coefficients = 0 are removed
selected_features = [f for f, coef in zip(features, model.coef_) if coef != 0]
```

**Effect:**
- Sets some coefficients to exactly zero
- Performs feature selection automatically
- Good when few features are relevant

#### Elastic Net (L1 + L2)

**Concept:** Combines Ridge and Lasso.

```python
from sklearn.linear_model import ElasticNet

model = ElasticNet(alpha=1.0, l1_ratio=0.5)  # l1_ratio: 0=Ridge, 1=Lasso
model.fit(X_train, y_train)
```

### Logistic Regression with Regularization

```python
from sklearn.linear_model import LogisticRegression

# L2 regularization (default)
model = LogisticRegression(C=1.0, penalty='l2')

# L1 regularization (feature selection)
model = LogisticRegression(C=1.0, penalty='l1', solver='liblinear')

model.fit(X_train, y_train)
```

**When to Use Linear Models:**
- Interpretability is critical
- Linear relationships are sufficient
- Many features, limited data
- Need fast predictions
- Baseline for comparison

---

## 4.4 Time-Series Models

### ARIMA (AutoRegressive Integrated Moving Average)

**Concept:** Models time series using past values and errors.

```python
from statsmodels.tsa.arima.model import ARIMA

# Fit ARIMA model
model = ARIMA(series, order=(1, 1, 1))  # (p, d, q)
fitted_model = model.fit()

# Forecast
forecast = fitted_model.forecast(steps=7)  # Next 7 periods
```

**Parameters:**
- **p:** Autoregressive terms (how many past values)
- **d:** Differencing (how many times to difference)
- **q:** Moving average terms (how many past errors)

**When to Use:**
- Univariate time series
- Stationary data (or can be made stationary)
- Clear trend and seasonality
- Medium-term forecasts

### Prophet (Facebook)

**Concept:** Additive model with trend, seasonality, and holidays.

```python
from prophet import Prophet

# Prepare data
df = pd.DataFrame({
    'ds': dates,  # Date column
    'y': values   # Value column
})

# Fit model
model = Prophet()
model.fit(df)

# Forecast
future = model.make_future_dataframe(periods=30)
forecast = model.predict(future)
```

**Advantages:**
- Handles seasonality automatically
- Robust to missing data
- Includes holiday effects
- Interpretable components

**When to Use:**
- Daily/weekly/monthly data
- Strong seasonality
- Holiday effects matter
- Need interpretable forecasts

### ML-Based Time Series

**Concept:** Use ML models with time-based features.

```python
# Create time features
def create_time_features(df):
    df['day_of_week'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month
    df['is_weekend'] = df['day_of_week'].isin([5, 6])
    
    # Lag features
    df['lag_1'] = df['value'].shift(1)
    df['lag_7'] = df['value'].shift(7)
    df['lag_30'] = df['value'].shift(30)
    
    # Rolling statistics
    df['rolling_mean_7'] = df['value'].rolling(7).mean()
    df['rolling_std_7'] = df['value'].rolling(7).std()
    
    return df

# Use with any ML model
X = create_time_features(df)
model = xgb.XGBRegressor()
model.fit(X_train, y_train)
```

**Advantages:**
- Can use any ML model
- Handles complex patterns
- Can include external features
- Often best performance

**When to Use:**
- Complex patterns
- External features available
- Need best performance
- Have sufficient data

---

## 4.5 When (and When Not) to Use Deep Learning

### When to Use Deep Learning

#### 1. Complex Non-Linear Patterns

**Example: Image Recognition**
```python
# Deep learning excels at:
# - Computer vision
# - Natural language processing
# - Complex feature interactions
```

#### 2. Large Datasets

**Rule of Thumb:**
- Need 10K+ examples minimum
- More data = better deep learning performance
- GBMs often competitive with less data

#### 3. Unstructured Data

**Examples:**
- Images
- Text
- Audio
- Video

#### 4. Transfer Learning

**Example:**
```python
# Use pre-trained models
from tensorflow.keras.applications import ResNet50

base_model = ResNet50(weights='imagenet', include_top=False)
# Fine-tune for your task
```

### When NOT to Use Deep Learning

#### 1. Small Datasets

**Problem:** Deep learning needs lots of data.

**Better Alternatives:**
- Linear models
- Tree-based models
- Simple baselines

#### 2. Tabular Data with Good Features

**Problem:** GBMs often outperform deep learning on tabular data.

**Better Alternatives:**
- XGBoost, LightGBM, CatBoost
- Random Forests
- Linear models

#### 3. Interpretability Required

**Problem:** Deep learning is a black box.

**Better Alternatives:**
- Linear models
- Decision trees
- SHAP/LIME for explanation

#### 4. Fast Iteration Needed

**Problem:** Deep learning is slow to train and tune.

**Better Alternatives:**
- GBMs (fast training)
- Linear models (very fast)
- Simple baselines

#### 5. Limited Compute Resources

**Problem:** Deep learning needs GPUs and lots of memory.

**Better Alternatives:**
- GBMs (CPU-friendly)
- Linear models (very efficient)
- Simple models

### Deep Learning for Tabular Data: When It Works

**Recent Advances:**
- TabNet
- Neural Oblivious Decision Ensembles (NODE)
- DeepFM

**Still:** GBMs often perform as well or better with less complexity.

---

## Lab 4: Train and Compare Models for Churn, Demand, and LTV

### Objective
Train and compare multiple model types for three prediction problems.

### Tasks

1. **Churn Prediction Models**
   - Baseline: Logistic regression
   - Tree-based: Random Forest, XGBoost
   - Compare performance and interpretability

2. **Demand Forecasting Models**
   - Baseline: Naive, seasonal naive
   - Time series: ARIMA, Prophet
   - ML-based: XGBoost with time features
   - Compare accuracy and interpretability

3. **LTV Prediction Models**
   - Baseline: Linear regression
   - Tree-based: Random Forest, LightGBM
   - Compare performance and feature importance

4. **Model Comparison**
   - Evaluate all models on same metrics
   - Compare training time
   - Analyze feature importance
   - Document trade-offs

### Deliverables

1. **Model Training Code** including:
   - All model implementations
   - Hyperparameter tuning
   - Evaluation code

2. **Model Comparison Report** including:
   - Performance metrics for all models
   - Training time comparison
   - Feature importance analysis
   - Recommendations for each problem

3. **Model Documentation** including:
   - Model selection rationale
   - Hyperparameter choices
   - Usage instructions

### Evaluation Criteria

- Model implementation quality (30%)
- Performance comparison (30%)
- Analysis depth (25%)
- Documentation clarity (15%)

---

## Summary

**Key Takeaways:**

- **Start Simple:**: Always establish baselines first
- **Tree-Based Models:**: GBMs are often best for tabular data
- **Linear Models:**: Great for interpretability and baselines
- **Time Series:**: ARIMA, Prophet, or ML-based depending on complexity
- **Deep Learning:**: Use for unstructured data, large datasets, complex patterns
- **Choose Wisely:**: Match model complexity to problem and data

**Next Steps:**
- **Module 5:**: Module 5: Evaluate models properly
- **to assess bias and stability Understanding**: Learn to assess bias and stability
- **trustworthy evaluation reports Development**: Build trustworthy evaluation reports

---

## Additional Resources

### Reading
- "The Elements of Statistical Learning" by Hastie, Tibshirani, Friedman
- "Applied Predictive Modeling" by Max Kuhn and Kjell Johnson
- "Forecasting: Principles and Practice" by Rob Hyndman

### Tools
- scikit-learn: Linear models, tree models
- XGBoost, LightGBM, CatBoost: Gradient boosting
- Prophet: Time series forecasting
- statsmodels: ARIMA models

---

**Ready for Module 5? [Continue →](Module_05_Model_Evaluation_Bias_and_Stability.md)**
