// import { Platform } from 'react-native';

// export const API_URL = Platform.OS === 'android'
//   ? 'http://http://38.242.200.169'
//   : 'http://localhost:8000/api/';

import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const API_URL = Constants.expoConfig.extra.EXPO_PUBLIC_API_URL || 'http://38.242.200.169';
