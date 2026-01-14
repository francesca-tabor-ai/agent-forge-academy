---
title: "Module 2: Choosing the Right Automation Targets"
description: "What to Automate First (and What Not To) - Identify low-friction automation opportunities and avoid automating judgment-heavy or identity-linked tasks"
module: "2"
order: 2
---

# Module 2: Choosing the Right Automation Targets

**What to Automate First (and What Not To)**

**Duration:** Week 2  
**Learning Objectives:**
- Identify low-friction automation opportunities
- Distinguish between monitoring, decision-making, and creation tasks
- Recognize repetitive, cross-team, and "orphan" tasks
- Understand automation as glue between teams
- Identify red flags for politically sensitive workflows
- Create an Automation Opportunity Backlog and "Do Not Automate" list

---

## Lesson 2.1: Monitoring vs Decision-Making vs Creation

### The Task Taxonomy

**Monitoring Tasks (High Automation Potential):**
- Observing and tracking
- Collecting and aggregating data
- Detecting patterns and anomalies
- Generating alerts and notifications
- Low judgment required
- High repetition
- Clear rules and thresholds

**Decision-Making Tasks (Medium Automation Potential):**
- Evaluating options
- Making choices based on context
- Balancing trade-offs
- Requiring judgment and experience
- Variable inputs
- Context-dependent outcomes

**Creation Tasks (Low Automation Potential):**
- Generating new ideas
- Creating original content
- Building relationships
- Requiring creativity and intuition
- Unique outputs
- Human touch essential

### The Automation Sweet Spot

**Ideal Automation Targets:**
- Monitoring tasks with clear rules
- Repetitive data processing
- Cross-team coordination
- "Orphan" tasks (no clear owner)
- Low-stakes, high-volume work

**Risky Automation Targets:**
- High-stakes decision-making
- Creative and strategic work
- Relationship-building
- Identity-linked tasks
- Judgment-heavy workflows

### Examples: Task Classification

**Example 1: Customer Support**

**Monitoring (Automate):**
- Tracking ticket volumes
- Detecting SLA breaches
- Identifying common issues
- Generating status reports

**Decision-Making (Augment):**
- Prioritizing tickets
- Escalating complex issues
- Recommending solutions
- Human makes final call

**Creation (Preserve):**
- Building customer relationships
- Crafting personalized responses
- Developing creative solutions
- Human expertise essential

**Example 2: Content Moderation**

**Monitoring (Automate):**
- Scanning for flagged content
- Detecting policy violations
- Tracking moderation metrics
- Generating compliance reports

**Decision-Making (Augment):**
- Reviewing flagged content
- Making removal decisions
- Handling edge cases
- Human judgment required

**Creation (Preserve):**
- Setting moderation policies
- Building community guidelines
- Developing trust with users
- Human values essential

---

## Lesson 2.2: Repetitive, Cross-Team, and "Orphan" Tasks

### Repetitive Tasks

**Characteristics:**
- Same process repeated many times
- Clear, consistent rules
- Low variation in inputs
- Predictable outputs
- High volume, low complexity

**Automation Benefits:**
- Eliminates human error
- Increases consistency
- Frees time for higher-value work
- Scales without linear cost increase

**Examples:**
- Data entry and validation
- Report generation
- Email routing and triage
- Status updates and notifications
- Data synchronization

### Cross-Team Tasks

**Characteristics:**
- Require coordination across teams
- Information handoffs
- Status updates and communication
- Often fall through cracks
- Create friction and delays

**Automation Benefits:**
- Reduces coordination overhead
- Ensures information flow
- Eliminates handoff errors
- Creates visibility across teams

**Examples:**
- Project status updates
- Cross-team notifications
- Data sharing and synchronization
- Workflow handoffs
- Dependency tracking

### "Orphan" Tasks

**Characteristics:**
- No clear owner or responsibility
- Everyone's problem = no one's problem
- Often get deprioritized
- Create bottlenecks
- Low visibility

**Automation Benefits:**
- Assigns clear ownership (to automation)
- Ensures consistent execution
- Eliminates deprioritization
- Creates accountability

**Examples:**
- Documentation updates
- Compliance checks
- Data quality monitoring
- System health checks
- Backup and maintenance tasks

### The Automation as Glue Principle

**Concept:**
Automation can serve as "glue" that connects teams, processes, and systems without requiring human coordination.

**Benefits:**
- Reduces coordination friction
- Ensures consistency
- Creates visibility
- Eliminates handoff errors
- Scales without adding people

**Implementation:**
- Identify handoff points
- Automate information flow
- Create shared visibility
- Eliminate manual coordination
- Build trust through consistency

---

## Lesson 2.3: Automation as Glue Between Teams

### The Coordination Problem

**Traditional Approach:**
```
Team A → Manual Handoff → Team B → Manual Handoff → Team C
         (Email, Slack)              (Email, Slack)
```

**Problems:**
- Information gets lost
- Handoffs are delayed
- Status is unclear
- Accountability is fuzzy
- Errors accumulate

### The Automation Solution

**Automated Approach:**
```
Team A → Automated System → Team B → Automated System → Team C
         (Real-time sync)            (Real-time sync)
```

**Benefits:**
- Information flows automatically
- Handoffs happen instantly
- Status is always visible
- Accountability is clear
- Errors are caught early

### Real-World Example: AI Visibility Operations

**The Problem:**
- Marketing creates content
- Engineering monitors AI answers
- Product tracks visibility
- Analytics measures impact
- Manual coordination creates delays and errors

**The Automation Solution:**
- Automated content monitoring
- Real-time AI answer tracking
- Automated visibility reporting
- Cross-team dashboards
- Automated alert routing

**Result:**
- Faster response to issues
- Better cross-team visibility
- Reduced coordination overhead
- Improved quality and consistency

### Building Automation Glue

**Step 1: Map Handoff Points**
- Identify where information moves between teams
- Document current handoff process
- Identify pain points and delays

**Step 2: Design Automated Flows**
- Create automated information pipelines
- Build real-time synchronization
- Design status and visibility systems

**Step 3: Implement and Iterate**
- Start with high-value handoffs
- Measure impact and adjust
- Expand to additional handoffs

---

## Lesson 2.4: Red Flags for Politically Sensitive Workflows

### The Sensitivity Spectrum

**Low Sensitivity (Safe to Automate):**
- Backend data processing
- Infrastructure monitoring
- Automated reporting
- System maintenance
- Low-visibility tasks

**Medium Sensitivity (Proceed with Caution):**
- Customer-facing processes
- Decision-support systems
- Workflow automation
- Cross-team coordination
- Visible but non-critical

**High Sensitivity (Avoid or Augment Only):**
- Performance evaluations
- Hiring and promotion decisions
- Budget allocations
- Strategic planning
- Identity-linked work

### Red Flag Indicators

**1. Identity-Linked Tasks**
- Work that defines someone's role
- Tasks that provide sense of purpose
- Activities that build reputation
- Work that creates professional identity

**Example:**
- Automating a designer's creative work
- Automating a strategist's analysis
- Automating a relationship manager's client interactions

**2. High-Stakes Decision-Making**
- Decisions with significant consequences
- Choices that affect careers
- Judgments that impact business outcomes
- Decisions requiring accountability

**Example:**
- Automating hiring decisions
- Automating performance reviews
- Automating budget allocations
- Automating strategic choices

**3. Relationship-Building Work**
- Tasks that build trust
- Activities that create connections
- Work that requires human touch
- Interactions that define culture

**Example:**
- Automating client relationships
- Automating team building
- Automating mentorship
- Automating culture-building

**4. Creative and Strategic Work**
- Tasks requiring original thinking
- Work that generates new ideas
- Activities that shape direction
- Outputs that define differentiation

**Example:**
- Automating creative design
- Automating strategic planning
- Automating innovation
- Automating differentiation

**5. Work with Past Automation Failures**
- Areas with previous layoffs
- Functions with broken promises
- Teams with lost trust
- Processes with negative history

**Example:**
- Previous automation that eliminated jobs
- Past initiatives that failed
- Teams with automation trauma
- Functions with resistance history

### The Sensitivity Assessment Framework

**For Each Automation Opportunity, Assess:**

1. **Identity Link:**
   - Does this work define someone's role?
   - Would automating it threaten identity?
   - Can we reframe the value?

2. **Stakes Level:**
   - What are the consequences of errors?
   - Who is accountable for outcomes?
   - Can humans maintain control?

3. **Relationship Impact:**
   - Does this work build relationships?
   - Is human touch essential?
   - Can we preserve connection?

4. **Creative Requirement:**
   - Does this require original thinking?
   - Is creativity essential?
   - Can we augment without replacing?

5. **Historical Context:**
   - Are there past failures?
   - Is there existing resistance?
   - Can we build trust first?

### Mitigation Strategies

**For High-Sensitivity Areas:**
- Start with augmentation, not automation
- Preserve human authority
- Build trust through small wins
- Provide clear value proposition
- Offer transition support

**For Medium-Sensitivity Areas:**
- Proceed with caution
- Involve stakeholders early
- Provide transparency
- Build in human oversight
- Create opt-out mechanisms

**For Low-Sensitivity Areas:**
- Proceed with confidence
- Communicate clearly
- Celebrate wins
- Build momentum
- Expand gradually

---

## Practical Exercise 1: Automation Opportunity Backlog

### Objective
Create a comprehensive backlog of automation opportunities, prioritized by impact, feasibility, and risk.

### Steps

#### Step 1: Identify All Opportunities (45 minutes)

1. **Brainstorm Automation Candidates:**
   - List all manual processes
   - Identify repetitive tasks
   - Find cross-team handoffs
   - Locate "orphan" tasks
   - Document pain points

2. **Categorize by Task Type:**
   ```
   Opportunity | Type | Description
   -----------|------|------------
   [Example]  | Monitoring | Track AI answer quality
   [Example]  | Decision | Prioritize content updates
   [Example]  | Creation | Generate creative content
   ```

3. **Classify by Characteristics:**
   - Repetitive vs. unique
   - Cross-team vs. single-team
   - Orphan vs. owned
   - High-volume vs. low-volume

#### Step 2: Assess Automation Potential (45 minutes)

1. **Evaluate Each Opportunity:**
   ```
   Opportunity | Automation Potential | Reasoning
   -----------|---------------------|----------
   [Example]  | High                | Repetitive, clear rules
   [Example]  | Medium              | Requires some judgment
   [Example]  | Low                 | Creative, identity-linked
   ```

2. **Consider Factors:**
   - Technical feasibility
   - Data availability
   - Rule clarity
   - Judgment requirements
   - Stakeholder sensitivity

3. **Identify Quick Wins:**
   - High impact, low effort
   - Low risk, high value
   - Clear rules, available data
   - Low sensitivity, high support

#### Step 3: Prioritize by Impact and Risk (30 minutes)

1. **Create Impact-Risk Matrix:**
   ```
   High Impact, Low Risk  | High Impact, High Risk
   -----------------------|----------------------
   Low Impact, Low Risk   | Low Impact, High Risk
   ```

2. **Prioritize Opportunities:**
   - Start with high impact, low risk
   - Build momentum with quick wins
   - Address high risk areas carefully
   - Defer low impact items

3. **Consider Dependencies:**
   - What needs to happen first?
   - What blocks other opportunities?
   - What creates foundation for future work?

#### Step 4: Create Backlog Structure (30 minutes)

1. **Organize by Priority:**
   - Now (next 30 days)
   - Next (30-90 days)
   - Later (90+ days)
   - Backlog (future consideration)

2. **Add Details:**
   - Description
   - Expected impact
   - Effort estimate
   - Risk assessment
   - Dependencies
   - Success criteria

3. **Define Acceptance Criteria:**
   - What does "done" look like?
   - How will we measure success?
   - What are the success metrics?

### Deliverables

1. **Automation Opportunity Backlog:**
   - All opportunities identified
   - Categorized and classified
   - Prioritized by impact and risk
   - Organized by timeline

2. **Quick Wins List:**
   - High impact, low effort opportunities
   - Ready to implement
   - Clear success criteria

3. **Risk Assessment:**
   - High-risk opportunities flagged
   - Mitigation strategies identified
   - Stakeholder sensitivity noted

### Evaluation Criteria

- **Completeness:** All opportunities identified
- **Accuracy:** Realistic assessments
- **Prioritization:** Clear rationale
- **Actionability:** Ready to implement

---

## Practical Exercise 2: "Do Not Automate" List

### Objective
Create a clear list of tasks and workflows that should NOT be automated, with reasoning and alternatives.

### Steps

#### Step 1: Identify High-Risk Areas (30 minutes)

1. **Apply Red Flag Framework:**
   - Identity-linked tasks
   - High-stakes decision-making
   - Relationship-building work
   - Creative and strategic work
   - Work with past failures

2. **Document Each Area:**
   ```
   Area | Red Flag | Risk Level | Reasoning
   -----|----------|------------|----------
   [Example] | Identity-linked | High | Defines team's purpose
   [Example] | High-stakes | High | Affects careers
   [Example] | Creative | Medium | Requires original thinking
   ```

3. **Consider Context:**
   - Organizational culture
   - Team history
   - Industry norms
   - Stakeholder expectations

#### Step 2: Define Alternatives (45 minutes)

1. **For Each "Do Not Automate" Item:**
   - Why not automate?
   - What should we do instead?
   - How can we augment?
   - What support is needed?

2. **Create Alternative Strategies:**
   ```
   Task | Don't Automate | Instead | Augmentation Option
   -----|----------------|---------|-------------------
   [Example] | Full automation | Preserve human control | AI provides recommendations
   [Example] | Eliminate role | Redesign role | AI handles routine, human handles exceptions
   [Example] | Replace judgment | Enhance judgment | AI provides data, human makes decision
   ```

3. **Design Augmentation Approaches:**
   - AI supports, human decides
   - AI handles routine, human handles exceptions
   - AI provides data, human provides judgment
   - AI scales, human differentiates

#### Step 3: Create Guidelines (30 minutes)

1. **Develop Decision Framework:**
   - When to automate vs. augment
   - When to preserve human control
   - When to avoid automation entirely
   - How to assess sensitivity

2. **Document Principles:**
   - Always preserve human authority
   - Augment, don't replace
   - Build trust through transparency
   - Provide support and training

3. **Create Approval Process:**
   - Who decides what to automate?
   - What criteria must be met?
   - How are exceptions handled?
   - How is the list maintained?

#### Step 4: Communicate and Socialize (15 minutes)

1. **Share with Stakeholders:**
   - Teams affected
   - Leadership
   - Key decision-makers

2. **Explain Reasoning:**
   - Why these areas are protected
   - What alternatives exist
   - How augmentation works
   - What support is available

3. **Create Feedback Loop:**
   - How to suggest additions
   - How to challenge decisions
   - How to update the list
   - How to review regularly

### Deliverables

1. **"Do Not Automate" List:**
   - All high-risk areas identified
   - Reasoning documented
   - Alternatives defined

2. **Augmentation Strategies:**
   - How to enhance without replacing
   - Support mechanisms
   - Training and development

3. **Decision Framework:**
   - When to automate vs. augment
   - Approval process
   - Guidelines and principles

### Evaluation Criteria

- **Thoroughness:** All high-risk areas identified
- **Clarity:** Clear reasoning and alternatives
- **Actionability:** Practical guidelines
- **Communication:** Well-socialized and understood

---

## Key Takeaways

- **Task taxonomy matters:** Monitoring tasks are ideal for automation; decision-making requires augmentation; creation should be preserved
- **Sweet spots exist:** Repetitive, cross-team, and "orphan" tasks are prime automation targets
- **Automation as glue:** Automation can connect teams and processes without human coordination
- **Red flags are real:** Identity-linked, high-stakes, relationship-building, and creative work should be protected
- **Backlog is essential:** Systematic identification and prioritization of opportunities
- **"Do not automate" list is critical:** Clear boundaries prevent political and cultural failures

---

## Additional Resources

### Reading
- "Automate the Boring Stuff with Python" by Al Sweigart
- "The Automation Advantage" by Bhaskar Ghosh
- "Human + Machine" by Paul Daugherty and H. James Wilson
- "The Future of Work" by Darrell West

### Research
- McKinsey automation potential studies
- Gartner automation frameworks
- MIT Work of the Future research
- Industry automation case studies

### Tools
- Automation opportunity assessment frameworks
- Task classification tools
- Risk assessment templates
- Backlog management systems

### Next Steps
- Complete Exercise 1: Automation Opportunity Backlog
- Complete Exercise 2: "Do Not Automate" List
- Review Module 3: Human-in-the-Loop System Design

---

**Ready for Module 3?**  
**[Continue to Human-in-the-Loop System Design →](Module_03_Human_in_the_Loop_System_Design.md)**
