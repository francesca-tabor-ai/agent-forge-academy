---
title: "Module 3: Advanced NLP for Search and Customer Experience"
description: "Enhancing the search interface and summarizing massive volumes of user-generated content"
module: "3"
order: 3
---

# Module 3: Advanced NLP for Search and Customer Experience

**Duration:** Week 3  
**Learning Objectives:**
- Implement hybrid review summarization (extractive + abstractive)
- Build Seq2Seq models for query rewriting
- Design behavioral ghosting systems for search auto-completion
- Enhance search interfaces with NLP techniques
- Process and summarize massive volumes of user-generated content

---

## 3.1 Hybrid Review Summarization

### The Challenge: Information Overload

**Problem:** E-commerce platforms have massive volumes of customer reviews:
- Millions of products
- Billions of reviews
- Thousands of reviews per popular product
- Multiple languages
- Varying quality and relevance

**User Need:** Customers want quick insights without reading hundreds of reviews.

**Solution:** Automated review summarization that:
- Extracts key information
- Generates coherent summaries
- Works across languages
- Maintains factual accuracy

### Hybrid Approach: Extractive + Abstractive

**Two-Step Process:**

1. **Extractive Step (Unsupervised):**
   - Identify informative sentences from reviews
   - Select sentences that capture key points
   - Preserve original wording (factual accuracy)

2. **Abstractive Step (Supervised):**
   - Generate coherent summaries from extracted sentences
   - Create fluent, readable text
   - Handle cross-lingual summarization

**Why Hybrid?**
- **Extractive:** Ensures factual accuracy (uses original text)
- **Abstractive:** Creates coherent, readable summaries
- **Combined:** Best of both worlds

### Step 1: Extractive Summarization

**Purpose:** Identify the most informative sentences from reviews.

**Approach:** Use unsupervised methods to score and rank sentences.

#### Method 1: TF-IDF Based Extraction

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def extractive_summarization_tfidf(
    reviews: List[str],
    num_sentences: int = 5
) -> List[str]:
    """
    Extract informative sentences using TF-IDF.
    
    Args:
        reviews: List of review texts
        num_sentences: Number of sentences to extract
    
    Returns:
        List of extracted sentences
    """
    # Split reviews into sentences
    all_sentences = []
    for review in reviews:
        sentences = split_into_sentences(review)
        all_sentences.extend(sentences)
    
    # Calculate TF-IDF
    vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(all_sentences)
    
    # Calculate sentence importance scores
    # Method 1: Sum of TF-IDF scores
    sentence_scores = np.array(tfidf_matrix.sum(axis=1)).flatten()
    
    # Method 2: Similarity to document centroid
    doc_centroid = tfidf_matrix.mean(axis=0)
    similarities = cosine_similarity(tfidf_matrix, doc_centroid)
    sentence_scores = similarities.flatten()
    
    # Select top sentences
    top_indices = np.argsort(sentence_scores)[-num_sentences:][::-1]
    selected_sentences = [all_sentences[i] for i in top_indices]
    
    return selected_sentences
```

#### Method 2: TextRank (Graph-Based)

```python
import networkx as nx
from sklearn.metrics.pairwise import cosine_similarity

def extractive_summarization_textrank(
    reviews: List[str],
    num_sentences: int = 5
) -> List[str]:
    """
    Extract informative sentences using TextRank algorithm.
    
    Args:
        reviews: List of review texts
        num_sentences: Number of sentences to extract
    
    Returns:
        List of extracted sentences
    """
    # Split into sentences
    all_sentences = split_into_sentences(' '.join(reviews))
    
    # Create sentence embeddings (using simple TF-IDF for example)
    vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
    sentence_vectors = vectorizer.fit_transform(all_sentences)
    
    # Build similarity graph
    similarity_matrix = cosine_similarity(sentence_vectors)
    
    # Create graph
    G = nx.Graph()
    for i in range(len(all_sentences)):
        G.add_node(i, sentence=all_sentences[i])
    
    # Add edges for similar sentences
    threshold = 0.1
    for i in range(len(all_sentences)):
        for j in range(i + 1, len(all_sentences)):
            if similarity_matrix[i][j] > threshold:
                G.add_edge(i, j, weight=similarity_matrix[i][j])
    
    # Calculate PageRank scores
    scores = nx.pagerank(G)
    
    # Select top sentences
    top_indices = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:num_sentences]
    selected_sentences = [all_sentences[i] for i, _ in top_indices]
    
    return selected_sentences
```

#### Method 3: BERT-Based Extraction

```python
from transformers import BertTokenizer, BertModel
import torch

def extractive_summarization_bert(
    reviews: List[str],
    num_sentences: int = 5
) -> List[str]:
    """
    Extract informative sentences using BERT embeddings.
    
    Args:
        reviews: List of review texts
        num_sentences: Number of sentences to extract
    
    Returns:
        List of extracted sentences
    """
    # Load BERT model
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
    model = BertModel.from_pretrained('bert-base-uncased')
    model.eval()
    
    # Split into sentences
    all_sentences = []
    for review in reviews:
        sentences = split_into_sentences(review)
        all_sentences.extend(sentences)
    
    # Get sentence embeddings
    sentence_embeddings = []
    for sentence in all_sentences:
        inputs = tokenizer(sentence, return_tensors='pt', truncation=True, max_length=512)
        with torch.no_grad():
            outputs = model(**inputs)
            # Use [CLS] token embedding
            embedding = outputs.last_hidden_state[0][0].numpy()
            sentence_embeddings.append(embedding)
    
    sentence_embeddings = np.array(sentence_embeddings)
    
    # Calculate importance scores
    # Method: Similarity to centroid
    centroid = sentence_embeddings.mean(axis=0)
    similarities = cosine_similarity(sentence_embeddings, centroid.reshape(1, -1))
    sentence_scores = similarities.flatten()
    
    # Select top sentences
    top_indices = np.argsort(sentence_scores)[-num_sentences:][::-1]
    selected_sentences = [all_sentences[i] for i in top_indices]
    
    return selected_sentences
```

### Step 2: Abstractive Summarization

**Purpose:** Generate coherent, readable summaries from extracted sentences.

**Approach:** Use supervised Seq2Seq models (e.g., T5, BART, GPT).

#### Implementation with T5

```python
from transformers import T5Tokenizer, T5ForConditionalGeneration

class ReviewSummarizer:
    def __init__(self, model_name: str = 't5-base'):
        """
        Initialize abstractive summarizer.
        
        Args:
            model_name: Pre-trained T5 model name
        """
        self.tokenizer = T5Tokenizer.from_pretrained(model_name)
        self.model = T5ForConditionalGeneration.from_pretrained(model_name)
        self.model.eval()
    
    def summarize(
        self,
        extracted_sentences: List[str],
        max_length: int = 150,
        min_length: int = 30
    ) -> str:
        """
        Generate abstractive summary from extracted sentences.
        
        Args:
            extracted_sentences: Sentences from extractive step
            max_length: Maximum summary length
            min_length: Minimum summary length
        
        Returns:
            Generated summary
        """
        # Combine extracted sentences
        input_text = ' '.join(extracted_sentences)
        
        # Prepare input
        input_text = f"summarize: {input_text}"
        inputs = self.tokenizer(
            input_text,
            max_length=512,
            truncation=True,
            return_tensors='pt'
        )
        
        # Generate summary
        with torch.no_grad():
            outputs = self.model.generate(
                inputs['input_ids'],
                max_length=max_length,
                min_length=min_length,
                num_beams=4,
                early_stopping=True
            )
        
        # Decode summary
        summary = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        return summary
```

### Cross-Lingual Summarization

**Challenge:** Reviews in multiple languages need unified summaries.

**Solution:** Use multilingual models or translation + summarization.

#### Approach 1: Multilingual Model

```python
from transformers import MBartForConditionalGeneration, MBart50Tokenizer

class MultilingualReviewSummarizer:
    def __init__(self):
        """Initialize multilingual summarizer."""
        self.tokenizer = MBart50Tokenizer.from_pretrained('facebook/mbart-large-50')
        self.model = MBartForConditionalGeneration.from_pretrained('facebook/mbart-large-50')
        self.model.eval()
    
    def summarize_multilingual(
        self,
        reviews_by_language: Dict[str, List[str]],
        target_language: str = 'en'
    ) -> str:
        """
        Summarize reviews in multiple languages.
        
        Args:
            reviews_by_language: Dict mapping language codes to review lists
            target_language: Target language for summary
        
        Returns:
            Summary in target language
        """
        # Extract sentences from each language
        all_extracted = []
        
        for lang, reviews in reviews_by_language.items():
            # Extractive step (language-specific)
            extracted = extractive_summarization_bert(reviews, num_sentences=3)
            all_extracted.extend(extracted)
        
        # Translate to target language if needed
        if target_language != 'en':
            all_extracted = self.translate_sentences(all_extracted, target_language)
        
        # Abstractive summarization
        summarizer = ReviewSummarizer()
        summary = summarizer.summarize(all_extracted)
        
        return summary
    
    def translate_sentences(self, sentences: List[str], target_lang: str) -> List[str]:
        """Translate sentences to target language."""
        # Set target language
        self.tokenizer.src_lang = 'en'
        
        translated = []
        for sentence in sentences:
            inputs = self.tokenizer(sentence, return_tensors='pt')
            generated_tokens = self.model.generate(
                **inputs,
                forced_bos_token_id=self.tokenizer.lang_code_to_id[target_lang]
            )
            translated_sentence = self.tokenizer.batch_decode(
                generated_tokens, skip_special_tokens=True
            )[0]
            translated.append(translated_sentence)
        
        return translated
```

### Complete Hybrid Pipeline

```python
def hybrid_review_summarization(
    reviews: List[str],
    languages: List[str] = None,
    num_extracted: int = 10,
    summary_length: int = 150
) -> Dict[str, str]:
    """
    Complete hybrid review summarization pipeline.
    
    Args:
        reviews: List of review texts
        languages: List of language codes (if multilingual)
        num_extracted: Number of sentences to extract
        summary_length: Target summary length
    
    Returns:
        Dictionary with summary and metadata
    """
    # Step 1: Extractive summarization
    extracted_sentences = extractive_summarization_bert(
        reviews,
        num_sentences=num_extracted
    )
    
    # Step 2: Abstractive summarization
    summarizer = ReviewSummarizer()
    summary = summarizer.summarize(
        extracted_sentences,
        max_length=summary_length
    )
    
    # Step 3: Extract key aspects (optional)
    aspects = extract_key_aspects(extracted_sentences)
    
    return {
        'summary': summary,
        'extracted_sentences': extracted_sentences,
        'key_aspects': aspects,
        'num_reviews': len(reviews),
        'num_extracted': len(extracted_sentences)
    }
```

---

## 3.2 Negotiating the "Vocabulary Gap"

### The Problem: Negation Queries

**Challenge:** Users often search using negation, but product titles use positive features.

**Examples:**
- User: "sneakers no laces"
- Products: "slip-on sneakers", "lace-free sneakers", "velcro sneakers"

**The Gap:**
- User vocabulary: Negative features ("no laces", "without buttons")
- Product vocabulary: Positive features ("slip-on", "button-free")
- Mismatch leads to poor search results

### Solution: Query Rewriting with Seq2Seq

**Approach:** Train a Seq2Seq model to rewrite negation queries into positive feature requests.

**Process:**
1. Collect query pairs (negation → positive)
2. Train Seq2Seq model
3. Rewrite user queries before search
4. Match rewritten queries to product titles

### Data Collection

**Training Data Format:**
```
Input (Negation): "sneakers no laces"
Output (Positive): "slip-on sneakers"

Input: "shirt without buttons"
Output: "button-free shirt"

Input: "phone no headphone jack"
Output: "wireless phone" or "USB-C phone"
```

**Data Sources:**
- User search logs (negation queries)
- Click-through data (what users actually clicked)
- Manual annotation
- Synthetic generation

### Seq2Seq Model Implementation

```python
import torch
import torch.nn as nn
from transformers import T5ForConditionalGeneration, T5Tokenizer

class QueryRewriter:
    def __init__(self, model_path: str = None):
        """
        Initialize query rewriter.
        
        Args:
            model_path: Path to fine-tuned model (if None, uses base T5)
        """
        if model_path:
            self.model = T5ForConditionalGeneration.from_pretrained(model_path)
            self.tokenizer = T5Tokenizer.from_pretrained(model_path)
        else:
            self.model = T5ForConditionalGeneration.from_pretrained('t5-small')
            self.tokenizer = T5Tokenizer.from_pretrained('t5-small')
        
        self.model.eval()
    
    def rewrite_query(self, query: str, max_length: int = 50) -> str:
        """
        Rewrite negation query to positive feature request.
        
        Args:
            query: Original user query (may contain negation)
            max_length: Maximum length of rewritten query
        
        Returns:
            Rewritten query with positive features
        """
        # Prepare input
        input_text = f"rewrite query: {query}"
        inputs = self.tokenizer(
            input_text,
            max_length=128,
            truncation=True,
            return_tensors='pt'
        )
        
        # Generate rewritten query
        with torch.no_grad():
            outputs = self.model.generate(
                inputs['input_ids'],
                max_length=max_length,
                num_beams=4,
                early_stopping=True
            )
        
        # Decode
        rewritten = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        return rewritten
```

### Training the Model

```python
from torch.utils.data import Dataset, DataLoader

class QueryRewritingDataset(Dataset):
    def __init__(self, negation_queries: List[str], positive_queries: List[str], tokenizer):
        """
        Dataset for query rewriting.
        
        Args:
            negation_queries: List of queries with negation
            positive_queries: List of corresponding positive queries
            tokenizer: Tokenizer for the model
        """
        self.negation_queries = negation_queries
        self.positive_queries = positive_queries
        self.tokenizer = tokenizer
    
    def __len__(self):
        return len(self.negation_queries)
    
    def __getitem__(self, idx):
        negation = self.negation_queries[idx]
        positive = self.positive_queries[idx]
        
        # Prepare input
        input_text = f"rewrite query: {negation}"
        inputs = self.tokenizer(
            input_text,
            max_length=128,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )
        
        # Prepare target
        targets = self.tokenizer(
            positive,
            max_length=50,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )
        
        return {
            'input_ids': inputs['input_ids'].squeeze(),
            'attention_mask': inputs['attention_mask'].squeeze(),
            'labels': targets['input_ids'].squeeze()
        }

def train_query_rewriter(
    negation_queries: List[str],
    positive_queries: List[str],
    model_name: str = 't5-small',
    num_epochs: int = 5,
    batch_size: int = 16
):
    """
    Train query rewriter model.
    
    Args:
        negation_queries: Training queries with negation
        positive_queries: Target positive queries
        model_name: Base model name
        num_epochs: Number of training epochs
        batch_size: Batch size
    """
    # Initialize model and tokenizer
    model = T5ForConditionalGeneration.from_pretrained(model_name)
    tokenizer = T5Tokenizer.from_pretrained(model_name)
    
    # Create dataset
    dataset = QueryRewritingDataset(negation_queries, positive_queries, tokenizer)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
    
    # Setup training
    optimizer = torch.optim.AdamW(model.parameters(), lr=5e-5)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.to(device)
    model.train()
    
    # Training loop
    for epoch in range(num_epochs):
        total_loss = 0
        for batch in dataloader:
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['labels'].to(device)
            
            # Forward pass
            outputs = model(
                input_ids=input_ids,
                attention_mask=attention_mask,
                labels=labels
            )
            
            loss = outputs.loss
            
            # Backward pass
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
        
        print(f"Epoch {epoch + 1}, Average Loss: {total_loss / len(dataloader)}")
    
    # Save model
    model.save_pretrained('./query_rewriter_model')
    tokenizer.save_pretrained('./query_rewriter_model')
    
    return model, tokenizer
```

### Integration with Search

```python
def search_with_query_rewriting(
    user_query: str,
    product_catalog: List[Dict],
    rewriter: QueryRewriter
) -> List[Dict]:
    """
    Search with query rewriting to handle negation.
    
    Args:
        user_query: Original user query
        product_catalog: Product catalog
        rewriter: Trained query rewriter
    
    Returns:
        Search results
    """
    # Check if query contains negation
    negation_keywords = ['no', 'without', 'not', 'lack', 'missing']
    has_negation = any(keyword in user_query.lower() for keyword in negation_keywords)
    
    if has_negation:
        # Rewrite query
        rewritten_query = rewriter.rewrite_query(user_query)
        
        # Search with both original and rewritten
        results_original = search_products(user_query, product_catalog)
        results_rewritten = search_products(rewritten_query, product_catalog)
        
        # Combine and deduplicate
        all_results = combine_results(results_original, results_rewritten)
    else:
        # Normal search
        all_results = search_products(user_query, product_catalog)
    
    return all_results
```

---

## 3.3 Behavioral Ghosting

### The Concept: Inline Auto-Completion

**"Ghosting"** is the process of auto-completing search recommendations inline within the search box using session context to reduce misspellings and keystrokes.

**Key Features:**
- Appears as user types
- Uses session context (previous searches, browsing history)
- Reduces typing effort
- Prevents misspellings
- Improves search accuracy

### How Ghosting Works

**Process:**
1. User starts typing
2. System predicts likely query based on:
   - Current input
   - Session history
   - Popular queries
   - User behavior patterns
3. Shows suggestion inline (as "ghost text")
4. User can accept or continue typing

### Implementation

```python
class BehavioralGhosting:
    def __init__(self):
        """Initialize behavioral ghosting system."""
        self.session_history = []
        self.popular_queries = self.load_popular_queries()
        self.user_profile = {}
    
    def get_ghost_suggestion(
        self,
        current_input: str,
        session_id: str,
        user_id: str = None
    ) -> str:
        """
        Get ghost suggestion for current input.
        
        Args:
            current_input: What user has typed so far
            session_id: Current session ID
            user_id: User ID (if logged in)
        
        Returns:
            Suggested completion (empty if no good match)
        """
        # Get session context
        session_queries = self.get_session_queries(session_id)
        
        # Get user history (if available)
        user_history = self.get_user_history(user_id) if user_id else []
        
        # Find best match
        suggestions = []
        
        # 1. Match from session history
        for query in session_queries:
            if query.lower().startswith(current_input.lower()):
                suggestions.append({
                    'query': query,
                    'score': 0.4,  # Session context weight
                    'source': 'session'
                })
        
        # 2. Match from user history
        for query in user_history:
            if query.lower().startswith(current_input.lower()):
                suggestions.append({
                    'query': query,
                    'score': 0.3,  # User history weight
                    'source': 'user_history'
                })
        
        # 3. Match from popular queries
        for query in self.popular_queries:
            if query.lower().startswith(current_input.lower()):
                suggestions.append({
                    'query': query,
                    'score': 0.2,  # Popularity weight
                    'source': 'popular'
                })
        
        # 4. Fuzzy match (handle typos)
        fuzzy_matches = self.fuzzy_match(current_input)
        for match in fuzzy_matches:
            suggestions.append({
                'query': match,
                'score': 0.1,  # Fuzzy match weight
                'source': 'fuzzy'
            })
        
        # Sort by score and return best
        if suggestions:
            best = max(suggestions, key=lambda x: x['score'])
            return best['query']
        
        return ""
    
    def get_session_queries(self, session_id: str) -> List[str]:
        """Get queries from current session."""
        return self.session_history.get(session_id, [])
    
    def get_user_history(self, user_id: str) -> List[str]:
        """Get user's historical queries."""
        return self.user_profile.get(user_id, {}).get('queries', [])
    
    def fuzzy_match(self, input_text: str) -> List[str]:
        """
        Find fuzzy matches to handle typos.
        
        Uses edit distance or phonetic matching.
        """
        matches = []
        
        # Simple edit distance approach
        for query in self.popular_queries[:1000]:  # Limit search space
            distance = levenshtein_distance(input_text.lower(), query.lower()[:len(input_text)])
            
            # If edit distance is small relative to input length
            if distance <= len(input_text) * 0.3:
                matches.append(query)
        
        return matches[:5]  # Return top 5
    
    def update_session(self, session_id: str, query: str):
        """Update session history with new query."""
        if session_id not in self.session_history:
            self.session_history[session_id] = []
        
        self.session_history[session_id].append(query)
        
        # Keep only last 10 queries per session
        self.session_history[session_id] = self.session_history[session_id][-10:]
    
    def load_popular_queries(self) -> List[str]:
        """Load popular queries from database or cache."""
        # In production, this would load from a database
        # For example, top 10,000 queries from last 30 days
        return [
            "laptop", "phone", "headphones", "shoes", "clothing",
            "books", "electronics", "home", "kitchen", "sports"
            # ... more queries
        ]

def levenshtein_distance(s1: str, s2: str) -> int:
    """Calculate Levenshtein edit distance."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    
    if len(s2) == 0:
        return len(s1)
    
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    
    return previous_row[-1]
```

### Advanced: ML-Based Prediction

```python
import torch
import torch.nn as nn

class QueryPredictionModel(nn.Module):
    def __init__(self, vocab_size: int, embedding_dim: int = 128, hidden_dim: int = 256):
        """
        Neural network for query prediction.
        
        Args:
            vocab_size: Size of vocabulary
            embedding_dim: Embedding dimension
            hidden_dim: Hidden layer dimension
        """
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self.lstm = nn.LSTM(embedding_dim, hidden_dim, batch_first=True)
        self.fc = nn.Linear(hidden_dim, vocab_size)
    
    def forward(self, x):
        """Forward pass."""
        embedded = self.embedding(x)
        lstm_out, _ = self.lstm(embedded)
        # Use last output
        last_output = lstm_out[:, -1, :]
        output = self.fc(last_output)
        return output

class MLBasedGhosting:
    def __init__(self, model_path: str = None):
        """
        ML-based behavioral ghosting.
        
        Args:
            model_path: Path to trained model
        """
        self.model = QueryPredictionModel(vocab_size=10000)
        if model_path:
            self.model.load_state_dict(torch.load(model_path))
        self.model.eval()
        self.tokenizer = self.load_tokenizer()
    
    def predict_completion(
        self,
        current_input: str,
        session_context: List[str]
    ) -> str:
        """
        Predict query completion using ML model.
        
        Args:
            current_input: Current user input
            session_context: Previous queries in session
        
        Returns:
            Predicted completion
        """
        # Encode input and context
        input_ids = self.tokenizer.encode(current_input)
        context_ids = [self.tokenizer.encode(q) for q in session_context[-3:]]  # Last 3 queries
        
        # Combine context and current input
        combined = []
        for ctx in context_ids:
            combined.extend(ctx)
        combined.extend(input_ids)
        
        # Predict next tokens
        input_tensor = torch.tensor([combined]).long()
        with torch.no_grad():
            output = self.model(input_tensor)
            predicted_tokens = torch.argmax(output, dim=-1)[0]
        
        # Decode prediction
        completion = self.tokenizer.decode(predicted_tokens.tolist())
        
        return completion
```

### Integration with Search UI

```python
class SearchBoxWithGhosting:
    def __init__(self, ghosting_system: BehavioralGhosting):
        """
        Search box component with ghosting.
        
        Args:
            ghosting_system: Behavioral ghosting system
        """
        self.ghosting = ghosting_system
        self.current_input = ""
        self.session_id = self.generate_session_id()
    
    def on_input_change(self, user_input: str):
        """
        Handle user input changes.
        
        Args:
            user_input: Current input text
        """
        self.current_input = user_input
        
        # Get ghost suggestion
        suggestion = self.ghosting.get_ghost_suggestion(
            user_input,
            self.session_id
        )
        
        # Display suggestion as ghost text
        self.display_ghost_text(suggestion, user_input)
    
    def on_enter_press(self):
        """Handle enter/return key press."""
        query = self.current_input
        
        # Update session
        self.ghosting.update_session(self.session_id, query)
        
        # Perform search
        results = perform_search(query)
        
        return results
    
    def on_tab_press(self):
        """Handle tab key to accept ghost suggestion."""
        suggestion = self.ghosting.get_ghost_suggestion(
            self.current_input,
            self.session_id
        )
        
        if suggestion:
            self.current_input = suggestion
            self.display_ghost_text("", suggestion)  # Clear ghost text
    
    def display_ghost_text(self, suggestion: str, current_input: str):
        """
        Display ghost text in search box.
        
        In a real UI, this would update the visual display.
        """
        if suggestion and suggestion.startswith(current_input):
            ghost_part = suggestion[len(current_input):]
            # Display ghost_part in light gray
            print(f"Current: {current_input}")
            print(f"Ghost: {ghost_part}")
```

---

## Key Takeaways

**Hybrid Review Summarization:**
- Extractive step identifies informative sentences
- Abstractive step generates coherent summaries
- Works across multiple languages
- Maintains factual accuracy

**Query Rewriting:**
- Seq2Seq models rewrite negation queries
- Bridges vocabulary gap between users and products
- Improves search relevance
- Handles "no X" → "Y" transformations

**Behavioral Ghosting:**
- Inline auto-completion reduces typing
- Uses session context for predictions
- Prevents misspellings
- Improves user experience

**NLP for E-Commerce:**
- Process massive volumes of user content
- Enhance search interfaces
- Improve customer experience
- Reduce user effort

---

## Lab 3: Query Rewriting System

**Objective:** Build a Seq2Seq model to rewrite negation queries into positive feature requests.

**Requirements:**
1. Collect or generate training data (negation → positive pairs)
2. Train a Seq2Seq model (T5 or similar)
3. Evaluate on test set
4. Integrate with a simple search system
5. Measure improvement in search relevance

**Deliverables:**
- Python implementation of query rewriter
- Training script and evaluation metrics
- Test results showing improvement
- Written report (500 words) explaining approach and results

**Evaluation Criteria:**
- Model training and implementation (30%)
- Query rewriting accuracy (30%)
- Search relevance improvement (25%)
- Code quality and documentation (15%)

**Time Estimate:** 3-4 hours

---

## Additional Resources

**Readings:**
- "Hybrid Summarization for E-Commerce Reviews" - Research paper
- "Query Rewriting for E-Commerce Search" - Industry analysis
- "Behavioral Patterns in Search" - User behavior study

**Videos:**
- "Advanced NLP for Search" (30 min)
- "Building Query Rewriting Systems" (25 min)

**Tools to Explore:**
- Transformers library (T5, BART, GPT)
- spaCy for text processing
- PyTorch/TensorFlow for model training

**Next Module Preview:**
Module 4 will explore catalog intelligence and metadata enrichment, including attribute extraction, PatternRAG, and hallucination detection.

---

**Module 3 Complete**   
**Next:** Module 4 - Catalog Intelligence and Metadata Enrichment
