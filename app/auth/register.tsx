import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react-native';

export default function RegisterScreen() {
  const { register, signIn, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        'Please check your phone for verification code',
        [
          {
            text: 'OK',
            onPress: () => router.push('/auth/verification'),
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join your family network</Text>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <Input
              value={formData.firstName}
              onChangeText={(value) => updateFormData('firstName', value)}
              placeholder="Enter your first name"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <Input
              value={formData.lastName}
              onChangeText={(value) => updateFormData('lastName', value)}
              placeholder="Enter your last name"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <Input
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <Input
              value={formData.dateOfBirth}
              onChangeText={(value) => updateFormData('dateOfBirth', value)}
              placeholder="DD/MM/YYYY"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <Input
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
              />
              <Button
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                textStyle={styles.eyeButtonText}
              >
                {showPassword ? <EyeOff size={20} color={Colors.gray} /> : <Eye size={20} color={Colors.gray} />}
              </Button>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <Input
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
                style={styles.passwordInput}
              />
              <Button
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
                textStyle={styles.eyeButtonText}
              >
                {showConfirmPassword ? <EyeOff size={20} color={Colors.gray} /> : <Eye size={20} color={Colors.gray} />}
              </Button>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <Button
              onPress={handleSignIn}
              style={[styles.button, styles.signInButton]}
              textStyle={styles.signInButtonText}
              disabled={isLoading}
            >
              <LogIn size={20} color={Colors.white} style={styles.buttonIcon} />
              Sign In
            </Button>

            <Button
              onPress={handleSignUp}
              style={[styles.button, styles.signUpButton]}
              textStyle={styles.signUpButtonText}
              disabled={isLoading}
            >
              <UserPlus size={20} color={Colors.white} style={styles.buttonIcon} />
              Sign Up
            </Button>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>What's the difference?</Text>
            <Text style={styles.infoText}>
              <Text style={styles.bold}>Sign In:</Text> If you already have an account, use this to log in with your existing credentials.
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.bold}>Sign Up:</Text> Create a new account. You'll receive a verification code on your phone to complete registration.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
  },
  formCard: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    marginRight: 10,
  },
  eyeButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeButtonText: {
    color: Colors.gray,
  },
  buttonGroup: {
    marginTop: 30,
    gap: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  signInButton: {
    backgroundColor: Colors.primary,
  },
  signInButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: Colors.secondary,
  },
  signUpButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  infoSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '600',
    color: Colors.text,
  },
});
});