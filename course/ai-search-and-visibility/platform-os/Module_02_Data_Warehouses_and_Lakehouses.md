---
title: "Module 2: Data Warehouses & Lakehouses"
description: "Analytical storage at scale"
module: "2"
order: 2
email_takeaway: "Warehouses optimize for SQL analytics, lakes for flexibility, and lakehouses combine both. Choose based on your workload patterns."
email_action: "Analyze your current data storage: what percentage is structured vs unstructured? What are your primary query patterns?"
---

# Module 2: Data Warehouses & Lakehouses

**Duration:** Week 2  
**Theme:** *Analytical storage at scale*

**Learning Objectives:**
- **OLTP vs OLAP vs analytical workloads Understanding**: Understand OLTP vs OLAP vs analytical workloads
- **between warehouses, data lakes, Analysis**: Differentiate between warehouses, data lakes, and lakehouses
- **table formats, partitioning, and data layout strategies Understanding**: Learn table formats, partitioning, and data layout strategies
- **schema evolution and data versioning Understanding**: Master schema evolution and data versioning
- **Optimize Storage**: Optimize storage for performance and cost

---

## 2.1 OLTP vs OLAP vs Analytical Workloads

### Understanding Workload Types

Different workloads require different storage and processing characteristics. Understanding these differences is fundamental to designing effective data platforms.

### OLTP (Online Transaction Processing)

**Characteristics:**
- **Purpose:** Support day-to-day business operations
- **Data:** Current, operational data
- **Access Pattern:** Small, frequent reads and writes
- **Transactions:** ACID compliance required
- **Latency:** Sub-second response times
- **Concurrency:** High (thousands of concurrent users)
- **Schema:** Normalized, relational

**Examples:**
- E-commerce order processing
- Banking transactions
- Inventory management
- User authentication

**Storage Requirements:**
- Row-oriented storage
- Indexes for fast lookups
- Transaction logs
- High availability

### OLAP (Online Analytical Processing)

**Characteristics:**
- **Purpose:** Support business intelligence and analytics
- **Data:** Historical, aggregated data
- **Access Pattern:** Large, infrequent reads
- **Transactions:** Batch updates, less ACID critical
- **Latency:** Seconds to minutes acceptable
- **Concurrency:** Lower (dozens to hundreds of users)
- **Schema:** Denormalized, star/snowflake schemas

**Examples:**
- Sales reporting dashboards
- Financial analysis
- Customer segmentation
- Trend analysis

**Storage Requirements:**
- Column-oriented storage
- Aggregations and pre-computed results
- Partitioning for query performance
- Compression for cost efficiency

### Analytical Workloads

**Characteristics:**
- **Purpose:** Data science, ML, ad-hoc exploration
- **Data:** Raw and processed data
- **Access Pattern:** Variable, often full table scans
- **Transactions:** Append-heavy, less transactional
- **Latency:** Minutes to hours acceptable
- **Concurrency:** Variable
- **Schema:** Flexible, schema-on-read

**Examples:**
- Feature engineering for ML
- Data exploration and discovery
- Large-scale data processing
- Experimentation and A/B testing

**Storage Requirements:**
- Flexible schema support
- Support for diverse data formats
- Cost-effective storage
- Integration with processing engines

### Workload Comparison

| Characteristic | OLTP | OLAP | Analytical |
|---------------|------|------|------------|
| **Data Freshness** | Real-time | Hours to days | Days to weeks |
| **Query Pattern** | Point lookups | Aggregations | Full scans |
| **Data Volume** | GB to TB | TB to PB | PB+ |
| **Update Frequency** | Continuous | Batch | Batch |
| **Schema Rigor** | Strict | Structured | Flexible |

---

## 2.2 Warehouses vs Data Lakes vs Lakehouses

### Data Warehouses

**Definition:** Centralized repository of structured, processed data optimized for SQL analytics.

**Characteristics:**
- **Schema:** Schema-on-write (strict schema before ingestion)
- **Data Format:** Structured, relational
- **Storage:** Proprietary or optimized formats
- **Query Engine:** SQL-optimized
- **Use Cases:** Business intelligence, reporting, dashboards

**Advantages:**
- Fast SQL queries
- Strong ACID guarantees
- Excellent performance for structured data
- Mature ecosystem and tools

**Disadvantages:**
- Limited flexibility for unstructured data
- Expensive for large-scale storage
- Vendor lock-in risk
- Less suitable for data science workloads

**Examples:** Snowflake, BigQuery, Redshift, Azure Synapse

### Data Lakes

**Definition:** Centralized repository that stores data in its raw format, supporting structured, semi-structured, and unstructured data.

**Characteristics:**
- **Schema:** Schema-on-read (flexible, applied at query time)
- **Data Format:** Any format (Parquet, JSON, CSV, images, etc.)
- **Storage:** Object storage (S3, ADLS, GCS)
- **Query Engine:** Multiple engines (Spark, Presto, Athena)
- **Use Cases:** Data science, ML, exploration, archival

**Advantages:**
- Cost-effective storage
- Flexibility for diverse data types
- No vendor lock-in
- Supports data science workflows

**Disadvantages:**
- Can become "data swamps" without governance
- Slower query performance
- Weaker ACID guarantees
- Requires more engineering effort

**Examples:** AWS S3 + Athena, Azure Data Lake Storage, Google Cloud Storage

### Lakehouses

**Definition:** Open architecture that combines the best of data lakes and data warehouses.

**Characteristics:**
- **Schema:** Flexible schema-on-read with optional schema enforcement
- **Data Format:** Open table formats (Delta Lake, Iceberg, Hudi)
- **Storage:** Object storage with metadata layer
- **Query Engine:** Multiple engines with ACID guarantees
- **Use Cases:** Unified analytics and ML workloads

**Advantages:**
- Cost-effective like lakes
- Performance like warehouses
- ACID transactions
- Open formats (no vendor lock-in)
- Supports both BI and data science

**Disadvantages:**
- Newer technology (less mature)
- Requires more setup and management
- Learning curve for teams

**Examples:** Databricks (Delta Lake), Apache Iceberg, Apache Hudi

### Comparison Matrix

| Feature | Warehouse | Data Lake | Lakehouse |
|---------|-----------|-----------|-----------|
| **Storage Cost** | High | Low | Low |
| **Query Performance** | Excellent | Good | Excellent |
| **Data Types** | Structured | All | All |
| **ACID Support** | Yes | Limited | Yes |
| **Schema Flexibility** | Low | High | High |
| **Vendor Lock-in** | High | Low | Low |
| **Best For** | BI/Reporting | Data Science | Unified Analytics |

### Choosing the Right Approach

**Choose Warehouse If:**
- Primary use case is SQL analytics and BI
- Data is primarily structured
- Performance is critical
- Team prefers managed services

**Choose Data Lake If:**
- Need to store diverse data types
- Cost is primary concern
- Data science is primary use case
- Team has strong engineering capabilities

**Choose Lakehouse If:**
- Need both BI and data science
- Want open formats and flexibility
- Need ACID guarantees
- Willing to invest in setup and management

---

## 2.3 Table Formats, Partitioning, and Data Layout

### Table Formats

Modern analytical storage uses columnar formats optimized for analytics workloads.

#### Parquet

**Characteristics:**
- Columnar storage format
- Efficient compression
- Schema evolution support
- Widely supported

**Use Cases:**
- Data lake storage
- ETL intermediate formats
- Long-term archival

**Advantages:**
- Excellent compression
- Fast column scans
- Open standard

#### Delta Lake

**Characteristics:**
- Built on Parquet
- ACID transactions
- Time travel
- Schema enforcement

**Use Cases:**
- Lakehouse architectures
- ML feature storage
- Streaming workloads

**Advantages:**
- Transactional guarantees
- Versioning and time travel
- Upsert and merge operations

#### Apache Iceberg

**Characteristics:**
- Table format specification
- Hidden partitioning
- Schema evolution
- Multi-engine support

**Use Cases:**
- Large-scale analytics
- Multi-engine environments
- Schema evolution needs

**Advantages:**
- Engine-agnostic
- Efficient partition pruning
- Strong schema evolution

#### Apache Hudi

**Characteristics:**
- Incremental processing
- Upsert capabilities
- Real-time ingestion
- Change data capture

**Use Cases:**
- Streaming analytics
- CDC workloads
- Real-time data pipelines

**Advantages:**
- Incremental processing
- Efficient upserts
- Real-time capabilities

### Partitioning Strategies

Partitioning divides data into smaller, manageable chunks to improve query performance.

#### Partitioning by Time

**Pattern:** Partition by date (year/month/day)

**Example:**
```
/data/events/
  year=2024/
    month=01/
      day=15/
        events.parquet
```

**Benefits:**
- Efficient time-range queries
- Easy data lifecycle management
- Natural organization

**Use Cases:**
- Event data
- Logs
- Time-series data

#### Partitioning by Category

**Pattern:** Partition by business dimension

**Example:**
```
/data/products/
  category=electronics/
    products.parquet
  category=clothing/
    products.parquet
```

**Benefits:**
- Efficient filtering by category
- Isolated updates
- Clear data organization

**Use Cases:**
- Product catalogs
- Multi-tenant data
- Geographic data

#### Multi-Level Partitioning

**Pattern:** Combine multiple partition keys

**Example:**
```
/data/orders/
  year=2024/
    month=01/
      country=US/
        orders.parquet
```

**Benefits:**
- Multiple query patterns supported
- Fine-grained data management
- Optimal for complex queries

**Considerations:**
- Too many partitions = small files problem
- Balance partition granularity with file size
- Aim for 100MB - 1GB per partition

### Data Layout Optimization

#### File Size

**Best Practices:**
- Target 100MB - 1GB per file
- Avoid many small files (< 10MB)
- Avoid very large files (> 5GB)

**Why It Matters:**
- Small files: Overhead, slow queries
- Large files: Less parallelism, memory pressure

#### Column Ordering

**Strategy:** Order columns by:
1. Filter frequency (most filtered first)
2. Cardinality (low cardinality first)
3. Query patterns

**Example:**
```sql
-- Good: date is frequently filtered
SELECT * FROM events 
WHERE date = '2024-01-15' 
  AND user_id = 12345

-- Column order: date, user_id, event_type, properties
```

#### Compression

**Options:**
- **Snappy:** Fast, moderate compression
- **Gzip:** Better compression, slower
- **Zstd:** Best balance
- **LZ4:** Fastest, less compression

**Choose Based On:**
- Query performance vs storage cost
- CPU availability
- Network bandwidth

---

## 2.4 Schema Evolution and Data Versioning

### Schema Evolution Challenges

Data schemas change over time:
- New fields added
- Fields removed or deprecated
- Data types change
- Business logic evolves

**Problems Without Schema Evolution:**
- Breaking changes break pipelines
- Data becomes inaccessible
- Requires full reprocessing
- High maintenance burden

### Schema Evolution Strategies

#### Backward Compatibility

**Principle:** New schema can read old data

**Techniques:**
- Add new fields as optional
- Don't remove fields (mark as deprecated)
- Use union types for type changes
- Version schemas explicitly

**Example:**
```json
// Old schema
{
  "user_id": "string",
  "email": "string"
}

// New schema (backward compatible)
{
  "user_id": "string",
  "email": "string",
  "phone": "string?"  // Optional field
}
```

#### Forward Compatibility

**Principle:** Old schema can read new data (ignore unknown fields)

**Techniques:**
- Ignore unknown fields
- Use schema registry
- Version-aware readers

#### Schema Registry

**Pattern:** Central registry for schema definitions

**Benefits:**
- Version control for schemas
- Compatibility checking
- Documentation
- Team collaboration

**Tools:**
- Confluent Schema Registry (for Kafka)
- AWS Glue Schema Registry
- Custom solutions

### Data Versioning

#### Time Travel

**Capability:** Query data as it existed at a point in time

**Use Cases:**
- Debugging data issues
- Reproducing past analyses
- Compliance and auditing
- Point-in-time recovery

**Implementation:**
- Delta Lake: Built-in time travel
- Iceberg: Snapshot-based versioning
- Custom: Version tables or partitions

**Example (Delta Lake):**
```sql
-- Query data from 7 days ago
SELECT * FROM events 
VERSION AS OF '2024-01-08'

-- Query data from specific timestamp
SELECT * FROM events 
TIMESTAMP AS OF '2024-01-15 10:00:00'
```

#### Data Lineage

**Capability:** Track data transformations and dependencies

**Benefits:**
- Understand data provenance
- Impact analysis for changes
- Compliance and auditing
- Debugging data issues

**Tools:**
- OpenLineage
- DataHub
- Custom lineage tracking

---

## 2.5 Performance Optimization Strategies

### Query Performance Optimization

#### Partition Pruning

**Strategy:** Design partitions so queries can skip irrelevant data

**Example:**
```sql
-- With good partitioning
SELECT * FROM events 
WHERE date = '2024-01-15'  -- Only scans one partition

-- Without partitioning
SELECT * FROM events 
WHERE date = '2024-01-15'  -- Scans all data
```

#### Column Pruning

**Strategy:** Only read columns needed for query

**Benefits:**
- Less I/O
- Better compression
- Faster queries

**Example:**
```sql
-- Good: Only reads user_id and timestamp
SELECT user_id, timestamp 
FROM events 
WHERE date = '2024-01-15'

-- Bad: Reads all columns
SELECT * 
FROM events 
WHERE date = '2024-01-15'
```

#### Predicate Pushdown

**Strategy:** Apply filters as early as possible

**Benefits:**
- Less data scanned
- Better compression
- Faster processing

**Example:**
```sql
-- Good: Filter applied early
SELECT * FROM events 
WHERE date = '2024-01-15' 
  AND country = 'US'

-- Bad: Filter applied late
SELECT * FROM (
  SELECT * FROM events 
  WHERE date = '2024-01-15'
) 
WHERE country = 'US'
```

### Storage Optimization

#### Compression

**Strategy:** Balance compression ratio with query performance

**Guidelines:**
- Use Snappy or Zstd for hot data
- Use Gzip for cold/archival data
- Test with your actual data

#### Clustering/Sorting

**Strategy:** Co-locate related data

**Benefits:**
- Better compression
- Faster range queries
- Efficient joins

**Example:**
```sql
-- Clustered by user_id and timestamp
-- Queries filtering by user_id are faster
CLUSTER BY user_id, timestamp
```

### Caching Strategies

#### Query Result Caching

**Strategy:** Cache frequently accessed query results

**Benefits:**
- Faster repeated queries
- Reduced compute costs
- Better user experience

**Considerations:**
- Cache invalidation strategy
- Memory vs disk caching
- TTL policies

#### Metadata Caching

**Strategy:** Cache table metadata and statistics

**Benefits:**
- Faster query planning
- Better optimization decisions
- Reduced metadata API calls

---

## Hands-On Exercise: Design a Warehouse or Lakehouse Schema

### Objective

Design a storage architecture that balances performance, flexibility, and cost for analytics and ML.

### Scenario

You're designing storage for an e-commerce platform with:
- 100M orders per year
- 10M products
- 50M customers
- Real-time inventory updates
- Historical data going back 5 years
- Use cases: BI dashboards, ML feature engineering, ad-hoc analysis

### Exercise Steps

1. **Analyze Workloads**
   - List all query patterns
   - Identify latency requirements
   - Determine data freshness needs

2. **Choose Storage Architecture**
   - Warehouse, Lake, or Lakehouse?
   - Justify your choice

3. **Design Schema**
   - Choose table formats
   - Design partitioning strategy
   - Define column ordering
   - Plan for schema evolution

4. **Optimize for Performance**
   - Identify optimization opportunities
   - Design clustering/sorting strategy
   - Plan caching approach

5. **Plan for Scale**
   - Estimate storage growth
   - Plan for data lifecycle
   - Design cost optimization strategy

### Deliverable

A storage architecture design that includes:
- Architecture diagram
- Schema design with partitioning
- Performance optimization plan
- Cost estimation
- Evolution strategy

---

## Module Summary

### Key Takeaways

- **Workload type matters:**: OLTP, OLAP, and analytical workloads have different requirements
- **Storage choice depends on use case:**: Warehouses for BI, lakes for flexibility, lakehouses for both
- **Partitioning and layout**: Significantly impact query performance
- **Schema evolution**: Is essential for long-lived platforms
- **Performance optimization**: Requires understanding query patterns and data characteristics

### Next Steps

In Module 3, we'll learn how to move data reliably through batch and streaming pipelines.

---

## Additional Resources

- "The Data Warehouse Toolkit" by Ralph Kimball
- Delta Lake documentation
- Apache Iceberg specification
- "Designing Data-Intensive Applications" by Martin Kleppmann
