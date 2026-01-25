---
title: "Module 6: Low-Code, APIs & System Wiring"
description: "Confidently wire tools together without waiting on engineers"
module: "6"
order: 6
---

# Module 6: Low-Code, APIs & System Wiring

**Duration:** Week 6  
**Learning Objectives:**
- **APIs, webhooks, and event listeners conceptually Understanding**: Understand APIs, webhooks, and event listeners conceptually
- **Use No/Low-Code**: Use no/low-code automation tools effectively
- **Know When**: Know when to script vs when not to
- **error handling and retries Implementation**: Implement error handling and retries
- **Adopt Versioning**: Adopt versioning and rollback mindset

---

## 6.1 APIs, Webhooks, and Event Listeners (Conceptual)

### What is an API?

**API = Application Programming Interface**

**Simple Analogy:**
- API is like a restaurant menu
- You (client) order from the menu (API)
- Kitchen (server) prepares your order
- Waiter (API) brings you the food (response)

**In GTM Context:**
- HubSpot API: Get/create/update contacts, companies, deals
- Clearbit API: Enrich company data
- Zapier API: Trigger workflows
- Your system talks to other systems via APIs

### How APIs Work

**Request → Response Pattern:**
```
Your System → API Request → External System
                ↓
Your System ← API Response ← External System
```

**Example: Get Contact from HubSpot**
```
Request:
GET https://api.hubapi.com/contacts/v1/contact/email/example@company.com
Headers: Authorization: Bearer YOUR_API_KEY

Response:
{
  "vid": 12345,
  "properties": {
    "email": "example@company.com",
    "firstname": "John",
    "lastname": "Doe"
  }
}
```

### Webhooks

**What is a Webhook?**
- Reverse of API call
- External system sends data to your system
- Event-driven: "When X happens, notify me"
- Like a doorbell: rings when someone arrives

**Webhook Flow:**
```
External System → Event Occurs → Sends HTTP POST → Your Webhook URL
                                                      ↓
                                              Your System Processes Event
```

**Example: HubSpot Webhook**
```
Event: Contact created in HubSpot
  ↓
HubSpot sends POST to your webhook URL:
POST https://yoursystem.com/webhooks/hubspot
Body: {
  "event": "contact.created",
  "contact": { ... }
}
  ↓
Your system processes the event
```

### Event Listeners

**What is an Event Listener?**
- Watches for specific events
- Triggers actions when events occur
- Can be webhook-based or polling-based

**Polling vs Webhooks:**
- **Polling:** Check for events periodically (every 5 minutes)
- **Webhooks:** Receive events immediately when they occur
- Webhooks are preferred (real-time, efficient)

---

## 6.2 No/Low-Code Automation Tools

### Tool Categories

**1. Workflow Automation**
- Zapier: Connect 5000+ apps
- Make (Integromat): Visual workflow builder
- n8n: Open-source automation
- Microsoft Power Automate: Microsoft ecosystem

**2. CRM Native Automation**
- HubSpot Workflows: Built into HubSpot
- Salesforce Flow: Built into Salesforce
- Pipedrive Automations: Built into Pipedrive

**3. API Integration Platforms**
- Postman: API testing and documentation
- Insomnia: API client
- HTTPie: Command-line HTTP client

### When to Use Each Tool

**Zapier:**
- ✅ Quick integrations
- ✅ Many pre-built connectors
- ✅ Non-technical users
- ❌ Complex logic
- ❌ High volume (rate limits)
- ❌ Cost at scale

**Make (Integromat):**
- ✅ Complex workflows
- ✅ Visual flow design
- ✅ Data transformation
- ❌ Learning curve
- ❌ Cost at scale

**HubSpot Workflows:**
- ✅ HubSpot-native
- ✅ No additional cost
- ✅ Easy to use
- ❌ Limited to HubSpot
- ❌ Less flexible than Zapier

**Custom Scripts:**
- ✅ Full control
- ✅ Complex logic
- ✅ High volume
- ❌ Requires coding
- ❌ Maintenance burden

### Tool Selection Framework

**Use No-Code If:**
- Simple integrations
- Low to medium volume
- Non-technical team
- Quick time to value
- Standard use cases

**Use Low-Code If:**
- Moderate complexity
- Some technical resources
- Need flexibility
- Custom logic required
- Medium volume

**Use Custom Code If:**
- High complexity
- High volume
- Full control needed
- Unique requirements
- Technical team available

---

## 6.3 When to Script vs When Not to

### When NOT to Script

**Scenario 1: Simple Data Sync**
```
❌ Custom Script:
  - Write Python script
  - Set up cron job
  - Handle errors
  - Maintain code

✅ Zapier/Make:
  - Drag-and-drop workflow
  - Built-in error handling
  - No code maintenance
  - Visual debugging
```

**Scenario 2: Standard Integrations**
```
❌ Custom Script:
  - Build API integration
  - Handle authentication
  - Parse responses
  - Error handling

✅ Native Integration:
  - Use built-in connector
  - Pre-configured
  - Maintained by vendor
  - No code needed
```

**Scenario 3: One-Time Tasks**
```
❌ Custom Script:
  - Write script
  - Test script
  - Run once
  - Discard script

✅ Manual or Zapier:
  - Quick manual task
  - Or one-time Zapier workflow
  - No code needed
```

### When TO Script

**Scenario 1: Complex Logic**
```
✅ Custom Script:
  - Multi-step decision trees
  - Complex data transformation
  - Conditional routing
  - Business rule engine

❌ No-Code:
  - Limited logic capabilities
  - Hard to maintain
  - Difficult to debug
```

**Scenario 2: High Volume**
```
✅ Custom Script:
  - Process thousands of records
  - Batch processing
  - Rate limit management
  - Efficient execution

❌ No-Code:
  - Rate limits
  - Cost at scale
  - Slower execution
  - Timeout issues
```

**Scenario 3: Custom Requirements**
```
✅ Custom Script:
  - Unique business logic
  - Proprietary algorithms
  - Custom data formats
  - Special handling

❌ No-Code:
  - Limited customization
  - Workarounds needed
  - Not designed for your use case
```

### Decision Framework

**Ask These Questions:**
1. **Complexity:** How complex is the logic?
   - Simple → No-code
   - Moderate → Low-code
   - Complex → Custom script

2. **Volume:** How many records/events?
   - Low (< 1000/day) → No-code
   - Medium (1000-10000/day) → Low-code
   - High (> 10000/day) → Custom script

3. **Frequency:** How often does it run?
   - One-time → Manual or no-code
   - Occasional → No-code
   - Continuous → Low-code or custom

4. **Maintenance:** Who will maintain it?
   - Non-technical → No-code
   - Technical → Low-code or custom

5. **Time to Value:** How quickly do you need it?
   - Immediate → No-code
   - Soon → Low-code
   - Can wait → Custom script

---

## 6.4 Error Handling & Retries

### Common Error Types

**1. API Errors**
- Rate limiting (429 Too Many Requests)
- Authentication failures (401 Unauthorized)
- Not found (404 Not Found)
- Server errors (500 Internal Server Error)
- Timeout errors

**2. Data Errors**
- Invalid data format
- Missing required fields
- Invalid values
- Data type mismatches

**3. Network Errors**
- Connection timeouts
- Network failures
- DNS resolution failures

### Error Handling Strategies

**1. Retry Logic**
```
Attempt 1: Call API
  ↓
If error (rate limit, timeout):
  Wait (exponential backoff)
  ↓
Attempt 2: Retry API call
  ↓
If error again:
  Wait longer
  ↓
Attempt 3: Final retry
  ↓
If still error:
  Log error
  Send alert
  Add to retry queue
```

**2. Exponential Backoff**
```
Retry 1: Wait 1 second
Retry 2: Wait 2 seconds
Retry 3: Wait 4 seconds
Retry 4: Wait 8 seconds
Retry 5: Wait 16 seconds
Max wait: 60 seconds
```

**3. Error Logging**
```
Log:
  - Error type
  - Error message
  - Timestamp
  - Request details
  - Response details
  - Retry attempts
```

**4. Alerting**
```
If error persists after retries:
  - Send email alert
  - Create ticket
  - Notify team
  - Log for analysis
```

### Implementation in No-Code Tools

**Zapier Error Handling:**
- Built-in retry (3 attempts)
- Error notifications
- Error logs
- Can add custom error handling with Code step

**Make Error Handling:**
- Error handling routes
- Retry mechanisms
- Error notifications
- Data recovery options

**HubSpot Workflows:**
- Limited error handling
- Manual monitoring
- Workflow logs
- Email notifications on failure

---

## 6.5 Versioning and Rollback Mindset

### Why Versioning Matters

**Scenario: Workflow Breaks Production**
```
Monday: Workflow working fine
Tuesday: Update workflow
Wednesday: Workflow breaks, affects 1000+ records
Thursday: Need to rollback, but how?
```

**Without Versioning:**
- ❌ Don't know what changed
- ❌ Can't rollback easily
- ❌ Hard to debug
- ❌ Risk of data loss

**With Versioning:**
- ✅ Track all changes
- ✅ Rollback to previous version
- ✅ Compare versions
- ✅ Safe to experiment

### Versioning Strategies

**1. Documentation**
- Document workflow changes
- Keep change log
- Note what each version does
- Track who made changes

**2. Testing Environment**
- Test changes in sandbox first
- Verify with sample data
- Test error scenarios
- Validate before production

**3. Gradual Rollout**
- Deploy to small group first
- Monitor for issues
- Gradually expand
- Rollback if problems

**4. Backup Before Changes**
- Export current workflow
- Save configuration
- Document current state
- Create restore point

### Rollback Procedures

**Step 1: Identify Issue**
- What broke?
- When did it break?
- What changed recently?
- What's the impact?

**Step 2: Stop the Workflow**
- Pause or disable workflow
- Stop processing new records
- Assess current state
- Document affected records

**Step 3: Restore Previous Version**
- Load previous workflow version
- Restore configuration
- Verify settings
- Test with sample data

**Step 4: Deploy Rollback**
- Enable previous version
- Monitor closely
- Verify functionality
- Document rollback

**Step 5: Fix and Retry**
- Fix the issue
- Test thoroughly
- Deploy fix
- Monitor results

### Best Practices

**1. Change Management**
- Review changes before deploying
- Get approval for major changes
- Document all changes
- Communicate changes to team

**2. Testing**
- Always test in sandbox first
- Test with real data samples
- Test error scenarios
- Test at scale

**3. Monitoring**
- Monitor workflows after changes
- Set up alerts for failures
- Track performance metrics
- Review logs regularly

**4. Documentation**
- Document workflow purpose
- Document configuration
- Document dependencies
- Document rollback procedures

---

## Hands-On: Connect HubSpot with External Systems

### Objective
Connect HubSpot with at least 2 external systems and build a webhook-triggered automation.

### Tasks

**1. Choose Integration Tools (30 min)**

Select tools:
- Zapier, Make, or HubSpot native
- Choose 2 external systems to connect
- Examples: Clearbit, Gmail, Slack, Google Sheets

**2. Set Up First Integration (2 hours)**

Integration 1: HubSpot → External System
- Example: When contact created → Enrich with Clearbit
- Configure triggers and actions
- Test with sample data
- Handle errors

**3. Set Up Second Integration (2 hours)**

Integration 2: External System → HubSpot
- Example: When form submitted → Create contact in HubSpot
- Configure webhook or polling
- Map data fields
- Test integration

**4. Build Webhook Automation (2 hours)**

Create webhook-triggered workflow:
- Set up webhook endpoint (or use Zapier webhook)
- Configure webhook to receive events
- Process webhook data
- Trigger actions in HubSpot
- Log webhook events

**5. Add Error Handling (1 hour)**

Implement error handling:
- Add retry logic
- Handle API errors
- Log errors
- Send alerts on failures

### Deliverables

**1. Integration Documentation**
- Integration architecture
- Configuration details
- Data flow diagrams
- Error handling procedures

**2. Working Integrations**
- Functional HubSpot → External system integration
- Functional External system → HubSpot integration
- Webhook-triggered automation
- Error handling implemented

**3. Monitoring Setup**
- Integration logs
- Error tracking
- Performance metrics
- Alert configuration

### Evaluation Criteria

- **Integration Functionality (40%):** Both integrations work correctly
- **Webhook Implementation (30%):** Webhook receives and processes events
- **Error Handling (20%):** Proper error handling and retries
- **Documentation (10%):** Clear documentation of setup and processes

---

## Ship Fast Challenge: Build Webhook-Triggered Automation

### Challenge
Create a webhook that receives events and triggers actions in HubSpot.

### Steps

1. **Choose Webhook Source (30 min)**
   - What system will send webhooks?
   - What events do you want to receive?
   - How will you receive webhooks? (Zapier, Make, custom)

2. **Set Up Webhook Endpoint (1 hour)**
   - Create webhook URL
   - Configure to receive POST requests
   - Test webhook reception
   - Log incoming events

3. **Process Webhook Data (1 hour)**
   - Parse webhook payload
   - Extract relevant data
   - Validate data
   - Map to HubSpot fields

4. **Trigger HubSpot Actions (1 hour)**
   - Create/update records in HubSpot
   - Trigger workflows
   - Send notifications
   - Log actions

5. **Add Error Handling (30 min)**
   - Handle invalid data
   - Retry failed API calls
   - Log errors
   - Send alerts

### Success Criteria

- Webhook receives events successfully
- Data is processed correctly
- HubSpot actions are triggered
- Errors are handled gracefully
- System is monitored and logged

---

## Reflection & Iteration

### Questions to Consider

1. **APIs and Webhooks:**
   - Do you understand how APIs work conceptually?
   - What webhooks do you currently use?
   - What events would benefit from webhooks?

2. **No-Code Tools:**
   - What no-code tools do you use?
   - When do you choose no-code vs custom code?
   - What are the limitations you've hit?

3. **Error Handling:**
   - How do you currently handle errors?
   - Do you have retry logic?
   - How do you monitor for failures?

4. **Versioning:**
   - Do you version your workflows?
   - How do you rollback when things break?
   - What's your change management process?

5. **Integration:**
   - What systems do you need to connect?
   - What integrations are missing?
   - How can you improve your integration architecture?

### Action Items

- [ ] Complete the integration exercise
- [ ] Build webhook-triggered automation
- [ ] Review Module 7: AI-Native GTM Workflows
- [ ] Document your integration architecture
- [ ] Set up error monitoring

---

## Key Takeaways

- **APIs and webhooks enable system integration**
- **No-code tools are powerful but have limitations**
- **Choose the right tool for the job (no-code vs custom code)**
- **Error handling and retries are critical for reliability**
- **Versioning and rollback mindset prevents production issues**

---

## Next Steps

- **Complete The**: Complete the hands-on exercise: Connect HubSpot with external systems
- **webhook-triggered automation Development**: Build webhook-triggered automation
- **Review Module**: Review Module 7: AI-Native GTM Workflows
- **Join Course**: Join course community discussions

---

**Ready to build? Let's move to [Module 7: AI-Native GTM Workflows →](Module_07_AI_Native_GTM_Workflows.md)**
