import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Users, Plus, X, ChevronDown } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';

interface FamilyMemberForm {
  name: string;
  relationship: string;
  birthYear: string;
  isDeceased: boolean;
  deathYear: string;
}

export default function Onboarding() {
  const { user, accessToken } = useAuthStore();
  const { createFamily, addMember } = useFamilyStore();
  const [step, setStep] = useState<'family-name' | 'add-members' | 'verification'>('family-name');
  const [familyName, setFamilyName] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberForm[]>([]);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState<number>(-1);
  const [isCreating, setIsCreating] = useState(false);

  const relationshipTypes = [
    { id: 'self', label: 'Myself', description: 'You' },
    { id: 'spouse', label: 'Spouse', description: 'Husband or Wife' },
    { id: 'child', label: 'Child', description: 'Son or Daughter' },
    { id: 'parent', label: 'Parent', description: 'Father or Mother' },
    { id: 'sibling', label: 'Sibling', description: 'Brother or Sister' },
    { id: 'grandparent', label: 'Grandparent', description: 'Grandfather or Grandmother' },
  ];

  const handleAddMember = () => {
    const newMember: FamilyMemberForm = {
      name: '',
      relationship: '',
      birthYear: '',
      isDeceased: false,
      deathYear: '',
    };
    setFamilyMembers([...familyMembers, newMember]);
  };

  const handleRemoveMember = (index: number) => {
    const updatedMembers = familyMembers.filter((_, i) => i !== index);
    setFamilyMembers(updatedMembers);
  };

  const handleUpdateMember = (index: number, field: keyof FamilyMemberForm, value: any) => {
    const updatedMembers = [...familyMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setFamilyMembers(updatedMembers);
  };

  const handleRelationshipSelect = (relationship: string) => {
    if (selectedMemberIndex >= 0) {
      handleUpdateMember(selectedMemberIndex, 'relationship', relationship);
    }
    setShowRelationshipModal(false);
  };

  const handleNext = async () => {
    console.log('handleNext called with step:', step);
    
    if (step === 'family-name') {
      if (!familyName.trim()) {
        Alert.alert('Error', 'Please enter a family name');
        return;
      }
      console.log('Moving to add-members step');
      setStep('add-members');
    } else if (step === 'add-members') {
      console.log('Validating add-members step...');
      console.log('Family members:', familyMembers);
      
      if (familyMembers.length === 0) {
        Alert.alert('Error', 'Please add at least yourself to the family');
        return;
      }
      
      const hasSelf = familyMembers.some(member => member.relationship === 'self');
      console.log('Has self member:', hasSelf);
      
      if (!hasSelf) {
        Alert.alert('Error', 'Please add yourself to the family');
        return;
      }

      const incompleteMembers = familyMembers.filter(member => !member.name || !member.relationship);
      console.log('Incomplete members:', incompleteMembers);
      
      if (incompleteMembers.length > 0) {
        Alert.alert('Error', 'Please complete all member information');
        return;
      }

      // Check if birth years are filled (optional validation)
      const membersWithoutBirthYear = familyMembers.filter(member => !member.birthYear.trim());
      if (membersWithoutBirthYear.length > 0) {
        console.log('Members without birth year:', membersWithoutBirthYear);
        // Don't block for birth year, just log it
      }

      console.log('Moving to verification step');
      setStep('verification');
    } else if (step === 'verification') {
      console.log('Creating family...');
      if (!accessToken) {
        Alert.alert('Error', 'You must be logged in to create a family');
        return;
      }

      setIsCreating(true);
      try {
        console.log('Creating family with:', { familyName, memberCount: familyMembers.length });
        
        // Generate a simple Join ID based on user's name
        const selfMember = familyMembers.find(member => member.relationship === 'self');
        let creatorJoinId = 'FAM001';
        if (selfMember && selfMember.name) {
          const nameParts = selfMember.name.trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts[1] || '';
          creatorJoinId = `${firstName.toUpperCase().substring(0, 3)}${lastName.toUpperCase().substring(0, 2)}01`;
          console.log('Generated Join ID:', creatorJoinId);
        }
        
        // Create the family
        const familyResult = await createFamily({
          name: familyName,
          creatorJoinId: creatorJoinId
        }, accessToken);
        
        if (familyResult.success) {
          console.log('Family created successfully');
          
          // For now, we'll just show success message
          // The family members will be added through the family tree interface
          // This avoids the complexity of getting the family ID from the response
          
          Alert.alert(
            'Family Created Successfully!',
            `Your family "${familyName}" has been created!\n\nYour Join ID: ${creatorJoinId}\n\nYou can now add family members through the family tree. Share your Join ID with other family members so they can link their families to yours.`,
            [
              {
                text: 'Continue',
                onPress: () => {
                  console.log('Navigating to tabs...');
                  router.replace('/(tabs)');
                },
              },
            ]
          );
        } else {
          Alert.alert('Error', familyResult.message || 'Failed to create family');
        }
      } catch (error) {
        console.error('Error creating family:', error);
        Alert.alert('Error', 'There was an error creating your family. Please try again.');
      } finally {
        setIsCreating(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => {
          if (step === 'family-name') {
            router.back();
          } else if (step === 'add-members') {
            setStep('family-name');
          } else {
            setStep('add-members');
          }
        }}>
          <ArrowLeft size={24} color="#64748b" strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {step === 'family-name' && 'Create Your Family'}
          {step === 'add-members' && 'Add Family Members'}
          {step === 'verification' && 'Review Your Family'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressStep, step === 'family-name' && styles.progressStepActive]}>
              <Text style={[styles.progressStepText, step === 'family-name' && styles.progressStepTextActive]}>1</Text>
            </View>
            <View style={[styles.progressLine, step !== 'family-name' && styles.progressLineActive]} />
            <View style={[styles.progressStep, step === 'add-members' && styles.progressStepActive]}>
              <Text style={[styles.progressStepText, step === 'add-members' && styles.progressStepTextActive]}>2</Text>
            </View>
            <View style={[styles.progressLine, step === 'verification' && styles.progressLineActive]} />
            <View style={[styles.progressStep, step === 'verification' && styles.progressStepActive]}>
              <Text style={[styles.progressStepText, step === 'verification' && styles.progressStepTextActive]}>3</Text>
            </View>
          </View>

          {/* Step 1: Family Name */}
          {step === 'family-name' && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>What's Your Family Name?</Text>
              <Text style={styles.subtitle}>
                Give your family tree a name. This will help you and your family members identify your family.
              </Text>

              <View style={styles.inputContainer}>
                <Users size={20} color="#64748b" strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., The Johnson Family"
                  value={familyName}
                  onChangeText={setFamilyName}
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.tipBox}>
                <Text style={styles.tipTitle}>💡 Tip</Text>
                <Text style={styles.tipText}>
                  Choose a name that's meaningful to your family. You can always change it later.
                </Text>
              </View>
            </View>
          )}

          {/* Step 2: Add Family Members */}
          {step === 'add-members' && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Add Your Family Members</Text>
              <Text style={styles.subtitle}>
                Add everyone in your immediate family. You can add more members later.
              </Text>

              {familyMembers.map((member, index) => (
                <View key={index} style={styles.memberCard}>
                  <View style={styles.memberHeader}>
                    <Text style={styles.memberTitle}>Family Member {index + 1}</Text>
                    {familyMembers.length > 1 && (
                      <Pressable
                        style={styles.removeButton}
                        onPress={() => handleRemoveMember(index)}
                      >
                        <X size={16} color="#dc2626" strokeWidth={2} />
                      </Pressable>
                    )}
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                      <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        value={member.name}
                        onChangeText={(text) => handleUpdateMember(index, 'name', text)}
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                    <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                      <TextInput
                        style={styles.input}
                        placeholder="Birth Year"
                        value={member.birthYear}
                        onChangeText={(text) => handleUpdateMember(index, 'birthYear', text)}
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                      />
          </View>
        </View>

                  <View style={styles.dropdownContainer}>
                    <Text style={styles.dropdownLabel}>Relationship</Text>
                    <Pressable
                      style={styles.dropdownButton}
                      onPress={() => {
                        setSelectedMemberIndex(index);
                        setShowRelationshipModal(true);
                      }}
                    >
                      <Users size={20} color="#64748b" strokeWidth={2} />
                      <Text style={styles.dropdownText}>
                        {relationshipTypes.find(r => r.id === member.relationship)?.label || 'Select Relationship'}
                      </Text>
                      <ChevronDown size={20} color="#64748b" strokeWidth={2} />
                    </Pressable>
                  </View>

                  <View style={styles.checkboxContainer}>
                    <Pressable
                      style={[styles.checkbox, member.isDeceased && styles.checkboxChecked]}
                      onPress={() => handleUpdateMember(index, 'isDeceased', !member.isDeceased)}
                    >
                      {member.isDeceased && <Text style={styles.checkmark}>✓</Text>}
                    </Pressable>
                    <Text style={styles.checkboxLabel}>This person is deceased</Text>
                  </View>

                  {member.isDeceased && (
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Year of Death"
                        value={member.deathYear}
                        onChangeText={(text) => handleUpdateMember(index, 'deathYear', text)}
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                      />
                    </View>
                  )}
                </View>
              ))}

              <Pressable style={styles.addMemberButton} onPress={handleAddMember}>
                <Plus size={20} color="#2563eb" strokeWidth={2} />
                <Text style={styles.addMemberButtonText}>Add Another Family Member</Text>
              </Pressable>
            </View>
            )}

          {/* Step 3: Verification */}
          {step === 'verification' && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Review Your Family</Text>
              <Text style={styles.subtitle}>
                Please review the information below. You can go back to make changes.
              </Text>

              <View style={styles.reviewCard}>
                <Text style={styles.reviewTitle}>{familyName}</Text>
                <Text style={styles.reviewSubtitle}>{familyMembers.length} family members</Text>
                
                {familyMembers.map((member, index) => (
                  <View key={index} style={styles.reviewMember}>
                    <Text style={styles.reviewMemberName}>{member.name}</Text>
                    <Text style={styles.reviewMemberRelation}>
                      {relationshipTypes.find(r => r.id === member.relationship)?.label}
                    </Text>
                  </View>
                ))}
          </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>🎉 Your Family is Ready!</Text>
                <Text style={styles.infoText}>
                  Once you create your family, you'll get a unique Join ID that you can share with other family members to link their trees with yours.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <Pressable 
          style={styles.nextButton} 
          onPress={async () => {
            console.log('Button pressed! Current step:', step);
            await handleNext();
          }}
        >
          <Text style={styles.nextButtonText}>
            {step === 'family-name' && 'Continue'}
            {step === 'add-members' && 'Review Family'}
            {step === 'verification' && (isCreating ? 'Creating...' : 'Create Family')}
          </Text>
        </Pressable>
      </View>

      {/* Relationship Selection Modal */}
      <Modal
        visible={showRelationshipModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRelationshipModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Relationship</Text>
              <Pressable onPress={() => setShowRelationshipModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              {relationshipTypes.map((relationship) => (
                <Pressable
                  key={relationship.id}
                  style={styles.modalOption}
                  onPress={() => handleRelationshipSelect(relationship.id)}
                >
                  <Text style={styles.modalOptionText}>{relationship.label}</Text>
                  <Text style={styles.modalOptionDescription}>{relationship.description}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepActive: {
    backgroundColor: '#2563eb',
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  progressStepTextActive: {
    color: '#ffffff',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 8,
    },
  progressLineActive: {
    backgroundColor: '#2563eb',
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tipBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  memberCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  memberTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  removeButton: {
    padding: 4,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    marginTop: 16,
  },
  sectionNote: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderStyle: 'dashed',
  },
  addMemberButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reviewCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  reviewMember: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  reviewMemberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  reviewMemberRelation: {
    fontSize: 14,
    color: '#64748b',
  },
  infoBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#059669',
    lineHeight: 20,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  nextButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
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
  modalScroll: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalOptionFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  modalOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  modalOptionDescription: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
});