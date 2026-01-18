import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AiProvider } from "@/services/ai";

const AI_CONFIG_KEY = "@ai_config";

export interface AiConfigState {
    provider: AiProvider;
    geminiApiKey: string;
    openaiApiKey: string;
}

const defaultConfig: AiConfigState = {
    provider: "gemini",
    geminiApiKey: "",
    openaiApiKey: "",
};

let cachedConfig: AiConfigState = { ...defaultConfig };
let listeners: Array<() => void> = [];

function notifyListeners() {
    listeners.forEach((listener) => listener());
}

export async function loadAiConfig(): Promise<AiConfigState> {
    try {
        const stored = await AsyncStorage.getItem(AI_CONFIG_KEY);
        if (stored) {
            cachedConfig = { ...defaultConfig, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error("Failed to load AI config:", e);
    }
    return cachedConfig;
}

export async function saveAiConfig(config: Partial<AiConfigState>) {
    cachedConfig = { ...cachedConfig, ...config };
    try {
        await AsyncStorage.setItem(AI_CONFIG_KEY, JSON.stringify(cachedConfig));
        notifyListeners();
    } catch (e) {
        console.error("Failed to save AI config:", e);
    }
}

export function getAiConfig(): AiConfigState {
    return cachedConfig;
}

export function useAiConfig() {
    const [config, setConfig] = useState<AiConfigState>(cachedConfig);

    useEffect(() => {
        loadAiConfig().then(setConfig);

        const listener = () => setConfig({ ...cachedConfig });
        listeners.push(listener);

        return () => {
            listeners = listeners.filter((l) => l !== listener);
        };
    }, []);

    const updateConfig = async (updates: Partial<AiConfigState>) => {
        await saveAiConfig(updates);
        setConfig({ ...cachedConfig });
    };

    return { config, updateConfig };
}
