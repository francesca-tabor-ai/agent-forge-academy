---
title: "Module 8: GTM Analytics, Monitoring & Debugging"
description: "Know when things break before the business feels it"
module: "8"
order: 8
---

# Module 8: GTM Analytics, Monitoring & Debugging

**Duration:** Week 8  
**Learning Objectives:**
- Understand pipeline health metrics
- Distinguish activity vs outcome metrics
- Build automation monitoring and alerts
- Debug broken GTM workflows
- Identify leading vs lagging indicators

---

## 8.1 Pipeline Health Metrics

### Core Pipeline Metrics

**1. Pipeline Value**
- Total pipeline value
- Weighted pipeline (value × probability)
- New pipeline created this period
- Pipeline growth rate

**2. Pipeline Velocity**
- Average deal cycle time
- Time in each stage
- Stage conversion rates
- Velocity by segment

**3. Pipeline Coverage**
- Pipeline-to-quota ratio
- Coverage by rep
- Coverage by segment
- Coverage trends

**4. Pipeline Quality**
- Win rate
- Average deal size
- Deal size distribution
- Quality by source

### Pipeline Health Dashboard

**Key Metrics to Track:**
```
Pipeline Health Score = 
  (Pipeline Coverage × 0.3) +
  (Pipeline Velocity × 0.3) +
  (Pipeline Quality × 0.2) +
  (Pipeline Growth × 0.2)
```

**Health Indicators:**
- 🟢 Healthy: Score >= 80
- 🟡 At Risk: Score 60-79
- 🔴 Unhealthy: Score < 60

### Pipeline Metrics by Stage

**Stage 1: Qualified Lead**
- Number of qualified leads
- Lead-to-opportunity conversion rate
- Time to qualify
- Source distribution

**Stage 2: Discovery**
- Number in discovery
- Discovery completion rate
- Time in discovery
- Conversion to demo

**Stage 3: Demo**
- Number of demos scheduled
- Demo show rate
- Demo-to-proposal conversion
- Time to proposal

**Stage 4: Proposal**
- Number of proposals sent
- Proposal acceptance rate
- Time to close
- Win rate

**Stage 5: Closed**
- Closed won value
- Closed lost value
- Win rate
- Average sales cycle

---

## 8.2 Activity vs Outcome Metrics

### Activity Metrics (Leading Indicators)

**What They Measure:**
- Actions taken
- Effort expended
- Process adherence
- Inputs to the system

**Examples:**
- Emails sent
- Calls made
- Meetings booked
- Demos completed
- Proposals sent
- Activities logged

**Why They Matter:**
- Predict future outcomes
- Measure effort
- Track process execution
- Identify bottlenecks

**Limitations:**
- Don't guarantee results
- Can be gamed
- May not correlate with outcomes
- Focus on quantity over quality

### Outcome Metrics (Lagging Indicators)

**What They Measure:**
- Results achieved
- Business impact
- Value created
- Outputs of the system

**Examples:**
- Revenue closed
- Deals won
- Customers acquired
- Pipeline created
- Conversion rates
- Win rates

**Why They Matter:**
- Measure actual results
- Show business impact
- Track goal achievement
- Drive accountability

**Limitations:**
- Lag behind activities
- Don't show why
- Hard to influence directly
- May be affected by external factors

### Balanced Metrics Framework

**Track Both:**
- Activity metrics (leading) → Predict outcomes
- Outcome metrics (lagging) → Measure results
- Correlation analysis → Understand what drives results

**Example:**
```
Activity: Emails sent per day
Outcome: Meetings booked per week
Correlation: More emails → More meetings (up to a point)

Activity: Calls made per day
Outcome: Deals closed per month
Correlation: More calls → More deals (with quality threshold)
```

### Activity-to-Outcome Funnel

```
Activities (Input)
  ↓
  Emails sent: 1000
  Calls made: 200
  Meetings: 50
  ↓
Outcomes (Output)
  ↓
  Opportunities: 20
  Proposals: 10
  Deals won: 5
  Revenue: $250k
```

**Conversion Rates:**
- Email → Call: 20%
- Call → Meeting: 25%
- Meeting → Opportunity: 40%
- Opportunity → Proposal: 50%
- Proposal → Won: 50%

---

## 8.3 Automation Monitoring & Alerts

### What to Monitor

**1. Workflow Execution**
- Execution count
- Success rate
- Failure rate
- Average execution time
- Peak execution times

**2. Data Quality**
- Data quality scores
- Duplicate rates
- Enrichment success rates
- Validation failure rates

**3. Integration Health**
- API success rates
- API response times
- Webhook delivery rates
- Error rates

**4. Business Impact**
- Records created/updated
- Opportunities created
- Assignments made
- Sequences triggered

### Monitoring Dashboard

**Real-Time Monitoring:**
```
Workflow Health:
- Active workflows: 25
- Executions today: 1,234
- Success rate: 98.5%
- Failures: 18
- Avg execution time: 2.3s

Data Quality:
- Overall score: 87/100
- Duplicate rate: 2.1%
- Enrichment success: 94%
- Validation failures: 12

Integration Health:
- API success rate: 99.2%
- Avg response time: 450ms
- Webhook delivery: 98.8%
- Errors: 5
```

### Alert Configuration

**Critical Alerts:**
- Workflow failure rate > 10%
- Data quality score < 70
- API success rate < 95%
- Integration downtime

**Warning Alerts:**
- Workflow failure rate > 5%
- Data quality score < 80
- API response time > 2s
- Error rate increasing

**Info Alerts:**
- Daily execution summary
- Weekly performance report
- Monthly trends
- Anomaly detection

### Alert Implementation

**Example: Workflow Failure Alert**
```
IF workflow_failure_rate > 10%
THEN:
  1. Send email to GTM team
  2. Create ticket in issue tracker
  3. Log error details
  4. Notify on-call engineer
  5. Update status page
```

**Example: Data Quality Alert**
```
IF data_quality_score < 70
THEN:
  1. Send alert to data team
  2. Create data quality report
  3. Flag records needing attention
  4. Trigger data cleaning workflow
```

---

## 8.4 Debugging Broken GTM Workflows

### Debugging Process

**Step 1: Identify the Problem**
- What's broken?
- When did it break?
- What's the impact?
- Who's affected?

**Step 2: Gather Information**
- Check workflow logs
- Review error messages
- Examine data
- Check recent changes

**Step 3: Reproduce the Issue**
- Recreate the scenario
- Test with sample data
- Verify the problem
- Document steps

**Step 4: Isolate the Cause**
- Check each workflow step
- Verify data inputs
- Test integrations
- Check conditions

**Step 5: Fix the Issue**
- Implement fix
- Test thoroughly
- Deploy fix
- Monitor results

**Step 6: Prevent Recurrence**
- Document the issue
- Update processes
- Add monitoring
- Improve error handling

### Common Issues and Solutions

**Issue 1: Workflow Not Triggering**

**Symptoms:**
- Workflow doesn't run
- No records processed
- No logs generated

**Debugging:**
- Check trigger conditions
- Verify data matches conditions
- Check workflow is enabled
- Verify permissions

**Solutions:**
- Adjust trigger conditions
- Fix data issues
- Enable workflow
- Fix permissions

**Issue 2: Workflow Failing**

**Symptoms:**
- Workflow runs but fails
- Error messages in logs
- Records not updated

**Debugging:**
- Check error logs
- Review failed steps
- Verify API responses
- Check data formats

**Solutions:**
- Fix API errors
- Correct data formats
- Handle edge cases
- Add error handling

**Issue 3: Incorrect Data Updates**

**Symptoms:**
- Wrong values set
- Missing updates
- Inconsistent data

**Debugging:**
- Check workflow logic
- Verify property mappings
- Review conditions
- Test with sample data

**Solutions:**
- Fix workflow logic
- Correct property mappings
- Adjust conditions
- Add validation

**Issue 4: Performance Issues**

**Symptoms:**
- Slow execution
- Timeouts
- Queue backups

**Debugging:**
- Check execution times
- Review volume
- Identify bottlenecks
- Check rate limits

**Solutions:**
- Optimize workflow
- Reduce volume
- Add delays
- Upgrade plan

### Debugging Tools

**1. Workflow Logs**
- Execution history
- Error messages
- Step-by-step logs
- Performance metrics

**2. Data Inspection**
- Check record data
- Verify property values
- Review relationships
- Validate formats

**3. API Testing**
- Test API calls
- Verify responses
- Check authentication
- Validate data

**4. Monitoring Tools**
- Real-time dashboards
- Error tracking
- Performance monitoring
- Alert systems

---

## 8.5 Leading vs Lagging Indicators

### Leading Indicators

**Definition:**
- Predict future outcomes
- Measured before results
- Can be influenced
- Early warning signals

**GTM Examples:**
- Lead volume
- Email open rates
- Meeting booking rate
- Pipeline created
- Activity levels
- Engagement scores

**Why They Matter:**
- Predict revenue
- Identify issues early
- Guide daily actions
- Enable course correction

**Limitations:**
- Don't guarantee outcomes
- May not correlate perfectly
- Can be misleading
- Require interpretation

### Lagging Indicators

**Definition:**
- Measure past results
- Measured after outcomes
- Hard to influence directly
- Confirm what happened

**GTM Examples:**
- Revenue closed
- Deals won
- Customer acquisition
- Win rate
- Churn rate
- Customer lifetime value

**Why They Matter:**
- Measure actual results
- Show business impact
- Track goal achievement
- Drive accountability

**Limitations:**
- Lag behind activities
- Don't show why
- Hard to change quickly
- May be affected by external factors

### Balanced Indicator Framework

**Track Both Types:**
```
Leading Indicators (Predict)
  ↓
  Lead volume
  Meeting rate
  Pipeline created
  Activity levels
  ↓
Lagging Indicators (Confirm)
  ↓
  Revenue closed
  Deals won
  Win rate
  Customer acquisition
```

**Correlation Analysis:**
- Understand what leading indicators predict outcomes
- Focus on leading indicators that correlate with results
- Adjust activities based on leading indicator trends
- Use lagging indicators to validate leading indicators

### Example: Sales Pipeline

**Leading Indicators:**
- Qualified leads created: 100/month
- Meetings booked: 30/month
- Demos completed: 20/month
- Proposals sent: 10/month

**Lagging Indicators:**
- Deals won: 5/month
- Revenue closed: $250k/month
- Win rate: 50%
- Average deal size: $50k

**Correlation:**
- 100 leads → 30 meetings (30% conversion)
- 30 meetings → 20 demos (67% conversion)
- 20 demos → 10 proposals (50% conversion)
- 10 proposals → 5 wins (50% conversion)

**Action:**
- If leading indicators drop, lagging indicators will drop
- Focus on improving leading indicators
- Monitor leading indicators daily
- Review lagging indicators weekly/monthly

---

## Hands-On: Build Dashboards for Sales Leadership

### Objective
Create GTM monitoring dashboards and automation health checks.

### Tasks

**1. Design Dashboard (1 hour)**

Design dashboards for:
- Sales leadership (pipeline, revenue, forecasts)
- GTM operations (workflow health, data quality)
- Individual contributors (activity, performance)

**2. Build Pipeline Dashboard (2 hours)**

Create dashboard showing:
- Pipeline value and growth
- Pipeline velocity
- Stage conversion rates
- Win rates
- Forecast accuracy

**3. Build Automation Health Dashboard (2 hours)**

Create dashboard showing:
- Workflow execution metrics
- Success/failure rates
- Data quality scores
- Integration health
- Error rates

**4. Create Alert System (1 hour)**

Set up alerts for:
- Critical workflow failures
- Data quality degradation
- Integration issues
- Performance problems

**5. Document and Deploy (1 hour)**

Document:
- Dashboard purposes
- Metric definitions
- Alert thresholds
- Response procedures

### Deliverables

**1. Pipeline Dashboard**
- Key pipeline metrics
- Visualizations
- Trends and comparisons
- Forecast views

**2. Automation Health Dashboard**
- Workflow metrics
- Data quality metrics
- Integration health
- Error tracking

**3. Alert Configuration**
- Critical alerts
- Warning alerts
- Info alerts
- Response procedures

**4. Documentation**
- Dashboard guide
- Metric definitions
- Alert procedures
- Troubleshooting guide

### Evaluation Criteria

- **Dashboard Design (30%):** Clear, actionable dashboards
- **Metrics Selection (25%):** Relevant, balanced metrics
- **Alert Configuration (25%):** Appropriate thresholds and notifications
- **Documentation (20%):** Clear, comprehensive documentation

---

## Ship Fast Challenge: Create Automation Health Checks

### Challenge
Build a system that monitors automation health and alerts on issues.

### Steps

1. **Define Health Metrics (30 min)**
   - What metrics indicate health?
   - What are healthy thresholds?
   - What requires alerts?

2. **Build Health Check Workflow (2 hours)**
   - Calculate health metrics
   - Compare to thresholds
   - Generate health report
   - Send alerts if needed

3. **Create Dashboard (1 hour)**
   - Visualize health metrics
   - Show trends
   - Highlight issues
   - Enable drill-down

4. **Set Up Alerts (1 hour)**
   - Configure alert thresholds
   - Set up notifications
   - Test alerts
   - Document procedures

### Success Criteria

- Health metrics calculated accurately
- Alerts trigger when thresholds exceeded
- Dashboard shows clear health status
- Team can respond to issues quickly

---

## Reflection & Iteration

### Questions to Consider

1. **Pipeline Health:**
   - What pipeline metrics do you track?
   - How do you measure pipeline health?
   - What indicates a healthy pipeline?

2. **Activity vs Outcome:**
   - What activity metrics do you track?
   - What outcome metrics do you track?
   - How do they correlate?

3. **Monitoring:**
   - How do you monitor automation?
   - What alerts do you have?
   - How do you detect issues early?

4. **Debugging:**
   - How do you debug broken workflows?
   - What tools do you use?
   - What's your debugging process?

5. **Indicators:**
   - What leading indicators do you track?
   - What lagging indicators do you track?
   - How do you use them together?

### Action Items

- [ ] Complete the dashboard exercise
- [ ] Set up automation health checks
- [ ] Review Module 9: Partnering with Sales, Marketing & CS
- [ ] Document your monitoring and alerting
- [ ] Review and optimize your metrics

---

## Key Takeaways

- **Pipeline health metrics show overall GTM performance**  
- **Activity metrics predict outcomes; outcome metrics confirm results**  
- **Automation monitoring catches issues before they impact business**  
- **Systematic debugging process resolves issues quickly**  
- **Leading and lagging indicators together provide complete picture**

---

## Next Steps

- Complete the hands-on exercise: Build dashboards and health checks
- Set up automation monitoring
- Review Module 9: Partnering with Sales, Marketing & CS
- Join course community discussions

---

**Ready to build? Let's move to [Module 9: Partnering with Sales, Marketing & CS →](Module_09_Partnering_with_Sales_Marketing_and_CS.md)**
