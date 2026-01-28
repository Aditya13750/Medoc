# OPD Token Allocation Engine - Complete Documentation

## System Overview

The OPD (Out Patient Department) Token Allocation Engine is a sophisticated token management system designed for hospital operations. It handles elastic capacity management, dynamic reallocation, and prioritization of tokens from multiple sources.

### Key Features
- **Multi-source token booking** (Online, Walk-in, Paid Priority, Follow-up, Emergency)
- **Dynamic capacity management** with real-time reallocation
- **Priority-based queue management**
- **Emergency insertion with capacity override**
- **Automatic waitlist handling**
- **Comprehensive analytics and reporting**

---

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────┐
│              Express.js Server (Port 3000)           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐       │
│  │  Admin Routes    │  │  Token Routes    │       │
│  │  - Doctors       │  │  - Book          │       │
│  │  - Slots         │  │  - Cancel        │       │
│  │  - Analytics     │  │  - Call          │       │
│  │  - Queue Status  │  │  - Complete      │       │
│  └──────────────────┘  └──────────────────┘       │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐       │
│  │ Emergency Routes │  │Token Allocation  │       │
│  │  - Insert        │  │    Service       │       │
│  │  - Status        │  │ (Core Logic)     │       │
│  └──────────────────┘  └──────────────────┘       │
│                                                     │
│  ┌──────────────────────────────────────────┐     │
│  │    In-Memory Database                    │     │
│  │ - Doctors, Time Slots, Tokens, Patients │     │
│  │ - Queue Management                       │     │
│  └──────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

### Data Models

#### Doctor
```json
{
  "id": "DOC-001",
  "name": "Dr. Sharma",
  "specialization": "Cardiology",
  "contactNumber": "+91-9xxx-xxxx",
  "isActive": true,
  "createdAt": "2025-01-28T09:00:00Z"
}
```

#### Time Slot
```json
{
  "doctorId": "DOC-001",
  "startTime": 900,
  "endTime": 1000,
  "capacity": 20,
  "isActive": true,
  "createdAt": "2025-01-28T09:00:00Z"
}
```

#### Token
```json
{
  "id": "TK-1001",
  "patientId": "PAT-001",
  "doctorId": "DOC-001",
  "slotStartTime": 900,
  "slotEndTime": 1000,
  "source": "online_booking",
  "priority": 5,
  "status": "allocated",
  "isFollowUp": false,
  "isEmergency": false,
  "allocatedAt": "2025-01-28T08:45:00Z",
  "calledAt": null,
  "completedAt": null,
  "cancelledAt": null,
  "noShowAt": null,
  "remarks": ""
}
```

#### Patient
```json
{
  "id": "PAT-001",
  "name": "John Doe",
  "phone": "9876543210",
  "isFollowUp": false,
  "createdAt": "2025-01-28T08:45:00Z"
}
```

---

## Token Prioritization Logic

### Priority Hierarchy

The system implements a strict priority level system (lower number = higher priority):

| Priority | Source | Level |
|----------|--------|-------|
| 1 | Emergency | CRITICAL |
| 2 | Follow-up | HIGH |
| 3 | Paid Priority | MEDIUM-HIGH |
| 4 | Walk-in | MEDIUM |
| 5 | Online Booking | LOW |

### Queue Sorting

Tokens are automatically sorted in the queue by priority level. When a token is allocated or a slot becomes available, the system re-sorts the queue to ensure higher-priority patients are served first.

```javascript
Queue Before: [PAT-003 (priority 5), PAT-002 (priority 4), PAT-001 (priority 5)]
↓
Add Emergency: PAT-004 (priority 1)
↓
Queue After: [PAT-004 (priority 1), PAT-002 (priority 4), PAT-003 (priority 5), PAT-001 (priority 5)]
```

---

## Token Allocation Algorithm

### Step 1: Booking Request Validation
- Verify patient details exist
- Validate doctor and time slot availability
- Check booking request completeness

### Step 2: Capacity Check
```
if (allocatedTokens >= slotCapacity) {
  → Attempt Reallocation
} else {
  → Proceed to allocation
}
```

### Step 3: Dynamic Reallocation

When a slot is full and a higher-priority booking arrives:

1. **Find lower-priority tokens** in the same slot
2. **Identify next available slot** for those patients
3. **Move lower-priority token** to the next slot
4. **Free up space** in current slot

```
Slot 9-10 (Capacity: 20): [20 tokens allocated]
↓
High-priority patient books Slot 9-10
↓
System finds lowest-priority token (online_booking)
↓
Next available slot: 10-11 (Capacity: 20, Current: 15)
↓
Move online_booking token to Slot 10-11
↓
Allocate high-priority token to Slot 9-10
```

### Step 4: Queue Addition & Sorting
- Add token to doctor's queue
- Sort queue by priority level
- Return queue position to patient

---

## API Endpoints

### 1. Token Management Endpoints

#### `POST /api/tokens/book`
**Book a new token**

Request:
```json
{
  "patientId": "PAT-001",
  "patientName": "John Doe",
  "patientPhone": "9876543210",
  "doctorId": "DOC-001",
  "slotStartTime": 900,
  "slotEndTime": 1000,
  "source": "online_booking",
  "isFollowUp": false
}
```

Response (Success):
```json
{
  "success": true,
  "token": {
    "id": "TK-1001",
    "patientId": "PAT-001",
    "doctorId": "DOC-001",
    "slotStartTime": 900,
    "slotEndTime": 1000,
    "source": "online_booking",
    "status": "allocated",
    "allocatedAt": "2025-01-28T08:45:00Z"
  },
  "queuePosition": 5,
  "message": "Token allocated. Queue position: 5"
}
```

Response (Failure - Slot Full):
```json
{
  "success": false,
  "error": "Slot capacity full and no reallocation possible",
  "waitlist": true
}
```

---

#### `POST /api/tokens/:tokenId/cancel`
**Cancel a token and reallocate to waitlist**

Request:
```json
{
  "reason": "Patient could not make it"
}
```

Response:
```json
{
  "success": true,
  "token": {
    "id": "TK-1001",
    "status": "cancelled",
    "cancelledAt": "2025-01-28T09:30:00Z"
  },
  "reallocations": [
    {
      "patientId": "PAT-002",
      "newTokenId": "TK-1005"
    }
  ],
  "message": "Token cancelled successfully"
}
```

---

#### `POST /api/tokens/:tokenId/call`
**Mark token as called (under consultation)**

Response:
```json
{
  "success": true,
  "token": {
    "id": "TK-1001",
    "status": "called",
    "calledAt": "2025-01-28T09:45:00Z"
  },
  "message": "Token called"
}
```

---

#### `POST /api/tokens/:tokenId/complete`
**Mark token consultation as completed**

Request:
```json
{
  "consultationNotes": "Consultation completed. Prescribed medication X, Y, Z"
}
```

Response:
```json
{
  "success": true,
  "token": {
    "id": "TK-1001",
    "status": "completed",
    "completedAt": "2025-01-28T10:15:00Z",
    "consultationNotes": "Consultation completed..."
  },
  "message": "Token marked as completed"
}
```

---

#### `POST /api/tokens/:tokenId/no-show`
**Mark token as no-show and reallocate**

Request:
```json
{
  "reason": "Patient did not arrive"
}
```

Response:
```json
{
  "success": true,
  "token": {
    "id": "TK-1001",
    "status": "no_show",
    "noShowAt": "2025-01-28T09:50:00Z"
  },
  "reallocations": [
    {
      "patientId": "PAT-003",
      "newTokenId": "TK-1006"
    }
  ],
  "message": "Token marked as no-show"
}
```

---

#### `GET /api/tokens/:tokenId`
**Get token details and queue position**

Response:
```json
{
  "success": true,
  "token": {
    "id": "TK-1001",
    "patientId": "PAT-001",
    "doctorId": "DOC-001",
    "status": "allocated",
    "source": "online_booking",
    "queuePosition": 5,
    "doctor": {
      "id": "DOC-001",
      "name": "Dr. Sharma"
    }
  }
}
```

---

#### `GET /api/tokens/doctor/:doctorId`
**Get all tokens for a doctor (with optional status filter)**

Query Parameters:
- `status`: allocated | called | completed | cancelled | no_show

Response:
```json
{
  "success": true,
  "count": 45,
  "tokens": [...]
}
```

---

### 2. Emergency Management Endpoints

#### `POST /api/emergency/insert`
**Insert emergency token (bypasses capacity limit)**

Request:
```json
{
  "patientId": "PAT-999",
  "patientName": "Emergency Patient",
  "patientPhone": "9999999999",
  "doctorId": "DOC-001",
  "slotStartTime": 900,
  "slotEndTime": 1000,
  "severity": "critical"
}
```

Response:
```json
{
  "success": true,
  "token": {
    "id": "TK-1050",
    "status": "allocated",
    "isEmergency": true,
    "priority": 1,
    "remarks": "EMERGENCY - OVERRIDE CAPACITY"
  },
  "queuePosition": 1,
  "capacityOverride": true,
  "message": "EMERGENCY TOKEN ALLOCATED - Queue Position: 1"
}
```

---

#### `GET /api/emergency/status/:doctorId`
**Get emergency tokens for a doctor**

Response:
```json
{
  "success": true,
  "doctorId": "DOC-001",
  "totalEmergencies": 2,
  "emergencies": [
    {
      "tokenId": "TK-1050",
      "patientId": "PAT-999",
      "slotStartTime": 900,
      "status": "called"
    }
  ]
}
```

---

### 3. Admin/Management Endpoints

#### `POST /api/admin/doctors`
**Register a new doctor**

Request:
```json
{
  "id": "DOC-002",
  "name": "Dr. Patel",
  "specialization": "Neurology",
  "contactNumber": "+91-9xxx-xxxx"
}
```

---

#### `GET /api/admin/doctors`
**Get all registered doctors**

---

#### `GET /api/admin/doctors/:doctorId`
**Get doctor details with time slots**

---

#### `POST /api/admin/time-slots`
**Create a time slot**

Request:
```json
{
  "doctorId": "DOC-001",
  "startTime": 900,
  "endTime": 1000,
  "capacity": 20
}
```

---

#### `GET /api/admin/time-slots`
**Get all time slots (optionally filtered by doctor)**

Query Parameters:
- `doctorId`: Filter by doctor ID

---

#### `GET /api/admin/queue/:doctorId`
**Get queue status for a doctor**

Response:
```json
{
  "success": true,
  "doctorId": "DOC-001",
  "queueCount": 18,
  "queue": [
    {
      "position": 1,
      "tokenId": "TK-1001",
      "patientId": "PAT-001",
      "source": "follow_up",
      "priority": 2,
      "status": "allocated"
    }
  ]
}
```

---

#### `GET /api/admin/analytics/:doctorId`
**Get comprehensive analytics for a doctor**

Response:
```json
{
  "success": true,
  "analytics": {
    "doctorId": "DOC-001",
    "totalSlots": 4,
    "totalTokensAllocated": 68,
    "totalTokensCalled": 45,
    "totalTokensCompleted": 42,
    "totalNoShows": 2,
    "totalCancellations": 3,
    "totalEmergencies": 1,
    "totalFollowUps": 12,
    "sourceBreakdown": {
      "online_booking": 35,
      "walk_in": 20,
      "paid_priority": 8,
      "follow_up": 12,
      "emergency": 1
    },
    "slotUtilization": {
      "900-1000": {
        "capacity": 20,
        "allocated": 18,
        "utilization": 90
      }
    }
  }
}
```

---

#### `GET /api/admin/slot-utilization/:doctorId`
**Get slot-by-slot utilization**

Response:
```json
{
  "success": true,
  "doctorId": "DOC-001",
  "slotUtilization": [
    {
      "slotTime": "900-1000",
      "capacity": 20,
      "allocated": 18,
      "utilization": 90
    }
  ]
}
```

---

#### `GET /api/admin/patients`
**Get all registered patients**

---

## Edge Cases & Failure Handling

### Edge Case 1: Slot Becomes Full During Booking
**Scenario**: Two simultaneous bookings for the last spot

**Handling**:
- First request completes normally
- Second request triggers reallocation attempt
- If reallocation succeeds: reallocate lower-priority token, allocate new booking
- If reallocation fails: return error with waitlist flag

---

### Edge Case 2: Cascade Reallocations
**Scenario**: Multiple reallocations needed to free up space

**Handling**:
- System attempts reallocation for each lower-priority token sequentially
- If intermediate slots also full, continue cascading
- Maintain transaction integrity - either all reallocations succeed or all fail

---

### Edge Case 3: No-Show with Pending Waitlist
**Scenario**: Patient doesn't show up, multiple patients waiting

**Handling**:
1. Mark token as no-show
2. Remove from queue
3. Find first waitlisted patient for same doctor
4. Allocate same time slot to waitlisted patient
5. Update patient status

---

### Edge Case 4: Emergency During Full Capacity
**Scenario**: Emergency patient arrives when doctor is overbooked

**Handling**:
- Override capacity check
- Add emergency token with priority 1
- Move to front of queue
- Update slot temporary capacity counter
- Medical staff handles overflow manually

---

### Edge Case 5: Doctor Unavailability
**Scenario**: Doctor suddenly becomes unavailable mid-day

**Handling**:
- Mark doctor as inactive
- Auto-reallocate future tokens to alternative doctors
- Send notifications to affected patients
- Create waitlist for emergency rescheduling

---

### Edge Case 6: Duplicate Bookings
**Scenario**: Patient accidentally books twice

**Handling**:
- Check patient ID + doctor + slot combination
- Return existing token if duplicate detected
- Prevent double allocation with unique constraint

---

### Edge Case 7: Slot Time Conflict
**Scenario**: Overlapping time slots for same doctor

**Handling**:
- Validate time slot creation
- Prevent overlapping slots
- Return error if conflict detected

---

## Failure Handling Strategy

### HTTP Status Codes
- **200 OK**: Successful GET/POST without creation
- **201 Created**: Successful token allocation/creation
- **400 Bad Request**: Validation error, missing fields
- **404 Not Found**: Doctor/token/slot not found
- **500 Internal Server Error**: Unexpected server error

### Error Response Format
```json
{
  "success": false,
  "error": "Descriptive error message",
  "errorCode": "OPTIONAL_ERROR_CODE",
  "details": "Optional additional details"
}
```

### Graceful Degradation
- If reallocation fails, return error instead of cascading failure
- Log all reallocation attempts for debugging
- Provide manual override options for admins

---

## Real-World Variability Handling

### 1. Consultation Delays
- Doctor running behind schedule → System doesn't auto-extend slots
- Manual override: Admin can mark tokens as "delayed" status
- Downstream patients' positions unaffected in queue

### 2. Token Cancellations
- Patient cancels → Auto-reallocate to waitlist
- Automatic notification system (integration point)
- Frees capacity for future walk-ins

### 3. No-Shows
- Patient doesn't arrive at scheduled time
- After 10-15 minute grace period → mark as no-show
- Reallocate slot to waitlisted patient
- Track no-show rate per doctor for analytics

### 4. Follow-Up Bookings
- Automatic priority boost (Priority 2) for follow-up patients
- Guaranteed allocation within reasonable timeframe
- Integration with EMR for automated follow-up generation

### 5. Paid Priority Bookings
- Priority 3 allocation (after emergency and follow-up)
- Direct allocation without reallocation possibility
- Premium service tracking

---

## Scalability Considerations

### In-Memory Database Limitations
Current system uses in-memory storage suitable for:
- Single hospital OPD
- ~500-1000 daily consultations
- Peak usage: 100 concurrent bookings

### Production Deployment
Recommended enhancements:
```javascript
// Replace Database class with:
1. MongoDB for persistent storage
2. Redis for queue management
3. Message queue (RabbitMQ) for async operations
4. Load balancer for horizontal scaling
5. Docker containerization

// Add features:
- Session management
- Authentication & authorization
- Rate limiting
- Audit logging
- Backup & recovery
```

---

## Testing & Validation

### Test Scenarios

1. **Normal Booking Flow**
   - Register doctor → Create slots → Book token → Complete consultation

2. **Reallocation Scenario**
   - Fill slot → Book higher-priority token → Verify lower-priority reallocated

3. **Emergency Insertion**
   - Fully booked slot → Insert emergency → Verify capacity override

4. **Cascade Reallocation**
   - Multiple slots full → Insert multiple high-priority → Verify chain reaction

5. **No-Show Handling**
   - Book token → Mark as no-show → Verify waitlist reallocation

6. **Analytics Accuracy**
   - Run simulation → Compare analytics to actual allocations

---

## Integration Points

### External Systems
1. **Patient Management System**: Patient ID validation
2. **EMR/Medical Records**: Follow-up data, consultation notes
3. **Notification System**: SMS/Email alerts for token status
4. **Payment Gateway**: Paid priority verification
5. **Reporting Dashboard**: Real-time analytics visualization

---

## Deployment Instructions

```bash
# Install dependencies
npm install

# Start server
npm start
# or with development mode
npm run dev

# Access API
curl http://localhost:3000/api/health
```

---

## Future Enhancements

1. **AI-based Optimization**: Predict no-shows, optimize slot allocation
2. **Mobile App**: Patient-facing mobile application
3. **SMS Notifications**: Auto-reminder before consultation
4. **Multi-language Support**: Regional language support
5. **Telemedicine Integration**: Virtual consultation slots
6. **Analytics Dashboard**: Web-based admin dashboard
7. **Predictive Analytics**: Queue time estimation
8. **Integration with Hospital Systems**: ERP, billing, inventory

---

## Support & Contact

For issues, feature requests, or clarifications:
- Code documentation in-line comments
- Architecture diagrams in `/docs` folder
- Simulation scripts for testing in `/simulation` folder
