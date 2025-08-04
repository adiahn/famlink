import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, TextInput } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react-native';

export default function Verification() {
  const { verifyEmail, resendVerification, isLoading, clearError } = useAuthStore();
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState(''); // In a real app, this would come from the registration flow

  const handleVerifyEmail = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    clearError();
    const result = await verifyEmail({
      email: email || 'user@example.com', // In a real app, get this from registration
      verificationCode: verificationCode,
    });

    if (result.success) {
      Alert.alert(
        'Verification Successful',
        'Your email has been verified. Welcome to FamLink!',
        [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
      );
    } else {
      Alert.alert('Verification Failed', result.message);
    }
  };

  const handleResendCode = async () => {
    clearError();
    const result = await resendVerification(email || 'user@example.com');
    
    if (result.success) {
      Alert.alert('Code Sent', 'A new verification code has been sent to your email');
    } else {
      Alert.alert('Error', result.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          variant="ghost"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={Colors.primary} />
        </Button>
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Mail size={48} color={Colors.primary} />
          <Text style={styles.logoText}>Verify Your Email</Text>
          <Text style={styles.tagline}>Enter the code sent to your email</Text>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.codeInput}
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="Enter 6-digit code"
              keyboardType="numeric"
              maxLength={6}
              autoFocus
            />
          </View>

          <Button
            onPress={handleVerifyEmail}
            disabled={isLoading || !verificationCode.trim()}
            style={styles.verifyButton}
          >
            <Text style={styles.verifyButtonText}>
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Text>
          </Button>
        </Card>

        <Card style={styles.resendCard}>
          <Text style={styles.resendTitle}>Didn't receive the code?</Text>
          <Text style={styles.resendSubtitle}>
            Check your email spam folder or request a new code
          </Text>
          
          <Button
            variant="outline"
            onPress={handleResendCode}
            disabled={isLoading}
            style={styles.resendButton}
          >
            <RefreshCw size={16} color={Colors.primary} />
            <Text style={styles.resendButtonText}>Resend Code</Text>
          </Button>
        </Card>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Need Help?</Text>
          <Text style={styles.infoText}>
            If you're having trouble verifying your email, you can go back and try signing in with a different account.
          </Text>
          
          <Button
            variant="ghost"
            onPress={() => router.push('/auth/login')}
            style={styles.backToLoginButton}
          >
            <Text style={styles.backToLoginText}>Back to Sign In</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
  },
  formCard: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 8,
  },
  codeInput: {
    borderWidth: 2,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
    fontWeight: '600',
    color: Colors.dark,
  },
  verifyButton: {
    marginTop: 8,
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  resendSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resendButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  backToLoginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backToLoginText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});