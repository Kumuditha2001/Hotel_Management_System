import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import RoomListScreen from '../screens/RoomListScreen';
import RoomDetailScreen from '../screens/RoomDetailScreen';
import RoomFormScreen from '../screens/RoomFormScreen';
import BookingFormScreen from '../screens/BookingFormScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="RoomList" component={RoomListScreen} options={{ headerShown: false }} />
            <Stack.Screen name="RoomDetail" component={RoomDetailScreen} options={{ title: 'Room Details' }} />
            <Stack.Screen name="RoomForm" component={RoomFormScreen} options={{ title: 'Room Form' }} />
            <Stack.Screen name="BookingForm" component={BookingFormScreen} options={{ title: 'Book Room' }} />
            <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}