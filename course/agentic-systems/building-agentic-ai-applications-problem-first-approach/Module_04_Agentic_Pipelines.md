---
title: "Module 4: Build and Optimize Agentic Pipelines"
description: "Integrate retrieval, memory, and self-reflective behavior in agentic systems"
module: "4"
order: 4
---

# Module 4: Build and Optimize Agentic Pipelines

**Duration:** Week 4  
**Learning Objectives:**
- Integrate retrieval, memory, and self-reflective behavior in agentic systems
- Balance tradeoffs between accuracy, latency, and adaptability in agentic systems
- Analyze multi-agent coordination patterns and challenges & learn about protocols like MCP/A2A
- Build production-ready agentic pipelines that solve real business problems

---

## 4.1 Building Agentic Pipelines

### What Is an Agentic Pipeline?

An agentic pipeline is a system where an AI agent:
1. **Plans** - Decides what to do
2. **Acts** - Uses tools to gather information or perform actions
3. **Reflects** - Evaluates its progress and adjusts
4. **Iterates** - Repeats until goal is achieved

**Key Components:**
- LLM (reasoning engine)
- Memory (conversation history, context)
- Tools (retrieval, APIs, functions)
- Planning/reflection mechanisms

### Pipeline Architecture

```
User Query
    ↓
Agent (LLM + Memory)
    ↓
Planning: What should I do?
    ↓
Action: Use tools (RAG, APIs, etc.)
    ↓
Reflection: Did that work? What next?
    ↓
    ├─ Goal achieved → Response
    └─ More work needed → Plan again
```

---

## 4.2 Integrating Retrieval (RAG)

### Why RAG in Agentic Systems?

**Traditional RAG:**
- Single retrieval step
- Static context
- No adaptation

**Agentic RAG:**
- Multiple retrieval steps
- Adaptive retrieval based on context
- Self-correcting retrieval

### Agentic RAG Patterns

#### 1. Iterative Retrieval

**Pattern:**
```
1. Initial query → Retrieve documents
2. Analyze retrieved docs → Identify gaps
3. Refine query → Retrieve more
4. Repeat until sufficient information
```

**Example: Research Assistant**
```
Query: "What are the best practices for AI safety?"
Step 1: Retrieve general AI safety docs
Step 2: Identify need for specific techniques
Step 3: Query: "AI safety techniques: adversarial training"
Step 4: Retrieve specific techniques
Step 5: Synthesize findings
```

#### 2. Query Decomposition

**Pattern:**
```
1. Decompose complex query into sub-queries
2. Retrieve for each sub-query
3. Synthesize results
```

**Example:**
```
Query: "Compare GPT-4 and Claude for customer support"
Sub-queries:
- "GPT-4 capabilities customer support"
- "Claude capabilities customer support"
- "GPT-4 vs Claude comparison"
Retrieve for each, then synthesize
```

#### 3. Self-Correcting RAG

**Pattern:**
```
1. Retrieve and generate answer
2. Verify answer against retrieved docs
3. If inconsistencies → Retrieve more
4. Regenerate answer
```

**Example:**
```
Query: "What is the refund policy?"
Step 1: Retrieve policy docs, generate answer
Step 2: Check: Does answer match policy docs?
Step 3: If mismatch → Retrieve more specific docs
Step 4: Regenerate answer
```

### RAG Integration Best Practices

1. **Use retrieval strategically**
   - Don't retrieve everything upfront
   - Retrieve based on need
   - Iterate based on gaps

2. **Optimize retrieval quality**
   - Good chunking strategy
   - Appropriate embedding model
   - Effective reranking

3. **Handle retrieval failures**
   - What if nothing retrieved?
   - What if wrong docs retrieved?
   - Fallback strategies

---

## 4.3 Memory Systems

### Why Memory Matters

**Without Memory:**
- Each turn is independent
- Can't reference previous conversation
- Can't learn from context
- Repetitive and inefficient

**With Memory:**
- Maintains conversation context
- References previous interactions
- Learns user preferences
- More efficient and natural

### Memory Types

#### 1. Short-Term Memory (Conversation History)

**What:** Recent conversation turns

**Storage:**
- In-memory (for session)
- Limited to context window
- Usually last N turns

**Use Cases:**
- Maintaining conversation flow
- Referencing recent information
- Context for current turn

**Implementation:**
```python
conversation_history = [
    {"role": "user", "content": "What's the weather?"},
    {"role": "assistant", "content": "It's sunny, 72°F"},
    {"role": "user", "content": "What about tomorrow?"}
]
# Agent uses history to understand "tomorrow" refers to weather
```

#### 2. Long-Term Memory (Persistent Storage)

**What:** Information that persists across sessions

**Storage:**
- Database (PostgreSQL, MongoDB)
- Vector database
- Key-value store

**Use Cases:**
- User preferences
- Past interactions
- Learned information
- User data

**Implementation:**
```python
# Store in database
user_preferences = {
    "user_id": "123",
    "preferences": {"language": "en", "timezone": "PST"},
    "past_interactions": [...]
}
```

#### 3. Semantic Memory (Vector Storage)

**What:** Information stored as embeddings for semantic search

**Storage:**
- Vector database (Pinecone, Qdrant, Weaviate)
- Enables semantic retrieval

**Use Cases:**
- Finding similar past interactions
- Retrieving relevant context
- Building knowledge base

**Implementation:**
```python
# Store embeddings
memory_vectors = vector_db.store(
    text="User prefers email notifications",
    embedding=embed("User prefers email notifications"),
    metadata={"user_id": "123", "type": "preference"}
)

# Retrieve semantically similar
similar = vector_db.query(
    embedding=embed("notification settings"),
    top_k=5
)
```

### Memory Architecture

**Hybrid Approach:**
```
Short-term: Conversation history (in-memory)
    ↓
Long-term: User data, preferences (database)
    ↓
Semantic: Past interactions, knowledge (vector DB)
    ↓
Agent uses all three for context
```

### Memory Best Practices

1. **Choose right storage**
   - Short-term: In-memory (fast, limited)
   - Long-term: Database (persistent, structured)
   - Semantic: Vector DB (flexible, searchable)

2. **Manage memory size**
   - Don't store everything
   - Summarize old conversations
   - Prune irrelevant information

3. **Respect privacy**
   - Don't store sensitive data unnecessarily
   - Implement data retention policies
   - Allow users to delete data

---

## 4.4 Self-Reflective Behavior

### What Is Self-Reflection?

The ability of an agent to:
- Evaluate its own performance
- Identify mistakes
- Adjust its approach
- Learn from failures

### Reflection Patterns

#### 1. Step-by-Step Reflection

**Pattern:**
```
After each action:
1. Evaluate: Did this work?
2. Analyze: What went well/badly?
3. Adjust: What should I do differently?
4. Continue with adjusted approach
```

**Example:**
```
Action: Retrieved 5 documents about AI safety
Reflection: 
- Good: Retrieved relevant docs
- Issue: Missing information on adversarial training
- Adjustment: Query specifically for adversarial training
Next: Retrieve more specific docs
```

#### 2. Final Reflection

**Pattern:**
```
After completing task:
1. Review entire process
2. Identify what worked
3. Identify what didn't
4. Generate summary/lessons
```

**Example:**
```
Task: Answered customer question about refund policy
Reflection:
- Successfully retrieved policy document
- Correctly interpreted policy
- Provided accurate answer
- Could improve: Response was too verbose
```

#### 3. Error-Driven Reflection

**Pattern:**
```
When error occurs:
1. Identify error
2. Analyze cause
3. Determine fix
4. Retry with fix
```

**Example:**
```
Error: Tool call failed (invalid parameters)
Reflection:
- Cause: Misunderstood tool API
- Fix: Check tool documentation, correct parameters
- Retry: Call tool with correct parameters
```

### Implementing Reflection

**Prompt Pattern:**
```
You are an AI agent. After each action, reflect on:
1. Did this action achieve its goal?
2. What information did I gain?
3. What should I do next?
4. Are there any issues to address?

Previous Action: {action}
Result: {result}

Reflect and decide next step.
```

**Code Pattern:**
```python
def reflect(agent_state, action, result):
    reflection_prompt = f"""
    Action: {action}
    Result: {result}
    Goal: {agent_state.goal}
    
    Reflect: Did this help achieve the goal? What next?
    """
    reflection = llm.generate(reflection_prompt)
    return parse_reflection(reflection)
```

### Reflection Best Practices

1. **Reflect strategically**
   - Not after every tiny action
   - After significant steps
   - When errors occur

2. **Use reflection to guide actions**
   - Don't just reflect, act on reflection
   - Adjust strategy based on reflection
   - Learn from reflection

3. **Avoid infinite loops**
   - Limit reflection depth
   - Set max iterations
   - Detect circular reasoning

---

## 4.5 Balancing Tradeoffs: Accuracy, Latency, Adaptability

### The Tradeoff Triangle

```
        Accuracy
           /\
          /  \
         /    \
        /      \
       /________\
Adaptability  Latency
```

### Accuracy vs. Latency

**High Accuracy, High Latency:**
- Multiple retrieval steps
- Extensive reflection
- Complex reasoning
- **Use when:** Accuracy critical, latency acceptable

**Lower Accuracy, Low Latency:**
- Single retrieval step
- Minimal reflection
- Simple reasoning
- **Use when:** Speed critical, some errors acceptable

**Balanced Approach:**
- Adaptive: Start simple, escalate if needed
- Router: Simple queries → fast path, complex → slow path

### Accuracy vs. Adaptability

**High Accuracy, Low Adaptability:**
- Fixed workflow
- Deterministic steps
- **Use when:** Well-defined problems

**Lower Accuracy, High Adaptability:**
- Flexible workflow
- Adaptive steps
- **Use when:** Unpredictable problems

**Balanced Approach:**
- Structured but flexible
- Core workflow with adaptive elements

### Optimization Strategies

#### 1. Adaptive Complexity

**Pattern:**
```
Start simple → Evaluate → Escalate if needed
```

**Example:**
```
Query: "What's the weather?"
Step 1: Simple lookup (fast)
If fails → Step 2: Complex reasoning (slower, more accurate)
```

#### 2. Caching

**Pattern:**
```
Cache common queries/results
Check cache first → Use if found
Otherwise → Compute
```

**Example:**
```
Query: "What's your refund policy?"
Check cache → If found, return immediately
Otherwise → Retrieve and generate, then cache
```

#### 3. Parallel Processing

**Pattern:**
```
Run independent operations in parallel
Reduce total latency
```

**Example:**
```
Need to retrieve from 3 sources
Sequential: 3s + 3s + 3s = 9s
Parallel: max(3s, 3s, 3s) = 3s
```

#### 4. Early Termination

**Pattern:**
```
Stop when goal achieved
Don't continue unnecessary work
```

**Example:**
```
Goal: Find answer to question
Step 1: Retrieve docs → Found answer
Stop here, don't retrieve more
```

---

## 4.6 Multi-Agent Coordination

### Why Multi-Agent Systems?

**Single Agent Limitations:**
- Limited expertise
- Sequential processing
- Single point of failure

**Multi-Agent Benefits:**
- Specialized agents
- Parallel processing
- Redundancy
- Better problem-solving

### Multi-Agent Patterns

#### 1. Hierarchical (Manager-Worker)

**Pattern:**
```
Manager Agent
    ├─ Worker Agent 1 (specialized task)
    ├─ Worker Agent 2 (specialized task)
    └─ Worker Agent 3 (specialized task)
```

**Example: Customer Support**
```
Manager: Coordinates support request
    ├─ Retrieval Agent: Finds relevant information
    ├─ Policy Agent: Checks policies
    └─ Response Agent: Generates response
```

#### 2. Collaborative (Peer-to-Peer)

**Pattern:**
```
Agent 1 ↔ Agent 2 ↔ Agent 3
All agents communicate directly
```

**Example: Research Team**
```
Research Agent ↔ Analysis Agent ↔ Writing Agent
Each contributes, communicates directly
```

#### 3. Sequential Pipeline

**Pattern:**
```
Agent 1 → Agent 2 → Agent 3
Each agent processes output of previous
```

**Example: Content Pipeline**
```
Research Agent → Analysis Agent → Writing Agent → Review Agent
```

### Coordination Challenges

#### 1. Communication

**Problems:**
- How do agents communicate?
- What format for messages?
- How to handle failures?

**Solutions:**
- Standardized protocols (MCP, A2A)
- Message queues
- Error handling

#### 2. State Management

**Problems:**
- Shared state?
- Distributed state?
- Consistency?

**Solutions:**
- Shared memory/database
- Event sourcing
- Consensus mechanisms

#### 3. Conflict Resolution

**Problems:**
- Agents disagree?
- Conflicting actions?
- How to resolve?

**Solutions:**
- Voting mechanisms
- Priority systems
- Human oversight

#### 4. Resource Management

**Problems:**
- Multiple agents using same resources
- Rate limits
- Cost control

**Solutions:**
- Resource pools
- Rate limiting
- Cost tracking

---

## 4.7 Protocols: MCP and A2A

### Model Context Protocol (MCP)

**What:** Standardized protocol for agent communication and tool use.

**Key Features:**
- Tool discovery
- Standardized tool calls
- Context sharing
- Error handling

**Benefits:**
- Interoperability
- Standardization
- Easier integration
- Better debugging

**Example:**
```
Agent 1: "I need to search the database"
MCP: Discovers database tool
MCP: Calls tool with standardized format
MCP: Returns results in standard format
```

### Agent-to-Agent (A2A) Protocol

**What:** Protocol for direct agent-to-agent communication.

**Key Features:**
- Message passing
- Request/response patterns
- Error propagation
- State synchronization

**Benefits:**
- Direct communication
- Lower latency
- More flexible
- Better for peer-to-peer

**Example:**
```
Agent 1 → A2A Message → Agent 2
"Can you analyze this data?"
Agent 2 → A2A Response → Agent 1
"Analysis complete: [results]"
```

### Choosing a Protocol

**Use MCP When:**
- ✅ Tool integration needed
- ✅ Standardization important
- ✅ Interoperability required

**Use A2A When:**
- ✅ Direct agent communication
- ✅ Lower latency needed
- ✅ More flexibility required

**Use Both:**
- MCP for tools
- A2A for agent communication

---

## 4.8 Lab 4: Build a Multi-Agent System with Coordination Protocols

### Objective

Design and implement a multi-agent system that solves a business problem using coordination protocols.

### Instructions

1. **Choose a Problem**
   - Select a problem that benefits from multi-agent approach
   - Should require coordination
   - Should have clear success criteria

2. **Design Agent Architecture**
   - Identify agent roles
   - Define responsibilities
   - Design communication patterns
   - Choose coordination pattern (hierarchical, collaborative, sequential)

3. **Implement Agents**
   - Build individual agents
   - Implement agent capabilities
   - Add memory and reflection
   - Integrate tools

4. **Implement Coordination**
   - Choose protocol (MCP, A2A, or both)
   - Implement communication
   - Handle state management
   - Add error handling

5. **Add Evaluation**
   - Define success metrics
   - Create test cases
   - Evaluate system
   - Measure coordination effectiveness

6. **Optimize**
   - Identify bottlenecks
   - Optimize communication
   - Balance tradeoffs
   - Improve performance

7. **Document**
   - Document architecture
   - Explain design decisions
   - Document protocols used
   - Provide usage examples

### Deliverables

1. Multi-agent system code
2. Architecture documentation
3. Coordination protocol implementation
4. Evaluation results
5. Performance analysis
6. Documentation

### Evaluation Criteria

- **Architecture (25%):** Appropriate agent design, clear roles
- **Coordination (25%):** Effective communication, protocol usage
- **Functionality (25%):** Solves problem, meets success criteria
- **Quality (25%):** Code quality, error handling, documentation

---

## 4.9 Key Takeaways

1. **Build complete pipelines** - Integrate retrieval, memory, and reflection

2. **Use memory strategically** - Short-term, long-term, and semantic memory

3. **Implement reflection** - Self-evaluation and adaptation

4. **Balance tradeoffs** - Accuracy, latency, adaptability based on needs

5. **Coordinate agents effectively** - Use appropriate patterns and protocols

6. **Use standard protocols** - MCP for tools, A2A for communication

---

## 4.10 Additional Resources

### Reading
- "Building Agentic Systems" - Comprehensive guide
- "Multi-Agent Coordination" - Patterns and practices
- MCP and A2A protocol documentation

### Tools
- LangGraph (orchestration)
- AutoGen (multi-agent)
- CrewAI (collaborative agents)
- MCP SDKs

### Next Steps
- Complete Lab 4
- Review Capstone requirements
- Start planning capstone project
- Join office hours to discuss multi-agent systems

---

**Previous Module:** [Module 3: Prompt and Context Engineering ←](Module_03_Prompt_Context_Engineering.md)  
**Next Module:** [Capstone: Real-World Application →](Capstone_Real_World_Application.md)
