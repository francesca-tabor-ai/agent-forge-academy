---
title: "Module 2: SQL for Analytics & Performance Tracking"
description: "Turning data into answers with production-grade analytical SQL"
module: "2"
order: 2
---

# Module 2: SQL for Analytics & Performance Tracking

**Duration:** Week 2  
**Theme:** *Turning data into answers*

**Learning Objectives:**
- **an analytical SQL mindset (vs transactional SQL) Development**: Develop an analytical SQL mindset (vs transactional SQL)
- **time-based analysis and cohort tracking Understanding**: Master time-based analysis and cohort tracking
- **Perform Funnel**: Apply perform funnel analysis in relevant contexts
- **Use Window**: Use window functions for trends and rankings
- **Avoid Common**: Avoid common SQL pitfalls in analytics

---

## 2.1 Analytical SQL Mindset

### Introduction

Analytical SQL is fundamentally different from transactional SQL. Understanding this difference is crucial for building reliable, performant analytical queries.

### Transactional vs Analytical SQL

**Transactional SQL:**
- Purpose: Update, insert, delete individual records
- Pattern: Small, fast queries on indexed columns
- Focus: Data integrity, ACID compliance
- Example: `UPDATE users SET status = 'active' WHERE id = 123`

**Analytical SQL:**
- Purpose: Aggregate, analyze, and summarize large datasets
- Pattern: Large scans, complex joins, aggregations
- Focus: Insights, trends, patterns
- Example: `SELECT date, COUNT(DISTINCT user_id) FROM events GROUP BY date`

### Key Differences

| Aspect | Transactional | Analytical |
|--------|--------------|------------|
| **Data Volume** | Small (rows) | Large (millions of rows) |
| **Query Pattern** | Point lookups | Full table scans |
| **Index Usage** | Primary keys, foreign keys | Date columns, dimensions |
| **Performance** | Milliseconds | Seconds to minutes |
| **Optimization** | Indexes, constraints | Partitioning, materialization |

### The Analytical SQL Workflow

```
1. Understand the Business Question
   ↓
2. Identify Required Data Sources
   ↓
3. Design Query Structure
   ↓
4. Write and Test Query
   ↓
5. Validate Results
   ↓
6. Optimize for Performance
```

### Common Analytical Patterns

**Pattern 1: Time-Series Analysis**
```sql
SELECT 
  DATE_TRUNC('day', created_at) AS date,
  COUNT(*) AS events
FROM events
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY date
ORDER BY date;
```

**Pattern 2: Cohort Analysis**
```sql
SELECT 
  cohort_month,
  months_since_signup,
  COUNT(DISTINCT user_id) AS users
FROM user_cohorts
GROUP BY cohort_month, months_since_signup;
```

**Pattern 3: Funnel Analysis**
```sql
WITH funnel_steps AS (
  SELECT 
    user_id,
    MAX(CASE WHEN event = 'viewed_product' THEN 1 ELSE 0 END) AS viewed,
    MAX(CASE WHEN event = 'added_to_cart' THEN 1 ELSE 0 END) AS added,
    MAX(CASE WHEN event = 'purchased' THEN 1 ELSE 0 END) AS purchased
  FROM events
  GROUP BY user_id
)
SELECT 
  SUM(viewed) AS step1,
  SUM(added) AS step2,
  SUM(purchased) AS step3,
  SUM(added)::FLOAT / SUM(viewed) AS step1_to_step2_rate
FROM funnel_steps;
```

### Best Practices

1. **Start with the Business Question:** What are you trying to answer?
2. **Use CTEs for Readability:** Break complex queries into logical parts
3. **Validate Results:** Check for reasonableness, edge cases
4. **Document Assumptions:** Note any filters, date ranges, exclusions
5. **Optimize Last:** Get it right first, then optimize

---

## 2.2 Time-Based Analysis & Cohorts

### Introduction

Time-based analysis is the foundation of analytical SQL. Understanding how to work with time dimensions enables trend analysis, cohort tracking, and performance comparisons.

### Time Functions

**Common Time Functions:**

```sql
-- Extract date parts
DATE_TRUNC('day', timestamp)    -- 2024-01-15 00:00:00
DATE_TRUNC('week', timestamp)   -- 2024-01-15 00:00:00 (start of week)
DATE_TRUNC('month', timestamp)  -- 2024-01-01 00:00:00
DATE_TRUNC('quarter', timestamp) -- 2024-01-01 00:00:00
DATE_TRUNC('year', timestamp)   -- 2024-01-01 00:00:00

-- Date arithmetic
CURRENT_DATE - INTERVAL '7 days'
timestamp + INTERVAL '1 month'
AGE(timestamp1, timestamp2)

-- Extract components
EXTRACT(YEAR FROM timestamp)
EXTRACT(MONTH FROM timestamp)
EXTRACT(DAY FROM timestamp)
EXTRACT(DOW FROM timestamp)  -- Day of week (0=Sunday)
```

### Trend Analysis

**Daily Trends:**
```sql
SELECT 
  DATE_TRUNC('day', created_at) AS date,
  COUNT(DISTINCT user_id) AS daily_active_users,
  COUNT(*) AS events
FROM events
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY date
ORDER BY date;
```

**Week-over-Week Comparison:**
```sql
WITH daily_metrics AS (
  SELECT 
    DATE_TRUNC('day', created_at) AS date,
    COUNT(DISTINCT user_id) AS dau
  FROM events
  WHERE created_at >= CURRENT_DATE - INTERVAL '14 days'
  GROUP BY date
)
SELECT 
  date,
  dau,
  LAG(dau, 7) OVER (ORDER BY date) AS dau_last_week,
  dau - LAG(dau, 7) OVER (ORDER BY date) AS change,
  (dau - LAG(dau, 7) OVER (ORDER BY date))::FLOAT / 
    LAG(dau, 7) OVER (ORDER BY date) AS pct_change
FROM daily_metrics
ORDER BY date;
```

**Month-over-Month Growth:**
```sql
WITH monthly_metrics AS (
  SELECT 
    DATE_TRUNC('month', created_at) AS month,
    COUNT(DISTINCT user_id) AS mau
  FROM events
  WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
  GROUP BY month
)
SELECT 
  month,
  mau,
  LAG(mau, 1) OVER (ORDER BY month) AS mau_last_month,
  (mau - LAG(mau, 1) OVER (ORDER BY month))::FLOAT / 
    LAG(mau, 1) OVER (ORDER BY month) AS mom_growth
FROM monthly_metrics
ORDER BY month;
```

### Cohort Analysis

**What is a Cohort?**

A cohort is a group of users who share a common characteristic, typically the time they first used your product.

**Cohort Retention Analysis:**
```sql
WITH user_first_event AS (
  SELECT 
    user_id,
    MIN(DATE_TRUNC('month', created_at)) AS cohort_month
  FROM events
  GROUP BY user_id
),
monthly_activity AS (
  SELECT 
    user_id,
    DATE_TRUNC('month', created_at) AS activity_month
  FROM events
  GROUP BY user_id, activity_month
)
SELECT 
  ufe.cohort_month,
  ma.activity_month,
  DATE_PART('month', AGE(ma.activity_month, ufe.cohort_month)) AS months_since_signup,
  COUNT(DISTINCT ma.user_id) AS users
FROM user_first_event ufe
JOIN monthly_activity ma ON ufe.user_id = ma.user_id
WHERE ma.activity_month >= ufe.cohort_month
GROUP BY ufe.cohort_month, ma.activity_month
ORDER BY ufe.cohort_month, ma.activity_month;
```

**Cohort Revenue Analysis:**
```sql
WITH user_cohorts AS (
  SELECT 
    user_id,
    MIN(DATE_TRUNC('month', first_purchase_date)) AS cohort_month
  FROM purchases
  GROUP BY user_id
),
monthly_revenue AS (
  SELECT 
    user_id,
    DATE_TRUNC('month', purchase_date) AS revenue_month,
    SUM(amount) AS revenue
  FROM purchases
  GROUP BY user_id, revenue_month
)
SELECT 
  uc.cohort_month,
  mr.revenue_month,
  DATE_PART('month', AGE(mr.revenue_month, uc.cohort_month)) AS months_since_first_purchase,
  COUNT(DISTINCT mr.user_id) AS paying_users,
  SUM(mr.revenue) AS cohort_revenue,
  AVG(mr.revenue) AS avg_revenue_per_user
FROM user_cohorts uc
JOIN monthly_revenue mr ON uc.user_id = mr.user_id
WHERE mr.revenue_month >= uc.cohort_month
GROUP BY uc.cohort_month, mr.revenue_month
ORDER BY uc.cohort_month, mr.revenue_month;
```

### Rolling Windows

**7-Day Rolling Average:**
```sql
SELECT 
  date,
  daily_value,
  AVG(daily_value) OVER (
    ORDER BY date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS rolling_7day_avg
FROM daily_metrics
ORDER BY date;
```

**30-Day Rolling Sum:**
```sql
SELECT 
  date,
  daily_revenue,
  SUM(daily_revenue) OVER (
    ORDER BY date 
    ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
  ) AS rolling_30day_sum
FROM daily_revenue
ORDER BY date;
```

---

## 2.3 Funnel Analysis

### Introduction

Funnel analysis helps identify where users drop off in a multi-step process. It's essential for understanding conversion optimization opportunities.

### Basic Funnel Query

**Simple Conversion Funnel:**
```sql
WITH user_events AS (
  SELECT 
    user_id,
    MAX(CASE WHEN event_name = 'page_view' THEN 1 ELSE 0 END) AS viewed_page,
    MAX(CASE WHEN event_name = 'signup_start' THEN 1 ELSE 0 END) AS started_signup,
    MAX(CASE WHEN event_name = 'signup_complete' THEN 1 ELSE 0 END) AS completed_signup,
    MAX(CASE WHEN event_name = 'first_purchase' THEN 1 ELSE 0 END) AS made_purchase
  FROM events
  WHERE event_date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY user_id
)
SELECT 
  COUNT(*) AS total_users,
  SUM(viewed_page) AS viewed_page,
  SUM(started_signup) AS started_signup,
  SUM(completed_signup) AS completed_signup,
  SUM(made_purchase) AS made_purchase,
  SUM(started_signup)::FLOAT / SUM(viewed_page) AS view_to_start_rate,
  SUM(completed_signup)::FLOAT / SUM(started_signup) AS start_to_complete_rate,
  SUM(made_purchase)::FLOAT / SUM(completed_signup) AS complete_to_purchase_rate
FROM user_events;
```

### Time-Bounded Funnel

**Funnel with Time Windows:**
```sql
WITH funnel_events AS (
  SELECT 
    user_id,
    MIN(CASE WHEN event_name = 'page_view' THEN event_timestamp END) AS view_time,
    MIN(CASE WHEN event_name = 'signup_start' THEN event_timestamp END) AS start_time,
    MIN(CASE WHEN event_name = 'signup_complete' THEN event_timestamp END) AS complete_time,
    MIN(CASE WHEN event_name = 'first_purchase' THEN event_timestamp END) AS purchase_time
  FROM events
  WHERE event_date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY user_id
)
SELECT 
  COUNT(*) AS total_users,
  COUNT(view_time) AS viewed,
  COUNT(start_time) AS started,
  COUNT(complete_time) AS completed,
  COUNT(purchase_time) AS purchased,
  -- Only count if next step happened within 24 hours
  COUNT(CASE WHEN start_time IS NOT NULL 
             AND start_time <= view_time + INTERVAL '24 hours' 
        THEN 1 END) AS started_within_24h,
  COUNT(CASE WHEN complete_time IS NOT NULL 
             AND complete_time <= start_time + INTERVAL '24 hours' 
        THEN 1 END) AS completed_within_24h
FROM funnel_events;
```

### Funnel by Segment

**Funnel Analysis by Traffic Source:**
```sql
WITH user_funnel AS (
  SELECT 
    e.user_id,
    u.traffic_source,
    MAX(CASE WHEN e.event_name = 'page_view' THEN 1 ELSE 0 END) AS viewed,
    MAX(CASE WHEN e.event_name = 'signup_start' THEN 1 ELSE 0 END) AS started,
    MAX(CASE WHEN e.event_name = 'signup_complete' THEN 1 ELSE 0 END) AS completed,
    MAX(CASE WHEN e.event_name = 'first_purchase' THEN 1 ELSE 0 END) AS purchased
  FROM events e
  JOIN users u ON e.user_id = u.user_id
  WHERE e.event_date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY e.user_id, u.traffic_source
)
SELECT 
  traffic_source,
  COUNT(*) AS total_users,
  SUM(viewed) AS viewed,
  SUM(started) AS started,
  SUM(completed) AS completed,
  SUM(purchased) AS purchased,
  SUM(started)::FLOAT / SUM(viewed) AS view_to_start_rate,
  SUM(completed)::FLOAT / SUM(started) AS start_to_complete_rate,
  SUM(purchased)::FLOAT / SUM(completed) AS complete_to_purchase_rate
FROM user_funnel
GROUP BY traffic_source
ORDER BY total_users DESC;
```

### Funnel Drop-Off Analysis

**Identify Where Users Drop Off:**
```sql
WITH user_journey AS (
  SELECT 
    user_id,
    CASE 
      WHEN MAX(CASE WHEN event_name = 'purchased' THEN 1 END) = 1 THEN 'completed'
      WHEN MAX(CASE WHEN event_name = 'added_to_cart' THEN 1 END) = 1 THEN 'dropped_at_checkout'
      WHEN MAX(CASE WHEN event_name = 'product_view' THEN 1 END) = 1 THEN 'dropped_at_cart'
      WHEN MAX(CASE WHEN event_name = 'landing_page' THEN 1 END) = 1 THEN 'dropped_at_browse'
      ELSE 'never_engaged'
    END AS drop_off_point
  FROM events
  WHERE event_date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY user_id
)
SELECT 
  drop_off_point,
  COUNT(*) AS users,
  COUNT(*)::FLOAT / SUM(COUNT(*)) OVER () AS pct_of_total
FROM user_journey
GROUP BY drop_off_point
ORDER BY 
  CASE drop_off_point
    WHEN 'completed' THEN 1
    WHEN 'dropped_at_checkout' THEN 2
    WHEN 'dropped_at_cart' THEN 3
    WHEN 'dropped_at_browse' THEN 4
    ELSE 5
  END;
```

---

## 2.4 Window Functions for Trends & Rankings

### Introduction

Window functions are powerful tools for calculating running totals, rankings, and comparing rows without using self-joins.

### Common Window Functions

**ROW_NUMBER, RANK, DENSE_RANK:**
```sql
-- Rank users by revenue
SELECT 
  user_id,
  total_revenue,
  ROW_NUMBER() OVER (ORDER BY total_revenue DESC) AS rank_row_number,
  RANK() OVER (ORDER BY total_revenue DESC) AS rank_with_gaps,
  DENSE_RANK() OVER (ORDER BY total_revenue DESC) AS rank_no_gaps
FROM user_revenue
ORDER BY total_revenue DESC;
```

**LAG and LEAD:**
```sql
-- Compare current period to previous period
SELECT 
  date,
  revenue,
  LAG(revenue, 1) OVER (ORDER BY date) AS previous_revenue,
  revenue - LAG(revenue, 1) OVER (ORDER BY date) AS change,
  LEAD(revenue, 1) OVER (ORDER BY date) AS next_revenue
FROM daily_revenue
ORDER BY date;
```

**Running Totals:**
```sql
-- Cumulative revenue
SELECT 
  date,
  daily_revenue,
  SUM(daily_revenue) OVER (
    ORDER BY date 
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS cumulative_revenue
FROM daily_revenue
ORDER BY date;
```

**Moving Averages:**
```sql
-- 7-day moving average
SELECT 
  date,
  daily_value,
  AVG(daily_value) OVER (
    ORDER BY date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS moving_avg_7d
FROM daily_metrics
ORDER BY date;
```

### Partitioned Window Functions

**Rank Within Groups:**
```sql
-- Top 3 products by category
SELECT 
  category,
  product_name,
  revenue,
  RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rank_in_category
FROM product_revenue
QUALIFY RANK() OVER (PARTITION BY category ORDER BY revenue DESC) <= 3
ORDER BY category, rank_in_category;
```

**Cohort Comparison:**
```sql
-- Compare user to cohort average
SELECT 
  user_id,
  cohort_month,
  user_revenue,
  AVG(user_revenue) OVER (PARTITION BY cohort_month) AS cohort_avg_revenue,
  user_revenue - AVG(user_revenue) OVER (PARTITION BY cohort_month) AS diff_from_cohort
FROM user_cohort_revenue
ORDER BY cohort_month, user_id;
```

**Percentile Calculations:**
```sql
-- Revenue percentiles
SELECT 
  user_id,
  revenue,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY revenue) OVER () AS median_revenue,
  PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY revenue) OVER () AS p90_revenue,
  CASE 
    WHEN revenue >= PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY revenue) OVER () 
    THEN 'top_10pct'
    WHEN revenue >= PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY revenue) OVER () 
    THEN 'top_50pct'
    ELSE 'bottom_50pct'
  END AS revenue_tier
FROM user_revenue;
```

### Advanced Window Patterns

**First and Last Value:**
```sql
-- First and last purchase per user
SELECT 
  user_id,
  purchase_date,
  amount,
  FIRST_VALUE(amount) OVER (
    PARTITION BY user_id 
    ORDER BY purchase_date 
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS first_purchase_amount,
  LAST_VALUE(amount) OVER (
    PARTITION BY user_id 
    ORDER BY purchase_date 
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS last_purchase_amount
FROM purchases
ORDER BY user_id, purchase_date;
```

**Period-over-Period Comparison:**
```sql
-- Week-over-week comparison
WITH weekly_metrics AS (
  SELECT 
    DATE_TRUNC('week', date) AS week,
    SUM(revenue) AS weekly_revenue
  FROM daily_revenue
  GROUP BY week
)
SELECT 
  week,
  weekly_revenue,
  LAG(weekly_revenue, 1) OVER (ORDER BY week) AS previous_week_revenue,
  weekly_revenue - LAG(weekly_revenue, 1) OVER (ORDER BY week) AS wow_change,
  (weekly_revenue - LAG(weekly_revenue, 1) OVER (ORDER BY week))::FLOAT / 
    LAG(weekly_revenue, 1) OVER (ORDER BY week) AS wow_pct_change
FROM weekly_metrics
ORDER BY week;
```

---

## 2.5 Common SQL Pitfalls in Analytics

### Introduction

Even experienced SQL developers make mistakes in analytical queries. Understanding common pitfalls helps you write more reliable, performant queries.

### Pitfall 1: COUNT vs COUNT(DISTINCT)

**The Problem:**
```sql
-- Wrong: Counts all rows, including duplicates
SELECT COUNT(user_id) FROM events;

-- Right: Counts unique users
SELECT COUNT(DISTINCT user_id) FROM events;
```

**When to Use Each:**
- `COUNT(*)` or `COUNT(column)`: Count events, transactions, rows
- `COUNT(DISTINCT column)`: Count unique entities (users, products, etc.)

### Pitfall 2: Incorrect JOINs

**The Problem:**
```sql
-- Wrong: Creates duplicates if user has multiple events
SELECT u.user_id, u.name, COUNT(*) AS event_count
FROM users u
JOIN events e ON u.user_id = e.user_id
GROUP BY u.user_id, u.name;

-- Right: Aggregate first, then join
WITH event_counts AS (
  SELECT user_id, COUNT(*) AS event_count
  FROM events
  GROUP BY user_id
)
SELECT u.user_id, u.name, ec.event_count
FROM users u
LEFT JOIN event_counts ec ON u.user_id = ec.user_id;
```

### Pitfall 3: Time Zone Issues

**The Problem:**
```sql
-- Wrong: May use wrong timezone
SELECT DATE(created_at) AS date, COUNT(*) 
FROM events
GROUP BY date;

-- Right: Explicitly handle timezone
SELECT DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York') AS date, COUNT(*) 
FROM events
GROUP BY date;
```

### Pitfall 4: NULL Handling

**The Problem:**
```sql
-- Wrong: NULL values excluded from calculations
SELECT AVG(revenue) FROM purchases;

-- Right: Explicitly handle NULLs
SELECT 
  AVG(COALESCE(revenue, 0)) AS avg_revenue_with_zeros,
  AVG(revenue) AS avg_revenue_excluding_nulls,
  COUNT(*) AS total_rows,
  COUNT(revenue) AS non_null_revenue_rows
FROM purchases;
```

### Pitfall 5: Double Counting

**The Problem:**
```sql
-- Wrong: May double count if user has multiple events
SELECT 
  DATE_TRUNC('day', created_at) AS date,
  COUNT(DISTINCT user_id) AS daily_users,
  COUNT(*) AS total_events
FROM events
GROUP BY date;

-- If same user appears multiple times, this is correct
-- But if you need unique users per day, use COUNT(DISTINCT)
```

### Pitfall 6: Incorrect Aggregation

**The Problem:**
```sql
-- Wrong: Averaging percentages
SELECT AVG(conversion_rate) FROM daily_metrics;

-- Right: Calculate percentage from totals
SELECT 
  SUM(conversions)::FLOAT / SUM(visitors) AS overall_conversion_rate
FROM daily_metrics;
```

### Pitfall 7: Missing Data Validation

**The Problem:**
```sql
-- Wrong: No validation, may return incorrect results
SELECT SUM(revenue) FROM purchases;

-- Right: Validate data quality
SELECT 
  SUM(revenue) AS total_revenue,
  COUNT(*) AS total_purchases,
  COUNT(CASE WHEN revenue < 0 THEN 1 END) AS negative_revenue_count,
  MIN(revenue) AS min_revenue,
  MAX(revenue) AS max_revenue
FROM purchases
WHERE purchase_date >= CURRENT_DATE - INTERVAL '30 days';
```

### Pitfall 8: Performance Issues

**The Problem:**
```sql
-- Wrong: Full table scan on large table
SELECT * FROM events WHERE user_id = 123;

-- Right: Use appropriate filters and indexes
SELECT * FROM events 
WHERE user_id = 123 
  AND event_date >= CURRENT_DATE - INTERVAL '30 days';
```

### Best Practices Checklist

Before running a query in production:

1. ✅ Validate data quality (check for NULLs, outliers)
2. ✅ Use appropriate aggregations (COUNT vs COUNT(DISTINCT))
3. ✅ Handle time zones explicitly
4. ✅ Test with sample data first
5. ✅ Check for duplicates and double counting
6. ✅ Verify join logic
7. ✅ Add appropriate filters (date ranges, etc.)
8. ✅ Document assumptions and exclusions
9. ✅ Test edge cases (empty results, NULL values)
10. ✅ Review query performance

---

## Lab 2: SQL for Analytics

### Objective

Write production-grade SQL queries for funnel analysis, cohort tracking, and week-over-week performance.

### Tasks

**Task 1: Funnel Drop-Off Analysis (2 hours)**

Using the provided events table, write SQL to:

1. Build a conversion funnel: Landing → Signup Start → Signup Complete → First Purchase
2. Calculate conversion rates between each step
3. Identify where users drop off most
4. Segment by traffic source
5. Identify time-to-conversion patterns

**Deliverable:** SQL queries with results and analysis

**Task 2: Retention Cohort Analysis (2 hours)**

Using the provided events and users tables, write SQL to:

1. Create monthly cohorts based on first event date
2. Calculate retention rates for each cohort
3. Compare retention across cohorts
4. Identify trends in cohort performance
5. Calculate cohort revenue (if applicable)

**Deliverable:** SQL queries with cohort retention matrix

**Task 3: Week-over-Week Performance (2 hours)**

Using the provided metrics tables, write SQL to:

1. Calculate week-over-week changes for key metrics
2. Identify significant changes (threshold: >10%)
3. Segment by relevant dimensions (if applicable)
4. Create a summary report
5. Flag anomalies or outliers

**Deliverable:** SQL queries with WoW comparison report

**Task 4: Query Optimization (1 hour)**

For each query above:

1. Identify performance bottlenecks
2. Suggest optimizations (indexes, partitioning, etc.)
3. Rewrite queries for better performance
4. Document query assumptions and limitations

**Deliverable:** Optimization recommendations document

### Deliverables

- 3 SQL query files (one per task)
- 1 optimization recommendations document
- 1-page summary of findings

### Evaluation Criteria

- **Query Correctness (40%):** Accurate results, proper logic
- **SQL Best Practices (30%):** Clean code, proper formatting, CTEs
- **Performance Awareness (20%):** Efficient queries, optimization considerations
- **Documentation (10%):** Clear comments, assumptions documented

---

## Key Takeaways

- **Analytical Mindset:**: Think in aggregations and patterns, not individual rows
- **Time Functions:**: Master date truncation, intervals, and time-based grouping
- **Cohort Analysis:**: Track groups of users over time to understand retention
- **Funnel Analysis:**: Identify drop-off points to optimize conversion
- **Window Functions:**: Powerful tool for rankings, trends, and comparisons
- **Avoid Pitfalls:**: Validate data, handle NULLs, avoid double counting

---

## Additional Resources

### Reading
- "SQL Window Functions" (PostgreSQL Documentation)
- "Advanced SQL for Data Science" by John Mount and Nina Zumel
- "The Data Warehouse Toolkit" by Ralph Kimball

### Tools
- SQL Fiddle (for testing queries)
- Query optimization guides
- SQL style guides

### Next Steps
- Complete Lab 2
- Review Module 3: Analytical Modeling & Metrics Layers
- Join course discussion forum

---

**Module 2 Complete. Ready for Module 3? →**
