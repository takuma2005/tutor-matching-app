// Import jest matchers

// Jest 実行時は常にモック API/DB を利用する
process.env.EXPO_PUBLIC_API_MODE = 'mock';
process.env.EXPO_PUBLIC_USE_MOCK = 'true';

// Mock React Native modules
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
// AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@expo/vector-icons', () => ({ MaterialIcons: 'MaterialIcons' }), { virtual: true });
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  // Run the focus effect immediately in tests
  useFocusEffect: (effect: unknown) => {
    if (typeof effect === 'function') {
      const cleanup = effect();
      if (typeof cleanup === 'function') cleanup();
    }
  },
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: 'Navigator',
    Screen: 'Screen',
  }),
}));

// Silence the warning about act() wrapping
global.console.warn = jest.fn();

// Mock Alert to avoid native dialogs during tests
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Also ensure react-native export is mocked for Alert
const RN = require('react-native');
jest.spyOn(RN, 'Alert', 'get').mockReturnValue({ alert: jest.fn() });
