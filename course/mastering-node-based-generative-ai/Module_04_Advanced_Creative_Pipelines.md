---
title: "Module 4: Advanced Creative Pipelines (Flora, Weavy, Phygital+)"
description: "Build complex multi-model workflows, maintain character consistency, and organize visual workflows"
module: "4"
order: 4
---

# Module 4: Advanced Creative Pipelines (Flora, Weavy, Phygital+)

**Duration:** Week 7-8  
**Learning Objectives:**
- Build multi-model comparison workflows
- Maintain character consistency across generations
- Create multi-angle scene compositions
- Organize complex workflows with routing nodes

---

## 4.1 Multi-Model Workflows

### Testing Multiple Models Simultaneously

One of the most powerful features of advanced node-based platforms is the ability to test an entire array of models with a single prompt.

**Why Multi-Model Testing?**
- Compare quality and style differences
- Find the best model for specific use cases
- Understand model strengths and weaknesses
- Make informed decisions about model selection

### Building a Model Comparison Workflow

**Architecture:**
```
Single Prompt Input
    ├─→ Model 1 (GPT-5)
    ├─→ Model 2 (Nano Banana)
    ├─→ Model 3 (Ideogram)
    └─→ Model 4 (Flux)
         ↓
    Output Grid/Comparison
```

**Implementation Steps:**

1. **Create Input Node:**
   - Single prompt input
   - Shared across all models
   - Consistent parameters

2. **Add Multiple Model Nodes:**
   - Connect same prompt to each
   - Configure model-specific settings
   - Maintain consistent seed (optional)

3. **Create Output Grid:**
   - Display all results side-by-side
   - Label each with model name
   - Enable easy comparison

**Use Cases:**
- Style exploration
- Quality comparison
- Cost-benefit analysis
- Model selection for projects

### Comparing Model Outputs

**Evaluation Criteria:**
- **Quality:** Detail, realism, artifacts
- **Style:** Aesthetic match to prompt
- **Speed:** Generation time
- **Cost:** Credits/API costs
- **Consistency:** Reproducibility

**Best Practices:**
- Use same seed for fair comparison
- Test with various prompt types
- Document findings
- Create model selection guide

---

## 4.2 Character Consistency

### The Challenge

Maintaining character consistency across multiple images is one of the most difficult problems in AI generation. Characters often change appearance, clothing, or features between generations.

### Generating Detailed Image Descriptions via LLM Nodes

**Approach:**
Use LLM nodes to generate detailed, consistent character descriptions that can be reused across generations.

**Workflow:**

1. **Initial Character Creation:**
   - Generate base character image
   - Extract detailed description
   - Store in reusable format

2. **LLM Description Generation:**
   ```
   Base Image → LLM Node → Detailed Description
   ```

3. **Description Format:**
   ```
   Character: [Name]
   Appearance: [Detailed physical description]
   Clothing: [Specific outfit details]
   Style: [Artistic style notes]
   ```

4. **Reuse in Prompts:**
   - Append description to new prompts
   - Maintain consistency
   - Allow variation in scenes

**LLM Node Configuration:**
- Use GPT-4 or Claude for descriptions
- Prompt: "Describe this character in detail..."
- Format output as reusable text
- Store in workflow variables

### Multi-Angle Scene Building

**Concept:**
Generate the same character from different camera angles and perspectives while maintaining consistency.

**Using Router Nodes:**

**Router Node Purpose:**
- Split reference images into different processing paths
- Apply different transformations
- Maintain source consistency

**Workflow Architecture:**
```
Reference Image
    ├─→ Router Node
         ├─→ Macro Angle (Close-up)
         ├─→ Close-up Angle (Head/Shoulders)
         ├─→ Medium Shot (Upper Body)
         └─→ Wide Shot (Full Body)
              ↓
         Consistent Character Outputs
```

**Implementation:**

1. **Load Reference Image:**
   - Character base image
   - High quality, clear features

2. **Router Node Configuration:**
   - Split into multiple paths
   - Each path = different angle
   - Maintain character description

3. **Angle-Specific Prompts:**
   - Macro: "extreme close-up, detailed features"
   - Close-up: "head and shoulders, portrait"
   - Medium: "upper body, natural pose"
   - Wide: "full body, environmental context"

4. **Consistency Techniques:**
   - Use same character description
   - Apply IPAdapter for face consistency
   - Use ControlNet for pose/structure
   - Maintain style parameters

**Advanced Techniques:**

**Character Sheet Generation:**
- Generate multiple angles automatically
- Create reference document
- Use for future consistency

**Pose Control:**
- Use OpenPose ControlNet
- Maintain body structure
- Vary camera angles only

**Style Locking:**
- Lock artistic style
- Vary composition only
- Maintain visual consistency

---

## 4.3 Visual Organization

### The "Spiderweb" Problem

Complex workflows can quickly become difficult to navigate:
- Hundreds of connection wires
- Overlapping nodes
- Unclear data flow
- Hard to debug and modify

### Using Reroute/Router Nodes

**Reroute Nodes:**
- Clean up connection wires
- Reduce visual clutter
- Improve workflow readability
- Maintain functionality

**Router Nodes:**
- Split data streams
- Route to multiple destinations
- Conditional processing
- Organize workflow logic

### Workflow Organization Strategies

**1. Grouping by Function:**
```
Input Section
    ↓
Processing Section
    ↓
Output Section
```

**2. Using Reroute Nodes:**
- Place reroute nodes at connection points
- Reduce wire crossings
- Create clear paths
- Label important connections

**3. Color Coding:**
- Use node colors for categories
- Input nodes: Blue
- Processing nodes: Green
- Output nodes: Red
- Utility nodes: Yellow

**4. Spacing and Layout:**
- Leave space between sections
- Align nodes vertically/horizontally
- Group related nodes
- Use consistent spacing

**5. Naming Conventions:**
- Descriptive node names
- Consistent naming patterns
- Document complex sections
- Use comments/notes

### Best Practices for Complex Workflows

**Modular Design:**
- Break into reusable sections
- Create sub-workflows
- Test components independently
- Combine when ready

**Documentation:**
- Add notes to complex sections
- Document parameter choices
- Explain routing logic
- Include examples

**Version Control:**
- Save versions regularly
- Name descriptively
- Document changes
- Keep backups

**Performance:**
- Optimize node order
- Reduce redundant processing
- Cache intermediate results
- Monitor resource usage

---

## Module 4 Summary

You've learned:
- ✅ Building multi-model comparison workflows
- ✅ Maintaining character consistency with LLM descriptions
- ✅ Creating multi-angle scene compositions
- ✅ Organizing complex workflows visually
- ✅ Using router and reroute nodes effectively

**Next Steps:**
- Build a character consistency workflow
- Create a multi-model comparison system
- Organize a complex project workflow
- Prepare for Module 5: AI Automation & API Integration

---

## Practice Exercises

1. **Multi-Model Comparison:**
   - Build workflow testing 4+ models
   - Use same prompt for all
   - Compare outputs
   - Document findings

2. **Character Consistency:**
   - Generate base character
   - Create LLM description
   - Generate 5 variations
   - Evaluate consistency

3. **Multi-Angle Generation:**
   - Use router nodes
   - Generate 4 different angles
   - Maintain character consistency
   - Create character sheet

4. **Workflow Organization:**
   - Take a complex workflow
   - Reorganize with reroute nodes
   - Apply color coding
   - Document structure
