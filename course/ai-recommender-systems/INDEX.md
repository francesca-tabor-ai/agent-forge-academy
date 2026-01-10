# AI Recommender Systems Course - Navigation Index

Complete navigation guide for all course materials.

---

##  Course Files

### Overview & Getting Started
- **[README.md](README.md)** - Course home page, full description, prerequisites
- **[_COURSE_OVERVIEW.md](_COURSE_OVERVIEW.md)** - Quick start guide, learning paths
- **[INDEX.md](INDEX.md)** - This file (navigation index)

---

##  Module Navigation

### Module 1: Solving the Cold Start Challenge
**File:** [Module_01_Solving_the_Cold_Start_Challenge.md](Module_01_Solving_the_Cold_Start_Challenge.md)  
**Startup Tool:** ColdStart.ai  
**Duration:** Week 1

**Lessons:**
- **1.1** Defining the Cold Start Dilemma
- **1.2** Preference Elicitation & Active Learning
- **1.3** Cross-Domain Recommendation (CDR)

**Key Topics:** New users, new items, new systems, onboarding surveys, active learning, transfer learning

---

### Module 2: Collaborative Filtering & Matrix Factorization
**File:** [Module_02_Collaborative_Filtering_and_Matrix_Factorization.md](Module_02_Collaborative_Filtering_and_Matrix_Factorization.md)  
**Startup Tool:** NeuralMerch  
**Duration:** Week 2

**Lessons:**
- **2.1** The Mechanics of Interaction Matrices
- **2.2** Memory-Based Filtering
- **2.3** Matrix Factorization (MF) & Latent Factors

**Key Topics:** User-item matrices, explicit/implicit feedback, cosine similarity, SVD, SVD++, bias

---

### Module 3: Neural Collaborative Filtering (NCF)
**File:** [Module_03_Neural_Collaborative_Filtering.md](Module_03_Neural_Collaborative_Filtering.md)  
**Startup Tool:** NeuralMerch (Advanced Layer)  
**Duration:** Week 3

**Lessons:**
- **3.1** Moving Beyond Linear Models
- **3.2** Multi-Layer Perceptrons (MLP) in Recommendation
- **3.3** The NeuMF Framework

**Key Topics:** Non-linear relationships, MLPs, GMF, NeuMF fusion, deep learning for recommendations

---

### Module 4: Temporal Dynamics & Session-Based Models
**File:** [Module_04_Temporal_Dynamics_and_Session_Based_Models.md](Module_04_Temporal_Dynamics_and_Session_Based_Models.md)  
**Startup Tool:** SessionSense  
**Duration:** Week 4

**Lessons:**
- **4.1** Recurrent Neural Networks (RNNs)
- **4.2** Session-Based Recommendation (Anonymous Users)
- **4.3** Real-Time Intent Adaptation

**Key Topics:** LSTMs, GRUs, click sequences, anonymous users, real-time adaptation, temporal patterns

---

### Module 5: Hybrid Architectures & Multi-Modal Fusion
**File:** [Module_05_Hybrid_Architectures_and_Multi_Modal_Fusion.md](Module_05_Hybrid_Architectures_and_Multi_Modal_Fusion.md)  
**Startup Tool:** HybridFlow & MultiModal Vision  
**Duration:** Week 5

**Lessons:**
- **5.1** Hybridization Strategies
- **5.2** Multi-Modal Learning
- **5.3** Visual Bayesian Personalized Ranking (VBPR)

**Key Topics:** Weighted/switching/feature augmentation, CNNs, visual features, multi-modal fusion, synonyms problem

---

### Module 6: Explainable AI (XAI) & Generative Recommenders
**File:** [Module_06_Explainable_AI_and_Generative_Recommenders.md](Module_06_Explainable_AI_and_Generative_Recommenders.md)  
**Startup Tool:** ClearCast (The "Why" Engine)  
**Duration:** Week 6

**Lessons:**
- **6.1** The Black Box Dilemma
- **6.2** Attention Mechanisms
- **6.3** Generative Recs & Transformers

**Key Topics:** Explainability, transparency, attention models, transformers, sequence-to-sequence, LLM-style recommenders

---

### Module 7: Evaluation, Ethics, and Auditing
**File:** [Module_07_Evaluation_Ethics_and_Auditing.md](Module_07_Evaluation_Ethics_and_Auditing.md)  
**Startup Tool:** FairRank Audit  
**Duration:** Week 7

**Lessons:**
- **7.1** Performance Metrics
- **7.2** Bias & Filter Bubbles
- **7.3** Ethical Frameworks & Privacy

**Key Topics:** RMSE, NDCG, MAP, popularity bias, long tail, filter bubbles, privacy-preserving techniques, fairness auditing

---

##  Topic-Based Navigation

### Algorithms
- **Collaborative Filtering** → Module 2, Lesson 2.2
- **Matrix Factorization** → Module 2, Lesson 2.3
- **Neural CF** → Module 3 (all lessons)
- **RNNs/LSTMs** → Module 4, Lesson 4.1
- **Session-Based** → Module 4, Lesson 4.2
- **Hybrid Systems** → Module 5, Lesson 5.1
- **Multi-Modal** → Module 5, Lessons 5.2-5.3
- **Attention** → Module 6, Lesson 6.2
- **Transformers** → Module 6, Lesson 6.3

### Challenges
- **Cold Start** → Module 1 (all lessons)
- **Data Sparsity** → Module 2, Lesson 2.1
- **Non-Linearity** → Module 3, Lesson 3.1
- **Temporal Dynamics** → Module 4 (all lessons)
- **Explainability** → Module 6 (all lessons)
- **Bias & Fairness** → Module 7, Lessons 7.2-7.3

### Evaluation
- **Accuracy Metrics** → Module 7, Lesson 7.1
- **Ranking Metrics** → Module 7, Lesson 7.1
- **Bias Detection** → Module 7, Lesson 7.2
- **Fairness Auditing** → Module 7, Lesson 7.3

### Production Tools
- **ColdStart.ai** → Module 1
- **NeuralMerch** → Modules 2-3
- **SessionSense** → Module 4
- **HybridFlow** → Module 5
- **MultiModal Vision** → Module 5
- **ClearCast** → Module 6
- **FairRank Audit** → Module 7

---

##  Learning Paths

### Path 1: Complete Course (Recommended)
1. Module 1 → Module 2 → Module 3 → Module 4 → Module 5 → Module 6 → Module 7
2. Complete all labs in order
3. Build final project

### Path 2: Classical Approaches First
1. Module 1 (Cold Start)
2. Module 2 (Collaborative Filtering)
3. Module 7 (Evaluation)
4. Then: Modules 3-6 (Advanced topics)

### Path 3: Deep Learning Focus
1. Module 3 (Neural CF)
2. Module 4 (RNNs & Sessions)
3. Module 6 (Transformers)
4. Module 5 (Multi-Modal)
5. Then: Modules 1, 2, 7 (Foundations & Evaluation)

### Path 4: Production-Ready
1. Module 1 (Cold Start - critical for production)
2. Module 2 (Classical approaches)
3. Module 4 (Real-time systems)
4. Module 7 (Evaluation & Ethics)
5. Then: Modules 3, 5, 6 (Advanced features)

---

##  Quick Reference

### By Use Case

**E-commerce Platform:**
- Module 1 (new users), Module 2 (collaborative filtering), Module 5 (hybrid), Module 7 (evaluation)

**Content Platform (Netflix-style):**
- Module 2 (matrix factorization), Module 3 (neural CF), Module 4 (temporal), Module 6 (explainability)

**News/Article Recommendations:**
- Module 1 (cold start), Module 4 (session-based), Module 5 (multi-modal), Module 7 (bias detection)

**Music/Playlist Recommendations:**
- Module 2 (collaborative filtering), Module 4 (temporal dynamics), Module 5 (multi-modal audio)

**Social Media Feed:**
- Module 3 (neural CF), Module 4 (real-time), Module 6 (explainability), Module 7 (filter bubbles)

---

##  Lab Navigation

- **Lab 1** (Module 1): Cold Start Analysis
- **Lab 2** (Module 2): Matrix Factorization Implementation
- **Lab 3** (Module 3): NeuMF Implementation
- **Lab 4** (Module 4): Session-Based Recommender
- **Lab 5** (Module 5): VBPR with Visual Features
- **Lab 6** (Module 6): Attention-Based Explanations
- **Lab 7** (Module 7): Fairness Audit Report

---

##  External Resources

### Research Papers
- Linked within each module
- Focus on seminal works and recent advances

### Datasets
- MovieLens (ratings)
- Amazon Product Reviews
- Retail transaction data
- Session clickstream data

### Tools & Libraries
- Surprise (recommendation algorithms)
- Implicit (fast collaborative filtering)
- LightFM (hybrid algorithms)
- RecBole (comprehensive framework)
- Cornac (comparative framework)

---

##  Tips for Navigation

1. **Start with README.md** - Get the full picture
2. **Use INDEX.md** - Find topics quickly (this file)
3. **Follow module order** - Concepts build on each other
4. **Jump to specific topics** - Use topic-based navigation above
5. **Complete labs** - Hands-on practice is essential
6. **Review Module 7** - Evaluation and ethics are critical

---

##  Next Steps

**New to the course?**
→ Start with [README.md](README.md)

**Ready to learn?**
→ Begin [Module 1](Module_01_Solving_the_Cold_Start_Challenge.md)

**Looking for something specific?**
→ Use the topic-based navigation above

**Need an overview?**
→ Read [_COURSE_OVERVIEW.md](_COURSE_OVERVIEW.md)

---

*Happy learning! *