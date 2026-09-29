import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/api';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

export default function StaffManagementScreen({ navigation }) {
  const { user: currentUser } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State for adding new staff
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('staff'); // 'staff' or 'admin'
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchStaff = async () => {
    try {
      const response = await api.get('/admin/staff');
      setStaffList(response.data.staff || []);
    } catch (error) {
      console.log('Failed to fetch staff members:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load staff list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStaff();
  };

  const handleCreateStaff = async () => {
    setErrorMsg('');
    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('Name, email, and password are required');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/admin/staff', {
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        role,
      });

      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setRole('staff');
      setModalVisible(false);
      fetchStaff();
      Alert.alert('Success', `New ${role} member created successfully.`);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to create team member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = (member) => {
    if (member._id === currentUser?.id || member._id === currentUser?._id) {
      Alert.alert('Action Denied', 'You cannot delete your own account.');
      return;
    }

    Alert.alert(
      'Remove Staff Member',
      `Are you sure you want to remove ${member.name} (${member.role})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/admin/staff/${member._id}`);
              fetchStaff();
              Alert.alert('Success', 'Staff member removed successfully.');
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete member');
            }
          },
        },
      ]
    );
  };

  const handleToggleRole = (member) => {
    const newRole = member.role === 'admin' ? 'staff' : 'admin';
    if (member._id === currentUser?.id || member._id === currentUser?._id) {
      Alert.alert('Action Denied', 'You cannot change your own role.');
      return;
    }

    Alert.alert(
      'Change Role',
      `Change role of ${member.name} to ${newRole.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await api.put(`/admin/staff/${member._id}/role`, { role: newRole });
              fetchStaff();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to update role');
            }
          },
        },
      ]
    );
  };

  const renderStaffCard = ({ item }) => {
    const isSelf = item._id === currentUser?.id || item._id === currentUser?._id;
    const isAdmin = item.role === 'admin';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {/* Avatar circle */}
          <View style={[styles.avatar, isAdmin ? styles.avatarAdmin : styles.avatarStaff]}>
            <Text style={styles.avatarText}>
              {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.nameRow}>
              <Text style={styles.memberName}>{item.name}</Text>
              {isSelf && <Text style={styles.youBadge}>(You)</Text>}
            </View>
            <Text style={styles.memberEmail}>{item.email}</Text>
            {item.phone ? <Text style={styles.memberPhone}>{item.phone}</Text> : null}
          </View>

          {/* Role Pill */}
          <TouchableOpacity
            style={[styles.rolePill, isAdmin ? styles.rolePillAdmin : styles.rolePillStaff]}
            onPress={() => !isSelf && handleToggleRole(item)}
            activeOpacity={isSelf ? 1 : 0.7}
          >
            <Ionicons
              name={isAdmin ? 'shield' : 'briefcase'}
              size={12}
              color={isAdmin ? '#9F7E53' : '#2563EB'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.rolePillText,
                isAdmin ? { color: '#9F7E53' } : { color: '#2563EB' },
              ]}
            >
              {item.role.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Row */}
        {!isSelf && (
          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={styles.roleChangeButton}
              onPress={() => handleToggleRole(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="swap-horizontal" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.roleChangeText}>
                Switch to {isAdmin ? 'Staff' : 'Admin'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteStaff(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={14} color="#EF4444" />
              <Text style={styles.deleteButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.gold} />
        <Text style={styles.loadingText}>Loading team roster...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.screenTitle}>Staff & Administration</Text>
          <Text style={styles.screenSub}>
            {staffList.length} Active {staffList.length === 1 ? 'Member' : 'Members'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="person-add" size={16} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.addButtonText}>Add Staff</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={staffList}
        keyExtractor={(item) => item._id}
        renderItem={renderStaffCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.gold} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No Staff Members Found</Text>
            <Text style={styles.emptySub}>Tap "+ Add Staff" to invite a staff member or administrator.</Text>
          </View>
        }
      />

      {/* Add Staff Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add Team Member</Text>
                <Text style={styles.modalSub}>Grant staff or management privileges</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {errorMsg ? <Text style={styles.formError}>{errorMsg}</Text> : null}

              {/* Role Selector Chips */}
              <Text style={styles.inputLabel}>SELECT ROLE</Text>
              <View style={styles.roleSelectorRow}>
                <TouchableOpacity
                  style={[styles.roleSelectChip, role === 'staff' && styles.roleSelectChipActive]}
                  onPress={() => setRole('staff')}
                >
                  <Ionicons
                    name="briefcase"
                    size={16}
                    color={role === 'staff' ? '#FFF' : theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.roleSelectText,
                      role === 'staff' && styles.roleSelectTextActive,
                    ]}
                  >
                    Hotel Staff
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleSelectChip, role === 'admin' && styles.roleSelectChipActiveGold]}
                  onPress={() => setRole('admin')}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={16}
                    color={role === 'admin' ? '#FFF' : theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.roleSelectText,
                      role === 'admin' && styles.roleSelectTextActive,
                    ]}
                  >
                    Administrator
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Full Name */}
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Samantha Vance"
                placeholderTextColor={theme.colors.textMuted}
                value={name}
                onChangeText={setName}
              />

              {/* Email */}
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="staff@grandazurepalace.com"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              {/* Password */}
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="Minimum 6 characters"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              {/* Phone */}
              <Text style={styles.inputLabel}>PHONE NUMBER (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="+94 77 123 4567"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateStaff}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  screenSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    elevation: 2,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarAdmin: {
    backgroundColor: theme.colors.goldLight,
    borderWidth: 1,
    borderColor: theme.colors.gold,
  },
  avatarStaff: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  youBadge: {
    fontSize: 12,
    color: theme.colors.goldDark,
    fontWeight: '700',
    marginLeft: 6,
  },
  memberEmail: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  memberPhone: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  rolePillAdmin: {
    backgroundColor: theme.colors.goldLight,
  },
  rolePillStaff: {
    backgroundColor: '#EFF6FF',
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  roleChangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  roleChangeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '700',
    marginLeft: 4,
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
  emptySub: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  modalSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  formError: {
    backgroundColor: '#FEF2F2',
    color: '#B91C1C',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    fontSize: 13,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 12,
  },
  roleSelectorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  roleSelectChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#F8FAFC',
    gap: 6,
  },
  roleSelectChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  roleSelectChipActiveGold: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.gold,
  },
  roleSelectText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  roleSelectTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
