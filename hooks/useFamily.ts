import { useFamilyStore } from '@/store/familyStore';
import { showToast } from '@/providers/ToastProvider';
import { Relationship, Notification, SearchResult } from '@/types/family';

export const useFamily = () => {
  const {
    familyTree,
    relationships,
    notifications,
    searchHistory,
    favorites,
    isLoading,
    error,
    setFamilyTree,
    addRelationship,
    updateRelationship,
    removeRelationship,
    addNotification,
    markNotificationAsRead,
    clearNotifications,
    addToSearchHistory,
    clearSearchHistory,
    addToFavorites,
    removeFromFavorites,
    setLoading,
    setError,
    clearError,
  } = useFamilyStore();

  const sendRelationshipRequest = async (relativeData: {
    firstName: string;
    lastName: string;
    relationship: string;
    idNumber?: string;
    idType?: 'NIN' | 'BVN';
    notes?: string;
  }) => {
    try {
      setLoading(true);
      clearError();

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newRelationship: Relationship = {
        id: Date.now().toString(),
        userId: '1', // Current user ID
        relativeId: Date.now().toString(),
        relationType: relativeData.relationship as any,
        status: 'pending',
        initiatedBy: '1',
        createdAt: new Date().toISOString(),
        notes: relativeData.notes,
      };

      addRelationship(newRelationship);

      // Add notification
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'relationship_request',
        senderId: '1',
        receiverId: newRelationship.relativeId,
        title: 'Relationship Request Sent',
        message: `Request sent to ${relativeData.firstName} ${relativeData.lastName}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      addNotification(notification);
      showToast.success('Relationship request sent successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send request';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const acceptRelationship = async (relationshipId: string) => {
    try {
      setLoading(true);
      clearError();

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      updateRelationship(relationshipId, {
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
      });

      showToast.success('Relationship accepted');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept relationship';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const rejectRelationship = async (relationshipId: string) => {
    try {
      setLoading(true);
      clearError();

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      updateRelationship(relationshipId, {
        status: 'rejected',
      });

      showToast.info('Relationship rejected');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject relationship';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const searchFamilyMembers = async (query: string, searchType: 'id' | 'name'): Promise<SearchResult[]> => {
    try {
      setLoading(true);
      clearError();

      // Add to search history
      addToSearchHistory(query);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Mock search results
      const mockResults: SearchResult[] = [
        {
          user: {
            id: '2',
            firstName: 'Abdullahi',
            lastName: 'Bello',
            fullName: 'Abdullahi Bello',
            idType: 'NIN',
            idNumber: '12345678902',
            isVerified: true,
            joinedDate: '2025-01-01',
            lastActive: new Date().toISOString(),
          },
          mutualConnections: 3,
          relationshipSuggestion: 'cousin',
          distance: 2,
        },
        {
          user: {
            id: '3',
            firstName: 'Khadija',
            lastName: 'Ahmed',
            fullName: 'Khadija Ahmed',
            idType: 'BVN',
            idNumber: '12345678903',
            isVerified: true,
            joinedDate: '2025-01-01',
            lastActive: new Date().toISOString(),
          },
          mutualConnections: 1,
          relationshipSuggestion: 'sister',
          distance: 1,
        },
      ];

      return mockResults;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      showToast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (userId: string) => {
    if (favorites.includes(userId)) {
      removeFromFavorites(userId);
      showToast.info('Removed from favorites');
    } else {
      addToFavorites(userId);
      showToast.success('Added to favorites');
    }
  };

  const markNotificationAsReadHandler = (notificationId: string) => {
    markNotificationAsRead(notificationId);
  };

  const getUnreadNotificationsCount = () => {
    return notifications.filter((notification: Notification) => !notification.isRead).length;
  };

  return {
    // State
    familyTree,
    relationships,
    notifications,
    searchHistory,
    favorites,
    isLoading,
    error,

    // Actions
    sendRelationshipRequest,
    acceptRelationship,
    rejectRelationship,
    searchFamilyMembers,
    toggleFavorite,
    markNotificationAsRead: markNotificationAsReadHandler,
    clearNotifications,
    clearSearchHistory,
    getUnreadNotificationsCount,
    clearError,
  };
}; 