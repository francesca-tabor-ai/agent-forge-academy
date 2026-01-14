---
title: "Module 6: ML CI/CD & Model Lifecycle Management"
description: "Automating ML delivery from development to production"
module: "Module 6"
week: 6
order: 6
email_takeaway: "ML CI/CD automates the entire model lifecycle—from training to deployment to rollback—ensuring safe, repeatable releases."
email_action: "Design an end-to-end ML CI/CD pipeline with versioning, validation gates, and deployment strategies."
---

# Module 6: ML CI/CD & Model Lifecycle Management

**Theme:** *Automating ML delivery*

**Duration:** Week 6  
**Learning Objectives:**
- Version data, features, models, and code
- Build automated training pipelines
- Implement model validation and promotion gates
- Design deployment strategies (shadow, canary, blue-green)

---

## 6.1 Versioning Data, Features, Models, and Code

### Why Version Everything?

**Problem:** ML systems have many moving parts that change independently.

**Solution:** Version all components to enable reproducibility and rollback.

### What to Version

**1. Data**
- Training datasets
- Validation datasets
- Test datasets
- Data schemas

**2. Features**
- Feature definitions
- Feature pipelines
- Feature store schemas

**3. Models**
- Model artifacts
- Model weights
- Model metadata
- Model configurations

**4. Code**
- Training code
- Serving code
- Feature pipelines
- Infrastructure code

### Versioning Strategies

**1. Git for Code**
```bash
# Version training code
git tag -a v1.2.3 -m "Model v1.2.3 training code"
```

**2. MLflow for Models**
```python
import mlflow

mlflow.log_model(
    model=model,
    artifact_path="model",
    registered_model_name="fraud_detection"
)
mlflow.set_tag("version", "1.2.3")
```

**3. DVC for Data**
```bash
# Version datasets
dvc add data/training.csv
dvc push
```

**4. Feature Store Versioning**
```python
# Version feature definitions
feature_store.create_feature_version(
    feature_name="user_total_orders",
    version="v2",
    definition=feature_definition
)
```

### Versioning Best Practices

**1. Semantic Versioning**
- Major.Minor.Patch
- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes

**2. Link Versions**
- Link model version to code version
- Link model version to data version
- Link model version to feature versions

**3. Metadata Tracking**
- Training parameters
- Performance metrics
- Data statistics
- Environment info

---

## 6.2 Automated Training Pipelines

### Why Automate?

**Benefits:**
- Consistency
- Reproducibility
- Speed
- Reduced errors

### Pipeline Components

**1. Data Preparation**
```python
def prepare_data():
    raw_data = load_raw_data()
    cleaned_data = clean_data(raw_data)
    features = extract_features(cleaned_data)
    train_test_split = split_data(features)
    return train_test_split
```

**2. Model Training**
```python
def train_model(train_data, hyperparameters):
    model = create_model(hyperparameters)
    model.fit(train_data)
    return model
```

**3. Model Evaluation**
```python
def evaluate_model(model, test_data):
    predictions = model.predict(test_data)
    metrics = compute_metrics(test_data.labels, predictions)
    return metrics
```

**4. Model Registration**
```python
def register_model(model, metrics, version):
    if metrics.meets_threshold():
        mlflow.register_model(
            model=model,
            name="fraud_detection",
            version=version
        )
```

### Orchestration Tools

**1. Airflow**
```python
from airflow import DAG
from airflow.operators.python import PythonOperator

dag = DAG('ml_training_pipeline')

prepare_task = PythonOperator(
    task_id='prepare_data',
    python_callable=prepare_data,
    dag=dag
)

train_task = PythonOperator(
    task_id='train_model',
    python_callable=train_model,
    dag=dag
)

prepare_task >> train_task
```

**2. Prefect**
```python
from prefect import flow, task

@task
def prepare_data():
    return prepare_data()

@task
def train_model(data):
    return train_model(data)

@flow
def ml_pipeline():
    data = prepare_data()
    model = train_model(data)
    return model
```

**3. Kubeflow Pipelines**
```python
@dsl.pipeline(
    name='ML Training Pipeline',
    description='Automated ML training'
)
def ml_pipeline():
    prepare_op = prepare_data_op()
    train_op = train_model_op(prepare_op.output)
    evaluate_op = evaluate_model_op(train_op.output)
```

### Triggering Pipelines

**1. Scheduled**
```python
# Daily training
@schedule(daily="02:00")
def daily_training():
    run_training_pipeline()
```

**2. Event-Driven**
```python
# Trigger on new data
def on_new_data(event):
    if event.data_size > threshold:
        run_training_pipeline()
```

**3. Manual**
```python
# On-demand training
def trigger_training():
    run_training_pipeline()
```

---

## 6.3 Model Validation & Promotion Gates

### Validation Gates

**Purpose:** Ensure models meet quality standards before promotion.

**Gates:**

1. **Performance Gates**
   - Minimum accuracy
   - Minimum precision/recall
   - Performance vs baseline

2. **Data Quality Gates**
   - Feature distributions
   - Missing value rates
   - Data freshness

3. **Fairness Gates**
   - Bias metrics
   - Fairness across groups
   - Ethical considerations

4. **System Gates**
   - Model size
   - Inference latency
   - Resource requirements

### Implementation

**Example:**
```python
class ValidationGate:
    def validate(self, model, test_data, baseline):
        results = {}
        
        # Performance gate
        metrics = evaluate_model(model, test_data)
        results['performance'] = (
            metrics.accuracy >= baseline.accuracy * 0.95
        )
        
        # Latency gate
        latency = measure_latency(model)
        results['latency'] = latency < 100  # ms
        
        # Fairness gate
        fairness_metrics = compute_fairness(model, test_data)
        results['fairness'] = fairness_metrics.meets_threshold()
        
        return all(results.values()), results
```

### Promotion Workflow

**Stages:**

1. **Development**
   - Local testing
   - Unit tests
   - Integration tests

2. **Staging**
   - Staging environment
   - Validation gates
   - Performance testing

3. **Production**
   - Production deployment
   - Monitoring
   - Rollback capability

**Example:**
```python
def promote_model(model_version, stage):
    if stage == "staging":
        # Run validation gates
        passed, results = validation_gate.validate(model_version)
        if not passed:
            raise ValidationError("Gates failed", results)
        
        # Deploy to staging
        deploy_to_staging(model_version)
    
    elif stage == "production":
        # Additional production checks
        production_checks(model_version)
        
        # Deploy to production
        deploy_to_production(model_version)
```

---

## 6.4 Shadow, Canary, and Blue-Green Deployments

### Shadow Deployment

**Definition:** Deploy new model alongside existing model, but don't route traffic to it.

**Purpose:**
- Test new model in production
- Compare performance
- No risk to users

**Architecture:**
```
Request → Production Model → Response
         → Shadow Model → (Log only, no response)
```

**Example:**
```python
def predict_with_shadow(request):
    # Production model
    production_prediction = production_model.predict(request)
    
    # Shadow model (async, no blocking)
    shadow_prediction = shadow_model.predict_async(request)
    
    # Log both for comparison
    log_predictions({
        "production": production_prediction,
        "shadow": shadow_prediction
    })
    
    return production_prediction
```

### Canary Deployment

**Definition:** Gradually route traffic to new model, starting with small percentage.

**Purpose:**
- Test new model with real traffic
- Monitor performance
- Rollback if issues

**Architecture:**
```
Request → Router → [90% → Production Model]
                  → [10% → Canary Model]
```

**Example:**
```python
def predict_with_canary(request):
    # Route based on percentage
    if random.random() < canary_percentage:
        prediction = canary_model.predict(request)
        version = "canary"
    else:
        prediction = production_model.predict(request)
        version = "production"
    
    # Monitor both
    monitor_prediction(prediction, version)
    
    return prediction
```

### Blue-Green Deployment

**Definition:** Deploy new model to separate environment, switch traffic all at once.

**Purpose:**
- Zero-downtime deployment
- Instant rollback
- Full traffic switch

**Architecture:**
```
Request → Load Balancer → [Blue Environment (old)]
                        → [Green Environment (new)]
```

**Example:**
```python
def deploy_blue_green(new_model):
    # Deploy to green environment
    green_environment.deploy(new_model)
    
    # Health check
    if green_environment.health_check():
        # Switch traffic
        load_balancer.switch_to_green()
        
        # Keep blue for rollback
        wait_for_stability()
        
        # Decommission blue
        blue_environment.decommission()
```

### Choosing Deployment Strategy

| Strategy | Use When | Pros | Cons |
|----------|----------|------|------|
| Shadow | Testing new model | No risk | No real impact |
| Canary | Gradual rollout | Safe, monitored | Complex routing |
| Blue-Green | Confident in model | Fast, simple | All-or-nothing |

---

## 6.5 Rollbacks and Safe Releases

### Rollback Strategies

**1. Automatic Rollback**
```python
def deploy_with_auto_rollback(new_model):
    deploy(new_model)
    
    # Monitor for issues
    if detect_issues():
        rollback()
        alert("Auto-rollback triggered")
```

**2. Manual Rollback**
```python
def rollback_to_version(version):
    previous_model = model_registry.get_version(version)
    deploy(previous_model)
    update_routing(previous_model)
```

**3. Gradual Rollback**
```python
def gradual_rollback():
    # Reduce traffic to new model
    canary_percentage = 0.1
    
    # Monitor
    if issues_detected():
        canary_percentage = 0.0  # Full rollback
```

### Safe Release Checklist

**Pre-Deployment:**
- [ ] Model validated
- [ ] Performance gates passed
- [ ] Staging tests passed
- [ ] Rollback plan ready
- [ ] Monitoring in place

**During Deployment:**
- [ ] Deploy to staging first
- [ ] Monitor metrics
- [ ] Gradual rollout
- [ ] Watch for issues

**Post-Deployment:**
- [ ] Monitor for 24-48 hours
- [ ] Compare metrics to baseline
- [ ] Check for drift
- [ ] Document any issues

---

## Hands-On Exercise: Design ML CI/CD Pipeline

### Exercise: End-to-End ML CI/CD

**Scenario:** Fraud detection model

**Requirements:**
- Automated training on new data
- Validation gates before promotion
- Canary deployment
- Automatic rollback on issues

**Tasks:**

1. **Design Pipeline Stages**
   - Data preparation
   - Model training
   - Validation
   - Deployment

2. **Implement Versioning**
   - Version data, models, code
   - Link versions together
   - Track metadata

3. **Build Validation Gates**
   - Performance thresholds
   - Latency requirements
   - Fairness checks

4. **Design Deployment Strategy**
   - Canary deployment
   - Monitoring
   - Rollback procedures

**Deliverable:**
- CI/CD pipeline design
- Implementation code
- Deployment runbook

---

## Module Summary

### Key Takeaways

1. **Version everything** - Data, features, models, and code
2. **Automate training** - Consistency and reproducibility
3. **Validate before deploy** - Gates prevent bad models
4. **Deploy safely** - Shadow, canary, blue-green strategies

### Next Steps

- Complete the CI/CD pipeline exercise
- Review MLflow, Kubeflow, and other tools
- Move to Module 7 to learn about failure handling

---

## Exercises

1. **Versioning Design:** Design versioning strategy for:
   - Training data
   - Feature definitions
   - Model artifacts
   - Serving code

2. **Pipeline Design:** Design automated pipeline for:
   - Daily model retraining
   - Event-driven training
   - Manual training triggers

3. **Deployment Strategy:** Design deployment for:
   - High-risk model (fraud detection)
   - Low-risk model (recommendations)
   - Experimental model (A/B test)
