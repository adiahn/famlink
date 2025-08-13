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
}

type FlowStep = 'type-selection' | 'family-name' | 'parent-setup' | 'completing';

export default function FamilyCreationFlow({
  visible,
  onClose,
  onComplete,
  onInitializeFamily,
  onSetupParents,
}: FamilyCreationFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('type-selection');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<CreationType | null>(null);
  const [familyName, setFamilyName] = useState('');
  const [familyId, setFamilyId] = useState<string | null>(null);
  
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
    
    setIsLoading(true);
    try {
      const result = await onSetupParents(familyId, fatherData, mothersData);
      if (result.success) {
        setCurrentStep('completing');
        setTimeout(() => {
          onComplete(familyId);
          handleClose();
        }, 1500);
      } else {
        Alert.alert('Error', result.message || 'Failed to setup parents');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to setup parents. Please try again.');
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
      
      <View style={styles.typeOptions}>
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
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Father Section */}
        <Card variant="outlined" padding="medium" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Father</Text>
          <View style={styles.formRow}>
            <Input
              label="First Name"
              placeholder="Father's first name"
              value={fatherData.firstName}
              onChangeText={(text) => setFatherData({ ...fatherData, firstName: text })}
              style={styles.halfWidth}
            />
            <Input
              label="Last Name"
              placeholder="Father's last name"
              value={fatherData.lastName}
              onChangeText={(text) => setFatherData({ ...fatherData, lastName: text })}
              style={styles.halfWidth}
            />
          </View>
          <Input
            label="Birth Year"
            placeholder="e.g., 1960"
            value={fatherData.birthYear}
            onChangeText={(text) => {
              const numericText = text.replace(/[^0-9]/g, '');
              if (numericText.length <= 4) {
                setFatherData({ ...fatherData, birthYear: numericText });
              }
            }}
            keyboardType="numeric"
          />
        </Card>
        
        {/* Mothers Section */}
        <Card variant="outlined" padding="medium" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mother(s)</Text>
            <Button
              title="Add Mother"
              onPress={addMother}
              variant="outline"
              size="small"
              leftIcon={<User size={16} color={Colors.primary[600]} />}
            />
          </View>
          
          {mothersData.map((mother, index) => (
            <View key={index} style={styles.motherSection}>
              <View style={styles.motherHeader}>
                <Text style={styles.motherTitle}>
                  {mother.spouseOrder === 1 ? 'Mother' : `Wife ${mother.spouseOrder}`}
                </Text>
                {mothersData.length > 1 && (
                  <Button
                    title="Remove"
                    onPress={() => removeMother(index)}
                    variant="ghost"
                    size="small"
                    style={styles.removeButton}
                  />
                )}
              </View>
              
              <View style={styles.formRow}>
                <Input
                  label="First Name"
                  placeholder="Mother's first name"
                  value={mother.firstName}
                  onChangeText={(text) => updateMother(index, 'firstName', text)}
                  style={styles.halfWidth}
                />
                <Input
                  label="Last Name"
                  placeholder="Mother's last name"
                  value={mother.lastName}
                  onChangeText={(text) => updateMother(index, 'lastName', text)}
                  style={styles.halfWidth}
                />
              </View>
              
              <Input
                label="Birth Year"
                placeholder="e.g., 1965"
                value={mother.birthYear}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  if (numericText.length <= 4) {
                    updateMother(index, 'birthYear', numericText);
                  }
                }}
                keyboardType="numeric"
              />
            </View>
          ))}
        </Card>
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
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Family Tree</Text>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={Colors.text.primary} />
          </Pressable>
        </View>
        
        <View style={styles.content}>
          {renderCurrentStep()}
        </View>
      </SafeAreaView>
    </Modal>
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
    borderBottomColor: Colors.neutral[200],
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  stepHeader: {
    marginBottom: 32,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  typeOptions: {
    gap: 16,
    marginBottom: 32,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.neutral[50],
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
    marginTop: 'auto',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
  },
  backButton: {
    flex: 1,
  },
  sectionCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  motherSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  motherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  motherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  completingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  completingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  completingDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  placeholder: {
    fontSize: 18,
    color: Colors.text.secondary,
  },
});
