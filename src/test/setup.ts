// Import jest matchers

// Mock React Native modules
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@expo/vector-icons', () => ({ MaterialIcons: 'MaterialIcons' }));
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
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
