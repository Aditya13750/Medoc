# 📖 OPD Token Allocation Engine - Documentation Index

Welcome to the comprehensive documentation for the OPD Token Allocation Engine. This index will help you navigate through all available resources.

---

## 🚀 Getting Started

### For Quick Start (5 minutes)
1. Read: [README.md](../README.md) - Overview and quick start
2. Run: `npm install && npm start`
3. Try: `npm run simulate`

### For Learning the System (30 minutes)
1. Read: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Deliverables checklist
2. Review: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Section: System Overview
3. Run: `npm run simulate` - See system in action

### For Production Deployment (2 hours)
1. Read: [ALGORITHM.md](./ALGORITHM.md) - Complete algorithm spec
2. Study: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - All endpoints
3. Review: [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Test scenarios
4. Plan: Upgrade to persistent database

---

## 📚 Documentation Files

### 1. [README.md](../README.md) - PROJECT OVERVIEW
**Read this first!**

- Project description and features
- Quick start guide
- Installation instructions
- Running the server and simulation
- Basic API examples
- Technology stack
- Known limitations
- License information

**Time to read**: 10 minutes
**Who should read**: Everyone

---

### 2. [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - COMPLETENESS CHECK
**Read this second!**

- ✅ Deliverables checklist
- Project completion status
- Architecture overview
- Key features implemented
- Performance metrics
- Running instructions
- File structure
- Future enhancements

**Time to read**: 15 minutes
**Who should read**: Project managers, architects

---

### 3. [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API REFERENCE
**Read this for API details**

**Sections:**
- System Overview & Architecture
- Data Models (Doctor, Token, Patient, etc.)
- Token Prioritization Logic (5-level system)
- Complete API Endpoints Reference:
  - Token Management (Book, Cancel, Call, Complete, No-show)
  - Emergency Management
  - Admin/Management Endpoints
- Edge Cases (7 detailed scenarios)
- Failure Handling Strategy
- Real-World Variability Handling
- Scalability Considerations
- Integration Points
- Deployment Instructions
- Future Enhancements

**Time to read**: 30 minutes
**Who should read**: Backend developers, API consumers

**Key Sections:**
- [Token Prioritization Logic](./API_DOCUMENTATION.md#token-prioritization-logic)
- [API Endpoints](./API_DOCUMENTATION.md#api-endpoints)
- [Edge Cases](./API_DOCUMENTATION.md#edge-cases--failure-handling)
- [Error Response Format](./API_DOCUMENTATION.md#failure-handling-strategy)

---

### 4. [ALGORITHM.md](./ALGORITHM.md) - ALGORITHM SPECIFICATION
**Read this for technical deep dive**

**Sections:**
- Algorithm Overview
- Prioritization Logic (detailed)
- Reallocation Algorithm (step-by-step):
  - Phase 1: Validation
  - Phase 2: Identify Candidates
  - Phase 3: Find Target
  - Phase 4: Update Data
- Queue Management:
  - Data structure
  - Sorting algorithm
  - Operations (add, remove, position)
- Edge Cases (5 detailed with solutions)
- Complete Pseudocode:
  - bookToken()
  - cancelToken()
  - attemptReallocation()
  - sortQueueByPriority()
- Performance Characteristics
- Correctness Guarantees
- Optimization Opportunities

**Time to read**: 45 minutes
**Who should read**: Algorithm engineers, architects

**Key Sections:**
- [Reallocation Algorithm](./ALGORITHM.md#reallocation-algorithm)
- [Pseudocode](./ALGORITHM.md#pseudocode)
- [Edge Cases](./ALGORITHM.md#edge-cases)
- [Performance Characteristics](./ALGORITHM.md#performance-characteristics)

---

### 5. [TESTING_GUIDE.md](./TESTING_GUIDE.md) - API TESTING EXAMPLES
**Read this to test the system**

**Sections:**
- Quick test commands
- Health check
- Setup (Register doctors, Create slots)
- Booking flow examples:
  - Online booking
  - Walk-in booking
  - Follow-up booking
  - Paid priority booking
- Emergency insertion
- Queue management
- Token workflow (Call, Complete, No-show, Cancel)
- Analytics & reports
- Bulk operations
- Advanced scenarios (3 test scenarios)
- Error handling tests
- Complete test sequence
- Tips for testing
- Troubleshooting

**Time to read**: 20 minutes (reference)
**Who should read**: QA engineers, testers, developers

**Key Sections:**
- [Setup Instructions](./TESTING_GUIDE.md#2%EF%B8%8F%E2%83%A3-setup-register-doctors)
- [Booking Examples](./TESTING_GUIDE.md#4%EF%B8%8F%E2%83%A3-booking-flow)
- [Emergency Testing](./TESTING_GUIDE.md#5%EF%B8%8F%E2%83%A3-emergency-insertion)
- [Complete Test Sequence](./TESTING_GUIDE.md#complete-test-sequence)

---

## 🎯 Quick Navigation by Role

### 👨‍💼 Project Manager
1. Start: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
2. Check: Deliverables checklist section
3. Review: Feature list and performance metrics
4. Time estimate: 10 minutes

### 🏗️ System Architect
1. Start: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#system-overview)
2. Review: Architecture section
3. Study: Data models
4. Plan: Scalability section
5. Time estimate: 45 minutes

### 👨‍💻 Backend Developer
1. Start: [README.md](../README.md)
2. Study: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. Deep dive: [ALGORITHM.md](./ALGORITHM.md)
4. Test: [TESTING_GUIDE.md](./TESTING_GUIDE.md)
5. Run: Simulation and API tests
6. Time estimate: 2-3 hours

### 🧪 QA/Tester
1. Start: [TESTING_GUIDE.md](./TESTING_GUIDE.md)
2. Review: Test scenarios
3. Run: Complete test sequence
4. Execute: Advanced scenarios
5. Document: Test results
6. Time estimate: 1-2 hours

### 📦 DevOps/DevSecOps
1. Start: [README.md](../README.md)
2. Review: Deployment section in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#deployment-instructions)
3. Plan: [Scalability Considerations](./API_DOCUMENTATION.md#scalability-considerations)
4. Setup: CI/CD pipeline
5. Deploy: To production
6. Time estimate: 30 minutes to 2 hours

---

## 🔍 Finding Specific Information

### "How do I..."

#### "...start the system?"
→ [README.md - Quick Start](../README.md#-quick-start)

#### "...book a token?"
→ [TESTING_GUIDE.md - Booking Flow](./TESTING_GUIDE.md#4%EF%B8%8F%E2%83%A3-booking-flow)

#### "...understand the algorithm?"
→ [ALGORITHM.md - Algorithm Overview](./ALGORITHM.md#algorithm-overview)

#### "...handle edge cases?"
→ [API_DOCUMENTATION.md - Edge Cases](./API_DOCUMENTATION.md#edge-cases--failure-handling)
→ [ALGORITHM.md - Edge Cases](./ALGORITHM.md#edge-cases)

#### "...get token analytics?"
→ [TESTING_GUIDE.md - Analytics & Reports](./TESTING_GUIDE.md#8%EF%B8%8F%E2%83%A3-analytics--reports)

#### "...troubleshoot errors?"
→ [TESTING_GUIDE.md - Troubleshooting](./TESTING_GUIDE.md#-troubleshooting)

#### "...understand prioritization?"
→ [API_DOCUMENTATION.md - Token Prioritization](./API_DOCUMENTATION.md#token-prioritization-logic)
→ [ALGORITHM.md - Prioritization Logic](./ALGORITHM.md#prioritization-logic)

#### "...deploy to production?"
→ [API_DOCUMENTATION.md - Scalability](./API_DOCUMENTATION.md#scalability-considerations)

#### "...see the system in action?"
→ Run: `npm run simulate`

---

## 📊 Documentation Statistics

| Document | Pages | Sections | Time to Read |
|----------|-------|----------|--------------|
| README.md | 1 | 12 | 10 min |
| PROJECT_SUMMARY.md | 2 | 15 | 15 min |
| API_DOCUMENTATION.md | 5 | 20+ | 30 min |
| ALGORITHM.md | 4 | 15+ | 45 min |
| TESTING_GUIDE.md | 3 | 15+ | 20 min (ref) |
| **Total** | **~15** | **~75** | **~2 hours** |

---

## 🎬 Learning Path

### Path A: Executive Summary (15 minutes)
1. [README.md](../README.md) - Feature overview
2. [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Completeness check

### Path B: User Guide (45 minutes)
1. [README.md](../README.md) - Getting started
2. [TESTING_GUIDE.md](./TESTING_GUIDE.md) - API examples
3. Run: `npm run simulate`

### Path C: Developer Guide (2 hours)
1. [README.md](../README.md) - Overview
2. [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Architecture & API
3. [ALGORITHM.md](./ALGORITHM.md) - Algorithm details
4. [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing examples
5. Run: Server and API tests

### Path D: Production Deployment (3 hours)
1. [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Deliverables
2. [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete spec
3. [ALGORITHM.md](./ALGORITHM.md) - Validation
4. [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Test scenarios
5. Plan: Database migration, scaling, security

---

## 🔗 Cross-Reference Guide

### Token Prioritization
- Overview: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#token-prioritization-logic)
- Details: [ALGORITHM.md](./ALGORITHM.md#prioritization-logic)
- Testing: [TESTING_GUIDE.md](./TESTING_GUIDE.md#scenario-1-fill-a-slot-and-observe-reallocation)

### Reallocation Algorithm
- Overview: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#token-allocation-algorithm)
- Details: [ALGORITHM.md](./ALGORITHM.md#reallocation-algorithm)
- Testing: [TESTING_GUIDE.md](./TESTING_GUIDE.md#scenario-1-fill-a-slot-and-observe-reallocation)

### Edge Cases
- Business view: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#edge-cases--failure-handling)
- Technical view: [ALGORITHM.md](./ALGORITHM.md#edge-cases)
- Testing: [TESTING_GUIDE.md](./TESTING_GUIDE.md#advanced-test-scenarios)

### Emergency Handling
- Spec: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#emergency-management-endpoints)
- Testing: [TESTING_GUIDE.md](./TESTING_GUIDE.md#5%EF%B8%8F%E2%83%A3-emergency-insertion)
- Scenario: [TESTING_GUIDE.md](./TESTING_GUIDE.md#scenario-2-emergency-overrides-full-slot)

### Analytics
- Endpoints: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#adminmanagement-endpoints)
- Testing: [TESTING_GUIDE.md](./TESTING_GUIDE.md#8%EF%B8%8F%E2%83%A3-analytics--reports)
- Simulation: See output of `npm run simulate`

---

## 💡 Key Concepts Explained

### Token
A reservation for a patient to see a specific doctor in a specific time slot.

- States: allocated, called, completed, cancelled, no_show
- Sources: online_booking, walk_in, paid_priority, follow_up, emergency
- Priority: Determines queue position (1 = highest, 5 = lowest)

### Slot
A time period during which a doctor is available.

- Time: e.g., 900-1000 (9:00 AM - 10:00 AM)
- Capacity: Maximum number of patients (e.g., 20)
- Utilization: Current tokens / capacity

### Queue
An ordered list of tokens for a doctor, sorted by priority.

- Position 1: Highest priority (emergency)
- Position N: Lowest priority (online booking)
- Updates automatically when tokens added/removed

### Reallocation
Moving a lower-priority token to a different time slot to make room for a higher-priority patient.

- Triggered when: High-priority booking arrives for full slot
- Automated: System finds next available slot
- Transparent: Patient notified of change

### Priority
A number (1-5) determining queue position.

1. Emergency (medical emergency)
2. Follow-up (previous patient)
3. Paid Priority (premium service)
4. Walk-in (physical presence)
5. Online Booking (advance booking)

---

## 🚀 Quick Commands Reference

```bash
# Installation
npm install

# Run server
npm start
# Server on http://localhost:3000

# Run simulation
npm run simulate
# Shows full-day OPD scenario

# Test health
curl http://localhost:3000/api/health

# Book token
curl -X POST http://localhost:3000/api/tokens/book \
  -H "Content-Type: application/json" \
  -d '{"patientId":"PAT-001","doctorId":"DOC-001",...}'

# Get analytics
curl http://localhost:3000/api/admin/analytics/DOC-001
```

---

## 📞 Need Help?

### For API Questions
→ [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### For Algorithm Questions
→ [ALGORITHM.md](./ALGORITHM.md)

### For Testing/Examples
→ [TESTING_GUIDE.md](./TESTING_GUIDE.md)

### For Project Overview
→ [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

### For Getting Started
→ [README.md](../README.md)

---

## ✅ Verification Checklist

After reading documentation:

- [ ] I understand the system architecture
- [ ] I can explain the 5 priority levels
- [ ] I understand the reallocation algorithm
- [ ] I can identify edge cases and solutions
- [ ] I can run and understand the simulation
- [ ] I can call all API endpoints
- [ ] I can interpret error responses
- [ ] I can plan for production deployment

---

**Happy Learning! 🎓**

*Start with README.md, run the simulation, then dive into documentation that matches your needs.*
