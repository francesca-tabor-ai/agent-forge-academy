---
title: "Module 7: Model Failure Handling & Incident Response"
description: "When (not if) models fail—preparing for and responding to ML incidents"
module: "Module 7"
week: 7
order: 7
email_takeaway: "ML systems will fail—design them to fail safely with fallbacks, kill switches, and incident response procedures."
email_action: "Run a mock ML incident and write a postmortem with root cause analysis and prevention strategies."
---

# Module 7: Model Failure Handling & Incident Response

**Theme:** *When (not if) models fail*

**Duration:** Week 7  
**Learning Objectives:**
- **Identify Common**: Identify common ML failure modes
- **fallback strategies Development**: Apply design fallback strategies in relevant contexts
- **kill switches and circuit breakers Implementation**: Implement kill switches and circuit breakers
- **Conduct Post-Incident**: Apply conduct post-incident analysis in relevant contexts

---

## 7.1 Common ML Failure Modes

### Failure Mode 1: Bad Data

**Symptoms:**
- Unexpected input values
- Missing features
- Data type mismatches
- Schema changes

**Causes:**
- Upstream data pipeline failures
- Data source changes
- Data corruption
- Integration issues

**Example:**
```python
def handle_bad_data(request):
    try:
        # Validate input
        validate_input(request)
        
        # Extract features
        features = extract_features(request)
        
        # Validate features
        validate_features(features)
        
        return predict(features)
    
    except ValidationError as e:
        # Log error
        log_error("Bad data", e, request)
        
        # Return safe default
        return fallback_prediction()
```

### Failure Mode 2: Silent Drift

**Symptoms:**
- Gradual performance degradation
- Prediction distribution shifts
- Business metrics decline
- No obvious errors

**Causes:**
- Data distribution changes
- Concept drift
- Model becoming outdated
- External factors

**Detection:**
```python
def detect_silent_drift():
    # Monitor performance
    current_performance = get_current_performance()
    baseline_performance = get_baseline_performance()
    
    # Check for degradation
    if current_performance < baseline_performance * 0.95:
        alert("Silent drift detected")
        
        # Trigger model retraining
        trigger_retraining()
```

### Failure Mode 3: Latency Spikes

**Symptoms:**
- High P95/P99 latency
- Timeout errors
- User complaints
- System overload

**Causes:**
- Model service overload
- Feature store slow
- Network issues
- Resource constraints

**Handling:**
```python
def handle_latency_spike():
    # Monitor latency
    if get_latency_p95() > threshold:
        # Enable caching
        enable_aggressive_caching()
        
        # Use fallback model
        switch_to_faster_model()
        
        # Scale up
        scale_service()
```

### Failure Mode 4: Partial Outages

**Symptoms:**
- Some predictions fail
- Intermittent errors
- Service degradation
- Regional issues

**Causes:**
- Infrastructure failures
- Network partitions
- Dependency failures
- Regional outages

**Handling:**
```python
def handle_partial_outage():
    # Detect outage
    if is_service_degraded():
        # Route to backup region
        route_to_backup_region()
        
        # Use cached predictions
        enable_caching()
        
        # Fallback to simpler model
        use_fallback_model()
```

---

## 7.2 Fallback Strategies

### Strategy 1: Rules-Based Fallback

**When to Use:**
- Simple, deterministic logic
- Fast execution
- High reliability

**Example:**
```python
def rules_based_fallback(features):
    # Simple rules
    if features['transaction_amount'] > 10000:
        return "high_risk"
    elif features['user_age_days'] < 30:
        return "medium_risk"
    else:
        return "low_risk"
```

### Strategy 2: Cached Predictions

**When to Use:**
- Recent predictions available
- Acceptable staleness
- Fast retrieval

**Example:**
```python
def cached_fallback(features):
    # Try cache first
    cached = cache.get(features)
    if cached and not is_stale(cached):
        return cached.prediction
    
    # Fallback to rules
    return rules_based_fallback(features)
```

### Strategy 3: Simpler Model

**When to Use:**
- Have backup model
- Faster inference
- Acceptable accuracy loss

**Example:**
```python
def simpler_model_fallback(features):
    # Try primary model
    try:
        return primary_model.predict(features)
    except ModelUnavailable:
        # Fallback to simpler model
        return simpler_model.predict(features)
```

### Strategy 4: Default Values

**When to Use:**
- No better option
- Safe defaults exist
- Better than failing

**Example:**
```python
def default_fallback():
    # Return safe default
    return {
        "prediction": "low_risk",
        "confidence": 0.5,
        "source": "default"
    }
```

### Fallback Chain

**Implementation:**
```python
def predict_with_fallbacks(features):
    # Try primary model
    try:
        return primary_model.predict(features)
    except PrimaryModelFailed:
        pass
    
    # Try cached prediction
    cached = cache.get(features)
    if cached:
        return cached
    
    # Try simpler model
    try:
        return simpler_model.predict(features)
    except SimplerModelFailed:
        pass
    
    # Try rules
    try:
        return rules_based_fallback(features)
    except RulesFailed:
        pass
    
    # Default
    return default_fallback()
```

---

## 7.3 Kill Switches and Circuit Breakers

### Kill Switches

**Definition:** Manual or automatic mechanism to disable model predictions.

**Use Cases:**
- Model producing bad predictions
- Security incident
- Performance issues
- Business decision

**Implementation:**
```python
class KillSwitch:
    def __init__(self):
        self.enabled = True
    
    def is_enabled(self):
        return self.enabled
    
    def disable(self, reason):
        self.enabled = False
        self.reason = reason
        log_event("kill_switch_disabled", reason)
    
    def enable(self):
        self.enabled = True
        log_event("kill_switch_enabled")

def predict_with_kill_switch(features):
    if not kill_switch.is_enabled():
        return fallback_prediction()
    
    return model.predict(features)
```

### Circuit Breakers

**Definition:** Automatically disable service after failure threshold.

**States:**
- **Closed:** Normal operation
- **Open:** Service disabled (failures exceeded)
- **Half-Open:** Testing if service recovered

**Implementation:**
```python
class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failure_count = 0
        self.state = "closed"
        self.last_failure_time = None
    
    def call(self, func, *args, **kwargs):
        if self.state == "open":
            if time.time() - self.last_failure_time > self.timeout:
                self.state = "half-open"
            else:
                raise CircuitBreakerOpen()
        
        try:
            result = func(*args, **kwargs)
            if self.state == "half-open":
                self.state = "closed"
                self.failure_count = 0
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = time.time()
            
            if self.failure_count >= self.failure_threshold:
                self.state = "open"
            
            raise e
```

### Using Circuit Breakers

**Example:**
```python
circuit_breaker = CircuitBreaker(failure_threshold=5, timeout=60)

def predict(features):
    try:
        return circuit_breaker.call(model.predict, features)
    except CircuitBreakerOpen:
        return fallback_prediction()
```

---

## 7.4 Post-Incident Analysis & Learning Loops

### Incident Response Process

**1. Detect**
- Monitoring alerts
- User reports
- Business metrics

**2. Respond**
- Assess severity
- Activate incident response
- Implement mitigations

**3. Resolve**
- Fix root cause
- Restore service
- Verify recovery

**4. Learn**
- Postmortem
- Root cause analysis
- Action items

### Postmortem Template

**1. Executive Summary**
- What happened
- Impact
- Duration
- Root cause

**2. Timeline**
- Incident start
- Key events
- Resolution
- Duration

**3. Root Cause Analysis**
- Immediate cause
- Contributing factors
- Systemic issues

**4. Impact Assessment**
- Users affected
- Business impact
- Data loss
- Revenue impact

**5. Action Items**
- Immediate fixes
- Short-term improvements
- Long-term changes
- Owners and deadlines

### Learning Loops

**1. Immediate Learning**
- What went wrong?
- How did we detect it?
- How did we fix it?

**2. Systemic Learning**
- Why did it happen?
- What systems failed?
- What processes failed?

**3. Prevention**
- How do we prevent recurrence?
- What monitoring do we need?
- What processes do we need?

**Example Postmortem:**

> **Template: Incident Postmortem**

# Incident: Model Performance Degradation

## Executive Summary
Model accuracy dropped from 95% to 85% over 2 weeks, 
causing 10% revenue loss.

## Timeline
- Day 1: Performance starts declining
- Day 7: Alert triggered
- Day 10: Root cause identified (data drift)
- Day 14: Model retrained and deployed

## Root Cause
- Data distribution changed (new user segment)
- Model not retrained
- Monitoring didn't catch drift early enough

## Impact
- 10% revenue loss
- 50k users affected
- $500k business impact

## Action Items
1. Implement automated drift detection (1 week)
2. Set up automated retraining (2 weeks)
3. Improve monitoring dashboards (1 week)
```

---

## Hands-On Exercise: Mock ML Incident

### Exercise: Run Incident and Write Postmortem

**Scenario:** Fraud detection model failure

**Incident:**
- Model starts returning all transactions as "fraud"
- 90% false positive rate
- Payment processing blocked for legitimate users
- Revenue impact: $100k/hour

**Tasks:**

1. **Detect Incident**
   - Identify symptoms
   - Assess severity
   - Activate response

2. **Respond**
   - Implement kill switch
   - Enable fallback
   - Communicate to stakeholders

3. **Investigate**
   - Root cause analysis
   - Timeline reconstruction
   - Impact assessment

4. **Resolve**
   - Fix root cause
   - Deploy fix
   - Verify recovery

5. **Learn**
   - Write postmortem
   - Identify action items
   - Update processes

**Deliverable:**
- Incident response playbook
- Postmortem document
- Action items with owners

---

## Module Summary

### Key Takeaways

- **Failures are inevitable**: Design for failure from the start
- **Fallbacks are essential**: Multiple layers of fallback
- **Kill switches save the day**: Manual and automatic controls
- **Learn from incidents**: Postmortems prevent recurrence

### Next Steps

- **Complete The**: Complete the mock incident exercise
- **Review Incident**: Review incident response procedures
- **Move To**: Move to Module 8 to learn about collaboration and production readiness

---

## Exercises

1. **Failure Mode Analysis:** For each failure mode, design:
   - Detection mechanism
   - Response procedure
   - Fallback strategy

2. **Fallback Design:** Design fallback chain for:
   - High-stakes system (fraud detection)
   - Low-stakes system (recommendations)
   - Experimental system (A/B test)

3. **Incident Response:** Create incident response playbook with:
   - Detection procedures
   - Response steps
   - Communication plan
   - Postmortem template
