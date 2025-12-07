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
  const { error, isTracking, locations, refresh, start, stop } =
    useLocationTracker();

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

      <View style={styles.trackingIndicatorView}>
        {isTracking ? (
          <TouchableOpacity
            style={[styles.trackingIndicatorWrap, styles.trackingColor]}
            onPress={stop}
          >
            <Text style={[styles.indicatorText, styles.trackingColor]}>
              Tracking...
            </Text>
            <Text>Press to stop tracking</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.trackingIndicatorWrap}
            onPress={start}
          >
            <Text style={styles.indicatorText}>Start Tracking</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={locations}
        keyExtractor={item => item.id.toString()}
        onRefresh={refresh}
        refreshing={false}
        renderItem={renderItem}
      />

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
  trackingIndicatorView: {
    height: '35%',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackingIndicatorWrap: {
    borderRadius: 999,
    borderWidth: 2,
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackingColor: {
    borderColor: 'blue',
    color: 'blue',
  },
  indicatorText: {
    fontWeight: 700,
    fontSize: 24,
  },
});
