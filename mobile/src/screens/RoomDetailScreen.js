import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function RoomDetailScreen({ navigation, route }) {
  const { room } = route.params;
  const { user } = useAuth();
  const [booking, setBooking] = useState(false);

  const isFull = room.availabilityStatus === 'Full';

  const handleBookRoom = () => {
    navigation.navigate('BookingForm', { room });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {room.image ? (
          <Image source={{ uri: room.image }} style={styles.detailImage} />
        ) : null}

        <View style={styles.headerRow}>
          <Text style={styles.roomNumber}>Room {room.roomNumber}</Text>
          <View
            style={[
              styles.badge,
              room.availabilityStatus === 'Available' ? styles.badgeAvailable : styles.badgeFull,
            ]}
          >
            <Text style={styles.badgeText}>{room.availabilityStatus}</Text>
          </View>
        </View>

        <Text style={styles.roomType}>{room.roomType} Room</Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Price per Month</Text>
          <Text style={styles.value}>Rs. {room.pricePerMonth.toLocaleString()}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Capacity</Text>
          <Text style={styles.value}>{room.capacity} person(s)</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Current Occupancy</Text>
          <Text style={styles.value}>{room.currentOccupancy}</Text>
        </View>

        {room.description ? (
          <View style={styles.descriptionBox}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.description}>{room.description}</Text>
          </View>
        ) : null}

        {!isFull && (
          <TouchableOpacity style={styles.bookButton} onPress={handleBookRoom} activeOpacity={0.8}>
            <Text style={styles.bookButtonText}>Book this Room</Text>
          </TouchableOpacity>
        )}

        {isFull && (
          <View style={styles.fullNotice}>
            <Text style={styles.fullNoticeText}>This room is currently full</Text>
          </View>
        )}

        {user?.role === 'admin' && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('RoomForm', { room })}
            activeOpacity={0.8}
          >
            <Text style={styles.editButtonText}>Edit Room</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24 },
  detailImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roomNumber: { fontSize: 28, fontWeight: '700', color: '#1a1a1a' },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeAvailable: { backgroundColor: '#dcfce7' },
  badgeFull: { backgroundColor: '#fee2e2' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#166534' },
  roomType: { fontSize: 16, color: '#666', marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  descriptionBox: { marginTop: 16 },
  description: { fontSize: 14, color: '#333', marginTop: 6, lineHeight: 20 },
  bookButton: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 32,
  },
  bookButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  fullNotice: {
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 32,
  },
  fullNoticeText: { color: '#b91c1c', fontWeight: '600', fontSize: 14 },
  editButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  editButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});