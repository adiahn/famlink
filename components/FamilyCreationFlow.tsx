import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';
import {
  Users,
  User,
  Home,
  X,
  ChevronRight,
  CheckCircle,
} from 'lucide-react-native';
import { CreationType, FatherData, MotherData } from '../types/family';

interface FamilyCreationFlowProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (familyId: string) => void;
  onInitializeFamily: (type: CreationType, familyName?: string) => Promise<{ success: boolean; message: string; familyId?: string }>;
  onSetupParents: (familyId: string, fatherData: FatherData, mothersData: MotherData[]) => Promise<{ success: boolean; message: string }>;
  initialStep?: FlowStep;
  initialFamilyId?: string;
  initialFamilyName?: string;
}

type FlowStep = 'type-selection' | 'family-name' | 'parent-setup' | 'completing';

export default function FamilyCreationFlow({
  visible,
  onClose,
  onComplete,
  onInitializeFamily,
  onSetupParents,
  initialStep = 'type-selection',
  initialFamilyId,
  initialFamilyName,
}: FamilyCreationFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>(initialStep);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<CreationType | null>(null);
  const [familyName, setFamilyName] = useState(initialFamilyName ?? '');
  const [familyId, setFamilyId] = useState<string | null>(initialFamilyId ?? null);
  
  // Parent setup form data
  const [fatherData, setFatherData] = useState<FatherData>({
    firstName: '',
    lastName: '',
    birthYear: '',
    isDeceased: false,
    deathYear: '',
  });
  
  const [mothersData, setMothersData] = useState<MotherData[]>([
    {
      firstName: '',
      lastName: '',
      birthYear: '',
      isDeceased: false,
      deathYear: '',
      spouseOrder: 1,
    }
  ]);

  const handleTypeSelection = (type: CreationType) => {
    setSelectedType(type);
    setCurrentStep('family-name');
  };

  const handleFamilyNameSubmit = async () => {
    if (!selectedType) return;
    
    setIsLoading(true);
    try {
      const result = await onInitializeFamily(selectedType, familyName || undefined);
      if (result.success && result.familyId) {
        setFamilyId(result.familyId);
        if (selectedType === 'parents_family') {
          setCurrentStep('parent-setup');
        } else {
          setCurrentStep('completing');
          // For own family, we're done
          setTimeout(() => {
            onComplete(result.familyId!);
            handleClose();
          }, 1500);
        }
      } else {
        Alert.alert('Error', result.message || 'Failed to initialize family creation');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize family creation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleParentSetup = async () => {
    if (!familyId) return;
    
    // Validate required fields
    if (!fatherData.firstName || !fatherData.lastName || !fatherData.birthYear) {
      Alert.alert('Validation Error', 'Please fill in all required fields for the father.');
      return;
    }
    
    if (mothersData.length === 0 || !mothersData[0].firstName || !mothersData[0].lastName || !mothersData[0].birthYear) {
      Alert.alert('Validation Error', 'Please fill in all required fields for at least one mother.');
      return;
    }
    
    // Validate death years if deceased
    if (fatherData.isDeceased && !fatherData.deathYear) {
      Alert.alert('Validation Error', 'Please enter the death year for the father.');
      return;
    }
    
    for (let i = 0; i < mothersData.length; i++) {
      if (mothersData[i].isDeceased && !mothersData[i].deathYear) {
        Alert.alert('Validation Error', `Please enter the death year for ${mothersData[i].spouseOrder === 1 ? 'mother' : `wife ${mothersData[i].spouseOrder}`}.`);
        return;
      }
    }
    
    setIsLoading(true);
    try {
      // Prepare the request data exactly as the API expects - omit empty deathYear fields
      const requestData = {
        father: {
          firstName: fatherData.firstName,
          lastName: fatherData.lastName,
          birthYear: fatherData.birthYear,
          isDeceased: fatherData.isDeceased,
          ...(fatherData.deathYear && fatherData.deathYear.trim() !== '' && { deathYear: fatherData.deathYear })
        },
        mothers: mothersData.map(mother => ({
          firstName: mother.firstName,
          lastName: mother.lastName,
          birthYear: mother.birthYear,
          isDeceased: mother.isDeceased,
          spouseOrder: mother.spouseOrder,
          ...(mother.deathYear && mother.deathYear.trim() !== '' && { deathYear: mother.deathYear })
        }))
      };
      
      console.log('Submitting parent setup with data:', {
        familyId,
        requestData
      });
      
      const result = await onSetupParents(familyId, fatherData, mothersData);
      console.log('Parent setup result:', result);
      
      if (result.success) {
        setCurrentStep('completing');
        setTimeout(() => {
          onComplete(familyId);
          handleClose();
        }, 1500);
      } else {
        Alert.alert('Setup Failed', result.message || 'Failed to setup parents. Please try again.');
      }
    } catch (error) {
      console.error('Parent setup error:', error);
      let errorMessage = 'Failed to setup parents. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Network connection failed')) {
          errorMessage = 'Network connection failed. Please check your internet connection and try again.';
        } else if (error.message.includes('HTTP')) {
          errorMessage = `Server error: ${error.message}`;
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Setup Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const addMother = () => {
    const newMother: MotherData = {
      firstName: '',
      lastName: '',
      birthYear: '',
      isDeceased: false,
      deathYear: '',
      spouseOrder: mothersData.length + 1,
    };
    setMothersData([...mothersData, newMother]);
  };

  const removeMother = (index: number) => {
    if (mothersData.length > 1) {
      const updatedMothers = mothersData.filter((_, i) => i !== index);
      // Update spouse orders
      updatedMothers.forEach((mother, i) => {
        mother.spouseOrder = i + 1;
      });
      setMothersData(updatedMothers);
    }
  };

  const updateMother = (index: number, field: keyof MotherData, value: any) => {
    const updatedMothers = [...mothersData];
    updatedMothers[index] = { ...updatedMothers[index], [field]: value };
    setMothersData(updatedMothers);
  };

  const renderTypeSelection = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Choose Family Type</Text>
        <Text style={styles.stepDescription}>
          Select how you want to create your family tree
        </Text>
      </View>
      
      <View style={styles.typeOptionsContainer}>
        <Pressable
          style={[styles.typeOption, selectedType === 'parents_family' && styles.typeOptionSelected]}
          onPress={() => handleTypeSelection('parents_family')}
        >
          <View style={styles.typeOptionIcon}>
            <Users size={32} color={selectedType === 'parents_family' ? Colors.primary[600] : Colors.neutral[400]} />
          </View>
          <View style={styles.typeOptionContent}>
            <Text style={[styles.typeOptionTitle, selectedType === 'parents_family' && styles.typeOptionTitleSelected]}>
              For My Parents' Family
            </Text>
            <Text style={styles.typeOptionDescription}>
              Create a family tree starting with your father and mother(s), then add yourself and siblings
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.neutral[400]} />
        </Pressable>
        
        <Pressable
          style={[styles.typeOption, selectedType === 'own_family' && styles.typeOptionSelected]}
          onPress={() => handleTypeSelection('own_family')}
        >
          <View style={styles.typeOptionIcon}>
            <Home size={32} color={selectedType === 'own_family' ? Colors.primary[600] : Colors.neutral[400]} />
          </View>
          <View style={styles.typeOptionContent}>
            <Text style={[styles.typeOptionTitle, selectedType === 'own_family' && styles.typeOptionTitleSelected]}>
              For My Own Family
            </Text>
            <Text style={styles.typeOptionDescription}>
              Create a family tree starting with yourself, then add your spouse and children
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.neutral[400]} />
        </Pressable>
      </View>
      
      <Button
        title="Continue"
        onPress={() => setCurrentStep('family-name')}
        disabled={!selectedType}
        fullWidth
        style={styles.continueButton}
      />
    </View>
  );

  const renderFamilyName = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Family Name</Text>
        <Text style={styles.stepDescription}>
          {selectedType === 'parents_family' 
            ? 'Enter a name for your parents\' family tree'
            : 'Enter a name for your family tree'
          }
        </Text>
      </View>
      
      <Input
        label="Family Name"
        placeholder="e.g., Smith Family, Johnson Family"
        value={familyName}
        onChangeText={setFamilyName}
        autoCapitalize="words"
      />
      
      <View style={styles.buttonGroup}>
        <Button
          title="Back"
          onPress={() => setCurrentStep('type-selection')}
          variant="outline"
          style={styles.backButton}
        />
        <Button
          title="Continue"
          onPress={handleFamilyNameSubmit}
          loading={isLoading}
          fullWidth
        />
      </View>
    </View>
  );

  const renderParentSetup = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Setup Parents</Text>
        <Text style={styles.stepDescription}>
          Add your father and mother(s) to start building the family tree
        </Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.formScroll}>
        {/* Father Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <User size={24} color={Colors.primary[600]} />
            </View>
            <Text style={styles.sectionTitle}>Father</Text>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.formRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First Name *</Text>
                <View style={styles.inputContainer}>
                  <Input
                    value={fatherData.firstName}
                    onChangeText={(text) => setFatherData({ ...fatherData, firstName: text })}
                    placeholder="Enter first name"
                    autoCapitalize="words"
                    style={styles.modernInput}
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Name *</Text>
                <View style={styles.inputContainer}>
                  <Input
                    value={fatherData.lastName}
                    onChangeText={(text) => setFatherData({ ...fatherData, lastName: text })}
                    placeholder="Enter last name"
                    autoCapitalize="words"
                    style={styles.modernInput}
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Birth Year *</Text>
              <View style={styles.inputContainer}>
                <Input
                  value={fatherData.birthYear}
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, '');
                    if (numericText.length <= 4) {
                      setFatherData({ ...fatherData, birthYear: numericText });
                    }
                  }}
                  placeholder="e.g., 1960"
                  keyboardType="numeric"
                  style={styles.modernInput}
                />
              </View>
            </View>
            
            <View style={styles.switchContainer}>
              <View style={styles.switchLabelContainer}>
                <Text style={styles.switchLabel}>Deceased</Text>
                <Text style={styles.switchSubtext}>Mark if father has passed away</Text>
              </View>
              <Switch
                value={fatherData.isDeceased}
                onValueChange={(value) => setFatherData({ ...fatherData, isDeceased: value })}
                trackColor={{ false: Colors.neutral[200], true: Colors.primary[500] }}
                thumbColor={fatherData.isDeceased ? Colors.text.white : Colors.text.white}
                ios_backgroundColor={Colors.neutral[200]}
              />
            </View>
            
            {fatherData.isDeceased && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Death Year *</Text>
                <View style={styles.inputContainer}>
                  <Input
                    value={fatherData.deathYear || ''}
                    onChangeText={(text) => {
                      const numericText = text.replace(/[^0-9]/g, '');
                      if (numericText.length <= 4) {
                        setFatherData({ ...fatherData, deathYear: numericText });
                      }
                    }}
                    placeholder="e.g., 2020"
                    keyboardType="numeric"
                    style={styles.modernInput}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
        
        {/* Mothers Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <User size={24} color={Colors.primary[600]} />
            </View>
            <Text style={styles.sectionTitle}>Mother(s)</Text>
            <Button
              title="Add Mother"
              onPress={addMother}
              variant="outline"
              size="small"
              style={styles.addMotherButton}
            />
          </View>
          
          {mothersData.map((mother, index) => (
            <View key={index} style={styles.motherContainer}>
              <View style={styles.motherHeader}>
                <View style={styles.motherTitleContainer}>
                  <Text style={styles.motherTitle}>
                    {mother.spouseOrder === 1 ? 'Mother' : `Wife ${mother.spouseOrder}`}
                  </Text>
                  {mothersData.length > 1 && (
                    <Button
                      title="Remove"
                      onPress={() => removeMother(index)}
                      variant="ghost"
                      size="small"
                      style={styles.removeMotherButton}
                    />
                  )}
                </View>
              </View>
              
              <View style={styles.formContainer}>
                <View style={styles.formRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>First Name *</Text>
                    <View style={styles.inputContainer}>
                      <Input
                        value={mother.firstName}
                        onChangeText={(text) => updateMother(index, 'firstName', text)}
                        placeholder="Enter first name"
                        autoCapitalize="words"
                        style={styles.modernInput}
                      />
                    </View>
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Last Name *</Text>
                    <View style={styles.inputContainer}>
                      <Input
                        value={mother.lastName}
                        onChangeText={(text) => updateMother(index, 'lastName', text)}
                        placeholder="Enter last name"
                        autoCapitalize="words"
                        style={styles.modernInput}
                      />
                    </View>
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Birth Year *</Text>
                  <View style={styles.inputContainer}>
                    <Input
                      value={mother.birthYear}
                      onChangeText={(text) => {
                        const numericText = text.replace(/[^0-9]/g, '');
                        if (numericText.length <= 4) {
                          updateMother(index, 'birthYear', numericText);
                        }
                      }}
                      placeholder="e.g., 1965"
                      keyboardType="numeric"
                      style={styles.modernInput}
                    />
                  </View>
                </View>
                
                <View style={styles.switchContainer}>
                  <View style={styles.switchLabelContainer}>
                    <Text style={styles.switchLabel}>Deceased</Text>
                    <Text style={styles.switchSubtext}>Mark if mother has passed away</Text>
                  </View>
                  <Switch
                    value={mother.isDeceased}
                    onValueChange={(value) => updateMother(index, 'isDeceased', value)}
                    trackColor={{ false: Colors.neutral[200], true: Colors.primary[500] }}
                    thumbColor={mother.isDeceased ? Colors.text.white : Colors.text.white}
                    ios_backgroundColor={Colors.neutral[200]}
                  />
                </View>
                
                {mother.isDeceased && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Death Year *</Text>
                    <View style={styles.inputContainer}>
                      <Input
                        value={mother.deathYear || ''}
                        onChangeText={(text) => {
                          const numericText = text.replace(/[^0-9]/g, '');
                          if (numericText.length <= 4) {
                            updateMother(index, 'deathYear', numericText);
                          }
                        }}
                        placeholder="e.g., 2020"
                        keyboardType="numeric"
                        style={styles.modernInput}
                      />
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.buttonGroup}>
        <Button
          title="Back"
          onPress={() => setCurrentStep('family-name')}
          variant="outline"
          style={styles.backButton}
        />
        <Button
          title="Complete Setup"
          onPress={handleParentSetup}
          loading={isLoading}
          fullWidth
          style={styles.completeButton}
        />
      </View>
    </View>
  );

  const renderCompleting = () => (
    <View style={styles.stepContainer}>
      <View style={styles.completingContent}>
        <CheckCircle size={64} color={Colors.success[600]} />
        <Text style={styles.completingTitle}>Family Setup Complete!</Text>
        <Text style={styles.completingDescription}>
          Your family tree has been created successfully. You can now add children and other family members.
        </Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'type-selection':
        return renderTypeSelection();
      case 'family-name':
        return renderFamilyName();
      case 'parent-setup':
        return renderParentSetup();
      case 'completing':
        return renderCompleting();
      default:
        return renderTypeSelection();
    }
  };

  const handleClose = () => {
    setCurrentStep('type-selection');
    setSelectedType(null);
    setFamilyName('');
    setFamilyId(null);
    setFatherData({
      firstName: '',
      lastName: '',
      birthYear: '',
      isDeceased: false,
      deathYear: '',
    });
    setMothersData([
      {
        firstName: '',
        lastName: '',
        birthYear: '',
        isDeceased: false,
        deathYear: '',
        spouseOrder: 1,
      }
    ]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Create Family Tree</Text>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={Colors.text.primary} />
          </Pressable>
        </View>
        
        <View style={styles.modalContent}>
          {renderCurrentStep()}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.text.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepHeader: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  typeSelectionContainer: {
    marginBottom: 32,
  },
  typeOptionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.text.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
  },
  typeOptionSelected: {
    borderColor: Colors.primary[600],
    backgroundColor: Colors.primary[50],
  },
  typeOptionIcon: {
    marginRight: 16,
  },
  typeOptionContent: {
    flex: 1,
  },
  typeOptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  typeOptionTitleSelected: {
    color: Colors.primary[600],
  },
  typeOptionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: Colors.primary[600],
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: Colors.primary[600],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backButton: {
    flex: 1,
    backgroundColor: Colors.text.white,
    borderColor: Colors.neutral[300],
    borderRadius: 12,
    paddingVertical: 16,
  },
  completingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  completingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  completingDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  formScroll: {
    flex: 1,
    paddingHorizontal: 4,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  formContainer: {
    backgroundColor: Colors.text.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 10,
  },
  modernInput: {
    backgroundColor: Colors.text.white,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1.5,
    borderColor: Colors.neutral[300],
    minHeight: 56,
  },
  inputContainer: {
    flex: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 4,
  },
  switchLabelContainer: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  switchSubtext: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  addMotherButton: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  motherContainer: {
    marginBottom: 24,
  },
  motherHeader: {
    marginBottom: 16,
  },
  motherTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  motherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  removeMotherButton: {
    backgroundColor: Colors.error[50],
    borderColor: Colors.error[200],
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  completeButton: {
    flex: 2,
    backgroundColor: Colors.primary[600],
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: Colors.primary[600],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
