import { Platform } from 'react-native';

export const API_URL = Platform.OS === 'android'
  ? 'http://192.168.81.57:8000/'
  : 'http://localhost:8000/api/';