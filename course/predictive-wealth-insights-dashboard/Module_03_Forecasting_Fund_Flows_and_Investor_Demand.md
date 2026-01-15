---
title: "Module 3: Forecasting Fund Flows & Investor Demand"
description: "Anticipate which fund categories will be in favor"
module: "3"
order: 3
---

# Module 3: Forecasting Fund Flows & Investor Demand

**Duration:** Week 3  
**Learning Objectives:**
- Implement sentiment scoring and trend acceleration
- Link search traffic to inflow probability
- Separate noise from signal
- Build scenario forecasting across asset classes

---

## Lesson 3.1: Sentiment Scoring and Trend Acceleration

### Sentiment Scoring

**Scoring Framework**
- Aggregate sentiment from multiple sources
- Weight by source reliability
- Time-weighted aggregation
- Trend acceleration detection

**Implementation**
```python
def calculate_sentiment_score(sources, time_window):
    """
    Calculate aggregated sentiment score
    """
    # Collect sentiment from sources
    sentiments = collect_sentiments(sources, time_window)
    
    # Weight by source reliability
    weighted_sentiment = weight_sentiments(sentiments)
    
    # Detect trend acceleration
    acceleration = detect_acceleration(weighted_sentiment)
    
    return {
        'sentiment_score': weighted_sentiment,
        'trend': calculate_trend(weighted_sentiment),
        'acceleration': acceleration,
        'confidence': calculate_confidence(sentiments)
    }
```

### Trend Acceleration

**Detection Methods**
- Rate of change analysis
- Second derivative calculation
- Momentum indicators
- Pattern recognition

---

## Lesson 3.2: Linking Search Traffic to Inflow Probability

### Search-Inflow Correlation

**Historical Analysis**
- Search volume vs. actual inflows
- Lead time analysis
- Correlation strength
- Predictive power

**Model Development**
```python
def forecast_inflows(search_data, historical_data):
    """
    Forecast fund inflows from search data
    """
    # Feature engineering
    features = extract_features(search_data, historical_data)
    
    # Model training
    model = train_inflow_model(features, historical_data.inflows)
    
    # Forecast
    forecast = model.predict(features)
    
    # Confidence intervals
    confidence = calculate_confidence_intervals(forecast, model)
    
    return {
        'forecast': forecast,
        'confidence_intervals': confidence,
        'lead_time': calculate_lead_time(search_data, historical_data)
    }
```

---

## Lesson 3.3: Separating Noise from Signal

### Signal Processing

**Noise Reduction**
- Statistical filtering
- Moving averages
- Outlier detection
- Trend extraction

**Signal Enhancement**
- Feature selection
- Dimensionality reduction
- Pattern recognition
- Anomaly detection

### Validation

**Signal Quality**
- Correlation with outcomes
- Predictive accuracy
- False signal rate
- Signal-to-noise ratio

---

## Lesson 3.4: Scenario Forecasting Across Asset Classes

### Multi-Asset Forecasting

**Asset Classes**
- Equities
- Fixed income
- Alternatives
- Multi-asset

**Scenario Framework**
- Base case
- Bull scenario
- Bear scenario
- Stress scenarios

---

## Exercise 3: Design a Simple Inflow Forecast Model

### Objective
Build a simple inflow forecast model using sentiment and search data.

### Requirements

1. **Model Design**
   - Feature selection
   - Model architecture
   - Training approach
   - Validation method

2. **Implementation**
   - Data collection
   - Feature engineering
   - Model training
   - Evaluation

3. **Deliverables**
   - Model code
   - Performance metrics
   - Forecast examples
   - Documentation

### Evaluation Criteria
- Model design (35%)
- Implementation quality (30%)
- Performance (25%)
- Documentation (10%)

---

## Key Takeaways

- Sentiment scoring and trend acceleration provide early flow signals
- Search traffic correlates with future inflows with measurable lead time
- Signal processing separates meaningful patterns from noise
- Scenario forecasting enables multi-asset class intelligence

---

**End of Module 3**
