---
title: "Module 1: Foundations of AI and The Technical Landscape"
description: "Establish a baseline understanding of AI terminologies, capabilities, and limitations as defined by current government frameworks"
module: "1"
order: 1
---

# Module 1: Foundations of AI and The Technical Landscape

**Objective:** To establish a baseline understanding of AI terminologies, capabilities, and limitations as defined by current government frameworks.

## Learning Objectives

- Understand the distinction between different AI types (foundation models, agentic AI, narrow AI)
- Differentiate between Artificial Neural Networks, Machine Learning, Deep Learning, and Generative AI
- Analyze key risks including hallucination, bias replication, and lack of contextual reasoning
- Understand the layers of the AI ecosystem and supply chain

## Core Topics

### 1.1 Defining the Technology

**Highly Capable General-Purpose AI (Foundation Models):**
- Large-scale models trained on broad datasets
- General-purpose capabilities across multiple domains
- Can be adapted (fine-tuned) for specific tasks
- Examples: GPT-4, Claude, Gemini
- Characteristics: Versatile, powerful, resource-intensive

**Agentic AI (Autonomous Systems):**
- AI systems that can act autonomously to achieve goals
- Can make decisions and take actions without constant human oversight
- May use tools, access systems, and interact with environments
- Examples: Autonomous agents, AI assistants with tool use
- Characteristics: Autonomous, goal-oriented, potentially high-risk

**Narrow AI (Task-Specific):**
- AI systems designed for specific, well-defined tasks
- Limited to their training domain
- Highly optimized for particular use cases
- Examples: Image classification, fraud detection, recommendation systems
- Characteristics: Focused, predictable, lower risk

**Key Distinctions:**
- **Scope:** General-purpose vs task-specific
- **Autonomy:** Autonomous vs supervised
- **Risk:** Higher risk with general-purpose and agentic systems
- **Governance:** Different governance requirements for each type

### 1.2 The Technical Hierarchy

**Artificial Neural Networks (ANNs):**
- Computational models inspired by biological neural networks
- Basic building blocks of modern AI
- Composed of interconnected nodes (neurons)
- Process information through weighted connections
- Foundation for more advanced techniques

**Machine Learning (ML):**
- Subset of AI that enables systems to learn from data
- Algorithms improve performance through experience
- Types: Supervised, unsupervised, reinforcement learning
- Does not require explicit programming for every task
- Examples: Classification, regression, clustering

**Deep Learning (DL):**
- Subset of ML using neural networks with multiple layers
- "Deep" refers to multiple hidden layers
- Can learn complex patterns and representations
- Particularly effective for unstructured data (images, text, audio)
- Examples: Convolutional Neural Networks (CNNs), Recurrent Neural Networks (RNNs)

**Generative AI:**
- AI systems that generate new content (text, images, code, etc.)
- Trained on large datasets to learn patterns
- Can create novel outputs based on prompts
- Examples: ChatGPT, DALL-E, GitHub Copilot
- Characteristics: Creative, unpredictable, risk of hallucination

**Hierarchy Relationship:**
```
AI (Broadest)
  └── ML (Learning from data)
      └── DL (Deep neural networks)
          └── Generative AI (Content generation)
```

### 1.3 Capabilities and Limitations

**Key Capabilities:**
- Pattern recognition and classification
- Natural language understanding and generation
- Image and video analysis
- Predictive modeling
- Automation of routine tasks
- Data analysis at scale

**Critical Limitations:**

**Hallucination (Confabulation):**
- Models generate plausible but false information
- Models express high confidence in incorrect outputs
- Particularly problematic in foundation models
- Can fabricate citations, facts, or details
- **Governance Implication:** Cannot rely on AI outputs without verification

**Bias Replication:**
- Models learn and amplify biases in training data
- Historical discrimination becomes encoded in models
- May perpetuate or worsen existing inequalities
- **Governance Implication:** Must actively identify and mitigate bias

**Lack of Contextual Reasoning:**
- Models may lack understanding of context
- May not understand nuance or subtlety
- May miss important contextual factors
- **Governance Implication:** Human oversight and judgment remain essential

**Other Limitations:**
- Brittleness: Performance degrades outside training distribution
- Lack of true understanding: Pattern matching vs genuine comprehension
- Resource intensive: Requires significant compute and energy
- Data dependency: Quality depends on training data quality

### 1.4 The AI Supply Chain

**Understanding the AI Ecosystem:**

**Layer 1: Compute Infrastructure**
- **GPUs (Graphics Processing Units):** Specialized hardware for AI training and inference
- **Data Centers:** Physical infrastructure hosting AI systems
- **Cloud Providers:** AWS, Azure, GCP providing AI infrastructure
- **Governance Consideration:** Concentration risk, dependency on few providers

**Layer 2: Data**
- **Training Data:** Datasets used to train models
- **Data Collection:** Sources and methods of data gathering
- **Data Quality:** Accuracy, completeness, representativeness
- **Governance Consideration:** Data privacy, bias, quality assurance

**Layer 3: Model Development**
- **Model Developers:** Organizations creating AI models (OpenAI, Anthropic, Google, etc.)
- **Training Process:** How models are developed and trained
- **Model Architecture:** Technical design of AI systems
- **Governance Consideration:** Transparency, accountability, safety standards

**Layer 4: Model Deployment**
- **Deployers:** Organizations using AI models in applications
- **Integration:** How models are integrated into systems
- **Monitoring:** Ongoing assessment and oversight
- **Governance Consideration:** Risk management, compliance, accountability

**Layer 5: End Users**
- **Public Sector:** Government departments and agencies
- **Financial Sector:** Banks, insurers, financial services
- **Citizens:** End users affected by AI systems
- **Governance Consideration:** Impact, fairness, accessibility

**Supply Chain Risks:**
- **Concentration Risk:** Dependency on few providers
- **Vendor Lock-in:** Difficulty switching providers
- **Transparency Gaps:** Limited visibility into supply chain
- **Security Vulnerabilities:** Risks at any layer affect the whole chain

## Key Takeaways

1. **AI is not monolithic:** Different types require different governance approaches
2. **Technical understanding is essential:** Cannot govern what you don't understand
3. **Limitations are real:** Hallucination, bias, and lack of reasoning are fundamental constraints
4. **Supply chain matters:** Governance must consider the entire ecosystem, not just end use

## Reflection Questions

1. How would you explain the difference between foundation models, agentic AI, and narrow AI to a non-technical minister?
2. What are the governance implications of hallucination in AI systems used for public decision-making?
3. How does bias replication in AI systems affect public sector equity and fairness?
4. What are the risks of concentration in the AI supply chain, and how would you mitigate them?
