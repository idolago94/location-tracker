/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee from '@notifee/react-native';
import BackgroundService from 'react-native-background-actions';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (detail.pressAction) {
    if (BackgroundService.isRunning()) {
      BackgroundService.emit('expiration');
      BackgroundService.stop();
    }
  }
});
notifee.onForegroundEvent(async ({ type, detail }) => {
  if (detail.pressAction) {
    if (BackgroundService.isRunning()) {
      BackgroundService.emit('expiration');
      BackgroundService.stop();
    }
  }
});

AppRegistry.registerComponent(appName, () => App);
