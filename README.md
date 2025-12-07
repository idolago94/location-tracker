# LocationTracker

A React Native mobile application for continuous background GPS location tracking with persistent storage and notification support.

## Overview

LocationTracker is a cross-platform (iOS/Android) mobile app that tracks device location in the background, stores location history in a local SQLite database, and provides notifications for movement detection. The app allows users to view, edit, delete, and share tracked locations.

## Architecture

### Project Structure

```
LocationTracker/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── Input.tsx        # Input component with label
│   ├── context/            # Global state management
│   │   └── LocationTracker.tsx  # Location tracking context & service
│   ├── navigation/         # Navigation configuration
│   │   └── types.ts        # TypeScript navigation types
│   ├── screens/            # Application screens
│   │   ├── HomeScreen.tsx      # Main tracking screen
│   │   ├── LocationScreen.tsx  # Location details & editing
│   │   └── SettingsScreen.tsx  # App settings
│   ├── services/           # Background services
│   │   └── NotificationService.ts  # Notification handling
│   ├── storage/            # Data persistence
│   │   ├── locations.ts    # SQLite location storage
│   │   └── settings.ts     # MMKV settings storage
│   ├── styles/             # Styling
│   │   └── global.ts       # Global stylesheet
│   └── utils/              # Utility functions
│       ├── background.ts   # Background tracking logic
│       ├── permissions.ts  # Permission requests
│       └── links.ts        # Map and sharing utilities
├── android/                # Android native code
├── ios/                    # iOS native code
├── App.tsx                 # Root app component
└── index.js                # Entry point with notification listeners
```

### Key Technologies

- **React Native 0.82.1** - Cross-platform mobile framework
- **TypeScript 5.8.3** - Type safety
- **React Navigation 7** - Screen navigation
- **react-native-geolocation-service** - GPS location access
- **react-native-background-actions** - Background service execution
- **react-native-nitro-sqlite** - SQLite database for location storage
- **react-native-mmkv** - Key-value storage for settings
- **@notifee/react-native** - Cross-platform notifications

### Architecture Pattern

The app uses **React Context API** for global state management:

- `LocationTrackerProvider` wraps the app and provides tracking state
- `useLocationTracker()` hook allows components to subscribe to state changes
- Background service runs independently and updates context state
- SQLite database persists location data
- MMKV stores user preferences (tracking frequency, notification settings)

### Data Flow

```
User Action (Start/Stop)
    ↓
HomeScreen Component
    ↓
useLocationTracker() Hook
    ↓
LocationTrackerContext
    ↓
Background Service (trackLocationInBackground)
    ↓
GPS Position Fetch (every N seconds)
    ↓
SQLite Storage + Movement Detection
    ↓
Context State Update
    ↓
UI Re-render
```

### Database Schema

**SQLite Table: `locations`**
```sql
CREATE TABLE locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  timestamp INTEGER NOT NULL,
  no_motion_notified INTEGER DEFAULT 0,
  is_moving INTEGER DEFAULT 0
);
```

## Features

1. **Background Location Tracking**
   - Continuous GPS tracking with configurable intervals (default: 8 seconds)
   - High accuracy mode with 15-second timeout
   - Runs as foreground service with persistent notification

2. **Location Management**
   - View all tracked locations with timestamps
   - Edit latitude/longitude values
   - Delete individual location entries
   - Pull-to-refresh to reload locations

3. **Map Integration**
   - Open locations in native maps (iOS Maps / Google Maps)
   - Share location via native share API

4. **Notifications**
   - No-movement detection (after 10 minutes of no location change)
   - Foreground service notification
   - Tap notification to stop tracking

5. **Settings**
   - Toggle no-movement notifications
   - Configure tracking frequency (seconds, changes restart background service automatically)

6. **Movement Detection**
   - Automatic detection of device movement
   - Flags locations as moving/stationary

## Prerequisites

- **Node.js** >= 20
- **npm** or **yarn**
- **Xcode** (for iOS development) - macOS only
- **Android Studio** (for Android development)
- **CocoaPods** (for iOS dependencies)

### iOS Requirements

- macOS with Xcode 14 or later
- iOS 13.0 or later
- CocoaPods installed: `sudo gem install cocoapods`

### Android Requirements

- Android Studio with Android SDK
- Android SDK Platform 23 or later
- Android Build Tools
- Android Emulator or physical device

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/idolago94/location-tracker.git
   cd location-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies (macOS only)**
   ```bash
   cd ios
   pod install
   cd ..
   ```

## Running the App

### iOS

1. **Start Metro bundler**
   ```bash
   npm start
   ```

2. **Run on iOS simulator**
   ```bash
   npm run ios
   ```

3. **Run on specific iOS simulator**
   ```bash
   npm run ios -- --simulator="iPhone 15 Pro"
   ```

4. **Run on physical iOS device**
   - Open `ios/LocationTracker.xcworkspace` in Xcode
   - Select your device from the device menu
   - Configure signing with your Apple Developer account
   - Click the Run button or press `Cmd + R`

### Android

1. **Start Metro bundler**
   ```bash
   npm start
   ```

2. **Run on Android emulator or device**
   ```bash
   npm run android
   ```

3. **Build release APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### Troubleshooting

**Metro bundler issues:**
```bash
npm start -- --reset-cache
```

**iOS build issues:**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**Android build issues:**
```bash
cd android
./gradlew clean
cd ..
```

## Permissions

### iOS Permissions (Info.plist)

The app requires the following iOS permissions:

- `NSLocationWhenInUseUsageDescription` - Location access while using app
- `NSLocationAlwaysAndWhenInUseUsageDescription` - Background location access
- `NSLocationAlwaysUsageDescription` - Always location access
- `UIBackgroundModes` - Background location updates

### Android Permissions (AndroidManifest.xml)

The app requires the following Android permissions:

- `ACCESS_COARSE_LOCATION` - Coarse location access
- `ACCESS_FINE_LOCATION` - Fine location access
- `ACCESS_BACKGROUND_LOCATION` - Background location (Android 10+)
- `FOREGROUND_SERVICE` - Foreground service capability
- `FOREGROUND_SERVICE_LOCATION` - Location foreground service
- `FOREGROUND_SERVICE_DATA_SYNC` - Data sync foreground service
- `WAKE_LOCK` - Keep device awake during tracking
- `POST_NOTIFICATIONS` - Send notifications (Android 13+)
- `VIBRATE` - Vibration for notifications
- `INTERNET` - Network access

## Known Limitations

1. **Battery Consumption**
   - Continuous GPS polling (default: every 8 seconds) can significantly drain battery
   - Background service keeps device awake
   - High accuracy mode increases power usage

2. **Movement Detection**
   - Uses exact coordinate comparison instead of distance-based detection
   - May incorrectly flag locations as "not moving" due to GPS drift
   - No configurable sensitivity threshold

3. **No State Persistence**
   - App state (isTracking, error) is not persisted across app restarts
   - Background service stops when app is force-closed (depends on OS behavior)
   - Users must manually restart tracking after app restart

4. **Fixed Notification Threshold**
   - No-movement notification is hardcoded to 10 minutes
   - Cannot be configured by the user

5. **Database Growth**
   - Location records grow indefinitely
   - No automatic cleanup or archival
   - Could impact performance with large datasets (thousands of locations)

6. **No Data Export**
   - No built-in export functionality (CSV, JSON, GPX)
   - Locations can only be shared individually

7. **Platform-Specific Limitations**
   - **iOS**: Background tracking may be paused by system during low power mode
   - **iOS**: Background service may stop after extended periods (OS-dependent)
   - **Android**: Aggressive battery optimization may kill background service on some devices (Xiaomi, Huawei, etc.)
   - **Android**: Requires disabling battery optimization for reliable tracking

8. **No Location History Visualization**
   - No map view showing tracked route
   - No timeline or date filtering

9. **Single User Support**
   - No user accounts or cloud sync
   - All data stored locally on device

10. **No Geofencing**
    - No alerts for entering/leaving specific areas
    - No location-based triggers
