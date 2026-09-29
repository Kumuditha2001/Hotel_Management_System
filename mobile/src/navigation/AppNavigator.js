import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import HotelDetailScreen from '../screens/HotelDetailScreen';
import RoomListScreen from '../screens/RoomListScreen';
import RoomDetailScreen from '../screens/RoomDetailScreen';
import RoomFormScreen from '../screens/RoomFormScreen';
import BookingFormScreen from '../screens/BookingFormScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import BookingDetailScreen from '../screens/BookingDetailScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import StaffManagementScreen from '../screens/StaffManagementScreen';
import EditHotelScreen from '../screens/EditHotelScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.primary }}>
        <ActivityIndicator size="large" color={theme.colors.gold} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
          },
          headerBackTitleVisible: false,
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="HotelDetail"
              component={HotelDetailScreen}
              options={{ title: 'Hotel Overview & Sanctuary' }}
            />
            <Stack.Screen name="RoomList" component={RoomListScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="RoomDetail"
              component={RoomDetailScreen}
              options={{ title: 'Suite Details' }}
            />
            <Stack.Screen
              name="RoomForm"
              component={RoomFormScreen}
              options={({ route }) => ({
                title: route.params?.room ? 'Edit Suite' : 'Add New Suite',
              })}
            />
            <Stack.Screen
              name="BookingForm"
              component={BookingFormScreen}
              options={({ route }) => ({
                title: route.params?.booking ? 'Modify Stay' : 'Reserve Suite',
              })}
            />
            <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="BookingDetail"
              component={BookingDetailScreen}
              options={{ title: 'Reservation Itinerary' }}
            />
            <Stack.Screen
              name="AdminDashboard"
              component={AdminDashboardScreen}
              options={{ title: 'Business Analytics' }}
            />
            <Stack.Screen
              name="StaffManagement"
              component={StaffManagementScreen}
              options={{ title: 'Team & Staff' }}
            />
            <Stack.Screen
              name="EditHotel"
              component={EditHotelScreen}
              options={{ title: 'Hotel Sanctuary Settings' }}
            />
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