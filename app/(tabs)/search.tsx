import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Shield, UserPlus, MapPin, Calendar } from 'lucide-react-native';

const searchResults = [
  {
    id: 1,
    name: 'Abdullahi Bello',
    idNumber: 'NIN: •••• •••• 1234',
    location: 'Lagos, Nigeria',
    verified: true,
    mutualConnections: 3,
    lastActive: '2 days ago',
  },
  {
    id: 2,
    name: 'Khadija Ahmed',
    idNumber: 'BVN: •••• •••• 5678',
    location: 'Abuja, Nigeria',
    verified: true,
    mutualConnections: 1,
    lastActive: '1 week ago',
  },
  {
    id: 3,
    name: 'Ibrahim Musa',
    idNumber: 'NIN: •••• •••• 9012',
    location: 'Kano, Nigeria',
    verified: false,
    mutualConnections: 0,
    lastActive: '3 weeks ago',
  },
];

export default function SearchTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'id' | 'name'>('id');

  const SearchResult = ({ result }: { result: any }) => (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <View style={styles.resultAvatar}>
          <Text style={styles.resultInitials}>
            {result.name.split(' ').map((n: string) => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.resultInfo}>
          <Text style={styles.resultName}>{result.name}</Text>
          <Text style={styles.resultId}>{result.idNumber}</Text>
          <View style={styles.resultMeta}>
            <MapPin size={12} color="#64748b" strokeWidth={2} />
            <Text style={styles.resultLocation}>{result.location}</Text>
          </View>
        </View>
        <View style={styles.resultStatus}>
          {result.verified ? (
            <View style={styles.verifiedBadge}>
              <Shield size={12} color="#059669" strokeWidth={2} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          ) : (
            <View style={styles.unverifiedBadge}>
              <Text style={styles.unverifiedText}>Unverified</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.resultDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Mutual Connections:</Text>
          <Text style={styles.detailValue}>{result.mutualConnections}</Text>
        </View>
        <View style={styles.detailItem}>
          <Calendar size={12} color="#64748b" strokeWidth={2} />
          <Text style={styles.detailValue}>Active {result.lastActive}</Text>
        </View>
      </View>

      <Pressable style={styles.connectButton}>
        <UserPlus size={16} color="#ffffff" strokeWidth={2} />
        <Text style={styles.connectButtonText}>Request Connection</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Family</Text>
        <Text style={styles.headerSubtitle}>Find relatives by ID or name</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchTypeToggle}>
          <Pressable
            style={[
              styles.toggleButton,
              searchType === 'id' && styles.toggleButtonActive,
            ]}
            onPress={() => setSearchType('id')}
          >
            <Shield size={16} color={searchType === 'id' ? '#ffffff' : '#64748b'} strokeWidth={2} />
            <Text
              style={[
                styles.toggleText,
                searchType === 'id' && styles.toggleTextActive,
              ]}
            >
              By ID
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.toggleButton,
              searchType === 'name' && styles.toggleButtonActive,
            ]}
            onPress={() => setSearchType('name')}
          >
            <Search size={16} color={searchType === 'name' ? '#ffffff' : '#64748b'} strokeWidth={2} />
            <Text
              style={[
                styles.toggleText,
                searchType === 'name' && styles.toggleTextActive,
              ]}
            >
              By Name
            </Text>
          </Pressable>
        </View>

        <View style={styles.searchInputContainer}>
          <Search size={20} color="#64748b" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              searchType === 'id' 
                ? 'Enter NIN or BVN number' 
                : 'Enter full name'
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
            keyboardType={searchType === 'id' ? 'numeric' : 'default'}
            placeholderTextColor="#94a3b8"
          />
          <Pressable style={styles.filterButton}>
            <Filter size={20} color="#64748b" strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Search Results</Text>
          <Text style={styles.resultsCount}>{searchResults.length} people found</Text>
        </View>

        {searchResults.map((result) => (
          <SearchResult key={result.id} result={result} />
        ))}

        <View style={styles.searchTips}>
          <Text style={styles.tipsTitle}>Search Tips</Text>
          <Text style={styles.tipText}>• Use complete NIN or BVN for accurate results</Text>
          <Text style={styles.tipText}>• Make sure names match government records</Text>
          <Text style={styles.tipText}>• Verified users appear first in results</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  searchTypeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#2563eb',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 6,
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
  },
  filterButton: {
    padding: 4,
    marginLeft: 8,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  resultsCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  resultAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultInitials: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  resultId: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultLocation: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  resultStatus: {
    alignItems: 'flex-end',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 4,
  },
  unverifiedBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  unverifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#d97706',
  },
  resultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginRight: 4,
  },
  detailValue: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '600',
    marginLeft: 4,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  searchTips: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 100,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
    lineHeight: 20,
  },
});