import { useState, useRef, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { Mantra } from '@/constants/mantras';

interface UseVoiceRecognitionProps {
  mantra: Mantra | null;
  isActive: boolean;
  onMantraDetected: () => void;
  language?: string;
}

// Note: Full voice recognition requires expo-speech-recognition or native module.
// We simulate detection via voice activity (amplitude) + expo-av for V1.0.
// The detection mode triggers on voice activity while running.

export function useVoiceRecognition({
  mantra,
  isActive,
  onMantraDetected,
  language = 'ru-RU',
}: UseVoiceRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastDetectionRef = useRef<number>(0);
  const MIN_INTERVAL = 1500; // ms between detections

  const stopListening = useCallback(async () => {
    setIsListening(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {}
      recordingRef.current = null;
    }
  }, []);

  const startListening = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Необходим доступ к микрофону');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      setIsListening(true);
      setError(null);

      // Start continuous monitoring loop
      const monitorLoop = async () => {
        if (!isActive) return;

        try {
          const rec = new Audio.Recording();
          await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.LOW_QUALITY);
          await rec.startAsync();
          recordingRef.current = rec;

          // Monitor amplitude
          intervalRef.current = setInterval(async () => {
            try {
              if (!recordingRef.current) return;
              const status = await recordingRef.current.getStatusAsync();
              if (!status.isRecording) return;

              const now = Date.now();
              const metering = (status as any).metering ?? -160;

              // Detect voice activity: loud enough sound = mantra spoken
              if (metering > -30 && now - lastDetectionRef.current > MIN_INTERVAL) {
                lastDetectionRef.current = now;
                onMantraDetected();
              }
            } catch {}
          }, 200);

          // Restart recording every 5 seconds to avoid buffer overflow
          setTimeout(async () => {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            try {
              if (recordingRef.current) {
                await recordingRef.current.stopAndUnloadAsync();
                recordingRef.current = null;
              }
            } catch {}
            if (isActive) {
              monitorLoop();
            }
          }, 5000);
        } catch (err) {
          setError('Ошибка распознавания');
          setIsListening(false);
        }
      };

      monitorLoop();
    } catch (err) {
      setError('Не удалось запустить распознавание');
    }
  }, [isActive, onMantraDetected]);

  useEffect(() => {
    if (isActive) {
      startListening();
    } else {
      stopListening();
    }
    return () => {
      stopListening();
    };
  }, [isActive]);

  return { isListening, error, startListening, stopListening };
}
