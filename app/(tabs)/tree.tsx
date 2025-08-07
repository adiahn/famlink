import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Image,
  Animated,
  Modal,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { Colors } from '../../constants/Colors';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import FamilyTreeView from '../../components/FamilyTreeView';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Heart,
  Crown,
  Camera,
  X,
  Save,
  RefreshCw,
  Copy,
  Share2,
  Link,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface AddMemberForm {
  firstName: string;
  lastName: string;
  relationship: string;
  birthYear: string;
  isDeceased: boolean;
  deathYear: string;
  avatar?: string;
}

interface FamilyNode {
  id: string;
  name: string;
  relationship: string;
  birthYear: string;
  isDeceased: boolean;
  deathYear?: string;
  isVerified: boolean;
  isFamilyCreator: boolean;
  joinId: string;
  avatar?: string;
  children: FamilyNode[];
  spouse?: FamilyNode;
  parents?: FamilyNode[];
  siblings?: FamilyNode[];
}

export default function TreeScreen() {
  const { accessToken } = useAuthStore();
  const { 
    family, 
    isLoading, 
    error, 
    selectedMember, 
    expandedNodes,
    getMyFamily, 
    addMember, 
    generateJoinId,
    setSelectedMember, 
    toggleExpandedNode 
  } = useFamilyStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showJoinIdModal, setShowJoinIdModal] = useState(false);
  const [selectedMemberForJoinId, setSelectedMemberForJoinId] = useState<any>(null);
  const [generatedJoinId, setGeneratedJoinId] = useState<string>('');
  const [formData, setFormData] = useState<AddMemberForm>({
    firstName: '',
    lastName: '',
    relationship: '',
    birthYear: '',
    isDeceased: false,
    deathYear: '',
  });

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
    console.log('Loading family data...');
    console.log('Access token:', accessToken ? 'Present' : 'Missing');
    if (accessToken) {
      const result = await getMyFamily(accessToken);
      console.log('Load family result:', result);
    }
  };

  const handleAddMember = async () => {
    if (!formData.firstName || !formData.lastName || !formData.relationship || !formData.birthYear) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (!accessToken) {
      Alert.alert('Authentication Error', 'Please log in again.');
      return;
    }

    if (!family) {
      Alert.alert('Error', 'No family data available.');
      return;
    }

    // Parent requirement validation
    const hasParents = family.members.some(member =>
      member.relationship.toLowerCase().includes('father') ||
      member.relationship.toLowerCase().includes('mother') ||
      member.relationship.toLowerCase().includes('wife')
    );

    const isAddingParent = formData.relationship.toLowerCase().includes('father') ||
                          formData.relationship.toLowerCase().includes('mother') ||
                          formData.relationship.toLowerCase().includes('wife');

    if (!hasParents && !isAddingParent) {
      Alert.alert(
        'Parents Required',
        'You must add at least one parent (Father, Mother, or Wife) before adding other family members. Please add a parent first.',
        [
          { text: 'OK', style: 'default' },
          {
            text: 'Add Parent Now',
            onPress: () => {
              setFormData({
                ...formData,
                relationship: 'Father'
              });
            }
          }
        ]
      );
      return;
    }

    // Auto-assign wife number if adding a wife
    let finalRelationship = formData.relationship;
    if (formData.relationship.toLowerCase().includes('wife')) {
      const existingWives = family.members.filter(member =>
        member.relationship.toLowerCase().includes('wife')
      );
      const wifeNumber = existingWives.length + 1;
      finalRelationship = `Wife${wifeNumber}`;
    }

    const memberData = {
      ...formData,
      relationship: finalRelationship
    };

    const result = await addMember(family.id, memberData, accessToken);
    
    if (result.success) {
      setShowAddModal(false);
      resetForm();
      Alert.alert('Success', 'Family member added successfully!');
    } else {
      Alert.alert('Error', result.message || 'Failed to add family member');
    }
  };

  const handleTakePicture = async () => {
    // TODO: Implement image picker
    Alert.alert('Coming Soon', 'Photo upload feature will be available soon!');
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      relationship: '',
      birthYear: '',
      isDeceased: false,
      deathYear: '',
    });
  };

  const handleGenerateJoinId = async (member: any) => {
    if (!accessToken || !family?.id) {
      Alert.alert('Error', 'You must be logged in to generate Join IDs');
      return;
    }

    setSelectedMemberForJoinId(member);
    setShowJoinIdModal(true);

    try {
      const result = await generateJoinId(family.id, member.id, accessToken);
      
      if (result.success && result.joinId) {
        setGeneratedJoinId(result.joinId);
      } else {
        Alert.alert('Error', result.message || 'Failed to get Join ID');
      }
    } catch (error) {
      console.error('Get Join ID error:', error);
      Alert.alert('Error', 'Failed to get Join ID. Please try again.');
    }
  };

  const handleCopyJoinId = () => {
    if (generatedJoinId) {
      // In React Native, you would use Clipboard API
      Alert.alert('Copied!', 'Join ID copied to clipboard');
    }
  };

  const handleShareJoinId = () => {
    if (generatedJoinId) {
      // In React Native, you would use Share API
      Alert.alert('Share', 'Share functionality would open native share dialog');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading family tree...</Text>
          </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadFamilyData}>
          <Text style={{ color: Colors.white }}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!family || !family.members || family.members.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No family members found</Text>
        <Text style={styles.debugText}>Add your first family member to get started</Text>
        <Pressable style={styles.retryButton} onPress={loadFamilyData}>
          <Text style={{ color: Colors.white }}>Refresh</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Family Tree</Text>
        <View style={styles.headerButtons}>
          <Pressable onPress={loadFamilyData} style={styles.refreshButton}>
            <RefreshCw size={20} color={Colors.primary} />
          </Pressable>
          <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Plus size={24} color={Colors.white} />
          </Pressable>
                  </View>
              </View>

      <View style={styles.content}>
        <FamilyTreeView 
          familyMembers={family.members} 
          onMemberSelect={(memberId) => {
            const member = family.members.find(m => m.id === memberId);
            if (member) {
              handleGenerateJoinId(member);
            }
          }}
        />
            </View>
      
      {/* Add Member Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Family Member</Text>
            <Pressable style={styles.closeButton} onPress={() => setShowAddModal(false)}>
              <X size={24} color={Colors.text} />
            </Pressable>
          </View>
          
          <View style={styles.modalContent}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                  <Pressable style={styles.avatarButton} onPress={handleTakePicture}>
                    {formData.avatar ? (
                      <Image source={{ uri: formData.avatar }} style={styles.selectedAvatar} />
                    ) : (
                      <View style={{ 
                        width: '100%', 
                        height: '100%', 
                        backgroundColor: Colors.lightGray,
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <Camera size={32} color={Colors.gray} />
                  </View>
                )}
                  </Pressable>
                  <Text style={styles.avatarLabel}>Tap to add photo</Text>
                  </View>

                {/* Form Fields */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>First Name *</Text>
                  <Input
                    value={formData.firstName}
                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                    placeholder="Enter first name"
                  />
            </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Last Name *</Text>
                  <Input
                    value={formData.lastName}
                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                    placeholder="Enter last name"
                  />
              </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Relationship *</Text>
                  <Input
                    value={formData.relationship}
                    onChangeText={(text) => setFormData({ ...formData, relationship: text })}
                    placeholder="e.g., Father, Mother, Brother, Sister"
                  />
                  {family && !family.members.some(member => 
                    member.relationship.toLowerCase().includes('father') || 
                    member.relationship.toLowerCase().includes('mother') ||
                    member.relationship.toLowerCase().includes('wife')
                  ) && (
                    <Text style={styles.helperText}>
                      ⚠️ You must add at least one parent (Father, Mother, or Wife) first
                  </Text>
              )}
            </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Birth Year *</Text>
                  <Input
                    value={formData.birthYear}
                    onChangeText={(text) => setFormData({ ...formData, birthYear: text })}
                    placeholder="e.g., 1990"
                    keyboardType="numeric"
                  />
        </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Deceased</Text>
                  <View style={styles.deceasedContainer}>
            <Pressable 
                      style={[
                        styles.deceasedButton,
                        !formData.isDeceased && styles.deceasedButtonActive
                      ]}
                      onPress={() => setFormData({ ...formData, isDeceased: false })}
                    >
                      <Text style={[
                        styles.deceasedButtonText,
                        !formData.isDeceased && styles.deceasedButtonTextActive
                      ]}>
                        No
                      </Text>
            </Pressable>
            <Pressable 
                      style={[
                        styles.deceasedButton,
                        formData.isDeceased && styles.deceasedButtonActive
                      ]}
                      onPress={() => setFormData({ ...formData, isDeceased: true })}
                    >
                      <Text style={[
                        styles.deceasedButtonText,
                        formData.isDeceased && styles.deceasedButtonTextActive
                      ]}>
                        Yes
                      </Text>
          </Pressable>
          </View>
        </View>

                {formData.isDeceased && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Death Year</Text>
                    <Input
                      value={formData.deathYear}
                      onChangeText={(text) => setFormData({ ...formData, deathYear: text })}
                      placeholder="e.g., 2020"
                      keyboardType="numeric"
                    />
                </View>
              )}
              </ScrollView>
            </KeyboardAvoidingView>
      </View>

          <View style={styles.modalFooter}>
            <Button
              onPress={handleAddMember}
              style={styles.saveButton}
              disabled={isLoading}
            >
              <Save size={20} color={Colors.white} style={styles.buttonIcon} />
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Adding...' : 'Add Member'}
          </Text>
            </Button>
      </View>
        </View>
      </Modal>

      {/* Join ID Modal */}
      <Modal
        visible={showJoinIdModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Generate Join ID</Text>
                  <Pressable
              style={styles.closeButton}
              onPress={() => {
                setShowJoinIdModal(false);
                setSelectedMemberForJoinId(null);
                setGeneratedJoinId('');
              }}
            >
              <X size={24} color={Colors.text} />
        </Pressable>
      </View>

          <ScrollView style={styles.modalContent}>
            {selectedMemberForJoinId && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Selected Member</Text>
                <View style={styles.memberCard}>
                  <Text style={styles.memberName}>{selectedMemberForJoinId.name}</Text>
                  <Text style={styles.memberRelationship}>{selectedMemberForJoinId.relationship}</Text>
                  <Text style={styles.memberId}>ID: {selectedMemberForJoinId.joinId}</Text>
                </View>
              </View>
            )}

            {generatedJoinId && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Generated Join ID</Text>
                <View style={styles.joinIdContainer}>
                  <Text style={styles.joinIdText}>{generatedJoinId}</Text>
                  <View style={styles.joinIdActions}>
                    <Pressable style={styles.copyButton} onPress={handleCopyJoinId}>
                      <Copy size={20} color={Colors.white} />
                      <Text style={styles.copyButtonText}>Copy</Text>
                    </Pressable>
                    <Pressable style={styles.shareButton} onPress={handleShareJoinId}>
                      <Share2 size={20} color={Colors.white} />
                      <Text style={styles.shareButtonText}>Share</Text>
                    </Pressable>
                  </View>
                </View>
                <Text style={styles.helperText}>
                  Share this Join ID with the person you want to link families with. They can use this code on their home page to connect their family tree to yours.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: Colors.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    overflow: 'hidden',
  },
  selectedAvatar: {
    width: '100%',
    height: '100%',
  },
  avatarLabel: {
    fontSize: 14,
    color: Colors.gray,
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
  helperText: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 4,
    fontStyle: 'italic',
  },
  deceasedContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  deceasedButton: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deceasedButtonActive: {
    backgroundColor: Colors.primary,
  },
  deceasedButtonText: {
    color: Colors.gray,
    fontWeight: '600',
  },
  deceasedButtonTextActive: {
    color: Colors.white,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  memberCard: {
    backgroundColor: Colors.lightGray,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  memberRelationship: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 4,
  },
  memberId: {
    fontSize: 12,
    color: Colors.gray,
    fontFamily: 'monospace',
  },
  joinIdContainer: {
    backgroundColor: Colors.lightGray,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  joinIdText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  joinIdActions: {
    flexDirection: 'row',
    gap: 12,
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  copyButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  shareButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});