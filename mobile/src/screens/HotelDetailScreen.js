import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

export default function HotelDetailScreen({ navigation }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHotel = async () => {
    try {
      const response = await api.get('/hotel');
      setHotel(response.data.hotel);
    } catch (error) {
      console.log('Failed to fetch hotel details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHotel();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchHotel);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHotel();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.gold} />
        <Text style={styles.loadingText}>Loading hotel sanctuary...</Text>
      </View>
    );
  }

  const hotelData = hotel || {
    name: 'The Grand Azure Palace & Spa',
    tagline: 'Where Timeless Elegance Meets Sublime Luxury',
    description:
      'Nestled amidst breathtaking panoramic views, The Grand Azure Palace offers an unparalleled five-star sanctuary. Experience bespoke hospitality, Michelin-inspired dining, and a world-class wellness spa.',
    starRating: 5,
    address: '742 Ocean Crest Boulevard, Coastal Bay',
    city: 'Colombo',
    country: 'Sri Lanka',
    phone: '+94 11 234 5678',
    email: 'concierge@grandazurepalace.com',
    checkInTime: '02:00 PM',
    checkOutTime: '11:00 AM',
    heroImage:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    amenities: [
      { name: 'Infinity Pool & Cabanas', description: 'Heated oceanfront pool with private butler cabana service.', icon: 'water-outline' },
      { name: 'Luxe Spa & Thermal Baths', description: 'Holistic treatments, sauna, and hydrotherapy.', icon: 'sparkles-outline' },
      { name: 'Signature Fine Dining', description: 'Contemporary culinary experiences led by award-winning chefs.', icon: 'restaurant-outline' },
      { name: '24/7 Royal Concierge', description: 'Personalized excursion planning, chauffeur, and room service.', icon: 'shield-checkmark-outline' },
      { name: 'Fitness & Wellness Studio', description: 'State-of-the-art TechnoGym equipment and yoga pavilion.', icon: 'fitness-outline' },
      { name: 'Executive Cocktail Lounge', description: 'Sunset cocktails, vintage cellar, and live jazz.', icon: 'wine-outline' },
    ],
    policies: {
      cancellation: 'Free cancellation up to 48 hours prior to scheduled check-in.',
      checkInRequirements: 'Government-issued photo identification required upon arrival.',
    },
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.gold} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: hotelData.heroImage }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroOverlay}>
            <View style={styles.starsRow}>
              {[...Array(hotelData.starRating || 5)].map((_, i) => (
                <Ionicons key={i} name="star" size={18} color="#FFD700" style={{ marginHorizontal: 1 }} />
              ))}
              <Text style={styles.starBadgeText}>5-STAR LUXURY</Text>
            </View>
            <Text style={styles.heroTitle}>{hotelData.name}</Text>
            <Text style={styles.heroTagline}>{hotelData.tagline}</Text>
          </View>

          {isAdmin && (
            <TouchableOpacity
              style={styles.adminEditBadge}
              onPress={() => navigation.navigate('EditHotel', { hotel: hotelData })}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={14} color="#FFF" />
              <Text style={styles.adminEditText}>Edit Info</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Info Bar */}
        <View style={styles.quickInfoBar}>
          <View style={styles.infoCol}>
            <Ionicons name="time-outline" size={18} color={theme.colors.gold} />
            <Text style={styles.infoLabel}>Check-in</Text>
            <Text style={styles.infoVal}>{hotelData.checkInTime}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoCol}>
            <Ionicons name="exit-outline" size={18} color={theme.colors.gold} />
            <Text style={styles.infoLabel}>Check-out</Text>
            <Text style={styles.infoVal}>{hotelData.checkOutTime}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoCol}>
            <Ionicons name="location-outline" size={18} color={theme.colors.gold} />
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoVal} numberOfLines={1}>
              {hotelData.city || 'Coastal Bay'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionPadding}>
          {/* About Section */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.goldLine} />
              <Text style={styles.sectionTitle}>About The Hotel</Text>
            </View>
            <Text style={styles.descriptionText}>{hotelData.description}</Text>
          </View>

          {/* Amenities & Experiences */}
          <View style={[styles.card, { marginTop: 16 }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.goldLine} />
              <Text style={styles.sectionTitle}>Curated Amenities</Text>
            </View>
            <View style={styles.amenitiesGrid}>
              {(hotelData.amenities || []).map((amenity, idx) => (
                <View key={idx} style={styles.amenityItem}>
                  <View style={styles.amenityIconCircle}>
                    <Ionicons
                      name={amenity.icon || 'checkmark-circle-outline'}
                      size={20}
                      color={theme.colors.goldDark}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.amenityName}>{amenity.name}</Text>
                    {amenity.description ? (
                      <Text style={styles.amenityDesc}>{amenity.description}</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Location & Concierge Card */}
          <View style={[styles.card, { marginTop: 16 }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.goldLine} />
              <Text style={styles.sectionTitle}>Location & Concierge</Text>
            </View>

            <View style={styles.contactRow}>
              <Ionicons name="map-outline" size={18} color={theme.colors.goldDark} style={styles.contactIcon} />
              <Text style={styles.contactText}>
                {hotelData.address}, {hotelData.city}, {hotelData.country}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => Linking.openURL(`tel:${hotelData.phone}`)}
              activeOpacity={0.7}
            >
              <Ionicons name="call-outline" size={18} color={theme.colors.goldDark} style={styles.contactIcon} />
              <Text style={[styles.contactText, { color: theme.colors.goldDark, fontWeight: '600' }]}>
                {hotelData.phone}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => Linking.openURL(`mailto:${hotelData.email}`)}
              activeOpacity={0.7}
            >
              <Ionicons name="mail-outline" size={18} color={theme.colors.goldDark} style={styles.contactIcon} />
              <Text style={[styles.contactText, { color: theme.colors.goldDark, fontWeight: '600' }]}>
                {hotelData.email}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Policies Card */}
          <View style={[styles.card, { marginTop: 16, marginBottom: 24 }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.goldLine} />
              <Text style={styles.sectionTitle}>Hotel Policies</Text>
            </View>
            <View style={styles.policyRow}>
              <Ionicons name="shield-outline" size={16} color={theme.colors.success} style={{ marginRight: 8 }} />
              <Text style={styles.policyText}>
                {hotelData.policies?.cancellation || 'Free cancellation up to 48 hours prior to check-in.'}
              </Text>
            </View>
            <View style={styles.policyRow}>
              <Ionicons name="card-outline" size={16} color={theme.colors.goldDark} style={{ marginRight: 8 }} />
              <Text style={styles.policyText}>
                {hotelData.policies?.checkInRequirements || 'Government-issued ID required upon check-in.'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate('RoomList')}
          activeOpacity={0.85}
        >
          <Text style={styles.exploreButtonText}>Browse & Reserve Rooms</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
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
    paddingBottom: 90,
  },
  heroContainer: {
    position: 'relative',
    height: 320,
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  starBadgeText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  heroTagline: {
    fontSize: 14,
    color: '#E2E8F0',
    marginTop: 4,
    fontStyle: 'italic',
  },
  adminEditBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.gold,
  },
  adminEditText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  quickInfoBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    elevation: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.borderGold,
  },
  infoCol: {
    flex: 1,
    alignItems: 'center',
  },
  infoDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    height: '80%',
    alignSelf: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  sectionPadding: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  goldLine: {
    width: 4,
    height: 18,
    backgroundColor: theme.colors.gold,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: 0.2,
  },
  descriptionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  amenitiesGrid: {
    marginTop: 4,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  amenityIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.goldLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  amenityName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  amenityDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactIcon: {
    marginRight: 10,
    width: 22,
  },
  contactText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  policyText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  exploreButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
