---
title: "Module 3: Batch & Streaming Data Pipelines"
description: "Moving data reliably"
module: "3"
order: 3
email_takeaway: "Batch handles comprehensive processing, streaming handles real-time. Most platforms need both, orchestrated together."
email_action: "Map your data sources: which need real-time processing vs batch? What are your latency requirements?"
---

# Module 3: Batch & Streaming Data Pipelines

**Duration:** Week 3  
**Theme:** *Moving data reliably*

**Learning Objectives:**
- Understand batch processing fundamentals
- Learn streaming architectures and use cases
- Differentiate event-driven vs micro-batch systems
- Master data freshness, SLAs, and failure handling
- Design backfill and replay strategies

---

## 3.1 Batch Processing Fundamentals

### What is Batch Processing?

**Batch processing** is the execution of data processing jobs on large volumes of data at scheduled intervals. Data is collected over a period, then processed together as a group.

### Characteristics of Batch Processing

- **Scheduled Execution:** Runs at fixed intervals (hourly, daily, weekly)
- **Large Volumes:** Processes accumulated data efficiently
- **Comprehensive Processing:** Can perform complex transformations
- **Cost Effective:** Optimized for throughput over latency
- **Reliable:** Easier to handle failures and retries

### When to Use Batch Processing

**Ideal For:**
- Historical data processing
- Complex transformations requiring full data scans
- Cost-sensitive workloads
- Data that doesn't need real-time updates
- Reporting and analytics
- Data warehouse loads

**Examples:**
- Daily sales reporting
- Monthly financial reconciliations
- Customer segmentation analysis
- Historical data backfills
- ML model training data preparation

### Batch Processing Patterns

#### Extract, Transform, Load (ETL)

**Pattern:** Transform data before loading into destination

```
Source → Transform → Load → Destination
```

**Use Cases:**
- Data warehouse loads
- Complex transformations needed
- Data quality enforcement required

**Advantages:**
- Data quality enforced before storage
- Optimized storage format
- Better query performance

**Disadvantages:**
- Slower time to data
- Requires transformation compute

#### Extract, Load, Transform (ELT)

**Pattern:** Load raw data first, transform in destination

```
Source → Load → Transform → Destination
```

**Use Cases:**
- Modern cloud data warehouses
- Flexible transformation needs
- Faster time to data

**Advantages:**
- Faster initial load
- Flexibility in transformations
- Leverages warehouse compute

**Disadvantages:**
- Stores raw data (higher storage cost)
- Transformations run on expensive compute

### Batch Processing Architecture

```
┌─────────────┐
│ Data Sources │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Batch Scheduler │
│  (Airflow, etc.) │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  ETL/ELT Engine  │
│  (Spark, etc.)   │
└──────┬──────────┘
       │
       ▼
┌─────────────┐
│ Destination  │
└─────────────┘
```

### Batch Processing Tools

#### Orchestration
- **Apache Airflow:** Workflow orchestration
- **Prefect:** Modern workflow engine
- **Dagster:** Data-aware orchestration
- **Temporal:** Durable execution engine

#### Processing
- **Apache Spark:** Distributed batch processing
- **dbt:** SQL-based transformations
- **Pandas:** Python data processing
- **BigQuery/Redshift:** SQL-based processing

---

## 3.2 Streaming Architectures and Use Cases

### What is Streaming Processing?

**Streaming processing** handles data continuously as it arrives, processing events in real-time or near-real-time.

### Characteristics of Streaming Processing

- **Continuous Processing:** Data processed as it arrives
- **Low Latency:** Sub-second to minute latency
- **Event-Driven:** Responds to events immediately
- **Stateful:** Can maintain state across events
- **Scalable:** Handles high throughput

### When to Use Streaming Processing

**Ideal For:**
- Real-time analytics and monitoring
- Fraud detection
- Recommendation systems
- Real-time personalization
- IoT data processing
- Event-driven applications

**Examples:**
- Real-time dashboard updates
- Fraud detection alerts
- Real-time inventory updates
- Live user activity tracking
- Real-time pricing updates

### Streaming Architecture Patterns

#### Lambda Architecture

**Pattern:** Combine batch and streaming layers

```
┌─────────────┐
│  Data Source │
└──────┬──────┘
       │
   ┌───┴───┐
   ▼       ▼
┌──────┐ ┌──────────┐
│Batch │ │ Streaming│
│Layer │ │  Layer   │
└───┬──┘ └────┬─────┘
    │         │
    └────┬────┘
         ▼
  ┌──────────┐
  │ Serving  │
  │  Layer   │
  └──────────┘
```

**Benefits:**
- Comprehensive batch processing
- Real-time streaming processing
- Fault tolerance

**Challenges:**
- Complexity of maintaining two systems
- Merging batch and streaming results

#### Kappa Architecture

**Pattern:** Single streaming pipeline for all processing

```
┌─────────────┐
│  Data Source │
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ Streaming    │
│  Pipeline    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Serving    │
│    Layer     │
└──────────────┘
```

**Benefits:**
- Simpler architecture
- Single codebase
- Real-time by default

**Challenges:**
- Reprocessing historical data
- Complex state management

### Streaming Processing Models

#### At-Least-Once Processing

**Guarantee:** Each event processed at least once (may process duplicates)

**Use Cases:**
- Analytics where duplicates are acceptable
- Idempotent operations
- Cost-sensitive applications

**Implementation:**
- Simple acknowledgment
- Retry on failure
- Accept duplicates

#### Exactly-Once Processing

**Guarantee:** Each event processed exactly once

**Use Cases:**
- Financial transactions
- Counting operations
- Critical business logic

**Implementation:**
- Idempotent operations
- Transactional processing
- Deduplication

#### At-Most-Once Processing

**Guarantee:** Each event processed at most once (may lose events)

**Use Cases:**
- Best-effort processing
- Non-critical data
- High-throughput, low-latency needs

### Streaming Tools

#### Stream Processing Engines
- **Apache Kafka Streams:** Library for stream processing
- **Apache Flink:** Distributed stream processing
- **Apache Spark Streaming:** Micro-batch processing
- **Kafka Connect:** Data integration

#### Message Queues
- **Apache Kafka:** Distributed event streaming
- **Amazon Kinesis:** Managed streaming
- **Google Pub/Sub:** Managed messaging
- **RabbitMQ:** Message broker

---

## 3.3 Event-Driven vs Micro-Batch Systems

### Event-Driven Systems

**Definition:** Process each event individually as it arrives

**Characteristics:**
- True real-time processing
- Event-by-event processing
- Low latency (milliseconds)
- Higher overhead per event

**Architecture:**
```
Event → Process → Output
```

**Use Cases:**
- Real-time fraud detection
- Real-time recommendations
- Real-time alerts
- Low-latency requirements

**Advantages:**
- Lowest latency
- True real-time
- Event-level granularity

**Disadvantages:**
- Higher overhead
- More complex state management
- Harder to optimize

### Micro-Batch Systems

**Definition:** Process events in small batches at frequent intervals

**Characteristics:**
- Near real-time processing
- Batch processing at small intervals (seconds to minutes)
- Lower latency than batch, higher than event-driven
- Better throughput optimization

**Architecture:**
```
Events → Buffer → Batch Process → Output
  (every N seconds)
```

**Use Cases:**
- Real-time dashboards
- Real-time analytics
- Near real-time updates
- Balanced latency/throughput needs

**Advantages:**
- Good latency/throughput balance
- Easier to optimize
- Better resource utilization

**Disadvantages:**
- Not true real-time
- Slight latency overhead
- Batch boundaries

### Comparison

| Characteristic | Event-Driven | Micro-Batch |
|---------------|--------------|-------------|
| **Latency** | Milliseconds | Seconds to minutes |
| **Throughput** | Lower per event | Higher overall |
| **Complexity** | Higher | Lower |
| **Use Case** | True real-time | Near real-time |
| **Examples** | Flink, Kafka Streams | Spark Streaming |

### Choosing the Right Approach

**Choose Event-Driven If:**
- Latency is critical (< 1 second)
- Processing is simple per event
- State management is manageable
- Real-time response required

**Choose Micro-Batch If:**
- Near real-time is acceptable (seconds to minutes)
- Need better throughput
- Complex processing per event
- Cost optimization important

---

## 3.4 Data Freshness, SLAs, and Failure Handling

### Data Freshness

**Definition:** How current the data is relative to when it was generated

### Freshness Requirements by Use Case

| Use Case | Freshness Requirement | Example |
|----------|----------------------|---------|
| **Real-time Monitoring** | Seconds | System alerts |
| **Dashboards** | Minutes to hours | Business metrics |
| **Reporting** | Hours to days | Financial reports |
| **Analytics** | Days | Historical analysis |
| **ML Training** | Days to weeks | Model retraining |

### Measuring Data Freshness

**Metrics:**
- **End-to-End Latency:** Time from source event to destination
- **Processing Lag:** Time data spends in processing
- **SLA Compliance:** Percentage of time meeting freshness SLA

**Monitoring:**
```python
# Example freshness monitoring
def check_freshness(table, expected_latency_minutes):
    latest_timestamp = get_latest_timestamp(table)
    current_time = datetime.now()
    latency = (current_time - latest_timestamp).total_seconds() / 60
    
    if latency > expected_latency_minutes:
        alert("Data freshness SLA violated")
```

### Service Level Agreements (SLAs)

**Definition:** Commitments about data freshness and availability

**Components:**
- **Freshness SLA:** Maximum acceptable latency
- **Availability SLA:** Uptime percentage
- **Accuracy SLA:** Data quality requirements

**Example SLAs:**
- **Real-time Pipeline:** 99.9% availability, < 5 second latency
- **Batch Pipeline:** 99% availability, < 1 hour latency
- **Analytics Pipeline:** 95% availability, < 24 hour latency

### Failure Handling Strategies

#### Retry Strategies

**Exponential Backoff:**
```python
def retry_with_backoff(func, max_retries=3):
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            wait_time = 2 ** attempt
            time.sleep(wait_time)
```

**Retry Policies:**
- **Transient Errors:** Retry with backoff
- **Permanent Errors:** Fail fast, alert
- **Rate Limiting:** Exponential backoff
- **Timeout Errors:** Retry with timeout increase

#### Dead Letter Queues (DLQ)

**Pattern:** Route failed messages to separate queue for investigation

**Benefits:**
- Don't lose failed messages
- Can reprocess after fixing
- Enables analysis of failure patterns

**Implementation:**
```
Source → Process → Success
              ↓
         Failure → DLQ → Manual Review
```

#### Checkpointing

**Pattern:** Save processing state periodically

**Benefits:**
- Resume from last checkpoint on failure
- Avoid reprocessing all data
- Faster recovery

**Implementation:**
- Save offsets/watermarks
- Periodic checkpoint writes
- Recovery from last checkpoint

#### Circuit Breakers

**Pattern:** Stop calling failing service to prevent cascade failures

**States:**
- **Closed:** Normal operation
- **Open:** Failing, don't call
- **Half-Open:** Testing if service recovered

**Benefits:**
- Prevents cascade failures
- Faster failure detection
- Automatic recovery

---

## 3.5 Backfills and Replay Strategies

### What are Backfills?

**Definition:** Reprocessing historical data, typically after:
- Pipeline fixes
- Schema changes
- New data requirements
- Data quality issues

### Backfill Strategies

#### Full Backfill

**Pattern:** Reprocess all historical data

**Use Cases:**
- Major schema changes
- Complete data transformation changes
- Initial data load

**Considerations:**
- Time-consuming
- Resource-intensive
- May impact production workloads

#### Incremental Backfill

**Pattern:** Reprocess data from specific point forward

**Use Cases:**
- Recent pipeline fixes
- Limited scope changes
- Faster backfills

**Considerations:**
- Requires checkpoint/watermark tracking
- May miss some data
- Faster execution

#### Selective Backfill

**Pattern:** Reprocess specific data subsets

**Use Cases:**
- Fixing specific data issues
- Testing transformations
- Limited scope changes

**Considerations:**
- Requires filtering capability
- More complex orchestration
- Precise targeting

### Replay Strategies

#### Time-Based Replay

**Pattern:** Replay events from specific time range

**Implementation:**
```python
# Replay events from last 24 hours
start_time = datetime.now() - timedelta(days=1)
replay_events(start_time, datetime.now())
```

**Use Cases:**
- Recent data issues
- Testing pipeline changes
- Recovery from failures

#### Offset-Based Replay

**Pattern:** Replay from specific message offset

**Implementation:**
```python
# Replay from offset 1000
consumer.seek(topic, partition, offset=1000)
```

**Use Cases:**
- Precise replay points
- Kafka-based systems
- Message-level replay

#### Event ID-Based Replay

**Pattern:** Replay specific events by ID

**Use Cases:**
- Fixing specific records
- Testing individual events
- Selective reprocessing

### Backfill Best Practices

1. **Plan for Backfills**
   - Design pipelines to support replay
   - Maintain event timestamps
   - Keep raw data available

2. **Resource Management**
   - Use separate compute for backfills
   - Throttle to avoid impacting production
   - Monitor resource usage

3. **Idempotency**
   - Design transformations to be idempotent
   - Handle duplicates gracefully
   - Use upsert patterns

4. **Monitoring**
   - Track backfill progress
   - Monitor for errors
   - Alert on completion/failure

5. **Documentation**
   - Document backfill procedures
   - Maintain runbooks
   - Track backfill history

---

## Hands-On Exercise: Design a Hybrid Batch + Streaming Pipeline

### Objective

Design a pipeline that meets latency and reliability requirements for a real use case.

### Scenario

You're designing a pipeline for an e-commerce platform that needs:
- Real-time inventory updates (< 5 seconds)
- Daily sales reporting (batch, < 1 hour after day end)
- Real-time fraud detection (< 1 second)
- Historical analytics (batch, daily)

Data sources:
- Order events (streaming)
- Inventory updates (streaming)
- Product catalog (batch updates, daily)
- Customer data (batch updates, hourly)

### Exercise Steps

1. **Analyze Requirements**
   - Map use cases to latency requirements
   - Identify data sources and frequencies
   - Determine processing complexity

2. **Design Architecture**
   - Choose batch vs streaming for each use case
   - Design data flow
   - Select tools and technologies

3. **Design Reliability**
   - Define SLAs for each pipeline
   - Design failure handling
   - Plan monitoring and alerting

4. **Design Backfill Strategy**
   - Plan for schema changes
   - Design replay capabilities
   - Plan resource allocation

5. **Optimize for Cost and Performance**
   - Identify optimization opportunities
   - Plan resource allocation
   - Design scaling strategy

### Deliverable

A pipeline design that includes:
- Architecture diagram
- Data flow diagrams
- SLA definitions
- Failure handling procedures
- Backfill and replay strategy
- Cost and performance optimization plan

---

## Module Summary

### Key Takeaways

1. **Batch processing** is ideal for comprehensive, cost-effective processing of large volumes
2. **Streaming processing** enables real-time and near-real-time use cases
3. **Event-driven vs micro-batch** is a trade-off between latency and throughput
4. **SLAs and failure handling** are critical for production pipelines
5. **Backfills and replay** must be designed into pipelines from the start

### Next Steps

In Module 4, we'll learn how to build feature stores and registries that enable ML at scale.

---

## Additional Resources

- "Streaming Systems" by Tyler Akidau
- Apache Kafka documentation
- Apache Flink documentation
- "Designing Data-Intensive Applications" by Martin Kleppmann
