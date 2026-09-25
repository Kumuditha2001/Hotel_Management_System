import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
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

export default function BookingDetailScreen({ navigation, route }) {
  const { bookingId } = route.params;
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBooking = useCallback(async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      setBooking(response.data.booking);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load booking');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  // Refetch every time this screen comes back into focus (e.g. after editing)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchBooking);
    return unsubscribe;
  }, [navigation, fetchBooking]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: 'Approved' });
      await fetchBooking();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to approve booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: 'Rejected' });
      await fetchBooking();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reject booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await api.delete(`/bookings/${bookingId}`);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to cancel booking');
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  if (!booking) return null;

  const colors = STATUS_COLORS[booking.status] || STATUS_COLORS.Pending;
  const roomLabel = booking.roomId?.roomNumber ? `Room ${booking.roomId.roomNumber}` : 'Room';

  // The booking owner (non-admin) can edit dates only while still Pending
  const canEdit = !isAdmin && booking.status === 'Pending';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{roomLabel}</Text>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>{booking.status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {booking.roomId?.roomType && (
          <View style={styles.row}>
            <Text style={styles.label}>Room Type</Text>
            <Text style={styles.value}>{booking.roomId.roomType}</Text>
          </View>
        )}

        {booking.roomId?.pricePerMonth && (
          <View style={styles.row}>
            <Text style={styles.label}>Price per Month</Text>
            <Text style={styles.value}>Rs. {booking.roomId.pricePerMonth.toLocaleString()}</Text>
          </View>
        )}

        {isAdmin && booking.userId?.name && (
          <View style={styles.row}>
            <Text style={styles.label}>Booked By</Text>
            <Text style={styles.value}>{booking.userId.name}</Text>
          </View>
        )}

        {isAdmin && booking.userId?.email && (
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{booking.userId.email}</Text>
          </View>
        )}

        <View style={styles.row}>
          <Text style={styles.label}>Start Date</Text>
          <Text style={styles.value}>{new Date(booking.startDate).toLocaleDateString()}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>End Date</Text>
          <Text style={styles.value}>{new Date(booking.endDate).toLocaleDateString()}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Requested On</Text>
          <Text style={styles.value}>{new Date(booking.bookingDate).toLocaleDateString()}</Text>
        </View>

        {/* Owner: edit dates while still Pending */}
        {canEdit && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('BookingForm', { booking })}
            activeOpacity={0.8}
          >
            <Text style={styles.editButtonText}>Edit Booking</Text>
          </TouchableOpacity>
        )}

        {/* Admin: approve/reject pending bookings */}
        {isAdmin && booking.status === 'Pending' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={handleApprove}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.actionButtonText}>Approve</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.actionButtonText}>Reject</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {booking.status !== 'Rejected' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={actionLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 24 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1a1a' },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  editButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  editButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  actionButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  approveButton: { backgroundColor: '#16a34a' },
  rejectButton: { backgroundColor: '#dc2626' },
  actionButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  cancelButtonText: { color: '#dc2626', fontWeight: '600', fontSize: 14 },
});