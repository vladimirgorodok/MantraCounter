import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useSettings } from '@/hooks/useSettings';
import { Mantra, BUILTIN_MANTRAS } from '@/constants/mantras';
import { useAlert } from '@/template';

// Mock AI search results
const AI_SEARCH_MOCK: Record<string, Mantra> = {
  'ом нама шивая': {
    id: 'om_nama_shivaya',
    name: 'Ом Нама Шивая',
    text: 'ОМ НАМА ШИВАЯ',
    translation: 'Поклонение Шиве',
    tradition: 'Шиваизм',
    keywords: ['нама', 'шивая', 'om', 'namah', 'shivaya'],
    defaultCount: 108,
  },
  'ом шри ганешая': {
    id: 'om_shri_ganeshaya',
    name: 'Ом Шри Ганешая Намаха',
    text: 'ОМ ШРИ ГАНЕШАЯ НАМАХА',
    translation: 'Поклонение Ганеше',
    tradition: 'Индуизм',
    keywords: ['ганешая', 'ганеша', 'ganesh', 'namaha'],
    defaultCount: 108,
  },
  'ом намо нараяная': {
    id: 'om_namo_narayanaya',
    name: 'Ом Намо Нараяная',
    text: 'ОМ НАМО НАРАЯНАЯ',
    translation: 'Поклонение Нараяне (Вишну)',
    tradition: 'Вайшнавизм',
    keywords: ['нараяная', 'нараяна', 'narayanaya', 'narayana'],
    defaultCount: 108,
  },
};

export default function MantrasScreen() {
  const { allMantras, customMantras, addCustomMantra, removeCustomMantra, settings, updateSettings } = useSettings();
  const { showAlert } = useAlert();
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [aiSearching, setAiSearching] = useState(false);
  const [aiResult, setAiResult] = useState<Mantra | null>(null);
  const [activeTab, setActiveTab] = useState<'library' | 'search'>('library');

  const filtered = allMantras.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.tradition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function selectMantra(mantra: Mantra) {
    updateSettings({ selectedMantraId: mantra.id, targetCount: mantra.defaultCount });
    showAlert('Мантра выбрана', `"${mantra.name}" установлена как текущая мантра`);
  }

  async function handleAiSearch() {
    if (!aiSearchQuery.trim()) return;
    setAiSearching(true);
    setAiResult(null);

    // Simulate AI search
    await new Promise(r => setTimeout(r, 1800));

    const key = aiSearchQuery.toLowerCase().trim();
    let result = AI_SEARCH_MOCK[key];

    if (!result) {
      // Generate a generic result
      result = {
        id: `custom_${Date.now()}`,
        name: aiSearchQuery.trim(),
        text: aiSearchQuery.toUpperCase().trim(),
        translation: 'Священная мантра (добавлена через ИИ поиск)',
        tradition: 'Неизвестно',
        keywords: aiSearchQuery.toLowerCase().split(' '),
        defaultCount: 108,
      };
    }

    setAiResult(result);
    setAiSearching(false);
  }

  async function addAiMantra() {
    if (!aiResult) return;
    const exists = allMantras.find(m => m.id === aiResult.id || m.text === aiResult.text);
    if (exists) {
      showAlert('Уже добавлено', 'Эта мантра уже есть в библиотеке');
      return;
    }
    await addCustomMantra(aiResult);
    setAiResult(null);
    setAiSearchQuery('');
    setActiveTab('library');
    showAlert('Добавлено', `"${aiResult.name}" добавлена в библиотеку`);
  }

  function confirmRemove(mantra: Mantra) {
    showAlert('Удалить мантру?', `"${mantra.name}" будет удалена из библиотеки`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => removeCustomMantra(mantra.id) },
    ]);
  }

  const isCustom = (mantra: Mantra) => customMantras.some(m => m.id === mantra.id);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Библиотека мантр</Text>
        <Text style={styles.subtitle}>{allMantras.length} мантр</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, activeTab === 'library' && styles.tabActive]}
          onPress={() => setActiveTab('library')}
        >
          <Text style={[styles.tabText, activeTab === 'library' && styles.tabTextActive]}>
            Библиотека
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'search' && styles.tabActive]}
          onPress={() => setActiveTab('search')}
        >
          <MaterialIcons
            name="auto-awesome"
            size={14}
            color={activeTab === 'search' ? Colors.primary : Colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}>
            ИИ Поиск
          </Text>
        </Pressable>
      </View>

      {activeTab === 'library' ? (
        <>
          {/* Search input */}
          <View style={styles.searchRow}>
            <MaterialIcons name="search" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Поиск мантры..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Mantra list */}
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <MantraCard
                mantra={item}
                isSelected={settings.selectedMantraId === item.id}
                isCustom={isCustom(item)}
                onSelect={() => selectMantra(item)}
                onRemove={isCustom(item) ? () => confirmRemove(item) : undefined}
              />
            )}
          />
        </>
      ) : (
        <ScrollView style={styles.aiScroll} contentContainerStyle={styles.aiContent} showsVerticalScrollIndicator={false}>
          <View style={styles.aiInfo}>
            <MaterialIcons name="auto-awesome" size={32} color={Colors.primary} />
            <Text style={styles.aiTitle}>Поиск мантры с ИИ</Text>
            <Text style={styles.aiDesc}>
              Введите название или описание мантры, и ИИ найдёт информацию о ней и добавит в вашу библиотеку
            </Text>
          </View>

          <View style={styles.aiInputRow}>
            <TextInput
              style={styles.aiInput}
              placeholder="Например: Ом Нама Шивая"
              placeholderTextColor={Colors.textMuted}
              value={aiSearchQuery}
              onChangeText={setAiSearchQuery}
              onSubmitEditing={handleAiSearch}
              returnKeyType="search"
            />
            <Pressable
              style={({ pressed }) => [styles.aiSearchBtn, pressed && { opacity: 0.8 }]}
              onPress={handleAiSearch}
            >
              {aiSearching ? (
                <ActivityIndicator size="small" color={Colors.textInverse} />
              ) : (
                <MaterialIcons name="search" size={20} color={Colors.textInverse} />
              )}
            </Pressable>
          </View>

          {aiSearching && (
            <View style={styles.loadingCard}>
              <ActivityIndicator color={Colors.primary} />
              <Text style={styles.loadingText}>ИИ ищет информацию...</Text>
            </View>
          )}

          {aiResult && !aiSearching && (
            <View style={styles.aiResultCard}>
              <View style={styles.aiResultHeader}>
                <MaterialIcons name="auto-awesome" size={18} color={Colors.primary} />
                <Text style={styles.aiResultLabel}>Найдено ИИ</Text>
              </View>
              <Text style={styles.aiResultName}>{aiResult.name}</Text>
              <Text style={styles.aiResultText}>{aiResult.text}</Text>
              <Text style={styles.aiResultTranslation}>{aiResult.translation}</Text>
              <Text style={styles.aiResultTradition}>{aiResult.tradition}</Text>
              <Pressable
                style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}
                onPress={addAiMantra}
              >
                <MaterialIcons name="add" size={18} color={Colors.textInverse} />
                <Text style={styles.addBtnText}>Добавить в библиотеку</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

interface MantraCardProps {
  mantra: Mantra;
  isSelected: boolean;
  isCustom: boolean;
  onSelect: () => void;
  onRemove?: () => void;
}

function MantraCard({ mantra, isSelected, isCustom, onSelect, onRemove }: MantraCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isSelected && styles.cardSelected,
        pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
      ]}
      onPress={onSelect}
    >
      <View style={styles.cardLeft}>
        <View style={styles.cardNameRow}>
          <Text style={[styles.cardName, isSelected && styles.cardNameSelected]}>
            {mantra.name}
          </Text>
          {isCustom && (
            <View style={styles.customBadge}>
              <Text style={styles.customBadgeText}>мой</Text>
            </View>
          )}
          {isSelected && (
            <MaterialIcons name="check-circle" size={16} color={Colors.primary} />
          )}
        </View>
        <Text style={styles.cardText} numberOfLines={1}>{mantra.text}</Text>
        <Text style={styles.cardTradition}>{mantra.tradition}</Text>
      </View>
      <View style={styles.cardRight}>
        {onRemove && (
          <Pressable
            style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.6 }]}
            onPress={onRemove}
            hitSlop={8}
          >
            <MaterialIcons name="delete-outline" size={18} color={Colors.error} />
          </Pressable>
        )}
        <Text style={styles.cardCount}>{mantra.defaultCount}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.primaryLight,
  },
  tabText: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    fontWeight: Typography.medium,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.text,
    includeFontPadding: false,
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceWarm,
  },
  cardLeft: { flex: 1 },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  cardName: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.text,
  },
  cardNameSelected: {
    color: Colors.primary,
  },
  customBadge: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  customBadgeText: {
    fontSize: 10,
    color: Colors.textInverse,
    fontWeight: Typography.medium,
  },
  cardText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardTradition: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minWidth: 40,
  },
  removeBtn: { padding: 4 },
  cardCount: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: Typography.medium,
  },

  // AI search
  aiScroll: { flex: 1 },
  aiContent: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  aiInfo: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  aiTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  aiDesc: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  aiInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  aiInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: Typography.base,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  aiSearchBtn: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  loadingCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  loadingText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  aiResultCard: {
    backgroundColor: Colors.surfaceWarm,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    gap: 4,
    ...Shadow.sm,
  },
  aiResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  aiResultLabel: {
    fontSize: Typography.xs,
    color: Colors.primary,
    fontWeight: Typography.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiResultName: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  aiResultText: {
    fontSize: Typography.base,
    color: Colors.primary,
    fontWeight: Typography.semiBold,
    letterSpacing: 1,
  },
  aiResultTranslation: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  aiResultTradition: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    marginTop: Spacing.sm,
    ...Shadow.sm,
  },
  addBtnText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textInverse,
  },
});
