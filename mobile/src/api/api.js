import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your computer's local WiFi IP address + backend port.
// Your phone and laptop must be on the SAME WiFi network for this to work.
const BASE_URL = 'http://192.168.1.7:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Automatically attaches the saved JWT to every outgoing request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// If the token is invalid/expired, clear local storage
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    return Promise.reject(error);
  }
);

export default api;