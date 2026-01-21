---
title: "Module 2: Cohort Analysis & Retention Modeling"
description: "Growth is cumulative, not instantaneous"
module: "2"
order: 2
---

# Module 2: Cohort Analysis & Retention Modeling

**Duration:** Week 2  
**Theme:** *Growth is cumulative, not instantaneous*

**Learning Objectives:**
- **cohort definitions and design choices Understanding**: Understand cohort definitions and design choices
- **and interpret retention curves Development**: Build and interpret retention curves
- **Analyze Retention**: Analyze retention decay patterns
- **behavioral Analysis**: Differentiate behavioral vs calendar cohorts
- **retention shifts Integration**: Link retention shifts to product and marketing actions
- **predictive retention models Development**: Build predictive retention models

---

## 2.1 Cohort Definitions and Design Choices

### What is a Cohort?

**Definition:** A group of users who share a common characteristic, typically when they first engaged with your product.

**Key Insight:** Cohorts allow you to track how groups of users behave over time, controlling for when they joined.

#### Types of Cohorts

**1. Calendar Cohorts (Time-Based)**
- **Definition:** Users grouped by when they first used the product
- **Examples:** 
  - January 2024 sign-ups
  - Q1 2024 customers
  - Week of March 15, 2024
- **Use Cases:**
  - Understanding seasonal effects
  - Measuring product changes over time
  - Comparing marketing campaign effectiveness

**2. Behavioral Cohorts**
- **Definition:** Users grouped by their initial behavior or characteristics
- **Examples:**
  - Users who signed up via referral
  - Users who completed onboarding in < 24 hours
  - Users from specific acquisition channels
- **Use Cases:**
  - Understanding impact of initial experience
  - Comparing user quality across sources
  - Identifying high-value user patterns

**3. Product Cohorts**
- **Definition:** Users grouped by product version or feature availability
- **Examples:**
  - Users who joined before/after feature launch
  - Users on different product tiers
  - Users in different markets
- **Use Cases:**
  - Measuring feature impact
  - Understanding product-market fit
  - Comparing market performance

#### Cohort Design Decisions

**Decision 1: Granularity**

```python
def create_cohorts(df, granularity='month'):
    """Create cohorts with specified granularity"""
    if granularity == 'day':
        df['cohort'] = df['signup_date'].dt.date
    elif granularity == 'week':
        df['cohort'] = df['signup_date'].dt.to_period('W').astype(str)
    elif granularity == 'month':
        df['cohort'] = df['signup_date'].dt.to_period('M').astype(str)
    elif granularity == 'quarter':
        df['cohort'] = df['signup_date'].dt.to_period('Q').astype(str)
    
    return df
```

**Trade-offs:**
- **Day:** Most granular, but noisy for small user bases
- **Week:** Good balance for most products
- **Month:** Standard for most businesses, easier to interpret
- **Quarter:** Only for very large user bases or long sales cycles

**Decision 2: Cohort Size Threshold**

```python
def filter_cohorts_by_size(cohort_df, min_size=100):
    """Filter out cohorts below minimum size"""
    cohort_sizes = cohort_df.groupby('cohort').size()
    valid_cohorts = cohort_sizes[cohort_sizes >= min_size].index
    
    return cohort_df[cohort_df['cohort'].isin(valid_cohorts)]
```

**Why it matters:**
- Small cohorts have high variance
- Statistical significance requires sufficient sample size
- Rule of thumb: Minimum 30-100 users per cohort

**Decision 3: Cohort Start Event**

**Options:**
- First visit
- First sign-up
- First purchase
- First activation
- First paid conversion

**Best Practice:** Use the event that best represents "becoming a user"

```python
def define_cohort_start(df, start_event='signup'):
    """Define cohort based on start event"""
    if start_event == 'signup':
        df['cohort_date'] = df['signup_date']
    elif start_event == 'first_purchase':
        df['cohort_date'] = df.groupby('user_id')['purchase_date'].transform('min')
    elif start_event == 'activation':
        df['cohort_date'] = df.groupby('user_id')['activation_date'].transform('min')
    
    return df
```

---

## 2.2 Retention Curves and Decay Patterns

### Building Retention Curves

**Retention Curve:** Shows what percentage of a cohort is still active at each time period.

#### Basic Retention Calculation

```python
def calculate_retention(cohort_df):
    """Calculate retention rates for each cohort"""
    # Create period column (time since cohort start)
    cohort_df['period'] = (
        (cohort_df['activity_date'] - cohort_df['cohort_date']).dt.days // 7
    )
    
    # Calculate retention
    retention = cohort_df.groupby(['cohort', 'period']).agg({
        'user_id': 'nunique'
    }).reset_index()
    
    # Calculate retention rate (as % of period 0)
    retention_pivot = retention.pivot(
        index='cohort',
        columns='period',
        values='user_id'
    )
    
    retention_rates = retention_pivot.div(retention_pivot[0], axis=0)
    
    return retention_rates
```

#### Visualizing Retention Curves

```python
import matplotlib.pyplot as plt
import seaborn as sns

def plot_retention_curves(retention_rates):
    """Plot retention curves for multiple cohorts"""
    plt.figure(figsize=(12, 8))
    
    for cohort in retention_rates.index:
        plt.plot(
            retention_rates.columns,
            retention_rates.loc[cohort],
            label=cohort,
            alpha=0.7
        )
    
    plt.xlabel('Period (weeks)')
    plt.ylabel('Retention Rate')
    plt.title('Retention Curves by Cohort')
    plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.grid(True, alpha=0.3)
    plt.show()
```

#### Understanding Decay Patterns

**1. Exponential Decay**
- **Pattern:** Rapid initial drop, then levels off
- **Formula:** `retention(t) = a * e^(-λt)`
- **Interpretation:** Constant churn rate
- **Example:** Most consumer apps

**2. Power Law Decay**
- **Pattern:** Steep initial drop, then gradual decline
- **Formula:** `retention(t) = a * t^(-b)`
- **Interpretation:** Early churn is high, but long-term users stick
- **Example:** Social networks, marketplaces

**3. Step Function Decay**
- **Pattern:** Flat periods with sudden drops
- **Interpretation:** Users churn at specific milestones
- **Example:** Subscription products with billing cycles

**4. Improving Retention**
- **Pattern:** Retention increases over time
- **Interpretation:** Product is getting better or user base is improving
- **Example:** Early-stage products with rapid iteration

#### Fitting Retention Models

```python
from scipy.optimize import curve_fit
import numpy as np

def exponential_decay(t, a, lam):
    """Exponential decay model"""
    return a * np.exp(-lam * t)

def fit_retention_model(retention_data):
    """Fit exponential decay model to retention data"""
    periods = retention_data.index.values
    retention_rates = retention_data.values
    
    # Fit model
    popt, pcov = curve_fit(
        exponential_decay,
        periods,
        retention_rates,
        p0=[1.0, 0.1]  # Initial guesses
    )
    
    # Predict future retention
    future_periods = np.arange(len(periods), len(periods) + 12)
    predicted = exponential_decay(future_periods, *popt)
    
    return {
        'parameters': popt,
        'covariance': pcov,
        'predictions': predicted,
        'r_squared': calculate_r_squared(retention_rates, exponential_decay(periods, *popt))
    }
```

---

## 2.3 Behavioral vs Calendar Cohorts

### When to Use Each

#### Calendar Cohorts: Understanding Time Effects

**Best For:**
- **Measuring Product**: Measuring product changes over time
- **Understanding Seasonal**: Apply understanding seasonal patterns in relevant contexts
- **Comparing Marketing**: Apply comparing marketing campaigns in relevant contexts
- **Tracking Overall**: Tracking overall product health

**Example: Measuring Product Improvement**

```python
def compare_cohort_performance(calendar_cohorts):
    """Compare retention across calendar cohorts"""
    # Calculate average retention by cohort
    cohort_retention = calendar_cohorts.groupby('cohort').agg({
        'retention_rate': 'mean',
        'user_id': 'nunique'
    })
    
    # Identify trends
    cohort_retention['trend'] = (
        cohort_retention['retention_rate'].rolling(window=3).mean()
    )
    
    # Calculate improvement
    recent_cohorts = cohort_retention.tail(3)['retention_rate'].mean()
    older_cohorts = cohort_retention.head(3)['retention_rate'].mean()
    improvement = (recent_cohorts / older_cohorts - 1) * 100
    
    return {
        'improvement_pct': improvement,
        'trend': 'improving' if improvement > 0 else 'declining'
    }
```

#### Behavioral Cohorts: Understanding User Quality

**Best For:**
- **Comparing Acquisition**: Comparing acquisition channel quality
- **Understanding Impact**: Understanding impact of onboarding
- **Identifying High-Value**: Identifying high-value user patterns
- **Optimizing Initial**: Apply optimizing initial experience in relevant contexts

**Example: Onboarding Impact**

```python
def analyze_onboarding_cohorts(df):
    """Compare retention by onboarding completion"""
    # Create behavioral cohorts
    df['onboarding_cohort'] = df['onboarding_completed'].apply(
        lambda x: 'completed' if x else 'incomplete'
    )
    
    # Calculate retention by cohort
    retention_by_cohort = df.groupby(['onboarding_cohort', 'period']).agg({
        'user_id': 'nunique'
    }).reset_index()
    
    # Calculate retention rates
    cohort_sizes = retention_by_cohort.groupby('onboarding_cohort')['user_id'].first()
    retention_rates = retention_by_cohort.pivot(
        index='period',
        columns='onboarding_cohort',
        values='user_id'
    ).div(cohort_sizes, axis=1)
    
    return retention_rates
```

#### Combining Both Approaches

**Best Practice:** Use calendar cohorts for time trends, behavioral cohorts for user quality.

```python
def comprehensive_cohort_analysis(df):
    """Combine calendar and behavioral cohort analysis"""
    # Calendar cohorts
    df['calendar_cohort'] = df['signup_date'].dt.to_period('M')
    
    # Behavioral cohorts
    df['behavioral_cohort'] = df.apply(
        lambda row: f"{row['acquisition_channel']}_{'fast_onboard' if row['onboarding_time'] < 24 else 'slow_onboard'}",
        axis=1
    )
    
    # Analyze both dimensions
    calendar_retention = calculate_retention_by_cohort(df, 'calendar_cohort')
    behavioral_retention = calculate_retention_by_cohort(df, 'behavioral_cohort')
    
    return {
        'calendar_trends': calendar_retention,
        'behavioral_differences': behavioral_retention,
        'combined_insights': analyze_interactions(df, 'calendar_cohort', 'behavioral_cohort')
    }
```

---

## 2.4 Interpreting Retention Shifts

### What Retention Changes Mean

#### Positive Shifts: Improving Retention

**Possible Causes:**
1. **Product Improvements**
   - New features that increase value
   - Better onboarding experience
   - Improved product-market fit

2. **Better User Acquisition**
   - Targeting higher-quality users
   - Improved marketing messaging
   - Better channel mix

3. **Market Changes**
   - Increased market demand
   - Competitive advantages
   - Network effects kicking in

**How to Identify:**

```python
def identify_retention_improvements(cohort_retention):
    """Identify what caused retention improvements"""
    # Calculate retention by period
    period_retention = cohort_retention.mean(axis=0)
    
    # Identify significant improvements
    improvements = []
    for period in range(1, len(period_retention)):
        change = period_retention.iloc[period] - period_retention.iloc[period-1]
        if change > 0.05:  # 5% improvement threshold
            improvements.append({
                'period': period,
                'improvement': change,
                'possible_causes': identify_causes(period)
            })
    
    return improvements
```

#### Negative Shifts: Declining Retention

**Possible Causes:**
1. **Product Issues**
   - Bugs or performance problems
   - Removed features users loved
   - Increased friction

2. **Market Changes**
   - Increased competition
   - Market saturation
   - Changing user needs

3. **Acquisition Quality Decline**
   - Targeting wrong users
   - Misaligned marketing
   - Channel mix degradation

**How to Diagnose:**

```python
def diagnose_retention_decline(cohort_retention, product_events, market_data):
    """Diagnose causes of retention decline"""
    # Identify when decline started
    decline_start = identify_decline_start(cohort_retention)
    
    # Check product events around that time
    product_changes = product_events[
        (product_events['date'] >= decline_start - pd.Timedelta(days=30)) &
        (product_events['date'] <= decline_start + pd.Timedelta(days=30))
    ]
    
    # Check market conditions
    market_changes = market_data[
        market_data['date'] >= decline_start - pd.Timedelta(days=30)
    ]
    
    # Correlate with retention
    correlation = calculate_correlation(
        product_changes,
        market_changes,
        cohort_retention.loc[decline_start:]
    )
    
    return {
        'decline_start': decline_start,
        'product_factors': product_changes,
        'market_factors': market_changes,
        'correlations': correlation,
        'recommended_actions': generate_recommendations(correlation)
    }
```

#### Linking Retention to Actions

**Framework: Event-Impact Analysis**

```python
def link_events_to_retention(product_events, cohort_retention):
    """Link product/marketing events to retention changes"""
    results = []
    
    for event in product_events.itertuples():
        # Find cohorts affected
        affected_cohorts = cohort_retention[
            cohort_retention.index >= event.date
        ]
        
        # Calculate retention change
        before_retention = cohort_retention[
            cohort_retention.index < event.date
        ].iloc[-3:].mean(axis=0)  # Average of last 3 cohorts
        
        after_retention = affected_cohorts.iloc[:3].mean(axis=0)  # Average of first 3 cohorts
        
        impact = (after_retention - before_retention).mean()
        
        results.append({
            'event': event.name,
            'date': event.date,
            'impact': impact,
            'statistical_significance': test_significance(before_retention, after_retention)
        })
    
    return pd.DataFrame(results).sort_values('impact', ascending=False)
```

---

## 2.5 Predictive Retention Modeling

### Building Models to Predict Retention

#### Survival Analysis Approach

**Why Survival Analysis:**
- Handles censored data (users who haven't churned yet)
- Models time-to-event (time to churn)
- Accounts for right-censoring

```python
from lifelines import KaplanMeierFitter, CoxPHFitter

def survival_analysis_retention(df):
    """Use survival analysis to model retention"""
    # Prepare data
    survival_data = df.groupby('user_id').agg({
        'signup_date': 'min',
        'last_active_date': 'max',
        'churned': 'max',  # 1 if churned, 0 if still active
        'acquisition_channel': 'first',
        'onboarding_completed': 'first'
    }).reset_index()
    
    # Calculate duration
    survival_data['duration'] = (
        survival_data['last_active_date'] - survival_data['signup_date']
    ).dt.days
    
    # Fit Kaplan-Meier (non-parametric)
    kmf = KaplanMeierFitter()
    kmf.fit(
        survival_data['duration'],
        event_observed=survival_data['churned']
    )
    
    # Fit Cox Proportional Hazards (parametric with covariates)
    cph = CoxPHFitter()
    cph.fit(
        survival_data[['duration', 'churned', 'acquisition_channel', 'onboarding_completed']],
        duration_col='duration',
        event_col='churned'
    )
    
    return {
        'kaplan_meier': kmf,
        'cox_model': cph,
        'predictions': cph.predict_survival_function(survival_data)
    }
```

#### Machine Learning Approach

```python
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split

def ml_retention_model(df):
    """Build ML model to predict retention"""
    # Create features
    features = [
        'days_since_signup',
        'acquisition_channel_encoded',
        'onboarding_completed',
        'feature_usage_score',
        'support_tickets',
        'payment_failures',
        'device_type',
        'signup_month'
    ]
    
    # Create target (churned in next 30 days)
    df['churn_target'] = (
        (df['last_active_date'] - df['current_date']).dt.days > 30
    ).astype(int)
    
    # Prepare data
    X = df[features]
    y = df['churn_target']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train model
    model = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1)
    model.fit(X_train, y_train)
    
    # Evaluate
    predictions = model.predict_proba(X_test)[:, 1]
    feature_importance = pd.DataFrame({
        'feature': features,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    return {
        'model': model,
        'predictions': predictions,
        'feature_importance': feature_importance,
        'accuracy': model.score(X_test, y_test)
    }
```

#### Cohort-Based Predictive Models

```python
def predict_cohort_retention(historical_cohorts, new_cohort_features):
    """Predict retention for new cohorts based on historical data"""
    # Extract features from historical cohorts
    historical_features = []
    historical_retention = []
    
    for cohort in historical_cohorts:
        features = extract_cohort_features(cohort)
        retention = calculate_cohort_retention(cohort)
        
        historical_features.append(features)
        historical_retention.append(retention)
    
    # Train model
    from sklearn.ensemble import RandomForestRegressor
    
    model = RandomForestRegressor(n_estimators=100)
    model.fit(historical_features, historical_retention)
    
    # Predict for new cohort
    new_retention = model.predict([new_cohort_features])
    
    return {
        'predicted_retention': new_retention,
        'model': model,
        'feature_importance': get_feature_importance(model)
    }
```

---

## Lab 2: Cohort Analysis and Retention Modeling

### Objective
Build and interpret cohort analyses for a subscription or marketplace product.

### Dataset
You'll be provided with:
- User signup data with timestamps
- User activity data (daily/weekly)
- User attributes (channel, device, location)
- Product events (feature launches, changes)

### Tasks

1. **Create Cohorts**
   - Define calendar cohorts (monthly)
   - Create behavioral cohorts (by acquisition channel)
   - Validate cohort sizes

2. **Calculate Retention**
   - Build retention curves for each cohort
   - Calculate retention rates by period
   - Identify retention patterns

3. **Analyze Retention Trends**
   - Compare retention across calendar cohorts
   - Identify improving/declining trends
   - Link trends to product events

4. **Behavioral Cohort Analysis**
   - Compare retention by acquisition channel
   - Compare retention by onboarding completion
   - Identify high-value user patterns

5. **Predictive Modeling**
   - Build survival analysis model
   - Build ML retention prediction model
   - Predict retention for new cohorts

6. **Business Insights**
   - Identify key retention drivers
   - Recommend retention improvements
   - Quantify impact of improvements

### Deliverables

1. **Cohort Analysis Report**
   - Retention curves visualization
   - Trend analysis
   - Behavioral cohort comparisons
   - Predictive model results
   - Business recommendations

2. **Code Repository**
   - Reusable cohort analysis functions
   - Retention modeling code
   - Visualization scripts
   - Clean, documented code

### Evaluation Criteria

- **Analysis Quality (40%):** Correct calculations, meaningful insights
- **Model Quality (30%):** Accurate predictions, proper methodology
- **Code Quality (20%):** Clean, reusable, well-documented
- **Business Impact (10%):** Actionable recommendations

### Expected Output

A cohort-based retention insight with:
- Clear identification of retention trends
- Understanding of what drives retention
- Predictive model for future cohorts
- Specific recommendations for improvement
- Quantified business impact

---

## Summary

**Key Takeaways:**

- **Cohorts Control for Time:**: Compare users who joined at different times
- **Retention Curves Show Patterns:**: Understand how users behave over time
- **Behavioral Cohorts Reveal Quality:**: Initial experience matters
- **Retention Shifts Signal Changes:**: Link changes to product/market events
- **Predictive Models Enable Planning:**: Forecast future retention

**Next Steps:**
- **Module 3:**: Module 3: Learn lifetime value (LTV) modeling
- **how retention drives value Understanding**: Understand how retention drives value
- **predictive LTV models Development**: Build predictive LTV models

---

## Additional Resources

### Reading
- "Lean Analytics" by Alistair Croll and Benjamin Yoskovitz
- "The Lean Startup" by Eric Ries
- Survival Analysis documentation (lifelines library)

### Tools
- Python: pandas, lifelines, scikit-learn
- Visualization: matplotlib, seaborn, plotly
- Cohort Analysis: Mixpanel, Amplitude

---

**Ready for Module 3? [Continue →](Module_03_Lifetime_Value_LTV_Modeling.md)**
