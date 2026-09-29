import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { theme } from '../theme/theme';

export default function AdminDashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setData(response.data);
    } catch (error) {
      console.log('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchDashboard);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const handleLogout = () => {
    setProfileModalVisible(false);
    Alert.alert('Sign Out', 'Are you sure you want to log out of your session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const getInitials = () => {
    if (!user?.name) return 'AD';
    const parts = user.name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return user.name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.gold} />
        <Text style={styles.loadingText}>Compiling business intelligence...</Text>
      </View>
    );
  }

  const stats = data?.stats || {};
  const recentBookings = data?.recentBookings || [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.gold} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Executive Header Banner */}
        <View style={styles.headerBanner}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <View style={styles.crownRow}>
                <Ionicons name="shield-checkmark" size={16} color={theme.colors.gold} />
                <Text style={styles.headerSub}>MANAGEMENT SUITE</Text>
              </View>
              <Text style={styles.headerTitle}>Hotel Business Overview</Text>
              <Text style={styles.headerDesc}>
                Real-time analytics, revenue performance, and operations
              </Text>
            </View>

            {/* Profile Avatar Button */}
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => setProfileModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>{getInitials()}</Text>
              </View>
              <View style={styles.statusDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Revenue Highlight Card */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <Text style={styles.revenueLabel}>ESTIMATED REVENUE</Text>
            <View style={styles.revenueBadge}>
              <Ionicons name="trending-up" size={14} color="#10B981" />
              <Text style={styles.revenueBadgeText}>Live</Text>
            </View>
          </View>
          <Text style={styles.revenueAmount}>
            Rs. {(stats.totalRevenue || 0).toLocaleString()}
          </Text>
          <Text style={styles.revenueFootnote}>
            Based on confirmed and completed guest reservations
          </Text>
        </View>

        {/* 2x2 Key Metric Grid */}
        <View style={styles.gridRow}>
          {/* Occupancy Card */}
          <View style={styles.gridCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="bed-outline" size={20} color="#2563EB" />
            </View>
            <Text style={styles.metricVal}>{stats.occupancyRate || 0}%</Text>
            <Text style={styles.metricLabel}>Occupancy Rate</Text>
            <Text style={styles.metricSub}>
              {stats.occupiedRooms || 0} / {stats.totalRooms || 0} Rooms Occupied
            </Text>
          </View>

          {/* Pending Reservations Card */}
          <TouchableOpacity
            style={[styles.gridCard, (stats.pendingBookings || 0) > 0 && styles.pendingHighlightCard]}
            onPress={() => navigation.navigate('MyBookings')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="alert-circle-outline" size={20} color="#D97706" />
            </View>
            <Text style={[styles.metricVal, { color: '#D97706' }]}>
              {stats.pendingBookings || 0}
            </Text>
            <Text style={styles.metricLabel}>Pending Action</Text>
            <Text style={styles.metricSub}>Tap to review bookings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridRow}>
          {/* Total Bookings */}
          <View style={styles.gridCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="calendar-outline" size={20} color="#059669" />
            </View>
            <Text style={styles.metricVal}>{stats.totalBookings || 0}</Text>
            <Text style={styles.metricLabel}>Total Bookings</Text>
            <Text style={styles.metricSub}>
              {stats.approvedBookings || 0} Approved • {stats.cancelledBookings || 0} Cancelled
            </Text>
          </View>

          {/* Hotel Staff & Guests */}
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('StaffManagement')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FDF4FF' }]}>
              <Ionicons name="people-outline" size={20} color="#9333EA" />
            </View>
            <Text style={styles.metricVal}>{stats.totalStaff || 0}</Text>
            <Text style={styles.metricLabel}>Staff & Admins</Text>
            <Text style={styles.metricSub}>Manage staff accounts</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Management Shortcuts */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Operations & Management</Text>
            <TouchableOpacity
              style={styles.headerAddBtn}
              onPress={() => navigation.navigate('RoomForm')}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={16} color={theme.colors.goldDark} />
              <Text style={styles.headerAddBtnText}>+ Add Room</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionsList}>
            {/* Add New Room / Suite */}
            <TouchableOpacity
              style={[styles.actionRow, { backgroundColor: '#F8FAFC' }]}
              onPress={() => navigation.navigate('RoomForm')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="add" size={22} color={theme.colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, { color: theme.colors.goldDark, fontWeight: '800' }]}>
                  + Add New Suite / Room
                </Text>
                <Text style={styles.actionSubtitle}>
                  Create suite, upload photos, set price per night & amenities
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.goldDark} />
            </TouchableOpacity>

            {/* Manage Staff */}
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => navigation.navigate('StaffManagement')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: theme.colors.goldLight }]}>
                <Ionicons name="people" size={20} color={theme.colors.goldDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Team & Staff Management</Text>
                <Text style={styles.actionSubtitle}>Add or remove staff & administrator roles</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>

            {/* Manage Reservations */}
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => navigation.navigate('MyBookings')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="receipt-outline" size={20} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>All Guest Reservations</Text>
                <Text style={styles.actionSubtitle}>
                  Approve, reject, or audit booking history
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>

            {/* Manage Rooms */}
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => navigation.navigate('RoomList')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="key-outline" size={20} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Room Inventory & Pricing</Text>
                <Text style={styles.actionSubtitle}>Add, edit, or adjust suites and nightly rates</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>

            {/* Edit Hotel Information */}
            <TouchableOpacity
              style={[styles.actionRow, { borderBottomWidth: 0 }]}
              onPress={() => navigation.navigate('EditHotel')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#F8FAFC' }]}>
                <Ionicons name="business-outline" size={20} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Edit Hotel Sanctuary Details</Text>
                <Text style={styles.actionSubtitle}>
                  Name, description, address, contacts, and check-in times
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Reservations Feed */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Reservations</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyBookings')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentBookings.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No reservations recorded yet</Text>
            </View>
          ) : (
            recentBookings.map((b) => (
              <TouchableOpacity
                key={b._id}
                style={styles.bookingCard}
                onPress={() => navigation.navigate('BookingDetail', { bookingId: b._id })}
                activeOpacity={0.7}
              >
                <View style={styles.bookingHeaderRow}>
                  <Text style={styles.bookingRoom}>
                    Room {b.roomId?.roomNumber || 'N/A'} • {b.roomId?.roomType || 'Suite'}
                  </Text>
                  <View
                    style={[
                      styles.statusPill,
                      b.status === 'Approved' && styles.statusApproved,
                      b.status === 'Pending' && styles.statusPending,
                      b.status === 'Cancelled' && styles.statusCancelled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        b.status === 'Approved' && { color: '#047857' },
                        b.status === 'Pending' && { color: '#B45309' },
                        b.status === 'Cancelled' && { color: '#B91C1C' },
                      ]}
                    >
                      {b.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.guestInfo}>
                  Guest: {b.userId?.name || 'Unknown'} ({b.userId?.email || 'No email'})
                </Text>
                <Text style={styles.dateSub}>
                  {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                  {b.totalPrice ? ` • Rs. ${b.totalPrice.toLocaleString()}` : ''}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Admin Profile & Logout Modal */}
      <Modal
        visible={profileModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setProfileModalVisible(false)}
        >
          <Pressable style={styles.profileModalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.profileModalHeader}>
              <Text style={styles.modalTitle}>Admin Account</Text>
              <TouchableOpacity
                onPress={() => setProfileModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalUserInfo}>
              <View style={styles.modalAvatarCircle}>
                <Text style={styles.modalAvatarText}>{getInitials()}</Text>
              </View>
              <Text style={styles.modalUserName}>{user?.name || 'Administrator'}</Text>
              <Text style={styles.modalUserEmail}>{user?.email || 'admin@hotel.com'}</Text>

              <View style={styles.rolePillAdmin}>
                <Ionicons name="shield-checkmark" size={12} color="#B45309" style={{ marginRight: 4 }} />
                <Text style={styles.roleTextAdmin}>HOTEL ADMINISTRATOR</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalActionItem}
                onPress={() => {
                  setProfileModalVisible(false);
                  navigation.navigate('Home');
                }}
              >
                <Ionicons name="home-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.modalActionText}>Return to Sanctuary Home</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalActionItem}
                onPress={() => {
                  setProfileModalVisible(false);
                  navigation.navigate('MyBookings');
                }}
              >
                <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.modalActionText}>Review All Guest Bookings</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalActionItem}
                onPress={() => {
                  setProfileModalVisible(false);
                  navigation.navigate('RoomForm');
                }}
              >
                <Ionicons name="add-circle-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.modalActionText}>Add New Room / Suite</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalLogoutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={18} color="#DC2626" style={{ marginRight: 8 }} />
              <Text style={styles.modalLogoutText}>Sign Out of Session</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerBanner: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
  },
  crownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 11,
    color: theme.colors.gold,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginLeft: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerDesc: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  revenueCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.borderGold,
    elevation: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
  },
  revenueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  revenueBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#047857',
    marginLeft: 3,
  },
  revenueAmount: {
    fontSize: 30,
    fontWeight: '800',
    color: theme.colors.primary,
    marginTop: 8,
  },
  revenueFootnote: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  gridRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 12,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  pendingHighlightCard: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFDF5',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  metricSub: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: 0.2,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 13,
    color: theme.colors.goldDark,
    fontWeight: '700',
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.goldLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: theme.colors.borderGold,
  },
  headerAddBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.goldDark,
  },
  actionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  actionSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 1,
  },
  bookingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookingRoom: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  statusApproved: { backgroundColor: '#ECFDF5' },
  statusPending: { backgroundColor: '#FFFBEB' },
  statusCancelled: { backgroundColor: '#FEF2F2' },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  guestInfo: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  dateSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  avatarButton: {
    position: 'relative',
    padding: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#FFD700',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  profileModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalUserInfo: {
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  modalAvatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    borderWidth: 3,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalAvatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFD700',
  },
  modalUserName: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  modalUserEmail: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  rolePillAdmin: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginTop: 10,
  },
  roleTextAdmin: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  modalActions: {
    paddingVertical: 12,
  },
  modalActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  modalActionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginLeft: 12,
  },
  modalLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  modalLogoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
});
