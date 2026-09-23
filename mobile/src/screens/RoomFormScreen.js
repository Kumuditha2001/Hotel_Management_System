import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/api';

const ROOM_TYPES = ['Single', 'Double', 'Triple'];

export default function RoomFormScreen({ navigation, route }) {
  const editingRoom = route.params?.room;
  const isEditMode = !!editingRoom;

  const [roomNumber, setRoomNumber] = useState(editingRoom?.roomNumber || '');
  const [roomType, setRoomType] = useState(editingRoom?.roomType || 'Single');
  const [pricePerMonth, setPricePerMonth] = useState(
    editingRoom ? String(editingRoom.pricePerMonth) : ''
  );
  const [capacity, setCapacity] = useState(editingRoom ? String(editingRoom.capacity) : '');
  const [description, setDescription] = useState(editingRoom?.description || '');
  const [imageUri, setImageUri] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(editingRoom?.image || '');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!roomNumber.trim()) newErrors.roomNumber = 'Room number is required';
    if (!pricePerMonth || isNaN(pricePerMonth) || Number(pricePerMonth) <= 0) {
      newErrors.pricePerMonth = 'Enter a valid price';
    }
    if (!capacity || isNaN(capacity) || Number(capacity) <= 0) {
      newErrors.capacity = 'Enter a valid capacity';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to upload a room image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (roomId) => {
    if (!imageUri) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', { uri: imageUri, name: filename, type });

      await api.post(`/rooms/${roomId}/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      Alert.alert('Image upload failed', error.response?.data?.message || 'Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    const payload = {
      roomNumber: roomNumber.trim(),
      roomType,
      pricePerMonth: Number(pricePerMonth),
      capacity: Number(capacity),
      description: description.trim(),
    };

    try {
      let roomId;
      if (isEditMode) {
        const response = await api.put(`/rooms/${editingRoom._id}`, payload);
        roomId = response.data.room._id;
      } else {
        const response = await api.post('/rooms', payload);
        roomId = response.data.room._id;
      }

      if (imageUri) {
        await uploadImage(roomId);
      }

      navigation.goBack();
    } catch (error) {
      const message = error.response?.data?.message || 'Something went wrong. Please try again.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Room', `Are you sure you want to delete Room ${editingRoom.roomNumber}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await api.delete(`/rooms/${editingRoom._id}`);
            navigation.goBack();
          } catch (error) {
            setServerError(error.response?.data?.message || 'Failed to delete room');
            setLoading(false);
          }
        },
      },
    ]);
  };

  const previewUri = imageUri || existingImageUrl || null;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{isEditMode ? 'Edit Room' : 'Add Room'}</Text>

        {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

        <View style={styles.field}>
          <Text style={styles.label}>Room Photo</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
            {previewUri ? (
              <Image source={{ uri: previewUri }} style={styles.imagePreview} />
            ) : (
              <Text style={styles.imagePickerText}>Tap to select a photo</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Room Number</Text>
          <TextInput
            style={[styles.input, errors.roomNumber && styles.inputError]}
            placeholder="e.g. A101"
            value={roomNumber}
            onChangeText={setRoomNumber}
          />
          {errors.roomNumber ? <Text style={styles.errorText}>{errors.roomNumber}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Room Type</Text>
          <View style={styles.typeRow}>
            {ROOM_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeButton, roomType === type && styles.typeButtonActive]}
                onPress={() => setRoomType(type)}
              >
                <Text style={[styles.typeButtonText, roomType === type && styles.typeButtonTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Price per Month (Rs.)</Text>
          <TextInput
            style={[styles.input, errors.pricePerMonth && styles.inputError]}
            placeholder="e.g. 15000"
            keyboardType="numeric"
            value={pricePerMonth}
            onChangeText={setPricePerMonth}
          />
          {errors.pricePerMonth ? <Text style={styles.errorText}>{errors.pricePerMonth}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Capacity</Text>
          <TextInput
            style={[styles.input, errors.capacity && styles.inputError]}
            placeholder="e.g. 1"
            keyboardType="numeric"
            value={capacity}
            onChangeText={setCapacity}
          />
          {errors.capacity ? <Text style={styles.errorText}>{errors.capacity}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Short description of the room"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading || uploadingImage}
          activeOpacity={0.8}
        >
          {loading || uploadingImage ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isEditMode ? 'Save Changes' : 'Create Room'}</Text>
          )}
        </TouchableOpacity>

        {isEditMode && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={loading}>
            <Text style={styles.deleteButtonText}>Delete Room</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  imagePicker: {
    height: 160,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePreview: { width: '100%', height: '100%' },
  imagePickerText: { color: '#999', fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  inputError: { borderColor: '#e53e3e' },
  errorText: { color: '#e53e3e', fontSize: 12, marginTop: 4 },
  serverError: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  typeButtonActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  typeButtonText: { fontSize: 13, color: '#333' },
  typeButtonTextActive: { color: '#fff', fontWeight: '600' },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  deleteButton: { alignItems: 'center', marginTop: 16, paddingVertical: 10 },
  deleteButtonText: { color: '#e53e3e', fontWeight: '600', fontSize: 14 },
});