import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useReducer,
} from 'react';
import Geolocation from 'react-native-geolocation-service';
import BackgroundService from 'react-native-background-actions';
import { trackLocationInBackground, TrackOptions } from '../utils/background';
import LocationsStorage, { LocationRow } from '../storage/locations';
import { requestAlwaysLocationPermission } from '../utils/permissions';
import { NotificationService } from '../services/NotificationService';
import {
  getTrackingFrequency,
  isMovementNotifyEnabled,
} from '../storage/settings';

export interface TrackerState {
  isTracking: boolean;
  locations: Pick<LocationRow, 'id' | 'latitude' | 'longitude' | 'timestamp'>[];
  error: string | undefined;
  refresh(): Promise<void>;
  restart(delay: number): Promise<void>;
  start(): void;
  stop(): void;
  loadMore(): void;
  amount: number;
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

  const interval = getTrackingFrequency();

  const backgroundOptions = {
    taskName: 'Location Tracker',
    taskTitle: 'Tracking Location',
    taskDesc: `Fetching location every ${interval} seconds`,
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ff00ff',
    linkingURI: 'locationtracker://tracking',
    parameters: {
      interval: interval * 1000, // seconds to miliseconds
      onGetPosition: (position: Geolocation.GeoPosition) => {
        // Check movement for notification
        const sendMovementNotification = isMovementNotifyEnabled();
        if (sendMovementNotification) {
          LocationsStorage.getLastMoving().then(lastMovingLocation => {
            if (lastMovingLocation && !lastMovingLocation.no_motion_notified) {
              if (
                lastMovingLocation.latitude === position.coords.latitude &&
                lastMovingLocation.longitude === position.coords.longitude
              ) {
                const diffMinutes =
                  (Date.now() - lastMovingLocation.timestamp) / 1000 / 60;
                if (diffMinutes >= 10) {
                  NotificationService.send({
                    title: 'No Movement Detected',
                    body: 'No movement has been detected for the last 10 minutes.',
                  });
                  LocationsStorage.markNoMotionNotified(lastMovingLocation.id);
                }
              }
            }
          });
        }

        // Save in DB
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
      onGetPositionError: (err: Geolocation.GeoError) => {
        onGetLocationError?.(err.message);
      },
    },
  };

  await BackgroundService.start<TrackOptions>(
    trackLocationInBackground,
    backgroundOptions,
  );
};

const LOCATIONS_LIST_PAGINATION = 10;

export function LocationTrackerProvider({ children }: BookingProviderProps) {
  const [locations, setLocations] = useState<TrackerState['locations']>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<TrackerState['error']>();

  const [page, nextPage] = useReducer(prev => prev + 1, 1);
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    LocationsStorage.getAmount().then(setAmount);
  }, [locations]);

  useEffect(() => {
    LocationsStorage.get({
      limit: LOCATIONS_LIST_PAGINATION,
      offset: (page - 1) * LOCATIONS_LIST_PAGINATION,
    }).then(rows => {
      setLocations(prev => [...prev, ...rows]);
    });
  }, [page]);

  useEffect(() => {
    if (BackgroundService.isRunning()) {
      setIsTracking(true);
    }

    BackgroundService.addListener('expiration', () => {
      setIsTracking(false);
    });

    // Cleanup on unmount
    return () => {
      if (BackgroundService.isRunning()) {
        BackgroundService.stop();
      }
    };
  }, []);

  const refresh = useCallback(async () => {
    LocationsStorage.get({
      limit: page * LOCATIONS_LIST_PAGINATION,
      offset: 0,
    }).then(setLocations);
  }, [page]);

  const start = useCallback(() => {
    if (!BackgroundService.isRunning()) {
      startBackgroundTracking({
        onNewLocation: location => {
          setLocations(prev => [location, ...prev]);
        },
        onGetLocationError: err => {
          NotificationService.send({
            title: 'Failed to get location',
            body: err,
          });
        },
      })
        .then(() => {
          setError(undefined);
          setIsTracking(true);
        })
        .catch(err => {
          setError(err.message);
          setIsTracking(false);
        });
    }
  }, []);

  const stop = useCallback(() => {
    BackgroundService.stop().then(() => setIsTracking(false));
  }, []);

  const restart = useCallback(
    async (delay: number) => {
      if (BackgroundService.isRunning()) {
        await BackgroundService.stop();
        setTimeout(() => {
          start();
        }, delay);
      }
    },
    [start],
  );

  const value: TrackerState = {
    isTracking,
    locations,
    error,
    refresh,
    restart,
    start,
    stop,
    loadMore: nextPage,
    amount,
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
