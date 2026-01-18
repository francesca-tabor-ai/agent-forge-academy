---
title: "Module 6: Pricing & Promotion Optimization"
description: "Revenue is a function of choice architecture"
module: "6"
order: 6
---

# Module 6: Pricing & Promotion Optimization

**Duration:** Week 6  
**Theme:** *Revenue is a function of choice architecture*

**Learning Objectives:**
- **price elasticity and demand curves Understanding**: Understand price elasticity and demand curves
- **Measure Discount**: Measure discount effectiveness and cannibalization
- **promotion targeting and personalization Development**: Design promotion targeting and personalization
- **Test Pricing**: Test pricing changes safely
- **Balance Long-Term**: Balance long-term vs short-term revenue trade-offs
- **pricing optimization models Development**: Build pricing optimization models

---

## 6.1 Price Elasticity and Demand Curves

### What is Price Elasticity?

**Definition:** The percentage change in quantity demanded for a 1% change in price.

**Formula:**
```
Elasticity = % Change in Quantity / % Change in Price
```

**Interpretation:**
- **Elastic (|E| > 1):** Quantity changes more than price (price-sensitive)
- **Inelastic (|E| < 1):** Quantity changes less than price (price-insensitive)
- **Unitary (|E| = 1):** Quantity changes equal to price change

#### Estimating Price Elasticity

**Method 1: Historical Price Changes**

```python
def estimate_price_elasticity(price_data, sales_data):
    """Estimate price elasticity from historical data"""
    # Merge price and sales data
    data = price_data.merge(sales_data, on='date', how='inner')
    
    # Calculate percentage changes
    data['price_pct_change'] = data['price'].pct_change()
    data['quantity_pct_change'] = data['quantity'].pct_change()
    
    # Calculate elasticity
    data['elasticity'] = data['quantity_pct_change'] / data['price_pct_change']
    
    # Average elasticity (excluding outliers)
    elasticity = data['elasticity'].abs().median()
    
    return {
        'elasticity': elasticity,
        'is_elastic': elasticity > 1,
        'data': data
    }
```

**Method 2: Regression Analysis**

```python
from sklearn.linear_model import LinearRegression
import numpy as np

def estimate_elasticity_regression(price_data, sales_data, control_vars):
    """Estimate elasticity using regression"""
    # Prepare data
    data = price_data.merge(sales_data, on='date', how='inner')
    data = data.merge(control_vars, on='date', how='inner')
    
    # Log-log model (elasticity is coefficient)
    X = np.log(data[['price'] + control_vars.columns.tolist()])
    y = np.log(data['quantity'])
    
    # Fit model
    model = LinearRegression()
    model.fit(X, y)
    
    # Elasticity is coefficient on log(price)
    elasticity = model.coef_[0]
    
    return {
        'elasticity': elasticity,
        'is_elastic': abs(elasticity) > 1,
        'model': model,
        'r_squared': model.score(X, y)
    }
```

**Method 3: Conjoint Analysis**

```python
def estimate_elasticity_conjoint(survey_data):
    """Estimate elasticity using conjoint analysis"""
    # Conjoint analysis reveals price sensitivity
    # by showing customers different price/feature combinations
    
    from sklearn.linear_model import LogisticRegression
    
    # Prepare data (choice data from survey)
    X = survey_data[['price', 'feature_1', 'feature_2', 'brand']]
    y = survey_data['choice']  # 1 if chosen, 0 if not
    
    # Fit model
    model = LogisticRegression()
    model.fit(X, y)
    
    # Price coefficient indicates sensitivity
    price_coef = model.coef_[0][0]
    
    # Convert to elasticity (approximate)
    avg_price = survey_data['price'].mean()
    avg_prob = survey_data['choice'].mean()
    elasticity = price_coef * avg_price * (1 - avg_prob)
    
    return {
        'elasticity': elasticity,
        'price_coefficient': price_coef,
        'model': model
    }
```

### Demand Curves

**Understanding Demand Curves:**

```python
def plot_demand_curve(price_elasticity, base_price, base_quantity):
    """Plot demand curve"""
    import matplotlib.pyplot as plt
    
    # Generate price points
    prices = np.linspace(base_price * 0.5, base_price * 1.5, 100)
    
    # Calculate quantities using elasticity
    # Q = Q0 * (P/P0)^(-elasticity)
    quantities = base_quantity * (prices / base_price) ** (-price_elasticity)
    
    # Plot
    plt.figure(figsize=(10, 6))
    plt.plot(prices, quantities)
    plt.xlabel('Price')
    plt.ylabel('Quantity')
    plt.title('Demand Curve')
    plt.grid(True)
    plt.show()
    
    return prices, quantities
```

**Revenue Optimization:**

```python
def optimize_price_for_revenue(price_elasticity, base_price, base_quantity, cost_per_unit):
    """Find price that maximizes revenue"""
    # Revenue = Price × Quantity
    # Quantity = Q0 × (P/P0)^(-elasticity)
    # Revenue = P × Q0 × (P/P0)^(-elasticity)
    
    prices = np.linspace(base_price * 0.5, base_price * 2, 1000)
    quantities = base_quantity * (prices / base_price) ** (-price_elasticity)
    revenues = prices * quantities
    profits = (prices - cost_per_unit) * quantities
    
    # Find optimal
    optimal_revenue_idx = np.argmax(revenues)
    optimal_profit_idx = np.argmax(profits)
    
    return {
        'optimal_price_revenue': prices[optimal_revenue_idx],
        'optimal_price_profit': prices[optimal_profit_idx],
        'max_revenue': revenues[optimal_revenue_idx],
        'max_profit': profits[optimal_profit_idx],
        'prices': prices,
        'revenues': revenues,
        'profits': profits
    }
```

---

## 6.2 Discount Effectiveness and Cannibalization

### Measuring Discount Effectiveness

**Key Questions:**
1. Does the discount increase sales enough to offset lower margin?
2. Are we just pulling forward future sales?
3. Are we cannibalizing full-price sales?

```python
def measure_discount_effectiveness(promotion_data):
    """Measure effectiveness of discount promotions"""
    # Compare promotion period to baseline
    promotion_period = promotion_data[promotion_data['promotion'] == True]
    baseline_period = promotion_data[promotion_data['promotion'] == False]
    
    # Calculate metrics
    promo_sales = promotion_period['quantity'].sum()
    baseline_sales = baseline_period['quantity'].mean() * len(promotion_period)
    
    promo_revenue = promotion_period['revenue'].sum()
    baseline_revenue = baseline_period['revenue'].mean() * len(promotion_period)
    
    # Calculate lift
    sales_lift = promo_sales - baseline_sales
    revenue_lift = promo_revenue - baseline_revenue
    
    # Calculate incremental margin
    promo_margin = (promotion_period['price'] - promotion_period['cost']).sum()
    baseline_margin = (baseline_period['price'] - baseline_period['cost']).mean() * len(promotion_period)
    margin_lift = promo_margin - baseline_margin
    
    return {
        'sales_lift': sales_lift,
        'revenue_lift': revenue_lift,
        'margin_lift': margin_lift,
        'promo_sales': promo_sales,
        'baseline_sales': baseline_sales,
        'is_profitable': margin_lift > 0
    }
```

### Measuring Cannibalization

**Cannibalization:** When discounted sales replace full-price sales that would have happened anyway.

```python
def measure_cannibalization(promotion_data, control_group_data):
    """Measure cannibalization using control group"""
    # Treatment: Show promotion
    # Control: Don't show promotion
    
    treatment = promotion_data[promotion_data['group'] == 'treatment']
    control = promotion_data[promotion_data['group'] == 'control']
    
    # Calculate conversion rates
    treatment_conv = treatment['converted'].mean()
    control_conv = control['converted'].mean()
    
    # Calculate average order value
    treatment_aov = treatment[treatment['converted'] == True]['revenue'].mean()
    control_aov = control[control['converted'] == True]['revenue'].mean()
    
    # Incremental conversions
    incremental_conv = treatment_conv - control_conv
    
    # Revenue impact
    treatment_revenue = treatment_conv * treatment_aov
    control_revenue = control_conv * control_aov
    incremental_revenue = treatment_revenue - control_revenue
    
    # Cannibalization rate (if negative incremental revenue)
    if incremental_revenue < 0:
        cannibalization_rate = abs(incremental_revenue) / control_revenue
    else:
        cannibalization_rate = 0
    
    return {
        'incremental_conversions': incremental_conv,
        'incremental_revenue': incremental_revenue,
        'cannibalization_rate': cannibalization_rate,
        'treatment_aov': treatment_aov,
        'control_aov': control_aov,
        'has_cannibalization': incremental_revenue < 0
    }
```

### Measuring Pull-Forward Effect

**Pull-Forward:** When promotions cause customers to buy earlier than they would have.

```python
def measure_pull_forward(promotion_data, post_promotion_data):
    """Measure pull-forward effect"""
    # Compare post-promotion period to historical baseline
    post_promo_sales = post_promotion_data['quantity'].sum()
    historical_baseline = promotion_data[promotion_data['promotion'] == False]['quantity'].mean()
    expected_post_sales = historical_baseline * len(post_promotion_data)
    
    # Calculate pull-forward
    pull_forward = expected_post_sales - post_promo_sales
    
    # Calculate during-promotion lift
    during_promo_sales = promotion_data[promotion_data['promotion'] == True]['quantity'].sum()
    during_promo_baseline = promotion_data[promotion_data['promotion'] == False]['quantity'].mean()
    expected_during_sales = during_promo_baseline * len(promotion_data[promotion_data['promotion'] == True])
    during_lift = during_promo_sales - expected_during_sales
    
    # Net effect
    net_lift = during_lift - pull_forward
    
    return {
        'pull_forward_quantity': pull_forward,
        'during_promo_lift': during_lift,
        'net_lift': net_lift,
        'pull_forward_pct': (pull_forward / during_lift) * 100 if during_lift > 0 else 0
    }
```

---

## 6.3 Promotion Targeting and Personalization

### Targeting High-Value Customers

```python
def target_promotions_by_ltv(customer_data, promotion_budget):
    """Target promotions to customers based on LTV"""
    # Calculate LTV for each customer
    customer_data['ltv'] = calculate_ltv(customer_data)
    
    # Calculate price sensitivity (from historical data)
    customer_data['price_sensitivity'] = calculate_price_sensitivity(customer_data)
    
    # Calculate expected incremental revenue from promotion
    customer_data['expected_incremental_revenue'] = (
        customer_data['ltv'] * 
        customer_data['price_sensitivity'] * 
        customer_data['promotion_discount']
    )
    
    # Calculate promotion cost
    customer_data['promotion_cost'] = (
        customer_data['ltv'] * 
        customer_data['promotion_discount']
    )
    
    # Calculate ROI
    customer_data['promo_roi'] = (
        (customer_data['expected_incremental_revenue'] - customer_data['promotion_cost']) /
        customer_data['promotion_cost']
    )
    
    # Target customers with positive ROI
    target_customers = customer_data[customer_data['promo_roi'] > 0].sort_values(
        'promo_roi',
        ascending=False
    )
    
    # Allocate budget
    allocated_budget = 0
    targeted_customers = []
    
    for customer in target_customers.itertuples():
        if allocated_budget + customer.promotion_cost <= promotion_budget:
            targeted_customers.append(customer.customer_id)
            allocated_budget += customer.promotion_cost
    
    return {
        'targeted_customers': targeted_customers,
        'allocated_budget': allocated_budget,
        'expected_incremental_revenue': target_customers[
            target_customers['customer_id'].isin(targeted_customers)
        ]['expected_incremental_revenue'].sum(),
        'expected_roi': (
            target_customers[
                target_customers['customer_id'].isin(targeted_customers)
            ]['expected_incremental_revenue'].sum() - allocated_budget
        ) / allocated_budget
    }
```

### Dynamic Pricing

```python
def dynamic_pricing_optimization(product_data, demand_forecast, inventory_levels):
    """Optimize prices dynamically based on demand and inventory"""
    optimal_prices = {}
    
    for product in product_data['product_id'].unique():
        product_data_subset = product_data[product_data['product_id'] == product]
        
        # Get demand forecast
        forecast = demand_forecast[demand_forecast['product_id'] == product]
        
        # Get inventory
        inventory = inventory_levels[inventory_levels['product_id'] == product]['quantity'].iloc[0]
        
        # Get price elasticity
        elasticity = product_data_subset['price_elasticity'].iloc[0]
        
        # Get cost
        cost = product_data_subset['cost'].iloc[0]
        
        # Optimize price
        base_price = product_data_subset['price'].iloc[0]
        prices = np.linspace(cost * 1.1, base_price * 1.5, 100)
        
        # Calculate expected demand at each price
        base_demand = forecast['expected_demand'].iloc[0]
        demands = base_demand * (prices / base_price) ** (-elasticity)
        
        # Calculate revenue (constrained by inventory)
        revenues = prices * np.minimum(demands, inventory)
        profits = (prices - cost) * np.minimum(demands, inventory)
        
        # Find optimal
        optimal_idx = np.argmax(profits)
        optimal_prices[product] = {
            'price': prices[optimal_idx],
            'expected_demand': min(demands[optimal_idx], inventory),
            'expected_revenue': revenues[optimal_idx],
            'expected_profit': profits[optimal_idx]
        }
    
    return optimal_prices
```

---

## 6.4 Testing Pricing Changes Safely

### Pricing Experiment Design

```python
def design_pricing_experiment(current_price, new_prices, sample_size_calc=True):
    """Design pricing experiment with guardrails"""
    # Calculate required sample size
    if sample_size_calc:
        from statsmodels.stats.power import TTestIndPower
        
        # Parameters
        effect_size = 0.1  # 10% change in conversion
        alpha = 0.05  # Significance level
        power = 0.8  # Statistical power
        
        analysis = TTestIndPower()
        sample_size = analysis.solve_power(
            effect_size=effect_size,
            alpha=alpha,
            power=power,
            ratio=1.0
        )
    else:
        sample_size = None
    
    # Define guardrails
    guardrails = {
        'min_conversion_rate': 0.02,  # Don't let conversion drop below 2%
        'max_revenue_drop': 0.05,  # Don't let revenue drop more than 5%
        'min_sample_size': 1000,  # Minimum users per variant
        'max_duration_days': 30,  # Maximum experiment duration
        'cooldown_days': 7  # Cooldown between experiments
    }
    
    # Experiment design
    experiment_design = {
        'variants': [
            {'name': 'control', 'price': current_price},
            *[{'name': f'variant_{i}', 'price': price} for i, price in enumerate(new_prices)]
        ],
        'sample_size_per_variant': sample_size or guardrails['min_sample_size'],
        'duration_days': 14,  # Initial duration
        'guardrails': guardrails,
        'success_metrics': ['conversion_rate', 'revenue_per_user', 'margin_per_user'],
        'guardrail_metrics': ['conversion_rate', 'total_revenue']
    }
    
    return experiment_design
```

### Monitoring Pricing Experiments

```python
def monitor_pricing_experiment(experiment_data, guardrails):
    """Monitor pricing experiment and check guardrails"""
    results = {}
    
    for variant in experiment_data['variant'].unique():
        variant_data = experiment_data[experiment_data['variant'] == variant]
        control_data = experiment_data[experiment_data['variant'] == 'control']
        
        # Calculate metrics
        variant_conv = variant_data['converted'].mean()
        control_conv = control_data['converted'].mean()
        
        variant_revenue = variant_data['revenue'].sum() / len(variant_data)
        control_revenue = control_data['revenue'].sum() / len(control_data)
        
        # Check guardrails
        guardrail_violations = []
        
        if variant_conv < guardrails['min_conversion_rate']:
            guardrail_violations.append('conversion_rate_below_minimum')
        
        revenue_drop = (control_revenue - variant_revenue) / control_revenue
        if revenue_drop > guardrails['max_revenue_drop']:
            guardrail_violations.append('revenue_drop_too_large')
        
        results[variant] = {
            'conversion_rate': variant_conv,
            'revenue_per_user': variant_revenue,
            'conversion_lift': (variant_conv / control_conv - 1) * 100,
            'revenue_lift': (variant_revenue / control_revenue - 1) * 100,
            'guardrail_violations': guardrail_violations,
            'should_stop': len(guardrail_violations) > 0
        }
    
    return results
```

---

## 6.5 Long-Term vs Short-Term Revenue Trade-offs

### Measuring Long-Term Impact

```python
def measure_long_term_pricing_impact(pricing_experiment_data, follow_up_periods):
    """Measure long-term impact of pricing changes"""
    results = {}
    
    for variant in pricing_experiment_data['variant'].unique():
        variant_data = pricing_experiment_data[
            pricing_experiment_data['variant'] == variant
        ]
        
        # Short-term metrics (during experiment)
        short_term_revenue = variant_data['revenue'].sum()
        short_term_customers = variant_data['customer_id'].nunique()
        
        # Long-term metrics (follow-up periods)
        variant_customers = variant_data['customer_id'].unique()
        long_term_data = follow_up_periods[
            follow_up_periods['customer_id'].isin(variant_customers)
        ]
        
        long_term_revenue = long_term_data['revenue'].sum()
        long_term_retention = (
            long_term_data['customer_id'].nunique() /
            len(variant_customers)
        )
        
        # Calculate LTV impact
        avg_ltv = long_term_data.groupby('customer_id')['revenue'].sum().mean()
        
        results[variant] = {
            'short_term_revenue': short_term_revenue,
            'long_term_revenue': long_term_revenue,
            'total_revenue': short_term_revenue + long_term_revenue,
            'retention_rate': long_term_retention,
            'avg_ltv': avg_ltv,
            'ltv_impact': avg_ltv - pricing_experiment_data[
                pricing_experiment_data['variant'] == 'control'
            ].groupby('customer_id')['revenue'].sum().mean()
        }
    
    return results
```

---

## Lab 6: Pricing and Promotion Optimization

### Objective
Design a pricing or promotion experiment with guardrails.

### Dataset
You'll be provided with:
- Historical pricing data
- Sales and conversion data
- Customer data (LTV, segments)
- Promotion history

### Tasks

1. **Price Elasticity Analysis**
   - Estimate price elasticity
   - Build demand curves
   - Identify optimal price points

2. **Promotion Analysis**
   - Measure discount effectiveness
   - Measure cannibalization
   - Measure pull-forward effects

3. **Targeting Strategy**
   - Design promotion targeting
   - Personalize pricing
   - Optimize budget allocation

4. **Experiment Design**
   - Design pricing experiment
   - Define guardrails
   - Calculate sample sizes

5. **Long-Term Analysis**
   - Measure long-term impact
   - Balance short vs long-term
   - Make recommendations

### Deliverables

1. **Pricing Strategy Report**
   - Price elasticity analysis
   - Promotion effectiveness analysis
   - Targeting strategy
   - Experiment design
   - Long-term impact analysis
   - Recommendations

2. **Code Repository**
   - Pricing analysis code
   - Experiment design code
   - Optimization scripts
   - Clean, documented code

### Evaluation Criteria

- **Analysis Quality (40%):** Correct calculations, meaningful insights
- **Experiment Design (30%):** Proper methodology, guardrails
- **Code Quality (20%):** Clean, reusable, well-documented
- **Business Application (10%):** Actionable recommendations

### Expected Output

A pricing or promo strategy backed by data and risk analysis that:
- Identifies optimal price points
- Measures promotion effectiveness
- Designs safe experiments
- Balances short and long-term
- Quantifies expected impact

---

## Summary

**Key Takeaways:**

- **Price Elasticity Matters:**: Understand how price affects demand
- **Discounts Have Trade-offs:**: Measure effectiveness, cannibalization, pull-forward
- **Target Strategically:**: Personalize promotions based on LTV and sensitivity
- **Test Safely:**: Use guardrails and proper experiment design
- **Think Long-Term:**: Balance short-term revenue with long-term value

**Next Steps:**
- **Module 7:**: Module 7: Learn experimentation for growth decisions
- **growth experimentation frameworks Understanding**: Understand growth experimentation frameworks
- **experiment roadmaps Development**: Apply design experiment roadmaps in relevant contexts

---

## Additional Resources

### Reading
- "Pricing Strategy" by Tim Smith
- "The Strategy and Tactics of Pricing" by Thomas Nagle
- "Pricing Experiments" by Ronny Kohavi

### Tools
- Python: scipy, statsmodels, scikit-learn
- Experimentation: Optimizely, VWO, Google Optimize

---

**Ready for Module 7? [Continue →](Module_07_Experimentation_for_Growth_Decisions.md)**
