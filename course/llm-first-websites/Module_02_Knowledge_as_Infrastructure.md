---
title: "Module 2: Knowledge as Infrastructure"
description: "Structure is the foundation of intelligence. Define reality so machines don't have to guess."
module: "2"
order: 2
---

# Module 2: Knowledge as Infrastructure

**Duration:** Week 2  
**Learning Objectives:**
- Build clear ontologies for core entities
- Create controlled taxonomies to eliminate ambiguity
- Design evidence graphs that separate facts, patterns, and anecdotes
- Understand how structure enables machine intelligence

---

## 2.1 Ontology Before Intelligence

### Building Clear Ontologies for Core Entities

An **ontology** defines what exists in your domain and what can happen. It's the foundation that enables machines to understand your world without guessing or hallucinating.

**Core Questions an Ontology Answers:**
- What entities exist? (Products, Services, People, Concepts)
- What are their properties? (Attributes, Characteristics)
- How do they relate? (Connections, Dependencies)
- What can happen? (Actions, Events, State Changes)
- What are the constraints? (Rules, Limitations)

### Why Ontologies Matter

**Without an ontology:**
- Machines guess what entities mean
- Ambiguity leads to errors
- Relationships are unclear
- Actions are unpredictable
- Hallucinations increase

**With a clear ontology:**
- Machines know exactly what exists
- Entities are unambiguous
- Relationships are explicit
- Actions follow defined rules
- Hallucinations decrease

### Building Your Ontology

#### Step 1: Identify Core Entities

Start by listing the fundamental "things" in your domain.

**Example: E-commerce Platform**
```
Entities:
- Product
- Category
- Customer
- Order
- Inventory
- Review
- Price
- Discount
```

**Example: Service Business**
```
Entities:
- Service
- ServiceProvider
- Customer
- Appointment
- Location
- Availability
- Pricing
- Qualification
```

#### Step 2: Define Entity Properties

For each entity, define its essential properties.

**Example: Product Entity**
```json
{
  "Product": {
    "properties": {
      "id": "string (unique identifier)",
      "name": "string (required)",
      "description": "string (required)",
      "category": "Category (reference)",
      "price": "Money (required)",
      "currency": "string (ISO 4217)",
      "inStock": "boolean",
      "quantity": "integer (if inStock)",
      "specifications": "object (key-value pairs)",
      "images": "array of Image URLs",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    },
    "required": ["id", "name", "description", "price", "currency"],
    "constraints": {
      "price": ">= 0",
      "quantity": ">= 0 if inStock"
    }
  }
}
```

#### Step 3: Define Relationships

Map how entities connect to each other.

**Example: E-commerce Relationships**
```
Product --[belongs to]--> Category
Product --[has many]--> Review
Product --[has one]--> Inventory
Order --[contains many]--> Product
Order --[belongs to]--> Customer
Customer --[writes]--> Review
```

#### Step 4: Define Actions and Events

Specify what can happen in your domain.

**Example: E-commerce Actions**
```
Actions:
- addToCart(product, quantity)
- createOrder(cart)
- cancelOrder(orderId)
- updateInventory(productId, quantity)
- addReview(productId, review)

Events:
- OrderCreated
- OrderCancelled
- InventoryLow
- ProductUpdated
- ReviewAdded
```

#### Step 5: Define Constraints and Rules

Establish what's allowed and what's not.

**Example: E-commerce Rules**
```
Rules:
- Order can only be cancelled if status is "pending"
- Inventory cannot go below 0
- Review can only be added by customer who purchased
- Price cannot be negative
- Discount cannot exceed 100%
```

### Ontology Patterns

#### Pattern 1: Hierarchical Entities

Entities organized in a tree structure.

**Example: Product Categories**
```
Electronics
  ├── Computers
  │   ├── Laptops
  │   └── Desktops
  └── Phones
      ├── Smartphones
      └── Feature Phones
```

#### Pattern 2: Network Entities

Entities connected in a graph.

**Example: Service Providers**
```
ServiceProvider --[offers]--> Service
ServiceProvider --[located in]--> Location
ServiceProvider --[has]--> Qualification
Service --[requires]--> Qualification
Customer --[books]--> Appointment
Appointment --[with]--> ServiceProvider
Appointment --[for]--> Service
```

#### Pattern 3: Temporal Entities

Entities that change over time.

**Example: Pricing**
```
Price:
  - effectiveDate: datetime
  - expirationDate: datetime (optional)
  - value: Money
  - currency: string
```

### Implementing Ontologies

#### JSON-LD Format

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "ProRunner X1",
  "description": "Running shoes for flat feet",
  "category": {
    "@type": "Category",
    "name": "Running Shoes"
  },
  "offers": {
    "@type": "Offer",
    "price": "129.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "127"
  }
}
```

#### RDF/OWL Format

```turtle
@prefix ex: <http://example.org/ontology#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

ex:Product rdf:type owl:Class .
ex:Category rdf:type owl:Class .
ex:belongsTo rdf:type owl:ObjectProperty ;
    rdfs:domain ex:Product ;
    rdfs:range ex:Category .
```

### Common Ontology Mistakes

**Mistake 1: Too Vague**
- ❌ "Product has properties"
- ✅ "Product has: id (string), name (string), price (Money)"

**Mistake 2: Missing Relationships**
- ❌ "Products exist"
- ✅ "Product belongs to Category, has Inventory, receives Reviews"

**Mistake 3: No Constraints**
- ❌ "Price can be anything"
- ✅ "Price must be >= 0, currency must be ISO 4217 code"

**Mistake 4: Ignoring Actions**
- ❌ "Products just exist"
- ✅ "Products can be: added to cart, purchased, reviewed, updated"

---

## 2.2 Killing Ambiguity with Taxonomies

### Using Controlled, Finite Vocabularies

A **taxonomy** is a controlled vocabulary that defines exactly what terms mean and how they relate. It prevents "silent failures" where humans or machines use the same word for different concepts.

### The Problem of Ambiguity

**Example: The Word "Active"**

Without taxonomy:
- User status: "active" = logged in recently
- Product status: "active" = available for sale
- Order status: "active" = not yet completed
- Subscription: "active" = currently paid

**Result:** Confusion, errors, wrong actions

With taxonomy:
```json
{
  "taxonomies": {
    "userStatus": {
      "values": ["online", "offline", "inactive", "suspended"],
      "definitions": {
        "online": "Currently logged in",
        "offline": "Not logged in",
        "inactive": "No login in 90+ days",
        "suspended": "Account temporarily disabled"
      }
    },
    "productStatus": {
      "values": ["available", "outOfStock", "discontinued", "preorder"],
      "definitions": {
        "available": "In stock and ready to ship",
        "outOfStock": "Temporarily unavailable",
        "discontinued": "No longer manufactured",
        "preorder": "Available for future delivery"
      }
    },
    "orderStatus": {
      "values": ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      "definitions": {
        "pending": "Payment processing",
        "confirmed": "Payment received, preparing",
        "shipped": "In transit",
        "delivered": "Received by customer",
        "cancelled": "Order voided"
      }
    }
  }
}
```

### Building Taxonomies

#### Step 1: Identify Ambiguous Terms

Find words that might mean different things.

**Common Ambiguous Terms:**
- Status (user, product, order, subscription)
- Type (content, product, service)
- Category (product, content, user)
- State (system, entity, process)
- Level (access, quality, priority)

#### Step 2: Define Controlled Vocabularies

Create finite lists of allowed values.

**Example: Content Type Taxonomy**
```json
{
  "contentType": {
    "values": [
      "article",
      "tutorial",
      "video",
      "podcast",
      "whitepaper",
      "case-study",
      "faq",
      "product-page"
    ],
    "hierarchical": false,
    "definitions": {
      "article": "Informational written content",
      "tutorial": "Step-by-step instructional content",
      "video": "Video-based content",
      "podcast": "Audio-only content",
      "whitepaper": "In-depth research document",
      "case-study": "Real-world example analysis",
      "faq": "Frequently asked questions",
      "product-page": "Product information page"
    }
  }
}
```

#### Step 3: Create Hierarchical Taxonomies (When Needed)

Organize terms in a tree structure.

**Example: Product Category Taxonomy**
```json
{
  "productCategory": {
    "hierarchical": true,
    "structure": {
      "electronics": {
        "children": {
          "computers": {
            "children": {
              "laptops": {},
              "desktops": {},
              "tablets": {}
            }
          },
          "phones": {
            "children": {
              "smartphones": {},
              "feature-phones": {}
            }
          }
        }
      },
      "clothing": {
        "children": {
          "mens": {
            "children": {
              "shirts": {},
              "pants": {},
              "shoes": {}
            }
          },
          "womens": {
            "children": {
              "shirts": {},
              "pants": {},
              "shoes": {}
            }
          }
        }
      }
    }
  }
}
```

#### Step 4: Define Relationships Between Terms

Specify how terms relate.

**Example: Service Taxonomy with Relationships**
```json
{
  "serviceType": {
    "values": [
      "emergency",
      "scheduled",
      "consultation",
      "maintenance",
      "installation"
    ],
    "relationships": {
      "emergency": {
        "requires": ["24/7-availability"],
        "excludes": ["scheduled"],
        "typical-duration": "2-4 hours"
      },
      "scheduled": {
        "requires": ["advance-booking"],
        "typical-duration": "4-8 hours"
      },
      "consultation": {
        "requires": ["expert-qualification"],
        "typical-duration": "1-2 hours"
      }
    }
  }
}
```

### Implementing Taxonomies

#### Schema.org Enumeration

```json
{
  "@type": "Product",
  "category": {
    "@type": "CategoryCode",
    "codeValue": "electronics/computers/laptops",
    "inCodeSet": {
      "@type": "CategoryCodeSet",
      "name": "Product Category Taxonomy"
    }
  }
}
```

#### SKOS (Simple Knowledge Organization System)

```turtle
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .

ex:laptops rdf:type skos:Concept ;
    skos:prefLabel "Laptops"@en ;
    skos:definition "Portable computers"@en ;
    skos:broader ex:computers ;
    skos:narrower ex:gaming-laptops, ex:business-laptops .
```

### Taxonomy Best Practices

1. **Keep It Finite**
   - Don't allow free-form values
   - Enforce controlled vocabulary
   - Version your taxonomies

2. **Document Everything**
   - Define each term clearly
   - Explain relationships
   - Provide examples

3. **Make It Extensible**
   - Design for growth
   - Allow new terms with process
   - Maintain backward compatibility

4. **Validate Usage**
   - Check values against taxonomy
   - Reject invalid terms
   - Log taxonomy violations

5. **Version Control**
   - Track taxonomy changes
   - Deprecate terms properly
   - Maintain change history

---

## 2.3 The Evidence Graph

### Restructuring Data: Facts, Patterns, and Anecdotes

The **Evidence Graph** separates three types of knowledge:
1. **Authoritative Knowledge** - Verified facts
2. **Observed Reality** - Patterns from data
3. **Reported Experience** - Anecdotes and testimonials

This separation prevents machines from treating opinions as facts or patterns as certainties.

### The Three Layers

#### Layer 1: Authoritative Knowledge (Facts)

**Characteristics:**
- Verified and true
- Source is authoritative
- Not subject to interpretation
- Stable over time

**Examples:**
- Product specifications (weight, dimensions)
- Legal requirements (licenses, certifications)
- Scientific facts (chemical composition)
- Official records (registration numbers)

**Implementation:**
```json
{
  "@type": "AuthoritativeKnowledge",
  "claim": "Product weight is 280g",
  "source": {
    "@type": "Authority",
    "name": "Manufacturer Specification",
    "verification": "https://example.com/specs/certified"
  },
  "certainty": "fact",
  "validity": {
    "start": "2024-01-01",
    "end": null
  },
  "jurisdiction": "global"
}
```

#### Layer 2: Observed Reality (Patterns)

**Characteristics:**
- Derived from data analysis
- Statistical patterns
- May have confidence intervals
- Can change with more data

**Examples:**
- Average delivery time: 2.3 days (based on 1,000 orders)
- Customer satisfaction: 4.5/5 (based on 500 reviews)
- Success rate: 87% (based on historical data)
- Peak usage: 2-4 PM (based on analytics)

**Implementation:**
```json
{
  "@type": "ObservedReality",
  "pattern": "Average delivery time is 2.3 days",
  "evidence": {
    "@type": "StatisticalEvidence",
    "sampleSize": 1000,
    "timeframe": "2024-01-01 to 2024-12-31",
    "confidence": 0.95,
    "confidenceInterval": [2.1, 2.5]
  },
  "certainty": "pattern",
  "source": {
    "@type": "DataAnalysis",
    "method": "historical-order-analysis",
    "lastUpdated": "2024-12-31"
  }
}
```

#### Layer 3: Reported Experience (Anecdotes)

**Characteristics:**
- Individual experiences
- Subjective opinions
- Not generalizable
- Valuable for context

**Examples:**
- Customer reviews
- Testimonials
- Case studies
- User stories

**Implementation:**
```json
{
  "@type": "ReportedExperience",
  "experience": "Great product, fast delivery",
  "source": {
    "@type": "CustomerReview",
    "author": "Customer123",
    "date": "2024-12-15",
    "rating": 5
  },
  "certainty": "anecdote",
  "context": {
    "product": "ProductXYZ",
    "orderDate": "2024-12-10",
    "deliveryDate": "2024-12-12"
  }
}
```

### Building the Evidence Graph

#### Step 1: Classify Your Knowledge

For each piece of information, classify it:

**Questions to Ask:**
- Is this a verified fact? → Authoritative Knowledge
- Is this a pattern from data? → Observed Reality
- Is this an individual experience? → Reported Experience

#### Step 2: Structure the Graph

Create nodes and edges that connect evidence.

**Example: Product Evidence Graph**
```
Product (Node)
  ├── Authoritative Knowledge
  │   ├── Specifications (Node)
  │   ├── Certifications (Node)
  │   └── Legal Status (Node)
  ├── Observed Reality
  │   ├── Average Rating (Node) --[based on]--> Reviews (Node)
  │   ├── Delivery Time (Node) --[based on]--> Orders (Node)
  │   └── Return Rate (Node) --[based on]--> Returns (Node)
  └── Reported Experience
      ├── Customer Reviews (Node)
      ├── Testimonials (Node)
      └── Case Studies (Node)
```

#### Step 3: Link Evidence Types

Connect different evidence types to show relationships.

**Example: Evidence Connections**
```json
{
  "@type": "EvidenceGraph",
  "nodes": [
    {
      "id": "product-spec",
      "type": "AuthoritativeKnowledge",
      "content": "Weight: 280g"
    },
    {
      "id": "avg-rating",
      "type": "ObservedReality",
      "content": "4.5/5 stars",
      "basedOn": ["review-1", "review-2", "review-3"]
    },
    {
      "id": "review-1",
      "type": "ReportedExperience",
      "content": "Lightweight and comfortable"
    }
  ],
  "edges": [
    {
      "from": "avg-rating",
      "to": "review-1",
      "relationship": "aggregates"
    },
    {
      "from": "review-1",
      "to": "product-spec",
      "relationship": "references"
    }
  ]
}
```

### Using the Evidence Graph

#### For AI Reasoning

When an AI system reasons about your domain:

1. **Start with Authoritative Knowledge**
   - Use verified facts as foundation
   - Build reasoning on certainties

2. **Apply Observed Reality**
   - Use patterns for predictions
   - Include confidence levels
   - Acknowledge uncertainty

3. **Reference Reported Experience**
   - Use anecdotes for context
   - Show individual perspectives
   - Don't generalize from anecdotes

#### Example: AI Reasoning Process

**Query:** "Should I buy Product X?"

**AI Reasoning:**
```
1. Authoritative Knowledge:
   - Product X weighs 280g (fact)
   - Product X is certified for safety (fact)
   
2. Observed Reality:
   - Average rating: 4.5/5 (pattern, 95% confidence)
   - Delivery time: 2.3 days (pattern, based on 1000 orders)
   
3. Reported Experience:
   - "Lightweight and comfortable" (anecdote, 1 review)
   - "Arrived quickly" (anecdote, 1 review)
   
Conclusion: Based on verified specifications and statistical patterns, 
Product X appears to be a good choice. Individual experiences vary.
```

### Evidence Graph Implementation

#### JSON-LD Format

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "ProRunner X1",
  "authoritativeKnowledge": {
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ProductSpecification",
        "name": "Weight",
        "value": "280g",
        "certainty": "fact",
        "source": "Manufacturer"
      }
    ]
  },
  "observedReality": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "500",
    "certainty": "pattern",
    "confidence": 0.95
  },
  "reportedExperience": {
    "@type": "Review",
    "reviewBody": "Great product",
    "author": "Customer123",
    "certainty": "anecdote"
  }
}
```

---

## Exercises

### Exercise 2.1: Build Domain Ontology

**Objective:** Create a complete ontology for your domain.

**Steps:**
1. Choose a domain (product, service, or information)
2. Identify 5-10 core entities
3. For each entity:
   - Define properties
   - Specify relationships
   - List possible actions
   - Define constraints
4. Create both:
   - Human-readable documentation
   - Machine-readable format (JSON-LD or RDF)

**Deliverable:** Complete ontology with documentation and machine-readable format.

**Evaluation Criteria:**
- Clear entity definitions
- Well-defined properties
- Explicit relationships
- Action specifications
- Constraint definitions
- Valid machine-readable format

---

### Exercise 2.2: Create Taxonomy

**Objective:** Build controlled vocabularies to eliminate ambiguity.

**Steps:**
1. Identify 3-5 areas of ambiguity in your domain
2. For each area:
   - List current ambiguous terms
   - Define controlled vocabulary
   - Create definitions
   - Specify relationships (if hierarchical)
3. Create taxonomy documentation
4. Implement validation rules

**Deliverable:** Taxonomy documentation with controlled vocabularies and validation rules.

**Evaluation Criteria:**
- Clear identification of ambiguities
- Well-defined controlled vocabularies
- Comprehensive definitions
- Appropriate structure (hierarchical if needed)
- Validation rules

---

### Exercise 2.3: Design Evidence Graph

**Objective:** Structure knowledge into facts, patterns, and anecdotes.

**Steps:**
1. Choose a specific topic in your domain
2. Collect 10-15 pieces of information
3. Classify each as:
   - Authoritative Knowledge
   - Observed Reality
   - Reported Experience
4. Create evidence graph structure:
   - Nodes for each evidence type
   - Edges showing relationships
   - Connections between types
5. Document how AI would use this graph

**Deliverable:** Evidence graph design with classification and usage documentation.

**Evaluation Criteria:**
- Accurate classification
- Clear graph structure
- Appropriate relationships
- Well-documented usage
- Practical AI reasoning example

---

## Key Takeaways

1. **Ontologies define reality** - They tell machines what exists and what can happen
2. **Taxonomies eliminate ambiguity** - Controlled vocabularies prevent silent failures
3. **Evidence graphs separate knowledge types** - Facts, patterns, and anecdotes serve different purposes
4. **Structure enables intelligence** - Clear organization helps machines reason accurately
5. **Machine-readable formats matter** - JSON-LD, RDF, and SKOS enable AI comprehension
6. **Validation prevents errors** - Enforcing ontologies and taxonomies catches mistakes early
7. **Version control is essential** - Knowledge evolves, track changes

---

## Additional Resources

### Reading
- "Ontology Engineering" - Building domain models
- "Taxonomy Design" - Controlled vocabularies
- "Evidence-Based Reasoning" - Separating facts from opinions

### Tools
- Protégé (Ontology Editor)
- SKOS Playground
- JSON-LD Playground
- Schema.org Validator

### Standards
- Schema.org
- JSON-LD
- RDF/OWL
- SKOS

---

## Next Steps

**After completing this module:**
1. Review your ontology, taxonomy, and evidence graph
2. Test with AI systems
3. Refine based on feedback
4. Move to [Module 3: Designing for Machine-First Interoperability](Module_03_Designing_for_Machine_First_Interoperability.md)

---

**Module 2 Complete** ✅  
**Ready for Module 3?** → [Designing for Machine-First Interoperability](Module_03_Designing_for_Machine_First_Interoperability.md)
