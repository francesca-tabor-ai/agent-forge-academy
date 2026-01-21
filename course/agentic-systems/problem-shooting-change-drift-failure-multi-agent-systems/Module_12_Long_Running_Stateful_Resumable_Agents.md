---
title: "Module 12: Long-Running, Stateful, and Resumable Agents"
description: "Systems that survive time"
module: "12"
order: 12
email_takeaway: "Use durable memory, checkpointing, and resumability. Handle state corruption and real-world change mid-task. Systems must survive time."
email_action: "What happens if your agent system crashes mid-task? Can it resume exactly where it left off?"
---

# Module 12: Long-Running, Stateful, and Resumable Agents

**Duration:** Week 12  
**Learning Objectives:**
- **systems that survive time Development**: Design systems that survive time
- **durable Analysis**: Distinguish durable vs ephemeral memory
- **Handle State**: Handle state corruption and recovery
- **checkpointing and resumability Implementation**: Implement checkpointing and resumability
- **Handle Real-World**: Handle real-world change mid-task

---

## 12.1 Systems That Survive Time

### Challenges of Long-Running Systems

**Challenge 1: State Persistence**
- Agent state must survive restarts
- Memory must be durable
- State must be recoverable

**Challenge 2: Mid-Task Changes**
- World changes while task executes
- Assumptions become invalid
- Context becomes stale

**Challenge 3: Resource Limits**
- Memory limits
- Time limits
- Cost limits

**Challenge 4: Failure Recovery**
- System crashes
- Network failures
- Resource exhaustion

### Design Principles

**Principle 1: Durability**
- State must be persistent
- Checkpoints must be reliable
- Recovery must be guaranteed

**Principle 2: Resumability**
- Tasks must be resumable
- State must be reconstructible
- Progress must be preserved

**Principle 3: Adaptability**
- Handle mid-task changes
- Update assumptions
- Refresh context

**Principle 4: Resilience**
- Survive failures
- Recover gracefully
- Continue from checkpoints

---

## 12.2 Durable vs Ephemeral Memory

### Ephemeral Memory

**Definition:** Memory that is lost on restart

**Characteristics:**
- Fast access
- No persistence overhead
- Lost on failure
- Suitable for temporary data

**Use Cases:**
- Current execution context
- Temporary calculations
- Cached results
- Session state

**Example:**
```python
class EphemeralMemory:
    def __init__(self):
        self.data = {}  # In-memory only
    
    def store(self, key, value):
        self.data[key] = value
    
    def get(self, key):
        return self.data.get(key)
    
    # Lost on restart
```

### Durable Memory

**Definition:** Memory that persists across restarts

**Characteristics:**
- Persistent storage
- Survives failures
- Slower access
- Higher cost

**Use Cases:**
- Task state
- Checkpoints
- Long-term context
- Important decisions

**Example:**
```python
class DurableMemory:
    def __init__(self, storage):
        self.storage = storage  # Persistent storage
    
    def store(self, key, value):
        # Write to persistent storage
        self.storage.write(key, value)
    
    def get(self, key):
        # Read from persistent storage
        return self.storage.read(key)
    
    # Survives restarts
```

### Hybrid Memory Architecture

**Design:**
```python
class HybridMemory:
    def __init__(self):
        self.ephemeral = EphemeralMemory()
        self.durable = DurableMemory()
    
    def store(self, key, value, durable=False):
        if durable:
            self.durable.store(key, value)
        else:
            self.ephemeral.store(key, value)
    
    def get(self, key):
        # Try ephemeral first
        value = self.ephemeral.get(key)
        if value:
            return value
        
        # Fall back to durable
        return self.durable.get(key)
```

---

## 12.3 State Corruption and Recovery

### Types of State Corruption

**Type 1: Partial Write**
```
State update starts → System crashes → State partially written → Corrupted
```

**Type 2: Concurrent Modification**
```
Agent A reads state → Agent B modifies state → Agent A writes old state → Lost update
```

**Type 3: Version Mismatch**
```
State version 1 → System updates to version 2 → Old state incompatible → Corrupted
```

**Type 4: Data Loss**
```
State stored → Storage failure → State lost → Cannot recover
```

### Corruption Prevention

**Strategy 1: Atomic Writes**
```python
class AtomicStateManager:
    def update_state(self, updates):
        # Write to temporary location
        temp_file = self.write_temp(updates)
        
        # Atomic move
        self.atomic_move(temp_file, self.state_file)
    
    def atomic_move(self, source, dest):
        # Use filesystem atomic operations
        os.rename(source, dest)  # Atomic on most filesystems
```

**Strategy 2: Transactions**
```python
class TransactionalStateManager:
    def begin_transaction(self):
        return Transaction()
    
    def commit_transaction(self, transaction):
        # Apply all updates atomically
        for update in transaction.updates:
            self.apply_update(update)
        
        # Mark as committed
        transaction.mark_committed()
```

**Strategy 3: Versioning**
```python
class VersionedStateManager:
    def update_state(self, updates, version):
        # Check version
        current_version = self.get_state_version()
        
        if version != current_version:
            raise VersionMismatchException()
        
        # Update with new version
        new_version = current_version + 1
        self.write_state(updates, new_version)
```

### Recovery Mechanisms

**Recovery Strategy 1: Checkpoint Rollback**
```python
class CheckpointRecovery:
    def recover(self, corrupted_state):
        # Find last valid checkpoint
        checkpoint = self.find_last_checkpoint()
        
        # Restore from checkpoint
        self.restore_from_checkpoint(checkpoint)
        
        # Replay operations since checkpoint
        self.replay_operations(checkpoint.timestamp)
```

**Recovery Strategy 2: State Repair**
```python
class StateRepair:
    def repair(self, corrupted_state):
        # Detect corruption
        corruption = self.detect_corruption(corrupted_state)
        
        # Repair based on corruption type
        if corruption.type == "partial_write":
            return self.repair_partial_write(corrupted_state)
        elif corruption.type == "version_mismatch":
            return self.repair_version_mismatch(corrupted_state)
        else:
            return self.repair_generic(corrupted_state)
```

**Recovery Strategy 3: State Reconstruction**
```python
class StateReconstruction:
    def reconstruct(self, state_id):
        # Reconstruct from logs
        logs = self.get_logs(state_id)
        
        # Replay operations
        state = initial_state()
        for log_entry in logs:
            state = self.apply_operation(state, log_entry)
        
        return state
```

---

## 12.4 Checkpointing and Resumability

### Checkpointing Strategy

**When to Checkpoint:**
```python
class CheckpointStrategy:
    def should_checkpoint(self, state, last_checkpoint):
        # Time-based
        if now() - last_checkpoint.timestamp > self.time_interval:
            return True
        
        # Progress-based
        if state.progress - last_checkpoint.progress > self.progress_threshold:
            return True
        
        # Change-based
        if len(state.changes_since_checkpoint) > self.change_threshold:
            return True
        
        return False
```

**Checkpoint Implementation:**
```python
class CheckpointManager:
    def create_checkpoint(self, state):
        checkpoint = {
            "timestamp": now(),
            "state": state.snapshot(),
            "progress": state.progress,
            "version": state.version
        }
        
        # Store checkpoint
        checkpoint_id = self.store_checkpoint(checkpoint)
        
        # Clean old checkpoints
        self.clean_old_checkpoints()
        
        return checkpoint_id
    
    def restore_checkpoint(self, checkpoint_id):
        checkpoint = self.load_checkpoint(checkpoint_id)
        
        # Restore state
        state = State.from_snapshot(checkpoint["state"])
        
        return state
```

### Resumability

**Resume Implementation:**
```python
class ResumableAgent:
    def __init__(self):
        self.checkpoint_manager = CheckpointManager()
        self.state = State()
    
    def execute_task(self, task):
        # Check for existing task state
        existing_state = self.checkpoint_manager.find_task_state(task.id)
        
        if existing_state:
            # Resume from checkpoint
            self.state = self.checkpoint_manager.restore_checkpoint(existing_state.checkpoint_id)
            start_step = existing_state.last_completed_step + 1
        else:
            # Start fresh
            start_step = 0
        
        # Execute from start step
        for step in task.steps[start_step:]:
            try:
                # Execute step
                result = step.execute(self.state)
                
                # Update state
                self.state.update(result)
                
                # Checkpoint periodically
                if self.checkpoint_manager.should_checkpoint(self.state):
                    self.checkpoint_manager.create_checkpoint(self.state)
                    
            except Exception as e:
                # Save state before failure
                self.checkpoint_manager.create_checkpoint(self.state)
                raise
        
        return self.state
```

---

## 12.5 Handling Real-World Change Mid-Task

### Types of Mid-Task Changes

**Type 1: Input Changes**
```
Task starts with input X → Input changes to Y mid-task → Must adapt
```

**Type 2: Context Changes**
```
Task assumes context A → Context changes to B → Assumptions invalid
```

**Type 3: Resource Changes**
```
Task needs resource R → Resource becomes unavailable → Must adapt
```

**Type 4: Goal Changes**
```
Task goal is G → Goal changes to G' → Must adjust
```

### Adaptation Strategies

**Strategy 1: Context Refresh**
```python
class ContextRefresh:
    def refresh_context(self, task):
        # Check if context is stale
        if self.is_context_stale(task.context):
            # Refresh context
            new_context = self.fetch_current_context()
            
            # Update task context
            task.update_context(new_context)
            
            # Revalidate assumptions
            task.revalidate_assumptions()
```

**Strategy 2: Goal Adaptation**
```python
class GoalAdaptation:
    def adapt_goal(self, task, new_goal):
        # Check if goal changed
        if task.goal != new_goal:
            # Update goal
            task.goal = new_goal
            
            # Adjust plan
            task.adjust_plan_for_new_goal()
            
            # Continue from current state
            task.continue_from_current_state()
```

**Strategy 3: Resource Substitution**
```python
class ResourceSubstitution:
    def substitute_resource(self, task, unavailable_resource):
        # Find alternative resource
        alternative = self.find_alternative(unavailable_resource)
        
        if alternative:
            # Substitute resource
            task.substitute_resource(unavailable_resource, alternative)
            
            # Continue task
            task.continue()
        else:
            # No alternative, must pause
            task.pause()
```

**Strategy 4: Incremental Validation**
```python
class IncrementalValidation:
    def validate_during_execution(self, task):
        # Validate assumptions periodically
        for assumption in task.assumptions:
            if not self.validate_assumption(assumption):
                # Assumption invalid, adapt
                task.adapt_to_invalid_assumption(assumption)
```

---

## 12.6 Key Takeaways

**Long-Running Systems:**
- Must survive time
- Handle mid-task changes
- Recover from failures
- Preserve progress

**Memory Types:**
- Ephemeral: Fast, lost on restart
- Durable: Persistent, survives restart
- Hybrid: Best of both

**State Corruption:**
- Prevent with atomic writes, transactions, versioning
- Recover with checkpoints, repair, reconstruction

**Checkpointing:**
- Time-based, progress-based, change-based
- Enable resumability
- Preserve state

**Resumability:**
- Resume from checkpoints
- Continue from last completed step
- Preserve progress

**Mid-Task Adaptation:**
- Refresh context
- Adapt goals
- Substitute resources
- Validate incrementally

---

## Practical Work: Resuming a Partially Completed Long-Running Task After Failure

**Objective:** Build resumable agent system that handles failures gracefully

**Requirements:**
1. Implement durable memory
2. Add checkpointing
3. Build resumability
4. Handle state corruption
5. Implement mid-task adaptation
6. Test failure and recovery scenarios

**Deliverables:**
- Durable memory implementation
- Checkpointing system
- Resumability mechanism
- State corruption handling
- Mid-task adaptation
- Test results

**Evaluation Criteria:**
- Durable memory (20%)
- Checkpointing (20%)
- Resumability (20%)
- State corruption handling (20%)
- Mid-task adaptation (20%)

**Time Estimate:** 5-6 hours

---

## Additional Resources

**Readings:**
- "Long-Running Distributed Systems"
- "Checkpointing and Recovery"
- "State Management Patterns"

**Tools to Explore:**
- Checkpointing frameworks
- State management systems
- Recovery platforms

**Course Complete!**

You've learned how to build production-ready, failure-tolerant multi-agent systems that handle change, drift, and failure gracefully.

---

**Module 12 Complete**   
**Course Complete!**
