---
title: "Module 3: How Large Language Models Actually Work (for Lawyers)"
description: "Understanding LLMs, their capabilities, limitations, and implications for legal reasoning"
module: "3"
order: 3
---

# Module 3: How Large Language Models Actually Work (for Lawyers)

**Duration:** Week 3  
**Learning Objectives:**
- **what LLMs are and are not Understanding**: Understand what LLMs are and are not
- **about tokens, context, embeddings, and temperature Understanding**: Learn about tokens, context, embeddings, and temperature
- **Recognize Hallucination,**: Recognize hallucination, brittleness, and uncertainty in LLMs
- **implications for legal reasoning and risk Understanding**: Understand implications for legal reasoning and risk
- **Make Informed**: Make informed decisions about LLM usage in legal systems

---

## 3.1 What LLMs Are and Are Not

### What LLMs Are

**Large Language Models (LLMs)** are:
- **Statistical pattern matchers:** They predict the next token based on patterns in training data
- **Text completion engines:** They generate text that follows learned patterns
- **Knowledge compressors:** They encode vast amounts of text data into neural network weights
- **Probabilistic systems:** They generate outputs with varying confidence

### What LLMs Are NOT

**LLMs are NOT:**
- **Databases:** They don't store facts reliably
- **Reasoning engines:** They simulate reasoning but don't truly reason
- **Truth-tellers:** They generate plausible text, not necessarily true information
- **Legal experts:** They don't have legal training or professional judgment
- **Deterministic:** Same input can produce different outputs

### The Fundamental Misconception

**Common Misconception:** "LLMs understand language and can reason like humans."

**Reality:** LLMs are sophisticated pattern matchers that generate text based on statistical patterns in training data. They can appear to understand and reason, but they're actually predicting what text should come next.

### Implications for Legal Use

**What This Means:**
- LLMs can generate legal-sounding text but may not be legally accurate
- They can cite cases that don't exist
- They can make logical errors
- They require verification and human oversight
- They're tools for augmentation, not replacement

---

## 3.2 Tokens, Context, Embeddings, and Temperature

### Tokens: The Building Blocks

**Tokens** are the basic units LLMs process:
- Words, parts of words, or punctuation
- Example: "legal" might be 1 token, "legalization" might be 2-3 tokens
- Models have token limits (e.g., GPT-4: 128K tokens)

**Token Limits Matter:**
- Input + output must fit within limit
- Longer documents require chunking
- Context window affects what the model "sees"
- Exceeding limits causes truncation

**For Legal Work:**
- Long contracts may exceed token limits
- Need strategies for handling large documents
- Chunking can lose context
- Consider document summarization

### Context: What the Model "Sees"

**Context Window:**
- The text the model considers when generating
- Includes: system prompt, user input, conversation history
- Larger context = more information but higher cost
- Context gets "forgotten" beyond the window

**Context Management:**
- Prioritize relevant information
- Use summaries for long documents
- Maintain conversation history strategically
- Clear context when switching topics

### Embeddings: Semantic Representations

**Embeddings** are:
- Vector representations of text meaning
- Capture semantic similarity
- Enable similarity search
- Used in RAG systems

**How Embeddings Work:**
- Text → Embedding vector (e.g., 1536 dimensions)
- Similar meaning → Similar vectors
- Can find semantically similar text
- Enables retrieval-augmented generation (RAG)

**For Legal Work:**
- Find similar cases or clauses
- Retrieve relevant legal documents
- Build knowledge bases
- Enable semantic search

### Temperature: Controlling Randomness

**Temperature** controls output randomness:
- **Low temperature (0-0.3):** More deterministic, focused outputs
- **Medium temperature (0.5-0.7):** Balanced creativity and consistency
- **High temperature (0.8-1.0):** More creative, varied outputs

**For Legal Work:**
- Use **low temperature** for:
  - Factual extraction
  - Consistent formatting
  - Reliable classifications
- Use **medium temperature** for:
  - Drafting variations
  - Creative problem-solving
  - Multiple options
- Avoid **high temperature** for:
  - Legal accuracy requirements
  - Citation generation
  - Risk assessment

---

## 3.3 Hallucination, Brittleness, and Uncertainty

### Hallucination: When LLMs Make Things Up

**Hallucination** occurs when LLMs:
- Generate false information confidently
- Create citations to non-existent sources
- Invent facts that seem plausible
- Mix real and fictional information

**Why Hallucination Happens:**
- Models predict likely text, not truth
- Training data may contain errors
- Models interpolate between training examples
- No built-in fact-checking mechanism

**Hallucination in Legal Context:**
- **Fake citations:** Cases that don't exist
- **Incorrect legal rules:** Plausible but wrong
- **Made-up facts:** Invented details
- **False precedents:** Non-existent case law

**Mitigation Strategies:**
- Always verify citations
- Use retrieval-augmented generation (RAG)
- Provide source documents
- Implement fact-checking workflows
- Human review for critical outputs

### Brittleness: When Small Changes Cause Big Problems

**Brittleness** means:
- Small input changes cause large output changes
- Model behavior is unpredictable
- Same task may fail on similar inputs
- Performance degrades on edge cases

**Examples of Brittleness:**
- Changing one word changes entire output
- Formatting changes break parsing
- Slight rephrasing causes different results
- Model fails on similar but not identical inputs

**For Legal Work:**
- Test with varied inputs
- Design robust prompts
- Handle edge cases explicitly
- Implement fallback mechanisms
- Don't assume consistent behavior

### Uncertainty: When Models Don't Know

**Uncertainty** in LLMs:
- Models don't express uncertainty well
- High confidence doesn't mean correctness
- Models may be wrong but sound confident
- No built-in "I don't know" mechanism

**Handling Uncertainty:**
- Don't trust confidence alone
- Design prompts to express uncertainty
- Use confidence thresholds
- Implement "I don't know" responses
- Escalate uncertain outputs

**For Legal Work:**
- Require confidence scores
- Design uncertainty handling
- Escalate low-confidence outputs
- Never assume certainty
- Always verify critical outputs

---

## 3.4 Implications for Legal Reasoning and Risk

### Legal Reasoning vs. LLM Text Generation

**Legal Reasoning Requires:**
- Understanding of law and precedent
- Application of rules to facts
- Logical consistency
- Professional judgment
- Ethical considerations

**LLM Text Generation Provides:**
- Pattern matching from training data
- Plausible-sounding text
- Statistical predictions
- No true understanding
- No professional judgment

### The Gap

**The Gap Between Legal Reasoning and LLM Output:**
- LLMs can't truly reason about law
- They simulate legal reasoning
- They may produce logically inconsistent outputs
- They lack professional judgment
- They don't understand ethical implications

### Risk Assessment

**High-Risk Uses:**
- Final legal advice without review
- Case outcome predictions
- Ethical decision-making
- Client relationship decisions
- Unsupervised document generation

**Medium-Risk Uses:**
- Draft generation with review
- Research assistance with verification
- Document analysis with oversight
- Template generation with editing
- Summarization with confirmation

**Low-Risk Uses:**
- Formatting and templating
- Data extraction with validation
- Initial research with verification
- Drafting assistance with review
- Administrative tasks

### Designing for Risk Mitigation

**Risk Mitigation Strategies:**
1. **Never fully automate high-risk tasks**
2. **Always verify critical outputs**
3. **Use RAG for factual accuracy**
4. **Implement human review checkpoints**
5. **Design for explainability**
6. **Monitor and audit system outputs**
7. **Plan for failure and errors**

---

## Lab 3: Experiment with LLM Parameters and Observe Legal Reasoning Outputs

### Objective

Experiment with different LLM parameters (temperature, prompts, context) and observe how they affect legal reasoning outputs, identifying risks and best practices.

### Instructions

1. **Set Up Experiment Environment**
   - Choose an LLM API (OpenAI, Anthropic, etc.)
   - Set up Python environment
   - Prepare test legal scenarios

2. **Experiment with Temperature**
   - Test same prompt with different temperatures (0.0, 0.3, 0.7, 1.0)
   - Observe output consistency
   - Note accuracy and creativity trade-offs
   - Document findings

3. **Experiment with Prompts**
   - Test different prompt styles:
     - Direct question
     - Role-based prompt
     - Chain-of-thought prompt
     - Few-shot examples
   - Compare outputs
   - Assess quality and accuracy

4. **Test for Hallucination**
   - Ask for legal citations
   - Request case law references
   - Check if citations are real
   - Document hallucination patterns

5. **Test for Brittleness**
   - Slightly modify inputs
   - Observe output changes
   - Test edge cases
   - Document brittleness patterns

6. **Analyze Results**
   - Compare outputs across parameters
   - Identify best practices
   - Document risks
   - Create recommendations

### Deliverables

- Experiment code and results
- Parameter comparison analysis
- Hallucination test results
- Brittleness test results
- Best practices document
- Risk assessment
- Lab report (5-10 pages)

### Evaluation Criteria

- **Experiment Design (25%):** Well-designed experiments
- **Analysis Quality (30%):** Thorough analysis of results
- **Risk Identification (25%):** Comprehensive risk assessment
- **Best Practices (20%):** Actionable recommendations

---

## Key Takeaways

- **LLMs are statistical pattern matchers, not reasoning engines**: They generate plausible text based on training data patterns

- **Understanding tokens, context, embeddings, and temperature**: Is essential for effective LLM usage in legal systems

- **Hallucination, brittleness, and uncertainty**: Are inherent LLM limitations that must be addressed in legal applications

- **Legal reasoning and LLM text generation are fundamentally different**: LLMs simulate reasoning but don't truly reason

- **Risk mitigation is critical**: Design systems with appropriate safeguards, verification, and human oversight

---

## Additional Resources

### Reading
- "Attention Is All You Need" (Transformer paper)
- "Language Models are Few-Shot Learners" (GPT-3 paper)
- "Sparks of AGI" (GPT-4 analysis)
- Legal AI research papers

### Tools
- OpenAI API documentation
- Anthropic Claude API documentation
- LangChain documentation
- Embedding models (OpenAI, Cohere)

---

## Next Steps

- **Complete Lab**: Apply complete lab 3 in relevant contexts
- **Review Module**: Review Module 4: Prompting as Legal Interface Design
- **Join Course**: Join course discussion forum
- **Attend Office**: Attend office hours if you have questions

---

**Module 3 Complete. Ready for Module 4? → [Module 4: Prompting as Legal Interface Design](Module_04_Prompting_as_Legal_Interface_Design.md)**
