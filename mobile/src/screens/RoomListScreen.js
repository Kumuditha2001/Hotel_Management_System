import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

const FILTER_TYPES = ['All', 'Deluxe', 'Executive Suite', 'Suite', 'Presidential Suite', 'Single', 'Double'];

export default function RoomListScreen({ navigation }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRooms = async () => {
    try {
      setError('');
      const response = await api.get('/rooms');
      setRooms(response.data.rooms || []);
    } catch (err) {
      setError('Unable to load rooms. Pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchRooms);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesType =
        selectedType === 'All' ||
        (room.roomType && room.roomType.toLowerCase().includes(selectedType.toLowerCase()));
      const matchesSearch =
        !searchQuery.trim() ||
        (room.roomNumber && room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (room.roomType && room.roomType.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (room.description && room.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesType && matchesSearch;
    });
  }, [rooms, selectedType, searchQuery]);

  const renderRoom = ({ item }) => {
    const nightlyPrice =
      item.pricePerNight ||
      (item.pricePerMonth ? Math.round(item.pricePerMonth / 30) : 0);
    const isAvailable = item.availabilityStatus === 'Available';
    const displayImage =
      item.images?.[0] ||
      item.image ||
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('RoomDetail', { room: item })}
        activeOpacity={0.8}
      >
        <View style={styles.imageWrapper}>
          <Image source={{ uri: displayImage }} style={styles.cardImage} />
          {/* Availability Pill on image */}
          <View
            style={[
              styles.imageBadge,
              isAvailable ? styles.imageBadgeAvailable : styles.imageBadgeFull,
            ]}
          >
            <Text
              style={[
                styles.imageBadgeText,
                isAvailable ? { color: '#047857' } : { color: '#B91C1C' },
              ]}
            >
              {item.availabilityStatus}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.roomTypeTag}>{item.roomType}</Text>
              <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>Rs. {nightlyPrice.toLocaleString()}</Text>
              <Text style={styles.perNightText}>per night</Text>
            </View>
          </View>

          {item.description ? (
            <Text style={styles.roomDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          <View style={styles.cardFooter}>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={15} color={theme.colors.textSecondary} />
                <Text style={styles.metaText}>Up to {item.capacity} Guests</Text>
              </View>

              {item.amenities && item.amenities.length > 0 && (
                <View style={[styles.metaItem, { marginLeft: 12 }]}>
                  <Ionicons name="wifi-outline" size={15} color={theme.colors.textSecondary} />
                  <Text style={styles.metaText}>{item.amenities[0]}</Text>
                </View>
              )}
            </View>

            <View style={styles.viewButton}>
              <Text style={styles.viewButtonText}>Details</Text>
              <Ionicons name="chevron-forward" size={14} color={theme.colors.goldDark} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.gold} />
        <Text style={styles.loadingText}>Fetching luxury suites...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Rooms & Suites</Text>
          <Text style={styles.subtitle}>Curated sanctuaries for your stay</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('RoomForm')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#FFF" />
            <Text style={styles.addButtonText}>Add Room</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search room number, type, or features..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Chips Scroll */}
      <View style={styles.filterWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_TYPES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedType === item && styles.filterChipActive,
              ]}
              onPress={() => setSelectedType(item)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedType === item && styles.filterChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item._id}
        renderItem={renderRoom}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.gold} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bed-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No Suites Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedType !== 'All'
                ? 'Try adjusting your search or filter criteria.'
                : 'No rooms are listed yet.'}
            </Text>
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
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  filterWrapper: {
    backgroundColor: theme.colors.background,
    paddingVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  imageWrapper: {
    position: 'relative',
    height: 170,
    width: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageBadgeAvailable: {
    backgroundColor: 'rgba(236, 253, 245, 0.95)',
  },
  imageBadgeFull: {
    backgroundColor: 'rgba(254, 242, 242, 0.95)',
  },
  imageBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardBody: {
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roomTypeTag: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.goldDark,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  roomNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  perNightText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  roomDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.goldDark,
    marginRight: 2,
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
  emptyText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  errorText: {
    color: '#B91C1C',
    textAlign: 'center',
    padding: 8,
    fontSize: 13,
  },
});