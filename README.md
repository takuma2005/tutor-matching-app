# 家庭教師マッチングアプリ (Tutor Matching App)

A React Native mobile application built with Expo for connecting students with qualified tutors.

## Features

- **Student Profile Management**: Students can create profiles with learning goals and preferred subjects
- **Tutor Profile Management**: Tutors can showcase their expertise, availability, and rates
- **Smart Matching**: Algorithm-based matching between students and tutors based on subjects, schedule, and location
- **Session Booking**: Easy scheduling and booking system for tutoring sessions
- **Review System**: Rating and review system for both tutors and students
- **Chat Integration**: In-app messaging between matched users
- **Payment Integration**: Secure payment processing for tutoring sessions
- **Online & In-Person Sessions**: Support for both virtual and face-to-face tutoring

## Tech Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **React Navigation** for navigation
- **Expo Router** (optional alternative to React Navigation)
- **State Management**: Context API or Redux Toolkit
- **Authentication**: Firebase Auth or Supabase Auth
- **Backend**: Firebase/Supabase or custom REST API
- **Real-time Chat**: Firebase Realtime Database or Socket.io
- **Payment Processing**: Stripe or PayPal

## Project Structure

```
src/
├── screens/          # Screen components
├── components/       # Reusable UI components
├── navigation/       # Navigation configuration
├── services/         # API calls and external services
├── utils/           # Utility functions and helpers
└── types/           # TypeScript type definitions

assets/
├── images/          # Image assets
└── icons/           # Icon assets
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your mobile device (for development)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tutor-matching-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run start
   ```

4. Use Expo Go app to scan the QR code and run the app on your device

### Development Commands

- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run web` - Run in web browser
- `npm run start` - Start the development server

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License.
