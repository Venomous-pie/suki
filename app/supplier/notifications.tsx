import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Package, Tag, Clock, Bell } from 'lucide-react-native';

interface Notification {
  id: number;
  user_id: number;
  title: string;
  body: string;
  data_payload?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const theme = useColorScheme();
  const colors = Colors[theme];

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'https://suki-auth-api.loca.lt';
      const response = await fetch(`${backendUrl}/api/notifications?userId=${user.id}`);
      const data = await response.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (notificationId: number) => {
    if (!user?.id) return;
    try {
      const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'https://suki-auth-api.loca.lt';
      await fetch(`${backendUrl}/api/notifications/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, notificationId }),
      });
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  const getIcon = (type?: string) => {
    switch (type) {
      case 'order': return <Package size={20} color="#F59E0B" />;
      case 'product': return <Tag size={20} color="#EF4444" />;
      case 'batch': return <Clock size={20} color={colors.primary} />;
      default: return <Bell size={20} color={colors.icon} />;
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[
        styles.item, 
        { 
          backgroundColor: item.is_read ? colors.background : colors.surface,
          borderBottomColor: colors.border
        }
      ]}
      onPress={() => {
        if (!item.is_read) markAsRead(item.id);
        // Note: In a real app we would deep link here using router.push based on item.data_payload
      }}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.is_read ? '#E5E7EB' : '#FEF3C7' }]}>
        {getIcon(item.data_payload?.type)}
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.body, { color: colors.icon }]}>{item.body}</Text>
        <Text style={[styles.time, { color: colors.icon }]}>
          {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Text>
      </View>
      {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={notifications.length === 0 && styles.emptyContainer}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.icon }]}>No notifications yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  }
});
