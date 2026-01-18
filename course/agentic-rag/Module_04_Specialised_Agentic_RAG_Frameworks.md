---
title: "Module 4: Specialised Agentic RAG Frameworks"
description: "Master specialized frameworks: CRAG, Adaptive RAG, Graph-based, and ADW"
module: "4"
order: 4
---

# Module 4: Specialised Agentic RAG Frameworks

**Duration:** Week 4  
**Learning Objectives:**
- **and implement Corrective RAG Understanding**: Understand and implement Corrective RAG (CRAG)
- **Adaptive RAG Development**: Build Adaptive RAG systems with query classification
- **Graph-Based Agentic RAG for multi-hop reasoning Understanding**: Master Graph-Based Agentic RAG for multi-hop reasoning
- **Agentic Document Workflows Understanding**: Learn Agentic Document Workflows (ADW) for automation

---

## 4.1 Corrective RAG (CRAG)

### Self-Correcting Retrieval Mechanisms

**CRAG** introduces self-correction by evaluating retrieved context and triggering corrective actions when needed.

#### Core Concept

**Problem:** Traditional RAG retrieves documents but doesn't verify if they're sufficient or relevant.

**Solution:** CRAG evaluates retrieved context and:
- Triggers web search if context is insufficient
- Refines queries if relevance is low
- Combines multiple sources for verification

#### Architecture

```
Query → Retrieve → Evaluate Relevance → 
  If Sufficient → Use Context
  If Insufficient → Web Search → Combine → Use
  If Irrelevant → Refine Query → Re-retrieve
```

#### Implementation

```python
class CorrectiveRAG:
    def __init__(self, vector_store, web_search, llm):
        self.vector_store = vector_store
        self.web_search = web_search
        self.llm = llm
        self.relevance_threshold = 0.7
    
    def retrieve(self, query):
        # Step 1: Initial retrieval
        docs = self.vector_store.similarity_search(query, k=5)
        
        # Step 2: Evaluate relevance
        relevance_score = self.evaluate_relevance(docs, query)
        
        # Step 3: Decide action
        if relevance_score >= self.relevance_threshold:
            # Sufficient context
            return self.process_context(docs, query)
        elif relevance_score >= 0.4:
            # Partially relevant, refine
            refined_query = self.refine_query(query, docs)
            refined_docs = self.vector_store.similarity_search(
                refined_query, 
                k=5
            )
            return self.process_context(refined_docs, query)
        else:
            # Insufficient, use web search
            web_results = self.web_search.search(query)
            combined = self.combine_sources(docs, web_results)
            return self.process_context(combined, query)
    
    def evaluate_relevance(self, docs, query):
        # Agent evaluates if retrieved docs are relevant
        prompt = f"""
        Query: {query}
        Retrieved documents: {[d.page_content[:200] for d in docs]}
        
        Rate relevance from 0.0 to 1.0:
        - 1.0: Highly relevant, sufficient to answer
        - 0.7-0.9: Relevant but may need more
        - 0.4-0.6: Partially relevant
        - 0.0-0.3: Not relevant
        
        Output: score
        """
        score = float(self.llm.generate(prompt))
        return score
    
    def refine_query(self, query, docs):
        # Agent refines query based on retrieved docs
        prompt = f"""
        Original query: {query}
        Retrieved documents (partial): {[d.page_content[:200] for d in docs]}
        
        The retrieved documents are partially relevant. 
        Refine the query to better match what's available.
        
        Output: refined_query
        """
        return self.llm.generate(prompt)
    
    def combine_sources(self, vector_docs, web_results):
        # Combine vector store and web search results
        combined = list(vector_docs)
        
        # Add web results with metadata
        for result in web_results:
            combined.append({
                "content": result["snippet"],
                "source": "web",
                "url": result["url"],
                "relevance": result.get("relevance", 0.5)
            })
        
        # Rerank combined results
        return self.rerank(combined)
```

#### Key Features

1. **Relevance Evaluation:**
   - Agent scores retrieved documents
   - Threshold-based decision making
   - Adaptive thresholds

2. **Query Refinement:**
   - Automatic query rewriting
   - Context-aware refinement
   - Iterative improvement

3. **External Search:**
   - Web search integration
   - Multiple source combination
   - Source verification

4. **Error Correction:**
   - Detects insufficient context
   - Automatically corrects
   - Improves accuracy

#### Use Cases

- **Dynamic Information:** When knowledge base may be outdated
- **Complex Queries:** Requiring multiple sources
- **Quality Assurance:** Ensuring accurate responses
- **Production Systems:** Where errors are costly

---

## 4.2 Adaptive RAG

### Query Complexity Classification

**Adaptive RAG** uses classifiers to assess query complexity and selects the most efficient strategy.

#### Core Concept

**Problem:** Using complex retrieval for simple queries wastes resources; using simple retrieval for complex queries fails.

**Solution:** Classify query complexity and adapt strategy:
- **Simple:** Direct LLM (no retrieval)
- **Moderate:** Standard RAG
- **Complex:** Multi-step agentic RAG

#### Architecture

```
Query → Classify Complexity → 
  Simple → Direct LLM
  Moderate → Standard RAG
  Complex → Agentic RAG
```

#### Implementation

```python
class AdaptiveRAG:
    def __init__(self, llm, vector_store, agentic_rag):
        self.llm = llm
        self.vector_store = vector_store
        self.agentic_rag = agentic_rag
        self.classifier = ComplexityClassifier(llm)
    
    def process(self, query):
        # Step 1: Classify complexity
        complexity = self.classifier.classify(query)
        
        # Step 2: Route to appropriate strategy
        if complexity == "simple":
            return self.direct_llm(query)
        elif complexity == "moderate":
            return self.standard_rag(query)
        else:
            return self.agentic_rag.process(query)
    
    def classify(self, query):
        prompt = f"""
        Classify this query complexity:
        Query: {query}
        
        Categories:
        - simple: Single fact, can be answered from LLM knowledge
        - moderate: Requires retrieval, single domain, straightforward
        - complex: Multi-hop reasoning, multiple domains, requires planning
        
        Examples:
        Simple: "What is the capital of France?"
        Moderate: "What are the side effects of aspirin?"
        Complex: "Compare economic policies of France and Germany 
                  from 2010-2020, focusing on unemployment and GDP"
        
        Output: complexity_level
        """
        return self.llm.generate(prompt).strip().lower()
    
    def direct_llm(self, query):
        # No retrieval needed, use LLM directly
        return self.llm.generate(f"Answer: {query}")
    
    def standard_rag(self, query):
        # Standard retrieve-read
        docs = self.vector_store.similarity_search(query, k=5)
        context = "\n".join([d.page_content for d in docs])
        prompt = f"Context: {context}\n\nQuery: {query}"
        return self.llm.generate(prompt)
```

#### Complexity Classification

**Simple Queries:**
- Single fact retrieval
- Common knowledge
- No specialized domain knowledge needed
- Examples: "What is X?", "When did Y happen?"

**Moderate Queries:**
- Requires retrieval
- Single domain
- Straightforward reasoning
- Examples: "What are side effects of X?", "How does Y work?"

**Complex Queries:**
- Multi-hop reasoning
- Multiple domains
- Requires planning and synthesis
- Examples: "Compare X and Y", "Analyze trends in Z"

#### Benefits

- **Cost Optimization:** Simple queries don't use expensive retrieval
- **Latency Reduction:** Faster responses for simple queries
- **Accuracy Improvement:** Complex queries get proper handling
- **Resource Efficiency:** Right tool for right job

---

## 4.3 Graph-Based Agentic RAG

### Knowledge Graphs with Agentic Traversal

**Graph-Based Agentic RAG** combines structured knowledge graphs with agentic traversal for complex multi-hop reasoning.

#### Core Concept

**Problem:** Vector search struggles with:
- Relationship reasoning
- Multi-hop queries
- Structured knowledge

**Solution:** Use knowledge graphs with agentic traversal:
- Graph stores relationships
- Agents traverse graph intelligently
- Multi-hop reasoning enabled

#### Architecture

```
Query → Parse Entities → Graph Traversal → 
  Agent Plans Path → Traverse → Synthesize
```

#### Implementation

```python
class GraphBasedAgenticRAG:
    def __init__(self, graph_db, llm):
        self.graph_db = graph_db  # Neo4j, Memgraph, etc.
        self.llm = llm
        self.traversal_agent = TraversalAgent(llm)
    
    def process(self, query):
        # Step 1: Extract entities and relationships
        entities = self.extract_entities(query)
        relationships = self.extract_relationships(query)
        
        # Step 2: Agent plans traversal path
        traversal_plan = self.traversal_agent.plan(
            entities, 
            relationships, 
            query
        )
        
        # Step 3: Execute traversal
        results = self.traverse(traversal_plan)
        
        # Step 4: Synthesize answer
        answer = self.synthesize(results, query)
        
        return answer
    
    def extract_entities(self, query):
        prompt = f"""
        Extract entities from this query:
        Query: {query}
        
        Output JSON list of entities with types.
        """
        return self.llm.generate_json(prompt)
    
    def plan_traversal(self, entities, relationships, query):
        # Agent decides how to traverse graph
        prompt = f"""
        Query: {query}
        Entities: {entities}
        Relationships: {relationships}
        
        Plan a graph traversal to answer this query.
        Consider:
        1. Starting nodes
        2. Relationship types to follow
        3. Depth of traversal
        4. Stopping conditions
        
        Output: traversal_plan
        """
        return self.llm.generate_json(prompt)
    
    def traverse(self, plan):
        results = []
        current_nodes = plan["start_nodes"]
        visited = set()
        max_depth = plan.get("max_depth", 3)
        
        for depth in range(max_depth):
            next_nodes = []
            
            for node in current_nodes:
                if node in visited:
                    continue
                
                visited.add(node)
                
                # Get node properties
                node_data = self.graph_db.get_node(node)
                results.append(node_data)
                
                # Follow relationships
                relationships = plan["relationships"][depth]
                neighbors = self.graph_db.get_neighbors(
                    node, 
                    relationships
                )
                next_nodes.extend(neighbors)
            
            # Check stopping condition
            if self.should_stop(results, plan):
                break
            
            current_nodes = next_nodes
        
        return results
    
    def synthesize(self, results, query):
        # Synthesize graph traversal results into answer
        context = self.format_graph_results(results)
        prompt = f"""
        Query: {query}
        Graph traversal results: {context}
        
        Synthesize a comprehensive answer.
        """
        return self.llm.generate(prompt)
```

#### Graph Structure

**Nodes:** Entities (people, places, concepts, documents)
**Edges:** Relationships (related_to, contains, authored_by, etc.)
**Properties:** Attributes on nodes and edges

**Example:**
```
(Document) --[contains]--> (Concept) --[related_to]--> (Concept)
     |                          |                          |
  [topic]                   [domain]                   [domain]
```

#### Use Cases

- **Multi-Hop Reasoning:** "What papers cite research by authors who worked at X?"
- **Relationship Queries:** "How are X and Y related?"
- **Structured Knowledge:** Hierarchical or networked information
- **Complex Analysis:** Requiring graph traversal

#### Benefits

- **Relationship Reasoning:** Explicit relationship modeling
- **Multi-Hop Queries:** Natural graph traversal
- **Structured Knowledge:** Better for hierarchical data
- **Explainability:** Clear reasoning paths

---

## 4.4 Agentic Document Workflows (ADW)

### End-to-End Knowledge Work Automation

**ADW** automates complex document-centric processes through agentic reasoning and structuring.

#### Core Concept

**Problem:** Document processing workflows are:
- Manual and time-consuming
- Error-prone
- Difficult to scale
- Require domain expertise

**Solution:** Agentic workflows that:
- Parse documents intelligently
- Reason over content
- Structure outputs automatically
- Handle complex processes end-to-end

#### Architecture

```
Document → Parse → Agent Reasons → Extract → Structure → Output
```

#### Implementation

```python
class AgenticDocumentWorkflow:
    def __init__(self, parser, reasoning_agent, structurer):
        self.parser = parser
        self.reasoning_agent = reasoning_agent
        self.structurer = structurer
    
    def process(self, document, workflow_type):
        # Step 1: Parse document
        parsed = self.parser.parse(document)
        
        # Step 2: Agent reasons over content
        reasoning = self.reasoning_agent.reason(
            parsed, 
            workflow_type
        )
        
        # Step 3: Extract structured information
        extracted = self.extract(parsed, reasoning)
        
        # Step 4: Structure output
        structured = self.structurer.structure(
            extracted, 
            workflow_type
        )
        
        return structured
    
    def process_invoice(self, invoice_doc):
        # Specialized workflow for invoices
        parsed = self.parser.parse_invoice(invoice_doc)
        
        # Agent extracts key information
        extracted = {
            "vendor": self.reasoning_agent.extract_vendor(parsed),
            "amount": self.reasoning_agent.extract_amount(parsed),
            "date": self.reasoning_agent.extract_date(parsed),
            "line_items": self.reasoning_agent.extract_line_items(parsed),
            "tax": self.reasoning_agent.extract_tax(parsed),
            "total": self.reasoning_agent.calculate_total(parsed)
        }
        
        # Structure for downstream systems
        structured = {
            "document_type": "invoice",
            "data": extracted,
            "metadata": {
                "processed_at": datetime.now(),
                "confidence": self.calculate_confidence(extracted)
            }
        }
        
        return structured
```

#### Workflow Types

**1. Invoice Processing:**
- Extract vendor, amount, line items
- Validate totals
- Match to purchase orders
- Route for approval

**2. Contract Review:**
- Extract key terms
- Identify risks
- Compare to templates
- Generate summaries

**3. Research Paper Analysis:**
- Extract methodology
- Identify contributions
- Extract citations
- Generate summaries

**4. Legal Document Processing:**
- Extract clauses
- Identify obligations
- Risk assessment
- Compliance checking

#### Key Features

1. **Intelligent Parsing:**
   - Handles various formats
   - Extracts structure
   - Handles errors gracefully

2. **Agentic Reasoning:**
   - Understands document context
   - Makes extraction decisions
   - Handles ambiguity

3. **Structured Output:**
   - Consistent formats
   - Integration-ready
   - Validated data

4. **End-to-End Automation:**
   - Complete workflows
   - Minimal human intervention
   - Scalable

---

## Lab 4: Build a CRAG System

### Objective
Implement a Corrective RAG system with relevance evaluation, query refinement, and web search integration.

### Tasks

1. **Implement Relevance Evaluation**
   - Agent-based scoring
   - Threshold-based decisions
   - Quality metrics

2. **Query Refinement**
   - Automatic query rewriting
   - Context-aware refinement
   - Iterative improvement

3. **Web Search Integration**
   - External search API
   - Result combination
   - Source verification

4. **Evaluation**
   - Compare with standard RAG
   - Measure accuracy improvements
   - Document performance

### Deliverables
- Complete CRAG implementation
- Evaluation report
- Performance comparison

### Evaluation Criteria
- CRAG implementation (40%)
- Integration quality (30%)
- Evaluation methodology (15%)
- Analysis and insights (15%)

---

## Summary

**Key Takeaways:**

- **CRAG:**: Self-correcting with relevance evaluation and web search
- **Adaptive RAG:**: Query complexity classification for efficiency
- **Graph-Based:**: Knowledge graphs with agentic traversal
- **ADW:**: End-to-end document workflow automation

**Next Steps:**
- **Module 5:**: Module 5: Apply frameworks to enterprise domains
- **domain-specific solutions Implementation**: Implement domain-specific solutions
- **production applications Development**: Build production applications

---

## Additional Resources

### Reading
- "Corrective Retrieval Augmented Generation" (Jiang et al., 2024)
- "Adaptive-RAG: Learning to Adapt Retrieval-Augmented Large Language Models" (2024)
- Graph database documentation (Neo4j, Memgraph)

### Tools
- LangChain CRAG implementation
- Neo4j for graph databases
- Web search APIs

---

**Ready for Module 5? [Continue →](Module_05_Enterprise_Applications_and_Domain_Specialisation.md)**
