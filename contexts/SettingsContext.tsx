import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, loadSettings, saveSettings } from '@/services/storageService';
import { Mantra, BUILTIN_MANTRAS } from '@/constants/mantras';
import { loadCustomMantras, saveCustomMantras } from '@/services/storageService';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  allMantras: Mantra[];
  customMantras: Mantra[];
  addCustomMantra: (mantra: Mantra) => Promise<void>;
  removeCustomMantra: (id: string) => Promise<void>;
  selectedMantra: Mantra | null;
  isLoaded: boolean;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({
    targetCount: 108,
    order: 'asc',
    selectedMantraId: 'om_mani',
    detectionMode: 'voice',
    voiceLanguage: 'ru-RU',
  });
  const [customMantras, setCustomMantras] = useState<Mantra[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function init() {
      const s = await loadSettings();
      const c = await loadCustomMantras();
      setSettings(s);
      setCustomMantras(c);
      setIsLoaded(true);
    }
    init();
  }, []);

  const allMantras = [...BUILTIN_MANTRAS, ...customMantras];

  const selectedMantra = allMantras.find(m => m.id === settings.selectedMantraId) || null;

  async function updateSettings(partial: Partial<AppSettings>) {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    await saveSettings(updated);
  }

  async function addCustomMantra(mantra: Mantra) {
    const updated = [...customMantras, mantra];
    setCustomMantras(updated);
    await saveCustomMantras(updated);
  }

  async function removeCustomMantra(id: string) {
    const updated = customMantras.filter(m => m.id !== id);
    setCustomMantras(updated);
    await saveCustomMantras(updated);
  }

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      allMantras,
      customMantras,
      addCustomMantra,
      removeCustomMantra,
      selectedMantra,
      isLoaded,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}
