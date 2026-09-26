import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../api/api';

export default function BookingFormScreen({ navigation, route }) {
  // Create mode: route.params.room is passed (booking a specific room)
  // Edit mode: route.params.booking is passed (editing an existing Pending booking)
  const initialRoom = route.params?.room;
  const editingBooking = route.params?.booking;
  const isEditMode = !!editingBooking;

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(
    isEditMode ? editingBooking.roomId : initialRoom
  );

  const [startDate, setStartDate] = useState(
    isEditMode ? new Date(editingBooking.startDate) : new Date()
  );
  const [endDate, setEndDate] = useState(
    isEditMode ? new Date(editingBooking.endDate) : new Date()
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Fetch all rooms so the student can pick or change the room
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get('/rooms');
        setRooms(response.data.rooms);
      } catch (err) {
        console.log('Failed to load rooms', err);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  const formatDate = (date) =>
    date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const onChangeStart = (event, selectedDate) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) setStartDate(selectedDate);
  };

  const onChangeEnd = (event, selectedDate) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) setEndDate(selectedDate);
  };

  const validate = () => {
    const newErrors = {};
    if (!selectedRoom) {
      newErrors.room = 'Please select a room';
    }
    if (endDate <= startDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEditMode) {
        await api.put(`/bookings/${editingBooking._id}`, {
          roomId: selectedRoom._id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
      } else {
        await api.post('/bookings', {
          roomId: selectedRoom._id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
      }
      navigation.navigate('MyBookings');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Something went wrong. Please try again.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{isEditMode ? 'Edit Booking' : 'Book a Room'}</Text>

        {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

        <View style={styles.field}>
          <Text style={styles.label}>Room</Text>
          {loadingRooms ? (
            <ActivityIndicator color="#2563eb" style={{ marginVertical: 12 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomScroll}>
              {rooms.map((r) => {
                const isSelected = selectedRoom && selectedRoom._id === r._id;
                const isFull = r.availabilityStatus === 'Full' && !isSelected;
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
                  >
                    <Text style={[styles.roomCardTitle, isSelected && styles.roomCardTitleSelected]}>
                      Room {r.roomNumber}
                    </Text>
                    <Text style={[styles.roomCardSub, isSelected && styles.roomCardSubSelected]}>
                      {r.roomType} - Rs. {r.pricePerMonth.toLocaleString()}
                    </Text>
                    <Text style={[styles.roomCardStatus, isFull && styles.roomCardStatusFull]}>
                      {r.availabilityStatus}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
          {errors.room ? <Text style={styles.errorText}>{errors.room}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowStartPicker(true)}>
            <Text style={styles.dateText}>{formatDate(startDate)}</Text>
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
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>End Date</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowEndPicker(true)}>
            <Text style={styles.dateText}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
          {errors.endDate ? <Text style={styles.errorText}>{errors.endDate}</Text> : null}
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

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isEditMode ? 'Save Changes' : 'Submit Booking Request'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8 },
  roomScroll: { flexDirection: 'row' },
  roomCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    minWidth: 130,
    backgroundColor: '#fafafa',
  },
  roomCardSelected: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  roomCardDisabled: { opacity: 0.4 },
  roomCardTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  roomCardTitleSelected: { color: '#fff' },
  roomCardSub: { fontSize: 11, color: '#666', marginTop: 4 },
  roomCardSubSelected: { color: '#dbeafe' },
  roomCardStatus: { fontSize: 10, color: '#16a34a', marginTop: 6, fontWeight: '600' },
  roomCardStatusFull: { color: '#dc2626' },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#fafafa',
  },
  dateText: { fontSize: 15, color: '#1a1a1a' },
  errorText: { color: '#e53e3e', fontSize: 12, marginTop: 4 },
  serverError: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },
  button: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});