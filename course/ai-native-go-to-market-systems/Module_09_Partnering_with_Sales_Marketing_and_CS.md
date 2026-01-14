---
title: "Module 9: Partnering with Sales, Marketing & CS"
description: "Translate messy commercial problems into shipped systems"
module: "9"
order: 9
---

# Module 9: Partnering with Sales, Marketing & CS

**Duration:** Week 9  
**Learning Objectives:**
- Work effectively with Sales leadership
- Turn complaints into requirements
- Say "no" while still shipping value
- Create documentation that scales beyond you
- Build trust and credibility with stakeholders

---

## 9.1 Working with Sales Leadership

### Understanding Sales Priorities

**What Sales Cares About:**
- Hitting quota
- Closing deals faster
- Reducing manual work
- Better pipeline visibility
- More qualified leads

**What Sales Doesn't Care About:**
- Technical implementation details
- Tool configurations
- Data architecture
- Workflow complexity
- Your constraints

### Communication Framework

**1. Speak Their Language**
- ❌ "I'll update the workflow to trigger on property changes"
- ✅ "I'll automate lead assignment so reps get leads within 1 hour"

**2. Focus on Outcomes**
- ❌ "I built a new integration"
- ✅ "This will save each rep 2 hours per week"

**3. Show Business Impact**
- ❌ "I improved data quality"
- ✅ "This will reduce duplicate leads by 50%, saving 10 hours/week"

**4. Use Their Metrics**
- Revenue impact
- Time saved
- Conversion improvement
- Pipeline growth
- Win rate increase

### Building Trust

**1. Deliver on Promises**
- Set realistic timelines
- Communicate progress
- Deliver on time
- Follow up after delivery

**2. Be Proactive**
- Identify problems before they're reported
- Suggest improvements
- Anticipate needs
- Solve problems before asked

**3. Show Results**
- Measure impact
- Share success stories
- Report on improvements
- Celebrate wins together

**4. Be Responsive**
- Respond quickly to requests
- Provide status updates
- Be available for questions
- Follow through on commitments

### Managing Expectations

**Set Clear Expectations:**
- What you can do
- What you can't do
- Timeline expectations
- Resource constraints
- Trade-offs

**Example:**
```
Sales Request: "Can you build a custom dashboard by tomorrow?"

Your Response:
"I can't build a custom dashboard by tomorrow, but I can:
1. Set up a basic dashboard today (2 hours)
2. Build the full custom dashboard by end of week (8 hours)
3. Or I can show you how to build it yourself (30 min)

Which option works best for you?"
```

---

## 9.2 Turning Complaints into Requirements

### The Complaint-to-Requirement Process

**Step 1: Listen and Understand**
- Don't dismiss complaints
- Ask clarifying questions
- Understand the root cause
- Identify the real problem

**Step 2: Translate to Requirements**
- Convert complaint to need
- Define success criteria
- Identify constraints
- Prioritize requirements

**Step 3: Propose Solutions**
- Offer multiple options
- Explain trade-offs
- Recommend best approach
- Get buy-in

**Step 4: Deliver and Validate**
- Build the solution
- Test with stakeholders
- Gather feedback
- Iterate if needed

### Example: Complaint to Requirement

**Complaint:**
"Leads are taking forever to get assigned. I'm losing deals because leads sit unassigned for days."

**Understanding:**
- Leads aren't being assigned quickly
- Manual assignment is slow
- Reps are missing opportunities
- This impacts revenue

**Requirements:**
1. Leads must be assigned within 1 hour of creation
2. Assignment should be automatic
3. Assignment should match leads to best-fit reps
4. Reps should be notified immediately

**Solution:**
- Build automated lead routing workflow
- Route based on company size, geography, product interest
- Assign within 1 hour
- Send notification to rep
- Track assignment time

**Validation:**
- Measure assignment time (target: < 1 hour)
- Track rep satisfaction
- Monitor deal conversion
- Gather feedback

### Common Complaints and Solutions

**Complaint 1: "I can't find the data I need"**

**Root Cause:**
- Data is in wrong place
- Data is incomplete
- Data is hard to access
- No clear reporting

**Solution:**
- Create custom reports
- Build dashboards
- Improve data quality
- Provide training

**Complaint 2: "The system is too slow"**

**Root Cause:**
- Too many workflows running
- Inefficient queries
- Large data volumes
- System limitations

**Solution:**
- Optimize workflows
- Improve data structure
- Add caching
- Upgrade if needed

**Complaint 3: "I'm doing too much manual work"**

**Root Cause:**
- Processes aren't automated
- Tools don't integrate
- Manual data entry required
- No workflow automation

**Solution:**
- Automate repetitive tasks
- Integrate tools
- Build workflows
- Reduce manual steps

---

## 9.3 Saying "No" While Still Shipping Value

### When to Say No

**Say No When:**
- Request is technically impossible
- Request violates best practices
- Request has low ROI
- Request conflicts with priorities
- Request creates technical debt

**But Always Offer Alternatives:**
- What you can do instead
- When you could do it
- What resources are needed
- Better approaches
- Compromise solutions

### The "No, But" Framework

**Structure:**
1. Acknowledge the request
2. Explain why you can't do it (briefly)
3. Offer alternatives
4. Propose a path forward

**Example 1:**
```
Request: "Can you build a custom integration by Friday?"

Response:
"I can't build a custom integration by Friday because it requires 
API development and testing that takes 2 weeks. But I can:

1. Set up a Zapier integration today (30 min) that does 80% of what 
   you need
2. Build the custom integration in 2 weeks with proper testing
3. Show you how to use the existing integration differently

Which option works best?"
```

**Example 2:**
```
Request: "Can you change the workflow to do X, Y, and Z?"

Response:
"I can't change the workflow to do all three because they conflict 
with each other. But I can:

1. Do X and Y (most important)
2. Do X and Z (alternative approach)
3. Build a separate workflow for Z
4. Prioritize based on business impact

What's most important to you?"
```

### Saying No to Bad Ideas

**Bad Idea: "Let's automate everything"**

**Response:**
"I understand you want to automate everything, but full automation 
has risks:
- Removes human judgment where needed
- Can create poor customer experience
- Hard to debug when things break

Instead, let's:
1. Automate high-volume, low-risk tasks
2. Keep humans in the loop for high-stakes decisions
3. Start with pilot, then expand

This gives us automation benefits while maintaining quality."

### Saying No to Unrealistic Timelines

**Request: "Can you build this by tomorrow?"**

**Response:**
"I can't build this properly by tomorrow. Rushing would mean:
- Skipping testing (risky)
- Creating technical debt
- Potential for errors

But I can:
1. Build a quick version today (2 hours) that works for now
2. Build the full version properly by end of week
3. Show you a workaround you can use today

Which approach do you prefer?"

---

## 9.4 Documentation that Scales Beyond You

### Why Documentation Matters

**Without Documentation:**
- ❌ Only you know how things work
- ❌ Hard to onboard new team members
- ❌ Difficult to troubleshoot
- ❌ Knowledge lost when you're unavailable
- ❌ Hard to hand off projects

**With Documentation:**
- ✅ Anyone can understand the system
- ✅ Easy to onboard new team members
- ✅ Troubleshooting is faster
- ✅ Knowledge is preserved
- ✅ Smooth handoffs

### What to Document

**1. System Architecture**
- Overall system design
- Tool integrations
- Data flow
- Key components

**2. Workflow Logic**
- What each workflow does
- Trigger conditions
- Actions taken
- Dependencies

**3. Configuration**
- Property purposes
- Pipeline stages
- Routing rules
- Assignment logic

**4. Processes**
- How to add new workflows
- How to debug issues
- How to make changes
- How to rollback

**5. Decisions**
- Why decisions were made
- Trade-offs considered
- Alternatives evaluated
- Future considerations

### Documentation Best Practices

**1. Write for Your Future Self**
- Assume you'll forget everything
- Explain the "why" not just "what"
- Include context
- Add examples

**2. Keep It Updated**
- Update when things change
- Remove outdated information
- Version control documentation
- Regular reviews

**3. Make It Accessible**
- Use clear language
- Add visuals (diagrams, screenshots)
- Organize logically
- Searchable format

**4. Include Examples**
- Real-world scenarios
- Sample data
- Step-by-step guides
- Troubleshooting examples

### Documentation Templates

**Workflow Documentation Template:**
```
Workflow Name: [Name]
Purpose: [What it does]
Trigger: [When it runs]
Conditions: [What must be true]
Actions: [What it does]
Dependencies: [What it relies on]
Monitoring: [How to check if it's working]
Troubleshooting: [Common issues and fixes]
Last Updated: [Date]
Owner: [Name]
```

**Integration Documentation Template:**
```
Integration: [System A] ↔ [System B]
Purpose: [Why they're connected]
Data Flow: [What data goes where]
Configuration: [How it's set up]
API Details: [Endpoints, authentication]
Error Handling: [How errors are handled]
Monitoring: [How to monitor]
Troubleshooting: [Common issues]
Last Updated: [Date]
Owner: [Name]
```

---

## 9.5 Hands-On: Interview a Sales Leader

### Objective
Practice translating commercial problems into automation specifications.

### Tasks

**1. Prepare for Interview (30 min)**

Prepare questions:
- What are your biggest pain points?
- What takes too much time?
- What manual processes frustrate you?
- What would make your job easier?
- What data do you need but can't get?

**2. Conduct Interview (1 hour)**

Interview a Sales leader (real or simulated):
- Ask open-ended questions
- Listen for pain points
- Identify automation opportunities
- Understand priorities
- Note constraints

**3. Analyze Findings (1 hour)**

Analyze interview:
- List all pain points
- Identify root causes
- Prioritize by impact
- Identify automation opportunities
- Note constraints and requirements

**4. Create Requirements (1 hour)**

Convert to requirements:
- Define success criteria
- List functional requirements
- Identify technical constraints
- Estimate effort
- Prioritize features

**5. Design Solution (1 hour)**

Design automation:
- Map current process
- Design automated process
- Identify tools needed
- Plan implementation
- Define success metrics

**6. Create Proposal (1 hour)**

Write proposal:
- Executive summary
- Problem statement
- Proposed solution
- Implementation plan
- Expected impact
- Timeline and resources

### Deliverables

**1. Interview Notes**
- Pain points identified
- Priorities understood
- Constraints noted
- Opportunities identified

**2. Requirements Document**
- Functional requirements
- Success criteria
- Constraints
- Priorities

**3. Solution Design**
- Current state process
- Future state process
- Automation design
- Tool requirements

**4. Proposal Document**
- Problem summary
- Solution overview
- Implementation plan
- Expected impact
- Next steps

### Evaluation Criteria

- **Interview Quality (25%):** Thorough, insightful questions
- **Analysis (25%):** Clear identification of problems and opportunities
- **Requirements (25%):** Well-defined, actionable requirements
- **Proposal (25%):** Clear, compelling proposal

---

## Ship Fast Challenge: Convert Pain Points into Shipped Fix

### Challenge
Take one pain point from your interview and ship a fix this week.

### Steps

1. **Choose Pain Point (30 min)**
   - Pick highest-impact, quickest-to-fix pain point
   - Ensure you can fix it this week
   - Get stakeholder buy-in

2. **Design Quick Fix (1 hour)**
   - Map current process
   - Design improved process
   - Identify automation opportunity
   - Plan implementation

3. **Build and Test (3-4 hours)**
   - Implement the fix
   - Test with sample data
   - Get stakeholder feedback
   - Iterate if needed

4. **Deploy and Measure (1 hour)**
   - Deploy to production
   - Monitor performance
   - Gather feedback
   - Measure impact

### Success Criteria

- Fix addresses the pain point
- Stakeholder is satisfied
- Solution is deployed
- Impact is measurable
- Documentation is updated

---

## Reflection & Iteration

### Questions to Consider

1. **Stakeholder Management:**
   - How do you communicate with Sales/Marketing/CS?
   - How do you build trust?
   - How do you manage expectations?

2. **Requirements:**
   - How do you turn complaints into requirements?
   - How do you prioritize requests?
   - How do you say no effectively?

3. **Documentation:**
   - What do you currently document?
   - What's missing?
   - How do you keep it updated?

4. **Partnership:**
   - How do you partner with other teams?
   - What makes partnerships successful?
   - How do you balance competing priorities?

5. **Impact:**
   - How do you measure your impact?
   - How do you communicate value?
   - How do you prioritize work?

### Action Items

- [ ] Complete the Sales leader interview exercise
- [ ] Ship a fix for a pain point
- [ ] Review Module 10: Capstone Project
- [ ] Update your documentation
- [ ] Practice saying "no" with alternatives

---

## Key Takeaways

- **Work with Sales/Marketing/CS by speaking their language and focusing on outcomes**  
- **Turn complaints into requirements by understanding root causes and proposing solutions**  
- **Say "no" effectively by offering alternatives and explaining trade-offs**  
- **Documentation that scales preserves knowledge and enables others**  
- **Building trust through delivery, proactivity, and results creates strong partnerships**

---

## Next Steps

- Complete the hands-on exercise: Interview Sales leader and ship fix
- Update your documentation
- Review Module 10: Capstone – Build a Mini AI-Native GTM Engine
- Join course community discussions

---

**Ready to build? Let's move to [Module 10: Capstone – Build a Mini AI-Native GTM Engine →](Module_10_Capstone_Build_a_Mini_AI_Native_GTM_Engine.md)**
