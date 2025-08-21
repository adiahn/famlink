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
import { familyApi } from '../../api/familyApi';

const { width } = Dimensions.get('window');

interface AddMemberForm {
  firstName: string;
  lastName: string;
  relationship: string;
  birthYear: string;
  isDeceased: boolean;
  deathYear: string;
  avatar?: string;
  motherId?: string;
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
  const [availableMothers, setAvailableMothers] = useState<any[]>([]);
  const [isLoadingMothers, setIsLoadingMothers] = useState(false);
  const [showRelationshipDropdown, setShowRelationshipDropdown] = useState(false);
  const [showMotherDropdown, setShowMotherDropdown] = useState(false);

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
    console.log('Loading family data...');
    console.log('Access token:', accessToken ? 'Present' : 'Missing');
    if (accessToken) {
      const result = await getMyFamily(accessToken);
      console.log('Load family result:', result);
      
      if (result.success && result.message === 'No family found') {
        console.log('No family found - showing empty state for new user');
      }
    }
  };

  const loadAvailableMothers = async () => {
    if (!accessToken || !family?.id) return;
    
    setIsLoadingMothers(true);
    try {
      console.log('Loading available mothers for family:', family.id);
      const result = await familyApi.getAvailableMothers(family.id, accessToken);
      console.log('Available mothers API result:', result);
      if (result.success && result.data?.mothers) {
        console.log('Available mothers loaded:', result.data.mothers);
        setAvailableMothers(result.data.mothers);
      } else {
        console.log('No mothers from API, using family data as fallback');
        // Fallback: use mothers from family data
        const mothersFromFamily = family.members.filter(member => 
          member.relationship.toLowerCase().includes('mother') ||
          member.relationship.toLowerCase().includes('wife')
        ).map(mother => ({
          id: mother.id,
          name: mother.firstName + ' ' + mother.lastName,
          spouseOrder: mother.spouseOrder || 1,
          branchName: mother.relationship,
          childrenCount: 0
        }));
        console.log('Fallback mothers from family data:', mothersFromFamily);
        setAvailableMothers(mothersFromFamily);
      }
    } catch (error) {
      console.error('Load available mothers error:', error);
      // Fallback: use mothers from family data
      const mothersFromFamily = family.members.filter(member => 
        member.relationship.toLowerCase().includes('mother') ||
        member.relationship.toLowerCase().includes('wife')
      ).map(mother => ({
        id: mother.id,
        name: mother.firstName + ' ' + mother.lastName,
        spouseOrder: mother.spouseOrder || 1,
        branchName: mother.relationship,
        childrenCount: 0
      }));
      console.log('Fallback mothers from family data (error case):', mothersFromFamily);
      setAvailableMothers(mothersFromFamily);
    } finally {
      setIsLoadingMothers(false);
    }
  };

  // Load mothers when relationship changes to Child or when modal opens
  useEffect(() => {
    if (formData.relationship === 'Child' && family?.id && accessToken) {
      loadAvailableMothers();
    }
  }, [formData.relationship, family?.id, accessToken]);

  // Also load mothers when modal opens
  useEffect(() => {
    if (showAddModal && family?.id && accessToken) {
      loadAvailableMothers();
    }
  }, [showAddModal, family?.id, accessToken]);

  const getSelectedMotherName = () => {
    if (!formData.motherId) return '';
    const mother = availableMothers.find(m => m.id === formData.motherId);
    console.log('getSelectedMotherName - motherId:', formData.motherId);
    console.log('getSelectedMotherName - availableMothers:', availableMothers);
    console.log('getSelectedMotherName - found mother:', mother);
    return mother ? mother.name : '';
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
    setAvailableMothers([]);
  };

  const handleAddMember = async () => {
    const errors: string[] = [];

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

    if (formData.relationship === 'Child' && !formData.motherId) {
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

    const requestData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      relationship: formData.relationship.trim(),
      birthYear: formData.birthYear.trim(),
      isDeceased: formData.isDeceased,
      ...(formData.deathYear && formData.deathYear.trim() !== '' && { deathYear: formData.deathYear.trim() }),
      ...(formData.relationship === 'Child' && formData.motherId && { 
        motherId: formData.motherId,
        parentType: 'child' as const
      })
    };

    console.log('Adding member with data:', requestData);
    console.log('Form data motherId:', formData.motherId);
    console.log('Request data motherId:', requestData.motherId);

    const result = await addMember(family.id, requestData, accessToken);
    
    if (result.success) {
      setShowAddModal(false);
      resetForm();
      Alert.alert('Success', 'Family member added successfully!');
      loadFamilyData();
    } else {
      Alert.alert('Error', result.message || 'Failed to add family member');
    }
  };

  const handleGenerateJoinId = async (member: any) => {
    setSelectedMemberForJoinId(member);
    setShowJoinIdModal(true);
    
    if (!accessToken) {
      Alert.alert('Authentication Error', 'Please log in again.');
      return;
    }

    const result = await generateJoinId(member.id, accessToken);
    if (result.success) {
      setGeneratedJoinId(result.data?.joinId || '');
    } else {
      Alert.alert('Error', result.message || 'Failed to generate Join ID');
    }
  };

  const handleCopyJoinId = () => {
    // Copy to clipboard functionality
    Alert.alert('Copied!', 'Join ID copied to clipboard');
  };

  const handleShareJoinId = () => {
    // Share functionality
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  const handleTakePicture = () => {
    Alert.alert('Coming Soon', 'Photo upload feature will be available soon!');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
          <Text style={styles.loadingText}>Loading family tree...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error Loading Family Tree</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Button
            title="Retry"
            onPress={loadFamilyData}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!family) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Heart size={64} color={Colors.primary[600]} />
          </View>
          <Text style={styles.emptyTitle}>Welcome to FamTree!</Text>
          <Text style={styles.emptyMessage}>
            Start building your family tree by creating your first family
          </Text>
          <Button
            title="Create Family Tree"
            onPress={() => setShowFamilyCreationFlow(true)}
            fullWidth
            style={styles.createButton}
          />
        </View>
        
        <FamilyCreationFlow
          visible={showFamilyCreationFlow}
          onClose={() => setShowFamilyCreationFlow(false)}
          onComplete={(familyId) => {
            setShowFamilyCreationFlow(false);
            loadFamilyData();
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

  if (!family.members || family.members.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Crown size={64} color={Colors.primary[600]} />
          </View>
          <Text style={styles.emptyTitle}>Family Created Successfully!</Text>
          <Text style={styles.emptyMessage}>
            Now let's set up your family by adding parents
          </Text>
          <Button
            title="Continue with Parent Setup"
            onPress={() => setShowFamilyCreationFlow(true)}
            fullWidth
            style={styles.createButton}
          />
        </View>
        
        <FamilyCreationFlow
          visible={showFamilyCreationFlow}
          onClose={() => setShowFamilyCreationFlow(false)}
          onComplete={(familyId) => {
            setShowFamilyCreationFlow(false);
            loadFamilyData();
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
            <Pressable 
              style={{ flex: 1 }} 
              onPress={() => {
                setShowRelationshipDropdown(false);
                setShowMotherDropdown(false);
              }}
            >
              <View style={styles.formContainer}>
              {/* Basic Information */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                
                <View style={styles.formRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>First Name *</Text>
                    <Input
                      value={formData.firstName}
                      onChangeText={(value) => setFormData({ ...formData, firstName: value })}
                      placeholder="Enter first name"
                      autoCapitalize="words"
                      style={styles.modernInput}
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Last Name *</Text>
                    <Input
                      value={formData.lastName}
                      onChangeText={(value) => setFormData({ ...formData, lastName: value })}
                      placeholder="Enter last name"
                      autoCapitalize="words"
                      style={styles.modernInput}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Relationship *</Text>
                  <View style={[styles.dropdownContainer, { position: 'relative' }]}>
                    <Pressable
                      style={styles.dropdownButton}
                      onPress={() => {
                        setShowRelationshipDropdown(!showRelationshipDropdown);
                        setShowMotherDropdown(false);
                      }}
                    >
                      <Text style={[styles.dropdownText, !formData.relationship && styles.placeholderText]}>
                        {formData.relationship || 'Select relationship'}
                      </Text>
                      <ChevronDown size={20} color={Colors.neutral[400]} />
                    </Pressable>
                    
                    {showRelationshipDropdown && (
                      <View style={styles.dropdownOptions}>
                        <Pressable
                          style={styles.dropdownOption}
                          onPress={() => {
                            setFormData({ ...formData, relationship: 'Mother', motherId: undefined });
                            setShowRelationshipDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownOptionText}>Mother</Text>
                        </Pressable>
                        <Pressable
                          style={styles.dropdownOption}
                          onPress={() => {
                            setFormData({ ...formData, relationship: 'Child', motherId: undefined });
                            setShowRelationshipDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownOptionText}>Child</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Birth Year *</Text>
                  <Input
                    value={formData.birthYear}
                    onChangeText={(value) => {
                      const numericText = value.replace(/[^0-9]/g, '');
                      if (numericText.length <= 4) {
                        setFormData({ ...formData, birthYear: numericText });
                      }
                    }}
                    placeholder="e.g., 1990"
                    keyboardType="numeric"
                    style={styles.modernInput}
                  />
                </View>

                <View style={styles.switchContainer}>
                  <View style={styles.switchLabelContainer}>
                    <Text style={styles.switchLabel}>Deceased</Text>
                    <Text style={styles.switchSubtext}>Mark if person has passed away</Text>
                  </View>
                  <Switch
                    value={formData.isDeceased}
                    onValueChange={(value) => setFormData({ ...formData, isDeceased: value })}
                    trackColor={{ false: Colors.neutral[200], true: Colors.primary[500] }}
                    thumbColor={formData.isDeceased ? Colors.text.white : Colors.text.white}
                    ios_backgroundColor={Colors.neutral[200]}
                  />
                </View>

                {formData.isDeceased && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Death Year *</Text>
                    <Input
                      value={formData.deathYear}
                      onChangeText={(value) => {
                        const numericText = value.replace(/[^0-9]/g, '');
                        if (numericText.length <= 4) {
                          setFormData({ ...formData, deathYear: numericText });
                        }
                      }}
                      placeholder="e.g., 2020"
                      keyboardType="numeric"
                      style={styles.modernInput}
                    />
                  </View>
                )}
              </View>

              {/* Mother Selection for Children */}
              {formData.relationship === 'Child' && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Parent Information</Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Mother *</Text>
                    <View style={[styles.dropdownContainer, { position: 'relative' }]}>
                      <Pressable
                        style={styles.dropdownButton}
                        onPress={() => {
                          setShowMotherDropdown(!showMotherDropdown);
                          setShowRelationshipDropdown(false);
                        }}
                      >
                        <Text style={[styles.dropdownText, !formData.motherId && styles.placeholderText]}>
                          {getSelectedMotherName() || 'Select mother'}
                        </Text>
                        <ChevronDown size={20} color={Colors.neutral[400]} />
                      </Pressable>
                      
                      {showMotherDropdown && (
                        <View style={styles.dropdownOptions}>
                          {isLoadingMothers ? (
                            <View style={styles.dropdownOption}>
                              <Text style={styles.dropdownOptionText}>Loading mothers...</Text>
                            </View>
                          ) : availableMothers.length > 0 ? (
                            availableMothers.map((mother) => (
                              <Pressable
                                key={mother.id}
                                style={styles.dropdownOption}
                                onPress={() => {
                                  setFormData({ ...formData, motherId: mother.id });
                                  setShowMotherDropdown(false);
                                  console.log('Mother selected - motherId:', mother.id);
                                  console.log('Mother selected - mother name:', mother.name);
                                }}
                              >
                                <Text style={styles.dropdownOptionText}>{mother.name}</Text>
                              </Pressable>
                            ))
                          ) : (
                            <View style={styles.dropdownOption}>
                              <Text style={styles.dropdownOptionText}>No mothers available</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                             )}
             </View>
             </Pressable>
           </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Add Member"
              onPress={handleAddMember}
              fullWidth
              style={styles.addMemberButton}
            />
          </View>
        </SafeAreaView>
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
              <X size={24} color={Colors.text.primary} />
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
                      <Copy size={20} color={Colors.text.white} />
                      <Text style={styles.copyButtonText}>Copy</Text>
                    </Pressable>
                    <Pressable style={styles.shareButton} onPress={handleShareJoinId}>
                      <Share2 size={20} color={Colors.text.white} />
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
    color: Colors.text.primary,
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
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  createButton: {
    marginTop: 20,
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
    borderBottomColor: Colors.neutral[200],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  formContainer: {
    marginTop: 20,
  },
  sectionContainer: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 15,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  modernInput: {
    backgroundColor: Colors.text.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    fontSize: 16,
    color: Colors.text.primary,
  },
  dropdownContainer: {
    backgroundColor: Colors.text.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
  },
  placeholderText: {
    color: Colors.neutral[400],
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  switchLabelContainer: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  switchSubtext: {
    fontSize: 12,
    color: Colors.neutral[500],
    fontStyle: 'italic',
  },
  addMemberButton: {
    marginTop: 10,
  },
  dropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.text.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    zIndex: 1000,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  dropdownOptionText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  memberCard: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  memberRelationship: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  memberId: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
  joinIdContainer: {
    backgroundColor: Colors.primary[50],
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  joinIdText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary[600],
    textAlign: 'center',
    marginBottom: 16,
  },
  joinIdActions: {
    flexDirection: 'row',
    gap: 12,
  },
  copyButton: {
    flex: 1,
    backgroundColor: Colors.primary[600],
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  copyButtonText: {
    color: Colors.text.white,
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    backgroundColor: Colors.neutral[600],
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  shareButtonText: {
    color: Colors.text.white,
    fontWeight: '600',
  },
});