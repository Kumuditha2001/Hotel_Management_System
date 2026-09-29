import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { theme } from '../theme/theme';

const TABS = ['All', 'Approved', 'Pending', 'Cancelled'];

const STATUS_THEMES = {
  Pending: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  Approved: { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
  Rejected: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' },
  Cancelled: { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' },
};

export default function MyBookingsScreen({ navigation }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data.bookings || []);
    } catch (err) {
      console.log('Failed to load bookings:', err);
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
      Alert.alert('Approved', 'Reservation request has been approved.');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to approve booking');
    }
  };

  const handleReject = async (bookingId) => {
    Alert.alert('Reject Booking', 'Are you sure you want to reject this reservation request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.put(`/bookings/${bookingId}/status`, { status: 'Rejected' });
            fetchBookings();
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to reject booking');
          }
        },
      },
    ]);
  };

  const handleCancel = (bookingId) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation? Room capacity will be released.',
      [
        { text: 'Keep Reservation', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/bookings/${bookingId}`);
              fetchBookings();
              Alert.alert('Cancelled', 'Your reservation has been cancelled.');
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel reservation');
            }
          },
        },
      ]
    );
  };

  const filteredBookings = useMemo(() => {
    if (activeTab === 'All') return bookings;
    return bookings.filter((b) => b.status === activeTab);
  }, [bookings, activeTab]);

  const renderBooking = ({ item }) => {
    const room = item.roomId;
    const roomLabel = room?.roomNumber ? `Room ${room.roomNumber}` : 'Luxury Room';
    const roomType = room?.roomType || 'Suite';
    const statusCfg = STATUS_THEMES[item.status] || STATUS_THEMES.Pending;

    const displayImage =
      room?.images?.[0] ||
      room?.image ||
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80';

    const checkIn = new Date(item.startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const checkOut = new Date(item.endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const isCancellable = item.status === 'Pending' || item.status === 'Approved';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('BookingDetail', { bookingId: item._id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardTopRow}>
          <Image source={{ uri: displayImage }} style={styles.roomThumb} />

          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.roomTypeRow}>
              <Text style={styles.roomTypeTag}>{roomType}</Text>
              <View style={[styles.statusPill, { backgroundColor: statusCfg.bg, borderColor: statusCfg.border }]}>
                <Text style={[styles.statusPillText, { color: statusCfg.text }]}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.roomNumber}>{roomLabel}</Text>

            {isAdmin && item.userId?.name ? (
              <Text style={styles.bookedByText}>
                Guest: <Text style={{ fontWeight: '700' }}>{item.userId.name}</Text>
              </Text>
            ) : null}

            <Text style={styles.datesText}>
              {checkIn} – {checkOut}
            </Text>
          </View>
        </View>

        {/* Pricing & Duration Bar */}
        <View style={styles.cardPriceRow}>
          <View>
            <Text style={styles.durationLabel}>
              {item.nights || 1} {(item.nights || 1) === 1 ? 'Night' : 'Nights'} • {item.guests || 1} {(item.guests || 1) === 1 ? 'Guest' : 'Guests'}
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.totalPriceText}>
              Rs. {(item.totalPrice || 0).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Admin Quick Action Buttons */}
        {isAdmin && item.status === 'Pending' && (
          <View style={styles.adminActionRow}>
            <TouchableOpacity
              style={[styles.adminBtn, styles.approveBtn]}
              onPress={() => handleApprove(item._id)}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
              <Text style={styles.adminBtnText}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adminBtn, styles.rejectBtn]}
              onPress={() => handleReject(item._id)}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle-outline" size={16} color="#FFF" />
              <Text style={styles.adminBtnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cancel Reservation Action */}
        {isCancellable && (
          <TouchableOpacity
            style={styles.cancelLink}
            onPress={() => handleCancel(item._id)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={14} color="#EF4444" style={{ marginRight: 4 }} />
            <Text style={styles.cancelLinkText}>Cancel Reservation</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.gold} />
        <Text style={styles.loadingText}>Retrieving reservations...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{isAdmin ? 'All Guest Reservations' : 'My Reservations'}</Text>
        <Text style={styles.subtitle}>
          {isAdmin ? 'Review and manage guest bookings' : 'Track your luxury stay itineraries'}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item._id}
        renderItem={renderBooking}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.gold} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No Reservations</Text>
            <Text style={styles.emptySub}>
              {activeTab === 'All'
                ? "You haven't made any room reservations yet."
                : `No ${activeTab.toLowerCase()} reservations found.`}
            </Text>
            {!isAdmin && (
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate('RoomList')}
              >
                <Text style={styles.browseButtonText}>Browse Available Rooms</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  tabItemActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 16,
    paddingBottom: 30,
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
  cardTopRow: {
    flexDirection: 'row',
  },
  roomThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  roomTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomTypeTag: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.goldDark,
    textTransform: 'uppercase',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  roomNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  bookedByText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  datesText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  cardPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  durationLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  totalPriceText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  adminActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  adminBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 4,
  },
  approveBtn: {
    backgroundColor: '#059669',
  },
  rejectBtn: {
    backgroundColor: '#DC2626',
  },
  adminBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 6,
  },
  cancelLinkText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 40,
  },
  browseButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 18,
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});