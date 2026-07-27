import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useCounter } from '@/hooks/useCounter';
import { useSettings } from '@/hooks/useSettings';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { CircularProgress } from '@/components/ui/CircularProgress';

export default function CounterScreen() {
  const { settings, selectedMantra } = useSettings();
  const {
    count,
    targetCount,
    isRunning,
    isCompleted,
    displayCount,
    progress,
    startSession,
    increment,
    resetSession,
    pauseSession,
    resumeSession,
  } = useCounter();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [voiceActive, setVoiceActive] = useState(false);

  const handleMantraDetected = useCallback(() => {
    increment();
    // Pulse animation
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.08, duration: 100, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [increment, pulseAnim]);

  const isVoiceMode = settings.detectionMode === 'voice';
  const shouldListenVoice = isVoiceMode && isRunning && !isCompleted;

  const { isListening, error: voiceError } = useVoiceRecognition({
    mantra: selectedMantra,
    isActive: shouldListenVoice,
    onMantraDetected: handleMantraDetected,
    language: settings.voiceLanguage,
  });

  function handleStart() {
    const mantra = selectedMantra;
    startSession(
      settings.targetCount,
      settings.order,
      mantra?.id ?? 'custom',
      mantra?.name ?? 'Мантра'
    );
  }

  function handleManualTap() {
    if (!isVoiceMode && isRunning && !isCompleted) {
      handleMantraDetected();
    }
  }

  const remaining = targetCount - count;
  const isWarning = remaining <= 3 && remaining > 0 && isRunning;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/hero-lotus.png')}
            style={styles.lotusSmall}
            contentFit="contain"
            transition={300}
          />
          <View>
            <Text style={styles.title}>Счётчик Мантр</Text>
            {selectedMantra ? (
              <Text style={styles.subtitle}>{selectedMantra.name}</Text>
            ) : (
              <Text style={styles.subtitleEmpty}>Выберите мантру в настройках</Text>
            )}
          </View>
        </View>

        {/* Main counter circle */}
        <Animated.View style={[styles.circleWrapper, { transform: [{ scale: pulseAnim }] }]}>
          <CircularProgress
            size={260}
            strokeWidth={10}
            progress={progress}
            color={isWarning ? Colors.warning3 : Colors.primary}
            trackColor={Colors.primaryLight}
          >
            <View style={styles.counterInner}>
              {isCompleted ? (
                <>
                  <MaterialIcons name="check-circle" size={40} color={Colors.success} />
                  <Text style={styles.completedText}>Завершено!</Text>
                </>
              ) : (
                <>
                  <Text style={[styles.countDisplay, isWarning && styles.countWarning]}>
                    {displayCount}
                  </Text>
                  <Text style={styles.countLabel}>
                    {settings.order === 'asc'
                      ? `из ${targetCount}`
                      : `осталось`}
                  </Text>
                  {isWarning && (
                    <Text style={styles.warningLabel}>скоро конец</Text>
                  )}
                </>
              )}
            </View>
          </CircularProgress>
        </Animated.View>

        {/* Mode indicator */}
        <View style={styles.modeRow}>
          <View style={[styles.modeBadge, isListening && styles.modeBadgeActive]}>
            <MaterialIcons
              name={isVoiceMode ? 'mic' : 'touch-app'}
              size={14}
              color={isListening ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.modeText, isListening && styles.modeTextActive]}>
              {isVoiceMode
                ? isListening
                  ? 'Слушаю...'
                  : 'Голос'
                : 'Ручной счёт'}
            </Text>
          </View>
          {voiceError ? (
            <Text style={styles.errorText}>{voiceError}</Text>
          ) : null}
        </View>

        {/* Controls */}
        {!isRunning && !isCompleted ? (
          <Pressable
            style={({ pressed }) => [styles.startBtn, pressed && styles.startBtnPressed]}
            onPress={handleStart}
          >
            <MaterialIcons name="play-arrow" size={28} color={Colors.textInverse} />
            <Text style={styles.startBtnText}>Начать</Text>
          </Pressable>
        ) : isCompleted ? (
          <View style={styles.controlRow}>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
              onPress={resetSession}
            >
              <MaterialIcons name="refresh" size={22} color={Colors.primary} />
              <Text style={styles.actionBtnText}>Заново</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.controlRow}>
            {/* Manual tap button (always shown when manual mode) */}
            {!isVoiceMode && (
              <Pressable
                style={({ pressed }) => [styles.tapBtn, pressed && styles.tapBtnPressed]}
                onPress={handleManualTap}
                hitSlop={12}
              >
                <MaterialIcons name="add-circle" size={56} color={Colors.primary} />
                <Text style={styles.tapLabel}>Нажать</Text>
              </Pressable>
            )}

            <View style={styles.secondaryControls}>
              <Pressable
                style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
                onPress={isRunning ? pauseSession : resumeSession}
              >
                <MaterialIcons
                  name={isRunning ? 'pause' : 'play-arrow'}
                  size={24}
                  color={Colors.text}
                />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
                onPress={resetSession}
              >
                <MaterialIcons name="stop" size={24} color={Colors.error} />
              </Pressable>
            </View>
          </View>
        )}

        {/* Mantra text */}
        {selectedMantra && (
          <View style={styles.mantraCard}>
            <Text style={styles.mantraText}>{selectedMantra.text}</Text>
            <Text style={styles.mantraTranslation}>{selectedMantra.translation}</Text>
          </View>
        )}

        {/* Info row */}
        <View style={styles.infoRow}>
          <View style={styles.infoBadge}>
            <MaterialIcons name="format-list-numbered" size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText}>Цель: {settings.targetCount}</Text>
          </View>
          <View style={styles.infoBadge}>
            <MaterialIcons
              name={settings.order === 'asc' ? 'arrow-upward' : 'arrow-downward'}
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.infoText}>
              {settings.order === 'asc' ? 'По возрастанию' : 'По убыванию'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: { flex: 1 },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    alignSelf: 'flex-start',
  },
  lotusSmall: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.text,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  subtitleEmpty: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
  },
  circleWrapper: {
    marginVertical: Spacing.xl,
    ...Shadow.lg,
  },
  counterInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countDisplay: {
    fontSize: Typography.hero,
    fontWeight: Typography.bold,
    color: Colors.text,
    lineHeight: 100,
    letterSpacing: -2,
  },
  countWarning: {
    color: Colors.warning,
  },
  countLabel: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    marginTop: -8,
  },
  warningLabel: {
    fontSize: Typography.xs,
    color: Colors.warning3,
    fontWeight: Typography.medium,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  completedText: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.success,
    marginTop: 8,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
  },
  modeBadgeActive: {
    backgroundColor: Colors.primaryLight,
  },
  modeText: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: Typography.medium,
  },
  modeTextActive: {
    color: Colors.primary,
  },
  errorText: {
    fontSize: Typography.xs,
    color: Colors.error,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    marginBottom: Spacing.xl,
    ...Shadow.md,
  },
  startBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  startBtnText: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.textInverse,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
    width: '100%',
  },
  tapBtn: {
    alignItems: 'center',
    gap: 4,
  },
  tapBtnPressed: {
    transform: [{ scale: 0.93 }],
    opacity: 0.8,
  },
  tapLabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
  secondaryControls: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    ...Shadow.sm,
  },
  actionBtnPressed: { opacity: 0.7 },
  actionBtnText: {
    fontSize: Typography.base,
    color: Colors.primary,
    fontWeight: Typography.semiBold,
  },
  mantraCard: {
    backgroundColor: Colors.surfaceWarm,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    ...Shadow.sm,
  },
  mantraText: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.primary,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  mantraTranslation: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
});
