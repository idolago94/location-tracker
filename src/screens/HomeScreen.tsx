import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { TrackerState, useLocationTracker } from '../context/LocationTracker';
import {
  Button,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GStyles } from '../styles/global';
import { RootStackNavigationProp } from '../navigation/types';
import { useCallback } from 'react';

export default function HomeScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { error, isTracking, locations, refresh } = useLocationTracker();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const renderItem: ListRenderItem<TrackerState['locations'][number]> =
    useCallback(
      ({ item }) => {
        return (
          <TouchableOpacity
            onPress={() => navigation.navigate('Location', { id: item.id })}
          >
            <View style={styles.card}>
              <Text>{`${new Date(item.timestamp).getHours()}:${new Date(
                item.timestamp,
              ).getMinutes()}:${new Date(item.timestamp).getSeconds()}`}</Text>
              <Text>Longitude: {item.longitude}</Text>
              <Text>Latitude: {item.latitude}</Text>
            </View>
          </TouchableOpacity>
        );
      },
      [navigation],
    );

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
        renderItem={renderItem}
      />

      <Text style={styles.status}>
        Status: {isTracking ? 'Tracking in background' : 'Not tracking'}
      </Text>
      <Button
        title="Settings"
        onPress={() => navigation.navigate('Settings')}
      />
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
