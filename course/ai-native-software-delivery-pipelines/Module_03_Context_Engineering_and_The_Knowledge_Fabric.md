---
title: "Module 3: Context Engineering & The Knowledge Fabric"
description: "Build knowledge systems that prevent hallucinations and provide accurate context"
module: "3"
order: 3
---

# Module 3: Context Engineering & The Knowledge Fabric

**Duration:** Week 3  
**Learning Objectives:**
- Understand context as the "new backend" for AI agents
- Design Agent Experience (AX) with steering rules and context files
- Deploy knowledge registries using Tessl and MCP servers
- Implement RAG systems with AI-native databases
- Prevent hallucinations through accurate knowledge supply

---

## 3.1 Context as the "New Backend"

### Why Context Matters

In traditional software, the backend is where data lives. In AI-native systems, **context is the new backend**—it's the knowledge that agents need to make accurate decisions and avoid hallucinations.

**The Problem:**
- AI models are trained on general knowledge
- They don't know your specific domain, codebase, or business rules
- Without proper context, agents hallucinate or make incorrect assumptions
- Context must be supplied explicitly and accurately

**The Solution:**
- Build knowledge fabrics that capture proprietary knowledge
- Supply context to agents at the right time
- Use retrieval-augmented generation (RAG) for accurate responses
- Maintain context registries that agents can query

### Context vs. Traditional Backend

**Traditional Backend:**
```text
Application → Database → Data
```

**Context Backend:**
```text
AI Agent → Knowledge Fabric → Context → Accurate Response
```

**Key Differences:**
- **Backend:** Stores transactional data
- **Context:** Stores knowledge and understanding
- **Backend:** Query-based retrieval
- **Context:** Semantic search and retrieval
- **Backend:** Structured data (SQL)
- **Context:** Unstructured knowledge (embeddings, vectors)

### The Knowledge Fabric Concept

A knowledge fabric is a distributed system that:
- Captures institutional knowledge
- Organizes information for agent consumption
- Provides semantic search capabilities
- Maintains accuracy and freshness
- Scales across domains and use cases

**Components:**
```text
Knowledge Fabric
 Knowledge Sources
    Documentation
    Code repositories
    Business rules
    Historical decisions

 Processing Layer
    Embedding generation
    Vector storage
    Indexing

 Retrieval Layer
    Semantic search
    Multi-vector retrieval
    Context ranking

 Delivery Layer
     MCP servers
     API endpoints
     Agent interfaces
```

---

## 3.2 Agent Experience (AX): Steering Rules and Context Files

### What is Agent Experience (AX)?

Agent Experience (AX) is the design of how agents interact with knowledge and context. It's analogous to User Experience (UX) but for AI agents.

**AX Principles:**
1. **Explicit Steering:** Clear rules guide agent behavior
2. **Context Availability:** Knowledge is accessible when needed
3. **Accuracy First:** Prevent hallucinations through proper context
4. **Efficient Retrieval:** Fast access to relevant information
5. **Continuous Learning:** Knowledge fabric improves over time

### Context Files: agents.md

The `agents.md` file is a central context file that provides agents with essential information about your system, codebase, and practices.

**Example agents.md:**
```markdown
# Agent Context Guide

## System Overview
This is an e-commerce platform built with:
- Backend: Node.js + Express
- Database: PostgreSQL
- Frontend: React + TypeScript
- Authentication: JWT tokens

## Codebase Structure
```text
/src
  /api          - REST API endpoints
  /services     - Business logic
  /models       - Database models
  /middleware   - Express middleware
  /utils        - Utility functions
```

## Coding Standards
- Use TypeScript for type safety
- Follow RESTful API conventions
- Write tests for all new features
- Use async/await, not callbacks
- Error handling: Always use try/catch

## Business Rules
- User authentication required for all protected routes
- Orders cannot be cancelled after shipping
- Discount codes cannot be combined
- Inventory is checked before order confirmation

## Common Patterns
- Database queries use Prisma ORM
- API responses follow standard format: { success, data, error }
- Logging uses Winston with structured logs
- Environment variables via dotenv

## Known Issues
- Payment gateway has rate limiting (max 10 req/sec)
- Image uploads limited to 5MB
- Session timeout: 24 hours

## Dependencies
- @prisma/client - Database ORM
- express - Web framework
- jsonwebtoken - Authentication
- bcrypt - Password hashing
```

### Steering Rules

Steering rules explicitly guide agent behavior to prevent errors and ensure consistency.

**Example Steering Rules:**
```yaml
steering_rules:
  - id: "RULE-001"
    name: "Always check authentication"
    description: "Before accessing protected resources, verify JWT token"
    applies_to: ["all_api_endpoints"]
    enforcement: "required"
    example: |
      // CORRECT
      const user = await verifyToken(req.headers.authorization);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      
      // INCORRECT
      // Missing authentication check
      const data = await getProtectedData();

  - id: "RULE-002"
    name: "Use Prisma for database queries"
    description: "Never write raw SQL, always use Prisma ORM"
    applies_to: ["database_operations"]
    enforcement: "required"
    example: |
      // CORRECT
      const user = await prisma.user.findUnique({ where: { id } });
      
      // INCORRECT
      const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);

  - id: "RULE-003"
    name: "Handle errors explicitly"
    description: "Always use try/catch for async operations"
    applies_to: ["async_operations"]
    enforcement: "required"
    example: |
      // CORRECT
      try {
        const result = await asyncOperation();
        return res.json({ success: true, data: result });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
      
      // INCORRECT
      const result = await asyncOperation();
      return res.json({ success: true, data: result });
```

### Context File Best Practices

**1. Keep It Updated**
- Update when codebase changes
- Reflect current practices
- Remove outdated information

**2. Be Specific**
- Include concrete examples
- Show correct and incorrect patterns
- Provide code snippets

**3. Organize by Domain**
- Group related information
- Use clear headings
- Create separate files for large domains

**4. Include Business Context**
- Business rules and constraints
- Domain-specific knowledge
- Historical decisions and rationale

**5. Make It Searchable**
- Use clear headings
- Include keywords
- Structure for semantic search

---

## 3.3 Knowledge Registries: Tessl and MCP Servers

### What are Knowledge Registries?

Knowledge registries are systems that act as dependency managers for knowledge, similar to how package managers (npm, pip) handle code dependencies.

**Tessl Registries:**
Tessl (Template Specification Language) registries provide a way to:
- Store reusable knowledge templates
- Share context across projects
- Version control knowledge
- Manage knowledge dependencies

**Example Tessl Registry:**
```yaml
registry: company-knowledge
version: 1.2.0

knowledge_units:
  - id: "auth-patterns"
    name: "Authentication Patterns"
    description: "Standard authentication patterns for our applications"
    content: |
      # Authentication Patterns
      
      ## JWT Token Structure
      {
        "userId": "string",
        "email": "string",
        "role": "admin|user|guest",
        "exp": timestamp
      }
      
      ## Token Verification
      1. Extract token from Authorization header
      2. Verify signature using JWT_SECRET
      3. Check expiration
      4. Validate user still exists in database
      
    dependencies: []
    tags: ["authentication", "security", "jwt"]
  
  - id: "database-schema"
    name: "Database Schema"
    description: "Standard database schema patterns"
    content: |
      # Database Schema Patterns
      
      ## User Table
      - id: UUID (primary key)
      - email: string (unique, indexed)
      - password_hash: string
      - created_at: timestamp
      - updated_at: timestamp
      
    dependencies: []
    tags: ["database", "schema"]
```

### Model Context Protocol (MCP) Servers

MCP servers provide a standardized way for AI agents to connect to knowledge sources and tools.

**MCP Architecture:**
```text
AI Agent (Client)
     (MCP Protocol)
MCP Server
    
Knowledge Source / Tool
```

**MCP Server Example:**
```typescript
// mcp-server.ts
import { Server } from '@modelcontextprotocol/sdk/server';
import { KnowledgeBase } from './knowledge-base';

class KnowledgeMCPServer {
  private server: Server;
  private knowledgeBase: KnowledgeBase;

  constructor() {
    this.server = new Server({
      name: 'company-knowledge-server',
      version: '1.0.0'
    });
    
    this.knowledgeBase = new KnowledgeBase();
    this.setupHandlers();
  }

  setupHandlers() {
    // Handle knowledge queries
    this.server.setRequestHandler('knowledge/query', async (request) => {
      const { query, context } = request.params;
      
      // Search knowledge base
      const results = await this.knowledgeBase.search(query, {
        context,
        limit: 10
      });
      
      return {
        results: results.map(r => ({
          id: r.id,
          content: r.content,
          relevance: r.score,
          source: r.source
        }))
      };
    });

    // Handle context retrieval
    this.server.setRequestHandler('knowledge/context', async (request) => {
      const { topic, depth } = request.params;
      
      const context = await this.knowledgeBase.getContext(topic, depth);
      
      return {
        topic,
        context: context.content,
        relatedTopics: context.related
      };
    });
  }

  async start() {
    await this.server.connect();
    console.log('MCP Knowledge Server started');
  }
}

// Usage
const server = new KnowledgeMCPServer();
server.start();
```

**Agent Using MCP Server:**
```typescript
// agent.ts
import { MCPClient } from '@modelcontextprotocol/sdk/client';

class DevelopmentAgent {
  private mcpClient: MCPClient;

  constructor() {
    this.mcpClient = new MCPClient({
      serverUrl: 'http://localhost:3000/mcp'
    });
  }

  async getContext(topic: string) {
    const response = await this.mcpClient.request('knowledge/context', {
      topic,
      depth: 2
    });
    
    return response.context;
  }

  async searchKnowledge(query: string) {
    const response = await this.mcpClient.request('knowledge/query', {
      query,
      context: 'development'
    });
    
    return response.results;
  }
}
```

### Deploying Knowledge Registries

**Step 1: Create Knowledge Base**
- Collect documentation
- Extract code patterns
- Document business rules
- Organize by domain

**Step 2: Set Up MCP Server**
- Implement MCP protocol
- Connect to knowledge base
- Expose query endpoints
- Add authentication

**Step 3: Connect Agents**
- Configure agents to use MCP
- Test knowledge retrieval
- Monitor query patterns
- Optimize for common queries

---

## 3.4 Retrieval-Augmented Generation (RAG)

### What is RAG?

Retrieval-Augmented Generation combines:
- **Retrieval:** Finding relevant context from knowledge base
- **Augmentation:** Adding context to AI prompts
- **Generation:** AI generates response with accurate context

**RAG Workflow:**
```text
User Query
    ↓
Semantic Search (Knowledge Base)
    ↓
Retrieve Relevant Context
    ↓
Augment Prompt with Context
    ↓
AI Generates Response
    ↓
Accurate, Context-Aware Answer
```

### AI-Native Databases for RAG

**Infinity:**
- Hybrid search (vector + keyword)
- Real-time indexing
- Scalable architecture
- Multi-modal support

**Vearch:**
- Multi-vector retrieval
- High-performance search
- Distributed architecture
- Advanced ranking

**Example with Infinity:**
```typescript
import { InfinityClient } from '@infinity/client';

class RAGSystem {
  private infinity: InfinityClient;
  private knowledgeBase: string;

  constructor() {
    this.infinity = new InfinityClient({
      endpoint: process.env.INFINITY_ENDPOINT
    });
    this.knowledgeBase = 'company-knowledge';
  }

  async query(userQuery: string): Promise<string> {
    // 1. Retrieve relevant context
    const results = await this.infinity.search({
      collection: this.knowledgeBase,
      query: userQuery,
      limit: 5,
      hybrid: true // Vector + keyword search
    });

    // 2. Augment prompt with context
    const context = results.map(r => r.content).join('\n\n');
    
    const prompt = `
Context from knowledge base:
${context}

User question: ${userQuery}

Answer based on the context provided. If the answer is not in the context, say so.
`;

    // 3. Generate response
    const response = await this.generateWithAI(prompt);
    
    return response;
  }

  private async generateWithAI(prompt: string): Promise<string> {
    // Use your AI provider (OpenAI, Anthropic, etc.)
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    });
    
    return response.choices[0].message.content;
  }
}
```

### Multi-Vector Retrieval

For complex queries, retrieve multiple types of context:

```typescript
async multiVectorQuery(query: string) {
  // Retrieve different types of context
  const [codeContext, docContext, businessContext] = await Promise.all([
    this.searchCodebase(query),
    this.searchDocumentation(query),
    this.searchBusinessRules(query)
  ]);

  // Combine contexts
  const augmentedPrompt = `
Code Context:
${codeContext}

Documentation:
${docContext}

Business Rules:
${businessContext}

Query: ${query}
`;

  return this.generateWithAI(augmentedPrompt);
}
```

### Preventing Hallucinations

**Strategies:**
1. **Always Provide Context:** Never let AI answer from training data alone
2. **Verify Sources:** Include source citations in responses
3. **Confidence Scoring:** Only use high-confidence retrievals
4. **Fallback Behavior:** If no context found, say so explicitly
5. **Continuous Monitoring:** Track when AI goes beyond provided context

**Example with Verification:**
```typescript
async safeQuery(query: string) {
  const results = await this.infinity.search({
    query,
    minScore: 0.7 // Only high-confidence matches
  });

  if (results.length === 0) {
    return {
      answer: "I don't have enough context to answer this question accurately.",
      sources: [],
      confidence: 0
    };
  }

  const answer = await this.generateWithAI(/* augmented prompt */);
  
  // Verify answer is grounded in context
  const isGrounded = await this.verifyGroundedness(answer, results);
  
  if (!isGrounded) {
    return {
      answer: "I'm not confident about this answer based on available context.",
      sources: results.map(r => r.source),
      confidence: 0.5
    };
  }

  return {
    answer,
    sources: results.map(r => r.source),
    confidence: 0.9
  };
}
```

---

## 3.5 Building Your Knowledge Fabric

### Step-by-Step Implementation

**Step 1: Identify Knowledge Sources**
- Code repositories
- Documentation
- Business rules documents
- Historical decisions
- Team knowledge

**Step 2: Process and Index**
- Generate embeddings
- Create vector indices
- Build search indexes
- Organize by domain

**Step 3: Set Up Retrieval**
- Deploy RAG system
- Configure MCP servers
- Set up knowledge registries
- Create agent interfaces

**Step 4: Connect Agents**
- Configure agents to use knowledge fabric
- Test retrieval accuracy
- Monitor usage patterns
- Optimize for performance

**Step 5: Maintain and Update**
- Regular knowledge updates
- Remove outdated information
- Add new knowledge sources
- Improve retrieval quality

---

## 3.6 Key Takeaways

**Context as New Backend:**
- Context is where knowledge lives for AI agents
- Knowledge fabrics organize and deliver context
- Semantic search enables accurate retrieval

**Agent Experience (AX):**
- Design explicit steering rules
- Create comprehensive context files (agents.md)
- Guide agent behavior to prevent errors

**Knowledge Registries:**
- Tessl registries for reusable knowledge
- MCP servers for standardized agent connections
- Version control and dependency management for knowledge

**RAG Systems:**
- Combine retrieval and generation
- Use AI-native databases (Infinity, Vearch)
- Multi-vector retrieval for complex queries
- Prevent hallucinations through proper context

---

## Lab 3: Build Knowledge Fabric with MCP Server

**Objective:** Create a complete knowledge fabric with MCP server integration

**Requirements:**
1. Choose a domain (your codebase, a project, or a business domain)
2. Create a knowledge base with:
   - At least 20 knowledge units
   - Organized by topics/domains
   - Include code examples, patterns, and business rules
3. Set up an MCP server that:
   - Exposes knowledge query endpoints
   - Provides context retrieval
   - Handles semantic search
4. Implement a RAG system using Infinity or Vearch:
   - Index knowledge base
   - Implement hybrid search
   - Generate context-augmented responses
5. Create an agent that uses the MCP server
6. Test the system with sample queries
7. Document the architecture and usage

**Deliverables:**
- Knowledge base (structured data)
- MCP server implementation
- RAG system code
- Agent integration example
- Test results and query examples
- Architecture documentation (500 words)

**Evaluation Criteria:**
- Knowledge base completeness (25%)
- MCP server functionality (25%)
- RAG system implementation (25%)
- Agent integration quality (15%)
- Documentation quality (10%)

**Time Estimate:** 5-6 hours

---

## Additional Resources

**Readings:**
- "Context Engineering for AI Agents" - Best practices
- "Model Context Protocol Specification" - Official docs
- "RAG Systems: Design and Implementation" - Technical guide

**Videos:**
- "Building Knowledge Fabrics" (40 min)
- "MCP Server Implementation" (35 min)
- "RAG with AI-Native Databases" (30 min)

**Tools:**
- [Model Context Protocol](https://modelcontextprotocol.io/)
- Infinity documentation
- Vearch documentation
- Embedding models (OpenAI, Cohere, etc.)

**Next Module Preview:**
Module 4 will teach you how to orchestrate multi-agent systems using MCP and manage agent swarms for complex development tasks.

---

**Module 3 Complete**   
**Next:** Module 4 - Agent Orchestration & Protocol Layers
