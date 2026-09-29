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
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import { theme } from '../theme/theme';

const ROOM_TYPES = [
  'Deluxe',
  'Executive Suite',
  'Suite',
  'Presidential Suite',
  'Family Suite',
  'Double',
  'Single',
  'Standard',
];

const AVAILABLE_AMENITIES = [
  'High-speed Wi-Fi',
  'Air Conditioning',
  'Flat-screen Smart TV',
  'Luxury Toiletries',
  '24/7 Room Service',
  'Ocean View Balcony',
  'Jacuzzi & Spa Tub',
  'Espresso & Minibar',
];

export default function RoomFormScreen({ navigation, route }) {
  const editingRoom = route.params?.room;
  const isEditMode = !!editingRoom;

  const [roomNumber, setRoomNumber] = useState(editingRoom?.roomNumber || '');
  const [roomType, setRoomType] = useState(editingRoom?.roomType || 'Deluxe');
  const [pricePerNight, setPricePerNight] = useState(
    editingRoom
      ? String(
          editingRoom.pricePerNight ||
            (editingRoom.pricePerMonth ? Math.round(editingRoom.pricePerMonth / 30) : '')
        )
      : ''
  );
  const [capacity, setCapacity] = useState(editingRoom ? String(editingRoom.capacity) : '2');
  const [description, setDescription] = useState(editingRoom?.description || '');
  const [selectedAmenities, setSelectedAmenities] = useState(
    editingRoom?.amenities || [
      'High-speed Wi-Fi',
      'Air Conditioning',
      'Flat-screen Smart TV',
      'Luxury Toiletries',
    ]
  );

  // Photos managed directly with Cloudinary
  const initialImages = editingRoom?.images && editingRoom.images.length > 0
    ? [...editingRoom.images]
    : editingRoom?.image
    ? [editingRoom.image]
    : [];
  const [roomImages, setRoomImages] = useState(initialImages);
  const [manualUrlInput, setManualUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const toggleAmenity = (name) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!roomNumber.trim()) newErrors.roomNumber = 'Room number is required';
    if (!pricePerNight || isNaN(pricePerNight) || Number(pricePerNight) <= 0) {
      newErrors.pricePerNight = 'Enter a valid nightly price';
    }
    if (!capacity || isNaN(capacity) || Number(capacity) <= 0) {
      newErrors.capacity = 'Enter a valid capacity';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upload an image asset directly to Cloudinary via backend endpoint
  const uploadImageToCloudinary = async (uri) => {
    setUploadingImage(true);
    try {
      const filename = uri.split('/').pop() || `suite_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

      const formData = new FormData();
      formData.append('image', {
        uri,
        name: filename,
        type: mimeType,
      });

      const response = await api.post('/rooms/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.url) {
        setRoomImages((prev) => [response.data.url, ...prev]);
        Alert.alert('Upload Successful', 'Photo uploaded directly to Cloudinary and added to suite.');
      } else {
        throw new Error('Upload succeeded but no image URL was returned.');
      }
    } catch (uploadError) {
      console.log('Cloudinary upload error:', uploadError);
      Alert.alert(
        'Upload Failed',
        uploadError.response?.data?.message ||
          'Failed to upload image to Cloudinary. Check network or enter URL manually.'
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // Pick from Gallery
  const handlePickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please enable photo library access to choose a suite photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        await uploadImageToCloudinary(result.assets[0].uri);
      }
    } catch (err) {
      console.log('Pick image error:', err);
    }
  };

  // Take photo with Camera
  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to capture suite photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        await uploadImageToCloudinary(result.assets[0].uri);
      }
    } catch (err) {
      console.log('Camera error:', err);
    }
  };

  const promptPhotoOptions = () => {
    Alert.alert(
      'Upload Suite Photo',
      'Upload high-resolution photography directly to Cloudinary',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Gallery', onPress: handlePickFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleAddManualUrl = () => {
    const url = manualUrlInput.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      Alert.alert('Invalid URL', 'Please enter a valid web image URL starting with http:// or https://');
      return;
    }
    if (!roomImages.includes(url)) {
      setRoomImages((prev) => [...prev, url]);
      setManualUrlInput('');
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setRoomImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async () => {
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    const nightly = Number(pricePerNight);

    // Final list of images
    const finalImages = [...roomImages];
    if (manualUrlInput.trim() && !finalImages.includes(manualUrlInput.trim())) {
      finalImages.push(manualUrlInput.trim());
    }

    const payload = {
      roomNumber: roomNumber.trim(),
      roomType,
      pricePerNight: nightly,
      pricePerMonth: nightly * 30,
      capacity: Number(capacity),
      description: description.trim(),
      amenities: selectedAmenities,
      image: finalImages[0] || '',
      images: finalImages,
    };

    try {
      if (isEditMode) {
        await api.put(`/rooms/${editingRoom._id}`, payload);
      } else {
        await api.post('/rooms', payload);
      }

      Alert.alert('Success', isEditMode ? 'Room details updated successfully' : 'New suite published successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      setServerError(error.response?.data?.message || 'Failed to save room details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Room', `Are you sure you want to remove Room ${editingRoom.roomNumber}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await api.delete(`/rooms/${editingRoom._id}`);
            navigation.goBack();
          } catch (err) {
            setServerError(err.response?.data?.message || 'Failed to delete room');
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>{isEditMode ? 'Edit Suite' : 'Create Room'}</Text>
          <Text style={styles.subtitle}>Manage inventory details, Cloudinary media, and pricing</Text>
        </View>

        {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

        {/* Cloudinary Suite Photography */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>SUITE PHOTOGRAPHY (CLOUDINARY)</Text>
            <View style={styles.cloudBadge}>
              <Ionicons name="cloud-upload" size={11} color="#059669" />
              <Text style={styles.cloudBadgeText}>Cloudinary Connected</Text>
            </View>
          </View>

          {/* Upload Status / Trigger Box */}
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={promptPhotoOptions}
            disabled={uploadingImage}
            activeOpacity={0.85}
          >
            {uploadingImage ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.gold} />
                <Text style={styles.uploadingText}>Uploading directly to Cloudinary...</Text>
                <Text style={styles.uploadingSub}>Optimizing resolution & generating CDN link</Text>
              </View>
            ) : roomImages.length > 0 ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: roomImages[0] }} style={styles.primaryPreviewImage} />
                <View style={styles.primaryOverlayBadge}>
                  <Ionicons name="star" size={11} color="#FFD700" />
                  <Text style={styles.primaryOverlayText}>PRIMARY SUITE COVER</Text>
                </View>
                <View style={styles.changeOverlay}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                  <Text style={styles.changeOverlayText}>Tap to add more photos</Text>
                </View>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <View style={styles.cameraIconCircle}>
                  <Ionicons name="cloud-upload-outline" size={28} color={theme.colors.goldDark} />
                </View>
                <Text style={styles.imagePickerTitle}>Upload Suite Photos</Text>
                <Text style={styles.imagePickerSub}>
                  Take a photo or pick from gallery • Uploads to Cloudinary
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Action Buttons: Gallery & Camera */}
          <View style={styles.photoActionRow}>
            <TouchableOpacity
              style={styles.photoBtn}
              onPress={handlePickFromGallery}
              disabled={uploadingImage}
            >
              <Ionicons name="images-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.photoBtnText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoBtn}
              onPress={handleTakePhoto}
              disabled={uploadingImage}
            >
              <Ionicons name="camera-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.photoBtnText}>Camera</Text>
            </TouchableOpacity>
          </View>

          {/* Image Gallery Thumbnails */}
          {roomImages.length > 0 && (
            <View style={styles.gallerySection}>
              <Text style={styles.gallerySectionLabel}>
                Suite Photos ({roomImages.length}) — first is primary:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbScroll}>
                {roomImages.map((imgUri, idx) => (
                  <View key={`${imgUri}_${idx}`} style={styles.thumbCard}>
                    <Image source={{ uri: imgUri }} style={styles.thumbImage} />
                    {idx === 0 && (
                      <View style={styles.coverPill}>
                        <Text style={styles.coverPillText}>Cover</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.removeThumbBtn}
                      onPress={() => handleRemoveImage(idx)}
                    >
                      <Ionicons name="close-circle" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Manual URL Input Alternative */}
          <View style={styles.urlInputRow}>
            <TextInput
              style={[styles.input, styles.urlInput]}
              placeholder="Or paste external image URL (https://...)"
              placeholderTextColor={theme.colors.textMuted}
              value={manualUrlInput}
              onChangeText={setManualUrlInput}
              autoCapitalize="none"
            />
            {manualUrlInput.trim().length > 0 && (
              <TouchableOpacity style={styles.addUrlBtn} onPress={handleAddManualUrl}>
                <Ionicons name="add" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Room Number */}
        <View style={styles.field}>
          <Text style={styles.label}>ROOM NUMBER</Text>
          <TextInput
            style={[styles.input, errors.roomNumber && styles.inputError]}
            placeholder="e.g. 301, Deluxe Penthouse"
            placeholderTextColor={theme.colors.textMuted}
            value={roomNumber}
            onChangeText={setRoomNumber}
          />
          {errors.roomNumber ? <Text style={styles.errorText}>{errors.roomNumber}</Text> : null}
        </View>

        {/* Room Type Chips */}
        <View style={styles.field}>
          <Text style={styles.label}>ROOM TYPE / CATEGORY</Text>
          <View style={styles.typesGrid}>
            {ROOM_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeChip, roomType === type && styles.typeChipActive]}
                onPress={() => setRoomType(type)}
              >
                <Text style={[styles.typeChipText, roomType === type && styles.typeChipTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price & Capacity Row */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>NIGHTLY RATE (RS.)</Text>
            <TextInput
              style={[styles.input, errors.pricePerNight && styles.inputError]}
              placeholder="e.g. 18500"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              value={pricePerNight}
              onChangeText={setPricePerNight}
            />
            {errors.pricePerNight ? (
              <Text style={styles.errorText}>{errors.pricePerNight}</Text>
            ) : null}
          </View>

          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>CAPACITY (GUESTS)</Text>
            <TextInput
              style={[styles.input, errors.capacity && styles.inputError]}
              placeholder="e.g. 2"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              value={capacity}
              onChangeText={setCapacity}
            />
            {errors.capacity ? <Text style={styles.errorText}>{errors.capacity}</Text> : null}
          </View>
        </View>

        {/* Amenities Selection */}
        <View style={styles.field}>
          <Text style={styles.label}>INCLUDED AMENITIES</Text>
          <View style={styles.amenitiesGrid}>
            {AVAILABLE_AMENITIES.map((amenity) => {
              const active = selectedAmenities.includes(amenity);
              return (
                <TouchableOpacity
                  key={amenity}
                  style={[styles.amenityChip, active && styles.amenityChipActive]}
                  onPress={() => toggleAmenity(amenity)}
                >
                  <Ionicons
                    name={active ? 'checkmark-circle' : 'add-circle-outline'}
                    size={16}
                    color={active ? '#FFF' : theme.colors.textSecondary}
                  />
                  <Text style={[styles.amenityChipText, active && styles.amenityChipTextActive]}>
                    {amenity}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the atmosphere, views, furnishings, and features..."
            placeholderTextColor={theme.colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit}
          disabled={loading || uploadingImage}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>{isEditMode ? 'Update Suite Details' : 'Publish Suite'}</Text>
          )}
        </TouchableOpacity>

        {/* Delete button */}
        {isEditMode && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={16} color="#EF4444" style={{ marginRight: 4 }} />
            <Text style={styles.deleteButtonText}>Delete Suite from Inventory</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 40,
    backgroundColor: theme.colors.background,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  serverError: {
    backgroundColor: '#FEF2F2',
    color: '#B91C1C',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    fontSize: 13,
  },
  field: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
  },
  cloudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  cloudBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 4,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  imagePicker: {
    height: 180,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.borderGold,
    borderStyle: 'dashed',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  primaryPreviewImage: {
    width: '100%',
    height: '100%',
  },
  primaryOverlayBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  primaryOverlayText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  changeOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  changeOverlayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  uploadingContainer: {
    alignItems: 'center',
    padding: 16,
  },
  uploadingText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 10,
  },
  uploadingSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  imagePlaceholder: {
    alignItems: 'center',
    padding: 16,
  },
  cameraIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  imagePickerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  imagePickerSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  photoActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  photoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  gallerySection: {
    marginTop: 12,
  },
  gallerySectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginBottom: 6,
  },
  thumbScroll: {
    marginHorizontal: -4,
  },
  thumbCard: {
    position: 'relative',
    width: 80,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  coverPill: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    backgroundColor: '#FFD700',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  coverPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  removeThumbBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
  },
  urlInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  urlInput: {
    flex: 1,
    paddingVertical: 10,
  },
  addUrlBtn: {
    backgroundColor: theme.colors.primary,
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  typeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 5,
  },
  amenityChipActive: {
    backgroundColor: theme.colors.goldDark,
    borderColor: theme.colors.goldDark,
  },
  amenityChipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  amenityChipTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
    elevation: 2,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
});