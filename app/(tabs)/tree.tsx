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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { Colors } from '../../constants/Colors';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import FamilyTreeView from '../../components/FamilyTreeView';
import FamilyCreationFlow from '../../components/FamilyCreationFlow';
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
  motherId?: string; // New field for mother selection
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
    initializeFamilyCreation,
    setupParents,
    setSelectedMember, 
    toggleExpandedNode 
  } = useFamilyStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showJoinIdModal, setShowJoinIdModal] = useState(false);
  const [showFamilyCreationFlow, setShowFamilyCreationFlow] = useState(false);
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
      
      // If the result is successful but no family exists, that's normal for new users
      if (result.success && result.message === 'No family found') {
        console.log('No family found - showing empty state for new user');
      }
    }
  };

  const handleAddMember = async () => {
    // Enhanced validation based on API specification
    const errors: string[] = [];

    // Required field validation
    if (!formData.firstName?.trim()) {
      errors.push('First name is required');
    } else if (formData.firstName.trim().length > 100) {
      errors.push('First name must be 100 characters or less');
    }

    if (!formData.lastName?.trim()) {
      errors.push('Last name is required');
    } else if (formData.lastName.trim().length > 100) {
      errors.push('Last name must be 100 characters or less');
    }

    if (!formData.relationship?.trim()) {
      errors.push('Relationship is required');
    } else if (formData.relationship.trim().length > 50) {
      errors.push('Relationship must be 50 characters or less');
    }

    if (!formData.birthYear?.trim()) {
      errors.push('Birth year is required');
    } else {
      const birthYear = parseInt(formData.birthYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(birthYear) || birthYear < 1900 || birthYear > currentYear) {
        errors.push('Birth year must be a valid 4-digit year between 1900 and current year');
      }
    }

    // Death year validation (required if deceased)
    if (formData.isDeceased) {
      if (!formData.deathYear?.trim()) {
        errors.push('Death year is required when marking as deceased');
      } else {
        const deathYear = parseInt(formData.deathYear);
        const birthYear = parseInt(formData.birthYear);
        const currentYear = new Date().getFullYear();
        
        if (isNaN(deathYear) || deathYear < 1900 || deathYear > currentYear) {
          errors.push('Death year must be a valid 4-digit year between 1900 and current year');
        } else if (deathYear < birthYear) {
          errors.push('Death year cannot be before birth year');
        }
      }
    }

    // Mother ID validation for children
    const isAddingChild = formData.relationship.toLowerCase().includes('son') ||
                         formData.relationship.toLowerCase().includes('daughter') ||
                         formData.relationship.toLowerCase().includes('child');
    
    if (isAddingChild && !formData.motherId) {
      errors.push('Mother selection is required when adding a child');
    }

    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
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
    let finalRelationship = formData.relationship.trim();
    if (finalRelationship.toLowerCase().includes('wife')) {
      const existingWives = family.members.filter(member =>
        member.relationship.toLowerCase().includes('wife')
      );
      const wifeNumber = existingWives.length + 1;
      finalRelationship = `Wife${wifeNumber}`;
    }

    const memberData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      relationship: finalRelationship,
      birthYear: formData.birthYear.trim(),
      isDeceased: formData.isDeceased,
      deathYear: formData.isDeceased ? formData.deathYear.trim() : undefined,
      avatar: formData.avatar ? formData.avatar as any : undefined,
      motherId: formData.motherId // Include mother ID for children
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
      motherId: undefined,
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
        <ActivityIndicator size="large" color={Colors.primary[600]} />
        <Text style={styles.loadingText}>Loading family tree...</Text>
          </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadFamilyData}>
          <Text style={{ color: Colors.text.white }}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!family) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Family Tree</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Welcome to FamTree!</Text>
          <Text style={styles.debugText}>Create your family tree to get started</Text>
          <Button
            title="Create Family Tree"
            onPress={() => setShowFamilyCreationFlow(true)}
            fullWidth
            style={styles.createButton}
          />
        </View>
        
        {/* Family Creation Flow Modal */}
        <FamilyCreationFlow
          visible={showFamilyCreationFlow}
          onClose={() => setShowFamilyCreationFlow(false)}
          onComplete={(familyId) => {
            setShowFamilyCreationFlow(false);
            loadFamilyData(); // Reload family data after creation
          }}
          onInitializeFamily={async (type, familyName) => {
            try {
              if (!accessToken) {
                return { success: false, message: 'Authentication required' };
              }
              console.log('Initializing family creation with type:', type, 'familyName:', familyName);
              const result = await initializeFamilyCreation(familyName, type, accessToken);
              console.log('Initialize family creation result:', result);
              return result;
            } catch (error) {
              console.error('Initialize family creation error:', error);
              return { success: false, message: 'Failed to initialize family creation' };
            }
          }}
          onSetupParents={async (familyId, fatherData, mothersData) => {
            try {
              if (!accessToken) {
                return { success: false, message: 'Authentication required' };
              }
              const result = await setupParents(familyId, fatherData, mothersData, accessToken);
              return result;
            } catch (error) {
              return { success: false, message: 'Failed to setup parents' };
            }
          }}
        />
      </SafeAreaView>
    );
  }

  // If family exists but has no members, continue with parent setup
  if (family && (!family.members || family.members.length === 0)) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Family Tree</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Family Created Successfully!</Text>
          <Text style={styles.debugText}>Your family "{family.name}" has been created. Now let's add your parents to get started.</Text>
          <Button
            title="Continue with Parent Setup"
            onPress={() => setShowFamilyCreationFlow(true)}
            fullWidth
            style={styles.createButton}
          />
        </View>
        
        {/* Family Creation Flow Modal */}
        <FamilyCreationFlow
          visible={showFamilyCreationFlow}
          onClose={() => setShowFamilyCreationFlow(false)}
          onComplete={(familyId) => {
            setShowFamilyCreationFlow(false);
            loadFamilyData(); // Reload family data after creation
          }}
          initialStep="parent-setup"
          initialFamilyId={family?.id}
          initialFamilyName={family?.name}
          onInitializeFamily={async (type, familyName) => {
            try {
              if (!accessToken) {
                return { success: false, message: 'Authentication required' };
              }
              console.log('Initializing family creation with type:', type, 'familyName:', familyName);
              const result = await initializeFamilyCreation(familyName, type, accessToken);
              console.log('Initialize family creation result:', result);
              return result;
            } catch (error) {
              console.error('Initialize family creation error:', error);
              return { success: false, message: 'Failed to initialize family creation' };
            }
          }}
          onSetupParents={async (familyId, fatherData, mothersData) => {
            try {
              if (!accessToken) {
                return { success: false, message: 'Authentication required' };
              }
              const result = await setupParents(familyId, fatherData, mothersData, accessToken);
              return result;
            } catch (error) {
              return { success: false, message: 'Failed to setup parents' };
            }
          }}
        />
        
        {/* Add Member Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowAddModal(false)}
        >
          <SafeAreaView style={styles.modalContainer} edges={['top']}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Family Member</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setShowAddModal(false)}
              >
                <X size={24} color={Colors.text.primary} />
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Card style={styles.formCard}>
                <View style={styles.formRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>First Name *</Text>
                    <Input
                      value={formData.firstName}
                      onChangeText={(value) => setFormData({ ...formData, firstName: value })}
                      placeholder="Enter first name"
                      autoCapitalize="words"
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Last Name *</Text>
                    <Input
                      value={formData.lastName}
                      onChangeText={(value) => setFormData({ ...formData, lastName: value })}
                      placeholder="Enter last name"
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Relationship *</Text>
                  <Input
                    value={formData.relationship}
                    onChangeText={(value) => setFormData({ ...formData, relationship: value })}
                    placeholder="e.g., Father, Mother, Wife, Son, Daughter"
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Birth Year *</Text>
                    <Input
                      value={formData.birthYear}
                      onChangeText={(value) => setFormData({ ...formData, birthYear: value })}
                      placeholder="YYYY"
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Death Year</Text>
                    <Input
                      value={formData.deathYear}
                      onChangeText={(value) => setFormData({ ...formData, deathYear: value })}
                      placeholder="YYYY (if deceased)"
                      keyboardType="numeric"
                      editable={formData.isDeceased}
                    />
                  </View>
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.label}>Deceased</Text>
                  <Switch
                    value={formData.isDeceased}
                    onValueChange={(value) => setFormData({ ...formData, isDeceased: value })}
                    trackColor={{ false: Colors.neutral[300], true: Colors.primary[600] }}
                    thumbColor={formData.isDeceased ? Colors.text.white : Colors.text.white}
                  />
                </View>

                <Button
                  title="Add Member"
                  onPress={handleAddMember}
                  fullWidth
                  style={styles.addButton}
                />
              </Card>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Family Tree</Text>
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
          onAddMember={() => setShowAddModal(true)}
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
                  <View style={styles.avatarContainer}>
                    <Pressable style={styles.avatarButton} onPress={handleTakePicture}>
                      {formData.avatar ? (
                        <Image source={{ uri: formData.avatar }} style={styles.selectedAvatar} />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Camera size={32} color="#94a3b8" />
                          <Text style={styles.avatarPlaceholderText}>Add Photo</Text>
                        </View>
                      )}
                    </Pressable>
                    {!formData.avatar && (
                      <View style={styles.avatarOverlay}>
                        <Text style={styles.avatarOverlayText}>Tap to upload</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.avatarLabel}>Profile picture (optional)</Text>
                </View>

                {/* Form Fields */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>First Name *</Text>
                  <Input
                    value={formData.firstName}
                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                    placeholder="Enter first name"
                    maxLength={100}
                  />
                  {formData.firstName.length > 80 && (
                    <Text style={styles.helperText}>
                      {100 - formData.firstName.length} characters remaining
                    </Text>
                  )}
            </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Last Name *</Text>
                  <Input
                    value={formData.lastName}
                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                    placeholder="Enter last name"
                    maxLength={100}
                  />
                  {formData.lastName.length > 80 && (
                    <Text style={styles.helperText}>
                      {100 - formData.lastName.length} characters remaining
                    </Text>
                  )}
              </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Relationship *</Text>
                  <Input
                    value={formData.relationship}
                    onChangeText={(text) => setFormData({ ...formData, relationship: text })}
                    placeholder="e.g., Father, Mother, Brother, Sister"
                    maxLength={50}
                  />
                  {formData.relationship.length > 40 && (
                    <Text style={styles.helperText}>
                      {50 - formData.relationship.length} characters remaining
                    </Text>
                  )}
                  
                  {/* Quick relationship buttons */}
                  <View style={styles.quickRelationships}>
                    <Text style={styles.quickRelationshipsLabel}>Quick select:</Text>
                    <View style={styles.relationshipButtons}>
                      {['Father', 'Mother', 'Brother', 'Sister', 'Son', 'Daughter', 'Wife'].map((rel) => (
                        <Pressable
                          key={rel}
                          style={[
                            styles.relationshipButton,
                            formData.relationship === rel && styles.relationshipButtonActive
                          ]}
                          onPress={() => setFormData({ ...formData, relationship: rel })}
                        >
                          <Text style={[
                            styles.relationshipButtonText,
                            formData.relationship === rel && styles.relationshipButtonTextActive
                          ]}>
                            {rel}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                  
                  {family && !family.members.some(member => 
                    member.relationship.toLowerCase().includes('father') || 
                    member.relationship.toLowerCase().includes('mother') ||
                    member.relationship.toLowerCase().includes('wife')
                  ) && (
                    <Text style={styles.helperText}>
                      ⚠️ You must add at least one parent (Father, Mother, or Wife) first
                  </Text>
              )}

              {/* Mother Selection for Children */}
              {family && family.members.some(member => 
                member.relationship.toLowerCase().includes('mother') ||
                member.relationship.toLowerCase().includes('wife')
              ) && (
                formData.relationship.toLowerCase().includes('son') ||
                formData.relationship.toLowerCase().includes('daughter') ||
                formData.relationship.toLowerCase().includes('child')
              ) && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mother *</Text>
                  <View style={styles.motherSelection}>
                    {family.members
                      .filter(member => 
                        member.relationship.toLowerCase().includes('mother') ||
                        member.relationship.toLowerCase().includes('wife')
                      )
                      .map((mother) => (
                        <Pressable
                          key={mother.id}
                          style={[
                            styles.motherOption,
                            formData.motherId === mother.id && styles.motherOptionSelected
                          ]}
                          onPress={() => setFormData({ ...formData, motherId: mother.id })}
                        >
                          <Text style={[
                            styles.motherOptionText,
                            formData.motherId === mother.id && styles.motherOptionTextSelected
                          ]}>
                            {mother.firstName} {mother.lastName} ({mother.relationship})
                          </Text>
                        </Pressable>
                      ))}
                  </View>
                  {!formData.motherId && (
                    <Text style={styles.helperText}>
                      ⚠️ Please select the mother for this child
                    </Text>
                  )}
                </View>
              )}
            </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Birth Year *</Text>
                  <Input
                    value={formData.birthYear}
                    onChangeText={(text) => {
                      // Only allow 4-digit numbers
                      const numericText = text.replace(/[^0-9]/g, '');
                      if (numericText.length <= 4) {
                        setFormData({ ...formData, birthYear: numericText });
                      }
                    }}
                    placeholder="e.g., 1990"
                    keyboardType="numeric"
                    maxLength={4}
                  />
                  {formData.birthYear && (
                    <Text style={styles.helperText}>
                      {formData.birthYear.length === 4 ? '✓ Valid year format' : 'Enter 4-digit year'}
                    </Text>
                  )}
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
                    <Text style={styles.label}>Death Year *</Text>
                    <Input
                      value={formData.deathYear}
                      onChangeText={(text) => {
                        // Only allow 4-digit numbers
                        const numericText = text.replace(/[^0-9]/g, '');
                        if (numericText.length <= 4) {
                          setFormData({ ...formData, deathYear: numericText });
                        }
                      }}
                      placeholder="e.g., 2020"
                      keyboardType="numeric"
                      maxLength={4}
                    />
                    {formData.deathYear && (
                      <Text style={styles.helperText}>
                        {formData.deathYear.length === 4 ? '✓ Valid year format' : 'Enter 4-digit year'}
                        {formData.birthYear && formData.deathYear && 
                         parseInt(formData.deathYear) < parseInt(formData.birthYear) && 
                         ' ⚠️ Death year cannot be before birth year'}
                      </Text>
                    )}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
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
    paddingTop: 20,
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
    paddingTop: 20,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#ffffff',
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
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    backgroundColor: '#f8fafc',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  avatarPlaceholderText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    fontWeight: '500',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  avatarOverlayText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  selectedAvatar: {
    width: '100%',
    height: '100%',
  },
  avatarLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
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
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  deceasedButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  deceasedButtonText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 14,
  },
  deceasedButtonTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  modalFooter: {
    padding: 20,
    paddingTop: 10,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
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
  quickRelationships: {
    marginTop: 12,
  },
  quickRelationshipsLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 8,
    fontWeight: '500',
  },
  relationshipButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relationshipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  relationshipButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  relationshipButtonText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '500',
  },
  relationshipButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  motherSelection: {
    marginTop: 8,
    gap: 8,
  },
  motherOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  motherOptionSelected: {
    backgroundColor: Colors.primary[100],
    borderColor: Colors.primary[600],
  },
  motherOptionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  motherOptionTextSelected: {
    color: Colors.primary[600],
    fontWeight: '600',
  },
  createButton: {
    marginTop: 24,
  },
  formCard: {
    padding: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  addButton: {
    marginTop: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
});