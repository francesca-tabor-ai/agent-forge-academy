---
title: "Foundations of Large Language Models (LLMs)"
module: "Module 1"
week: 1
order: 1
description: "Understanding the prediction engine, tokenization, output configuration, and the Little Red Riding Hood Principle"
---

# Module 1: Foundations of Large Language Models (LLMs)

## Introduction

Before you can effectively engineer prompts, you need to understand how Large Language Models actually work. This module provides the foundational knowledge that will inform all your future prompting decisions.

## Learning Objectives

- Understand LLMs as prediction engines
- Master tokenization and context window limitations
- Configure output parameters for desired results
- Apply the Little Red Riding Hood Principle for stable completions

---

## Understanding the Prediction Engine

### What is a Prediction Engine?

Large Language Models are fundamentally **prediction engines**. They don't "think" or "understand" in the human sense—they predict the next most likely token (word or sub-word unit) based on patterns learned from training data.

### How Prediction Works

1. **Input Processing**: The model receives your prompt as a sequence of tokens
2. **Pattern Matching**: It searches its training data for similar patterns
3. **Probability Distribution**: For each possible next token, it calculates a probability
4. **Token Selection**: Based on sampling parameters, it selects the next token
5. **Iteration**: This process repeats until a stopping condition (end token, max length, etc.)

### Implications for Prompting

- **Pattern Recognition**: LLMs excel when prompts match common patterns in training data
- **Sequential Dependencies**: Each token depends on all previous tokens
- **Context Sensitivity**: The same word can have different meanings based on context
- **No True Understanding**: Models generate plausible text, not necessarily correct information

### Practical Example

```
Poor Prompt:
"Tell me about AI"

Better Prompt:
"Explain how artificial intelligence works, including its key components and applications."
```

The second prompt provides more context and matches common educational patterns in training data.

---

## Tokenisation and Limits

### What are Tokens?

Tokens are the fundamental units of text processing in LLMs. They can be:
- **Whole words**: "the", "cat"
- **Sub-words**: "un-" + "happiness" = "unhappiness"
- **Punctuation**: ".", "!", "?"
- **Special characters**: Spaces, newlines

### Tokenization Examples

Different models use different tokenizers:

- **GPT models**: ~4 characters per token on average
- **Longer words**: Often split into multiple tokens
- **Code**: Special tokenization for programming languages

### Context Window

The **context window** is the maximum number of tokens a model can process in a single interaction:

- **GPT-3.5**: 4,096 tokens (~3,000 words)
- **GPT-4**: 8,192 tokens (~6,000 words)
- **GPT-4 Turbo**: 128,000 tokens (~96,000 words)
- **Claude 3**: 200,000 tokens (~150,000 words)

### Impact on Model Memory

- **Input tokens**: Count against the context window
- **Output tokens**: Also count against the limit
- **System prompts**: Consume context space
- **Conversation history**: Must fit within limits

### Strategies for Managing Context

1. **Prioritize Essential Information**: Put critical context first
2. **Summarize Long Contexts**: Compress information when possible
3. **Use Retrieval**: For very long documents, use RAG (Retrieval Augmented Generation)
4. **Chunking**: Break long tasks into smaller pieces

### Practical Exercise

Estimate token counts:
- "Hello, how are you?" → ~5 tokens
- "The quick brown fox jumps over the lazy dog." → ~10 tokens
- A 500-word article → ~650-750 tokens

---

## Output Configuration

### Temperature: Controlling Randomness

**Temperature** controls the randomness of token selection:

- **Low Temperature (0.0-0.3)**: Deterministic, focused outputs
  - Use for: Factual answers, code generation, structured data
  - Example: `temperature=0.2` for medical diagnosis
  
- **Medium Temperature (0.5-0.7)**: Balanced creativity and coherence
  - Use for: Creative writing, brainstorming, general conversation
  - Example: `temperature=0.6` for blog posts
  
- **High Temperature (0.8-1.5)**: Highly creative, unpredictable
  - Use for: Poetry, creative fiction, idea generation
  - Example: `temperature=1.0` for creative stories

### Top-K Sampling

**Top-K** limits selection to the K most probable tokens:

- **Low K (10-20)**: More focused, less diverse
- **High K (50-100)**: More diverse, potentially less coherent
- **Common values**: K=40 or K=50

### Top-P (Nucleus Sampling)

**Top-P** selects from tokens whose cumulative probability exceeds P:

- **Low P (0.1-0.5)**: Narrow selection, focused outputs
- **Medium P (0.7-0.9)**: Balanced selection
- **High P (0.95-1.0)**: Broad selection, more diverse

### Combining Parameters

Best practices:
- **Factual tasks**: Low temperature (0.2), Top-P (0.9)
- **Creative tasks**: High temperature (0.8), Top-P (0.95)
- **Code generation**: Very low temperature (0.1), Top-P (0.9)

### Example Configuration

```python
# Factual Q&A
{
  "temperature": 0.2,
  "top_p": 0.9,
  "max_tokens": 500
}

# Creative writing
{
  "temperature": 0.8,
  "top_p": 0.95,
  "max_tokens": 1000
}

# Code generation
{
  "temperature": 0.1,
  "top_p": 0.9,
  "max_tokens": 2000
}
```

---

## The Little Red Riding Hood Principle

### The Principle

**Pattern your prompts after common training data motifs** to ensure stable, predictable completions.

### Why It Works

LLMs are trained on vast amounts of text that follow certain patterns:
- Educational content: "Explain X", "What is Y", "How does Z work"
- Story structures: Beginning, middle, end
- Technical documentation: Problem → Solution → Example
- Conversational patterns: Question → Answer → Follow-up

### Common Patterns to Leverage

1. **Educational Format**
   ```
   "Explain [concept] in simple terms, including:
   - Definition
   - Key components
   - Real-world examples"
   ```

2. **Problem-Solution Format**
   ```
   "Problem: [description]
   Solution: [approach]
   Implementation: [steps]"
   ```

3. **Comparison Format**
   ```
   "Compare [A] and [B] across:
   - Feature 1
   - Feature 2
   - Use cases"
   ```

4. **Step-by-Step Format**
   ```
   "To [achieve goal], follow these steps:
   1. [Step 1]
   2. [Step 2]
   3. [Step 3]"
   ```

### Anti-Patterns to Avoid

- **Overly unique formats**: Models struggle with novel structures
- **Ambiguous instructions**: Vague prompts lead to unpredictable outputs
- **Contradictory patterns**: Mixing formats confuses the model

### Practical Application

Instead of:
```
"AI stuff"
```

Use:
```
"Explain artificial intelligence, covering:
1. What it is
2. How it works
3. Key applications
4. Current limitations"
```

This matches common educational content patterns in training data.

---

## Module Summary

### Key Takeaways

1. **LLMs are prediction engines** - They predict next tokens based on training patterns
2. **Tokens are the currency** - Understand tokenization and context limits
3. **Output parameters matter** - Temperature, Top-K, and Top-P control behavior
4. **Pattern matching works** - Structure prompts like common training data

### Next Steps

- Practice estimating token counts for different texts
- Experiment with temperature settings for different tasks
- Rewrite prompts to match common educational patterns
- Move to Module 2 to learn structured prompting frameworks

---

## Exercises

1. **Token Estimation**: Estimate tokens for a 1,000-word article
2. **Temperature Tuning**: Generate the same prompt with temperatures 0.1, 0.5, and 1.0
3. **Pattern Matching**: Rewrite 5 prompts to match educational content patterns
4. **Context Management**: Design a strategy for a 50,000-word document with a 4,096 token limit
