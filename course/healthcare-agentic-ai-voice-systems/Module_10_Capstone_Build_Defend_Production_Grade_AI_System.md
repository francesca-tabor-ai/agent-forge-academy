---
title: "Module 10: Capstone — Build & Defend a Production-Grade AI System"
description: "Demonstrate full engineering ownership"
module: "10"
order: 10
email_takeaway: "The capstone requires designing and defending a complete AI system with architecture, safety, governance, monitoring, and explicit trade-offs."
email_action: "Begin designing your capstone system architecture with safety mechanisms and governance."
---

# Module 10: Capstone — Build & Defend a Production-Grade AI System

**Duration:** Week 10-14  
**Learning Objectives:**
- **a complete agentic or voice-based AI Development**: Design a complete agentic or voice-based AI system for hospital deployment
- **all course concepts into a cohesive system Integration**: Integrate all course concepts into a cohesive system
- **production-ready documentation Development**: Create production-ready documentation
- **Defend System**: Defend system design to stakeholders
- **Demonstrate Engineering**: Apply demonstrate engineering ownership in relevant contexts

---

## 10.1 Capstone Brief

### Objective

Design and defend an agentic or voice-based AI system suitable for hospital deployment. The system must demonstrate:

- Complete system architecture
- Agent or voice workflow design
- Safety and failure handling
- Data governance approach
- Monitoring and incident response
- Explicit trade-offs and rationale

### System Requirements

**1. Functional Requirements**
- Clear use case and value proposition
- Complete workflow design
- Integration with clinical systems
- User interface/experience design

**2. Safety Requirements**
- Hazard analysis
- FMEA for critical components
- Safety mechanisms
- Failure handling

**3. Governance Requirements**
- Data minimization and purpose limitation
- PHI separation
- Audit trails
- Access control

**4. Operational Requirements**
- Monitoring and observability
- Incident response
- Deployment strategy
- Change management

**5. Regulatory Requirements**
- Compliance documentation
- Risk assessment
- Validation approach
- Inspection readiness

---

## 10.2 System Architecture

### Architecture Requirements

**1. High-Level Architecture**
- System components
- Data flow
- Integration points
- Technology stack

**2. Detailed Component Design**
- Each component specified
- Interfaces defined
- Dependencies identified
- Scalability considered

**3. Safety Architecture**
- Safety layers
- Failure modes
- Recovery mechanisms
- Human oversight

**4. Security Architecture**
- Authentication and authorization
- Data encryption
- Network security
- Access controls

### Architecture Documentation

**Deliverable:** System architecture document including:

1. **Architecture Overview**
   - High-level system diagram
   - Component descriptions
   - Technology choices
   - Integration architecture

2. **Component Specifications**
   - Detailed component design
   - Interface specifications
   - Data models
   - API specifications

3. **Safety Architecture**
   - Safety layer design
   - Failure mode handling
   - Recovery procedures
   - Human oversight design

4. **Security Architecture**
   - Security controls
   - Encryption strategy
   - Access control design
   - Network architecture

5. **Scalability and Performance**
   - Performance requirements
   - Scalability design
   - Resource planning
   - Load handling

---

## 10.3 Agent or Voice Workflow

### Workflow Design

**1. Complete Workflow**
- End-to-end user journey
- All steps defined
- Decision points identified
- Handoffs specified

**2. Agent Design (if agentic)**
- Agent roles and responsibilities
- Task decomposition
- Permission model
- Escalation paths

**3. Voice Design (if voice system)**
- Voice pipeline architecture
- ASR/NLU/TTS design
- Fallback strategies
- Safety mechanisms

**4. Clinical Integration**
- EHR integration
- Workflow integration
- User interface
- Notification system

### Workflow Documentation

**Deliverable:** Workflow design document including:

1. **Workflow Overview**
   - Use case description
   - User personas
   - Workflow diagram
   - Key steps

2. **Detailed Workflow**
   - Step-by-step breakdown
   - Decision points
   - Handoffs
   - Error handling

3. **Agent/Voice Design**
   - Agent architecture or voice pipeline
   - Component specifications
   - Integration points
   - Safety mechanisms

4. **Clinical Integration**
   - EHR integration design
   - Workflow integration
   - User interface design
   - Notification design

---

## 10.4 Safety & Failure Handling

### Safety Design

**1. Hazard Analysis**
- Identified hazards
- Risk assessment
- Mitigation strategies
- Residual risk

**2. FMEA**
- Component analysis
- Failure modes
- Effects analysis
- Mitigation design

**3. Safety Mechanisms**
- Validation checks
- Confidence thresholds
- Refusal behaviors
- Human oversight

**4. Failure Handling**
- Failure modes
- Recovery strategies
- Degradation modes
- Escalation procedures

### Safety Documentation

**Deliverable:** Safety and failure handling document including:

1. **Hazard Analysis**
   - Hazard identification
   - Risk assessment
   - Mitigation strategies
   - Risk register

2. **FMEA**
   - Component breakdown
   - Failure mode analysis
   - Risk prioritization
   - Mitigation design

3. **Safety Mechanisms**
   - Safety layer design
   - Validation mechanisms
   - Confidence thresholds
   - Human oversight

4. **Failure Handling**
   - Failure mode catalog
   - Recovery procedures
   - Degradation strategies
   - Escalation workflows

---

## 10.5 Data Governance Approach

### Governance Design

**1. Data Minimization**
- Required data identification
- Purpose limitation
- Data collection limits
- Retention policies

**2. PHI Separation**
- PHI extraction design
- Anonymization process
- PHI storage
- De-anonymization

**3. Audit Trails**
- What to audit
- Audit logging design
- Audit retention
- Audit access

**4. Access Control**
- Role definitions
- Permission model
- Consent management
- Access logging

### Governance Documentation

**Deliverable:** Data governance document including:

1. **Data Flow Design**
   - Data flow diagram
   - PHI separation architecture
   - Data minimization approach
   - Purpose limitation design

2. **PHI Handling**
   - PHI extraction design
   - Anonymization process
   - PHI storage design
   - De-anonymization process

3. **Audit Trail Design**
   - Audit requirements
   - Logging design
   - Retention policies
   - Access controls

4. **Access Control**
   - Role definitions
   - Permission matrix
   - Consent management
   - Access logging

---

## 10.6 Monitoring and Incident Response

### Observability Design

**1. Logging Strategy**
- What to log
- Log structure
- Log retention
- Privacy considerations

**2. Monitoring Strategy**
- Key metrics
- Monitoring architecture
- Alerting design
- Dashboard design

**3. Drift Detection**
- Data drift detection
- Model drift detection
- Behavioral change detection
- Response procedures

**4. Incident Response**
- Incident types
- Response playbooks
- Investigation procedures
- Post-incident process

### Observability Documentation

**Deliverable:** Monitoring and incident response document including:

1. **Observability Design**
   - Logging strategy
   - Monitoring architecture
   - Metrics definition
   - Dashboard design

2. **Alerting Strategy**
   - Alert conditions
   - Alert severity
   - Alert channels
   - Escalation procedures

3. **Drift Detection**
   - Detection methods
   - Baseline establishment
   - Response procedures
   - Monitoring schedule

4. **Incident Response**
   - Incident types
   - Response playbooks
   - Investigation procedures
   - Communication plans

---

## 10.7 Explicit Trade-offs

### Trade-off Analysis

**Required Trade-offs to Document:**

**1. Functionality vs Safety**
- What functionality was limited for safety?
- What safety mechanisms impact usability?
- How is the balance maintained?

**2. Performance vs Accuracy**
- What performance optimizations were made?
- How does this impact accuracy?
- What are the acceptable limits?

**3. Automation vs Human Oversight**
- What is automated vs human-reviewed?
- Why these choices?
- What are the implications?

**4. Cost vs Capability**
- What capabilities were limited by cost?
- What cost optimizations were made?
- What are the trade-offs?

**5. Speed vs Thoroughness**
- What shortcuts were taken?
- What thoroughness was prioritized?
- What are the implications?

### Trade-off Documentation

**Deliverable:** Trade-off analysis document including:

1. **Trade-off Catalog**
   - All major trade-offs
   - Rationale for each
   - Impact assessment
   - Mitigation strategies

2. **Decision Rationale**
   - Why these choices?
   - What alternatives were considered?
   - What evidence supports decisions?
   - What are the risks?

3. **Acceptable Limits**
   - What are acceptable performance limits?
   - What are acceptable safety limits?
   - What are acceptable cost limits?
   - How are limits monitored?

---

## 10.8 Final Deliverables

### Required Deliverables

**1. Architecture Diagrams**
- System architecture diagram
- Component diagrams
- Data flow diagrams
- Safety architecture diagram
- Deployment architecture diagram

**2. Failure Mode Analysis**
- Complete FMEA
- Failure mode register
- Mitigation strategies
- Risk assessment

**3. Observability Plan**
- Monitoring design
- Logging strategy
- Alerting design
- Incident response playbooks

**4. "Explain to a Regulator" Technical Summary**
- Executive summary
- System overview
- Safety demonstration
- Compliance evidence
- Risk assessment
- Validation approach

### Deliverable Specifications

**Architecture Diagrams:**
- Professional diagrams (use standard tools)
- Clear labeling and legends
- Multiple levels of detail
- Integration points shown

**Failure Mode Analysis:**
- Complete FMEA table
- Risk prioritization
- Mitigation design
- Residual risk assessment

**Observability Plan:**
- Comprehensive monitoring design
- Complete logging strategy
- Detailed alerting design
- Complete incident response playbooks

**Regulatory Summary:**
- 5-10 page executive summary
- Written for non-technical audience
- Focus on safety and compliance
- Evidence-based arguments

---

## 10.9 Defense Presentation

### Presentation Requirements

**1. System Overview (5 minutes)**
- Use case and value
- System architecture
- Key features
- Clinical integration

**2. Safety and Governance (10 minutes)**
- Safety mechanisms
- Failure handling
- Data governance
- Compliance approach

**3. Technical Deep Dive (10 minutes)**
- Architecture details
- Key technical decisions
- Integration design
- Scalability considerations

**4. Trade-offs and Rationale (5 minutes)**
- Major trade-offs
- Decision rationale
- Alternative considerations
- Risk acceptance

**5. Q&A (10 minutes)**
- Answer questions
- Defend decisions
- Address concerns
- Discuss alternatives

### Presentation Guidelines

**Content:**
- Clear and concise
- Evidence-based
- Professional
- Comprehensive

**Delivery:**
- Well-organized
- Engaging
- Confident
- Responsive to questions

**Visuals:**
- Professional diagrams
- Clear slides
- Appropriate detail
- Good use of visuals

---

## 10.10 Evaluation Criteria

### Evaluation Rubric

**1. System Architecture (25%)**
- Completeness
- Clarity
- Technical soundness
- Integration design

**2. Safety and Failure Handling (25%)**
- Hazard analysis quality
- FMEA completeness
- Safety mechanism design
- Failure handling design

**3. Data Governance (15%)**
- Data minimization
- PHI separation
- Audit trail design
- Access control

**4. Observability (15%)**
- Monitoring design
- Logging strategy
- Incident response
- Drift detection

**5. Trade-offs and Rationale (10%)**
- Trade-off identification
- Rationale quality
- Evidence support
- Risk awareness

**6. Documentation Quality (10%)**
- Completeness
- Clarity
- Professionalism
- Organization

**Total: 100%**

**Passing Grade: 70%**

---

## 10.11 Capstone Timeline

### Week 10: Planning and Design
- Finalize use case
- Design architecture
- Plan safety mechanisms
- Design governance approach

### Week 11: Detailed Design
- Complete architecture design
- Design workflows
- Complete FMEA
- Design observability

### Week 12: Documentation
- Write all documentation
- Create diagrams
- Prepare regulatory summary
- Review and refine

### Week 13: Presentation Preparation
- Create presentation
- Practice delivery
- Prepare for Q&A
- Final review

### Week 14: Defense
- Present system design
- Defend decisions
- Answer questions
- Submit final deliverables

---

## 10.12 Resources and Support

### Available Resources

**1. Course Materials**
- All module materials
- Examples and templates
- Best practices
- Reference documents

**2. Office Hours**
- Weekly office hours
- One-on-one support
- Design reviews
- Q&A sessions

**3. Peer Review**
- Peer feedback sessions
- Design critiques
- Collaborative learning
- Support network

**4. Templates**
- Architecture templates
- FMEA templates
- Documentation templates
- Presentation templates

---

## 10.13 Key Takeaways

**Capstone Fundamentals:**
- Integrate all course concepts
- Design complete, production-ready system
- Document thoroughly
- Defend decisions with evidence
- Demonstrate engineering ownership

**Success Factors:**
- Start early
- Iterate on design
- Seek feedback
- Document thoroughly
- Practice presentation

**Next Steps:**
- **Choose Your**: Choose your use case
- **Begin Architecture**: Apply begin architecture design in relevant contexts
- **Plan Your**: Apply plan your timeline in relevant contexts
- **Start Documentation**: Apply start documentation early in relevant contexts
- **Practice Your**: Apply practice your defense in relevant contexts

---

## Additional Resources

**Readings:**
- "System Architecture Design" - Architecture patterns
- "Healthcare AI Deployment" - Real-world examples
- "Regulatory Defense" - Compliance documentation
- "Technical Presentations" - Presentation skills

**Templates:**
- Architecture diagram templates
- FMEA templates
- Documentation templates
- Presentation templates

**Support:**
- Office hours schedule
- Peer review sessions
- Design review appointments
- Q&A forum

---

## Congratulations!

You've completed the Healthcare Agentic AI & Voice Systems course. You now have the knowledge and skills to:

- Design safe, auditable AI systems for healthcare
- Engineer systems that respect clinical workflows
- Build agents with bounded autonomy
- Design resilient voice systems
- Conduct failure mode analysis
- Implement data governance by design
- Architect safe LLM systems
- Monitor and respond to incidents
- Deploy safely to production
- Defend systems to regulators

**You are now ready to engineer production-grade AI systems for healthcare!**

---

**Module 10 Complete**  
**Course Complete!**
