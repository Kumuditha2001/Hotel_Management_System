import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.greeting}>Hi, {user?.name} 👋</Text>
      <Text style={styles.role}>Role: {user?.role}</Text>
      <Text style={styles.info}>
        You're logged in. This screen only shows because AppNavigator checks
        if a user exists in AuthContext - that's how protected routes work
        on the mobile side.
      </Text>

      <TouchableOpacity style={styles.button} onPress={logout} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#2563eb',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  info: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#e53e3e',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});