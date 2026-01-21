---
title: "Module 4: Event-Based & Trigger-Based GTM Automation"
description: "Move from static processes to signal-driven systems"
module: "4"
order: 4
---

# Module 4: Event-Based & Trigger-Based GTM Automation

**Duration:** Week 4  
**Learning Objectives:**
- **external triggers Understanding**: Understand external triggers (funding, hiring, org changes, intent)
- **Recognize Internal**: Recognize internal triggers (product usage, deal activity, lifecycle changes)
- **event-based Development**: Apply design event-based workflows in relevant contexts
- **Avoid Automation**: Avoid automation loops and conflicts
- **monitoring for event-driven Development**: Build monitoring for event-driven systems

---

## 4.1 External Triggers: Funding, Hiring, Org Changes, Intent

### Funding Events

**Why They Matter:**
- Companies with new funding have budget
- They're actively investing in growth
- They're more likely to buy solutions
- Timing is critical (strike while hot)

**Data Sources:**
- Crunchbase API
- PitchBook
- TechCrunch
- Company press releases
- LinkedIn company updates

**Workflow Design:**
```
Event: Company raises funding
  ↓
Trigger: Webhook from funding data source
  ↓
Actions:
  1. Enrich company with funding details
  2. Update company_funding_stage property
  3. Update company_funding_amount property
  4. Update company_funding_date property
  5. Calculate company_priority_score
  6. If priority_score >= threshold:
     - Assign to outbound team
     - Create outbound sequence
     - Notify account owner
```

### Hiring Events

**Why They Matter:**
- New hires indicate growth
- Specific roles indicate buying intent
- Team expansion = budget allocation
- New decision makers enter the picture

**Data Sources:**
- LinkedIn company page updates
- Job posting sites (Indeed, LinkedIn Jobs)
- Company career pages
- Hiring data providers (Hiretual, etc.)

**Workflow Design:**
```
Event: Company posts job for [relevant role]
  ↓
Trigger: Webhook from job posting source
  ↓
Actions:
  1. Parse job posting for role and department
  2. If role matches target personas:
     - Update company_hiring_signal property
     - Update company_hiring_date property
     - Increase company_priority_score
     - If not in pipeline, create opportunity
     - Assign to appropriate AE
```

### Organizational Changes

**Why They Matter:**
- New executives bring new priorities
- Reorgs indicate strategic shifts
- Leadership changes = budget reallocation
- New decision makers to engage

**Data Sources:**
- LinkedIn company updates
- Press releases
- News articles
- Executive change databases

**Workflow Design:**
```
Event: New executive hired at company
  ↓
Trigger: Webhook from org change source
  ↓
Actions:
  1. Identify new executive role and department
  2. If role is decision maker for your solution:
     - Create contact record for new executive
     - Associate with company
     - Update company_org_change_date
     - Increase company_priority_score
     - If deal exists, update champion
     - If no deal, create opportunity
```

### Intent Signals

**Why They Matter:**
- Shows active buying interest
- Indicates research phase
- High conversion probability
- Timing is optimal

**Data Sources:**
- Bombora (intent data)
- G2 (buyer intent)
- Gartner (research activity)
- Website behavior (visits, content consumption)
- Content engagement (whitepapers, webinars)

**Workflow Design:**
```
Event: Intent signal detected for company
  ↓
Trigger: Webhook from intent data provider
  ↓
Actions:
  1. Update company_intent_score property
  2. Update company_intent_topics property
  3. Update company_intent_date property
  4. Calculate company_priority_score
  5. If priority_score >= threshold:
     - Assign to SDR team
     - Create personalized outbound sequence
     - Notify account owner
     - If deal exists, update stage
```

---

## 4.2 Internal Triggers: Product Usage, Deal Activity, Lifecycle Changes

### Product Usage Triggers

**Why They Matter:**
- Usage indicates engagement
- Feature adoption = expansion opportunity
- Usage drop = churn risk
- Usage spike = growth opportunity

**Event Types:**
- Feature adoption
- Usage threshold reached
- Usage drop detected
- Login frequency changes
- Integration usage

**Workflow Design:**
```
Event: Product usage threshold reached
  ↓
Trigger: Webhook from product analytics
  ↓
Actions:
  1. Update contact_product_usage_score
  2. Update company_product_usage_score
  3. If usage >= expansion threshold:
     - Create expansion opportunity
     - Assign to CSM or AE
     - Trigger expansion playbook
  4. If usage drops significantly:
     - Create churn risk alert
     - Assign to CSM
     - Trigger retention playbook
```

### Deal Activity Triggers

**Why They Matter:**
- Activity indicates engagement
- Stalled deals need attention
- High activity = closing soon
- No activity = risk

**Event Types:**
- Deal stage change
- Deal amount change
- Deal owner change
- Deal activity (calls, emails, meetings)
- Deal inactivity (no activity for X days)

**Workflow Design:**
```
Event: Deal has no activity for 7 days
  ↓
Trigger: Scheduled workflow check
  ↓
Actions:
  1. Calculate days_since_last_activity
  2. If days_since_last_activity >= 7:
     - Update deal_health_score
     - Send alert to deal owner
     - If days >= 14, escalate to manager
     - Create task for deal owner
     - Update deal_stuck_reason if provided
```

### Lifecycle Change Triggers

**Why They Matter:**
- Lifecycle changes indicate progression
- MQL → SQL = sales handoff
- Customer → Evangelist = expansion opportunity
- Lifecycle regression = risk

**Event Types:**
- Contact lifecycle stage change
- Company lifecycle stage change
- Deal stage progression
- Lifecycle regression

**Workflow Design:**
```
Event: Contact lifecycle changes to "MQL"
  ↓
Trigger: Contact property value changed
  ↓
Actions:
  1. Verify MQL qualification criteria met
  2. Update contact_mql_date property
  3. Assign to SDR team
  4. Create SDR task
  5. Trigger MQL nurture sequence
  6. Notify sales team
  7. If company not in pipeline, create opportunity
```

---

## 4.3 Designing Event-Based Workflows

### Workflow Design Principles

**1. Single Responsibility**
- Each workflow does one thing
- Avoid complex branching logic
- Keep workflows focused and testable

**2. Idempotency**
- Workflows should be safe to run multiple times
- Check if action already taken before executing
- Use flags to prevent duplicate actions

**3. Error Handling**
- Handle API failures gracefully
- Retry transient failures
- Log errors for debugging
- Notify on persistent failures

**4. Monitoring**
- Log all workflow executions
- Track success/failure rates
- Monitor execution time
- Alert on failures

### Workflow Pattern: Event → Enrich → Route → Act

**Step 1: Event Detection**
```
External event occurs (funding, hiring, intent)
  ↓
Webhook received
  ↓
Event data validated
```

**Step 2: Enrichment**
```
Look up company in CRM
  ↓
Enrich with additional data if needed
  ↓
Calculate priority/score
```

**Step 3: Routing**
```
Determine appropriate action based on:
  - Company profile
  - Existing relationship
  - Current pipeline status
  - Priority score
```

**Step 4: Action**
```
Execute appropriate action:
  - Create/update records
  - Assign owners
  - Trigger sequences
  - Send notifications
```

### Example: Complete Event Workflow

**Funding Event Workflow:**
```
1. Webhook received: Company X raised Series B
2. Look up company in HubSpot by domain
3. If company found:
   - Update funding properties
   - Calculate priority score
   - Check if already in pipeline
   - If in pipeline: Update deal, notify owner
   - If not in pipeline: Create opportunity, assign AE
   - If not in CRM: Create company, enrich, create opportunity
4. If company not found:
   - Create company record
   - Enrich company data
   - Create opportunity
   - Assign to outbound team
5. Log workflow execution
6. Send summary notification
```

---

## 4.4 Avoiding Automation Loops and Conflicts

### Common Loop Scenarios

**Loop 1: Property Update Loop**
```
Workflow A: Updates property X
  ↓
Triggers Workflow B
  ↓
Workflow B: Updates property X
  ↓
Triggers Workflow A again
  ↓
LOOP!
```

**Prevention:**
- Use flags to track if update is from workflow
- Check if property value actually changed
- Use "only trigger if property changed from X to Y"
- Add delay before re-triggering

**Loop 2: Email Sequence Loop**
```
Workflow A: Sends email, updates property
  ↓
Triggers Workflow B
  ↓
Workflow B: Sends email, updates property
  ↓
Triggers Workflow A again
  ↓
LOOP!
```

**Prevention:**
- Use sequence status properties
- Check if contact already in sequence
- Use "only trigger once" settings
- Add sequence completion flags

**Loop 3: Assignment Loop**
```
Workflow A: Assigns contact to Owner A
  ↓
Triggers Workflow B
  ↓
Workflow B: Reassigns to Owner B
  ↓
Triggers Workflow A again
  ↓
LOOP!
```

**Prevention:**
- Check current owner before reassigning
- Use "only trigger if owner is X"
- Add assignment reason property
- Prevent reassignment if recently assigned

### Conflict Prevention

**Conflict 1: Multiple Workflows Updating Same Property**
```
Workflow A: Sets property = "Value A"
Workflow B: Sets property = "Value B"
Result: Unpredictable value
```

**Solution:**
- Use priority system for workflows
- Use "only update if property is empty"
- Use "only update if property value is X"
- Document workflow dependencies

**Conflict 2: Duplicate Record Creation**
```
Workflow A: Creates opportunity
Workflow B: Creates opportunity
Result: Duplicate opportunities
```

**Solution:**
- Check if record already exists before creating
- Use unique identifiers
- Use "only create if not exists" logic
- Add creation flags

**Conflict 3: Conflicting Assignments**
```
Workflow A: Assigns to Team A
Workflow B: Assigns to Team B
Result: Unclear ownership
```

**Solution:**
- Use assignment rules with priority
- Check current assignment before changing
- Use "only assign if unassigned"
- Document assignment logic

### Best Practices

**1. Use Flags**
- `workflow_triggered` - Track if workflow already ran
- `enrichment_complete` - Track enrichment status
- `assignment_locked` - Prevent reassignment
- `sequence_active` - Track sequence status

**2. Add Delays**
- Wait before re-checking conditions
- Prevent rapid-fire triggers
- Allow other workflows to complete
- Reduce system load

**3. Check Before Acting**
- Verify record doesn't exist before creating
- Check current value before updating
- Verify owner before reassigning
- Confirm status before changing

**4. Document Dependencies**
- List all workflows that affect same records
- Document trigger conditions
- Note potential conflicts
- Create workflow dependency map

---

## 4.5 Monitoring Event-Driven Workflows

### Key Metrics

**Execution Metrics:**
- Workflow execution count
- Success rate
- Failure rate
- Average execution time
- Peak execution times

**Business Metrics:**
- Events processed
- Records created/updated
- Opportunities created
- Assignments made
- Sequences triggered

**Quality Metrics:**
- Duplicate prevention rate
- Data quality after workflow
- Error rate
- Retry rate
- Manual intervention rate

### Monitoring Dashboard

**Real-Time Monitoring:**
- Active workflows
- Recent executions
- Current errors
- Queue depth
- System health

**Historical Analysis:**
- Execution trends
- Success/failure trends
- Performance over time
- Error patterns
- Business impact

### Alerting

**Critical Alerts:**
- Workflow failure rate > 10%
- Execution time > 5 minutes
- Error rate spike
- Queue backup
- System downtime

**Warning Alerts:**
- Success rate dropping
- Execution time increasing
- Retry rate increasing
- Manual intervention needed

**Implementation:**
```
Daily Workflow Health Check:
1. Calculate metrics for all workflows
2. Compare to baseline
3. If metrics exceed thresholds:
   - Send alert to GTM team
   - Create ticket for investigation
   - Log for analysis
```

---

## Hands-On: Build a Workflow Triggered by External Company Event

### Objective
Create an event-driven workflow that responds to external company events and auto-enrolls accounts into outbound or SDR workflows.

### Tasks

**1. Choose Event Source (1 hour)**

Select an event source:
- Funding events (Crunchbase, PitchBook)
- Hiring events (LinkedIn, job postings)
- Intent signals (Bombora, G2)
- Or simulate with webhook testing tool

**2. Design Workflow Logic (1 hour)**

Design the workflow:
- Event detection
- Company lookup/enrichment
- Priority scoring
- Routing logic
- Action execution

**3. Build Webhook Integration (2 hours)**

Set up webhook:
- Create webhook endpoint (or use Zapier/Make)
- Configure event source
- Test webhook reception
- Parse event data

**4. Implement Workflow (2 hours)**

In HubSpot, create workflow:
- Trigger on webhook or property change
- Look up company
- Enrich if needed
- Calculate priority score
- Route to appropriate team
- Create opportunity if needed
- Trigger outbound sequence

**5. Add Monitoring (1 hour)**

Set up monitoring:
- Log workflow executions
- Track success/failure rates
- Create alerts for failures
- Build dashboard for metrics

### Deliverables

**1. Workflow Documentation**
- Event source and webhook setup
- Workflow logic and flow
- Routing rules
- Action steps

**2. Working Workflow**
- Functional event-driven workflow
- Webhook integration
- Company enrichment
- Opportunity creation
- Outbound sequence trigger

**3. Monitoring Setup**
- Execution logs
- Success/failure tracking
- Alert configuration
- Dashboard (if possible)

### Evaluation Criteria

- **Event Integration (30%):** Successful webhook/event integration
- **Workflow Logic (30%):** Sound routing and action logic
- **Implementation (25%):** Functional, tested workflow
- **Monitoring (15%):** Basic monitoring and logging

---

## Ship Fast Challenge: Auto-Enroll Accounts into Outbound

### Challenge
Build a workflow that automatically enrolls accounts into outbound sequences based on events.

### Steps

1. **Define Enrollment Criteria (30 min)**
   - What events trigger enrollment?
   - What accounts qualify?
   - Which sequence should they get?
   - What's the priority?

2. **Build Enrollment Workflow (2 hours)**
   - Trigger on event (funding, hiring, intent)
   - Check if account qualifies
   - Check if already enrolled
   - Enroll in appropriate sequence
   - Assign to SDR team
   - Create opportunity if needed

3. **Test & Deploy (1 hour)**
   - Test with sample events
   - Verify enrollment logic
   - Check for duplicates
   - Deploy to production
   - Monitor for first week

### Success Criteria

- Accounts auto-enroll based on events
- No duplicate enrollments
- Appropriate sequences assigned
- SDR team notified
- Opportunities created when needed

---

## Reflection & Iteration

### Questions to Consider

1. **Event Sources:**
   - What external events matter for your business?
   - How can you detect these events?
   - What data sources are available?

2. **Internal Triggers:**
   - What product usage signals indicate opportunity?
   - What deal activity triggers are important?
   - How do lifecycle changes affect your process?

3. **Workflow Design:**
   - Are your workflows event-driven or stage-driven?
   - How can you make workflows more responsive?
   - What events are you missing?

4. **Loop Prevention:**
   - Have you experienced automation loops?
   - How do you prevent conflicts?
   - What flags and checks do you use?

5. **Monitoring:**
   - How do you monitor workflow health?
   - What metrics do you track?
   - How do you detect issues early?

### Action Items

- [ ] Complete the event-driven workflow exercise
- [ ] Set up monitoring for your workflows
- [ ] Review Module 5: Outbound Systems & AI-Augmented Prospecting
- [ ] Document your event sources and triggers
- [ ] Test workflow loop prevention

---

## Key Takeaways

- **Event-driven GTM is more responsive than stage-driven**: **Event-driven GTM is more responsive than stage-driven**: **Event-driven GTM is more responsive than stage-driven**
- **External events (funding, hiring, intent) indicate buying signals**: **External events (funding, hiring, intent) indicate buying signals**: **External events (funding, hiring, intent) indicate buying signals**
- **Internal triggers (usage, activity) show engagement and risk**: **Internal triggers (usage, activity) show engagement and risk**: **Internal triggers (usage, activity) show engagement and risk**
- **Design workflows to be idempotent and conflict-free**: **Design workflows to be idempotent and conflict-free**: **Design workflows to be idempotent and conflict-free**
- **Monitor workflows to catch issues before they impact business**: **Monitor workflows to catch issues before they impact business**: **Monitor workflows to catch issues before they impact business**

---

## Next Steps

- **Complete The**: Complete the hands-on exercise: Build event-driven workflow
- **workflow monitoring Implementation**: Set up workflow monitoring
- **Review Module**: Review Module 5: Outbound Systems & AI-Augmented Prospecting
- **Join Course**: Join course community discussions

---

**Ready to build? Let's move to [Module 5: Outbound Systems & AI-Augmented Prospecting →](Module_05_Outbound_Systems_and_AI_Augmented_Prospecting.md)**
