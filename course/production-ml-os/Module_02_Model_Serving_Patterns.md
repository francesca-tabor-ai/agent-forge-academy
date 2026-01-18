---
title: "Module 2: Model Serving Patterns"
description: "How predictions are delivered to meet business requirements"
module: "Module 2"
week: 2
order: 2
email_takeaway: "The right serving pattern depends on latency requirements, cost constraints, and data freshness needs—not just model accuracy."
email_action: "Design serving architectures for churn prediction, fraud detection, and recommendation ranking."
---

# Module 2: Model Serving Patterns

**Theme:** *How predictions are delivered*

**Duration:** Week 2  
**Learning Objectives:**
- **batch vs real-time inference trade-offs Understanding**: Understand batch vs real-time inference trade-offs
- **serving architectures for different use cases Development**: Design serving architectures for different use cases
- **Choose Serving**: Choose serving patterns based on business SLAs
- **synchronous and asynchronous serving Implementation**: Implement synchronous and asynchronous serving

---

## 2.1 Batch Inference

### What is Batch Inference?

Batch inference computes predictions for multiple inputs in a single operation, typically on a schedule or when triggered by data availability.

**Architecture:**
```
Data Source → Batch Job → Model Inference → Results Storage → API/Consumer
```

### Characteristics

**Pros:**
- **Cost-effective:** Amortize compute costs across many predictions
- **Throughput:** Process millions of records efficiently
- **Complex models:** Can use larger, slower models
- **Predictable:** Scheduled execution, known resource needs

**Cons:**
- **Latency:** Hours to days between computation and serving
- **Staleness:** Predictions may be outdated
- **Storage:** Need to store all predictions
- **Flexibility:** Limited to pre-computed scenarios

### When to Use Batch Inference

**Ideal for:**
- Predictions that don't change frequently
- Use cases where freshness isn't critical
- High-volume, cost-sensitive applications
- Offline analysis and reporting

**Examples:**
- Daily churn prediction scores
- Weekly customer segmentation
- Monthly credit risk assessments
- Content recommendation pre-computation

### Implementation Patterns

**1. Scheduled Batch Jobs**
```python
# Daily batch inference
@schedule(daily="02:00")
def daily_churn_prediction():
    customers = get_all_customers()
    predictions = model.predict_batch(customers)
    store_predictions(predictions)
```

**2. Event-Triggered Batch**
```python
# Triggered by data availability
def on_new_data_available():
    new_records = get_new_records_since_last_run()
    predictions = model.predict_batch(new_records)
    update_predictions(predictions)
```

**3. Incremental Batch**
```python
# Process only new/changed records
def incremental_update():
    changed_records = get_changed_since_last_run()
    predictions = model.predict_batch(changed_records)
    update_predictions(predictions)
```

---

## 2.2 Real-Time / Online Inference

### What is Real-Time Inference?

Real-time (online) inference computes predictions on-demand, typically in response to user requests or events.

**Architecture:**
```
Request → Feature Extraction → Model Inference → Response
```

### Characteristics

**Pros:**
- **Fresh predictions:** Always up-to-date
- **Low latency:** Milliseconds to seconds
- **Adaptive:** Can use real-time context
- **No storage overhead:** Compute on-demand

**Cons:**
- **Higher cost:** Per-request compute
- **Latency constraints:** Must be fast
- **Throughput limits:** Limited by compute capacity
- **Model complexity:** Must optimize for speed

### When to Use Real-Time Inference

**Ideal for:**
- Predictions that depend on real-time context
- Low-latency requirements (< 100ms)
- Dynamic, per-request scenarios
- User-facing applications

**Examples:**
- Fraud detection during transaction
- Dynamic pricing in e-commerce
- Real-time ad bidding
- Search result ranking

### Implementation Patterns

**1. Synchronous Serving**
```python
# Request-response pattern
@app.route("/predict", methods=["POST"])
def predict():
    features = extract_features(request.json)
    prediction = model.predict(features)
    return {"prediction": prediction}
```

**2. Asynchronous Serving**
```python
# Fire-and-forget with callback
@app.route("/predict-async", methods=["POST"])
def predict_async():
    job_id = queue_prediction(request.json)
    return {"job_id": job_id}

@app.route("/predictions/<job_id>")
def get_prediction(job_id):
    return get_prediction_result(job_id)
```

**3. Streaming Inference**
```python
# Continuous stream processing
def process_stream():
    for event in event_stream:
        prediction = model.predict(event)
        emit_prediction(prediction)
```

---

## 2.3 Synchronous vs Asynchronous Serving

### Synchronous Serving

**Pattern:**
```
Client → Request → Wait → Response
```

**Characteristics:**
- Client waits for prediction
- Simple request-response model
- Latency directly impacts user experience
- Must meet strict latency SLAs

**Use Cases:**
- User-facing applications
- Interactive systems
- Real-time decision making
- Low-latency requirements (< 500ms)

**Example:**
```python
# Synchronous fraud detection
def process_payment(transaction):
    fraud_score = fraud_model.predict(transaction)
    if fraud_score > threshold:
        reject_transaction()
    else:
        approve_transaction()
```

### Asynchronous Serving

**Pattern:**
```
Client → Request → Job ID → [Poll/Callback] → Result
```

**Characteristics:**
- Client doesn't wait
- Job queuing and processing
- Can handle longer processing times
- Better for batch-like operations

**Use Cases:**
- Long-running predictions
- Background processing
- High-throughput scenarios
- When latency isn't critical

**Example:**
```python
# Asynchronous document analysis
def analyze_document(document_id):
    job_id = queue_document_analysis(document_id)
    return {"job_id": job_id, "status": "processing"}

def get_analysis_result(job_id):
    return get_job_result(job_id)
```

### Choosing Between Sync and Async

**Use Synchronous When:**
- User is waiting for result
- Latency < 1 second acceptable
- Simple request-response fits
- Real-time decision needed

**Use Asynchronous When:**
- Processing takes > 1 second
- User doesn't need immediate result
- Can batch multiple requests
- Background processing acceptable

---

## 2.4 Edge vs Cloud Inference (Conceptual)

### Cloud Inference

**Architecture:**
```
Device → Network → Cloud ML Service → Prediction → Device
```

**Characteristics:**
- Models run in cloud infrastructure
- Requires network connectivity
- Centralized model updates
- Higher latency (network round-trip)

**Pros:**
- No device resource constraints
- Easy model updates
- Centralized monitoring
- Can use large, complex models

**Cons:**
- Network dependency
- Latency from network
- Privacy concerns (data leaves device)
- Cost per request

### Edge Inference

**Architecture:**
```
Device → On-Device Model → Prediction
```

**Characteristics:**
- Models run on device
- No network required
- Local processing
- Ultra-low latency

**Pros:**
- No network latency
- Works offline
- Privacy (data stays local)
- No per-request cost

**Cons:**
- Device resource limits
- Model update complexity
- Limited model complexity
- Device compatibility

### Hybrid Approach

**Architecture:**
```
Device → [Simple Model on Edge] → [Complex Model in Cloud] → Result
```

**Pattern:**
- Use edge for fast, simple predictions
- Fallback to cloud for complex cases
- Sync models periodically

---

## 2.5 Choosing Serving Patterns Based on Business SLAs

### SLA-Driven Design

**Key Questions:**
1. What is the acceptable latency?
2. How fresh must predictions be?
3. What is the expected throughput?
4. What is the cost budget?
5. What is the reliability requirement?

### Decision Framework

**Latency Requirements:**

| Latency | Pattern | Example |
|---------|---------|---------|
| < 10ms | Edge inference | Voice assistants |
| 10-100ms | Real-time cloud | Fraud detection |
| 100ms-1s | Real-time with caching | Recommendations |
| 1s-1min | Async real-time | Document analysis |
| > 1min | Batch | Analytics reports |

**Freshness Requirements:**

| Freshness | Pattern | Example |
|-----------|---------|---------|
| Real-time | Online inference | Dynamic pricing |
| Minutes | Hybrid (cache + refresh) | News ranking |
| Hours | Batch with frequent updates | Recommendations |
| Days | Batch | Credit scores |

**Throughput Requirements:**

| Throughput | Pattern | Example |
|------------|---------|---------|
| Low (< 100 req/s) | Real-time | Fraud detection |
| Medium (100-10k req/s) | Real-time + caching | Search ranking |
| High (> 10k req/s) | Batch + lookup | Recommendations |

---

## Hands-On Exercise: Design Serving Architectures

### Exercise 1: Churn Prediction

**Requirements:**
- Predict customer churn probability
- Used by customer success team
- Updated daily acceptable
- 10M customers

**Design:**
- **Pattern:** Batch inference
- **Schedule:** Daily at 2 AM
- **Storage:** Database with customer_id → churn_score
- **Serving:** REST API lookup
- **Refresh:** Incremental updates for changed customers

### Exercise 2: Fraud Detection

**Requirements:**
- Real-time fraud scoring during transactions
- < 100ms latency requirement
- 1000 transactions/second peak
- Must work even if model service is down

**Design:**
- **Pattern:** Real-time synchronous with fallback
- **Architecture:** 
  - Primary: Real-time model service
  - Fallback: Rule-based system
  - Caching: Recent transaction patterns
- **Reliability:** Circuit breaker, health checks
- **Monitoring:** Latency, error rate, fraud rate

### Exercise 3: Recommendation Ranking

**Requirements:**
- Rank products for user
- < 500ms latency
- Personalize based on real-time behavior
- 100k products, 1M users

**Design:**
- **Pattern:** Hybrid (batch + real-time)
- **Architecture:**
  - Batch: Pre-compute base scores (daily)
  - Real-time: Adjust for session context
  - Cache: User preferences, recent views
- **Serving:** Merge batch scores + real-time adjustments

---

## Module Summary

### Key Takeaways

- **Batch vs Real-time:**: Choose based on latency, freshness, and cost requirements
- **Sync vs Async:**: Match to user expectations and processing time
- **Edge vs Cloud:**: Balance latency, privacy, and complexity
- **SLA-driven design:**: Start with business requirements, then choose pattern

### Next Steps

- **Complete The**: Complete the serving architecture exercises
- **Review Serving**: Review serving patterns in production systems
- **Move To**: Move to Module 3 to learn about feature stores and pipelines

---

## Exercises

1. **Pattern Selection:** For each use case, choose the serving pattern and justify:
   - Email spam detection
   - Stock price prediction
   - Image classification API
   - Customer lifetime value

2. **Architecture Design:** Design complete serving architectures for:
   - Real-time ad targeting (10ms latency, 100k req/s)
   - Batch content moderation (daily, 1M items)
   - Hybrid news ranking (batch + real-time personalization)

3. **SLA Analysis:** Define SLAs for your serving architecture:
   - Latency (P50, P95, P99)
   - Throughput (req/s)
   - Availability (uptime %)
   - Cost per prediction
