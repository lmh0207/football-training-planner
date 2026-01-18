import { StyleSheet, ScrollView } from 'react-native';
import { List, Switch, Divider, Text } from 'react-native-paper';
import { useState } from 'react';

import { View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [notifications, setNotifications] = useState(true);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          계정
        </Text>
        <List.Item
          title="로그인"
          description="Google 또는 Apple로 로그인"
          left={(props) => <List.Icon {...props} icon="login" />}
          onPress={() => {}}
          style={[styles.listItem, { backgroundColor: colors.card }]}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          구독
        </Text>
        <List.Item
          title="Free 플랜"
          description="AI 생성 5회/월 사용 가능"
          left={(props) => <List.Icon {...props} icon="star-outline" />}
          right={() => (
            <Text variant="bodySmall" style={{ color: colors.primary }}>
              업그레이드
            </Text>
          )}
          onPress={() => {}}
          style={[styles.listItem, { backgroundColor: colors.card }]}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          알림
        </Text>
        <List.Item
          title="푸시 알림"
          description="훈련 리마인더 알림 받기"
          left={(props) => <List.Icon {...props} icon="bell-outline" />}
          right={() => (
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              color={colors.primary}
            />
          )}
          style={[styles.listItem, { backgroundColor: colors.card }]}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          정보
        </Text>
        <List.Item
          title="버전"
          description="1.0.0"
          left={(props) => <List.Icon {...props} icon="information-outline" />}
          style={[styles.listItem, { backgroundColor: colors.card }]}
        />
        <Divider />
        <List.Item
          title="개인정보 처리방침"
          left={(props) => <List.Icon {...props} icon="shield-check-outline" />}
          onPress={() => {}}
          style={[styles.listItem, { backgroundColor: colors.card }]}
        />
        <Divider />
        <List.Item
          title="이용약관"
          left={(props) => <List.Icon {...props} icon="file-document-outline" />}
          onPress={() => {}}
          style={[styles.listItem, { backgroundColor: colors.card }]}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    marginLeft: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  listItem: {
    paddingVertical: 4,
  },
});
