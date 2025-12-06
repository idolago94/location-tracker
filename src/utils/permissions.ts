import { PermissionsAndroid, Platform } from "react-native";
import Geolocation from 'react-native-geolocation-service';

export const requestAlwaysLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    const permissionStatus = await Geolocation.requestAuthorization('always');
    if (permissionStatus !== 'granted') {
      throw new Error(`Location permission ${permissionStatus}`);
    }
  }

  if (Platform.OS === 'android') {
    // Request fine location
    const fineLocationGranted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app needs access to your location',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    if (fineLocationGranted !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error(`Fine location permission ${fineLocationGranted}`);
    }

    // Request background location for Android 10+
    if (Platform.Version >= 29) {
      const backgroundGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        {
          title: 'Background Location Permission',
          message: 'This app needs access to your location in the background',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      // return backgroundGranted === PermissionsAndroid.RESULTS.GRANTED;
      if (backgroundGranted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error(`Background location permission ${backgroundGranted}`);
      }
    }
  }
};
