---
title: "Module 5: Bundles & Catalog Logic"
description: "Scale product bundles across an entire e-commerce catalog"
module: "5"
order: 5
email_takeaway: "Defining bundle logic. One need = one batch. Looping over SKUs without breaking composition. Maintaining scene integrity."
email_action: "Design a bundle system: inputs (products), outputs (consistent visuals), loop logic."
---

# Module 5: Bundles & Catalog Logic
**Scale product bundles across an entire e-commerce catalog**

**Duration:** Week 5  
**Learning Objectives:**
- **Define "Bundle**: Define "bundle logic" (2 products, 3 products, variants)
- **one need = one batch Understanding**: Understand one need = one batch
- **to loop over SKUs without breaking composition Understanding**: Learn to loop over SKUs without breaking composition
- **Maintain Scene**: Maintain scene integrity across runs
- **bundle Development**: Apply design bundle systems in relevant contexts

---

## 5.1 Defining "Bundle Logic"

### What is a Bundle?

**Bundle Definition:**
A collection of products presented together in a single visual.

**Types:**
- **2-Product Bundle:** Two complementary products
- **3-Product Bundle:** Three related products
- **Multi-Product Bundle:** Four or more products
- **Variant Bundle:** Same product, different variants

### Bundle Logic Components

**1. Product Selection**
- Which products go together?
- Complementary or related?
- Category-based or curated?

**2. Composition Rules**
- How are products arranged?
- Spatial relationships
- Visual hierarchy

**3. Scene Integrity**
- Consistent setting
- Coherent lighting
- Unified style

**4. Scalability**
- Works across catalog
- Handles variations
- Maintains quality

---

## 5.2 One Need = One Batch

### The Batch Principle

**Concept:**
Each bundle need (e.g., "2-product fashion bundle") should be handled as one batch operation.

**Benefits:**
- Consistent processing
- Efficient execution
- Quality control
- Scalable production

### Batch Definition

**Bundle Batch:**
```
Batch: 2-Product Fashion Bundle
├── Product Selection: 2 fashion items
├── Composition: Side-by-side arrangement
├── Style: Lifestyle, natural setting
├── Output: Single bundle image
└── Scale: Apply to all 2-product fashion pairs
```

**Multiple Batches:**
```
Catalog
├── Batch 1: 2-Product Fashion Bundles
├── Batch 2: 3-Product Home Bundles
├── Batch 3: 2-Product Beauty Bundles
└── Batch 4: Variant Bundles
```

### Batch Processing

**Process:**
1. Define batch criteria
2. Select products matching criteria
3. Generate bundle images
4. Validate quality
5. Export outputs

---

## 5.3 Looping Over SKUs Without Breaking Composition

### The Composition Challenge

**Problem:**
When looping over SKUs, composition can break if:
- Products have different sizes
- Products have different shapes
- Products have different visual weights
- Spatial relationships change

### Composition Preservation

**Strategies:**

**1. Fixed Composition Template**
```
Template: [Product A] [Product B]
Apply: Same template, different products
Result: Consistent composition
```

**2. Size Normalization**
```
Process: Normalize product sizes
Apply: Same relative sizes
Result: Consistent visual weight
```

**3. Spatial Locking**
```
Lock: Product positions
Vary: Product identities
Result: Consistent arrangement
```

**4. Scene Consistency**
```
Lock: Scene setting
Vary: Products
Result: Consistent environment
```

### Implementation

**Composition-Preserving Loop:**
```python
def generate_bundle_batch(products, composition_template):
    for product_pair in products:
        # Lock composition
        composition = composition_template
        
        # Insert products
        bundle = insert_products(composition, product_pair)
        
        # Validate composition
        if validate_composition(bundle):
            yield bundle
        else:
            # Adjust and retry
            bundle = adjust_composition(bundle)
            yield bundle
```

---

## 5.4 Maintaining Scene Integrity Across Runs

### Scene Integrity Components

**1. Setting Consistency**
- Same environment
- Same background
- Same context

**2. Lighting Consistency**
- Same light source
- Same light direction
- Same light quality

**3. Style Consistency**
- Same art direction
- Same color palette
- Same mood

**4. Composition Consistency**
- Same arrangement
- Same spatial relationships
- Same visual hierarchy

### Scene Locking Strategy

**Lock Elements:**
- Background
- Lighting setup
- Camera angle
- Overall style

**Vary Elements:**
- Product identities
- Product positions (within template)
- Minor details

**Implementation:**
```
Scene Template:
- Background: [Locked]
- Lighting: [Locked]
- Camera: [Locked]
- Style: [Locked]

Product Insertion:
- Products: [Varied]
- Positions: [Within template]
- Details: [Varied]
```

---

## 5.5 Exercise: Design a Bundle System

### Objective

Design a bundle system with inputs (products), outputs (consistent visuals), and loop logic.

### Instructions

**Step 1: Define Bundle Type**
- Choose bundle type (2-product, 3-product, etc.)
- Select product category
- Define use case

**Step 2: Design Inputs**
- Product selection criteria
- Product data structure
- Bundle pairing logic

**Step 3: Design Composition**
- Spatial arrangement
- Visual hierarchy
- Scene setting

**Step 4: Design Loop Logic**
- How to iterate over products
- How to preserve composition
- How to maintain scene integrity

**Step 5: Design Outputs**
- Image format
- Quality requirements
- Metadata structure

**Step 6: Document System**
- System architecture
- Processing flow
- Quality checks
- Error handling

### Deliverable

**Bundle System Design Document:**
- Bundle type definition
- Input specifications
- Composition design
- Loop logic
- Output specifications
- System architecture
- Example outputs

### Example Structure

```markdown
# Bundle System: [Bundle Type]

## Bundle Definition
- Type: [2-product, 3-product, etc.]
- Category: [Fashion, Home, Beauty, etc.]
- Use Case: [Website, Ads, Catalog, etc.]

## Inputs
- Product Selection: [Criteria]
- Product Data: [Structure]
- Pairing Logic: [Rules]

## Composition Design
- Arrangement: [Description]
- Hierarchy: [Description]
- Scene: [Description]

## Loop Logic
- Iteration: [How products are looped]
- Composition Preservation: [Strategy]
- Scene Integrity: [Strategy]

## Outputs
- Format: [Image format]
- Quality: [Requirements]
- Metadata: [Structure]

## System Architecture
- Components: [List]
- Flow: [Diagram]
- Quality Checks: [List]
- Error Handling: [Strategy]

## Example Outputs
- [Sample bundle images]
- [Variations]
- [Quality examples]
```

---

## 5.6 Key Takeaways

### Core Principles

1. **Bundle Logic:** Define clear rules for product combinations
2. **Batch Processing:** One need = one batch
3. **Composition Preservation:** Lock composition, vary products
4. **Scene Integrity:** Maintain consistency across runs

### Best Practices

1. **Clear Definitions:** Explicit bundle rules
2. **Template-Based:** Use composition templates
3. **Scene Locking:** Lock environment, vary products
4. **Quality Validation:** Check composition integrity
5. **Scalable Design:** Works across catalog

### Next Steps

- Complete the exercise
- Review Module 6: Creative Loops & Automation
- Test bundle systems
- Prepare catalog data

---

## 5.7 Resources

### Reading
- Bundle design principles
- Composition techniques
- Scene consistency methods
- Catalog scaling strategies

### Tools
- Product catalog APIs
- Composition templates
- Scene generation tools
- Quality validation systems

### Community
- Course Discord
- Office hours
- Bundle system discussions

---

**Ready for Module 6? Let's automate at scale! →**

---

**Version 1.0 | January 2025**
