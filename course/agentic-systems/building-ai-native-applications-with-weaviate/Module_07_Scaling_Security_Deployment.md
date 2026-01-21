---
title: "Module 7: Scaling, Security & Deployment"
description: "Deploy Weaviate at scale, implement security, and monitor production systems"
module: "7"
order: 7
---

# Module 7: Scaling, Security & Deployment

**Duration:** Week 7  
**Learning Objectives:**
- **horizontal scaling and sharding Understanding**: Understand horizontal scaling and sharding
- **authentication and authorization Implementation**: Implement authentication and authorization
- **Choose Between**: Choose between Weaviate Cloud and self-hosted
- **monitoring and observability Implementation**: Set up monitoring and observability
- **Weaviate on Kubernetes or cloud VMs Implementation**: Deploy Weaviate on Kubernetes or cloud VMs

---

## Lesson 7.1: Horizontal Scaling and Sharding

### Scaling Strategies

**Vertical Scaling:**
- Increase resources on single node
- Limited by hardware
- Simpler but less flexible

**Horizontal Scaling:**
- Add more nodes
- Better for large datasets
- Requires clustering

### Weaviate Clustering

**Cluster Components:**
- **Nodes:** Individual Weaviate instances
- **Gossip Protocol:** Node communication
- **Consensus:** Data consistency
- **Sharding:** Data distribution

**Cluster Architecture:**
```
                    ┌─────────────┐
                    │   Client     │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐        ┌────▼────┐        ┌────▼────┐
   │ Node 1  │◄──────►│ Node 2  │◄──────►│ Node 3  │
   │         │        │         │        │         │
   │ Shard 1 │        │ Shard 2 │        │ Shard 3 │
   └─────────┘        └─────────┘        └─────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼───────┐
                    │   Storage    │
                    └──────────────┘
```

### Sharding Configuration

**What is Sharding?**
- Distributes data across nodes
- Improves query performance
- Enables parallel processing

**Sharding Strategy:**
```python
schema = {
    "class": "Article",
    "shardingConfig": {
        "desiredCount": 3,  # Number of shards
        "actualCount": 3,
        "desiredVirtualCount": 128,  # Virtual shards
        "actualVirtualCount": 128,
        "key": "_id",  # Sharding key
        "strategy": "hash"  # or "range"
    },
    "properties": [...]
}
```

**Sharding Considerations:**
- **More shards:** Better parallelism, more overhead
- **Fewer shards:** Less overhead, potential bottlenecks
- **Rule of thumb:** 1-2 shards per node

### Multi-Node Setup

**Docker Compose for Cluster:**
```yaml
version: '3.4'
services:
  weaviate-node1:
    image: semitechnologies/weaviate:latest
    ports:
      - "8080:8080"
    environment:
      - CLUSTER_HOSTNAME=node1
      - CLUSTER_GOSSIP_BIND_PORT=7100
      - CLUSTER_DATA_BIND_PORT=7101
      - CLUSTER_JOIN=node2,node3
      - PERSISTENCE_DATA_PATH=/var/lib/weaviate
    volumes:
      - weaviate-node1-data:/var/lib/weaviate

  weaviate-node2:
    image: semitechnologies/weaviate:latest
    ports:
      - "8081:8080"
    environment:
      - CLUSTER_HOSTNAME=node2
      - CLUSTER_GOSSIP_BIND_PORT=7100
      - CLUSTER_DATA_BIND_PORT=7101
      - CLUSTER_JOIN=node1,node3
      - PERSISTENCE_DATA_PATH=/var/lib/weaviate
    volumes:
      - weaviate-node2-data:/var/lib/weaviate

  weaviate-node3:
    image: semitechnologies/weaviate:latest
    ports:
      - "8082:8080"
    environment:
      - CLUSTER_HOSTNAME=node3
      - CLUSTER_GOSSIP_BIND_PORT=7100
      - CLUSTER_DATA_BIND_PORT=7101
      - CLUSTER_JOIN=node1,node2
      - PERSISTENCE_DATA_PATH=/var/lib/weaviate
    volumes:
      - weaviate-node3-data:/var/lib/weaviate

volumes:
  weaviate-node1-data:
  weaviate-node2-data:
  weaviate-node3-data:
```

**Connecting to Cluster:**
```python
# Connect to any node (requests are distributed)
client = weaviate.Client("http://localhost:8080")
# Or use load balancer
client = weaviate.Client("http://weaviate-lb:8080")
```

### Replication Configuration

**Replication Setup:**
```python
schema = {
    "class": "Article",
    "replicationConfig": {
        "factor": 3  # 3 copies of each object
    },
    "properties": [...]
}
```

**Replication Levels:**
- **ONE:** Read from any replica (fastest)
- **QUORUM:** Read from majority (balanced)
- **ALL:** Read from all replicas (most consistent)

**Choosing Replication Factor:**
- **Factor 1:** No redundancy (not recommended for production)
- **Factor 3:** Good balance (recommended)
- **Factor 5:** High availability (for critical systems)

---

## Lesson 7.2: Authentication and Authorization

### Authentication Methods

**1. API Key Authentication:**
```python
# Client-side
client = weaviate.Client(
    url="http://localhost:8080",
    auth_client_secret=weaviate.AuthApiKey(api_key="your-api-key")
)
```

**2. OIDC Authentication:**
```python
client = weaviate.Client(
    url="http://localhost:8080",
    auth_client_secret=weaviate.AuthBearerToken(
        access_token="your-access-token",
        expires_in=3600,
        refresh_token="your-refresh-token"
    )
)
```

**3. Anonymous Access (Development Only):**
```yaml
environment:
  - AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true
```

### Server-Side Configuration

**Enable Authentication:**
```yaml
environment:
  - AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=false
  - AUTHORIZATION_ADMINLIST_ENABLED=true
  - AUTHORIZATION_ADMINLIST_USERS=admin1,admin2
  - AUTHORIZATION_ADMINLIST_READONLY_USERS=readonly1
```

**API Key Configuration:**
```yaml
environment:
  - AUTHENTICATION_APIKEY_ENABLED=true
  - AUTHENTICATION_APIKEY_ALLOWED_KEYS=key1,key2,key3
  - AUTHENTICATION_APIKEY_USERS=user1,user2,user3
```

### Authorization (Multi-Tenancy)

**Tenant-Based Access:**
```python
# Create tenant
client.schema.create_class({
    "class": "Article",
    "multiTenancyConfig": {
        "enabled": True
    },
    "properties": [...]
})

# Create tenant
client.schema.add_class_tenant("Article", "tenant1")
client.schema.add_class_tenant("Article", "tenant2")

# Insert with tenant
client.data_object.create(
    {"title": "Article 1"},
    "Article",
    tenant="tenant1"
)

# Query with tenant
response = (
    client.query
    .get("Article", ["title"])
    .with_tenant("tenant1")
    .do()
)
```

**User-Based Authorization:**
```python
# Configure in environment
environment:
  - AUTHORIZATION_ADMINLIST_ENABLED=true
  - AUTHORIZATION_ADMINLIST_USERS=admin@example.com
  - AUTHORIZATION_ADMINLIST_READONLY_USERS=readonly@example.com
```

### Security Best Practices

**1. Use HTTPS:**
```yaml
environment:
  - TLS_ENABLED=true
  - TLS_CERT_FILE=/path/to/cert.pem
  - TLS_KEY_FILE=/path/to/key.pem
```

**2. Restrict Network Access:**
- Use firewall rules
- Limit to specific IPs
- Use private networks

**3. Rotate API Keys:**
- Regular key rotation
- Monitor key usage
- Revoke unused keys

**4. Audit Logging:**
```python
# Enable audit logs
environment:
  - AUDIT_LOGGING_ENABLED=true
  - AUDIT_LOGGING_DESTINATION=file:///var/log/weaviate/audit.log
```

---

## Lesson 7.3: Weaviate Cloud vs Self-Hosted

### Weaviate Cloud

**Advantages:**
- Managed service
- Automatic updates
- Built-in monitoring
- High availability
- Support included

**Disadvantages:**
- Cost (pay per use)
- Less control
- Vendor lock-in
- Limited customization

**When to Use:**
- Rapid prototyping
- Small to medium scale
- Limited DevOps resources
- Need managed service

### Self-Hosted

**Advantages:**
- Full control
- Cost-effective at scale
- Custom configurations
- Data sovereignty
- No vendor lock-in

**Disadvantages:**
- Requires DevOps expertise
- Maintenance overhead
- Need to handle scaling
- Monitoring setup required

**When to Use:**
- Large scale
- Custom requirements
- Data privacy concerns
- Existing infrastructure

### Hybrid Approach

**Best of Both:**
- Development: Self-hosted
- Production: Weaviate Cloud
- Staging: Self-hosted cluster

---

## Lesson 7.4: Monitoring and Observability

### Key Metrics

**1. Performance Metrics:**
- Query latency (p50, p95, p99)
- Throughput (queries/second)
- Index build time
- Ingestion rate

**2. Resource Metrics:**
- CPU usage
- Memory usage
- Disk I/O
- Network traffic

**3. Health Metrics:**
- Node status
- Cluster health
- Replication status
- Error rates

### Monitoring Setup

**Prometheus Integration:**
```yaml
# Enable metrics endpoint
environment:
  - METRICS_ENABLED=true
  - METRICS_PORT=2112
```

**Prometheus Configuration:**
```yaml
scrape_configs:
  - job_name: 'weaviate'
    static_configs:
      - targets: ['weaviate:2112']
```

**Grafana Dashboard:**
- Import Weaviate dashboard
- Customize metrics
- Set up alerts

### Logging

**Structured Logging:**
```yaml
environment:
  - LOG_LEVEL=INFO
  - LOG_FORMAT=json
  - LOG_OUTPUT=stdout
```

**Log Aggregation:**
- Use ELK stack (Elasticsearch, Logstash, Kibana)
- Or Loki + Grafana
- Centralized logging

### Health Checks

**Built-in Health Endpoints:**
```python
# Check if ready
response = requests.get("http://localhost:8080/v1/.well-known/ready")
print(response.json())

# Check if live
response = requests.get("http://localhost:8080/v1/.well-known/live")
print(response.json())

# Get meta
response = requests.get("http://localhost:8080/v1/meta")
print(response.json())
```

**Custom Health Check:**
```python
def health_check():
    try:
        client = weaviate.Client("http://localhost:8080")
        if client.is_ready() and client.is_live():
            # Test query
            response = client.query.get("Article", ["title"]).with_limit(1).do()
            return {"status": "healthy", "timestamp": datetime.now()}
        else:
            return {"status": "unhealthy", "reason": "not ready"}
    except Exception as e:
        return {"status": "unhealthy", "reason": str(e)}
```

### Alerting

**Key Alerts:**
- High query latency (> 1s p95)
- High error rate (> 1%)
- Node down
- Disk space low (< 20%)
- Memory high (> 80%)

**Alert Configuration (Prometheus):**
```yaml
groups:
  - name: weaviate
    rules:
      - alert: HighQueryLatency
        expr: histogram_quantile(0.95, weaviate_query_duration_seconds) > 1
        for: 5m
        annotations:
          summary: "High query latency detected"
      
      - alert: NodeDown
        expr: up{job="weaviate"} == 0
        for: 1m
        annotations:
          summary: "Weaviate node is down"
```

---

## Lab 7: Deploy Weaviate on Kubernetes or Cloud VM

### Objectives
- Deploy Weaviate on Kubernetes
- Or deploy on cloud VM
- Configure monitoring
- Set up authentication
- Test scaling

### Option A: Kubernetes Deployment

**Step 1: Create Deployment YAML**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: weaviate
spec:
  replicas: 3
  selector:
    matchLabels:
      app: weaviate
  template:
    metadata:
      labels:
        app: weaviate
    spec:
      containers:
      - name: weaviate
        image: semitechnologies/weaviate:latest
        ports:
        - containerPort: 8080
        - containerPort: 50051
        env:
        - name: PERSISTENCE_DATA_PATH
          value: "/var/lib/weaviate"
        - name: DEFAULT_VECTORIZER_MODULE
          value: "none"
        - name: CLUSTER_HOSTNAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: CLUSTER_GOSSIP_BIND_PORT
          value: "7100"
        - name: CLUSTER_DATA_BIND_PORT
          value: "7101"
        volumeMounts:
        - name: weaviate-data
          mountPath: /var/lib/weaviate
      volumes:
      - name: weaviate-data
        persistentVolumeClaim:
          claimName: weaviate-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: weaviate
spec:
  selector:
    app: weaviate
  ports:
  - port: 8080
    targetPort: 8080
  type: LoadBalancer
```

**Step 2: Create Persistent Volume**
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: weaviate-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 100Gi
```

**Step 3: Deploy**
```bash
kubectl apply -f weaviate-deployment.yaml
kubectl get pods
kubectl get services
```

### Option B: Cloud VM Deployment

**Step 1: Create VM (AWS Example)**
```bash
# Using AWS CLI
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.large \
  --key-name my-key \
  --security-group-ids sg-12345678 \
  --user-data file://weaviate-setup.sh
```

**Step 2: Setup Script (weaviate-setup.sh)**
```bash
#!/bin/bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create docker-compose.yml
cat > /opt/weaviate/docker-compose.yml <<EOF
version: '3.4'
services:
  weaviate:
    image: semitechnologies/weaviate:latest
    ports:
      - "8080:8080"
    environment:
      - PERSISTENCE_DATA_PATH=/var/lib/weaviate
      - DEFAULT_VECTORIZER_MODULE=none
    volumes:
      - weaviate-data:/var/lib/weaviate
volumes:
  weaviate-data:
EOF

# Start Weaviate
cd /opt/weaviate
docker-compose up -d
```

**Step 3: Configure Firewall**
```bash
# Allow port 8080
sudo ufw allow 8080/tcp
```

### Step 4: Set Up Monitoring

**Install Prometheus:**
```yaml
# prometheus-config.yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'weaviate'
    static_configs:
      - targets: ['weaviate:2112']
```

**Deploy Prometheus:**
```bash
docker run -d \
  -p 9090:9090 \
  -v $(pwd)/prometheus-config.yaml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

### Step 5: Configure Authentication

**Update Configuration:**
```yaml
environment:
  - AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=false
  - AUTHENTICATION_APIKEY_ENABLED=true
  - AUTHENTICATION_APIKEY_ALLOWED_KEYS=your-secret-key
```

**Test Authentication:**
```python
import weaviate

client = weaviate.Client(
    url="http://your-weaviate-url:8080",
    auth_client_secret=weaviate.AuthApiKey(api_key="your-secret-key")
)

print(client.is_ready())
```

### Step 6: Test Scaling

**Load Test:**
```python
import concurrent.futures
import time

def query_weaviate(query_id):
    client = weaviate.Client("http://localhost:8080")
    start = time.time()
    response = (
        client.query
        .get("Article", ["title"])
        .with_limit(10)
        .do()
    )
    elapsed = time.time() - start
    return elapsed

# Run concurrent queries
with concurrent.futures.ThreadPoolExecutor(max_workers=100) as executor:
    futures = [executor.submit(query_weaviate, i) for i in range(1000)]
    results = [f.result() for f in concurrent.futures.as_completed(futures)]

print(f"Average latency: {sum(results)/len(results):.3f}s")
print(f"P95 latency: {sorted(results)[int(len(results)*0.95)]:.3f}s")
```

### Lab Deliverables

**Submit:**
1. Deployment configuration files
2. Monitoring setup documentation
3. Authentication configuration
4. Load test results
5. Scaling recommendations

---

## Summary

**Key Takeaways:**
- **Horizontal Scaling**: Horizontal scaling requires clustering
- **Sharding Distributes**: Sharding distributes data across nodes
- **Authentication Is**: Authentication is essential for production
- **Monitoring Enables**: Monitoring enables proactive management
- **Choose Deployment**: Choose deployment model based on needs

**What's Next:**
- **Module 8:**: Module 8: Capstone project
- **complete AI-native application Development**: Build complete AI-native application
- **Apply All**: Apply all learned concepts

---

## Additional Resources

- [Weaviate Kubernetes Guide](https://weaviate.io/developers/weaviate/installation/kubernetes)
- [Weaviate Cloud Documentation](https://weaviate.io/developers/weaviate/installation/weaviate-cloud)
- [Prometheus Monitoring](https://prometheus.io/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

**Ready for Module 8? Let's build your capstone project!**
