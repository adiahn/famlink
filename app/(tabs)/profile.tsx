import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Shield, Bell, CircleHelp as HelpCircle, LogOut, ChevronRight, CreditCard as Edit, Eye, EyeOff, Globe, Lock, Phone, Calendar, Camera, Save, X } from 'lucide-react-native';

const profileData = {
  firstName: 'Fatima',
  lastName: 'Yusuf',
  phone: '+234 803 123 4567',
  dateOfBirth: '15/03/1990',
  verified: true,
  joinedDate: 'January 2025',
  familyMembers: 12,
  connections: 8,
};

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: profileData.firstName,
    lastName: profileData.lastName,
    phone: profileData.phone,
    dateOfBirth: profileData.dateOfBirth,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    allowSearch: true,
    notifications: true,
    familyVisibility: false,
  });

  const handleSave = () => {
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

    // If changing password, validate password fields
    if (formData.newPassword || formData.confirmPassword) {
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
    }
    
    // Simulate save process
    Alert.alert('Success', 'Profile updated successfully');
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone,
      dateOfBirth: profileData.dateOfBirth,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setIsEditing(false);
  };

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
              <Pressable style={styles.saveButton} onPress={handleSave}>
                <Save size={20} color="#2563eb" strokeWidth={2} />
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
              <Text style={styles.profileInitials}>
                {formData.firstName[0]}{formData.lastName[0]}
              </Text>
              {isEditing && (
                <Pressable style={styles.cameraButton}>
                  <Camera size={16} color="#ffffff" strokeWidth={2} />
                </Pressable>
              )}
            </View>
            <Text style={styles.profileName}>{formData.firstName} {formData.lastName}</Text>
            
            <View style={styles.verificationBadge}>
              <Shield size={16} color="#059669" strokeWidth={2} />
              <Text style={styles.verificationText}>Identity Verified</Text>
            </View>

            <View style={styles.profileStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profileData.familyMembers}</Text>
                <Text style={styles.statLabel}>Family Members</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profileData.connections}</Text>
                <Text style={styles.statLabel}>Connections</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profileData.joinedDate}</Text>
                <Text style={styles.statLabel}>Joined</Text>
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
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Privacy Settings</Text>
                <View style={styles.sectionCard}>
                  <PrivacySetting
                    title="Profile Visibility"
                    subtitle="Allow others to find your profile"
                    value={privacySettings.showProfile}
                    onValueChange={(value: boolean) => 
                      setPrivacySettings({ ...privacySettings, showProfile: value })
                    }
                  />
                  <PrivacySetting
                    title="Search Visibility"
                    subtitle="Appear in search results"
                    value={privacySettings.allowSearch}
                    onValueChange={(value: boolean) => 
                      setPrivacySettings({ ...privacySettings, allowSearch: value })
                    }
                  />
                  <PrivacySetting
                    title="Family Tree Visibility"
                    subtitle="Show your connections to family"
                    value={privacySettings.familyVisibility}
                    onValueChange={(value: boolean) => 
                      setPrivacySettings({ ...privacySettings, familyVisibility: value })
                    }
                  />
                  <PrivacySetting
                    title="Notifications"
                    subtitle="Receive family updates and requests"
                    value={privacySettings.notifications}
                    onValueChange={(value: boolean) => 
                      setPrivacySettings({ ...privacySettings, notifications: value })
                    }
                  />
                </View>
              </View>

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

              <Pressable style={styles.logoutButton}>
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