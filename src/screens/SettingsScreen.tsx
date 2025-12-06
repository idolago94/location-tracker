import { Alert, Button, TextInput, View } from 'react-native';
import {
  useMovementNotification,
  useTrackingFrequency,
} from '../storage/settings';
import { useCallback } from 'react';
import { NotificationService } from '../services/NotificationService';
import { GStyles } from '../styles/global';

export default function SettingsScreen() {
  const [movementNotifyEnabled, setEnabledMovementNotify] =
    useMovementNotification();
  const [trackingFrequency, setTrackingFrequency] = useTrackingFrequency();

  const toggleNotification = useCallback(async () => {
    if (!movementNotifyEnabled) {
      const granted = await NotificationService.initialize();
      if (!granted) {
        Alert.alert('Notification permission not allowed');
        return;
      }
    }
    setEnabledMovementNotify(prev => !prev);
  }, [movementNotifyEnabled, setEnabledMovementNotify]);

  return (
    <View style={GStyles.screen}>
      <Button
        title={movementNotifyEnabled ? 'Enabled' : 'Disabled'}
        onPress={toggleNotification}
      />
      <TextInput
        defaultValue={trackingFrequency.toString()}
        onEndEditing={(e) => {
          const txt = e.nativeEvent.text;
          if (!isNaN(Number(txt))) setTrackingFrequency(Number(txt));
        }}
        keyboardType="decimal-pad"
      />
    </View>
  );
}
