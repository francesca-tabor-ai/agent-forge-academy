---
title: "Module 5: Strategic Operations, Logistics, and Compliance"
description: "Using AI to optimize the physical supply chain and regulatory requirements"
module: "5"
order: 5
---

# Module 5: Strategic Operations, Logistics, and Compliance

**Duration:** Week 5  
**Learning Objectives:**
- **ASPIRE framework for causal inference in logistics Understanding**: Understand ASPIRE framework for causal inference in logistics
- **Solve The**: Solve the GreenBox optimization problem for packaging
- **DeepMMATE for tax compliance classification Implementation**: Implement DeepMMATE for tax compliance classification
- **Use Ai**: Use AI to optimize supply chain operations
- **Ensure Regulatory**: Ensure regulatory compliance with explainable AI

---

## 5.1 ASPIRE: Causal Inference in Logistics

### The Problem: Shipping Cost vs. Revenue Trade-off

**Challenge:** Deciding whether to air-ship a product requires understanding:
- Will faster shipping increase revenue?
- Is the revenue lift worth the added shipping cost?
- What's the causal effect of shipping speed on sales?

**Traditional Approach:**
- Rule-based decisions
- Historical averages
- No causal understanding

**Problem:** Correlation ≠ Causation
- Products that sell well might get air-shipped
- But air-shipping might not cause the sales
- Need to isolate the causal effect

### The ASPIRE Framework

**ASPIRE (Air Shipping Performance Impact Revenue Estimation):**
- Uses counterfactual reasoning
- Estimates causal effect of shipping speed
- Determines if air-shipping is profitable
- Makes data-driven logistics decisions

### Counterfactual Reasoning

**Concept:** What would have happened if we had done something different?

**Example:**
- **Observed:** Product air-shipped → $1000 revenue
- **Counterfactual:** What if ground-shipped? → $800 revenue
- **Causal Effect:** $200 revenue lift from air-shipping
- **Decision:** If air-shipping cost < $200 → Air-ship

### Implementation

```python
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

class ASPIRE:
    def __init__(self):
        """Initialize ASPIRE framework."""
        self.revenue_model = None
        self.causal_effect_model = None
    
    def train_revenue_model(self, historical_data: pd.DataFrame):
        """
        Train model to predict revenue.
        
        Args:
            historical_data: Historical sales data with features
        """
        # Features: product attributes, shipping method, time, etc.
        features = [
            'product_category', 'price', 'shipping_method',
            'shipping_time', 'season', 'promotion', 'competitor_price'
        ]
        
        X = historical_data[features]
        y = historical_data['revenue']
        
        # Train model
        self.revenue_model = RandomForestRegressor(n_estimators=100)
        self.revenue_model.fit(X, y)
    
    def estimate_causal_effect(
        self,
        product_features: Dict,
        air_shipping_cost: float
    ) -> Dict:
        """
        Estimate causal effect of air-shipping vs ground-shipping.
        
        Args:
            product_features: Product characteristics
            air_shipping_cost: Cost of air-shipping
        
        Returns:
            Dictionary with causal effect and recommendation
        """
        # Predict revenue with ground shipping
        ground_features = product_features.copy()
        ground_features['shipping_method'] = 'ground'
        ground_features['shipping_time'] = 5  # days
        
        revenue_ground = self.revenue_model.predict([self.features_to_array(ground_features)])[0]
        
        # Predict revenue with air shipping
        air_features = product_features.copy()
        air_features['shipping_method'] = 'air'
        air_features['shipping_time'] = 2  # days
        
        revenue_air = self.revenue_model.predict([self.features_to_array(air_features)])[0]
        
        # Calculate causal effect
        revenue_lift = revenue_air - revenue_ground
        net_benefit = revenue_lift - air_shipping_cost
        
        # Recommendation
        should_air_ship = net_benefit > 0
        
        return {
            'revenue_ground': revenue_ground,
            'revenue_air': revenue_air,
            'revenue_lift': revenue_lift,
            'air_shipping_cost': air_shipping_cost,
            'net_benefit': net_benefit,
            'should_air_ship': should_air_ship,
            'confidence': self.calculate_confidence(product_features)
        }
    
    def features_to_array(self, features: Dict) -> np.ndarray:
        """Convert features dictionary to array."""
        # Encode categorical features, normalize, etc.
        # Simplified for example
        return np.array([
            features.get('price', 0),
            features.get('shipping_time', 0),
            # ... more features
        ])
    
    def calculate_confidence(self, features: Dict) -> float:
        """Calculate confidence in prediction."""
        # Based on similarity to training data, feature completeness, etc.
        return 0.85  # Simplified
```

### Advanced: Propensity Score Matching

**Better Causal Inference:** Use propensity score matching to find comparable products.

```python
from sklearn.linear_model import LogisticRegression

class ASPIREAdvanced:
    def __init__(self):
        """Advanced ASPIRE with propensity score matching."""
        self.propensity_model = None
        self.revenue_model = None
    
    def train_propensity_model(self, historical_data: pd.DataFrame):
        """
        Train model to predict propensity for air-shipping.
        
        Used for matching similar products.
        """
        # Features that affect shipping decision (not outcome)
        features = [
            'product_category', 'price', 'inventory_level',
            'season', 'promotion'
        ]
        
        X = historical_data[features]
        y = (historical_data['shipping_method'] == 'air').astype(int)
        
        self.propensity_model = LogisticRegression()
        self.propensity_model.fit(X, y)
    
    def estimate_causal_effect_matching(
        self,
        product_features: Dict,
        historical_data: pd.DataFrame
    ) -> Dict:
        """
        Estimate causal effect using propensity score matching.
        
        Args:
            product_features: Target product features
            historical_data: Historical data for matching
        
        Returns:
            Causal effect estimate
        """
        # Calculate propensity score for target product
        target_propensity = self.propensity_model.predict_proba(
            [self.features_to_array(product_features)]
        )[0][1]
        
        # Find matched products (similar propensity, different treatment)
        # Products with ground shipping
        ground_products = historical_data[historical_data['shipping_method'] == 'ground']
        ground_propensities = self.propensity_model.predict_proba(
            ground_products[['price', 'category', ...]].values
        )[:, 1]
        
        # Products with air shipping
        air_products = historical_data[historical_data['shipping_method'] == 'air']
        air_propensities = self.propensity_model.predict_proba(
            air_products[['price', 'category', ...]].values
        )[:, 1]
        
        # Find closest matches
        ground_match_idx = np.argmin(np.abs(ground_propensities - target_propensity))
        air_match_idx = np.argmin(np.abs(air_propensities - target_propensity))
        
        ground_match = ground_products.iloc[ground_match_idx]
        air_match = air_products.iloc[air_match_idx]
        
        # Calculate causal effect
        revenue_lift = air_match['revenue'] - ground_match['revenue']
        
        return {
            'revenue_lift': revenue_lift,
            'ground_revenue': ground_match['revenue'],
            'air_revenue': air_match['revenue'],
            'matched_products': {
                'ground': ground_match.to_dict(),
                'air': air_match.to_dict()
            }
        }
```

---

## 5.2 "GreenBox" Optimization

### The Problem: Packaging Waste

**Challenge:** Warehouses use many box sizes, leading to:
- Excessive "air volume" (empty space in boxes)
- Packaging waste
- Higher shipping costs
- Environmental impact

**Goal:** Determine optimal set of K box sizes that minimize:
- Air volume
- Packaging waste
- Total shipping cost

### The 3D Clustering Problem

**Problem Formulation:**
- Given: Product dimensions (length, width, height)
- Find: K optimal box sizes
- Minimize: Total air volume across all products

**Approach:** 3D clustering of product dimensions.

### Implementation

```python
from sklearn.cluster import KMeans
import numpy as np

class GreenBoxOptimizer:
    def __init__(self, num_box_sizes: int = 5):
        """
        Initialize GreenBox optimizer.
        
        Args:
            num_box_sizes: Number of box sizes to optimize (K)
        """
        self.num_box_sizes = num_box_sizes
        self.optimal_boxes = None
    
    def optimize(
        self,
        product_dimensions: np.ndarray
    ) -> Dict:
        """
        Find optimal box sizes.
        
        Args:
            product_dimensions: Array of (length, width, height) for each product
        
        Returns:
            Optimal box sizes and metrics
        """
        # Step 1: Cluster products by dimensions
        kmeans = KMeans(n_clusters=self.num_box_sizes, random_state=42)
        clusters = kmeans.fit_predict(product_dimensions)
        
        # Step 2: Calculate optimal box size for each cluster
        optimal_boxes = []
        total_air_volume = 0
        
        for cluster_id in range(self.num_box_sizes):
            cluster_products = product_dimensions[clusters == cluster_id]
            
            # Optimal box size: slightly larger than largest product in cluster
            max_dims = cluster_products.max(axis=0)
            
            # Add padding (e.g., 5% for packing material)
            padding = 0.05
            box_size = max_dims * (1 + padding)
            
            optimal_boxes.append(box_size)
            
            # Calculate air volume for this cluster
            cluster_air_volume = self.calculate_air_volume(cluster_products, box_size)
            total_air_volume += cluster_air_volume
        
        self.optimal_boxes = np.array(optimal_boxes)
        
        return {
            'optimal_boxes': self.optimal_boxes,
            'total_air_volume': total_air_volume,
            'average_air_volume_per_product': total_air_volume / len(product_dimensions),
            'waste_reduction': self.calculate_waste_reduction(product_dimensions)
        }
    
    def calculate_air_volume(
        self,
        product_dimensions: np.ndarray,
        box_size: np.ndarray
    ) -> float:
        """
        Calculate total air volume for products in a box.
        
        Args:
            product_dimensions: Product dimensions
            box_size: Box dimensions
        
        Returns:
            Total air volume
        """
        box_volume = np.prod(box_size)
        product_volumes = np.prod(product_dimensions, axis=1)
        total_product_volume = product_volumes.sum()
        
        air_volume = box_volume - total_product_volume
        
        return max(0, air_volume)  # Can't be negative
    
    def calculate_waste_reduction(
        self,
        product_dimensions: np.ndarray
    ) -> float:
        """
        Calculate waste reduction compared to using all unique box sizes.
        
        Args:
            product_dimensions: All product dimensions
        
        Returns:
            Percentage waste reduction
        """
        # Baseline: Each product gets its own box (no waste, but many box sizes)
        baseline_boxes = len(product_dimensions)
        
        # Optimized: K box sizes
        optimized_boxes = self.num_box_sizes
        
        # Waste reduction (simplified metric)
        reduction = (1 - optimized_boxes / baseline_boxes) * 100
        
        return reduction
    
    def assign_box(
        self,
        product_dimensions: np.ndarray
    ) -> np.ndarray:
        """
        Assign optimal box to each product.
        
        Args:
            product_dimensions: Product dimensions
        
        Returns:
            Box assignments (indices)
        """
        if self.optimal_boxes is None:
            raise ValueError("Must optimize first")
        
        assignments = []
        
        for product in product_dimensions:
            # Find box that fits product with minimum waste
            best_box_idx = None
            min_waste = float('inf')
            
            for i, box in enumerate(self.optimal_boxes):
                # Check if product fits
                if all(product <= box):
                    # Calculate waste
                    box_volume = np.prod(box)
                    product_volume = np.prod(product)
                    waste = box_volume - product_volume
                    
                    if waste < min_waste:
                        min_waste = waste
                        best_box_idx = i
            
            assignments.append(best_box_idx)
        
        return np.array(assignments)
```

### Advanced: Multi-Objective Optimization

**Consider Multiple Objectives:**
- Minimize air volume
- Minimize number of box sizes
- Minimize shipping cost
- Maximize packing efficiency

```python
from scipy.optimize import minimize
import numpy as np

class GreenBoxAdvanced:
    def __init__(self):
        """Advanced GreenBox with multi-objective optimization."""
        pass
    
    def optimize_multi_objective(
        self,
        product_dimensions: np.ndarray,
        weights: Dict[str, float] = None
    ) -> Dict:
        """
        Optimize with multiple objectives.
        
        Args:
            product_dimensions: Product dimensions
            weights: Weights for different objectives
        
        Returns:
            Optimal solution
        """
        if weights is None:
            weights = {
                'air_volume': 0.4,
                'num_boxes': 0.3,
                'shipping_cost': 0.3
            }
        
        # Objective function
        def objective(box_sizes_flat):
            # Reshape to (K, 3)
            K = len(box_sizes_flat) // 3
            box_sizes = box_sizes_flat.reshape(K, 3)
            
            # Calculate objectives
            air_volume = self.calculate_total_air_volume(product_dimensions, box_sizes)
            num_boxes = K
            shipping_cost = self.estimate_shipping_cost(product_dimensions, box_sizes)
            
            # Weighted combination
            total_cost = (
                weights['air_volume'] * air_volume +
                weights['num_boxes'] * num_boxes * 1000 +  # Scale
                weights['shipping_cost'] * shipping_cost
            )
            
            return total_cost
        
        # Initial guess (K boxes)
        K = 5
        initial_guess = np.random.uniform(
            product_dimensions.min(axis=0),
            product_dimensions.max(axis=0),
            size=(K, 3)
        ).flatten()
        
        # Optimize
        result = minimize(
            objective,
            initial_guess,
            method='L-BFGS-B',
            bounds=[(0, None)] * len(initial_guess)
        )
        
        optimal_boxes = result.x.reshape(K, 3)
        
        return {
            'optimal_boxes': optimal_boxes,
            'total_cost': result.fun,
            'air_volume': self.calculate_total_air_volume(product_dimensions, optimal_boxes)
        }
    
    def calculate_total_air_volume(
        self,
        product_dimensions: np.ndarray,
        box_sizes: np.ndarray
    ) -> float:
        """Calculate total air volume for all products."""
        total = 0
        
        for product in product_dimensions:
            # Find best fitting box
            best_waste = float('inf')
            for box in box_sizes:
                if all(product <= box):
                    waste = np.prod(box) - np.prod(product)
                    best_waste = min(best_waste, waste)
            
            if best_waste != float('inf'):
                total += best_waste
        
        return total
    
    def estimate_shipping_cost(
        self,
        product_dimensions: np.ndarray,
        box_sizes: np.ndarray
    ) -> float:
        """Estimate total shipping cost."""
        # Simplified: cost based on box volume
        total_cost = 0
        
        for product in product_dimensions:
            for box in box_sizes:
                if all(product <= box):
                    # Cost proportional to box volume
                    cost = np.prod(box) * 0.01  # $0.01 per cubic unit
                    total_cost += cost
                    break
        
        return total_cost
```

---

## 5.3 DeepMMATE and Audit Taxability

### The Problem: Product Tax Classification

**Challenge:** Classifying products for tax compliance:
- Different tax rates for different product categories
- Complex regulations
- Manual classification is expensive
- Errors lead to compliance issues

**Requirements:**
- Accurate classification
- Explainable decisions (for auditors)
- Multimodal analysis (images + text)
- Scalable to millions of products

### DeepMMATE: Multimodal Siamese Network

**Architecture:** Siamese network that analyzes:
- Product images
- Product text (title, description)
- Combines for classification

**Explainable AI (XAI):** Provides justifications for decisions.

### Implementation

```python
import torch
import torch.nn as nn
from torchvision.models import resnet50
from transformers import BertModel

class DeepMMATE(nn.Module):
    def __init__(self, num_tax_categories: int = 10):
        """
        DeepMMATE: Multimodal Siamese network for tax classification.
        
        Args:
            num_tax_categories: Number of tax categories
        """
        super().__init__()
        
        # Image encoder (ResNet-50)
        self.image_encoder = resnet50(pretrained=True)
        self.image_encoder.fc = nn.Linear(2048, 512)
        
        # Text encoder (BERT)
        self.text_encoder = BertModel.from_pretrained('bert-base-uncased')
        self.text_projection = nn.Linear(768, 512)
        
        # Fusion layer
        self.fusion = nn.Sequential(
            nn.Linear(512 + 512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 128)
        )
        
        # Classification head
        self.classifier = nn.Linear(128, num_tax_categories)
        
        # Attention for explainability
        self.attention = nn.MultiheadAttention(128, num_heads=4)
    
    def forward(self, image, text_input_ids, text_attention_mask):
        """
        Forward pass.
        
        Args:
            image: Product image tensor
            text_input_ids: Tokenized text
            text_attention_mask: Text attention mask
        
        Returns:
            Classification logits and attention weights
        """
        # Encode image
        image_features = self.image_encoder(image)
        image_features = image_features.view(image_features.size(0), -1)
        
        # Encode text
        text_outputs = self.text_encoder(
            input_ids=text_input_ids,
            attention_mask=text_attention_mask
        )
        text_features = text_outputs.last_hidden_state[:, 0, :]  # [CLS] token
        text_features = self.text_projection(text_features)
        
        # Fuse features
        combined = torch.cat([image_features, text_features], dim=1)
        fused = self.fusion(combined)
        
        # Classification
        logits = self.classifier(fused)
        
        # Attention for explainability
        attention_output, attention_weights = self.attention(
            fused.unsqueeze(0),
            fused.unsqueeze(0),
            fused.unsqueeze(0)
        )
        
        return {
            'logits': logits,
            'attention_weights': attention_weights,
            'image_features': image_features,
            'text_features': text_features
        }
```

### Explainable AI (XAI) for Auditors

```python
class TaxClassificationExplainer:
    def __init__(self, model: DeepMMATE):
        """
        Explainable AI for tax classification.
        
        Args:
            model: Trained DeepMMATE model
        """
        self.model = model
        self.tax_categories = self.load_tax_categories()
    
    def classify_with_explanation(
        self,
        product_image: torch.Tensor,
        product_text: str,
        tokenizer
    ) -> Dict:
        """
        Classify product and provide explanation.
        
        Args:
            product_image: Product image
            product_text: Product title/description
            tokenizer: Text tokenizer
        
        Returns:
            Classification and explanation
        """
        # Prepare inputs
        text_inputs = tokenizer(
            product_text,
            return_tensors='pt',
            truncation=True,
            max_length=128
        )
        
        # Get prediction
        self.model.eval()
        with torch.no_grad():
            outputs = self.model(
                product_image.unsqueeze(0),
                text_inputs['input_ids'],
                text_inputs['attention_mask']
            )
        
        # Get predicted category
        predicted_category = torch.argmax(outputs['logits'], dim=1).item()
        confidence = torch.softmax(outputs['logits'], dim=1)[0][predicted_category].item()
        
        # Generate explanation
        explanation = self.generate_explanation(
            product_text,
            predicted_category,
            outputs,
            tokenizer
        )
        
        return {
            'category': self.tax_categories[predicted_category],
            'confidence': confidence,
            'explanation': explanation,
            'key_features': self.extract_key_features(outputs, product_text, tokenizer)
        }
    
    def generate_explanation(
        self,
        product_text: str,
        category: int,
        model_outputs: Dict,
        tokenizer
    ) -> str:
        """
        Generate human-readable explanation.
        
        Args:
            product_text: Product text
            category: Predicted category
            model_outputs: Model outputs
            tokenizer: Tokenizer
        
        Returns:
            Explanation text
        """
        category_name = self.tax_categories[category]
        
        # Extract important words from text
        important_words = self.extract_important_words(
            product_text,
            model_outputs['attention_weights'],
            tokenizer
        )
        
        explanation = f"""
        Product classified as: {category_name}
        
        Reasoning:
        - Key text features: {', '.join(important_words[:5])}
        - Image analysis indicates: {self.analyze_image_features(model_outputs)}
        - Classification confidence: {model_outputs['logits'][0][category]:.2f}
        
        This classification is based on:
        1. Product description analysis
        2. Visual product characteristics
        3. Tax regulation guidelines for category {category_name}
        """
        
        return explanation
    
    def extract_important_words(
        self,
        text: str,
        attention_weights: torch.Tensor,
        tokenizer
    ) -> List[str]:
        """Extract words with high attention weights."""
        tokens = tokenizer.tokenize(text)
        
        # Get attention weights (simplified)
        # In practice, would use attention weights from model
        word_scores = {}
        
        for i, token in enumerate(tokens):
            if i < attention_weights.shape[1]:
                score = attention_weights[0, 0, i].item()
                word_scores[token] = score
        
        # Sort by score
        sorted_words = sorted(word_scores.items(), key=lambda x: x[1], reverse=True)
        
        return [word for word, score in sorted_words[:10]]
    
    def analyze_image_features(self, model_outputs: Dict) -> str:
        """Analyze image features for explanation."""
        # Simplified - in practice, would analyze image features
        return "Product appears to match category characteristics"
    
    def extract_key_features(
        self,
        model_outputs: Dict,
        product_text: str,
        tokenizer
    ) -> Dict:
        """Extract key features that influenced classification."""
        return {
            'text_features': self.extract_text_features(product_text),
            'image_features': 'Visual analysis completed',
            'fusion_score': 'Features successfully combined'
        }
    
    def extract_text_features(self, text: str) -> List[str]:
        """Extract key text features."""
        # Simplified - would use NLP to extract features
        keywords = ['material', 'purpose', 'category', 'type']
        found = [kw for kw in keywords if kw in text.lower()]
        return found
    
    def load_tax_categories(self) -> List[str]:
        """Load tax category names."""
        return [
            'Electronics',
            'Clothing',
            'Food & Beverages',
            'Books',
            'Home & Garden',
            'Sports & Outdoors',
            'Toys & Games',
            'Health & Personal Care',
            'Automotive',
            'Other'
        ]
```

### Training DeepMMATE

```python
def train_deepmmate(
    train_loader,
    num_epochs: int = 10,
    learning_rate: float = 1e-4
):
    """
    Train DeepMMATE model.
    
    Args:
        train_loader: DataLoader with (image, text, label) tuples
        num_epochs: Number of training epochs
        learning_rate: Learning rate
    """
    model = DeepMMATE(num_tax_categories=10)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.to(device)
    
    for epoch in range(num_epochs):
        model.train()
        total_loss = 0
        
        for batch in train_loader:
            images = batch['image'].to(device)
            text_ids = batch['text_ids'].to(device)
            text_mask = batch['text_mask'].to(device)
            labels = batch['label'].to(device)
            
            # Forward pass
            outputs = model(images, text_ids, text_mask)
            loss = criterion(outputs['logits'], labels)
            
            # Backward pass
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
        
        print(f"Epoch {epoch + 1}, Loss: {total_loss / len(train_loader)}")
    
    return model
```

---

## Key Takeaways

**ASPIRE Framework:**
- **Uses Causal**: Uses causal inference for logistics decisions
- **Estimates Revenue**: Estimates revenue lift from shipping speed
- **Makes Data-Driven**: Makes data-driven air-shipping decisions
- **Considers Counterfactuals,**: Considers counterfactuals, not just correlations

**GreenBox Optimization:**
- **3D Clustering**: 3D clustering finds optimal box sizes
- **Minimizes Air**: Minimizes air volume and packaging waste
- **Reduces Shipping**: Apply reduces shipping costs in relevant contexts
- **Environmental Benefits**: Implement environmental benefits effectively across relevant use cases

**DeepMMATE:**
- **Multimodal Siamese**: Multimodal Siamese network for tax classification
- **Analyzes Images**: Analyzes images and text together
- **Provides Explainable**: Provides explainable decisions for auditors
- **Ensures Regulatory**: Apply ensures regulatory compliance in relevant contexts

**AI in Operations:**
- **Optimizes Supply**: Optimizes supply chain decisions
- **Reduces Costs**: Reduces costs and waste
- **Ensures Compliance**: Implement ensures compliance effectively across relevant use cases
- **Provides Transparency**: Provides transparency for audits

---

## Lab 5: Logistics Optimization System

**Objective:** Build a system to optimize logistics decisions using ASPIRE framework and GreenBox optimization.

**Requirements:**
1. Implement ASPIRE causal inference for shipping decisions
2. Solve GreenBox optimization problem
3. Evaluate cost savings
4. Create decision dashboard

**Deliverables:**
- Python implementation of ASPIRE and GreenBox
- Optimization results and metrics
- Cost savings analysis
- Written report (500 words) explaining approach and results

**Evaluation Criteria:**
- ASPIRE implementation (30%)
- GreenBox optimization (30%)
- Cost analysis (25%)
- Code quality and documentation (15%)

**Time Estimate:** 3-4 hours

---

## Additional Resources

**Readings:**
- "ASPIRE: Causal Inference in Logistics" - Research paper
- "GreenBox: Packaging Optimization" - Industry case study
- "DeepMMATE: Tax Compliance with XAI" - Compliance system paper

**Videos:**
- "AI for Supply Chain Optimization" (30 min)
- "Explainable AI for Compliance" (25 min)

**Tools to Explore:**
- scikit-learn for clustering
- PyTorch for deep learning
- scipy for optimization

**Course Complete!** 

---

**Module 5 Complete**   
**Course Complete!** 
