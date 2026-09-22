import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const STATUS_COLORS = {
  Pending: { bg: '#fef9c3', text: '#854d0e' },
  Approved: { bg: '#dcfce7', text: '#166534' },
  Rejected: { bg: '#fee2e2', text: '#991b1b' },
};

export default function MyBookingsScreen({ navigation }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data.bookings);
    } catch (err) {
      console.log('Failed to load bookings', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchBookings);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, []);

  const handleApprove = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: 'Approved' });
      fetchBookings();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to approve booking');
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: 'Rejected' });
      fetchBookings();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reject booking');
    }
  };

  const handleCancel = (bookingId) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/bookings/${bookingId}`);
            fetchBookings();
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to cancel booking');
          }
        },
      },
    ]);
  };

  const renderBooking = ({ item }) => {
    const roomLabel = item.roomId?.roomNumber ? `Room ${item.roomId.roomNumber}` : 'Room';
    const guestLabel = isAdmin && item.userId?.name ? item.userId.name : null;
    const colors = STATUS_COLORS[item.status] || STATUS_COLORS.Pending;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.roomLabel}>{roomLabel}</Text>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>{item.status}</Text>
          </View>
        </View>

        {guestLabel && <Text style={styles.guestLabel}>Booked by: {guestLabel}</Text>}

        <Text style={styles.dateText}>
          {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
        </Text>

        {/* Admin: approve/reject pending bookings */}
        {isAdmin && item.status === 'Pending' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApprove(item._id)}
            >
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleReject(item._id)}
            >
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Anyone: cancel their own pending/approved booking */}
        {item.status !== 'Rejected' && (
          <TouchableOpacity style={styles.cancelLink} onPress={() => handleCancel(item._id)}>
            <Text style={styles.cancelLinkText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{isAdmin ? 'All Bookings' : 'My Bookings'}</Text>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        renderItem={renderBooking}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No bookings yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1a1a', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  list: { padding: 20, paddingTop: 8 },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  roomLabel: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  guestLabel: { fontSize: 13, color: '#666', marginBottom: 4 },
  dateText: { fontSize: 13, color: '#666', marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionButton: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  approveButton: { backgroundColor: '#16a34a' },
  rejectButton: { backgroundColor: '#dc2626' },
  actionButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  cancelLink: { marginTop: 10, alignItems: 'center' },
  cancelLinkText: { color: '#dc2626', fontSize: 13, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 14 },
});