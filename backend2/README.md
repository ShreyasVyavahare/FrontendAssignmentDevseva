# Seva Booking Backend API

A Node.js Express server providing RESTful APIs for the Seva Booking Application with mock data.

## Features

- **Seva Management**: List and retrieve Seva details with pagination
- **User Authentication**: Mobile number verification with OTP
- **Address Validation**: Pincode-based address lookup
- **Order Management**: Place and track orders
- **Mock Data**: JSON-based data storage for development

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Middleware**: CORS, Body Parser
- **Data Storage**: JSON files (mock data)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. For development with auto-restart:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## API Endpoints

### Sevas

#### GET /api/sevas
List all Sevas with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
[
  {
    "id": 1,
    "code": "S001",
    "title": "Ganga Aarti",
    "tags": ["Aarti", "Ganga", "Evening"],
    "description": "Sacred evening aarti ceremony...",
    "marketPrice": 1500,
    "discountedPrice": 1200,
    "start": "2024-01-15",
    "end": "2024-12-31",
    "amountRaised": 50000,
    "targetAmount": 100000,
    "media": "https://..."
  }
]
```

#### GET /api/sevas/:code
Get Seva details by code.

**Response:**
```json
{
  "id": 1,
  "code": "S001",
  "title": "Ganga Aarti",
  // ... other fields
}
```

### Users

#### GET /api/users/identity-exist/:mobile
Check if user exists by mobile number.

**Response:**
```json
true
```

#### GET /api/users/:mobile
Get user details by mobile number.

**Response:**
```json
{
  "id": 1,
  "name": "Rahul Sharma",
  "email": "rahul.sharma@email.com",
  "contact": "9876543210",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### POST /api/users
Create a new user.

**Request Body:**
```json
{
  "contact": "9876543210",
  "name": "Rahul Sharma",
  "email": "rahul.sharma@email.com"
}
```

**Response:**
```json
{
  "id": 6,
  "name": "Rahul Sharma",
  "email": "rahul.sharma@email.com",
  "contact": "9876543210",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### OTP

#### POST /api/otp
Send OTP to mobile number.

**Request Body:**
```json
{
  "contact": "9876543210"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully"
}
```

#### POST /api/otp-verify
Verify OTP.

**Request Body:**
```json
{
  "contact": "9876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "valid": true,
  "message": "OTP verified successfully"
}
```

### Address

#### GET /api/address-by-pincode/:pincode
Get address details by pincode.

**Response:**
```json
{
  "pincode": "110001",
  "state": "Delhi",
  "city": "New Delhi"
}
```

### Orders

#### POST /api/order
Place a new order.

**Request Body:**
```json
{
  "items": [
    {
      "id": 1,
      "code": "S001",
      "title": "Ganga Aarti",
      "discountedPrice": 1200
    }
  ],
  "address": {
    "name": "Rahul Sharma",
    "addrLine1": "123 Main Street",
    "addrLine2": "Apartment 4B",
    "pincode": 110001,
    "city": "New Delhi",
    "state": "Delhi",
    "type": 1,
    "verified": true
  }
}
```

**Response:**
```json
{
  "orderId": 1001,
  "paymentId": "PAY1703123456789",
  "amountToPay": 1200
}
```

#### GET /api/orders/:userId
Get orders for a specific user.

**Response:**
```json
[
  {
    "orderId": 1001,
    "paymentId": "PAY001",
    "amountToPay": 1200,
    "userId": 1,
    "items": [...],
    "address": {...},
    "status": "completed",
    "createdAt": "2024-01-20T10:30:00Z"
  }
]
```

### Health Check

#### GET /api/health
Check server health.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Mock Data

The API uses JSON files for data storage:

- `data/sevas.json` - Seva listings
- `data/users.json` - User data
- `data/addresses.json` - Pincode data
- `data/orders.json` - Order history

## Testing

### Test Users
Use these mobile numbers for testing:
- `9876543210` - Rahul Sharma
- `8765432109` - Priya Patel
- `7654321098` - Amit Kumar

### Test Pincodes
Use these pincodes for address validation:
- `110001` - New Delhi, Delhi
- `400001` - Mumbai, Maharashtra
- `700001` - Kolkata, West Bengal
- `600001` - Chennai, Tamil Nadu
- `500001` - Hyderabad, Telangana

### OTP Testing
- OTPs are logged to console (check server logs)
- OTP expires after 5 minutes
- Maximum 3 attempts allowed

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Development

### File Structure
```
backend/
├── data/
│   ├── sevas.json
│   ├── users.json
│   ├── addresses.json
│   └── orders.json
├── server.js
├── package.json
└── README.md
```

### Adding New Data
To add new data, simply edit the JSON files in the `data/` directory. The server will automatically read the updated data.

## Production Considerations

For production deployment:
- Replace JSON storage with a proper database (MongoDB, PostgreSQL)
- Implement proper authentication and authorization
- Add input validation and sanitization
- Use environment variables for configuration
- Implement proper logging
- Add rate limiting
- Use HTTPS
- Implement proper error handling
- Add API documentation (Swagger/OpenAPI) 