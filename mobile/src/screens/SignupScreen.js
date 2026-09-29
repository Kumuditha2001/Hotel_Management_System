import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

const SIGNUP_BG_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80';

export default function SignupScreen({ navigation }) {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password, phone.trim());
    } catch (error) {
      const message =
        error.response?.data?.message || 'Registration failed. Please try again.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: SIGNUP_BG_IMAGE }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Brand Header */}
              <View style={styles.brandHeader}>
                <View style={styles.starRow}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons key={i} name="star" size={15} color="#FFD700" style={{ marginHorizontal: 1 }} />
                  ))}
                </View>
                <Text style={styles.brandTitle}>THE GRAND AZURE</Text>
                <Text style={styles.brandSubtitle}>PALACE & RESIDENCES</Text>
                <View style={styles.goldLine} />
              </View>

              {/* Form Card */}
              <View style={styles.card}>
                <Text style={styles.welcomeTitle}>Join Guest Privileges</Text>
                <Text style={styles.welcomeSub}>
                  Register to book luxury suites and manage your itineraries
                </Text>

                {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

                {/* Name */}
                <View style={styles.field}>
                  <Text style={styles.inputLabel}>FULL NAME</Text>
                  <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                    <Ionicons name="person-outline" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Johnathan Sterling"
                      placeholderTextColor={theme.colors.textMuted}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                  {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
                </View>

                {/* Email */}
                <View style={styles.field}>
                  <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                  <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                    <Ionicons name="mail-outline" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="you@domain.com"
                      placeholderTextColor={theme.colors.textMuted}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                  {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                </View>

                {/* Phone (Optional) */}
                <View style={styles.field}>
                  <Text style={styles.inputLabel}>PHONE NUMBER (OPTIONAL)</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="call-outline" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="+94 77 123 4567"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={setPhone}
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.field}>
                  <Text style={styles.inputLabel}>PASSWORD</Text>
                  <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                    <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Minimum 6 characters"
                      placeholderTextColor={theme.colors.textMuted}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={theme.colors.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                </View>

                {/* Confirm Password */}
                <View style={styles.field}>
                  <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
                  <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                    <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Repeat your password"
                      placeholderTextColor={theme.colors.textMuted}
                      secureTextEntry={!showPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                  </View>
                  {errors.confirmPassword ? (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  ) : null}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.signupButton}
                  onPress={handleSignup}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.signupButtonText}>Create VIP Account</Text>
                  )}
                </TouchableOpacity>

                {/* Return to Login */}
                <TouchableOpacity
                  style={styles.switchRow}
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.switchText}>
                    Already registered? <Text style={styles.switchBold}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 17, 32, 0.72)',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 32,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  starRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 11,
    color: theme.colors.gold,
    letterSpacing: 2.5,
    marginTop: 3,
    fontWeight: '700',
  },
  goldLine: {
    width: 40,
    height: 2,
    backgroundColor: theme.colors.gold,
    marginTop: 10,
    borderRadius: 1,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 22,
    padding: 22,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  welcomeSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 3,
    marginBottom: 16,
  },
  serverError: {
    backgroundColor: '#FEF2F2',
    color: '#B91C1C',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    fontSize: 12,
  },
  field: {
    marginBottom: 13,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 3,
  },
  signupButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  switchRow: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  switchBold: {
    color: theme.colors.goldDark,
    fontWeight: '700',
  },
});