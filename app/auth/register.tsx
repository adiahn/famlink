import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';
import { Eye, EyeOff, UserPlus, ArrowLeft, User, Mail, Phone, Calendar, Lock, Shield } from 'lucide-react-native';

export default function RegisterScreen() {
  const { register, signIn, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    gender: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Error', 'Last name is required');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email address is required');
      return false;
    }
    if (!formData.dateOfBirth.trim()) {
      Alert.alert('Error', 'Date of birth is required');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;
    
    clearError();
    const result = await signIn({
      phone: formData.phone,
      password: formData.password,
    });
    
    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Sign In Failed', result.message);
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    clearError();
    const result = await register(formData);
    
    if (result.success) {
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully! Now let\'s set up your family.',
        [
          {
            text: 'Continue',
            onPress: () => router.push('/auth/onboarding'),
          },
        ]
      );
    } else {
      Alert.alert('Registration Failed', result.message);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Button
            title=""
            variant="ghost"
            onPress={() => router.back()}
            style={styles.backButton}
            leftIcon={<ArrowLeft size={24} color={Colors.primary[600]} />}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <UserPlus size={48} color={Colors.primary[600]} />
            <Text style={styles.logoText}>Create Account</Text>
            <Text style={styles.tagline}>Join your family network</Text>
          </View>

          <Card style={styles.formCard}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>First Name</Text>
                                     <Input
                     value={formData.firstName}
                     onChangeText={(value) => updateFormData('firstName', value)}
                     placeholder="Enter first name"
                     autoCapitalize="words"
                     leftIcon={<User size={16} color={Colors.neutral[500]} />}
                   />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Last Name</Text>
                  <Input
                    value={formData.lastName}
                    onChangeText={(value) => updateFormData('lastName', value)}
                    placeholder="Enter last name"
                    autoCapitalize="words"
                    leftIcon={<User size={16} color={Colors.gray} />}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <Input
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  leftIcon={<Phone size={16} color={Colors.gray} />}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <Input
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  leftIcon={<Mail size={16} color={Colors.gray} />}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Date of Birth</Text>
                  <Input
                    value={formData.dateOfBirth}
                    onChangeText={(value) => updateFormData('dateOfBirth', value)}
                    placeholder="DD/MM/YYYY"
                    leftIcon={<Calendar size={16} color={Colors.gray} />}
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Gender (Optional)</Text>
                  <Input
                    value={formData.gender}
                    onChangeText={(value) => updateFormData('gender', value)}
                    placeholder="Male/Female/Other"
                    autoCapitalize="words"
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <Input
                    value={formData.password}
                    onChangeText={(value) => updateFormData('password', value)}
                    placeholder="Create a password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    leftIcon={<Lock size={16} color={Colors.gray} />}
                    style={styles.passwordInput}
                  />
                  <Button
                    title=""
                    variant="ghost"
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    leftIcon={
                      showPassword ? (
                        <EyeOff size={16} color={Colors.gray} />
                      ) : (
                        <Eye size={16} color={Colors.gray} />
                      )
                    }
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <Input
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateFormData('confirmPassword', value)}
                    placeholder="Confirm your password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    leftIcon={<Shield size={16} color={Colors.neutral[500]} />}
                    style={styles.passwordInput}
                  />
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Create Account"
                onPress={handleSignUp}
                disabled={isLoading}
                style={styles.signUpButton}
                leftIcon={<UserPlus size={20} color="#ffffff" />}
              />
              
              <Button
                title="Sign In Instead"
                variant="outline"
                onPress={handleSignIn}
                disabled={isLoading}
                style={styles.signInButton}
              />
            </View>
          </Card>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>🔒 Your Privacy Matters</Text>
            <Text style={styles.infoText}>
              We protect your personal information and never share it with third parties. 
              Your family tree data is private and secure.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary[600],
    marginTop: 12,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  formCard: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 8,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 0,
  },
  buttonContainer: {
    gap: 12,
  },
  signUpButton: {
    marginTop: 8,
  },
  signInButton: {
    marginTop: 8,
  },
  infoBox: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
  },
});