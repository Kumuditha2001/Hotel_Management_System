import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { theme } from '../theme/theme';

const STATUS_THEMES = {
  Pending: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  Approved: { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
  Rejected: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' },
  Cancelled: { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' },
};

export default function BookingDetailScreen({ navigation, route }) {
  const { bookingId } = route.params;
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBooking = useCallback(async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      setBooking(response.data.booking);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to retrieve reservation details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [bookingId, navigation]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: 'Approved' });
      await fetchBooking();
      Alert.alert('Success', 'Reservation approved successfully.');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to approve reservation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    Alert.alert('Reject Reservation', 'Are you sure you want to reject this reservation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await api.put(`/bookings/${bookingId}/status`, { status: 'Rejected' });
            await fetchBooking();
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to reject reservation');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation? Room capacity will be immediately released.',
      [
        { text: 'Keep Reservation', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await api.delete(`/bookings/${bookingId}`);
              await fetchBooking();
              Alert.alert('Cancelled', 'Your reservation has been cancelled.');
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel reservation');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.gold} />
        <Text style={styles.loadingText}>Loading reservation itinerary...</Text>
      </View>
    );
  }

  if (!booking) return null;

  const room = booking.roomId;
  const statusCfg = STATUS_THEMES[booking.status] || STATUS_THEMES.Pending;
  const isCancellable = booking.status === 'Pending' || booking.status === 'Approved';
  const canEdit = !isAdmin && booking.status === 'Pending';

  const checkIn = new Date(booking.startDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const checkOut = new Date(booking.endDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const displayImage =
    room?.images?.[0] ||
    room?.image ||
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Reservation Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusCfg.bg, borderColor: statusCfg.border }]}>
          <View style={styles.statusBannerRow}>
            <View>
              <Text style={styles.refLabel}>CONFIRMATION REF</Text>
              <Text style={styles.refCode}>#{booking._id.slice(-8).toUpperCase()}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg, borderColor: statusCfg.border }]}>
              <Text style={[styles.statusBadgeText, { color: statusCfg.text }]}>{booking.status}</Text>
            </View>
          </View>
        </View>

        {/* Room Preview Card */}
        <View style={styles.card}>
          <Image source={{ uri: displayImage }} style={styles.roomImage} />
          <View style={styles.roomInfoBox}>
            <Text style={styles.roomTypeTag}>{room?.roomType || 'Hotel Suite'}</Text>
            <Text style={styles.roomNumber}>Room {room?.roomNumber || 'N/A'}</Text>
          </View>
        </View>

        {/* Itinerary Dates Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Itinerary & Dates</Text>

          <View style={styles.dateBlock}>
            <View style={styles.dateCol}>
              <Text style={styles.dateTypeLabel}>CHECK-IN</Text>
              <Text style={styles.dateMain}>{checkIn}</Text>
              <Text style={styles.dateSub}>From 2:00 PM</Text>
            </View>

            <View style={styles.nightsPill}>
              <Ionicons name="moon-outline" size={14} color={theme.colors.goldDark} />
              <Text style={styles.nightsPillText}>
                {booking.nights || 1} {(booking.nights || 1) === 1 ? 'Night' : 'Nights'}
              </Text>
            </View>

            <View style={styles.dateCol}>
              <Text style={styles.dateTypeLabel}>CHECK-OUT</Text>
              <Text style={styles.dateMain}>{checkOut}</Text>
              <Text style={styles.dateSub}>By 11:00 AM</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Guests</Text>
            <Text style={styles.infoValue}>
              {booking.guests || 1} {(booking.guests || 1) === 1 ? 'Guest' : 'Guests'}
            </Text>
          </View>
        </View>

        {/* Guest Information (Admin view) */}
        {isAdmin && booking.userId && (
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Guest Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{booking.userId.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{booking.userId.email}</Text>
            </View>
            {booking.userId.phone ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{booking.userId.phone}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Special Requests */}
        {booking.specialRequests ? (
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Special Requests</Text>
            <Text style={styles.specialRequestsText}>{booking.specialRequests}</Text>
          </View>
        ) : null}

        {/* Billing & Rate Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Payment Summary</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Accommodation Cost</Text>
            <Text style={[styles.infoValue, { color: theme.colors.primary, fontSize: 16 }]}>
              Rs. {(booking.totalPrice || 0).toLocaleString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Taxes & Fees</Text>
            <Text style={[styles.infoValue, { color: '#059669' }]}>Included</Text>
          </View>
        </View>

        {/* Actions Bar */}
        {canEdit && (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('BookingForm', { booking })}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.editBtnText}>Modify Dates or Room</Text>
          </TouchableOpacity>
        )}

        {isAdmin && booking.status === 'Pending' && (
          <View style={styles.adminActionRow}>
            <TouchableOpacity
              style={[styles.adminBtn, styles.approveBtn]}
              onPress={handleApprove}
              disabled={actionLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
              <Text style={styles.adminBtnText}>Approve Reservation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adminBtn, styles.rejectBtn]}
              onPress={handleReject}
              disabled={actionLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle-outline" size={18} color="#FFF" />
              <Text style={styles.adminBtnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}

        {isCancellable && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            disabled={actionLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.cancelBtnText}>Cancel Reservation</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statusBanner: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  statusBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  refCode: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  roomImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 10,
  },
  roomInfoBox: {
    marginTop: 2,
  },
  roomTypeTag: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.goldDark,
    textTransform: 'uppercase',
  },
  roomNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  dateBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  dateCol: {
    flex: 1,
  },
  dateTypeLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dateMain: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  dateSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  nightsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.goldLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 8,
    gap: 4,
  },
  nightsPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.goldDark,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  infoLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  specialRequestsText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  editBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 6,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  adminActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  adminBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 6,
  },
  approveBtn: {
    backgroundColor: '#059669',
  },
  rejectBtn: {
    backgroundColor: '#DC2626',
  },
  adminBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 13,
    borderRadius: 12,
  },
  cancelBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
});