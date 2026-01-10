---
title: "Module 3: Agentic Design and Workflow Patterns"
description: "Learn core patterns and orchestration techniques for agentic systems"
module: "3"
order: 3
---

# Module 3: Agentic Design and Workflow Patterns

**Duration:** Week 3  
**Learning Objectives:**
- Master core agentic patterns: reflection, planning, and tool use
- Understand collaborative orchestration patterns
- Learn optimization workflows for RAG systems
- Implement reflection and planning in practice

---

## 3.1 Core Agentic Patterns

### Three Fundamental Patterns

Agentic systems rely on three core patterns that enable autonomous behavior:

1. **Reflection:** Self-feedback and improvement
2. **Planning:** Autonomous subtask decomposition
3. **Tool Use:** Dynamic tool selection and execution

---

### Pattern 1: Reflection (Self-Feedback)

**Purpose:** Enable agents to evaluate and improve their own outputs.

**Process:**
```
Generate → Critique → Refine → Re-evaluate → Final
```

**Implementation:**
```python
class ReflectionPattern:
    def __init__(self, llm):
        self.llm = llm
        self.max_iterations = 3
    
    def process(self, query, initial_response, context):
        current_response = initial_response
        iteration = 0
        
        while iteration < self.max_iterations:
            # Step 1: Critique
            critique = self.critique(current_response, query, context)
            
            # Step 2: Check if improvement needed
            if not critique["needs_improvement"]:
                return current_response
            
            # Step 3: Refine
            current_response = self.refine(
                current_response, 
                critique, 
                query, 
                context
            )
            iteration += 1
        
        return current_response
    
    def critique(self, response, query, context):
        prompt = f"""
        Critique this response to the query:
        
        Query: {query}
        Context: {context}
        Response: {response}
        
        Evaluate on:
        1. Accuracy: Are facts correct?
        2. Completeness: Are all aspects addressed?
        3. Relevance: Is it relevant?
        4. Clarity: Is it clear?
        
        Output JSON:
        {{
            "needs_improvement": true/false,
            "issues": ["issue1", "issue2"],
            "suggestions": ["suggestion1", "suggestion2"]
        }}
        """
        return self.llm.generate_json(prompt)
    
    def refine(self, response, critique, query, context):
        prompt = f"""
        Original response: {response}
        Issues: {critique["issues"]}
        Suggestions: {critique["suggestions"]}
        Query: {query}
        Context: {context}
        
        Generate an improved response addressing the issues.
        """
        return self.llm.generate(prompt)
```

**Use Cases:**
- Quality assurance
- Error correction
- Response refinement
- Fact verification

**Benefits:**
- Improved accuracy
- Self-correction
- Reduced human intervention
- Better user experience

---

### Pattern 2: Planning (Autonomous Subtask Decomposition)

**Purpose:** Break complex queries into manageable sub-tasks.

**Process:**
```
Analyze Query → Decompose → Order Tasks → Execute → Synthesize
```

**Implementation:**
```python
class PlanningPattern:
    def __init__(self, llm):
        self.llm = llm
    
    def create_plan(self, query):
        # Step 1: Analyze complexity
        complexity = self.analyze_complexity(query)
        
        if complexity == "simple":
            return SimplePlan(query)
        
        # Step 2: Decompose
        sub_tasks = self.decompose(query)
        
        # Step 3: Determine dependencies
        dependencies = self.identify_dependencies(sub_tasks)
        
        # Step 4: Create execution plan
        execution_order = self.topological_sort(sub_tasks, dependencies)
        
        return {
            "query": query,
            "complexity": complexity,
            "sub_tasks": sub_tasks,
            "execution_order": execution_order,
            "dependencies": dependencies
        }
    
    def analyze_complexity(self, query):
        prompt = f"""
        Analyze this query complexity:
        Query: {query}
        
        Classify as: simple, moderate, or complex
        
        Simple: Single fact retrieval
        Moderate: Multiple facts, single domain
        Complex: Multi-hop reasoning, multiple domains
        """
        return self.llm.generate(prompt)
    
    def decompose(self, query):
        prompt = f"""
        Break down this query into sub-tasks:
        Query: {query}
        
        Output list of sub-tasks, each should be:
        - Specific and actionable
        - Independent where possible
        - Clear dependencies if any
        """
        return self.llm.generate_list(prompt)
    
    def execute_plan(self, plan, executor):
        results = {}
        
        for task in plan["execution_order"]:
            # Check dependencies
            if self.dependencies_met(task, plan["dependencies"], results):
                # Execute task
                result = executor.execute(task)
                results[task["id"]] = result
            else:
                # Wait for dependencies
                self.wait_for_dependencies(task, plan["dependencies"], results)
                result = executor.execute(task)
                results[task["id"]] = result
        
        # Synthesize results
        final_result = self.synthesize(plan["query"], results)
        return final_result
```

**Example:**
```
Query: "Compare economic policies of France and Germany 
        from 2010-2020, focusing on unemployment and GDP"

Plan:
1. Retrieve France economic policies 2010-2020
2. Retrieve Germany economic policies 2010-2020
3. Extract unemployment data for France
4. Extract unemployment data for Germany
5. Extract GDP data for France
6. Extract GDP data for Germany
7. Compare unemployment trends
8. Compare GDP trends
9. Analyze correlation
10. Synthesize comparison
```

**Benefits:**
- Handles complex queries
- Parallel execution possible
- Better error isolation
- Clearer reasoning trace

---

### Pattern 3: Tool Use

**Purpose:** Dynamically select and use tools based on task requirements.

**Process:**
```
Analyze Task → Select Tool → Execute → Evaluate → Retry if needed
```

**Implementation:**
```python
class ToolUsePattern:
    def __init__(self, llm, tools):
        self.llm = llm
        self.tools = tools
    
    def select_and_execute(self, task):
        # Step 1: Select appropriate tool
        tool = self.select_tool(task)
        
        # Step 2: Prepare parameters
        parameters = self.prepare_parameters(task, tool)
        
        # Step 3: Execute with retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                result = tool.execute(parameters)
                
                # Step 4: Evaluate result
                if self.is_valid_result(result, task):
                    return result
                else:
                    # Refine parameters
                    parameters = self.refine_parameters(
                        parameters, 
                        result, 
                        task
                    )
            except Exception as e:
                # Handle error
                if attempt < max_retries - 1:
                    parameters = self.handle_error(
                        parameters, 
                        e, 
                        task
                    )
                else:
                    raise
        
        return result
    
    def select_tool(self, task):
        prompt = f"""
        Task: {task}
        Available tools: {list(self.tools.keys())}
        
        Select the most appropriate tool and explain why.
        """
        selection = self.llm.generate(prompt)
        tool_name = self.parse_tool_selection(selection)
        return self.tools[tool_name]
    
    def is_valid_result(self, result, task):
        # Agent evaluates if result satisfies task
        evaluation = self.llm.generate(f"""
        Task: {task}
        Result: {result}
        
        Does this result satisfy the task? Yes/No
        """)
        return "yes" in evaluation.lower()
```

**Tool Types:**
- **Retrieval Tools:** Vector search, keyword search
- **Computation Tools:** Calculators, code execution
- **API Tools:** External services
- **Search Tools:** Web search, knowledge bases

---

## 3.2 Collaborative Orchestration

### Multi-Agent Coordination Patterns

When multiple agents work together, they need orchestration patterns to coordinate effectively.

---

### Pattern 1: Centralized (Orchestrator-Worker)

**Architecture:**
```
                    Orchestrator Agent
                         /    |    \
                        /     |     \
                  Worker1  Worker2  Worker3
```

**Characteristics:**
- Single orchestrator coordinates all workers
- Workers are specialized
- Orchestrator manages workflow
- Centralized decision-making

**Implementation:**
```python
class OrchestratorWorkerPattern:
    def __init__(self):
        self.orchestrator = OrchestratorAgent()
        self.workers = {
            "retriever": RetrieverAgent(),
            "analyzer": AnalyzerAgent(),
            "synthesizer": SynthesizerAgent(),
            "verifier": VerifierAgent()
        }
    
    def process(self, query):
        # Step 1: Orchestrator creates plan
        plan = self.orchestrator.create_plan(query)
        
        # Step 2: Orchestrator assigns tasks
        assignments = self.orchestrator.assign_tasks(plan, self.workers)
        
        # Step 3: Workers execute in parallel where possible
        results = {}
        for worker_name, tasks in assignments.items():
            worker = self.workers[worker_name]
            results[worker_name] = worker.execute(tasks)
        
        # Step 4: Orchestrator synthesizes
        final_result = self.orchestrator.synthesize(results, query)
        
        return final_result
    
    def assign_tasks(self, plan, workers):
        # Orchestrator decides which worker handles which task
        assignments = {name: [] for name in workers.keys()}
        
        for task in plan["tasks"]:
            best_worker = self.select_best_worker(task, workers)
            assignments[best_worker].append(task)
        
        return assignments
```

**Use Cases:**
- Clear task separation
- Need for coordination
- Sequential dependencies
- Quality control required

**Benefits:**
- Clear responsibility
- Easy to debug
- Centralized control
- Better error handling

---

### Pattern 2: Decentralized (Peer-to-Peer)

**Architecture:**
```
        Agent1 ←→ Agent2
                   
        Agent3 ←→ Agent4
```

**Characteristics:**
- Agents communicate directly
- No central coordinator
- Distributed decision-making
- Emergent behavior

**Implementation:**
```python
class DecentralizedPattern:
    def __init__(self):
        self.agents = {
            "agent1": Agent1(),
            "agent2": Agent2(),
            "agent3": Agent3(),
            "agent4": Agent4()
        }
        self.message_bus = MessageBus()
    
    def process(self, query):
        # Broadcast initial query
        self.message_bus.broadcast({
            "type": "query",
            "content": query,
            "sender": "user"
        })
        
        # Agents process and communicate
        results = []
        max_iterations = 10
        iteration = 0
        
        while iteration < max_iterations:
            # Each agent processes messages
            for agent_name, agent in self.agents.items():
                messages = self.message_bus.get_messages(agent_name)
                
                for message in messages:
                    response = agent.process(message)
                    
                    if response:
                        # Broadcast response
                        self.message_bus.broadcast({
                            "type": "response",
                            "content": response,
                            "sender": agent_name
                        })
                        
                        if response.get("final"):
                            results.append(response)
            
            # Check if consensus reached
            if self.has_consensus(results):
                break
            
            iteration += 1
        
        return self.synthesize_results(results)
```

**Use Cases:**
- Distributed systems
- No clear hierarchy
- Emergent solutions
- Robustness required

**Benefits:**
- No single point of failure
- Scalable
- Flexible
- Resilient

---

### Pattern 3: Hierarchical

**Architecture:**
```
              Manager Agent
              /     |     \
         Team1    Team2   Team3
         / | \    / | \   / | \
        A1 A2 A3 B1 B2 B3 C1 C2 C3
```

**Characteristics:**
- Multi-level hierarchy
- Managers coordinate teams
- Teams have specialized agents
- Top-down and bottom-up communication

**Implementation:**
```python
class HierarchicalPattern:
    def __init__(self):
        self.manager = ManagerAgent()
        self.teams = {
            "research": ResearchTeam(),
            "analysis": AnalysisTeam(),
            "synthesis": SynthesisTeam()
        }
    
    def process(self, query):
        # Manager creates high-level plan
        plan = self.manager.create_plan(query)
        
        # Manager assigns to teams
        team_assignments = self.manager.assign_to_teams(plan)
        
        # Teams execute
        team_results = {}
        for team_name, tasks in team_assignments.items():
            team = self.teams[team_name]
            team_results[team_name] = team.execute(tasks)
        
        # Manager synthesizes team results
        final_result = self.manager.synthesize(team_results, query)
        
        return final_result
```

**Use Cases:**
- Large-scale systems
- Clear organizational structure
- Specialized teams
- Complex workflows

---

## 3.3 Optimization Workflows

### Three Key Optimization Patterns

---

### Pattern 1: Prompt Chaining

**Purpose:** Enhance accuracy through sequential processing.

**Process:**
```
Query → Prompt1 → Result1 → Prompt2 → Result2 → ... → Final
```

**Implementation:**
```python
class PromptChaining:
    def __init__(self, llm):
        self.llm = llm
        self.chain = []
    
    def add_step(self, prompt_template, processor=None):
        self.chain.append({
            "template": prompt_template,
            "processor": processor
        })
    
    def execute(self, query, initial_context=None):
        context = initial_context or {}
        result = None
        
        for step in self.chain:
            # Build prompt with previous result
            prompt = step["template"].format(
                query=query,
                previous_result=result,
                context=context
            )
            
            # Generate
            result = self.llm.generate(prompt)
            
            # Process if needed
            if step["processor"]:
                result = step["processor"](result)
            
            # Update context
            context["step_" + str(len(self.chain))] = result
        
        return result
```

**Example:**
```
Step 1: Extract key entities from query
Step 2: Retrieve relevant documents for each entity
Step 3: Analyze relationships between entities
Step 4: Synthesize comprehensive answer
```

**Benefits:**
- Better accuracy
- Step-by-step reasoning
- Easier debugging
- Modular design

---

### Pattern 2: Routing

**Purpose:** Dynamically direct inputs to specialized processes or databases.

**Process:**
```
Input → Router → [Process1 | Process2 | Process3] → Result
```

**Implementation:**
```python
class RoutingPattern:
    def __init__(self):
        self.routes = {
            "simple": SimpleProcessor(),
            "complex": ComplexProcessor(),
            "domain_specific": DomainProcessor()
        }
        self.router = RouterAgent()
    
    def process(self, query):
        # Router decides which process to use
        route = self.router.select_route(query, self.routes.keys())
        
        # Execute on selected route
        processor = self.routes[route]
        result = processor.process(query)
        
        return result
    
    def select_route(self, query, available_routes):
        prompt = f"""
        Query: {query}
        Available routes: {available_routes}
        
        Select the most appropriate route based on:
        1. Query complexity
        2. Domain specificity
        3. Required processing
        
        Output: route_name
        """
        return self.llm.generate(prompt)
```

**Use Cases:**
- Multiple knowledge bases
- Different processing strategies
- Cost optimization
- Latency optimization

**Benefits:**
- Efficient resource use
- Specialized processing
- Cost optimization
- Better performance

---

### Pattern 3: Evaluator-Optimizer

**Purpose:** Refinement through iterative feedback loops.

**Process:**
```
Generate → Evaluate → Optimize → Re-generate → ... → Best Result
```

**Implementation:**
```python
class EvaluatorOptimizer:
    def __init__(self, generator, evaluator, optimizer):
        self.generator = generator
        self.evaluator = evaluator
        self.optimizer = optimizer
        self.max_iterations = 5
    
    def optimize(self, query, context):
        best_result = None
        best_score = 0
        current_params = self.initial_params()
        
        for iteration in range(self.max_iterations):
            # Generate with current parameters
            result = self.generator.generate(
                query, 
                context, 
                current_params
            )
            
            # Evaluate
            evaluation = self.evaluator.evaluate(result, query)
            score = evaluation["overall_score"]
            
            # Update best if improved
            if score > best_score:
                best_score = score
                best_result = result
            
            # Optimize parameters
            current_params = self.optimizer.optimize(
                current_params,
                evaluation,
                result
            )
            
            # Early stopping if good enough
            if score >= self.target_score:
                break
        
        return best_result
```

**Evaluation Metrics:**
- Accuracy
- Completeness
- Relevance
- Clarity
- Factual consistency

**Optimization Strategies:**
- Parameter tuning
- Prompt refinement
- Retrieval strategy adjustment
- Model selection

---

## Lab 3: Implement Reflection and Planning Patterns

### Objective
Implement reflection and planning patterns in an agentic RAG system and compare performance.

### Tasks

1. **Implement Reflection Pattern**
   - Self-critique mechanism
   - Refinement loop
   - Quality evaluation

2. **Implement Planning Pattern**
   - Query decomposition
   - Task ordering
   - Execution plan

3. **Combine Patterns**
   - Use planning for complex queries
   - Use reflection for quality assurance
   - Measure improvements

4. **Evaluation**
   - Compare with and without patterns
   - Measure accuracy, latency, cost
   - Document improvements

### Deliverables
- Implementation with both patterns
- Evaluation report
- Performance comparison

### Evaluation Criteria
- Pattern implementation (40%)
- Integration quality (30%)
- Evaluation methodology (15%)
- Analysis and insights (15%)

---

## Summary

**Key Takeaways:**

1. **Core Patterns:** Reflection, Planning, Tool Use
2. **Orchestration:** Centralized, Decentralized, Hierarchical
3. **Optimization:** Prompt Chaining, Routing, Evaluator-Optimizer
4. **Combination:** Patterns work together for better results

**Next Steps:**
- Module 4: Learn specialized frameworks
- Implement CRAG, Adaptive RAG, Graph-based RAG
- Build production-ready systems

---

## Additional Resources

### Reading
- LangChain agent patterns
- Multi-agent orchestration papers
- Optimization techniques

### Tools
- LangGraph for orchestration
- LangChain for patterns
- Evaluation frameworks

---

**Ready for Module 4? [Continue →](Module_04_Specialised_Agentic_RAG_Frameworks.md)**
