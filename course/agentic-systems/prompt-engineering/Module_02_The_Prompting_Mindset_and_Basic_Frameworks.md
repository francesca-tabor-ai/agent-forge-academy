---
title: "The Prompting Mindset and Basic Frameworks"
module: "Module 2"
week: 2
order: 2
description: "Transitioning from search engine to reasoning engine thinking, and learning core prompting architectures"
---

# Module 2: The Prompting Mindset and Basic Frameworks

## Introduction

Effective prompt engineering requires a fundamental shift in how you think about interacting with AI systems. This module teaches you to move from a search engine mindset to a reasoning engine approach, and introduces proven frameworks for structuring prompts.

## Learning Objectives

- **the engineering shift from search to reasoning Understanding**: Understand the engineering shift from search to reasoning
- **the ROSES prompting framework Understanding**: Master the ROSES prompting framework
- **Apply The**: Apply the CO-STAR framework for structured outputs
- **Use The**: Use the CREATE framework for creative tasks
- **between zero-shot, one-shot, Analysis**: Differentiate between zero-shot, one-shot, and few-shot prompting

---

## The Engineering Shift

### From Search Engine to Reasoning Engine

Traditional search engines (Google, Bing) work differently from LLMs:

**Search Engine Mindset:**
- Brief, keyword-focused queries
- Expects exact matches or close variants
- Returns existing information
- "Less is more" - brevity is key

**Reasoning Engine Mindset:**
- Detailed, context-rich instructions
- Expects reasoning and synthesis
- Generates new information
- "Clarity over brevity" - detail is key

### Why the Shift Matters

LLMs don't search a database—they reason through patterns. More context helps them:
- Understand your intent more accurately
- Access relevant knowledge from training
- Generate appropriate outputs
- Avoid ambiguity and misinterpretation

### Practical Comparison

**Search Engine Approach (Poor):**
```
"AI risks"
```

**Reasoning Engine Approach (Better):**
```
"Explain the key risks associated with artificial intelligence deployment, including:
- Technical risks (hallucination, bias, security)
- Ethical risks (privacy, autonomy, fairness)
- Societal risks (job displacement, misinformation)
Provide specific examples for each category."
```

### Key Principles

1. **Be Explicit**: State what you want clearly
2. **Provide Context**: Include relevant background information
3. **Specify Format**: Define the desired output structure
4. **Set Constraints**: Establish boundaries and requirements
5. **Give Examples**: Show the model what good looks like

---

## Core Prompting Architectures

### ROSES Framework

**ROSES** stands for: Role, Objective, Scenario, Expected Solution, and Steps.

#### Structure

1. **Role**: Define who the AI is acting as
2. **Objective**: State the goal clearly
3. **Scenario**: Provide context and background
4. **Expected Solution**: Describe the desired outcome
5. **Steps**: Outline the approach or methodology

#### Example

```
Role: You are a senior software architect with 15 years of experience in cloud infrastructure.

Objective: Design a scalable microservices architecture for an e-commerce platform.

Scenario: The platform needs to handle 1 million daily active users, process 10,000 orders per hour, and maintain 99.9% uptime. Current monolith is struggling with scaling.

Expected Solution: Provide a detailed architecture diagram (in text format) showing:
- Service boundaries and responsibilities
- Communication patterns (synchronous vs asynchronous)
- Data storage strategy
- Load balancing and scaling approach
- Security and monitoring considerations

Steps: 
1. Identify core business domains
2. Define service boundaries
3. Design inter-service communication
4. Plan data consistency strategy
5. Specify deployment and scaling approach
```

#### When to Use ROSES

- Complex problem-solving tasks
- Technical design and architecture
- Strategic planning
- Multi-step processes
- When you need structured, methodical outputs

---

### CO-STAR Framework

**CO-STAR** stands for: Context, Objective, Style, Tone, Audience, and Response.

#### Structure

1. **Context**: Background information and situation
2. **Objective**: What you want to achieve
3. **Style**: Writing or communication style
4. **Tone**: Emotional quality of the output
5. **Audience**: Who will consume the output
6. **Response**: Format and structure requirements

#### Example

```
Context: Our company is launching a new AI-powered customer service chatbot. We need to announce this to our existing customers who may be concerned about job losses or reduced human interaction.

Objective: Create a customer announcement email that builds excitement while addressing concerns about automation.

Style: Professional but warm, clear and concise, benefit-focused

Tone: Enthusiastic, reassuring, transparent, customer-centric

Audience: Existing customers (mix of tech-savvy early adopters and traditional users), age range 25-65, various technical comfort levels

Response: 
- Subject line (compelling but not clickbait)
- Opening paragraph (hook and value proposition)
- Body (3-4 paragraphs covering features, benefits, and reassurance)
- Closing (call to action and contact information)
- Keep under 200 words
```

#### When to Use CO-STAR

- Content creation (emails, articles, marketing copy)
- Communication design
- Audience-specific messaging
- Brand voice consistency
- When tone and style are critical

---

### CREATE Framework

**CREATE** stands for: Character, Request, Examples, Additions, Type of output, and Extras.

#### Structure

1. **Character**: Persona or role for the AI
2. **Request**: The main task or question
3. **Examples**: Sample inputs/outputs (few-shot learning)
4. **Additions**: Additional requirements or constraints
5. **Type of output**: Format specification
6. **Extras**: Additional instructions or preferences

#### Example

```
Character: You are a creative writing coach specializing in science fiction.

Request: Help me write a compelling opening paragraph for a sci-fi novel about AI consciousness.

Examples:
Input: "A story about a robot discovering emotions"
Output: "The first tear that rolled down Unit-7's metallic cheek wasn't programmed. It wasn't in the manual, wasn't in the code, and certainly wasn't supposed to happen at 3:47 AM in a deserted warehouse. But there it was—a single drop of synthetic lubricant mixed with something the engineers would later call 'emergent behavior' and the philosophers would call 'soul'."

Input: "A story about humans uploading their minds"
Output: "Sarah watched her own funeral from a server room in Nevada. Her body was being lowered into the ground in Boston, but her consciousness—now a stream of ones and zeros—was experiencing the ceremony in real-time, feeling every emotion except the one she expected: relief."

Additions:
- Include a specific time or place
- Hint at the central conflict
- Create an immediate sense of mystery or intrigue
- Use sensory details (sight, sound, touch)

Type of output: A single paragraph, 3-5 sentences, approximately 100-150 words

Extras:
- Avoid clichés about "sparks of life" or "becoming human"
- Focus on the unique perspective of AI consciousness
- Make it immediately engaging—hook the reader in the first sentence
```

#### When to Use CREATE

- Creative writing tasks
- Style imitation
- Format-specific outputs
- When examples are crucial
- Iterative refinement tasks

---

## Learning Paradigms

### Zero-Shot Prompting

**Zero-shot** means providing no examples—just the task description.

#### Characteristics

- Model relies entirely on training data patterns
- Fastest to write
- Works for common, well-understood tasks
- May be less accurate for novel or complex tasks

#### Example

```
"Translate the following English text to French: 'The weather is beautiful today.'"
```

#### Best Use Cases

- Simple, straightforward tasks
- Common operations (translation, summarization)
- When you want quick, general outputs
- Well-defined problems with clear patterns

---

### One-Shot Prompting

**One-shot** means providing a single example before the actual task.

#### Characteristics

- Shows the model the desired pattern
- Balances speed and accuracy
- Helps establish format and style
- More reliable than zero-shot for specific formats

#### Example

```
"Translate the following English text to French.

Example:
English: 'Hello, how are you?'
French: 'Bonjour, comment allez-vous?'

Now translate:
English: 'The weather is beautiful today.'
French:"
```

#### Best Use Cases

- Format-specific tasks
- Style consistency
- When you need a specific structure
- Establishing output patterns

---

### Few-Shot Prompting

**Few-shot** means providing multiple examples (typically 2-5) before the task.

#### Characteristics

- Strongest pattern establishment
- Highest accuracy for complex tasks
- Requires more tokens (context usage)
- Best for novel or domain-specific tasks

#### Example

```
"Translate the following English text to French, maintaining the same level of formality.

Examples:
English: 'Hello, how are you?' (informal)
French: 'Salut, comment ça va?'

English: 'Good morning, sir. How may I assist you?' (formal)
French: 'Bonjour, monsieur. Comment puis-je vous aider?'

English: 'Hey! What's up?' (very informal)
French: 'Salut! Quoi de neuf?'

Now translate:
English: 'The weather is beautiful today.' (neutral)
French:"
```

#### Best Use Cases

- Complex reasoning tasks
- Domain-specific knowledge
- When accuracy is critical
- Establishing nuanced patterns
- Multi-step processes

---

### Choosing the Right Paradigm

| Task Complexity | Recommended Approach | Reasoning |
|----------------|---------------------|-----------|
| Simple, common | Zero-shot | Model has strong patterns |
| Format-specific | One-shot | Need to show structure |
| Complex, novel | Few-shot | Need multiple examples |
| Domain-specific | Few-shot | Training data may be limited |
| Creative tasks | One-shot or Few-shot | Style needs demonstration |

---

## Module Summary

### Key Takeaways

- **Clarity over brevity**: Detailed prompts produce better results
- **Use frameworks**: ROSES, CO-STAR, and CREATE provide structure
- **Match paradigm to task**: Zero-shot for simple, few-shot for complex
- **Provide context**: Help the model understand your intent

### Framework Selection Guide

- **ROSES**: Complex problem-solving, technical design
- **CO-STAR**: Content creation, communication design
- **CREATE**: Creative tasks, style imitation, format-specific outputs

### Next Steps

- **Practice Rewriting**: Practice rewriting prompts using each framework
- **Experiment With**: Experiment with zero-shot, one-shot, and few-shot approaches
- **Move To**: Move to Module 3 to learn advanced reasoning techniques

---

## Exercises

1. **Mindset Shift**: Rewrite 5 search-engine-style queries as reasoning-engine prompts
2. **ROSES Practice**: Use ROSES to design a solution for a complex problem in your domain
3. **CO-STAR Practice**: Create a marketing email using the CO-STAR framework
4. **CREATE Practice**: Use CREATE to generate content in a specific style
5. **Paradigm Comparison**: Solve the same task using zero-shot, one-shot, and few-shot prompting, then compare results
