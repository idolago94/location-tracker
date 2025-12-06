/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  FlatList,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  LocationTrackerProvider,
  useLocationTracker,
} from './src/context/LocationTracker';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <LocationTrackerProvider>
        <AppContent />
      </LocationTrackerProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { error, isTracking, locations, refresh } = useLocationTracker();

  return (
    <SafeAreaView style={styles.container}>
      {error && (
        <View style={[styles.card, styles.errorBorder]}>
          <Text style={styles.error}>{error}</Text>
        </View>
      )}

      <FlatList
        data={locations}
        keyExtractor={item => item.id.toString()}
        onRefresh={refresh}
        refreshing={false}
        renderItem={({ item }) => {
          return (
            <View style={styles.card}>
              <Text>{`${new Date(item.timestamp).getHours()}:${new Date(
                item.timestamp,
              ).getMinutes()}:${new Date(item.timestamp).getSeconds()}`}</Text>
              <Text>{item.longitude}</Text>
              <Text>{item.longitude}</Text>
            </View>
          );
        }}
      />

      <Text style={styles.status}>
        Status: {isTracking ? 'Tracking in background' : 'Not tracking'}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  card: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  errorBorder: {
    borderColor: 'red'
  },
  error: {
    color: 'red',
    marginVertical: 8,
  },
  buttonContainer: {
    marginVertical: 16,
  },
  status: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
  },
});

export default App;
