---
title: "Module 4: Marketing Mix Modeling (MMM)"
description: "Measuring what actually drives demand"
module: "4"
order: 4
---

# Module 4: Marketing Mix Modeling (MMM)

**Duration:** Week 4  
**Theme:** *Measuring what actually drives demand*

**Learning Objectives:**
- Understand when MMM is the right tool (and when it isn't)
- Learn core MMM concepts and assumptions
- Model media saturation and diminishing returns
- Account for seasonality, trends, and external factors
- Translate MMM outputs into budget decisions
- Build and interpret an MMM model

---

## 4.1 When MMM is the Right Tool

### What is Marketing Mix Modeling?

**Definition:** A statistical analysis technique that estimates the impact of various marketing activities on sales or other key metrics.

**Key Insight:** MMM helps answer: "How much did each marketing channel contribute to revenue, and how should I allocate my budget?"

#### When to Use MMM

**✅ Good Use Cases:**

1. **Long-Term Budget Planning**
   - Annual marketing budget allocation
   - Strategic channel mix decisions
   - Understanding long-term ROI

2. **Multi-Channel Measurement**
   - When you have 5+ marketing channels
   - When channels interact with each other
   - When attribution is unclear

3. **Understanding Market Dynamics**
   - Seasonality effects
   - Competitive impacts
   - Economic factors
   - Price elasticity

4. **Privacy-Compliant Measurement**
   - When you can't track users across channels
   - Cookie-less environments
   - Regulatory restrictions

**❌ Poor Use Cases:**

1. **Short-Term Tactical Decisions**
   - Daily bid adjustments
   - Real-time optimization
   - A/B test interpretation

2. **Single Channel Optimization**
   - When you only have one channel
   - When channel-level data is sufficient
   - When attribution is clear

3. **New Products/Channels**
   - Insufficient historical data
   - No baseline to compare
   - Rapidly changing environment

4. **Very Small Budgets**
   - Not enough signal to detect
   - Statistical power too low
   - Cost of modeling > value

#### MMM vs Attribution

**MMM (Top-Down):**
- Aggregate, time-series data
- Measures total contribution
- Accounts for interactions
- Long-term view
- Privacy-friendly

**Attribution (Bottom-Up):**
- Individual user-level data
- Measures last-touch/assisted
- Doesn't account for interactions
- Short-term view
- Requires tracking

**Best Practice:** Use both together
- MMM for strategic budget allocation
- Attribution for tactical optimization

---

## 4.2 Core MMM Concepts and Assumptions

### The Basic MMM Equation

**Simple Model:**
```
Sales(t) = Base + Σ(Media_Effect_i(t)) + Seasonality(t) + Trend(t) + Error(t)
```

**Where:**
- `Base`: Baseline sales without marketing
- `Media_Effect_i`: Contribution of channel i
- `Seasonality`: Time-based patterns
- `Trend`: Long-term growth/decline
- `Error`: Unexplained variation

#### Key Assumptions

**1. Linearity (Often Relaxed)**
- **Assumption:** Marketing effects are linear
- **Reality:** Diminishing returns (saturation)
- **Solution:** Use adstock and saturation curves

**2. Independence**
- **Assumption:** Channels don't interact
- **Reality:** Channels reinforce each other
- **Solution:** Include interaction terms

**3. Stationarity**
- **Assumption:** Effects are constant over time
- **Reality:** Effects change
- **Solution:** Time-varying coefficients or rolling windows

**4. No Endogeneity**
- **Assumption:** Marketing spend is exogenous
- **Reality:** Spend often responds to performance
- **Solution:** Instrumental variables or lagged variables

#### Adstock: Carryover Effects

**Concept:** Marketing effects don't happen instantly. They carry over to future periods.

**Example:**
- TV ad airs on Monday
- Effect peaks Tuesday, decays over week
- Total effect = immediate + carryover

**Modeling Adstock:**

```python
def calculate_adstock(spend, decay_rate=0.5, max_lag=4):
    """Calculate adstock (carryover effect)"""
    adstock = np.zeros(len(spend))
    
    for t in range(len(spend)):
        # Immediate effect
        adstock[t] = spend[t]
        
        # Carryover from previous periods
        for lag in range(1, min(max_lag + 1, t + 1)):
            adstock[t] += spend[t - lag] * (decay_rate ** lag)
    
    return adstock
```

**Example:**
```python
# TV spend: [0, 1000, 0, 0, 0]
# With decay_rate=0.5, max_lag=2
# Adstock: [0, 1000, 500, 250, 125]
```

#### Saturation: Diminishing Returns

**Concept:** Each additional dollar of marketing has less impact than the previous dollar.

**Example:**
- First $1K: 100 conversions
- Next $1K: 80 conversions (diminishing returns)
- Next $1K: 60 conversions (more diminishing)

**Modeling Saturation (Hill Function):**

```python
def hill_function(adstock, half_saturation, slope):
    """Hill function for saturation curve"""
    return (adstock ** slope) / (half_saturation ** slope + adstock ** slope)
```

**Parameters:**
- `half_saturation`: Spend level where effect is 50% of max
- `slope`: How quickly saturation occurs (higher = faster saturation)

---

## 4.3 Building an MMM Model

### Data Requirements

**Minimum Data Needed:**

1. **Dependent Variable (Outcome)**
   - Sales, revenue, conversions
   - Weekly or monthly aggregation
   - At least 2 years of data

2. **Marketing Spend**
   - By channel (TV, digital, print, etc.)
   - Same time granularity as outcome
   - Historical spend data

3. **Control Variables**
   - Price/promotions
   - Seasonality indicators
   - Competitive activity
   - Economic indicators

### Step 1: Data Preparation

```python
def prepare_mmm_data(sales_data, spend_data, control_data):
    """Prepare data for MMM"""
    # Aggregate to weekly level
    sales_weekly = sales_data.resample('W').sum()
    spend_weekly = spend_data.resample('W').sum()
    control_weekly = control_data.resample('W').mean()
    
    # Merge all data
    mmm_data = sales_weekly.merge(
        spend_weekly,
        left_index=True,
        right_index=True,
        how='inner'
    ).merge(
        control_weekly,
        left_index=True,
        right_index=True,
        how='inner'
    )
    
    # Create time features
    mmm_data['week'] = mmm_data.index.isocalendar().week
    mmm_data['month'] = mmm_data.index.month
    mmm_data['quarter'] = mmm_data.index.quarter
    mmm_data['year'] = mmm_data.index.year
    
    # Create trend
    mmm_data['trend'] = range(len(mmm_data))
    
    return mmm_data
```

### Step 2: Calculate Adstock

```python
def prepare_channel_adstock(mmm_data, channels, decay_rates):
    """Calculate adstock for each channel"""
    adstock_data = mmm_data.copy()
    
    for channel in channels:
        adstock_data[f'{channel}_adstock'] = calculate_adstock(
            mmm_data[channel],
            decay_rate=decay_rates[channel]
        )
    
    return adstock_data
```

### Step 3: Build the Model

**Using Linear Regression:**

```python
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import statsmodels.api as sm

def build_mmm_linear(mmm_data, channels, control_vars):
    """Build linear MMM model"""
    # Prepare features
    feature_cols = [f'{ch}_adstock' for ch in channels] + control_vars + ['trend']
    X = mmm_data[feature_cols]
    y = mmm_data['sales']
    
    # Add intercept
    X = sm.add_constant(X)
    
    # Fit model
    model = sm.OLS(y, X).fit()
    
    return model
```

**Using Bayesian Methods (Robyn-style):**

```python
import pymc3 as pm

def build_mmm_bayesian(mmm_data, channels, control_vars):
    """Build Bayesian MMM model"""
    with pm.Model() as model:
        # Priors for channel coefficients
        channel_coefs = {}
        for channel in channels:
            channel_coefs[channel] = pm.Normal(
                f'{channel}_coef',
                mu=0,
                sigma=1
            )
        
        # Priors for control variables
        control_coefs = {}
        for var in control_vars:
            control_coefs[var] = pm.Normal(
                f'{var}_coef',
                mu=0,
                sigma=1
            )
        
        # Baseline
        baseline = pm.Normal('baseline', mu=mmm_data['sales'].mean(), sigma=100)
        
        # Trend
        trend_coef = pm.Normal('trend_coef', mu=0, sigma=1)
        
        # Model equation
        mu = baseline
        for channel in channels:
            mu += channel_coefs[channel] * mmm_data[f'{channel}_adstock']
        for var in control_vars:
            mu += control_coefs[var] * mmm_data[var]
        mu += trend_coef * mmm_data['trend']
        
        # Likelihood
        sigma = pm.HalfNormal('sigma', sigma=100)
        sales_obs = pm.Normal('sales', mu=mu, sigma=sigma, observed=mmm_data['sales'])
        
        # Sample
        trace = pm.sample(2000, return_inferencedata=True)
    
    return model, trace
```

### Step 4: Model Interpretation

```python
def interpret_mmm_results(model, channels, mmm_data):
    """Interpret MMM model results"""
    results = {}
    
    for channel in channels:
        # Get coefficient
        coef = model.params[f'{channel}_adstock']
        
        # Calculate contribution
        contribution = coef * mmm_data[f'{channel}_adstock'].sum()
        contribution_pct = (contribution / mmm_data['sales'].sum()) * 100
        
        # Calculate ROI
        total_spend = mmm_data[channel].sum()
        roi = (contribution / total_spend) if total_spend > 0 else 0
        
        results[channel] = {
            'coefficient': coef,
            'contribution': contribution,
            'contribution_pct': contribution_pct,
            'total_spend': total_spend,
            'roi': roi
        }
    
    return pd.DataFrame(results).T.sort_values('contribution', ascending=False)
```

---

## 4.4 Media Saturation and Diminishing Returns

### Understanding Saturation Curves

**Why It Matters:**
- Helps identify optimal spend levels
- Prevents over-investment in saturated channels
- Identifies under-invested opportunities

**Modeling with Hill Function:**

```python
def fit_saturation_curve(spend, conversions, channel_name):
    """Fit saturation curve to channel data"""
    from scipy.optimize import curve_fit
    
    def hill_func(x, half_sat, slope, max_effect):
        """Hill function for saturation"""
        return max_effect * (x ** slope) / (half_sat ** slope + x ** slope)
    
    # Fit curve
    popt, pcov = curve_fit(
        hill_func,
        spend,
        conversions,
        p0=[spend.mean(), 2.0, conversions.max()],
        bounds=([0, 0.5, 0], [spend.max() * 2, 5.0, conversions.max() * 2])
    )
    
    half_sat, slope, max_effect = popt
    
    # Calculate optimal spend (where marginal ROI = 1)
    # This requires calculating derivative and finding where it equals cost per conversion
    optimal_spend = find_optimal_spend(hill_func, popt, cost_per_conversion=10)
    
    return {
        'channel': channel_name,
        'half_saturation': half_sat,
        'slope': slope,
        'max_effect': max_effect,
        'optimal_spend': optimal_spend,
        'current_spend': spend.mean(),
        'under_invested': optimal_spend > spend.mean() * 1.2,
        'over_invested': optimal_spend < spend.mean() * 0.8
    }
```

### Marginal ROI Analysis

```python
def calculate_marginal_roi(saturation_params, current_spend, cost_per_conversion):
    """Calculate marginal ROI at current spend level"""
    half_sat = saturation_params['half_saturation']
    slope = saturation_params['slope']
    max_effect = saturation_params['max_effect']
    
    # Calculate derivative (marginal effect)
    def marginal_effect(spend):
        numerator = max_effect * slope * (half_sat ** slope) * (spend ** (slope - 1))
        denominator = (half_sat ** slope + spend ** slope) ** 2
        return numerator / denominator
    
    marginal_conv = marginal_effect(current_spend)
    marginal_revenue = marginal_conv * cost_per_conversion
    marginal_roi = (marginal_revenue / 1) - 1  # ROI = (Revenue - Cost) / Cost
    
    return {
        'marginal_effect': marginal_conv,
        'marginal_revenue': marginal_revenue,
        'marginal_roi': marginal_roi,
        'recommendation': 'increase' if marginal_roi > 0 else 'decrease'
    }
```

---

## 4.5 Seasonality, Trends, and External Factors

### Modeling Seasonality

**Types of Seasonality:**

1. **Weekly Patterns**
   - Day of week effects
   - Weekend vs weekday

2. **Monthly Patterns**
   - Month of year
   - Payday effects
   - Holiday months

3. **Quarterly Patterns**
   - Business cycles
   - Fiscal year effects

**Modeling with Dummy Variables:**

```python
def add_seasonality_features(mmm_data):
    """Add seasonality features"""
    # Day of week (if daily data)
    if mmm_data.index.freq == 'D':
        mmm_data['day_of_week'] = mmm_data.index.dayofweek
        mmm_data['is_weekend'] = mmm_data['day_of_week'].isin([5, 6])
    
    # Month of year
    mmm_data['month'] = mmm_data.index.month
    
    # Quarter
    mmm_data['quarter'] = mmm_data.index.quarter
    
    # Holiday indicators
    mmm_data['is_holiday_month'] = mmm_data['month'].isin([11, 12])  # Nov, Dec
    
    # Create dummy variables
    seasonality_dummies = pd.get_dummies(
        mmm_data[['month', 'quarter']],
        prefix=['month', 'quarter']
    )
    
    return pd.concat([mmm_data, seasonality_dummies], axis=1)
```

**Modeling with Fourier Terms:**

```python
def add_fourier_terms(mmm_data, periods=[52, 26, 12]):
    """Add Fourier terms for seasonality"""
    t = np.arange(len(mmm_data))
    
    for period in periods:
        for k in range(1, 3):  # First 2 harmonics
            mmm_data[f'fourier_sin_{period}_{k}'] = np.sin(2 * np.pi * k * t / period)
            mmm_data[f'fourier_cos_{period}_{k}'] = np.cos(2 * np.pi * k * t / period)
    
    return mmm_data
```

### Modeling Trends

```python
def add_trend_features(mmm_data):
    """Add trend features"""
    # Linear trend
    mmm_data['trend'] = range(len(mmm_data))
    
    # Polynomial trends (if needed)
    mmm_data['trend_squared'] = mmm_data['trend'] ** 2
    
    # Log trend (for exponential growth)
    mmm_data['log_trend'] = np.log1p(mmm_data['trend'])
    
    return mmm_data
```

### External Factors

**Common External Factors:**

1. **Economic Indicators**
   - GDP growth
   - Unemployment rate
   - Consumer confidence

2. **Competitive Activity**
   - Competitor ad spend
   - Competitor pricing
   - Market share

3. **Product Factors**
   - Price changes
   - Promotions
   - Product launches

**Including in Model:**

```python
def add_external_factors(mmm_data, external_data):
    """Add external factors to model"""
    # Merge external data
    mmm_data = mmm_data.merge(
        external_data,
        left_index=True,
        right_index=True,
        how='left'
    )
    
    # Create interaction terms (if needed)
    mmm_data['price_promo_interaction'] = (
        mmm_data['price'] * mmm_data['promotion']
    )
    
    return mmm_data
```

---

## 4.6 Translating MMM Outputs into Budget Decisions

### Budget Reallocation Framework

```python
def reallocate_budget_mmm(mmm_results, current_budget, total_budget):
    """Reallocate budget based on MMM results"""
    # Calculate efficiency scores (ROI-weighted)
    mmm_results['efficiency_score'] = (
        mmm_results['roi'] / mmm_results['roi'].sum()
    )
    
    # Allocate budget proportionally to efficiency
    mmm_results['allocated_budget'] = (
        total_budget * mmm_results['efficiency_score']
    )
    
    # Calculate expected impact
    mmm_results['expected_contribution'] = (
        mmm_results['allocated_budget'] * mmm_results['roi']
    )
    
    # Calculate change from current
    mmm_results['budget_change'] = (
        mmm_results['allocated_budget'] - current_budget
    )
    mmm_results['budget_change_pct'] = (
        mmm_results['budget_change'] / current_budget * 100
    )
    
    return mmm_results.sort_values('allocated_budget', ascending=False)
```

### Scenario Planning

```python
def scenario_planning_mmm(mmm_model, budget_scenarios):
    """Run scenario planning with MMM"""
    scenarios = []
    
    for scenario_name, budget_allocation in budget_scenarios.items():
        # Predict sales for this budget allocation
        predicted_sales = predict_sales_mmm(
            mmm_model,
            budget_allocation
        )
        
        # Calculate metrics
        total_spend = sum(budget_allocation.values())
        total_sales = predicted_sales.sum()
        roi = (total_sales - total_spend) / total_spend
        
        scenarios.append({
            'scenario': scenario_name,
            'total_spend': total_spend,
            'predicted_sales': total_sales,
            'roi': roi,
            'budget_allocation': budget_allocation
        })
    
    return pd.DataFrame(scenarios)
```

---

## Lab 4: Marketing Mix Modeling

### Objective
Design and interpret an MMM for a multi-channel marketing setup.

### Dataset
You'll be provided with:
- 2+ years of weekly sales data
- Marketing spend by channel (TV, digital, print, radio, etc.)
- Control variables (price, promotions, seasonality)
- External factors (competitor activity, economic indicators)

### Tasks

1. **Data Preparation**
   - Aggregate to appropriate time granularity
   - Calculate adstock for each channel
   - Add seasonality and trend features
   - Prepare control variables

2. **Model Building**
   - Build linear MMM model
   - Build Bayesian MMM model (optional)
   - Validate model assumptions
   - Evaluate model fit

3. **Interpretation**
   - Calculate channel contributions
   - Calculate ROI by channel
   - Identify saturation points
   - Analyze marginal ROI

4. **Budget Reallocation**
   - Calculate optimal budget allocation
   - Compare to current allocation
   - Run scenario planning
   - Quantify expected impact

5. **Recommendations**
   - Identify under-invested channels
   - Identify over-invested channels
   - Recommend specific budget changes
   - Quantify revenue impact

### Deliverables

1. **MMM Analysis Report**
   - Model methodology
   - Channel contribution analysis
   - ROI analysis
   - Budget reallocation recommendations
   - Expected impact quantification

2. **Code Repository**
   - MMM modeling code
   - Adstock and saturation functions
   - Budget optimization code
   - Clean, documented code

### Evaluation Criteria

- **Model Quality (40%):** Proper methodology, good fit, valid assumptions
- **Analysis Quality (30%):** Meaningful insights, correct calculations
- **Code Quality (20%):** Clean, reusable, well-documented
- **Business Application (10%):** Actionable recommendations

### Expected Output

A media effectiveness and budget reallocation recommendation that:
- Quantifies each channel's contribution
- Identifies optimal budget allocation
- Provides specific reallocation recommendations
- Quantifies expected revenue impact
- Includes scenario planning

---

## Summary

**Key Takeaways:**

1. **MMM for Strategy:** Use for long-term budget planning, not daily optimization
2. **Adstock Matters:** Marketing effects carry over time
3. **Saturation Exists:** Diminishing returns are real and measurable
4. **Control for Everything:** Seasonality, trends, external factors matter
5. **Translate to Decisions:** Use MMM outputs to reallocate budget

**Next Steps:**
- Module 5: Learn attribution and incrementality
- Understand credit vs causality
- Compare attribution and incrementality methods

---

## Additional Resources

### Reading
- "Marketing Mix Modeling" by Dominique Hanssens
- Robyn documentation (Meta's MMM tool)
- LightweightMMM documentation (Google's MMM tool)

### Tools
- Python: statsmodels, pymc3, scipy
- R: Robyn, LightweightMMM
- Commercial: Nielsen, IRI, Analytic Partners

---

**Ready for Module 5? [Continue →](Module_05_Attribution_and_Incrementality.md)**
