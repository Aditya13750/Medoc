# Token Allocation Algorithm - Detailed Specification

## Table of Contents
1. [Algorithm Overview](#algorithm-overview)
2. [Prioritization Logic](#prioritization-logic)
3. [Reallocation Algorithm](#reallocation-algorithm)
4. [Queue Management](#queue-management)
5. [Edge Cases](#edge-cases)
6. [Pseudocode](#pseudocode)

---

## Algorithm Overview

The Token Allocation Algorithm is a **priority-based, dynamic reallocation system** that handles:
- Multi-source token allocation
- Real-time capacity management
- Automatic queue reorganization
- Emergency insertions with capacity override

### Design Principles
1. **Fairness**: Equal treatment within priority levels
2. **Efficiency**: Maximize doctor utilization
3. **Reliability**: No data loss during reallocation
4. **Flexibility**: Support dynamic adjustments
5. **Transparency**: Track all allocation decisions

---

## Prioritization Logic

### Priority Level Definitions

```
Priority Level | Source            | Characteristics           | Queue Position
───────────────┼──────────────────┼──────────────────────────┼─────────────
1 (CRITICAL)   | Emergency        | Medical emergency        | Front
               |                  | Bypass all limits        |
               |                  | Instant allocation       |
───────────────┼──────────────────┼──────────────────────────┼─────────────
2 (HIGH)       | Follow-up        | Previous patient         | High
               |                  | Medical continuity       |
               |                  | Guaranteed allocation    |
───────────────┼──────────────────┼──────────────────────────┼─────────────
3 (MED-HIGH)   | Paid Priority    | Premium service          | Medium-High
               |                  | Direct booking           |
               |                  | No reallocation          |
───────────────┼──────────────────┼──────────────────────────┼─────────────
4 (MEDIUM)     | Walk-in          | Physical presence        | Medium
               |                  | Subject to capacity      |
               |                  | Can be reallocated       |
───────────────┼──────────────────┼──────────────────────────┼─────────────
5 (LOW)        | Online Booking   | Advance booking          | Low
               |                  | Flexible scheduling      |
               |                  | High reallocation risk   |
```

### Priority Score Calculation

```
Priority Score = Base Priority Level
                 + Time-based Adjustment
                 + Medical Factors

Where:
- Base Priority Level: 1-5 as defined above
- Time-based Adjustment: Waiting time penalty (optional)
- Medical Factors: Chronic condition, mobility issues (optional)
```

---

## Reallocation Algorithm

### Reallocation Trigger Conditions

Reallocation is triggered when:

```
1. New booking arrives for full slot
   AND
2. New booking has higher priority than any existing token
   AND
3. Alternative slots available for reallocated token
```

### Reallocation Process (Step-by-Step)

#### Phase 1: Validation
```
Input: New Booking Request
├─ Verify doctor exists ✓
├─ Verify time slot exists ✓
├─ Verify patient data valid ✓
├─ Check slot capacity status
│  └─ if capacity < max:
│     → Proceed to allocation (no reallocation needed)
│  └─ if capacity = max:
│     → Continue to Phase 2
└─ Return error if validation fails ✗
```

#### Phase 2: Identify Reallocation Candidates
```
Current Slot: {doctorId, startTime, endTime}
New Booking Priority: P_new

For each Token in Current Slot:
  Token Priority: P_token
  
  if (P_token > P_new):
    └─ Add to Reallocation Candidates List
    └─ Calculate "Reallocation Score"
       = P_token          [higher priority = lower score]
         + AllocationAge  [older = lower score]
         + Flexibility    [source flexibility]
```

#### Phase 3: Find Optimal Reallocation Target
```
Best Candidate = Token with highest Reallocation Score

For each Alternative Slot:
  Alternative: {doctorId, startTime2, endTime2}
  
  Conditions:
  ├─ startTime2 > current startTime  [prefer later slots]
  ├─ Capacity < max                  [slot has space]
  ├─ No conflicts with other tokens
  └─ Patient availability (optional)
  
  if all conditions satisfied:
    └─ Best Alternative Slot = earliest available slot
    └─ Move Best Candidate Token to Alternative Slot
    └─ Free up space in current slot
    └─ Allocate New Booking to current slot
    └─ Return SUCCESS
    
  if no suitable alternative:
    └─ Return REALLOCATION_FAILED
    └─ Check if cascading reallocation possible
```

#### Phase 4: Update Data Structures
```
if reallocation successful:
  1. Remove token from current slot queue
  2. Update token metadata:
     - slotStartTime ← startTime2
     - slotEndTime ← endTime2
     - reallocatedAt ← current timestamp
     - reallocateReason ← "higher priority booking"
  3. Add token to alternative slot queue
  4. Re-sort all affected queues by priority
  5. Commit changes to database
  6. Log reallocation event for audit trail
  7. Trigger notification to affected patient
```

### Reallocation Algorithm Pseudocode

```pseudocode
FUNCTION attemptReallocation(doctorId, slotTime, newSource):
  
  // Step 1: Get candidates
  currentSlot ← getTimeSlot(doctorId, slotTime)
  newPriority ← getPriority(newSource)
  candidates ← []
  
  FOR EACH token IN currentSlot.tokens:
    IF token.priority > newPriority AND token.status = "allocated":
      candidates.append(token)
  END FOR
  
  IF candidates.isEmpty():
    RETURN {success: false}
  END IF
  
  // Step 2: Select best candidate for reallocation
  bestCandidate ← selectBestCandidate(candidates)
  
  // Step 3: Find alternative slot
  alternativeSlots ← findAlternativeSlots(doctorId, slotTime)
  alternativeSlots.sortBy(startTime)
  
  FOR EACH slot IN alternativeSlots:
    IF slot.capacity > slot.currentTokens.count():
      
      // Move token
      removeToken(currentSlot, bestCandidate)
      addToken(slot, bestCandidate)
      updateToken(bestCandidate, {
        slotStartTime: slot.startTime,
        slotEndTime: slot.endTime,
        reallocatedAt: NOW(),
        status: "reallocated"
      })
      
      // Re-sort queues
      sortQueueByPriority(doctorId)
      
      RETURN {success: true, reallocatedToken: bestCandidate}
    END IF
  END FOR
  
  RETURN {success: false}

END FUNCTION
```

---

## Queue Management

### Queue Data Structure

```javascript
Queue = [
  {
    position: 1,
    tokenId: "TK-1050",
    priority: 1,     // Emergency
    allocatedAt: timestamp,
    status: "allocated"
  },
  {
    position: 2,
    tokenId: "TK-1002",
    priority: 2,     // Follow-up
    allocatedAt: timestamp,
    status: "allocated"
  },
  {
    position: 3,
    tokenId: "TK-1001",
    priority: 5,     // Online Booking
    allocatedAt: timestamp,
    status: "allocated"
  }
  // ... more tokens
]
```

### Queue Sorting Algorithm

```pseudocode
FUNCTION sortQueueByPriority(doctorId):
  
  queue ← getQueue(doctorId)
  
  // Sort by multiple criteria
  queue.sort((tokenA, tokenB) => {
    
    // Primary: Priority level
    IF tokenA.priority ≠ tokenB.priority:
      RETURN tokenA.priority - tokenB.priority
    END IF
    
    // Secondary: Allocation time (FIFO within same priority)
    IF tokenA.allocatedAt ≠ tokenB.allocatedAt:
      RETURN tokenA.allocatedAt - tokenB.allocatedAt
    END IF
    
    // Tertiary: Token ID (fallback)
    RETURN tokenA.id.compare(tokenB.id)
  })
  
  // Update positions
  FOR i = 0 TO queue.length - 1:
    queue[i].position ← i + 1
  END FOR
  
  commitToDatabase(queue)

END FUNCTION
```

### Queue Operations

#### Add Token to Queue
```pseudocode
FUNCTION addToQueue(doctorId, token):
  
  queue ← getQueue(doctorId)
  queue.append(token)
  sortQueueByPriority(doctorId)
  
  RETURN getQueuePosition(doctorId, token.id)

END FUNCTION
```

#### Remove Token from Queue
```pseudocode
FUNCTION removeFromQueue(doctorId, tokenId):
  
  queue ← getQueue(doctorId)
  token ← findToken(queue, tokenId)
  
  IF token exists:
    queue.remove(token)
    sortQueueByPriority(doctorId)
  END IF

END FUNCTION
```

#### Get Queue Position
```pseudocode
FUNCTION getQueuePosition(doctorId, tokenId):
  
  queue ← getQueue(doctorId)
  position ← 0
  
  FOR i = 0 TO queue.length - 1:
    IF queue[i].id = tokenId:
      position ← i + 1
      BREAK
    END IF
  END FOR
  
  RETURN position

END FUNCTION
```

---

## Edge Cases

### Edge Case 1: Simultaneous High-Priority Bookings
**Problem**: Multiple high-priority requests arrive simultaneously for same slot

**Solution**: 
- Lock slot during processing
- First request processed gets priority
- Second request triggers reallocation
- Third+ requests placed on waitlist

```
Timeline:
T1: PAT-001 (follow_up) arrives → Allocated to slot 9-10
T1+1ms: PAT-002 (emergency) arrives → Reallocates PAT-001 to 10-11
T1+2ms: PAT-003 (paid_priority) arrives → Allocated to freed space
```

### Edge Case 2: Cascading Reallocations
**Problem**: Reallocation target slot also full, needs further reallocation

**Solution**:
- Attempt cascading reallocation
- Max depth limit: 5 levels (prevent infinite loops)
- If max depth reached: abort cascade, return error

```
Slot 9-10 [FULL]: Token-A (priority 5)
Slot 10-11 [FULL]: Token-B (priority 4)
Slot 11-12 [FULL]: Token-C (priority 4)
Slot 12-1 [AVAILABLE]: (empty)

New High-Priority arrives for Slot 9-10:
├─ Reallocate Token-A from 9-10 to 10-11? NO (full)
├─ Reallocate Token-A to 11-12? NO (full)
├─ Reallocate Token-A to 12-1? YES ✓
├─ This frees 11-12
├─ Reallocate Token-C from 12-1? (already moved)
└─ Success: High-priority in 9-10
```

### Edge Case 3: No Available Alternative Slots
**Problem**: Candidate token needs reallocation but no suitable slot available

**Solution**:
1. Check if waitlist reallocation possible
2. Try next day's slots (if multi-day system)
3. Mark patient for manual intervention
4. Return error to booking requester

```
Allocation Failed:
{
  success: false,
  error: "Slot capacity full",
  alternativeSuggestions: [
    {doctorId: "DOC-001", slotTime: "next_day_900"},
    {doctorId: "DOC-002", slotTime: "same_day_1100"}
  ],
  reallocationAttempted: true,
  reallocationPossible: false
}
```

### Edge Case 4: Token Becomes No-Show During Reallocation
**Problem**: Patient marked no-show while reallocation in progress

**Solution**:
- Maintain transaction consistency
- If token already moved: undo move, return error
- Use optimistic locking on token records

```pseudocode
FUNCTION moveToken(sourceSlot, targetSlot, token):
  
  // Check current status before move
  currentToken ← getToken(token.id)
  IF currentToken.status ≠ "allocated":
    ROLLBACK changes
    RETURN {success: false, error: "Token status changed"}
  END IF
  
  // Perform move with lock
  LOCK token
  removeFromSlot(sourceSlot, token.id)
  addToSlot(targetSlot, token.id)
  UNLOCK token
  
  RETURN {success: true}

END FUNCTION
```

### Edge Case 5: Doctor Becomes Unavailable During Processing
**Problem**: Doctor offline/unavailable while allocations in progress

**Solution**:
1. Detect doctor status change
2. Freeze all ongoing allocations for that doctor
3. Reallocate existing tokens to alternative doctors
4. Queue pending requests with highest priority for doctor return

---

## Pseudocode

### Main Booking Flow

```pseudocode
FUNCTION bookToken(patientId, doctorId, slotTime, source, isFollowUp):
  
  // Step 1: Validation
  IF NOT validateRequest(patientId, doctorId, slotTime, source):
    RETURN {success: false, error: "Invalid request"}
  END IF
  
  // Step 2: Get current slot status
  slot ← getTimeSlot(doctorId, slotTime)
  IF slot = NULL:
    RETURN {success: false, error: "Slot not found"}
  END IF
  
  utilization ← getSlotUtilization(doctorId, slotTime)
  
  // Step 3: Check capacity
  IF utilization.allocated >= slot.capacity:
    
    // Slot full - attempt reallocation
    result ← attemptReallocation(doctorId, slotTime, source)
    
    IF NOT result.success:
      RETURN {success: false, error: "Slot full", waitlist: true}
    END IF
    
  END IF
  
  // Step 4: Determine priority
  priority ← getPriority(source)
  IF isFollowUp:
    priority ← PRIORITY_FOLLOW_UP
  END IF
  
  // Step 5: Create token
  token ← {
    id: generateTokenId(),
    patientId: patientId,
    doctorId: doctorId,
    slotStartTime: slotTime.start,
    slotEndTime: slotTime.end,
    source: source,
    priority: priority,
    status: "allocated",
    allocatedAt: NOW(),
    isFollowUp: isFollowUp
  }
  
  // Step 6: Persist token
  saveToken(token)
  
  // Step 7: Add to queue
  addToQueue(doctorId, token)
  queuePosition ← getQueuePosition(doctorId, token.id)
  
  // Step 8: Return result
  RETURN {
    success: true,
    token: token,
    queuePosition: queuePosition
  }

END FUNCTION
```

### Cancel Token Flow

```pseudocode
FUNCTION cancelToken(tokenId, reason):
  
  // Step 1: Get token
  token ← getToken(tokenId)
  IF token = NULL:
    RETURN {success: false, error: "Token not found"}
  END IF
  
  IF token.status IN ["completed", "cancelled"]:
    RETURN {success: false, error: "Cannot cancel this token"}
  END IF
  
  // Step 2: Update token status
  token.status ← "cancelled"
  token.cancelledAt ← NOW()
  token.remarks ← reason
  updateToken(token)
  
  // Step 3: Remove from queue
  removeFromQueue(token.doctorId, tokenId)
  
  // Step 4: Attempt waitlist reallocation
  reallocations ← []
  waitlistedPatients ← getWaitlistedPatients()
  
  FOR EACH patient IN waitlistedPatients:
    IF patient.preferredDoctorId = token.doctorId:
      
      result ← bookToken(
        patient.id,
        token.doctorId,
        token.slotStartTime,
        patient.source,
        patient.isFollowUp
      )
      
      IF result.success:
        reallocations.append({
          patientId: patient.id,
          newTokenId: result.token.id
        })
        BREAK
      END IF
      
    END IF
  END FOR
  
  RETURN {
    success: true,
    token: token,
    reallocations: reallocations
  }

END FUNCTION
```

---

## Performance Characteristics

### Time Complexity

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Book Token | O(n) | n = number of tokens in slot |
| Cancel Token | O(n) | n = number of waitlisted patients |
| Get Queue Position | O(n) | n = queue size |
| Sort Queue | O(n log n) | Standard comparison sort |
| Find Alternative Slots | O(m) | m = total slots for doctor |
| Mark No-Show | O(n) | n = number of waitlisted patients |

### Space Complexity

```
Total Space = O(D * S * C)

Where:
D = Number of doctors (e.g., 100)
S = Number of slots per doctor (e.g., 8)
C = Capacity per slot (e.g., 20)

Example: 100 doctors × 8 slots × 20 capacity = 16,000 tokens
≈ 1-2 MB in-memory footprint
```

---

## Correctness Guarantees

### Invariants

1. **Capacity Invariant**
   - Active tokens in slot ≤ slot capacity (except emergency)
   - Maintained through capacity checks before allocation

2. **Priority Invariant**
   - Queue sorted by priority at all times
   - Checked after every queue modification

3. **Uniqueness Invariant**
   - Each token ID is unique
   - No duplicate allocations for same patient in same slot
   - Enforced through token ID generation and validation

4. **Consistency Invariant**
   - Token exists in queue if and only if status = "allocated"
   - Enforced through transaction semantics

---

## Optimization Opportunities

1. **Caching**: Cache queue positions, slot utilization
2. **Lazy Sorting**: Sort queue only when needed, not after every operation
3. **Indexing**: B-tree on (doctorId, slotTime) for O(log n) slot lookup
4. **Batch Operations**: Handle multiple cancellations together
5. **Parallel Reallocation**: Process multiple doctors simultaneously

