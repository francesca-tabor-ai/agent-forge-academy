---
title: "Module 3: Neural Collaborative Filtering (NCF)"
description: "Master deep learning approaches to recommendation systems"
module: "3"
order: 3
---

# Module 3: Neural Collaborative Filtering (NCF)

**Duration:** Week 3  
**Startup Tool Focus:** NeuralMerch (Advanced Layer)  
**Learning Objectives:**
- **limitations of linear matrix factorization Understanding**: Understand limitations of linear matrix factorization
- **MLP-based recommendation models Understanding**: Master MLP-based recommendation models
- **the NeuMF framework Implementation**: Implement the NeuMF framework
- **Combine Linear**: Combine linear and non-linear approaches

---

## 3.1 Moving Beyond Linear Models

### Limitations of Matrix Factorization

Traditional matrix factorization uses the **inner product (dot product)** to model user-item interactions:

```text
r_ui = p_u^T · q_i
```

**The Problem:** The inner product assumes a **linear relationship** between user and item factors. This limits the model's ability to capture complex, non-linear patterns.

#### Why Linear Models Fall Short

**1. Non-Linear Preference Patterns**

Users don't always have linear preferences. For example:
- A user might like "action movies" AND "romantic comedies" (non-linear combination)
- Item features interact in complex ways (genre × director × year)
- User preferences change non-linearly with item attributes

**2. Feature Interactions**

Matrix factorization captures pairwise interactions through latent factors, but misses:
- Higher-order interactions (3-way, 4-way)
- Conditional dependencies (if user likes X, then they prefer Y)
- Context-dependent preferences

**3. Limited Expressiveness**

The dot product has limited capacity:
- Fixed interaction pattern (always multiplicative)
- Cannot learn arbitrary interaction functions
- Struggles with sparse data (needs many examples to learn)

#### Example: Where Linear Models Fail

**Scenario:** Movie recommendations

**Linear MF might learn:**
- User factor: [action=0.8, comedy=0.3, drama=0.5]
- Item factor: [action=0.9, comedy=0.2, drama=0.1]
- Prediction: 0.8×0.9 + 0.3×0.2 + 0.5×0.1 = 0.83

**Problem:** This assumes preferences are independent and additive. But:
- User might like "action-comedy" hybrids (non-linear)
- User might prefer "drama" only if "not too long" (conditional)
- User might have genre fatigue (temporal non-linearity)

### The Need for Non-Linear Models

**Solution:** Use **neural networks** to learn arbitrary interaction functions directly from data.

**Advantages:**
- **Universal Function Approximators:** Can approximate any continuous function
- **Automatic Feature Learning:** Discovers complex patterns
- **Flexible Interactions:** Learns how features interact
- **End-to-End Learning:** Optimizes the entire pipeline

### Neural Network Basics for Recommendations

**Key Components:**

**1. Embedding Layers**
```python
import torch
import torch.nn as nn

# User and item embeddings
user_embedding = nn.Embedding(n_users, embedding_dim)
item_embedding = nn.Embedding(n_items, embedding_dim)
```

**2. Interaction Function**
Instead of dot product, use a neural network:
```python
# Concatenate user and item embeddings
user_vec = user_embedding(user_id)
item_vec = item_embedding(item_id)
combined = torch.cat([user_vec, item_vec], dim=1)

# Pass through neural network
interaction = neural_network(combined)
```

**3. Prediction Layer**
```python
# Output single rating prediction
prediction = output_layer(interaction)
```

---

## 3.2 Multi-Layer Perceptrons (MLP) in Recommendation

### MLP Architecture for Recommendations

**Multi-Layer Perceptrons (MLPs)** are feedforward neural networks that can learn complex, non-linear user-item interaction functions.

#### Basic MLP Recommender

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class MLPRecommender(nn.Module):
    def __init__(self, n_users, n_items, embedding_dim=32, 
                 hidden_dims=[64, 32, 16], dropout=0.2):
        super(MLPRecommender, self).__init__()
        
        self.n_users = n_users
        self.n_items = n_items
        self.embedding_dim = embedding_dim
        
        # Embedding layers
        self.user_embedding = nn.Embedding(n_users, embedding_dim)
        self.item_embedding = nn.Embedding(n_items, embedding_dim)
        
        # MLP layers
        layers = []
        input_dim = embedding_dim * 2  # Concatenated user + item
        
        for hidden_dim in hidden_dims:
            layers.append(nn.Linear(input_dim, hidden_dim))
            layers.append(nn.ReLU())
            layers.append(nn.Dropout(dropout))
            input_dim = hidden_dim
        
        # Output layer (single rating)
        layers.append(nn.Linear(input_dim, 1))
        
        self.mlp = nn.Sequential(*layers)
        
        # Initialize embeddings
        nn.init.normal_(self.user_embedding.weight, std=0.01)
        nn.init.normal_(self.item_embedding.weight, std=0.01)
    
    def forward(self, user_ids, item_ids):
        """
        Forward pass
        
        Args:
            user_ids: Tensor of user IDs
            item_ids: Tensor of item IDs
        
        Returns:
            Predicted ratings
        """
        # Get embeddings
        user_emb = self.user_embedding(user_ids)
        item_emb = self.item_embedding(item_ids)
        
        # Concatenate
        combined = torch.cat([user_emb, item_emb], dim=1)
        
        # Pass through MLP
        prediction = self.mlp(combined)
        
        return prediction.squeeze()
```

#### Training the MLP

```python
def train_mlp_recommender(model, train_loader, val_loader, epochs=50, lr=0.001):
    """
    Train MLP recommender model
    """
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    
    best_val_loss = float('inf')
    
    for epoch in range(epochs):
        # Training
        model.train()
        train_loss = 0
        
        for user_ids, item_ids, ratings in train_loader:
            user_ids = user_ids.to(device)
            item_ids = item_ids.to(device)
            ratings = ratings.float().to(device)
            
            # Forward pass
            predictions = model(user_ids, item_ids)
            loss = criterion(predictions, ratings)
            
            # Backward pass
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
        
        # Validation
        model.eval()
        val_loss = 0
        
        with torch.no_grad():
            for user_ids, item_ids, ratings in val_loader:
                user_ids = user_ids.to(device)
                item_ids = item_ids.to(device)
                ratings = ratings.float().to(device)
                
                predictions = model(user_ids, item_ids)
                loss = criterion(predictions, ratings)
                val_loss += loss.item()
        
        train_loss /= len(train_loader)
        val_loss /= len(val_loader)
        
        print(f"Epoch {epoch+1}/{epochs}")
        print(f"Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}")
        
        # Save best model
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(model.state_dict(), 'best_mlp_model.pth')
```

### MLP as Universal Function Approximator

**Universal Approximation Theorem:** A feedforward neural network with a single hidden layer can approximate any continuous function to arbitrary accuracy, given enough neurons.

**Implications for Recommendations:**
- MLPs can learn any user-item interaction function
- No need to assume linear relationships
- Can capture complex preference patterns
- Automatically discovers feature interactions

#### Learning Complex Interactions

**Example: Genre Preferences**

Traditional MF might learn:
- User likes "action" (factor = 0.8)
- Item is "action" (factor = 0.9)
- Prediction: 0.8 × 0.9 = 0.72

MLP can learn:
- User likes "action" AND "sci-fi" together (non-linear)
- User prefers "action" only if "not too violent" (conditional)
- User has genre fatigue after watching 5 action movies (temporal)

```python
# MLP learns these patterns automatically
# No need to hand-engineer interaction rules
```

### Advanced MLP Architectures

#### Residual Connections

```python
class ResidualMLP(nn.Module):
    def __init__(self, n_users, n_items, embedding_dim=32, 
                 hidden_dims=[64, 32, 16]):
        super().__init__()
        
        self.user_embedding = nn.Embedding(n_users, embedding_dim)
        self.item_embedding = nn.Embedding(n_items, embedding_dim)
        
        # Residual blocks
        self.residual_blocks = nn.ModuleList()
        input_dim = embedding_dim * 2
        
        for hidden_dim in hidden_dims:
            block = ResidualBlock(input_dim, hidden_dim)
            self.residual_blocks.append(block)
            input_dim = hidden_dim
        
        self.output = nn.Linear(input_dim, 1)
    
    def forward(self, user_ids, item_ids):
        user_emb = self.user_embedding(user_ids)
        item_emb = self.item_embedding(item_ids)
        x = torch.cat([user_emb, item_emb], dim=1)
        
        for block in self.residual_blocks:
            x = block(x)
        
        return self.output(x).squeeze()

class ResidualBlock(nn.Module):
    def __init__(self, input_dim, hidden_dim):
        super().__init__()
        self.linear1 = nn.Linear(input_dim, hidden_dim)
        self.linear2 = nn.Linear(hidden_dim, hidden_dim)
        self.relu = nn.ReLU()
        
        # Skip connection
        self.skip = nn.Linear(input_dim, hidden_dim) if input_dim != hidden_dim else nn.Identity()
    
    def forward(self, x):
        residual = self.skip(x)
        out = self.relu(self.linear1(x))
        out = self.linear2(out)
        out = self.relu(out + residual)  # Residual connection
        return out
```

#### Attention in MLP

```python
class AttentionMLP(nn.Module):
    def __init__(self, n_users, n_items, embedding_dim=32, 
                 hidden_dims=[64, 32]):
        super().__init__()
        
        self.user_embedding = nn.Embedding(n_users, embedding_dim)
        self.item_embedding = nn.Embedding(n_items, embedding_dim)
        
        # Attention mechanism
        self.attention = nn.MultiheadAttention(
            embed_dim=embedding_dim,
            num_heads=4,
            batch_first=True
        )
        
        # MLP after attention
        input_dim = embedding_dim * 2
        layers = []
        for hidden_dim in hidden_dims:
            layers.append(nn.Linear(input_dim, hidden_dim))
            layers.append(nn.ReLU())
            input_dim = hidden_dim
        
        layers.append(nn.Linear(input_dim, 1))
        self.mlp = nn.Sequential(*layers)
    
    def forward(self, user_ids, item_ids):
        user_emb = self.user_embedding(user_ids).unsqueeze(1)
        item_emb = self.item_embedding(item_ids).unsqueeze(1)
        
        # Apply attention
        combined = torch.cat([user_emb, item_emb], dim=1)
        attended, _ = self.attention(combined, combined, combined)
        
        # Flatten and pass through MLP
        attended = attended.flatten(1)
        prediction = self.mlp(attended)
        
        return prediction.squeeze()
```

---

## 3.3 The NeuMF Framework

### Introduction to NeuMF

**NeuMF (Neural Matrix Factorization)** combines the best of both worlds:
- **Generalized Matrix Factorization (GMF):** Captures linear interactions (like traditional MF)
- **Multi-Layer Perceptron (MLP):** Captures non-linear interactions

**Key Innovation:** Fuse GMF and MLP to create a hybrid model that benefits from both linearity and non-linearity.

### Architecture Overview

```
Input: (user_id, item_id)
    ↓

  Embedding Layer                     
  - User Embedding (k dimensions)     
  - Item Embedding (k dimensions)     

    ↓                    ↓
    
     GMF              MLP      
  (Linear)        (Non-linear) 
    
    ↓                    ↓
    
             ↓
    
      Concatenation  
    
             ↓
    
      Fusion Layer   
    
             ↓
    
      Prediction     
    
```

### Generalized Matrix Factorization (GMF)

GMF is a generalization of matrix factorization that uses element-wise product instead of dot product:

```python
class GMF(nn.Module):
    def __init__(self, n_users, n_items, n_factors=8):
        super(GMF, self).__init__()
        
        self.user_embedding = nn.Embedding(n_users, n_factors)
        self.item_embedding = nn.Embedding(n_items, n_factors)
        
        # Output layer
        self.output = nn.Linear(n_factors, 1)
        
        # Initialize
        nn.init.normal_(self.user_embedding.weight, std=0.01)
        nn.init.normal_(self.item_embedding.weight, std=0.01)
    
    def forward(self, user_ids, item_ids):
        user_emb = self.user_embedding(user_ids)
        item_emb = self.item_embedding(item_ids)
        
        # Element-wise product (Hadamard product)
        gmf_vector = user_emb * item_emb
        
        # Output
        prediction = self.output(gmf_vector)
        
        return prediction.squeeze()
```

**Key Difference from Traditional MF:**
- Traditional MF: `p_u^T · q_i` (dot product → scalar)
- GMF: `p_u ⊙ q_i` (element-wise product → vector), then linear layer

### Complete NeuMF Implementation

```python
class NeuMF(nn.Module):
    def __init__(self, n_users, n_items, n_factors=8, 
                 mlp_layers=[64, 32, 16], dropout=0.2):
        super(NeuMF, self).__init__()
        
        self.n_users = n_users
        self.n_items = n_items
        self.n_factors = n_factors
        
        # Shared embeddings for GMF and MLP
        self.user_embedding_gmf = nn.Embedding(n_users, n_factors)
        self.item_embedding_gmf = nn.Embedding(n_items, n_factors)
        
        self.user_embedding_mlp = nn.Embedding(n_users, n_factors)
        self.item_embedding_mlp = nn.Embedding(n_items, n_factors)
        
        # GMF part
        self.gmf_output = nn.Linear(n_factors, 1)
        
        # MLP part
        mlp_input_dim = n_factors * 2
        mlp_layers_list = []
        
        for mlp_dim in mlp_layers:
            mlp_layers_list.append(nn.Linear(mlp_input_dim, mlp_dim))
            mlp_layers_list.append(nn.ReLU())
            mlp_layers_list.append(nn.Dropout(dropout))
            mlp_input_dim = mlp_dim
        
        self.mlp = nn.Sequential(*mlp_layers_list)
        self.mlp_output = nn.Linear(mlp_layers[-1], 1)
        
        # Fusion layer (combines GMF and MLP)
        # Option 1: Concatenate and add final layer
        # Option 2: Weighted sum
        self.fusion = nn.Linear(2, 1)  # Combines GMF and MLP outputs
        
        # Initialize
        self._init_weights()
    
    def _init_weights(self):
        """Initialize weights"""
        nn.init.normal_(self.user_embedding_gmf.weight, std=0.01)
        nn.init.normal_(self.item_embedding_gmf.weight, std=0.01)
        nn.init.normal_(self.user_embedding_mlp.weight, std=0.01)
        nn.init.normal_(self.item_embedding_mlp.weight, std=0.01)
        
        for layer in self.mlp:
            if isinstance(layer, nn.Linear):
                nn.init.xavier_uniform_(layer.weight)
        
        nn.init.xavier_uniform_(self.gmf_output.weight)
        nn.init.xavier_uniform_(self.mlp_output.weight)
        nn.init.xavier_uniform_(self.fusion.weight)
    
    def forward(self, user_ids, item_ids):
        """
        Forward pass through NeuMF
        """
        # GMF path
        user_emb_gmf = self.user_embedding_gmf(user_ids)
        item_emb_gmf = self.item_embedding_gmf(item_ids)
        gmf_vector = user_emb_gmf * item_emb_gmf  # Element-wise product
        gmf_output = self.gmf_output(gmf_vector)
        
        # MLP path
        user_emb_mlp = self.user_embedding_mlp(user_ids)
        item_emb_mlp = self.item_embedding_mlp(item_ids)
        mlp_vector = torch.cat([user_emb_mlp, item_emb_mlp], dim=1)
        mlp_vector = self.mlp(mlp_vector)
        mlp_output = self.mlp_output(mlp_vector)
        
        # Fusion
        combined = torch.cat([gmf_output, mlp_output], dim=1)
        prediction = self.fusion(combined)
        
        return prediction.squeeze()
```

### Training NeuMF

```python
def train_neumf(model, train_loader, val_loader, epochs=50, lr=0.001):
    """
    Train NeuMF model
    """
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', factor=0.5, patience=5
    )
    
    best_val_loss = float('inf')
    
    for epoch in range(epochs):
        # Training
        model.train()
        train_loss = 0
        
        for user_ids, item_ids, ratings in train_loader:
            user_ids = user_ids.to(device)
            item_ids = item_ids.to(device)
            ratings = ratings.float().to(device)
            
            # Forward pass
            predictions = model(user_ids, item_ids)
            loss = criterion(predictions, ratings)
            
            # Backward pass
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
        
        # Validation
        model.eval()
        val_loss = 0
        
        with torch.no_grad():
            for user_ids, item_ids, ratings in val_loader:
                user_ids = user_ids.to(device)
                item_ids = item_ids.to(device)
                ratings = ratings.float().to(device)
                
                predictions = model(user_ids, item_ids)
                loss = criterion(predictions, ratings)
                val_loss += loss.item()
        
        train_loss /= len(train_loader)
        val_loss /= len(val_loader)
        
        scheduler.step(val_loss)
        
        print(f"Epoch {epoch+1}/{epochs}")
        print(f"Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}")
        print(f"LR: {optimizer.param_groups[0]['lr']:.6f}")
        
        # Save best model
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(model.state_dict(), 'best_neumf_model.pth')
```

### Pre-training Strategy

**Two-Stage Training:**

1. **Pre-train GMF and MLP separately**
2. **Fine-tune NeuMF end-to-end**

```python
def pretrain_components(model, train_loader, epochs=20):
    """
    Pre-train GMF and MLP components separately
    """
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    
    # Pre-train GMF
    print("Pre-training GMF...")
    gmf_optimizer = torch.optim.Adam([
        {'params': model.user_embedding_gmf.parameters()},
        {'params': model.item_embedding_gmf.parameters()},
        {'params': model.gmf_output.parameters()}
    ], lr=0.001)
    
    for epoch in range(epochs):
        model.train()
        for user_ids, item_ids, ratings in train_loader:
            user_ids = user_ids.to(device)
            item_ids = item_ids.to(device)
            ratings = ratings.float().to(device)
            
            # GMF forward only
            user_emb = model.user_embedding_gmf(user_ids)
            item_emb = model.item_embedding_gmf(item_ids)
            gmf_vector = user_emb * item_emb
            predictions = model.gmf_output(gmf_vector).squeeze()
            
            loss = nn.MSELoss()(predictions, ratings)
            
            gmf_optimizer.zero_grad()
            loss.backward()
            gmf_optimizer.step()
    
    # Pre-train MLP
    print("Pre-training MLP...")
    mlp_optimizer = torch.optim.Adam([
        {'params': model.user_embedding_mlp.parameters()},
        {'params': model.item_embedding_mlp.parameters()},
        {'params': model.mlp.parameters()},
        {'params': model.mlp_output.parameters()}
    ], lr=0.001)
    
    for epoch in range(epochs):
        model.train()
        for user_ids, item_ids, ratings in train_loader:
            user_ids = user_ids.to(device)
            item_ids = item_ids.to(device)
            ratings = ratings.float().to(device)
            
            # MLP forward only
            user_emb = model.user_embedding_mlp(user_ids)
            item_emb = model.item_embedding_mlp(item_ids)
            mlp_vector = torch.cat([user_emb, item_emb], dim=1)
            mlp_vector = model.mlp(mlp_vector)
            predictions = model.mlp_output(mlp_vector).squeeze()
            
            loss = nn.MSELoss()(predictions, ratings)
            
            mlp_optimizer.zero_grad()
            loss.backward()
            mlp_optimizer.step()
    
    print("Pre-training complete. Starting end-to-end training...")
```

### Real-World Implementation: NeuralMerch Advanced

**NeuralMerch Advanced Layer** provides:

1. **NeuMF Implementation**
   - Optimized PyTorch implementation
   - Pre-training utilities
   - Hyperparameter tuning

2. **Advanced Architectures**
   - Residual connections
   - Attention mechanisms
   - Multi-task learning

3. **Production Features**
   - Model serving
   - A/B testing framework
   - Real-time inference

**Usage:**
```python
from neuralmerch.advanced import NeuMFEngine

# Initialize
engine = NeuMFEngine(
    n_users=n_users,
    n_items=n_items,
    n_factors=32,
    mlp_layers=[128, 64, 32]
)

# Pre-train and fine-tune
engine.pretrain(train_data, epochs=20)
engine.finetune(train_data, val_data, epochs=50)

# Make predictions
predictions = engine.predict(user_ids, item_ids)
```

---

## Lab 3: NeuMF Implementation

### Objective
Implement and compare NeuMF with baseline models.

### Tasks

1. **Implement Basic MLP Recommender**
   - Build MLP from scratch
   - Train on MovieLens dataset
   - Compare with matrix factorization

2. **Implement GMF**
   - Build Generalized Matrix Factorization
   - Compare with traditional MF

3. **Implement Complete NeuMF**
   - Combine GMF and MLP
   - Pre-train components separately
   - Fine-tune end-to-end

4. **Ablation Study**
   - Compare GMF-only, MLP-only, and NeuMF
   - Analyze contribution of each component
   - Measure performance improvements

### Deliverables
- Code implementation
- Performance comparison report
- Analysis of linear vs non-linear contributions

---

## Summary

**Key Takeaways:**

- **Linear models have limitations:**: Dot product assumes linear relationships
- **MLPs are universal approximators:**: Can learn any interaction function
- **NeuMF combines best of both:**: Linear (GMF) + Non-linear (MLP)
- **Pre-training helps:**: Train components separately, then fine-tune
- **Non-linearity improves performance:**: Especially on complex preference patterns

**Next Steps:**
- **Module 4:**: Module 4: Temporal Dynamics & Session-Based Models
- **how to capture evolving user preferences Understanding**: Learn how to capture evolving user preferences
- **session-based recommendation for anonymous users Understanding**: Master session-based recommendation for anonymous users

---

**Module 3 Complete**   
*Ready for Module 4: Temporal Dynamics & Session-Based Models*