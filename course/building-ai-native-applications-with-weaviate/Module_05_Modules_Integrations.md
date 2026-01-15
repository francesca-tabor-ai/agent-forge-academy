---
title: "Module 5: Modules & Integrations"
description: "Explore Weaviate modules, integrate external embedding models, and work with multimodal data"
module: "5"
order: 5
---

# Module 5: Modules & Integrations

**Duration:** Week 5  
**Learning Objectives:**
- Understand Weaviate's module system
- Integrate text, image, and multimodal modules
- Connect OpenAI, Cohere, and Hugging Face
- Build custom embedding pipelines
- Store and query multimodal data

---

## Lesson 5.1: Text Modules

### Available Text Vectorizers

**1. text2vec-openai**
- Uses OpenAI embeddings
- Models: ada-002, text-embedding-3-small, text-embedding-3-large
- High quality, paid service
- Best for: Production applications

**2. text2vec-cohere**
- Uses Cohere embeddings
- Models: embed-english-v2.0, embed-english-light-v2.0
- Good quality, paid service
- Best for: Multilingual support

**3. text2vec-huggingface**
- Uses Hugging Face models
- Free, open-source models
- Self-hosted or Hugging Face API
- Best for: Cost-sensitive applications

**4. text2vec-palm**
- Google PaLM embeddings
- Enterprise-focused
- Best for: Google Cloud environments

### Configuring text2vec-openai

**Basic Configuration:**
```python
schema = {
    "class": "Article",
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
        }
    ]
}
```

**Environment Setup:**
```bash
# Set API key
export OPENAI_API_KEY=your-api-key-here

# Or in Python
import os
os.environ["OPENAI_API_KEY"] = "your-api-key-here"
```

**Docker Configuration:**
```yaml
services:
  weaviate:
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DEFAULT_VECTORIZER_MODULE=text2vec-openai
      - ENABLE_MODULES=text2vec-openai
```

### Configuring text2vec-cohere

**Setup:**
```python
schema = {
    "class": "Article",
    "vectorizer": "text2vec-cohere",
    "moduleConfig": {
        "text2vec-cohere": {
            "model": "embed-english-v2.0",
            "truncate": "NONE"
        }
    },
    "properties": [...]
}
```

**Environment:**
```bash
export COHERE_API_KEY=your-api-key
```

### Configuring text2vec-huggingface

**Using Hugging Face API:**
```python
schema = {
    "class": "Article",
    "vectorizer": "text2vec-huggingface",
    "moduleConfig": {
        "text2vec-huggingface": {
            "model": "sentence-transformers/all-MiniLM-L6-v2",
            "options": {
                "waitForModel": True,
                "useCache": True
            }
        }
    },
    "properties": [...]
}
```

**Using Local Model:**
```python
schema = {
    "class": "Article",
    "vectorizer": "text2vec-huggingface",
    "moduleConfig": {
        "text2vec-huggingface": {
            "model": "sentence-transformers/all-MiniLM-L6-v2",
            "options": {
                "passageQueryOptions": {
                    "waitForModel": True
                }
            }
        }
    },
    "properties": [...]
}
```

**Environment:**
```bash
export HUGGINGFACE_API_KEY=your-api-key
# Or for local models, no API key needed
```

### Property-Level Configuration

**Vectorize Specific Properties:**
```python
properties = [
    {
        "name": "title",
        "dataType": ["string"],
        "moduleConfig": {
            "text2vec-openai": {
                "skip": False,  # Include in vectorization
                "vectorizePropertyName": False  # Don't include property name
            }
        }
    },
    {
        "name": "metadata",
        "dataType": ["string"],
        "moduleConfig": {
            "text2vec-openai": {
                "skip": True  # Skip this property
            }
        }
    }
]
```

**Concatenating Properties:**
```python
# Multiple properties are automatically concatenated
# Order matters - first property listed is primary
properties = [
    {"name": "title", "dataType": ["string"]},      # Primary
    {"name": "content", "dataType": ["text"]},      # Secondary
    {"name": "summary", "dataType": ["text"]}       # Tertiary
]
# Vector created from: "title content summary"
```

---

## Lesson 5.2: Image Modules

### img2vec-neural Module

**What It Does:**
- Generates embeddings from images
- Uses neural networks (ResNet, etc.)
- Enables image similarity search

**Configuration:**
```python
schema = {
    "class": "Image",
    "vectorizer": "img2vec-neural",
    "moduleConfig": {
        "img2vec-neural": {
            "imageFields": ["image"]
        }
    },
    "properties": [
        {
            "name": "image",
            "dataType": ["blob"]
        },
        {
            "name": "description",
            "dataType": ["string"]
        }
    ]
}
```

**Inserting Images:**
```python
import base64

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Insert image
image_base64 = encode_image("photo.jpg")
client.data_object.create(
    {
        "image": image_base64,
        "description": "A beautiful sunset"
    },
    "Image"
)
```

**Querying Images:**
```python
# Find similar images
query_image = encode_image("query_photo.jpg")

response = (
    client.query
    .get("Image", ["description"])
    .with_near_image({
        "image": query_image,
        "certainty": 0.7
    })
    .with_limit(10)
    .do()
)
```

### Image Search Use Cases

**1. Product Image Search:**
- Find similar products by image
- Visual product recommendations
- Reverse image search

**2. Content Moderation:**
- Find similar inappropriate images
- Duplicate detection
- Copyright checking

**3. Medical Imaging:**
- Similar case finding
- Diagnosis assistance
- Research applications

---

## Lesson 5.3: Multimodal Modules

### What is Multimodal?

**Multimodal Data:**
- Combines text and images
- Single vector represents both
- Enables cross-modal search

**Use Cases:**
- Search images with text queries
- Search text with image queries
- Combined understanding

### Configuring Multimodal

**Schema Setup:**
```python
schema = {
    "class": "Product",
    "vectorizer": "multi2vec-clip",
    "moduleConfig": {
        "multi2vec-clip": {
            "imageFields": ["image"],
            "textFields": ["title", "description"]
        }
    },
    "properties": [
        {
            "name": "title",
            "dataType": ["string"]
        },
        {
            "name": "description",
            "dataType": ["text"]
        },
        {
            "name": "image",
            "dataType": ["blob"]
        }
    ]
}
```

**Inserting Multimodal Data:**
```python
product = {
    "title": "Red Running Shoes",
    "description": "Comfortable athletic footwear for running",
    "image": encode_image("shoes.jpg")
}

client.data_object.create(product, "Product")
```

**Querying Multimodal:**
```python
# Text query finds images
response = (
    client.query
    .get("Product", ["title", "description"])
    .with_near_text({
        "concepts": ["red athletic shoes"]
    })
    .with_limit(10)
    .do()
)

# Image query finds text
query_image = encode_image("query_shoes.jpg")
response = (
    client.query
    .get("Product", ["title", "description"])
    .with_near_image({
        "image": query_image
    })
    .with_limit(10)
    .do()
)
```

---

## Lesson 5.4: Custom Embedding Pipelines

### When to Use Custom Embeddings

**Reasons:**
- Fine-tuned models
- Domain-specific embeddings
- Cost optimization
- Performance requirements
- Privacy concerns

### Implementing Custom Embeddings

**Step 1: Generate Embeddings Externally**
```python
import openai
import numpy as np

def generate_embeddings(texts, model="text-embedding-ada-002"):
    """Generate embeddings using OpenAI"""
    response = openai.Embedding.create(
        input=texts,
        model=model
    )
    return [item['embedding'] for item in response['data']]

# Or using Hugging Face
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(texts)
```

**Step 2: Create Schema Without Vectorizer**
```python
schema = {
    "class": "Article",
    "vectorizer": "none",  # No automatic vectorization
    "properties": [
        {"name": "title", "dataType": ["string"]},
        {"name": "content", "dataType": ["text"]}
    ]
}
```

**Step 3: Insert with Custom Vectors**
```python
articles = [
    {"title": "Article 1", "content": "Content 1"},
    {"title": "Article 2", "content": "Content 2"}
]

# Generate embeddings
texts = [f"{a['title']} {a['content']}" for a in articles]
embeddings = generate_embeddings(texts)

# Insert with vectors
with client.batch(batch_size=100) as batch:
    for article, embedding in zip(articles, embeddings):
        batch.add_data_object(
            data_object=article,
            class_name="Article",
            vector=embedding
        )
```

**Step 4: Query with Custom Embeddings**
```python
# Generate query embedding
query_text = "machine learning"
query_embedding = generate_embeddings([query_text])[0]

# Query
response = (
    client.query
    .get("Article", ["title", "content"])
    .with_near_vector({
        "vector": query_embedding,
        "certainty": 0.7
    })
    .with_limit(10)
    .do()
)
```

### Batch Processing Custom Embeddings

**Efficient Pipeline:**
```python
def ingest_with_custom_embeddings(articles, batch_size=100, embedding_batch_size=100):
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Process in batches
    for i in range(0, len(articles), embedding_batch_size):
        batch_articles = articles[i:i+embedding_batch_size]
        
        # Generate embeddings for batch
        texts = [f"{a['title']} {a['content']}" for a in batch_articles]
        embeddings = model.encode(texts, show_progress_bar=True)
        
        # Insert with Weaviate batch
        with client.batch(batch_size=batch_size) as weaviate_batch:
            for article, embedding in zip(batch_articles, embeddings):
                weaviate_batch.add_data_object(
                    data_object=article,
                    class_name="Article",
                    vector=embedding.tolist()
                )
        
        print(f"Processed {min(i+embedding_batch_size, len(articles))}/{len(articles)}")
```

### Fine-Tuned Models

**Using Fine-Tuned Embeddings:**
```python
# Load fine-tuned model
from transformers import AutoModel, AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("your-fine-tuned-model")
model = AutoModel.from_pretrained("your-fine-tuned-model")

def generate_fine_tuned_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    outputs = model(**inputs)
    # Extract embeddings (e.g., CLS token or mean pooling)
    embedding = outputs.last_hidden_state.mean(dim=1).squeeze().detach().numpy()
    return embedding.tolist()

# Use in ingestion pipeline
text = "Your text here"
embedding = generate_fine_tuned_embedding(text)
client.data_object.create(
    {"content": text},
    "Article",
    vector=embedding
)
```

---

## Lab 5: Integrate External Embedding Model and Multimodal Data

### Objectives
- Set up external embedding model
- Ingest data with custom embeddings
- Store and query multimodal data
- Compare different embedding approaches

### Step 1: Setup External Embedding Model

**Install Dependencies:**
```bash
pip install sentence-transformers torch
```

**Create Embedding Service:**
```python
from sentence_transformers import SentenceTransformer
import numpy as np

class EmbeddingService:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        self.model = SentenceTransformer(model_name)
        print(f"Loaded model: {model_name}")
    
    def encode(self, texts, batch_size=32):
        """Generate embeddings for texts"""
        if isinstance(texts, str):
            texts = [texts]
        return self.model.encode(texts, batch_size=batch_size, show_progress_bar=True)
    
    def encode_single(self, text):
        """Generate embedding for single text"""
        return self.model.encode([text])[0]

# Initialize service
embedding_service = EmbeddingService()
```

### Step 2: Create Schema for Custom Embeddings

**Schema Without Vectorizer:**
```python
schema = {
    "class": "Document",
    "vectorizer": "none",
    "properties": [
        {
            "name": "title",
            "dataType": ["string"],
            "indexInverted": True
        },
        {
            "name": "content",
            "dataType": ["text"],
            "indexInverted": True
        },
        {
            "name": "category",
            "dataType": ["string"]
        }
    ]
}

# Delete if exists
try:
    client.schema.delete_class("Document")
except:
    pass

client.schema.create_class(schema)
```

### Step 3: Ingest with Custom Embeddings

**Batch Ingestion:**
```python
def ingest_documents(documents, embedding_service, batch_size=100):
    total = len(documents)
    
    for i in range(0, total, batch_size):
        batch_docs = documents[i:i+batch_size]
        
        # Generate embeddings
        texts = [f"{doc['title']} {doc['content']}" for doc in batch_docs]
        embeddings = embedding_service.encode(texts)
        
        # Insert into Weaviate
        with client.batch(batch_size=batch_size) as weaviate_batch:
            for doc, embedding in zip(batch_docs, embeddings):
                weaviate_batch.add_data_object(
                    data_object=doc,
                    class_name="Document",
                    vector=embedding.tolist()
                )
        
        print(f"Processed {min(i+batch_size, total)}/{total} documents")

# Sample documents
documents = [
    {"title": "ML Basics", "content": "Machine learning is...", "category": "AI"},
    {"title": "Python Guide", "content": "Python is a programming language...", "category": "Programming"},
    # Add more...
]

ingest_documents(documents, embedding_service)
```

### Step 4: Query with Custom Embeddings

**Query Function:**
```python
def search_documents(query_text, embedding_service, limit=10, filters=None):
    # Generate query embedding
    query_embedding = embedding_service.encode_single(query_text)
    
    # Build query
    query_builder = (
        client.query
        .get("Document", ["title", "content", "category"])
        .with_near_vector({
            "vector": query_embedding.tolist(),
            "certainty": 0.7
        })
    )
    
    if filters:
        query_builder = query_builder.with_where(filters)
    
    response = query_builder.with_limit(limit).do()
    return response['data']['Get']['Document']

# Test search
results = search_documents("machine learning algorithms", embedding_service)
for result in results:
    print(f"- {result['title']}")
```

### Step 5: Multimodal Data Setup

**Create Multimodal Schema:**
```python
multimodal_schema = {
    "class": "Product",
    "vectorizer": "none",  # We'll provide custom multimodal vectors
    "properties": [
        {"name": "name", "dataType": ["string"]},
        {"name": "description", "dataType": ["text"]},
        {"name": "image", "dataType": ["blob"]},
        {"name": "category", "dataType": ["string"]}
    ]
}

try:
    client.schema.delete_class("Product")
except:
    pass

client.schema.create_class(multimodal_schema)
```

**Multimodal Embedding Service:**
```python
from sentence_transformers import SentenceTransformer
from PIL import Image
import base64
import io

class MultimodalEmbeddingService:
    def __init__(self):
        # Use CLIP model for multimodal
        self.model = SentenceTransformer('clip-ViT-B-32')
    
    def encode_text(self, text):
        return self.model.encode([text])[0]
    
    def encode_image(self, image_base64):
        # Decode base64
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data))
        return self.model.encode([image])[0]
    
    def encode_multimodal(self, text, image_base64):
        # Combine text and image
        text_emb = self.encode_text(text)
        img_emb = self.encode_image(image_base64)
        # Average or concatenate (depending on model)
        return (text_emb + img_emb) / 2

multimodal_service = MultimodalEmbeddingService()
```

**Insert Multimodal Data:**
```python
def encode_image_file(image_path):
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode('utf-8')

products = [
    {
        "name": "Running Shoes",
        "description": "Comfortable athletic shoes",
        "image": encode_image_file("shoes.jpg"),
        "category": "Footwear"
    },
    # Add more products...
]

# Ingest with multimodal embeddings
for product in products:
    # Generate multimodal embedding
    embedding = multimodal_service.encode_multimodal(
        f"{product['name']} {product['description']}",
        product['image']
    )
    
    client.data_object.create(
        product,
        "Product",
        vector=embedding.tolist()
    )
```

**Query Multimodal:**
```python
# Text query
def search_products_by_text(query_text, limit=10):
    query_embedding = multimodal_service.encode_text(query_text)
    
    response = (
        client.query
        .get("Product", ["name", "description", "category"])
        .with_near_vector({
            "vector": query_embedding.tolist(),
            "certainty": 0.7
        })
        .with_limit(limit)
        .do()
    )
    return response['data']['Get']['Product']

# Image query
def search_products_by_image(image_path, limit=10):
    image_base64 = encode_image_file(image_path)
    query_embedding = multimodal_service.encode_image(image_base64)
    
    response = (
        client.query
        .get("Product", ["name", "description", "category"])
        .with_near_vector({
            "vector": query_embedding.tolist(),
            "certainty": 0.7
        })
        .with_limit(limit)
        .do()
    )
    return response['data']['Get']['Product']
```

### Step 6: Compare Approaches

**Benchmark Different Models:**
```python
def benchmark_models(test_queries, documents):
    models = [
        ('all-MiniLM-L6-v2', 'sentence-transformers/all-MiniLM-L6-v2'),
        ('all-mpnet-base-v2', 'sentence-transformers/all-mpnet-base-v2'),
    ]
    
    results = {}
    
    for model_name, model_path in models:
        print(f"\nTesting {model_name}...")
        service = EmbeddingService(model_path)
        
        # Time embedding generation
        import time
        start = time.time()
        embeddings = service.encode([f"{d['title']} {d['content']}" for d in documents])
        embed_time = time.time() - start
        
        # Time queries
        query_times = []
        for query in test_queries:
            q_start = time.time()
            query_emb = service.encode_single(query)
            query_times.append(time.time() - q_start)
        
        results[model_name] = {
            "embed_time": embed_time,
            "avg_query_time": sum(query_times) / len(query_times),
            "dimension": len(embeddings[0])
        }
    
    return results

# Run benchmark
test_queries = ["machine learning", "Python programming", "data science"]
benchmark_results = benchmark_models(test_queries, documents)

for model, metrics in benchmark_results.items():
    print(f"{model}:")
    print(f"  Embedding time: {metrics['embed_time']:.2f}s")
    print(f"  Avg query time: {metrics['avg_query_time']*1000:.2f}ms")
    print(f"  Dimension: {metrics['dimension']}")
```

### Lab Deliverables

**Submit:**
1. Custom embedding service implementation
2. Multimodal data ingestion code
3. Comparison of different embedding models
4. Performance benchmarks
5. Recommendations for production use

---

## Summary

**Key Takeaways:**
- Weaviate modules provide easy integration with embedding services
- Custom embeddings offer flexibility and control
- Multimodal data enables cross-modal search
- Different models have different trade-offs
- Choose based on use case, cost, and performance

**What's Next:**
- Module 6: Build RAG applications
- Combine retrieval with LLM generation
- Implement context chunking strategies

---

## Additional Resources

- [Weaviate Modules Documentation](https://weaviate.io/developers/weaviate/modules)
- [Sentence Transformers](https://www.sbert.net/)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [CLIP Model](https://openai.com/research/clip)

---

**Ready for Module 6? Let's build RAG applications!**
