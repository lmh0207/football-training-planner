import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import {
    Button,
    Dialog,
    Divider,
    List,
    Portal,
    RadioButton,
    Switch,
    Text,
    TextInput,
} from "react-native-paper";

import { View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { AiProvider } from "@/services/ai";
import { useAiConfig } from "@/stores/aiConfigStore";

const AI_PROVIDER_LABELS: Record<AiProvider, string> = {
    gemini: "Gemini Flash",
    openai: "GPT-4o-mini",
};

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];
    const [notifications, setNotifications] = useState(true);
    const { config, updateConfig } = useAiConfig();

    // Dialog states
    const [providerDialogVisible, setProviderDialogVisible] = useState(false);
    const [apiKeyDialogVisible, setApiKeyDialogVisible] = useState(false);
    const [tempApiKey, setTempApiKey] = useState("");

    const handleProviderChange = (provider: AiProvider) => {
        updateConfig({ provider });
        setProviderDialogVisible(false);
    };

    const handleApiKeySave = () => {
        if (config.provider === "gemini") {
            updateConfig({ geminiApiKey: tempApiKey });
        } else {
            updateConfig({ openaiApiKey: tempApiKey });
        }
        setTempApiKey("");
        setApiKeyDialogVisible(false);
    };

    const currentApiKey =
        config.provider === "gemini"
            ? config.geminiApiKey
            : config.openaiApiKey;

    const maskedApiKey = currentApiKey
        ? `${currentApiKey.slice(0, 8)}...${currentApiKey.slice(-4)}`
        : "설정되지 않음";

    return (
        <>
            <ScrollView
                style={[
                    styles.container,
                    { backgroundColor: colors.background },
                ]}>
                <View style={styles.section}>
                    <Text
                        variant="titleMedium"
                        style={[
                            styles.sectionTitle,
                            { color: colors.textSecondary },
                        ]}>
                        AI 설정
                    </Text>
                    <List.Item
                        title="AI 제공자"
                        description={AI_PROVIDER_LABELS[config.provider]}
                        left={(props) => (
                            <List.Icon {...props} icon="robot-outline" />
                        )}
                        right={(props) => (
                            <List.Icon {...props} icon="chevron-right" />
                        )}
                        onPress={() => setProviderDialogVisible(true)}
                        style={[
                            styles.listItem,
                            { backgroundColor: colors.card },
                        ]}
                    />
                    <Divider />
                    <List.Item
                        title="API 키"
                        description={maskedApiKey}
                        left={(props) => (
                            <List.Icon {...props} icon="key-outline" />
                        )}
                        right={(props) => (
                            <List.Icon {...props} icon="chevron-right" />
                        )}
                        onPress={() => {
                            setTempApiKey(currentApiKey);
                            setApiKeyDialogVisible(true);
                        }}
                        style={[
                            styles.listItem,
                            { backgroundColor: colors.card },
                        ]}
                    />
                </View>

                <View style={styles.section}>
                    <Text
                        variant="titleMedium"
                        style={[
                            styles.sectionTitle,
                            { color: colors.textSecondary },
                        ]}>
                        계정
                    </Text>
                    <List.Item
                        title="로그인"
                        description="Google 또는 Apple로 로그인"
                        left={(props) => <List.Icon {...props} icon="login" />}
                        onPress={() => {}}
                        style={[
                            styles.listItem,
                            { backgroundColor: colors.card },
                        ]}
                    />
                </View>

                <View style={styles.section}>
                    <Text
                        variant="titleMedium"
                        style={[
                            styles.sectionTitle,
                            { color: colors.textSecondary },
                        ]}>
                        구독
                    </Text>
                    <List.Item
                        title="Free 플랜"
                        description="AI 생성 5회/월 사용 가능"
                        left={(props) => (
                            <List.Icon {...props} icon="star-outline" />
                        )}
                        right={() => (
                            <Text
                                variant="bodySmall"
                                style={{ color: colors.primary }}>
                                업그레이드
                            </Text>
                        )}
                        onPress={() => {}}
                        style={[
                            styles.listItem,
                            { backgroundColor: colors.card },
                        ]}
                    />
                </View>

                <View style={styles.section}>
                    <Text
                        variant="titleMedium"
                        style={[
                            styles.sectionTitle,
                            { color: colors.textSecondary },
                        ]}>
                        알림
                    </Text>
                    <List.Item
                        title="푸시 알림"
                        description="훈련 리마인더 알림 받기"
                        left={(props) => (
                            <List.Icon {...props} icon="bell-outline" />
                        )}
                        right={() => (
                            <Switch
                                value={notifications}
                                onValueChange={setNotifications}
                                color={colors.primary}
                            />
                        )}
                        style={[
                            styles.listItem,
                            { backgroundColor: colors.card },
                        ]}
                    />
                </View>

                <View style={styles.section}>
                    <Text
                        variant="titleMedium"
                        style={[
                            styles.sectionTitle,
                            { color: colors.textSecondary },
                        ]}>
                        정보
                    </Text>
                    <List.Item
                        title="버전"
                        description="1.0.0"
                        left={(props) => (
                            <List.Icon {...props} icon="information-outline" />
                        )}
                        style={[
                            styles.listItem,
                            { backgroundColor: colors.card },
                        ]}
                    />
                    <Divider />
                    <List.Item
                        title="개인정보 처리방침"
                        left={(props) => (
                            <List.Icon
                                {...props}
                                icon="shield-check-outline"
                            />
                        )}
                        onPress={() => {}}
                        style={[
                            styles.listItem,
                            { backgroundColor: colors.card },
                        ]}
                    />
                    <Divider />
                    <List.Item
                        title="이용약관"
                        left={(props) => (
                            <List.Icon
                                {...props}
                                icon="file-document-outline"
                            />
                        )}
                        onPress={() => {}}
                        style={[
                            styles.listItem,
                            { backgroundColor: colors.card },
                        ]}
                    />
                </View>
            </ScrollView>

            <Portal>
                {/* AI 제공자 선택 다이얼로그 */}
                <Dialog
                    visible={providerDialogVisible}
                    onDismiss={() => setProviderDialogVisible(false)}>
                    <Dialog.Title>AI 제공자 선택</Dialog.Title>
                    <Dialog.Content>
                        <RadioButton.Group
                            onValueChange={(value) =>
                                handleProviderChange(value as AiProvider)
                            }
                            value={config.provider}>
                            <RadioButton.Item
                                label="Gemini Flash (Google)"
                                value="gemini"
                                labelStyle={{ color: colors.text }}
                            />
                            <Text
                                variant="bodySmall"
                                style={styles.providerDesc}>
                                가장 저렴, 빠른 응답 (~$0.1/1000회)
                            </Text>
                            <RadioButton.Item
                                label="GPT-4o-mini (OpenAI)"
                                value="openai"
                                labelStyle={{ color: colors.text }}
                            />
                            <Text
                                variant="bodySmall"
                                style={styles.providerDesc}>
                                안정적, 고품질 응답 (~$0.3/1000회)
                            </Text>
                        </RadioButton.Group>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setProviderDialogVisible(false)}>
                            취소
                        </Button>
                    </Dialog.Actions>
                </Dialog>

                {/* API 키 입력 다이얼로그 */}
                <Dialog
                    visible={apiKeyDialogVisible}
                    onDismiss={() => setApiKeyDialogVisible(false)}>
                    <Dialog.Title>
                        {AI_PROVIDER_LABELS[config.provider]} API 키
                    </Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodySmall" style={styles.apiKeyHelp}>
                            {config.provider === "gemini"
                                ? "Google AI Studio에서 API 키를 발급받으세요."
                                : "OpenAI 대시보드에서 API 키를 발급받으세요."}
                        </Text>
                        <TextInput
                            mode="outlined"
                            label="API 키"
                            value={tempApiKey}
                            onChangeText={setTempApiKey}
                            secureTextEntry
                            style={styles.apiKeyInput}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setApiKeyDialogVisible(false)}>
                            취소
                        </Button>
                        <Button onPress={handleApiKeySave}>저장</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </>
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
        fontWeight: "600",
    },
    listItem: {
        paddingVertical: 4,
    },
    providerDesc: {
        marginLeft: 52,
        marginTop: -8,
        marginBottom: 8,
        color: "#888",
    },
    apiKeyHelp: {
        marginBottom: 16,
        color: "#666",
    },
    apiKeyInput: {
        marginTop: 8,
    },
});
