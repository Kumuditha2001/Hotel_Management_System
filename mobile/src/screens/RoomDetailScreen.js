import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RoomDetailScreen({ navigation, route }) {
  const { room } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
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

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('RoomForm', { room })}
          activeOpacity={0.8}
        >
          <Text style={styles.editButtonText}>Edit Room</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24 },
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
  editButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 32,
  },
  editButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});