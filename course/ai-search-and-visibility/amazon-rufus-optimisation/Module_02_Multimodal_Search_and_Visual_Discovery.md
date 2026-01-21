---
title: "Module 2: Multimodal Search and Visual Discovery"
description: "Bridging the 'domain gap' between real-world imagery and polished catalog data"
module: "2"
order: 2
---

# Module 2: Multimodal Search and Visual Discovery

**Duration:** Week 2  
**Learning Objectives:**
- **the "domain gap" between real-world images and catalog photos Understanding**: Understand the "domain gap" between real-world images and catalog photos
- **"shop the look" visual search Development**: Build "shop the look" visual search pipelines
- **data synthesis techniques for computer vision Implementation**: Implement data synthesis techniques for computer vision
- **visual re-ranking and de-duplication Development**: Design visual re-ranking and de-duplication systems
- **robust visual discovery Development**: Create robust visual discovery systems

---

## 2.1 "Shop the Look" and Visual Search

### The Problem: The Domain Gap

Visual search systems face a fundamental challenge: the **domain gap** between real-world imagery and polished catalog data.

**Real-World Images:**
- Natural lighting conditions
- Cluttered backgrounds
- Multiple objects in frame
- Various angles and perspectives
- User-generated content quality
- Different camera qualities

**Catalog Images:**
- Studio lighting
- Clean white backgrounds
- Single product focus
- Standardized angles
- Professional photography
- High resolution

**The Gap:**
Models trained on catalog images struggle with real-world photos because:
- Different visual characteristics
- Different contexts
- Different quality levels
- Different object presentations

### What is "Shop the Look"?

"Shop the Look" is a visual search feature that allows users to:
1. Upload or capture a photo of a product they see
2. Find similar products in the catalog
3. Discover items that match the style, color, or appearance

**Use Cases:**
- User sees a product in a store or online
- User wants to find similar items
- User wants to match a style or color
- User wants to find the exact product

### The "Street-to-Shop" Pipeline

The "street-to-shop" pipeline converts real-world photos into product matches:

```
Real-World Photo (Street)
    ↓
[Object Localization]
    ↓
[Feature Extraction]
    ↓
[Similarity Matching]
    ↓
[Re-ranking]
    ↓
Catalog Products (Shop)
```

#### Step 1: Object Localization

**Purpose:** Identify and isolate the product of interest in the image.

**Challenge:** Real-world photos contain multiple objects, backgrounds, and distractions.

**Solution:** Use object detection models like YOLOv3 to localize products.

**YOLOv3 (You Only Look Once v3):**
- Single-stage object detector
- Fast inference (real-time capable)
- Good accuracy for common objects
- Can detect multiple objects in one pass

**Implementation Example:**
```python
import cv2
import numpy as np
from ultralytics import YOLO

def localize_product(image_path: str, product_category: str) -> List[Dict]:
    """
    Localize products in a real-world image using YOLOv3.
    
    Args:
        image_path: Path to the input image
        product_category: Category of product to detect (e.g., 'clothing', 'shoes', 'bags')
    
    Returns:
        List of detected product bounding boxes with confidence scores
    """
    
    # Load YOLOv3 model (pre-trained on COCO dataset)
    model = YOLO('yolov3.pt')
    
    # Run inference
    results = model(image_path)
    
    # Filter results by product category
    product_detections = []
    
    # COCO class IDs for common product categories
    category_mapping = {
        'clothing': [0, 1, 2],  # person, bicycle, car (clothing on person)
        'shoes': [0],  # person (shoes on person)
        'bags': [24, 25, 26, 27, 28],  # backpack, umbrella, handbag, tie, suitcase
        'furniture': [56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79]  # furniture classes
    }
    
    target_classes = category_mapping.get(product_category, [])
    
    for result in results:
        boxes = result.boxes
        for box in boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            
            # Filter by category and confidence threshold
            if class_id in target_classes and confidence > 0.5:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                
                product_detections.append({
                    'bbox': [int(x1), int(y1), int(x2), int(y2)],
                    'confidence': confidence,
                    'class_id': class_id
                })
    
    return product_detections

def extract_product_region(image_path: str, bbox: List[int]) -> np.ndarray:
    """
    Extract the product region from the image.
    
    Args:
        image_path: Path to the input image
        bbox: Bounding box [x1, y1, x2, y2]
    
    Returns:
        Cropped product image
    """
    image = cv2.imread(image_path)
    x1, y1, x2, y2 = bbox
    
    # Crop the product region
    product_region = image[y1:y2, x1:x2]
    
    return product_region
```

#### Step 2: Feature Extraction

**Purpose:** Extract visual features that represent the product's appearance.

**Challenge:** Features must be robust to:
- Lighting variations
- Viewpoint changes
- Background clutter
- Image quality differences

**Solution:** Use deep learning feature extractors trained for product matching.

**Feature Extraction Models:**
- **ResNet-50/101:** Deep convolutional networks
- **EfficientNet:** Efficient and accurate
- **Vision Transformers (ViT):** State-of-the-art for many tasks
- **Product-specific models:** Trained on product images

**Implementation Example:**
```python
import torch
import torchvision.transforms as transforms
from torchvision.models import resnet50
from PIL import Image

class ProductFeatureExtractor:
    def __init__(self, model_path: str = None):
        """
        Initialize feature extractor.
        
        Args:
            model_path: Path to pre-trained model (if None, uses ImageNet pre-trained)
        """
        # Load ResNet-50 pre-trained on ImageNet
        self.model = resnet50(pretrained=True)
        
        # Remove the final classification layer
        self.model = torch.nn.Sequential(*list(self.model.children())[:-1])
        self.model.eval()
        
        # Image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    
    def extract_features(self, image: np.ndarray) -> np.ndarray:
        """
        Extract visual features from product image.
        
        Args:
            image: Product image (numpy array)
        
        Returns:
            Feature vector (2048-dimensional for ResNet-50)
        """
        # Convert to PIL Image
        if isinstance(image, np.ndarray):
            image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        
        # Preprocess
        image_tensor = self.transform(image).unsqueeze(0)
        
        # Extract features
        with torch.no_grad():
            features = self.model(image_tensor)
            features = features.squeeze().numpy()
        
        # Normalize features
        features = features / np.linalg.norm(features)
        
        return features
```

#### Step 3: Similarity Matching

**Purpose:** Find catalog products that match the visual features.

**Approach:** Use cosine similarity or Euclidean distance in feature space.

**Implementation Example:**
```python
from sklearn.metrics.pairwise import cosine_similarity
import faiss  # Facebook AI Similarity Search

class VisualSearchEngine:
    def __init__(self, catalog_features: np.ndarray, product_ids: List[str]):
        """
        Initialize visual search engine.
        
        Args:
            catalog_features: Pre-computed features for all catalog products (N x D)
            product_ids: Product IDs corresponding to features
        """
        self.catalog_features = catalog_features
        self.product_ids = product_ids
        
        # Build FAISS index for efficient similarity search
        dimension = catalog_features.shape[1]
        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(catalog_features.astype('float32'))
    
    def search(self, query_features: np.ndarray, top_k: int = 10) -> List[Dict]:
        """
        Search for similar products.
        
        Args:
            query_features: Features from query image
            top_k: Number of results to return
        
        Returns:
            List of similar products with similarity scores
        """
        # Reshape for FAISS
        query_features = query_features.reshape(1, -1).astype('float32')
        
        # Search
        distances, indices = self.index.search(query_features, top_k)
        
        # Format results
        results = []
        for i, (distance, idx) in enumerate(zip(distances[0], indices[0])):
            similarity = 1 / (1 + distance)  # Convert distance to similarity
            results.append({
                'product_id': self.product_ids[idx],
                'similarity': float(similarity),
                'rank': i + 1
            })
        
        return results
```

### Complete "Shop the Look" Pipeline

```python
def shop_the_look(
    query_image_path: str,
    product_category: str,
    search_engine: VisualSearchEngine,
    feature_extractor: ProductFeatureExtractor
) -> List[Dict]:
    """
    Complete "shop the look" pipeline.
    
    Args:
        query_image_path: Path to user's photo
        product_category: Category of product to find
        search_engine: Initialized search engine
        feature_extractor: Initialized feature extractor
    
    Returns:
        List of matching products
    """
    # Step 1: Localize product
    detections = localize_product(query_image_path, product_category)
    
    if not detections:
        return []
    
    # Use the highest confidence detection
    best_detection = max(detections, key=lambda x: x['confidence'])
    
    # Step 2: Extract product region
    product_region = extract_product_region(
        query_image_path,
        best_detection['bbox']
    )
    
    # Step 3: Extract features
    query_features = feature_extractor.extract_features(product_region)
    
    # Step 4: Search for similar products
    results = search_engine.search(query_features, top_k=20)
    
    # Step 5: Re-rank (covered in next section)
    reranked_results = rerank_results(results, query_features)
    
    return reranked_results
```

---

## 2.2 Data Synthesis for Computer Vision

### The Challenge: Limited Training Data

**Problem:** Training robust visual search models requires:
- Large amounts of labeled data
- Diverse product variations
- Different lighting conditions
- Various viewpoints
- Real-world scenarios

**Reality:** Collecting this data is expensive and time-consuming.

### Solution: Data Synthesis

**Approach:** Generate synthetic training data to improve model robustness.

**Benefits:**
- Cost-effective data generation
- Controlled variations
- Infinite data possibilities
- Addresses specific failure cases

### Technique 1: 3D Model Superimposition

**Concept:** Superimpose 3D product models onto random indoor scenes to teach viewpoint invariance.

**Process:**
1. Load 3D product model
2. Select random indoor scene background
3. Apply random transformations (rotation, scale, position)
4. Render product onto background
5. Apply realistic lighting
6. Add noise and augmentations

**Implementation Example:**
```python
import numpy as np
from PIL import Image
import cv2
from scipy.spatial.transform import Rotation

def synthesize_training_data(
    product_3d_model: str,
    background_scenes: List[str],
    num_synthetic_images: int = 1000
) -> List[np.ndarray]:
    """
    Synthesize training data by superimposing 3D products on backgrounds.
    
    Args:
        product_3d_model: Path to 3D model file
        background_scenes: List of background image paths
        num_synthetic_images: Number of images to generate
    
    Returns:
        List of synthetic training images
    """
    synthetic_images = []
    
    for i in range(num_synthetic_images):
        # Randomly select background
        background_path = np.random.choice(background_scenes)
        background = cv2.imread(background_path)
        
        # Load and render 3D product model
        product_image = load_3d_model(product_3d_model)
        
        # Apply random transformations
        product_image = apply_random_transformations(product_image)
        
        # Superimpose product on background
        synthetic_image = superimpose_product(
            background,
            product_image,
            random_position=True,
            random_lighting=True
        )
        
        # Apply augmentations
        synthetic_image = apply_augmentations(synthetic_image)
        
        synthetic_images.append(synthetic_image)
    
    return synthetic_images

def apply_random_transformations(image: np.ndarray) -> np.ndarray:
    """Apply random transformations to product image."""
    # Random rotation
    angle = np.random.uniform(-30, 30)
    center = (image.shape[1] // 2, image.shape[0] // 2)
    rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
    image = cv2.warpAffine(image, rotation_matrix, (image.shape[1], image.shape[0]))
    
    # Random scale
    scale = np.random.uniform(0.8, 1.2)
    image = cv2.resize(image, None, fx=scale, fy=scale)
    
    # Random brightness/contrast
    alpha = np.random.uniform(0.8, 1.2)  # Contrast
    beta = np.random.uniform(-20, 20)  # Brightness
    image = cv2.convertScaleAbs(image, alpha=alpha, beta=beta)
    
    return image

def superimpose_product(
    background: np.ndarray,
    product: np.ndarray,
    random_position: bool = True,
    random_lighting: bool = True
) -> np.ndarray:
    """Superimpose product on background with realistic blending."""
    # Random position
    if random_position:
        max_x = background.shape[1] - product.shape[1]
        max_y = background.shape[0] - product.shape[0]
        x = np.random.randint(0, max_x) if max_x > 0 else 0
        y = np.random.randint(0, max_y) if max_y > 0 else 0
    else:
        x, y = 0, 0
    
    # Create mask for product (assuming product has alpha channel or white background)
    product_mask = create_product_mask(product)
    
    # Adjust lighting to match background
    if random_lighting:
        product = match_background_lighting(product, background, x, y)
    
    # Blend product onto background
    result = background.copy()
    result[y:y+product.shape[0], x:x+product.shape[1]] = blend_images(
        result[y:y+product.shape[0], x:x+product.shape[1]],
        product,
        product_mask
    )
    
    return result
```

### Technique 2: Style Transfer

**Concept:** Transfer styles from real-world photos to catalog images to bridge the domain gap.

**Process:**
1. Take catalog product image
2. Extract style from real-world photo
3. Apply style to catalog image
4. Generate realistic-looking training data

**Implementation Example:**
```python
import torch
import torch.nn as nn
from torchvision.models import vgg19

class StyleTransfer:
    def __init__(self):
        """Initialize style transfer model."""
        # Use VGG-19 for style and content extraction
        vgg = vgg19(pretrained=True).features
        self.content_layers = ['21']  # Conv4_2
        self.style_layers = ['0', '5', '10', '19', '28']  # Conv1_1, Conv2_1, etc.
        
        self.model = self.build_model(vgg)
    
    def transfer_style(
        self,
        catalog_image: np.ndarray,
        style_image: np.ndarray,
        num_iterations: int = 300
    ) -> np.ndarray:
        """
        Transfer style from real-world image to catalog image.
        
        Args:
            catalog_image: Clean catalog product image
            style_image: Real-world photo with desired style
            num_iterations: Number of optimization iterations
        
        Returns:
            Stylized product image
        """
        # Initialize output image
        output = catalog_image.clone().requires_grad_(True)
        
        # Extract style and content features
        style_features = self.extract_features(style_image, self.style_layers)
        content_features = self.extract_features(catalog_image, self.content_layers)
        
        # Optimize
        optimizer = torch.optim.Adam([output], lr=0.01)
        
        for i in range(num_iterations):
            output_features = self.extract_features(output, self.style_layers + self.content_layers)
            
            # Calculate losses
            style_loss = self.calculate_style_loss(output_features, style_features)
            content_loss = self.calculate_content_loss(output_features, content_features)
            total_loss = style_loss + content_loss
            
            # Backpropagate
            optimizer.zero_grad()
            total_loss.backward()
            optimizer.step()
        
        return output.detach().cpu().numpy()
```

### Technique 3: Domain Adaptation

**Concept:** Train models to be robust to domain shifts between catalog and real-world images.

**Approach:** Use adversarial training to learn domain-invariant features.

**Implementation Example:**
```python
import torch
import torch.nn as nn

class DomainAdversarialNetwork(nn.Module):
    def __init__(self, feature_extractor, classifier, domain_classifier):
        """
        Domain Adversarial Neural Network for domain adaptation.
        
        Args:
            feature_extractor: Network that extracts features
            classifier: Product classification head
            domain_classifier: Domain classification head (catalog vs real-world)
        """
        super().__init__()
        self.feature_extractor = feature_extractor
        self.classifier = classifier
        self.domain_classifier = domain_classifier
    
    def forward(self, x, alpha=1.0):
        """
        Forward pass with gradient reversal for domain adaptation.
        
        Args:
            x: Input image
            alpha: Gradient reversal coefficient
        """
        features = self.feature_extractor(x)
        
        # Product classification (normal forward)
        product_logits = self.classifier(features)
        
        # Domain classification (gradient reversal)
        reversed_features = GradientReversal.apply(features, alpha)
        domain_logits = self.domain_classifier(reversed_features)
        
        return product_logits, domain_logits

class GradientReversal(torch.autograd.Function):
    """Gradient reversal layer for domain adversarial training."""
    
    @staticmethod
    def forward(ctx, x, alpha):
        ctx.alpha = alpha
        return x.view_as(x)
    
    @staticmethod
    def backward(ctx, grad_output):
        return grad_output.neg() * ctx.alpha, None
```

### Benefits of Data Synthesis

**Improved Robustness:**
- Models handle diverse real-world conditions
- Better generalization to unseen scenarios
- Reduced overfitting to catalog images

**Cost Efficiency:**
- Reduced need for expensive data collection
- Faster model development
- Scalable to many product categories

**Targeted Improvement:**
- Address specific failure cases
- Generate data for rare scenarios
- Control training data distribution

---

## 2.3 Visual Re-ranking and De-duping

### The Problem: Initial Results Need Refinement

**Initial Visual Similarity Results:**
- May include duplicates or near-duplicates
- May miss important non-visual factors
- May lack diversity
- May not consider business metrics

### Solution: Multi-Factor Re-ranking

**Approach:** Combine visual similarity with other signals for better ranking.

**Factors:**
1. Visual similarity (from feature matching)
2. Customer ratings and reviews
3. Price and availability
4. Sales performance
5. Product diversity
6. Business priorities

### Re-ranking Implementation

```python
def rerank_results(
    initial_results: List[Dict],
    query_features: np.ndarray,
    catalog_data: Dict,
    diversity_weight: float = 0.3
) -> List[Dict]:
    """
    Re-rank search results using multiple factors.
    
    Args:
        initial_results: Initial results from visual similarity search
        query_features: Query image features
        catalog_data: Full catalog information (ratings, price, etc.)
        diversity_weight: Weight for diversity in final ranking
    
    Returns:
        Re-ranked product list
    """
    reranked = []
    
    for result in initial_results:
        product_id = result['product_id']
        product_info = catalog_data[product_id]
        
        # Calculate composite score
        visual_score = result['similarity']
        rating_score = normalize_rating(product_info['rating'])
        price_score = normalize_price(product_info['price'])
        sales_score = normalize_sales(product_info['sales_rank'])
        
        # Weighted combination
        composite_score = (
            0.4 * visual_score +
            0.3 * rating_score +
            0.15 * price_score +
            0.15 * sales_score
        )
        
        result['composite_score'] = composite_score
        result['rating'] = product_info['rating']
        result['price'] = product_info['price']
        
        reranked.append(result)
    
    # Sort by composite score
    reranked.sort(key=lambda x: x['composite_score'], reverse=True)
    
    # Apply diversity filtering
    reranked = apply_diversity_filter(reranked, diversity_weight)
    
    return reranked

def normalize_rating(rating: float) -> float:
    """Normalize rating to 0-1 scale."""
    return rating / 5.0

def normalize_price(price: float) -> float:
    """Normalize price (lower is better, so invert)."""
    # Assuming price range 0-1000, normalize and invert
    normalized = 1.0 - (price / 1000.0)
    return max(0.0, min(1.0, normalized))

def normalize_sales(sales_rank: int) -> float:
    """Normalize sales rank (lower rank is better)."""
    # Assuming rank range 1-10000, normalize and invert
    normalized = 1.0 - (sales_rank / 10000.0)
    return max(0.0, min(1.0, normalized))
```

### De-duplication: Graph-Based Approach

**Problem:** Multiple product variants (different colors, sizes) may appear in results.

**Solution:** Use graph-based clustering to group similar products.

**Implementation:**
```python
import networkx as nx
from sklearn.cluster import DBSCAN

def deduplicate_products(
    results: List[Dict],
    product_similarity_threshold: float = 0.95
) -> List[Dict]:
    """
    Remove duplicate and near-duplicate products from results.
    
    Args:
        results: Search results with product features
        product_similarity_threshold: Threshold for considering products duplicates
    
    Returns:
        De-duplicated results
    """
    # Build similarity graph
    G = nx.Graph()
    
    # Add nodes
    for i, result in enumerate(results):
        G.add_node(i, product_id=result['product_id'])
    
    # Add edges for similar products
    for i in range(len(results)):
        for j in range(i + 1, len(results)):
            similarity = calculate_product_similarity(results[i], results[j])
            
            if similarity > product_similarity_threshold:
                G.add_edge(i, j, weight=similarity)
    
    # Find connected components (product groups)
    components = list(nx.connected_components(G))
    
    # Select best product from each group
    deduplicated = []
    for component in components:
        # Select product with highest composite score
        best_idx = max(component, key=lambda idx: results[idx]['composite_score'])
        deduplicated.append(results[best_idx])
    
    return deduplicated

def calculate_product_similarity(product1: Dict, product2: Dict) -> float:
    """
    Calculate similarity between two products.
    
    Considers:
    - Visual features
    - Product attributes (brand, category, etc.)
    - Title similarity
    """
    # Visual similarity
    visual_sim = cosine_similarity(
        product1['features'].reshape(1, -1),
        product2['features'].reshape(1, -1)
    )[0][0]
    
    # Attribute similarity
    attr_sim = calculate_attribute_similarity(product1, product2)
    
    # Title similarity (using simple word overlap)
    title_sim = calculate_title_similarity(product1['title'], product2['title'])
    
    # Weighted combination
    total_similarity = (
        0.5 * visual_sim +
        0.3 * attr_sim +
        0.2 * title_sim
    )
    
    return total_similarity
```

### Diversity Filtering

**Purpose:** Ensure results show diverse product options.

**Approach:** Penalize results that are too similar to already-selected items.

```python
def apply_diversity_filter(
    results: List[Dict],
    diversity_weight: float = 0.3
) -> List[Dict]:
    """
    Apply diversity filtering to ensure result variety.
    
    Args:
        results: Ranked results
        diversity_weight: Weight for diversity in final selection
    
    Returns:
        Diverse result set
    """
    selected = []
    remaining = results.copy()
    
    # Always include top result
    if remaining:
        selected.append(remaining.pop(0))
    
    # Select diverse results
    while remaining and len(selected) < 10:  # Top 10 results
        best_idx = None
        best_score = -float('inf')
        
        for i, candidate in enumerate(remaining):
            # Calculate diversity score (how different from selected)
            diversity_score = calculate_diversity(candidate, selected)
            
            # Combine with original score
            final_score = (
                (1 - diversity_weight) * candidate['composite_score'] +
                diversity_weight * diversity_score
            )
            
            if final_score > best_score:
                best_score = final_score
                best_idx = i
        
        if best_idx is not None:
            selected.append(remaining.pop(best_idx))
    
    return selected

def calculate_diversity(candidate: Dict, selected: List[Dict]) -> float:
    """Calculate how diverse a candidate is from selected items."""
    if not selected:
        return 1.0
    
    # Calculate minimum similarity to selected items
    min_similarity = min([
        calculate_product_similarity(candidate, item)
        for item in selected
    ])
    
    # Diversity is inverse of similarity
    diversity = 1.0 - min_similarity
    
    return diversity
```

---

## Key Takeaways

**Visual Search:**
- **"Shop The**: "Shop the look" enables users to find products from photos
- **Object Localization**: Object localization identifies products in cluttered images
- **Feature Extraction**: Feature extraction creates visual representations
- **Similarity Matching**: Similarity matching finds catalog products

**Data Synthesis:**
- **3D Model**: 3D model superimposition teaches viewpoint invariance
- **Style Transfer**: Style transfer bridges domain gaps
- **Domain Adaptation**: Domain adaptation improves robustness
- **Synthetic Data**: Synthetic data is cost-effective and scalable

**Re-ranking and De-duping:**
- **Multi-Factor Ranking**: Multi-factor ranking improves relevance
- **Graph-Based De-Duplication**: Graph-based de-duplication removes near-duplicates
- **Diversity Filtering**: Diversity filtering ensures variety
- **Non-Visual Factors**: Non-visual factors enhance results

**The Domain Gap:**
- **Real-World Images**: Real-world images differ from catalog photos
- **Data Synthesis**: Data synthesis helps bridge the gap
- **Robust Models**: Robust models handle diverse conditions
- **Better User**: Better user experience with accurate visual search

---

## Lab 2: Build "Shop the Look" Pipeline

**Objective:** Implement a complete visual search pipeline from real-world photos to catalog products.

**Requirements:**
1. Implement object localization using YOLOv3
2. Build feature extraction system
3. Create similarity search engine
4. Implement re-ranking with multiple factors
5. Add de-duplication logic

**Deliverables:**
- Python implementation of complete pipeline
- Test on sample real-world photos
- Evaluation metrics (precision@k, recall@k)
- Written report (500 words) explaining approach and results

**Evaluation Criteria:**
- Correct pipeline implementation (30%)
- Object localization accuracy (20%)
- Feature extraction quality (20%)
- Re-ranking effectiveness (20%)
- Code quality and documentation (10%)

**Time Estimate:** 4-5 hours

---

## Additional Resources

**Readings:**
- "Street-to-Shop: Cross-Scene Domain Adaptation" - Research paper
- "Visual Search in E-Commerce" - Industry analysis
- "Data Synthesis for Computer Vision" - Survey paper

**Videos:**
- "Building Visual Search Systems" (30 min)
- "Domain Adaptation Techniques" (25 min)

**Tools to Explore:**
- YOLOv3/YOLOv5 for object detection
- PyTorch/TensorFlow for feature extraction
- FAISS for similarity search
- OpenCV for image processing

**Next Module Preview:**
Module 3 will explore advanced NLP techniques for search enhancement, including review summarization, query rewriting, and behavioral ghosting.

---

**Module 2 Complete**   
**Next:** Module 3 - Advanced NLP for Search and Customer Experience
