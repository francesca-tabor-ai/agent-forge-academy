---
title: "Module 4: Latency, Scalability & Reliability"
description: "Meeting production guarantees for ML systems"
module: "Module 4"
week: 4
order: 4
email_takeaway: "Production ML systems must meet strict latency, throughput, and reliability requirements—design for these from day one."
email_action: "Simulate latency failures and design fallback logic for your ML service."
---

# Module 4: Latency, Scalability & Reliability

**Theme:** *Meeting production guarantees*

**Duration:** Week 4  
**Learning Objectives:**
- Design systems that meet latency SLAs
- Scale ML systems horizontally
- Implement caching strategies
- Build graceful degradation and fallbacks

---

## 4.1 Latency Budgets and Performance Bottlenecks

### Latency Budgets

**Definition:** The maximum acceptable time from request to response, broken down by component.

**Example Budget (100ms total):**
```
Request → 5ms
Feature Extraction → 20ms
Feature Store Lookup → 30ms
Model Inference → 40ms
Response → 5ms
Total: 100ms
```

### Identifying Bottlenecks

**Common Bottlenecks:**

1. **Feature Extraction**
   - Slow database queries
   - Complex feature computation
   - External API calls

2. **Feature Store Lookup**
   - Network latency
   - Cache misses
   - Large feature sets

3. **Model Inference**
   - Large model size
   - CPU/GPU constraints
   - Batch size too small

4. **Data Dependencies**
   - External service calls
   - Database queries
   - Network I/O

### Profiling and Measurement

**Tools:**
- Application performance monitoring (APM)
- Distributed tracing
- Custom timing instrumentation

**Example:**
```python
import time

def predict_with_timing(request):
    timings = {}
    
    # Feature extraction
    start = time.time()
    features = extract_features(request)
    timings['feature_extraction'] = time.time() - start
    
    # Feature store
    start = time.time()
    feature_store_features = feature_store.get(features)
    timings['feature_store'] = time.time() - start
    
    # Model inference
    start = time.time()
    prediction = model.predict(feature_store_features)
    timings['inference'] = time.time() - start
    
    return prediction, timings
```

### Optimization Strategies

**1. Parallelize Independent Operations**
```python
# Sequential (slow)
features_a = compute_feature_a()
features_b = compute_feature_b()  # Waits for A
features_c = compute_feature_c()  # Waits for B

# Parallel (fast)
features_a, features_b, features_c = parallel([
    compute_feature_a,
    compute_feature_b,
    compute_feature_c
])
```

**2. Pre-compute Expensive Operations**
- Cache feature computations
- Pre-warm models
- Pre-fetch common data

**3. Optimize Model Inference**
- Model quantization
- Batch inference
- Hardware acceleration (GPU/TPU)

---

## 4.2 Throughput and Horizontal Scaling

### Throughput Requirements

**Definition:** Number of predictions per second the system must handle.

**Scaling Strategies:**

| Throughput | Strategy |
|------------|----------|
| < 100 req/s | Single instance |
| 100-1k req/s | Load balancer + multiple instances |
| 1k-10k req/s | Auto-scaling + caching |
| > 10k req/s | Distributed serving + sharding |

### Horizontal Scaling

**Pattern:** Add more instances to handle increased load.

**Architecture:**
```
Load Balancer → [Instance 1, Instance 2, ..., Instance N]
```

**Considerations:**
- Stateless services (easier to scale)
- Shared state (feature store, model registry)
- Load distribution
- Health checks

### Auto-Scaling

**Triggers:**
- CPU utilization
- Request rate
- Queue depth
- Custom metrics

**Example:**
```yaml
# Auto-scaling configuration
min_instances: 2
max_instances: 20
target_cpu: 70%
scale_up_threshold: 80%
scale_down_threshold: 40%
```

### Vertical Scaling

**When to Use:**
- Single-threaded bottlenecks
- Memory-intensive models
- GPU requirements
- Cost optimization (fewer, larger instances)

**Limitations:**
- Hardware limits
- Single point of failure
- Less flexible than horizontal

---

## 4.3 Caching Strategies

### Why Cache?

**Benefits:**
- Reduce latency (cache hits are fast)
- Reduce compute costs
- Reduce load on dependencies
- Improve reliability (cache as fallback)

### Caching Patterns

**1. Prediction Caching**
```python
# Cache model predictions
@cache(ttl=300)  # 5 minutes
def predict(user_id, context):
    return model.predict(features)
```

**2. Feature Caching**
```python
# Cache feature computations
@cache(ttl=60)
def get_user_features(user_id):
    return compute_features(user_id)
```

**3. Model Output Caching**
```python
# Cache at different levels
cache_layers = {
    "prediction": cache_prediction,  # Most specific
    "features": cache_features,      # Medium
    "raw_data": cache_raw_data       # Most general
}
```

### Cache Invalidation

**Strategies:**

1. **Time-Based (TTL)**
   - Cache expires after time
   - Simple, but may serve stale data

2. **Event-Based**
   - Invalidate on data changes
   - Fresh, but complex

3. **Version-Based**
   - Invalidate on model/feature version changes
   - Ensures consistency

**Example:**
```python
def invalidate_cache_on_event(event):
    if event.type == "user_update":
        cache.delete(f"user_features:{event.user_id}")
    elif event.type == "model_update":
        cache.clear_pattern("predictions:*")
```

### Cache Hierarchy

**Multi-Level Caching:**
```
L1: In-memory (fastest, smallest)
L2: Redis (fast, medium)
L3: Database (slower, largest)
```

---

## 4.4 Graceful Degradation & Fallbacks

### Why Degrade Gracefully?

**Reality:** Systems fail. Design them to fail safely.

**Degradation Strategies:**

1. **Fallback Models**
   - Use simpler, faster model
   - Pre-computed predictions
   - Rule-based system

2. **Cached Predictions**
   - Return last known good prediction
   - Stale but safe

3. **Default Values**
   - Return safe defaults
   - No prediction better than bad prediction

### Implementation Patterns

**1. Circuit Breaker**
```python
class ModelService:
    def __init__(self):
        self.circuit_breaker = CircuitBreaker(
            failure_threshold=5,
            timeout=60
        )
    
    def predict(self, features):
        try:
            return self.circuit_breaker.call(
                self.model.predict, features
            )
        except CircuitBreakerOpen:
            return self.fallback_predict(features)
```

**2. Fallback Chain**
```python
def predict_with_fallbacks(features):
    # Try primary model
    try:
        return primary_model.predict(features)
    except ModelUnavailable:
        pass
    
    # Try secondary model
    try:
        return secondary_model.predict(features)
    except ModelUnavailable:
        pass
    
    # Try cached prediction
    cached = cache.get(features)
    if cached:
        return cached
    
    # Return default
    return default_prediction()
```

**3. Timeout-Based Fallback**
```python
def predict_with_timeout(features, timeout_ms=100):
    try:
        return timeout(
            model.predict, 
            features, 
            timeout=timeout_ms / 1000
        )
    except TimeoutError:
        return fallback_predict(features)
```

### Designing Fallbacks

**Questions to Answer:**
1. What is the minimum acceptable prediction?
2. How stale can predictions be?
3. What is the cost of wrong predictions?
4. What is the cost of no prediction?

---

## 4.5 Designing for Peak Traffic

### Capacity Planning

**Steps:**
1. Estimate peak traffic
2. Measure current capacity
3. Plan for 2-3x peak (safety margin)
4. Design auto-scaling

### Load Testing

**Tools:**
- Locust, k6, JMeter
- Custom load generators

**Scenarios:**
- Steady state load
- Gradual ramp-up
- Sudden spike
- Sustained peak

**Example:**
```python
# Load test scenario
scenarios = {
    "steady_state": {
        "users": 100,
        "duration": "10m"
    },
    "spike": {
        "users": 1000,
        "duration": "1m",
        "ramp_up": "10s"
    },
    "sustained_peak": {
        "users": 500,
        "duration": "1h"
    }
}
```

### Rate Limiting

**Purpose:** Protect system from overload.

**Strategies:**
- Per-user limits
- Global limits
- Tiered limits (free vs paid)

**Example:**
```python
@rate_limit(requests_per_second=10)
def predict(features):
    return model.predict(features)
```

### Queueing and Backpressure

**When Load Exceeds Capacity:**
- Queue requests
- Reject requests (HTTP 503)
- Throttle clients

**Example:**
```python
from queue import Queue

request_queue = Queue(maxsize=1000)

def predict(features):
    if request_queue.full():
        raise ServiceUnavailable("Queue full")
    
    request_queue.put(features)
    return process_request(request_queue.get())
```

---

## Hands-On Exercise: Simulate Latency Failures

### Exercise: Design Fallback Logic

**Scenario:** Real-time fraud detection service

**Requirements:**
- 100ms latency SLA
- 99.9% availability
- Must work even if model service fails
- Must handle traffic spikes (10x normal)

**Tasks:**

1. **Identify Failure Modes**
   - Model service down
   - Feature store slow
   - Network issues
   - Traffic spike

2. **Design Fallback Strategy**
   - Primary: Real-time model
   - Fallback 1: Cached predictions
   - Fallback 2: Rule-based system
   - Fallback 3: Default (approve with flag)

3. **Implement Circuit Breaker**
   - Failure threshold: 5 failures
   - Timeout: 60 seconds
   - Fallback on open circuit

4. **Load Test**
   - Normal load: 100 req/s
   - Peak load: 1000 req/s
   - Verify fallbacks trigger correctly

**Deliverable:**
- Fallback architecture diagram
- Implementation code
- Load test results
- Performance & reliability plan

---

## Module Summary

### Key Takeaways

1. **Latency budgets guide optimization** - Break down and measure each component
2. **Scale horizontally for throughput** - Add instances, not just resources
3. **Cache aggressively** - Reduces latency, cost, and load
4. **Design for failure** - Fallbacks ensure reliability

### Next Steps

- Complete the latency failure simulation exercise
- Review production ML system architectures
- Move to Module 5 to learn about monitoring and observability

---

## Exercises

1. **Latency Analysis:** Profile an ML service and:
   - Measure latency of each component
   - Identify bottlenecks
   - Propose optimizations

2. **Scaling Design:** Design scaling strategy for:
   - 10 req/s → 1000 req/s growth
   - Auto-scaling configuration
   - Cost optimization

3. **Fallback Design:** Design fallback chain for:
   - Real-time recommendation service
   - Batch prediction system
   - Hybrid ML system
