---
title: "Module 2: Weaviate Core Concepts"
description: "Master Weaviate's fundamental building blocks: objects, classes, properties, and schemas"
module: "2"
order: 2
---

# Module 2: Weaviate Core Concepts

**Duration:** Week 2  
**Learning Objectives:**
- **Weaviate's object model Understanding**: Understand Weaviate's object model
- **and create schemas programmatically Development**: Design and create schemas programmatically
- **Configure Classes**: Configure classes and properties
- **Work With**: Work with vectorizers vs. user-provided vectors
- **Choose Appropriate**: Choose appropriate distance metrics
- **Insert And**: Insert and retrieve objects

---

## Lesson 2.1: Objects, Classes, and Properties

### The Weaviate Data Model

**Hierarchy:**
```
Database
  └── Class (Collection)
        └── Object (Instance)
              ├── Properties (Fields)
              └── Vector (Embedding)
```

### Objects

**What is an Object?**
- An instance of a class
- Contains properties (data fields)
- Has a unique ID (UUID)
- Has an associated vector (embedding)

**Object Structure:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "class": "Article",
  "properties": {
    "title": "Introduction to Vector Databases",
    "content": "Vector databases enable semantic search...",
    "author": "Jane Doe",
    "published": "2024-01-15"
  },
  "vector": [0.12, -0.34, 0.56, ...]
}
```

### Classes (Collections)

**What is a Class?**
- Similar to a table in SQL
- Defines the structure for objects
- Contains schema definition
- Groups related objects

**Class Example:**
```python
{
  "class": "Article",
  "description": "A news article or blog post",
  "properties": [...],
  "vectorizer": "text2vec-openai"
}
```

**Class Naming:**
- Use PascalCase: `Article`, `Product`, `Customer`
- Descriptive and clear
- Avoid special characters

### Properties

**What are Properties?**
- Fields that store data
- Typed (text, int, date, etc.)
- Can be single or multi-valued
- Can be indexed or not

**Property Types:**
- `text`: String data
- `string`: Short strings (for filtering)
- `int`: Integer numbers
- `number`: Floating point
- `boolean`: True/false
- `date`: ISO 8601 dates
- `geoCoordinates`: Latitude/longitude
- `phoneNumber`: Phone numbers
- `blob`: Binary data
- `object`: Nested objects
- `object[]`: Arrays of objects

**Property Example:**
```python
{
  "name": "title",
  "dataType": ["string"],
  "description": "Article title",
  "indexInverted": True
}
```

### Property Configuration

**Indexing Options:**
- `indexInverted`: Enable keyword search (default: true)
- `indexFilterable`: Enable filtering (default: true)
- `indexSearchable`: Enable full-text search (default: true)

**When to Disable Indexing:**
- Large text fields you don't search
- Properties only used for display
- Performance optimization

---

## Lesson 2.2: Collections & Schema Design

### Schema Design Principles

**1. Start with Use Cases**
- What queries will you run?
- What filters do you need?
- What data must be searchable?

**2. Normalize vs. Denormalize**
- **Normalize:** Separate related data into classes
- **Denormalize:** Embed related data in properties
- **Weaviate preference:** Slight denormalization for performance

**3. Property Types Matter**
- Use `text` for searchable content
- Use `string` for exact matches/filters
- Use appropriate types for filtering

**4. Consider Vectorization**
- Which properties should be vectorized?
- Single property or concatenated?
- Affects search quality

### Schema Example: Article Class

```python
{
  "class": "Article",
  "description": "News articles and blog posts",
  "vectorizer": "text2vec-openai",
  "properties": [
    {
      "name": "title",
      "dataType": ["string"],
      "description": "Article title",
      "moduleConfig": {
        "text2vec-openai": {
          "skip": False,
          "vectorizePropertyName": False
        }
      }
    },
    {
      "name": "content",
      "dataType": ["text"],
      "description": "Full article content",
      "moduleConfig": {
        "text2vec-openai": {
          "skip": False,
          "vectorizePropertyName": False
        }
      }
    },
    {
      "name": "author",
      "dataType": ["string"],
      "description": "Author name",
      "indexInverted": True
    },
    {
      "name": "publishedDate",
      "dataType": ["date"],
      "description": "Publication date"
    },
    {
      "name": "category",
      "dataType": ["string"],
      "description": "Article category"
    },
    {
      "name": "tags",
      "dataType": ["string[]"],
      "description": "Article tags"
    }
  ]
}
```

### Multi-Class Schemas

**Example: Blog Platform**

```python
# Article class
{
  "class": "Article",
  "properties": [...]
}

# Author class
{
  "class": "Author",
  "properties": [
    {"name": "name", "dataType": ["string"]},
    {"name": "bio", "dataType": ["text"]},
    {"name": "email", "dataType": ["string"]}
  ]
}

# Category class
{
  "class": "Category",
  "properties": [
    {"name": "name", "dataType": ["string"]},
    {"name": "description", "dataType": ["text"]}
  ]
}
```

### Cross-References

**What are Cross-References?**
- Links between objects in different classes
- Similar to foreign keys in SQL
- Enable graph-like queries

**Example:**
```python
{
  "name": "hasAuthor",
  "dataType": ["Author"],
  "description": "Author of the article"
}
```

**Benefits:**
- Maintain data integrity
- Enable graph queries
- Avoid duplication

**When to Use:**
- One-to-many relationships
- Many-to-many relationships
- When data is shared across objects

---

## Lesson 2.3: Vectorizers vs. User-Provided Vectors

### Vectorizers

**What are Vectorizers?**
- Modules that automatically generate vectors
- Integrated into Weaviate
- Handle embedding generation

**How They Work:**
1. You provide text/data
2. Vectorizer converts to embedding
3. Weaviate stores vector automatically
4. No manual embedding needed

**Available Vectorizers:**
- `text2vec-openai`: OpenAI embeddings
- `text2vec-cohere`: Cohere embeddings
- `text2vec-huggingface`: Hugging Face models
- `img2vec-neural`: Image embeddings
- `multimodal`: Text + image

**Example with Vectorizer:**
```python
# Schema with vectorizer
{
  "class": "Article",
  "vectorizer": "text2vec-openai",
  "properties": [
    {"name": "title", "dataType": ["string"]},
    {"name": "content", "dataType": ["text"]}
  ]
}

# Insert object (vector auto-generated)
client.data_object.create(
  {
    "title": "Vector Databases",
    "content": "Vector databases enable semantic search..."
  },
  "Article"
)
```

### User-Provided Vectors

**When to Provide Your Own Vectors:**
- Custom embedding models
- Pre-computed embeddings
- Fine-tuned models
- Performance optimization
- Cost control (avoid API calls)

**How to Provide Vectors:**
```python
# Generate embedding externally
embedding = get_embedding("Vector databases enable...")

# Insert with vector
client.data_object.create(
  {
    "title": "Vector Databases",
    "content": "Vector databases enable semantic search..."
  },
  "Article",
  vector=embedding
)
```

### Choosing Between Approaches

**Use Vectorizers When:**
- Starting out (simpler)
- Using standard models (OpenAI, Cohere)
- Want automatic updates
- Don't need custom models

**Use User-Provided Vectors When:**
- Custom/fine-tuned models
- Pre-computed embeddings
- Cost optimization needed
- More control required

### Hybrid Approach

**Best of Both Worlds:**
- Use vectorizer for most properties
- Provide custom vectors for specific cases
- Mix and match as needed

**Example:**
```python
# Schema allows both
{
  "class": "Article",
  "vectorizer": "text2vec-openai",  # Default
  "properties": [...]
}

# Can override per object
client.data_object.create(
  {...},
  "Article",
  vector=custom_vector  # Override default
)
```

---

## Lesson 2.4: Distance Metrics

### Understanding Distance Metrics

**What They Measure:**
- How "far apart" two vectors are
- Determines similarity ranking
- Affects search results

**Common Metrics:**
1. **Cosine Similarity**
2. **Dot Product**
3. **Euclidean Distance (L2)**

### Cosine Similarity

**Characteristics:**
- Measures angle between vectors
- Range: -1 to 1
- 1 = identical direction
- 0 = orthogonal (unrelated)
- -1 = opposite direction

**Best For:**
- **Text Embeddings**: Text embeddings (most common)
- **Normalized Vectors**: Implement normalized vectors effectively across relevant use cases
- **When Magnitude**: When magnitude doesn't matter

**Formula:**
```
cos(θ) = (A · B) / (||A|| × ||B||)
```

**In Weaviate:**
```python
{
  "class": "Article",
  "vectorizer": "text2vec-openai",
  "vectorIndexType": "hnsw",
  "vectorIndexConfig": {
    "distance": "cosine"
  }
}
```

### Dot Product

**Characteristics:**
- Measures magnitude and direction
- Can be negative or positive
- Larger = more similar
- Works well with normalized vectors

**Best For:**
- **Normalized Embeddings**: Implement normalized embeddings effectively across relevant use cases
- **When Magnitude**: Apply when magnitude matters in relevant contexts
- **Some Embedding**: Apply some embedding models in relevant contexts

**Formula:**
```
A · B = Σ(Ai × Bi)
```

**In Weaviate:**
```python
{
  "vectorIndexConfig": {
    "distance": "dot"
  }
}
```

### Euclidean Distance (L2)

**Characteristics:**
- Straight-line distance
- Range: 0 to infinity
- 0 = identical
- Larger = more different

**Best For:**
- **Image Embeddings**: Implement image embeddings effectively across relevant use cases
- **When Distance**: When distance is intuitive
- **Some Specific**: Apply some specific models in relevant contexts

**Formula:**
```
√Σ(Ai - Bi)²
```

**In Weaviate:**
```python
{
  "vectorIndexConfig": {
    "distance": "l2-squared"  # Note: squared for performance
  }
}
```

### Choosing the Right Metric

**Decision Tree:**

1. **What type of embeddings?**
   - Text → Usually cosine
   - Images → Often L2
   - Check model documentation

2. **Are vectors normalized?**
   - Yes → Cosine or dot product
   - No → L2 or normalize first

3. **What does the model recommend?**
   - Follow model's recommendation
   - OpenAI → Cosine
   - Cohere → Cosine
   - Some image models → L2

**Important:**
- Must match embedding model expectations
- Changing metric requires re-indexing
- Choose carefully at schema creation

---

## Lab 2: Create Schemas and Insert Objects

### Objectives
- Create a schema programmatically
- Insert objects into Weaviate
- Retrieve objects by ID and query
- Understand vector generation

### Step 1: Setup

**Import Libraries:**
```python
import weaviate
import json
from datetime import datetime
```

**Connect to Weaviate:**
```python
client = weaviate.Client("http://localhost:8080")
assert client.is_ready()
```

### Step 2: Create Schema

**Define Article Class:**
```python
article_schema = {
    "class": "Article",
    "description": "A news article or blog post",
    "vectorizer": "none",  # We'll provide vectors manually
    "properties": [
        {
            "name": "title",
            "dataType": ["string"],
            "description": "Article title",
            "indexInverted": True
        },
        {
            "name": "content",
            "dataType": ["text"],
            "description": "Article content",
            "indexInverted": True
        },
        {
            "name": "author",
            "dataType": ["string"],
            "description": "Author name"
        },
        {
            "name": "publishedDate",
            "dataType": ["date"],
            "description": "Publication date"
        },
        {
            "name": "category",
            "dataType": ["string"],
            "description": "Article category"
        }
    ]
}
```

**Create the Class:**
```python
# Delete if exists (for clean start)
try:
    client.schema.delete_class("Article")
except:
    pass

# Create class
client.schema.create_class(article_schema)
print("Schema created successfully!")
```

**Verify Schema:**
```python
schema = client.schema.get()
print(json.dumps(schema, indent=2))
```

### Step 3: Insert Objects

**Create Sample Articles:**
```python
articles = [
    {
        "title": "Introduction to Vector Databases",
        "content": "Vector databases enable semantic search by storing high-dimensional embeddings. They are essential for AI-native applications.",
        "author": "Jane Doe",
        "publishedDate": "2024-01-15T00:00:00Z",
        "category": "Technology"
    },
    {
        "title": "Understanding Machine Learning",
        "content": "Machine learning algorithms learn patterns from data. They power modern AI applications and recommendation systems.",
        "author": "John Smith",
        "publishedDate": "2024-01-20T00:00:00Z",
        "category": "AI"
    },
    {
        "title": "Python Programming Basics",
        "content": "Python is a versatile programming language. It's widely used in data science, web development, and automation.",
        "author": "Jane Doe",
        "publishedDate": "2024-02-01T00:00:00Z",
        "category": "Programming"
    }
]
```

**Insert with Manual Vectors:**
```python
import numpy as np

# Simple mock vectors (in production, use real embeddings)
def generate_mock_vector(dim=384):
    return np.random.rand(dim).tolist()

# Insert articles
object_ids = []
for article in articles:
    # Generate mock vector
    vector = generate_mock_vector()
    
    # Insert object
    result = client.data_object.create(
        data_object=article,
        class_name="Article",
        vector=vector
    )
    object_ids.append(result)
    print(f"Inserted: {article['title']} (ID: {result})")
```

### Step 4: Retrieve Objects

**Get by ID:**
```python
# Get first article
article_id = object_ids[0]
article = client.data_object.get_by_id(
    article_id,
    class_name="Article"
)
print(json.dumps(article, indent=2))
```

**Get All Objects:**
```python
# Get all articles
response = (
    client.query
    .get("Article", ["title", "author", "category"])
    .do()
)

articles = response['data']['Get']['Article']
for article in articles:
    print(f"- {article['title']} by {article['author']}")
```

**Get with Filters:**
```python
# Get articles by author
response = (
    client.query
    .get("Article", ["title", "author"])
    .with_where({
        "path": ["author"],
        "operator": "Equal",
        "valueString": "Jane Doe"
    })
    .do()
)

print("Articles by Jane Doe:")
for article in response['data']['Get']['Article']:
    print(f"- {article['title']}")
```

### Step 5: Update Schema with Vectorizer

**Delete and Recreate with OpenAI Vectorizer:**
```python
# Note: Requires OpenAI API key in environment
# export OPENAI_API_KEY=your-key

# Delete existing class
client.schema.delete_class("Article")

# New schema with vectorizer
article_schema_with_vectorizer = {
    "class": "Article",
    "description": "A news article or blog post",
    "vectorizer": "text2vec-openai",
    "moduleConfig": {
        "text2vec-openai": {
            "model": "ada",
            "modelVersion": "002",
            "type": "text"
        }
    },
    "properties": [
        {
            "name": "title",
            "dataType": ["string"],
            "moduleConfig": {
                "text2vec-openai": {
                    "skip": False,
                    "vectorizePropertyName": False
                }
            }
        },
        {
            "name": "content",
            "dataType": ["text"],
            "moduleConfig": {
                "text2vec-openai": {
                    "skip": False,
                    "vectorizePropertyName": False
                }
            }
        },
        {
            "name": "author",
            "dataType": ["string"]
        },
        {
            "name": "publishedDate",
            "dataType": ["date"]
        },
        {
            "name": "category",
            "dataType": ["string"]
        }
    ]
}

# Create class
client.schema.create_class(article_schema_with_vectorizer)

# Insert without providing vector (auto-generated)
for article in articles:
    result = client.data_object.create(
        data_object=article,
        class_name="Article"
    )
    print(f"Inserted with auto-vectorization: {article['title']}")
```

### Step 6: Verify Vector Generation

**Check if Vectors Exist:**
```python
# Get object with vector
article = client.data_object.get_by_id(
    object_ids[0],
    class_name="Article",
    with_vector=True
)

if 'vector' in article:
    print(f"Vector dimension: {len(article['vector'])}")
    print(f"Vector sample: {article['vector'][:5]}...")
else:
    print("No vector found")
```

### Lab Deliverables

**Submit:**
1. Python script that creates schema and inserts objects
2. Screenshot of schema in Weaviate
3. Code that retrieves objects with filters
4. Comparison: manual vectors vs. vectorizer approach

### Troubleshooting

**Common Issues:**

1. **Schema already exists:**
   - Delete first: `client.schema.delete_class("Article")`

2. **Vectorizer not available:**
   - Check module configuration
   - Ensure API keys are set
   - Use `vectorizer: "none"` for manual vectors

3. **Date format errors:**
   - Use ISO 8601: `"2024-01-15T00:00:00Z"`
   - Include timezone

---

## Summary

**Key Takeaways:**
- **Classes Define**: Classes define structure, objects are instances
- **Properties Store**: Properties store data with specific types
- **Vectorizers Automate**: Vectorizers automate embedding generation
- **Distance Metrics**: Distance metrics affect search results
- **Schema Design**: Schema design impacts performance and functionality

**What's Next:**
- **Module 3:**: Module 3: Learn data ingestion patterns and indexing
- **Optimize For**: Optimize for large-scale datasets
- **HNSW indexing Understanding**: Understand HNSW indexing

---

## Additional Resources

- [Weaviate Schema Documentation](https://weaviate.io/developers/weaviate/manage-data/schema)
- [Property Data Types](https://weaviate.io/developers/weaviate/config-refs/datatypes)
- [Vectorizer Modules](https://weaviate.io/developers/weaviate/modules)
- [Distance Metrics](https://weaviate.io/developers/weaviate/config-refs/distances)

---

**Ready for Module 3? Let's learn about data ingestion and indexing!**
