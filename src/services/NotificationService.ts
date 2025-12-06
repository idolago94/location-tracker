import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  Notification,
} from '@notifee/react-native';

export class NotificationService {
  private static readonly CHANNEL_ID = 'location_tracking_channel';

  static async initialize() {
    console.log('NotificationService.initialize()');

    // Create Android notification channel
    await notifee.createChannel({
      id: this.CHANNEL_ID,
      name: 'Location Tracking',
      description: 'Notifications for location tracking',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });

    // Request permission
    const settings = await notifee.requestPermission();

    if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
      console.log('Notification permission granted');
      return true;
    } else {
      console.log('Notification permission denied');
      return false;
    }
  }

  static async send(params: Pick<Notification, 'title' | 'body'>) {
    await notifee.displayNotification({
      android: {
        channelId: this.CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        sound: 'default',
      },
      ios: {
        sound: 'default',
      },
      ...params
    });
  }
}
