---
title: "Module 3: Data Ingestion & Indexing"
description: "Master batch ingestion, HNSW indexing, and handling large-scale datasets"
module: "3"
order: 3
---

# Module 3: Data Ingestion & Indexing

**Duration:** Week 3  
**Learning Objectives:**
- Implement efficient batch ingestion patterns
- Understand HNSW indexing fundamentals
- Configure consistency and replication
- Handle large-scale dataset ingestion
- Benchmark and optimize query performance

---

## Lesson 3.1: Batch Ingestion

### Why Batch Ingestion?

**Single Object Insertion:**
- Slow for large datasets
- High overhead per request
- Not suitable for production

**Batch Ingestion:**
- Much faster (10-100x)
- Lower overhead
- Production-ready pattern

### Batch API Overview

**Weaviate Batch API:**
- Groups multiple operations
- Automatic retry on failure
- Configurable batch size
- Progress tracking

**Basic Pattern:**
```python
with client.batch as batch:
    batch.batch_size = 100
    for item in data:
        batch.add_data_object(
            data_object=item,
            class_name="Article"
        )
```

### Batch Configuration

**Key Parameters:**

1. **batch_size:**
   - Number of objects per batch
   - Default: 100
   - Optimal: 50-200 (depends on object size)

2. **batch_creation_timeout:**
   - Time to wait for batch creation
   - Default: 20 seconds
   - Increase for large objects

3. **batch_dynamic:**
   - Auto-adjust batch size
   - Default: False
   - Enable for variable object sizes

**Example Configuration:**
```python
with client.batch(
    batch_size=100,
    creation_time=20,
    timeout_retries=3,
    dynamic=True
) as batch:
    # Add objects
    pass
```

### Batch Ingestion Patterns

**Pattern 1: Simple Batch**
```python
def ingest_articles(articles):
    with client.batch as batch:
        batch.batch_size = 100
        for article in articles:
            batch.add_data_object(
                data_object=article,
                class_name="Article"
            )
```

**Pattern 2: With Error Handling**
```python
def ingest_articles_safe(articles):
    with client.batch(
        batch_size=100,
        timeout_retries=3
    ) as batch:
        for i, article in enumerate(articles):
            try:
                batch.add_data_object(
                    data_object=article,
                    class_name="Article"
                )
            except Exception as e:
                print(f"Error at index {i}: {e}")
                # Continue or break based on requirements
```

**Pattern 3: With Progress Tracking**
```python
def ingest_articles_with_progress(articles):
    total = len(articles)
    with client.batch(batch_size=100) as batch:
        for i, article in enumerate(articles):
            batch.add_data_object(
                data_object=article,
                class_name="Article"
            )
            if (i + 1) % 1000 == 0:
                print(f"Progress: {i+1}/{total} ({100*(i+1)/total:.1f}%)")
```

### Optimizing Batch Size

**Factors to Consider:**

1. **Object Size:**
   - Small objects → Larger batches (200+)
   - Large objects → Smaller batches (50-100)

2. **Network Latency:**
   - High latency → Larger batches
   - Low latency → Smaller batches

3. **Memory:**
   - Limited memory → Smaller batches
   - Ample memory → Larger batches

**Finding Optimal Batch Size:**
```python
def find_optimal_batch_size(data, sizes=[50, 100, 200, 500]):
    import time
    results = {}
    
    for size in sizes:
        start = time.time()
        with client.batch(batch_size=size) as batch:
            for item in data[:1000]:  # Test with subset
                batch.add_data_object(item, "Article")
        elapsed = time.time() - start
        results[size] = elapsed
        print(f"Batch size {size}: {elapsed:.2f}s")
    
    return min(results, key=results.get)
```

### Handling Failures

**Common Failure Scenarios:**

1. **Network Timeouts:**
   - Increase timeout
   - Retry with exponential backoff

2. **Validation Errors:**
   - Check data format
   - Verify schema compatibility

3. **Rate Limiting:**
   - Reduce batch size
   - Add delays between batches

**Retry Strategy:**
```python
def ingest_with_retry(articles, max_retries=3):
    for attempt in range(max_retries):
        try:
            with client.batch(batch_size=100) as batch:
                for article in articles:
                    batch.add_data_object(article, "Article")
            print("Ingestion successful!")
            return
        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt
                print(f"Attempt {attempt+1} failed. Retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise
```

---

## Lesson 3.2: HNSW Indexing Fundamentals

### What is HNSW?

**HNSW (Hierarchical Navigable Small World):**
- Graph-based approximate nearest neighbor algorithm
- Fast and accurate
- Used by Weaviate by default
- Production-proven

### How HNSW Works

**Core Concept:**
- Builds multi-layer graph
- Upper layers: Fewer nodes, long-range connections
- Lower layers: All nodes, short-range connections
- Search starts at top, navigates down

**Visual Representation:**
```
Layer 2:     A -------- B
             |
Layer 1:     A --- C --- B --- D
             |     |     |     |
Layer 0:  A-C-B-D-E-F-G-H-I-J-K-L
         (All nodes, dense connections)
```

**Search Process:**
1. Start at top layer
2. Find nearest neighbor
3. Move to lower layer
4. Refine search
5. Repeat until bottom layer

### HNSW Parameters

**Key Configuration Options:**

1. **efConstruction:**
   - Controls index quality
   - Higher = better quality, slower build
   - Range: 64-512
   - Default: 128

2. **maxConnections:**
   - Max connections per node
   - Higher = better recall, more memory
   - Range: 4-64
   - Default: 16

3. **ef:**
   - Search quality parameter
   - Higher = better recall, slower queries
   - Range: 4-512
   - Default: 128

**Configuration Example:**
```python
{
  "class": "Article",
  "vectorIndexType": "hnsw",
  "vectorIndexConfig": {
    "efConstruction": 128,
    "maxConnections": 16,
    "ef": 128,
    "distance": "cosine"
  }
}
```

### Choosing Parameters

**High Quality (Slower):**
```python
{
  "efConstruction": 256,
  "maxConnections": 32,
  "ef": 256
}
```

**Fast (Lower Quality):**
```python
{
  "efConstruction": 64,
  "maxConnections": 8,
  "ef": 64
}
```

**Balanced (Recommended):**
```python
{
  "efConstruction": 128,
  "maxConnections": 16,
  "ef": 128
}
```

### Index Building Time

**Factors Affecting Build Time:**
- Number of vectors
- Vector dimension
- efConstruction value
- Hardware (CPU, memory)

**Estimates:**
- 1M vectors (384 dim): ~10-30 minutes
- 10M vectors (384 dim): ~2-6 hours
- 100M vectors (384 dim): ~20-60 hours

**Optimization Tips:**
- Start with lower efConstruction
- Increase after initial build if needed
- Use parallel ingestion if possible

---

## Lesson 3.3: Consistency and Replication

### Consistency Levels

**Eventual Consistency:**
- Default in Weaviate
- Writes may not be immediately visible
- Good for high-throughput
- Suitable for most use cases

**Strong Consistency:**
- Writes immediately visible
- Slower writes
- Use when needed

**Configuration:**
```python
{
  "class": "Article",
  "replicationConfig": {
    "factor": 3,  # Number of replicas
    "consistencyLevel": "ONE"  # or "QUORUM", "ALL"
  }
}
```

### Replication

**What is Replication?**
- Multiple copies of data
- Improves availability
- Enables load distribution

**Replication Factor:**
- Number of copies
- Higher = better availability
- Trade-off: More storage, slower writes

**Replication Levels:**
- `ONE`: Read from any replica (fastest)
- `QUORUM`: Read from majority (balanced)
- `ALL`: Read from all replicas (slowest, most consistent)

### Multi-Node Setup

**Cluster Configuration:**
```yaml
# docker-compose.yml for cluster
services:
  weaviate-node1:
    environment:
      CLUSTER_HOSTNAME: 'node1'
      CLUSTER_GOSSIP_BIND_PORT: '7100'
      CLUSTER_DATA_BIND_PORT: '7101'
  
  weaviate-node2:
    environment:
      CLUSTER_HOSTNAME: 'node2'
      CLUSTER_GOSSIP_BIND_PORT: '7100'
      CLUSTER_DATA_BIND_PORT: '7101'
```

**Benefits:**
- Horizontal scaling
- High availability
- Load distribution

---

## Lesson 3.4: Handling Large-Scale Datasets

### Ingestion Strategies

**Strategy 1: Incremental Ingestion**
```python
def incremental_ingest(data_source, checkpoint_file):
    # Load checkpoint
    last_processed = load_checkpoint(checkpoint_file)
    
    # Process new data
    new_data = get_data_since(data_source, last_processed)
    
    # Ingest
    ingest_articles(new_data)
    
    # Update checkpoint
    save_checkpoint(checkpoint_file, get_latest_timestamp(new_data))
```

**Strategy 2: Parallel Ingestion**
```python
from concurrent.futures import ThreadPoolExecutor

def parallel_ingest(data_chunks, num_workers=4):
    def ingest_chunk(chunk):
        with client.batch(batch_size=100) as batch:
            for item in chunk:
                batch.add_data_object(item, "Article")
    
    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        executor.map(ingest_chunk, data_chunks)
```

**Strategy 3: Streaming Ingestion**
```python
def stream_ingest(data_stream, batch_size=100):
    batch_buffer = []
    
    for item in data_stream:
        batch_buffer.append(item)
        
        if len(batch_buffer) >= batch_size:
            with client.batch(batch_size=batch_size) as batch:
                for obj in batch_buffer:
                    batch.add_data_object(obj, "Article")
            batch_buffer = []
    
    # Process remaining
    if batch_buffer:
        with client.batch(batch_size=len(batch_buffer)) as batch:
            for obj in batch_buffer:
                batch.add_data_object(obj, "Article")
```

### Monitoring Ingestion

**Key Metrics:**
- Objects per second
- Error rate
- Batch completion time
- Memory usage

**Monitoring Script:**
```python
import time
from collections import deque

class IngestionMonitor:
    def __init__(self, window_size=100):
        self.timings = deque(maxlen=window_size)
        self.errors = 0
        self.total = 0
    
    def record_batch(self, size, elapsed):
        self.timings.append((size, elapsed))
        self.total += size
        rate = size / elapsed if elapsed > 0 else 0
        print(f"Batch: {size} objects in {elapsed:.2f}s ({rate:.1f} obj/s)")
    
    def record_error(self):
        self.errors += 1
    
    def get_stats(self):
        if not self.timings:
            return {}
        
        total_time = sum(t for _, t in self.timings)
        total_objects = sum(s for s, _ in self.timings)
        avg_rate = total_objects / total_time if total_time > 0 else 0
        
        return {
            "total_objects": self.total,
            "errors": self.errors,
            "avg_rate": avg_rate,
            "error_rate": self.errors / self.total if self.total > 0 else 0
        }
```

### Data Validation

**Pre-Ingestion Validation:**
```python
def validate_article(article):
    required_fields = ["title", "content", "author"]
    
    for field in required_fields:
        if field not in article:
            raise ValueError(f"Missing required field: {field}")
    
    if not isinstance(article["title"], str) or len(article["title"]) == 0:
        raise ValueError("Title must be non-empty string")
    
    if len(article["content"]) < 10:
        raise ValueError("Content too short")
    
    return True

def ingest_with_validation(articles):
    valid_articles = []
    invalid_count = 0
    
    for article in articles:
        try:
            validate_article(article)
            valid_articles.append(article)
        except ValueError as e:
            print(f"Invalid article: {e}")
            invalid_count += 1
    
    print(f"Valid: {len(valid_articles)}, Invalid: {invalid_count}")
    
    # Ingest valid articles
    ingest_articles(valid_articles)
```

---

## Lab 3: Ingest Document Corpus and Benchmark Performance

### Objectives
- Ingest a large document corpus
- Implement batch ingestion
- Benchmark query performance
- Optimize ingestion parameters

### Step 1: Prepare Dataset

**Download or Generate Sample Data:**
```python
import json
import random

def generate_sample_articles(count=10000):
    titles = [
        "Introduction to Machine Learning",
        "Deep Learning Fundamentals",
        "Natural Language Processing",
        "Computer Vision Basics",
        "Reinforcement Learning",
        # Add more titles...
    ]
    
    authors = ["Alice", "Bob", "Charlie", "Diana", "Eve"]
    categories = ["AI", "ML", "NLP", "CV", "RL"]
    
    articles = []
    for i in range(count):
        articles.append({
            "title": f"{random.choice(titles)} - Part {i}",
            "content": f"This is article content {i}. " * 50,  # Simulate content
            "author": random.choice(authors),
            "category": random.choice(categories),
            "publishedDate": f"2024-{(i % 12) + 1:02d}-{(i % 28) + 1:02d}T00:00:00Z"
        })
    
    return articles

# Generate dataset
articles = generate_sample_articles(10000)
```

### Step 2: Implement Batch Ingestion

**Create Ingestion Function:**
```python
def ingest_articles_batch(articles, batch_size=100):
    monitor = IngestionMonitor()
    total = len(articles)
    
    with client.batch(batch_size=batch_size) as batch:
        for i, article in enumerate(articles):
            try:
                batch.add_data_object(
                    data_object=article,
                    class_name="Article"
                )
                
                if (i + 1) % batch_size == 0:
                    elapsed = time.time() - start if 'start' in locals() else 0
                    monitor.record_batch(batch_size, elapsed)
                    start = time.time()
            except Exception as e:
                monitor.record_error()
                print(f"Error at {i}: {e}")
    
    return monitor.get_stats()
```

### Step 3: Benchmark Different Batch Sizes

**Test Multiple Configurations:**
```python
batch_sizes = [50, 100, 200, 500]
results = {}

for batch_size in batch_sizes:
    print(f"\nTesting batch size: {batch_size}")
    
    # Clear existing data
    try:
        client.schema.delete_class("Article")
    except:
        pass
    
    # Recreate schema
    create_article_schema()
    
    # Time ingestion
    start = time.time()
    stats = ingest_articles_batch(articles, batch_size)
    elapsed = time.time() - start
    
    results[batch_size] = {
        "time": elapsed,
        "rate": len(articles) / elapsed,
        **stats
    }
    
    print(f"Completed in {elapsed:.2f}s ({len(articles)/elapsed:.1f} obj/s)")

# Compare results
print("\n=== Results Comparison ===")
for size, result in results.items():
    print(f"Batch {size}: {result['rate']:.1f} obj/s, {result['time']:.2f}s")
```

### Step 4: Benchmark Query Performance

**Test Query Speed:**
```python
import time

def benchmark_queries(num_queries=100):
    query_times = []
    
    for i in range(num_queries):
        start = time.time()
        
        # Random semantic query
        response = (
            client.query
            .get("Article", ["title", "author"])
            .with_near_text({"concepts": ["machine learning"]})
            .with_limit(10)
            .do()
        )
        
        elapsed = time.time() - start
        query_times.append(elapsed)
    
    return {
        "avg": sum(query_times) / len(query_times),
        "min": min(query_times),
        "max": max(query_times),
        "p95": sorted(query_times)[int(len(query_times) * 0.95)],
        "p99": sorted(query_times)[int(len(query_times) * 0.99)]
    }

# Run benchmark
print("Benchmarking queries...")
query_stats = benchmark_queries(100)
print(f"Average: {query_stats['avg']*1000:.2f}ms")
print(f"P95: {query_stats['p95']*1000:.2f}ms")
print(f"P99: {query_stats['p99']*1000:.2f}ms")
```

### Step 5: Optimize HNSW Parameters

**Test Different Configurations:**
```python
def test_hnsw_config(ef_construction, max_connections, ef):
    # Delete and recreate with new config
    client.schema.delete_class("Article")
    
    schema = {
        "class": "Article",
        "vectorizer": "text2vec-openai",
        "vectorIndexType": "hnsw",
        "vectorIndexConfig": {
            "efConstruction": ef_construction,
            "maxConnections": max_connections,
            "ef": ef,
            "distance": "cosine"
        },
        "properties": [...]  # Your properties
    }
    
    client.schema.create_class(schema)
    
    # Ingest sample
    start = time.time()
    ingest_articles_batch(articles[:1000], batch_size=100)
    ingest_time = time.time() - start
    
    # Benchmark queries
    query_stats = benchmark_queries(50)
    
    return {
        "ingest_time": ingest_time,
        "query_avg": query_stats["avg"],
        "query_p95": query_stats["p95"]
    }

# Test configurations
configs = [
    (64, 8, 64),   # Fast
    (128, 16, 128), # Balanced
    (256, 32, 256)  # High quality
]

for config in configs:
    print(f"\nTesting config: {config}")
    results = test_hnsw_config(*config)
    print(f"Ingest: {results['ingest_time']:.2f}s, Query: {results['query_avg']*1000:.2f}ms")
```

### Lab Deliverables

**Submit:**
1. Ingestion script with batch processing
2. Performance benchmarks (ingestion rate, query latency)
3. Analysis of optimal batch size
4. Comparison of HNSW configurations
5. Recommendations for production setup

---

## Summary

**Key Takeaways:**
- Batch ingestion is essential for performance
- HNSW parameters balance quality and speed
- Consistency and replication affect availability
- Large-scale ingestion requires careful planning
- Monitoring and validation are critical

**What's Next:**
- Module 4: Learn semantic and hybrid search
- Implement advanced query patterns
- Combine vector and keyword search

---

## Additional Resources

- [Weaviate Batch API](https://weaviate.io/developers/weaviate/manage-data/import)
- [HNSW Algorithm Paper](https://arxiv.org/abs/1603.09320)
- [Performance Tuning Guide](https://weaviate.io/developers/weaviate/performance)
- [Replication Documentation](https://weaviate.io/developers/weaviate/cluster/replication)

---

**Ready for Module 4? Let's explore semantic and hybrid search!**
