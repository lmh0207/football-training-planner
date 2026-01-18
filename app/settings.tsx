import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import {
    List,
    Text,
    Switch,
    Dialog,
    Portal,
    Button,
    TextInput,
    SegmentedButtons,
    Divider,
} from "react-native-paper";
import { useRouter } from "expo-router";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useAiConfig, saveAiConfig } from "@/stores/aiConfigStore";
import { AiProvider } from "@/services/ai";

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];
    const router = useRouter();

    const { config, updateConfig } = useAiConfig();

    const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState("");
    const [editingProvider, setEditingProvider] = useState<AiProvider>("gemini");

    const handleProviderChange = async (provider: string) => {
        await updateConfig({ provider: provider as AiProvider });
    };

    const openApiKeyDialog = (provider: AiProvider) => {
        setEditingProvider(provider);
        setApiKeyInput(
            provider === "gemini" ? config.geminiApiKey : config.openaiApiKey
        );
        setShowApiKeyDialog(true);
    };

    const saveApiKey = async () => {
        if (editingProvider === "gemini") {
            await updateConfig({ geminiApiKey: apiKeyInput });
        } else {
            await updateConfig({ openaiApiKey: apiKeyInput });
        }
        setShowApiKeyDialog(false);
        setApiKeyInput("");
    };

    const getApiKeyStatus = (provider: AiProvider) => {
        const key = provider === "gemini" ? config.geminiApiKey : config.openaiApiKey;
        if (!key) return "미설정";
        return `설정됨 (${key.substring(0, 8)}...)`;
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* AI 설정 */}
            <List.Section>
                <List.Subheader style={{ color: colors.textSecondary }}>
                    AI 설정
                </List.Subheader>

                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <List.Item
                        title="AI 제공자"
                        description={
                            config.provider === "gemini"
                                ? "Google Gemini Flash"
                                : "OpenAI GPT-4o-mini"
                        }
                        left={(props) => <List.Icon {...props} icon="robot" />}
                    />
                    <View style={styles.providerSelector}>
                        <SegmentedButtons
                            value={config.provider}
                            onValueChange={handleProviderChange}
                            buttons={[
                                { value: "gemini", label: "Gemini" },
                                { value: "openai", label: "OpenAI" },
                            ]}
                        />
                    </View>

                    <Divider />

                    <List.Item
                        title="Gemini API 키"
                        description={getApiKeyStatus("gemini")}
                        left={(props) => <List.Icon {...props} icon="key" />}
                        right={(props) => (
                            <Button
                                mode="text"
                                onPress={() => openApiKeyDialog("gemini")}>
                                {config.geminiApiKey ? "변경" : "설정"}
                            </Button>
                        )}
                    />

                    <Divider />

                    <List.Item
                        title="OpenAI API 키"
                        description={getApiKeyStatus("openai")}
                        left={(props) => <List.Icon {...props} icon="key" />}
                        right={(props) => (
                            <Button
                                mode="text"
                                onPress={() => openApiKeyDialog("openai")}>
                                {config.openaiApiKey ? "변경" : "설정"}
                            </Button>
                        )}
                    />
                </View>
            </List.Section>

            {/* 앱 정보 */}
            <List.Section>
                <List.Subheader style={{ color: colors.textSecondary }}>
                    앱 정보
                </List.Subheader>

                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <List.Item
                        title="버전"
                        description="1.0.0"
                        left={(props) => (
                            <List.Icon {...props} icon="information" />
                        )}
                    />
                </View>
            </List.Section>

            {/* API 키 입력 다이얼로그 */}
            <Portal>
                <Dialog
                    visible={showApiKeyDialog}
                    onDismiss={() => setShowApiKeyDialog(false)}>
                    <Dialog.Title>
                        {editingProvider === "gemini" ? "Gemini" : "OpenAI"} API 키
                    </Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            mode="outlined"
                            placeholder="API 키를 입력하세요"
                            value={apiKeyInput}
                            onChangeText={setApiKeyInput}
                            secureTextEntry
                        />
                        <Text
                            variant="bodySmall"
                            style={[styles.apiKeyHint, { color: colors.textSecondary }]}>
                            {editingProvider === "gemini"
                                ? "Google AI Studio에서 API 키를 발급받으세요"
                                : "OpenAI 플랫폼에서 API 키를 발급받으세요"}
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setShowApiKeyDialog(false)}>취소</Button>
                        <Button onPress={saveApiKey}>저장</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: "hidden",
    },
    providerSelector: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    apiKeyHint: {
        marginTop: 8,
    },
});
