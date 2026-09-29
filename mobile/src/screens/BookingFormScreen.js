import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import { theme } from '../theme/theme';

export default function BookingFormScreen({ navigation, route }) {
  const initialRoom = route.params?.room;
  const editingBooking = route.params?.booking;
  const isEditMode = !!editingBooking;

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(
    isEditMode ? editingBooking.roomId : initialRoom
  );

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [startDate, setStartDate] = useState(
    isEditMode ? new Date(editingBooking.startDate) : new Date()
  );
  const [endDate, setEndDate] = useState(
    isEditMode ? new Date(editingBooking.endDate) : tomorrow
  );
  const [guests, setGuests] = useState(editingBooking?.guests || 1);
  const [specialRequests, setSpecialRequests] = useState(
    editingBooking?.specialRequests || ''
  );

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Fetch rooms list
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get('/rooms');
        setRooms(response.data.rooms || []);
      } catch (err) {
        console.log('Failed to load rooms for booking:', err);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const onChangeStart = (event, date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (date) {
      setStartDate(date);
      // Ensure end date is at least 1 day after start date
      if (date >= endDate) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        setEndDate(nextDay);
      }
    }
  };

  const onChangeEnd = (event, date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (date) {
      if (date <= startDate) {
        Alert.alert('Invalid Date', 'Check-out date must be after check-in date.');
      } else {
        setEndDate(date);
      }
    }
  };

  // Compute nights and pricing with dynamic guest supplement
  const { nights, baseRate, extraGuestFee, nightlyRate, totalPrice, extraGuests } = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.max(0, end.getTime() - start.getTime());
    const countNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const base = selectedRoom
      ? selectedRoom.pricePerNight ||
        (selectedRoom.pricePerMonth ? Math.round(selectedRoom.pricePerMonth / 30) : 0)
      : 0;

    const guestCount = Math.max(1, Number(guests) || 1);
    const extraCount = Math.max(0, guestCount - 1);
    const feePerExtraGuest = Math.max(2000, Math.round(base * 0.2));
    const ratePerNight = base + (extraCount * feePerExtraGuest);
    const total = countNights * ratePerNight;

    return {
      nights: countNights,
      baseRate: base,
      extraGuestFee: feePerExtraGuest,
      extraGuests: extraCount,
      nightlyRate: ratePerNight,
      totalPrice: total,
    };
  }, [startDate, endDate, selectedRoom, guests]);

  const handleSubmit = async () => {
    setServerError('');
    if (!selectedRoom) {
      setServerError('Please select a room to reserve.');
      return;
    }
    if (endDate <= startDate) {
      setServerError('Check-out date must be after check-in date.');
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await api.put(`/bookings/${editingBooking._id}`, {
          roomId: selectedRoom._id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          guests,
          specialRequests,
        });
      } else {
        await api.post('/bookings', {
          roomId: selectedRoom._id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          guests,
          specialRequests,
        });
      }

      Alert.alert(
        'Reservation Submitted',
        isEditMode
          ? 'Your reservation changes have been saved.'
          : 'Your room reservation has been submitted successfully.',
        [{ text: 'View Bookings', onPress: () => navigation.navigate('MyBookings') }]
      );
    } catch (error) {
      setServerError(
        error.response?.data?.message || 'Failed to submit reservation. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Modify Reservation' : 'Room Reservation'}
          </Text>
          <Text style={styles.headerSub}>
            Complete your stay details at The Grand Azure Palace
          </Text>
        </View>

        {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

        {/* Selected Room Selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>ACCOMMODATION SUITE</Text>
          {loadingRooms ? (
            <ActivityIndicator color={theme.colors.gold} style={{ marginVertical: 14 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomScroll}>
              {rooms.map((r) => {
                const isSelected = selectedRoom && selectedRoom._id === r._id;
                const isFull = r.availabilityStatus === 'Full' && !isSelected;
                const rate =
                  r.pricePerNight ||
                  (r.pricePerMonth ? Math.round(r.pricePerMonth / 30) : 0);

                return (
                  <TouchableOpacity
                    key={r._id}
                    style={[
                      styles.roomCard,
                      isSelected && styles.roomCardSelected,
                      isFull && styles.roomCardDisabled,
                    ]}
                    onPress={() => !isFull && setSelectedRoom(r)}
                    disabled={isFull}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.roomCardTitle,
                        isSelected && styles.roomCardTitleSelected,
                      ]}
                    >
                      Room {r.roomNumber}
                    </Text>
                    <Text
                      style={[
                        styles.roomCardType,
                        isSelected && styles.roomCardTypeSelected,
                      ]}
                    >
                      {r.roomType}
                    </Text>
                    <Text
                      style={[
                        styles.roomCardPrice,
                        isSelected && styles.roomCardPriceSelected,
                      ]}
                    >
                      Rs. {rate.toLocaleString()}/nt
                    </Text>
                    <Text
                      style={[
                        styles.roomCardStatus,
                        isFull && { color: '#EF4444' },
                        isSelected && { color: '#FFD700' },
                      ]}
                    >
                      {r.availabilityStatus}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Dates Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>DATES OF STAY</Text>

          {/* Check-in Date */}
          <Text style={styles.fieldLabel}>Check-in Date</Text>
          <TouchableOpacity
            style={styles.datePickerBtn}
            onPress={() => setShowStartPicker(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={18} color={theme.colors.goldDark} />
            <Text style={styles.datePickerText}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={onChangeStart}
            />
          )}

          {/* Check-out Date */}
          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Check-out Date</Text>
          <TouchableOpacity
            style={styles.datePickerBtn}
            onPress={() => setShowEndPicker(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={18} color={theme.colors.goldDark} />
            <Text style={styles.datePickerText}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              minimumDate={startDate}
              onChange={onChangeEnd}
            />
          )}
        </View>

        {/* Guests & Special Requests */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>GUESTS & PREFERENCES</Text>

          {/* Guest Count Selector */}
          <Text style={styles.fieldLabel}>Number of Guests</Text>
          <View style={styles.guestSelectorRow}>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.guestChip,
                  guests === num && styles.guestChipActive,
                ]}
                onPress={() => setGuests(num)}
              >
                <Text
                  style={[
                    styles.guestChipText,
                    guests === num && styles.guestChipTextActive,
                  ]}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Special Requests */}
          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
            Special Requests / Dietary / Arrival Notes (Optional)
          </Text>
          <TextInput
            style={styles.textArea}
            value={specialRequests}
            onChangeText={setSpecialRequests}
            placeholder="e.g. High floor preference, airport pickup request, late check-in"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Price Summary Breakdown Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Stay Summary & Rate Breakdown</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Base Room Rate (1 Guest)</Text>
            <Text style={styles.summaryVal}>Rs. {baseRate.toLocaleString()} / nt</Text>
          </View>

          {extraGuests > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Extra Guest Charge ({extraGuests} × Rs. {extraGuestFee.toLocaleString()})
              </Text>
              <Text style={[styles.summaryVal, { color: theme.colors.goldDark, fontWeight: '700' }]}>
                + Rs. {(extraGuests * extraGuestFee).toLocaleString()} / nt
              </Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Effective Nightly Rate ({guests} {guests === 1 ? 'Guest' : 'Guests'})
            </Text>
            <Text style={[styles.summaryVal, { fontWeight: '700', color: theme.colors.primary }]}>
              Rs. {nightlyRate.toLocaleString()} / nt
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Stay Duration ({nights} {nights === 1 ? 'Night' : 'Nights'})
            </Text>
            <Text style={styles.summaryVal}>
              {nights} × Rs. {nightlyRate.toLocaleString()}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxes & Luxury Resort Fees</Text>
            <Text style={[styles.summaryVal, { color: '#059669' }]}>Included</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total Estimated Cost</Text>
            <Text style={styles.summaryTotalVal}>Rs. {totalPrice.toLocaleString()}</Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditMode ? 'Save Changes' : 'Confirm & Request Reservation'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: theme.colors.background,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  headerSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  serverError: {
    backgroundColor: '#FEF2F2',
    color: '#B91C1C',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 13,
  },
  sectionCard: {
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
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  roomScroll: {
    marginHorizontal: -4,
  },
  roomCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#F8FAFC',
    marginRight: 10,
    minWidth: 135,
  },
  roomCardSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.gold,
  },
  roomCardDisabled: {
    opacity: 0.45,
  },
  roomCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  roomCardTitleSelected: {
    color: '#FFFFFF',
  },
  roomCardType: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  roomCardTypeSelected: {
    color: '#CBD5E1',
  },
  roomCardPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.goldDark,
    marginTop: 4,
  },
  roomCardPriceSelected: {
    color: '#FFD700',
  },
  roomCardStatus: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    marginTop: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  datePickerText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginLeft: 10,
  },
  guestSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  guestChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  guestChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  guestChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  guestChipTextActive: {
    color: '#FFFFFF',
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: theme.colors.textPrimary,
    height: 75,
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.borderGold,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  summaryLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 10,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  summaryTotalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});