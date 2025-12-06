/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LocationTrackerProvider } from './src/context/LocationTracker';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { RootStackParamList } from './src/navigation/types';
import { GStyles } from './src/styles/global';
import LocationScreen from './src/screens/LocationScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <LocationTrackerProvider>
        <SafeAreaView style={GStyles.screen}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="Location" component={LocationScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </LocationTrackerProvider>
    </SafeAreaProvider>
  );
}

export default App;
