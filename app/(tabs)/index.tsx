import { StyleSheet, FlatList } from 'react-native';
import { FAB, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { View } from '@/components/Themed';
import { SessionCard } from '@/components/training/SessionCard';
import { mockSessions } from '@/utils/mockData';
import { TrainingSession } from '@/types/training';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [sessions, setSessions] = useState<TrainingSession[]>(mockSessions);

  const handleSessionPress = (sessionId: string) => {
    router.push(`/session/${sessionId}`);
  };

  const handleFavoriteToggle = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, isFavorite: !s.isFavorite } : s
      )
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineMedium" style={{ color: colors.textSecondary }}>
        ⚽
      </Text>
      <Text variant="titleMedium" style={[styles.emptyTitle, { color: colors.text }]}>
        아직 훈련이 없어요
      </Text>
      <Text variant="bodyMedium" style={[styles.emptyDescription, { color: colors.textSecondary }]}>
        AI가 맞춤 훈련을 만들어 드릴게요
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            onPress={() => handleSessionPress(item.id)}
            onFavoriteToggle={() => handleFavoriteToggle(item.id)}
          />
        )}
        contentContainerStyle={sessions.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmptyState}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        color="#FFFFFF"
        onPress={() => router.push('/create')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    fontWeight: '600',
  },
  emptyDescription: {
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 16,
  },
});
