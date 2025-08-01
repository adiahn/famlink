import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useFamilyStore } from '../../store/familyStore';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Colors } from '../../constants/Colors';
import { Plus, ChevronDown, ChevronRight, Camera, X, Save } from 'lucide-react-native';
// import * as ImagePicker from 'expo-image-picker';

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
  const { family, isLoading, error, selectedMember, getMyFamily, addMember, setSelectedMember } = useFamilyStore();
  const { accessToken } = useAuthStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<AddMemberForm>({
    firstName: '',
    lastName: '',
    relationship: '',
    birthYear: '',
    isDeceased: false,
    deathYear: '',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (accessToken) {
      loadFamilyData();
    }
  }, [accessToken]);

  const loadFamilyData = async () => {
    if (accessToken) {
      await getMyFamily(accessToken);
    }
  };

  const handleAddMember = async () => {
    if (!family || !accessToken) return;

    // Validate form
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }
    if (!formData.relationship.trim()) {
      Alert.alert('Error', 'Relationship is required');
      return;
    }
    if (!formData.birthYear.trim()) {
      Alert.alert('Error', 'Birth year is required');
      return;
    }

    const result = await addMember(family.id, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      relationship: formData.relationship,
      birthYear: formData.birthYear,
      isDeceased: formData.isDeceased,
      deathYear: formData.deathYear || undefined,
    }, accessToken);

    if (result.success) {
      setShowAddModal(false);
      resetForm();
      Alert.alert('Success', 'Family member added successfully');
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleTakePicture = async () => {
    // TODO: Implement image picker when expo-image-picker is available
    Alert.alert('Image Picker', 'Image picker functionality will be implemented when expo-image-picker is available');
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
    setSelectedImage(null);
  };

  const buildFamilyTree = (members: any[]): FamilyNode[] => {
    const parents: any[] = [];
    const children: any[] = [];
    const spouses: any[] = [];

    members.forEach(member => {
      if (member.relationship === 'Father' || member.relationship === 'Mother') {
        parents.push(member);
      } else if (member.relationship === 'Son' || member.relationship === 'Daughter' || member.relationship === 'Brother' || member.relationship === 'Sister') {
        children.push(member);
      } else if (member.relationship === 'Wife' || member.relationship === 'Husband') {
        spouses.push(member);
      }
    });

    const tree: FamilyNode[] = [];
    
    if (parents.length > 0) {
      tree.push({
        id: 'parents-level',
        name: 'Parents',
        relationship: 'Parents',
        birthYear: '', 
        isDeceased: false, 
        isVerified: true, 
        isFamilyCreator: false, 
        joinId: '', 
        children: [],
        parents: parents.map(p => ({ ...p, children: [] }))
      });
    }

    const directChildren = children.filter(c => c.familyId === family?.id);
    if (directChildren.length > 0) {
      tree.push({
        id: 'children-level',
        name: 'Children',
        relationship: 'Children',
        birthYear: '', 
        isDeceased: false, 
        isVerified: true, 
        isFamilyCreator: false, 
        joinId: '', 
        children: directChildren.map(c => ({ ...c, children: [] }))
      });
    }
    
    return tree;
  };

  const getSelectedMemberFamily = () => {
    if (!selectedMember || !family) return null;
    
    const member = family.members.find(m => m.id === selectedMember);
    if (!member) return null;

    // Find spouse and children for the selected member
    const spouse = family.members.find(m => 
      (m.relationship === 'Wife' || m.relationship === 'Husband') && 
      m.id !== member.id
    );
    
    const children = family.members.filter(m => 
      m.relationship === 'Son' || m.relationship === 'Daughter'
    );

    return {
      spouse: spouse ? { ...spouse, children: [] } : undefined,
      children: children.map(child => ({ ...child, children: [] }))
    };
  };

  const FamilyMemberCard = ({ member, onPress, isSelected }: { 
    member: FamilyNode; 
    onPress: () => void; 
    isSelected: boolean;
  }) => (
    <Pressable
      style={[styles.memberCard, isSelected && styles.selectedCard]}
      onPress={onPress}
    >
      <View style={styles.memberAvatar}>
        {member.avatar ? (
          <Image source={{ uri: member.avatar }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.memberName} numberOfLines={2}>
        {member.name}
      </Text>
      <Text style={styles.memberRelationship}>{member.relationship}</Text>
      <Text style={styles.memberYears}>
        {member.birthYear}
        {member.isDeceased && member.deathYear && ` - ${member.deathYear}`}
      </Text>
      {member.isDeceased && (
        <View style={styles.deceasedBadge}>
          <Text style={styles.deceasedText}>Deceased</Text>
        </View>
      )}
    </Pressable>
  );

  const FamilyLevel = ({ title, members }: { title: string; members: FamilyNode[] }) => (
    <View style={styles.familyLevel}>
      <Text style={styles.levelTitle}>{title}</Text>
      <View style={styles.membersRow}>
        {members.map((member) => (
          <FamilyMemberCard
            key={member.id}
            member={member}
            onPress={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
            isSelected={selectedMember === member.id}
          />
        ))}
      </View>
    </View>
  );

  const ChildrenLevel = ({ children }: { children: FamilyNode[] }) => (
    <View style={styles.childrenLevel}>
      <Text style={styles.levelTitle}>Children</Text>
      <View style={styles.membersRow}>
        {children.map((child) => (
          <FamilyMemberCard
            key={child.id}
            member={child}
            onPress={() => setSelectedMember(selectedMember === child.id ? null : child.id)}
            isSelected={selectedMember === child.id}
          />
        ))}
      </View>
    </View>
  );

  const FamilySection = () => {
    const selectedMemberFamily = getSelectedMemberFamily();
    return (
      <View style={styles.familySection}>
        <View style={styles.familyDivider}>
          <Text style={styles.familyDividerText}>Family</Text>
        </View>
        {selectedMemberFamily ? (
          <View style={styles.familyContent}>
            {selectedMemberFamily.spouse && (
              <View style={styles.spouseSection}>
                <Text style={styles.sectionTitle}>Spouse</Text>
                <FamilyMemberCard
                  member={{ ...selectedMemberFamily.spouse, children: [] }}
                  onPress={() => setSelectedMember(selectedMember === selectedMemberFamily.spouse?.id ? null : selectedMemberFamily.spouse?.id || null)}
                  isSelected={selectedMember === selectedMemberFamily.spouse?.id}
                />
              </View>
            )}
            {selectedMemberFamily.children.length > 0 && (
              <View style={styles.childrenSection}>
                <Text style={styles.sectionTitle}>Children</Text>
                <View style={styles.membersRow}>
                  {selectedMemberFamily.children.map((child) => (
                    <FamilyMemberCard
                      key={child.id}
                      member={{ ...child, children: [] }}
                      onPress={() => setSelectedMember(selectedMember === child.id ? null : child.id)}
                      isSelected={selectedMember === child.id}
                    />
                  ))}
                </View>
              </View>
            )}
            {!selectedMemberFamily.spouse && selectedMemberFamily.children.length === 0 && (
              <View style={styles.noFamilyData}>
                <Text style={styles.noFamilyDataText}>No family data found</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noFamilyData}>
            <Text style={styles.noFamilyDataText}>Select a family member to view their family</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading family tree...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button onPress={loadFamilyData} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  if (!family) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No family data found</Text>
        <Button onPress={loadFamilyData} style={styles.retryButton}>
          Load Family
        </Button>
      </View>
    );
  }

  const familyTree = buildFamilyTree(family.members);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Family Tree</Text>
          <Button
            onPress={() => setShowAddModal(true)}
            style={styles.addButton}
            textStyle={styles.addButtonText}
          >
            <Plus size={20} color={Colors.white} />
            Add Member
          </Button>
        </View>

        <View style={styles.treeContainer}>
          {familyTree.map((level) => (
            <View key={level.id}>
              {level.parents && level.parents.length > 0 && (
                <FamilyLevel title="Parents" members={level.parents} />
              )}
              {level.children && level.children.length > 0 && (
                <ChildrenLevel children={level.children} />
              )}
            </View>
          ))}
        </View>

        <FamilySection />
      </ScrollView>

      {/* Add Member Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Family Member</Text>
            <Button
              onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}
              style={styles.closeButton}
            >
              <X size={24} color={Colors.gray} />
            </Button>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.avatarSection}>
              <Pressable style={styles.avatarButton} onPress={handleTakePicture}>
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} style={styles.selectedAvatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Camera size={24} color={Colors.gray} />
                  </View>
                )}
              </Pressable>
              <Text style={styles.avatarLabel}>Add Photo</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name *</Text>
              <Input
                value={formData.firstName}
                onChangeText={(value) => setFormData({ ...formData, firstName: value })}
                placeholder="Enter first name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name *</Text>
              <Input
                value={formData.lastName}
                onChangeText={(value) => setFormData({ ...formData, lastName: value })}
                placeholder="Enter last name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Relationship *</Text>
              <Input
                value={formData.relationship}
                onChangeText={(value) => setFormData({ ...formData, relationship: value })}
                placeholder="e.g., Father, Mother, Son, Daughter"
              />
            </View>

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
              <Text style={styles.label}>Deceased</Text>
              <View style={styles.deceasedContainer}>
                <Button
                  onPress={() => setFormData({ ...formData, isDeceased: !formData.isDeceased })}
                  style={[
                    styles.deceasedButton,
                    formData.isDeceased && styles.deceasedButtonActive
                  ]}
                  textStyle={[
                    styles.deceasedButtonText,
                    formData.isDeceased && styles.deceasedButtonTextActive
                  ]}
                >
                  {formData.isDeceased ? 'Yes' : 'No'}
                </Button>
              </View>
            </View>

            {formData.isDeceased && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Death Year</Text>
                <Input
                  value={formData.deathYear}
                  onChangeText={(value) => setFormData({ ...formData, deathYear: value })}
                  placeholder="YYYY"
                  keyboardType="numeric"
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              onPress={handleAddMember}
              style={styles.saveButton}
              textStyle={styles.saveButtonText}
              disabled={isLoading}
            >
              <Save size={20} color={Colors.white} style={styles.buttonIcon} />
              Add Member
            </Button>
          </View>
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
  scrollView: {
    flex: 1,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  treeContainer: {
    padding: 20,
  },
  familyLevel: {
    marginBottom: 30,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 15,
  },
  membersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  memberCard: {
    width: (width - 70) / 2,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.lightGray,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  memberRelationship: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 4,
  },
  memberYears: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
  },
  deceasedBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  deceasedText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: '600',
  },
  childrenLevel: {
    marginBottom: 30,
  },
  familySection: {
    marginTop: 20,
    padding: 20,
  },
  familyDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    marginBottom: 20,
  },
  familyDividerText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  familyContent: {
    gap: 20,
  },
  spouseSection: {
    marginBottom: 20,
  },
  childrenSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  noFamilyData: {
    alignItems: 'center',
    padding: 40,
  },
  noFamilyDataText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
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
});