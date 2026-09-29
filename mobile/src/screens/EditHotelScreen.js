import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/api';
import { theme } from '../theme/theme';

export default function EditHotelScreen({ navigation, route }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [uploadingHero, setUploadingHero] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const uploadHeroToCloudinary = async (uri) => {
    setUploadingHero(true);
    try {
      const filename = uri.split('/').pop() || `hotel_${Date.now()}.jpg`;
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.url) {
        setHeroImage(response.data.url);
        Alert.alert('Upload Successful', 'Hero image uploaded directly to Cloudinary.');
      }
    } catch (err) {
      console.log('Hotel hero upload error:', err);
      Alert.alert('Upload Failed', err.response?.data?.message || 'Could not upload image to Cloudinary.');
    } finally {
      setUploadingHero(false);
    }
  };

  const handlePickHeroImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please enable photo access to choose hotel hero photo.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        await uploadHeroToCloudinary(result.assets[0].uri);
      }
    } catch (err) {
      console.log('Pick hero image error:', err);
    }
  };

  useEffect(() => {
    const loadHotel = async () => {
      try {
        const response = await api.get('/hotel');
        const h = response.data.hotel;
        if (h) {
          setName(h.name || '');
          setTagline(h.tagline || '');
          setDescription(h.description || '');
          setAddress(h.address || '');
          setCity(h.city || '');
          setCountry(h.country || '');
          setPhone(h.phone || '');
          setEmail(h.email || '');
          setCheckInTime(h.checkInTime || '02:00 PM');
          setCheckOutTime(h.checkOutTime || '11:00 AM');
          setHeroImage(h.heroImage || '');
        }
      } catch (err) {
        console.log('Failed to load hotel info:', err);
      } finally {
        setFetching(false);
      }
    };
    loadHotel();
  }, []);

  const handleSave = async () => {
    setErrorMsg('');
    if (!name.trim()) {
      setErrorMsg('Hotel name is required');
      return;
    }

    setLoading(true);
    try {
      await api.put('/hotel', {
        name: name.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        address: address.trim(),
        city: city.trim(),
        country: country.trim(),
        phone: phone.trim(),
        email: email.trim(),
        checkInTime: checkInTime.trim(),
        checkOutTime: checkOutTime.trim(),
        heroImage: heroImage.trim(),
      });

      Alert.alert('Success', 'Hotel details updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update hotel info');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.gold} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Hotel Profile Settings</Text>
            <Text style={styles.headerSub}>
              Update public hotel details, contact information, and guest policies
            </Text>
          </View>

          {errorMsg ? <Text style={styles.errorBox}>{errorMsg}</Text> : null}

          {/* Hotel Name */}
          <Text style={styles.label}>HOTEL NAME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. The Grand Azure Palace"
          />

          {/* Tagline */}
          <Text style={styles.label}>TAGLINE / SLOGAN</Text>
          <TextInput
            style={styles.input}
            value={tagline}
            onChangeText={setTagline}
            placeholder="e.g. Where Timeless Elegance Meets Luxury"
          />

          {/* Hero Banner Image */}
          <View style={styles.imageSectionHeader}>
            <Text style={styles.label}>HERO BANNER IMAGE (CLOUDINARY)</Text>
            <TouchableOpacity
              style={styles.pickImageBtn}
              onPress={handlePickHeroImage}
              disabled={uploadingHero}
            >
              {uploadingHero ? (
                <ActivityIndicator size="small" color={theme.colors.gold} />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={15} color={theme.colors.primary} />
                  <Text style={styles.pickImageBtnText}>Upload Photo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {heroImage ? (
            <View style={styles.heroPreviewBox}>
              <Image source={{ uri: heroImage }} style={styles.heroPreviewImage} />
              <View style={styles.heroBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                <Text style={styles.heroBadgeText}>Cloudinary Ready</Text>
              </View>
            </View>
          ) : null}

          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            value={heroImage}
            onChangeText={setHeroImage}
            placeholder="Or enter image URL (https://...)"
            autoCapitalize="none"
          />

          {/* Description */}
          <Text style={styles.label}>ABOUT / STORY</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholder="Introduce guests to your hotel experience"
          />

          {/* Address & City */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>CITY</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="Colombo"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>COUNTRY</Text>
              <TextInput
                style={styles.input}
                value={country}
                onChangeText={setCountry}
                placeholder="Sri Lanka"
              />
            </View>
          </View>

          <Text style={styles.label}>STREET ADDRESS</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="e.g. 742 Ocean Crest Blvd"
          />

          {/* Phone & Email */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+94 11 234 5678"
                keyboardType="phone-pad"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="concierge@hotel.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Check-in & Check-out Times */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>CHECK-IN TIME</Text>
              <TextInput
                style={styles.input}
                value={checkInTime}
                onChangeText={setCheckInTime}
                placeholder="02:00 PM"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>CHECK-OUT TIME</Text>
              <TextInput
                style={styles.input}
                value={checkOutTime}
                onChangeText={setCheckOutTime}
                placeholder="11:00 AM"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Hotel Profile</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
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
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    color: '#B91C1C',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 13,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 12,
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
  textArea: {
    height: 95,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 28,
    elevation: 3,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  imageSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  pickImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  pickImageBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  heroPreviewBox: {
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroPreviewImage: {
    width: '100%',
    height: '100%',
  },
  heroBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    elevation: 2,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
});
