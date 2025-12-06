import { NavigationProp } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Location: { id: number };
};

export type RootStackNavigationProp = NavigationProp<RootStackParamList>;
