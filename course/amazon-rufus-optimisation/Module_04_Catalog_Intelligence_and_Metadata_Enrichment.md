---
title: "Module 4: Catalog Intelligence and Metadata Enrichment"
description: "Automating the filling of missing product attributes while maintaining extreme factual precision"
module: "4"
order: 4
---

# Module 4: Catalog Intelligence and Metadata Enrichment

**Duration:** Week 4  
**Learning Objectives:**
- Implement the "Ask-and-Verify" framework for attribute extraction
- Build PatternRAG systems for catalog guidance
- Design hallucination detection systems
- Automate product attribute filling with high precision
- Maintain factual accuracy in LLM-generated content

---

## 4.1 "Ask-and-Verify" Framework

### The Challenge: Missing Product Attributes

**Problem:** E-commerce catalogs have incomplete product information:
- Missing attributes (color, material, dimensions, etc.)
- Inconsistent formatting
- Sparse data for new products
- Manual entry is expensive and error-prone

**Requirement:** Fill missing attributes automatically while maintaining:
- **High Precision:** Minimize false positives (incorrect attributes)
- **Factual Accuracy:** Attributes must be true to the product
- **Scalability:** Handle millions of products

### The "Ask-and-Verify" Framework

**Two-Step Process:**

1. **"Ask" Step:** Identify span candidates (potential attribute values)
   - Extract possible attribute values from product descriptions
   - Use NER (Named Entity Recognition) or span extraction models
   - Generate candidate attribute-value pairs

2. **"Verify" Step:** Filter out false positives
   - Validate candidates against product information
   - Use fact-checking mechanisms
   - Ensure high precision before adding to catalog

**Why Two Steps?**
- **Ask:** High recall (finds many candidates)
- **Verify:** High precision (keeps only correct ones)
- **Combined:** High precision + reasonable recall

### Step 1: The "Ask" Step

**Purpose:** Identify span candidates for attribute values.

**Approach:** Use sequence labeling or span extraction models.

#### Method 1: Named Entity Recognition (NER)

```python
import spacy
from transformers import AutoTokenizer, AutoModelForTokenClassification
import torch

class AttributeExtractor:
    def __init__(self, model_name: str = 'bert-base-uncased'):
        """
        Initialize attribute extractor.
        
        Args:
            model_name: Pre-trained model for NER
        """
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForTokenClassification.from_pretrained(model_name)
        self.model.eval()
        
        # Attribute labels
        self.attribute_labels = {
            'COLOR': 0,
            'MATERIAL': 1,
            'SIZE': 2,
            'BRAND': 3,
            'STYLE': 4,
            'O': 5  # Outside/Other
        }
    
    def ask_step(self, product_description: str, attribute_type: str) -> List[str]:
        """
        Extract candidate attribute values (Ask step).
        
        Args:
            product_description: Product description text
            attribute_type: Type of attribute to extract (e.g., 'COLOR', 'MATERIAL')
        
        Returns:
            List of candidate attribute values
        """
        # Tokenize
        inputs = self.tokenizer(
            product_description,
            return_tensors='pt',
            truncation=True,
            max_length=512
        )
        
        # Predict labels
        with torch.no_grad():
            outputs = self.model(**inputs)
            predictions = torch.argmax(outputs.logits, dim=-1)[0]
        
        # Extract spans
        tokens = self.tokenizer.convert_ids_to_tokens(inputs['input_ids'][0])
        candidates = self.extract_spans(tokens, predictions, attribute_type)
        
        return candidates
    
    def extract_spans(self, tokens: List[str], labels: torch.Tensor, target_label: str) -> List[str]:
        """
        Extract attribute value spans from tokens.
        
        Args:
            tokens: Tokenized text
            labels: Predicted labels
            target_label: Target attribute label
        
        Returns:
            List of extracted attribute values
        """
        spans = []
        current_span = []
        
        target_id = self.attribute_labels[target_label]
        
        for token, label in zip(tokens, labels):
            if label.item() == target_id:
                # Clean token (remove ## for BERT subwords)
                clean_token = token.replace('##', '')
                current_span.append(clean_token)
            else:
                if current_span:
                    # Combine span
                    span_text = ''.join(current_span).replace('[CLS]', '').replace('[SEP]', '').strip()
                    if span_text:
                        spans.append(span_text)
                    current_span = []
        
        # Handle last span
        if current_span:
            span_text = ''.join(current_span).replace('[CLS]', '').replace('[SEP]', '').strip()
            if span_text:
                spans.append(span_text)
        
        return spans
```

#### Method 2: Question Answering (QA) Approach

```python
from transformers import AutoTokenizer, AutoModelForQuestionAnswering

class QABasedExtractor:
    def __init__(self):
        """Initialize QA-based extractor."""
        self.tokenizer = AutoTokenizer.from_pretrained('bert-large-uncased-whole-word-masking-finetuned-squad')
        self.model = AutoModelForQuestionAnswering.from_pretrained('bert-large-uncased-whole-word-masking-finetuned-squad')
        self.model.eval()
    
    def ask_step_qa(self, product_description: str, attribute_type: str) -> List[str]:
        """
        Extract attribute using question answering.
        
        Args:
            product_description: Product description
            attribute_type: Type of attribute
        
        Returns:
            List of candidate values
        """
        # Formulate question
        questions = {
            'COLOR': "What color is this product?",
            'MATERIAL': "What material is this product made of?",
            'SIZE': "What size is this product?",
            'BRAND': "What brand is this product?",
            'STYLE': "What style is this product?"
        }
        
        question = questions.get(attribute_type, f"What is the {attribute_type.lower()}?")
        
        # Prepare QA input
        inputs = self.tokenizer(
            question,
            product_description,
            return_tensors='pt',
            truncation=True,
            max_length=512
        )
        
        # Get answer
        with torch.no_grad():
            outputs = self.model(**inputs)
            start_scores = outputs.start_logits
            end_scores = outputs.end_logits
        
        # Extract answer span
        start_idx = torch.argmax(start_scores)
        end_idx = torch.argmax(end_scores)
        
        # Decode answer
        answer_tokens = inputs['input_ids'][0][start_idx:end_idx+1]
        answer = self.tokenizer.decode(answer_tokens, skip_special_tokens=True)
        
        return [answer] if answer else []
```

### Step 2: The "Verify" Step

**Purpose:** Filter out false positives to ensure high precision.

**Approach:** Validate candidates against multiple sources.

#### Verification Methods

```python
class AttributeVerifier:
    def __init__(self):
        """Initialize attribute verifier."""
        self.product_database = self.load_product_database()
        self.attribute_ontology = self.load_attribute_ontology()
    
    def verify_step(
        self,
        candidate: str,
        attribute_type: str,
        product_id: str,
        product_description: str
    ) -> bool:
        """
        Verify if candidate attribute value is correct.
        
        Args:
            candidate: Candidate attribute value
            attribute_type: Type of attribute
            product_id: Product ID
            product_description: Full product description
        
        Returns:
            True if verified, False otherwise
        """
        verification_scores = []
        
        # 1. Check against attribute ontology
        ontology_score = self.check_ontology(candidate, attribute_type)
        verification_scores.append(('ontology', ontology_score))
        
        # 2. Check against product description
        description_score = self.check_description(candidate, product_description)
        verification_scores.append(('description', description_score))
        
        # 3. Check against similar products
        similarity_score = self.check_similar_products(
            candidate, attribute_type, product_id
        )
        verification_scores.append(('similarity', similarity_score))
        
        # 4. Check against product images (if available)
        image_score = self.check_images(candidate, attribute_type, product_id)
        verification_scores.append(('images', image_score))
        
        # Weighted combination
        weights = {
            'ontology': 0.2,
            'description': 0.3,
            'similarity': 0.3,
            'images': 0.2
        }
        
        final_score = sum(
            score * weights.get(source, 0.1)
            for source, score in verification_scores
        )
        
        # Threshold for verification
        return final_score >= 0.7
    
    def check_ontology(self, candidate: str, attribute_type: str) -> float:
        """
        Check if candidate exists in attribute ontology.
        
        Returns:
            Score 0.0 to 1.0
        """
        if attribute_type not in self.attribute_ontology:
            return 0.5  # Neutral if no ontology
        
        valid_values = self.attribute_ontology[attribute_type]
        
        # Exact match
        if candidate.lower() in [v.lower() for v in valid_values]:
            return 1.0
        
        # Fuzzy match
        from difflib import SequenceMatcher
        best_match = max(
            valid_values,
            key=lambda v: SequenceMatcher(None, candidate.lower(), v.lower()).ratio()
        )
        similarity = SequenceMatcher(None, candidate.lower(), best_match.lower()).ratio()
        
        return similarity if similarity > 0.8 else 0.0
    
    def check_description(self, candidate: str, description: str) -> float:
        """
        Check if candidate appears in product description.
        
        Returns:
            Score 0.0 to 1.0
        """
        description_lower = description.lower()
        candidate_lower = candidate.lower()
        
        # Exact match
        if candidate_lower in description_lower:
            return 1.0
        
        # Word-level match
        candidate_words = set(candidate_lower.split())
        description_words = set(description_lower.split())
        
        if candidate_words.issubset(description_words):
            return 0.8
        
        # Partial match
        overlap = len(candidate_words & description_words) / len(candidate_words)
        return overlap if overlap > 0.5 else 0.0
    
    def check_similar_products(
        self,
        candidate: str,
        attribute_type: str,
        product_id: str
    ) -> float:
        """
        Check if similar products have this attribute value.
        
        Returns:
            Score 0.0 to 1.0
        """
        # Find similar products (same category, brand, etc.)
        similar_products = self.find_similar_products(product_id)
        
        if not similar_products:
            return 0.5  # Neutral if no similar products
        
        # Count how many have this attribute value
        matches = 0
        for similar_id in similar_products:
            similar_attrs = self.product_database[similar_id].get('attributes', {})
            if similar_attrs.get(attribute_type, '').lower() == candidate.lower():
                matches += 1
        
        # Score based on percentage
        match_rate = matches / len(similar_products)
        return match_rate
    
    def check_images(
        self,
        candidate: str,
        attribute_type: str,
        product_id: str
    ) -> float:
        """
        Check if product images support this attribute value.
        
        Returns:
            Score 0.0 to 1.0
        """
        # This would use computer vision to verify attributes
        # For example, verify color from product images
        
        if attribute_type == 'COLOR':
            # Use color detection from images
            product_images = self.get_product_images(product_id)
            detected_colors = self.detect_colors(product_images)
            
            if candidate.lower() in [c.lower() for c in detected_colors]:
                return 1.0
            else:
                return 0.0
        
        # For other attributes, return neutral
        return 0.5
```

### Complete "Ask-and-Verify" Pipeline

```python
def ask_and_verify_pipeline(
    product_id: str,
    product_description: str,
    attribute_type: str,
    extractor: AttributeExtractor,
    verifier: AttributeVerifier
) -> str:
    """
    Complete Ask-and-Verify pipeline.
    
    Args:
        product_id: Product ID
        product_description: Product description
        attribute_type: Attribute to extract
        extractor: Attribute extractor (Ask step)
        verifier: Attribute verifier (Verify step)
    
    Returns:
        Verified attribute value (or None if not verified)
    """
    # Step 1: Ask - Extract candidates
    candidates = extractor.ask_step(product_description, attribute_type)
    
    if not candidates:
        return None
    
    # Step 2: Verify - Filter candidates
    verified_candidates = []
    for candidate in candidates:
        is_verified = verifier.verify_step(
            candidate,
            attribute_type,
            product_id,
            product_description
        )
        
        if is_verified:
            verified_candidates.append(candidate)
    
    # Return best verified candidate (or most frequent if multiple)
    if verified_candidates:
        # Return most frequent or highest confidence
        from collections import Counter
        most_common = Counter(verified_candidates).most_common(1)[0][0]
        return most_common
    
    return None
```

---

## 4.2 PatternRAG: Internal Catalog Guidance

### The Concept: Few-Shot Learning from Catalog

**Problem:** LLMs need examples to predict missing attributes accurately.

**Solution:** PatternRAG retrieves similar products from the same brand/category to provide few-shot examples.

**How It Works:**
1. Find similar products (same brand, category)
2. Retrieve their attribute patterns
3. Use as few-shot examples for LLM
4. LLM predicts missing attribute based on patterns

### PatternRAG Implementation

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
import faiss
import numpy as np

class PatternRAG:
    def __init__(self, catalog_data: Dict):
        """
        Initialize PatternRAG system.
        
        Args:
            catalog_data: Full product catalog
        """
        self.catalog = catalog_data
        self.tokenizer = AutoTokenizer.from_pretrained('gpt-3.5-turbo')  # Or similar
        self.model = AutoModelForCausalLM.from_pretrained('gpt-3.5-turbo')
        
        # Build product embeddings for similarity search
        self.product_embeddings = self.build_product_embeddings()
        self.index = self.build_faiss_index()
    
    def build_product_embeddings(self) -> np.ndarray:
        """Build embeddings for all products."""
        embeddings = []
        self.product_ids = []
        
        for product_id, product in self.catalog.items():
            # Create product representation
            product_text = self.product_to_text(product)
            
            # Get embedding (using simple TF-IDF or BERT)
            embedding = self.get_product_embedding(product_text)
            embeddings.append(embedding)
            self.product_ids.append(product_id)
        
        return np.array(embeddings)
    
    def build_faiss_index(self):
        """Build FAISS index for similarity search."""
        dimension = self.product_embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(self.product_embeddings.astype('float32'))
        return index
    
    def retrieve_similar_products(
        self,
        product_id: str,
        top_k: int = 5
    ) -> List[Dict]:
        """
        Retrieve similar products for few-shot examples.
        
        Args:
            product_id: Target product ID
            top_k: Number of similar products to retrieve
        
        Returns:
            List of similar products with their attributes
        """
        # Get target product embedding
        target_idx = self.product_ids.index(product_id)
        target_embedding = self.product_embeddings[target_idx:target_idx+1]
        
        # Search for similar products
        distances, indices = self.index.search(
            target_embedding.astype('float32'),
            top_k + 1  # +1 because target itself will be in results
        )
        
        # Filter out target product and get similar ones
        similar_products = []
        for idx in indices[0][1:top_k+1]:  # Skip first (target itself)
            similar_id = self.product_ids[idx]
            similar_product = self.catalog[similar_id]
            similar_products.append(similar_product)
        
        return similar_products
    
    def predict_attribute(
        self,
        product_id: str,
        attribute_type: str,
        num_examples: int = 3
    ) -> str:
        """
        Predict missing attribute using PatternRAG.
        
        Args:
            product_id: Product ID
            attribute_type: Attribute to predict
            num_examples: Number of few-shot examples to use
        
        Returns:
            Predicted attribute value
        """
        # Get target product
        target_product = self.catalog[product_id]
        
        # Retrieve similar products
        similar_products = self.retrieve_similar_products(product_id, top_k=num_examples)
        
        # Filter to products that have the attribute
        examples = [
            p for p in similar_products
            if attribute_type in p.get('attributes', {})
        ][:num_examples]
        
        if not examples:
            return None
        
        # Build few-shot prompt
        prompt = self.build_few_shot_prompt(
            target_product,
            examples,
            attribute_type
        )
        
        # Generate prediction
        prediction = self.generate_prediction(prompt)
        
        return prediction
    
    def build_few_shot_prompt(
        self,
        target_product: Dict,
        examples: List[Dict],
        attribute_type: str
    ) -> str:
        """
        Build few-shot prompt with examples.
        
        Args:
            target_product: Target product
            examples: Example products with attribute
            attribute_type: Attribute to predict
        
        Returns:
            Formatted prompt
        """
        prompt = f"Predict the {attribute_type} for the following product based on similar products:\n\n"
        
        # Add examples
        prompt += "Examples:\n"
        for i, example in enumerate(examples, 1):
            product_text = self.product_to_text(example)
            attr_value = example['attributes'][attribute_type]
            prompt += f"Example {i}:\n"
            prompt += f"Product: {product_text}\n"
            prompt += f"{attribute_type}: {attr_value}\n\n"
        
        # Add target
        target_text = self.product_to_text(target_product)
        prompt += f"Target Product:\n{target_text}\n"
        prompt += f"{attribute_type}: "
        
        return prompt
    
    def generate_prediction(self, prompt: str) -> str:
        """Generate prediction using LLM."""
        inputs = self.tokenizer(prompt, return_tensors='pt', truncation=True, max_length=1024)
        
        with torch.no_grad():
            outputs = self.model.generate(
                inputs['input_ids'],
                max_length=inputs['input_ids'].shape[1] + 20,
                num_beams=3,
                early_stopping=True
            )
        
        # Decode only the generated part
        generated_ids = outputs[0][inputs['input_ids'].shape[1]:]
        prediction = self.tokenizer.decode(generated_ids, skip_special_tokens=True)
        
        return prediction.strip()
    
    def product_to_text(self, product: Dict) -> str:
        """Convert product to text representation."""
        parts = []
        
        if 'title' in product:
            parts.append(f"Title: {product['title']}")
        if 'description' in product:
            parts.append(f"Description: {product['description']}")
        if 'brand' in product:
            parts.append(f"Brand: {product['brand']}")
        if 'category' in product:
            parts.append(f"Category: {product['category']}")
        
        return "\n".join(parts)
    
    def get_product_embedding(self, product_text: str) -> np.ndarray:
        """Get embedding for product text."""
        # Simple TF-IDF approach (in production, use BERT or similar)
        from sklearn.feature_extraction.text import TfidfVectorizer
        
        vectorizer = TfidfVectorizer(max_features=128)
        embedding = vectorizer.fit_transform([product_text]).toarray()[0]
        
        return embedding
```

### Benefits of PatternRAG

**Accuracy:**
- Few-shot examples improve prediction quality
- Similar products provide relevant patterns
- Brand/category consistency maintained

**Efficiency:**
- Uses internal catalog data (no external sources needed)
- Fast retrieval with FAISS
- Scalable to large catalogs

**Consistency:**
- Predictions align with existing catalog patterns
- Maintains brand-specific terminology
- Category-appropriate values

---

## 4.3 Hallucination Detection in Listings

### The Problem: LLM Hallucination

**Challenge:** LLMs can generate content that is:
- Factually incorrect
- Not supported by source data
- Inconsistent with product information
- Harmful to customer trust

**Impact:**
- Customer dissatisfaction
- Returns and refunds
- Legal issues
- Brand damage

### Solution: Lexical and Semantic Screening (LSS)

**Approach:** Two-layer screening system:
1. **Lexical Screening:** Check for exact matches and patterns
2. **Semantic Screening:** Check for semantic consistency

### Lexical Screening

**Purpose:** Detect obvious hallucinations using text matching.

```python
class LexicalScreening:
    def __init__(self):
        """Initialize lexical screening."""
        self.source_data = {}
    
    def screen(
        self,
        generated_text: str,
        source_data: Dict
    ) -> Dict[str, bool]:
        """
        Perform lexical screening.
        
        Args:
            generated_text: LLM-generated text
            source_data: Source product data
        
        Returns:
            Dictionary with screening results
        """
        results = {
            'exact_match': self.check_exact_match(generated_text, source_data),
            'attribute_match': self.check_attribute_match(generated_text, source_data),
            'numeric_consistency': self.check_numeric_consistency(generated_text, source_data),
            'brand_match': self.check_brand_match(generated_text, source_data)
        }
        
        # Overall pass/fail
        results['pass'] = all(results.values())
        
        return results
    
    def check_exact_match(self, generated: str, source: Dict) -> bool:
        """Check if key information matches exactly."""
        # Check product name
        if 'title' in source:
            if source['title'].lower() not in generated.lower():
                return False
        
        # Check brand
        if 'brand' in source:
            if source['brand'].lower() not in generated.lower():
                return False
        
        return True
    
    def check_attribute_match(self, generated: str, source: Dict) -> bool:
        """Check if attributes match source data."""
        source_attrs = source.get('attributes', {})
        
        # Check critical attributes
        critical_attrs = ['COLOR', 'SIZE', 'MATERIAL']
        
        for attr in critical_attrs:
            if attr in source_attrs:
                source_value = source_attrs[attr].lower()
                if source_value not in generated.lower():
                    return False
        
        return True
    
    def check_numeric_consistency(self, generated: str, source: Dict) -> bool:
        """Check if numeric values are consistent."""
        import re
        
        # Extract numbers from generated text
        generated_numbers = re.findall(r'\d+\.?\d*', generated)
        
        # Check against source dimensions, weight, etc.
        if 'dimensions' in source:
            source_dims = re.findall(r'\d+\.?\d*', str(source['dimensions']))
            # Allow some tolerance
            if not self.numbers_match(generated_numbers, source_dims, tolerance=0.1):
                return False
        
        return True
    
    def check_brand_match(self, generated: str, source: Dict) -> bool:
        """Check if brand information is consistent."""
        if 'brand' in source:
            brand = source['brand'].lower()
            generated_lower = generated.lower()
            
            # Check for brand name
            if brand not in generated_lower:
                return False
            
            # Check for conflicting brands
            common_brands = ['nike', 'adidas', 'apple', 'samsung', 'sony']
            other_brands = [b for b in common_brands if b != brand and b in generated_lower]
            
            if other_brands:
                return False
        
        return True
    
    def numbers_match(self, nums1: List[str], nums2: List[str], tolerance: float = 0.1) -> bool:
        """Check if number lists match within tolerance."""
        if len(nums1) != len(nums2):
            return False
        
        for n1, n2 in zip(nums1, nums2):
            try:
                diff = abs(float(n1) - float(n2))
                if diff > tolerance:
                    return False
            except ValueError:
                continue
        
        return True
```

### Semantic Screening

**Purpose:** Detect semantic inconsistencies using embeddings.

```python
from sentence_transformers import SentenceTransformer

class SemanticScreening:
    def __init__(self):
        """Initialize semantic screening."""
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.similarity_threshold = 0.7
    
    def screen(
        self,
        generated_text: str,
        source_data: Dict
    ) -> Dict[str, float]:
        """
        Perform semantic screening.
        
        Args:
            generated_text: LLM-generated text
            source_data: Source product data
        
        Returns:
            Dictionary with similarity scores
        """
        # Create source text representation
        source_text = self.source_to_text(source_data)
        
        # Get embeddings
        generated_embedding = self.model.encode(generated_text)
        source_embedding = self.model.encode(source_text)
        
        # Calculate similarity
        from sklearn.metrics.pairwise import cosine_similarity
        similarity = cosine_similarity(
            generated_embedding.reshape(1, -1),
            source_embedding.reshape(1, -1)
        )[0][0]
        
        # Check different aspects
        results = {
            'overall_similarity': similarity,
            'title_similarity': self.check_title_similarity(generated_text, source_data),
            'description_similarity': self.check_description_similarity(generated_text, source_data),
            'attribute_similarity': self.check_attribute_similarity(generated_text, source_data)
        }
        
        # Overall pass/fail
        results['pass'] = similarity >= self.similarity_threshold
        
        return results
    
    def source_to_text(self, source: Dict) -> str:
        """Convert source data to text."""
        parts = []
        
        if 'title' in source:
            parts.append(source['title'])
        if 'description' in source:
            parts.append(source['description'])
        if 'attributes' in source:
            for attr, value in source['attributes'].items():
                parts.append(f"{attr}: {value}")
        
        return " ".join(parts)
    
    def check_title_similarity(self, generated: str, source: Dict) -> float:
        """Check similarity to product title."""
        if 'title' not in source:
            return 1.0  # Neutral if no title
        
        title_embedding = self.model.encode(source['title'])
        generated_embedding = self.model.encode(generated)
        
        from sklearn.metrics.pairwise import cosine_similarity
        similarity = cosine_similarity(
            title_embedding.reshape(1, -1),
            generated_embedding.reshape(1, -1)
        )[0][0]
        
        return similarity
    
    def check_description_similarity(self, generated: str, source: Dict) -> float:
        """Check similarity to product description."""
        if 'description' not in source:
            return 1.0
        
        desc_embedding = self.model.encode(source['description'])
        generated_embedding = self.model.encode(generated)
        
        from sklearn.metrics.pairwise import cosine_similarity
        similarity = cosine_similarity(
            desc_embedding.reshape(1, -1),
            generated_embedding.reshape(1, -1)
        )[0][0]
        
        return similarity
    
    def check_attribute_similarity(self, generated: str, source: Dict) -> float:
        """Check similarity to product attributes."""
        if 'attributes' not in source:
            return 1.0
        
        # Create attribute text
        attr_text = " ".join([f"{k}: {v}" for k, v in source['attributes'].items()])
        
        attr_embedding = self.model.encode(attr_text)
        generated_embedding = self.model.encode(generated)
        
        from sklearn.metrics.pairwise import cosine_similarity
        similarity = cosine_similarity(
            attr_embedding.reshape(1, -1),
            generated_embedding.reshape(1, -1)
        )[0][0]
        
        return similarity
```

### Complete LSS Pipeline

```python
class HallucinationDetector:
    def __init__(self):
        """Initialize complete hallucination detection system."""
        self.lexical_screener = LexicalScreening()
        self.semantic_screener = SemanticScreening()
    
    def detect_hallucination(
        self,
        generated_text: str,
        source_data: Dict
    ) -> Dict:
        """
        Detect hallucinations in generated text.
        
        Args:
            generated_text: LLM-generated text
            source_data: Source product data
        
        Returns:
            Detection results with pass/fail and details
        """
        # Lexical screening
        lexical_results = self.lexical_screener.screen(generated_text, source_data)
        
        # Semantic screening
        semantic_results = self.semantic_screener.screen(generated_text, source_data)
        
        # Combine results
        overall_pass = lexical_results['pass'] and semantic_results['pass']
        
        return {
            'pass': overall_pass,
            'lexical': lexical_results,
            'semantic': semantic_results,
            'confidence': self.calculate_confidence(lexical_results, semantic_results)
        }
    
    def calculate_confidence(
        self,
        lexical_results: Dict,
        semantic_results: Dict
    ) -> float:
        """Calculate overall confidence score."""
        # Lexical confidence (binary checks)
        lexical_score = sum([
            1.0 if lexical_results.get('exact_match') else 0.0,
            1.0 if lexical_results.get('attribute_match') else 0.0,
            1.0 if lexical_results.get('numeric_consistency') else 0.0,
            1.0 if lexical_results.get('brand_match') else 0.0
        ]) / 4.0
        
        # Semantic confidence (similarity scores)
        semantic_score = semantic_results.get('overall_similarity', 0.0)
        
        # Weighted combination
        confidence = 0.4 * lexical_score + 0.6 * semantic_score
        
        return confidence
```

---

## Key Takeaways

**Ask-and-Verify Framework:**
- Two-step process ensures high precision
- Ask step finds candidates (high recall)
- Verify step filters false positives (high precision)
- Maintains factual accuracy

**PatternRAG:**
- Uses internal catalog for few-shot examples
- Retrieves similar products for guidance
- Improves prediction accuracy
- Maintains catalog consistency

**Hallucination Detection:**
- Lexical screening checks exact matches
- Semantic screening checks meaning consistency
- Two-layer approach catches different error types
- Prevents incorrect content from reaching customers

**Catalog Intelligence:**
- Automates attribute filling at scale
- Maintains extreme precision
- Uses multiple verification methods
- Protects customer trust

---

## Lab 4: PatternRAG Implementation

**Objective:** Build a PatternRAG system to predict missing product attributes using few-shot learning from similar products.

**Requirements:**
1. Build product similarity search system
2. Implement few-shot example retrieval
3. Create LLM prompt with examples
4. Predict missing attributes
5. Evaluate accuracy

**Deliverables:**
- Python implementation of PatternRAG
- Few-shot prompt generation
- Attribute prediction results
- Written report (500 words) explaining approach and results

**Evaluation Criteria:**
- PatternRAG implementation (30%)
- Similarity search quality (25%)
- Few-shot prompt design (25%)
- Prediction accuracy (20%)

**Time Estimate:** 4-5 hours

---

## Additional Resources

**Readings:**
- "Ask-and-Verify: High-Precision Attribute Extraction" - Research paper
- "PatternRAG: Catalog-Guided Attribute Prediction" - Industry paper
- "Hallucination Detection in E-Commerce" - Quality assurance study

**Videos:**
- "Catalog Intelligence Systems" (30 min)
- "Hallucination Detection Techniques" (25 min)

**Tools to Explore:**
- Transformers library for LLMs
- FAISS for similarity search
- Sentence Transformers for semantic screening

**Next Module Preview:**
Module 5 will explore strategic operations, logistics, and compliance, including ASPIRE for logistics optimization, GreenBox for packaging, and DeepMMATE for tax compliance.

---

**Module 4 Complete** ✓  
**Next:** Module 5 - Strategic Operations, Logistics, and Compliance
