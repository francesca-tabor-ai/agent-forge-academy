---
title: "Module 3: Analytical Modeling & Metrics Layers"
description: "Making insights repeatable with scalable analytics models"
module: "3"
order: 3
---

# Module 3: Analytical Modeling & Metrics Layers

**Duration:** Week 3  
**Theme:** *Making insights repeatable*

**Learning Objectives:**
- Understand raw vs transformed data layers
- Design metrics layers and semantic models
- Work with dimensions, facts, and grain
- Create single source of truth designs
- Apply Analytics Engineering concepts

---

## 3.1 Raw vs Transformed Data

### Introduction

Understanding the difference between raw and transformed data is fundamental to building reliable analytical systems. This distinction enables repeatable, trustworthy insights.

### The Data Pipeline

```
Raw Data → Staging → Transformed → Metrics Layer → Dashboards
```

### Raw Data Layer

**Characteristics:**
- Source of truth from operational systems
- Unmodified, as-is from source
- Historical record of what happened
- Never modified, only appended
- Examples: Event logs, transaction tables, API responses

**Best Practices:**
- Preserve original data exactly as received
- Add metadata (ingestion timestamp, source)
- Never delete or modify raw data
- Version control for schema changes

### Transformed Data Layer

**Characteristics:**
- Cleaned and standardized
- Business logic applied
- Denormalized for analytics
- Optimized for query performance
- Examples: User dimensions, fact tables, aggregated metrics

**Transformation Steps:**
1. **Cleaning:** Remove duplicates, handle NULLs, standardize formats
2. **Enrichment:** Add calculated fields, join reference data
3. **Aggregation:** Pre-compute common metrics
4. **Validation:** Check data quality, business rules

### The Staging Layer

**Purpose:** Intermediate layer between raw and transformed

**Functions:**
- Validate data quality
- Handle schema changes
- Apply basic cleaning
- Prepare for transformation

### Example: E-Commerce Data Flow

**Raw Layer:**
```sql
-- Raw events table (as received from tracking)
CREATE TABLE raw_events (
  event_id VARCHAR,
  user_id VARCHAR,
  event_name VARCHAR,
  event_timestamp TIMESTAMP,
  properties JSONB,
  ingested_at TIMESTAMP
);
```

**Transformed Layer:**
```sql
-- Transformed events table (cleaned and standardized)
CREATE TABLE events (
  event_id VARCHAR PRIMARY KEY,
  user_id INTEGER,
  event_name VARCHAR,
  event_date DATE,
  event_timestamp TIMESTAMP,
  page_url VARCHAR,
  referrer VARCHAR,
  device_type VARCHAR,
  country VARCHAR,
  -- ... other standardized fields
);
```

### Benefits of Layered Architecture

1. **Traceability:** Can always trace back to source
2. **Reproducibility:** Transformations are repeatable
3. **Flexibility:** Can rebuild transformed layer from raw
4. **Quality:** Validate at each layer
5. **Performance:** Optimize transformed layer for queries

---

## 3.2 Metrics Layers & Semantic Models

### Introduction

A metrics layer is a semantic abstraction that defines business metrics in a consistent, reusable way. It sits between your data warehouse and your analytics tools.

### What is a Metrics Layer?

**Definition:** A centralized definition of business metrics that ensures consistency across all analytics tools and dashboards.

**Components:**
- Metric definitions (formulas, calculations)
- Dimension definitions (what you can slice by)
- Data model relationships
- Business logic and rules

### Benefits of Metrics Layers

1. **Consistency:** Same metric definition everywhere
2. **Reusability:** Define once, use everywhere
3. **Governance:** Centralized metric management
4. **Documentation:** Self-documenting metrics
5. **Validation:** Built-in data quality checks

### Metrics Layer Architecture

```
Data Warehouse (Transformed Data)
         ↓
Metrics Layer (Semantic Model)
         ↓
Analytics Tools (Dashboards, Reports)
```

### Example Metrics Layer Definition

**Metric: Monthly Active Users (MAU)**
```yaml
metric: monthly_active_users
description: "Count of unique users who performed at least one event in the calendar month"
type: count_distinct
entity: user_id
time_grain: month
filters:
  - event_name: [page_view, purchase, signup]
calculation: COUNT(DISTINCT user_id)
dimensions:
  - country
  - device_type
  - subscription_tier
```

**Metric: Conversion Rate**
```yaml
metric: conversion_rate
description: "Percentage of visitors who complete a purchase"
type: ratio
numerator: purchases
denominator: visitors
calculation: purchases / visitors * 100
dimensions:
  - traffic_source
  - device_type
  - country
```

### Semantic Models

**What is a Semantic Model?**

A semantic model defines the business meaning of data, independent of the underlying database structure.

**Components:**
- **Entities:** Business objects (users, products, orders)
- **Attributes:** Properties of entities (user name, product price)
- **Relationships:** How entities connect (users have orders)
- **Metrics:** Calculated measures (revenue, conversion rate)

### Building a Semantic Model

**Step 1: Identify Entities**
- Users
- Products
- Orders
- Events

**Step 2: Define Attributes**
- User: id, name, email, signup_date, country
- Product: id, name, category, price
- Order: id, user_id, product_id, amount, date

**Step 3: Define Relationships**
- Users → Orders (one-to-many)
- Products → Orders (one-to-many)
- Users → Events (one-to-many)

**Step 4: Define Metrics**
- Revenue = SUM(order.amount)
- Active Users = COUNT(DISTINCT user.id WHERE has_event)
- Conversion Rate = purchases / visitors

---

## 3.3 Dimensions, Facts, and Grain

### Introduction

Understanding dimensions, facts, and grain is essential for designing effective analytical models. These concepts come from dimensional modeling (Kimball methodology).

### Facts

**Definition:** Facts are measurable, quantitative data that represent business events.

**Characteristics:**
- Numeric and additive
- Represent business processes
- Examples: Revenue, quantity sold, page views

**Types of Facts:**
- **Additive:** Can be summed across all dimensions (revenue, quantity)
- **Semi-additive:** Can be summed across some dimensions (account balance)
- **Non-additive:** Cannot be summed (ratios, percentages)

### Dimensions

**Definition:** Dimensions are descriptive attributes that provide context for facts.

**Characteristics:**
- Text or categorical
- Used for filtering and grouping
- Examples: Date, product, customer, geography

**Common Dimensions:**
- **Time:** Date, week, month, quarter, year
- **Geography:** Country, region, city
- **Product:** Category, brand, SKU
- **Customer:** Segment, acquisition channel, cohort

### Grain

**Definition:** Grain is the level of detail at which facts are stored.

**Examples:**
- Transaction-level: One row per order line item
- Daily aggregated: One row per product per day
- Monthly aggregated: One row per customer per month

**Grain Decision Factors:**
- What questions need to be answered?
- What's the lowest level of detail needed?
- Storage and performance constraints
- Data freshness requirements

### Fact Tables

**Structure:**
```sql
CREATE TABLE fact_orders (
  -- Foreign keys to dimensions
  order_date_key INTEGER,  -- FK to dim_date
  customer_key INTEGER,     -- FK to dim_customer
  product_key INTEGER,      -- FK to dim_product
  
  -- Measures (facts)
  order_amount DECIMAL(10,2),
  quantity INTEGER,
  discount_amount DECIMAL(10,2),
  
  -- Degenerate dimensions (attributes that don't warrant a dimension table)
  order_id VARCHAR,
  
  -- Metadata
  created_at TIMESTAMP
);
```

### Dimension Tables

**Structure:**
```sql
CREATE TABLE dim_customer (
  customer_key INTEGER PRIMARY KEY,
  customer_id VARCHAR,
  customer_name VARCHAR,
  email VARCHAR,
  signup_date DATE,
  country VARCHAR,
  customer_segment VARCHAR,
  acquisition_channel VARCHAR,
  -- SCD Type 2 fields (if tracking history)
  effective_date DATE,
  expiry_date DATE,
  is_current BOOLEAN
);
```

### Star Schema

**Structure:**
```
         fact_orders
            /|\
           / | \
          /  |  \
    dim_date  dim_customer  dim_product
```

**Benefits:**
- Simple to understand
- Fast queries (fewer joins)
- Easy to navigate
- Standard approach

### Snowflake Schema

**Structure:**
```
         fact_orders
            /|\
           / | \
          /  |  \
    dim_date  dim_customer  dim_product
                      |           |
                dim_country   dim_category
```

**Benefits:**
- Normalized (reduces redundancy)
- Smaller dimension tables
- More complex queries

**Trade-offs:**
- More joins required
- Slightly more complex

### Choosing Grain

**Transaction-Level Grain:**
- **Use when:** Need to analyze individual transactions
- **Example:** One row per order line item
- **Pros:** Maximum flexibility, can aggregate to any level
- **Cons:** Large tables, slower queries

**Daily Aggregated Grain:**
- **Use when:** Daily trends are sufficient
- **Example:** One row per product per day
- **Pros:** Smaller tables, faster queries
- **Cons:** Can't analyze individual transactions

**Monthly Aggregated Grain:**
- **Use when:** Monthly trends are sufficient
- **Example:** One row per customer per month
- **Pros:** Very small tables, very fast queries
- **Cons:** Limited detail, can't drill down

**Best Practice:** Store at the lowest grain needed, aggregate for performance

---

## 3.4 Single Source of Truth Design

### Introduction

A single source of truth (SSOT) ensures that everyone in the organization uses the same data definitions and calculations. This eliminates confusion and conflicting reports.

### The Problem: Multiple Sources of Truth

**Symptoms:**
- Different teams report different numbers for the same metric
- "Which number is correct?" debates
- Time wasted reconciling discrepancies
- Loss of trust in data

**Root Causes:**
- Metrics calculated in multiple places
- Different business logic applied
- Data pulled from different sources
- No centralized definitions

### The Solution: Single Source of Truth

**Principles:**
1. **One Definition:** Each metric has one authoritative definition
2. **One Calculation:** Same formula used everywhere
3. **One Source:** Data comes from the same place
4. **One Owner:** Clear ownership and responsibility

### SSOT Architecture

```
Raw Data Sources
      ↓
Data Warehouse (Single Source)
      ↓
Metrics Layer (Single Definitions)
      ↓
Analytics Tools (Consistent Usage)
```

### Implementing SSOT

**Step 1: Identify All Metrics**
- List all metrics used across the organization
- Document where they're currently calculated
- Identify discrepancies

**Step 2: Define Authoritative Definitions**
- Choose the "correct" definition for each metric
- Document the formula and business logic
- Get stakeholder buy-in

**Step 3: Centralize Calculations**
- Build metrics in one place (metrics layer or data warehouse)
- Remove duplicate calculations
- Update all tools to use centralized metrics

**Step 4: Establish Governance**
- Define metric owners
- Create change management process
- Document all metrics

### Example: Revenue SSOT

**Before (Multiple Sources):**
- Finance: Revenue from accounting system
- Sales: Revenue from CRM
- Analytics: Revenue calculated from orders table
- **Result:** Three different numbers

**After (Single Source):**
- **Source:** Data warehouse `fact_orders` table
- **Definition:** Sum of `order_amount` where `order_status = 'completed'` and `order_date` in period
- **Calculation:** `SUM(order_amount) WHERE status = 'completed'`
- **Used by:** All teams, all tools
- **Result:** One consistent number

### Metrics Catalog

**Purpose:** Document all metrics in one place

**Contents:**
- Metric name and description
- Formula/calculation
- Data source
- Dimensions available
- Owner
- Last updated
- Usage examples

**Example:**
```yaml
metric: monthly_recurring_revenue
description: "Sum of subscription revenue for active subscriptions in the month"
formula: "SUM(subscription_amount) WHERE status = 'active' AND billing_date IN month"
data_source: "fact_subscriptions"
dimensions:
  - plan_tier
  - acquisition_channel
  - country
owner: "Finance Team"
last_updated: "2024-01-15"
```

### Change Management

**Process:**
1. **Request:** Stakeholder requests metric change
2. **Review:** Metric owner reviews impact
3. **Approve:** Get approval from stakeholders
4. **Implement:** Update definition and calculations
5. **Communicate:** Notify all users of change
6. **Document:** Update metrics catalog

---

## 3.5 Working with Analytics Engineering Concepts

### Introduction

Analytics Engineering bridges the gap between raw data and analytics. It applies software engineering practices to data transformation.

### What is Analytics Engineering?

**Definition:** The practice of transforming raw data into analytics-ready datasets using software engineering best practices.

**Key Practices:**
- Version control for data transformations
- Testing and validation
- Documentation
- Modular, reusable code
- CI/CD for data pipelines

### Analytics Engineering Tools

**dbt (Data Build Tool):**
- SQL-based transformations
- Version control
- Testing framework
- Documentation generation
- Modular, reusable models

**Other Tools:**
- Airflow (orchestration)
- Great Expectations (data quality)
- Dataform (Google Cloud)
- SQLMesh (advanced dbt alternative)

### dbt Concepts

**Models:**
- SQL files that transform data
- Modular and reusable
- Can reference other models

**Example:**
```sql
-- models/staging/stg_orders.sql
SELECT 
  order_id,
  user_id,
  order_date,
  amount,
  status
FROM {{ source('raw', 'orders') }}
WHERE status IN ('completed', 'pending')
```

**Sources:**
- Reference to raw data tables
- Centralized source definitions

**Example:**
```yaml
# models/sources.yml
sources:
  - name: raw
    tables:
      - name: orders
      - name: users
```

**Tests:**
- Data quality checks
- Built-in and custom tests

**Example:**
```yaml
# models/schema.yml
models:
  - name: stg_orders
    columns:
      - name: order_id
        tests:
          - unique
          - not_null
      - name: amount
        tests:
          - not_null
          - dbt_utils.accepted_range:
              min_value: 0
```

**Macros:**
- Reusable SQL snippets
- Parameterized queries

**Example:**
```sql
-- macros/rolling_average.sql
{% macro rolling_average(column, period) %}
  AVG({{ column }}) OVER (
    ORDER BY date 
    ROWS BETWEEN {{ period - 1 }} PRECEDING AND CURRENT ROW
  )
{% endmacro %}
```

### Analytics Engineering Workflow

```
1. Extract (from sources)
   ↓
2. Load (into data warehouse)
   ↓
3. Transform (using dbt/models)
   ↓
4. Test (data quality checks)
   ↓
5. Document (auto-generated docs)
   ↓
6. Deploy (to production)
```

### Best Practices

1. **Modularity:** Break transformations into small, reusable models
2. **Testing:** Test data quality at each layer
3. **Documentation:** Document all models and metrics
4. **Version Control:** Use Git for all transformations
5. **Incremental Models:** Use incremental loads for large tables
6. **Naming Conventions:** Consistent naming across models

### Example: Analytics Engineering Project Structure

```
analytics/
├── dbt_project.yml
├── models/
│   ├── staging/
│   │   ├── stg_orders.sql
│   │   ├── stg_users.sql
│   │   └── schema.yml
│   ├── intermediate/
│   │   ├── int_user_orders.sql
│   │   └── schema.yml
│   └── marts/
│       ├── fact_orders.sql
│       ├── dim_users.sql
│       └── schema.yml
├── macros/
│   └── rolling_average.sql
└── tests/
    └── custom_tests.sql
```

---

## Lab 3: Design Metrics Models

### Objective

Design scalable analytics models for orders, revenue, and customer activity.

### Tasks

**Task 1: Orders Metrics Model (2 hours)**

Design a metrics model for order data:

1. Identify facts and dimensions
2. Define grain (transaction-level or aggregated)
3. Design fact and dimension tables
4. Define key metrics (order count, revenue, average order value)
5. Create data model diagram

**Deliverable:** Data model design document with ER diagram

**Task 2: Revenue Metrics Model (2 hours)**

Design a metrics model for revenue:

1. Identify revenue sources (one-time, recurring, etc.)
2. Define revenue recognition rules
3. Design fact table structure
4. Define revenue metrics (MRR, ARR, revenue growth)
5. Handle different revenue types

**Deliverable:** Revenue model design with metric definitions

**Task 3: Customer Activity Model (2 hours)**

Design a metrics model for customer activity:

1. Identify activity events
2. Design event fact table
3. Define customer dimensions
4. Define activity metrics (DAU, MAU, engagement score)
5. Design for both aggregated and event-level analysis

**Deliverable:** Activity model design with metric definitions

**Task 4: Single Source of Truth Design (1 hour)**

For all three models:

1. Define authoritative data sources
2. Create metrics catalog entries
3. Document calculation formulas
4. Define ownership and governance
5. Create change management process

**Deliverable:** SSOT design document with metrics catalog

### Deliverables

- 3 data model design documents
- 1 SSOT design document
- 1 metrics catalog
- 1-page summary

### Evaluation Criteria

- **Model Design Quality (40%):** Appropriate grain, proper dimensions/facts
- **Metrics Definitions (30%):** Clear, accurate, business-aligned
- **SSOT Design (20%):** Centralized, well-documented
- **Documentation (10%):** Clear, comprehensive

---

## Key Takeaways

1. **Layered Architecture:** Raw → Staging → Transformed → Metrics
2. **Metrics Layer:** Centralized, reusable metric definitions
3. **Dimensional Modeling:** Facts, dimensions, and grain
4. **Single Source of Truth:** One definition, one calculation, one source
5. **Analytics Engineering:** Software engineering practices for data

---

## Additional Resources

### Reading
- "The Data Warehouse Toolkit" by Ralph Kimball
- "Fundamentals of Data Engineering" by Joe Reis and Matt Housley
- dbt Documentation: https://docs.getdbt.com

### Tools
- dbt (Data Build Tool)
- ERD tools (draw.io, Lucidchart)
- Metrics layer tools (Transform, Cube)

### Next Steps
- Complete Lab 3
- Review Module 4: Dashboarding That Drives Action
- Join course discussion forum

---

**Module 3 Complete. Ready for Module 4? →**
