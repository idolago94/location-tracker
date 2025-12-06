import { useCallback } from 'react';
import { createMMKV, useMMKVBoolean, useMMKVNumber } from 'react-native-mmkv';
import { useLocationTracker } from '../context/LocationTracker';

const storage = createMMKV();

export const SETTINGS_KEYS = {
  MovementNotify: 'movement.notify',
  TrackingFrequency: 'tracking.frequency',
};

// MovementNotify
export const enableNotMovementNotify = (enable: boolean) =>
  storage.set(SETTINGS_KEYS.MovementNotify, enable);
export const isMovementNotifyEnabled = () =>
  storage.getBoolean(SETTINGS_KEYS.MovementNotify) ?? false;
export const useMovementNotification = () =>
  useMMKVBoolean(SETTINGS_KEYS.MovementNotify);

// TrackingFrequency
const DEFAULT_TRACKING_FREQUENCY = 8; // Seconds
export const getTrackingFrequency = () =>
  storage.getNumber(SETTINGS_KEYS.TrackingFrequency) ??
  DEFAULT_TRACKING_FREQUENCY;
export const useTrackingFrequency = (): [number, (value: number) => void] => {
  const { restart } = useLocationTracker();
  const [frequency = DEFAULT_TRACKING_FREQUENCY, set] = useMMKVNumber(
    SETTINGS_KEYS.TrackingFrequency,
  );

  const setFrequency = useCallback(
    (value: number) => {
      set(value);
      // Delay for last task to finish
      restart(frequency * 1000);
    },
    [set, restart, frequency],
  );

  return [frequency, setFrequency];
};
