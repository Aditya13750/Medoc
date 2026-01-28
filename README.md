# OPD Token Allocation Engine

A comprehensive hospital queue management system built with Node.js, Express, and MongoDB. Handles patient token allocation, priority management, queue operations, and real-time doctor scheduling.

## Features

✅ **Priority-Based Queue Management**
- 5-level priority system (Emergency, Follow-up, Paid Priority, Walk-in, Online Booking)
- Automatic priority override for follow-up patients
- Dynamic token reallocation

✅ **Multi-Source Token Booking**
- Emergency token insertion (capacity override)
- Walk-in patient management
- Online booking system
- Paid priority bookings

✅ **Real-Time Operations**
- Async/await architecture for concurrent access
- MongoDB for persistent data storage
- Queue status monitoring
- Live token tracking

✅ **Admin Dashboard Features**
- Doctor management
- Time slot creation and management
- Queue monitoring
- Analytics and reporting
- System status overview

✅ **Flexible Architecture**
- Dual-mode operation (MongoDB + In-Memory simulation)
- Clean separation of concerns (Controllers, Services, Routes, Models)
- Comprehensive error handling
- Request validation middleware

## Project Structure

```
Medoc/
├── src/
│   ├── controllers/          # Business logic
│   │   ├── tokenController.js
│   │   ├── doctorController.js
│   │   ├── patientController.js
│   │   ├── emergencyController.js
│   │   └── adminController.js
│   │
│   ├── routes/              # API endpoints
│   │   ├── tokenRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── emergencyRoutes.js
│   │   └── adminRoutes.js
│   │
│   ├── models/              # Database schemas
│   │   ├── MongoDBModels.js
│   │   └── Database.js
│   │
│   ├── services/            # Service layer
│   │   ├── MongoDBService.js
│   │   └── TokenAllocationService.js
│   │
│   ├── middlewares/         # Custom middleware
│   │   ├── validation.js    # Request validation
│   │   └── errorHandler.js  # Error handling
│   │
│   ├── utils/               # Utilities
│   │   ├── constants.js
│   │   └── helpers.js
│   │
│   └── server.js            # Express app setup
│
├── .env                     # Environment variables
├── index.js                 # Entry point
├── package.json             # Dependencies
└── README.md               # This file
```

## Installation

### Prerequisites
- Node.js 14+
- MongoDB (local or cloud)
- npm or yarn

### Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment** (.env already created)
   ```env
   MONGODB_URI=mongodb://localhost:27017/opd_system
   USE_MONGODB=true
   PORT=3000
   NODE_ENV=development
   ```

3. **Start MongoDB**
   ```bash
   mongod
   ```

4. **Start Server**
   ```bash
   npm start
   ```

5. **Verify Installation**
   ```bash
   curl http://localhost:3000/api/health
   ```

## API Documentation

### Token Management

#### Book Token
```bash
POST /api/tokens/book

{
  "patientId": "PAT-001",
  "patientName": "John Doe",
  "patientPhone": "9876543210",
  "doctorId": "DOC-001",
  "slotStartTime": "2024-01-28T09:00:00Z",
  "slotEndTime": "2024-01-28T11:00:00Z",
  "source": "online_booking",
  "isFollowUp": false
}
```

#### Get Token Details
```bash
GET /api/tokens/{tokenId}
```

#### Update Token Status
```bash
PATCH /api/tokens/{tokenId}/status

{
  "status": "called",
  "notes": "Patient called"
}
```

#### Call Token
```bash
POST /api/tokens/{tokenId}/call
```

#### Complete Consultation
```bash
POST /api/tokens/{tokenId}/complete
```

#### Cancel Token
```bash
DELETE /api/tokens/{tokenId}
```

#### Mark No-Show
```bash
POST /api/tokens/{tokenId}/no-show
```

#### Get Status Summary
```bash
GET /api/tokens/status/summary?doctorId=DOC-001
```

### Doctor Management

#### Add Doctor
```bash
POST /api/doctors

{
  "doctorId": "DOC-001",
  "name": "Dr. Smith",
  "specialization": "Cardiology",
  "contactNumber": "9876543210"
}
```

#### Get All Doctors
```bash
GET /api/doctors
```

#### Get Doctor by ID
```bash
GET /api/doctors/{doctorId}
```

#### Update Doctor Status
```bash
PATCH /api/doctors/{doctorId}/status

{
  "isActive": true
}
```

### Patient Management

#### Add Patient
```bash
POST /api/patients

{
  "patientId": "PAT-001",
  "name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "age": 30,
  "gender": "M",
  "address": "123 Main St"
}
```

#### Get All Patients
```bash
GET /api/patients
```

#### Get Patient by ID
```bash
GET /api/patients/{patientId}
```

#### Get Patient by Phone
```bash
GET /api/patients/search/phone?phone=9876543210
```

#### Update Patient Info
```bash
PATCH /api/patients/{patientId}

{
  "phone": "9876543211",
  "email": "newemail@example.com"
}
```

#### Get Patient History
```bash
GET /api/patients/{patientId}/history
```

### Emergency Management

#### Insert Emergency Token
```bash
POST /api/emergency/insert

{
  "patientId": "PAT-002",
  "patientName": "Emergency Patient",
  "doctorId": "DOC-001",
  "phone": "9876543210"
}
```

#### Get Emergency Status by Doctor
```bash
GET /api/emergency/status/{doctorId}
```

#### Get System Emergency Status
```bash
GET /api/emergency/system-status
```

### Admin Operations

#### Add Time Slot
```bash
POST /api/admin/time-slots

{
  "doctorId": "DOC-001",
  "startTime": "2024-01-28T09:00:00Z",
  "endTime": "2024-01-28T11:00:00Z",
  "capacity": 20
}
```

#### Get Time Slots
```bash
GET /api/admin/time-slots/{doctorId}
```

#### Get Queue Status
```bash
GET /api/admin/queue/{doctorId}
```

#### Get Doctor Analytics
```bash
GET /api/admin/analytics/{doctorId}
```

#### Get System Status
```bash
GET /api/admin/system-status
```

#### Bulk Setup
```bash
POST /api/admin/bulk-setup

{
  "doctors": [
    {
      "doctorId": "DOC-001",
      "name": "Dr. Smith",
      "specialization": "Cardiology",
      "slots": [
        {
          "startTime": "2024-01-28T09:00:00Z",
          "endTime": "2024-01-28T11:00:00Z",
          "capacity": 20
        }
      ]
    }
  ]
}
```

#### Clear All Data
```bash
DELETE /api/admin/clear-data

{
  "confirmationToken": "CONFIRM_CLEAR_ALL_DATA_2024"
}
```

## Priority System

### Priority Levels (1 = Highest)

| Priority | Type | Call Order |
|----------|------|-----------|
| 1 | Emergency | ⭐ First |
| 2 | Follow-up | Second |
| 3 | Paid Priority | Third |
| 4 | Walk-in | Fourth |
| 5 | Online Booking | Fifth |

### Priority Rules

1. **Follow-up Override**: Follow-up patients always get Priority 2 regardless of source
2. **Emergency Override**: Emergency tokens always Priority 1, can exceed capacity
3. **Default**: Unknown sources default to Priority 5

### Example

```javascript
// Walk-in → Priority 4
{ "source": "walk_in", "isFollowUp": false }

// Walk-in follow-up → Priority 2 (overrides source)
{ "source": "walk_in", "isFollowUp": true }

// Emergency → Priority 1
{ "source": "emergency" }
```

## Token Status Lifecycle

```
allocated  →  called  →  completed
                    ↓
                no_show
                    ↓
            cancelled (any time)
```

## Database Collections (MongoDB)

1. **doctors** - Doctor profiles
2. **patients** - Patient records
3. **tokens** - Token allocations
4. **timeslots** - Doctor schedules
5. **queues** - Queue management

All collections auto-indexed for performance.

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/opd_system
USE_MONGODB=true

# Server
PORT=3000
HOST=localhost
NODE_ENV=development

# Features
ENABLE_SIMULATION=true
ENABLE_DYNAMIC_REALLOCATION=true

# Constraints
DEFAULT_SLOT_CAPACITY=20
MAX_DAILY_TOKENS=100
REALLOCATION_CHECK_INTERVAL=5000
```

## Quick Start

```bash
# 1. Start MongoDB
mongod

# 2. Start server
npm start

# 3. Verify
curl http://localhost:3000/api/health

# 4. Run tests (optional)
node test-mongodb.js
```

## Architecture

### Layered Design
```
Routes (API Endpoints)
    ↓
Controllers (Business Logic)
    ↓
Services (Data Operations)
    ↓
Models (Database Schemas)
```

### Separation of Concerns

- **Controllers**: Business rules, validations, priority calculation
- **Services**: Database operations, data persistence, complex logic
- **Routes**: HTTP mapping, middleware composition
- **Models**: Schema definitions, validation rules
- **Middleware**: Request validation, error handling
- **Utils**: Constants, helpers, reusable functions

## Key Features per Component

### Controllers
- TokenController: Token booking, status updates, queue management
- DoctorController: Doctor CRUD operations, status management
- PatientController: Patient registration, profile updates, history
- EmergencyController: Emergency token insertion, status tracking
- AdminController: System administration, analytics, reporting

### Middleware
- **validation.js**: Input validation for all endpoints
- **errorHandler.js**: Centralized error handling

### Utils
- **constants.js**: Priority levels, status types, error messages
- **helpers.js**: Date handling, ID generation, formatting

### Services
- **MongoDBService**: All MongoDB operations
- **TokenAllocationService**: Token allocation algorithm, priority logic

### Models
- **MongoDBModels.js**: Mongoose schemas with indexing
- **Database.js**: In-memory database for simulation

## Running Tests

```bash
node test-mongodb.js

# Expected: ✅ Passed: 16, ❌ Failed: 0
```

## Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB won't connect | Start mongod: `mongod` |
| Port 3000 in use | Change PORT in .env or stop services |
| Validation errors | Ensure all required fields provided |
| Data not persisting | Check USE_MONGODB=true in .env |

## Performance Optimization

- ✅ Database indexing on frequently queried fields
- ✅ Async/await for non-blocking operations
- ✅ Connection pooling via Mongoose
- ✅ Early validation prevents unnecessary processing
- ✅ Error handling prevents server crashes

## Security

- ✅ Environment variables for secrets
- ✅ Input validation on all endpoints
- ✅ Error handling without exposing internals
- ✅ Proper HTTP status codes
- ✅ MongoDB injection prevention
- ✅ Data type validation

## Database Modes

### MongoDB (Production)
```env
USE_MONGODB=true
```
For real concurrent users with persistent data.

### In-Memory (Testing/Demo)
```env
USE_MONGODB=false
```
For simulation and testing without MongoDB.

Switch via .env and restart server.

## Deployment

### Local
```bash
mongod &
npm start
```

### Cloud (MongoDB Atlas)
1. Create free tier at mongodb.com/atlas
2. Get connection string
3. Update MONGODB_URI in .env

### Docker
```bash
docker build -t opd-engine .
docker run -p 3000:3000 opd-engine
```

## Monitoring

```bash
# System status
curl http://localhost:3000/api/admin/system-status

# Database status
curl http://localhost:3000/api/db-status

# Health check
curl http://localhost:3000/api/health
```

## Version

2.0.0 - MongoDB Edition with Clean Architecture

## Support

All endpoints documented with examples. See controller files for detailed JSDoc comments. Review constants.js for configuration options.

---

**Ready to use!** Start MongoDB and run `npm start` to begin.
