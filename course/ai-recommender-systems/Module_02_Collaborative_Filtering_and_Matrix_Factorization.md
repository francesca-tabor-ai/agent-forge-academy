---
title: "Module 2: Collaborative Filtering & Matrix Factorization"
description: "Master user-based, item-based, and matrix factorization approaches"
module: "2"
order: 2
---

# Module 2: Collaborative Filtering & Matrix Factorization

**Duration:** Week 2  
**Startup Tool Focus:** NeuralMerch  
**Learning Objectives:**
- Understand interaction matrix structures
- Master memory-based collaborative filtering
- Implement matrix factorization algorithms
- Learn SVD++ and bias incorporation

---

## 2.1 The Mechanics of Interaction Matrices

### Understanding Interaction Matrices

An **interaction matrix** is the fundamental data structure in recommendation systems. It represents the relationship between users and items through their interactions.

#### Matrix Structure

```
Interaction Matrix R (Users × Items):

        Item1  Item2  Item3  Item4  Item5  ...
User1    5      ?      3      ?      ?     ...
User2    ?      4      ?      5      ?     ...
User3    2      ?      ?      ?      4     ...
User4    ?      ?      5      4      ?     ...
...
```

**Dimensions:**
- **Rows:** Users (m users)
- **Columns:** Items (n items)
- **Values:** Interaction strength (ratings, clicks, purchases, etc.)

**Key Properties:**
- **Sparsity:** Typically 95-99% empty (no interaction)
- **Asymmetry:** Not all users interact with all items
- **Heterogeneity:** Different interaction types and scales

### Explicit vs Implicit Feedback

#### Explicit Feedback

**Definition:** Direct user expressions of preference (ratings, reviews, likes).

**Characteristics:**
- **Intentional:** User explicitly provides feedback
- **Scaled:** Usually on a scale (1-5 stars, 1-10, etc.)
- **Sparse:** Users rate only a small fraction of items
- **Reliable:** Direct expression of preference

**Examples:**
- Movie ratings (1-5 stars)
- Product reviews (1-5 stars)
- Restaurant ratings
- App store ratings

**Matrix Representation:**
```python
# Explicit feedback matrix
explicit_matrix = {
    'user1': {'item1': 5, 'item3': 3},
    'user2': {'item2': 4, 'item4': 5},
    'user3': {'item1': 2, 'item5': 4},
    'user4': {'item3': 5, 'item4': 4}
}

# Sparse matrix representation
import scipy.sparse as sp

# Create sparse matrix
rows = [0, 0, 1, 1, 2, 2, 3, 3]  # User indices
cols = [0, 2, 1, 3, 0, 4, 2, 3]   # Item indices
values = [5, 3, 4, 5, 2, 4, 5, 4] # Ratings

explicit_matrix_sparse = sp.csr_matrix(
    (values, (rows, cols)),
    shape=(4, 5)
)
```

**Advantages:**
- Clear preference signal
- Easy to interpret
- Direct user intent

**Disadvantages:**
- Very sparse (users rate few items)
- Requires user effort
- May have selection bias (only rate items with strong opinions)

#### Implicit Feedback

**Definition:** Inferred preferences from user behavior (clicks, views, purchases, time spent).

**Characteristics:**
- **Unintentional:** User behavior, not explicit rating
- **Binary or Continuous:** Clicks (0/1) or time spent (continuous)
- **Dense:** More interactions than explicit ratings
- **Noisy:** Behavior doesn't always indicate preference

**Examples:**
- Click-through events
- Page views
- Purchase history
- Time spent watching/reading
- Search queries
- Add to cart
- Scroll depth

**Matrix Representation:**
```python
# Implicit feedback matrix
implicit_matrix = {
    'user1': {'item1': 1, 'item2': 1, 'item3': 1},  # Clicked
    'user2': {'item2': 1, 'item4': 1},              # Clicked
    'user3': {'item1': 1, 'item5': 1, 'item2': 1},  # Clicked
    'user4': {'item3': 1, 'item4': 1, 'item1': 1}   # Clicked
}

# Weighted implicit feedback (time spent)
implicit_weighted = {
    'user1': {'item1': 120, 'item2': 45, 'item3': 300},  # Seconds
    'user2': {'item2': 60, 'item4': 180},
    'user3': {'item1': 90, 'item5': 240, 'item2': 30},
    'user4': {'item3': 150, 'item4': 210, 'item1': 75}
}
```

**Advantages:**
- Much denser data
- No user effort required
- Captures actual behavior
- Available for all users

**Disadvantages:**
- Ambiguous signal (click ≠ like)
- No negative feedback (absence of click ≠ dislike)
- Requires interpretation
- May reflect system bias

### Handling Sparse Matrices

**The Sparsity Problem:**
- Typical recommendation datasets: 95-99% empty
- MovieLens 1M: ~4% density
- Netflix Prize: ~1% density
- Amazon: <1% density

**Sparse Matrix Formats:**

**1. Coordinate Format (COO)**
```python
# Store only non-zero entries
coo_matrix = {
    'rows': [0, 0, 1, 1, 2, 2, 3, 3],
    'cols': [0, 2, 1, 3, 0, 4, 2, 3],
    'data': [5, 3, 4, 5, 2, 4, 5, 4]
}
```

**2. Compressed Sparse Row (CSR)**
```python
import scipy.sparse as sp

# Efficient for row operations
csr_matrix = sp.csr_matrix(
    (values, (rows, cols)),
    shape=(n_users, n_items)
)

# Fast row access
user_ratings = csr_matrix[user_id].toarray()
```

**3. Compressed Sparse Column (CSC)**
```python
# Efficient for column operations
csc_matrix = sp.csc_matrix(
    (values, (rows, cols)),
    shape=(n_users, n_items)
)

# Fast column access
item_ratings = csc_matrix[:, item_id].toarray()
```

### Matrix Operations for Recommendations

**Key Operations:**

**1. User-Item Similarity**
```python
def user_item_similarity(matrix, user1, user2):
    """
    Calculate similarity between two users based on common items
    """
    # Get items rated by both users
    user1_items = set(matrix[user1].keys())
    user2_items = set(matrix[user2].keys())
    common_items = user1_items & user2_items
    
    if not common_items:
        return 0.0
    
    # Get ratings for common items
    user1_ratings = [matrix[user1][item] for item in common_items]
    user2_ratings = [matrix[user2][item] for item in common_items]
    
    # Calculate similarity (e.g., cosine similarity)
    similarity = cosine_similarity(user1_ratings, user2_ratings)
    
    return similarity
```

**2. Item-Item Similarity**
```python
def item_item_similarity(matrix, item1, item2):
    """
    Calculate similarity between two items based on common users
    """
    # Get users who rated both items
    item1_users = set()
    item2_users = set()
    
    for user in matrix:
        if item1 in matrix[user]:
            item1_users.add(user)
        if item2 in matrix[user]:
            item2_users.add(user)
    
    common_users = item1_users & item2_users
    
    if not common_users:
        return 0.0
    
    # Get ratings from common users
    item1_ratings = [matrix[user][item1] for user in common_users]
    item2_ratings = [matrix[user][item2] for user in common_users]
    
    # Calculate similarity
    similarity = cosine_similarity(item1_ratings, item2_ratings)
    
    return similarity
```

**3. Matrix Normalization**

**Centering (Mean Subtraction):**
```python
def center_matrix(matrix):
    """
    Subtract user mean from each rating
    """
    centered = {}
    
    for user in matrix:
        user_ratings = list(matrix[user].values())
        user_mean = np.mean(user_ratings)
        
        centered[user] = {
            item: rating - user_mean
            for item, rating in matrix[user].items()
        }
    
    return centered
```

**Z-Score Normalization:**
```python
def normalize_matrix(matrix):
    """
    Z-score normalization (mean=0, std=1)
    """
    normalized = {}
    
    for user in matrix:
        user_ratings = list(matrix[user].values())
        user_mean = np.mean(user_ratings)
        user_std = np.std(user_ratings)
        
        if user_std == 0:
            normalized[user] = matrix[user]
        else:
            normalized[user] = {
                item: (rating - user_mean) / user_std
                for item, rating in matrix[user].items()
            }
    
    return normalized
```

---

## 2.2 Memory-Based Filtering

Memory-based collaborative filtering uses the entire user-item interaction matrix to make recommendations. It's called "memory-based" because it stores all interactions in memory and computes similarities on-the-fly.

### User-Based Collaborative Filtering

**Core Idea:** Users who have similar preferences in the past will have similar preferences in the future.

**Algorithm:**
1. Find users similar to the target user
2. Identify items liked by similar users
3. Recommend items the target user hasn't seen

#### Similarity Metrics

**1. Cosine Similarity**

Measures the angle between two vectors (ignores magnitude).

```python
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def cosine_similarity_users(matrix, user1, user2):
    """
    Calculate cosine similarity between two users
    """
    # Get common items
    user1_items = set(matrix[user1].keys())
    user2_items = set(matrix[user2].keys())
    common_items = user1_items & user2_items
    
    if not common_items:
        return 0.0
    
    # Create rating vectors for common items
    user1_vector = np.array([matrix[user1][item] for item in common_items])
    user2_vector = np.array([matrix[user2][item] for item in common_items])
    
    # Cosine similarity
    similarity = np.dot(user1_vector, user2_vector) / (
        np.linalg.norm(user1_vector) * np.linalg.norm(user2_vector)
    )
    
    return similarity
```

**2. Pearson Correlation**

Measures linear correlation, accounts for user rating bias.

```python
def pearson_correlation(matrix, user1, user2):
    """
    Calculate Pearson correlation between two users
    """
    # Get common items
    user1_items = set(matrix[user1].keys())
    user2_items = set(matrix[user2].keys())
    common_items = user1_items & user2_items
    
    if len(common_items) < 2:
        return 0.0
    
    # Get ratings for common items
    user1_ratings = np.array([matrix[user1][item] for item in common_items])
    user2_ratings = np.array([matrix[user2][item] for item in common_items])
    
    # Calculate means
    user1_mean = np.mean(user1_ratings)
    user2_mean = np.mean(user2_ratings)
    
    # Center the ratings
    user1_centered = user1_ratings - user1_mean
    user2_centered = user2_ratings - user2_mean
    
    # Pearson correlation
    numerator = np.sum(user1_centered * user2_centered)
    denominator = np.sqrt(
        np.sum(user1_centered ** 2) * np.sum(user2_centered ** 2)
    )
    
    if denominator == 0:
        return 0.0
    
    correlation = numerator / denominator
    return correlation
```

**3. Euclidean Distance**

Measures straight-line distance between rating vectors.

```python
def euclidean_similarity(matrix, user1, user2):
    """
    Calculate similarity based on Euclidean distance
    """
    # Get common items
    user1_items = set(matrix[user1].keys())
    user2_items = set(matrix[user2].keys())
    common_items = user1_items & user2_items
    
    if not common_items:
        return 0.0
    
    # Get ratings
    user1_ratings = np.array([matrix[user1][item] for item in common_items])
    user2_ratings = np.array([matrix[user2][item] for item in common_items])
    
    # Euclidean distance
    distance = np.sqrt(np.sum((user1_ratings - user2_ratings) ** 2))
    
    # Convert to similarity (inverse relationship)
    # Normalize by max possible distance
    max_rating = 5.0  # Assuming 1-5 scale
    max_distance = len(common_items) * max_rating
    similarity = 1 - (distance / max_distance)
    
    return max(0, similarity)  # Ensure non-negative
```

#### User-Based Prediction

```python
def user_based_predict(matrix, target_user, target_item, k=10):
    """
    Predict rating for target_user on target_item using k nearest neighbors
    """
    # Calculate similarities with all other users
    similarities = []
    
    for user in matrix:
        if user == target_user:
            continue
        if target_item not in matrix[user]:
            continue
        
        similarity = pearson_correlation(matrix, target_user, user)
        if similarity > 0:  # Only positive correlations
            similarities.append((user, similarity))
    
    # Sort by similarity and take top k
    similarities.sort(key=lambda x: x[1], reverse=True)
    top_k_users = similarities[:k]
    
    if not top_k_users:
        # No similar users found, return global mean
        return global_mean_rating(matrix)
    
    # Weighted average of ratings from similar users
    numerator = sum(
        similarity * (matrix[user][target_item] - user_mean_rating(matrix, user))
        for user, similarity in top_k_users
    )
    
    denominator = sum(abs(similarity) for _, similarity in top_k_users)
    
    if denominator == 0:
        return user_mean_rating(matrix, target_user)
    
    # Prediction
    user_mean = user_mean_rating(matrix, target_user)
    prediction = user_mean + (numerator / denominator)
    
    # Clip to valid rating range
    return np.clip(prediction, 1, 5)
```

### Item-Based Collaborative Filtering

**Core Idea:** Items that are similar (rated similarly by users) will be preferred by the same users.

**Algorithm:**
1. Find items similar to items the user has liked
2. Recommend similar items

**Advantages over User-Based:**
- More stable (item similarities change less than user similarities)
- Faster (fewer items than users typically)
- Better for sparse datasets

#### Item Similarity Calculation

```python
def item_item_similarity(matrix, item1, item2):
    """
    Calculate similarity between two items using Pearson correlation
    """
    # Find users who rated both items
    item1_users = set()
    item2_users = set()
    
    for user in matrix:
        if item1 in matrix[user]:
            item1_users.add(user)
        if item2 in matrix[user]:
            item2_users.add(user)
    
    common_users = item1_users & item2_users
    
    if len(common_users) < 2:
        return 0.0
    
    # Get ratings from common users
    item1_ratings = np.array([matrix[user][item1] for user in common_users])
    item2_ratings = np.array([matrix[user][item2] for user in common_users])
    
    # Calculate means
    item1_mean = np.mean(item1_ratings)
    item2_mean = np.mean(item2_ratings)
    
    # Center the ratings
    item1_centered = item1_ratings - item1_mean
    item2_centered = item2_ratings - item2_mean
    
    # Pearson correlation
    numerator = np.sum(item1_centered * item2_centered)
    denominator = np.sqrt(
        np.sum(item1_centered ** 2) * np.sum(item2_centered ** 2)
    )
    
    if denominator == 0:
        return 0.0
    
    correlation = numerator / denominator
    return correlation
```

#### Item-Based Prediction

```python
def item_based_predict(matrix, target_user, target_item, k=10):
    """
    Predict rating for target_user on target_item using item-based CF
    """
    # Get items the user has rated
    user_items = set(matrix[target_user].keys())
    
    if not user_items:
        return global_mean_rating(matrix)
    
    # Calculate similarities with user's rated items
    similarities = []
    
    for item in user_items:
        similarity = item_item_similarity(matrix, item, target_item)
        if similarity > 0:
            similarities.append((item, similarity))
    
    # Sort by similarity and take top k
    similarities.sort(key=lambda x: x[1], reverse=True)
    top_k_items = similarities[:k]
    
    if not top_k_items:
        return user_mean_rating(matrix, target_user)
    
    # Weighted average of user's ratings on similar items
    numerator = sum(
        similarity * matrix[target_user][item]
        for item, similarity in top_k_items
    )
    
    denominator = sum(abs(similarity) for _, similarity in top_k_items)
    
    if denominator == 0:
        return user_mean_rating(matrix, target_user)
    
    prediction = numerator / denominator
    
    # Clip to valid rating range
    return np.clip(prediction, 1, 5)
```

### Optimized Implementation with Precomputation

**Precompute Item-Item Similarity Matrix:**

```python
class ItemBasedCF:
    def __init__(self, matrix):
        self.matrix = matrix
        self.item_similarity_matrix = None
        self.compute_similarity_matrix()
    
    def compute_similarity_matrix(self):
        """
        Precompute all item-item similarities
        """
        items = set()
        for user in self.matrix:
            items.update(self.matrix[user].keys())
        
        items = list(items)
        n_items = len(items)
        
        # Initialize similarity matrix
        similarity_matrix = np.zeros((n_items, n_items))
        item_to_idx = {item: idx for idx, item in enumerate(items)}
        
        # Compute similarities
        for i, item1 in enumerate(items):
            for j, item2 in enumerate(items):
                if i != j:
                    similarity = item_item_similarity(self.matrix, item1, item2)
                    similarity_matrix[i][j] = similarity
        
        self.item_similarity_matrix = similarity_matrix
        self.items = items
        self.item_to_idx = item_to_idx
    
    def predict(self, target_user, target_item, k=10):
        """
        Fast prediction using precomputed similarities
        """
        if target_item not in self.item_to_idx:
            return global_mean_rating(self.matrix)
        
        target_idx = self.item_to_idx[target_item]
        
        # Get user's rated items
        user_items = list(self.matrix[target_user].keys())
        
        if not user_items:
            return user_mean_rating(self.matrix, target_user)
        
        # Get similarities
        similarities = []
        for item in user_items:
            if item in self.item_to_idx:
                item_idx = self.item_to_idx[item]
                similarity = self.item_similarity_matrix[item_idx][target_idx]
                if similarity > 0:
                    similarities.append((item, similarity))
        
        # Top k
        similarities.sort(key=lambda x: x[1], reverse=True)
        top_k = similarities[:k]
        
        if not top_k:
            return user_mean_rating(self.matrix, target_user)
        
        # Weighted average
        numerator = sum(
            sim * self.matrix[target_user][item]
            for item, sim in top_k
        )
        denominator = sum(abs(sim) for _, sim in top_k)
        
        if denominator == 0:
            return user_mean_rating(self.matrix, target_user)
        
        prediction = numerator / denominator
        return np.clip(prediction, 1, 5)
```

---

## 2.3 Matrix Factorization (MF) & Latent Factors

### Understanding Matrix Factorization

**Core Idea:** Decompose the user-item interaction matrix into lower-dimensional matrices that capture latent (hidden) factors.

**Mathematical Formulation:**

```
R ≈ P × Q^T

Where:
- R: User-Item matrix (m × n)
- P: User latent factors (m × k)
- Q: Item latent factors (n × k)
- k: Number of latent factors (typically 10-200)
```

**Interpretation:**
- Each user is represented by k latent factors
- Each item is represented by k latent factors
- Rating prediction: dot product of user and item factors

### Basic Matrix Factorization

```python
import numpy as np
from scipy.optimize import minimize

class MatrixFactorization:
    def __init__(self, n_users, n_items, n_factors=50, learning_rate=0.01, 
                 reg=0.01, epochs=100):
        self.n_users = n_users
        self.n_items = n_items
        self.n_factors = n_factors
        self.learning_rate = learning_rate
        self.reg = reg
        self.epochs = epochs
        
        # Initialize user and item factors randomly
        self.user_factors = np.random.normal(
            scale=0.1, size=(n_users, n_factors)
        )
        self.item_factors = np.random.normal(
            scale=0.1, size=(n_items, n_factors)
        )
    
    def predict(self, user_id, item_id):
        """
        Predict rating for user-item pair
        """
        return np.dot(
            self.user_factors[user_id],
            self.item_factors[item_id]
        )
    
    def fit(self, interactions):
        """
        Train the model using stochastic gradient descent
        
        Args:
            interactions: List of (user_id, item_id, rating) tuples
        """
        for epoch in range(self.epochs):
            np.random.shuffle(interactions)
            
            for user_id, item_id, rating in interactions:
                # Predict current rating
                prediction = self.predict(user_id, item_id)
                
                # Calculate error
                error = rating - prediction
                
                # Get current factors
                user_vec = self.user_factors[user_id]
                item_vec = self.item_factors[item_id]
                
                # Update factors using gradient descent
                user_update = self.learning_rate * (
                    error * item_vec - self.reg * user_vec
                )
                item_update = self.learning_rate * (
                    error * user_vec - self.reg * item_vec
                )
                
                self.user_factors[user_id] += user_update
                self.item_factors[item_id] += item_update
            
            # Calculate loss for monitoring
            if epoch % 10 == 0:
                loss = self.calculate_loss(interactions)
                print(f"Epoch {epoch}, Loss: {loss:.4f}")
    
    def calculate_loss(self, interactions):
        """
        Calculate mean squared error
        """
        total_error = 0
        for user_id, item_id, rating in interactions:
            prediction = self.predict(user_id, item_id)
            error = (rating - prediction) ** 2
            total_error += error
        
        return total_error / len(interactions)
```

### Matrix Factorization with Bias

**Bias Terms:**
- **Global bias (μ):** Overall average rating
- **User bias (b_u):** How much user deviates from average
- **Item bias (b_i):** How much item deviates from average

**Prediction Formula:**
```
r_ui = μ + b_u + b_i + p_u^T · q_i
```

**Implementation:**
```python
class MatrixFactorizationWithBias:
    def __init__(self, n_users, n_items, n_factors=50, learning_rate=0.01, 
                 reg=0.01, epochs=100):
        self.n_users = n_users
        self.n_items = n_items
        self.n_factors = n_factors
        self.learning_rate = learning_rate
        self.reg = reg
        self.epochs = epochs
        
        # Initialize factors
        self.user_factors = np.random.normal(
            scale=0.1, size=(n_users, n_factors)
        )
        self.item_factors = np.random.normal(
            scale=0.1, size=(n_items, n_factors)
        )
        
        # Initialize biases
        self.global_bias = 0.0
        self.user_bias = np.zeros(n_users)
        self.item_bias = np.zeros(n_items)
    
    def predict(self, user_id, item_id):
        """
        Predict rating with bias terms
        """
        prediction = (
            self.global_bias +
            self.user_bias[user_id] +
            self.item_bias[item_id] +
            np.dot(self.user_factors[user_id], self.item_factors[item_id])
        )
        return prediction
    
    def fit(self, interactions):
        """
        Train with bias terms
        """
        # Initialize global bias
        self.global_bias = np.mean([rating for _, _, rating in interactions])
        
        for epoch in range(self.epochs):
            np.random.shuffle(interactions)
            
            for user_id, item_id, rating in interactions:
                # Predict
                prediction = self.predict(user_id, item_id)
                error = rating - prediction
                
                # Get factors
                user_vec = self.user_factors[user_id]
                item_vec = self.item_factors[item_id]
                
                # Update biases
                self.user_bias[user_id] += self.learning_rate * (
                    error - self.reg * self.user_bias[user_id]
                )
                self.item_bias[item_id] += self.learning_rate * (
                    error - self.reg * self.item_bias[item_id]
                )
                
                # Update factors
                user_update = self.learning_rate * (
                    error * item_vec - self.reg * user_vec
                )
                item_update = self.learning_rate * (
                    error * user_vec - self.reg * item_vec
                )
                
                self.user_factors[user_id] += user_update
                self.item_factors[item_id] += item_update
```

### SVD++: Incorporating Implicit Feedback

**SVD++** extends matrix factorization to incorporate implicit feedback (clicks, views, purchases) in addition to explicit ratings.

**Key Innovation:** Model user preferences using both explicit ratings and implicit interactions.

**Prediction Formula:**
```
r_ui = μ + b_u + b_i + q_i^T · (p_u + |N(u)|^(-1/2) · Σ(y_j))
```

Where:
- `N(u)`: Set of items user u has implicitly interacted with
- `y_j`: Latent factor for implicit feedback from item j

**Implementation:**
```python
class SVDPlusPlus:
    def __init__(self, n_users, n_items, n_factors=50, learning_rate=0.01, 
                 reg=0.01, epochs=100):
        self.n_users = n_users
        self.n_items = n_items
        self.n_factors = n_factors
        self.learning_rate = learning_rate
        self.reg = reg
        self.epochs = epochs
        
        # Explicit factors
        self.user_factors = np.random.normal(
            scale=0.1, size=(n_users, n_factors)
        )
        self.item_factors = np.random.normal(
            scale=0.1, size=(n_items, n_factors)
        )
        
        # Implicit feedback factors
        self.implicit_factors = np.random.normal(
            scale=0.1, size=(n_items, n_factors)
        )
        
        # Biases
        self.global_bias = 0.0
        self.user_bias = np.zeros(n_users)
        self.item_bias = np.zeros(n_items)
        
        # Store implicit interactions
        self.user_implicit_items = {}  # user_id -> set of item_ids
    
    def add_implicit_feedback(self, user_id, item_id):
        """
        Add implicit interaction (click, view, etc.)
        """
        if user_id not in self.user_implicit_items:
            self.user_implicit_items[user_id] = set()
        self.user_implicit_items[user_id].add(item_id)
    
    def predict(self, user_id, item_id):
        """
        Predict rating with implicit feedback
        """
        # Base prediction
        prediction = (
            self.global_bias +
            self.user_bias[user_id] +
            self.item_bias[item_id]
        )
        
        # Explicit interaction term
        explicit_term = np.dot(
            self.user_factors[user_id],
            self.item_factors[item_id]
        )
        
        # Implicit feedback term
        implicit_term = 0.0
        if user_id in self.user_implicit_items:
            implicit_items = self.user_implicit_items[user_id]
            if implicit_items:
                # Sum of implicit factors
                implicit_sum = np.sum(
                    [self.implicit_factors[item] for item in implicit_items],
                    axis=0
                )
                # Normalize by sqrt of count
                normalization = 1.0 / np.sqrt(len(implicit_items))
                implicit_term = normalization * np.dot(
                    implicit_sum,
                    self.item_factors[item_id]
                )
        
        prediction += explicit_term + implicit_term
        return prediction
    
    def fit(self, explicit_interactions, implicit_interactions=None):
        """
        Train SVD++ model
        
        Args:
            explicit_interactions: List of (user_id, item_id, rating)
            implicit_interactions: List of (user_id, item_id) for implicit feedback
        """
        # Add implicit feedback
        if implicit_interactions:
            for user_id, item_id in implicit_interactions:
                self.add_implicit_feedback(user_id, item_id)
        
        # Initialize global bias
        if explicit_interactions:
            self.global_bias = np.mean([
                rating for _, _, rating in explicit_interactions
            ])
        
        for epoch in range(self.epochs):
            np.random.shuffle(explicit_interactions)
            
            for user_id, item_id, rating in explicit_interactions:
                # Predict
                prediction = self.predict(user_id, item_id)
                error = rating - prediction
                
                # Get factors
                user_vec = self.user_factors[user_id]
                item_vec = self.item_factors[item_id]
                
                # Update biases
                self.user_bias[user_id] += self.learning_rate * (
                    error - self.reg * self.user_bias[user_id]
                )
                self.item_bias[item_id] += self.learning_rate * (
                    error - self.reg * self.item_bias[item_id]
                )
                
                # Update explicit factors
                user_update = self.learning_rate * (
                    error * item_vec - self.reg * user_vec
                )
                item_update = self.learning_rate * (
                    error * user_vec - self.reg * item_vec
                )
                
                self.user_factors[user_id] += user_update
                self.item_factors[item_id] += item_update
                
                # Update implicit factors
                if user_id in self.user_implicit_items:
                    implicit_items = self.user_implicit_items[user_id]
                    if implicit_items:
                        normalization = 1.0 / np.sqrt(len(implicit_items))
                        
                        for implicit_item in implicit_items:
                            implicit_update = self.learning_rate * (
                                error * normalization * item_vec -
                                self.reg * self.implicit_factors[implicit_item]
                            )
                            self.implicit_factors[implicit_item] += implicit_update
```

### Real-World Implementation: NeuralMerch

**NeuralMerch** provides a production-ready matrix factorization system with:

1. **Efficient Sparse Matrix Operations**
   - Optimized for large-scale datasets
   - GPU acceleration support

2. **Multiple Factorization Algorithms**
   - Basic MF
   - MF with bias
   - SVD++
   - Non-negative matrix factorization (NMF)

3. **Hyperparameter Tuning**
   - Automatic grid search
   - Cross-validation support

**Usage Example:**
```python
from neuralmerch import MatrixFactorizationEngine

# Initialize engine
engine = MatrixFactorizationEngine(
    n_factors=100,
    learning_rate=0.01,
    regularization=0.01
)

# Train on explicit ratings
engine.fit(
    explicit_ratings=ratings_data,
    implicit_interactions=click_data  # Optional
)

# Make predictions
predictions = engine.predict(user_ids, item_ids)

# Get recommendations
recommendations = engine.recommend(user_id, n=10)
```

---

## Lab 2: Matrix Factorization Implementation

### Objective
Implement and compare different matrix factorization approaches.

### Tasks

1. **Implement Basic MF**
   - Create matrix factorization from scratch
   - Train on MovieLens dataset
   - Evaluate with RMSE

2. **Add Bias Terms**
   - Extend MF to include user and item biases
   - Compare performance with basic MF

3. **Implement SVD++**
   - Incorporate implicit feedback (views, clicks)
   - Compare with explicit-only MF

4. **Hyperparameter Tuning**
   - Tune number of factors, learning rate, regularization
   - Find optimal configuration

### Deliverables
- Code implementation
- Performance comparison report
- Analysis of bias terms and implicit feedback impact

---

## Summary

**Key Takeaways:**

1. **Interaction matrices are sparse:** 95-99% empty, requiring efficient storage
2. **Explicit vs implicit feedback:** Different signals, different handling
3. **Memory-based CF:** User-based and item-based approaches
4. **Matrix factorization:** Decompose into latent factors
5. **SVD++:** Incorporates implicit feedback for better performance

**Next Steps:**
- Module 3: Neural Collaborative Filtering
- Learn how neural networks capture non-linear relationships
- Master the NeuMF framework

---

**Module 2 Complete**   
*Ready for Module 3: Neural Collaborative Filtering*