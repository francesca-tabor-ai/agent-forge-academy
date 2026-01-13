---
title: "Module 2: Designing the Sales Org as a Multi-Agent System"
description: "Org Charts → Agent Graphs"
module: "2"
order: 2
email_takeaway: "Translate your sales org chart into an agent architecture. Define managers, specialists, executors, and what escalates to humans."
email_action: "Build your full agent org map—from CSO to teams to specialists. Identify escalation points."
---

# Module 2: Designing the Sales Org as a Multi-Agent System
**Org Charts → Agent Graphs**

**Duration:** Week 2  
**Learning Objectives:**
- Translate a sales org into an agent architecture
- Define managers, specialists, and executors
- Decide what escalates to a human (and what never should)
- Understand hierarchical vs mesh agent systems
- Learn about latency, autonomy, and trust thresholds
- Design the human "executive loop"

---

## 2.1 Translating Org Charts to Agent Graphs

### Traditional Sales Org Chart

```
Chief Sales Officer (CSO)
├── VP of Sales
│   ├── Sales Manager (Enterprise)
│   │   ├── Account Executive 1
│   │   ├── Account Executive 2
│   │   └── Business Development Rep
│   └── Sales Manager (SMB)
│       ├── Account Executive 3
│       └── Sales Development Rep
└── RevOps Manager
    ├── Data Analyst
    └── CRM Administrator
```

### Agent Graph Equivalent

```
CSO Agent (Orchestrator)
├── Outreach Team (Manager Agent)
│   ├── Email Outreach Agent (Specialist)
│   ├── LinkedIn Outreach Agent (Specialist)
│   ├── Cold Call Agent (Specialist)
│   └── Event Outreach Agent (Specialist)
├── Qualification Team (Manager Agent)
│   ├── Lead Scoring Agent (Specialist)
│   ├── Research Agent (Specialist)
│   └── Qualification Agent (Specialist)
├── Sales Team (Manager Agent)
│   ├── Discovery Agent (Specialist)
│   ├── Demo Agent (Specialist)
│   ├── Proposal Agent (Specialist)
│   └── Negotiation Agent (Specialist)
└── RevOps Team (Manager Agent)
    ├── CRM Agent (Specialist)
    ├── Pipeline Agent (Specialist)
    └── Analytics Agent (Specialist)
```

### Key Differences

**Org Chart:**
- Focuses on **people** and **hierarchy**
- Fixed roles and responsibilities
- Communication through management chain
- Scaling = hiring more people

**Agent Graph:**
- Focuses on **functions** and **capabilities**
- Dynamic roles based on needs
- Direct communication between agents
- Scaling = deploying more agents

---

## 2.2 Manager Agents vs Execution Agents

### Manager Agents

**Role:** Orchestrate, delegate, and coordinate

**Responsibilities:**
- Receive high-level objectives
- Break down into tasks
- Assign tasks to specialist agents
- Monitor progress
- Handle escalations
- Aggregate results

**Example: Outreach Manager Agent**

```python
class OutreachManagerAgent:
    def __init__(self):
        self.specialists = {
            'email': EmailOutreachAgent(),
            'linkedin': LinkedInOutreachAgent(),
            'call': ColdCallAgent(),
            'event': EventOutreachAgent()
        }
    
    async def execute_outreach(self, prospect, channels):
        """Orchestrate multichannel outreach"""
        tasks = []
        
        for channel in channels:
            if channel in self.specialists:
                task = self.specialists[channel].outreach(prospect)
                tasks.append(task)
        
        results = await asyncio.gather(*tasks)
        return self.aggregate_results(results)
    
    def handle_escalation(self, issue):
        """Escalate to CSO agent if needed"""
        if issue.severity == 'high':
            return self.escalate_to_cso(issue)
        else:
            return self.handle_locally(issue)
```

### Execution Agents

**Role:** Execute specific tasks with high precision

**Responsibilities:**
- Receive specific task assignments
- Execute using specialized tools
- Report results
- Escalate issues
- Learn from feedback

**Example: Email Outreach Agent**

```python
class EmailOutreachAgent:
    def __init__(self):
        self.email_api = EmailAPI()
        self.personalization_engine = PersonalizationEngine()
        self.crm = CRM()
    
    async def outreach(self, prospect):
        """Send personalized email to prospect"""
        # Research prospect
        research = await self.research_prospect(prospect)
        
        # Generate personalized message
        message = self.personalization_engine.generate(
            prospect=prospect,
            research=research,
            template='outreach'
        )
        
        # Send email
        result = await self.email_api.send(
            to=prospect.email,
            subject=message.subject,
            body=message.body
        )
        
        # Update CRM
        await self.crm.log_interaction(
            prospect_id=prospect.id,
            type='email_outreach',
            result=result
        )
        
        return result
```

### The Relationship

**Manager Agents:**
- Think strategically
- Coordinate multiple specialists
- Handle complexity
- Make routing decisions

**Execution Agents:**
- Execute tactically
- Focus on one task
- Optimize for precision
- Report status

---

## 2.3 Hierarchical vs Mesh Agent Systems

### Hierarchical Systems

**Structure:**
```
CSO Agent
  └── Manager Agents
      └── Specialist Agents
```

**Characteristics:**
- Clear chain of command
- Centralized decision-making
- Predictable communication paths
- Easier to reason about

**Use When:**
- Clear organizational structure
- Need centralized control
- Predictable workflows
- Simple escalation paths

**Example:**
```python
# Hierarchical: All communication goes through manager
cso_agent → outreach_manager → email_agent
cso_agent → outreach_manager → linkedin_agent
```

### Mesh Systems

**Structure:**
```
CSO Agent
  ├── Manager Agents (can communicate directly)
  └── Specialist Agents (can communicate directly)
```

**Characteristics:**
- Direct agent-to-agent communication
- Distributed decision-making
- Flexible communication paths
- More complex to reason about

**Use When:**
- Need fast communication
- Agents need to collaborate directly
- Complex workflows
- Dynamic routing

**Example:**
```python
# Mesh: Agents can communicate directly
email_agent ↔ linkedin_agent  # Coordinate messaging
research_agent → qualification_agent  # Direct handoff
crm_agent ↔ pipeline_agent  # Real-time updates
```

### Hybrid Approach

**Best Practice:** Use hierarchical for structure, mesh for efficiency

```
CSO Agent (hierarchical)
  ├── Manager Agents (hierarchical)
  │   └── Specialist Agents (mesh for collaboration)
```

**Example:**
- Manager assigns tasks (hierarchical)
- Specialists coordinate directly (mesh)
- Manager monitors and escalates (hierarchical)

---

## 2.4 Latency, Autonomy, and Trust Thresholds

### Latency Thresholds

**Definition:** Maximum acceptable delay before human intervention

**Low Latency (< 1 minute):**
- Real-time customer interactions
- Time-sensitive decisions
- Critical escalations

**Medium Latency (1-60 minutes):**
- Email responses
- Lead routing
- Data updates

**High Latency (hours to days):**
- Research tasks
- Report generation
- Batch processing

**Design Principle:**
- Set latency SLAs per agent type
- Monitor and alert on violations
- Automatically escalate if threshold exceeded

### Autonomy Thresholds

**Definition:** Level of independence an agent has before requiring approval

**Level 1: Fully Autonomous**
- No human approval needed
- Clear rules and boundaries
- Low-risk decisions only

**Level 2: Autonomous with Review**
- Agent acts, human reviews later
- Medium-risk decisions
- Periodic audit

**Level 3: AI-Assisted**
- Agent proposes, human decides
- High-risk decisions
- Real-time approval

**Level 4: Human-Driven**
- Human decides, agent supports
- Critical decisions
- Full human control

**Example Thresholds:**
```python
AUTONOMY_THRESHOLDS = {
    'email_outreach': 'fully_autonomous',  # Low risk
    'proposal_generation': 'autonomous_with_review',  # Medium risk
    'pricing_negotiation': 'ai_assisted',  # High risk
    'contract_signing': 'human_driven'  # Critical
}
```

### Trust Thresholds

**Definition:** Confidence level required before agent action

**High Trust (> 90%):**
- Automated actions
- Low-risk decisions
- Well-tested agents

**Medium Trust (70-90%):**
- AI-assisted actions
- Medium-risk decisions
- Human review recommended

**Low Trust (< 70%):**
- Human-driven actions
- High-risk decisions
- Agent provides input only

**Building Trust:**
1. Start with high-trust, low-risk tasks
2. Monitor performance closely
3. Gradually increase autonomy
4. Maintain audit logs

---

## 2.5 The Human "Executive Loop"

### What is the Executive Loop?

The **executive loop** is the human's role in an agentic sales system:
- **Strategic decisions:** Direction, priorities, goals
- **Exception handling:** Complex cases, edge cases
- **Quality control:** Review, approve, course-correct
- **Learning:** Provide feedback to improve agents

### When Humans Intervene

**Strategic Decisions:**
- Setting sales targets
- Defining target markets
- Approving new campaigns
- Making pricing decisions

**Exception Handling:**
- Complex customer situations
- Legal/contractual issues
- Competitive threats
- System failures

**Quality Control:**
- Review agent outputs
- Approve high-value actions
- Course-correct mistakes
- Provide feedback

**Learning:**
- Label training data
- Provide examples
- Correct agent mistakes
- Update guidelines

### Designing the Loop

**Principle:** Minimize human involvement while maximizing value

**Bad Design:**
```
Agent → Human approval → Agent → Human approval → ...
```
Too many interruptions, low autonomy

**Good Design:**
```
Agent (autonomous) → Periodic human review → Agent (improved)
```
High autonomy, strategic human input

**Example:**
```python
class ExecutiveLoop:
    def __init__(self):
        self.review_schedule = {
            'daily': ['pipeline_summary', 'anomalies'],
            'weekly': ['performance_review', 'strategy'],
            'monthly': ['agent_improvements', 'goals']
        }
    
    async def daily_review(self):
        """Daily strategic review"""
        pipeline = await self.get_pipeline_summary()
        anomalies = await self.detect_anomalies()
        
        # Human reviews and provides feedback
        feedback = await self.human_review(pipeline, anomalies)
        
        # Update agents based on feedback
        await self.update_agents(feedback)
```

---

## 2.6 What Escalates to Humans (And What Never Should)

### Never Escalate

**Routine Tasks:**
- ✅ Sending follow-up emails
- ✅ Updating CRM records
- ✅ Scheduling meetings
- ✅ Generating standard reports
- ✅ Researching prospects

**Low-Risk Decisions:**
- ✅ Lead scoring
- ✅ Email personalization
- ✅ Follow-up timing
- ✅ Data entry
- ✅ Status updates

**Why:** These are well-defined, low-risk, high-volume tasks. Escalating them creates bottlenecks.

### Always Escalate

**Legal/Contractual:**
- ❌ Contract negotiations
- ❌ Pricing below floor
- ❌ Terms and conditions changes
- ❌ Legal compliance issues

**Strategic:**
- ❌ New market entry
- ❌ Product positioning changes
- ❌ Competitive strategy
- ❌ Major account decisions

**Why:** These require judgment, context, and accountability that only humans can provide.

### Conditionally Escalate

**High-Value Actions:**
- 🤔 Proposals > $100K
- 🤔 Enterprise account outreach
- 🤔 Competitive situations
- 🤔 Customer complaints

**Anomalies:**
- 🤔 Unusual patterns detected
- 🤔 Agent confidence low
- 🤔 System errors
- 🤔 Unexpected responses

**Why:** These need human judgment but can be automated with proper thresholds.

### Escalation Framework

```python
class EscalationFramework:
    def should_escalate(self, action, context):
        """Determine if action should escalate to human"""
        
        # Never escalate routine tasks
        if action.type in ROUTINE_TASKS:
            return False
        
        # Always escalate critical items
        if action.type in CRITICAL_ITEMS:
            return True
        
        # Conditionally escalate based on thresholds
        if action.value > ESCALATION_THRESHOLD:
            return True
        
        if context.confidence < CONFIDENCE_THRESHOLD:
            return True
        
        if context.anomaly_detected:
            return True
        
        return False
```

---

## 2.7 Exercise: Build Your Agent Org Map

### Objective

Design your complete agent organization:
1. Map CSO → Teams → Specialists
2. Define manager and execution agents
3. Identify escalation points
4. Design communication flows

### Instructions

**Step 1: Define Your CSO Agent**

What does your CSO agent do?
- Strategic objectives
- KPI monitoring
- Team coordination
- Escalation handling

**Step 2: Design Manager Agents**

What teams do you need?
- Outreach Team
- Qualification Team
- Sales Team
- RevOps Team
- Enablement Team

For each team:
- What is the manager's role?
- What specialists does it coordinate?
- What decisions does it make?

**Step 3: Design Specialist Agents**

For each team, list specialist agents:
- What is each agent's specific function?
- What tools does it use?
- What decisions can it make autonomously?
- When does it escalate?

**Step 4: Map Communication Flows**

- How do agents communicate?
- Hierarchical or mesh?
- What information flows between agents?
- What are the handoff points?

**Step 5: Define Escalation Points**

- What always escalates to humans?
- What never escalates?
- What conditionally escalates?
- What are the thresholds?

### Deliverable

Submit a document with:
1. Agent org map (visual diagram)
2. Agent specifications (role, tools, autonomy)
3. Communication flow diagram
4. Escalation framework
5. Implementation priority (which agents first?)

### Evaluation Criteria

- **Completeness:** All functions covered
- **Clarity:** Clear agent roles and responsibilities
- **Practicality:** Realistic and implementable
- **Escalation:** Well-defined escalation logic
- **Priority:** Clear implementation order

---

## 2.8 Key Takeaways

### Core Concepts

1. **Org charts → Agent graphs:** Translate people-based orgs to function-based agent systems

2. **Manager vs Execution:** Managers orchestrate, specialists execute

3. **Hierarchical vs Mesh:** Use hierarchical for structure, mesh for efficiency

4. **Thresholds matter:** Define latency, autonomy, and trust thresholds for each agent

5. **Executive loop:** Humans handle strategy, exceptions, quality, and learning

6. **Escalation framework:** Never escalate routine tasks, always escalate critical items, conditionally escalate based on thresholds

### Next Steps

- Complete the exercise to design your agent org
- Review Module 3 to learn how to build the CSO agent
- Start thinking about which agents to build first

---

## Additional Resources

### Reading
- "Multi-Agent Systems: A Modern Approach" by Stone & Veloso
- "Designing Agent-Based Systems" by Wooldridge
- "Sales Automation Architecture" by Gartner

### Tools
- Agent frameworks: LangGraph, CrewAI, AutoGen
- Diagramming: Lucidchart, Miro, Draw.io
- Architecture: C4 Model, UML

---

**Previous Module:** [Module 1: The AI-Native Sales Paradigm ←](Module_01_The_AI_Native_Sales_Paradigm.md)  
**Next Module:** [Module 3: The Chief Sales Officer Agent →](Module_03_The_Chief_Sales_Officer_Agent.md)

---

**Version 1.0 | January 2025**
