const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// By default, swap Stripe for a no-op stub so Expo Go can bundle the app.
// Stripe requires native TurboModules that Expo Go doesn't include.
// For a real build use EXPO_USE_NATIVE_STRIPE=true with a dev/native build:
// EXPO_USE_NATIVE_STRIPE=true npx expo run:ios
if (process.env.EXPO_USE_NATIVE_STRIPE !== 'true') {
  const originalResolveRequest = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === '@stripe/stripe-react-native') {
      return {
        filePath: path.resolve(__dirname, 'mocks/stripe-react-native.js'),
        type: 'sourceFile',
      };
    }
    return originalResolveRequest
      ? originalResolveRequest(context, moduleName, platform)
      : context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = withNativeWind(config, { input: './global.css' });
