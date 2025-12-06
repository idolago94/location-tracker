import { useNavigation } from '@react-navigation/native';
import { useLocationTracker } from '../context/LocationTracker';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { GStyles } from '../styles/global';
import { RootStackNavigationProp } from '../navigation/types';

export default function HomeScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { error, isTracking, locations, refresh } = useLocationTracker();

  return (
    <View style={GStyles.screen}>
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
      <Button
        title="Settings"
        onPress={() => navigation.navigate('Settings')}
      />
      {/* <Button
        title={movementNotifyEnabled ? 'Enabled' : 'Disabled'}
        onPress={toggleNotification}
      />
      <TextInput
        value={trackingFrequency.toString()}
        onChangeText={txt => {
          if (!isNaN(Number(txt))) setTrackingFrequency(Number(txt));
        }}
        keyboardType="decimal-pad"
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderColor: 'red',
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
