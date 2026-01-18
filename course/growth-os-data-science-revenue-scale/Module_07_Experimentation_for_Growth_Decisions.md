---
title: "Module 7: Experimentation for Growth Decisions"
description: "Validating growth ideas before scaling"
module: "7"
order: 7
---

# Module 7: Experimentation for Growth Decisions

**Duration:** Week 7  
**Theme:** *Validating growth ideas before scaling*

**Learning Objectives:**
- **growth experimentation frameworks Understanding**: Understand growth experimentation frameworks
- **Define Success**: Define success metrics and guardrails
- **Interpret Noisy**: Interpret noisy growth experiments
- **Scale Wins**: Scale wins and kill false positives
- **Institutionalize Growth**: Apply institutionalize growth learning in relevant contexts
- **experiment roadmaps Development**: Build experiment roadmaps

---

## 7.1 Growth Experimentation Frameworks

### The Growth Experimentation Loop

**Framework:**
```
Ideate → Prioritize → Design → Execute → Analyze → Learn → Iterate
```

#### 1. Ideation

**Sources of Ideas:**
- Funnel analysis (drop-off points)
- User research (pain points)
- Competitive analysis (what works elsewhere)
- Data insights (correlations, patterns)
- Team brainstorming

**Documenting Ideas:**

```python
def document_experiment_idea(idea_data):
    """Document experiment idea"""
    experiment_idea = {
        'id': generate_id(),
        'title': idea_data['title'],
        'hypothesis': idea_data['hypothesis'],
        'expected_impact': idea_data['expected_impact'],
        'effort': idea_data['effort'],  # Low/Medium/High
        'risk': idea_data['risk'],  # Low/Medium/High
        'success_metric': idea_data['success_metric'],
        'guardrail_metrics': idea_data['guardrail_metrics'],
        'target_segment': idea_data['target_segment'],
        'submitted_by': idea_data['submitted_by'],
        'date': datetime.now()
    }
    
    return experiment_idea
```

#### 2. Prioritization

**ICE Framework:**
- **Impact:** Expected business impact
- **Confidence:** How sure are we it will work?
- **Ease:** How easy is it to implement?

```python
def prioritize_experiments_ice(experiment_ideas):
    """Prioritize experiments using ICE framework"""
    for idea in experiment_ideas:
        # Score each dimension (1-10)
        impact_score = score_impact(idea)
        confidence_score = score_confidence(idea)
        ease_score = score_ease(idea)
        
        # Calculate ICE score
        idea['ice_score'] = (impact_score + confidence_score + ease_score) / 3
        idea['impact_score'] = impact_score
        idea['confidence_score'] = confidence_score
        idea['ease_score'] = ease_score
    
    # Sort by ICE score
    prioritized = sorted(experiment_ideas, key=lambda x: x['ice_score'], reverse=True)
    
    return prioritized
```

**PIE Framework:**
- **Potential:** Maximum possible impact
- **Importance:** How critical is this area?
- **Ease:** How easy is it to implement?

**RICE Framework:**
- **Reach:** How many users affected?
- **Impact:** Impact per user (0.25, 0.5, 1, 2, 4)
- **Confidence:** How sure? (50%, 80%, 100%)
- **Effort:** Person-months

```python
def prioritize_experiments_rice(experiment_ideas):
    """Prioritize experiments using RICE framework"""
    for idea in experiment_ideas:
        reach = idea['reach']  # Number of users
        impact = idea['impact']  # 0.25, 0.5, 1, 2, 4
        confidence = idea['confidence'] / 100  # 0.5, 0.8, 1.0
        effort = idea['effort']  # Person-months
        
        # Calculate RICE score
        rice_score = (reach * impact * confidence) / effort
        idea['rice_score'] = rice_score
    
    # Sort by RICE score
    prioritized = sorted(experiment_ideas, key=lambda x: x['rice_score'], reverse=True)
    
    return prioritized
```

#### 3. Design

**Key Components:**
- Hypothesis
- Variants
- Success metrics
- Guardrail metrics
- Sample size
- Duration
- Randomization

```python
def design_experiment(experiment_idea):
    """Design experiment from idea"""
    experiment = {
        'id': experiment_idea['id'],
        'hypothesis': experiment_idea['hypothesis'],
        'variants': define_variants(experiment_idea),
        'success_metrics': experiment_idea['success_metric'],
        'guardrail_metrics': experiment_idea['guardrail_metrics'],
        'sample_size': calculate_sample_size(experiment_idea),
        'duration_days': calculate_duration(experiment_idea),
        'randomization': 'user_id',  # or 'session_id', etc.
        'target_segment': experiment_idea['target_segment']
    }
    
    return experiment
```

---

## 7.2 Defining Success Metrics and Guardrails

### Success Metrics

**Characteristics of Good Success Metrics:**
1. **Aligned with Business Goals:** Maps to revenue, growth, retention
2. **Sensitive:** Changes detectably with treatment
3. **Accurate:** Measures what you think it measures
4. **Actionable:** Changes lead to clear actions

**Common Growth Success Metrics:**

```python
def define_success_metrics(experiment_type):
    """Define success metrics by experiment type"""
    metrics_by_type = {
        'acquisition': {
            'primary': 'signup_rate',
            'secondary': ['cac', 'ltv', 'activation_rate']
        },
        'activation': {
            'primary': 'activation_rate',
            'secondary': ['time_to_activate', 'feature_adoption']
        },
        'retention': {
            'primary': 'retention_rate',
            'secondary': ['churn_rate', 'engagement_score']
        },
        'monetization': {
            'primary': 'conversion_rate',
            'secondary': ['arpu', 'ltv', 'margin']
        },
        'engagement': {
            'primary': 'daily_active_users',
            'secondary': ['session_frequency', 'feature_usage']
        }
    }
    
    return metrics_by_type.get(experiment_type, {
        'primary': 'conversion_rate',
        'secondary': ['revenue', 'engagement']
    })
```

### Guardrail Metrics

**Purpose:** Prevent experiments from causing harm while testing.

**Common Guardrails:**

```python
def define_guardrails(experiment_type):
    """Define guardrail metrics by experiment type"""
    guardrails = {
        'min_conversion_rate': 0.01,  # Don't drop below 1%
        'max_revenue_drop': 0.05,  # Don't drop revenue more than 5%
        'min_retention_rate': 0.5,  # Don't drop retention below 50%
        'max_support_tickets': 1.2,  # Don't increase support tickets more than 20%
        'min_nps': 40,  # Don't drop NPS below 40
        'max_bounce_rate': 0.6  # Don't increase bounce rate above 60%
    }
    
    # Customize by experiment type
    if experiment_type == 'pricing':
        guardrails['min_conversion_rate'] = 0.02
        guardrails['max_revenue_drop'] = 0.10
    
    return guardrails
```

**Monitoring Guardrails:**

```python
def check_guardrails(experiment_results, guardrails):
    """Check if experiment violates guardrails"""
    violations = []
    
    for metric, threshold in guardrails.items():
        if metric.startswith('min_'):
            actual_metric = metric.replace('min_', '')
            if experiment_results[actual_metric] < threshold:
                violations.append({
                    'metric': actual_metric,
                    'threshold': threshold,
                    'actual': experiment_results[actual_metric],
                    'violation_type': 'below_minimum'
                })
        
        elif metric.startswith('max_'):
            actual_metric = metric.replace('max_', '')
            if experiment_results[actual_metric] > threshold:
                violations.append({
                    'metric': actual_metric,
                    'threshold': threshold,
                    'actual': experiment_results[actual_metric],
                    'violation_type': 'above_maximum'
                })
    
    return {
        'has_violations': len(violations) > 0,
        'violations': violations,
        'should_stop': len(violations) > 0
    }
```

---

## 7.3 Interpreting Noisy Growth Experiments

### Understanding Statistical Significance

**Key Concepts:**
- **P-value:** Probability of observing this result if null hypothesis is true
- **Confidence Interval:** Range where true effect likely lies
- **Statistical Power:** Probability of detecting an effect if it exists

```python
def interpret_experiment_results(experiment_data):
    """Interpret experiment results with statistical rigor"""
    from scipy.stats import ttest_ind, chi2_contingency
    
    treatment = experiment_data[experiment_data['variant'] == 'treatment']
    control = experiment_data[experiment_data['variant'] == 'control']
    
    # Calculate metrics
    treatment_metric = treatment['success_metric'].mean()
    control_metric = control['success_metric'].mean()
    
    # Calculate lift
    lift = (treatment_metric / control_metric - 1) * 100
    
    # Statistical test
    t_stat, p_value = ttest_ind(
        treatment['success_metric'],
        control['success_metric']
    )
    
    # Calculate confidence interval
    from scipy.stats import t
    n_treatment = len(treatment)
    n_control = len(control)
    se = np.sqrt(
        treatment['success_metric'].var() / n_treatment +
        control['success_metric'].var() / n_control
    )
    ci_95 = t.interval(0.95, n_treatment + n_control - 2, loc=lift, scale=se)
    
    return {
        'treatment_mean': treatment_metric,
        'control_mean': control_metric,
        'lift': lift,
        'lift_pct': lift,
        'p_value': p_value,
        'statistically_significant': p_value < 0.05,
        'confidence_interval_95': ci_95,
        'interpretation': interpret_result(lift, p_value, ci_95)
    }

def interpret_result(lift, p_value, ci_95):
    """Provide interpretation of results"""
    if p_value < 0.05:
        if lift > 0:
            return f"Statistically significant positive lift of {lift:.2f}%"
        else:
            return f"Statistically significant negative impact of {abs(lift):.2f}%"
    else:
        if abs(lift) < 1:
            return "No meaningful difference detected"
        else:
            return f"Inconclusive: {lift:.2f}% lift but not statistically significant (p={p_value:.3f})"
```

### Handling Multiple Metrics

**Problem:** Testing multiple metrics increases false positive rate.

**Solution:** Adjust for multiple comparisons.

```python
from statsmodels.stats.multitest import multipletests

def interpret_multiple_metrics(experiment_results):
    """Interpret multiple metrics with correction for multiple comparisons"""
    metrics = experiment_results['metrics']
    p_values = [m['p_value'] for m in metrics]
    
    # Apply Bonferroni correction
    rejected, p_adjusted, _, _ = multipletests(
        p_values,
        alpha=0.05,
        method='bonferroni'
    )
    
    # Update results
    for i, metric in enumerate(metrics):
        metric['p_value_adjusted'] = p_adjusted[i]
        metric['statistically_significant_adjusted'] = rejected[i]
    
    return experiment_results
```

### Bayesian Interpretation

**Alternative to Frequentist:** Bayesian methods provide probability of effect.

```python
import pymc3 as pm

def bayesian_experiment_analysis(treatment_data, control_data):
    """Bayesian analysis of experiment"""
    with pm.Model() as model:
        # Priors
        mu_treatment = pm.Normal('mu_treatment', mu=0, sigma=1)
        mu_control = pm.Normal('mu_control', mu=0, sigma=1)
        
        # Likelihood
        treatment_obs = pm.Normal(
            'treatment',
            mu=mu_treatment,
            sigma=1,
            observed=treatment_data
        )
        control_obs = pm.Normal(
            'control',
            mu=mu_control,
            sigma=1,
            observed=control_data
        )
        
        # Effect
        effect = pm.Deterministic('effect', mu_treatment - mu_control)
        
        # Sample
        trace = pm.sample(2000, return_inferencedata=True)
    
    # Calculate probability of positive effect
    prob_positive = (trace.posterior['effect'] > 0).mean().values
    
    return {
        'prob_positive_effect': prob_positive,
        'expected_effect': trace.posterior['effect'].mean().values,
        'credible_interval': trace.posterior['effect'].quantile([0.025, 0.975]).values
    }
```

---

## 7.4 Scaling Wins and Killing False Positives

### Validating Wins

**Before Scaling:**
1. **Statistical Validation:** P-value < 0.05, confidence interval excludes zero
2. **Practical Significance:** Lift is meaningful (> minimum detectable effect)
3. **Consistency:** Results hold across segments
4. **Guardrails Pass:** No guardrail violations
5. **Replication:** Results replicate in follow-up experiment

```python
def validate_win(experiment_results, min_lift=0.05):
    """Validate that experiment is a true win"""
    validation = {
        'statistically_significant': experiment_results['p_value'] < 0.05,
        'practically_significant': abs(experiment_results['lift']) > min_lift,
        'guardrails_pass': not experiment_results.get('guardrail_violations', False),
        'consistent_across_segments': check_consistency(experiment_results),
        'ready_to_scale': False
    }
    
    validation['ready_to_scale'] = all([
        validation['statistically_significant'],
        validation['practically_significant'],
        validation['guardrails_pass'],
        validation['consistent_across_segments']
    ])
    
    return validation
```

### Scaling Strategy

```python
def scale_experiment_win(experiment_results, current_rollout=0.1):
    """Plan scaling of winning experiment"""
    # Gradual rollout
    rollout_plan = {
        'phase_1': {
            'percentage': 0.25,
            'duration_days': 7,
            'monitor_metrics': ['success_metric', 'guardrail_metrics']
        },
        'phase_2': {
            'percentage': 0.50,
            'duration_days': 7,
            'monitor_metrics': ['success_metric', 'guardrail_metrics']
        },
        'phase_3': {
            'percentage': 1.0,
            'duration_days': 14,
            'monitor_metrics': ['success_metric', 'guardrail_metrics', 'long_term_metrics']
        }
    }
    
    return rollout_plan
```

### Identifying False Positives

**Signs of False Positives:**
1. Small sample size
2. Multiple metrics tested (not corrected)
3. Early stopping (peeking)
4. Inconsistent across segments
5. Doesn't replicate

```python
def detect_false_positive(experiment_results):
    """Detect potential false positives"""
    warnings = []
    
    # Check sample size
    if experiment_results['sample_size'] < 1000:
        warnings.append('small_sample_size')
    
    # Check multiple metrics
    if experiment_results.get('multiple_metrics_tested', False):
        if not experiment_results.get('multiple_comparisons_corrected', False):
            warnings.append('multiple_comparisons_not_corrected')
    
    # Check early stopping
    if experiment_results.get('stopped_early', False):
        warnings.append('early_stopping')
    
    # Check consistency
    if not experiment_results.get('consistent_across_segments', True):
        warnings.append('inconsistent_across_segments')
    
    return {
        'potential_false_positive': len(warnings) > 0,
        'warnings': warnings,
        'recommendation': 'replicate' if len(warnings) > 0 else 'scale'
    }
```

---

## 7.5 Institutionalizing Growth Learning

### Experiment Documentation

```python
def document_experiment(experiment):
    """Document experiment for learning"""
    documentation = {
        'experiment_id': experiment['id'],
        'title': experiment['title'],
        'hypothesis': experiment['hypothesis'],
        'results': experiment['results'],
        'learnings': experiment['learnings'],
        'next_steps': experiment['next_steps'],
        'tags': experiment['tags'],
        'date_completed': datetime.now()
    }
    
    return documentation
```

### Building Experiment Library

```python
def build_experiment_library(experiments):
    """Build searchable library of experiments"""
    library = {
        'experiments': experiments,
        'search_by_tag': search_experiments_by_tag,
        'search_by_outcome': search_experiments_by_outcome,
        'search_by_metric': search_experiments_by_metric
    }
    
    return library
```

### Experiment Roadmap

```python
def build_experiment_roadmap(experiment_ideas, current_quarter):
    """Build experiment roadmap for quarter"""
    # Prioritize experiments
    prioritized = prioritize_experiments_rice(experiment_ideas)
    
    # Allocate resources
    available_resources = 4  # person-months
    roadmap = []
    allocated_resources = 0
    
    for experiment in prioritized:
        if allocated_resources + experiment['effort'] <= available_resources:
            roadmap.append({
                'experiment': experiment,
                'quarter': current_quarter,
                'start_date': calculate_start_date(roadmap),
                'end_date': calculate_end_date(experiment, calculate_start_date(roadmap))
            })
            allocated_resources += experiment['effort']
    
    return roadmap
```

---

## Lab 7: Experimentation for Growth Decisions

### Objective
Design an experiment roadmap for a growth team.

### Dataset
You'll be provided with:
- Historical experiment data
- Current funnel metrics
- User behavior data
- Experiment ideas backlog

### Tasks

1. **Prioritize Experiments**
   - Use ICE or RICE framework
   - Score experiment ideas
   - Create prioritized backlog

2. **Design Experiments**
   - Define hypotheses
   - Design variants
   - Define success metrics and guardrails
   - Calculate sample sizes

3. **Build Roadmap**
   - Allocate resources
   - Schedule experiments
   - Plan dependencies
   - Account for capacity

4. **Institutionalize Learning**
   - Design experiment documentation template
   - Build experiment library
   - Create learning processes

5. **Present Roadmap**
   - Present to stakeholders
   - Get buy-in
   - Plan execution

### Deliverables

1. **Experiment Roadmap**
   - Prioritized experiment backlog
   - Quarterly roadmap
   - Resource allocation
   - Success metrics and guardrails
   - Learning processes

2. **Code Repository**
   - Prioritization frameworks
   - Experiment design tools
   - Roadmap builder
   - Clean, documented code

### Evaluation Criteria

- **Prioritization (30%):** Sound framework, good scoring
- **Experiment Design (30%):** Proper methodology, metrics, guardrails
- **Roadmap Quality (20%):** Realistic, well-planned
- **Learning Processes (20%):** Actionable, sustainable

### Expected Output

A growth experimentation plan tied to revenue outcomes that:
- Prioritizes experiments effectively
- Designs experiments properly
- Plans resource allocation
- Institutionalizes learning
- Drives revenue growth

---

## Summary

**Key Takeaways:**

- **Framework Matters:**: Use ICE/RICE to prioritize systematically
- **Metrics & Guardrails:**: Define success and prevent harm
- **Statistical Rigor:**: Interpret results correctly, avoid false positives
- **Scale Carefully:**: Validate wins before scaling, kill false positives
- **Learn Systematically:**: Document and build experiment library

**Next Steps:**
- **Module 8:**: Module 8: Learn to communicate growth impact to leadership
- **Translate Analytics**: Translate analytics into financial impact
- **executive-ready narratives Development**: Build executive-ready narratives

---

## Additional Resources

### Reading
- "Experimentation Works" by Stefan Thomke
- "A/B Testing" by Ronny Kohavi
- "Trustworthy Online Controlled Experiments" by Kohavi et al.

### Tools
- Python: scipy, statsmodels, scikit-learn
- Experimentation Platforms: Optimizely, VWO, Google Optimize

---

**Ready for Module 8? [Continue →](Module_08_Communicating_Growth_Impact_to_Leadership.md)**
