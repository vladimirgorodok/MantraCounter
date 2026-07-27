import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mantra, BUILTIN_MANTRAS } from '@/constants/mantras';

const KEYS = {
  SETTINGS: 'mantra_settings',
  CUSTOM_MANTRAS: 'custom_mantras',
  HISTORY: 'mantra_history',
};

export interface AppSettings {
  targetCount: number;
  order: 'asc' | 'desc';
  selectedMantraId: string | null;
  detectionMode: 'voice' | 'manual';
  voiceLanguage: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  targetCount: 108,
  order: 'asc',
  selectedMantraId: 'om_mani',
  detectionMode: 'voice',
  voiceLanguage: 'ru-RU',
};

export interface SessionRecord {
  id: string;
  mantraId: string;
  mantraName: string;
  targetCount: number;
  completedCount: number;
  completedAt: string;
}

// Settings
export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// Custom mantras
export async function loadCustomMantras(): Promise<Mantra[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.CUSTOM_MANTRAS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export async function saveCustomMantras(mantras: Mantra[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.CUSTOM_MANTRAS, JSON.stringify(mantras));
}

// History
export async function loadHistory(): Promise<SessionRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.HISTORY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export async function saveSession(record: SessionRecord): Promise<void> {
  try {
    const history = await loadHistory();
    history.unshift(record);
    const trimmed = history.slice(0, 50);
    await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(trimmed));
  } catch {}
}
