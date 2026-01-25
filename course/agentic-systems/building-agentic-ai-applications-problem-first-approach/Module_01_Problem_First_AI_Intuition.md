---
title: "Module 1: Develop a Problem-First AI Intuition For Enterprise Use Cases"
description: "Identify where agentic AI can add value by reframing business challenges through a systems lens"
module: "1"
order: 1
---

# Module 1: Develop a Problem-First AI Intuition For Enterprise Use Cases

**Duration:** Week 1  
**Learning Objectives:**
- Identify where agentic AI can add value by reframing business challenges through a systems lens
- Understand why traditional software assumptions fail in AI-driven environments
- Evaluate tradeoffs between model choices, latency, performance and cost
- Develop a framework for making AI technology decisions based on business constraints

---

## 1.1 The Problem-First Mindset

### Why Start with Problems, Not Tools?

Traditional AI education often follows this pattern:
1. Learn about a tool (e.g., "RAG is cool!")
2. Find a problem to apply it to
3. Build something that uses the tool

This approach leads to:
- Solutions looking for problems
- Over-engineering with unnecessary complexity
- Poor fit between technology and business needs
- Wasted resources on tools that don't solve real problems

**The Problem-First Approach:**
1. Understand the business problem deeply
2. Identify constraints and success criteria
3. Evaluate which tools (if any) solve the problem
4. Build the minimal viable solution
5. Iterate based on outcomes

### The Systems Lens

When we say "reframing business challenges through a systems lens," we mean:

**Traditional View:**
- "We need a chatbot for customer support"
- "Let's add AI to our product"
- "We should use LLMs for everything"

**Systems Lens:**
- "What are the failure modes in our customer support process?"
- "Where do humans struggle that AI could help?"
- "What are the constraints (cost, latency, accuracy, compliance)?"
- "How do we measure success?"
- "What happens when the system fails?"

---

## 1.2 Identifying Where Agentic AI Adds Value

### When Agentic AI Makes Sense

Agentic AI (systems that can plan, use tools, and make decisions) is powerful but expensive and complex. Use it when:

#### ✅ Good Fit Scenarios

**1. Multi-Step Problem Solving**
- Problem requires multiple sequential decisions
- Each step depends on previous outcomes
- Example: Customer support that needs to query databases, check policies, and generate responses

**2. Dynamic Information Needs**
- Information requirements change based on context
- Need to retrieve different data at different stages
- Example: Research assistant that needs different sources for different questions

**3. Tool Integration Requirements**
- Need to interact with multiple external systems
- Actions depend on real-time data
- Example: Sales agent that checks inventory, calculates pricing, and updates CRM

**4. Adaptive Behavior**
- System needs to adjust strategy based on feedback
- Different approaches for different scenarios
- Example: Content moderation that escalates based on confidence scores

#### ❌ Poor Fit Scenarios

**1. Simple Q&A**
- Single-turn questions with straightforward answers
- Static knowledge base
- **Better fit:** Traditional RAG or fine-tuned model

**2. Deterministic Workflows**
- Fixed sequence of steps
- No decision-making required
- **Better fit:** Traditional automation or rule-based systems

**3. High-Volume, Low-Latency Needs**
- Need sub-second responses
- High throughput requirements
- **Better fit:** Cached responses or simpler models

**4. Well-Defined, Narrow Tasks**
- Clear input/output mapping
- No ambiguity
- **Better fit:** Fine-tuned models or traditional ML

### The Value Assessment Framework

Before building an agentic system, ask:

1. **Problem Complexity**
   - Does this require multi-step reasoning?
   - Are there multiple valid approaches?
   - Does the solution path depend on context?

2. **Information Dynamism**
   - Do information needs change during problem-solving?
   - Is real-time data required?
   - Do we need to query multiple sources?

3. **Decision Requirements**
   - Are there multiple decision points?
   - Do decisions depend on previous outcomes?
   - Is adaptive behavior needed?

4. **Business Constraints**
   - What's the acceptable latency?
   - What's the cost budget?
   - What accuracy is required?
   - What are compliance requirements?

5. **Failure Modes**
   - What happens when the system fails?
   - Can we detect failures?
   - What's the fallback strategy?

---

## 1.3 Why Traditional Software Assumptions Fail

### Deterministic vs. Probabilistic Systems

**Traditional Software:**
```
Input → Function → Output
- Same input always produces same output
- Errors are bugs, not features
- Can test exhaustively
- Predictable performance
```

**AI Systems:**
```
Input → Model → Probabilistic Output
- Same input can produce different outputs
- Errors are inherent (hallucinations, reasoning failures)
- Cannot test exhaustively
- Performance varies with context
```

### Key Differences

#### 1. Error Handling

**Traditional:**
```python
def calculate_total(items):
    return sum(item.price for item in items)
    # Always returns the same result for same input
    # Errors are exceptions (e.g., missing price attribute)
```

**AI:**
```python
def generate_summary(text):
    response = llm.generate(text)
    # May hallucinate facts
    # May miss important information
    # May produce different summaries for same text
    # Errors are probabilistic, not deterministic
```

#### 2. Testing

**Traditional:**
- Unit tests with expected outputs
- Integration tests with known results
- Can achieve 100% coverage

**AI:**
- Cannot test all inputs
- Outputs are probabilistic
- Need statistical evaluation
- Focus on failure modes, not correctness

#### 3. Performance

**Traditional:**
- Predictable latency
- Deterministic resource usage
- Can optimize precisely

**AI:**
- Variable latency (depends on model, context length)
- Non-deterministic resource usage
- Optimization is statistical

#### 4. Debugging

**Traditional:**
- Can trace execution path
- Can reproduce bugs
- Can fix root causes

**AI:**
- Cannot trace "reasoning" path
- Difficult to reproduce issues
- Fixes are often heuristics

### Implications for System Design

1. **Build for Failure**
   - Assume the system will make mistakes
   - Design fallback mechanisms
   - Implement monitoring and alerting

2. **Evaluate, Don't Test**
   - Use statistical evaluation
   - Measure failure rates
   - Track performance over time

3. **Design for Uncertainty**
   - Provide confidence scores
   - Allow human oversight
   - Build in verification steps

4. **Optimize for Outcomes**
   - Measure business metrics, not technical metrics
   - Optimize for user satisfaction
   - Balance accuracy, latency, and cost

---

## 1.4 Evaluating Tradeoffs: Model Choices, Latency, Performance, and Cost

### The Tradeoff Triangle

Every AI system balances three competing concerns:

```
        Performance
           /\
          /  \
         /    \
        /      \
       /________\
    Cost      Latency
```

You can optimize for two, but rarely all three.

### Model Choice Tradeoffs

#### Reasoning Models (Claude Sonnet, GPT-4, etc.)

**Pros:**
- Better at complex reasoning
- Can follow multi-step instructions
- Better at tool use
- More reliable for agentic systems

**Cons:**
- Higher cost ($0.003-$0.015 per 1K tokens)
- Higher latency (1-5 seconds)
- More complex to optimize

**When to Use:**
- Multi-step problem solving
- Tool use required
- Complex reasoning needed
- Accuracy is critical

#### Non-Reasoning Models (GPT-3.5, Claude Haiku, etc.)

**Pros:**
- Lower cost ($0.0005-$0.002 per 1K tokens)
- Lower latency (0.5-2 seconds)
- Good for simple tasks
- Easier to optimize

**Cons:**
- Limited reasoning capability
- Less reliable for complex tasks
- Poor tool use
- More prone to errors

**When to Use:**
- Simple Q&A
- Text generation
- Classification tasks
- High-volume, low-stakes scenarios

### Latency Considerations

**Sub-second (< 1s):**
- Real-time interactions
- User-facing applications
- High-frequency use cases
- **Approach:** Caching, simpler models, pre-computation

**Near-real-time (1-5s):**
- Most agentic systems
- Multi-step reasoning
- Tool integration
- **Approach:** Optimize prompt length, parallel processing

**Batch (5s+):**
- Background processing
- Non-interactive tasks
- Complex analysis
- **Approach:** Can use more complex models, longer contexts

### Performance Metrics

**Accuracy:**
- Task-specific metrics (F1, precision, recall)
- Human evaluation
- Business outcome metrics

**Reliability:**
- Failure rate
- Consistency (same input → similar output)
- Robustness (handles edge cases)

**User Satisfaction:**
- Task completion rate
- User ratings
- Time to resolution

### Cost Analysis

**Cost Components:**
1. **Model API Costs**
   - Input tokens × input price
   - Output tokens × output price
   - Usually: output > input

2. **Infrastructure Costs**
   - Vector database
   - Memory/storage
   - Compute for processing

3. **Development Costs**
   - Engineering time
   - Evaluation and iteration
   - Maintenance

**Cost Optimization Strategies:**
- Use cheaper models when possible
- Cache common queries
- Optimize prompt length
- Batch processing
- Use fine-tuned models for specific tasks

### Decision Framework

For each use case, evaluate:

1. **What's the acceptable latency?**
   - Real-time: < 1s → simpler models, caching
   - Interactive: 1-5s → reasoning models OK
   - Batch: > 5s → can use complex models

2. **What accuracy is required?**
   - Critical: 95%+ → reasoning models, evaluation
   - Important: 80-95% → reasoning models, some evaluation
   - Nice-to-have: < 80% → simpler models

3. **What's the cost budget?**
   - High budget: Use best models
   - Medium budget: Optimize prompts, cache
   - Low budget: Simpler models, batch processing

4. **What are the failure consequences?**
   - High: Extensive evaluation, fallbacks
   - Medium: Evaluation, monitoring
   - Low: Basic monitoring

---

## 1.5 Case Study: Customer Support Agent

### Problem Statement

A SaaS company wants to improve customer support:
- Current: 24/7 human support, expensive
- Goal: Reduce cost while maintaining quality
- Constraint: Must maintain < 2 minute response time

### Problem-First Analysis

**Step 1: Understand the Problem**
- What types of questions do customers ask?
- What information do support agents need?
- What are common failure modes?
- What's the escalation process?

**Step 2: Identify Constraints**
- Latency: < 2 minutes (including thinking time)
- Accuracy: Must resolve 80%+ without escalation
- Cost: Must be cheaper than human support
- Compliance: Must handle PII correctly

**Step 3: Evaluate Solutions**

**Option A: Simple RAG**
- Pros: Fast, cheap, simple
- Cons: Can't handle multi-step questions, no tool use
- **Verdict:** Good for simple Q&A, not for complex issues

**Option B: Agentic System**
- Pros: Can handle complex questions, use tools, adapt
- Cons: Slower, more expensive, more complex
- **Verdict:** Good for complex issues, overkill for simple ones

**Option C: Hybrid Approach**
- Simple RAG for common questions
- Agentic system for complex questions
- Router to decide which to use
- **Verdict:** ✅ Best fit - balances cost, latency, and capability

**Step 4: Design the System**

```
User Query
    ↓
Router (classify complexity)
    ↓
    ├─ Simple → RAG System → Response (< 5s)
    └─ Complex → Agentic System → Response (< 2min)
        ├─ Query knowledge base
        ├─ Check customer account
        ├─ Generate response
        └─ Escalate if needed
```

**Step 5: Define Success Metrics**
- Resolution rate (target: 80%+)
- Average response time (target: < 2min)
- Cost per ticket (target: < $0.50)
- User satisfaction (target: 4.5/5)

---

## 1.6 Lab 1: Analyze a Business Problem and Design an AI Solution Architecture

### Objective

Apply the problem-first approach to a real business problem and design an appropriate AI solution.

### Instructions

1. **Choose a Business Problem**
   - Select a problem from your work, a case study, or a hypothetical scenario
   - Ensure it's complex enough to require AI (not solvable with simple automation)

2. **Complete the Problem Analysis**
   - Describe the problem in detail
   - Identify stakeholders and their needs
   - List current pain points and failure modes
   - Define success criteria

3. **Identify Constraints**
   - Latency requirements
   - Accuracy requirements
   - Cost constraints
   - Compliance/regulatory requirements
   - Technical constraints

4. **Evaluate Solution Options**
   - Consider at least 3 different approaches (e.g., simple RAG, agentic system, hybrid)
   - For each option, evaluate:
     - Fit for the problem
     - Latency implications
     - Cost implications
     - Complexity
     - Failure modes

5. **Design the Solution Architecture**
   - Choose the best approach (or hybrid)
   - Design the system architecture
   - Identify components needed
   - Define data flows
   - Specify evaluation metrics

6. **Document Your Design**
   - Write a 2-3 page design document
   - Include architecture diagrams
   - Justify your choices
   - Identify risks and mitigation strategies

### Deliverables

1. Problem analysis document
2. Solution architecture diagram
3. Technology choice justification
4. Evaluation plan

### Evaluation Criteria

- **Problem Understanding (25%):** Clear problem statement, identified constraints
- **Solution Evaluation (25%):** Considered multiple options, evaluated tradeoffs
- **Architecture Design (25%):** Appropriate for the problem, well-structured
- **Justification (25%):** Clear reasoning for choices, addresses constraints

---

## 1.7 Key Takeaways

1. **Start with problems, not tools** - Understand the business need before selecting technology

2. **Use a systems lens** - Consider the entire system, not just the AI component

3. **Agentic AI is powerful but expensive** - Use it when you need multi-step reasoning, tool use, or adaptive behavior

4. **Traditional software assumptions fail** - AI systems are probabilistic, not deterministic

5. **Evaluate tradeoffs systematically** - Balance performance, latency, and cost based on business constraints

6. **Design for failure** - Assume mistakes will happen and build accordingly

---

## 1.8 Additional Resources

### Reading
- "The AI Engineer's Handbook" - Problem-first AI development
- "Building Production-Ready AI Systems" - Tradeoff analysis
- Case studies from leading AI companies

### Tools
- Cost calculators for different models
- Latency benchmarking tools
- Architecture diagram templates

### Next Steps
- Complete Lab 1
- Review Module 2 preview (Evals-Driven Mindset)
- Join office hours to discuss your problem analysis

---

**Next Module:** [Module 2: Build an Evals Driven Mindset & Iterative Design →](Module_02_Evals_Driven_Mindset.md)
