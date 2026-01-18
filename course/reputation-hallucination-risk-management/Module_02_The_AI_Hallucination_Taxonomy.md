---
title: "Module 2: The AI Hallucination Taxonomy"
description: "Knowing What to Look For - Classify hallucinations by severity, surface, and consequence"
module: "2"
order: 2
---

# Module 2: The AI Hallucination Taxonomy

**Knowing What to Look For**

**Duration:** Week 2  
**Learning Objectives:**
- **Classify Hallucinations**: Classify hallucinations by severity, surface, and consequence
- **Prioritize Which**: Prioritize which errors require immediate action
- **the difference between benign, escalatory, and litigable errors Understanding**: Understand the difference between benign, escalatory, and litigable errors
- **a severity scoring framework for your organization Development**: Build a severity scoring framework for your organization

---

## 2.1 Factual Hallucinations

### Definition

**Factual hallucinations** occur when AI generates incorrect information about objective facts: specifications, pricing, availability, features, or company information.

### Categories of Factual Hallucinations

**1. Product Specifications**

**Examples:**
- Incorrect dimensions or weight
- Wrong color options
- False material composition
- Incorrect technical specifications
- Wrong compatibility information

**Risk Factors:**
- High customer impact (purchase decisions)
- Contractual implications (product descriptions as terms)
- Return/refund costs
- Brand trust erosion

**Detection Difficulty:** Medium - Requires cross-referencing with product database

**2. Pricing Information**

**Examples:**
- Incorrect current prices
- Outdated promotional pricing
- Wrong currency conversions
- False discount percentages
- Incorrect bundle pricing

**Risk Factors:**
- Direct revenue impact
- Legal exposure (bait-and-switch, false advertising)
- Customer complaints and refunds
- Regulatory scrutiny (consumer protection)

**Detection Difficulty:** Low - Can be automated against pricing database

**3. Availability Status**

**Examples:**
- Showing out-of-stock items as available
- Incorrect shipping timelines
- Wrong regional availability
- False "limited edition" claims
- Incorrect pre-order dates

**Risk Factors:**
- Customer frustration and complaints
- Operational disruption
- False scarcity claims (regulatory risk)
- Inventory management issues

**Detection Difficulty:** Low - Can be automated against inventory system

**4. Company Information**

**Examples:**
- Incorrect founding dates
- Wrong leadership information
- False company size or location
- Incorrect certifications or awards
- Misrepresented partnerships

**Risk Factors:**
- Reputational damage
- Investor relations issues
- Partner relationship strain
- Regulatory compliance (public company disclosures)

**Detection Difficulty:** Medium - Requires knowledge base verification

---

## 2.2 Visual Hallucinations

### Definition

**Visual hallucinations** occur when AI generates images, graphics, or visual representations that misrepresent products, services, or brand elements.

### Why Visual Hallucinations Escalate Faster

**1. Immediate Impact**
- Images are processed faster than text by human brains
- Visual errors are more memorable
- Screenshots spread faster than text quotes

**2. Trust Erosion**
- "Seeing is believing" - visual errors break trust more quickly
- Harder to correct (requires new image generation)
- Can go viral before correction

**3. Legal Exposure**
- False advertising claims are stronger with visual evidence
- Product liability if visual suggests incorrect use
- Trademark infringement if competitor products shown

### Categories of Visual Hallucinations

**1. Product Depiction Errors**

**Examples:**
- Wrong product colors or finishes
- Incorrect product proportions
- Missing or added features
- Wrong product variants shown
- Incorrect packaging or branding

**2. Impossible Configurations**

**Examples:**
- Products shown in impossible combinations
- Features that don't exist together
- Configurations that violate product constraints
- Size relationships that are physically impossible

**3. Use-Context Hallucinations**

**Examples:**
- Products shown in incorrect use scenarios
- Safety-critical misrepresentations
- Wrong target audience depictions
- Incorrect environmental contexts

**4. Brand Identity Errors**

**Examples:**
- Incorrect logo usage
- Wrong brand colors
- Misused typography
- Incorrect brand guidelines application

---

## 2.3 Summarization Drift

### Definition

**Summarization drift** occurs when AI-generated summaries distort, omit, or misrepresent information from source material, leading to outdated or distorted claims.

### Why Summarization Errors Are Dangerous

**1. Authority Illusion**
- Summaries appear authoritative
- Users trust condensed information
- Errors propagate faster than full text

**2. Context Loss**
- Nuance is lost in summarization
- Important caveats are omitted
- Temporal context (dates, timelines) is distorted

**3. Amplification Effect**
- One source error becomes many summary errors
- Summaries are reused across platforms
- Correction requires updating multiple outputs

### Categories of Summarization Drift

**1. Temporal Distortion**

**Examples:**
- Presenting outdated information as current
- Mixing past and present claims
- Incorrect timeline sequencing
- "Recent" claims for old information

**2. Claim Distortion**

**Examples:**
- Overstating performance claims
- Understating limitations or risks
- Selective fact presentation
- False equivalencies

**3. Omission Errors**

**Examples:**
- Missing critical disclaimers
- Omitting important limitations
- Skipping regulatory warnings
- Leaving out safety information

**4. Aggregation Errors**

**Examples:**
- Combining incompatible information
- Averaging non-averagable metrics
- Merging distinct product lines
- Creating false comparisons

---

## 2.4 Advisory Hallucinations

### Definition

**Advisory hallucinations** occur when AI provides incorrect guidance, recommendations, or advice that could impact health, safety, financial decisions, or legal compliance.

### High-Risk Domains

**1. Health and Medical**

**Examples:**
- Incorrect dosage information
- Wrong medication interactions
- False treatment recommendations
- Incorrect symptom interpretations
- Misleading health claims

**Regulatory Risk:** FDA, EMA, national health authorities

**2. Financial Services**

**Examples:**
- Incorrect investment advice
- Wrong tax information
- False credit terms
- Misleading interest rates
- Incorrect regulatory requirements

**Regulatory Risk:** SEC, FCA, FINRA, national financial regulators

**3. Safety-Critical Information**

**Examples:**
- Incorrect product safety warnings
- Wrong usage instructions
- False compatibility information
- Misleading installation guidance
- Incorrect maintenance requirements

**Regulatory Risk:** CPSC, product safety authorities, liability exposure

**4. Legal Information**

**Examples:**
- Incorrect legal requirements
- Wrong compliance deadlines
- False regulatory interpretations
- Misleading contract terms
- Incorrect jurisdiction-specific rules

**Regulatory Risk:** Legal liability, regulatory non-compliance

---

## 2.5 Severity Classification: Benign vs Escalatory vs Litigable

### Three-Tier Severity Framework

**Tier 1: Benign Errors (Low Severity)**

**Characteristics:**
- No customer impact or minimal impact
- Easy to correct
- No legal or regulatory exposure
- Limited visibility

**Examples:**
- Minor typos
- Outdated but harmless information
- Internal-only errors
- Cosmetic issues

**Response Protocol:**
- Correct in next update cycle
- Monitor for patterns
- No escalation required

**Tier 2: Escalatory Errors (Medium Severity)**

**Characteristics:**
- Customer impact (confusion, complaints)
- Potential for viral spread
- Moderate legal exposure
- Requires prompt correction

**Examples:**
- Incorrect pricing (caught early)
- Wrong product availability
- Misleading but not dangerous claims
- Brand misrepresentation (limited scope)

**Response Protocol:**
- Immediate correction
- Customer notification if needed
- Monitor social media and complaints
- Document incident

**Tier 3: Litigable Errors (High Severity)**

**Characteristics:**
- Significant customer harm
- Regulatory violation
- High legal exposure
- Potential for class action
- Media attention risk

**Examples:**
- False safety claims
- Incorrect medical/financial advice
- Regulatory non-compliance
- False advertising with material impact
- Product liability misrepresentations

**Response Protocol:**
- Immediate legal review
- Regulatory notification if required
- Public correction and apology
- Crisis management activation
- Comprehensive incident documentation

---

## 2.6 Severity Scoring Framework

### Multi-Dimensional Scoring

**Dimension 1: Customer Impact (1-10)**

- **1-3:** No customer impact or minimal confusion
- **4-6:** Customer complaints, returns, or confusion
- **7-8:** Significant customer harm or financial loss
- **9-10:** Health, safety, or major financial impact

**Dimension 2: Legal Exposure (1-10)**

- **1-3:** No legal risk
- **4-6:** Potential false advertising or contract claims
- **7-8:** Regulatory violation or significant liability
- **9-10:** Criminal exposure or class action risk

**Dimension 3: Reputational Risk (1-10)**

- **1-3:** Limited visibility, easy correction
- **4-6:** Potential for complaints or negative reviews
- **7-8:** Media attention or viral spread risk
- **9-10:** Brand crisis or long-term trust erosion

**Dimension 4: Correction Complexity (1-10)**

- **1-3:** Simple edit, immediate fix
- **4-6:** Requires system update or retraining
- **7-8:** Complex correction across multiple systems
- **9-10:** Requires model retraining or system redesign

### Composite Risk Score

**Formula:**
```
Risk Score = (Customer Impact × 0.3) + 
             (Legal Exposure × 0.4) + 
             (Reputational Risk × 0.2) + 
             (Correction Complexity × 0.1)
```

**Risk Thresholds:**
- **1-3:** Benign - Standard correction process
- **4-6:** Escalatory - Expedited correction, monitoring
- **7-8:** High Risk - Legal review, crisis protocol
- **9-10:** Critical - Immediate crisis management

---

## Lab 2: Hallucination Risk Taxonomy

### Objective

Build a comprehensive taxonomy and severity scoring framework for your organization.

### Tasks

**Task 1: Hallucination Classification**

For each type of hallucination (factual, visual, summarization, advisory):

1. **Document Examples**
   - Real examples from your systems (if available)
   - Hypothetical high-risk scenarios
   - Industry case studies

2. **Identify Risk Factors**
   - Customer impact
   - Legal exposure
   - Regulatory sensitivity
   - Correction difficulty

3. **Map to Your Systems**
   - Which systems are vulnerable to each type?
   - What are the most common error patterns?
   - Where are detection gaps?

**Task 2: Severity Scoring Framework**

1. **Customize Dimensions**
   - Adjust scoring dimensions for your industry
   - Set weightings based on business priorities
   - Define thresholds for your risk tolerance

2. **Create Scoring Tool**
   - Spreadsheet or simple application
   - Input fields for each dimension
   - Automatic risk score calculation
   - Recommended response protocol

3. **Test with Scenarios**
   - Create 10 hypothetical hallucination scenarios
   - Score each using your framework
   - Validate with stakeholders (legal, brand, product)

**Task 3: Prioritization Matrix**

Create a 2x2 matrix:

| High Impact | High Frequency | Priority |
|------------|----------------|----------|
| Yes | Yes | **P0 - Immediate** |
| Yes | No | **P1 - High** |
| No | Yes | **P2 - Medium** |
| No | No | **P3 - Low** |

Map your hallucination types to this matrix.

### Deliverables

1. **Hallucination Taxonomy Document**
   - Classification system
   - Examples for each category
   - Risk factor analysis

2. **Severity Scoring Framework**
   - Scoring dimensions and weights
   - Risk thresholds
   - Response protocols by score

3. **Prioritization Matrix**
   - Mapped hallucination types
   - Resource allocation recommendations

### Evaluation Criteria

- Completeness of taxonomy (30%)
- Practicality of scoring framework (40%)
- Actionability of prioritization (30%)

---

## Summary

In this module, you've learned:

- **Factual Hallucinations:** Errors in specifications, pricing, availability, and company information
- **Visual Hallucinations:** Why they escalate faster and categories of visual errors
- **Summarization Drift:** How AI summaries can distort source material
- **Advisory Hallucinations:** High-risk errors in health, finance, safety, and legal domains
- **Severity Classification:** Benign, escalatory, and litigable error tiers
- **Scoring Framework:** Multi-dimensional approach to risk assessment

**Key Takeaway:** Not all hallucinations are created equal. A systematic taxonomy and severity framework enables prioritization and appropriate response.

**Next Steps:**
- **Complete Lab**: Complete Lab 2: Hallucination Risk Taxonomy
- **Review Module**: Review Module 3: Monitoring AI Outputs at Scale
- **Begin Thinking**: Begin thinking about detection systems for each hallucination type

---

**Ready for Module 3?**  
**[Module 3: Monitoring AI Outputs at Scale →](Module_03_Monitoring_AI_Outputs_at_Scale.md)**
