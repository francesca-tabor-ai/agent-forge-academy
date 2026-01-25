---
title: "Module 3: Data Quality, Validation & Enrichment at Scale"
description: "Make data reliability a system property, not a manual task"
module: "3"
order: 3
---

# Module 3: Data Quality, Validation & Enrichment at Scale

**Duration:** Week 3  
**Learning Objectives:**
- **Identify Common**: Identify common GTM data failure modes
- **validation rules and conditional logic Development**: Design validation rules and conditional logic
- **enrichment strategies (real-time vs batch) Implementation**: Implement enrichment strategies (real-time vs batch)
- **de-duplication and normalization Development**: Build de-duplication and normalization workflows
- **"garbage in, garbage out" prevention Development**: Create "garbage in, garbage out" prevention systems

---

## 3.1 Common GTM Data Failure Modes

### Failure Mode 1: Duplicate Records

**Symptoms:**
- Multiple contact records for the same person
- Multiple company records for the same organization
- Inflated lead counts
- Split activity across duplicates
- Inaccurate reporting

**Root Causes:**
- Manual data entry
- Multiple entry points (forms, imports, APIs)
- Inconsistent matching logic
- Missing unique identifiers
- Case sensitivity issues

**Impact:**
- Wasted outreach (contacting same person multiple times)
- Inflated metrics (counting duplicates as separate leads)
- Poor customer experience
- Wasted sales time
- Inaccurate forecasting

### Failure Mode 2: Incomplete Data

**Symptoms:**
- Missing email addresses
- Missing company information
- Incomplete contact details
- Missing required fields
- Partial enrichment

**Root Causes:**
- Optional form fields
- Incomplete imports
- Failed enrichment calls
- Manual data entry errors
- API timeouts

**Impact:**
- Cannot contact leads
- Poor personalization
- Inaccurate routing
- Incomplete reporting
- Wasted sales time

### Failure Mode 3: Invalid Data

**Symptoms:**
- Invalid email formats
- Invalid phone numbers
- Invalid company domains
- Invalid dates (future birth dates, etc.)
- Invalid numeric values

**Root Causes:**
- No validation on forms
- Typos in manual entry
- Data import errors
- API response errors
- System bugs

**Impact:**
- Bounced emails
- Failed outreach
- Broken workflows
- Inaccurate calculations
- Poor user experience

### Failure Mode 4: Stale Data

**Symptoms:**
- Outdated job titles
- Outdated company information
- Old email addresses
- Inactive contacts
- Expired data

**Root Causes:**
- No data refresh process
- Infrequent enrichment
- No activity tracking
- Missing update triggers
- Manual maintenance only

**Impact:**
- Wasted outreach to wrong people
- Outdated segmentation
- Poor personalization
- Inaccurate targeting
- Low engagement rates

### Failure Mode 5: Inconsistent Data

**Symptoms:**
- Inconsistent naming conventions
- Mixed case formatting
- Different date formats
- Inconsistent property values
- Varying data structures

**Root Causes:**
- Multiple data sources
- No standardization rules
- Manual entry variations
- Different import formats
- Lack of data governance

**Impact:**
- Poor filtering and segmentation
- Inaccurate reporting
- Broken workflows
- Inconsistent user experience
- Difficult data analysis

---

## 3.2 Validation Rules & Conditional Logic

### Email Validation

**Rules:**
- Must contain "@" symbol
- Must have valid domain format
- Must not contain spaces
- Must match regex pattern: `^[^\s@]+@[^\s@]+\.[^\s@]+$`

**Implementation:**
```
IF contact_email is present
AND contact_email doesn't match pattern "^[^\s@]+@[^\s@]+\.[^\s@]+$"
THEN Set contact_data_quality_status = "Invalid Email"
AND Add to "Data Quality Issues" list
AND Send alert to data team
```

### Phone Number Validation

**Rules:**
- Must contain only digits, spaces, dashes, parentheses, plus signs
- Must have minimum length (10 digits for US)
- Must match country-specific formats

**Implementation:**
```
IF contact_phone is present
AND contact_phone length < 10
THEN Set contact_data_quality_status = "Invalid Phone"
AND Add to "Data Quality Issues" list
```

### Required Field Validation

**Rules:**
- Email is required for contacts
- Company name is required for companies
- Deal name is required for deals
- Domain is required for companies (for matching)

**Implementation:**
```
IF contact is created
AND contact_email is empty
THEN Set contact_data_quality_status = "Missing Email"
AND Prevent workflow execution
AND Send alert to data team
```

### Format Validation

**Rules:**
- Company names should be title case
- Email addresses should be lowercase
- Phone numbers should be standardized format
- Dates should be consistent format

**Implementation:**
```
IF company_name is updated
THEN Convert to title case
AND Update company_name property
```

### Range Validation

**Rules:**
- Deal amount must be positive
- Employee count must be positive integer
- Revenue must be positive number
- Dates must be in valid range

**Implementation:**
```
IF deal_amount is set
AND deal_amount <= 0
THEN Set deal_data_quality_status = "Invalid Amount"
AND Add to "Data Quality Issues" list
```

---

## 3.3 Enrichment Strategies: Real-Time vs Batch

### Real-Time Enrichment

**When to Use:**
- High-value leads (enterprise, large deals)
- Time-sensitive workflows
- Immediate routing needs
- Low volume (< 1000/day)

**Advantages:**
- Immediate data availability
- Better user experience
- Faster routing decisions
- Real-time personalization

**Disadvantages:**
- Higher API costs
- Slower form submissions
- Rate limit constraints
- More complex error handling

**Implementation:**
```
Workflow Trigger: Contact created
Action 1: Call enrichment API (Clearbit, ZoomInfo, etc.)
Action 2: Wait for response (with timeout)
Action 3: Update contact properties
Action 4: If enrichment fails, add to batch queue
```

### Batch Enrichment

**When to Use:**
- High volume leads (> 1000/day)
- Cost-sensitive operations
- Non-time-sensitive data
- Bulk imports

**Advantages:**
- Lower API costs
- Better rate limit management
- Simpler error handling
- Can process during off-hours

**Disadvantages:**
- Delayed data availability
- More complex scheduling
- Requires queue management
- Less immediate value

**Implementation:**
```
Daily Workflow:
1. Find all contacts with enrichment_needed = true
2. Batch into groups of 100
3. Call enrichment API for each batch
4. Update properties from responses
5. Mark enrichment_complete = true
6. Handle errors and retries
```

### Hybrid Approach

**Best Practice:**
- Real-time for high-value leads
- Batch for standard leads
- Scheduled refresh for existing records

**Implementation:**
```
IF contact_company_annualrevenue >= 10000000
OR contact_source = "Enterprise Form"
THEN Enrich in real-time
ELSE Add to batch enrichment queue
```

### Enrichment Data Sources

**Company Data:**
- Clearbit (company info, funding, tech stack)
- ZoomInfo (contacts, company data)
- Apollo (contacts, company data)
- LinkedIn (company pages, employee data)

**Contact Data:**
- Clearbit (person enrichment)
- ZoomInfo (contact data)
- Apollo (contact data)
- LinkedIn (profile data)

**Intent Data:**
- Bombora (intent signals)
- G2 (buyer intent)
- Gartner (research activity)

---

## 3.4 De-Duplication & Normalization

### Duplicate Detection Methods

**Method 1: Exact Match**
- Match on email address (contacts)
- Match on domain (companies)
- Simple but misses variations

**Method 2: Fuzzy Match**
- Match on similar names
- Match on similar domains
- Handles typos and variations
- More complex but more accurate

**Method 3: Multi-Field Match**
- Match on email + name
- Match on domain + company name
- More reliable than single field
- Reduces false positives

### Contact De-Duplication

**Matching Logic:**
```
IF new_contact_email matches existing_contact_email
THEN Merge contacts
AND Keep most recent data
AND Combine activity history
AND Update all related records
```

**Implementation:**
```
Workflow Trigger: Contact created or updated
Action 1: Search for contacts with same email
Action 2: If found, compare data quality scores
Action 3: Merge into highest quality record
Action 4: Update all related deals and companies
Action 5: Archive duplicate record
```

### Company De-Duplication

**Matching Logic:**
```
IF new_company_domain matches existing_company_domain
OR new_company_name is similar to existing_company_name (fuzzy match)
THEN Merge companies
AND Keep most complete data
AND Combine all contacts and deals
```

**Implementation:**
```
Workflow Trigger: Company created or updated
Action 1: Search for companies with same domain
Action 2: If not found, fuzzy match on company name
Action 3: If match found, merge companies
Action 4: Reassign all contacts and deals
Action 5: Archive duplicate company
```

### Data Normalization

**Email Normalization:**
- Convert to lowercase
- Remove spaces
- Remove special characters (except @ and .)

**Company Name Normalization:**
- Convert to title case
- Remove "Inc.", "LLC", "Corp" variations
- Standardize abbreviations

**Phone Number Normalization:**
- Remove non-digit characters
- Add country code if missing
- Format consistently

**Domain Normalization:**
- Convert to lowercase
- Remove "www." prefix
- Remove trailing slashes

---

## 3.5 "Garbage In, Garbage Out" Prevention

### Prevention Strategy 1: Input Validation

**Form Validation:**
- Validate email format on form submission
- Validate phone number format
- Require minimum field lengths
- Block invalid characters
- Provide real-time feedback

**API Validation:**
- Validate all incoming API data
- Reject invalid records
- Return clear error messages
- Log validation failures

### Prevention Strategy 2: Automated Cleaning

**Data Cleaning Workflows:**
- Run daily data quality checks
- Automatically fix common issues
- Normalize data formats
- Remove invalid records
- Update stale data

**Implementation:**
```
Daily Workflow:
1. Find all contacts with data_quality_score < 80
2. For each contact:
   - Normalize email format
   - Standardize phone number
   - Fix company name formatting
   - Update data_quality_score
3. If score still low, flag for manual review
```

### Prevention Strategy 3: Quality Scoring

**Quality Score Calculation:**
```
Base Score: 100
- Missing email: -50
- Missing phone: -20
- Missing company: -20
- Invalid email format: -30
- Invalid phone format: -10
- Stale data (>90 days): -10
- Duplicate record: -40
```

**Implementation:**
```
Workflow Trigger: Contact property changed
Action 1: Calculate data_quality_score
Action 2: Update data_quality_score property
Action 3: If score < 70, add to "Needs Attention" list
Action 4: If score < 50, send alert to data team
```

### Prevention Strategy 4: Monitoring & Alerts

**Key Metrics:**
- Data quality score trend
- Duplicate rate
- Enrichment success rate
- Validation failure rate
- Stale data percentage

**Alerts:**
- Data quality score drops below threshold
- Duplicate rate increases
- Enrichment failure rate increases
- Validation failures spike
- Stale data percentage increases

**Implementation:**
```
Daily Report:
- Overall data quality score
- Top data quality issues
- Enrichment success/failure rates
- Duplicate detection results
- Recommendations for improvement
```

---

## Hands-On: Build an Automated Enrichment + Validation Workflow

### Objective
Create a self-healing contact and account enrichment flow with data quality monitoring.

### Tasks

**1. Design Validation Rules (1 hour)**

Create validation rules for:
- Email format
- Phone number format
- Required fields
- Data ranges
- Format consistency

**2. Build Validation Workflows (2 hours)**

In HubSpot, create workflows that:
- Validate email format on contact creation
- Validate phone number format
- Check required fields
- Calculate data quality scores
- Flag records with quality issues

**3. Implement Enrichment Logic (2 hours)**

Create enrichment workflows:
- Real-time enrichment for high-value leads
- Batch enrichment for standard leads
- Error handling and retries
- Update properties from enrichment data

**4. Build De-Duplication (1 hour)**

Create de-duplication workflows:
- Detect duplicate contacts (by email)
- Detect duplicate companies (by domain)
- Merge logic (keep best data)
- Update related records

**5. Create Monitoring Dashboard (1 hour)**

Build a dashboard showing:
- Data quality score distribution
- Enrichment success rate
- Duplicate detection results
- Validation failure trends
- Top data quality issues

### Deliverables

**1. Validation Workflows**
- Email validation workflow
- Phone validation workflow
- Required field validation workflow
- Data quality scoring workflow

**2. Enrichment System**
- Real-time enrichment workflow
- Batch enrichment workflow
- Error handling logic
- Retry mechanism

**3. De-Duplication System**
- Contact de-duplication workflow
- Company de-duplication workflow
- Merge logic documentation

**4. Monitoring Dashboard**
- Data quality metrics
- Enrichment metrics
- Duplicate detection metrics
- Alert configuration

### Evaluation Criteria

- **Validation Rules (25%):** Comprehensive, accurate validation
- **Enrichment Implementation (30%):** Functional, reliable enrichment
- **De-Duplication (25%):** Accurate duplicate detection and merging
- **Monitoring (20%):** Clear metrics and alerts

---

## Ship Fast Challenge: Create Data Quality Alerts

### Challenge
Build an alert system that notifies you when data quality degrades.

### Steps

1. **Define Alert Thresholds (30 min)**
   - Data quality score < 70
   - Duplicate rate > 5%
   - Enrichment failure rate > 10%
   - Validation failure rate > 5%

2. **Create Alert Workflows (1 hour)**
   - Daily data quality check
   - Calculate metrics
   - Compare to thresholds
   - Send alerts if thresholds exceeded

3. **Set Up Notifications (30 min)**
   - Email alerts to data team
   - Slack notifications (if integrated)
   - Dashboard updates
   - Weekly summary report

4. **Test & Deploy (30 min)**
   - Test with sample data
   - Verify alert triggers
   - Deploy to production
   - Monitor for first week

### Success Criteria

- Alerts trigger when thresholds exceeded
- Notifications are clear and actionable
- Alerts help prevent data quality issues
- Team responds to alerts promptly

---

## Reflection & Iteration

### Questions to Consider

1. **Data Quality:**
   - What are your biggest data quality issues?
   - How do you currently detect data problems?
   - What validation rules would help most?

2. **Enrichment:**
   - Are you enriching data in real-time or batch?
   - What enrichment data sources do you use?
   - How do you handle enrichment failures?

3. **De-Duplication:**
   - How do you currently detect duplicates?
   - What's your duplicate rate?
   - How do you handle merging records?

4. **Prevention:**
   - What causes most data quality issues?
   - How can you prevent bad data from entering?
   - What monitoring do you have in place?

5. **Improvement:**
   - What would improve your data quality most?
   - How can you automate data cleaning?
   - What metrics should you track?

### Action Items

- [ ] Complete the enrichment and validation workflow exercise
- [ ] Set up data quality alerts
- [ ] Review Module 4: Event-Based & Trigger-Based GTM Automation
- [ ] Monitor data quality metrics for one week
- [ ] Document your data quality processes

---

## Key Takeaways

- **Data quality is a system property, not a manual task**
- **Validation rules prevent bad data from entering**
- **Enrichment strategies depend on volume and value**
- **De-duplication keeps records clean and accurate**
- **Monitoring and alerts catch issues before they impact business**

---

## Next Steps

- **Complete The**: Complete the hands-on exercise: Build enrichment and validation workflows
- **data quality alerts Implementation**: Set up data quality alerts
- **Review Module**: Review Module 4: Event-Based & Trigger-Based GTM Automation
- **Join Course**: Join course community discussions

---

**Ready to build? Let's move to [Module 4: Event-Based & Trigger-Based GTM Automation →](Module_04_Event_Based_and_Trigger_Based_GTM_Automation.md)**
