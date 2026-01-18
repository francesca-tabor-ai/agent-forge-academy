---
title: "Module 2: Scoping, Ideation, and Prohibited Practices"
description: "Compliance by design, identifying banned practices, and high-risk domain scoping"
module: "2"
order: 2
---

# Module 2: Scoping, Ideation, and Prohibited Practices

**Duration:** Week 2  
**Learning Objectives:**
- **compliance by design into the ideation phase Integration**: Integrate compliance by design into the ideation phase
- **Identify And**: Identify and avoid prohibited practices that are non-negotiable red lines
- **Determine If**: Determine if content pipelines fall into high-risk domains
- **Conduct Compliance**: Conduct compliance assessments for AI content pipeline use cases

---

## 2.1 Compliance by Design

### What is Compliance by Design?

**Compliance by Design** is a methodology that integrates ethical considerations, regulatory requirements, and risk assessment into the earliest stages of AI system development—starting with ideation.

**Core Principle:** It's easier, cheaper, and more effective to build compliance in from the start than to retrofit it later.

### Why Compliance by Design Matters

**Cost of Non-Compliance:**
- **Early Integration:** 1x cost, minimal disruption
- **Mid-Development:** 5-10x cost, significant rework
- **Post-Deployment:** 20-50x cost, potential system redesign
- **After Violation:** Fines up to €35M or 7% of global revenue + reputational damage

**Benefits of Early Integration:**
- Reduced development costs
- Faster time-to-market
- Better system design
- Enhanced trust and reputation
- Avoidance of prohibited practices

### The Compliance by Design Framework

**Phase 1: Ideation - Business Challenge Identification**

**Key Questions:**
1. **What problem are we solving?**
   - Is this a real business need?
   - Are there non-AI solutions?
   - What are the success criteria?

2. **Who is affected?**
   - Direct users
   - Indirect stakeholders
   - Vulnerable populations
   - Society at large

3. **What are the ethical considerations?**
   - Fairness and non-discrimination
   - Privacy and data protection
   - Transparency and explainability
   - Human agency and oversight
   - Social and environmental well-being

4. **What are the regulatory considerations?**
   - Is this a prohibited practice?
   - Does it fall into a high-risk domain?
   - What are the compliance requirements?
   - What are the data requirements?

**Compliance Checklist for Ideation:**
- [ ] Problem statement clearly defined
- [ ] Stakeholders identified
- [ ] Ethical considerations assessed
- [ ] Prohibited practices check completed
- [ ] Risk classification preliminary assessment
- [ ] Data availability and quality assessed
- [ ] Compliance requirements identified
- [ ] Governance structure planned

### Integrating Ethics into Ideation

**Ethical Framework:**
1. **Fairness**
   - Will the system treat all users fairly?
   - Could it discriminate against certain groups?
   - Are there bias risks in the data or design?

2. **Privacy**
   - What data is needed?
   - How will data be protected?
   - Are we respecting user privacy?

3. **Transparency**
   - Can users understand how the system works?
   - Will they know they're interacting with AI?
   - Can decisions be explained?

4. **Human Agency**
   - Can humans override AI decisions?
   - Is human oversight possible?
   - Are users in control?

5. **Social Well-Being**
   - Does this benefit society?
   - Are there potential harms?
   - What are the long-term implications?

**Example: Content Pipeline Ideation**

**Business Challenge:**
- Generate product descriptions at scale for e-commerce catalog
- Current process: Human writers, slow and expensive
- Goal: Automate description generation

**Ethical Assessment:**
- **Fairness:** Could descriptions favor certain products? Risk of bias in training data
- **Privacy:** Product data needed, but no personal data required
- **Transparency:** Users should know content is AI-generated
- **Human Agency:** Human review and editing should be possible
- **Social Well-Being:** Helps businesses, but could impact human writers

**Compliance Assessment:**
- **Prohibited?** No - not social scoring, manipulation, or biometric categorization
- **High-Risk?** No - not in education, employment, or essential services
- **Limited Risk?** Yes - generates synthetic content
- **Requirements:** Transparency, content marking, copyright compliance

### Feasibility Assessment Through Data Availability

**Data Requirements Analysis:**

**Questions to Ask:**
1. **What data do we need?**
   - Training data
   - Validation data
   - Test data
   - Production data

2. **Do we have the data?**
   - Existing datasets
   - Data collection feasibility
   - Data acquisition costs
   - Data quality assessment

3. **Is the data suitable?**
   - Representativeness
   - Quality and completeness
   - Bias assessment
   - Legal and ethical compliance

4. **Can we use the data?**
   - Legal rights (copyright, licensing)
   - Privacy compliance (GDPR)
   - Ethical considerations
   - Data governance requirements

**Data Feasibility Matrix:**

| Data Aspect | Available | Quality | Legal | Ethical | Feasible? |
|-------------|-----------|---------|-------|---------|-----------|
| Training Data |  | High |  |  |  |
| Validation Data |  | Medium |  | ? | ? |
| Test Data |  | - | - | - |  |

**Decision Framework:**
- **All Green:** Proceed with confidence
- **Some Yellow:** Proceed with caution, address issues
- **Any Red:** Reconsider approach or find alternative data

---

## 2.2 Identifying Banned Practices

### Understanding Prohibited Practices

**Definition:** Practices that are **absolutely prohibited** under the EU AI Act. These are non-negotiable red lines that cannot be implemented, regardless of potential benefits.

**Key Characteristics:**
- **Non-Negotiable:** No exceptions or workarounds
- **Absolute:** Cannot be implemented even with safeguards
- **Enforcement:** Severe penalties for violations
- **Scope:** Applies to all AI systems, regardless of risk classification

### Category 1: Social Scoring

**Definition:** Evaluating or classifying natural persons based on their social behavior or personal characteristics, leading to detrimental or unfavorable treatment.

**What Constitutes Social Scoring:**
- Evaluating individuals based on:
  - Social media activity
  - Online behavior
  - Personal relationships
  - Lifestyle choices
  - Political views
  - Religious beliefs

**Prohibited Outcomes:**
- Denial of services
- Employment discrimination
- Credit decisions
- Access restrictions
- Any detrimental treatment

**Examples of Prohibited Social Scoring:**
-  Credit scoring based on social media posts
-  Employment decisions based on Facebook friends
-  Insurance pricing based on lifestyle choices
-  Access to services based on political views

**Content Pipeline Implications:**
- Cannot generate content that evaluates individuals socially
- Cannot create systems that score users based on behavior
- Cannot use social data for content personalization that leads to discrimination

**Red Flags:**
- "Social credit" systems
- "Reputation scoring"
- "Behavioral analysis for access decisions"
- "Social media-based evaluation"

### Category 2: Manipulative Techniques

**Definition:** AI systems that use subliminal techniques or exploit vulnerabilities of specific groups to cause physical or psychological harm.

**What Constitutes Manipulation:**
- **Subliminal Techniques:** Below the threshold of conscious awareness
- **Exploitation of Vulnerabilities:** Targeting children, elderly, disabled, or other vulnerable groups
- **Harm:** Physical or psychological damage

**Prohibited Manipulation:**
-  Subliminal advertising
-  Dark patterns in AI-generated content
-  Exploiting cognitive biases
-  Targeting vulnerable populations with manipulative content
-  Creating addictive content patterns

**Content Pipeline Implications:**
- Cannot generate content designed to manipulate users
- Cannot use dark patterns in AI-generated interfaces
- Cannot exploit vulnerabilities for commercial gain
- Must avoid manipulative language or techniques

**Red Flags:**
- "Persuasive AI"
- "Behavioral manipulation"
- "Addiction optimization"
- "Dark pattern generation"
- "Vulnerability exploitation"

### Category 3: Biometric Categorization

**Definition:** Remote biometric identification systems that categorize natural persons based on sensitive attributes.

**Prohibited Categorization:**
-  Categorization by race, ethnicity, or skin color
-  Categorization by political views
-  Categorization by religious beliefs
-  Categorization by sexual orientation
-  Categorization by gender identity

**Exceptions:**
- Medical or safety purposes (with safeguards)
- Law enforcement (with strict limitations)

**Content Pipeline Implications:**
- Cannot use biometric data for content personalization based on sensitive attributes
- Cannot categorize users by protected characteristics
- Cannot generate content based on biometric categorization

**Red Flags:**
- "Facial recognition for targeting"
- "Biometric-based personalization"
- "Demographic categorization"
- "Protected characteristic analysis"

### Category 4: Real-Time Remote Biometric Identification

**Definition:** Real-time remote biometric identification in publicly accessible spaces for law enforcement purposes.

**Status:** Generally prohibited, with very limited exceptions:
- Targeted search for specific victims
- Prevention of imminent threat
- Search for suspects of serious crimes

**Content Pipeline Implications:**
- Not typically relevant to content pipelines
- May apply if content system uses real-time biometric identification

### Category 5: Emotion Recognition in Workplace/Education

**Definition:** AI systems that detect emotions in workplace or educational settings.

**Status:** Prohibited, except for:
- Medical or safety purposes
- Specific, limited use cases with safeguards

**Content Pipeline Implications:**
- Cannot use emotion recognition for workplace monitoring
- Cannot use emotion recognition for educational assessment
- May apply if content system includes emotion detection

### Prohibited Practice Detection Framework

**Step 1: Identify System Capabilities**
- What does the system do?
- What data does it use?
- What outputs does it generate?
- Who is affected?

**Step 2: Check Against Prohibited Categories**
- Social scoring?
- Manipulative techniques?
- Biometric categorization?
- Real-time biometric identification?
- Emotion recognition in prohibited contexts?

**Step 3: Assess Impact**
- Does it evaluate or classify persons?
- Does it lead to detrimental treatment?
- Does it exploit vulnerabilities?
- Does it use prohibited techniques?

**Step 4: Decision**
- **If prohibited:** Cannot proceed
- **If unclear:** Seek legal/compliance review
- **If not prohibited:** Continue with risk assessment

### Red Flag Checklist

**Social Scoring Red Flags:**
- [ ] Evaluates individuals based on social behavior
- [ ] Uses social media data for decisions
- [ ] Creates scores or ratings of individuals
- [ ] Leads to access restrictions

**Manipulation Red Flags:**
- [ ] Uses subliminal techniques
- [ ] Targets vulnerable populations
- [ ] Exploits cognitive biases
- [ ] Creates addictive patterns

**Biometric Categorization Red Flags:**
- [ ] Categorizes by protected characteristics
- [ ] Uses biometric data for targeting
- [ ] Creates demographic profiles
- [ ] Leads to discrimination

---

## 2.3 High-Risk Domain Scoping

### Understanding High-Risk Domains

**Definition:** Specific domains where AI systems are automatically classified as high-risk, regardless of their specific use case, if they affect access to or outcomes in these domains.

**Why High-Risk Domains Matter:**
- **Automatic Classification:** Systems in these domains are high-risk by default
- **Strict Requirements:** Must comply with all high-risk requirements
- **Conformity Assessment:** Requires assessment before deployment
- **Registration:** Must be registered in EU database

### High-Risk Domain Categories

**1. Education and Vocational Training**

**Scope:**
- AI systems used in educational institutions
- Systems affecting access to education
- Systems affecting educational outcomes
- Systems used for assessment or evaluation

**Examples:**
- Student assessment systems
- Admission decision systems
- Personalized learning platforms (if affecting access)
- Content generation for educational materials (if affecting outcomes)
- Automated grading systems

**Content Pipeline Implications:**
- Educational content generators may be high-risk if they affect:
  - Student assessment
  - Admission decisions
  - Educational outcomes
  - Access to education

**Assessment Questions:**
- Does the system affect student grades or assessment?
- Does it influence admission decisions?
- Does it affect access to educational opportunities?
- Does it impact educational outcomes?

**2. Employment, Worker Management, and Access to Self-Employment**

**Scope:**
- AI systems used in employment contexts
- Systems affecting hiring decisions
- Systems affecting employment terms
- Systems used for worker management

**Examples:**
- Recruitment and selection systems
- Resume screening systems
- Interview assessment systems
- Performance evaluation systems
- Promotion decision systems
- Termination decision systems
- Worker monitoring systems

**Content Pipeline Implications:**
- Content generation for recruitment may be high-risk if it:
  - Affects hiring decisions
  - Influences candidate evaluation
  - Impacts employment terms
  - Affects worker management

**Assessment Questions:**
- Does the system affect hiring decisions?
- Does it influence candidate evaluation?
- Does it impact employment terms or conditions?
- Does it affect worker management or monitoring?

**3. Access to and Enjoyment of Essential Private Services and Public Services and Benefits**

**Scope:**
- AI systems affecting access to essential services
- Systems affecting eligibility for benefits
- Systems affecting service delivery

**Essential Services Include:**
- Financial services (credit, loans, insurance)
- Healthcare services
- Housing services
- Utilities
- Public benefits
- Social services

**Examples:**
- Credit scoring systems
- Insurance underwriting systems
- Loan approval systems
- Healthcare access systems
- Housing application systems
- Benefits eligibility systems

**Content Pipeline Implications:**
- Content generation for essential services may be high-risk if it:
  - Affects access to services
  - Influences eligibility decisions
  - Impacts service delivery
  - Affects benefit determinations

**Assessment Questions:**
- Does the system affect access to essential services?
- Does it influence eligibility decisions?
- Does it impact service delivery?
- Does it affect benefit determinations?

**4. Other High-Risk Domains (Less Relevant to Content Pipelines)**

- Biometric identification and categorization
- Critical infrastructure management
- Law enforcement
- Migration, asylum, and border control
- Administration of justice and democratic processes

### High-Risk Domain Assessment Framework

**Step 1: Identify Domain**
- Is the system used in education, employment, or essential services?
- Does it affect access to or outcomes in these domains?

**Step 2: Assess Impact**
- Does it affect decisions in the domain?
- Does it influence access or outcomes?
- Does it impact individuals' rights or opportunities?

**Step 3: Determine Classification**
- **If YES to impact:** High-risk classification
- **If NO to impact:** May be limited risk or minimal risk
- **If UNCLEAR:** Seek compliance review

### Content Pipeline Scenarios

**Scenario 1: Educational Content Generator**
- **Domain:** Education
- **Impact:** Generates educational materials used in courses
- **Assessment:** Limited risk (if not affecting assessment or access)
- **If affects grades/access:** High-risk

**Scenario 2: Recruitment Content System**
- **Domain:** Employment
- **Impact:** Generates job descriptions and candidate summaries
- **Assessment:** High-risk (affects hiring decisions)

**Scenario 3: Financial Content Advisor**
- **Domain:** Essential services (financial)
- **Impact:** Generates personalized financial advice
- **Assessment:** High-risk (affects access to financial services)

**Scenario 4: Marketing Content Generator**
- **Domain:** Marketing (not high-risk domain)
- **Impact:** Generates marketing content
- **Assessment:** Limited risk (transparency requirements)

### High-Risk Requirements Overview

If your content pipeline is classified as high-risk, you must implement:

1. **Risk Management System**
   - Identify and analyze risks
   - Evaluate and manage risks
   - Document risk management

2. **Data Governance**
   - Data quality and integrity
   - Bias detection and mitigation
   - Representative datasets

3. **Technical Documentation**
   - System architecture
   - Training procedures
   - Performance characteristics
   - Model cards

4. **Record-Keeping**
   - Automated logging
   - Audit trails
   - Event logging

5. **Transparency and Information**
   - Inform users about AI use
   - Explain system capabilities
   - Provide decision explanations

6. **Human Oversight**
   - Human-in-the-loop design
   - Override mechanisms
   - Monitoring and intervention

7. **Accuracy, Robustness, and Cybersecurity**
   - Performance requirements
   - Error handling
   - Security measures

8. **Conformity Assessment**
   - Self-assessment or third-party assessment
   - CE marking
   - Registration in EU database

---

## Lab 2: Compliance Assessment for AI Content Pipeline Use Cases

### Objective
Conduct comprehensive compliance assessments for AI content pipeline scenarios, identifying prohibited practices, risk classifications, and compliance requirements.

### Tasks

**Task 1: Prohibited Practice Assessment**
For each scenario, identify if it involves prohibited practices:

1. **Social Media Content Scorer**
   - System that scores users' social media posts
   - Used to determine access to premium features
   - Scores based on engagement, content quality, and user behavior

2. **Personalized News Generator**
   - System that generates personalized news content
   - Uses user browsing history and preferences
   - Targets content to maximize engagement and time spent

3. **Biometric Content Personalization**
   - System that personalizes content based on facial recognition
   - Categorizes users by demographic characteristics
   - Serves different content to different demographic groups

**Task 2: High-Risk Domain Assessment**
For each scenario, determine if it falls into a high-risk domain:

1. **Student Essay Generator**
   - System that generates essay content for students
   - Used in university courses
   - Content affects student grades

2. **Job Description Generator**
   - System that generates job descriptions
   - Used by HR departments
   - Descriptions influence candidate attraction and selection

3. **Financial Advice Generator**
   - System that generates personalized financial advice
   - Used by financial advisors
   - Advice affects investment decisions

**Task 3: Complete Compliance Assessment**
Choose one scenario and conduct a full compliance assessment:
- Prohibited practice check
- Risk classification
- Domain assessment
- Compliance requirements identification
- Implementation roadmap

### Deliverables
1. Prohibited practice assessment table
2. High-risk domain assessment table
3. Complete compliance assessment document
4. Compliance implementation roadmap

### Evaluation Criteria
- Accurate prohibited practice identification (30%)
- Correct risk classification (30%)
- Comprehensive compliance planning (40%)

---

## Summary

In this module, you've learned:

 **Compliance by Design:** Integrating ethics and compliance into ideation  
 **Prohibited Practices:** Identifying non-negotiable red lines  
 **High-Risk Domains:** Determining if content pipelines fall into regulated domains  
 **Assessment Frameworks:** Practical tools for compliance assessment

**Next Steps:**
- **Complete Lab**: Apply complete lab 2 in relevant contexts
- **Review Module**: Review Module 3: Data Strategy and Pipeline Governance
- **Begin Planning**: Begin planning data governance for your content pipeline

---

**Ready for Module 3?**  
 **[Module 3: Data Strategy and Pipeline Governance →](Module_03_Data_Strategy_and_Pipeline_Governance.md)**
