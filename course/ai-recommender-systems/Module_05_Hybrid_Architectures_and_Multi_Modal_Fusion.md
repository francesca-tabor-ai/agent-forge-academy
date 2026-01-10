---
title: "Module 5: Hybrid Architectures & Multi-Modal Fusion"
description: "Master hybrid recommendation systems and multi-modal feature integration"
module: "5"
order: 5
---

# Module 5: Hybrid Architectures & Multi-Modal Fusion

**Duration:** Week 5  
**Startup Tool Focus:** HybridFlow & MultiModal Vision  
**Learning Objectives:**
- Understand hybridization strategies for combining multiple recommendation approaches
- Master multi-modal learning with images, text, and audio
- Implement Visual Bayesian Personalized Ranking (VBPR)
- Build production-ready hybrid recommendation systems

---

## Introduction: The Power of Hybridization

**The Problem:**
No single recommendation approach is perfect:
- **Collaborative Filtering:** Great for popular items, fails on cold start
- **Content-Based:** Robust to cold start, limited novelty
- **Deep Learning:** High accuracy, requires lots of data

**The Solution:**
**Hybrid systems** combine multiple approaches to get the best of all worlds.

**Business Impact:**
- **Netflix:** Hybrid system improved accuracy by 10-15% over single approaches
- **Amazon:** Hybrid recommendations drive 35% of revenue
- **Pinterest:** Multi-modal system increased engagement by 40%

---

## Lesson 5.1: Hybridization Strategies

### Types of Hybrid Systems

#### 1. Weighted Hybrid

**Idea:** Combine predictions from multiple models with weights

```python
class WeightedHybrid:
    def __init__(self, models, weights):
        """
        Args:
            models: List of recommendation models
            weights: List of weights (must sum to 1)
        """
        self.models = models
        self.weights = weights
    
    def predict(self, user_id, item_id):
        """Weighted combination of predictions"""
        predictions = []
        for model in self.models:
            pred = model.predict(user_id, item_id)
            predictions.append(pred)
        
        # Weighted average
        weighted_pred = sum(w * p for w, p in zip(self.weights, predictions))
        return weighted_pred
    
    def recommend(self, user_id, n=10):
        """Weighted combination of recommendations"""
        all_recommendations = {}
        
        for model, weight in zip(self.models, self.weights):
            recs = model.recommend(user_id, n=n*2)  # Get more candidates
            
            for item_id, score in recs:
                if item_id not in all_recommendations:
                    all_recommendations[item_id] = 0
                all_recommendations[item_id] += weight * score
        
        # Sort and return top n
        sorted_recs = sorted(
            all_recommendations.items(),
            key=lambda x: x[1],
            reverse=True
        )
        return [item_id for item_id, _ in sorted_recs[:n]]
```

**Example:**
```python
# Combine collaborative filtering and content-based
cf_model = CollaborativeFilteringModel()
cb_model = ContentBasedModel()

hybrid = WeightedHybrid(
    models=[cf_model, cb_model],
    weights=[0.7, 0.3]  # Favor CF, but use CB for cold start
)
```

---

#### 2. Switching Hybrid

**Idea:** Use different models in different situations

```python
class SwitchingHybrid:
    def __init__(self, models, switching_rules):
        """
        Args:
            models: Dict of models {model_name: model}
            switching_rules: Function that selects model based on context
        """
        self.models = models
        self.switching_rules = switching_rules
    
    def recommend(self, user_id, context=None):
        """Switch model based on context"""
        # Determine which model to use
        model_name = self.switching_rules(user_id, context)
        model = self.models[model_name]
        
        return model.recommend(user_id)
    
    def switching_rules_example(self, user_id, context):
        """Example switching logic"""
        # New user: use content-based
        if self.is_new_user(user_id):
            return 'content_based'
        
        # Cold start item: use content-based
        if context and context.get('item_is_new', False):
            return 'content_based'
        
        # Otherwise: use collaborative filtering
        return 'collaborative_filtering'
```

**Example Use Cases:**
- **New users:** Content-based
- **New items:** Content-based
- **Established users/items:** Collaborative filtering
- **Sparse data:** Content-based
- **Dense data:** Collaborative filtering

---

#### 3. Feature Augmentation Hybrid

**Idea:** Enhance one model's features with predictions from another

```python
class FeatureAugmentationHybrid:
    def __init__(self, base_model, auxiliary_model):
        """
        Args:
            base_model: Main recommendation model
            auxiliary_model: Model that provides additional features
        """
        self.base_model = base_model
        self.auxiliary_model = auxiliary_model
    
    def recommend(self, user_id, n=10):
        """Use auxiliary model to augment features"""
        # Get base features
        base_features = self.base_model.get_features(user_id)
        
        # Get auxiliary predictions as features
        aux_predictions = self.auxiliary_model.predict_all_items(user_id)
        
        # Augment features
        augmented_features = np.concatenate([
            base_features,
            aux_predictions
        ])
        
        # Use augmented features for recommendation
        return self.base_model.recommend_with_features(
            user_id, augmented_features, n=n
        )
```

**Example:**
```python
# Use collaborative filtering predictions as features for neural model
cf_model = CollaborativeFilteringModel()
neural_model = NeuralRecommender()

hybrid = FeatureAugmentationHybrid(
    base_model=neural_model,
    auxiliary_model=cf_model
)
```

---

#### 4. Cascade Hybrid

**Idea:** Use one model to filter, another to rank

```python
class CascadeHybrid:
    def __init__(self, filter_model, rank_model):
        """
        Args:
            filter_model: Model that filters candidates
            rank_model: Model that ranks filtered candidates
        """
        self.filter_model = filter_model
        self.rank_model = rank_model
    
    def recommend(self, user_id, n=10, filter_n=100):
        """Filter then rank"""
        # Step 1: Filter candidates
        candidates = self.filter_model.recommend(user_id, n=filter_n)
        
        # Step 2: Rank filtered candidates
        ranked = self.rank_model.rank_items(user_id, candidates)
        
        return ranked[:n]
```

**Example:**
```python
# Use content-based to filter, collaborative to rank
cb_model = ContentBasedModel()
cf_model = CollaborativeFilteringModel()

hybrid = CascadeHybrid(
    filter_model=cb_model,  # Broad filtering
    rank_model=cf_model      # Precise ranking
)
```

---

#### 5. Meta-Learning Hybrid

**Idea:** Train a meta-model to learn how to combine models

```python
import torch.nn as nn

class MetaLearningHybrid(nn.Module):
    def __init__(self, base_models, meta_hidden_dim=64):
        super().__init__()
        
        self.base_models = base_models
        num_models = len(base_models)
        
        # Meta-learner: learns how to combine models
        self.meta_learner = nn.Sequential(
            nn.Linear(num_models, meta_hidden_dim),
            nn.ReLU(),
            nn.Linear(meta_hidden_dim, num_models),
            nn.Softmax(dim=1)  # Weights sum to 1
        )
    
    def forward(self, user_id, item_id):
        # Get predictions from all base models
        predictions = []
        for model in self.base_models:
            pred = model.predict(user_id, item_id)
            predictions.append(pred)
        
        predictions_tensor = torch.tensor(predictions).unsqueeze(0)
        
        # Learn weights
        weights = self.meta_learner(predictions_tensor)
        
        # Weighted combination
        weighted_pred = torch.sum(weights * predictions_tensor, dim=1)
        
        return weighted_pred.squeeze()
```

---

### HybridFlow Integration

**Using HybridFlow for Hybrid Systems:**

```python
from hybridflow import HybridFlowClient

# Initialize client
client = HybridFlowClient(api_key='your_api_key')

# Define hybrid architecture
hybrid_config = {
    'strategy': 'weighted',
    'models': [
        {'type': 'collaborative_filtering', 'weight': 0.6},
        {'type': 'content_based', 'weight': 0.3},
        {'type': 'neural', 'weight': 0.1}
    ]
}

# Train hybrid model
model = client.train_hybrid(
    interactions=train_interactions,
    item_features=item_features,
    config=hybrid_config
)

# Get recommendations
recommendations = client.get_recommendations(
    user_id='U123',
    n=20,
    hybrid_strategy='adaptive'  # Automatically adjust weights
)
```

---

## Lesson 5.2: Multi-Modal Learning

### Understanding Multi-Modal Data

**Modalities in Recommendations:**
- **Text:** Product descriptions, reviews, titles
- **Images:** Product photos, thumbnails
- **Audio:** Music, podcasts, voice descriptions
- **Video:** Product videos, trailers
- **Structured:** Categories, tags, metadata

**Why Multi-Modal?**
- **Richer representations:** More information about items
- **Better cold start:** Can recommend based on visual/textual similarity
- **Improved accuracy:** Multiple signals improve predictions

---

### Text Features with CNNs

**Extracting Text Features:**

```python
import torch
import torch.nn as nn
from transformers import BertModel

class TextFeatureExtractor(nn.Module):
    def __init__(self, embedding_dim=128):
        super().__init__()
        
        # Option 1: Pre-trained BERT
        self.bert = BertModel.from_pretrained('bert-base-uncased')
        self.text_projection = nn.Linear(768, embedding_dim)
        
        # Option 2: CNN for text
        self.text_embedding = nn.Embedding(vocab_size, 300)
        self.text_cnn = nn.Sequential(
            nn.Conv1d(300, 128, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool1d(2),
            nn.Conv1d(128, embedding_dim, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.AdaptiveMaxPool1d(1)
        )
    
    def forward(self, text_input, use_bert=True):
        if use_bert:
            # BERT encoding
            with torch.no_grad():
                bert_output = self.bert(text_input)
            text_features = bert_output.last_hidden_state[:, 0, :]  # CLS token
            text_features = self.text_projection(text_features)
        else:
            # CNN encoding
            embedded = self.text_embedding(text_input)  # [batch, seq_len, 300]
            embedded = embedded.transpose(1, 2)  # [batch, 300, seq_len]
            text_features = self.text_cnn(embedded).squeeze(-1)  # [batch, embedding_dim]
        
        return text_features
```

---

### Image Features with CNNs

**Extracting Visual Features:**

```python
import torchvision.models as models

class ImageFeatureExtractor(nn.Module):
    def __init__(self, embedding_dim=128):
        super().__init__()
        
        # Pre-trained ResNet
        resnet = models.resnet50(pretrained=True)
        # Remove final classification layer
        self.cnn = nn.Sequential(*list(resnet.children())[:-1])
        
        # Project to embedding dimension
        self.projection = nn.Linear(2048, embedding_dim)
    
    def forward(self, images):
        """
        Args:
            images: [batch_size, 3, 224, 224]
        Returns:
            features: [batch_size, embedding_dim]
        """
        # Extract features
        cnn_features = self.cnn(images)  # [batch, 2048, 1, 1]
        cnn_features = cnn_features.squeeze(-1).squeeze(-1)  # [batch, 2048]
        
        # Project to embedding dimension
        image_features = self.projection(cnn_features)  # [batch, embedding_dim]
        
        return image_features
```

---

### Audio Features

**Extracting Audio Features:**

```python
class AudioFeatureExtractor(nn.Module):
    def __init__(self, embedding_dim=128):
        super().__init__()
        
        # CNN for audio spectrograms
        self.audio_cnn = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d(1)
        )
        
        self.projection = nn.Linear(128, embedding_dim)
    
    def forward(self, spectrograms):
        """
        Args:
            spectrograms: [batch_size, 1, freq_bins, time_frames]
        Returns:
            features: [batch_size, embedding_dim]
        """
        audio_features = self.audio_cnn(spectrograms)
        audio_features = audio_features.squeeze(-1).squeeze(-1)
        audio_features = self.projection(audio_features)
        return audio_features
```

---

### Multi-Modal Fusion

**Combining Multiple Modalities:**

```python
class MultiModalRecommender(nn.Module):
    def __init__(self, num_users, num_items,
                 embedding_dim=128, use_text=True, use_image=True, use_audio=False):
        super().__init__()
        
        self.use_text = use_text
        self.use_image = use_image
        self.use_audio = use_audio
        
        # User and item embeddings
        self.user_embedding = nn.Embedding(num_users, embedding_dim)
        self.item_embedding = nn.Embedding(num_items, embedding_dim)
        
        # Feature extractors
        if use_text:
            self.text_extractor = TextFeatureExtractor(embedding_dim)
        if use_image:
            self.image_extractor = ImageFeatureExtractor(embedding_dim)
        if use_audio:
            self.audio_extractor = AudioFeatureExtractor(embedding_dim)
        
        # Fusion layer
        num_modalities = 1 + sum([use_text, use_image, use_audio])
        fusion_input_dim = embedding_dim * num_modalities
        
        self.fusion = nn.Sequential(
            nn.Linear(fusion_input_dim, 256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 1)
        )
    
    def forward(self, user_ids, item_ids, text_inputs=None, 
                images=None, audio=None):
        # User embedding
        user_emb = self.user_embedding(user_ids)
        
        # Item embedding
        item_emb = self.item_embedding(item_ids)
        
        # Extract multi-modal features
        features = [item_emb]
        
        if self.use_text and text_inputs is not None:
            text_features = self.text_extractor(text_inputs)
            features.append(text_features)
        
        if self.use_image and images is not None:
            image_features = self.image_extractor(images)
            features.append(image_features)
        
        if self.use_audio and audio is not None:
            audio_features = self.audio_extractor(audio)
            features.append(audio_features)
        
        # Fuse all features
        fused = torch.cat(features, dim=1)
        
        # Combine with user embedding
        combined = torch.cat([user_emb, fused], dim=1)
        
        # Predict
        prediction = self.fusion(combined)
        return prediction.squeeze()
```

---

## Lesson 5.3: Visual Bayesian Personalized Ranking (VBPR)

### The Synonyms Problem

**Problem:**
Items that are visually similar but have different labels are not recommended together.

**Example:**
- "Red running shoes" and "Crimson athletic footwear"
- Visually identical, but different text descriptions
- Traditional models miss this connection

**Solution:**
**VBPR** integrates visual features directly into latent factor models.

---

### VBPR Architecture

**Key Idea:**
Extend matrix factorization to include visual features:

```
r_ui = μ + b_u + b_i + p_u^T q_i + θ_u^T (CNN(image_i))

Where:
- p_u^T q_i: Traditional MF term
- θ_u^T (CNN(image_i)): Visual preference term
- θ_u: User's visual preference vector
```

**Implementation:**

```python
class VBPR(nn.Module):
    def __init__(self, num_users, num_items, 
                 embedding_dim=64, visual_dim=128):
        super().__init__()
        
        # Traditional MF components
        self.user_embedding = nn.Embedding(num_users, embedding_dim)
        self.item_embedding = nn.Embedding(num_items, embedding_dim)
        self.user_bias = nn.Embedding(num_users, 1)
        self.item_bias = nn.Embedding(num_items, 1)
        self.global_bias = nn.Parameter(torch.zeros(1))
        
        # Visual components
        self.image_extractor = ImageFeatureExtractor(visual_dim)
        self.visual_preference = nn.Embedding(num_users, visual_dim)
        
        # Initialize
        nn.init.normal_(self.user_embedding.weight, std=0.01)
        nn.init.normal_(self.item_embedding.weight, std=0.01)
        nn.init.normal_(self.visual_preference.weight, std=0.01)
    
    def forward(self, user_ids, item_ids, item_images):
        # Traditional MF term
        user_emb = self.user_embedding(user_ids)
        item_emb = self.item_embedding(item_ids)
        mf_term = torch.sum(user_emb * item_emb, dim=1)
        
        # Bias terms
        user_b = self.user_bias(user_ids).squeeze()
        item_b = self.item_bias(item_ids).squeeze()
        bias_term = self.global_bias + user_b + item_b
        
        # Visual term
        visual_features = self.image_extractor(item_images)  # [batch, visual_dim]
        user_visual_pref = self.visual_preference(user_ids)  # [batch, visual_dim]
        visual_term = torch.sum(user_visual_pref * visual_features, dim=1)
        
        # Combine
        prediction = bias_term + mf_term + visual_term
        
        return prediction
```

---

### Training VBPR

**BPR Loss for Ranking:**

```python
def train_vbpr(model, train_data, epochs=50, lr=0.001):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    
    optimizer = optim.Adam(model.parameters(), lr=lr)
    
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        
        # Sample positive and negative pairs
        for batch in generate_bpr_batches(train_data, batch_size=256):
            user_ids = batch['user_ids'].to(device)
            pos_item_ids = batch['pos_item_ids'].to(device)
            neg_item_ids = batch['neg_item_ids'].to(device)
            pos_images = batch['pos_images'].to(device)
            neg_images = batch['neg_images'].to(device)
            
            # Positive scores
            pos_scores = model(user_ids, pos_item_ids, pos_images)
            
            # Negative scores
            neg_scores = model(user_ids, neg_item_ids, neg_images)
            
            # BPR loss
            loss = -torch.log(torch.sigmoid(pos_scores - neg_scores)).mean()
            
            # Backward
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
        
        print(f"Epoch {epoch+1}/{epochs}, Loss: {total_loss:.4f}")
    
    return model
```

---

### MultiModal Vision Integration

**Using MultiModal Vision for Visual Features:**

```python
from multimodal_vision import MultiModalVisionClient

# Initialize client
client = MultiModalVisionClient(api_key='your_api_key')

# Extract visual features
image_features = client.extract_features(
    images=item_images,
    model='resnet50'
)

# Train VBPR with visual features
vbpr_model = client.train_vbpr(
    interactions=train_interactions,
    visual_features=image_features,
    embedding_dim=64,
    visual_dim=128
)

# Get recommendations
recommendations = client.get_recommendations(
    user_id='U123',
    n=20,
    use_visual_similarity=True
)
```

---

## Module 5 Summary

### Key Takeaways

1. **Hybrid Systems Combine Strengths:**
   - Weighted, switching, feature augmentation
   - Meta-learning for optimal combination
   - Better than single approaches

2. **Multi-Modal Learning:**
   - Text, image, audio features
   - CNN extraction
   - Fusion strategies

3. **VBPR Solves Visual Similarity:**
   - Integrates visual features into MF
   - Handles synonyms problem
   - Better item discovery

### Production Checklist

**Hybrid Systems:**
- [ ] Choose appropriate hybridization strategy
- [ ] Balance model weights
- [ ] Handle cold start scenarios
- [ ] Monitor performance of each component

**Multi-Modal:**
- [ ] Extract features from all available modalities
- [ ] Design fusion architecture
- [ ] Handle missing modalities
- [ ] Optimize feature extraction

**VBPR:**
- [ ] Extract visual features
- [ ] Integrate with MF model
- [ ] Train with BPR loss
- [ ] Evaluate visual similarity

### Next Steps

**Lab 5: VBPR Implementation**
- Build multi-modal feature extractors
- Implement VBPR model
- Train with visual features
- Compare with traditional MF

**Reading:**
- "VBPR: Visual Bayesian Personalized Ranking" (He & McAuley)
- HybridFlow documentation
- MultiModal Vision documentation

**Practice:**
- Experiment with different fusion strategies
- Try different CNN architectures
- Implement attention-based fusion
- Test on real multi-modal data

---

**Ready for Module 6?**  
→ [Module 6: Explainable AI (XAI) & Generative Recommenders](Module_06_Explainable_AI_and_Generative_Recommenders.md)

---

*Module 5 Complete | Next: Explainability and Generative Models*
