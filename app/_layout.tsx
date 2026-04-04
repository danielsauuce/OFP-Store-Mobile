import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { OrderProvider } from '@/contexts/OrderContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function RootLayout() {
  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''}
      merchantIdentifier="merchant.com.sauceit.mobile"
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <OrderProvider>
                  <ToastProvider>
                    <NotificationsProvider>
                      <Stack>
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen name="auth" options={{ headerShown: false, presentation: 'modal' }} />
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
                        <Stack.Screen name="checkout" options={{ headerShown: false }} />
                        <Stack.Screen
                          name="order-confirmation"
                          options={{ headerShown: false, gestureEnabled: false }}
                        />
                        <Stack.Screen name="notifications" options={{ headerShown: false }} />
                      </Stack>
                    </NotificationsProvider>
                  </ToastProvider>
                </OrderProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StripeProvider>
  );
}
