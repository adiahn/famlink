import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Shield, Bell, CircleHelp as HelpCircle, LogOut, ChevronRight, CreditCard as Edit, Eye, EyeOff, Globe, Lock, Phone, Calendar, Camera, Save, X, Users, Link, CheckCircle, BarChart3 } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { userApi, UserProfile, PrivacySettings, UserStatistics } from '../../api/userApi';
import Colors from '../../constants/Colors';

export default function Profile() {
  const { accessToken, logout } = useAuthStore();
  
  // State for profile data
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    if (!accessToken) return;
    
    setIsLoading(true);
    try {
      // Load profile, statistics, and privacy settings in parallel
      const [profileRes, statsRes, privacyRes] = await Promise.all([
        userApi.getProfile(accessToken),
        userApi.getStatistics(accessToken),
        userApi.getPrivacySettings(accessToken)
      ]);

      if (profileRes.success && profileRes.data?.user) {
        setProfile(profileRes.data.user);
        setFormData({
          firstName: profileRes.data.user.firstName,
          lastName: profileRes.data.user.lastName,
          phone: profileRes.data.user.phone,
          dateOfBirth: profileRes.data.user.dateOfBirth,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }

      if (statsRes.success && statsRes.data) {
        setStatistics(statsRes.data);
      }

      if (privacyRes.success && privacyRes.data) {
        setPrivacySettings(privacyRes.data);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!accessToken || !profile) return;

    // Validate required fields
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Error', 'Please enter your first and last name');
      return;
    }
    
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    
    if (!formData.dateOfBirth.trim()) {
      Alert.alert('Error', 'Please enter your date of birth');
      return;
    }

    setIsUpdating(true);
    try {
      // Update profile
      const profileRes = await userApi.updateProfile(accessToken, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
      });

      if (profileRes.success && profileRes.data?.user) {
        setProfile(profileRes.data.user);
      }

      // Change password if provided
      if (formData.newPassword && formData.confirmPassword) {
        if (!formData.currentPassword) {
          Alert.alert('Error', 'Please enter your current password');
          return;
        }
        
        if (formData.newPassword.length < 6) {
          Alert.alert('Error', 'New password must be at least 6 characters long');
          return;
        }
        
        if (formData.newPassword !== formData.confirmPassword) {
          Alert.alert('Error', 'New passwords do not match');
          return;
        }

        const passwordRes = await userApi.changePassword(accessToken, {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        });

        if (passwordRes.success) {
          Alert.alert('Success', 'Password changed successfully');
          // Clear password fields
          setFormData(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }));
        }
      }

      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
    setIsEditing(false);
  };

  const handlePrivacyChange = async (key: keyof PrivacySettings, value: boolean | string) => {
    if (!accessToken || !privacySettings) return;

    try {
      const updatedSettings = { ...privacySettings, [key]: value };
      const response = await userApi.updatePrivacySettings(accessToken, updatedSettings);
      
      if (response.success) {
        setPrivacySettings(updatedSettings);
        Alert.alert('Success', 'Privacy settings updated');
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      Alert.alert('Error', 'Failed to update privacy settings');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <Pressable style={styles.retryButton} onPress={loadProfileData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    showChevron = true,
    rightComponent 
  }: any) => (
    <Pressable style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Icon size={20} color="#64748b" strokeWidth={2} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || (showChevron && (
        <ChevronRight size={16} color="#94a3b8" strokeWidth={2} />
      ))}
    </Pressable>
  );

  const PrivacySetting = ({ title, subtitle, value, onValueChange }: any) => (
    <View style={styles.privacyItem}>
      <View style={styles.privacyContent}>
        <Text style={styles.privacyTitle}>{title}</Text>
        <Text style={styles.privacySubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
        thumbColor={value ? '#ffffff' : '#f1f5f9'}
      />
    </View>
  );

  const InputField = ({ 
    icon: Icon, 
    placeholder, 
    value, 
    onChangeText, 
    keyboardType = 'default',
    secureTextEntry = false,
    rightComponent 
  }: any) => (
    <View style={styles.inputContainer}>
      <Icon size={20} color="#64748b" strokeWidth={2} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
      {rightComponent}
    </View>
  );

  const PasswordField = ({ 
    placeholder, 
    value, 
    onChangeText, 
    showPassword, 
    onTogglePassword 
  }: any) => (
    <View style={styles.passwordContainer}>
      <TextInput
        style={[styles.input, { flex: 1 }]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#94a3b8"
        secureTextEntry={!showPassword}
      />
      <Pressable style={styles.eyeButton} onPress={onTogglePassword}>
        {showPassword ? (
          <EyeOff size={20} color="#64748b" strokeWidth={2} />
        ) : (
          <Eye size={20} color="#64748b" strokeWidth={2} />
        )}
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          {isEditing ? (
            <View style={styles.editActions}>
              <Pressable style={styles.cancelButton} onPress={handleCancel}>
                <X size={20} color="#64748b" strokeWidth={2} />
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSave} disabled={isUpdating}>
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#2563eb" />
                ) : (
                  <Save size={20} color="#2563eb" strokeWidth={2} />
                )}
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Edit size={20} color="#2563eb" strokeWidth={2} />
          </Pressable>
          )}
        </View>

        <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
              {profile.profilePictureUrl ? (
                <Image source={{ uri: profile.profilePictureUrl }} style={styles.profileImage} />
              ) : (
            <Text style={styles.profileInitials}>
                  {profile.firstName[0]}{profile.lastName[0]}
            </Text>
              )}
              {isEditing && (
                <Pressable style={styles.cameraButton}>
                  <Camera size={16} color="#ffffff" strokeWidth={2} />
                </Pressable>
              )}
          </View>
            <Text style={styles.profileName}>{profile.firstName} {profile.lastName}</Text>
          
          <View style={styles.verificationBadge}>
              {profile.isVerified ? (
                <>
                  <CheckCircle size={16} color="#059669" strokeWidth={2} />
            <Text style={styles.verificationText}>Identity Verified</Text>
                </>
              ) : (
                <>
                  <Shield size={16} color="#f59e0b" strokeWidth={2} />
                  <Text style={styles.verificationText}>Not Verified</Text>
                </>
              )}
          </View>

          <View style={styles.profileStats}>
            <View style={styles.statItem}>
                <Text style={styles.statValue}>{statistics?.familyMembers || 0}</Text>
              <Text style={styles.statLabel}>Family Members</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={styles.statValue}>{statistics?.linkedFamilies || 0}</Text>
                <Text style={styles.statLabel}>Linked Families</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={styles.statValue}>{statistics?.totalConnections || 0}</Text>
                <Text style={styles.statLabel}>Connections</Text>
              </View>
            </View>
          </View>

          {isEditing ? (
            <View style={styles.form}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.sectionCard}>
                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                    <User size={20} color="#64748b" strokeWidth={2} />
                    <TextInput
                      style={styles.input}
                      placeholder="First Name"
                      value={formData.firstName}
                      onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                    <User size={20} color="#64748b" strokeWidth={2} />
                    <TextInput
                      style={styles.input}
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                </View>

                <InputField
                  icon={Phone}
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChangeText={(text: string) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                />

                <InputField
                  icon={Calendar}
                  placeholder="Date of Birth (DD/MM/YYYY)"
                  value={formData.dateOfBirth}
                  onChangeText={(text: string) => setFormData({ ...formData, dateOfBirth: text })}
                />
        </View>

              <Text style={styles.sectionTitle}>Change Password</Text>
              <View style={styles.sectionCard}>
                <PasswordField
                  placeholder="Current Password"
                  value={formData.currentPassword}
                  onChangeText={(text: string) => setFormData({ ...formData, currentPassword: text })}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />

                <PasswordField
                  placeholder="New Password"
                  value={formData.newPassword}
                  onChangeText={(text: string) => setFormData({ ...formData, newPassword: text })}
                  showPassword={showNewPassword}
                  onTogglePassword={() => setShowNewPassword(!showNewPassword)}
                />

                <PasswordField
                  placeholder="Confirm New Password"
                  value={formData.confirmPassword}
                  onChangeText={(text: string) => setFormData({ ...formData, confirmPassword: text })}
                  showPassword={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </View>
            </View>
          ) : (
            <>
              {privacySettings && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          <View style={styles.sectionCard}>
            <PrivacySetting
              title="Profile Visibility"
              subtitle="Allow others to find your profile"
              value={privacySettings.showProfile}
              onValueChange={(value: boolean) => 
                        handlePrivacyChange('showProfile', value)
              }
            />
            <PrivacySetting
              title="Search Visibility"
              subtitle="Appear in search results"
              value={privacySettings.allowSearch}
              onValueChange={(value: boolean) => 
                        handlePrivacyChange('allowSearch', value)
              }
            />
            <PrivacySetting
              title="Family Tree Visibility"
              subtitle="Show your connections to family"
                      value={privacySettings.familyVisibility === 'public'}
              onValueChange={(value: boolean) => 
                        handlePrivacyChange('familyVisibility', value ? 'public' : 'private')
              }
            />
            <PrivacySetting
              title="Notifications"
              subtitle="Receive family updates and requests"
              value={privacySettings.notifications}
              onValueChange={(value: boolean) => 
                        handlePrivacyChange('notifications', value)
              }
            />
          </View>
        </View>
              )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon={Shield}
              title="Identity Verification"
              subtitle="Manage your verified ID"
              onPress={() => {}}
            />
            <SettingItem
              icon={Lock}
              title="Security"
              subtitle="Password and security settings"
                    onPress={() => setIsEditing(true)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon={HelpCircle}
              title="Help & Support"
              subtitle="Get help with FamLink"
              onPress={() => {}}
            />
            <SettingItem
              icon={Globe}
              title="About FamLink"
              subtitle="Learn more about our mission"
              onPress={() => {}}
            />
            <SettingItem
              icon={Settings}
              title="App Settings"
              subtitle="Preferences and configurations"
              onPress={() => {}}
            />
          </View>
        </View>

              <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#dc2626" strokeWidth={2} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  editButton: {
    padding: 8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 24,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInitials: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  verificationText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  form: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  eyeButton: {
    padding: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  privacySubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dc2626',
    marginTop: 24,
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});