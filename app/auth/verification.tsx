import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, CircleCheck as CheckCircle, Clock } from 'lucide-react-native';

export default function Verification() {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  useEffect(() => {
    // Simulate verification process
    const timer = setTimeout(() => {
      setVerificationStatus('success');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {verificationStatus === 'pending' && (
            <Clock size={60} color="#ea580c" strokeWidth={2} />
          )}
          {verificationStatus === 'success' && (
            <CheckCircle size={60} color="#059669" strokeWidth={2} />
          )}
          {verificationStatus === 'failed' && (
            <Shield size={60} color="#dc2626" strokeWidth={2} />
          )}
        </View>

        <Text style={styles.title}>
          {verificationStatus === 'pending' && 'Verifying Your Identity'}
          {verificationStatus === 'success' && 'Verification Successful'}
          {verificationStatus === 'failed' && 'Verification Failed'}
        </Text>

        <Text style={styles.description}>
          {verificationStatus === 'pending' && 
            'We are verifying your government-issued ID with official databases. This may take a few moments.'}
          {verificationStatus === 'success' && 
            'Your identity has been successfully verified. Welcome to FamLink!'}
          {verificationStatus === 'failed' && 
            'We could not verify your identity. Please check your ID details and try again.'}
        </Text>

        {verificationStatus === 'pending' && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBar}>
              <View style={styles.loadingProgress} />
            </View>
            <Text style={styles.loadingText}>Checking with government databases...</Text>
          </View>
        )}

        {verificationStatus === 'success' && (
          <View style={styles.successInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Account Created:</Text>
              <Text style={styles.infoValue}>Successfully</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Next Step:</Text>
              <Text style={styles.infoValue}>Create Your Family</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={[styles.infoValue, styles.verifiedText]}>✓ Ready to Continue</Text>
            </View>
          </View>
        )}

        {verificationStatus === 'success' && (
          <Pressable style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue to FamLink</Text>
          </Pressable>
        )}

        {verificationStatus === 'failed' && (
          <Pressable 
            style={styles.retryButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#ea580c',
    borderRadius: 2,
    width: '70%',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  successInfo: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  verifiedText: {
    color: '#059669',
  },
  continueButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 24,
    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});