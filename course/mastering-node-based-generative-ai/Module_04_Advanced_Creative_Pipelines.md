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

## 4.1 Multi-Model Workflows: The "Audition" Phase

One of the most powerful features of platforms like Weavy and Phygital+ is the ability to test multiple AI "artists" simultaneously using a single instruction.

### Simultaneous Testing in Weavy

In Weavy, users can drag out a single prompt node and connect it to an entire **array of AI models**—such as Flux, Nano Banana, Luma, Recraft, and Stable Diffusion—to generate results from all of them at once.

**Workflow Architecture:**
```
Single Prompt Node
    ├─→ Flux Model
    ├─→ Nano Banana Model
    ├─→ Luma Model
    ├─→ Recraft Model
    └─→ Stable Diffusion Model
         ↓
    Simultaneous Outputs
```

**Benefits:**
- Generate from multiple models in parallel
- Compare results instantly
- No need to run separate workflows
- Efficient use of time and resources

**Implementation:**
1. Create a single prompt node
2. Connect to multiple model nodes simultaneously
3. Configure each model's specific settings
4. Execute all models at once
5. Compare results side-by-side

### Quality Comparison in Phygital+

Phygital+ allows users to compare different models like **GPT, Gemini, and Flux** side-by-side on an infinite canvas. This enables a creator to "audition" different models and select the one that best fits a particular project's aesthetic before committing credits to further generations.

**Features:**
- **Infinite Canvas:** Arrange and compare results visually
- **Side-by-Side Comparison:** View multiple model outputs simultaneously
- **Aesthetic Evaluation:** Assess which model matches project vision
- **Credit Efficiency:** Test before committing to large generations

**Use Cases:**
- Style exploration
- Quality comparison
- Cost-benefit analysis
- Model selection for projects
- Client presentations

### Prompt Refinement in Flora AI

In Flora AI, a text block can be used with models like **GPT-5** to rewrite and optimise a basic prompt into a cleaner version before it is automatically sent to connected image models like **Nano Banana Pro** or **Ideogram**.

**Workflow:**
```
Basic Prompt → GPT-5 (LLM Node) → Refined Prompt → Image Models
```

**Benefits:**
- Improve prompt quality automatically
- Optimize for specific models
- Enhance prompt clarity and detail
- Better generation results

**Implementation:**
1. Input basic prompt into text block
2. Connect to LLM node (GPT-5)
3. LLM refines and optimizes prompt
4. Refined prompt automatically sent to image models
5. Generate with improved prompts

**Best Practices:**
- Start with clear basic prompts
- Let LLM enhance technical details
- Test refinement quality
- Iterate based on results

---

## 4.2 Achieving Character Consistency

Maintaining the same character across different scenes or angles is a primary challenge in generative AI. This is addressed through two main advanced techniques.

### LLM-Driven Descriptions

In Flora, users can connect an image to an LLM node (such as Claude or GPT-5) and ask it to provide a **detailed description** of the character's hair, outfit, and lighting. By feeding this highly detailed text into a new generation node, creators can produce **variations of the same character** while maintaining a consistent visual identity.

**Workflow:**
```
Reference Image → LLM Node (Claude/GPT-5) → Detailed Description → Image Generation Nodes
```

**LLM Description Process:**
1. Load reference character image
2. Connect to LLM node (Claude or GPT-5)
3. LLM analyzes and describes:
   - Hair style and color
   - Outfit details
   - Lighting conditions
   - Physical features
   - Style characteristics
4. Detailed description generated
5. Feed description to new generation nodes

**Description Format:**
```
Character: [Name]
Hair: [Detailed hair description - style, color, texture]
Outfit: [Specific clothing details - colors, patterns, style]
Lighting: [Lighting conditions and mood]
Features: [Facial features, body type, distinctive characteristics]
Style: [Artistic style notes]
```

**Benefits:**
- Consistent character appearance
- Detailed visual identity
- Reusable descriptions
- Easy to maintain across generations

**Implementation:**
1. Generate or select base character image
2. Connect image to LLM node
3. Configure LLM prompt: "Describe this character's hair, outfit, and lighting in detail"
4. Extract detailed description
5. Use description in new generation prompts
6. Generate variations maintaining consistency

### Multi-Angle Scene Building

#### Automated Prompting in Weavy

In Weavy, an LLM node can be instructed to "describe five distinct camera angles" (e.g., **macro shot, close-up, medium shot, side angle, and wide shot**) based on a reference character.

**Workflow:**
```
Reference Character → LLM Node → Multiple Angle Descriptions → Image Generation
```

**LLM Configuration:**
- Prompt: "Describe five distinct camera angles for this character: macro shot, close-up, medium shot, side angle, and wide shot"
- LLM generates detailed descriptions for each angle
- Descriptions maintain character consistency
- Each description optimized for specific angle

#### Data Splitting

These descriptions are processed through an **array** or **list node**, which separates the individual instructions by a specific character (like an asterisk). Each separate prompt is then fed into a corresponding image model node to generate the character from all five angles simultaneously.

**Workflow Architecture:**
```
Reference Character
    ↓
LLM Node (5 Angle Descriptions)
    ↓
Array/List Node (Split by *)
    ├─→ Macro Shot Prompt → Image Model
    ├─→ Close-up Prompt → Image Model
    ├─→ Medium Shot Prompt → Image Model
    ├─→ Side Angle Prompt → Image Model
    └─→ Wide Shot Prompt → Image Model
         ↓
    Simultaneous Multi-Angle Outputs
```

**Array/List Node Configuration:**
- Input: Combined descriptions separated by delimiter (e.g., *)
- Processing: Split into individual prompts
- Output: Separate prompts for each angle
- Distribution: Send each to corresponding model node

**Angle Types:**
- **Macro Shot:** Extreme close-up, detailed features
- **Close-up:** Head and shoulders, portrait style
- **Medium Shot:** Upper body, natural pose
- **Side Angle:** Profile view, different perspective
- **Wide Shot:** Full body, environmental context

**Benefits:**
- Generate all angles simultaneously
- Maintain character consistency across angles
- Create complete character sheet automatically
- Efficient workflow execution

**Implementation Steps:**
1. Load reference character image
2. Connect to LLM node
3. Configure LLM to generate 5 angle descriptions
4. Connect LLM output to Array/List node
5. Configure delimiter (e.g., *)
6. Connect split prompts to image model nodes
7. Execute all generations simultaneously
8. Review multi-angle character sheet

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
