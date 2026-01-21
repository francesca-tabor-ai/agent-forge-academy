---
title: "Module 2: The Agentic Architecture"
description: "Deep dive into the components and architecture of AI agents"
module: "2"
order: 2
---

# Module 2: The Agentic Architecture

**Duration:** Week 2  
**Learning Objectives:**
- **the four essential components of an AI agent Understanding**: Understand the four essential components of an AI agent
- **about specialized agent roles in RAG systems Understanding**: Learn about specialized agent roles in RAG systems
- **state management for conversational continuity Understanding**: Master state management for conversational continuity
- **your first agentic RAG Development**: Build your first agentic RAG system

---

## 2.1 Anatomy of an AI Agent

### The Four Essential Components

Every AI agent consists of four core components that work together to enable autonomous behavior:

```

           AI Agent Architecture         

 1. LLM Reasoning Engine                 
 2. Memory (Short-term & Long-term)      
 3. Planning (Reflection & Self-Critique)
 4. Tool Integration                     

```

#### Component 1: The LLM Reasoning Engine

**Purpose:**
The LLM serves as the agent's "brain" - processing information, making decisions, and generating responses.

**Functions:**
- **Reasoning:** Analyze problems and make decisions
- **Planning:** Break down complex tasks
- **Reflection:** Evaluate own outputs
- **Communication:** Generate natural language responses

**Key Capabilities:**
- Chain-of-thought reasoning
- Tool selection
- Response generation
- Error detection

**Example:**
```python
class ReasoningEngine:
    def __init__(self, llm):
        self.llm = llm
    
    def reason(self, context, query):
        prompt = f"""
        Context: {context}
        Query: {query}
        
        Analyze this query and determine:
        1. What information is needed?
        2. What tools should be used?
        3. What steps are required?
        """
        return self.llm.generate(prompt)
    
    def select_tool(self, available_tools, task):
        # Agent decides which tool to use
        reasoning = self.reason(task, available_tools)
        return self.parse_tool_selection(reasoning)
```

**Considerations:**
- Model selection (GPT-4, Claude, Llama)
- Temperature settings
- Token limits
- Cost optimization

#### Component 2: Memory Systems

**Purpose:**
Agents need memory to maintain context across interactions and learn from past experiences.

**Two Types of Memory:**

##### Short-Term Memory (Working Memory)

**Purpose:** Maintain context within a single conversation or task.

**Characteristics:**
- Episodic: Stores conversation history
- Limited capacity
- Fast access
- Session-scoped

**Implementation:**
```python
class ShortTermMemory:
    def __init__(self):
        self.conversation_history = []
        self.current_context = {}
    
    def add_message(self, role, content):
        self.conversation_history.append({
            "role": role,
            "content": content,
            "timestamp": time.now()
        })
    
    def get_recent_context(self, n=10):
        return self.conversation_history[-n:]
    
    def update_context(self, key, value):
        self.current_context[key] = value
```

**Use Cases:**
- Conversation continuity
- Multi-turn interactions
- Context window management
- Token optimization

##### Long-Term Memory (Persistent Memory)

**Purpose:** Store knowledge and experiences across sessions.

**Characteristics:**
- Semantic: Stores facts and relationships
- Persistent across sessions
- Searchable
- Can be updated

**Implementation:**
```python
class LongTermMemory:
    def __init__(self, vector_store):
        self.vector_store = vector_store
        self.knowledge_base = {}
    
    def store_fact(self, fact, metadata=None):
        embedding = self.embed(fact)
        self.vector_store.add(
            text=fact,
            embedding=embedding,
            metadata=metadata
        )
    
    def retrieve_relevant(self, query, k=5):
        return self.vector_store.similarity_search(query, k=k)
    
    def update_knowledge(self, old_fact, new_fact):
        # Update existing knowledge
        self.remove_fact(old_fact)
        self.store_fact(new_fact)
```

**Use Cases:**
- Knowledge base
- User preferences
- Past interactions
- Learned patterns

**Memory Architecture:**
```

      Memory Hierarchy               

  Long-Term Memory                   
   Knowledge Base (Vector Store)  
   User Profiles                  
   Historical Patterns             
                                     
  Short-Term Memory                  
   Conversation History            
   Current Context                 
   Working State                   

```

#### Component 3: Planning (Reflection & Self-Critique)

**Purpose:**
Agents need planning capabilities to break down complex tasks and reflect on their performance.

**Two Key Capabilities:**

##### Planning: Task Decomposition

**Purpose:** Break complex queries into manageable sub-tasks.

**Process:**
1. Analyze query complexity
2. Identify required steps
3. Determine dependencies
4. Create execution plan

**Example:**
```python
class Planner:
    def decompose(self, query):
        plan_prompt = f"""
        Break down this query into sub-tasks:
        Query: {query}
        
        Output format:
        1. Sub-task 1
        2. Sub-task 2
        3. ...
        """
        plan = self.llm.generate(plan_prompt)
        return self.parse_plan(plan)
    
    def create_execution_plan(self, sub_tasks):
        # Determine order and dependencies
        execution_order = []
        for task in sub_tasks:
            dependencies = self.identify_dependencies(task, sub_tasks)
            execution_order.append({
                "task": task,
                "dependencies": dependencies,
                "status": "pending"
            })
        return self.topological_sort(execution_order)
```

##### Reflection & Self-Critique

**Purpose:** Evaluate own outputs and identify improvements.

**Process:**
1. Generate initial response
2. Critique the response
3. Identify issues
4. Refine or regenerate

**Example:**
```python
class Reflector:
    def critique(self, response, query, context):
        critique_prompt = f"""
        Critique this response:
        Query: {query}
        Context: {context}
        Response: {response}
        
        Evaluate:
        1. Accuracy: Is the information correct?
        2. Completeness: Are all aspects addressed?
        3. Relevance: Is it relevant to the query?
        4. Clarity: Is it clear and well-structured?
        """
        critique = self.llm.generate(critique_prompt)
        return self.parse_critique(critique)
    
    def should_refine(self, critique):
        issues = critique.get("issues", [])
        return len(issues) > 0
    
    def refine(self, response, critique):
        refinement_prompt = f"""
        Original response: {response}
        Issues identified: {critique['issues']}
        
        Generate an improved response.
        """
        return self.llm.generate(refinement_prompt)
```

**Reflection Loop:**
```
Generate → Critique → Refine → Re-critique → Final
```

#### Component 4: Tool Integration

**Purpose:**
Agents need tools to interact with external systems and perform actions.

**Tool Types:**
- **Retrieval Tools:** Vector search, database queries
- **API Tools:** External services, web APIs
- **Computation Tools:** Calculators, code execution
- **Search Tools:** Web search, knowledge bases

**Implementation:**
```python
class ToolAgent:
    def __init__(self):
        self.tools = {
            "vector_search": VectorSearchTool(),
            "web_search": WebSearchTool(),
            "calculator": CalculatorTool(),
            "database_query": DatabaseTool()
        }
    
    def select_tool(self, task_description):
        # Agent decides which tool to use
        tool_selection = self.llm.generate(
            f"Task: {task_description}\n"
            f"Available tools: {list(self.tools.keys())}\n"
            f"Select the appropriate tool."
        )
        return self.parse_tool_selection(tool_selection)
    
    def execute(self, tool_name, parameters):
        tool = self.tools[tool_name]
        return tool.execute(parameters)
    
    def handle_error(self, tool_name, error):
        # Agent can retry with different parameters
        return self.retry_with_alternative(tool_name, error)
```

**Tool Execution Flow:**
```
Agent → Select Tool → Execute → Evaluate Result → 
  If Error → Retry/Alternative → Final Result
```

---

## 2.2 Specialised Agent Roles

### Functional Agents in RAG Systems

In agentic RAG systems, different agents specialize in specific functions. This specialization improves accuracy and efficiency.

#### The Planner Agent

**Role:** Task decomposition and orchestration

**Responsibilities:**
- Analyze query complexity
- Break down into sub-tasks
- Determine execution order
- Coordinate other agents

**Example:**
```python
class PlannerAgent:
    def plan(self, query):
        # Analyze complexity
        complexity = self.analyze_complexity(query)
        
        if complexity == "simple":
            return SimplePlan(query)
        elif complexity == "multi_hop":
            return MultiHopPlan(query)
        else:
            return ComplexPlan(query)
    
    def create_multi_hop_plan(self, query):
        # Example: "What are side effects of Drug X with Drug Y?"
        plan = {
            "steps": [
                {"task": "retrieve_drug_x_info", "agent": "retriever"},
                {"task": "retrieve_drug_y_info", "agent": "retriever"},
                {"task": "find_interactions", "agent": "retriever"},
                {"task": "synthesize_side_effects", "agent": "synthesizer"}
            ],
            "dependencies": {
                "synthesize_side_effects": ["retrieve_drug_x_info", 
                                           "retrieve_drug_y_info", 
                                           "find_interactions"]
            }
        }
        return plan
```

#### The Retriever Agent

**Role:** Adaptive search and retrieval

**Responsibilities:**
- Select retrieval strategy
- Execute searches
- Evaluate result quality
- Refine searches if needed

**Example:**
```python
class RetrieverAgent:
    def __init__(self):
        self.strategies = {
            "vector": VectorSearchStrategy(),
            "keyword": KeywordSearchStrategy(),
            "hybrid": HybridSearchStrategy(),
            "graph": GraphTraversalStrategy()
        }
    
    def retrieve(self, query, context=None):
        # Select strategy based on query
        strategy = self.select_strategy(query)
        
        # Execute retrieval
        results = strategy.search(query)
        
        # Evaluate quality
        quality = self.evaluate_results(results, query)
        
        if quality < self.threshold:
            # Refine search
            refined_query = self.refine_query(query, results)
            results = strategy.search(refined_query)
        
        return results
    
    def select_strategy(self, query):
        # Agent decides: vector, keyword, hybrid, or graph
        if self.is_factual_query(query):
            return "keyword"
        elif self.is_semantic_query(query):
            return "vector"
        elif self.requires_relationships(query):
            return "graph"
        else:
            return "hybrid"
```

#### The Verifier Agent

**Role:** Factual consistency and quality assurance

**Responsibilities:**
- Verify retrieved information
- Check factual consistency
- Validate sources
- Detect contradictions

**Example:**
```python
class VerifierAgent:
    def verify(self, response, sources, query):
        checks = {
            "factual_consistency": self.check_facts(response, sources),
            "source_attribution": self.check_attribution(response, sources),
            "completeness": self.check_completeness(response, query),
            "contradictions": self.detect_contradictions(response, sources)
        }
        
        return {
            "is_valid": all(checks.values()),
            "checks": checks,
            "issues": self.identify_issues(checks)
        }
    
    def check_facts(self, response, sources):
        # Extract claims from response
        claims = self.extract_claims(response)
        
        # Verify each claim against sources
        for claim in claims:
            if not self.find_support(claim, sources):
                return False
        return True
    
    def detect_contradictions(self, response, sources):
        # Check for contradictory information
        contradictions = []
        claims = self.extract_claims(response)
        
        for i, claim1 in enumerate(claims):
            for claim2 in claims[i+1:]:
                if self.are_contradictory(claim1, claim2):
                    contradictions.append((claim1, claim2))
        
        return contradictions
```

#### The Tool Agent

**Role:** API and database invocation

**Responsibilities:**
- Execute tool calls
- Handle errors
- Manage tool state
- Coordinate multiple tools

**Example:**
```python
class ToolAgent:
    def __init__(self):
        self.tools = {
            "web_search": WebSearchTool(),
            "calculator": CalculatorTool(),
            "database": DatabaseTool(),
            "api_client": APIClientTool()
        }
    
    def execute_tool_chain(self, tool_calls):
        results = []
        for tool_call in tool_calls:
            tool = self.tools[tool_call["tool"]]
            try:
                result = tool.execute(tool_call["parameters"])
                results.append({
                    "tool": tool_call["tool"],
                    "result": result,
                    "status": "success"
                })
            except Exception as e:
                # Handle error
                result = self.handle_error(tool_call, e)
                results.append({
                    "tool": tool_call["tool"],
                    "result": result,
                    "status": "error",
                    "error": str(e)
                })
        return results
```

---

## 2.3 State Management

### Maintaining Conversational Continuity

Agentic systems need robust state management to maintain context across interactions and manage complex workflows.

#### Episodic Memory

**Purpose:** Store conversation episodes for context.

**Implementation:**
```python
class EpisodicMemory:
    def __init__(self):
        self.episodes = []
        self.current_episode = None
    
    def start_episode(self, user_id, session_id):
        self.current_episode = {
            "user_id": user_id,
            "session_id": session_id,
            "start_time": time.now(),
            "messages": [],
            "state": {}
        }
    
    def add_message(self, role, content, metadata=None):
        if self.current_episode:
            self.current_episode["messages"].append({
                "role": role,
                "content": content,
                "timestamp": time.now(),
                "metadata": metadata or {}
            })
    
    def get_context(self, n_messages=10):
        if self.current_episode:
            return self.current_episode["messages"][-n_messages:]
        return []
    
    def update_state(self, key, value):
        if self.current_episode:
            self.current_episode["state"][key] = value
    
    def end_episode(self):
        if self.current_episode:
            self.episodes.append(self.current_episode)
            self.current_episode = None
```

#### State-Based Systems with LangGraph

**LangGraph** provides a powerful framework for managing agent state.

**Key Concepts:**
- **Nodes:** Agent actions
- **Edges:** Transitions between states
- **State:** Shared memory across nodes

**Example:**
```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class AgentState(TypedDict):
    query: str
    plan: list
    retrieved_docs: list
    response: str
    verification: dict
    errors: list

def create_agent_graph():
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("planner", planner_agent)
    workflow.add_node("retriever", retriever_agent)
    workflow.add_node("synthesizer", synthesizer_agent)
    workflow.add_node("verifier", verifier_agent)
    
    # Define edges
    workflow.set_entry_point("planner")
    workflow.add_edge("planner", "retriever")
    workflow.add_edge("retriever", "synthesizer")
    workflow.add_edge("synthesizer", "verifier")
    
    # Conditional edge from verifier
    workflow.add_conditional_edges(
        "verifier",
        should_refine,
        {
            "refine": "synthesizer",
            "complete": END
        }
    )
    
    return workflow.compile()
```

**State Flow:**
```
Query → Planner → Retriever → Synthesizer → Verifier
                                    ↑              ↓
                                     Refine 
```

#### Context Management Strategies

**1. Sliding Window:**
- Keep last N messages
- Efficient for long conversations
- May lose early context

**2. Summarization:**
- Summarize old messages
- Preserve key information
- Reduces token usage

**3. Hierarchical:**
- Short-term: Recent messages
- Long-term: Summaries
- Best of both worlds

**Example:**
```python
class HierarchicalContext:
    def __init__(self):
        self.short_term = []  # Last 10 messages
        self.long_term = []   # Summaries
    
    def add_message(self, message):
        self.short_term.append(message)
        
        # If short-term is full, summarize oldest
        if len(self.short_term) > 10:
            oldest = self.short_term.pop(0)
            summary = self.summarize(oldest)
            self.long_term.append(summary)
    
    def get_context(self):
        # Combine short-term and long-term
        context = {
            "recent": self.short_term,
            "summary": self.summarize_long_term()
        }
        return context
```

---

## Lab 2: Build a Basic Agentic RAG System

### Objective
Build a complete agentic RAG system with the four core components: reasoning engine, memory, planning, and tools.

### Tasks

1. **Implement Core Components**
   - LLM reasoning engine
   - Short-term and long-term memory
   - Basic planning capability
   - Tool integration (vector search)

2. **Create Specialized Agents**
   - Planner agent
   - Retriever agent
   - Verifier agent

3. **State Management**
   - Implement episodic memory
   - Use LangGraph for workflow

4. **Test System**
   - Test on sample queries
   - Evaluate performance

### Deliverables
- Complete agentic RAG system
- Documentation
- Test results

### Evaluation Criteria
- Component implementation (30%)
- Agent specialization (30%)
- State management (20%)
- System functionality (20%)

---

## Summary

**Key Takeaways:**

- **Four Components:**: LLM, Memory, Planning, Tools
- **Specialized Roles:**: Planner, Retriever, Verifier, Tool Agent
- **Memory Systems:**: Short-term (episodic) and long-term (semantic)
- **State Management:**: LangGraph for complex workflows
- **Planning & Reflection:**: Task decomposition and self-critique

**Next Steps:**
- **Module 3:**: Module 3: Learn design patterns and workflows
- **reflection and planning Implementation**: Implement reflection and planning patterns
- **collaborative multi-agent Development**: Build collaborative multi-agent systems

---

## Additional Resources

### Reading
- LangGraph documentation
- LangChain agent documentation
- Memory management best practices

### Tools
- LangGraph for state management
- LangChain for agent framework
- Vector stores for long-term memory

---

**Ready for Module 3? [Continue →](Module_03_Agentic_Design_and_Workflow_Patterns.md)**
