const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// When running in Expo Go (EXPO_GO=true), swap Stripe for a no-op stub.
// Stripe requires native TurboModules that Expo Go doesn't include.
// For a real build use: npx expo run:ios / npx expo run:android
if (process.env.EXPO_GO === 'true') {
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
