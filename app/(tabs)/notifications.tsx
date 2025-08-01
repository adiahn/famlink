import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Check, X, UserPlus, Heart, Shield, CircleAlert as AlertCircle, Clock, CircleCheck as CheckCircle } from 'lucide-react-native';

const notifications = [
  {
    id: 1,
    type: 'relationship_request',
    title: 'Family Connection Request',
    message: 'Aisha Ibrahim wants to connect as your sister',
    time: '2 hours ago',
    status: 'pending',
    icon: UserPlus,
    color: '#ea580c',
    actions: ['accept', 'reject'],
  },
  {
    id: 2,
    type: 'relationship_accepted',
    title: 'Connection Accepted',
    message: 'Ahmed Bello accepted your relationship request',
    time: '1 day ago',
    status: 'read',
    icon: Heart,
    color: '#059669',
    actions: [],
  },
  {
    id: 3,
    type: 'verification_complete',
    title: 'Identity Verified',
    message: 'Musa Yusuf completed identity verification and joined your family tree',
    time: '2 days ago',
    status: 'unread',
    icon: Shield,
    color: '#2563eb',
    actions: [],
  },
  {
    id: 4,
    type: 'relationship_request',
    title: 'Uncle Connection Request',
    message: 'Usman Abdullahi claims to be your uncle and wants to connect',
    time: '3 days ago',
    status: 'pending',
    icon: UserPlus,
    color: '#ea580c',
    actions: ['accept', 'reject'],
  },
  {
    id: 5,
    type: 'tree_update',
    title: 'Family Tree Updated',
    message: 'Your family tree was updated with 2 new connections',
    time: '1 week ago',
    status: 'read',
    icon: CheckCircle,
    color: '#059669',
    actions: [],
  },
];

export default function Notifications() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'read'>('all');

  const handleAction = (notificationId: number, action: string) => {
    console.log(`${action} notification ${notificationId}`);
    // Handle accept/reject logic here
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'pending') return notification.status === 'pending';
    if (filter === 'read') return notification.status === 'read';
    return true;
  });

  const NotificationItem = ({ notification }: { notification: any }) => (
    <View style={[
      styles.notificationCard,
      notification.status === 'unread' && styles.unreadCard
    ]}>
      <View style={styles.notificationHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${notification.color}15` }]}>
          <notification.icon size={20} color={notification.color} strokeWidth={2} />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          <View style={styles.timeContainer}>
            <Clock size={12} color="#64748b" strokeWidth={2} />
            <Text style={styles.notificationTime}>{notification.time}</Text>
          </View>
        </View>
        {notification.status === 'unread' && <View style={styles.unreadIndicator} />}
      </View>

      {notification.actions.length > 0 && (
        <View style={styles.actionsContainer}>
          <Pressable
            style={styles.rejectButton}
            onPress={() => handleAction(notification.id, 'reject')}
          >
            <X size={16} color="#dc2626" strokeWidth={2} />
            <Text style={styles.rejectText}>Decline</Text>
          </Pressable>
          <Pressable
            style={styles.acceptButton}
            onPress={() => handleAction(notification.id, 'accept')}
          >
            <Check size={16} color="#ffffff" strokeWidth={2} />
            <Text style={styles.acceptText}>Accept</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>Family requests & updates</Text>
        </View>
        <Pressable style={styles.markAllButton}>
          <CheckCircle size={20} color="#2563eb" strokeWidth={2} />
        </Pressable>
      </View>

      <View style={styles.filterContainer}>
        {['all', 'pending', 'read'].map((filterType) => (
          <Pressable
            key={filterType}
            style={[
              styles.filterButton,
              filter === filterType && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(filterType as any)}
          >
            <Text
              style={[
                styles.filterText,
                filter === filterType && styles.filterTextActive,
              ]}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Text>
            {filterType === 'pending' && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>2</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Bell size={48} color="#94a3b8" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyMessage}>
              You're all caught up! New family requests and updates will appear here.
            </Text>
          </View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  markAllButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f1f5f9',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  pendingBadge: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  pendingBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 4,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
    marginRight: 12,
  },
  rejectText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#059669',
  },
  acceptText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
});