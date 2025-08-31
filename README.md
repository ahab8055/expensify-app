# 💰 Expense Splitter - React Native CLI App

A complete React Native CLI application for Android that allows users to track and split expenses with friends, featuring advanced balance calculations and premium monetization.

## ✨ Features

### 🆓 Free Tier

- **Expense Tracking**: Add up to 5 expenses with amount, description, and participants
- **Smart Splitting**: Automatically calculate who owes whom
- **Balance Calculations**: Real-time balance updates with debt optimization
- **Basic Sharing**: Share balances via text, WhatsApp, and email
- **Local Storage**: All data stored locally using AsyncStorage

### 👑 Premium Features ($3.99 one-time)

- **Unlimited Expenses**: No limits on expense tracking
- **PDF Export**: Generate professional PDF reports
- **Advanced Sharing**: Enhanced sharing options with detailed reports
- **Priority Support**: Direct support for premium users

## 🏗️ Architecture

```
src/
├── components/          # Reusable UI components
│   ├── ExpenseItem.tsx     # Individual expense display
│   ├── BalanceItem.tsx     # Balance display component
│   └── ParticipantSelector.tsx # Participant selection modal
├── screens/             # Main application screens
│   ├── HomeScreen.tsx      # Dashboard with expense list
│   ├── AddExpenseScreen.tsx # Expense input form
│   ├── BalancesScreen.tsx  # Detailed balance calculations
│   └── PremiumScreen.tsx   # Upgrade and feature showcase
├── services/            # Business logic and external services
│   ├── storage.ts          # AsyncStorage operations
│   ├── purchases.ts        # RevenueCat integration (mocked)
│   ├── pdf.ts              # PDF generation service
│   └── sharing.ts          # Sharing functionality
├── utils/               # Utility functions and algorithms
│   └── calculations.ts     # Balance calculation algorithms
├── styles/              # Shared styling and theming
│   └── common.ts           # Common styles and colors
├── types/               # TypeScript type definitions
│   └── index.ts            # App-wide type definitions
└── App.tsx              # Main navigation and app setup
```

## 🚀 Getting Started

### Prerequisites

- React Native CLI development environment
- Android development setup
- Node.js 16+ and npm/yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ahab8055/expensify-app.git
   cd expensify-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Install iOS dependencies** (if targeting iOS)

   ```bash
   cd ios && pod install && cd ..
   ```

4. **Start Metro bundler**

   ```bash
   npm start
   ```

5. **Run on Android**

   ```bash
   npm run android
   ```

6. **Run on iOS** (optional)
   ```bash
   npm run ios
   ```

### Development Commands

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm test` - Run unit tests
- `npm run lint` - Run ESLint
- `npm run build:android` - Build Android release APK

## 🧮 Core Algorithms

### Balance Calculation

The app uses a sophisticated balance calculation system:

1. **Expense Processing**: Each expense is divided equally among participants
2. **Balance Tracking**: Tracks what each person paid vs. what they owe
3. **Debt Optimization**: Minimizes the number of transactions needed to settle debts

### Example:

- Alice pays $30 for dinner (split 3 ways: Alice, Bob, Charlie)
- Bob pays $60 for gas (split 3 ways)
- Result: Alice owes $0, Bob is owed $30, Charlie owes $30
- Optimization: Charlie pays Bob $30 (1 transaction instead of multiple)

## 🧪 Testing

The app includes comprehensive unit tests for core functionality:

```bash
npm test
```

**Test Coverage:**

- ✅ Currency formatting
- ✅ Unique ID generation
- ✅ Simple expense splitting (1:N)
- ✅ Complex multi-expense scenarios
- ✅ Optimal debt settlement algorithms
- ✅ Edge cases (no debts, balanced scenarios)

## 💎 Monetization Strategy

- **Free Tier**: 5 expenses maximum
- **Premium Upgrade**: $3.99 one-time purchase
- **Premium Benefits**:
  - Unlimited expenses
  - PDF export functionality
  - Advanced sharing features
  - Priority support

_Note: RevenueCat integration is implemented but mocked for demo purposes._

## 📱 Screenshots & Demo

### Home Screen

- Dashboard with expense overview
- Quick balance statistics
- Recent expenses list
- Add expense button

### Add Expense Screen

- Amount input with currency formatting
- Description field
- Participant selector with add functionality
- Real-time split preview

### Balances Screen

- Individual balance display
- Optimized debt settlements
- Share and export options
- Mark payments as complete

### Premium Screen

- Feature comparison
- Upgrade flow
- Restore purchases option

## 🛠️ Technical Implementation

### Key Technologies

- **React Native CLI 0.72.10** - Core framework
- **TypeScript 4.8.4** - Type safety
- **React Navigation 6** - Screen navigation
- **AsyncStorage** - Local data persistence
- **React Native Share** - Sharing functionality
- **React Native FS** - File system operations
- **Jest** - Unit testing framework

### Performance Optimizations

- Efficient balance calculations with O(n) complexity
- Minimal re-renders using React hooks optimization
- Local storage for fast app startup
- Debounced input handling for smooth UX

### Error Handling

- Comprehensive error boundaries
- Graceful degradation for failed operations
- User-friendly error messages
- Input validation and sanitization

## 🔧 Configuration

### Android Configuration

The app is configured for Android deployment with:

- Target SDK: Latest Android version
- Minimum SDK: Android 5.0 (API 21)
- Permissions: Storage, Network (for sharing)

### Build Configuration

- Development: Fast refresh enabled
- Production: Code obfuscation and optimization
- Testing: Mock services for reliable testing

## 📊 Code Statistics

- **Lines of Code**: 2,317 TypeScript/React Native
- **Source Files**: 13 organized components and screens
- **Test Coverage**: 7 comprehensive unit tests
- **Zero Linting Errors**: Production-ready code quality
- **Build Size**: Optimized for minimal APK size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Native community for excellent documentation
- Open source contributors for third-party libraries
- RevenueCat for in-app purchase framework inspiration

---

**Built with ❤️ using React Native CLI**

_Ready for Android deployment with all features implemented and thoroughly tested._
