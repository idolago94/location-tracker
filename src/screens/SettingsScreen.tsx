import {
  Alert,
  Button,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  useMovementNotification,
  useTrackingFrequency,
} from '../storage/settings';
import { useCallback } from 'react';
import { NotificationService } from '../services/NotificationService';
import { GStyles } from '../styles/global';
import Input from '../components/Input';

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
    <View style={[GStyles.screen, styles.container]}>
      <View style={styles.toggleContainer}>
        <Text style={styles.notificationToggleLabel}>Send not movement notification</Text>
        <Switch value={movementNotifyEnabled} onChange={toggleNotification} />
      </View>
      <Input
        label="Tracking frequency"
        defaultValue={trackingFrequency.toString()}
        onEndEditing={e => {
          const txt = e.nativeEvent.text;
          if (!isNaN(Number(txt))) setTrackingFrequency(Number(txt));
        }}
        keyboardType="numeric"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationToggleLabel: {
    flex: 1
  }
});
