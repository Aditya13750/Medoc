# 🧪 Testing & Usage Guide

## Quick Test Commands

All API examples use `curl`. Make sure the server is running on port 3000:

```bash
npm start
```

Then test endpoints in a separate terminal.

---

## 1️⃣ Health Check

```bash
curl http://localhost:3000/api/health
```

Expected Response:
```json
{
  "status": "OK",
  "message": "OPD Token Allocation Engine is running",
  "timestamp": "2025-01-28T10:00:00.000Z"
}
```

---

## 2️⃣ Setup: Register Doctors

### Doctor 1 - Cardiology
```bash
curl -X POST http://localhost:3000/api/admin/doctors \
  -H "Content-Type: application/json" \
  -d '{
    "id": "DOC-001",
    "name": "Dr. Sharma",
    "specialization": "Cardiology",
    "contactNumber": "+91-9876-543210"
  }'
```

### Doctor 2 - Neurology
```bash
curl -X POST http://localhost:3000/api/admin/doctors \
  -H "Content-Type: application/json" \
  -d '{
    "id": "DOC-002",
    "name": "Dr. Patel",
    "specialization": "Neurology",
    "contactNumber": "+91-9876-543211"
  }'
```

### Doctor 3 - General Medicine
```bash
curl -X POST http://localhost:3000/api/admin/doctors \
  -H "Content-Type: application/json" \
  -d '{
    "id": "DOC-003",
    "name": "Dr. Gupta",
    "specialization": "General Medicine",
    "contactNumber": "+91-9876-543212"
  }'
```

---

## 3️⃣ Setup: Create Time Slots

### Dr. Sharma - Slot 9:00-10:00
```bash
curl -X POST http://localhost:3000/api/admin/time-slots \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "DOC-001",
    "startTime": 900,
    "endTime": 1000,
    "capacity": 20
  }'
```

### Dr. Sharma - Slot 10:00-11:00
```bash
curl -X POST http://localhost:3000/api/admin/time-slots \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "DOC-001",
    "startTime": 1000,
    "endTime": 1100,
    "capacity": 20
  }'
```

### Dr. Patel - Slot 9:00-10:00
```bash
curl -X POST http://localhost:3000/api/admin/time-slots \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "DOC-002",
    "startTime": 900,
    "endTime": 1000,
    "capacity": 20
  }'
```

### Dr. Gupta - Slot 9:00-10:00
```bash
curl -X POST http://localhost:3000/api/admin/time-slots \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "DOC-003",
    "startTime": 900,
    "endTime": 1000,
    "capacity": 20
  }'
```

---

## 4️⃣ Booking Flow

### Online Booking
```bash
curl -X POST http://localhost:3000/api/tokens/book \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "PAT-001",
    "patientName": "John Doe",
    "patientPhone": "9876543210",
    "doctorId": "DOC-001",
    "slotStartTime": 900,
    "slotEndTime": 1000,
    "source": "online_booking",
    "isFollowUp": false
  }'
```

Response:
```json
{
  "success": true,
  "token": {
    "id": "TK-1000",
    "patientId": "PAT-001",
    "doctorId": "DOC-001",
    "slotStartTime": 900,
    "slotEndTime": 1000,
    "source": "online_booking",
    "status": "allocated",
    "priority": 5,
    "allocatedAt": "2025-01-28T10:00:00.000Z"
  },
  "queuePosition": 1,
  "message": "Token allocated. Queue position: 1"
}
```

### Walk-in Booking
```bash
curl -X POST http://localhost:3000/api/tokens/book \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "PAT-002",
    "patientName": "Jane Smith",
    "patientPhone": "9876543211",
    "doctorId": "DOC-001",
    "slotStartTime": 900,
    "slotEndTime": 1000,
    "source": "walk_in",
    "isFollowUp": false
  }'
```

### Follow-up Booking (Higher Priority)
```bash
curl -X POST http://localhost:3000/api/tokens/book \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "PAT-003",
    "patientName": "Patient Follow-up",
    "patientPhone": "9876543212",
    "doctorId": "DOC-001",
    "slotStartTime": 900,
    "slotEndTime": 1000,
    "source": "online_booking",
    "isFollowUp": true
  }'
```

### Paid Priority Booking
```bash
curl -X POST http://localhost:3000/api/tokens/book \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "PAT-004",
    "patientName": "Premium Patient",
    "patientPhone": "9876543213",
    "doctorId": "DOC-001",
    "slotStartTime": 900,
    "slotEndTime": 1000,
    "source": "paid_priority",
    "isFollowUp": false
  }'
```

---

## 5️⃣ Emergency Insertion

**Test emergency token insertion (bypasses capacity limit):**

```bash
curl -X POST http://localhost:3000/api/emergency/insert \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "PAT-999",
    "patientName": "Critical Emergency",
    "patientPhone": "9999999999",
    "doctorId": "DOC-001",
    "slotStartTime": 900,
    "slotEndTime": 1000,
    "severity": "critical"
  }'
```

Response:
```json
{
  "success": true,
  "token": {
    "id": "TK-1010",
    "patientId": "PAT-999",
    "doctorId": "DOC-001",
    "slotStartTime": 900,
    "slotEndTime": 1000,
    "source": "emergency",
    "status": "allocated",
    "priority": 1,
    "isEmergency": true,
    "remarks": "EMERGENCY - OVERRIDE CAPACITY",
    "allocatedAt": "2025-01-28T10:15:00.000Z"
  },
  "queuePosition": 1,
  "capacityOverride": true,
  "message": "EMERGENCY TOKEN ALLOCATED - Queue Position: 1"
}
```

---

## 6️⃣ Queue Management

### Get Queue Status for Doctor
```bash
curl http://localhost:3000/api/admin/queue/DOC-001
```

Response:
```json
{
  "success": true,
  "doctorId": "DOC-001",
  "queueCount": 5,
  "queue": [
    {
      "position": 1,
      "tokenId": "TK-1010",
      "patientId": "PAT-999",
      "source": "emergency",
      "priority": 1,
      "status": "allocated",
      "isFollowUp": false,
      "slotStartTime": 900,
      "slotEndTime": 1000
    },
    {
      "position": 2,
      "tokenId": "TK-1003",
      "patientId": "PAT-003",
      "source": "online_booking",
      "priority": 2,
      "status": "allocated",
      "isFollowUp": true,
      "slotStartTime": 900,
      "slotEndTime": 1000
    },
    {
      "position": 3,
      "tokenId": "TK-1000",
      "patientId": "PAT-001",
      "source": "online_booking",
      "priority": 5,
      "status": "allocated",
      "isFollowUp": false,
      "slotStartTime": 900,
      "slotEndTime": 1000
    }
  ]
}
```

### Get Token Details
```bash
curl http://localhost:3000/api/tokens/TK-1000
```

---

## 7️⃣ Token Workflow

### Call Token (Start Consultation)
```bash
curl -X POST http://localhost:3000/api/tokens/TK-1000/call
```

Response:
```json
{
  "success": true,
  "token": {
    "id": "TK-1000",
    "status": "called",
    "calledAt": "2025-01-28T10:05:00.000Z"
  },
  "message": "Token called"
}
```

### Complete Token (End Consultation)
```bash
curl -X POST http://localhost:3000/api/tokens/TK-1000/complete \
  -H "Content-Type: application/json" \
  -d '{
    "consultationNotes": "Patient shows symptoms of hypertension. Prescribed Amlodipine 5mg. Follow-up after 2 weeks."
  }'
```

Response:
```json
{
  "success": true,
  "token": {
    "id": "TK-1000",
    "status": "completed",
    "completedAt": "2025-01-28T10:20:00.000Z",
    "consultationNotes": "Patient shows symptoms of hypertension. Prescribed Amlodipine 5mg. Follow-up after 2 weeks."
  },
  "message": "Token marked as completed"
}
```

### Mark as No-Show
```bash
curl -X POST http://localhost:3000/api/tokens/TK-1000/no-show \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Patient did not arrive within 15 minutes of scheduled time"
  }'
```

Response:
```json
{
  "success": true,
  "token": {
    "id": "TK-1000",
    "status": "no_show",
    "noShowAt": "2025-01-28T10:25:00.000Z"
  },
  "reallocations": [],
  "message": "Token marked as no-show"
}
```

### Cancel Token
```bash
curl -X POST http://localhost:3000/api/tokens/TK-1000/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Patient cancelled appointment due to prior commitment"
  }'
```

Response:
```json
{
  "success": true,
  "token": {
    "id": "TK-1000",
    "status": "cancelled",
    "cancelledAt": "2025-01-28T10:30:00.000Z"
  },
  "reallocations": [],
  "message": "Token cancelled successfully"
}
```

---

## 8️⃣ Analytics & Reports

### Get Day Analytics for Doctor
```bash
curl http://localhost:3000/api/admin/analytics/DOC-001
```

Response:
```json
{
  "success": true,
  "analytics": {
    "doctorId": "DOC-001",
    "totalSlots": 4,
    "totalTokensAllocated": 28,
    "totalTokensCalled": 20,
    "totalTokensCompleted": 15,
    "totalNoShows": 2,
    "totalCancellations": 1,
    "totalEmergencies": 1,
    "totalFollowUps": 3,
    "sourceBreakdown": {
      "emergency": 1,
      "follow_up": 0,
      "paid_priority": 3,
      "walk_in": 8,
      "online_booking": 16
    },
    "slotUtilization": {
      "900-1000": {
        "capacity": 20,
        "allocated": 18,
        "utilization": 90
      },
      "1000-1100": {
        "capacity": 20,
        "allocated": 10,
        "utilization": 50
      }
    }
  }
}
```

### Get Slot Utilization
```bash
curl http://localhost:3000/api/admin/slot-utilization/DOC-001
```

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
    },
    {
      "slotTime": "1000-1100",
      "capacity": 20,
      "allocated": 10,
      "utilization": 50
    }
  ]
}
```

---

## 9️⃣ Bulk Operations

### Get All Tokens
```bash
curl http://localhost:3000/api/tokens
```

### Get All Tokens for Doctor
```bash
curl http://localhost:3000/api/tokens/doctor/DOC-001
```

### Get All Tokens by Status
```bash
curl http://localhost:3000/api/tokens?status=completed
```

### Get All Doctors
```bash
curl http://localhost:3000/api/admin/doctors
```

### Get All Time Slots
```bash
curl http://localhost:3000/api/admin/time-slots
```

### Get All Patients
```bash
curl http://localhost:3000/api/admin/patients
```

---

## 🔟 Advanced Test Scenarios

### Scenario 1: Fill a Slot and Observe Reallocation

1. Create slot with capacity 3
2. Book 3 online booking tokens (priority 5)
3. Book 1 follow-up token (priority 2)

**Expected**: Follow-up patient should be allocated to same slot, lowest-priority online patient reallocated to next slot.

```bash
# Slot setup
curl -X POST http://localhost:3000/api/admin/time-slots \
  -H "Content-Type: application/json" \
  -d '{"doctorId":"DOC-001","startTime":1100,"endTime":1200,"capacity":3}'

# 3 online bookings
for i in {1..3}; do
  curl -X POST http://localhost:3000/api/tokens/book \
    -H "Content-Type: application/json" \
    -d "{\"patientId\":\"PAT-0$i\",\"doctorId\":\"DOC-001\",\"slotStartTime\":1100,\"slotEndTime\":1200,\"source\":\"online_booking\",\"patientName\":\"Patient $i\",\"patientPhone\":\"988888000$i\"}"
done

# Follow-up booking (should trigger reallocation)
curl -X POST http://localhost:3000/api/tokens/book \
  -H "Content-Type: application/json" \
  -d '{"patientId":"PAT-FU-001","doctorId":"DOC-001","slotStartTime":1100,"slotEndTime":1200,"source":"online_booking","isFollowUp":true,"patientName":"Follow-up Patient","patientPhone":"9888889999"}'
```

### Scenario 2: Emergency Overrides Full Slot

1. Fill slot with 20 online bookings
2. Insert emergency

**Expected**: Emergency token allocated, queue position 1, capacity override noted.

### Scenario 3: No-Show Cascades to Waitlist

1. Book token
2. Mark as no-show
3. Check if waitlisted patient got reallocated

---

## 📝 Error Handling Tests

### Missing Required Fields
```bash
curl -X POST http://localhost:3000/api/tokens/book \
  -H "Content-Type: application/json" \
  -d '{"patientId":"PAT-001"}'
```

Response:
```json
{
  "success": false,
  "error": "Missing required fields"
}
```

### Non-existent Doctor
```bash
curl -X POST http://localhost:3000/api/tokens/book \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "PAT-001",
    "doctorId": "DOC-INVALID",
    "slotStartTime": 900,
    "slotEndTime": 1000,
    "source": "online_booking",
    "patientName": "Test",
    "patientPhone": "9999999999"
  }'
```

Response:
```json
{
  "success": false,
  "error": "Invalid booking request"
}
```

### Non-existent Token
```bash
curl http://localhost:3000/api/tokens/TK-9999
```

Response:
```json
{
  "success": false,
  "error": "Token not found"
}
```

---

## 🎬 Complete Test Sequence

Run these commands in order to test the full system:

```bash
# 1. Health check
curl http://localhost:3000/api/health

# 2. Setup doctors
curl -X POST http://localhost:3000/api/admin/doctors \
  -H "Content-Type: application/json" \
  -d '{"id":"DOC-001","name":"Dr. Sharma","specialization":"Cardiology","contactNumber":"+91-9876-543210"}'

# 3. Setup time slot
curl -X POST http://localhost:3000/api/admin/time-slots \
  -H "Content-Type: application/json" \
  -d '{"doctorId":"DOC-001","startTime":900,"endTime":1000,"capacity":20}'

# 4. Book tokens
curl -X POST http://localhost:3000/api/tokens/book \
  -H "Content-Type: application/json" \
  -d '{"patientId":"PAT-001","patientName":"John Doe","patientPhone":"9876543210","doctorId":"DOC-001","slotStartTime":900,"slotEndTime":1000,"source":"online_booking"}'

# 5. Check queue
curl http://localhost:3000/api/admin/queue/DOC-001

# 6. Call token
curl -X POST http://localhost:3000/api/tokens/TK-1000/call

# 7. Complete token
curl -X POST http://localhost:3000/api/tokens/TK-1000/complete \
  -H "Content-Type: application/json" \
  -d '{"consultationNotes":"Patient consultation completed"}'

# 8. Get analytics
curl http://localhost:3000/api/admin/analytics/DOC-001
```

---

## 💡 Tips for Testing

1. **Use Postman**: For easier API testing, import these requests into Postman
2. **Log Output**: Redirect curl output to file for analysis
3. **Multiple Terminals**: Keep server in one terminal, tests in another
4. **Simulation First**: Run `npm run simulate` to see system in action
5. **Check Logs**: Monitor console output for errors and warnings

---

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Check if port 3000 is already in use
netstat -ano | grep 3000
# Kill process if needed
taskkill /PID <PID> /F
```

### Connection Refused
- Ensure server is running: `npm start`
- Check port: Should be 3000
- Check firewall settings

### JSON Parse Error
- Ensure JSON is valid
- Use `-H "Content-Type: application/json"` header
- Quote all strings properly

### Token Not Found
- Verify token ID is correct
- Check token was created successfully
- Tokens are case-sensitive (e.g., TK-1000)

