---
title: "Module 2: Fueling the Engine: Data Extraction and RAG"
description: "Build RAG systems to ground AI in proprietary and real-time data"
module: "2"
order: 2
---

# Module 2: Fueling the Engine: Data Extraction and RAG

**Duration:** Week 2  
**Learning Objectives:**
- Understand Retrieval-Augmented Generation (RAG) fundamentals
- Master document extraction and parsing techniques
- Learn chunking, embedding, and vector database strategies
- Build a production-ready RAG system

---

## Lesson 2.1: Retrieval-Augmented Generation (RAG) Fundamentals

### Moving Beyond Static Model Knowledge

**The Problem with Base Models:**
- Trained on fixed datasets (cutoff dates)
- No access to proprietary company data
- Can't access real-time information
- May hallucinate or provide outdated information
- Limited to training data knowledge

**The RAG Solution:**
- Ground AI in your proprietary data
- Access real-time information
- Reduce hallucinations
- Provide citations and sources
- Maintain up-to-date knowledge

### What is RAG?

**Retrieval-Augmented Generation (RAG)** is a technique that:
1. **Retrieves** relevant information from a knowledge base
2. **Augments** the AI's context with that information
3. **Generates** responses based on retrieved + model knowledge

**RAG Architecture:**
```
User Query
    ↓
Retrieval System (Vector Search)
    ↓
Relevant Documents Retrieved
    ↓
Context Augmentation
    ↓
LLM Generation (with context)
    ↓
Response with Citations
```

### Why RAG for Content Pipelines?

**Content Pipeline Requirements:**
1. **Brand-Specific Knowledge**
   - Company history, values, messaging
   - Product specifications and features
   - Customer testimonials and case studies
   - Internal documentation

2. **Real-Time Information**
   - Current statistics and data
   - Latest industry trends
   - Recent news and events
   - Updated pricing and features

3. **Source Attribution**
   - Citations for claims
   - References to original documents
   - Traceability for fact-checking
   - Compliance and accuracy

4. **Consistency**
   - Same information across all content
   - Aligned messaging
   - Brand voice consistency
   - Factual accuracy

### RAG vs. Fine-Tuning

**Fine-Tuning:**
- Trains model on your data
- Expensive and time-consuming
- Hard to update (requires retraining)
- Model-specific
- Good for: Style, tone, domain-specific language

**RAG:**
- Retrieves data at query time
- Fast to set up and update
- Easy to add/remove documents
- Model-agnostic
- Good for: Facts, real-time data, proprietary information

**Best Practice:** Use RAG for facts and data, fine-tuning for style and voice

### RAG Components

**1. Knowledge Base**
- Collection of documents (PDFs, markdown, text files)
- Structured data (databases, APIs)
- Real-time sources (web scraping, APIs)

**2. Embedding Model**
- Converts text to vectors
- Examples: OpenAI text-embedding-ada-002, Cohere embed-english-v3.0
- Creates semantic representations

**3. Vector Database**
- Stores embeddings
- Enables similarity search
- Examples: Pinecone, LanceDB, Weaviate, Chroma

**4. Retrieval System**
- Semantic search
- Ranking and filtering
- Context window management

**5. Generation Model**
- LLM that generates content
- Uses retrieved context
- Provides citations

### RAG Workflow Example

**Scenario:** Generate a blog post about "Our New Product Features"

**Step 1: Query**
```
User: "Write a blog post about our new product features"
```

**Step 2: Retrieval**
```
Vector Search → Finds:
- Product spec document (relevance: 0.92)
- Feature announcement (relevance: 0.88)
- Customer feedback (relevance: 0.75)
- Competitor analysis (relevance: 0.65)
```

**Step 3: Context Augmentation**
```
Retrieved Documents:
1. Product Spec: "New features include AI-powered analytics, 
   real-time dashboards, and automated reporting..."
   
2. Announcement: "We're excited to launch three major features 
   that transform how teams analyze data..."
   
3. Customer Feedback: "The new analytics feature saved us 
   10 hours per week..."
```

**Step 4: Generation**
```
LLM generates blog post using:
- Retrieved product information
- Customer testimonials
- Feature details
- Brand voice guidelines
```

**Step 5: Output**
```
Blog post with:
- Accurate feature descriptions
- Customer quotes
- Citations to source documents
- Brand-consistent messaging
```

---

## Lesson 2.2: Parsing and Document Extraction

### The Document Diversity Challenge

**Content Sources:**
- PDFs (reports, whitepapers, manuals)
- PowerPoint presentations
- Word documents
- Web pages and HTML
- Markdown files
- Excel spreadsheets
- Images with text (OCR)
- Videos with transcripts

**The Challenge:**
- Different formats require different parsers
- Structure varies (headers, tables, lists)
- Quality varies (scanned PDFs, formatting)
- Need unified output format

### Using Docling for Document Parsing

**Docling** is an open-source tool that unifies diverse document formats into structured markdown.

**Why Docling?**
- Handles multiple formats (PDF, PPT, DOCX, HTML)
- Preserves structure (headers, tables, lists)
- Extracts metadata
- Outputs clean markdown
- Open-source and customizable

### Docling Installation and Setup

```python
# Install Docling
pip install docling

# Basic usage
from docling.document_converter import DocumentConverter
from docling.datamodel.base_models import InputFormat

# Initialize converter
converter = DocumentConverter(
    format=InputFormat.PDF  # or PPT, DOCX, HTML
)

# Convert document
result = converter.convert("document.pdf")

# Access markdown
markdown_content = result.document.export_to_markdown()
```

### Document Extraction Workflow

**Step 1: Document Ingestion**
```
Input: Various document formats
    ↓
Format Detection
    ↓
Route to Appropriate Parser
```

**Step 2: Parsing**
```
PDF → PDF Parser → Structured Text
PPT → PPT Parser → Slide Content
DOCX → DOCX Parser → Formatted Text
HTML → HTML Parser → Clean Text
```

**Step 3: Normalization**
```
Structured Text
    ↓
Clean and Normalize
    ↓
Extract Metadata
    ↓
Output: Unified Markdown
```

### Example: PDF Extraction

**Input PDF:** Product specification document

**Docling Output:**
```markdown
# Product Specification: AI Analytics Platform

## Overview
Our AI Analytics Platform provides real-time insights...

## Features

### Feature 1: Real-Time Dashboards
- Live data visualization
- Customizable widgets
- Export capabilities

### Feature 2: AI-Powered Analytics
- Predictive modeling
- Anomaly detection
- Trend analysis

## Technical Specifications
- API Rate Limit: 1000 requests/minute
- Data Retention: 90 days
- Supported Formats: JSON, CSV, Excel
```

### Handling Complex Documents

**Tables:**
```markdown
| Feature | Basic Plan | Pro Plan |
|---------|-----------|----------|
| Users | 5 | Unlimited |
| Storage | 10GB | 1TB |
| API Calls | 10K/month | Unlimited |
```

**Lists:**
```markdown
- Item 1
- Item 2
  - Sub-item 2.1
  - Sub-item 2.2
- Item 3
```

**Code Blocks:**
```python
def example_function():
    return "Hello, World!"
```

### Document Metadata Extraction

**Extracted Metadata:**
- Title
- Author
- Creation date
- Last modified
- Page count
- Word count
- Language
- Topics/keywords

**Example Metadata:**
```json
{
  "title": "Product Specification: AI Analytics Platform",
  "author": "Product Team",
  "created": "2024-01-15",
  "modified": "2024-03-20",
  "pages": 25,
  "words": 5000,
  "language": "en",
  "topics": ["analytics", "AI", "dashboard", "reporting"]
}
```

### Alternative Parsing Tools

**For PDFs:**
- PyPDF2 (basic extraction)
- pdfplumber (table extraction)
- pymupdf (fast, accurate)

**For Office Documents:**
- python-docx (Word documents)
- python-pptx (PowerPoint)
- openpyxl (Excel)

**For Web Content:**
- BeautifulSoup (HTML parsing)
- Readability (article extraction)
- Newspaper3k (news articles)

**For Images:**
- Tesseract OCR (text extraction)
- EasyOCR (multilingual OCR)
- PaddleOCR (accurate OCR)

### Document Quality Considerations

**Common Issues:**
1. **Scanned PDFs**
   - Low-quality text extraction
   - Solution: OCR preprocessing

2. **Complex Layouts**
   - Tables, columns, sidebars
   - Solution: Layout-aware parsing

3. **Images and Graphics**
   - Charts, diagrams, infographics
   - Solution: Image captioning or description

4. **Multi-language Content**
   - Mixed languages in one document
   - Solution: Language detection and separate processing

### Preprocessing Pipeline

```python
def preprocess_document(file_path):
    # 1. Detect format
    format_type = detect_format(file_path)
    
    # 2. Extract text
    if format_type == "PDF":
        text = extract_from_pdf(file_path)
    elif format_type == "DOCX":
        text = extract_from_docx(file_path)
    # ... other formats
    
    # 3. Clean text
    text = clean_text(text)
    
    # 4. Extract metadata
    metadata = extract_metadata(file_path)
    
    # 5. Convert to markdown
    markdown = convert_to_markdown(text, metadata)
    
    return markdown
```

---

## Lesson 2.3: Chunking, Embedding, and Vector Databases

### The Chunking Challenge

**Why Chunk?**
- LLMs have context window limits (e.g., 128K tokens)
- Need to retrieve relevant sections, not entire documents
- Semantic search works better on focused chunks
- Enables precise retrieval

**Chunking Strategies:**

#### 1. Fixed-Size Chunking
**Simple but may split semantic units**

```python
def fixed_size_chunk(text, chunk_size=1000, overlap=200):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap  # Overlap for context
    return chunks
```

**Pros:** Simple, predictable  
**Cons:** May split sentences/paragraphs

#### 2. Sentence-Based Chunking
**Preserves sentence boundaries**

```python
def sentence_chunk(text, max_chunk_size=1000):
    sentences = text.split('. ')
    chunks = []
    current_chunk = []
    current_size = 0
    
    for sentence in sentences:
        sentence_size = len(sentence)
        if current_size + sentence_size > max_chunk_size:
            chunks.append('. '.join(current_chunk))
            current_chunk = [sentence]
            current_size = sentence_size
        else:
            current_chunk.append(sentence)
            current_size += sentence_size
    
    if current_chunk:
        chunks.append('. '.join(current_chunk))
    
    return chunks
```

**Pros:** Preserves sentence integrity  
**Cons:** Variable chunk sizes

#### 3. Semantic Chunking
**Groups semantically related content**

```python
def semantic_chunk(text, embedding_model, similarity_threshold=0.7):
    sentences = split_sentences(text)
    embeddings = [embedding_model.embed(s) for s in sentences]
    
    chunks = []
    current_chunk = [sentences[0]]
    current_embedding = embeddings[0]
    
    for i in range(1, len(sentences)):
        similarity = cosine_similarity(current_embedding, embeddings[i])
        if similarity > similarity_threshold:
            current_chunk.append(sentences[i])
            current_embedding = average([current_embedding, embeddings[i]])
        else:
            chunks.append(' '.join(current_chunk))
            current_chunk = [sentences[i]]
            current_embedding = embeddings[i]
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks
```

**Pros:** Semantically coherent chunks  
**Cons:** More complex, requires embeddings

#### 4. Hierarchical Chunking
**Preserves document structure**

```python
def hierarchical_chunk(document):
    chunks = []
    
    # Level 1: Sections
    for section in document.sections:
        # Level 2: Paragraphs within section
        for paragraph in section.paragraphs:
            if len(paragraph) > 1000:
                # Level 3: Split long paragraphs
                sub_chunks = split_paragraph(paragraph)
                chunks.extend(sub_chunks)
            else:
                chunks.append(paragraph)
    
    return chunks
```

**Pros:** Preserves structure, good for structured documents  
**Cons:** Complex implementation

### Best Practices for Chunking

**1. Overlap Between Chunks**
- Prevents losing context at boundaries
- Recommended: 10-20% overlap
- Example: 1000-char chunks with 200-char overlap

**2. Chunk Size Guidelines**
- Small chunks (100-500 chars): Precise retrieval, more chunks
- Medium chunks (500-1500 chars): Balanced, most common
- Large chunks (1500-3000 chars): More context, fewer chunks

**3. Preserve Structure**
- Keep headers with content
- Maintain list items together
- Don't split tables

**4. Metadata Preservation**
- Store source document
- Store chunk position
- Store section/heading context

### Embedding Models

**What are Embeddings?**
- Vector representations of text
- Capture semantic meaning
- Enable similarity search
- Fixed-size vectors (e.g., 1536 dimensions)

**Popular Embedding Models:**

#### OpenAI text-embedding-ada-002
- Dimensions: 1536
- Cost: $0.0001 per 1K tokens
- Quality: Excellent
- Speed: Fast

#### Cohere embed-english-v3.0
- Dimensions: 1024
- Cost: Free tier available
- Quality: Excellent
- Speed: Fast

#### Sentence Transformers
- Open-source alternatives
- Examples: all-MiniLM-L6-v2, all-mpnet-base-v2
- Cost: Free (self-hosted)
- Quality: Good to excellent

### Embedding Generation

```python
import openai

def generate_embedding(text, model="text-embedding-ada-002"):
    response = openai.Embedding.create(
        model=model,
        input=text
    )
    return response['data'][0]['embedding']

# Example
chunk = "Our AI Analytics Platform provides real-time insights..."
embedding = generate_embedding(chunk)
# Returns: [0.123, -0.456, 0.789, ...] (1536 dimensions)
```

### Vector Databases

**Why Vector Databases?**
- Efficient similarity search
- Scalable storage
- Metadata filtering
- Real-time updates

**Popular Vector Databases:**

#### Pinecone
- Fully managed
- Fast and scalable
- Easy to use
- Cost: Free tier, then pay-per-use

#### LanceDB
- Open-source
- Embedded or server mode
- Fast local search
- Cost: Free

#### Weaviate
- Open-source
- GraphQL API
- Built-in vectorization
- Cost: Free (self-hosted)

#### Chroma
- Open-source
- Simple Python API
- Good for prototyping
- Cost: Free

### Setting Up Pinecone

```python
import pinecone

# Initialize
pinecone.init(api_key="your-api-key", environment="us-east-1")

# Create index
pinecone.create_index(
    name="content-knowledge-base",
    dimension=1536,  # OpenAI embedding dimension
    metric="cosine"
)

# Connect to index
index = pinecone.Index("content-knowledge-base")

# Upsert vectors
vectors = [
    {
        "id": "chunk-1",
        "values": embedding_1,
        "metadata": {
            "document": "product-spec.pdf",
            "section": "Features",
            "chunk_index": 0
        }
    },
    # ... more vectors
]
index.upsert(vectors=vectors)

# Query
query_embedding = generate_embedding("What are the key features?")
results = index.query(
    vector=query_embedding,
    top_k=5,
    include_metadata=True
)
```

### Setting Up LanceDB

```python
import lancedb
import pyarrow as pa

# Connect to database
db = lancedb.connect("./lancedb")

# Create table schema
schema = pa.schema([
    pa.field("vector", pa.list_(pa.float32(), 1536)),
    pa.field("text", pa.string()),
    pa.field("document", pa.string()),
    pa.field("chunk_index", pa.int32())
])

# Create table
table = db.create_table("content_vectors", schema=schema)

# Insert data
data = [
    {
        "vector": embedding_1,
        "text": chunk_text_1,
        "document": "product-spec.pdf",
        "chunk_index": 0
    },
    # ... more data
]
table.add(data)

# Search
query_embedding = generate_embedding("What are the key features?")
results = table.search(query_embedding).limit(5).to_pandas()
```

### Retrieval Strategies

#### 1. Similarity Search
**Find most similar chunks to query**

```python
def similarity_search(query, top_k=5):
    query_embedding = generate_embedding(query)
    results = vector_db.query(
        vector=query_embedding,
        top_k=top_k
    )
    return results
```

#### 2. Hybrid Search
**Combine semantic + keyword search**

```python
def hybrid_search(query, top_k=5):
    # Semantic search
    semantic_results = similarity_search(query, top_k=10)
    
    # Keyword search
    keyword_results = keyword_search(query, top_k=10)
    
    # Combine and rerank
    combined = combine_results(semantic_results, keyword_results)
    return combined[:top_k]
```

#### 3. Metadata Filtering
**Filter by document, date, category, etc.**

```python
def filtered_search(query, filters, top_k=5):
    query_embedding = generate_embedding(query)
    results = vector_db.query(
        vector=query_embedding,
        top_k=top_k,
        filter=filters  # e.g., {"document": "product-spec.pdf"}
    )
    return results
```

### RAG System Architecture

**Complete RAG Pipeline:**

```python
class RAGSystem:
    def __init__(self, embedding_model, vector_db):
        self.embedding_model = embedding_model
        self.vector_db = vector_db
    
    def add_document(self, document_path):
        # 1. Parse document
        markdown = parse_document(document_path)
        
        # 2. Chunk
        chunks = chunk_document(markdown)
        
        # 3. Generate embeddings
        embeddings = [self.embedding_model.embed(chunk) for chunk in chunks]
        
        # 4. Store in vector DB
        vectors = [
            {
                "id": f"{document_path}-{i}",
                "values": embedding,
                "metadata": {
                    "text": chunk,
                    "document": document_path,
                    "chunk_index": i
                }
            }
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
        ]
        self.vector_db.upsert(vectors)
    
    def retrieve(self, query, top_k=5):
        # 1. Generate query embedding
        query_embedding = self.embedding_model.embed(query)
        
        # 2. Search vector DB
        results = self.vector_db.query(
            vector=query_embedding,
            top_k=top_k
        )
        
        # 3. Return relevant chunks
        return [result.metadata["text"] for result in results]
    
    def generate(self, query, retrieved_context):
        # Combine query and context
        prompt = f"""
        Context:
        {retrieved_context}
        
        Question: {query}
        
        Answer based on the context above:
        """
        
        # Generate response
        response = llm.generate(prompt)
        return response
```

---

## Exercise 2: Build a RAG System

### Objective
Build a complete RAG system that can ingest documents, create embeddings, store in a vector database, and retrieve relevant information.

### Instructions

1. **Set Up Infrastructure**
   - Choose an embedding model (OpenAI, Cohere, or open-source)
   - Set up a vector database (Pinecone, LanceDB, or Chroma)
   - Install necessary libraries

2. **Document Processing**
   - Parse at least 3 different document types (PDF, DOCX, HTML, etc.)
   - Extract text and convert to markdown
   - Implement chunking strategy (sentence-based or semantic)

3. **Vector Storage**
   - Generate embeddings for all chunks
   - Store in vector database with metadata
   - Include document source, chunk index, section info

4. **Retrieval System**
   - Implement similarity search
   - Test with various queries
   - Return top-k relevant chunks

5. **Integration Test**
   - Query the system with a content generation request
   - Retrieve relevant context
   - Generate a response using retrieved context

### Deliverables

1. **Code Repository** (GitHub/GitLab link)
   - Document parsing code
   - Chunking implementation
   - Embedding generation
   - Vector database setup
   - Retrieval system

2. **Documentation**
   - Setup instructions
   - Architecture diagram
   - Usage examples
   - Performance metrics

3. **Demo**
   - Sample queries and responses
   - Retrieved context examples
   - Accuracy assessment

### Evaluation Criteria

- **Functionality (30%):** System works end-to-end
- **Code Quality (20%):** Clean, documented, maintainable
- **Chunking Strategy (20%):** Appropriate and effective
- **Retrieval Quality (20%):** Relevant results
- **Documentation (10%):** Clear and complete

### Example Implementation

**Tech Stack:**
- Docling for document parsing
- OpenAI embeddings
- Pinecone vector database
- Python for orchestration

**Sample Query:**
```
"What are the key features of our product?"
```

**Retrieved Context:**
```
1. "Our AI Analytics Platform includes three major features:
   real-time dashboards, AI-powered analytics, and automated
   reporting..." (relevance: 0.92)
   
2. "The real-time dashboard feature allows users to visualize
   data as it updates..." (relevance: 0.88)
   
3. "AI-powered analytics uses machine learning to identify
   trends and anomalies..." (relevance: 0.85)
```

**Generated Response:**
```
Based on our product documentation, our AI Analytics Platform
includes three key features:

1. Real-Time Dashboards: Live data visualization with
   customizable widgets and export capabilities.

2. AI-Powered Analytics: Predictive modeling, anomaly
   detection, and trend analysis using machine learning.

3. Automated Reporting: Scheduled reports with customizable
   formats and delivery options.

[Sources: product-spec.pdf, feature-announcement.pdf]
```

---

## Summary

In this module, you've learned:

 **RAG Fundamentals** - How to ground AI in proprietary data

 **Document Extraction** - Parsing diverse formats with tools like Docling

 **Chunking Strategies** - Breaking documents into searchable pieces

 **Embeddings and Vector DBs** - Storing and searching semantic representations

 **Complete RAG System** - End-to-end implementation

**Next Module:** [Module 3: Automated Ideation and Strategic Planning](Module_03_Automated_Ideation_and_Strategic_Planning.md)

---

**Ready to build your RAG system? Start with Exercise 2!**
