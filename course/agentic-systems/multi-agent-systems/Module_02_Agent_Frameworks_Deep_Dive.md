---
title: "Module 2: Agent Frameworks Deep Dive"
description: "Compare LangGraph, CrewAI, and AutoGen to choose the right framework"
module: "2"
order: 2
email_takeaway: "LangGraph excels at complex workflows, CrewAI simplifies role-based collaboration, and AutoGen enables conversational multi-agent systems."
email_action: "Pick one framework (LangGraph, CrewAI, or AutoGen) and install it—run their 'hello world' example in 5 minutes."
---

# Module 2: Agent Frameworks Deep Dive

**Duration:** Weeks 2-3  
**Learning Objectives:**
- **and select appropriate agent frameworks Evaluation**: Evaluate and select appropriate agent frameworks
- **LangGraph's graph-based orchestration Understanding**: Master LangGraph's graph-based orchestration
- **CrewAI's role-based collaboration Implementation**: Implement CrewAI's role-based collaboration
- **with AutoGen's conversational approach Development**: Build with AutoGen's conversational approach
- **emerging frameworks (OpenAI SDK, Microsoft, Google ADK) Analysis**: Compare emerging frameworks (OpenAI SDK, Microsoft, Google ADK)

---

## 2.1 Framework Selection Criteria

Choosing the right framework is critical for project success. Consider these factors:

### 1. Task Complexity and Workflow Structure

**Simple Linear Workflows:**
- Single agent with tools may suffice
- If multi-agent needed, use CrewAI for simplicity

**Complex Branching Logic:**
- LangGraph excels with conditional routing
- Explicit state management
- DAG visualization

**Conversational/Dynamic:**
- AutoGen for flexible role adaptation
- Message-passing architecture

### 2. Team Expertise and Learning Curve

**Framework Complexity Ranking:**
1. **Easiest:** CrewAI (role-based, intuitive)
2. **Moderate:** AutoGen (async requires understanding)
3. **Advanced:** LangGraph (graph theory, state machines)

**Time to First Deploy:**
- CrewAI: 1-2 days
- AutoGen: 2-4 days
- LangGraph: 3-7 days

### 3. Production Maturity Requirements

**Battle-Tested (Production-Ready):**
- LangGraph: Used by multiple enterprises
- CrewAI: Enterprise control plane available

**Emerging (Use with Caution):**
- OpenAI Agents SDK (March 2025 launch)
- Microsoft Agent Framework (October 2025)

### 4. Integration Requirements

**Model Support:**
- All frameworks: OpenAI, Anthropic, open-source
- Google ADK: Native Vertex AI, 200+ models
- Microsoft: Cross-cloud (Azure, AWS, GCP)

**Tool Ecosystems:**
- LangGraph: Full LangChain tool library
- MCP Support: Check framework documentation
- Custom Tools: All frameworks allow custom

### 5. Vendor Ecosystem Considerations

**Vendor Lock-In Risk:**
- Low: LangGraph, CrewAI, AutoGen (open-source cores)
- Medium: Google ADK (best with Vertex AI)
- Higher: Microsoft Framework (optimized for Azure)

**Consider:** Exit strategy, multi-cloud requirements

---

## 2.2 LangGraph - Graph-Based Orchestration

### Architecture Overview

LangGraph treats agent workflows as directed graphs with nodes (functions) and edges (transitions). This provides explicit control over execution flow.

**Core Concepts:**
```
Graph Components:
 Nodes: Agent steps or tool calls
 Edges: Connections with transition logic
 State: Persistent data across nodes
 Conditional Routing: Dynamic path selection
 Checkpoints: Save/restore points
```

### Key Features

#### 1. Stateful Execution

**State Management:**
```python
from langgraph.graph import StateGraph
from typing import TypedDict, Annotated
import operator

class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    next_action: str
    iteration_count: int
    results: dict

# State persists across all nodes
graph = StateGraph(AgentState)
```

#### 2. Node Definition

**Creating Nodes:**
```python
def research_node(state: AgentState):
    """Research agent node"""
    query = state["messages"][-1]
    results = search_tool.run(query)
    
    return {
        "messages": [f"Research results: {results}"],
        "results": {"research": results},
        "iteration_count": state["iteration_count"] + 1
    }

def analysis_node(state: AgentState):
    """Analysis agent node"""
    research_data = state["results"]["research"]
    analysis = analyze(research_data)
    
    return {
        "messages": [f"Analysis: {analysis}"],
        "results": {**state["results"], "analysis": analysis}
    }

# Add nodes to graph
graph.add_node("research", research_node)
graph.add_node("analysis", analysis_node)
```

#### 3. Conditional Routing

**Dynamic Edges:**
```python
def route_decision(state: AgentState) -> str:
    """Decide next node based on state"""
    if state["iteration_count"] > 5:
        return "end"
    
    if "error" in state.get("results", {}):
        return "retry"
    
    if needs_more_research(state):
        return "research"
    
    return "analysis"

# Add conditional edges
graph.add_conditional_edges(
    "research",
    route_decision,
    {
        "analysis": "analysis",
        "retry": "research",
        "end": END
    }
)
```

#### 4. Memory Systems

**LangGraph Memory Architecture:**
```python
from langgraph.checkpoint import MemorySaver

# In-thread memory (single conversation)
memory = MemorySaver()

# Configure graph with memory
graph = StateGraph(AgentState)
graph.add_node("agent", agent_node)
# ... add more nodes ...

# Compile with memory
app = graph.compile(checkpointer=memory)

# Execute with thread_id for persistence
config = {"configurable": {"thread_id": "conversation_123"}}
result = app.invoke(input_data, config)
```

**Cross-Thread Memory:**
```python
from langgraph.store import InMemoryStore

# Shared memory across conversations
store = InMemoryStore()

# Store data with namespace
store.put(
    namespace=("user", "user_123"),
    key="preferences",
    value={"theme": "dark", "language": "en"}
)

# Retrieve across threads
prefs = store.get(("user", "user_123"), "preferences")
```

### When to Use LangGraph

**Ideal Scenarios:**
- Complex workflows with branching logic
- Need explicit state management
- Debugging is critical
- Production reliability required
- Multi-step reasoning with loops
- Requires checkpoint/resume

**Example Use Cases:**
- Multi-stage data pipelines
- Iterative refinement workflows
- Research → Analysis → Writing → Review cycles
- Complex business process automation

### LangGraph Strengths

 **Fine-Grained Control:** Explicit routing and state  
 **Excellent Debugging:** LangGraph Studio visualization  
 **Production-Grade:** Used by enterprises  
 **Comprehensive Tooling:** Tracing, monitoring built-in  
 **LangChain Integration:** Full ecosystem access

### LangGraph Limitations

 **Steep Learning Curve:** Graph theory required  
 **Verbose Code:** More boilerplate than alternatives  
 **Setup Complexity:** Requires careful design  
 **State Management:** Can become complex with many agents

---

## 2.3 CrewAI - Role-Based Collaboration

### Architecture Overview

CrewAI uses an intuitive role-based model where agents behave like employees with specific responsibilities. Think of it as building an AI team.

**Core Concepts:**
```
CrewAI Components:
 Agent: Team member with role and expertise
 Task: Specific work to be done
 Crew: Team of agents working together
 Tools: Functions agents can use
 Process: Sequential or hierarchical execution
```

### Key Features

#### 1. Intuitive Agent Definition

**Creating Agents:**
```python
from crewai import Agent, Task, Crew
from langchain.tools import Tool

research_agent = Agent(
    role='Market Researcher',
    goal='Find comprehensive market data and trends',
    backstory="""You are an experienced market research analyst 
    with 10 years of experience in competitive intelligence.""",
    tools=[search_tool, scraping_tool],
    verbose=True,
    allow_delegation=False
)

writing_agent = Agent(
    role='Content Writer',
    goal='Create engaging and informative content',
    backstory="""You are a skilled writer who can transform 
    complex research into clear, compelling narratives.""",
    tools=[],  # No tools needed, uses LLM only
    verbose=True
)
```

#### 2. Task Definition

**Structured Tasks:**
```python
research_task = Task(
    description="""
    Research the top 3 competitors in the AI agent space:
    1. Find their key products and pricing
    2. Identify their unique value propositions
    3. Analyze their market positioning
    
    Deliverable: Structured report with findings
    """,
    agent=research_agent,
    expected_output="Detailed competitive analysis report"
)

writing_task = Task(
    description="""
    Based on the research findings, write a blog post 
    comparing our solution to competitors. 
    
    Requirements:
    - 800-1000 words
    - Highlight our advantages
    - Be factual and balanced
    """,
    agent=writing_agent,
    expected_output="Publication-ready blog post",
    context=[research_task]  # Depends on research
)
```

#### 3. Crew Assembly and Execution

**Sequential Process:**
```python
# Create crew with sequential execution
crew = Crew(
    agents=[research_agent, writing_agent],
    tasks=[research_task, writing_task],
    process=Process.sequential,  # One task at a time
    verbose=2  # Maximum verbosity
)

# Execute
result = crew.kickoff()
print(result)
```

**Hierarchical Process:**
```python
# Manager agent coordinates workers
manager = Agent(
    role='Project Manager',
    goal='Coordinate team to deliver high-quality output',
    backstory="Experienced PM with strong leadership",
    allow_delegation=True
)

crew = Crew(
    agents=[research_agent, writing_agent, manager],
    tasks=[research_task, writing_task],
    process=Process.hierarchical,
    manager_agent=manager  # Manager coordinates
)
```

#### 4. Built-In Memory

**Memory Types:**
```python
from crewai import Crew, Process

crew = Crew(
    agents=[agent1, agent2],
    tasks=[task1, task2],
    memory=True,  # Enable all memory types
    verbose=True
)

# Memory Layers:
# 1. Short-term: ChromaDB vector store (conversation context)
# 2. Long-term: SQLite (entity memory, facts)
# 3. Entity memory: Track people, concepts, relationships
```

### When to Use CrewAI

**Ideal Scenarios:**
- Clear role-based task division
- Need quick deployment
- Team collaboration metaphor fits
- Human-in-the-loop workflows
- Sequential or simple hierarchical processes

**Example Use Cases:**
- Content creation pipelines
- Research → Analysis → Report workflows
- Customer support (triage → specialist → resolution)
- Simple business process automation

### CrewAI Strengths

 **Intuitive Design:** Easy to understand and use  
 **Quick Deployment:** Fastest time-to-production  
 **Built-In Memory:** No setup required  
 **Enterprise Features:** Control plane available  
 **Active Community:** Growing ecosystem

### CrewAI Limitations

 **Logging Challenges:** Debug difficulties inside tasks  
 **Limited Flexibility:** Less control than LangGraph  
 **Scaling Complexity:** Large systems harder to manage  
 **Sequential Bias:** Parallel execution less natural

---

## 2.4 AutoGen - Conversational Multi-Agent

### Architecture Overview

AutoGen frames multi-agent systems as conversations between specialized agents. Each agent can play different roles and adapt dynamically.

**Core Concepts:**
```
AutoGen Components:
 ConversableAgent: Base agent class
 AssistantAgent: LLM-powered agent
 UserProxyAgent: Human-in-the-loop
 GroupChat: Multi-agent conversation
 Message Passing: Async agent communication
```

### Key Features

#### 1. Flexible Agent Types

**Creating Agents:**
```python
import autogen

config_list = [{"model": "gpt-4", "api_key": "..."}]

# LLM-powered assistant
assistant = autogen.AssistantAgent(
    name="Research_Assistant",
    llm_config={"config_list": config_list},
    system_message="""You are a research assistant. 
    Search for information and provide detailed findings."""
)

# Human proxy (can execute code)
user_proxy = autogen.UserProxyAgent(
    name="Human_User",
    human_input_mode="NEVER",  # Or "ALWAYS" for human input
    code_execution_config={"work_dir": "coding"}
)

# Custom agent with specific behavior
analyst = autogen.AssistantAgent(
    name="Data_Analyst",
    llm_config={"config_list": config_list},
    system_message="""You analyze data and create visualizations."""
)
```

#### 2. Contextual Memory

**Context Management:**
```python
class StatefulAgent(autogen.ConversableAgent):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.context_variables = {}
    
    def update_context(self, key, value):
        """Maintain conversation context"""
        self.context_variables[key] = value
    
    def get_context(self, key):
        """Retrieve context"""
        return self.context_variables.get(key)
```

#### 3. Group Chat Coordination

**Multi-Agent Conversations:**
```python
# Create group chat
groupchat = autogen.GroupChat(
    agents=[user_proxy, assistant, analyst],
    messages=[],
    max_round=10
)

# Manager coordinates the conversation
manager = autogen.GroupChatManager(
    groupchat=groupchat,
    llm_config={"config_list": config_list}
)

# Initiate conversation
user_proxy.initiate_chat(
    manager,
    message="Analyze customer churn in Q4 2024"
)
```

#### 4. Asynchronous Execution

**Non-Blocking Operations:**
```python
import asyncio

async def async_agent_workflow():
    """Parallel agent execution"""
    # Multiple agents work simultaneously
    tasks = [
        assistant.a_initiate_chat(user_proxy, message="Task 1"),
        analyst.a_initiate_chat(user_proxy, message="Task 2")
    ]
    
    results = await asyncio.gather(*tasks)
    return results

# Run async workflow
results = asyncio.run(async_agent_workflow())
```

### When to Use AutoGen

**Ideal Scenarios:**
- Research and prototyping
- Conversational workflows
- Dynamic role adaptation
- Code generation/execution needed
- Iterative problem-solving

**Example Use Cases:**
- Collaborative code development
- Research brainstorming sessions
- Multi-perspective analysis
- Educational tutoring systems

### AutoGen Strengths

 **Flexible Architecture:** Highly adaptable  
 **Async Support:** Non-blocking operations  
 **Code Execution:** Built-in capability  
 **Human-in-the-Loop:** Natural integration  
 **Strong Research Backing:** Microsoft Research

### AutoGen Limitations

 **Manual Orchestration:** No automatic DAG  
 **Code Readability:** Complex for large systems  
 **Learning Curve:** Async concepts required  
 **Production Maturity:** Requires more setup

---

## 2.5 Emerging Frameworks (2025)

### OpenAI Agents SDK (March 2025)

**Overview:** Production-ready replacement for Swarm framework

**Key Features:**
- Native OpenAI integration
- Handoff patterns built-in
- Streaming support
- First-party tool ecosystem

**When to Use:**
- Already using OpenAI ecosystem
- Need rapid prototyping
- Simple handoff patterns
- OpenAI-first strategy

**Limitations:**
- Vendor lock-in to OpenAI
- Limited non-OpenAI model support
- Newer, less battle-tested

### Microsoft Agent Framework (October 2025)

**Overview:** Merges AutoGen + Semantic Kernel for enterprise

**Key Features:**
```python
from microsoft_agent_framework import Agent, Runtime

# Enterprise-ready agents
agent = Agent(
    name="enterprise_agent",
    runtime=Runtime.AZURE_FOUNDRY,
    observability=True,  # Built-in
    compliance=True       # Enterprise governance
)
```

**Benefits:**
- Cross-cloud (Azure, AWS, GCP)
- Built-in observability
- Enterprise governance
- Durability and reliability

**When to Use:**
- Enterprise deployments
- Need compliance features
- Multi-cloud requirements
- Microsoft ecosystem

### Google Agent Development Kit (ADK)

**Overview:** Cloud-native framework for Vertex AI

**Key Features:**
```python
from google.adk import Agent, OrchestrationAgent

# Native Vertex AI integration
agent = Agent(
    model="gemini-2.5-pro",
    tools=[search_tool, code_tool]
)

# Orchestration patterns
orchestrator = OrchestrationAgent(
    agents=[agent1, agent2, agent3],
    pattern="sequential"  # or "parallel", "loop"
)
```

**Benefits:**
- 200+ model choices
- Native GCP integration
- Agent-to-Agent (A2A) protocol
- Managed runtime available

**When to Use:**
- Google Cloud native
- Need model flexibility
- A2A protocol requirements
- Managed infrastructure preferred

---

## 2.6 Framework Comparison Matrix

| Feature | LangGraph | CrewAI | AutoGen | OpenAI SDK | MS Framework | Google ADK |
|---------|-----------|--------|---------|------------|--------------|------------|
| **Learning Curve** | High | Low | Medium | Low | Medium | Medium |
| **Production Ready** |  Yes |  Yes |  Emerging |  New |  New |  Yes |
| **Debugging Tools** |  |  |  |  |  |  |
| **State Management** | Explicit | Automatic | Manual | Automatic | Automatic | Automatic |
| **Memory Support** | MemorySaver | Built-in | Manual | Built-in | Built-in | Built-in |
| **Async Support** |  |  |  |  |  |  |
| **Vendor Lock-In** | Low | Low | Low | High | Medium | Medium |
| **Enterprise Features** |  |  |  |  |  |  |
| **Community Size** | Large | Growing | Large | New | Large | Large |
| **Best For** | Complex workflows | Quick deploy | Research | OpenAI stack | Enterprise | GCP native |

---

## 2.7 Decision Framework

### Step 1: Assess Workflow Complexity

```
Simple (A→B→C) → CrewAI
Branching (if/else) → LangGraph
Dynamic (conversational) → AutoGen
```

### Step 2: Evaluate Team Skills

```
New to agents → CrewAI
Experienced → LangGraph
Research team → AutoGen
```

### Step 3: Consider Production Requirements

```
MVP/Prototype → Any
Production (High Stakes) → LangGraph or Enterprise frameworks
Rapid Deployment → CrewAI
```

### Step 4: Check Ecosystem Fit

```
LangChain user → LangGraph
Microsoft shop → MS Agent Framework
Google Cloud → Google ADK
OpenAI exclusive → OpenAI SDK
Vendor agnostic → LangGraph or CrewAI
```

---

## Lab 2: Framework Comparison

**Objective:** Build the same workflow in LangGraph, CrewAI, and AutoGen

**Use Case:** Research → Analysis → Report Generation

**Requirements:**
1. Implement in all three frameworks
2. Measure development time
3. Compare code complexity
4. Test debugging experience
5. Document pros/cons

**Deliverables:**
- 3 working implementations
- Comparison report (1000 words)
- Recommendation for production

**Evaluation Criteria:**
- All implementations work (30%)
- Thorough comparison (30%)
- Clear recommendation with justification (20%)
- Code quality (20%)

**Time Estimate:** 6-8 hours

---

## Additional Resources

**LangGraph:**
- Official Docs: https://python.langchain.com/docs/langgraph
- LangGraph Studio
- Example Workflows

**CrewAI:**
- Official Docs: https://docs.crewai.com/
- CrewAI Studio
- Enterprise Features

**AutoGen:**
- Official Docs: https://microsoft.github.io/autogen/
- Research Papers
- AutoGen Studio

**Next Module Preview:**
Module 3 covers architecture patterns and design, including memory architecture, communication design, and state management strategies.

---

**Module 2 Complete**   
**Next:** Module 3 - Architecture Patterns and Design
