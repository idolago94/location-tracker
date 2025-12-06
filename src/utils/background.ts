import BackgroundService from 'react-native-background-actions';
import Geolocation from 'react-native-geolocation-service';

export interface TrackOptions {
  interval?: number;
  onGetPosition?(position: Geolocation.GeoPosition): void;
  onGetPositionError?(error: Geolocation.GeoError): void;
}

export const trackLocationInBackground = async (
  taskData: TrackOptions = {},
) => {
  const {
    interval = 8000,
    onGetPosition = () => {},
    onGetPositionError = () => {},
  } = taskData;
  
  await new Promise(async () => {
    while (BackgroundService.isRunning()) {
      // Fetch current location
      Geolocation.getCurrentPosition(onGetPosition, onGetPositionError, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        forceRequestLocation: true,
        showLocationDialog: true,
      });

      // Wait for the specified interval
      await new Promise<void>(resolve => setTimeout(resolve, interval));
    }
  });
};
