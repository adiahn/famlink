import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  TreePine, 
  Users, 
  UserPlus, 
  Bell, 
  Shield, 
  Heart,
  TrendingUp,
  ArrowRight,
  Copy,
  Link,
  Share2,
  X,
  Check
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';

const { width } = Dimensions.get('window');

// Dynamic stats based on family data
const getStatsData = (family: any) => {
  if (!family) {
    return [
      { icon: Users, label: 'Family Members', value: '0', color: '#2563eb' },
      { icon: TrendingUp, label: 'Linked Families', value: '0', color: '#059669' },
      { icon: Shield, label: 'Verified', value: '0', color: '#ea580c' },
    ];
  }

  const verifiedCount = family.members.filter((member: any) => member.isVerified).length;
  
  return [
    { icon: Users, label: 'Family Members', value: family.members.length.toString(), color: '#2563eb' },
    { icon: TrendingUp, label: 'Linked Families', value: (family.linkedFamilies?.length || 0).toString(), color: '#059669' },
    { icon: Shield, label: 'Verified', value: verifiedCount.toString(), color: '#ea580c' },
  ];
};



export default function Home() {
  const { user, accessToken } = useAuthStore();
  const { family, getMyFamily, linkFamily, validateJoinId, isLoading } = useFamilyStore();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkageId, setLinkageId] = useState('');
  const [validationData, setValidationData] = useState<any>(null);

  // Load family data on component mount
  useEffect(() => {
    if (accessToken) {
      getMyFamily(accessToken);
    }
  }, [accessToken]);

  const handleValidateJoinId = async () => {
    if (!linkageId.trim()) {
      Alert.alert('Error', 'Please enter a Join ID');
      return;
    }

    if (!accessToken) {
      Alert.alert('Error', 'You must be logged in to validate Join IDs');
      return;
    }

    try {
      const result = await validateJoinId(linkageId, accessToken);
      
      if (result.success && result.isValid) {
        setValidationData(result);
        Alert.alert(
          'Join ID Valid',
          `You are about to link your family with ${result.memberName || 'Unknown Member'} from ${result.familyName || 'Unknown Family'}. Do you want to proceed?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Link Family', onPress: handleLinkFamily }
          ]
        );
      } else {
        Alert.alert('Invalid Join ID', result.message || 'The Join ID is invalid or has already been used.');
      }
    } catch (error) {
      console.error('Validate Join ID error:', error);
      Alert.alert('Error', 'Failed to validate Join ID. Please try again.');
    }
  };

  const handleLinkFamily = async () => {
    if (!linkageId.trim()) {
      Alert.alert('Error', 'Please enter a Join ID');
      return;
    }

    if (!accessToken) {
      Alert.alert('Error', 'You must be logged in to link families');
      return;
    }

    const result = await linkFamily(linkageId, accessToken);
    
    if (result.success) {
      Alert.alert(
        'Family Linked Successfully!',
        result.message,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowLinkModal(false);
              setLinkageId('');
              setValidationData(null);
            },
          },
        ]
      );
    } else {
      Alert.alert('Link Failed', result.message);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>
              {user ? `${user.firstName} ${user.lastName}` : 'User'}
            </Text>
          </View>
          <Pressable style={styles.notificationButton} onPress={() => router.push('/(tabs)/notifications')}>
            <Bell size={24} color="#64748b" strokeWidth={2} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.statsContainer}>
          {getStatsData(family).map((stat: any, index: number) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
                <stat.icon size={24} color={stat.color} strokeWidth={2} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>



        {!family || family.members.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Users size={48} color="#94a3b8" strokeWidth={2} />
            </View>
            <Text style={styles.emptyStateTitle}>No Family Data</Text>
            <Text style={styles.emptyStateMessage}>
              You haven't added any family members yet. Start by adding yourself and your immediate family to create your family tree.
            </Text>
            <Pressable 
              style={styles.emptyStateButton}
              onPress={() => router.push('/(tabs)/tree')}
            >
              <UserPlus size={20} color="#ffffff" strokeWidth={2} />
              <Text style={styles.emptyStateButtonText}>Add Family Members</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <View style={styles.actionGrid}>
              <Pressable 
                style={[styles.actionCard, { backgroundColor: '#2563eb' }]}
                onPress={() => setShowLinkModal(true)}
              >
                <Link size={32} color="#ffffff" strokeWidth={2} />
                <Text style={styles.actionCardTitle}>Link Family</Text>
                <Text style={styles.actionCardSubtitle}>Connect with other family trees</Text>
              </Pressable>

              <Pressable 
                style={[styles.actionCard, { backgroundColor: '#059669' }]}
                onPress={() => router.push('/(tabs)/tree')}
              >
                <TreePine size={32} color="#ffffff" strokeWidth={2} />
                <Text style={styles.actionCardTitle}>View Family Tree</Text>
                <Text style={styles.actionCardSubtitle}>Explore your network</Text>
              </Pressable>
            </View>
          </View>
        )}




      </ScrollView>

      {/* Link Family Modal */}
      <Modal
        visible={showLinkModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLinkModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Link Family Tree</Text>
              <Pressable onPress={() => setShowLinkModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Enter the Join ID of any family creator to link your family tree with theirs. This will allow both families to see each other's members and create a complete family network. You need the Join ID of the person who created their family tree.
              </Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter Join ID (e.g., MARY002)"
                  value={linkageId}
                  onChangeText={setLinkageId}
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="characters"
                />
              </View>
              
              <View style={styles.modalInfo}>
                <Text style={styles.modalInfoTitle}>💡 How it works:</Text>
                <Text style={styles.modalInfoText}>
                  1. Ask any family creator for their Join ID{'\n'}
                  2. Enter it here to link your family to theirs{'\n'}
                  3. Both families will see each other's members{'\n'}
                  4. All descendants get access to the complete network{'\n'}
                  5. Only family creators can link their families
                </Text>
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <Pressable 
                style={styles.modalButton} 
                onPress={handleValidateJoinId}
              >
                <Link size={20} color="#ffffff" strokeWidth={2} />
                <Text style={styles.modalButtonText}>Link Family</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  greeting: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  quickActions: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionCardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionCardSubtitle: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.9,
    textAlign: 'center',
  },
  activitySection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#64748b',
  },
  joinIdSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  joinIdHeader: {
    marginBottom: 16,
  },
  joinIdSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  joinIdCard: {
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
  joinIdDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  joinIdText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
  },
  joinIdActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalClose: {
    fontSize: 24,
    color: '#64748b',
    fontWeight: '300',
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalInfo: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
  },
  modalInfoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 8,
  },
  modalInfoText: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 18,
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});