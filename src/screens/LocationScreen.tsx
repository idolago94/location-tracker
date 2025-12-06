import { useCallback, useState } from 'react';
import LocationsStorage, { LocationRow } from '../storage/locations';
import { GStyles } from '../styles/global';
import { Button, StyleSheet, View } from 'react-native';
import Input from '../components/Input';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { openMap, shareMapLink } from '../utils/links';

type Props = NativeStackScreenProps<RootStackParamList, 'Location'>;

export default function LocationScreen({ route }: Props) {
  const { id } = route.params;
  const navigation = useNavigation();
  const [location, setLocation] = useState<LocationRow>();

  useFocusEffect(
    useCallback(() => {
      LocationsStorage.getById(id).then(setLocation);
    }, [id]),
  );

  const onChangeLocation = useCallback(
    <K extends keyof LocationRow>(key: K, value: LocationRow[K]) => {
      setLocation(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          [key]: value,
        };
      });
    },
    [],
  );

  const saveChanges = useCallback(
    (value: LocationRow) => {
      LocationsStorage.update(id, value).then(() => navigation.goBack());
    },
    [id, navigation],
  );

  const handleDelete = useCallback(() => {
    LocationsStorage.delete(id).then(() => navigation.goBack());
  }, [id, navigation]);

  const handleOpenMap = useCallback((value: LocationRow) => {
    openMap({ lat: value.latitude, lng: value.longitude });
  }, []);
  const handleShareLocation = useCallback((value: LocationRow) => {
    shareMapLink({ lat: value.latitude, lng: value.longitude });
  }, []);

  if (!location) return null;

  return (
    <View style={[GStyles.screen, styles.container]}>
      <View style={styles.details}>
        <Input
          style={styles.input}
          label="Longitude"
          value={location.longitude.toString()}
          keyboardType="numeric"
          onChangeText={txt => onChangeLocation('longitude', Number(txt))}
        />
        <Input
          style={styles.input}
          label="Latitude"
          value={location.latitude.toString()}
          keyboardType="numeric"
          onChangeText={txt => onChangeLocation('latitude', Number(txt))}
        />

        <Button title="Open map" onPress={() => handleOpenMap(location)} />
        <Button title="Share" onPress={() => handleShareLocation(location)} />
      </View>

      <Button title="Save" onPress={() => saveChanges(location)} />
      <Button title="Delete" onPress={handleDelete} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  details: {
    flex: 1
  },
  input: {
    marginBottom: 8,
  },
});
