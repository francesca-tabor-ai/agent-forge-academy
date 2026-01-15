---
title: "Module 6: Narrative Performance Generator"
description: "Enable advice-led, not product-led, marketing"
module: "6"
order: 6
---

# Module 6: Narrative Performance Generator

**Duration:** Week 6  
**Learning Objectives:**
- Translate quantitative data into human narratives
- Explain performance in different market regimes
- Tailor messages for advisors vs. end clients
- Generate dynamic narratives vs. static factsheets

---

## Lesson 6.1: Translating Quantitative Data into Human Narratives

### Narrative Generation

**Generation Framework**
```python
class NarrativePerformanceGenerator:
    """
    Generate human narratives from quantitative performance data
    """
    def __init__(self):
        self.data_analyzer = PerformanceDataAnalyzer()
        self.narrative_engine = NarrativeEngine()
        self.language_model = LanguageModel()
    
    def generate_narrative(self, fund_data, context):
        """
        Generate narrative from quantitative data
        """
        # Analyze performance data
        analysis = self.data_analyzer.analyze(fund_data)
        
        # Extract key insights
        insights = extract_key_insights(analysis)
        
        # Generate narrative structure
        narrative_structure = create_narrative_structure(insights, context)
        
        # Generate narrative text
        narrative = self.narrative_engine.generate(narrative_structure, context)
        
        # Refine for human readability
        refined_narrative = refine_for_readability(narrative)
        
        return {
            'narrative': refined_narrative,
            'insights': insights,
            'structure': narrative_structure,
            'confidence': calculate_narrative_confidence(analysis)
        }
```

### Narrative Components

**Key Elements**
- Performance summary
- Key drivers
- Context explanation
- Forward-looking perspective

---

## Lesson 6.2: Explaining Performance in Different Market Regimes

### Market Regime Analysis

**Regime Types**
- Bull markets
- Bear markets
- Volatile markets
- Sideways markets

**Regime-Specific Narratives**
```python
def generate_regime_specific_narrative(fund_performance, market_regime):
    """
    Generate narrative specific to market regime
    """
    # Analyze performance in context of regime
    regime_analysis = analyze_performance_in_regime(fund_performance, market_regime)
    
    # Generate regime-appropriate narrative
    if market_regime == 'bull':
        narrative = generate_bull_market_narrative(regime_analysis)
    elif market_regime == 'bear':
        narrative = generate_bear_market_narrative(regime_analysis)
    elif market_regime == 'volatile':
        narrative = generate_volatile_market_narrative(regime_analysis)
    else:
        narrative = generate_sideways_market_narrative(regime_analysis)
    
    return {
        'regime': market_regime,
        'narrative': narrative,
        'analysis': regime_analysis,
        'key_points': extract_key_points(narrative)
    }
```

---

## Lesson 6.3: Tailoring Messages for Advisors vs. End Clients

### Audience-Specific Narratives

**Advisor Narratives**
- Performance analysis
- Risk considerations
- Positioning guidance
- Client communication support

**End-Client Narratives**
- Plain language
- Goal alignment
- Simplicity
- Reassurance

**Tailoring Framework**
```python
def tailor_narrative(narrative, audience_type):
    """
    Tailor narrative for specific audience
    """
    if audience_type == 'advisor':
        tailored = {
            'technical_depth': 'high',
            'performance_analysis': detailed_performance_analysis(narrative),
            'risk_discussion': comprehensive_risk_discussion(narrative),
            'positioning_guidance': positioning_guidance(narrative),
            'tone': 'professional'
        }
    elif audience_type == 'end_client':
        tailored = {
            'technical_depth': 'low',
            'plain_language': convert_to_plain_language(narrative),
            'goal_alignment': emphasize_goal_alignment(narrative),
            'simplicity': simplify_narrative(narrative),
            'tone': 'reassuring'
        }
    
    return tailored
```

---

## Lesson 6.4: Dynamic Narratives vs. Static Factsheets

### Dynamic Narrative System

**Dynamic Features**
- Real-time updates
- Context-aware content
- Personalized messaging
- Interactive elements

**Implementation**
```python
class DynamicNarrativeSystem:
    """
    Dynamic narrative generation system
    """
    def __init__(self):
        self.data_updater = DataUpdater()
        self.narrative_generator = NarrativeGenerator()
        self.personalization_engine = PersonalizationEngine()
    
    def generate_dynamic_narrative(self, fund, user_context):
        """
        Generate dynamic, personalized narrative
        """
        # Get latest data
        latest_data = self.data_updater.get_latest(fund)
        
        # Personalize for user
        personalized_context = self.personalization_engine.personalize(
            user_context, latest_data
        )
        
        # Generate narrative
        narrative = self.narrative_generator.generate(
            latest_data, personalized_context
        )
        
        return {
            'narrative': narrative,
            'last_updated': latest_data.timestamp,
            'personalization': personalized_context,
            'interactive_elements': generate_interactive_elements(narrative)
        }
```

### Static Factsheet Limitations

**Limitations**
- Outdated information
- Generic content
- No personalization
- Limited engagement

---

## Exercise 6: Generate Three Different Performance Narratives for the Same Fund and Market Context

### Objective
Create three different performance narratives for the same fund, tailored to different audiences or purposes.

### Requirements

1. **Narrative Generation**
   - Advisor-focused narrative
   - End-client narrative
   - Marketing narrative
   - Or other variations

2. **Narrative Quality**
   - Appropriate tone
   - Clear messaging
   - Audience-appropriate
   - Engaging content

3. **Deliverables**
   - Three narratives
   - Comparison analysis
   - Tailoring guidelines
   - Implementation framework

### Evaluation Criteria
- Narrative quality (35%)
- Audience appropriateness (30%)
- Content clarity (25%)
- Implementation framework (10%)

---

## Key Takeaways

- Translating quantitative data into human narratives makes performance accessible
- Explaining performance in different market regimes provides context and understanding
- Tailoring messages for advisors vs. end clients improves engagement
- Dynamic narratives provide real-time, personalized content vs. static factsheets

---

**End of Module 6**
