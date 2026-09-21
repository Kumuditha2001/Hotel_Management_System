import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/api';

export default function RoomListScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchRooms = async () => {
    try {
      setError('');
      const response = await api.get('/rooms');
      setRooms(response.data.rooms);
    } catch (err) {
      setError('Failed to load rooms. Pull down to try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchRooms);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRooms();
  }, []);

  const renderRoom = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RoomDetail', { room: item })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
        <View
          style={[
            styles.badge,
            item.availabilityStatus === 'Available' ? styles.badgeAvailable : styles.badgeFull,
          ]}
        >
          <Text style={styles.badgeText}>{item.availabilityStatus}</Text>
        </View>
      </View>
      <Text style={styles.roomType}>{item.roomType} Room</Text>
      <Text style={styles.price}>Rs. {item.pricePerMonth.toLocaleString()} / month</Text>
      <Text style={styles.occupancy}>
        Occupancy: {item.currentOccupancy}/{item.capacity}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rooms</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('RoomForm')}>
          <Text style={styles.addButtonText}>+ Add Room</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={rooms}
        keyExtractor={(item) => item._id}
        renderItem={renderRoom}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No rooms yet. Tap "+ Add Room" to create one.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1a1a' },
  addButton: { backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  list: { padding: 20, paddingTop: 8 },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  roomNumber: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeAvailable: { backgroundColor: '#dcfce7' },
  badgeFull: { backgroundColor: '#fee2e2' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#166534' },
  roomType: { fontSize: 14, color: '#666', marginBottom: 4 },
  price: { fontSize: 15, fontWeight: '600', color: '#2563eb', marginBottom: 4 },
  occupancy: { fontSize: 13, color: '#999' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 14 },
  errorText: { color: '#b91c1c', textAlign: 'center', paddingHorizontal: 20, paddingBottom: 8, fontSize: 13 },
});