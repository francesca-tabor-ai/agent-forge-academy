---
title: "Module 7: Implementation and Tooling Ecosystem"
description: "Master the tools and frameworks for production agentic RAG systems"
module: "7"
order: 7
---

# Module 7: Implementation and Tooling Ecosystem

**Duration:** Week 7  
**Learning Objectives:**
- Master LangChain, LangGraph, and LlamaIndex for agentic RAG
- Integrate vector stores and graph databases
- Set up observability with Langfuse
- Deploy production-ready systems

---

## 7.1 Frameworks: LangChain

### RAG Orchestration with LangChain

**LangChain** provides comprehensive tools for building RAG systems.

#### Core Components

**1. Document Loaders:**
```python
from langchain.document_loaders import PyPDFLoader, TextLoader

# Load documents
loader = PyPDFLoader("document.pdf")
documents = loader.load()
```

**2. Text Splitters:**
```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Split documents
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
chunks = text_splitter.split_documents(documents)
```

**3. Embeddings:**
```python
from langchain.embeddings import OpenAIEmbeddings

# Create embeddings
embeddings = OpenAIEmbeddings()
vector_store = FAISS.from_documents(chunks, embeddings)
```

**4. Retrievers:**
```python
from langchain.retrievers import VectorStoreRetriever

# Create retriever
retriever = VectorStoreRetriever(
    vectorstore=vector_store,
    search_kwargs={"k": 5}
)
```

**5. Chains:**
```python
from langchain.chains import RetrievalQA

# Create RAG chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True
)

# Query
result = qa_chain({"query": "What is the main topic?"})
```

#### Agentic RAG with LangChain

```python
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.tools import Tool
from langchain.prompts import ChatPromptTemplate

# Define tools
tools = [
    Tool(
        name="vector_search",
        func=vector_store.similarity_search,
        description="Search vector store for relevant documents"
    ),
    Tool(
        name="web_search",
        func=web_search,
        description="Search the web for current information"
    )
]

# Create agent
agent = create_openai_tools_agent(
    llm=llm,
    tools=tools,
    prompt=prompt
)

# Execute
executor = AgentExecutor(agent=agent, tools=tools)
result = executor.invoke({"input": "What is the latest research on RAG?"})
```

---

## 7.2 Frameworks: LangGraph

### State Management for Agentic Systems

**LangGraph** extends LangChain with state management for complex workflows.

#### Basic Graph

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class AgentState(TypedDict):
    query: str
    retrieved_docs: list
    response: str
    iteration: int

# Define nodes
def retrieve_node(state: AgentState):
    docs = vector_store.similarity_search(state["query"])
    return {"retrieved_docs": docs}

def generate_node(state: AgentState):
    context = "\n".join([d.page_content for d in state["retrieved_docs"]])
    response = llm.generate(f"Context: {context}\n\nQuery: {state['query']}")
    return {"response": response}

def verify_node(state: AgentState):
    # Verify response quality
    quality = evaluate_quality(state["response"], state["retrieved_docs"])
    return {"quality": quality}

# Create graph
workflow = StateGraph(AgentState)
workflow.add_node("retrieve", retrieve_node)
workflow.add_node("generate", generate_node)
workflow.add_node("verify", verify_node)

# Define edges
workflow.set_entry_point("retrieve")
workflow.add_edge("retrieve", "generate")
workflow.add_edge("generate", "verify")

# Conditional edge
def should_refine(state: AgentState):
    if state.get("quality", 0) < 0.7:
        return "refine"
    return "end"

workflow.add_conditional_edges(
    "verify",
    should_refine,
    {
        "refine": "retrieve",  # Loop back
        "end": END
    }
)

# Compile and run
app = workflow.compile()
result = app.invoke({"query": "What is agentic RAG?"})
```

#### Advanced Patterns

**Memory Integration:**
```python
from langgraph.checkpoint.memory import MemorySaver

# Add memory
memory = MemorySaver()
app = workflow.compile(checkpointer=memory)

# Run with checkpointing
config = {"configurable": {"thread_id": "1"}}
result = app.invoke({"query": "Hello"}, config=config)

# Continue conversation
result2 = app.invoke({"query": "What did I just ask?"}, config=config)
```

**Parallel Execution:**
```python
def parallel_retrieve(state: AgentState):
    # Retrieve from multiple sources in parallel
    results = {
        "vector": vector_store.similarity_search(state["query"]),
        "keyword": keyword_search(state["query"]),
        "graph": graph_traverse(state["query"])
    }
    return {"retrieved_docs": combine_results(results)}
```

---

## 7.3 Frameworks: LlamaIndex

### Data Framework for RAG

**LlamaIndex** provides a data framework optimized for RAG.

#### Basic Setup

```python
from llama_index import VectorStoreIndex, SimpleDirectoryReader
from llama_index.llms import OpenAI

# Load documents
documents = SimpleDirectoryReader("data").load_data()

# Create index
index = VectorStoreIndex.from_documents(documents)

# Create query engine
query_engine = index.as_query_engine()

# Query
response = query_engine.query("What is the main topic?")
```

#### Agentic RAG with LlamaIndex

```python
from llama_index.agent import ReActAgent
from llama_index.tools import QueryEngineTool, ToolMetadata

# Create query engines for different data sources
vector_query_engine = vector_index.as_query_engine()
graph_query_engine = graph_index.as_query_engine()

# Define tools
tools = [
    QueryEngineTool(
        query_engine=vector_query_engine,
        metadata=ToolMetadata(
            name="vector_search",
            description="Search vector store for semantic similarity"
        )
    ),
    QueryEngineTool(
        query_engine=graph_query_engine,
        metadata=ToolMetadata(
            name="graph_search",
            description="Traverse knowledge graph for relationships"
        )
    )
]

# Create agent
agent = ReActAgent.from_tools(tools, llm=llm, verbose=True)

# Query
response = agent.chat("Compare vector and graph search results")
```

#### Advanced Features

**Retrieval Strategies:**
```python
from llama_index import ServiceContext
from llama_index.retrievers import VectorIndexRetriever, BM25Retriever
from llama_index.query_engine import RouterQueryEngine
from llama_index.selectors import LLMSingleSelector

# Create retrievers
vector_retriever = VectorIndexRetriever(index=vector_index)
bm25_retriever = BM25Retriever.from_defaults(nodes=documents)

# Create router
query_engine = RouterQueryEngine(
    selector=LLMSingleSelector.from_defaults(),
    query_engine_tools=[
        QueryEngineTool.from_defaults(
            query_engine=vector_index.as_query_engine(),
            description="Use for semantic queries"
        ),
        QueryEngineTool.from_defaults(
            query_engine=bm25_index.as_query_engine(),
            description="Use for keyword queries"
        )
    ]
)
```

---

## 7.4 Frameworks: AutoGen and CrewAI

### Multi-Agent Systems

#### AutoGen

```python
from autogen import AssistantAgent, UserProxyAgent

# Create agents
assistant = AssistantAgent(
    name="assistant",
    llm_config={"model": "gpt-4"}
)

user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER"
)

# Initiate conversation
user_proxy.initiate_chat(
    assistant,
    message="What is agentic RAG?"
)
```

#### CrewAI

```python
from crewai import Agent, Task, Crew

# Define agents
researcher = Agent(
    role="Researcher",
    goal="Research and gather information",
    backstory="Expert researcher"
)

writer = Agent(
    role="Writer",
    goal="Write comprehensive reports",
    backstory="Expert technical writer"
)

# Define tasks
research_task = Task(
    description="Research agentic RAG",
    agent=researcher
)

write_task = Task(
    description="Write report on agentic RAG",
    agent=writer
)

# Create crew
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, write_task]
)

# Execute
result = crew.kickoff()
```

---

## 7.5 Databases: Vector Stores

### Qdrant

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
from langchain.vectorstores import Qdrant

# Create client
client = QdrantClient(host="localhost", port=6333)

# Create collection
client.create_collection(
    collection_name="documents",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
)

# Create vector store
vector_store = Qdrant(
    client=client,
    collection_name="documents",
    embeddings=embeddings
)

# Add documents
vector_store.add_documents(documents)
```

### Pinecone

```python
import pinecone
from langchain.vectorstores import Pinecone

# Initialize
pinecone.init(api_key="your-api-key", environment="us-west1-gcp")

# Create index
pinecone.create_index("documents", dimension=1536)

# Create vector store
vector_store = Pinecone.from_documents(
    documents,
    embeddings,
    index_name="documents"
)

# Query
results = vector_store.similarity_search("query", k=5)
```

---

## 7.6 Databases: Graph Databases

### Memgraph

```python
from gqlalchemy import Memgraph
from langchain.graphs import MemgraphGraph

# Connect
graph = MemgraphGraph(
    connection_string="bolt://localhost:7687"
)

# Create nodes and relationships
graph.query("""
    CREATE (d:Document {title: "RAG Guide"})
    CREATE (c:Concept {name: "Retrieval"})
    CREATE (d)-[:CONTAINS]->(c)
""")

# Query
result = graph.query("""
    MATCH (d:Document)-[:CONTAINS]->(c:Concept)
    RETURN d, c
""")
```

### Neo4j

```python
from langchain.graphs import Neo4jGraph

# Connect
graph = Neo4jGraph(
    url="bolt://localhost:7687",
    username="neo4j",
    password="password"
)

# Create graph
graph.query("""
    CREATE (d:Document {title: "RAG Guide"})
    CREATE (c:Concept {name: "Retrieval"})
    CREATE (d)-[:CONTAINS]->(c)
""")

# Query with agent
from langchain.chains import GraphCypherQAChain

chain = GraphCypherQAChain.from_llm(
    llm=llm,
    graph=graph,
    verbose=True
)

result = chain.run("What documents contain the concept Retrieval?")
```

---

## 7.7 Observability: Langfuse

### Monitoring and Optimization

**Langfuse** provides comprehensive observability for LLM applications.

#### Setup

```python
from langfuse import Langfuse
from langfuse.decorators import langfuse_context, observe

# Initialize
langfuse = Langfuse(
    public_key="your-public-key",
    secret_key="your-secret-key",
    host="https://cloud.langfuse.com"
)

# Decorate functions
@observe()
def agentic_rag(query):
    # Your agentic RAG code
    result = process_query(query)
    return result

# Track manually
trace = langfuse.trace(
    name="agentic_rag",
    user_id="user123"
)

span = trace.span(
    name="retrieval",
    metadata={"query": query}
)

# Log events
span.event(
    name="retrieval_complete",
    metadata={"docs_retrieved": 5}
)

# Update with result
span.update(output=result)
```

#### Metrics Tracking

```python
# Track costs
langfuse.trace(
    name="agentic_rag",
    metadata={
        "cost": 0.05,
        "tokens": 1000,
        "latency_ms": 500
    }
)

# Track errors
try:
    result = agentic_rag(query)
except Exception as e:
    langfuse.trace(
        name="agentic_rag",
        level="ERROR",
        metadata={"error": str(e)}
    )
```

#### User Feedback

```python
# Collect feedback
langfuse.score(
    trace_id=trace_id,
    name="user_satisfaction",
    value=4.5,
    comment="Great response!"
)
```

#### Dashboards

Langfuse provides:
- Cost tracking
- Latency monitoring
- Error rates
- User feedback
- Token usage
- Model performance

---

## Lab 7: Deploy Production System with Observability

### Objective
Build and deploy a complete production agentic RAG system with full observability.

### Tasks

1. **System Implementation**
   - Choose framework (LangChain/LangGraph/LlamaIndex)
   - Implement agentic RAG
   - Integrate vector and/or graph database

2. **Observability Setup**
   - Integrate Langfuse
   - Set up monitoring
   - Configure alerts

3. **Deployment**
   - Deploy to production environment
   - Set up CI/CD
   - Configure scaling

4. **Evaluation**
   - Monitor performance
   - Collect metrics
   - Gather user feedback
   - Optimize based on data

### Deliverables
- Complete production system
- Observability dashboard
- Deployment documentation
- Performance report

### Evaluation Criteria
- System implementation (30%)
- Observability setup (25%)
- Deployment quality (25%)
- Evaluation and optimization (20%)

---

## Summary

**Key Takeaways:**

1. **Frameworks:** LangChain, LangGraph, LlamaIndex, AutoGen, CrewAI
2. **Databases:** Vector stores (Qdrant, Pinecone) and graph databases (Memgraph, Neo4j)
3. **Observability:** Langfuse for monitoring, cost tracking, and optimization
4. **Production:** Deploy with full observability and monitoring

**Congratulations!** You've completed the Mastering Agentic RAG for Enterprise AI course!

---

## Additional Resources

### Documentation
- [LangChain Docs](https://python.langchain.com/)
- [LangGraph Docs](https://langchain-ai.github.io/langgraph/)
- [LlamaIndex Docs](https://docs.llamaindex.ai/)
- [Langfuse Docs](https://langfuse.com/docs)

### Tools
- Framework comparison guides
- Database selection guides
- Observability best practices

---

**Course Complete! **

**Next Steps:**
- Build your own agentic RAG system
- Contribute to open source
- Share your learnings
- Continue learning and experimenting

---

**Thank you for completing the course!**
