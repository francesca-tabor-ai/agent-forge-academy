---
title: "Module 7: Architectures for Safe LLM Systems"
description: "Make architectural choices that reduce risk, not just cost"
module: "7"
order: 7
email_takeaway: "Safe LLM architectures use RAG with approved content, careful model selection, prompt versioning, tool sandboxing, and prevent cross-context leakage."
email_action: "Review a sample LLM system architecture and identify 3 hardening recommendations."
---

# Module 7: Architectures for Safe LLM Systems

**Duration:** Week 7-8  
**Learning Objectives:**
- Design RAG systems with approved clinical content
- Select models and constraint strategies
- Implement prompt versioning and change control
- Design tool calling with sandboxing
- Prevent cross-context leakage

---

## 7.1 RAG with Approved Clinical Content

### The RAG Architecture

**Retrieval-Augmented Generation (RAG):**
- Retrieves relevant information from knowledge base
- Augments LLM prompt with retrieved context
- Generates response based on retrieved + model knowledge

**Healthcare RAG Requirements:**
- Use only approved clinical content
- Ensure content is current and validated
- Prevent hallucination of medical information
- Maintain source attribution

### Approved Content Sources

**1. Clinical Guidelines**
- Evidence-based guidelines
- Professional society recommendations
- Regulatory-approved protocols
- Example: NICE guidelines, CDC recommendations

**2. Drug Information Databases**
- FDA-approved drug information
- Drug interaction databases
- Dosage guidelines
- Example: Micromedex, Lexicomp

**3. Medical Literature**
- Peer-reviewed journals
- Systematic reviews
- Meta-analyses
- Example: PubMed, Cochrane reviews

**4. Institutional Knowledge**
- Hospital protocols
- Local guidelines
- Approved procedures
- Example: Hospital formulary, local protocols

### RAG Implementation

**1. Content Curation**

```python
class ClinicalContentManager:
    def __init__(self):
        self.approved_sources = [
            "nice_guidelines",
            "fda_drug_info",
            "pubmed_articles",
            "hospital_protocols"
        ]
        self.content_validator = ContentValidator()
    
    def add_content(self, content, source):
        # Validate source is approved
        if source not in self.approved_sources:
            raise UnapprovedSourceError(f"Source {source} not approved")
        
        # Validate content
        if not self.content_validator.validate(content):
            raise InvalidContentError("Content validation failed")
        
        # Store with metadata
        self._store_content(content, source, metadata={
            "added_date": datetime.now(),
            "validated_by": self._get_validator(),
            "version": 1,
            "status": "approved"
        })
```

**2. Retrieval with Source Attribution**

```python
class ClinicalRAG:
    def __init__(self):
        self.vector_store = VectorStore()
        self.llm = LLM()
        self.content_manager = ClinicalContentManager()
    
    def retrieve(self, query, top_k=5):
        # Retrieve from approved content only
        results = self.vector_store.search(
            query=query,
            filter={"source": {"$in": self.approved_sources}},
            top_k=top_k
        )
        
        return results
    
    def generate(self, query, retrieved_docs):
        # Build prompt with retrieved context
        context = self._format_context(retrieved_docs)
        
        prompt = f"""
        You are a clinical assistant. Use only the provided clinical information.
        
        Clinical Context:
        {context}
        
        Question: {query}
        
        Instructions:
        - Answer based only on the provided clinical context
        - If information is not in the context, say so
        - Cite sources for all medical information
        - Do not make up medical information
        """
        
        response = self.llm.generate(prompt)
        
        # Add source attribution
        sources = [doc.metadata["source"] for doc in retrieved_docs]
        response["sources"] = sources
        
        return response
```

**3. Content Validation and Updates**

```python
class ContentValidator:
    def validate(self, content):
        checks = [
            self._check_medical_accuracy(content),
            self._check_source_attribution(content),
            self._check_currentness(content),
            self._check_completeness(content)
        ]
        
        return all(checks)
    
    def check_medical_accuracy(self, content):
        # Validate against known medical facts
        # Check for contradictions
        # Verify dosages and protocols
        pass
    
    def update_content(self, content_id, new_version):
        # Version control for content
        old_version = self._get_content(content_id)
        
        # Compare versions
        changes = self._compare_versions(old_version, new_version)
        
        # Require approval for significant changes
        if changes["significance"] == "high":
            self._require_approval(content_id, new_version, changes)
        else:
            self._update_content(content_id, new_version)
```

---

## 7.2 Model Selection and Constraint Strategies

### Model Selection Criteria

**1. Capability Requirements**
- Medical knowledge
- Reasoning ability
- Instruction following
- Safety features

**2. Safety Considerations**
- Refusal behavior
- Hallucination rate
- Bias and fairness
- Safety training

**3. Performance Requirements**
- Latency
- Throughput
- Cost
- Availability

**4. Compliance Requirements**
- Data residency
- Privacy features
- Audit capabilities
- Regulatory approval

### Constraint Strategies

**1. Output Constraints**

```python
class ConstrainedLLM:
    def __init__(self, model, constraints):
        self.model = model
        self.constraints = constraints
    
    def generate(self, prompt):
        response = self.model.generate(prompt)
        
        # Apply constraints
        constrained_response = self._apply_constraints(response)
        
        return constrained_response
    
    def _apply_constraints(self, response):
        # Constraint 1: Medical terminology validation
        if not self._validate_medical_terms(response):
            return self._refuse("Contains unvalidated medical terms")
        
        # Constraint 2: Dosage range limits
        if not self._validate_dosages(response):
            return self._refuse("Dosage outside safe range")
        
        # Constraint 3: Prohibited actions
        if self._contains_prohibited_action(response):
            return self._refuse("Contains prohibited action")
        
        return response
```

**2. Input Constraints**

```python
class InputValidator:
    def validate_input(self, user_input):
        # Check for prohibited queries
        if self._is_prohibited_query(user_input):
            raise ProhibitedQueryError("Query not allowed")
        
        # Check for PHI leakage
        if self._contains_phi(user_input):
            raise PHILeakageError("Input contains PHI")
        
        # Check for prompt injection
        if self._is_prompt_injection(user_input):
            raise PromptInjectionError("Potential prompt injection detected")
        
        return True
```

**3. Model Routing**

```python
class ModelRouter:
    def __init__(self):
        self.models = {
            "high_risk": HighSafetyModel(),      # For critical decisions
            "medium_risk": BalancedModel(),       # For routine tasks
            "low_risk": FastModel(),              # For simple queries
            "specialized": MedicalSpecialistModel() # For specialized domains
        }
    
    def route(self, query, risk_level, domain):
        # Route based on risk and domain
        if risk_level == "high":
            return self.models["high_risk"]
        elif domain == "specialized":
            return self.models["specialized"]
        elif risk_level == "low":
            return self.models["low_risk"]
        else:
            return self.models["medium_risk"]
```

---

## 7.3 Prompt Versioning and Change Control

### Why Prompt Versioning Matters

**1. Reproducibility**
- Same prompt = same behavior
- Track what changed
- Rollback if needed

**2. Safety**
- Test prompts before deployment
- Review changes carefully
- Prevent accidental harmful changes

**3. Compliance**
- Audit trail of changes
- Regulatory review
- Incident investigation

### Prompt Versioning System

```python
class PromptVersionManager:
    def __init__(self):
        self.prompt_store = PromptStore()
        self.approval_workflow = ApprovalWorkflow()
    
    def create_prompt(self, prompt_text, metadata):
        # Create new prompt version
        prompt = {
            "id": self._generate_id(),
            "version": 1,
            "text": prompt_text,
            "metadata": metadata,
            "created_at": datetime.now(),
            "status": "draft",
            "approved_by": None
        }
        
        self.prompt_store.store(prompt)
        return prompt
    
    def update_prompt(self, prompt_id, new_text, change_reason):
        # Get current version
        current = self.prompt_store.get_latest(prompt_id)
        
        # Create new version
        new_version = {
            "id": prompt_id,
            "version": current["version"] + 1,
            "text": new_text,
            "metadata": current["metadata"],
            "created_at": datetime.now(),
            "status": "draft",
            "change_reason": change_reason,
            "previous_version": current["version"],
            "diff": self._compute_diff(current["text"], new_text)
        }
        
        # Require approval for significant changes
        if self._is_significant_change(new_version):
            self.approval_workflow.request_approval(new_version)
        else:
            new_version["status"] = "approved"
        
        self.prompt_store.store(new_version)
        return new_version
    
    def deploy_prompt(self, prompt_id, version):
        # Get prompt version
        prompt = self.prompt_store.get(prompt_id, version)
        
        # Check approval
        if prompt["status"] != "approved":
            raise NotApprovedError("Prompt not approved")
        
        # Deploy with feature flag
        self._deploy_with_feature_flag(prompt, rollout_percentage=10)
        
        # Monitor performance
        self._monitor_prompt_performance(prompt)
    
    def rollback_prompt(self, prompt_id):
        # Get previous version
        current = self.prompt_store.get_latest(prompt_id)
        previous = self.prompt_store.get(prompt_id, current["version"] - 1)
        
        # Rollback
        self._deploy_with_feature_flag(previous, rollout_percentage=100)
        
        # Log rollback
        self._log_rollback(prompt_id, current["version"], previous["version"])
```

### Change Control Process

**1. Draft Changes**
- Create new version
- Document changes
- Compute diff

**2. Review Process**
- Technical review
- Clinical review (for medical prompts)
- Safety review
- Compliance review

**3. Approval**
- Require approval for significant changes
- Track approver
- Record approval reason

**4. Testing**
- Test in staging
- A/B testing in production
- Monitor performance

**5. Deployment**
- Gradual rollout
- Feature flags
- Monitoring
- Rollback capability

---

## 7.4 Tool Calling and Sandboxing

### Tool Calling in Healthcare AI

**What Are Tools?**
- Functions the LLM can call
- External services
- Database queries
- API calls

**Healthcare Tool Examples:**
- Medication lookup
- Drug interaction check
- Lab result retrieval
- Patient record access

### Tool Sandboxing

**Why Sandbox?**
- Prevent unauthorized actions
- Limit damage from errors
- Control resource usage
- Enforce permissions

**Sandboxing Strategies:**

**1. Permission-Based Sandboxing**

```python
class ToolSandbox:
    def __init__(self, agent_permissions):
        self.permissions = agent_permissions
        self.tool_registry = ToolRegistry()
    
    def execute_tool(self, tool_name, parameters, agent_id):
        # Get tool definition
        tool = self.tool_registry.get_tool(tool_name)
        
        # Check permission
        if not self._has_permission(agent_id, tool_name):
            raise PermissionDeniedError(f"Agent {agent_id} cannot use {tool_name}")
        
        # Validate parameters
        if not self._validate_parameters(tool, parameters):
            raise InvalidParametersError("Invalid tool parameters")
        
        # Execute in sandbox
        result = self._execute_in_sandbox(tool, parameters)
        
        # Log execution
        self._log_tool_execution(agent_id, tool_name, parameters, result)
        
        return result
```

**2. Resource Limits**

```python
class ResourceLimitedSandbox:
    def __init__(self):
        self.limits = {
            "max_execution_time": 30,  # seconds
            "max_memory": 512,         # MB
            "max_api_calls": 10,       # per request
            "max_data_size": 1024      # KB
        }
    
    def execute_with_limits(self, tool, parameters):
        # Set resource limits
        with timeout(self.limits["max_execution_time"]):
            with memory_limit(self.limits["max_memory"]):
                with api_call_limit(self.limits["max_api_calls"]):
                    return tool.execute(parameters)
```

**3. Input/Output Validation**

```python
class ValidatedToolSandbox:
    def execute_tool(self, tool, parameters):
        # Validate input
        validated_input = self._validate_input(tool, parameters)
        
        # Execute
        result = tool.execute(validated_input)
        
        # Validate output
        validated_output = self._validate_output(tool, result)
        
        # Sanitize output
        sanitized = self._sanitize_output(validated_output)
        
        return sanitized
```

**4. Isolation**

```python
class IsolatedToolSandbox:
    def __init__(self):
        self.isolated_environment = IsolatedEnvironment()
    
    def execute_tool(self, tool, parameters):
        # Execute in isolated environment
        with self.isolated_environment:
            result = tool.execute(parameters)
            
            # Clean up after execution
            self.isolated_environment.cleanup()
            
            return result
```

### Tool Registry

```python
class ToolRegistry:
    def __init__(self):
        self.tools = {}
    
    def register_tool(self, tool_name, tool_def):
        tool_def["sandboxed"] = True
        tool_def["permissions_required"] = tool_def.get("permissions", [])
        self.tools[tool_name] = tool_def
    
    def get_tool(self, tool_name):
        if tool_name not in self.tools:
            raise ToolNotFoundError(f"Tool {tool_name} not found")
        
        return self.tools[tool_name]

# Example tool registration
registry = ToolRegistry()

registry.register_tool("lookup_medication", {
    "function": lookup_medication,
    "permissions": ["read_medication_data"],
    "input_schema": {
        "medication_name": {"type": "string", "required": True}
    },
    "output_schema": {
        "medication_info": {"type": "object"}
    },
    "rate_limit": 100,  # per minute
    "timeout": 5  # seconds
})
```

---

## 7.5 Preventing Cross-Context Leakage

### The Cross-Context Leakage Problem

**What Is It?**
- Information from one context leaking into another
- Patient A's data appearing in Patient B's response
- Session data persisting incorrectly
- Model "remembering" previous conversations

**Why It's Dangerous:**
- Privacy violations
- Wrong recommendations
- Data breaches
- Regulatory violations

### Prevention Strategies

**1. Context Isolation**

```python
class IsolatedContextManager:
    def __init__(self):
        self.contexts = {}
    
    def create_context(self, session_id, user_id):
        # Create isolated context
        context = {
            "session_id": session_id,
            "user_id": user_id,
            "data": {},
            "created_at": datetime.now(),
            "last_accessed": datetime.now()
        }
        
        self.contexts[session_id] = context
        return context
    
    def get_context(self, session_id):
        # Get isolated context
        context = self.contexts.get(session_id)
        
        if not context:
            raise ContextNotFoundError(f"Context {session_id} not found")
        
        # Update last accessed
        context["last_accessed"] = datetime.now()
        
        return context
    
    def clear_context(self, session_id):
        # Clear context after use
        if session_id in self.contexts:
            del self.contexts[session_id]
    
    def enforce_isolation(self, session_id, data):
        # Ensure data doesn't leak between contexts
        context = self.get_context(session_id)
        
        # Validate data belongs to this context
        if data.get("user_id") != context["user_id"]:
            raise ContextLeakageError("Data from different user detected")
        
        return True
```

**2. Session Management**

```python
class SessionManager:
    def __init__(self):
        self.sessions = {}
        self.session_timeout = timedelta(minutes=30)
    
    def create_session(self, user_id):
        session_id = self._generate_session_id()
        
        session = {
            "session_id": session_id,
            "user_id": user_id,
            "created_at": datetime.now(),
            "last_activity": datetime.now(),
            "context": {},
            "conversation_history": []
        }
        
        self.sessions[session_id] = session
        return session
    
    def get_session(self, session_id):
        session = self.sessions.get(session_id)
        
        if not session:
            raise SessionNotFoundError("Session not found")
        
        # Check timeout
        if datetime.now() - session["last_activity"] > self.session_timeout:
            self.clear_session(session_id)
            raise SessionExpiredError("Session expired")
        
        session["last_activity"] = datetime.now()
        return session
    
    def clear_session(self, session_id):
        # Clear all session data
        if session_id in self.sessions:
            session = self.sessions[session_id]
            
            # Clear context
            session["context"] = {}
            
            # Clear conversation history
            session["conversation_history"] = []
            
            # Remove session
            del self.sessions[session_id]
```

**3. Data Sanitization**

```python
class DataSanitizer:
    def sanitize_for_llm(self, data, session_id):
        # Remove session-specific data
        sanitized = {
            k: v for k, v in data.items()
            if k not in ["session_id", "user_id", "conversation_history"]
        }
        
        # Remove PHI if not needed
        if not self._phi_needed(sanonymized):
            sanitized = self._remove_phi(sanitized)
        
        # Add session marker
        sanitized["_session"] = session_id
        
        return sanitized
    
    def validate_no_leakage(self, response, expected_session):
        # Check response doesn't contain data from other sessions
        if response.get("_session") != expected_session:
            raise ContextLeakageError("Response contains data from different session")
        
        # Check for unexpected user data
        if self._contains_unexpected_user_data(response, expected_session):
            raise ContextLeakageError("Response contains unexpected user data")
        
        return True
```

**4. Model State Management**

```python
class StatelessLLM:
    def __init__(self, model):
        self.model = model
        # Don't store conversation state in model
    
    def generate(self, prompt, context=None):
        # Build complete prompt with context
        full_prompt = self._build_prompt(prompt, context)
        
        # Generate (model has no memory)
        response = self.model.generate(full_prompt)
        
        # Return response (no state stored)
        return response
    
    def _build_prompt(self, prompt, context):
        # Include all necessary context in prompt
        # Don't rely on model memory
        if context:
            return f"Context: {context}\n\nPrompt: {prompt}"
        return prompt
```

---

## 7.6 Practical: Review and Harden LLM Architecture

### Exercise: Architecture Hardening

**Objective:** Review and harden a sample LLM system architecture.

**Review a sample architecture (provided) or use your own:**

**Areas to Review:**

1. **RAG Implementation**
   - Are content sources approved?
   - Is source attribution included?
   - Is content validated?
   - Are updates controlled?

2. **Model Selection**
   - Is model appropriate for use case?
   - Are constraints applied?
   - Is model routing implemented?
   - Are safety features enabled?

3. **Prompt Management**
   - Is prompt versioning implemented?
   - Is change control in place?
   - Are prompts tested?
   - Can prompts be rolled back?

4. **Tool Calling**
   - Are tools sandboxed?
   - Are permissions enforced?
   - Are resource limits set?
   - Is execution logged?

5. **Context Management**
   - Is context isolated?
   - Are sessions managed?
   - Is data sanitized?
   - Is leakage prevented?

**Hardening Tasks:**

1. **Identify Vulnerabilities**
   - List security issues
   - List safety issues
   - List compliance issues

2. **Design Mitigations**
   - Security mitigations
   - Safety mitigations
   - Compliance mitigations

3. **Implement Hardening**
   - Add missing controls
   - Strengthen existing controls
   - Add monitoring

4. **Test Hardening**
   - Test security controls
   - Test safety controls
   - Test isolation

**Deliverable:** Architecture hardening report including:
- Current architecture review
- Vulnerability assessment
- Hardening recommendations
- Implementation plan
- Testing strategy

---

## 7.7 Artefact: Architecture Hardening Recommendations

### Template: LLM Architecture Hardening Document

Create a comprehensive architecture hardening document.

**Structure:**

1. **Current Architecture Review**
   - Architecture overview
   - Component analysis
   - Current security measures
   - Current safety measures

2. **Vulnerability Assessment**
   - Security vulnerabilities
   - Safety vulnerabilities
   - Compliance gaps
   - Risk assessment

3. **Hardening Recommendations**
   - RAG hardening
   - Model selection improvements
   - Prompt management enhancements
   - Tool sandboxing improvements
   - Context isolation improvements

4. **Implementation Plan**
   - Priority ranking
   - Implementation steps
   - Testing requirements
   - Rollout plan

5. **Monitoring and Validation**
   - Monitoring requirements
   - Validation tests
   - Ongoing assessment
   - Review schedule

**Example Recommendations:**

**RAG Hardening:**
- ✅ Implement approved content source validation
- ✅ Add source attribution to all responses
- ✅ Implement content versioning
- ✅ Add content update approval workflow

**Model Selection:**
- ✅ Use high-safety model for critical decisions
- ✅ Implement model routing based on risk
- ✅ Add output constraints for medical terms
- ✅ Enable refusal behavior for uncertain cases

**Prompt Management:**
- ✅ Implement prompt versioning system
- ✅ Require approval for prompt changes
- ✅ Add prompt testing framework
- ✅ Implement gradual rollout for prompt updates

**Tool Sandboxing:**
- ✅ Enforce permission-based tool access
- ✅ Add resource limits to tool execution
- ✅ Implement input/output validation
- ✅ Add tool execution logging

**Context Isolation:**
- ✅ Implement session-based context isolation
- ✅ Add context expiration and cleanup
- ✅ Sanitize data before LLM processing
- ✅ Validate no cross-context leakage

**Deliverable:** 10-15 page architecture hardening recommendations document.

---

## 7.8 Key Takeaways

**Safe LLM Architecture Fundamentals:**
- RAG with approved clinical content prevents hallucinations
- Model selection and constraints reduce risk
- Prompt versioning enables safe changes
- Tool sandboxing prevents unauthorized actions
- Context isolation prevents data leakage

**Design Principles:**
- Use only approved, validated clinical content
- Apply constraints to model outputs
- Version control all prompts
- Sandbox all tool executions
- Isolate contexts to prevent leakage

**Next Steps:**
- Implement RAG with approved content sources
- Add model selection and constraint strategies
- Set up prompt versioning and change control
- Implement tool sandboxing
- Design context isolation mechanisms

---

## Additional Resources

**Readings:**
- "RAG for Healthcare AI" - Clinical RAG systems
- "LLM Safety and Constraints" - Model safety
- "Prompt Engineering for Healthcare" - Medical prompts
- "Tool Calling in AI Systems" - Tool integration

**Videos:**
- "Safe LLM Architectures" (40 min)
- "RAG with Clinical Content" (35 min)

**Tools to Explore:**
- Vector databases for RAG
- Prompt versioning tools
- Tool sandboxing frameworks
- Context management systems

**Next Module Preview:**
Module 8 will explore observability, monitoring, and incident response for AI systems, including what to log, how to monitor, and how to respond to incidents.

---

**Module 7 Complete**  
**Next:** Module 8 - Observability, Monitoring & Incident Response
