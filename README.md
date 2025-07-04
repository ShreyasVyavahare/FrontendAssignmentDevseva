# Seva Booking Application

A full-featured React application for booking religious services (Sevas) with user authentication, cart management, and payment processing.

## Features

- **Home Page**: Display all Sevas with pagination and "View More" functionality
- **Cart Management**: Add/remove items from cart
- **User Authentication**: Mobile number verification with OTP
- **Address Validation**: Automatic state/city detection from pincode
- **Payment Processing**: Credit card payment with validation
- **Order Management**: Track and display order history

## Tech Stack

- **Frontend**: React 18+ with Vite
- **State Management**: Redux Toolkit
- **UI Framework**: Material-UI (MUI)
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Styling**: CSS Modules

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd sevaApp
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## API Configuration

The application expects a backend API running on `http://localhost:3000`. The Vite configuration includes a proxy to forward `/api` requests to the backend.

### Required API Endpoints

- `GET /api/sevas` - List all Sevas
- `GET /api/users/identity-exist/{mobile}` - Check if user exists
- `POST /api/otp` - Send OTP
- `POST /api/otp-verify` - Verify OTP
- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user details
- `GET /api/address-by-pincode/{pincode}` - Get address details
- `POST /api/order` - Place order

## Project Structure

```
src/
├── components/
│   ├── HomePage/          # Landing page with Seva listings
│   ├── CartPage/          # Cart management
│   ├── CheckoutPage/      # Checkout and payment
│   ├── UserPage/          # User profile and orders
│   └── Navbar/            # Navigation component
├── store/
│   ├── store.js           # Redux store configuration
│   ├── sevasSlice.js      # Seva data management
│   ├── cartSlice.js       # Cart state management
│   ├── userSlice.js       # User authentication
│   └── orderSlice.js      # Order management
├── App.jsx                # Main application component
├── main.jsx              # Application entry point
└── index.css             # Global styles
```

## Key Features Implementation

### User Authentication Flow
1. User enters mobile number
2. System checks if user exists
3. If exists: Send OTP for verification
4. If not exists: Collect name/email, create user, then send OTP
5. Verify OTP to complete authentication

### Address Validation Flow
1. User enters pincode
2. System fetches state/city from API
3. If valid: Enable address input fields
4. If invalid: Show error message

### Payment Processing
1. Validate user and address
2. Open payment modal
3. Validate card details (number, expiry, CVV)
4. Submit payment and place order
5. Clear cart on successful order

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
