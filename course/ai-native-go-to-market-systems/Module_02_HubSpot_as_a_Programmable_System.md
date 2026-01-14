---
title: "Module 2: HubSpot as a Programmable System (Not Just a CRM)"
description: "Treat HubSpot as a logic engine and source of truth for GTM operations"
module: "2"
order: 2
---

# Module 2: HubSpot as a Programmable System (Not Just a CRM)

**Duration:** Week 2  
**Learning Objectives:**
- Understand HubSpot's object model and relationships
- Design properties for scale and performance
- Build pipelines, lifecycle stages, and qualification logic
- Create workflow design patterns
- Implement routing and ownership logic

---

## 2.1 Object Modeling: Contacts, Companies, Deals, Custom Objects

### The HubSpot Object Model

**Core Objects:**
- **Contacts:** Individual people
- **Companies:** Organizations (B2B accounts)
- **Deals:** Revenue opportunities
- **Tickets:** Support cases
- **Custom Objects:** Domain-specific entities

**Object Relationships:**
```
Company (1) ──→ (Many) Contacts
Company (1) ──→ (Many) Deals
Contact (Many) ──→ (Many) Deals
Deal (1) ──→ (Many) Line Items
```

### Contact Object Design

**Standard Properties:**
- `email` (unique identifier)
- `firstname`, `lastname`
- `phone`, `mobilephone`
- `jobtitle`, `company`
- `lifecyclestage`
- `hubspot_owner_id`

**Best Practices:**
- Use `email` as the primary key
- Keep `company` field for quick association (but use Company object for truth)
- Use `lifecyclestage` for progression tracking
- Set `hubspot_owner_id` for ownership

**Custom Properties:**
- `contact_source` - How they entered the system
- `contact_score` - Lead scoring value
- `last_activity_date` - For recency scoring
- `preferred_contact_method` - Communication preference
- `timezone` - For scheduling

### Company Object Design

**Standard Properties:**
- `name` (required)
- `domain` (for matching)
- `industry`, `numberofemployees`
- `annualrevenue`
- `hubspot_owner_id`

**Best Practices:**
- Use `domain` for company matching
- Keep `numberofemployees` updated for segmentation
- Use `annualrevenue` for account scoring
- Set `hubspot_owner_id` at company level for account-based routing

**Custom Properties:**
- `company_score` - Account scoring
- `company_stage` - Account lifecycle (Target, Customer, etc.)
- `ideal_customer_profile` - ICP match (Yes/No)
- `last_funding_date` - For event triggers
- `tech_stack` - Technology used
- `competitor_mentions` - Competitive intelligence

### Deal Object Design

**Standard Properties:**
- `dealname` (required)
- `amount` (deal value)
- `closedate` (expected close date)
- `dealstage` (pipeline stage)
- `pipeline` (which pipeline)
- `hubspot_owner_id`

**Best Practices:**
- Use `dealname` format: "Company Name - Product/Service"
- Keep `amount` updated for accurate forecasting
- Use `closedate` for pipeline velocity calculations
- Set `dealstage` based on qualification criteria

**Custom Properties:**
- `deal_type` - New business, expansion, renewal
- `deal_source` - How the deal originated
- `sales_motion` - Self-serve, inside sales, field sales
- `champion` - Internal champion contact
- `decision_criteria` - What they're evaluating
- `competitor` - Who you're competing against
- `next_step` - Next action item
- `next_step_date` - When next action happens

### Custom Objects

**When to Use:**
- Domain-specific entities (Projects, Campaigns, Contracts)
- Many-to-many relationships
- Complex data structures
- Integration with external systems

**Example: Project Object**
- Links to: Company, Contact, Deal
- Properties: Project status, start date, end date, budget
- Use case: Track implementation projects post-sale

**Example: Campaign Object**
- Links to: Company, Contact, Deal
- Properties: Campaign type, budget, ROI
- Use case: Track marketing campaign performance

---

## 2.2 Property Design for Scale

### Property Naming Conventions

**Standard Format:**
- Use lowercase with underscores
- Be descriptive but concise
- Group related properties with prefixes

**Examples:**
- ✅ `contact_source`
- ✅ `deal_velocity_score`
- ✅ `company_icp_match`
- ❌ `source`
- ❌ `score`
- ❌ `match`

### Property Types

**Text Properties:**
- Use for: Names, descriptions, free-form data
- Limit: 10,000 characters
- Best for: Flexible, human-readable data

**Number Properties:**
- Use for: Scores, counts, amounts
- Supports: Decimals, currency formatting
- Best for: Calculations, sorting, filtering

**Date Properties:**
- Use for: Timestamps, deadlines, milestones
- Supports: Date and time
- Best for: Time-based workflows, reporting

**Single Select (Dropdown):**
- Use for: Categorical data with fixed options
- Limit: 100 options
- Best for: Standardized classifications

**Multi-Select:**
- Use for: Multiple categories
- Limit: 100 options total
- Best for: Tags, categories, attributes

**Checkbox:**
- Use for: Boolean flags
- Best for: Yes/No, true/false fields

### Property Design Principles

**1. Plan for Scale**
- Don't create properties you won't use
- Group related properties logically
- Use consistent naming conventions
- Document property purposes

**2. Optimize for Performance**
- Use number properties for calculations
- Use single select for filtering
- Avoid free-form text for critical logic
- Index frequently filtered properties

**3. Enable Automation**
- Design properties that workflows can use
- Use calculated properties for derived values
- Create properties that trigger actions
- Design for conditional logic

**4. Support Reporting**
- Create properties that segment well
- Use consistent values across records
- Enable time-based analysis
- Support cohort analysis

### Common Property Patterns

**Scoring Properties:**
```
contact_score (Number)
company_score (Number)
deal_health_score (Number)
```

**Stage Properties:**
```
contact_lifecycle_stage (Single Select)
company_stage (Single Select)
deal_stage (Single Select)
```

**Source Properties:**
```
contact_source (Single Select)
deal_source (Single Select)
campaign_source (Single Select)
```

**Date Properties:**
```
first_contact_date (Date)
last_activity_date (Date)
next_touch_date (Date)
```

---

## 2.3 Pipelines, Lifecycle Stages, and Qualification Logic

### Pipeline Design

**Sales Pipeline Structure:**
```
1. Qualified Lead
2. Discovery Call Scheduled
3. Discovery Call Completed
4. Demo Scheduled
5. Demo Completed
6. Proposal Sent
7. Negotiation
8. Closed Won
9. Closed Lost
```

**Best Practices:**
- Keep stages focused and distinct
- Use clear, action-oriented names
- Limit to 8-10 stages
- Define exit criteria for each stage

### Lifecycle Stages

**Contact Lifecycle:**
```
- Subscriber
- Lead
- Marketing Qualified Lead (MQL)
- Sales Qualified Lead (SQL)
- Opportunity
- Customer
- Evangelist
```

**Company Lifecycle:**
```
- Target
- Prospect
- Customer
- Partner
- Competitor
```

### Qualification Logic

**MQL Criteria:**
- Contact has engaged with content
- Contact fits ICP profile
- Contact has budget authority
- Contact has expressed interest

**SQL Criteria:**
- MQL + Sales conversation
- Budget confirmed
- Timeline established
- Decision maker identified

**Opportunity Criteria:**
- SQL + Specific need identified
- Budget allocated
- Decision process understood
- Champion identified

### Implementing Qualification Logic

**Workflow Approach:**
1. Create properties for qualification criteria
2. Build workflows that evaluate criteria
3. Update lifecycle stages automatically
4. Route based on qualification status

**Example Workflow:**
```
IF contact_score >= 50
AND company_icp_match = "Yes"
AND last_activity_date < 30 days ago
THEN Update lifecyclestage to "MQL"
AND Assign to SDR team
```

---

## 2.4 Workflow Design Patterns

### Pattern 1: Lead Routing

**Use Case:** Route leads to the right rep based on criteria

**Workflow Logic:**
```
IF company_numberofemployees >= 1000
THEN Assign to Enterprise AE
ELSE IF company_numberofemployees >= 100
THEN Assign to Mid-Market AE
ELSE Assign to SMB AE
```

**Implementation:**
1. Create workflow triggered by "Contact created" or "Property value changed"
2. Add IF/THEN branches for each routing rule
3. Set `hubspot_owner_id` property
4. Send notification to assigned owner

### Pattern 2: Data Enrichment

**Use Case:** Automatically enrich contact/company data

**Workflow Logic:**
```
IF contact_email is present
AND contact_company is empty
THEN Call enrichment API
AND Update contact properties
```

**Implementation:**
1. Create workflow triggered by "Contact created"
2. Add condition: Company name is empty
3. Use "Call webhook" action to enrichment service
4. Update properties from API response

### Pattern 3: Stage Progression

**Use Case:** Automatically move deals through pipeline

**Workflow Logic:**
```
IF deal_next_step_date is in the past
AND deal_next_step is "Demo Completed"
THEN Update dealstage to "Proposal Sent"
AND Set next_step to "Awaiting Response"
```

**Implementation:**
1. Create workflow triggered by "Deal property value changed"
2. Add condition: next_step_date is in past
3. Update dealstage property
4. Set next_step property

### Pattern 4: SLA Management

**Use Case:** Ensure leads are contacted within SLA

**Workflow Logic:**
```
IF contact_lifecyclestage = "MQL"
AND contact_owner_assigned_date is set
THEN Wait 24 hours
IF contact_last_contacted_date is still empty
THEN Send alert to owner
AND Escalate to manager
```

**Implementation:**
1. Create workflow triggered by "Contact property value changed"
2. Add condition: lifecyclestage = "MQL"
3. Add delay: 24 hours
4. Check if contacted
5. Send notification if not contacted

### Pattern 5: Data Quality Maintenance

**Use Case:** Keep data clean and complete

**Workflow Logic:**
```
IF contact_email is empty
OR contact_email doesn't contain "@"
THEN Add to "Data Quality Issues" list
AND Send alert to data team
```

**Implementation:**
1. Create workflow triggered by "Contact created" or "Contact updated"
2. Add conditions for data quality checks
3. Add contact to static list
4. Send notification to data team

---

## 2.5 Routing & Ownership Logic

### Ownership Assignment Rules

**Rule-Based Routing:**
- Geographic routing (by territory)
- Account-based routing (by company size)
- Product-based routing (by product interest)
- Round-robin routing (even distribution)
- Skill-based routing (by expertise)

### Geographic Routing

**Implementation:**
```
IF company_country = "United States"
AND company_state = "California"
THEN Assign to West Coast AE
ELSE IF company_state = "New York"
THEN Assign to East Coast AE
```

### Account-Based Routing

**Implementation:**
```
IF company_numberofemployees >= 1000
THEN Assign to Enterprise Team
ELSE IF company_numberofemployees >= 100
THEN Assign to Mid-Market Team
ELSE Assign to SMB Team
```

### Round-Robin Routing

**Implementation:**
1. Create property: `team_member_index` (Number)
2. Create workflow that increments index
3. Use index to assign from team list
4. Reset index when reaching end of list

**Workflow Logic:**
```
SET team_member_index = team_member_index + 1
IF team_member_index > team_size
THEN SET team_member_index = 1
ASSIGN to team_member[team_member_index]
```

### Skill-Based Routing

**Implementation:**
```
IF deal_product_interest = "Enterprise Product"
THEN Assign to Enterprise Specialist
ELSE IF deal_product_interest = "SMB Product"
THEN Assign to SMB Specialist
```

### Ownership Change Logic

**When to Change Ownership:**
- Deal size increases significantly
- Account upgrades to enterprise
- Rep leaves company
- Territory changes
- Product interest changes

**Implementation:**
```
IF deal_amount changes
AND new_amount >= 50000
AND current_owner is not Enterprise AE
THEN Reassign to Enterprise AE
AND Notify previous owner
AND Notify new owner
```

---

## Hands-On: Build a Clean HubSpot Data Model

### Objective
Design and implement a production-ready HubSpot setup with documented logic.

### Tasks

**1. Design Object Model (2 hours)**

Create a data model diagram showing:
- All objects (Contacts, Companies, Deals, Custom Objects)
- Relationships between objects
- Key properties for each object
- Property types and purposes

**2. Create Properties (1 hour)**

In HubSpot, create:
- 10 custom contact properties
- 10 custom company properties
- 10 custom deal properties
- Use consistent naming conventions
- Document each property's purpose

**3. Build Pipeline (1 hour)**

Create a sales pipeline with:
- 8-10 stages
- Clear stage names
- Exit criteria for each stage
- Probability percentages

**4. Implement Routing Logic (2 hours)**

Create workflows for:
- Lead routing (by company size)
- MQL to SQL progression
- Deal stage progression
- SLA management

**5. Document Logic (1 hour)**

Create documentation for:
- Property purposes and usage
- Workflow logic and triggers
- Routing rules and criteria
- Ownership assignment rules

### Deliverables

**1. Data Model Diagram**
- Visual representation of object relationships
- Property lists for each object
- Relationship mappings

**2. HubSpot Configuration**
- All properties created
- Pipeline configured
- Workflows implemented
- Routing logic active

**3. Documentation**
- Property reference guide
- Workflow logic documentation
- Routing rules documentation
- Ownership assignment guide

### Evaluation Criteria

- **Data Model Design (30%):** Logical, scalable structure
- **Property Design (25%):** Consistent, well-named, purposeful
- **Pipeline Design (20%):** Clear stages, appropriate probabilities
- **Workflow Implementation (15%):** Functional, tested workflows
- **Documentation (10%):** Clear, comprehensive documentation

---

## Ship Fast Challenge: Implement Deal Routing

### Challenge
Build a workflow that automatically routes deals to the right owner based on company size and deal amount.

### Steps

1. **Define Routing Rules (30 min)**
   - Enterprise: Employees >= 1000 OR Deal amount >= $50k
   - Mid-Market: Employees 100-999 OR Deal amount $10k-$49k
   - SMB: Employees < 100 AND Deal amount < $10k

2. **Create Properties (15 min)**
   - Ensure `company_numberofemployees` exists
   - Ensure `deal_amount` exists
   - Create `deal_routing_tier` property

3. **Build Workflow (1 hour)**
   - Trigger: Deal created or amount/company changed
   - Add IF/THEN branches for each tier
   - Assign to appropriate owner
   - Set `deal_routing_tier` property

4. **Test & Deploy (30 min)**
   - Test with sample deals
   - Verify routing logic
   - Deploy to production
   - Monitor for first week

### Success Criteria

- Deals route correctly based on rules
- No manual assignment needed
- Routing tier property is set
- Owners are notified of assignment

---

## Reflection & Iteration

### Questions to Consider

1. **Object Modeling:**
   - How does your current object model support your GTM process?
   - What relationships are missing?
   - What custom objects would add value?

2. **Property Design:**
   - Are your properties consistently named?
   - Do properties support automation?
   - What properties are missing for your use cases?

3. **Pipeline Design:**
   - Do your pipeline stages reflect your sales process?
   - Are exit criteria clear for each stage?
   - How can you improve stage progression?

4. **Workflow Patterns:**
   - What manual processes can you automate?
   - Which workflow patterns apply to your use cases?
   - How can you improve workflow reliability?

5. **Routing Logic:**
   - Is lead routing optimal?
   - Are deals assigned to the right owners?
   - How can routing be improved?

### Action Items

- [ ] Complete the HubSpot data model exercise
- [ ] Implement deal routing workflow
- [ ] Document your HubSpot configuration
- [ ] Review Module 3: Data Quality, Validation & Enrichment
- [ ] Set up monitoring for your workflows

---

## Key Takeaways

- **HubSpot is a programmable system, not just a CRM**  
- **Property design impacts scalability and automation**  
- **Pipeline stages should reflect your sales process**  
- **Workflow patterns enable automation at scale**  
- **Routing logic ensures leads and deals go to the right owners**

---

## Next Steps

- Complete the hands-on exercise: Build HubSpot data model
- Implement deal routing workflow
- Review Module 3: Data Quality, Validation & Enrichment at Scale
- Join course community discussions

---

**Ready to build? Let's move to [Module 3: Data Quality, Validation & Enrichment at Scale →](Module_03_Data_Quality_Validation_and_Enrichment_at_Scale.md)**
