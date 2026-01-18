---
title: "Module 2: Real-Time ESG Controversy Monitoring"
description: "Detect emerging ESG risks before they hit portfolios and headlines"
module: "2"
order: 2
---

# Module 2: Real-Time ESG Controversy Monitoring

**Duration:** Week 2  
**Learning Objectives:**
- **Mine News,**: Mine news, social media, and NGO reports for ESG signals
- **NLP for controversy detection and severity scoring Implementation**: Implement NLP for controversy detection and severity scoring
- **Separate Signal**: Separate signal from noise in ESG monitoring
- **event timelines and escalation logic Development**: Design event timelines and escalation logic

---

## Lesson 2.1: Mining News, Social Media, and NGO Reports

### Data Sources

**Source Types**
- News media
- Social media platforms
- NGO reports
- Regulatory filings
- Industry publications

**Data Collection Framework**
```python
class ESGControversyMonitor:
    """
    Real-time ESG controversy monitoring system
    """
    def __init__(self):
        self.news_collector = NewsCollector()
        self.social_collector = SocialMediaCollector()
        self.ngo_collector = NGOReportCollector()
        self.data_processor = DataProcessor()
    
    def collect_esg_signals(self, time_window):
        """
        Collect ESG signals from multiple sources
        """
        signals = {
            'news': self.news_collector.collect(time_window),
            'social_media': self.social_collector.collect(time_window),
            'ngo_reports': self.ngo_collector.collect(time_window),
            'regulatory': self.collect_regulatory_signals(time_window)
        }
        
        # Process and normalize
        processed_signals = self.data_processor.process(signals)
        
        return processed_signals
```

### Source-Specific Processing

**News Processing**
- Article extraction
- Entity recognition
- Topic classification
- Sentiment analysis

**Social Media Processing**
- Post collection
- Sentiment analysis
- Trend detection
- Influencer identification

**NGO Report Processing**
- Report parsing
- Issue extraction
- Company identification
- Severity assessment

---

## Lesson 2.2: NLP for Controversy Detection and Severity Scoring

### Controversy Detection

**Detection Framework**
```python
def detect_esg_controversies(text_data, company_entities):
    """
    Detect ESG controversies using NLP
    """
    # Load ESG-specific NLP model
    nlp_model = load_esg_nlp_model()
    
    # Process text
    doc = nlp_model(text_data)
    
    # Extract ESG-related entities and events
    esg_entities = extract_esg_entities(doc)
    esg_events = extract_esg_events(doc)
    
    # Match to companies
    company_matches = match_to_companies(esg_entities, esg_events, company_entities)
    
    # Detect controversies
    controversies = []
    for match in company_matches:
        controversy = {
            'company': match.company,
            'event_type': classify_event_type(match.event),
            'severity': calculate_severity(match.event, match.context),
            'confidence': calculate_confidence(match),
            'source': match.source
        }
        controversies.append(controversy)
    
    return controversies
```

### Severity Scoring

**Severity Framework**
```python
def calculate_severity(event, context):
    """
    Calculate severity score for ESG controversy
    """
    severity_factors = {
        'event_type': assess_event_type_severity(event.type),
        'scale': assess_scale(event.scale),
        'regulatory_implication': assess_regulatory_implication(event),
        'media_attention': assess_media_attention(context),
        'ngo_involvement': assess_ngo_involvement(context),
        'historical_pattern': assess_historical_pattern(event.company, event.type)
    }
    
    severity_score = (
        severity_factors['event_type'] * 0.3 +
        severity_factors['scale'] * 0.2 +
        severity_factors['regulatory_implication'] * 0.2 +
        severity_factors['media_attention'] * 0.1 +
        severity_factors['ngo_involvement'] * 0.1 +
        severity_factors['historical_pattern'] * 0.1
    )
    
    severity_level = classify_severity_level(severity_score)
    
    return {
        'score': severity_score,
        'level': severity_level,
        'factors': severity_factors
    }
```

---

## Lesson 2.3: Separating Signal from Noise

### Signal Processing

**Filtering Framework**
```python
def filter_signal_from_noise(controversies):
    """
    Separate signal from noise in ESG monitoring
    """
    # Filter by confidence
    high_confidence = [c for c in controversies if c.confidence > CONFIDENCE_THRESHOLD]
    
    # Filter by severity
    significant = [c for c in high_confidence if c.severity.level in ['high', 'critical']]
    
    # Filter by source reliability
    reliable_sources = filter_by_source_reliability(significant)
    
    # Deduplicate
    deduplicated = deduplicate_controversies(reliable_sources)
    
    # Validate against historical patterns
    validated = validate_against_patterns(deduplicated)
    
    return {
        'signals': validated,
        'noise': [c for c in controversies if c not in validated],
        'signal_to_noise_ratio': len(validated) / len(controversies) if controversies else 0
    }
```

### Noise Indicators

**Noise Characteristics**
- Low confidence
- Unreliable sources
- Duplicate events
- False positives
- Irrelevant content

---

## Lesson 2.4: Event Timelines and Escalation Logic

### Timeline Tracking

**Timeline Framework**
```python
class ControversyTimeline:
    """
    Track ESG controversy timeline and escalation
    """
    def __init__(self):
        self.timeline_store = TimelineStore()
        self.escalation_engine = EscalationEngine()
    
    def track_controversy(self, controversy):
        """
        Track controversy timeline
        """
        timeline = {
            'controversy_id': controversy.id,
            'events': [
                {
                    'timestamp': event.timestamp,
                    'event_type': event.type,
                    'source': event.source,
                    'severity': event.severity
                }
                for event in controversy.events
            ],
            'escalation_points': self.identify_escalation_points(controversy),
            'current_status': self.assess_current_status(controversy)
        }
        
        self.timeline_store.store(timeline)
        return timeline
    
    def identify_escalation_points(self, controversy):
        """
        Identify escalation points in controversy timeline
        """
        escalation_points = []
        
        for event in controversy.events:
            if event.severity.level == 'critical' or \
               event.type == 'regulatory_action' or \
               event.media_attention > MEDIA_THRESHOLD:
                escalation_points.append(event)
        
        return escalation_points
```

### Escalation Logic

**Escalation Triggers**
- Severity threshold
- Regulatory action
- Media attention
- NGO involvement
- Portfolio impact

---

## Exercise 2: Design an Alert Framework for Emerging ESG Controversies

### Objective
Create a comprehensive alert framework that detects and escalates emerging ESG controversies in real-time.

### Requirements

1. **Alert Framework Design**
   - Detection criteria
   - Severity classification
   - Escalation logic
   - Notification system

2. **Implementation**
   - Data sources
   - Processing pipeline
   - Alert generation
   - Distribution system

3. **Deliverables**
   - Framework specification
   - Implementation code
   - Alert examples
   - Documentation

### Evaluation Criteria
- Framework completeness (35%)
- Detection accuracy (30%)
- Escalation logic (25%)
- Documentation (10%)

---

## Key Takeaways

- **Mining News,**: Mining news, social media, and NGO reports provides early ESG risk signals
- **Nlp Enables**: NLP enables automated controversy detection and severity scoring
- **Separating Signal**: Separating signal from noise improves alert quality and reduces false positives
- **Event Timelines**: Event timelines and escalation logic ensure timely response to ESG risks

---

**End of Module 2**
