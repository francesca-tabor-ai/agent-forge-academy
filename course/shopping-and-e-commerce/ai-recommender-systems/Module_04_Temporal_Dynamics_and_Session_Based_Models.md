---
title: "Module 4: Temporal Dynamics & Session-Based Models"
description: "Capture evolving preferences and handle anonymous users"
module: "4"
order: 4
---

# Module 4: Temporal Dynamics & Session-Based Models

**Duration:** Week 4  
**Startup Tool Focus:** SessionSense  
**Learning Objectives:**
- **temporal dynamics in user preferences Understanding**: Understand temporal dynamics in user preferences
- **RNNs Understanding**: Master RNNs (LSTM, GRU) for sequential recommendations
- **session-based recommendation Implementation**: Implement session-based recommendation systems
- **real-time intent adaptation Development**: Build real-time intent adaptation systems

---

## 4.1 Recurrent Neural Networks (RNNs)

### Why Temporal Dynamics Matter

User preferences **evolve over time**. What a user liked last month may not reflect their current interests.

**Examples:**
- **Seasonal preferences:** Summer movies in summer, holiday content in December
- **Life stage changes:** Preferences change with age, location, life events
- **Trend following:** Users adapt to new trends and genres
- **Fatigue effects:** Users get tired of certain content types

**The Challenge:** Traditional recommendation systems treat user preferences as static, missing these temporal patterns.

### Introduction to RNNs

**Recurrent Neural Networks (RNNs)** are designed to process sequential data by maintaining a "memory" of previous inputs.

**Key Concept:** Each time step uses both:
- Current input
- Hidden state from previous time step

**Architecture:**
```text
Time Step t-1:  [Input] → [RNN] → [Hidden State]
                                    ↓
Time Step t:    [Input] → [RNN] → [Hidden State]
                                    ↓
Time Step t+1:  [Input] → [RNN] → [Hidden State]
```

### LSTM (Long Short-Term Memory)

**Problem with Basic RNNs:** Vanishing gradient problem - can't remember long-term dependencies.

**Solution:** LSTM uses gates to control information flow:
- **Forget Gate:** What to forget from previous state
- **Input Gate:** What new information to store
- **Output Gate:** What to output

#### LSTM for Recommendations

```python
import torch
import torch.nn as nn

class LSTMRecommender(nn.Module):
    def __init__(self, n_items, embedding_dim=128, hidden_dim=256, 
                 num_layers=2, dropout=0.2):
        super(LSTMRecommender, self).__init__()
        
        self.n_items = n_items
        self.embedding_dim = embedding_dim
        self.hidden_dim = hidden_dim
        
        # Item embeddings
        self.item_embedding = nn.Embedding(n_items + 1, embedding_dim)  # +1 for padding
        
        # LSTM layer
        self.lstm = nn.LSTM(
            input_size=embedding_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            dropout=dropout if num_layers > 1 else 0,
            batch_first=True
        )
        
        # Output layer
        self.output = nn.Linear(hidden_dim, n_items)
        
        # Initialize
        nn.init.normal_(self.item_embedding.weight, std=0.01)
        nn.init.xavier_uniform_(self.output.weight)
    
    def forward(self, item_sequences, sequence_lengths=None):
        """
        Forward pass through LSTM
        
        Args:
            item_sequences: (batch_size, seq_length) - sequences of item IDs
            sequence_lengths: (batch_size,) - actual lengths of sequences
        
        Returns:
            Predictions for next item
        """
        # Embed items
        embedded = self.item_embedding(item_sequences)  # (batch, seq, emb_dim)
        
        # Pack sequences if lengths provided
        if sequence_lengths is not None:
            embedded = nn.utils.rnn.pack_padded_sequence(
                embedded, sequence_lengths, batch_first=True, enforce_sorted=False
            )
        
        # LSTM forward
        lstm_out, (hidden, cell) = self.lstm(embedded)
        
        # Unpack if packed
        if sequence_lengths is not None:
            lstm_out, _ = nn.utils.rnn.pad_packed_sequence(
                lstm_out, batch_first=True
            )
        
        # Use last hidden state for prediction
        # Get last valid output for each sequence
        if sequence_lengths is not None:
            last_outputs = []
            for i, length in enumerate(sequence_lengths):
                last_outputs.append(lstm_out[i, length - 1])
            last_hidden = torch.stack(last_outputs)
        else:
            last_hidden = lstm_out[:, -1, :]  # Last time step
        
        # Predict next item
        predictions = self.output(last_hidden)
        
        return predictions
```

### GRU (Gated Recurrent Unit)

**GRU** is a simpler alternative to LSTM with fewer parameters:
- **Update Gate:** Combines forget and input gates
- **Reset Gate:** Controls how much past information to forget

**Advantages:**
- Faster training
- Fewer parameters
- Often performs similarly to LSTM

#### GRU for Recommendations

```python
class GRURecommender(nn.Module):
    def __init__(self, n_items, embedding_dim=128, hidden_dim=256, 
                 num_layers=2, dropout=0.2):
        super(GRURecommender, self).__init__()
        
        self.n_items = n_items
        self.embedding_dim = embedding_dim
        self.hidden_dim = hidden_dim
        
        # Item embeddings
        self.item_embedding = nn.Embedding(n_items + 1, embedding_dim)
        
        # GRU layer
        self.gru = nn.GRU(
            input_size=embedding_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            dropout=dropout if num_layers > 1 else 0,
            batch_first=True
        )
        
        # Output layer
        self.output = nn.Linear(hidden_dim, n_items)
        
        # Initialize
        nn.init.normal_(self.item_embedding.weight, std=0.01)
        nn.init.xavier_uniform_(self.output.weight)
    
    def forward(self, item_sequences, sequence_lengths=None):
        """
        Forward pass through GRU
        """
        # Embed items
        embedded = self.item_embedding(item_sequences)
        
        # Pack sequences if lengths provided
        if sequence_lengths is not None:
            embedded = nn.utils.rnn.pack_padded_sequence(
                embedded, sequence_lengths, batch_first=True, enforce_sorted=False
            )
        
        # GRU forward
        gru_out, hidden = self.gru(embedded)
        
        # Unpack if packed
        if sequence_lengths is not None:
            gru_out, _ = nn.utils.rnn.pad_packed_sequence(
                gru_out, batch_first=True
            )
        
        # Use last hidden state
        if sequence_lengths is not None:
            last_outputs = []
            for i, length in enumerate(sequence_lengths):
                last_outputs.append(gru_out[i, length - 1])
            last_hidden = torch.stack(last_outputs)
        else:
            last_hidden = gru_out[:, -1, :]
        
        # Predict next item
        predictions = self.output(last_hidden)
        
        return predictions
```

### Training RNN Recommenders

```python
def train_rnn_recommender(model, train_loader, val_loader, epochs=50, lr=0.001):
    """
    Train RNN-based recommender
    """
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss(ignore_index=0)  # Ignore padding
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', factor=0.5, patience=5
    )
    
    best_val_loss = float('inf')
    
    for epoch in range(epochs):
        # Training
        model.train()
        train_loss = 0
        
        for sequences, targets, lengths in train_loader:
            sequences = sequences.to(device)
            targets = targets.to(device)
            lengths = lengths.to(device)
            
            # Forward pass
            predictions = model(sequences, lengths)
            loss = criterion(predictions, targets)
            
            # Backward pass
            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            
            train_loss += loss.item()
        
        # Validation
        model.eval()
        val_loss = 0
        
        with torch.no_grad():
            for sequences, targets, lengths in val_loader:
                sequences = sequences.to(device)
                targets = targets.to(device)
                lengths = lengths.to(device)
                
                predictions = model(sequences, lengths)
                loss = criterion(predictions, targets)
                val_loss += loss.item()
        
        train_loss /= len(train_loader)
        val_loss /= len(val_loader)
        
        scheduler.step(val_loss)
        
        print(f"Epoch {epoch+1}/{epochs}")
        print(f"Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}")
        
        # Save best model
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(model.state_dict(), 'best_rnn_model.pth')
```

### Handling Temporal Sequences

**Data Preparation:**
```python
def create_sequences(user_interactions, sequence_length=10):
    """
    Create sequences from user interaction history
    
    Args:
        user_interactions: Dict {user_id: [item_id, item_id, ...]}
        sequence_length: Length of input sequences
    
    Returns:
        sequences: Input sequences
        targets: Next item to predict
        lengths: Actual sequence lengths
    """
    sequences = []
    targets = []
    lengths = []
    
    for user_id, items in user_interactions.items():
        # Sort by timestamp if available
        # items = sorted(items, key=lambda x: x['timestamp'])
        # item_ids = [item['item_id'] for item in items]
        
        # Create sequences
        for i in range(len(items) - sequence_length):
            seq = items[i:i + sequence_length]
            target = items[i + sequence_length]
            
            sequences.append(seq)
            targets.append(target)
            lengths.append(sequence_length)
        
        # Handle sequences shorter than sequence_length
        if len(items) < sequence_length + 1:
            # Pad sequence
            padded_seq = [0] * (sequence_length - len(items) + 1) + items
            sequences.append(padded_seq[:-1])
            targets.append(padded_seq[-1])
            lengths.append(len(items))
    
    return sequences, targets, lengths
```

---

## 4.2 Session-Based Recommendation (Anonymous Users)

### The Anonymous User Problem

**Challenge:** Many users browse without logging in:
- **E-commerce:** 60-70% of sessions are anonymous
- **Content platforms:** High percentage of unregistered users
- **News sites:** Most readers don't have accounts

**Traditional approaches fail:**
- No user ID → can't use user-based collaborative filtering
- No user history → can't use matrix factorization
- No user profile → can't use content-based filtering

**Solution:** **Session-Based Recommendation** - use only the current session's click sequence.

### Session-Based Approaches

#### Approach 1: Item-to-Item Similarity

**Simple but effective:** Recommend items similar to items in current session.

```python
def session_based_item_similarity(session_items, item_similarity_matrix, n=10):
    """
    Recommend items based on session items using item similarity
    
    Args:
        session_items: List of item IDs in current session
        item_similarity_matrix: Precomputed item-item similarity matrix
        n: Number of recommendations
    
    Returns:
        Recommended item IDs
    """
    # Aggregate similarities from all session items
    item_scores = {}
    
    for session_item in session_items:
        if session_item in item_similarity_matrix:
            similar_items = item_similarity_matrix[session_item]
            
            for item, similarity in similar_items.items():
                if item not in session_items:  # Don't recommend already viewed
                    item_scores[item] = item_scores.get(item, 0) + similarity
    
    # Sort by score and return top n
    recommended = sorted(
        item_scores.items(),
        key=lambda x: x[1],
        reverse=True
    )[:n]
    
    return [item for item, score in recommended]
```

#### Approach 2: RNN-Based Session Recommendation

**More sophisticated:** Use RNN to learn session patterns.

```python
class SessionBasedRNN(nn.Module):
    def __init__(self, n_items, embedding_dim=128, hidden_dim=256):
        super(SessionBasedRNN, self).__init__()
        
        self.n_items = n_items
        self.embedding_dim = embedding_dim
        self.hidden_dim = hidden_dim
        
        # Item embeddings
        self.item_embedding = nn.Embedding(n_items + 1, embedding_dim)
        
        # GRU for session encoding
        self.gru = nn.GRU(
            input_size=embedding_dim,
            hidden_size=hidden_dim,
            batch_first=True
        )
        
        # Output layer
        self.output = nn.Linear(hidden_dim, n_items)
        
        # Initialize
        nn.init.normal_(self.item_embedding.weight, std=0.01)
        nn.init.xavier_uniform_(self.output.weight)
    
    def forward(self, session_sequences):
        """
        Predict next item from session sequence
        
        Args:
            session_sequences: (batch_size, seq_length) - session item sequences
        
        Returns:
            Predictions for next item
        """
        # Embed items
        embedded = self.item_embedding(session_sequences)
        
        # GRU forward
        gru_out, hidden = self.gru(embedded)
        
        # Use last hidden state
        last_hidden = gru_out[:, -1, :]
        
        # Predict next item
        predictions = self.output(last_hidden)
        
        return predictions
```

#### Approach 3: Attention-Based Session Recommendation

**State-of-the-art:** Use attention to weight important items in session.

```python
class AttentionSessionRNN(nn.Module):
    def __init__(self, n_items, embedding_dim=128, hidden_dim=256):
        super(AttentionSessionRNN, self).__init__()
        
        self.n_items = n_items
        self.embedding_dim = embedding_dim
        self.hidden_dim = hidden_dim
        
        # Item embeddings
        self.item_embedding = nn.Embedding(n_items + 1, embedding_dim)
        
        # GRU for session encoding
        self.gru = nn.GRU(
            input_size=embedding_dim,
            hidden_size=hidden_dim,
            batch_first=True
        )
        
        # Attention mechanism
        self.attention = nn.MultiheadAttention(
            embed_dim=hidden_dim,
            num_heads=4,
            batch_first=True
        )
        
        # Output layer
        self.output = nn.Linear(hidden_dim, n_items)
        
        # Initialize
        nn.init.normal_(self.item_embedding.weight, std=0.01)
        nn.init.xavier_uniform_(self.output.weight)
    
    def forward(self, session_sequences):
        """
        Predict next item with attention
        """
        # Embed items
        embedded = self.item_embedding(session_sequences)
        
        # GRU forward
        gru_out, hidden = self.gru(embedded)
        
        # Apply attention (query = last hidden, key/value = all outputs)
        last_hidden = gru_out[:, -1:, :]  # (batch, 1, hidden)
        attended, attention_weights = self.attention(
            last_hidden, gru_out, gru_out
        )
        
        # Predict next item
        predictions = self.output(attended.squeeze(1))
        
        return predictions, attention_weights
```

### Real-Time Session Recommendation

**Implementation for production:**

```python
class SessionRecommender:
    def __init__(self, model, item_encoder, top_k=10):
        self.model = model
        self.item_encoder = item_encoder
        self.top_k = top_k
        self.model.eval()
    
    def recommend(self, session_items, exclude_items=None):
        """
        Get recommendations for current session
        
        Args:
            session_items: List of item IDs in current session
            exclude_items: Items to exclude from recommendations
        
        Returns:
            Recommended item IDs with scores
        """
        # Encode session items
        session_sequence = self.item_encoder.encode(session_items)
        session_tensor = torch.LongTensor([session_sequence])
        
        # Predict
        with torch.no_grad():
            predictions = self.model(session_tensor)
            scores = torch.softmax(predictions, dim=1).squeeze()
        
        # Get top items
        top_scores, top_indices = torch.topk(scores, k=self.top_k + len(exclude_items or []))
        
        # Decode and filter
        recommendations = []
        for idx, score in zip(top_indices, top_scores):
            item_id = self.item_encoder.decode(idx.item())
            if exclude_items is None or item_id not in exclude_items:
                recommendations.append((item_id, score.item()))
        
        return recommendations[:self.top_k]
```

---

## 4.3 Real-Time Intent Adaptation

### The Need for Real-Time Adaptation

**Problem:** User intent can change rapidly:
- **Shopping session:** Browsing → specific product search → price comparison
- **Content consumption:** News → entertainment → educational
- **E-commerce:** Window shopping → urgent purchase

**Traditional systems:** Update models daily/weekly - too slow to capture intent shifts.

**Solution:** **Real-Time Intent Adaptation** - detect and adapt to intent changes within hours or minutes.

### Intent Detection

#### Approach 1: Feature-Based Intent Detection

```python
def detect_intent(session_features):
    """
    Detect user intent from session features
    
    Args:
        session_features: Dict with session characteristics
            - time_spent: Average time per item
            - click_depth: Number of items viewed
            - search_queries: Search terms used
            - category_distribution: Categories viewed
    
    Returns:
        Intent label: 'browsing', 'searching', 'purchasing', etc.
    """
    # Browsing: High click depth, low time per item, diverse categories
    if (session_features['click_depth'] > 10 and
        session_features['time_spent'] < 30 and
        session_features['category_diversity'] > 0.7):
        return 'browsing'
    
    # Searching: Search queries present, focused categories
    if (len(session_features['search_queries']) > 0 and
        session_features['category_diversity'] < 0.3):
        return 'searching'
    
    # Purchasing: High time per item, price comparisons, cart additions
    if (session_features['time_spent'] > 120 and
        session_features['price_comparisons'] > 0 and
        session_features['cart_additions'] > 0):
        return 'purchasing'
    
    return 'exploring'
```

#### Approach 2: ML-Based Intent Detection

```python
class IntentDetector(nn.Module):
    def __init__(self, feature_dim=20, hidden_dim=64, n_intents=5):
        super(IntentDetector, self).__init__()
        
        self.classifier = nn.Sequential(
            nn.Linear(feature_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim // 2, n_intents)
        )
    
    def forward(self, session_features):
        """
        Predict intent from session features
        """
        return self.classifier(session_features)
```

### Adaptive Recommendation Strategies

#### Strategy 1: Intent-Specific Models

```python
class AdaptiveRecommender:
    def __init__(self, intent_models, intent_detector):
        """
        Args:
            intent_models: Dict {intent: model}
            intent_detector: Intent detection model
        """
        self.intent_models = intent_models
        self.intent_detector = intent_detector
    
    def recommend(self, session, session_features):
        """
        Adapt recommendations based on detected intent
        """
        # Detect intent
        intent = self.intent_detector(session_features)
        
        # Get intent-specific model
        model = self.intent_models[intent]
        
        # Generate recommendations
        recommendations = model.recommend(session)
        
        return recommendations, intent
```

#### Strategy 2: Dynamic Re-ranking

```python
def dynamic_rerank(recommendations, session_features, intent):
    """
    Re-rank recommendations based on current intent
    """
    intent_weights = {
        'browsing': {'diversity': 0.4, 'novelty': 0.3, 'popularity': 0.3},
        'searching': {'relevance': 0.6, 'popularity': 0.2, 'diversity': 0.2},
        'purchasing': {'relevance': 0.5, 'price': 0.3, 'reviews': 0.2}
    }
    
    weights = intent_weights.get(intent, intent_weights['browsing'])
    
    # Score each recommendation
    scored_recs = []
    for item, base_score in recommendations:
        # Calculate intent-specific score
        diversity_score = calculate_diversity(item, session_features)
        relevance_score = calculate_relevance(item, session_features)
        popularity_score = calculate_popularity(item)
        
        # Weighted combination
        final_score = (
            weights.get('diversity', 0) * diversity_score +
            weights.get('relevance', 0) * relevance_score +
            weights.get('popularity', 0) * popularity_score +
            base_score * 0.3  # Keep some base score
        )
        
        scored_recs.append((item, final_score))
    
    # Re-sort by new scores
    scored_recs.sort(key=lambda x: x[1], reverse=True)
    
    return scored_recs
```

### Real-Time Model Updates

#### Online Learning

```python
class OnlineLearningRecommender:
    def __init__(self, base_model, learning_rate=0.001):
        self.model = base_model
        self.learning_rate = learning_rate
        self.optimizer = torch.optim.SGD(
            self.model.parameters(), lr=learning_rate
        )
    
    def update_from_feedback(self, session, item, feedback):
        """
        Update model in real-time from user feedback
        
        Args:
            session: Session sequence
            item: Recommended item
            feedback: User feedback (click, purchase, skip, etc.)
        """
        # Convert feedback to target
        target = 1.0 if feedback in ['click', 'purchase'] else 0.0
        
        # Forward pass
        prediction = self.model(session, item)
        loss = nn.BCELoss()(prediction, torch.tensor([target]))
        
        # Update
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        
        return loss.item()
```

### Real-World Implementation: SessionSense

**SessionSense** provides:

1. **Session-Based Recommendation Engine**
   - RNN-based session modeling
   - Attention mechanisms
   - Real-time inference

2. **Intent Detection**
   - ML-based intent classification
   - Real-time intent tracking
   - Adaptive strategies

3. **Online Learning**
   - Real-time model updates
   - Feedback integration
   - A/B testing framework

**Usage:**
```python
from sessionsense import SessionRecommender

# Initialize
recommender = SessionRecommender(
    model_type='attention_rnn',
    embedding_dim=128
)

# Train on session data
recommender.train(session_data, epochs=50)

# Real-time recommendation
session = [item1, item2, item3]  # Current session
recommendations = recommender.recommend(session, n=10)

# Update from feedback
recommender.update_from_feedback(session, recommended_item, 'click')
```

---

## Lab 4: Session-Based Recommender

### Objective
Build a session-based recommendation system for anonymous users.

### Tasks

1. **Implement Session RNN**
   - Build GRU-based session recommender
   - Train on session clickstream data
   - Evaluate with hit rate and NDCG

2. **Add Attention Mechanism**
   - Implement attention-based session model
   - Compare with basic RNN
   - Analyze attention weights

3. **Real-Time Intent Adaptation**
   - Build intent detection system
   - Implement adaptive recommendation strategies
   - Test on real session data

4. **Online Learning**
   - Implement online learning updates
   - Test model adaptation speed
   - Measure performance improvement

### Deliverables
- Code implementation
- Performance evaluation
- Analysis of intent detection accuracy
- Real-time adaptation results

---

## Summary

**Key Takeaways:**

- **Temporal dynamics matter:**: User preferences evolve over time
- **RNNs capture sequences:**: LSTM and GRU model temporal patterns
- **Session-based recs work:**: Can recommend without user IDs
- **Real-time adaptation:**: Detect and adapt to intent changes quickly
- **Online learning:**: Update models from real-time feedback

**Next Steps:**
- **Module 5:**: Module 5: Hybrid Architectures & Multi-Modal Fusion
- **how to combine multiple recommendation approaches Understanding**: Learn how to combine multiple recommendation approaches
- **multi-modal feature integration Understanding**: Master multi-modal feature integration

---

**Module 4 Complete**   
*Ready for Module 5: Hybrid Architectures & Multi-Modal Fusion*