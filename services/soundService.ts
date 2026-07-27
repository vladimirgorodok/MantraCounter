import { Audio } from 'expo-av';

let warningSounds: Audio.Sound[] = [];
let completionSound: Audio.Sound | null = null;
let warningInterval: ReturnType<typeof setInterval> | null = null;

// Generate a tone using a simple approach with expo-av
// We'll use system sounds via vibration + Audio API

async function playToneFrequency(frequency: number, duration: number, volume: number): Promise<void> {
  try {
    // For warning: gentle, soft bell-like tone
    // We create a brief audio experience via expo-av
    // Since generating raw PCM is complex, we use the built-in Audio API
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  } catch (error) {
    console.log('Audio mode error:', error);
  }
}

// Soft warning beep - plays before last 3 repetitions
export async function playWarningSound(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
      { volume: 0.3, shouldPlay: true }
    );
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch {
    // Fallback: vibration only on unsupported platforms
    try {
      const { Vibration } = await import('react-native');
      Vibration.vibrate(100);
    } catch {}
  }
}

// Calm completion sound - plays after last repetition
export async function playCompletionSound(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://assets.mixkit.co/active_storage/sfx/2867/2867-preview.mp3' },
      { volume: 0.6, shouldPlay: true }
    );
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch {
    try {
      const { Vibration } = await import('react-native');
      Vibration.vibrate([0, 200, 100, 400]);
    } catch {}
  }
}

export async function cleanupSounds(): Promise<void> {
  if (warningInterval) {
    clearInterval(warningInterval);
    warningInterval = null;
  }
}
