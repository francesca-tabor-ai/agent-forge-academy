---
title: "Module 1: Foundations of the AI Life Cycle"
description: "Understanding AI systems, life cycle phases, and risk-based classification"
module: "1"
order: 1
---

# Module 1: Foundations of the AI Life Cycle

**Duration:** Week 1  
**Learning Objectives:**
- Define AI systems and understand the distinction between specific-use AI and General Purpose AI (GPAI)
- Master the five phases of the AI life cycle from ideation to continuous operation
- Navigate the risk-based approach and understand the four-tier classification system
- Apply risk classification to real-world AI content pipeline scenarios

---

## 1.1 Defining AI Systems and General Purpose AI (GPAI)

### Understanding AI Systems

According to the EU AI Act, an **AI system** is defined as:

> "A machine-based system designed to operate with varying levels of autonomy and that may exhibit adaptiveness after deployment and that, for explicit or implicit objectives, infers, from the input it receives, how to generate outputs such as predictions, content, recommendations, or decisions that can influence physical or virtual environments."

### Key Characteristics of AI Systems

**1. Machine-Based**
- Systems that rely on computational processes
- Not purely rule-based (though may incorporate rules)
- Utilize algorithms and data processing

**2. Varying Levels of Autonomy**
- **Low autonomy:** Human makes all decisions, AI provides recommendations
- **Medium autonomy:** AI makes decisions within defined parameters
- **High autonomy:** AI operates independently with minimal human oversight

**3. Adaptiveness**
- Systems that can learn and improve after deployment
- May adjust behavior based on new data or feedback
- Includes both online learning and periodic retraining

**4. Inference Capability**
- Systems that generate outputs from inputs
- Not simply retrieving stored information
- Creating new predictions, content, recommendations, or decisions

### Types of AI Systems

**1. Specific-Use AI Systems**
- Designed for a particular application or domain
- Trained and optimized for specific tasks
- Examples:
  - Content moderation systems
  - Product recommendation engines
  - Automated translation services
  - Image generation for e-commerce

**2. General Purpose AI (GPAI)**
- Capable of performing distinct tasks across multiple domains
- Not limited to a single use case
- Examples:
  - Large language models (GPT, Claude, Llama)
  - Multimodal foundation models
  - General-purpose image generators

### Distinction: Specific-Use vs. GPAI

**Specific-Use AI:**
- **Scope:** Single domain or application
- **Training:** Domain-specific data
- **Deployment:** Fixed use case
- **Regulation:** Based on specific use case risk

**GPAI:**
- **Scope:** Multiple domains and tasks
- **Training:** Broad, diverse datasets
- **Deployment:** Flexible, adaptable
- **Regulation:** Additional requirements for GPAI providers

### Implications for AI Content Pipelines

**Content Pipeline Scenarios:**

**Scenario 1: E-commerce Product Description Generator**
- **Type:** Specific-use AI
- **Purpose:** Generate product descriptions for online catalogs
- **Domain:** E-commerce, retail
- **Risk Assessment:** Based on e-commerce use case

**Scenario 2: Multimodal Content Creation Platform**
- **Type:** GPAI (if using foundation models)
- **Purpose:** Generate text, images, and video content
- **Domain:** Multiple (marketing, education, entertainment)
- **Risk Assessment:** GPAI requirements + use case risk

---

## 1.2 The Five Phases of the AI Life Cycle

The EU AI Act recognizes that AI systems evolve through distinct phases. Understanding these phases is critical for implementing compliance at each stage.

### Phase 1: Ideation and Qualification

**Purpose:** Identify business needs and assess feasibility

**Key Activities:**
- **Business Need Identification**
  - What problem are we solving?
  - What are the business objectives?
  - What are the success metrics?

- **Feasibility Assessment**
  - Is AI the right solution?
  - Do we have the necessary data?
  - What are the technical requirements?
  - What are the resource constraints?

- **Initial Risk Assessment**
  - What are potential risks?
  - Who might be affected?
  - What are the ethical considerations?

**Compliance Considerations:**
- Begin compliance by design thinking
- Identify potential prohibited practices early
- Assess if use case falls into high-risk domain
- Consider data availability and quality

**Example: Content Pipeline Ideation**
- **Business Need:** Generate product descriptions at scale
- **Feasibility:** Large product catalog, limited human writers
- **Data:** Product specifications, existing descriptions
- **Risk:** Potential for inaccurate or misleading content

### Phase 2: Framing

**Purpose:** Define the problem, scope, and approach

**Key Activities:**
- **Problem Definition**
  - Precise problem statement
  - Success criteria
  - Constraints and limitations

- **Scope Definition**
  - What is included/excluded?
  - What are the boundaries?
  - What are the assumptions?

- **Approach Selection**
  - Model selection (build vs. buy)
  - Architecture decisions
  - Technology stack

- **Stakeholder Alignment**
  - Define roles and responsibilities
  - Establish governance structure
  - Set expectations

**Compliance Considerations:**
- Refine risk classification
- Define data requirements
- Establish governance framework
- Plan for transparency and oversight

**Example: Content Pipeline Framing**
- **Problem:** Generate accurate, engaging product descriptions
- **Scope:** Product catalog, exclude customer reviews
- **Approach:** Fine-tune language model on product data
- **Stakeholders:** Product team, legal, compliance, engineering

### Phase 3: Development (Training and Testing)

**Purpose:** Build, train, and validate the AI system

**Key Activities:**
- **Data Preparation**
  - Data collection and sourcing
  - Data cleaning and preprocessing
  - Dataset creation (train/validation/test)

- **Model Development**
  - Architecture design
  - Training process
  - Hyperparameter tuning

- **Testing and Validation**
  - Performance evaluation
  - Bias testing
  - Robustness testing
  - Safety testing

- **Documentation**
  - Technical documentation
  - Model cards
  - Training procedures

**Compliance Considerations:**
- Ensure data quality and representativeness
- Implement bias detection and mitigation
- Document training process thoroughly
- Test for robustness and security
- Address copyright and IP concerns

**Example: Content Pipeline Development**
- **Data:** 10,000 product descriptions, specifications
- **Training:** Fine-tune GPT-4 on product data
- **Testing:** Accuracy, bias, robustness tests
- **Documentation:** Model card, training log, test results

### Phase 4: Industrialization (Scaling)

**Purpose:** Prepare system for production deployment at scale

**Key Activities:**
- **Infrastructure Setup**
  - Compute resources
  - Storage systems
  - Networking

- **Deployment Pipeline**
  - CI/CD processes
  - Version control
  - Rollback procedures

- **Monitoring Infrastructure**
  - Logging systems
  - Metrics collection
  - Alerting systems

- **Operational Procedures**
  - Runbooks
  - Incident response plans
  - Escalation procedures

**Compliance Considerations:**
- Implement monitoring for compliance metrics
- Establish incident reporting procedures
- Prepare for conformity assessment
- Set up audit trails

**Example: Content Pipeline Industrialization**
- **Infrastructure:** Cloud-based API service
- **Deployment:** Automated pipeline with versioning
- **Monitoring:** Content quality, performance, errors
- **Operations:** 24/7 support, incident response

### Phase 5: Run Phase (Continuous Monitoring)

**Purpose:** Operate system in production with continuous oversight

**Key Activities:**
- **Production Operations**
  - System monitoring
  - Performance tracking
  - Error handling

- **Continuous Improvement**
  - Model updates
  - Performance optimization
  - Feature enhancements

- **Compliance Monitoring**
  - Regulatory compliance
  - Impact assessment
  - Incident management

- **Life Cycle Management**
  - Version management
  - Deprecation planning
  - Migration strategies

**Compliance Considerations:**
- Post-market monitoring
- Incident reporting (15-day requirement)
- Regular impact assessments
- Continuous compliance verification

**Example: Content Pipeline Run Phase**
- **Operations:** Monitor generation quality, API performance
- **Improvement:** Retrain on new products, update model
- **Compliance:** Track incidents, report serious issues
- **Life Cycle:** Plan for model updates, deprecation

---

## 1.3 The Risk-Based Approach

The EU AI Act uses a **risk-based approach**, meaning that regulatory requirements vary based on the level of risk an AI system poses. This creates a pyramid of risk classification.

### The Risk Pyramid

```
        ┌─────────────────────┐
        │   UNACCEPTABLE      │  ← Prohibited
        │      RISK           │
        ├─────────────────────┤
        │    HIGH RISK        │  ← Strictly Regulated
        │                     │
        ├─────────────────────┤
        │   LIMITED RISK      │  ← Transparency Focused
        │                     │
        ├─────────────────────┤
        │   MINIMAL RISK      │  ← No Specific Requirements
        └─────────────────────┘
```

### Tier 1: Unacceptable Risk (Prohibited)

**Definition:** AI systems that pose an unacceptable risk to safety, fundamental rights, or democratic values.

**Status:** **PROHIBITED** - Cannot be placed on the market, put into service, or used in the EU.

**Categories of Prohibited Practices:**

**1. Social Scoring**
- Evaluating or classifying natural persons based on social behavior or personal characteristics
- Leading to detrimental or unfavorable treatment
- Examples:
  - Credit scoring based on social media activity
  - Employment decisions based on social connections

**2. Manipulative Techniques**
- AI systems that use subliminal techniques
- Exploiting vulnerabilities of specific groups
- Causing physical or psychological harm
- Examples:
  - Dark patterns in content generation
  - Manipulative advertising targeting vulnerable populations

**3. Biometric Categorization**
- Remote biometric identification systems
- Categorizing natural persons based on sensitive attributes
- Examples:
  - Facial recognition for emotion detection
  - Biometric categorization by race, gender, or political views

**4. Real-Time Remote Biometric Identification**
- In publicly accessible spaces for law enforcement
- Except for specific, limited exceptions

**5. Emotion Recognition in Workplace/Education**
- Detecting emotions in workplace or educational settings
- Except for medical or safety purposes

**Implications for Content Pipelines:**
- Cannot use AI to generate content that manipulates users
- Cannot create social scoring systems
- Must avoid biometric categorization in content

### Tier 2: High-Risk (Strictly Regulated)

**Definition:** AI systems that pose a high risk to health, safety, fundamental rights, or the environment.

**Status:** **STRICTLY REGULATED** - Must comply with comprehensive requirements before deployment.

**High-Risk Categories:**

**1. AI Systems as Products**
- Products covered by EU product safety legislation
- Examples: Medical devices, vehicles, toys

**2. AI Systems in Specific Domains:**
- **Biometric identification and categorization**
- **Critical infrastructure management**
- **Education and vocational training**
- **Employment, worker management, and access to self-employment**
- **Access to and enjoyment of essential private services and public services and benefits**
- **Law enforcement**
- **Migration, asylum, and border control management**
- **Administration of justice and democratic processes**

**3. High-Risk Content Pipeline Scenarios:**

**Education Domain:**
- AI systems used for:
  - Student assessment and evaluation
  - Admission decisions
  - Educational content personalization (if affecting access)

**Employment Domain:**
- AI systems used for:
  - Recruitment and selection
  - Performance evaluation
  - Promotion decisions
  - Termination decisions

**Essential Services Domain:**
- AI systems affecting access to:
  - Financial services (credit scoring)
  - Insurance services
  - Healthcare services
  - Housing services

**Requirements for High-Risk Systems:**
- Risk management system
- Data governance
- Technical documentation
- Record-keeping
- Transparency and information to users
- Human oversight
- Accuracy, robustness, and cybersecurity
- Conformity assessment
- Registration in EU database

**Implications for Content Pipelines:**
- If content pipeline affects education, employment, or essential services, it may be high-risk
- Must implement comprehensive compliance framework
- Requires conformity assessment before deployment

### Tier 3: Limited Risk (Transparency Focused)

**Definition:** AI systems that interact with natural persons or generate synthetic content.

**Status:** **TRANSPARENCY REQUIREMENTS** - Must inform users they are interacting with AI.

**Limited Risk Categories:**

**1. AI Systems Interacting with Natural Persons**
- Chatbots
- Virtual assistants
- Customer service AI
- **Requirement:** Must inform users they are interacting with AI

**2. Emotion Recognition Systems**
- Systems that detect emotions
- **Requirement:** Must inform users

**3. Biometric Categorization Systems**
- Systems categorizing persons by biometrics
- **Requirement:** Must inform users

**4. AI-Generated or Manipulated Content (Deepfakes)**
- Synthetic audio, image, video, or text content
- **Requirement:** Must be marked as artificially generated or manipulated

**5. General Purpose AI (GPAI)**
- Foundation models and GPAI systems
- **Requirements:**
  - Technical documentation
  - Information about training data
  - Copyright compliance
  - Summary of training data

**Implications for Content Pipelines:**
- Most AI content generation systems fall into this category
- Must mark AI-generated content
- Must inform users when interacting with AI
- Must provide transparency about AI use

### Tier 4: Minimal Risk (No Specific Requirements)

**Definition:** AI systems that pose minimal or no risk.

**Status:** **NO SPECIFIC REQUIREMENTS** - Can be deployed freely, but must comply with general laws.

**Examples:**
- Spam filters
- Recommendation systems (non-high-risk)
- Content organization tools
- Simple automation

**Implications for Content Pipelines:**
- Low-risk content generation may fall here
- Still subject to general consumer protection laws
- Good practice to implement transparency anyway

---

## 1.4 Risk Classification Framework

### Step-by-Step Classification Process

**Step 1: Check for Prohibited Practices**
- Is the system performing social scoring?
- Is it using manipulative techniques?
- Is it categorizing by biometrics in prohibited ways?
- **If YES:** System is PROHIBITED
- **If NO:** Continue to Step 2

**Step 2: Check for High-Risk Domains**
- Is the system used in education, employment, or essential services?
- Does it affect access to these services?
- Is it a product covered by product safety legislation?
- **If YES:** System is HIGH-RISK
- **If NO:** Continue to Step 3

**Step 3: Check for Limited Risk Categories**
- Does it interact with natural persons?
- Does it generate synthetic content?
- Is it a GPAI system?
- **If YES:** System is LIMITED RISK
- **If NO:** Continue to Step 4

**Step 4: Minimal Risk**
- System poses minimal risk
- No specific EU AI Act requirements
- Must comply with general laws

### Classification Decision Tree

```
Start
  │
  ├─ Is it a prohibited practice?
  │   ├─ YES → PROHIBITED (Cannot deploy)
  │   └─ NO → Continue
  │
  ├─ Is it in a high-risk domain?
  │   ├─ YES → HIGH-RISK (Strict compliance required)
  │   └─ NO → Continue
  │
  ├─ Does it interact with users or generate synthetic content?
  │   ├─ YES → LIMITED RISK (Transparency required)
  │   └─ NO → Continue
  │
  └─ MINIMAL RISK (No specific requirements)
```

---

## 1.5 Practical Application: Content Pipeline Scenarios

### Scenario 1: E-commerce Product Description Generator

**System:** AI system that generates product descriptions for e-commerce websites.

**Classification Process:**
1. **Prohibited?** No - not performing social scoring, manipulation, or biometric categorization
2. **High-Risk?** No - not in education, employment, or essential services domain
3. **Limited Risk?** Yes - generates synthetic text content
4. **Classification:** **LIMITED RISK**

**Requirements:**
- Mark AI-generated content as artificially generated
- Provide transparency about AI use
- Comply with copyright law (training data summary)

### Scenario 2: Educational Content Personalization System

**System:** AI system that personalizes educational content based on student performance.

**Classification Process:**
1. **Prohibited?** No
2. **High-Risk?** Yes - used in education domain, affects access to education
3. **Classification:** **HIGH-RISK**

**Requirements:**
- Full high-risk compliance framework
- Risk management system
- Data governance
- Technical documentation
- Human oversight
- Conformity assessment
- Registration in EU database

### Scenario 3: Recruitment Content Screening System

**System:** AI system that screens job applications and generates candidate summaries.

**Classification Process:**
1. **Prohibited?** No
2. **High-Risk?** Yes - used in employment domain, affects hiring decisions
3. **Classification:** **HIGH-RISK**

**Requirements:**
- Full high-risk compliance framework
- Bias testing and mitigation
- Transparency to candidates
- Human oversight of decisions
- Conformity assessment

### Scenario 4: Marketing Content Generator

**System:** AI system that generates marketing copy and social media content.

**Classification Process:**
1. **Prohibited?** No (unless using manipulative techniques)
2. **High-Risk?** No - not in regulated domain
3. **Limited Risk?** Yes - generates synthetic content
4. **Classification:** **LIMITED RISK**

**Requirements:**
- Mark AI-generated content
- Transparency about AI use
- Copyright compliance

---

## Lab 1: Risk Classification Exercise

### Objective
Apply the risk-based classification framework to real-world AI content pipeline scenarios.

### Tasks

**Task 1: Classify Five Scenarios**
For each scenario below, determine the risk classification and justify your answer:

1. **Customer Service Chatbot**
   - AI chatbot that answers customer questions about products
   - Provides recommendations
   - Escalates to human agents when needed

2. **Content Moderation System**
   - AI system that flags inappropriate user-generated content
   - Used on social media platform
   - Affects what content users can see

3. **Financial Content Advisor**
   - AI system that generates personalized financial advice
   - Used by bank to provide investment recommendations
   - Affects access to financial services

4. **News Article Generator**
   - AI system that generates news articles from press releases
   - Used by news organization
   - Articles published without human review

5. **Student Essay Grader**
   - AI system that grades student essays
   - Used in university courses
   - Grades affect student final scores

**Task 2: Create Your Own Scenario**
- Design an AI content pipeline scenario
- Classify it using the framework
- Identify all applicable requirements
- Document compliance considerations

**Task 3: Compliance Planning**
For one HIGH-RISK scenario:
- List all compliance requirements
- Identify key stakeholders
- Outline compliance roadmap
- Estimate resource requirements

### Deliverables
1. Classification table for all scenarios
2. Written justification for each classification
3. Your own scenario with classification
4. Compliance plan for high-risk scenario

### Evaluation Criteria
- Accurate risk classification (40%)
- Clear justification (30%)
- Comprehensive compliance planning (30%)

---

## Summary

In this module, you've learned:

✅ **AI System Definitions:** Understanding the distinction between specific-use AI and GPAI  
✅ **Life Cycle Phases:** The five phases from ideation to continuous operation  
✅ **Risk-Based Approach:** The four-tier classification system  
✅ **Practical Application:** How to classify real-world content pipeline scenarios

**Next Steps:**
- Complete Lab 1
- Review Module 2: Scoping, Ideation, and Prohibited Practices
- Begin thinking about compliance by design

---

**Ready for Module 2?**  
👉 **[Module 2: Scoping, Ideation, and Prohibited Practices →](Module_02_Scoping_Ideation_and_Prohibited_Practices.md)**
