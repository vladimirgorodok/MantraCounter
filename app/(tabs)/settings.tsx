import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useSettings } from '@/hooks/useSettings';
import { useAlert } from '@/template';

const PRESET_COUNTS = [21, 27, 54, 108, 216, 1008];
const LANGUAGES = [
  { code: 'ru-RU', label: 'Русский' },
  { code: 'en-US', label: 'English' },
  { code: 'sa-IN', label: 'Sanskrit' },
];

export default function SettingsScreen() {
  const { settings, updateSettings, selectedMantra } = useSettings();
  const { showAlert } = useAlert();
  const [customCount, setCustomCount] = useState('');

  async function setTargetCount(n: number) {
    if (n < 1 || n > 10000) {
      showAlert('Некорректное значение', 'Введите число от 1 до 10000');
      return;
    }
    await updateSettings({ targetCount: n });
  }

  async function handleCustomCount() {
    const n = parseInt(customCount, 10);
    if (isNaN(n)) {
      showAlert('Ошибка', 'Введите корректное число');
      return;
    }
    await setTargetCount(n);
    setCustomCount('');
    showAlert('Сохранено', `Цель установлена: ${n} повторений`);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Настройки</Text>

        {/* Current mantra */}
        <SectionCard title="Текущая мантра" icon="music-note">
          {selectedMantra ? (
            <View style={styles.mantraInfo}>
              <Text style={styles.mantraName}>{selectedMantra.name}</Text>
              <Text style={styles.mantraTrad}>{selectedMantra.tradition}</Text>
            </View>
          ) : (
            <Text style={styles.noMantra}>Не выбрана — перейдите в «Мантры»</Text>
          )}
        </SectionCard>

        {/* Target count */}
        <SectionCard title="Количество повторений" icon="format-list-numbered">
          <View style={styles.presetsRow}>
            {PRESET_COUNTS.map(n => (
              <Pressable
                key={n}
                style={({ pressed }) => [
                  styles.presetBtn,
                  settings.targetCount === n && styles.presetBtnActive,
                  pressed && { opacity: 0.75 },
                ]}
                onPress={() => setTargetCount(n)}
              >
                <Text style={[
                  styles.presetText,
                  settings.targetCount === n && styles.presetTextActive,
                ]}>
                  {n}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.customRow}>
            <TextInput
              style={styles.customInput}
              placeholder="Своё число..."
              placeholderTextColor={Colors.textMuted}
              value={customCount}
              onChangeText={setCustomCount}
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={handleCustomCount}
            />
            <Pressable
              style={({ pressed }) => [styles.customBtn, pressed && { opacity: 0.8 }]}
              onPress={handleCustomCount}
            >
              <Text style={styles.customBtnText}>Задать</Text>
            </Pressable>
          </View>
          <Text style={styles.currentCount}>
            Текущая цель: <Text style={styles.currentCountVal}>{settings.targetCount}</Text> повторений
          </Text>
        </SectionCard>

        {/* Count order */}
        <SectionCard title="Порядок счёта" icon="swap-vert">
          <View style={styles.orderRow}>
            <Pressable
              style={({ pressed }) => [
                styles.orderBtn,
                settings.order === 'asc' && styles.orderBtnActive,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => updateSettings({ order: 'asc' })}
            >
              <MaterialIcons
                name="arrow-upward"
                size={20}
                color={settings.order === 'asc' ? Colors.primary : Colors.textMuted}
              />
              <View>
                <Text style={[styles.orderTitle, settings.order === 'asc' && styles.orderTitleActive]}>
                  По возрастанию
                </Text>
                <Text style={styles.orderDesc}>0 → {settings.targetCount}</Text>
              </View>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.orderBtn,
                settings.order === 'desc' && styles.orderBtnActive,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => updateSettings({ order: 'desc' })}
            >
              <MaterialIcons
                name="arrow-downward"
                size={20}
                color={settings.order === 'desc' ? Colors.primary : Colors.textMuted}
              />
              <View>
                <Text style={[styles.orderTitle, settings.order === 'desc' && styles.orderTitleActive]}>
                  По убыванию
                </Text>
                <Text style={styles.orderDesc}>{settings.targetCount} → 0</Text>
              </View>
            </Pressable>
          </View>
        </SectionCard>

        {/* Detection mode */}
        <SectionCard title="Режим обнаружения" icon="mic">
          <View style={styles.modeRow}>
            <Pressable
              style={({ pressed }) => [
                styles.modeBtn,
                settings.detectionMode === 'voice' && styles.modeBtnActive,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => updateSettings({ detectionMode: 'voice' })}
            >
              <MaterialIcons
                name="mic"
                size={24}
                color={settings.detectionMode === 'voice' ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.modeTitle, settings.detectionMode === 'voice' && styles.modeTitleActive]}>
                Голосовой
              </Text>
              <Text style={styles.modeDesc}>Автоматически по голосу</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.modeBtn,
                settings.detectionMode === 'manual' && styles.modeBtnActive,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => updateSettings({ detectionMode: 'manual' })}
            >
              <MaterialIcons
                name="touch-app"
                size={24}
                color={settings.detectionMode === 'manual' ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.modeTitle, settings.detectionMode === 'manual' && styles.modeTitleActive]}>
                Ручной
              </Text>
              <Text style={styles.modeDesc}>Нажатие на кнопку</Text>
            </Pressable>
          </View>
        </SectionCard>

        {/* Language */}
        {settings.detectionMode === 'voice' && (
          <SectionCard title="Язык распознавания" icon="language">
            <View style={styles.langList}>
              {LANGUAGES.map(l => (
                <Pressable
                  key={l.code}
                  style={({ pressed }) => [
                    styles.langRow,
                    settings.voiceLanguage === l.code && styles.langRowActive,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => updateSettings({ voiceLanguage: l.code })}
                >
                  <Text style={[styles.langText, settings.voiceLanguage === l.code && styles.langTextActive]}>
                    {l.label}
                  </Text>
                  {settings.voiceLanguage === l.code && (
                    <MaterialIcons name="check" size={16} color={Colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          </SectionCard>
        )}

        {/* Info */}
        <View style={styles.infoBox}>
          <MaterialIcons name="info-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.infoText}>
            Голосовой режим использует микрофон для определения активности речи. При каждом произнесении мантры счётчик увеличивается автоматически.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialIcons name={icon as any} size={18} color={Colors.primary} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.text,
  },

  // Mantra info
  mantraInfo: { gap: 2 },
  mantraName: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.primary,
  },
  mantraTrad: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
  },
  noMantra: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },

  // Presets
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  presetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    minWidth: 50,
    alignItems: 'center',
  },
  presetBtnActive: {
    backgroundColor: Colors.primary,
  },
  presetText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textSecondary,
  },
  presetTextActive: {
    color: Colors.textInverse,
  },
  customRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  customInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: Typography.base,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  customBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  customBtnText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.primary,
  },
  currentCount: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    marginTop: 4,
  },
  currentCountVal: {
    fontWeight: Typography.bold,
    color: Colors.primary,
  },

  // Order
  orderRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  orderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  orderBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceWarm,
  },
  orderTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textSecondary,
  },
  orderTitleActive: {
    color: Colors.primary,
  },
  orderDesc: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
  },

  // Mode
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modeBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  modeBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceWarm,
  },
  modeTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textSecondary,
  },
  modeTitleActive: {
    color: Colors.primary,
  },
  modeDesc: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  // Lang
  langList: { gap: 4 },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
  },
  langRowActive: {
    backgroundColor: Colors.primaryLight,
  },
  langText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  langTextActive: {
    color: Colors.primary,
    fontWeight: Typography.semiBold,
  },

  // Info
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.xs,
    color: Colors.textMuted,
    lineHeight: 18,
  },
});
