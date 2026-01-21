---
title: "Module 5: Observability & Data Quality"
description: "Trust through visibility"
module: "5"
order: 5
email_takeaway: "Observability isn't optional—it's how you build trust. Data quality issues caught early save time and prevent bad decisions."
email_action: "List your top 3 data quality issues. How would you detect them automatically? What would you alert on?"
---

# Module 5: Observability & Data Quality

**Duration:** Week 5  
**Theme:** *Trust through visibility*

**Learning Objectives:**
- **Observability Layers:**: Understand observability layers: data, pipelines, and usage
- **freshness, completeness, and accuracy checks Understanding**: Learn freshness, completeness, and accuracy checks
- **schema drift and anomaly detection Understanding**: Master schema drift and anomaly detection
- **SLAs, SLOs, and alerting strategies Development**: Design SLAs, SLOs, and alerting strategies
- **incident response for data failures Implementation**: Implement incident response for data failures

---

## 5.1 Observability Layers: Data, Pipelines, and Usage

### What is Observability?

**Definition:** Ability to understand the internal state of a system by examining its outputs (logs, metrics, traces).

**Three Pillars:**
- **Metrics:** Quantitative measurements over time
- **Logs:** Discrete events and records
- **Traces:** Request flows through systems

### Observability in Data Platforms

Data platforms require observability across three layers:

#### 1. Data Observability

**What to Observe:**
- Data freshness
- Data volume
- Data quality metrics
- Schema changes
- Data lineage

**Metrics:**
- Record counts
- Null percentages
- Value distributions
- Schema versions
- Update timestamps

**Tools:**
- Great Expectations
- DataHub
- Monte Carlo
- Custom monitoring

#### 2. Pipeline Observability

**What to Observe:**
- Pipeline execution status
- Processing latency
- Throughput
- Error rates
- Resource utilization

**Metrics:**
- Job success/failure rates
- Execution duration
- Records processed
- Error counts
- CPU/memory usage

**Tools:**
- Airflow monitoring
- Spark UI
- Custom dashboards
- APM tools

#### 3. Usage Observability

**What to Observe:**
- Query patterns
- User activity
- Resource consumption
- Cost attribution
- Performance trends

**Metrics:**
- Query counts
- Active users
- Query latency
- Data scanned
- Cost per query

**Tools:**
- Query logs
- Usage analytics
- Cost monitoring
- Performance dashboards

### Observability Architecture

```
┌─────────────────────────────────────────┐
│         Data Platform                    │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │  Data     │  │ Pipeline │  │ Usage  ││
│  │  Layer    │  │  Layer   │  │ Layer  ││
│  └─────┬─────┘  └─────┬────┘  └───┬────┘│
│        │              │            │     │
│        └──────┬───────┴────────────┘     │
│               ▼                          │
│        ┌──────────────┐                 │
│        │ Observability│                 │
│        │   Platform   │                 │
│        └──────┬───────┘                 │
└───────────────┼─────────────────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
┌──────────────┐  ┌──────────────┐
│   Metrics    │  │   Alerts     │
│  Dashboard   │  │   System     │
└──────────────┘  └──────────────┘
```

---

## 5.2 Freshness, Completeness, and Accuracy Checks

### Data Freshness

**Definition:** How current the data is relative to when it should be updated.

#### Freshness Metrics

**Update Latency:**
```python
freshness = current_time - last_update_timestamp
```

**Expected Update Frequency:**
- Real-time: < 5 minutes
- Hourly: < 1 hour
- Daily: < 24 hours
- Weekly: < 7 days

#### Freshness Monitoring

**Implementation:**
```python
def check_freshness(table_name, expected_interval_minutes):
    last_update = get_last_update_time(table_name)
    current_time = datetime.now()
    latency = (current_time - last_update).total_seconds() / 60
    
    if latency > expected_interval_minutes:
        alert(f"Freshness violation: {table_name} is {latency} minutes stale")
```

**Checks:**
- Last update timestamp exists
- Update within expected window
- No gaps in update history
- Consistent update frequency

### Data Completeness

**Definition:** Percentage of expected data that is present.

#### Completeness Metrics

**Record Count Completeness:**
```python
expected_count = get_expected_record_count(date)
actual_count = get_actual_record_count(date)
completeness = actual_count / expected_count
```

**Field Completeness:**
```python
null_percentage = (null_count / total_count) * 100
completeness = 100 - null_percentage
```

#### Completeness Checks

**Volume Checks:**
- Record count within expected range
- No sudden drops in volume
- Consistent volume over time

**Field Checks:**
- Required fields not null
- Null percentage within threshold
- Missing value patterns

**Implementation:**
```python
def check_completeness(table, date):
    expected_count = get_historical_average(table, date)
    actual_count = get_record_count(table, date)
    
    if actual_count < expected_count * 0.9:  # 10% threshold
        alert(f"Completeness violation: {table} has {actual_count} records, expected ~{expected_count}")
```

### Data Accuracy

**Definition:** Correctness of data values.

#### Accuracy Metrics

**Value Range Checks:**
```python
def check_value_range(column, min_value, max_value):
    violations = query(f"SELECT COUNT(*) FROM table WHERE {column} < {min_value} OR {column} > {max_value}")
    if violations > 0:
        alert(f"Value range violation: {violations} records outside [{min_value}, {max_value}]")
```

**Referential Integrity:**
```python
def check_referential_integrity(child_table, parent_table, foreign_key):
    orphans = query(f"""
        SELECT COUNT(*) FROM {child_table} c
        LEFT JOIN {parent_table} p ON c.{foreign_key} = p.id
        WHERE p.id IS NULL
    """)
    if orphans > 0:
        alert(f"Referential integrity violation: {orphans} orphaned records")
```

**Business Rule Validation:**
```python
def check_business_rules():
    # Example: order total should equal sum of line items
    violations = query("""
        SELECT order_id FROM orders o
        WHERE o.total != (
            SELECT SUM(price * quantity) FROM line_items
            WHERE order_id = o.id
        )
    """)
    if len(violations) > 0:
        alert(f"Business rule violation: {len(violations)} orders with incorrect totals")
```

#### Accuracy Checks

**Type Checks:**
- Data types match schema
- Format validation (emails, dates, etc.)
- Encoding validation

**Constraint Checks:**
- Unique constraints
- Foreign key constraints
- Check constraints

**Business Logic Checks:**
- Calculated fields correct
- Relationships valid
- State transitions valid

---

## 5.3 Schema Drift and Anomaly Detection

### Schema Drift

**Definition:** Unplanned changes to data schema that break downstream systems.

#### Types of Schema Drift

**1. Column Addition**
```python
# Old schema
schema = {
    'user_id': 'string',
    'email': 'string'
}

# New schema (column added)
schema = {
    'user_id': 'string',
    'email': 'string',
    'phone': 'string'  # New column
}
```

**2. Column Removal**
```python
# Old schema
schema = {
    'user_id': 'string',
    'email': 'string',
    'phone': 'string'
}

# New schema (column removed)
schema = {
    'user_id': 'string',
    'email': 'string'
    # phone removed
}
```

**3. Type Changes**
```python
# Old schema
schema = {
    'user_id': 'string',
    'age': 'integer'
}

# New schema (type changed)
schema = {
    'user_id': 'string',
    'age': 'string'  # Changed from integer
}
```

#### Schema Drift Detection

**Implementation:**
```python
def detect_schema_drift(expected_schema, actual_schema):
    drift = {
        'added_columns': [],
        'removed_columns': [],
        'type_changes': []
    }
    
    # Check for added columns
    for col in actual_schema:
        if col not in expected_schema:
            drift['added_columns'].append(col)
    
    # Check for removed columns
    for col in expected_schema:
        if col not in actual_schema:
            drift['removed_columns'].append(col)
    
    # Check for type changes
    for col in expected_schema:
        if col in actual_schema:
            if expected_schema[col] != actual_schema[col]:
                drift['type_changes'].append({
                    'column': col,
                    'old_type': expected_schema[col],
                    'new_type': actual_schema[col]
                })
    
    return drift
```

**Handling Strategies:**
- **Strict:** Fail pipeline on any drift
- **Warn:** Alert but continue processing
- **Flexible:** Auto-adapt to schema changes
- **Versioned:** Track schema versions explicitly

### Anomaly Detection

**Definition:** Identifying unusual patterns in data that may indicate issues.

#### Statistical Anomaly Detection

**Z-Score Method:**
```python
def detect_anomalies_zscore(series, threshold=3):
    mean = series.mean()
    std = series.std()
    z_scores = (series - mean) / std
    anomalies = series[abs(z_scores) > threshold]
    return anomalies
```

**IQR Method:**
```python
def detect_anomalies_iqr(series):
    Q1 = series.quantile(0.25)
    Q3 = series.quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    anomalies = series[(series < lower_bound) | (series > upper_bound)]
    return anomalies
```

#### Time-Series Anomaly Detection

**Moving Average:**
```python
def detect_anomalies_ma(series, window=7, threshold=2):
    ma = series.rolling(window=window).mean()
    std = series.rolling(window=window).std()
    upper_bound = ma + threshold * std
    lower_bound = ma - threshold * std
    anomalies = series[(series < lower_bound) | (series > upper_bound)]
    return anomalies
```

**Seasonal Decomposition:**
```python
from statsmodels.tsa.seasonal import seasonal_decompose

def detect_anomalies_seasonal(series):
    decomposition = seasonal_decompose(series, model='additive', period=7)
    residual = decomposition.resid
    anomalies = residual[abs(residual) > 2 * residual.std()]
    return anomalies
```

#### ML-Based Anomaly Detection

**Isolation Forest:**
```python
from sklearn.ensemble import IsolationForest

def detect_anomalies_isolation_forest(data):
    model = IsolationForest(contamination=0.1)
    predictions = model.fit_predict(data)
    anomalies = data[predictions == -1]
    return anomalies
```

**Autoencoders:**
```python
# Train autoencoder on normal data
# High reconstruction error = anomaly
```

#### Anomaly Detection Use Cases

**Volume Anomalies:**
- Sudden drop in record count
- Unexpected spike in volume
- Missing data periods

**Value Anomalies:**
- Outliers in numeric fields
- Unusual distributions
- Unexpected null patterns

**Pattern Anomalies:**
- Changes in data distribution
- Shifts in trends
- Seasonal pattern breaks

---

## 5.4 SLAs, SLOs, and Alerting Strategies

### Service Level Agreements (SLAs)

**Definition:** Contractual commitments about service quality.

**Components:**
- **Availability:** Uptime percentage (e.g., 99.9%)
- **Latency:** Maximum acceptable latency (e.g., < 5 seconds)
- **Freshness:** Maximum data staleness (e.g., < 1 hour)
- **Accuracy:** Maximum error rate (e.g., < 0.1%)

**Example SLA:**
```
Data Pipeline SLA:
- Availability: 99.9% (8.76 hours downtime/year)
- Freshness: Data updated within 1 hour of source
- Accuracy: < 0.1% data quality issues
- Latency: Pipeline completes within 2 hours
```

### Service Level Objectives (SLOs)

**Definition:** Internal targets that support SLAs.

**Difference from SLA:**
- **SLO:** Internal target (e.g., 99.95% availability)
- **SLA:** External commitment (e.g., 99.9% availability)
- SLO is typically higher than SLA (buffer)

**Example SLO:**
```
Data Pipeline SLO:
- Availability: 99.95% (internal target)
- Freshness: Data updated within 30 minutes (internal target)
- Accuracy: < 0.05% data quality issues (internal target)
```

### Service Level Indicators (SLIs)

**Definition:** Measured metrics that indicate service quality.

**Examples:**
- Error rate
- Latency (p50, p95, p99)
- Availability
- Throughput

**Implementation:**
```python
def calculate_sli(metric_name, time_window):
    # Calculate SLI for given metric
    if metric_name == 'availability':
        return calculate_availability(time_window)
    elif metric_name == 'latency':
        return calculate_latency_percentiles(time_window)
    elif metric_name == 'error_rate':
        return calculate_error_rate(time_window)
```

### Alerting Strategies

#### Alert Levels

**Critical (P0):**
- Service completely down
- Data corruption
- Security breach
- Immediate action required

**High (P1):**
- SLA violation
- Significant data quality issues
- Performance degradation
- Action required within hours

**Medium (P2):**
- SLO violation (but SLA met)
- Minor data quality issues
- Performance concerns
- Action required within days

**Low (P3):**
- Informational
- Trends to watch
- Non-urgent issues
- Action required within weeks

#### Alert Design Principles

**1. Actionable Alerts**
- Clear what's wrong
- Clear what to do
- Include context and links

**2. Avoid Alert Fatigue**
- Don't alert on noise
- Use thresholds appropriately
- Group related alerts
- Use alerting windows

**3. Context-Rich Alerts**
```python
alert = {
    'severity': 'high',
    'title': 'Data Freshness Violation',
    'description': 'Orders table is 2 hours stale',
    'metric': 'freshness',
    'current_value': '2 hours',
    'threshold': '1 hour',
    'impact': 'Dashboard showing outdated data',
    'runbook_link': 'https://...',
    'dashboard_link': 'https://...'
}
```

**4. Alert Routing**
- Route to appropriate team
- Escalate based on severity
- Include on-call rotation
- Use multiple channels (email, Slack, PagerDuty)

#### Alert Implementation

**Threshold-Based:**
```python
def check_threshold(metric, threshold, operator='>'):
    if operator == '>':
        if metric > threshold:
            alert('Metric exceeded threshold')
    elif operator == '<':
        if metric < threshold:
            alert('Metric below threshold')
```

**Rate of Change:**
```python
def check_rate_of_change(metric, max_change_percent=50):
    current = get_current_value(metric)
    previous = get_previous_value(metric)
    change = abs((current - previous) / previous * 100)
    if change > max_change_percent:
        alert(f'Metric changed by {change}%')
```

**Anomaly-Based:**
```python
def check_anomaly(metric):
    if is_anomaly(metric):
        alert(f'Anomaly detected in {metric}')
```

---

## 5.5 Incident Response for Data Failures

### Incident Response Process

#### 1. Detection

**Sources:**
- Automated alerts
- User reports
- Monitoring dashboards
- Health checks

**Detection Time:**
- Real-time: < 1 minute
- Near real-time: < 5 minutes
- Batch: < 1 hour

#### 2. Triage

**Assess Impact:**
- How many users affected?
- What data is affected?
- What's the business impact?
- Is it getting worse?

**Classify Severity:**
- P0: Critical, immediate action
- P1: High, action within hours
- P2: Medium, action within days
- P3: Low, action within weeks

#### 3. Response

**Immediate Actions:**
- Acknowledge incident
- Assemble response team
- Start incident channel/meeting
- Document timeline

**Investigation:**
- Review logs and metrics
- Identify root cause
- Assess scope of impact
- Plan remediation

#### 4. Resolution

**Fix Strategy:**
- Immediate fix (if possible)
- Workaround (if needed)
- Long-term fix (follow-up)

**Verification:**
- Confirm fix works
- Verify data quality
- Check downstream systems
- Monitor for recurrence

#### 5. Post-Incident

**Post-Mortem:**
- What happened?
- Why did it happen?
- What did we learn?
- How do we prevent it?

**Action Items:**
- Fix root cause
- Improve monitoring
- Update runbooks
- Train team

### Common Data Failure Scenarios

#### Scenario 1: Pipeline Failure

**Symptoms:**
- Pipeline job failed
- No new data in destination
- Alerts firing

**Response:**
1. Check pipeline logs
2. Identify failure point
3. Fix issue or rollback
4. Restart pipeline
5. Verify data quality

#### Scenario 2: Data Quality Issue

**Symptoms:**
- Data quality checks failing
- User reports incorrect data
- Anomalies detected

**Response:**
1. Identify affected data
2. Assess scope and impact
3. Fix source or transformation
4. Backfill corrected data
5. Verify fix

#### Scenario 3: Schema Drift

**Symptoms:**
- Schema validation failures
- Downstream errors
- Unexpected columns/types

**Response:**
1. Identify schema change
2. Assess impact
3. Update schema or rollback source
4. Fix downstream systems
5. Add schema validation

#### Scenario 4: Performance Degradation

**Symptoms:**
- Slow queries
- Pipeline delays
- Timeout errors

**Response:**
1. Identify bottleneck
2. Check resource utilization
3. Optimize or scale
4. Monitor improvement
5. Document learnings

### Incident Response Tools

**Communication:**
- Slack channels
- Incident management (PagerDuty, Opsgenie)
- Video calls

**Documentation:**
- Incident runbooks
- Post-mortem templates
- Knowledge base

**Monitoring:**
- Dashboards
- Alerting systems
- Log aggregation

---

## Hands-On Exercise: Define Data Quality Metrics and Alerting

### Objective

Define data quality metrics and alerting for critical datasets.

### Scenario

You're designing observability for a data platform with:
- Orders table (critical, updated hourly)
- Users table (critical, updated daily)
- Products table (important, updated daily)
- Analytics tables (important, updated daily)

### Exercise Steps

1. **Define Quality Metrics**
   - For each table, define:
     - Freshness requirements
     - Completeness checks
     - Accuracy checks
     - Schema validation

2. **Design Monitoring**
   - Choose monitoring tools
   - Design metric collection
   - Plan dashboard layout

3. **Define SLAs/SLOs**
   - Set availability targets
   - Set freshness targets
   - Set accuracy targets

4. **Design Alerting**
   - Define alert levels
   - Set thresholds
   - Plan alert routing
   - Design alert messages

5. **Design Incident Response**
   - Create runbooks
   - Define escalation paths
   - Plan communication

### Deliverable

An observability framework that includes:
- Quality metrics definition
- Monitoring architecture
- SLA/SLO definitions
- Alerting strategy
- Incident response procedures
- Dashboard mockups

---

## Module Summary

### Key Takeaways

- **Observability**: Requires monitoring data, pipelines, and usage
- **Data quality**: Checks (freshness, completeness, accuracy) are essential
- **Schema drift and anomaly detection**: Catch issues early
- **SLAs, SLOs, and alerting**: Provide structure for reliability
- **Incident response**: Processes ensure quick resolution

### Next Steps

In Module 6, we'll learn how to implement governance, security, and access control that enables scale without chaos.

---

## Additional Resources

- Great Expectations documentation
- DataHub documentation
- "Site Reliability Engineering" by Google
- "Observability Engineering" by Charity Majors
