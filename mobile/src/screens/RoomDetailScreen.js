import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function RoomDetailScreen({ navigation, route }) {
  const { room } = route.params;
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const nightlyPrice =
    room.pricePerNight ||
    (room.pricePerMonth ? Math.round(room.pricePerMonth / 30) : 0);
  const isAvailable = room.availabilityStatus === 'Available';
  const displayImage =
    room.images?.[0] ||
    room.image ||
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80';

  const defaultAmenities = [
    { name: 'High-speed Wi-Fi', icon: 'wifi-outline' },
    { name: 'Air Conditioning & Climate Control', icon: 'snow-outline' },
    { name: 'Smart Flat-screen TV', icon: 'tv-outline' },
    { name: 'En-suite Luxury Bath & Toiletries', icon: 'sparkles-outline' },
    { name: '24/7 Room Service & Butler', icon: 'restaurant-outline' },
    { name: 'Premium Coffee & Minibar', icon: 'cafe-outline' },
  ];

  const amenitiesList =
    room.amenities && room.amenities.length > 0
      ? room.amenities.map((a) => (typeof a === 'string' ? { name: a, icon: 'checkmark-circle-outline' } : a))
      : defaultAmenities;

  const handleBookRoom = () => {
    navigation.navigate('BookingForm', { room });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: displayImage }} style={styles.heroImage} resizeMode="cover" />
          <View
            style={[
              styles.statusBadge,
              isAvailable ? styles.statusBadgeAvailable : styles.statusBadgeFull,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                isAvailable ? { color: '#047857' } : { color: '#B91C1C' },
              ]}
            >
              {room.availabilityStatus}
            </Text>
          </View>
        </View>

        <View style={styles.contentPadding}>
          {/* Header & Pricing */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.roomTypeTag}>{room.roomType}</Text>
              <Text style={styles.roomTitle}>Room {room.roomNumber}</Text>
            </View>

            <View style={styles.priceBox}>
              <Text style={styles.priceAmount}>Rs. {nightlyPrice.toLocaleString()}</Text>
              <Text style={styles.pricePeriod}>per night</Text>
            </View>
          </View>

          {/* Quick Specifications Bar */}
          <View style={styles.specsBar}>
            <View style={styles.specItem}>
              <Ionicons name="people-outline" size={20} color={theme.colors.goldDark} />
              <Text style={styles.specVal}>{room.capacity} Guests</Text>
              <Text style={styles.specLabel}>Max Capacity</Text>
            </View>

            <View style={styles.specDivider} />

            <View style={styles.specItem}>
              <Ionicons name="bed-outline" size={20} color={theme.colors.goldDark} />
              <Text style={styles.specVal}>{room.roomType}</Text>
              <Text style={styles.specLabel}>Room Category</Text>
            </View>

            <View style={styles.specDivider} />

            <View style={styles.specItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.goldDark} />
              <Text style={styles.specVal}>
                {room.currentOccupancy || 0}/{room.capacity}
              </Text>
              <Text style={styles.specLabel}>Occupied</Text>
            </View>
          </View>

          {/* Room Description */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.goldLine} />
              <Text style={styles.sectionTitle}>Suite Overview</Text>
            </View>
            <Text style={styles.descriptionText}>
              {room.description ||
                'Immerse yourself in elevated luxury. This meticulously appointed suite features plush bedding, refined decor, ambient lighting, and bespoke fixtures designed to offer guests an extraordinary hotel experience.'}
            </Text>
          </View>

          {/* Amenities & Comforts */}
          <View style={[styles.sectionCard, { marginTop: 14 }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.goldLine} />
              <Text style={styles.sectionTitle}>Suite Amenities</Text>
            </View>
            <View style={styles.amenitiesList}>
              {amenitiesList.map((item, idx) => (
                <View key={idx} style={styles.amenityRow}>
                  <View style={styles.amenityIconCircle}>
                    <Ionicons
                      name={item.icon || 'checkmark-circle-outline'}
                      size={18}
                      color={theme.colors.goldDark}
                    />
                  </View>
                  <Text style={styles.amenityText}>{item.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Admin Edit Shortcut */}
          {isAdmin && (
            <TouchableOpacity
              style={styles.adminEditBtn}
              onPress={() => navigation.navigate('RoomForm', { room })}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.adminEditBtnText}>Edit Suite Details & Pricing</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Reservation CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Total Nightly Rate</Text>
          <Text style={styles.bottomPriceVal}>
            Rs. {nightlyPrice.toLocaleString()}
            <Text style={styles.bottomPerNight}> / night</Text>
          </Text>
        </View>

        {isAvailable ? (
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookRoom}
            activeOpacity={0.85}
          >
            <Text style={styles.bookButtonText}>Reserve Room</Text>
            <Ionicons name="calendar-outline" size={18} color="#FFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        ) : (
          <View style={styles.fullButton}>
            <Text style={styles.fullButtonText}>Fully Booked</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  imageContainer: {
    position: 'relative',
    height: 280,
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusBadgeAvailable: {
    backgroundColor: 'rgba(236, 253, 245, 0.95)',
  },
  statusBadgeFull: {
    backgroundColor: 'rgba(254, 242, 242, 0.95)',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  contentPadding: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  roomTypeTag: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.goldDark,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  roomTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  priceBox: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  pricePeriod: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  specsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.colors.borderGold,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
  },
  specVal: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  specLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  specDivider: {
    width: 1,
    height: '75%',
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  goldLine: {
    width: 4,
    height: 16,
    backgroundColor: theme.colors.gold,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  descriptionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  amenitiesList: {
    marginTop: 4,
  },
  amenityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  amenityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.goldLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  amenityText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  adminEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 16,
  },
  adminEditBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
    marginLeft: 6,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  bottomPriceVal: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  bottomPerNight: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  fullButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  fullButtonText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
});