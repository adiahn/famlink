import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Shield, Heart, TreePine } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';

const { width, height } = Dimensions.get('window');

export default function Welcome() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Auto-navigate based on authentication status
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.push('/auth/login');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <LinearGradient
      colors={['#1e40af', '#2563eb', '#3b82f6']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <TreePine size={60} color="#ffffff" strokeWidth={2} />
          <Text style={styles.logoText}>FamLink</Text>
          <Text style={styles.tagline}>Connect. Verify. Belong.</Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Shield size={24} color="#ffffff" strokeWidth={2} />
            <Text style={styles.featureText}>Verified Identity</Text>
          </View>
          <View style={styles.feature}>
            <Users size={24} color="#ffffff" strokeWidth={2} />
            <Text style={styles.featureText}>Family Network</Text>
          </View>
          <View style={styles.feature}>
            <Heart size={24} color="#ffffff" strokeWidth={2} />
            <Text style={styles.featureText}>Privacy First</Text>
          </View>
        </View>

        <Pressable
          style={styles.getStartedButton}
          onPress={() => {
            if (isAuthenticated) {
              router.replace('/(tabs)');
            } else {
              router.push('/auth/login');
            }
          }}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 16,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: '#e0e7ff',
    marginTop: 8,
    fontWeight: '500',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 60,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  getStartedButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  getStartedText: {
    color: '#2563eb',
    fontSize: 18,
    fontWeight: '700',
  },
});