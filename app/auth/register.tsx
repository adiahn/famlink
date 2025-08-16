import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
  Dimensions, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Colors } from '../../constants/Colors';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

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
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.dateOfBirth)) {
      Alert.alert('Error', 'Date of birth must be in YYYY-MM-DD format (e.g., 1990-01-01)');
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

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    clearError();
    console.log('Attempting registration with data:', formData);
    const result = await register(formData);
    console.log('Registration result:', result);
    
    if (result.success) {
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully! Please sign in to continue.',
        [
          {
            text: 'Sign In',
            onPress: () => router.replace('/auth/login'),
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
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Centered Content */}
        <View style={styles.mainContainer}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Sign Up</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>First Name</Text>
                <Input
                  value={formData.firstName}
                  onChangeText={(value) => updateFormData('firstName', value)}
                  placeholder="First name"
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>Last Name</Text>
                <Input
                  value={formData.lastName}
                  onChangeText={(value) => updateFormData('lastName', value)}
                  placeholder="Last name"
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>
            </View>

            {/* Contact Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>Phone</Text>
                <Input
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>Email</Text>
                <Input
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  placeholder="Email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>
            </View>

            {/* Date & Gender Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>Date of Birth</Text>
                <Input
                  value={formData.dateOfBirth}
                  onChangeText={(value) => updateFormData('dateOfBirth', value)}
                  placeholder="YYYY-MM-DD"
                  style={styles.input}
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>Gender</Text>
                <Input
                  value={formData.gender}
                  onChangeText={(value) => updateFormData('gender', value)}
                  placeholder="Gender"
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <Input
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                placeholder="Password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                rightIcon={
                  <Button
                    title=""
                    variant="ghost"
                    onPress={() => setShowPassword(!showPassword)}
                    leftIcon={
                      showPassword ? (
                        <EyeOff size={16} color={Colors.neutral[400]} />
                      ) : (
                        <Eye size={16} color={Colors.neutral[400]} />
                      )
                    }
                  />
                }
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <Input
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                placeholder="Confirm password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                title="Create Account"
                onPress={handleSignUp}
                disabled={isLoading}
                style={styles.primaryButton}
              />
              
              <Button
                title="Already have an account? Sign In"
                variant="outline"
                onPress={handleSignIn}
                disabled={isLoading}
                style={styles.secondaryButton}
              />
            </View>
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
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
    color: Colors.text.primary,
  },
  form: {
    width: '100%',
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.text.primary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: Colors.text.primary,
    borderRadius: 0,
    paddingVertical: 16,
  },
  secondaryButton: {
    borderColor: Colors.neutral[300],
    borderRadius: 0,
    paddingVertical: 16,
  },
});
