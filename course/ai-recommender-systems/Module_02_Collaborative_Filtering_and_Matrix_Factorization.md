---
title: "Module 2: Collaborative Filtering & Matrix Factorization"
description: "Master the foundational algorithms of recommendation systems: collaborative filtering and matrix factorization"
module: "2"
order: 2
---

# Module 2: Collaborative Filtering & Matrix Factorization

**Duration:** Week 2  
**Startup Tool Focus:** NeuralMerch  
**Learning Objectives:**
- Understand how to structure user-item interaction data into matrices
- Master user-based and item-based collaborative filtering algorithms
- Implement matrix factorization techniques including SVD and SVD++
- Learn to handle explicit and implicit feedback
- Build production-ready recommendation systems using classical approaches

---

## Introduction: The Foundation of Recommendation Systems

**Collaborative Filtering (CF)** is the cornerstone of modern recommendation systems. The core idea is simple yet powerful: **users who agreed in the past tend to agree in the future**. 

**Key Principle:**
- If User A and User B have similar tastes (they liked similar items), then items that User A liked but User B hasn't seen yet are good recommendations for User B.

**Why It Works:**
- **Network effects:** Leverages the collective wisdom of all users
- **No content analysis needed:** Works purely on interaction patterns
- **Proven at scale:** Powers Netflix, Amazon, Spotify recommendations

**Business Impact:**
- **Netflix:** 75% of viewing comes from recommendations (mostly CF-based)
- **Amazon:** 35% of revenue from recommendations (CF + content-based hybrid)
- **Spotify:** 60% of music discovery through collaborative filtering

---

## Lesson 2.1: The Mechanics of Interaction Matrices

### Understanding User-Item Matrices

At the heart of collaborative filtering is the **user-item interaction matrix**. This matrix captures all interactions between users and items.

#### Matrix Structure

**Basic Format:**
```
        Item 1  Item 2  Item 3  Item 4  Item 5
User 1    5       ?       4       ?       3
User 2    ?       4       5       2       ?
User 3    3       ?       ?       4       5
User 4    ?       5       3       ?       4
```

**Key Characteristics:**
- **Rows:** Users
- **Columns:** Items
- **Values:** Interactions (ratings, clicks, purchases, etc.)
- **Sparsity:** Typically 95-99.9% empty (most users haven't interacted with most items)

#### Explicit vs. Implicit Feedback

**Explicit Feedback:**
- **Definition:** Direct user ratings or reviews
- **Examples:** 1-5 star ratings, thumbs up/down, written reviews
- **Advantages:** Clear signal of preference, high quality
- **Disadvantages:** Sparse (users rate few items), requires user effort

**Example Explicit Matrix:**
```python
explicit_matrix = {
    'User1': {'Item1': 5, 'Item3': 4, 'Item5': 3},
    'User2': {'Item2': 4, 'Item3': 5, 'Item4': 2},
    'User3': {'Item1': 3, 'Item4': 4, 'Item5': 5},
    'User4': {'Item2': 5, 'Item3': 3, 'Item5': 4}
}
```

**Implicit Feedback:**
- **Definition:** Inferred from user behavior
- **Examples:** Clicks, views, purchases, time spent, scroll depth
- **Advantages:** Abundant data, no user effort required
- **Disadvantages:** Ambiguous signal (click ≠ like), requires interpretation

**Example Implicit Matrix:**
```python
implicit_matrix = {
    'User1': {'Item1': 1, 'Item3': 1, 'Item5': 1},  # Purchased
    'User2': {'Item2': 1, 'Item3': 1, 'Item4': 1},  # Purchased
    'User3': {'Item1': 0.5, 'Item4': 0.8, 'Item5': 1},  # Time spent (normalized)
    'User4': {'Item2': 1, 'Item3': 0.3, 'Item5': 1}  # Click + purchase
}
```

---

### Building Interaction Matrices

#### From Raw Data to Matrix

**Step 1: Collect Raw Interaction Data**

```python
# Example raw data
raw_interactions = [
    {'user_id': 'U1', 'item_id': 'I1', 'rating': 5, 'timestamp': '2024-01-01'},
    {'user_id': 'U1', 'item_id': 'I3', 'rating': 4, 'timestamp': '2024-01-02'},
    {'user_id': 'U2', 'item_id': 'I2', 'rating': 4, 'timestamp': '2024-01-01'},
    {'user_id': 'U2', 'item_id': 'I3', 'rating': 5, 'timestamp': '2024-01-03'},
    # ... more interactions
]
```

**Step 2: Convert to Matrix Format**

```python
import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix

class InteractionMatrixBuilder:
    def __init__(self):
        self.user_to_idx = {}
        self.item_to_idx = {}
        self.idx_to_user = {}
        self.idx_to_item = {}
    
    def build_matrix(self, interactions, feedback_type='explicit'):
        """Build user-item interaction matrix"""
        # Create mappings
        unique_users = sorted(set(i['user_id'] for i in interactions))
        unique_items = sorted(set(i['item_id'] for i in interactions))
        
        self.user_to_idx = {user: idx for idx, user in enumerate(unique_users)}
        self.item_to_idx = {item: idx for idx, item in enumerate(unique_items)}
        self.idx_to_user = {idx: user for user, idx in self.user_to_idx.items()}
        self.idx_to_item = {idx: item for item, idx in self.item_to_idx.items()}
        
        # Initialize matrix
        n_users = len(unique_users)
        n_items = len(unique_items)
        matrix = np.zeros((n_users, n_items))
        
        # Fill matrix
        for interaction in interactions:
            user_idx = self.user_to_idx[interaction['user_id']]
            item_idx = self.item_to_idx[interaction['item_id']]
            
            if feedback_type == 'explicit':
                matrix[user_idx, item_idx] = interaction['rating']
            else:  # implicit
                matrix[user_idx, item_idx] = self._normalize_implicit(
                    interaction
                )
        
        # Convert to sparse matrix for efficiency
        return csr_matrix(matrix)
    
    def _normalize_implicit(self, interaction):
        """Normalize implicit feedback"""
        # Example: Combine multiple signals
        score = 0
        
        if interaction.get('clicked', False):
            score += 1
        if interaction.get('purchased', False):
            score += 5
        if interaction.get('time_spent', 0) > 60:  # seconds
            score += 2
        
        # Normalize to 0-1 range
        return min(score / 10.0, 1.0)
```

**Step 3: Handle Missing Values**

```python
def handle_missing_values(matrix, strategy='zero'):
    """Handle missing values in interaction matrix"""
    if strategy == 'zero':
        # Keep zeros (no interaction)
        return matrix
    elif strategy == 'mean':
        # Fill with user mean rating
        user_means = matrix.mean(axis=1)
        filled = matrix.copy()
        for i in range(matrix.shape[0]):
            filled[i, :] = np.where(
                filled[i, :] == 0,
                user_means[i],
                filled[i, :]
            )
        return filled
    elif strategy == 'median':
        # Fill with user median rating
        user_medians = np.median(matrix[matrix > 0], axis=1)
        # Similar implementation
        return matrix
```

---

### Understanding Matrix Sparsity

#### Calculating Sparsity

**Sparsity Definition:**
```
Sparsity = (1 - (Number of Interactions / Total Possible Interactions)) × 100%
```

**Example:**
- Users: 100,000
- Items: 50,000
- Total possible interactions: 5,000,000,000
- Actual interactions: 500,000
- **Sparsity: 99.99%**

**Real-World Sparsity Levels:**
- **E-commerce:** 99.5-99.9% (users buy few items)
- **Streaming:** 99.0-99.5% (users watch more content)
- **Social media:** 99.9-99.99% (users interact with tiny fraction of content)

#### Impact of Sparsity

**Challenges:**
1. **Similarity calculation:** Hard to find similar users/items with few overlapping interactions
2. **Recommendation quality:** Limited data leads to poor recommendations
3. **Computational efficiency:** Sparse matrices require special data structures

**Solutions:**
1. **Sparse matrix formats:** Use CSR (Compressed Sparse Row) or CSC formats
2. **Dimensionality reduction:** Matrix factorization reduces dimensions
3. **Hybrid approaches:** Combine with content-based filtering

---

### Working with Sparse Matrices

**Efficient Storage:**

```python
from scipy.sparse import csr_matrix, csc_matrix

# Create sparse matrix
dense_matrix = np.array([
    [5, 0, 4, 0, 3],
    [0, 4, 5, 2, 0],
    [3, 0, 0, 4, 5],
    [0, 5, 3, 0, 4]
])

sparse_matrix = csr_matrix(dense_matrix)

# Memory comparison
print(f"Dense size: {dense_matrix.nbytes} bytes")
print(f"Sparse size: {sparse_matrix.data.nbytes + sparse_matrix.indices.nbytes + sparse_matrix.indptr.nbytes} bytes")

# Access elements
print(sparse_matrix[0, 0])  # 5
print(sparse_matrix[0, 1])  # 0 (stored efficiently)
```

**Efficient Operations:**

```python
# Matrix-vector multiplication (fast with sparse)
user_vector = np.array([1, 2, 3, 4])
result = sparse_matrix.dot(user_vector)

# Find non-zero elements
nonzero_users, nonzero_items = sparse_matrix.nonzero()

# Get user's rated items
user_id = 0
user_items = sparse_matrix[user_id].nonzero()[1]  # Column indices
user_ratings = sparse_matrix[user_id, user_items].toarray()[0]
```

---

## Lesson 2.2: Memory-Based Filtering

### User-Based Collaborative Filtering

**The Algorithm:**
1. Find users similar to the target user
2. Aggregate ratings from similar users
3. Recommend items that similar users liked

#### Step 1: Calculate User Similarity

**Cosine Similarity:**

```python
from sklearn.metrics.pairwise import cosine_similarity

def cosine_similarity_users(user1_vector, user2_vector):
    """Calculate cosine similarity between two users"""
    # Remove unrated items (zeros) for comparison
    mask = (user1_vector > 0) & (user2_vector > 0)
    
    if mask.sum() == 0:
        return 0  # No common items
    
    user1_rated = user1_vector[mask]
    user2_rated = user2_vector[mask]
    
    # Cosine similarity
    dot_product = np.dot(user1_rated, user2_rated)
    norm1 = np.linalg.norm(user1_rated)
    norm2 = np.linalg.norm(user2_rated)
    
    if norm1 == 0 or norm2 == 0:
        return 0
    
    return dot_product / (norm1 * norm2)
```

**Pearson Correlation:**

```python
from scipy.stats import pearsonr

def pearson_correlation_users(user1_vector, user2_vector):
    """Calculate Pearson correlation between two users"""
    # Find common items
    mask = (user1_vector > 0) & (user2_vector > 0)
    
    if mask.sum() < 2:
        return 0  # Need at least 2 common items
    
    user1_rated = user1_vector[mask]
    user2_rated = user2_vector[mask]
    
    # Calculate correlation
    correlation, p_value = pearsonr(user1_rated, user2_rated)
    
    return correlation if not np.isnan(correlation) else 0
```

**Euclidean Distance (converted to similarity):**

```python
def euclidean_similarity_users(user1_vector, user2_vector):
    """Calculate similarity based on Euclidean distance"""
    # Find common items
    mask = (user1_vector > 0) & (user2_vector > 0)
    
    if mask.sum() == 0:
        return 0
    
    user1_rated = user1_vector[mask]
    user2_rated = user2_vector[mask]
    
    # Euclidean distance
    distance = np.sqrt(np.sum((user1_rated - user2_rated) ** 2))
    
    # Convert to similarity (inverse, normalized)
    max_distance = np.sqrt(len(user1_rated) * (5 - 1) ** 2)  # Assuming 1-5 scale
    similarity = 1 - (distance / max_distance)
    
    return max(0, similarity)  # Ensure non-negative
```

#### Step 2: Find Similar Users

```python
class UserBasedCF:
    def __init__(self, similarity_metric='cosine'):
        self.similarity_metric = similarity_metric
        self.user_similarity_matrix = None
        self.interaction_matrix = None
    
    def fit(self, interaction_matrix):
        """Build user similarity matrix"""
        self.interaction_matrix = interaction_matrix
        n_users = interaction_matrix.shape[0]
        
        # Calculate pairwise similarities
        similarity_matrix = np.zeros((n_users, n_users))
        
        for i in range(n_users):
            for j in range(i + 1, n_users):
                user_i = interaction_matrix[i].toarray()[0]
                user_j = interaction_matrix[j].toarray()[0]
                
                if self.similarity_metric == 'cosine':
                    similarity = cosine_similarity_users(user_i, user_j)
                elif self.similarity_metric == 'pearson':
                    similarity = pearson_correlation_users(user_i, user_j)
                elif self.similarity_metric == 'euclidean':
                    similarity = euclidean_similarity_users(user_i, user_j)
                
                similarity_matrix[i, j] = similarity
                similarity_matrix[j, i] = similarity  # Symmetric
        
        self.user_similarity_matrix = similarity_matrix
        return self
```

#### Step 3: Generate Recommendations

```python
    def predict_rating(self, user_idx, item_idx, k=50):
        """Predict rating for user-item pair"""
        user_ratings = self.interaction_matrix[user_idx].toarray()[0]
        
        # Get users who rated this item
        item_ratings = self.interaction_matrix[:, item_idx].toarray().flatten()
        rated_users = np.where(item_ratings > 0)[0]
        
        if len(rated_users) == 0:
            return 0  # No one rated this item
        
        # Get similarities to these users
        similarities = self.user_similarity_matrix[user_idx, rated_users]
        
        # Get top k similar users
        top_k_indices = np.argsort(similarities)[::-1][:k]
        top_k_users = rated_users[top_k_indices]
        top_k_similarities = similarities[top_k_indices]
        
        # Weighted average
        ratings = item_ratings[top_k_users]
        weighted_sum = np.sum(top_k_similarities * ratings)
        similarity_sum = np.sum(np.abs(top_k_similarities))
        
        if similarity_sum == 0:
            return 0
        
        # Normalize by user's average rating
        user_mean = np.mean(user_ratings[user_ratings > 0])
        prediction = user_mean + (weighted_sum / similarity_sum)
        
        return prediction
    
    def recommend(self, user_idx, n=10, k=50):
        """Generate top n recommendations for user"""
        user_ratings = self.interaction_matrix[user_idx].toarray()[0]
        unrated_items = np.where(user_ratings == 0)[0]
        
        predictions = []
        for item_idx in unrated_items:
            pred_rating = self.predict_rating(user_idx, item_idx, k)
            predictions.append((item_idx, pred_rating))
        
        # Sort by predicted rating
        predictions.sort(key=lambda x: x[1], reverse=True)
        
        return [item_idx for item_idx, _ in predictions[:n]]
```

---

### Item-Based Collaborative Filtering

**The Algorithm:**
1. Find items similar to items the user liked
2. Recommend similar items

**Why Item-Based?**
- **More stable:** Items change less than user preferences
- **Faster:** Fewer items than users (usually)
- **Better for sparse data:** Items have more ratings than users have items

#### Implementation

```python
class ItemBasedCF:
    def __init__(self, similarity_metric='cosine'):
        self.similarity_metric = similarity_metric
        self.item_similarity_matrix = None
        self.interaction_matrix = None
    
    def fit(self, interaction_matrix):
        """Build item similarity matrix"""
        self.interaction_matrix = interaction_matrix
        # Transpose: items are rows, users are columns
        item_matrix = interaction_matrix.T
        n_items = item_matrix.shape[0]
        
        # Calculate pairwise similarities
        similarity_matrix = np.zeros((n_items, n_items))
        
        for i in range(n_items):
            for j in range(i + 1, n_items):
                item_i = item_matrix[i].toarray()[0]
                item_j = item_matrix[j].toarray()[0]
                
                if self.similarity_metric == 'cosine':
                    similarity = cosine_similarity_users(item_i, item_j)
                elif self.similarity_metric == 'pearson':
                    similarity = pearson_correlation_users(item_i, item_j)
                elif self.similarity_metric == 'euclidean':
                    similarity = euclidean_similarity_users(item_i, item_j)
                
                similarity_matrix[i, j] = similarity
                similarity_matrix[j, i] = similarity
        
        self.item_similarity_matrix = similarity_matrix
        return self
    
    def predict_rating(self, user_idx, item_idx, k=50):
        """Predict rating for user-item pair"""
        user_ratings = self.interaction_matrix[user_idx].toarray()[0]
        
        # Get items user has rated
        rated_items = np.where(user_ratings > 0)[0]
        
        if len(rated_items) == 0:
            return 0
        
        # Get similarities to these items
        similarities = self.item_similarity_matrix[item_idx, rated_items]
        
        # Get top k similar items
        top_k_indices = np.argsort(similarities)[::-1][:k]
        top_k_items = rated_items[top_k_indices]
        top_k_similarities = similarities[top_k_indices]
        
        # Weighted average
        ratings = user_ratings[top_k_items]
        weighted_sum = np.sum(top_k_similarities * ratings)
        similarity_sum = np.sum(np.abs(top_k_similarities))
        
        if similarity_sum == 0:
            return 0
        
        return weighted_sum / similarity_sum
    
    def recommend(self, user_idx, n=10, k=50):
        """Generate top n recommendations for user"""
        user_ratings = self.interaction_matrix[user_idx].toarray()[0]
        unrated_items = np.where(user_ratings == 0)[0]
        
        predictions = []
        for item_idx in unrated_items:
            pred_rating = self.predict_rating(user_idx, item_idx, k)
            predictions.append((item_idx, pred_rating))
        
        predictions.sort(key=lambda x: x[1], reverse=True)
        return [item_idx for item_idx, _ in predictions[:n]]
```

---

### Comparing Similarity Metrics

**Performance Comparison:**

| Metric | Pros | Cons | Best For |
|--------|------|------|----------|
| **Cosine** | Fast, handles magnitude differences | Doesn't account for mean centering | Implicit feedback |
| **Pearson** | Accounts for rating bias | Requires sufficient overlap | Explicit ratings |
| **Euclidean** | Intuitive distance measure | Sensitive to scale | Normalized data |

**When to Use Each:**

- **Cosine Similarity:** Best for implicit feedback, when you care about direction not magnitude
- **Pearson Correlation:** Best for explicit ratings, accounts for user/item bias
- **Euclidean Distance:** Best when ratings are normalized and you want geometric distance

---

## Lesson 2.3: Matrix Factorization (MF) & Latent Factors

### Understanding Matrix Factorization

**The Core Idea:**
Decompose the user-item matrix into two lower-dimensional matrices that capture latent (hidden) factors.

**Mathematical Representation:**
```
R ≈ P × Q^T

Where:
- R: User-Item interaction matrix (m × n)
- P: User latent factors (m × k)
- Q: Item latent factors (n × k)
- k: Number of latent factors (typically 50-200)
```

**Visual Representation:**
```
User-Item Matrix (R)        User Factors (P)    Item Factors (Q^T)
[5  ?  4  ?  3]           [0.8 0.3]         [0.9 0.2]
[?  4  5  2  ?]    ≈      [0.2 0.9]    ×    [0.1 0.8]
[3  ?  ?  4  5]           [0.6 0.5]         [0.7 0.4]
[?  5  3  ?  4]           [0.4 0.7]         [0.3 0.6]
                                              [0.5 0.3]
```

**What Are Latent Factors?**
- **Hidden dimensions** that explain user preferences
- **Not directly observable** (unlike genres, categories)
- **Learned from data** through optimization
- **Examples:** "Action preference", "Romance preference", "Intellectual depth"

---

### Basic Matrix Factorization

#### The Objective Function

**Goal:** Minimize the difference between actual and predicted ratings

```
minimize: Σ (r_ui - p_u^T q_i)^2 + λ(||p_u||^2 + ||q_i||^2)

Where:
- r_ui: Actual rating of user u for item i
- p_u: User u's latent factor vector
- q_i: Item i's latent factor vector
- λ: Regularization parameter
```

#### Implementation: Stochastic Gradient Descent (SGD)

```python
import numpy as np
from tqdm import tqdm

class MatrixFactorization:
    def __init__(self, n_factors=50, learning_rate=0.01, 
                 regularization=0.01, n_epochs=100):
        self.n_factors = n_factors
        self.learning_rate = learning_rate
        self.regularization = regularization
        self.n_epochs = n_epochs
        self.user_factors = None
        self.item_factors = None
    
    def fit(self, interaction_matrix):
        """Train the matrix factorization model"""
        # Get dimensions
        n_users, n_items = interaction_matrix.shape
        
        # Initialize factors randomly
        self.user_factors = np.random.normal(
            scale=0.1, size=(n_users, self.n_factors)
        )
        self.item_factors = np.random.normal(
            scale=0.1, size=(n_items, self.n_factors)
        )
        
        # Get non-zero interactions
        interactions = []
        for u in range(n_users):
            for i in range(n_items):
                rating = interaction_matrix[u, i]
                if rating > 0:
                    interactions.append((u, i, rating))
        
        # Training loop
        for epoch in tqdm(range(self.n_epochs)):
            np.random.shuffle(interactions)
            
            for u, i, rating in interactions:
                # Predict rating
                prediction = np.dot(
                    self.user_factors[u],
                    self.item_factors[i]
                )
                
                # Calculate error
                error = rating - prediction
                
                # Update factors
                user_factor_old = self.user_factors[u].copy()
                
                self.user_factors[u] += self.learning_rate * (
                    error * self.item_factors[i] - 
                    self.regularization * self.user_factors[u]
                )
                
                self.item_factors[i] += self.learning_rate * (
                    error * user_factor_old - 
                    self.regularization * self.item_factors[i]
                )
        
        return self
    
    def predict(self, user_idx, item_idx):
        """Predict rating for user-item pair"""
        return np.dot(
            self.user_factors[user_idx],
            self.item_factors[item_idx]
        )
    
    def recommend(self, user_idx, n=10, exclude_rated=True):
        """Generate recommendations for user"""
        user_ratings = self.user_factors[user_idx]
        
        # Calculate scores for all items
        scores = np.dot(user_ratings, self.item_factors.T)
        
        if exclude_rated:
            # Exclude already rated items (if you have interaction matrix)
            pass  # Implementation depends on data structure
        
        # Get top n
        top_indices = np.argsort(scores)[::-1][:n]
        return top_indices
```

---

### Incorporating Bias

**Why Bias Matters:**
- Some users rate higher on average (optimistic users)
- Some items are rated higher on average (popular items)
- Global average rating affects all predictions

**Bias-Enhanced Prediction:**
```
r_ui = μ + b_u + b_i + p_u^T q_i

Where:
- μ: Global average rating
- b_u: User bias (deviation from global average)
- b_i: Item bias (deviation from global average)
```

**Implementation:**

```python
class BiasedMatrixFactorization(MatrixFactorization):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.global_mean = None
        self.user_biases = None
        self.item_biases = None
    
    def fit(self, interaction_matrix):
        """Train with bias terms"""
        n_users, n_items = interaction_matrix.shape
        
        # Calculate global mean
        ratings = []
        for u in range(n_users):
            for i in range(n_items):
                if interaction_matrix[u, i] > 0:
                    ratings.append(interaction_matrix[u, i])
        self.global_mean = np.mean(ratings)
        
        # Initialize factors and biases
        self.user_factors = np.random.normal(
            scale=0.1, size=(n_users, self.n_factors)
        )
        self.item_factors = np.random.normal(
            scale=0.1, size=(n_items, self.n_factors)
        )
        self.user_biases = np.zeros(n_users)
        self.item_biases = np.zeros(n_items)
        
        # Get interactions
        interactions = []
        for u in range(n_users):
            for i in range(n_items):
                rating = interaction_matrix[u, i]
                if rating > 0:
                    interactions.append((u, i, rating))
        
        # Training with bias
        for epoch in tqdm(range(self.n_epochs)):
            np.random.shuffle(interactions)
            
            for u, i, rating in interactions:
                # Predict with bias
                prediction = (
                    self.global_mean +
                    self.user_biases[u] +
                    self.item_biases[i] +
                    np.dot(self.user_factors[u], self.item_factors[i])
                )
                
                error = rating - prediction
                
                # Update biases
                self.user_biases[u] += self.learning_rate * (
                    error - self.regularization * self.user_biases[u]
                )
                self.item_biases[i] += self.learning_rate * (
                    error - self.regularization * self.item_biases[i]
                )
                
                # Update factors (same as before)
                user_factor_old = self.user_factors[u].copy()
                self.user_factors[u] += self.learning_rate * (
                    error * self.item_factors[i] - 
                    self.regularization * self.user_factors[u]
                )
                self.item_factors[i] += self.learning_rate * (
                    error * user_factor_old - 
                    self.regularization * self.item_factors[i]
                )
        
        return self
    
    def predict(self, user_idx, item_idx):
        """Predict with bias"""
        return (
            self.global_mean +
            self.user_biases[user_idx] +
            self.item_biases[item_idx] +
            np.dot(self.user_factors[user_idx], self.item_factors[item_idx])
        )
```

---

### SVD++: Incorporating Implicit Feedback

**The Problem:**
Basic MF only uses explicit ratings. But we have lots of implicit data (clicks, views) that can improve predictions.

**SVD++ Solution:**
Incorporate implicit feedback by adding a term that captures items the user has interacted with (even without rating).

**SVD++ Prediction:**
```
r_ui = μ + b_u + b_i + q_i^T (p_u + |N(u)|^(-1/2) Σ_{j∈N(u)} y_j)

Where:
- N(u): Set of items user u has implicitly interacted with
- y_j: Implicit feedback factor for item j
```

**Implementation:**

```python
class SVDPlusPlus:
    def __init__(self, n_factors=50, learning_rate=0.01, 
                 regularization=0.01, n_epochs=100):
        self.n_factors = n_factors
        self.learning_rate = learning_rate
        self.regularization = regularization
        self.n_epochs = n_epochs
        self.user_factors = None
        self.item_factors = None
        self.implicit_factors = None  # y_j factors
        self.user_biases = None
        self.item_biases = None
        self.global_mean = None
    
    def fit(self, explicit_matrix, implicit_matrix):
        """Train SVD++ with explicit and implicit feedback"""
        n_users, n_items = explicit_matrix.shape
        
        # Calculate global mean from explicit ratings
        ratings = []
        for u in range(n_users):
            for i in range(n_items):
                if explicit_matrix[u, i] > 0:
                    ratings.append(explicit_matrix[u, i])
        self.global_mean = np.mean(ratings) if ratings else 0
        
        # Initialize factors
        self.user_factors = np.random.normal(
            scale=0.1, size=(n_users, self.n_factors)
        )
        self.item_factors = np.random.normal(
            scale=0.1, size=(n_items, self.n_factors)
        )
        self.implicit_factors = np.random.normal(
            scale=0.1, size=(n_items, self.n_factors)
        )
        self.user_biases = np.zeros(n_users)
        self.item_biases = np.zeros(n_items)
        
        # Build implicit interaction sets for each user
        user_implicit_items = {}
        for u in range(n_users):
            implicit_items = np.where(implicit_matrix[u, :] > 0)[0]
            user_implicit_items[u] = implicit_items
        
        # Get explicit interactions
        interactions = []
        for u in range(n_users):
            for i in range(n_items):
                if explicit_matrix[u, i] > 0:
                    interactions.append((u, i, explicit_matrix[u, i]))
        
        # Training
        for epoch in tqdm(range(self.n_epochs)):
            np.random.shuffle(interactions)
            
            for u, i, rating in interactions:
                # Calculate implicit feedback contribution
                implicit_items = user_implicit_items.get(u, [])
                if len(implicit_items) > 0:
                    implicit_sum = np.sum(
                        self.implicit_factors[implicit_items], axis=0
                    )
                    implicit_contribution = implicit_sum / np.sqrt(len(implicit_items))
                else:
                    implicit_contribution = np.zeros(self.n_factors)
                
                # Enhanced user representation
                enhanced_user_factor = (
                    self.user_factors[u] + implicit_contribution
                )
                
                # Predict
                prediction = (
                    self.global_mean +
                    self.user_biases[u] +
                    self.item_biases[i] +
                    np.dot(enhanced_user_factor, self.item_factors[i])
                )
                
                error = rating - prediction
                
                # Update biases
                self.user_biases[u] += self.learning_rate * (
                    error - self.regularization * self.user_biases[u]
                )
                self.item_biases[i] += self.learning_rate * (
                    error - self.regularization * self.item_biases[i]
                )
                
                # Update explicit factors
                user_factor_old = self.user_factors[u].copy()
                self.user_factors[u] += self.learning_rate * (
                    error * self.item_factors[i] - 
                    self.regularization * self.user_factors[u]
                )
                self.item_factors[i] += self.learning_rate * (
                    error * user_factor_old - 
                    self.regularization * self.item_factors[i]
                )
                
                # Update implicit factors
                if len(implicit_items) > 0:
                    for j in implicit_items:
                        self.implicit_factors[j] += self.learning_rate * (
                            error * self.item_factors[i] / np.sqrt(len(implicit_items)) -
                            self.regularization * self.implicit_factors[j]
                        )
        
        return self
    
    def predict(self, user_idx, item_idx, implicit_items=None):
        """Predict with implicit feedback"""
        if implicit_items is None:
            implicit_items = []
        
        # Calculate implicit contribution
        if len(implicit_items) > 0:
            implicit_sum = np.sum(
                self.implicit_factors[implicit_items], axis=0
            )
            implicit_contribution = implicit_sum / np.sqrt(len(implicit_items))
        else:
            implicit_contribution = np.zeros(self.n_factors)
        
        enhanced_user_factor = (
            self.user_factors[user_idx] + implicit_contribution
        )
        
        return (
            self.global_mean +
            self.user_biases[user_idx] +
            self.item_biases[item_idx] +
            np.dot(enhanced_user_factor, self.item_factors[item_idx])
        )
```

---

### NeuralMerch Integration

**NeuralMerch** is a production tool for collaborative filtering and matrix factorization. Here's how to use it:

```python
from neuralmerch import NeuralMerchClient

# Initialize client
client = NeuralMerchClient(api_key='your_api_key')

# Upload interaction data
client.upload_interactions(interactions)

# Train model
model = client.train_model(
    algorithm='svd_plus_plus',
    n_factors=100,
    learning_rate=0.01,
    epochs=50
)

# Get recommendations
recommendations = client.get_recommendations(
    user_id='U123',
    n=20,
    include_implicit=True
)

# Batch predictions
predictions = client.batch_predict(
    user_ids=['U1', 'U2', 'U3'],
    item_ids=['I1', 'I2', 'I3']
)
```

---

## Module 2 Summary

### Key Takeaways

1. **Interaction Matrices are Fundamental:**
   - Structure all user-item interactions
   - Handle both explicit and implicit feedback
   - Sparse matrices require efficient storage

2. **Memory-Based CF is Interpretable:**
   - User-based: Find similar users
   - Item-based: Find similar items
   - Choose similarity metric based on data type

3. **Matrix Factorization is Powerful:**
   - Captures latent factors automatically
   - Scales better than memory-based methods
   - SVD++ incorporates implicit feedback effectively

### Production Checklist

**Data Preparation:**
- [ ] Structure interactions into user-item matrix
- [ ] Handle explicit and implicit feedback separately
- [ ] Use sparse matrix formats for efficiency
- [ ] Normalize ratings if needed

**Model Selection:**
- [ ] Start with item-based CF (more stable)
- [ ] Use matrix factorization for scalability
- [ ] Add bias terms for better accuracy
- [ ] Use SVD++ if implicit data available

**Evaluation:**
- [ ] Measure RMSE on test set
- [ ] Evaluate ranking metrics (NDCG, MAP)
- [ ] Monitor recommendation diversity
- [ ] Track computational performance

### Next Steps

**Lab 2: Matrix Factorization Implementation**
- Build user-item interaction matrix
- Implement user-based and item-based CF
- Train matrix factorization model
- Compare performance of different approaches

**Reading:**
- "Matrix Factorization Techniques for Recommender Systems" (Koren et al.)
- NeuralMerch documentation
- Case studies: Netflix Prize, Amazon recommendations

**Practice:**
- Implement SVD++ from scratch
- Experiment with different numbers of latent factors
- Compare explicit vs. implicit feedback

---

**Ready for Module 3?**  
→ [Module 3: Neural Collaborative Filtering](Module_03_Neural_Collaborative_Filtering.md)

---

*Module 2 Complete | Next: Deep Learning for Recommendations*
