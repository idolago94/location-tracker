import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import Geolocation from 'react-native-geolocation-service';
import BackgroundService from 'react-native-background-actions';
import { trackLocationInBackground, TrackOptions } from '../utils/background';
import LocationsStorage, { LocationRow } from '../storage/locations';
import { requestAlwaysLocationPermission } from '../utils/permissions';

export interface TrackerState {
  isTracking: boolean;
  locations: Omit<LocationRow, 'no_motion_notified'>[];
  error: string | undefined;
  refresh(): Promise<void>;
}

const LocationTrackerContext = createContext<TrackerState | undefined>(
  undefined,
);

interface BookingProviderProps {
  children: ReactNode;
}

const startBackgroundTracking = async ({
  onNewLocation,
  onGetLocationError,
}: {
  onNewLocation?(location: TrackerState['locations'][number]): void;
  onGetLocationError?(error: string): void;
}) => {
  await requestAlwaysLocationPermission();

  const backgroundOptions = {
    taskName: 'Location Tracker',
    taskTitle: 'Tracking Location',
    taskDesc: 'Fetching location every 8 seconds',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ff00ff',
    linkingURI: 'locationtracker://tracking',
    parameters: {
      interval: 8000, // 8 seconds
      onGetPosition: (position: Geolocation.GeoPosition) => {
        LocationsStorage.insert({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
        }).then(insertedId => {
          if (insertedId) {
            onNewLocation?.({
              id: insertedId,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: position.timestamp,
            });
          }
        });
      },
      onGetPositionError: () => {
        onGetLocationError?.("Can't get device location");
      },
    },
  };

  await BackgroundService.start<TrackOptions>(trackLocationInBackground, backgroundOptions);
};

export function LocationTrackerProvider({ children }: BookingProviderProps) {
  const [locations, setLocations] = useState<TrackerState['locations']>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<TrackerState['error']>();

  useEffect(() => {
    LocationsStorage.getAll().then(rows => {
      setLocations(rows);
    });
    if (!BackgroundService.isRunning()) {
      startBackgroundTracking({
        onNewLocation: location => {
          setLocations(prev => [location, ...prev]);
        },
        onGetLocationError: setError,
      })
        .catch(err => setError(err.message))
        .then(() => {
          setError(undefined);
          setIsTracking(true);
        });
    } else {
      setIsTracking(true);
    }

    // Cleanup on unmount
    return () => {
      if (BackgroundService.isRunning()) {
        BackgroundService.stop();
      }
    };
  }, []);

  const refresh = useCallback(async () => {
    const rows = await LocationsStorage.getAll();
    setLocations(rows);
  }, []);

  const value: TrackerState = {
    isTracking,
    locations,
    error,
    refresh,
  };

  return (
    <LocationTrackerContext.Provider value={value}>
      {children}
    </LocationTrackerContext.Provider>
  );
}

export function useLocationTracker(): TrackerState {
  const context = useContext(LocationTrackerContext);
  if (context === undefined) {
    throw new Error(
      'useLocationTracker must be used within a LocationtrackerProvider',
    );
  }
  return context;
}
