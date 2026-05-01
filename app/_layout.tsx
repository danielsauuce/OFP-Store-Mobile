import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StripeProvider } from '@/services/stripe';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { OrderProvider } from '@/contexts/OrderContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { ChatProvider } from '@/contexts/ChatContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 3 * 60 * 1000,
    },
  },
});

const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StripeProvider publishableKey={stripePublishableKey}>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <OrderProvider>
                  <NotificationsProvider>
                    <ChatProvider>
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
                    </ChatProvider>
                  </NotificationsProvider>
                </OrderProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </StripeProvider>
    </QueryClientProvider>
  );
}
