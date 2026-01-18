---
title: "Module 4: Semantic & Hybrid Search"
description: "Master semantic search, hybrid search, and advanced query patterns"
module: "4"
order: 4
---

# Module 4: Semantic & Hybrid Search

**Duration:** Week 4  
**Learning Objectives:**
- **semantic search with nearText, nearVector, and nearObject Implementation**: Implement semantic search with nearText, nearVector, and nearObject
- **keyword vs semantic search trade-offs Understanding**: Understand keyword vs semantic search trade-offs
- **hybrid search with alpha tuning Development**: Build hybrid search with alpha tuning
- **Apply Filters**: Apply filters and metadata constraints
- **search result quality Analysis**: Compare search result quality

---

## Lesson 4.1: nearVector, nearText, and nearObject

### Understanding Query Types

**Three Main Query Types:**
1. **nearVector:** Search by vector directly
2. **nearText:** Search by text (auto-vectorized)
3. **nearObject:** Search by object ID (find similar)

### nearVector Queries

**When to Use:**
- You have pre-computed vectors
- Custom embedding models
- Performance optimization
- Consistent embedding source

**Basic Syntax:**
```python
response = (
    client.query
    .get("Article", ["title", "content"])
    .with_near_vector({
        "vector": query_vector,
        "certainty": 0.7  # or "distance": 0.3
    })
    .with_limit(10)
    .do()
)
```

**Example:**
```python
import openai

# Generate query embedding
def get_embedding(text):
    response = openai.Embedding.create(
        input=text,
        model="text-embedding-ada-002"
    )
    return response['data'][0]['embedding']

# Query with vector
query_text = "machine learning algorithms"
query_vector = get_embedding(query_text)

response = (
    client.query
    .get("Article", ["title", "content"])
    .with_near_vector({
        "vector": query_vector,
        "certainty": 0.7
    })
    .with_limit(10)
    .do()
)

articles = response['data']['Get']['Article']
for article in articles:
    print(f"- {article['title']}")
```

### nearText Queries

**When to Use:**
- Natural language queries
- Using Weaviate's vectorizer
- Simpler implementation
- User-facing search

**Basic Syntax:**
```python
response = (
    client.query
    .get("Article", ["title", "content"])
    .with_near_text({
        "concepts": ["machine learning"],
        "certainty": 0.7
    })
    .with_limit(10)
    .do()
)
```

**Advanced Options:**
```python
response = (
    client.query
    .get("Article", ["title", "content"])
    .with_near_text({
        "concepts": ["machine learning", "neural networks"],
        "moveTo": {
            "concepts": ["deep learning"],
            "force": 0.3
        },
        "moveAway": {
            "concepts": ["statistics"],
            "force": 0.2
        },
        "certainty": 0.7
    })
    .with_limit(10)
    .do()
)
```

**Concept Movement:**
- **moveTo:** Boost results closer to these concepts
- **moveAway:** Reduce results closer to these concepts
- **force:** Strength of movement (0.0-1.0)

### nearObject Queries

**When to Use:**
- "Find similar items"
- Recommendation systems
- Related content discovery
- User-based recommendations

**Basic Syntax:**
```python
response = (
    client.query
    .get("Article", ["title", "content"])
    .with_near_object({
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "certainty": 0.7
    })
    .with_limit(10)
    .do()
)
```

**Example: Find Similar Articles:**
```python
def find_similar_articles(article_id, limit=10):
    response = (
        client.query
        .get("Article", ["title", "author", "category"])
        .with_near_object({
            "id": article_id,
            "certainty": 0.7
        })
        .with_limit(limit)
        .do()
    )
    
    return response['data']['Get']['Article']

# Usage
similar = find_similar_articles("550e8400-e29b-41d4-a716-446655440000")
for article in similar:
    print(f"- {article['title']}")
```

### Distance vs Certainty

**Certainty:**
- Range: 0.0 to 1.0
- Higher = more similar
- Easier to understand
- Weaviate converts to distance internally

**Distance:**
- Range: 0.0 to 2.0 (for cosine)
- Lower = more similar
- More precise control
- Model-specific

**Conversion:**
```python
# Certainty to distance (cosine)
distance = 1 - certainty

# Distance to certainty (cosine)
certainty = 1 - distance
```

---

## Lesson 4.2: Keyword vs Semantic Search

### Keyword Search

**How It Works:**
- Exact or fuzzy text matching
- Inverted index lookup
- Fast and precise
- Limited to exact matches

**Example:**
```python
# Keyword search (using BM25)
response = (
    client.query
    .get("Article", ["title", "content"])
    .with_bm25(
        query="machine learning",
        properties=["title^2", "content"]  # title weighted 2x
    )
    .with_limit(10)
    .do()
)
```

**Strengths:**
- Fast execution
- Exact matches
- Good for specific terms
- Familiar to users

**Weaknesses:**
- Misses synonyms
- No semantic understanding
- Requires exact wording
- Limited context awareness

### Semantic Search

**How It Works:**
- Vector similarity search
- Understands meaning
- Finds conceptually similar content
- Language-agnostic (to some extent)

**Example:**
```python
# Semantic search
response = (
    client.query
    .get("Article", ["title", "content"])
    .with_near_text({
        "concepts": ["machine learning"]
    })
    .with_limit(10)
    .do()
)
```

**Strengths:**
- Understands meaning
- Finds synonyms
- Context-aware
- Natural language queries

**Weaknesses:**
- Can be slower
- May miss exact matches
- Requires good embeddings
- Less predictable results

### Comparison Example

**Query: "Python programming tutorial"**

**Keyword Search Results:**
1. "Python Programming Tutorial" (exact match)
2. "Python Code Examples" (contains "Python")
3. "Programming in Python" (contains both words)

**Semantic Search Results:**
1. "Learn Python Coding" (semantically similar)
2. "Python Programming Tutorial" (exact match)
3. "Introduction to Python" (conceptually similar)
4. "Coding with Python" (semantically similar)

**Key Difference:**
- Keyword: Requires exact word match
- Semantic: Understands "programming" ≈ "coding" ≈ "development"

---

## Lesson 4.3: Hybrid Search and Alpha Tuning

### What is Hybrid Search?

**Combining Best of Both:**
- Keyword search (BM25) for exact matches
- Semantic search (vector) for meaning
- Weighted combination of results
- Better relevance than either alone

### How Hybrid Search Works

**Scoring:**
```
final_score = alpha × semantic_score + (1 - alpha) × keyword_score
```

**Alpha Parameter:**
- `alpha = 0.0`: Pure keyword search
- `alpha = 0.5`: Balanced (default)
- `alpha = 1.0`: Pure semantic search

### Implementing Hybrid Search

**Basic Hybrid Query:**
```python
response = (
    client.query
    .get("Article", ["title", "content"])
    .with_hybrid(
        query="machine learning algorithms",
        alpha=0.5,  # 50% semantic, 50% keyword
        properties=["title^2", "content"]
    )
    .with_limit(10)
    .do()
)
```

**Advanced Hybrid Query:**
```python
response = (
    client.query
    .get("Article", ["title", "content", "author"])
    .with_hybrid(
        query="deep learning neural networks",
        alpha=0.7,  # 70% semantic, 30% keyword
        properties=["title^3", "content^2", "author"],  # Weighted properties
        vector=optional_custom_vector  # Optional: custom query vector
    )
    .with_limit(10)
    .do()
)
```

### Alpha Tuning

**Finding Optimal Alpha:**

**Step 1: Test Different Values**
```python
def test_alpha_values(query, alphas=[0.0, 0.3, 0.5, 0.7, 1.0]):
    results = {}
    
    for alpha in alphas:
        response = (
            client.query
            .get("Article", ["title", "content"])
            .with_hybrid(
                query=query,
                alpha=alpha,
                properties=["title^2", "content"]
            )
            .with_limit(10)
            .do()
        )
        
        results[alpha] = response['data']['Get']['Article']
        print(f"Alpha {alpha}: {len(results[alpha])} results")
    
    return results
```

**Step 2: Evaluate Relevance**
```python
def evaluate_relevance(results, ground_truth):
    """
    Compare results against known relevant documents
    Returns precision, recall, F1 score
    """
    retrieved_ids = {r['_additional']['id'] for r in results}
    relevant_ids = set(ground_truth)
    
    true_positives = retrieved_ids & relevant_ids
    precision = len(true_positives) / len(retrieved_ids) if retrieved_ids else 0
    recall = len(true_positives) / len(relevant_ids) if relevant_ids else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    return {"precision": precision, "recall": recall, "f1": f1}
```

**Step 3: Choose Best Alpha**
```python
def find_optimal_alpha(queries_with_ground_truth):
    alpha_scores = {}
    
    for alpha in [0.0, 0.2, 0.4, 0.5, 0.6, 0.8, 1.0]:
        total_f1 = 0
        for query, ground_truth in queries_with_ground_truth:
            results = test_alpha_values(query, [alpha])[alpha]
            metrics = evaluate_relevance(results, ground_truth)
            total_f1 += metrics['f1']
        
        alpha_scores[alpha] = total_f1 / len(queries_with_ground_truth)
        print(f"Alpha {alpha}: F1 = {alpha_scores[alpha]:.3f}")
    
    optimal = max(alpha_scores, key=alpha_scores.get)
    print(f"\nOptimal alpha: {optimal}")
    return optimal
```

### When to Use Each Approach

**Pure Keyword (alpha=0.0):**
- Exact term matching needed
- Technical documentation
- Code search
- Known specific terms

**Pure Semantic (alpha=1.0):**
- Natural language queries
- Conceptual search
- Multilingual content
- User-generated content

**Hybrid (alpha=0.3-0.7):**
- General-purpose search
- E-commerce
- Content platforms
- Most production use cases

---

## Lesson 4.4: Filters and Metadata Constraints

### Why Filters Matter

**Combining Search with Filters:**
- Semantic search finds relevant content
- Filters narrow to specific criteria
- Better user experience
- More precise results

### Basic Filtering

**Where Clause:**
```python
response = (
    client.query
    .get("Article", ["title", "author", "category"])
    .with_near_text({
        "concepts": ["machine learning"]
    })
    .with_where({
        "path": ["category"],
        "operator": "Equal",
        "valueString": "AI"
    })
    .with_limit(10)
    .do()
)
```

### Filter Operators

**Comparison Operators:**
- `Equal`: Exact match
- `NotEqual`: Not equal
- `GreaterThan`: >
- `GreaterThanEqual`: >=
- `LessThan`: <
- `LessThanEqual`: <=

**Example: Date Range Filter:**
```python
response = (
    client.query
    .get("Article", ["title", "publishedDate"])
    .with_near_text({
        "concepts": ["AI"]
    })
    .with_where({
        "path": ["publishedDate"],
        "operator": "GreaterThanEqual",
        "valueDate": "2024-01-01T00:00:00Z"
    })
    .with_limit(10)
    .do()
)
```

### Complex Filters

**AND Conditions:**
```python
response = (
    client.query
    .get("Article", ["title", "author", "category"])
    .with_near_text({
        "concepts": ["machine learning"]
    })
    .with_where({
        "operator": "And",
        "operands": [
            {
                "path": ["category"],
                "operator": "Equal",
                "valueString": "AI"
            },
            {
                "path": ["publishedDate"],
                "operator": "GreaterThanEqual",
                "valueDate": "2024-01-01T00:00:00Z"
            }
        ]
    })
    .with_limit(10)
    .do()
)
```

**OR Conditions:**
```python
response = (
    client.query
    .get("Article", ["title", "category"])
    .with_near_text({
        "concepts": ["programming"]
    })
    .with_where({
        "operator": "Or",
        "operands": [
            {
                "path": ["category"],
                "operator": "Equal",
                "valueString": "Programming"
            },
            {
                "path": ["category"],
                "operator": "Equal",
                "valueString": "Technology"
            }
        ]
    })
    .with_limit(10)
    .do()
)
```

### Filtering on Arrays

**Contains Any:**
```python
response = (
    client.query
    .get("Article", ["title", "tags"])
    .with_near_text({
        "concepts": ["AI"]
    })
    .with_where({
        "path": ["tags"],
        "operator": "ContainsAny",
        "valueStringArray": ["machine-learning", "deep-learning"]
    })
    .with_limit(10)
    .do()
)
```

**Contains All:**
```python
response = (
    client.query
    .get("Article", ["title", "tags"])
    .with_near_text({
        "concepts": ["AI"]
    })
    .with_where({
        "path": ["tags"],
        "operator": "ContainsAll",
        "valueStringArray": ["python", "tutorial"]
    })
    .with_limit(10)
    .do()
)
```

### Combining Search and Filters

**Best Practices:**
1. Use semantic/hybrid search for relevance
2. Use filters for constraints
3. Apply filters after search (more efficient)
4. Index filterable properties

**Example: E-commerce Search:**
```python
def search_products(query, category=None, min_price=None, max_price=None):
    query_builder = (
        client.query
        .get("Product", ["name", "description", "price", "category"])
        .with_hybrid(
            query=query,
            alpha=0.6,
            properties=["name^3", "description^2"]
        )
    )
    
    # Build filter conditions
    conditions = []
    
    if category:
        conditions.append({
            "path": ["category"],
            "operator": "Equal",
            "valueString": category
        })
    
    if min_price is not None:
        conditions.append({
            "path": ["price"],
            "operator": "GreaterThanEqual",
            "valueNumber": min_price
        })
    
    if max_price is not None:
        conditions.append({
            "path": ["price"],
            "operator": "LessThanEqual",
            "valueNumber": max_price
        })
    
    # Apply filters
    if conditions:
        if len(conditions) == 1:
            query_builder = query_builder.with_where(conditions[0])
        else:
            query_builder = query_builder.with_where({
                "operator": "And",
                "operands": conditions
            })
    
    response = query_builder.with_limit(20).do()
    return response['data']['Get']['Product']
```

---

## Lab 4: Build Semantic Document Search Engine

### Objectives
- Build a complete semantic search system
- Compare keyword vs hybrid search
- Implement filtering
- Evaluate search quality

### Step 1: Setup Document Corpus

**Prepare Documents:**
```python
# Load or generate document corpus
documents = [
    {
        "title": "Introduction to Machine Learning",
        "content": "Machine learning is a subset of artificial intelligence...",
        "category": "AI",
        "tags": ["machine-learning", "ai", "basics"],
        "author": "Dr. Smith",
        "publishedDate": "2024-01-15T00:00:00Z"
    },
    # Add more documents...
]

# Create schema
schema = {
    "class": "Document",
    "vectorizer": "text2vec-openai",
    "properties": [
        {"name": "title", "dataType": ["string"]},
        {"name": "content", "dataType": ["text"]},
        {"name": "category", "dataType": ["string"]},
        {"name": "tags", "dataType": ["string[]"]},
        {"name": "author", "dataType": ["string"]},
        {"name": "publishedDate", "dataType": ["date"]}
    ]
}

client.schema.create_class(schema)

# Ingest documents
with client.batch(batch_size=100) as batch:
    for doc in documents:
        batch.add_data_object(doc, "Document")
```

### Step 2: Implement Search Functions

**Keyword Search:**
```python
def keyword_search(query, limit=10, filters=None):
    query_builder = (
        client.query
        .get("Document", ["title", "content", "category", "author"])
        .with_bm25(
            query=query,
            properties=["title^3", "content^2"]
        )
    )
    
    if filters:
        query_builder = query_builder.with_where(filters)
    
    response = query_builder.with_limit(limit).do()
    return response['data']['Get']['Document']
```

**Semantic Search:**
```python
def semantic_search(query, limit=10, filters=None):
    query_builder = (
        client.query
        .get("Document", ["title", "content", "category", "author"])
        .with_near_text({
            "concepts": [query],
            "certainty": 0.7
        })
    )
    
    if filters:
        query_builder = query_builder.with_where(filters)
    
    response = query_builder.with_limit(limit).do()
    return response['data']['Get']['Document']
```

**Hybrid Search:**
```python
def hybrid_search(query, alpha=0.5, limit=10, filters=None):
    query_builder = (
        client.query
        .get("Document", ["title", "content", "category", "author"])
        .with_hybrid(
            query=query,
            alpha=alpha,
            properties=["title^3", "content^2"]
        )
    )
    
    if filters:
        query_builder = query_builder.with_where(filters)
    
    response = query_builder.with_limit(limit).do()
    return response['data']['Get']['Document']
```

### Step 3: Compare Search Methods

**Test Queries:**
```python
test_queries = [
    "machine learning algorithms",
    "neural network training",
    "Python programming tutorial",
    "deep learning applications"
]

def compare_search_methods(queries):
    results = {}
    
    for query in queries:
        print(f"\n=== Query: '{query}' ===")
        
        # Keyword
        keyword_results = keyword_search(query, limit=5)
        print(f"Keyword: {len(keyword_results)} results")
        for r in keyword_results[:3]:
            print(f"  - {r['title']}")
        
        # Semantic
        semantic_results = semantic_search(query, limit=5)
        print(f"Semantic: {len(semantic_results)} results")
        for r in semantic_results[:3]:
            print(f"  - {r['title']}")
        
        # Hybrid
        hybrid_results = hybrid_search(query, alpha=0.5, limit=5)
        print(f"Hybrid: {len(hybrid_results)} results")
        for r in hybrid_results[:3]:
            print(f"  - {r['title']}")
        
        results[query] = {
            "keyword": keyword_results,
            "semantic": semantic_results,
            "hybrid": hybrid_results
        }
    
    return results
```

### Step 4: Test Alpha Tuning

**Find Optimal Alpha:**
```python
def test_alpha_tuning(query, alphas=[0.0, 0.3, 0.5, 0.7, 1.0]):
    print(f"\nTesting alpha values for: '{query}'")
    
    for alpha in alphas:
        results = hybrid_search(query, alpha=alpha, limit=10)
        print(f"Alpha {alpha}: {len(results)} results")
        
        # Show top 3
        for i, r in enumerate(results[:3], 1):
            print(f"  {i}. {r['title']}")
```

### Step 5: Implement Filtering

**Search with Filters:**
```python
def search_with_filters(query, category=None, author=None, date_from=None):
    filters = []
    
    if category:
        filters.append({
            "path": ["category"],
            "operator": "Equal",
            "valueString": category
        })
    
    if author:
        filters.append({
            "path": ["author"],
            "operator": "Equal",
            "valueString": author
        })
    
    if date_from:
        filters.append({
            "path": ["publishedDate"],
            "operator": "GreaterThanEqual",
            "valueDate": date_from
        })
    
    where_clause = None
    if len(filters) == 1:
        where_clause = filters[0]
    elif len(filters) > 1:
        where_clause = {
            "operator": "And",
            "operands": filters
        }
    
    return hybrid_search(query, alpha=0.6, limit=20, filters=where_clause)
```

### Lab Deliverables

**Submit:**
1. Complete search implementation
2. Comparison results (keyword vs semantic vs hybrid)
3. Alpha tuning analysis
4. Filter implementation examples
5. Recommendations for production use

---

## Summary

**Key Takeaways:**
- **Neartext, Nearvector,**: NearText, nearVector, and nearObject serve different use cases
- **Hybrid Search**: Hybrid search combines keyword and semantic search
- **Alpha Parameter**: Alpha parameter controls the balance
- **Filters Add**: Filters add precision to semantic search
- **Evaluation Is**: Evaluation is essential for optimization

**What's Next:**
- **Module 5:**: Module 5: Explore modules and integrations
- **external embedding models Integration**: Connect external embedding models
- **Work With**: Work with multimodal data

---

## Additional Resources

- [Weaviate Query Documentation](https://weaviate.io/developers/weaviate/api/graphql)
- [Hybrid Search Guide](https://weaviate.io/developers/weaviate/search/hybrid)
- [Filtering Documentation](https://weaviate.io/developers/weaviate/api/graphql/filters)
- [BM25 Algorithm](https://en.wikipedia.org/wiki/Okapi_BM25)

---

**Ready for Module 5? Let's explore modules and integrations!**
