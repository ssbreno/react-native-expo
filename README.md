# 🚗 Vehicles Go - React Native App

React Native Expo application integrated with the **Vehicles Go API** for vehicle rental management with PIX payment processing via Abacate Pay.

## 📱 Features

✅ **User Authentication** - Login/register with JWT tokens  
✅ **Vehicle Management** - View and manage rental vehicles  
✅ **PIX Payments** - Recurring weekly PIX payments with QR codes  
✅ **Payment History** - Complete payment tracking with status updates  
✅ **Admin Dashboard** - Administrative panel for system management  
✅ **Real-time Updates** - Webhook integration for payment status  
✅ **TypeScript Support** - Full type safety throughout the app  

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd react-native-expo
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your API configuration
```

3. **Start the development server:**
```bash
npm start
```

4. **Run on device/simulator:**
```bash
# iOS
npm run ios

# Android  
npm run android

# Web
npm run web
```

## 🔧 API Integration

### Configuration

The app is configured to work with the **Vehicles Go API**. Update the API base URL in your `.env` file:

```env
# For local development
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1

# For production  
EXPO_PUBLIC_API_URL=https://vehicles-go-production.up.railway.app/api/v1
```

### Available Services

#### 🔐 Authentication Service
- **Login/Register** - JWT-based authentication
- **Profile Management** - User profile updates
- **Secure Storage** - Token management with AsyncStorage

```typescript
import { authService } from './src/services/authService';

// Login user
const result = await authService.login(email, password);
```

#### 🚗 Vehicle Service  
- **User Vehicles** - Get vehicles assigned to user
- **Vehicle Details** - Detailed vehicle information
- **Rental Management** - Rent, return, extend rentals

```typescript
import { vehicleService } from './src/services/vehicleService';

// Get user's vehicles
const vehicles = await vehicleService.getUserVehicles();
```

#### 💳 Payment Service
- **PIX Payments** - Create recurring PIX payments  
- **Payment History** - Track all payment transactions
- **Payment Status** - Real-time payment status updates

```typescript
import { paymentService } from './src/services/paymentService';

// Create PIX payment
const pixPayment = await paymentService.createPixPayment(vehicleId, amount);
```

#### 👨‍💼 Admin Service
- **Dashboard Stats** - System statistics and metrics
- **User Management** - Manage all system users
- **Payment Management** - Oversee all payment transactions

```typescript
import { adminService } from './src/services/adminService';

// Get dashboard statistics  
const stats = await adminService.getDashboardStats();
```

## 💰 PIX Payment Integration

### How It Works

1. **Create Payment** - User initiates PIX payment for vehicle rental
2. **Generate QR Code** - System generates PIX QR code via Abacate Pay
3. **User Payment** - User scans QR code or copies PIX key to pay
4. **Webhook Update** - Abacate Pay notifies system of payment status
5. **Auto Renewal** - System creates recurring weekly payments

### PIX Payment Component

```typescript
import PixPayment from './src/components/PixPayment';

<PixPayment 
  vehicle={vehicle}
  onPaymentCreated={(paymentData) => {
    console.log('PIX payment created:', paymentData);
  }}
/>
```

### Features
- **QR Code Generation** - Automatic PIX QR code creation
- **Copy & Paste** - PIX key for manual payment entry  
- **Expiration Handling** - Payment expiration management
- **Status Tracking** - Real-time payment status updates
- **Recurring Setup** - Weekly automatic payment renewal

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   └── PixPayment.tsx   # PIX payment component
├── config/              # Configuration files
│   └── api.ts           # API configuration
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Authentication state
│   └── VehicleContext.tsx # Vehicle & payment state
├── screens/             # App screens
│   ├── LoginScreen.tsx
│   ├── PaymentHistoryScreen.tsx
│   ├── AdminDashboardScreen.tsx
│   └── ...
├── services/            # API services
│   ├── api.ts           # Base API configuration
│   ├── authService.ts   # Authentication API
│   ├── vehicleService.ts # Vehicle API
│   ├── paymentService.ts # Payment API
│   └── adminService.ts  # Admin API
└── types/               # TypeScript type definitions
    └── index.ts
```

## 🔑 Admin Access

### Credentials
```
Email: admin@vehicles.com
Password: admin123456
```

### Admin Features
- **Dashboard Overview** - System statistics and metrics
- **User Management** - View and manage all users
- **Payment Oversight** - Monitor all payment transactions  
- **Overdue Management** - Update overdue payment statuses
- **System Analytics** - Payment and usage analytics

## 🌐 API Endpoints

### Base URL
```
Production: https://vehicles-go-production.up.railway.app/api/v1
Local: http://localhost:8080/api/v1
```

### Key Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration  
- `GET /auth/profile` - Get user profile

#### Payments
- `POST /payments` - Create PIX payment
- `GET /payments` - Get user payments
- `GET /payments/{id}/history` - Payment history

#### Admin
- `GET /admin/dashboard` - Dashboard statistics
- `GET /admin/users` - All users list
- `POST /admin/payments/update-overdue` - Update overdue payments

#### Webhooks
- `POST /webhook/abacatepay` - Abacate Pay webhook

## 📖 Documentation

- **API Docs**: https://vehicles-go-production.up.railway.app/swagger/index.html
- **Abacate Pay**: https://docs.abacatepay.com/
- **Expo Documentation**: https://docs.expo.dev/

## 🛠️ Development

### Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS  
npm run web        # Run on web
npm run build      # Build for production
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
NODE_ENV=development
EXPO_PUBLIC_DEBUG=true
```

### Testing Admin Features

1. Login with admin credentials
2. Navigate to admin dashboard
3. Test payment management features
4. Try updating overdue payments

## 🚀 Deployment

### Expo Build

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Build for production
eas build --platform all
```

### Environment Setup

1. **Production API**: Update `EXPO_PUBLIC_API_URL` in `.env`
2. **Build Configuration**: Configure `eas.json` for build settings
3. **App Store Setup**: Configure app store credentials

## 🔧 Troubleshooting

### Common Issues

**API Connection Issues:**
- Verify API URL in `.env` file
- Check network connectivity  
- Ensure API server is running

**Authentication Problems:**
- Clear app storage/cache
- Check token expiration
- Verify API credentials

**PIX Payment Issues:**
- Confirm Abacate Pay integration
- Check webhook configuration
- Verify payment amounts

### Debug Mode

Enable debug mode in `.env`:
```env
EXPO_PUBLIC_DEBUG=true
```

## 📝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)  
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**🎯 Next Steps:**
1. Set up production API environment
2. Configure Abacate Pay webhooks
3. Test end-to-end payment flow
4. Deploy to app stores
5. Monitor payment transactions
