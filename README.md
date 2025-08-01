# FamLink - Family Tree App

A React Native/Expo application for building and managing verified family networks using government-issued identification (NIN/BVN).

## 🚀 Features

- **Identity Verification**: Government ID verification (NIN/BVN)
- **Family Tree Management**: Interactive family tree visualization
- **Privacy-First**: Consent-based relationship connections
- **Search & Discovery**: Find family members by ID or name
- **Real-time Notifications**: Family requests and updates
- **Cross-Platform**: iOS, Android, and Web support

## 🛠 Tech Stack

- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router with file-based routing
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod validation
- **UI**: Custom components with Lucide React Native icons
- **Language**: TypeScript with strict typing
- **Testing**: Jest + React Native Testing Library

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FamLink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## 🏗 Project Structure

```
FamLink/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Main tab navigation
│   ├── auth/              # Authentication flows
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── ui/               # UI component library
│   └── LoadingSpinner.tsx
├── hooks/                # Custom React hooks
├── providers/            # Context providers
├── schemas/              # Zod validation schemas
├── store/                # Zustand stores
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── __tests__/            # Test files
```

## 🔧 Key Improvements Implemented

### 1. State Management
- **Zustand stores** for client state (auth, family data)
- **React Query** for server state management
- **Persistent storage** with AsyncStorage

### 2. Form Handling
- **React Hook Form** for efficient form management
- **Zod validation** schemas for type-safe validation
- **Custom Input components** with validation support

### 3. Component Architecture
- **Reusable UI components** (Button, Input, Card)
- **Consistent design system** with color tokens
- **Type-safe props** with TypeScript interfaces

### 4. Error Handling
- **Global error boundaries**
- **Toast notifications** for user feedback
- **Loading states** for better UX

### 5. Testing Setup
- **Jest configuration** for unit testing
- **React Native Testing Library** for component testing
- **Mock setup** for external dependencies

## 🎨 Design System

The app uses a consistent design system with:

- **Primary Colors**: Blue (#2563eb) for trust and verification
- **Secondary Colors**: Green (#059669) for success and acceptance
- **Accent Colors**: Orange (#ea580c) for warnings and actions
- **Neutral Colors**: Gray scale for text and backgrounds

## 🔐 Privacy & Security

- Government ID verification (NIN/BVN)
- Consent-based relationships
- Privacy controls for profile visibility
- Secure data handling with AsyncStorage

## 📱 Navigation Structure

```
Root Layout
├── Welcome Screen
├── Auth Stack
│   ├── Onboarding (3-step flow)
│   ├── Registration (with ID verification)
│   ├── Login
│   └── Verification
└── Main Tabs
    ├── Home (Dashboard)
    ├── Family Tree (Interactive view)
    ├── Search (Find family members)
    ├── Notifications (Requests & updates)
    └── Profile (Settings & privacy)
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 🚀 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build:web` - Build for web
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### Code Quality

- **TypeScript** with strict mode enabled
- **ESLint** for code linting
- **Prettier** for code formatting
- **Jest** for unit testing

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository. 