---
title: "Module 6: Retrieval-Augmented Generation (RAG)"
description: "Build RAG pipelines, implement chunking strategies, and evaluate RAG outputs"
module: "6"
order: 6
---

# Module 6: Retrieval-Augmented Generation (RAG)

**Duration:** Week 6  
**Learning Objectives:**
- **RAG design patterns Understanding**: Understand RAG design patterns
- **effective context chunking strategies Implementation**: Implement effective context chunking strategies
- **Engineer Prompts**: Engineer prompts for retrieval
- **complete RAG chatbots Development**: Build complete RAG chatbots
- **RAG system performance Evaluation**: Evaluate RAG system performance

---

## Lesson 6.1: RAG Design Patterns

### What is RAG?

**Retrieval-Augmented Generation:**
- Combines information retrieval with LLM generation
- Retrieves relevant context from vector database
- Provides context to LLM for accurate responses
- Reduces hallucinations and improves factuality

**Why RAG?**
- LLMs have knowledge cutoff dates
- LLMs can't access private/internal data
- Reduces hallucination
- Enables domain-specific applications
- Provides citations and sources

### RAG Architecture

**Basic Flow:**
```
User Query
    ↓
Query Embedding
    ↓
Vector Search (Weaviate)
    ↓
Retrieve Top-K Documents
    ↓
Assemble Context
    ↓
LLM Generation (with context)
    ↓
Response + Citations
```

### RAG Patterns

**Pattern 1: Simple RAG**
```python
def simple_rag(query, k=5):
    # 1. Retrieve context
    response = (
        client.query
        .get("Document", ["title", "content"])
        .with_near_text({"concepts": [query]})
        .with_limit(k)
        .do()
    )
    
    # 2. Assemble context
    documents = response['data']['Get']['Document']
    context = "\n\n".join([f"Title: {d['title']}\nContent: {d['content']}" for d in documents])
    
    # 3. Generate response
    prompt = f"""Based on the following context, answer the question.
    
Context:
{context}

Question: {query}

Answer:"""
    
    # Call LLM (OpenAI example)
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return response.choices[0].message.content, documents
```

**Pattern 2: RAG with Re-ranking**
```python
def rag_with_reranking(query, k=10, top_k=5):
    # 1. Retrieve more documents
    response = (
        client.query
        .get("Document", ["title", "content", "score"])
        .with_near_text({"concepts": [query]})
        .with_limit(k)
        .do()
    )
    
    documents = response['data']['Get']['Document']
    
    # 2. Re-rank using cross-encoder
    from sentence_transformers import CrossEncoder
    reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
    
    pairs = [[query, doc['content']] for doc in documents]
    scores = reranker.predict(pairs)
    
    # 3. Select top-k after re-ranking
    ranked_docs = sorted(zip(documents, scores), key=lambda x: x[1], reverse=True)
    top_docs = [doc for doc, score in ranked_docs[:top_k]]
    
    # 4. Generate response
    context = "\n\n".join([f"Title: {d['title']}\nContent: {d['content']}" for d in top_docs])
    # ... continue with LLM generation
```

**Pattern 3: Multi-Step RAG**
```python
def multi_step_rag(query):
    # Step 1: Generate sub-questions
    subquery_prompt = f"""Given this question, generate 2-3 sub-questions that would help answer it.
    
Question: {query}

Sub-questions:"""
    
    subqueries_response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": subquery_prompt}]
    )
    subqueries = subqueries_response.choices[0].message.content.split("\n")
    
    # Step 2: Retrieve for each sub-question
    all_documents = []
    for subquery in subqueries:
        response = (
            client.query
            .get("Document", ["title", "content"])
            .with_near_text({"concepts": [subquery]})
            .with_limit(3)
            .do()
        )
        all_documents.extend(response['data']['Get']['Document'])
    
    # Step 3: Deduplicate and rank
    unique_docs = {doc['_additional']['id']: doc for doc in all_documents}.values()
    
    # Step 4: Generate final answer
    context = "\n\n".join([f"Title: {d['title']}\nContent: {d['content']}" for d in unique_docs])
    # ... continue with LLM generation
```

### RAG Components

**1. Retrieval System:**
- Vector database (Weaviate)
- Query embedding
- Similarity search
- Filtering

**2. Context Assembly:**
- Chunk selection
- Ordering
- Formatting
- Truncation

**3. Generation System:**
- LLM (OpenAI, Anthropic, etc.)
- Prompt engineering
- Response formatting
- Citation extraction

---

## Lesson 6.2: Context Chunking Strategies

### Why Chunking Matters

**Challenges:**
- LLMs have token limits
- Documents are often longer than limits
- Need to preserve context
- Balance chunk size vs. information loss

### Chunking Strategies

**1. Fixed-Size Chunking**
```python
def fixed_size_chunks(text, chunk_size=500, overlap=50):
    """Split text into fixed-size chunks with overlap"""
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    
    return chunks
```

**2. Sentence-Based Chunking**
```python
import nltk
nltk.download('punkt')

def sentence_chunks(text, max_chunk_size=500):
    """Split by sentences, respecting max size"""
    sentences = nltk.sent_tokenize(text)
    chunks = []
    current_chunk = []
    current_size = 0
    
    for sentence in sentences:
        sentence_size = len(sentence.split())
        if current_size + sentence_size > max_chunk_size and current_chunk:
            chunks.append(" ".join(current_chunk))
            current_chunk = [sentence]
            current_size = sentence_size
        else:
            current_chunk.append(sentence)
            current_size += sentence_size
    
    if current_chunk:
        chunks.append(" ".join(current_chunk))
    
    return chunks
```

**3. Semantic Chunking**
```python
from sentence_transformers import SentenceTransformer
import numpy as np

def semantic_chunks(text, model, max_chunk_size=500, similarity_threshold=0.7):
    """Chunk based on semantic similarity"""
    sentences = nltk.sent_tokenize(text)
    embeddings = model.encode(sentences)
    
    chunks = []
    current_chunk = [sentences[0]]
    current_embedding = embeddings[0]
    
    for i in range(1, len(sentences)):
        similarity = np.dot(current_embedding, embeddings[i]) / (
            np.linalg.norm(current_embedding) * np.linalg.norm(embeddings[i])
        )
        
        if similarity > similarity_threshold and len(" ".join(current_chunk).split()) < max_chunk_size:
            current_chunk.append(sentences[i])
            # Update embedding (average)
            current_embedding = (current_embedding + embeddings[i]) / 2
        else:
            chunks.append(" ".join(current_chunk))
            current_chunk = [sentences[i]]
            current_embedding = embeddings[i]
    
    if current_chunk:
        chunks.append(" ".join(current_chunk))
    
    return chunks
```

**4. Recursive Chunking**
```python
def recursive_chunk(text, chunk_size=500, separators=["\n\n", "\n", ". ", " "]):
    """Recursively split by separators"""
    if len(text.split()) <= chunk_size:
        return [text]
    
    for separator in separators:
        if separator in text:
            parts = text.split(separator)
            if all(len(p.split()) <= chunk_size for p in parts):
                chunks = []
                for part in parts:
                    chunks.extend(recursive_chunk(part, chunk_size, separators))
                return chunks
    
    # Fallback: split by words
    words = text.split()
    return [" ".join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]
```

### Chunk Size Guidelines

**Considerations:**
- **Too Small:** Loses context, many chunks
- **Too Large:** Exceeds token limits, less precise
- **Optimal:** Balance context and precision

**Recommendations:**
- **Small documents (< 1000 words):** Single chunk
- **Medium documents (1000-5000 words):** 200-500 word chunks
- **Large documents (> 5000 words):** 500-1000 word chunks
- **Overlap:** 10-20% of chunk size

### Metadata Preservation

**Store Chunk Metadata:**
```python
def chunk_with_metadata(document, chunk_size=500):
    chunks = fixed_size_chunks(document['content'], chunk_size)
    
    chunked_documents = []
    for i, chunk in enumerate(chunks):
        chunked_documents.append({
            "content": chunk,
            "title": document['title'],
            "author": document['author'],
            "chunk_index": i,
            "total_chunks": len(chunks),
            "document_id": document['id'],
            "source_url": document.get('url', '')
        })
    
    return chunked_documents
```

---

## Lesson 6.3: Prompt Engineering for Retrieval

### Effective Prompt Templates

**Template 1: Simple Context**
```python
def simple_rag_prompt(query, context):
    return f"""Answer the question based on the following context.

Context:
{context}

Question: {query}

Answer:"""
```

**Template 2: With Instructions**
```python
def instruction_rag_prompt(query, context):
    return f"""You are a helpful assistant. Use the following context to answer the question. If the context doesn't contain enough information, say so.

Context:
{context}

Question: {query}

Instructions:
- Provide a clear, concise answer
- Cite specific parts of the context when relevant
- If you cannot answer from the context, state that clearly

Answer:"""
```

**Template 3: With Citations**
```python
def citation_rag_prompt(query, context_documents):
    context_parts = []
    for i, doc in enumerate(context_documents, 1):
        context_parts.append(f"[{i}] {doc['title']}\n{doc['content']}")
    
    context = "\n\n".join(context_parts)
    
    return f"""Answer the question using the provided sources. Cite sources using [1], [2], etc.

Sources:
{context}

Question: {query}

Answer with citations:"""
```

**Template 4: Multi-Turn Conversation**
```python
def conversational_rag_prompt(query, context, conversation_history):
    history_text = "\n".join([
        f"User: {h['user']}\nAssistant: {h['assistant']}" 
        for h in conversation_history[-3:]  # Last 3 turns
    ])
    
    return f"""You are a helpful assistant in a conversation. Use the context to answer questions.

Previous conversation:
{history_text}

Context:
{context}

Current question: {query}

Answer:"""
```

### Advanced Prompting Techniques

**1. Chain-of-Thought:**
```python
def cot_rag_prompt(query, context):
    return f"""Answer the question step by step using the context.

Context:
{context}

Question: {query}

Think through this step by step:
1. What information is needed?
2. What does the context say?
3. How can I combine this information?

Answer:"""
```

**2. Self-Consistency:**
```python
def self_consistent_rag(query, context, num_samples=3):
    """Generate multiple answers and select most consistent"""
    answers = []
    for _ in range(num_samples):
        prompt = f"Context: {context}\n\nQuestion: {query}\n\nAnswer:"
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7  # Higher for diversity
        )
        answers.append(response.choices[0].message.content)
    
    # Select most common answer (simplified)
    # In practice, use more sophisticated selection
    return max(set(answers), key=answers.count)
```

**3. Few-Shot Examples:**
```python
def few_shot_rag_prompt(query, context):
    examples = """
Example 1:
Context: Machine learning is a subset of AI...
Question: What is machine learning?
Answer: Machine learning is a subset of artificial intelligence that enables systems to learn from data.

Example 2:
Context: Python is a programming language...
Question: What is Python?
Answer: Python is a high-level programming language known for its simplicity.
"""
    
    return f"""Answer questions based on context, following these examples:

{examples}

Context:
{context}

Question: {query}

Answer:"""
```

---

## Lesson 6.4: Evaluation of RAG Outputs

### Evaluation Metrics

**1. Retrieval Metrics:**
- **Precision@K:** Fraction of retrieved docs that are relevant
- **Recall@K:** Fraction of relevant docs that were retrieved
- **MRR (Mean Reciprocal Rank):** Average of 1/rank of first relevant doc

**2. Generation Metrics:**
- **BLEU:** N-gram overlap with reference
- **ROUGE:** Recall-oriented metrics
- **BERTScore:** Semantic similarity
- **Faithfulness:** Factual accuracy

**3. End-to-End Metrics:**
- **Answer Relevance:** Does answer address question?
- **Context Utilization:** Is retrieved context used?
- **Citation Accuracy:** Are citations correct?

### Implementing Evaluation

**Retrieval Evaluation:**
```python
def evaluate_retrieval(query, retrieved_docs, relevant_doc_ids):
    """Evaluate retrieval quality"""
    retrieved_ids = {doc['_additional']['id'] for doc in retrieved_docs}
    relevant_ids = set(relevant_doc_ids)
    
    true_positives = retrieved_ids & relevant_ids
    precision = len(true_positives) / len(retrieved_ids) if retrieved_ids else 0
    recall = len(true_positives) / len(relevant_ids) if relevant_ids else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    # MRR
    mrr = 0
    for i, doc in enumerate(retrieved_docs, 1):
        if doc['_additional']['id'] in relevant_ids:
            mrr = 1.0 / i
            break
    
    return {
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "mrr": mrr
    }
```

**Answer Quality Evaluation:**
```python
from rouge_score import rouge_scorer

def evaluate_answer(generated_answer, reference_answer):
    """Evaluate answer quality"""
    scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
    scores = scorer.score(reference_answer, generated_answer)
    
    return {
        "rouge1": scores['rouge1'].fmeasure,
        "rouge2": scores['rouge2'].fmeasure,
        "rougeL": scores['rougeL'].fmeasure
    }
```

**Faithfulness Evaluation:**
```python
def evaluate_faithfulness(answer, context_docs):
    """Check if answer is supported by context"""
    # Use LLM to evaluate
    prompt = f"""Is the following answer supported by the context? Answer Yes or No.

Context:
{chr(10).join([d['content'] for d in context_docs])}

Answer: {answer}

Is the answer supported? (Yes/No):"""
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )
    
    result = response.choices[0].message.content.strip().lower()
    return result.startswith("yes")
```

### Comprehensive Evaluation Framework

**Complete Evaluation:**
```python
def evaluate_rag_system(test_cases, rag_function):
    """Evaluate RAG system on test cases"""
    results = {
        "retrieval": [],
        "generation": [],
        "faithfulness": []
    }
    
    for test_case in test_cases:
        query = test_case['query']
        relevant_doc_ids = test_case['relevant_doc_ids']
        reference_answer = test_case['reference_answer']
        
        # Run RAG
        answer, retrieved_docs = rag_function(query)
        
        # Evaluate retrieval
        retrieval_metrics = evaluate_retrieval(query, retrieved_docs, relevant_doc_ids)
        results["retrieval"].append(retrieval_metrics)
        
        # Evaluate generation
        generation_metrics = evaluate_answer(answer, reference_answer)
        results["generation"].append(generation_metrics)
        
        # Evaluate faithfulness
        faithfulness = evaluate_faithfulness(answer, retrieved_docs)
        results["faithfulness"].append(faithfulness)
    
    # Aggregate results
    return {
        "retrieval": {
            "avg_precision": sum(r["precision"] for r in results["retrieval"]) / len(results["retrieval"]),
            "avg_recall": sum(r["recall"] for r in results["retrieval"]) / len(results["retrieval"]),
            "avg_f1": sum(r["f1"] for r in results["retrieval"]) / len(results["retrieval"]),
            "avg_mrr": sum(r["mrr"] for r in results["retrieval"]) / len(results["retrieval"])
        },
        "generation": {
            "avg_rouge1": sum(g["rouge1"] for g in results["generation"]) / len(results["generation"]),
            "avg_rouge2": sum(g["rouge2"] for g in results["generation"]) / len(results["generation"]),
            "avg_rougeL": sum(g["rougeL"] for g in results["generation"]) / len(results["generation"])
        },
        "faithfulness": sum(results["faithfulness"]) / len(results["faithfulness"])
    }
```

---

## Lab 6: Build RAG Chatbot

### Objectives
- Build complete RAG chatbot
- Implement chunking strategy
- Engineer effective prompts
- Evaluate system performance

### Step 1: Setup Knowledge Base

**Ingest Documents:**
```python
# Load and chunk documents
def prepare_knowledge_base(documents):
    chunked_docs = []
    for doc in documents:
        chunks = semantic_chunks(doc['content'], chunk_size=500)
        for i, chunk in enumerate(chunks):
            chunked_docs.append({
                "content": chunk,
                "title": doc['title'],
                "document_id": doc['id'],
                "chunk_index": i
            })
    
    # Ingest into Weaviate
    with client.batch(batch_size=100) as batch:
        for doc in chunked_docs:
            batch.add_data_object(doc, "DocumentChunk")
    
    return len(chunked_docs)
```

### Step 2: Build RAG Function

**Complete RAG Implementation:**
```python
import openai

def rag_chatbot(query, conversation_history=[], k=5):
    # 1. Retrieve context
    response = (
        client.query
        .get("DocumentChunk", ["content", "title", "document_id", "chunk_index"])
        .with_near_text({"concepts": [query]})
        .with_limit(k)
        .do()
    )
    
    retrieved_docs = response['data']['Get']['DocumentChunk']
    
    # 2. Assemble context
    context_parts = []
    for i, doc in enumerate(retrieved_docs, 1):
        context_parts.append(f"[{i}] {doc['title']}\n{doc['content']}")
    context = "\n\n".join(context_parts)
    
    # 3. Build prompt
    prompt = citation_rag_prompt(query, retrieved_docs)
    
    # 4. Generate response
    messages = [
        {"role": "system", "content": "You are a helpful assistant. Use the provided context to answer questions accurately."},
        {"role": "user", "content": prompt}
    ]
    
    # Add conversation history
    for turn in conversation_history[-3:]:  # Last 3 turns
        messages.append({"role": "user", "content": turn['user']})
        messages.append({"role": "assistant", "content": turn['assistant']})
    
    messages.append({"role": "user", "content": prompt})
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        temperature=0.7
    )
    
    answer = response.choices[0].message.content
    
    # 5. Extract citations
    citations = [doc['document_id'] for doc in retrieved_docs]
    
    return {
        "answer": answer,
        "citations": citations,
        "source_documents": retrieved_docs
    }
```

### Step 3: Interactive Chatbot

**Chat Interface:**
```python
def run_chatbot():
    print("RAG Chatbot - Type 'quit' to exit\n")
    conversation_history = []
    
    while True:
        query = input("You: ")
        if query.lower() == 'quit':
            break
        
        # Get response
        result = rag_chatbot(query, conversation_history)
        
        print(f"\nAssistant: {result['answer']}")
        print(f"\nSources: {len(result['citations'])} documents")
        for i, doc in enumerate(result['source_documents'][:3], 1):
            print(f"  [{i}] {doc['title']}")
        print()
        
        # Update history
        conversation_history.append({
            "user": query,
            "assistant": result['answer']
        })

# Run chatbot
run_chatbot()
```

### Step 4: Evaluation

**Create Test Cases:**
```python
test_cases = [
    {
        "query": "What is machine learning?",
        "relevant_doc_ids": ["doc1", "doc2"],
        "reference_answer": "Machine learning is a subset of AI..."
    },
    # Add more test cases...
]

# Evaluate
results = evaluate_rag_system(test_cases, rag_chatbot)
print("Evaluation Results:")
print(f"Retrieval Precision: {results['retrieval']['avg_precision']:.3f}")
print(f"Retrieval Recall: {results['retrieval']['avg_recall']:.3f}")
print(f"Generation ROUGE-L: {results['generation']['avg_rougeL']:.3f}")
print(f"Faithfulness: {results['faithfulness']:.3f}")
```

### Lab Deliverables

**Submit:**
1. Complete RAG chatbot implementation
2. Chunking strategy documentation
3. Prompt templates used
4. Evaluation results
5. Analysis of performance and improvements

---

## Summary

**Key Takeaways:**
- **Rag Combines**: RAG combines retrieval and generation
- **Chunking Strategy**: Chunking strategy is critical
- **Prompt Engineering**: Prompt engineering affects quality
- **Evaluation Is**: Evaluation is essential for improvement
- **Multiple Rag**: Multiple RAG patterns exist for different use cases

**What's Next:**
- **Module 7:**: Module 7: Deploy and scale in production
- **security and monitoring Understanding**: Learn security and monitoring
- **deployment options Understanding**: Understand deployment options

---

## Additional Resources

- [RAG Paper](https://arxiv.org/abs/2005.11401)
- [LangChain RAG](https://python.langchain.com/docs/use_cases/question_answering/)
- [LlamaIndex](https://www.llamaindex.ai/)
- [RAG Evaluation](https://github.com/explodinggradients/ragas)

---

**Ready for Module 7? Let's deploy to production!**
