# OFP Store — Mobile

![GitHub repo size](https://img.shields.io/github/repo-size/danielsauuce/OFP-Store-Mobile)
![GitHub issues](https://img.shields.io/github/issues/danielsauuce/OFP-Store-Mobile)
![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)
![React Native](https://img.shields.io/badge/React%20Native-0.81-blue?logo=react)
![Expo](https://img.shields.io/badge/Expo-54-black?logo=expo)
![NativeWind](https://img.shields.io/badge/NativeWind-4.2-38bdf8?logo=tailwindcss)

The official mobile client for **Olayinka Furniture Palace (OFP)** — a full-featured e-commerce experience for browsing, purchasing, and managing furniture orders, built with React Native and Expo.

> **Related repositories**
>
> - Web + API: [danielsauuce/OFP-Store](https://github.com/danielsauuce/OFP-Store)
> - API Reference: [API_SPECIFICATION.md](API_SPECIFICATION.md)

---

## Features

### Shopping

- **Product Catalogue** — browse and filter the full product range with search and category filters
- **Product Detail** — image gallery with dot indicators, specs, stock badge, star ratings, customer reviews, and related products
- **Wishlist** — save products across sessions with real-time sync
- **Cart** — add/remove items, adjust quantities, apply promo codes, and view a live order summary

### Checkout

- **Multi-step Checkout** — address → payment → review confirmation flow
- **Stripe Payments** — card payment processing via `@stripe/stripe-react-native` (requires native build)
- **Order Confirmation** — post-purchase confirmation screen with order reference

### Account & Profile

- **Authentication** — sign up and log in with Zod-validated forms
- **Profile Management** — edit name, profile picture (Cloudinary upload), and contact details
- **Order History** — view all past orders with status, item thumbnails, and order numbers
- **Address Book** — manage saved delivery addresses
- **Wishlist Modal** — manage saved products from the profile tab
- **Support Tickets** — raise and track customer support tickets

### Support Chat

- **Real-time Chat** — Socket.IO-powered live chat with support agents
- **Persistent Connection** — socket stays alive across all tab switches; messages arrive even when the support tab is not in focus
- **Unread Badge** — tab badge increments for new messages when the chat tab is not active
- **Agent Avatars** — support agent profile pictures shown in chat bubbles
- **Conversation History** — previous conversation loaded on reconnect; start a new conversation at any time

### UI & Experience

- **Dark / Light Mode** — follows system preference by default, with manual toggle override
- **Animated Components** — smooth transitions and micro-interactions via Moti and Reanimated
- **Real-time Notifications** — in-app notification centre
- **Haptic Feedback** — native haptics on key interactions

---

## Tech Stack

| Category        | Technology                         |
| --------------- | ---------------------------------- |
| Framework       | React Native 0.81 + Expo SDK 54    |
| Language        | TypeScript 5.5                     |
| Navigation      | Expo Router (file-based routing)   |
| Styling         | NativeWind 4 (Tailwind CSS)        |
| Server State    | TanStack Query (React Query v5)    |
| HTTP Client     | Axios                              |
| Real-time       | Socket.IO Client 4                 |
| Payments        | Stripe React Native                |
| Animations      | Moti + Reanimated 4                |
| Images          | expo-image + Cloudinary            |
| Secure Storage  | expo-secure-store                  |
| Form Validation | Zod 4                              |
| Icons           | lucide-react-native                |
| Testing         | Jest + jest-expo + Testing Library |
| Linting         | ESLint + Prettier                  |

---

## Project Structure

```
.
├── app/                        # Screens — Expo Router file-based routing
│   ├── (tabs)/                 # Bottom tab bar screens
│   │   ├── index.tsx           # Home
│   │   ├── shop.tsx            # Product catalogue
│   │   ├── cart.tsx            # Shopping cart
│   │   ├── profile.tsx         # User profile
│   │   └── support.tsx         # Live support chat
│   ├── product/[id].tsx        # Dynamic product detail screen
│   ├── checkout.tsx            # Multi-step checkout
│   ├── order-confirmation.tsx  # Post-purchase confirmation
│   ├── notifications.tsx       # Notification centre
│   └── auth.tsx                # Authentication modal
│
├── components/                 # Reusable UI components
│   ├── auth/                   # Auth card and header
│   ├── cart/                   # CartItem, CartSummary, EmptyCart
│   ├── chat/                   # ChatBubble, ChatInput, ChatMessageList
│   ├── checkout/               # AddressStep, PaymentStep, ReviewStep, Stepper
│   ├── forms/                  # Shared form field components
│   ├── home/                   # HeroBanner, FeaturedProducts, HomeHeader
│   ├── product/                # ProductCard
│   ├── productDetail/          # Gallery, Specs, Reviews, RelatedProducts, etc.
│   ├── profile/                # OrdersModal, WishlistModal, EditProfileModal, etc.
│   ├── shop/                   # FilterSheet, ShopHeader, EmptyProducts
│   ├── support/                # SupportHeader, TicketHistoryModal, ChatMessageList
│   ├── ui/                     # Generic primitives (buttons, modals, etc.)
│   └── welcome/                # Onboarding / splash components
│
├── contexts/                   # React context providers
│   ├── AuthContext.tsx          # Authentication state and user profile
│   ├── CartContext.tsx          # Cart items and operations
│   ├── ChatContext.tsx          # Persistent Socket.IO chat connection
│   ├── NotificationsContext.tsx # In-app notifications state
│   ├── OrderContext.tsx         # Order history and pagination
│   ├── ThemeContext.tsx         # Dark/light mode with system preference
│   └── WishlistContext.tsx      # Wishlist state
│
├── hooks/                      # Custom React hooks
│   ├── useChatScroll.ts         # Auto-scroll for chat messages
│   └── useProducts.ts           # Product listing with filtering
│
├── services/                   # API service layer (Axios + Socket.IO)
│   ├── axiosInstance.ts         # Configured Axios instance with interceptors
│   ├── authService.ts
│   ├── cartService.ts
│   ├── chatService.ts
│   ├── notificationsService.ts
│   ├── orderService.ts
│   ├── paymentService.ts
│   ├── productService.ts
│   ├── reviewService.ts
│   ├── socketService.ts
│   ├── supportTicketService.ts
│   ├── userService.ts
│   └── wishlistService.ts
│
├── schema/                     # Zod validation schemas
├── utils/                      # Helpers (formatCurrency, normalizeProduct)
├── types/                      # Shared TypeScript types
├── constants/                  # App-wide constants
├── mocks/                      # Module mocks for Expo Go compatibility
└── __tests__/                  # Unit and integration tests
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- The [OFP-Store API](https://github.com/danielsauuce/OFP-Store) running locally or deployed

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/danielsauuce/OFP-Store-Mobile.git
   cd OFP-Store-Mobile
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Configure environment

   Create a `.env` file in the project root (or configure via `app.json` `extra`):

   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000
   EXPO_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

### Running the App

**Expo Go** (quickest — no native build required; Stripe payments are stubbed):

```bash
npx expo start
```

Scan the QR code with the [Expo Go](https://expo.dev/go) app on your device.

**iOS simulator** (requires Xcode):

```bash
npx expo run:ios
```

**Android emulator** (requires Android Studio):

```bash
npx expo run:android
```

> **Note on Stripe:** Payment processing via Stripe requires a native development build (`expo run:ios` / `expo run:android`). When running in Expo Go, payment methods return a graceful stub error and no charge is made.

---

## Available Scripts

| Script                  | Description                       |
| ----------------------- | --------------------------------- |
| `npm start`             | Start the Expo development server |
| `npm run ios`           | Build and run on iOS simulator    |
| `npm run android`       | Build and run on Android emulator |
| `npm run lint`          | Run ESLint                        |
| `npm run lint:fix`      | Run ESLint with auto-fix          |
| `npm run format`        | Format all files with Prettier    |
| `npm run format:check`  | Check formatting without writing  |
| `npm run typecheck`     | TypeScript type check (no emit)   |
| `npm test`              | Run Jest test suite               |
| `npm run test:coverage` | Run tests with coverage report    |

---

## Architecture Decisions

- **Persistent socket at app level** — `ChatContext` owns the Socket.IO connection for the full authenticated session. The socket is created on login and kept alive regardless of which tab is active, mirroring the behaviour of the web client chat widget.

- **React Query for server state** — All API data is managed via TanStack Query with a 3-minute `staleTime`. Optimistic updates (e.g., profile picture upload) use `setQueryData` without an immediate `invalidateQueries` to avoid race conditions.

- **Normalised product data** — A `normalizeProduct` utility handles all Cloudinary image shape variants (`secure_url`, `secureUrl`, `url`) from the API in one place, used consistently across product, wishlist, and order contexts.

- **Zod form validation** — All user-facing forms are validated with Zod schemas defined in `schema/`, keeping validation logic separate from component code.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Run format and lint before committing (`npm run format && npm run lint`)
4. Commit your changes (`git commit -m 'feat: add your feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Open a Pull Request

---

## License

This project is licensed under the [MIT License](LICENSE).
