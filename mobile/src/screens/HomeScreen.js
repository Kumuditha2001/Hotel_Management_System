import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { theme } from '../theme/theme';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff' || isAdmin;

  const [hotel, setHotel] = useState(null);
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const loadData = async () => {
    try {
      const [hotelRes, roomsRes] = await Promise.all([
        api.get('/hotel').catch(() => null),
        api.get('/rooms').catch(() => null),
      ]);
      if (hotelRes?.data?.hotel) setHotel(hotelRes.data.hotel);
      if (roomsRes?.data?.rooms) setFeaturedRooms(roomsRes.data.rooms.slice(0, 4));
    } catch (err) {
      console.log('Home load data error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = () => {
    setProfileModalVisible(false);
    Alert.alert('Sign Out', 'Are you sure you want to log out of your session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const hotelName = hotel?.name || 'The Grand Azure Palace';
  const hotelTagline = hotel?.tagline || 'Experience Luxury & Serenity Beyond Compare';

  // Compute initials for profile avatar
  const getInitials = () => {
    if (!user?.name) return 'VIP';
    const parts = user.name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.gold} />
        }
      >
        {/* Luxury Header Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.topRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <View style={styles.starBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.starBadgeText}>5-STAR LUXURY RESORT</Text>
              </View>
              <Text style={styles.brandTitle} numberOfLines={1}>
                {hotelName}
              </Text>
            </View>

            {/* Profile Avatar Button (Top-Right) */}
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => setProfileModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>{getInitials()}</Text>
              </View>
              <View
                style={[
                  styles.statusDot,
                  isAdmin ? { backgroundColor: '#FFD700' } : { backgroundColor: '#10B981' },
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hotel Sanctuary Highlight Tile */}
        <TouchableOpacity
          style={styles.hotelHighlightCard}
          onPress={() => navigation.navigate('HotelDetail')}
          activeOpacity={0.88}
        >
          <Image
            source={{
              uri:
                hotel?.heroImage ||
                'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80',
            }}
            style={styles.highlightImage}
          />
          <View style={styles.highlightOverlay}>
            <View style={styles.highlightBadge}>
              <Ionicons name="sparkles" size={11} color={theme.colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.highlightBadgeText}>EXCLUSIVE HOTEL SANCTUARY</Text>
            </View>
            <Text style={styles.highlightTitle}>Welcome to {hotelName}</Text>
            <Text style={styles.highlightSub}>{hotelTagline}</Text>
            <View style={styles.highlightLinkRow}>
              <Text style={styles.highlightLinkText}>Explore Story, Dining & Spa</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFD700" style={{ marginLeft: 6 }} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Primary Action Hub */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guest & Booking Services</Text>

          <View style={styles.actionGrid}>
            {/* Rooms */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('RoomList')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="bed-outline" size={24} color="#2563EB" />
              </View>
              <Text style={styles.actionCardTitle}>Rooms & Suites</Text>
              <Text style={styles.actionCardDesc}>Browse luxury rooms & rates</Text>
            </TouchableOpacity>

            {/* Bookings */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('MyBookings')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="calendar-outline" size={24} color="#059669" />
              </View>
              <Text style={styles.actionCardTitle}>
                {isAdmin ? 'All Bookings' : 'My Reservations'}
              </Text>
              <Text style={styles.actionCardDesc}>
                {isAdmin ? 'Manage guest requests' : 'Track or cancel your stay'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Admin Management Section (If Admin/Staff) */}
        {isStaff && (
          <View style={styles.section}>
            <View style={styles.adminSectionHeader}>
              <Ionicons name="shield-checkmark" size={18} color={theme.colors.goldDark} />
              <Text style={styles.adminSectionTitle}>Management Operations</Text>
            </View>

            <View style={styles.adminCardsContainer}>
              {/* Executive Business Dashboard */}
              <TouchableOpacity
                style={styles.adminActionCard}
                onPress={() => navigation.navigate('AdminDashboard')}
                activeOpacity={0.7}
              >
                <View style={[styles.adminIconBox, { backgroundColor: theme.colors.primary }]}>
                  <Ionicons name="bar-chart" size={20} color={theme.colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adminCardTitle}>Business Dashboard & Analytics</Text>
                  <Text style={styles.adminCardDesc}>
                    Revenue, occupancy rate, and operational KPIs
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>

              {/* Add New Room / Suite (Admin only) */}
              {isAdmin && (
                <TouchableOpacity
                  style={styles.adminActionCard}
                  onPress={() => navigation.navigate('RoomForm')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.adminIconBox, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="add-circle" size={20} color="#2563EB" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.adminCardTitle, { color: '#2563EB', fontWeight: '800' }]}>
                      + Add New Suite / Room
                    </Text>
                    <Text style={styles.adminCardDesc}>
                      Publish room details, rates, capacity, and Cloudinary photos
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
              )}

              {/* Staff Management (Admin only) */}
              {isAdmin && (
                <TouchableOpacity
                  style={styles.adminActionCard}
                  onPress={() => navigation.navigate('StaffManagement')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.adminIconBox, { backgroundColor: '#FDF4FF' }]}>
                    <Ionicons name="people" size={20} color="#9333EA" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.adminCardTitle}>Staff & Team Management</Text>
                    <Text style={styles.adminCardDesc}>
                      Create, update roles, or delete staff members
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
              )}

              {/* Edit Hotel Information */}
              {isAdmin && (
                <TouchableOpacity
                  style={[styles.adminActionCard, { borderBottomWidth: 0 }]}
                  onPress={() => navigation.navigate('EditHotel')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.adminIconBox, { backgroundColor: '#FFFBEB' }]}>
                    <Ionicons name="business" size={20} color="#D97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.adminCardTitle}>Edit Hotel Sanctuary Details</Text>
                    <Text style={styles.adminCardDesc}>
                      Public story, contact info, and policies
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Featured Rooms Showcase */}
        {featuredRooms.length > 0 && (
          <View style={styles.section}>
            <View style={styles.featuredHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Featured Accommodations</Text>
                <Text style={styles.sectionSubtitle}>Handcrafted luxury rooms and ocean villas</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('RoomList')}>
                <Text style={styles.seeAllText}>See All ({featuredRooms.length}+)</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
              {featuredRooms.map((room) => {
                const nightlyRate =
                  room.pricePerNight ||
                  (room.pricePerMonth ? Math.round(room.pricePerMonth / 30) : 0);
                const displayImage =
                  room.images?.[0] ||
                  room.image ||
                  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80';

                return (
                  <TouchableOpacity
                    key={room._id}
                    style={styles.featuredRoomCard}
                    onPress={() => navigation.navigate('RoomDetail', { room })}
                    activeOpacity={0.82}
                  >
                    <Image source={{ uri: displayImage }} style={styles.featuredImage} />
                    <View style={styles.featuredCardContent}>
                      <View style={styles.roomBadgeRow}>
                        <Text style={styles.featuredType}>{room.roomType}</Text>
                        <View
                          style={[
                            styles.miniBadge,
                            room.availabilityStatus === 'Available'
                              ? styles.miniBadgeAvailable
                              : styles.miniBadgeFull,
                          ]}
                        >
                          <Text
                            style={[
                              styles.miniBadgeText,
                              room.availabilityStatus === 'Available'
                                ? { color: '#047857' }
                                : { color: '#B91C1C' },
                            ]}
                          >
                            {room.availabilityStatus}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.featuredRoomNum}>Room {room.roomNumber}</Text>
                      <View style={styles.roomGuestRow}>
                        <Ionicons name="people-outline" size={13} color={theme.colors.textMuted} />
                        <Text style={styles.roomGuestText}>Up to {room.capacity || 2} guests</Text>
                      </View>
                      <Text style={styles.featuredPrice}>
                        Rs. {nightlyRate.toLocaleString()}
                        <Text style={styles.perNightText}> / night</Text>
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Hotel Sanctuary Experience Pillars */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>The Sanctuary Experience</Text>
          <Text style={styles.sectionSubtitle}>
            Indulge in bespoke coastal luxury crafted for timeless memories
          </Text>

          <View style={styles.pillarsGrid}>
            <View style={styles.pillarCard}>
              <View style={[styles.pillarIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="water-outline" size={22} color="#2563EB" />
              </View>
              <Text style={styles.pillarTitle}>Oceanfront Vistas</Text>
              <Text style={styles.pillarDesc}>
                Panoramic Indian Ocean horizons from private sea-facing terraces.
              </Text>
            </View>

            <View style={styles.pillarCard}>
              <View style={[styles.pillarIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="restaurant-outline" size={22} color="#D97706" />
              </View>
              <Text style={styles.pillarTitle}>Gourmet Dining</Text>
              <Text style={styles.pillarDesc}>
                3 signature restaurants blending international fine dining with Ceylon spices.
              </Text>
            </View>

            <View style={styles.pillarCard}>
              <View style={[styles.pillarIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="leaf-outline" size={22} color="#059669" />
              </View>
              <Text style={styles.pillarTitle}>Hydrothermal Spa</Text>
              <Text style={styles.pillarDesc}>
                Ancient Ayurvedic rituals, mineral vitality pools, and rejuvenating steam.
              </Text>
            </View>

            <View style={styles.pillarCard}>
              <View style={[styles.pillarIconCircle, { backgroundColor: '#FDF4FF' }]}>
                <Ionicons name="shield-outline" size={22} color="#9333EA" />
              </View>
              <Text style={styles.pillarTitle}>24/7 Royal Butler</Text>
              <Text style={styles.pillarDesc}>
                Dedicated concierge anticipating every itinerary, transfer, and dining wish.
              </Text>
            </View>
          </View>
        </View>

        {/* Complimentary Guest Privileges Card */}
        <View style={styles.section}>
          <View style={styles.privilegeCard}>
            <View style={styles.privilegeHeader}>
              <Ionicons name="diamond-outline" size={20} color={theme.colors.gold} />
              <Text style={styles.privilegeCardTitle}>Complimentary Resident Privileges</Text>
            </View>
            <Text style={styles.privilegeCardSub}>
              Included with every confirmed reservation at {hotelName}:
            </Text>

            <View style={styles.privilegeList}>
              <View style={styles.privilegeItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.gold} />
                <Text style={styles.privilegeText}>
                  Signature Ceylon chilled towel & welcome vintage champagne
                </Text>
              </View>
              <View style={styles.privilegeItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.gold} />
                <Text style={styles.privilegeText}>
                  Daily artisanal seaside gourmet breakfast buffet
                </Text>
              </View>
              <View style={styles.privilegeItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.gold} />
                <Text style={styles.privilegeText}>
                  Complimentary high-speed fiber Wi-Fi throughout sanctuary grounds
                </Text>
              </View>
              <View style={styles.privilegeItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.gold} />
                <Text style={styles.privilegeText}>
                  Sunset high tea & live acoustic jazz every evening
                </Text>
              </View>
              <View style={styles.privilegeItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.gold} />
                <Text style={styles.privilegeText}>
                  24-Hour complimentary valet parking and concierge luggage handling
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Hotel Details & Concierge Factsheet */}
        <View style={styles.section}>
          <View style={styles.factsheetCard}>
            <Text style={styles.factsheetTitle}>Sanctuary Hours & Concierge</Text>
            <View style={styles.factsheetRow}>
              <View style={styles.factsheetCol}>
                <Text style={styles.factsheetLabel}>CHECK-IN</Text>
                <Text style={styles.factsheetVal}>{hotel?.checkInTime || '02:00 PM'}</Text>
              </View>
              <View style={styles.factsheetDivider} />
              <View style={styles.factsheetCol}>
                <Text style={styles.factsheetLabel}>CHECK-OUT</Text>
                <Text style={styles.factsheetVal}>{hotel?.checkOutTime || '11:00 AM'}</Text>
              </View>
            </View>

            <View style={styles.contactItemRow}>
              <Ionicons name="location-outline" size={16} color={theme.colors.goldDark} />
              <Text style={styles.contactItemText}>
                {hotel?.address ? `${hotel.address}, ${hotel.city || ''}` : 'Galle Face Green, Colombo 03, Sri Lanka'}
              </Text>
            </View>

            <View style={styles.contactItemRow}>
              <Ionicons name="call-outline" size={16} color={theme.colors.goldDark} />
              <Text style={styles.contactItemText}>
                {hotel?.phone || '+94 11 234 5678'} (24/7 Front Desk)
              </Text>
            </View>

            <TouchableOpacity
              style={styles.viewFullHotelBtn}
              onPress={() => navigation.navigate('HotelDetail')}
              activeOpacity={0.8}
            >
              <Text style={styles.viewFullHotelText}>View Full Hotel Story & Policies</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Profile & Account Modal */}
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
            {/* Modal Header */}
            <View style={styles.profileModalHeader}>
              <Text style={styles.modalTitle}>Guest Account</Text>
              <TouchableOpacity
                onPress={() => setProfileModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* User Info Avatar & Role */}
            <View style={styles.modalUserInfo}>
              <View style={styles.modalAvatarCircle}>
                <Text style={styles.modalAvatarText}>{getInitials()}</Text>
              </View>
              <Text style={styles.modalUserName}>{user?.name || 'Valued Guest'}</Text>
              <Text style={styles.modalUserEmail}>{user?.email || 'guest@hotel.com'}</Text>

              <View
                style={[
                  styles.modalRolePill,
                  isAdmin
                    ? styles.rolePillAdmin
                    : isStaff
                    ? styles.rolePillStaff
                    : styles.rolePillGuest,
                ]}
              >
                <Ionicons
                  name={isAdmin ? 'shield-checkmark' : isStaff ? 'briefcase' : 'sparkles'}
                  size={12}
                  color={isAdmin ? '#B45309' : isStaff ? '#1D4ED8' : '#047857'}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.modalRoleText,
                    isAdmin
                      ? { color: '#B45309' }
                      : isStaff
                      ? { color: '#1D4ED8' }
                      : { color: '#047857' },
                  ]}
                >
                  {isAdmin ? 'HOTEL ADMINISTRATOR' : isStaff ? 'STAFF MEMBER' : 'VIP PRIVILEGE GUEST'}
                </Text>
              </View>
            </View>

            {/* Quick Action Links */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalActionItem}
                onPress={() => {
                  setProfileModalVisible(false);
                  navigation.navigate('MyBookings');
                }}
              >
                <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.modalActionText}>
                  {isAdmin ? 'All Guest Bookings' : 'My Reservations & Stays'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>

              {isAdmin && (
                <TouchableOpacity
                  style={styles.modalActionItem}
                  onPress={() => {
                    setProfileModalVisible(false);
                    navigation.navigate('AdminDashboard');
                  }}
                >
                  <Ionicons name="bar-chart-outline" size={18} color={theme.colors.goldDark} />
                  <Text style={styles.modalActionText}>Business Analytics Dashboard</Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.modalActionItem}
                onPress={() => {
                  setProfileModalVisible(false);
                  navigation.navigate('HotelDetail');
                }}
              >
                <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.modalActionText}>About The Hotel & Policies</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Prominent Logout Button */}
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
  scrollContent: {
    paddingBottom: 40,
  },
  heroBanner: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starBadgeText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 4,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
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
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  hotelHighlightCard: {
    marginHorizontal: 16,
    marginTop: -16,
    height: 190,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  highlightImage: {
    width: '100%',
    height: '100%',
  },
  highlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  highlightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  highlightBadgeText: {
    color: theme.colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  highlightSub: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
    fontStyle: 'italic',
  },
  highlightLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  highlightLinkText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '700',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
    marginBottom: 14,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  actionCardDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  adminSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  adminSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginLeft: 6,
  },
  adminCardsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  adminActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  adminIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  adminCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  adminCardDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  featuredHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  seeAllText: {
    fontSize: 13,
    color: theme.colors.goldDark,
    fontWeight: '700',
    marginTop: 2,
  },
  featuredScroll: {
    marginHorizontal: -16,
    paddingLeft: 16,
    marginTop: 8,
  },
  featuredRoomCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  featuredImage: {
    width: '100%',
    height: 125,
  },
  featuredCardContent: {
    padding: 12,
  },
  roomBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredType: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  miniBadgeAvailable: { backgroundColor: '#ECFDF5' },
  miniBadgeFull: { backgroundColor: '#FEF2F2' },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  featuredRoomNum: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  roomGuestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  roomGuestText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  featuredPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.goldDark,
    marginTop: 4,
  },
  perNightText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  pillarCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillarIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  pillarTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  pillarDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 15,
  },
  privilegeCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 18,
    padding: 18,
  },
  privilegeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  privilegeCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  privilegeCardSub: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 4,
    marginBottom: 12,
  },
  privilegeList: {
    gap: 8,
  },
  privilegeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  privilegeText: {
    fontSize: 12,
    color: '#E2E8F0',
    flex: 1,
    lineHeight: 17,
  },
  factsheetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  factsheetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  factsheetRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  factsheetCol: {
    flex: 1,
    alignItems: 'center',
  },
  factsheetDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  factsheetLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  factsheetVal: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  contactItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  contactItemText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  viewFullHotelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 10,
  },
  viewFullHotelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
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
  modalRolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  rolePillAdmin: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  rolePillStaff: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  rolePillGuest: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  modalRoleText: {
    fontSize: 10,
    fontWeight: '800',
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